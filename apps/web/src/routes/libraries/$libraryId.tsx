import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Clock,
  Github,
  Globe,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Hash,
  Code,
  Terminal,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { LibraryDetailSkeleton } from "../../components/skeletons";
import { getLibrary, getLibraryChunks } from "../../lib/queries";
import type { LibraryDetailResult, ChunkListResult } from "../../lib/types";

// ============================================================================
// Types
// ============================================================================

interface LoaderData {
  library: LibraryDetailResult["library"];
  stats: LibraryDetailResult["stats"];
  chunks: ChunkListResult["chunks"];
  totalChunks: number;
}

type Chunk = ChunkListResult["chunks"][number];

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/libraries/$libraryId")({
  loader: async ({ params }): Promise<LoaderData> => {
    const [libraryData, chunksData] = await Promise.all([
      getLibrary({ data: params.libraryId }),
      getLibraryChunks({ data: { libraryId: params.libraryId, limit: 20, offset: 0 } }),
    ]);

    if (!libraryData) {
      throw notFound();
    }

    return {
      library: libraryData.library,
      stats: libraryData.stats,
      chunks: chunksData.chunks,
      totalChunks: chunksData.pagination.total,
    };
  },
  pendingComponent: LibraryDetailSkeleton,
  notFoundComponent: LibraryNotFound,
  component: LibraryDetailPage,
});

// ============================================================================
// Not Found Component
// ============================================================================

function LibraryNotFound() {
  const { libraryId } = Route.useParams();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-destructive/10">
          <BookOpen className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Library not found
        </h1>
        <p className="text-muted-foreground">
          The library "{libraryId}" doesn't exist or has been removed.
        </p>
        <Link
          to="/explore"
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to Explore
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function LibraryDetailPage() {
  const loaderData = Route.useLoaderData();
  const { libraryId } = Route.useParams();
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [expandedChunks, setExpandedChunks] = useState(false);

  // Use client-side query with smart polling when library is indexing
  const { data: liveData } = useQuery({
    queryKey: ["library", libraryId],
    queryFn: async () => {
      const [libraryData, chunksData] = await Promise.all([
        getLibrary({ data: libraryId }),
        getLibraryChunks({ data: { libraryId, limit: 20, offset: 0 } }),
      ]);
      if (!libraryData) {
        throw new Error("Library not found");
      }
      return {
        library: libraryData.library,
        stats: libraryData.stats,
        chunks: chunksData.chunks,
        totalChunks: chunksData.pagination.total,
      };
    },
    initialData: loaderData,
    refetchInterval: (query) => {
      // Poll every 5s if library is indexing
      return query.state.data?.library?.indexStatus === "indexing" ? 5000 : false;
    },
  });

  const { library, stats, chunks, totalChunks } = liveData;
  const isPolling = library.indexStatus === "indexing";

  const copyConfig = () => {
    const config = JSON.stringify(
      {
        mcpServers: {
          nexus: {
            url: "https://api.nexus.yogan.dev/mcp",
            transport: "http-stream",
          },
        },
      },
      null,
      2
    );
    navigator.clipboard.writeText(config);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const displayedChunks = expandedChunks ? chunks : chunks.slice(0, 10);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/explore"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {library.iconUrl ? (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted p-2">
                  <img
                    src={library.iconUrl}
                    alt={library.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {library.name}
                  </h1>
                  {library.version && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      v{library.version}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      library.indexStatus === "indexed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : library.indexStatus === "indexing"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : library.indexStatus === "failed"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {library.indexStatus === "indexed"
                      ? "Indexed"
                      : library.indexStatus === "indexing"
                        ? "Indexing..."
                        : library.indexStatus === "failed"
                          ? "Failed"
                          : "Pending"}
                  </span>
                  {isPolling && (
                    <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Auto-refreshing
                    </span>
                  )}
                </div>
                <p className="mt-1 max-w-2xl text-muted-foreground">
                  {library.description || "No description available"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {library.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground"
                    >
                      {cat}
                    </span>
                  ))}
                  {library.homepageUrl && (
                    <a
                      href={library.homepageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Website
                    </a>
                  )}
                  {library.repositoryUrl && (
                    <a
                      href={library.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github className="h-3.5 w-3.5" />
                      Source
                    </a>
                  )}
                  {library.sourceUrl && (
                    <a
                      href={library.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Docs
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={<FileText className="h-5 w-5" />}
              label="Doc Chunks"
              value={library.totalChunks.toString()}
            />
            <StatCard
              icon={<Hash className="h-5 w-5" />}
              label="Total Tokens"
              value={`${(library.totalTokens / 1000).toFixed(1)}k`}
            />
            <StatCard
              icon={<Sparkles className="h-5 w-5" />}
              label="Queries"
              value={stats.totalQueries.toString()}
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Last Updated"
              value={
                library.lastIndexedAt
                  ? new Date(library.lastIndexedAt).toLocaleDateString()
                  : "Never"
              }
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Chunks List */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Documentation Chunks ({totalChunks})
            </h2>
            {chunks.length > 0 ? (
              <>
                <div className="divide-y divide-border rounded-lg border border-border bg-card">
                  {displayedChunks.map((chunk) => (
                    <ChunkItem key={chunk.id} chunk={chunk} />
                  ))}
                </div>
                {chunks.length > 10 && (
                  <button
                    onClick={() => setExpandedChunks(!expandedChunks)}
                    className="mt-4 w-full rounded-lg border border-border py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {expandedChunks
                      ? "Show less"
                      : `Show ${chunks.length - 10} more chunks`}
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">
                  No chunks indexed yet
                </p>
                <p className="mt-1 text-muted-foreground">
                  This library is still being processed
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* MCP Usage */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Terminal className="h-4 w-4 text-primary" />
                Use with MCP
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Query this library's documentation directly from your AI coding
                assistant.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">
                    Add to your MCP config
                  </label>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs">
                      <code>
                        <span className="text-muted-foreground">{"{"}</span>
                        {"\n"}
                        {"  "}
                        <span className="text-primary">"mcpServers"</span>
                        <span className="text-muted-foreground">: {"{"}</span>
                        {"\n"}
                        {"    "}
                        <span className="text-primary">"nexus"</span>
                        <span className="text-muted-foreground">: {"{"}</span>
                        {"\n"}
                        {"      "}
                        <span className="text-primary">"url"</span>
                        <span className="text-muted-foreground">: </span>
                        <span className="text-green-600 dark:text-green-400">
                          "https://api.nexus.yogan.dev/mcp"
                        </span>
                        {"\n"}
                        {"    "}
                        <span className="text-muted-foreground">{"}"}</span>
                        {"\n"}
                        {"  "}
                        <span className="text-muted-foreground">{"}"}</span>
                        {"\n"}
                        <span className="text-muted-foreground">{"}"}</span>
                      </code>
                    </pre>
                    <button
                      onClick={copyConfig}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-muted"
                    >
                      {copiedConfig ? (
                        <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Query Example */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Code className="h-4 w-4 text-primary" />
                Example Query
              </h3>
              <div className="rounded-lg border border-border bg-muted p-4">
                <pre className="overflow-x-auto font-mono text-xs">
                  <code>
                    <span className="text-muted-foreground">
                      {"// First, resolve the library ID"}
                    </span>
                    {"\n"}
                    <span className="text-primary">nexus</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-foreground">resolve_library</span>
                    <span className="text-muted-foreground">({"{"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-foreground">name</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-green-600 dark:text-green-400">"{library.name}"</span>
                    {"\n"}
                    <span className="text-muted-foreground">{"})"}</span>
                    {"\n\n"}
                    <span className="text-muted-foreground">
                      {"// Then query the docs"}
                    </span>
                    {"\n"}
                    <span className="text-primary">nexus</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-foreground">query_docs</span>
                    <span className="text-muted-foreground">({"{"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-foreground">libraryId</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-green-600 dark:text-green-400">"{library.id}"</span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"  "}
                    <span className="text-foreground">query</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-green-600 dark:text-green-400">"how to get started"</span>
                    {"\n"}
                    <span className="text-muted-foreground">{"})"}</span>
                  </code>
                </pre>
              </div>
            </div>

            {/* Available Tools */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                MCP Tools
              </h3>
              <div className="space-y-2 text-sm">
                <div className="rounded-lg bg-muted p-3">
                  <code className="text-primary">resolve_library</code>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Search for a library by name
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <code className="text-primary">query_docs</code>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Semantic search documentation
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <code className="text-primary">get_library_info</code>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Get library metadata
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <code className="text-primary">list_libraries</code>
                  <p className="mt-1 text-xs text-muted-foreground">
                    List all indexed libraries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Chunk Item Component
// ============================================================================

function ChunkItem({ chunk }: { chunk: Chunk }) {
  return (
    <div className="group flex items-center justify-between p-4 transition-colors hover:bg-muted">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium text-foreground">
            {chunk.title || chunk.sourceFile}
          </h4>
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {chunk.contentType}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {chunk.sourceFile}
        </p>
      </div>
      <div className="ml-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="whitespace-nowrap">
          {chunk.tokenCount.toLocaleString()} tokens
        </span>
        <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </div>
  );
}

// ============================================================================
// Stat Card Component
// ============================================================================

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
      <div className="mb-2 text-primary">{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
