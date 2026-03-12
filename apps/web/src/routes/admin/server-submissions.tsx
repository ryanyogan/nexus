import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Check, X, ExternalLink, Clock, Server, Package } from "lucide-react";
import { useSession } from "@/lib/auth";
import { API_URL, adminFetch } from "../../lib/api";

interface ServerSubmission {
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  repositoryUrl: string;
  packageName: string | null;
  packageType: string;
  transportType: string;
  submitterEmail: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  serverId: string | null;
  createdAt: string;
  processedAt: string | null;
}

export const Route = createFileRoute("/admin/server-submissions")({ component: AdminServerSubmissionsPage });

function AdminServerSubmissionsPage() {
  const { data: session, isPending } = useSession();
  const [submissions, setSubmissions] = useState<ServerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Redirect if not admin
  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        window.location.href = "/sign-in";
      } else if ((session.user as any).role !== "admin") {
        window.location.href = "/";
      }
    }
  }, [session, isPending]);

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const url = filter === "all"
          ? `${API_URL}/api/server-submissions?limit=50`
          : `${API_URL}/api/server-submissions?status=${filter}&limit=50`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json() as { submissions: ServerSubmission[] };
          setSubmissions(data.submissions || []);
        }
      } catch (error) {
        console.error("Failed to fetch server submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && (session.user as any).role === "admin") {
      fetchSubmissions();
    }
  }, [session, filter]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await adminFetch(`/api/admin/server-submissions/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(s => 
          s.id === id ? { ...s, status: "approved" as const } : s
        ));
      } else {
        const error = await res.json() as { error?: string };
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
      const res = await adminFetch(`/api/admin/server-submissions/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason || undefined }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(s => 
          s.id === id ? { ...s, status: "rejected" as const, rejectionReason: rejectReason || null } : s
        ));
        setRejectDialogId(null);
        setRejectReason("");
      } else {
        const error = await res.json() as { error?: string };
        alert(error.error || "Failed to reject");
      }
    } catch (error) {
      alert("Failed to reject submission");
    } finally {
      setActionLoading(null);
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

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500",
    approved: "bg-green-500/10 text-green-500",
    rejected: "bg-red-500/10 text-red-500",
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
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">MCP Server Submissions</h1>
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
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
          <Server className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No server submissions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">
                      {submission.displayName || submission.name}
                    </h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[submission.status]}`}>
                      {submission.status}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                      {submission.name}
                    </span>
                  </div>
                  <a
                    href={submission.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {submission.repositoryUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {submission.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{submission.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    {submission.packageName && (
                      <span className="flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-blue-500">
                        <Package className="h-3 w-3" />
                        {submission.packageName}
                      </span>
                    )}
                    <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                      {submission.packageType}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                      {submission.transportType}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(submission.createdAt).toLocaleString()}
                    </span>
                    {submission.submitterEmail && (
                      <span>by {submission.submitterEmail}</span>
                    )}
                    {submission.serverId && (
                      <Link
                        to="/explore/servers"
                        className="text-primary hover:underline"
                      >
                        View server
                      </Link>
                    )}
                  </div>
                  {submission.rejectionReason && (
                    <div className="mt-2 rounded bg-red-500/10 px-3 py-2 text-sm text-red-500">
                      Rejection reason: {submission.rejectionReason}
                    </div>
                  )}
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
                      onClick={() => setRejectDialogId(submission.id)}
                      disabled={actionLoading === submission.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Reject Submission</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              rows={3}
              className="mb-4 w-full rounded-lg border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectDialogId(null);
                  setRejectReason("");
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectDialogId)}
                disabled={actionLoading === rejectDialogId}
                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading === rejectDialogId && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
