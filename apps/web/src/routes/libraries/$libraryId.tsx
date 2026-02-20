import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { FloatingParticles } from "../../components/FloatingParticles";
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
    <div className="relative min-h-screen">
      <FloatingParticles />
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl bg-destructive/10"
            style={{ boxShadow: "0 0 30px rgba(239, 68, 68, 0.2)" }}
          >
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
            className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            style={{ boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}
          >
            Back to Explore
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function LibraryDetailPage() {
  const { library, stats, chunks, totalChunks } = Route.useLoaderData();
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [expandedChunks, setExpandedChunks] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Header animation
    const tl = gsap.timeline();

    tl.fromTo(
      ".back-link",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    )
      .fromTo(
        ".library-icon",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.2"
      )
      .fromTo(
        ".library-info",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
        "-=0.3"
      );

    // Stats cards animation
    gsap.fromTo(
      ".stat-card",
      { opacity: 0, y: 20, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.4,
      }
    );

    // Chunks animation
    gsap.fromTo(
      ".chunk-item",
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.03,
        ease: "power2.out",
        delay: 0.6,
      }
    );

    // Sidebar animation
    gsap.fromTo(
      ".sidebar-card",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      }
    );
  }, []);

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
    <div className="relative min-h-screen">
      {/* Background effects */}
      <FloatingParticles />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div
        ref={headerRef}
        className="relative border-b border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/explore"
            className="back-link mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {library.iconUrl ? (
                <div
                  className="library-icon flex h-16 w-16 items-center justify-center rounded-xl bg-card p-2"
                  style={{
                    boxShadow: "0 0 30px rgba(139, 92, 246, 0.2)",
                  }}
                >
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
                <div
                  className="library-icon flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10"
                  style={{
                    boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              )}
              <div className="library-info">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {library.name}
                  </h1>
                  {library.version && (
                    <span className="rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      v{library.version}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      library.indexStatus === "indexed"
                        ? "bg-green-500/10 text-green-400"
                        : library.indexStatus === "indexing"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : library.indexStatus === "failed"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-muted/50 text-muted-foreground"
                    }`}
                    style={
                      library.indexStatus === "indexed"
                        ? { boxShadow: "0 0 10px rgba(34, 197, 94, 0.2)" }
                        : {}
                    }
                  >
                    {library.indexStatus === "indexed"
                      ? "Indexed"
                      : library.indexStatus === "indexing"
                        ? "Indexing..."
                        : library.indexStatus === "failed"
                          ? "Failed"
                          : "Pending"}
                  </span>
                </div>
                <p className="mt-1 max-w-2xl text-muted-foreground">
                  {library.description || "No description available"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {library.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground"
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
                  {library.docsUrl && (
                    <a
                      href={library.docsUrl}
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
              color="purple"
            />
            <StatCard
              icon={<Hash className="h-5 w-5" />}
              label="Total Tokens"
              value={`${(library.totalTokens / 1000).toFixed(1)}k`}
              color="cyan"
            />
            <StatCard
              icon={<Sparkles className="h-5 w-5" />}
              label="Queries"
              value={stats.totalQueries.toString()}
              color="green"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Last Updated"
              value={
                library.lastIndexedAt
                  ? new Date(library.lastIndexedAt).toLocaleDateString()
                  : "Never"
              }
              color="yellow"
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
                <div className="divide-y divide-border/50 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
                  {displayedChunks.map((chunk) => (
                    <ChunkItem key={chunk.id} chunk={chunk} />
                  ))}
                </div>
                {chunks.length > 10 && (
                  <button
                    onClick={() => setExpandedChunks(!expandedChunks)}
                    className="mt-4 w-full rounded-lg border border-border/50 bg-card/30 py-2 text-sm text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground"
                  >
                    {expandedChunks
                      ? "Show less"
                      : `Show ${chunks.length - 10} more chunks`}
                  </button>
                )}
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 py-12 backdrop-blur-sm"
                style={{
                  boxShadow: "inset 0 0 60px rgba(139, 92, 246, 0.05)",
                }}
              >
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
            <div
              className="sidebar-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
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
                    <pre
                      className="overflow-x-auto rounded-lg border border-border/50 bg-muted/30 p-3 font-mono text-xs"
                      style={{
                        boxShadow: "inset 0 0 30px rgba(139, 92, 246, 0.05)",
                      }}
                    >
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
                        <span className="text-green-400">
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
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md border border-border/50 bg-card/80 transition-all hover:border-primary/50"
                      style={
                        copiedConfig
                          ? { boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)" }
                          : {}
                      }
                    >
                      {copiedConfig ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Query Example */}
            <div
              className="sidebar-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Code className="h-4 w-4 text-accent" />
                Example Query
              </h3>
              <div
                className="rounded-lg border border-border/50 bg-muted/30 p-4"
                style={{
                  boxShadow: "inset 0 0 30px rgba(139, 92, 246, 0.05)",
                }}
              >
                <pre className="overflow-x-auto font-mono text-xs">
                  <code>
                    <span className="text-muted-foreground/60">
                      {"// First, resolve the library ID"}
                    </span>
                    {"\n"}
                    <span className="text-accent">nexus</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-primary">resolve_library</span>
                    <span className="text-muted-foreground">({"{"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-foreground">name</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-green-400">"{library.name}"</span>
                    {"\n"}
                    <span className="text-muted-foreground">{"})"}</span>
                    {"\n\n"}
                    <span className="text-muted-foreground/60">
                      {"// Then query the docs"}
                    </span>
                    {"\n"}
                    <span className="text-accent">nexus</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-primary">query_docs</span>
                    <span className="text-muted-foreground">({"{"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-foreground">libraryId</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-green-400">"{library.id}"</span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"  "}
                    <span className="text-foreground">query</span>
                    <span className="text-muted-foreground">: </span>
                    <span className="text-green-400">"how to get started"</span>
                    {"\n"}
                    <span className="text-muted-foreground">{"})"}</span>
                  </code>
                </pre>
              </div>
            </div>

            {/* Available Tools */}
            <div
              className="sidebar-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                MCP Tools
              </h3>
              <div className="space-y-2 text-sm">
                <div className="rounded-lg bg-muted/30 p-3">
                  <code className="text-primary">resolve_library</code>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Search for a library by name
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <code className="text-primary">query_docs</code>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Semantic search documentation
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <code className="text-primary">get_library_info</code>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Get library metadata
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
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
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    gsap.to(itemRef.current, {
      x: 4,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(itemRef.current, {
      x: 0,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={itemRef}
      className="chunk-item group flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate font-medium text-foreground">
            {chunk.title || chunk.sourceFile}
          </h4>
          <span className="shrink-0 rounded bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
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
        <ChevronRight className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
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
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "purple" | "cyan" | "green" | "yellow";
}) {
  const colorMap = {
    purple: {
      bg: "bg-primary/10",
      text: "text-primary",
      glow: "rgba(139, 92, 246, 0.2)",
    },
    cyan: {
      bg: "bg-accent/10",
      text: "text-accent",
      glow: "rgba(6, 182, 212, 0.2)",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      glow: "rgba(34, 197, 94, 0.2)",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      glow: "rgba(234, 179, 8, 0.2)",
    },
  };

  const colors = colorMap[color];

  return (
    <div
      className="stat-card rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
      style={{
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`,
      }}
    >
      <div className={`mb-2 ${colors.text}`}>{icon}</div>
      <p
        className="text-2xl font-bold text-foreground"
        style={{
          textShadow: `0 0 20px ${colors.glow}`,
        }}
      >
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
