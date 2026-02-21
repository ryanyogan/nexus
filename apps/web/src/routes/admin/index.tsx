import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Settings,
  Loader2,
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  RefreshCw,
  Database,
} from "lucide-react";
import { useSession } from "@nexus/auth/client";
import { API_URL, adminFetch } from "../../lib/api";

interface Stats {
  libraries: { total: number; indexed: number; pending: number; indexing: number };
  documentation: { totalChunks: number; totalTokens: number };
  usage: { totalQueries: number; totalChunkHits: number };
}

interface Submission {
  id: string;
  libraryName: string;
  sourceUrl: string;
  status: string;
  createdAt: string;
}

export const Route = createFileRoute("/admin/")({ component: AdminPage });

function AdminPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [indexing, setIndexing] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        navigate({ to: "/sign-in" });
      } else if ((session.user as any).role !== "admin") {
        navigate({ to: "/" });
      }
    }
  }, [session, isPending, navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, submissionsRes] = await Promise.all([
          fetch(`${API_URL}/api/stats`),
          fetch(`${API_URL}/api/submissions?status=pending&limit=5`),
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json() as Stats;
          setStats(data);
        }

        if (submissionsRes.ok) {
          const data = await submissionsRes.json() as { submissions: Submission[] };
          setPendingSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && (session.user as any).role === "admin") {
      fetchData();
    }
  }, [session]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await adminFetch("/api/admin/seed", { method: "POST" });
      if (!res.ok) {
        const error = await res.json() as { error: string };
        alert(`Failed: ${error.error}`);
        return;
      }
      const data = await res.json() as { created: number; skipped: number };
      alert(`Seed completed: ${data.created} created, ${data.skipped} skipped`);
      window.location.reload();
    } catch (error) {
      alert("Failed to seed libraries");
    } finally {
      setSeeding(false);
    }
  };

  const handleIndexAll = async () => {
    setIndexing(true);
    try {
      const res = await adminFetch("/api/admin/index-all", { method: "POST" });
      if (!res.ok) {
        const error = await res.json() as { error: string };
        alert(`Failed: ${error.error}`);
        return;
      }
      const data = await res.json() as { queued: number };
      alert(`Indexing started: ${data.queued} libraries queued`);
      window.location.reload();
    } catch (error) {
      alert("Failed to start indexing");
    } finally {
      setIndexing(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user || (session.user as any).role !== "admin") {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage libraries, submissions, and site settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Seed Libraries
          </button>
          <button
            onClick={handleIndexAll}
            disabled={indexing}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {indexing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Index All Pending
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Libraries"
            value={stats.libraries.total}
            detail={`${stats.libraries.indexed} indexed`}
          />
          <StatCard
            icon={<FileText className="h-5 w-5" />}
            label="Doc Chunks"
            value={stats.documentation.totalChunks}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Total Queries"
            value={stats.usage.totalQueries}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Pending"
            value={stats.libraries.pending}
            detail={stats.libraries.indexing > 0 ? `${stats.libraries.indexing} indexing` : undefined}
          />
        </div>
      )}

      {/* Quick Links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link
          to="/admin/submissions"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
        >
          <h3 className="mb-2 text-lg font-semibold text-foreground">Submissions</h3>
          <p className="mb-4 text-sm text-muted-foreground">Review and approve pending library submissions</p>
          {pendingSubmissions.length > 0 && (
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {pendingSubmissions.length} pending
            </span>
          )}
        </Link>
        <Link
          to="/admin/libraries"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
        >
          <h3 className="mb-2 text-lg font-semibold text-foreground">Libraries</h3>
          <p className="text-sm text-muted-foreground">Manage indexed libraries, trigger re-indexing, delete</p>
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-muted-foreground">Settings</h3>
          <p className="text-sm text-muted-foreground">Site configuration coming soon...</p>
        </div>
      </div>

      {/* Recent Pending Submissions */}
      {pendingSubmissions.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Pending Submissions</h2>
            <Link
              to="/admin/submissions"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {pendingSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{sub.libraryName}</p>
                  <p className="text-sm text-muted-foreground">{sub.sourceUrl}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(sub.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 text-primary">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value.toLocaleString()}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
    </div>
  );
}
