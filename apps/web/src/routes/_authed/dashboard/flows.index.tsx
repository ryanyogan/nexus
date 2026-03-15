import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Zap,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  Play,
  Pause,
  Download,
  BookOpen,
  Server,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { authFetch } from "../../../lib/api";

export const Route = createFileRoute("/_authed/dashboard/flows/")({
  component: FlowsPage,
});

interface FlowPreferences {
  verbosity?: "concise" | "balanced" | "detailed";
  codeStyle?: "minimal" | "documented" | "verbose";
  responseFormat?: "full" | "compact" | "code-only" | "summary";
  useEmojis?: boolean;
  preferredLanguage?: string;
}

interface Flow {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  description: string | null;
  systemPrompt: string;
  parentFlowId: string | null;
  skills: string[];
  libraries: string[];
  mcpServers: string[];
  preferences: FlowPreferences;
  category: string;
  tags: string[];
  isPublic: boolean;
  isStarterPack: boolean;
  isFeatured: boolean;
  installCount: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  isInstalled?: boolean;
  isActive?: boolean;
  isOwned?: boolean;
}

function FlowsPage() {
  const { session } = Route.useRouteContext();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "starter" | "my">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchFlows();
    }
  }, [session, activeTab]);

  async function fetchFlows() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab === "starter") params.set("starter", "true");
      if (activeTab === "my") params.set("my", "true");
      
      const res = await authFetch(`/api/flows?${params}`);
      if (!res.ok) throw new Error("Failed to fetch flows");
      const data = (await res.json()) as { flows: Flow[] };
      setFlows(data.flows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch flows");
    } finally {
      setLoading(false);
    }
  }

  async function activateFlow(flowId: string) {
    setActionLoading(flowId);
    try {
      // Install first if needed
      const flow = flows.find(f => f.id === flowId);
      if (!flow?.isInstalled) {
        await authFetch(`/api/flows/${flowId}/install`, { method: "POST" });
      }
      
      await authFetch(`/api/flows/${flowId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchFlows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate flow");
    } finally {
      setActionLoading(null);
    }
  }

  async function deactivateFlow(flowId: string) {
    setActionLoading(flowId);
    try {
      await authFetch(`/api/flows/${flowId}/deactivate`, { method: "POST" });
      await fetchFlows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate flow");
    } finally {
      setActionLoading(null);
    }
  }

  async function uninstallFlow(flowId: string) {
    if (!confirm("Are you sure you want to uninstall this flow?")) return;
    setActionLoading(flowId);
    try {
      await authFetch(`/api/flows/${flowId}/install`, { method: "DELETE" });
      await fetchFlows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to uninstall flow");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteFlow(flowId: string) {
    if (!confirm("Are you sure you want to delete this flow? This cannot be undone.")) return;
    setActionLoading(flowId);
    try {
      await authFetch(`/api/flows/${flowId}`, { method: "DELETE" });
      await fetchFlows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete flow");
    } finally {
      setActionLoading(null);
    }
  }

  async function downloadFlow(flowId: string) {
    try {
      const res = await authFetch(`/api/flows/${flowId}/download`);
      if (!res.ok) throw new Error("Failed to download flow");
      const data = (await res.json()) as { filename: string; content: string };
      
      // Create download
      const blob = new Blob([data.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download flow");
    }
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Group flows by type (for potential future use)
  // const starterFlows = flows.filter(f => f.isStarterPack);
  // const myFlows = flows.filter(f => f.isOwned && !f.isStarterPack);
  // const installedFlows = flows.filter(f => f.isInstalled && !f.isOwned);

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
                Flows
              </h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
                Pre-configured AI working environments
              </p>
            </div>
            <Link
              to={"/dashboard/flows/new" as any}
              className="flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Flow</span>
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
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-colors -mb-px border-b-2 ${
              activeTab === "all"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("starter")}
            className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-colors -mb-px border-b-2 ${
              activeTab === "starter"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Starter Packs
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-colors -mb-px border-b-2 ${
              activeTab === "my"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Flows
          </button>
        </div>

        {/* Active Flows Banner */}
        {flows.some(f => f.isActive) && (
          <div className="mb-6 border border-accent bg-accent/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
                  Active Flows
                </span>
                <p className="mt-1 font-mono text-sm text-foreground">
                  {flows.filter(f => f.isActive).map(f => f.name).join(", ")}
                </p>
              </div>
              <button
                onClick={async () => {
                  await authFetch("/api/flows/deactivate-all", { method: "POST" });
                  fetchFlows();
                }}
                className="font-mono text-xs font-bold uppercase text-muted-foreground transition-colors hover:text-foreground"
              >
                Deactivate All
              </button>
            </div>
          </div>
        )}

        {/* Flows List */}
        <div className="space-y-4">
          {flows.length === 0 ? (
            <div className="border border-border bg-background p-8 text-center">
              <Zap className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 font-mono text-sm text-muted-foreground">
                {activeTab === "my"
                  ? "You haven't created any flows yet"
                  : "No flows found"}
              </p>
              {activeTab === "my" && (
                <Link
                  to={"/dashboard/flows/new" as any}
                  className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-accent hover:underline"
                >
                  Create your first flow
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : (
            flows.map((flow) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                actionLoading={actionLoading}
                copiedId={copiedId}
                onActivate={activateFlow}
                onDeactivate={deactivateFlow}
                onUninstall={uninstallFlow}
                onDelete={deleteFlow}
                onDownload={downloadFlow}
                onCopyId={copyId}
              />
            ))
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 border-t border-border pt-8 pb-12">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
            How to Use Flows
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-foreground font-mono text-xs font-bold">
                  1
                </span>
                <span className="font-mono text-xs font-bold uppercase">Activate</span>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Click the play button to activate a flow. Multiple flows can be active at once.
              </p>
            </div>
            <div className="border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-foreground font-mono text-xs font-bold">
                  2
                </span>
                <span className="font-mono text-xs font-bold uppercase">Download</span>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Download FLOW.md to your project and reference it in CLAUDE.md.
              </p>
            </div>
            <div className="border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-foreground font-mono text-xs font-bold">
                  3
                </span>
                <span className="font-mono text-xs font-bold uppercase">Use MCP</span>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Use <code className="text-accent">activate-flow</code> via the Nexus MCP server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Flow Card Component
// ============================================================================

interface FlowCardProps {
  flow: Flow;
  actionLoading: string | null;
  copiedId: string | null;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onUninstall: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onCopyId: (id: string) => void;
}

function FlowCard({
  flow,
  actionLoading,
  copiedId,
  onActivate,
  onDeactivate,
  onUninstall,
  onDelete,
  onDownload,
  onCopyId,
}: FlowCardProps) {
  const isLoading = actionLoading === flow.id;

  return (
    <div
      className={`border bg-background transition-colors ${
        flow.isActive
          ? "border-accent shadow-[3px_3px_0_0_var(--color-accent)]"
          : "border-border hover:border-foreground/50"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {flow.isActive && (
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              )}
              <Link
                to="/dashboard/flows/$flowId"
                params={{ flowId: flow.id }}
                className="font-mono text-sm font-bold uppercase tracking-wide text-foreground hover:text-accent transition-colors truncate"
              >
                {flow.name}
              </Link>
              {flow.isStarterPack && (
                <span className="shrink-0 border border-accent/50 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                  Starter
                </span>
              )}
              {flow.isOwned && !flow.isStarterPack && (
                <span className="shrink-0 border border-foreground/30 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                  Custom
                </span>
              )}
            </div>
            {flow.description && (
              <p className="mt-1 font-mono text-xs text-muted-foreground line-clamp-2">
                {flow.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isLoading ? (
              <div className="flex h-8 w-8 items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : flow.isActive ? (
              <button
                onClick={() => onDeactivate(flow.id)}
                className="flex h-8 w-8 items-center justify-center border border-accent text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                title="Deactivate"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => onActivate(flow.id)}
                className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                title="Activate"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onDownload(flow.id)}
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              title="Download FLOW.md"
            >
              <Download className="h-4 w-4" />
            </button>
            {flow.isOwned && !flow.isStarterPack && (
              <>
                <Link
                  to="/dashboard/flows/$flowId"
                  params={{ flowId: flow.id }}
                  className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  title="Edit"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => onDelete(flow.id)}
                  className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            {!flow.isOwned && flow.isInstalled && (
              <button
                onClick={() => onUninstall(flow.id)}
                className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                title="Uninstall"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-mono text-[10px] uppercase text-muted-foreground">
            {flow.category}
          </span>
          {flow.libraries.length > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {flow.libraries.length} libraries
            </span>
          )}
          {flow.skills.length > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Zap className="h-3 w-3" />
              {flow.skills.length} skills
            </span>
          )}
          {flow.mcpServers.length > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Server className="h-3 w-3" />
              {flow.mcpServers.length} servers
            </span>
          )}
          <button
            onClick={() => onCopyId(flow.id)}
            className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            title="Copy ID"
          >
            {copiedId === flow.id ? (
              <>
                <Check className="h-3 w-3 text-accent" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {flow.id.slice(0, 20)}...
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
