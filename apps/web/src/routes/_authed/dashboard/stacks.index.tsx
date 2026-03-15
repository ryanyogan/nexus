import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  Play,
  Download,
  Settings,
  ArrowUpRight,
  GitFork,
  Users,
  Zap,
} from "lucide-react";
import { authFetch } from "../../../lib/api";

export const Route = createFileRoute("/_authed/dashboard/stacks/")({
  component: StacksPage,
});

interface Stack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string;
  layer: number;
  tags: string[];
  tokenBudget: string;
  learningStatus: string;
  isPublic: boolean;
  isFeatured: boolean;
  isStarter: boolean;
  forkCount: number;
  useCount: number;
  installCount: number;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  isInstalled?: boolean;
  isOwned?: boolean;
}

function StacksPage() {
  const { session } = Route.useRouteContext();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "starter" | "my" | "installed">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchStacks();
    }
  }, [session, activeTab]);

  async function fetchStacks() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab === "starter") params.set("filter", "starter");
      if (activeTab === "my") params.set("filter", "my");
      if (activeTab === "installed") params.set("filter", "installed");

      const res = await authFetch(`/api/stacks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch stacks");
      const data = (await res.json()) as { stacks: Stack[] };
      setStacks(data.stacks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stacks");
    } finally {
      setLoading(false);
    }
  }

  async function installStack(stackId: string) {
    setActionLoading(stackId);
    try {
      const res = await authFetch(`/api/stacks/${stackId}/install`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to install stack");
      await fetchStacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to install stack");
    } finally {
      setActionLoading(null);
    }
  }

  async function uninstallStack(stackId: string) {
    if (!confirm("Are you sure you want to uninstall this stack?")) return;
    setActionLoading(stackId);
    try {
      const res = await authFetch(`/api/stacks/${stackId}/install`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to uninstall stack");
      await fetchStacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to uninstall stack");
    } finally {
      setActionLoading(null);
    }
  }

  async function forkStack(stackId: string) {
    setActionLoading(stackId);
    try {
      const res = await authFetch(`/api/stacks/${stackId}/fork`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to fork stack");
      const data = (await res.json()) as { stack: Stack };
      // Navigate to the new stack
      window.location.href = `/dashboard/stacks/${data.stack.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fork stack");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteStack(stackId: string) {
    if (!confirm("Are you sure you want to delete this stack? This cannot be undone.")) return;
    setActionLoading(stackId);
    try {
      const res = await authFetch(`/api/stacks/${stackId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete stack");
      await fetchStacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete stack");
    } finally {
      setActionLoading(null);
    }
  }

  async function compileStack(stackId: string) {
    setActionLoading(stackId);
    try {
      const res = await authFetch(`/api/stacks/${stackId}/compile`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to start compilation");
      await fetchStacks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compile stack");
    } finally {
      setActionLoading(null);
    }
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="pt-8 pb-6 md:pt-12 md:pb-8">
          <Link
            to="/dashboard"
            className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                Stacks
              </h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
                AI-powered project scaffolding templates
              </p>
            </div>
            <Link
              to="/dashboard/stacks/new"
              className="flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Stack</span>
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 border border-destructive bg-destructive/10 p-4">
            <p className="font-mono text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-0 border-b border-border">
          {(["all", "starter", "my", "installed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-colors -mb-px border-b-2 ${
                activeTab === tab
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All" : tab === "starter" ? "Starters" : tab === "my" ? "My Stacks" : "Installed"}
            </button>
          ))}
        </div>

        {/* Stacks List */}
        <div className="space-y-4">
          {stacks.length === 0 ? (
            <div className="border border-border bg-background p-8 text-center">
              <Layers className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 font-mono text-sm text-muted-foreground">
                {activeTab === "my"
                  ? "You haven't created any stacks yet"
                  : activeTab === "installed"
                  ? "You haven't installed any stacks yet"
                  : "No stacks found"}
              </p>
              {activeTab === "my" && (
                <Link
                  to="/dashboard/stacks/new"
                  className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-accent hover:underline"
                >
                  Create your first stack
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : (
            stacks.map((stack) => (
              <StackCard
                key={stack.id}
                stack={stack}
                actionLoading={actionLoading}
                copiedId={copiedId}
                onInstall={installStack}
                onUninstall={uninstallStack}
                onFork={forkStack}
                onDelete={deleteStack}
                onCompile={compileStack}
                onCopyId={copyId}
              />
            ))
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 border-t border-border pt-8 pb-12">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
            How Stacks Work
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-foreground font-mono text-xs font-bold">
                  1
                </span>
                <span className="font-mono text-xs font-bold uppercase">Create</span>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Build a stack visually or write instructions. Add repos, packages, and compose with other stacks.
              </p>
            </div>
            <div className="border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-foreground font-mono text-xs font-bold">
                  2
                </span>
                <span className="font-mono text-xs font-bold uppercase">Compile</span>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                AI analyzes your sources and generates a token-efficient context prompt.
              </p>
            </div>
            <div className="border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-foreground font-mono text-xs font-bold">
                  3
                </span>
                <span className="font-mono text-xs font-bold uppercase">Use</span>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Use via MCP with <code className="text-accent">get-stack</code> or download the compiled prompt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stack Card Component
// ============================================================================

interface StackCardProps {
  stack: Stack;
  actionLoading: string | null;
  copiedId: string | null;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onFork: (id: string) => void;
  onDelete: (id: string) => void;
  onCompile: (id: string) => void;
  onCopyId: (id: string) => void;
}

function StackCard({
  stack,
  actionLoading,
  copiedId,
  onInstall,
  onUninstall,
  onFork,
  onDelete,
  onCompile,
  onCopyId,
}: StackCardProps) {
  const isLoading = actionLoading === stack.id;
  const isOwned = stack.userId !== null;
  const bgColor = stack.color || "var(--color-accent)";

  return (
    <div
      className={`border bg-background transition-colors ${
        stack.learningStatus === "complete"
          ? "border-border hover:border-foreground/50"
          : "border-border"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center text-white"
              style={{ backgroundColor: bgColor }}
            >
              {stack.icon || <Layers className="h-5 w-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard/stacks/$stackId"
                  params={{ stackId: stack.id }}
                  className="font-mono text-sm font-bold uppercase tracking-wide text-foreground hover:text-accent transition-colors truncate"
                >
                  {stack.name}
                </Link>
                {stack.isStarter && (
                  <span className="shrink-0 border border-accent/50 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                    Starter
                  </span>
                )}
                {stack.isFeatured && (
                  <span className="shrink-0 border border-amber-500/50 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-500">
                    Featured
                  </span>
                )}
              </div>
              {stack.description && (
                <p className="mt-1 font-mono text-xs text-muted-foreground line-clamp-2">
                  {stack.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isLoading ? (
              <div className="flex h-8 w-8 items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Compile button for owned stacks */}
                {isOwned && stack.learningStatus !== "researching" && stack.learningStatus !== "compiling" && (
                  <button
                    onClick={() => onCompile(stack.id)}
                    className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                    title="Compile"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}

                {/* Fork button for public stacks */}
                {!isOwned && (stack.isPublic || stack.isStarter) && (
                  <button
                    onClick={() => onFork(stack.id)}
                    className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    title="Fork"
                  >
                    <GitFork className="h-4 w-4" />
                  </button>
                )}

                {/* Install/Uninstall */}
                {!isOwned && (
                  stack.isInstalled ? (
                    <button
                      onClick={() => onUninstall(stack.id)}
                      className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      title="Uninstall"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onInstall(stack.id)}
                      className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                      title="Install"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )
                )}

                {/* Edit/Delete for owned stacks */}
                {isOwned && (
                  <>
                    <Link
                      to="/dashboard/stacks/$stackId"
                      params={{ stackId: stack.id }}
                      className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                      title="Edit"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(stack.id)}
                      className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            {stack.category}
          </span>

          {/* Learning status */}
          {stack.learningStatus && stack.learningStatus !== "pending" && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  stack.learningStatus === "complete"
                    ? "bg-green-500"
                    : stack.learningStatus === "researching" || stack.learningStatus === "compiling"
                    ? "animate-pulse bg-amber-500"
                    : stack.learningStatus === "failed"
                    ? "bg-destructive"
                    : "bg-muted-foreground"
                }`}
              />
              {stack.learningStatus}
            </span>
          )}

          {/* Stats */}
          {stack.useCount > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Zap className="h-3 w-3" />
              {stack.useCount} uses
            </span>
          )}
          {stack.forkCount > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <GitFork className="h-3 w-3" />
              {stack.forkCount} forks
            </span>
          )}
          {stack.installCount > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Users className="h-3 w-3" />
              {stack.installCount} installs
            </span>
          )}

          {/* Copy ID */}
          <button
            onClick={() => onCopyId(stack.id)}
            className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            title="Copy ID"
          >
            {copiedId === stack.id ? (
              <>
                <Check className="h-3 w-3 text-accent" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {stack.id.slice(0, 16)}...
              </>
            )}
          </button>
        </div>

        {/* Tags */}
        {stack.tags && stack.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {stack.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {stack.tags.length > 5 && (
              <span className="px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                +{stack.tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
