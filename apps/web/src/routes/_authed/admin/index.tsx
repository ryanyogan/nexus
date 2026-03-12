import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  Server,
} from "lucide-react";
import { adminFetch } from "../../../lib/api";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ResultModal } from "@/components/ui/result-modal";

interface Submission {
  id: string;
  libraryName: string;
  sourceUrl: string;
  status: string;
  createdAt: string;
}

interface AdminStats {
  libraries: {
    total: number;
    indexed: number;
    pending: number;
    indexing: number;
  };
  documentation: {
    totalChunks: number;
  };
  usage: {
    totalQueries: number;
  };
}

export const Route = createFileRoute("/_authed/admin/")({
  component: AdminPage,
});

function AdminPage() {
  // Note: session available via Route.useRouteContext() if needed
  
  // Local state
  const [seeding, setSeeding] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmText: string;
    action: () => Promise<void>;
  } | null>(null);
  const [resultModal, setResultModal] = useState<{
    open: boolean;
    type: "success" | "error";
    title: string;
    description: string;
  } | null>(null);

  // TODO: Convert to server functions - for now use placeholder data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const hasIndexingLibraries = stats?.libraries?.indexing ? stats.libraries.indexing > 0 : false;
  
  // Suppress unused setters warning - these will be used when server functions are implemented
  void setStats;
  void setStatsLoading;
  void setPendingSubmissions;
  void setSubmissionsLoading;

  const invalidateQueries = () => {
    // TODO: Implement query invalidation with server functions
  };

  const handleSeed = () => {
    setConfirmModal({
      open: true,
      title: "Seed Libraries?",
      description: "This will add any new libraries from the seed list that don't already exist. Existing libraries will not be affected.",
      confirmText: "Seed Libraries",
      action: async () => {
        setSeeding(true);
        setConfirmModal(null);
        try {
          const res = await adminFetch("/api/admin/seed", { method: "POST" });
          if (!res.ok) {
            const error = (await res.json()) as { error: string };
            setResultModal({
              open: true,
              type: "error",
              title: "Seeding Failed",
              description: error.error || "Failed to seed libraries.",
            });
            return;
          }
          const data = (await res.json()) as { created: number; skipped: number };
          invalidateQueries();
          setResultModal({
            open: true,
            type: "success",
            title: "Seeding Complete",
            description: `Created ${data.created} new libraries.\n${data.skipped} libraries were already present.`,
          });
        } catch {
          setResultModal({
            open: true,
            type: "error",
            title: "Error",
            description: "Failed to connect to the server. Please try again.",
          });
        } finally {
          setSeeding(false);
        }
      },
    });
  };

  const handleIndexAll = () => {
    setConfirmModal({
      open: true,
      title: "Index All Pending Libraries?",
      description: `This will start indexing all ${stats?.libraries?.pending ?? 0} pending libraries.\n\nIndexing runs in the background and may take several minutes depending on the number of libraries.`,
      confirmText: "Start Indexing",
      action: async () => {
        setIndexing(true);
        setConfirmModal(null);
        try {
          const res = await adminFetch("/api/admin/index-all", { method: "POST" });
          if (!res.ok) {
            const error = (await res.json()) as { error: string };
            setResultModal({
              open: true,
              type: "error",
              title: "Indexing Failed",
              description: error.error || "Failed to start indexing.",
            });
            return;
          }
          const data = (await res.json()) as { queued: number };
          invalidateQueries();
          setResultModal({
            open: true,
            type: "success",
            title: "Indexing Started",
            description: `${data.queued} libraries have been queued for indexing.\n\nThe status will update automatically as indexing progresses.`,
          });
        } catch {
          setResultModal({
            open: true,
            type: "error",
            title: "Error",
            description: "Failed to connect to the server. Please try again.",
          });
        } finally {
          setIndexing(false);
        }
      },
    });
  };

  if (statsLoading || submissionsLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex flex-wrap gap-2">
          {/* Auto-refresh indicator */}
          {hasIndexingLibraries && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Auto-refreshing
            </div>
          )}
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
            disabled={indexing || (stats?.libraries?.pending ?? 0) === 0}
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
            value={stats.libraries.pending ?? 0}
            detail={(stats.libraries.indexing ?? 0) > 0 ? `${stats.libraries.indexing} indexing` : undefined}
          />
        </div>
      )}

      {/* Quick Links */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/submissions"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
        >
          <BookOpen className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">Library Submissions</h3>
          <p className="mb-4 text-sm text-muted-foreground">Review and approve pending library submissions</p>
          {pendingSubmissions.length > 0 && (
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {pendingSubmissions.length} pending
            </span>
          )}
        </Link>
        <Link
          to="/admin/server-submissions"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
        >
          <Server className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">Server Submissions</h3>
          <p className="text-sm text-muted-foreground">Review and approve MCP server submissions</p>
        </Link>
        <Link
          to="/admin/libraries"
          className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
        >
          <Database className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">Libraries</h3>
          <p className="text-sm text-muted-foreground">Manage indexed libraries, trigger re-indexing, delete</p>
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-6">
          <Settings className="mb-3 h-6 w-6 text-muted-foreground" />
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

      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmationModal
          open={confirmModal.open}
          onOpenChange={(open) => !open && setConfirmModal(null)}
          title={confirmModal.title}
          description={confirmModal.description}
          confirmText={confirmModal.confirmText}
          variant="default"
          onConfirm={confirmModal.action}
          loading={seeding || indexing}
        />
      )}

      {/* Result Modal */}
      {resultModal && (
        <ResultModal
          open={resultModal.open}
          onOpenChange={(open) => !open && setResultModal(null)}
          type={resultModal.type}
          title={resultModal.title}
          description={resultModal.description}
        />
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
