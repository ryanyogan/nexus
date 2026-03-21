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

export const Route = createFileRoute("/_authed/dashboard/prompts/")({
  component: PromptsPage,
});

interface PromptPreferences {
  verbosity?: "concise" | "balanced" | "detailed";
  codeStyle?: "minimal" | "documented" | "verbose";
  responseFormat?: "full" | "compact" | "code-only" | "summary";
  useEmojis?: boolean;
  preferredLanguage?: string;
}

interface Prompt {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  description: string | null;
  systemPrompt: string;
  parentPromptId: string | null;
  skills: string[];
  libraries: string[];
  mcpServers: string[];
  preferences: PromptPreferences;
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

function PromptsPage() {
  const { session } = Route.useRouteContext();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "starter" | "my">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchPrompts();
    }
  }, [session, activeTab]);

  async function fetchPrompts() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab === "starter") params.set("starter", "true");
      if (activeTab === "my") params.set("my", "true");

      const res = await authFetch(`/api/prompts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch prompts");
      const data = (await res.json()) as { prompts: Prompt[] };
      setPrompts(data.prompts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prompts");
    } finally {
      setLoading(false);
    }
  }

  async function activatePrompt(promptId: string) {
    setActionLoading(promptId);
    try {
      // Install first if needed
      const prompt = prompts.find((p) => p.id === promptId);
      if (!prompt?.isInstalled) {
        await authFetch(`/api/prompts/${promptId}/install`, { method: "POST" });
      }

      await authFetch(`/api/prompts/${promptId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate prompt");
    } finally {
      setActionLoading(null);
    }
  }

  async function deactivatePrompt(promptId: string) {
    setActionLoading(promptId);
    try {
      await authFetch(`/api/prompts/${promptId}/deactivate`, { method: "POST" });
      await fetchPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate prompt");
    } finally {
      setActionLoading(null);
    }
  }

  async function uninstallPrompt(promptId: string) {
    if (!confirm("Are you sure you want to uninstall this prompt?")) return;
    setActionLoading(promptId);
    try {
      await authFetch(`/api/prompts/${promptId}/install`, { method: "DELETE" });
      await fetchPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to uninstall prompt");
    } finally {
      setActionLoading(null);
    }
  }

  async function deletePrompt(promptId: string) {
    if (!confirm("Are you sure you want to delete this prompt? This cannot be undone.")) return;
    setActionLoading(promptId);
    try {
      await authFetch(`/api/prompts/${promptId}`, { method: "DELETE" });
      await fetchPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete prompt");
    } finally {
      setActionLoading(null);
    }
  }

  async function downloadPrompt(promptId: string) {
    try {
      const res = await authFetch(`/api/prompts/${promptId}/download`);
      if (!res.ok) throw new Error("Failed to download prompt");
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
      setError(err instanceof Error ? err.message : "Failed to download prompt");
    }
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Group prompts by type (for potential future use)
  // const starterPrompts = prompts.filter(p => p.isStarterPack);
  // const myPrompts = prompts.filter(p => p.isOwned && !p.isStarterPack);
  // const installedPrompts = prompts.filter(p => p.isInstalled && !p.isOwned);

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
                Prompts
              </h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
                Pre-configured AI working environments
              </p>
            </div>
            <Link
              to={"/dashboard/prompts/new" as any}
              className="flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Prompt</span>
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
            My Prompts
          </button>
        </div>

        {/* Active Prompts Banner */}
        {prompts.some((p) => p.isActive) && (
          <div className="mb-6 border border-accent bg-accent/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
                  Active Prompts
                </span>
                <p className="mt-1 font-mono text-sm text-foreground">
                  {prompts
                    .filter((p) => p.isActive)
                    .map((p) => p.name)
                    .join(", ")}
                </p>
              </div>
              <button
                onClick={async () => {
                  await authFetch("/api/prompts/deactivate-all", { method: "POST" });
                  fetchPrompts();
                }}
                className="font-mono text-xs font-bold uppercase text-muted-foreground transition-colors hover:text-foreground"
              >
                Deactivate All
              </button>
            </div>
          </div>
        )}

        {/* Prompts List */}
        <div className="space-y-4">
          {prompts.length === 0 ? (
            <div className="border border-border bg-background p-8 text-center">
              <Zap className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 font-mono text-sm text-muted-foreground">
                {activeTab === "my" ? "You haven't created any prompts yet" : "No prompts found"}
              </p>
              {activeTab === "my" && (
                <Link
                  to={"/dashboard/prompts/new" as any}
                  className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-accent hover:underline"
                >
                  Create your first prompt
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          ) : (
            prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                actionLoading={actionLoading}
                copiedId={copiedId}
                onActivate={activatePrompt}
                onDeactivate={deactivatePrompt}
                onUninstall={uninstallPrompt}
                onDelete={deletePrompt}
                onDownload={downloadPrompt}
                onCopyId={copyId}
              />
            ))
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 border-t border-border pt-8 pb-12">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
            How to Use Prompts
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
                Click the play button to activate a prompt. Multiple prompts can be active at once.
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
                Download PROMPT.md to your project and reference it in CLAUDE.md.
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
                Use <code className="text-accent">activate-prompt</code> via the Nexus MCP server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Prompt Card Component
// ============================================================================

interface PromptCardProps {
  prompt: Prompt;
  actionLoading: string | null;
  copiedId: string | null;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onUninstall: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onCopyId: (id: string) => void;
}

function PromptCard({
  prompt,
  actionLoading,
  copiedId,
  onActivate,
  onDeactivate,
  onUninstall,
  onDelete,
  onDownload,
  onCopyId,
}: PromptCardProps) {
  const isLoading = actionLoading === prompt.id;

  return (
    <div
      className={`border bg-background transition-colors ${
        prompt.isActive
          ? "border-accent shadow-[3px_3px_0_0_var(--color-accent)]"
          : "border-border hover:border-foreground/50"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {prompt.isActive && <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
              <Link
                to="/dashboard/prompts/$promptId"
                params={{ promptId: prompt.id }}
                className="font-mono text-sm font-bold uppercase tracking-wide text-foreground hover:text-accent transition-colors truncate"
              >
                {prompt.name}
              </Link>
              {prompt.isStarterPack && (
                <span className="shrink-0 border border-accent/50 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                  Starter
                </span>
              )}
              {prompt.isOwned && !prompt.isStarterPack && (
                <span className="shrink-0 border border-foreground/30 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                  Custom
                </span>
              )}
            </div>
            {prompt.description && (
              <p className="mt-1 font-mono text-xs text-muted-foreground line-clamp-2">
                {prompt.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {isLoading ? (
              <div className="flex h-8 w-8 items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : prompt.isActive ? (
              <button
                onClick={() => onDeactivate(prompt.id)}
                className="flex h-8 w-8 items-center justify-center border border-accent text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                title="Deactivate"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => onActivate(prompt.id)}
                className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                title="Activate"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onDownload(prompt.id)}
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              title="Download PROMPT.md"
            >
              <Download className="h-4 w-4" />
            </button>
            {prompt.isOwned && !prompt.isStarterPack && (
              <>
                <Link
                  to="/dashboard/prompts/$promptId"
                  params={{ promptId: prompt.id }}
                  className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  title="Edit"
                >
                  <Settings className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => onDelete(prompt.id)}
                  className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            {!prompt.isOwned && prompt.isInstalled && (
              <button
                onClick={() => onUninstall(prompt.id)}
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
            {prompt.category}
          </span>
          {prompt.libraries.length > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              {prompt.libraries.length} libraries
            </span>
          )}
          {prompt.skills.length > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Zap className="h-3 w-3" />
              {prompt.skills.length} skills
            </span>
          )}
          {prompt.mcpServers.length > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Server className="h-3 w-3" />
              {prompt.mcpServers.length} servers
            </span>
          )}
          <button
            onClick={() => onCopyId(prompt.id)}
            className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            title="Copy ID"
          >
            {copiedId === prompt.id ? (
              <>
                <Check className="h-3 w-3 text-accent" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                {prompt.id.slice(0, 20)}...
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
