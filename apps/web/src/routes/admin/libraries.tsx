import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useSession } from "@nexus/auth/client";
import { API_URL, adminFetch } from "../../lib/api";

interface Library {
  id: string;
  name: string;
  description: string | null;
  sourceUrl: string;
  iconUrl: string | null;
  categories: string[];
  totalChunks: number;
  totalTokens: number;
  indexStatus: "pending" | "indexing" | "indexed" | "failed";
  isFeatured: boolean;
  lastIndexedAt: string | null;
  indexError: string | null;
}

export const Route = createFileRoute("/admin/libraries")({ component: AdminLibrariesPage });

function AdminLibrariesPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  // Fetch libraries
  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const params = new URLSearchParams({ limit: "100" });
        if (filter !== "all") params.set("status", filter);
        if (search) params.set("search", search);
        
        const res = await fetch(`${API_URL}/api/libraries?${params}`);
        if (res.ok) {
          const data = await res.json() as { libraries: Library[] };
          setLibraries(data.libraries || []);
        }
      } catch (error) {
        console.error("Failed to fetch libraries:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && (session.user as any).role === "admin") {
      fetchLibraries();
    }
  }, [session, filter, search]);

  const handleReindex = async (id: string) => {
    if (!confirm("This will delete all existing chunks and re-index. Continue?")) return;
    
    setActionLoading(id);
    try {
      const res = await adminFetch(`/api/admin/reindex/${id}`, { method: "POST" });
      if (res.ok) {
        setLibraries(prev => prev.map(l => 
          l.id === id ? { ...l, indexStatus: "indexing" as const } : l
        ));
      } else {
        const error = await res.json() as { error?: string };
        alert(error.error || "Failed to reindex");
      }
    } catch (error) {
      alert("Failed to trigger reindex");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove all documentation chunks and cannot be undone.`)) return;
    
    setActionLoading(id);
    try {
      const res = await adminFetch(`/api/admin/libraries/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLibraries(prev => prev.filter(l => l.id !== id));
      } else {
        const error = await res.json() as { error?: string };
        alert(error.error || "Failed to delete");
      }
    } catch (error) {
      alert("Failed to delete library");
    } finally {
      setActionLoading(null);
    }
  };

  const handleIndex = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await adminFetch(`/api/admin/index/${id}`, { method: "POST" });
      if (res.ok) {
        setLibraries(prev => prev.map(l => 
          l.id === id ? { ...l, indexStatus: "indexing" as const } : l
        ));
      } else {
        const error = await res.json() as { error?: string };
        alert(error.error || "Failed to start indexing");
      }
    } catch (error) {
      alert("Failed to trigger indexing");
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

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Libraries</h1>
        <p className="text-muted-foreground">Manage indexed documentation libraries</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
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
                
                <div className="flex-1 min-w-0">
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
                  
                  <a
                    href={lib.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {lib.sourceUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>

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
                      <span>Last indexed: {new Date(lib.lastIndexedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  {lib.indexError && (
                    <p className="mt-2 text-xs text-red-500">{lib.indexError}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {lib.indexStatus === "pending" && (
                    <button
                      onClick={() => handleIndex(lib.id)}
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
                      onClick={() => handleReindex(lib.id)}
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
    </div>
  );
}
