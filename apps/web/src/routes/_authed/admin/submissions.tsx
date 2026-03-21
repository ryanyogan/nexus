import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Check, X, ExternalLink, Clock } from "lucide-react";
import { API_URL, adminFetch } from "../../../lib/api";

interface Submission {
  id: string;
  libraryName: string;
  sourceUrl: string;
  description: string | null;
  submitterEmail: string | null;
  status: "pending" | "approved" | "rejected" | "indexed";
  libraryId: string | null;
  createdAt: string;
  processedAt: string | null;
}

export const Route = createFileRoute("/_authed/admin/submissions")({
  component: AdminSubmissionsPage,
});

function AdminSubmissionsPage() {
  // Note: session available via Route.useRouteContext() if needed
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const url =
          filter === "all"
            ? `${API_URL}/api/submissions?limit=50`
            : `${API_URL}/api/submissions?status=${filter}&limit=50`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as { submissions: Submission[] };
          setSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await adminFetch(`/api/admin/submissions/${id}/approve`, { method: "POST" });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "approved" as const } : s))
        );
      } else {
        const error = (await res.json()) as { error?: string };
        alert(error.error || "Failed to approve");
      }
    } catch (error) {
      alert("Failed to approve submission");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await adminFetch(`/api/admin/submissions/${id}/reject`, { method: "POST" });
      if (res.ok) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "rejected" as const } : s))
        );
      } else {
        const error = (await res.json()) as { error?: string };
        alert(error.error || "Failed to reject");
      }
    } catch (error) {
      alert("Failed to reject submission");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500",
    approved: "bg-green-500/10 text-green-500",
    rejected: "bg-red-500/10 text-red-500",
    indexed: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/admin"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Submissions</h1>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected", "indexed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">No submissions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{submission.libraryName}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[submission.status]}`}
                    >
                      {submission.status}
                    </span>
                  </div>
                  <a
                    href={submission.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {submission.sourceUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {submission.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{submission.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(submission.createdAt).toLocaleString()}
                    </span>
                    {submission.submitterEmail && <span>by {submission.submitterEmail}</span>}
                    {submission.libraryId && (
                      <Link
                        to="/libraries/$libraryId"
                        params={{ libraryId: submission.libraryId }}
                        className="text-primary hover:underline"
                      >
                        View library
                      </Link>
                    )}
                  </div>
                </div>

                {submission.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(submission.id)}
                      disabled={actionLoading === submission.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                    >
                      {actionLoading === submission.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(submission.id)}
                      disabled={actionLoading === submission.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                    >
                      {actionLoading === submission.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
