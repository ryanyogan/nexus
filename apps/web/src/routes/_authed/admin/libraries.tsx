import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Trash2,
  ExternalLink,
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Copy,
} from "lucide-react";
import { adminFetch } from "../../../lib/api";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ResultModal } from "@/components/ui/result-modal";
import { getDb } from "../../../server/db";
import * as schema from "@nexus/db";

export const Route = createFileRoute("/_authed/admin/libraries")({ component: AdminLibrariesPage });

// ============================================================================
// Types
// ============================================================================

interface ConfirmModalState {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  variant: "default" | "destructive";
  action: () => Promise<void>;
}

interface ResultModalState {
  open: boolean;
  type: "success" | "error";
  title: string;
  description: string;
}

// ============================================================================
// Error Display Component
// ============================================================================

function ErrorDisplay({
  error,
  libraryName,
  onRetry,
  retrying,
}: {
  error: string;
  libraryName: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Library: ${libraryName}\nError: ${error}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <div className="flex-1 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          {retrying ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Retry Index
        </button>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <Copy className="h-3 w-3" />
          {copied ? "Copied!" : "Copy Error"}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Types for library data
// ============================================================================

interface LibraryData {
  id: string;
  name: string;
  iconUrl: string | null;
  repositoryUrl: string | null;
  indexStatus: "pending" | "indexing" | "indexed" | "failed";
  indexError: string | null;
  isFeatured: boolean;
  totalChunks: number;
  totalTokens: number;
  categories: string[];
  lastIndexedAt: string | null;
}

// ============================================================================
// Main Component
// ============================================================================

function AdminLibrariesPage() {
  const router = useRouter();
  const { session } = Route.useRouteContext();

  // Local state
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [resultModal, setResultModal] = useState<ResultModalState | null>(null);
  const [libraries, setLibraries] = useState<LibraryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch libraries with useEffect (replaces TanStack Query)
  const fetchLibraries = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (search) params.set("search", search);
      const res = await adminFetch(`/api/admin/libraries?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as { libraries: LibraryData[] };
        setLibraries(data.libraries || []);
      }
    } catch (error) {
      console.error("Failed to fetch libraries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraries();
  }, [filter, search]);

  // Auto-refresh when indexing
  const hasIndexingLibraries = libraries.some((lib) => lib.indexStatus === "indexing");
  
  useEffect(() => {
    if (!hasIndexingLibraries) return;
    const interval = setInterval(fetchLibraries, 5000);
    return () => clearInterval(interval);
  }, [hasIndexingLibraries, filter, search]);

  // ============================================================================
  // Action Handlers
  // ============================================================================

  const refreshData = () => {
    fetchLibraries();
  };

  const handleIndex = (id: string, name: string) => {
    setConfirmModal({
      open: true,
      title: `Index "${name}"?`,
      description: `This will fetch and index documentation for "${name}". This may take a few minutes depending on the documentation size.`,
      confirmText: "Start Indexing",
      variant: "default",
      action: async () => {
        setActionLoading(id);
        setConfirmModal(null);
        try {
          const res = await adminFetch(`/api/admin/index/${id}`, { method: "POST" });
          if (res.ok) {
            refreshData();
            setResultModal({
              open: true,
              type: "success",
              title: "Indexing Started",
              description: `"${name}" has been queued for indexing. The status will update automatically when complete.`,
            });
          } else {
            const error = (await res.json()) as { error?: string };
            setResultModal({
              open: true,
              type: "error",
              title: "Indexing Failed",
              description: error.error || "Failed to start indexing. Please try again.",
            });
          }
        } catch {
          setResultModal({
            open: true,
            type: "error",
            title: "Error",
            description: "Failed to connect to the server. Please try again.",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleReindex = (id: string, name: string) => {
    setConfirmModal({
      open: true,
      title: `Re-index "${name}"?`,
      description: `This will delete all existing documentation chunks for "${name}" only and re-fetch from the source.\n\nOther libraries will NOT be affected.\n\nThis may take a few minutes.`,
      confirmText: "Re-index",
      variant: "destructive",
      action: async () => {
        setActionLoading(id);
        setConfirmModal(null);
        try {
          const res = await adminFetch(`/api/admin/reindex/${id}`, { method: "POST" });
          if (res.ok) {
            refreshData();
            setResultModal({
              open: true,
              type: "success",
              title: "Re-indexing Started",
              description: `"${name}" has been queued for re-indexing. The status will update automatically when complete.`,
            });
          } else {
            const error = (await res.json()) as { error?: string };
            setResultModal({
              open: true,
              type: "error",
              title: "Re-indexing Failed",
              description: error.error || "Failed to start re-indexing. Please try again.",
            });
          }
        } catch {
          setResultModal({
            open: true,
            type: "error",
            title: "Error",
            description: "Failed to connect to the server. Please try again.",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmModal({
      open: true,
      title: `Delete "${name}"?`,
      description: `This will permanently delete "${name}" and all its documentation chunks.\n\nThis action cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
      action: async () => {
        setActionLoading(id);
        setConfirmModal(null);
        try {
          const res = await adminFetch(`/api/admin/libraries/${id}`, { method: "DELETE" });
          if (res.ok) {
            refreshData();
            setResultModal({
              open: true,
              type: "success",
              title: "Library Deleted",
              description: `"${name}" has been permanently deleted.`,
            });
          } else {
            const error = (await res.json()) as { error?: string };
            setResultModal({
              open: true,
              type: "error",
              title: "Deletion Failed",
              description: error.error || "Failed to delete library. Please try again.",
            });
          }
        } catch {
          setResultModal({
            open: true,
            type: "error",
            title: "Error",
            description: "Failed to connect to the server. Please try again.",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleRetryIndex = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      const res = await adminFetch(`/api/admin/index/${id}`, { method: "POST" });
      if (res.ok) {
        refreshData();
        setResultModal({
          open: true,
          type: "success",
          title: "Retry Started",
          description: `"${name}" has been queued for re-indexing. The status will update automatically when complete.`,
        });
      } else {
        const error = (await res.json()) as { error?: string };
        setResultModal({
          open: true,
          type: "error",
          title: "Retry Failed",
          description: error.error || "Failed to retry indexing. Please try again.",
        });
      }
    } catch {
      setResultModal({
        open: true,
        type: "error",
        title: "Error",
        description: "Failed to connect to the server. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusIcons = {
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    indexing: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
    indexed: <CheckCircle className="h-4 w-4 text-green-500" />,
    failed: <AlertCircle className="h-4 w-4 text-red-500" />,
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Libraries</h1>
          <p className="text-muted-foreground">Manage indexed documentation libraries</p>
        </div>
        
        {/* Auto-refresh indicator */}
        {hasIndexingLibraries && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Auto-refreshing every 5s
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["all", "indexed", "pending", "indexing", "failed"].map((status) => (
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search libraries..."
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:border-primary focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {libraries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">No libraries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {libraries.map((lib) => (
            <div
              key={lib.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-4">
                {lib.iconUrl ? (
                  <img
                    src={lib.iconUrl}
                    alt={lib.name}
                    className="h-10 w-10 rounded-lg bg-muted object-contain p-1"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to="/libraries/$libraryId"
                      params={{ libraryId: lib.id }}
                      className="font-semibold text-foreground hover:text-primary"
                    >
                      {lib.name}
                    </Link>
                    {statusIcons[lib.indexStatus]}
                    {lib.isFeatured && (
                      <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-500">
                        Featured
                      </span>
                    )}
                  </div>

                  {lib.repositoryUrl && (
                    <a
                      href={lib.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {lib.repositoryUrl}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {lib.totalChunks} chunks
                    </span>
                    <span>{(lib.totalTokens / 1000).toFixed(1)}k tokens</span>
                    {lib.categories.length > 0 && (
                      <span className="capitalize">{lib.categories.join(", ")}</span>
                    )}
                    {lib.lastIndexedAt && (
                      <span>
                        Last indexed: {new Date(lib.lastIndexedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Error display with retry button */}
                  {lib.indexStatus === "failed" && lib.indexError && (
                    <ErrorDisplay
                      error={lib.indexError}
                      libraryName={lib.name}
                      onRetry={() => handleRetryIndex(lib.id, lib.name)}
                      retrying={actionLoading === lib.id}
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  {lib.indexStatus === "pending" && (
                    <button
                      onClick={() => handleIndex(lib.id, lib.name)}
                      disabled={actionLoading === lib.id}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {actionLoading === lib.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Index
                    </button>
                  )}
                  {(lib.indexStatus === "indexed" || lib.indexStatus === "failed") && (
                    <button
                      onClick={() => handleReindex(lib.id, lib.name)}
                      disabled={actionLoading === lib.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      {actionLoading === lib.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      Reindex
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(lib.id, lib.name)}
                    disabled={actionLoading === lib.id}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-500/50 px-3 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {actionLoading === lib.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
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
          variant={confirmModal.variant}
          onConfirm={confirmModal.action}
          loading={!!actionLoading}
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
