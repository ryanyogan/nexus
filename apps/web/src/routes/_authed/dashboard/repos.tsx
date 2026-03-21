import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  GitBranch,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Lock,
  Globe,
  FolderTree,
  FileCode,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  useRepos,
  useAvailableRepos,
  useConnectRepo,
  useSyncRepo,
  useDisconnectRepo,
  type ConnectedRepo,
  type AvailableRepo,
} from "../../../hooks/use-dashboard-queries";

export const Route = createFileRoute("/_authed/dashboard/repos")({
  component: ReposPage,
});

function ReposPage() {
  const [showConnect, setShowConnect] = useState(false);

  // Queries
  const { data, isPending, isError, error } = useRepos();
  const availableQuery = useAvailableRepos();

  const repos = data?.repos ?? [];
  const tier = data?.tier ?? "free";
  const limits = data?.limits ?? null;

  // Mutations
  const connectMutation = useConnectRepo();
  const syncMutation = useSyncRepo();
  const disconnectMutation = useDisconnectRepo();

  // Track which item is currently being acted upon
  const actionLoading = connectMutation.isPending
    ? `connect-${connectMutation.variables?.githubId}`
    : syncMutation.isPending
      ? `sync-${syncMutation.variables}`
      : disconnectMutation.isPending
        ? `disconnect-${disconnectMutation.variables}`
        : null;

  async function handleConnectRepo(repo: AvailableRepo) {
    if (limits && limits.currentRepoCount >= limits.maxRepos) {
      return;
    }

    if (repo.isPrivate && limits && !limits.privateRepos) {
      return;
    }

    try {
      await connectMutation.mutateAsync({
        githubId: repo.githubId,
        owner: repo.owner,
        name: repo.name,
        fullName: repo.fullName,
        description: repo.description,
        htmlUrl: repo.htmlUrl,
        defaultBranch: repo.defaultBranch,
        isPrivate: repo.isPrivate,
      });
      setShowConnect(false);
    } catch {
      // Error handled by mutation state
    }
  }

  function handleSyncRepo(id: string) {
    syncMutation.mutate(id);
  }

  function handleDisconnectRepo(id: string) {
    if (
      !confirm(
        "Are you sure you want to disconnect this repository? All indexed files will be removed."
      )
    ) {
      return;
    }
    disconnectMutation.mutate(id);
  }

  function openConnectModal() {
    setShowConnect(true);
    void availableQuery.refetch();
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // Get the current error message
  const errorMessage =
    connectMutation.error?.message ||
    syncMutation.error?.message ||
    disconnectMutation.error?.message ||
    availableQuery.error?.message ||
    (isError ? (error as Error)?.message : null) ||
    (limits && limits.currentRepoCount >= limits.maxRepos
      ? `You've reached your limit of ${limits.maxRepos} repos. Upgrade to connect more.`
      : null);

  if (isPending) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
                Connected Repositories
              </h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
                Link GitHub repos for AI-assisted code context
              </p>
            </div>
            <button
              onClick={openConnectModal}
              disabled={limits ? limits.currentRepoCount >= limits.maxRepos : false}
              className="flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Connect Repo</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mb-6 border border-destructive bg-destructive/10 p-4">
            <p className="font-mono text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        {/* Tier & Limits */}
        {limits && (
          <div className="mb-6 border border-border bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span
                  className={`border px-2 py-1 font-mono text-xs font-bold uppercase ${
                    tier === "team"
                      ? "border-purple-500/50 text-purple-500"
                      : tier === "pro"
                        ? "border-accent/50 text-accent"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {tier}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  {limits.currentRepoCount} / {limits.maxRepos} repos
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  {formatBytes(limits.maxBytesPerRepo)} max per repo
                </span>
              </div>
              {tier === "free" && (
                <Link
                  to="/plans"
                  className="font-mono text-xs font-bold uppercase text-accent hover:underline"
                >
                  Upgrade
                </Link>
              )}
            </div>
            {!limits.privateRepos && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                <Lock className="mr-1 inline h-3 w-3" />
                Private repos require Pro or Team plan
              </p>
            )}
          </div>
        )}

        {/* Repos List */}
        <div className="space-y-4">
          {repos.length === 0 ? (
            <div className="border border-border bg-background p-8 text-center">
              <GitBranch className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 font-mono text-sm text-muted-foreground">
                No repositories connected yet
              </p>
              <button
                onClick={openConnectModal}
                className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-accent hover:underline"
              >
                Connect your first repo
              </button>
            </div>
          ) : (
            repos.map((repo) => (
              <RepoCard
                key={repo.id}
                repo={repo}
                actionLoading={actionLoading}
                onSync={handleSyncRepo}
                onDisconnect={handleDisconnectRepo}
                formatBytes={formatBytes}
              />
            ))
          )}
        </div>

        {/* How it works */}
        <div className="mt-12 border-t border-border pt-8 pb-12">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
            How It Works
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-foreground font-mono text-xs font-bold">
                  1
                </span>
                <span className="font-mono text-xs font-bold uppercase">Connect</span>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Connect your GitHub repositories. We index README, docs, configs, and types.
              </p>
            </div>
            <div className="border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center border border-foreground font-mono text-xs font-bold">
                  2
                </span>
                <span className="font-mono text-xs font-bold uppercase">Index</span>
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Smart indexing extracts key files: entry points, types, configurations.
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
                Access your repo context via MCP tools:{" "}
                <code className="text-accent">get-repo-file</code>,{" "}
                <code className="text-accent">get-repo-structure</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Connect Modal */}
        {showConnect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
            <div className="w-full max-w-2xl max-h-[80vh] overflow-auto border border-border bg-background p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-mono text-lg font-bold uppercase text-foreground">
                  Connect Repository
                </h2>
                <button
                  onClick={() => setShowConnect(false)}
                  className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              {availableQuery.isPending || availableQuery.isFetching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (availableQuery.data?.repos ?? []).length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-mono text-sm text-muted-foreground">
                    No repositories found. Make sure you have GitHub connected.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(availableQuery.data?.repos ?? []).map((repo) => (
                    <div
                      key={repo.githubId}
                      className={`flex items-center justify-between border p-4 ${
                        repo.isConnected
                          ? "border-accent/30 bg-accent/5"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {repo.isPrivate ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Globe className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-mono text-sm font-bold text-foreground truncate">
                            {repo.fullName}
                          </span>
                          {repo.language && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {repo.language}
                            </span>
                          )}
                        </div>
                        {repo.description && (
                          <p className="mt-1 font-mono text-xs text-muted-foreground line-clamp-1">
                            {repo.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {repo.isConnected ? (
                          <span className="font-mono text-xs text-accent">Connected</span>
                        ) : (
                          <button
                            onClick={() => handleConnectRepo(repo)}
                            disabled={
                              actionLoading === `connect-${repo.githubId}` ||
                              (repo.isPrivate && limits !== null && !limits.privateRepos)
                            }
                            className="border border-foreground bg-foreground px-3 py-1.5 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === `connect-${repo.githubId}` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Connect"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Repo Card Component
// ============================================================================

interface RepoCardProps {
  repo: ConnectedRepo;
  actionLoading: string | null;
  onSync: (id: string) => void;
  onDisconnect: (id: string) => void;
  formatBytes: (bytes: number) => string;
}

function RepoCard({ repo, actionLoading, onSync, onDisconnect, formatBytes }: RepoCardProps) {
  const isSyncing = actionLoading === `sync-${repo.id}`;
  const isDisconnecting = actionLoading === `disconnect-${repo.id}`;

  const statusIcon = {
    indexed: <CheckCircle className="h-4 w-4 text-green-500" />,
    indexing: <Loader2 className="h-4 w-4 animate-spin text-accent" />,
    pending: <Clock className="h-4 w-4 text-yellow-500" />,
    failed: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  return (
    <div className="border border-border bg-background transition-colors hover:border-foreground/30">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {statusIcon[repo.indexStatus]}
              {repo.isPrivate ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground" />
              )}
              <a
                href={repo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm font-bold uppercase tracking-wide text-foreground hover:text-accent transition-colors truncate flex items-center gap-1"
              >
                {repo.fullName}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {repo.description && (
              <p className="mt-1 font-mono text-xs text-muted-foreground line-clamp-2">
                {repo.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSync(repo.id)}
              disabled={isSyncing || repo.indexStatus === "indexing"}
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50"
              title="Sync"
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => onDisconnect(repo.id)}
              disabled={isDisconnecting}
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
              title="Disconnect"
            >
              {isDisconnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <FolderTree className="h-3 w-3" />
            {repo.indexedFiles} / {repo.totalFiles} files
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <FileCode className="h-3 w-3" />
            {formatBytes(repo.totalBytes)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            Branch: {repo.defaultBranch}
          </span>
          {repo.lastIndexedAt && (
            <span className="font-mono text-[10px] text-muted-foreground">
              Last synced: {new Date(repo.lastIndexedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Error */}
        {repo.indexStatus === "failed" && repo.indexError && (
          <div className="mt-3 border border-destructive/30 bg-destructive/5 p-2">
            <p className="font-mono text-xs text-destructive">{repo.indexError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
