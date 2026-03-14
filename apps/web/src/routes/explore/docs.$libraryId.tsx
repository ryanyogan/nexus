import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Github,
  Copy,
  Check,
  FileText,
  Star,
  Globe,
  ExternalLink,
  Terminal,
  Zap,
  Clock,
  Database,
  Code,
  CheckCircle,
} from "lucide-react";
import { getDb } from "../../server/db";
import * as schema from "@nexus/db";
import { eq } from "drizzle-orm";
import { logger } from "../../lib/server-fn";

// ============================================================================
// Server Functions
// ============================================================================

const getLibraryFn = createServerFn({ method: "GET" })
  .inputValidator((data: { libraryId: string }) => data)
  .handler(async ({ data }) => {
    const startTime = Date.now();
    const fnName = "getLibraryFn";

    try {
      logger.debug(`${fnName} started`, { libraryId: data.libraryId });

      const db = getDb();
      const library = await db.query.libraries.findFirst({
        where: eq(schema.libraries.id, data.libraryId),
      });

      if (!library) {
        throw new Error("Library not found");
      }

      const durationMs = Date.now() - startTime;
      logger.info(`${fnName} completed`, { durationMs, libraryId: data.libraryId });

      return { library };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`${fnName} failed`, { durationMs, libraryId: data.libraryId }, err);
      throw error;
    }
  });

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore/docs/$libraryId")({
  loader: async ({ params }) => {
    return getLibraryFn({ data: { libraryId: params.libraryId } });
  },
  component: LibraryDetailPage,
});

// ============================================================================
// Main Component
// ============================================================================

function LibraryDetailPage() {
  const { library } = Route.useLoaderData();
  const category = library.categories?.[0];
  
  const [copiedQuery, setCopiedQuery] = useState(false);

  const copyQueryExample = async () => {
    const example = `nexus.queryDocs({ libraryId: "${library.id}", query: "How do I get started?" })`;
    try {
      await navigator.clipboard.writeText(example);
      setCopiedQuery(true);
      setTimeout(() => setCopiedQuery(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Format numbers with K/M suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Trust score label
  const getTrustLabel = (score: number | null) => {
    if (!score) return null;
    if (score >= 8) return "High";
    if (score >= 5) return "Medium";
    return "Low";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back link */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-8 border-b border-border pb-8">
          <div className="flex items-start gap-4">
            {/* Icon */}
            {library.iconUrl ? (
              <img
                src={library.iconUrl}
                alt={library.name}
                className="h-16 w-16 border border-border bg-muted object-contain p-2"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center border border-border bg-muted">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-foreground">
                  {library.name}
                </h1>
                {library.isFeatured && (
                  <span className="inline-flex items-center gap-1 border border-accent bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                )}
                {library.indexStatus === "indexed" && (
                  <span className="inline-flex items-center gap-1 border border-foreground/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    Indexed
                  </span>
                )}
              </div>
              
              {library.description && (
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  {library.description}
                </p>
              )}

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                {category && (
                  <span className="uppercase">{category}</span>
                )}
                {library.version && (
                  <>
                    <span className="text-border">|</span>
                    <span>v{library.version}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-2">
            {library.repositoryUrl && (
              <a
                href={library.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:bg-muted"
              >
                <Github className="h-3.5 w-3.5" />
                Source
              </a>
            )}
            {library.homepageUrl && (
              <a
                href={library.homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:bg-muted"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-bold text-foreground">{formatNumber(library.totalChunks)}</span>
            <span className="uppercase text-muted-foreground">chunks</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-bold text-foreground">{formatNumber(library.totalTokens)}</span>
            <span className="uppercase text-muted-foreground">tokens</span>
          </div>
          {library.context7TotalSnippets && library.context7TotalSnippets > 0 && (
            <div className="flex items-center gap-2">
              <Code className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-bold text-foreground">{formatNumber(library.context7TotalSnippets)}</span>
              <span className="uppercase text-muted-foreground">snippets</span>
            </div>
          )}
          {library.context7Stars && library.context7Stars > 0 && (
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-bold text-foreground">{formatNumber(library.context7Stars)}</span>
              <span className="uppercase text-muted-foreground">stars</span>
            </div>
          )}
          {library.lastIndexedAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="uppercase text-muted-foreground">
                Updated {new Date(library.lastIndexedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Query Example */}
            <div className="border border-border p-6">
              <h2 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase text-foreground">
                <Terminal className="h-4 w-4 text-accent" />
                Query This Library
              </h2>
              <p className="mb-4 font-mono text-xs text-muted-foreground">
                Use the Nexus MCP server to search this library's documentation with semantic search.
              </p>
              <div className="relative">
                <pre className="overflow-x-auto border border-border bg-muted p-4 pr-12 font-mono text-xs">
                  <code className="text-foreground">
{`// In your AI assistant
nexus.queryDocs({
  libraryId: "${library.id}",
  query: "How do I get started?"
})`}
                  </code>
                </pre>
                <button
                  onClick={copyQueryExample}
                  className="absolute right-2 top-2 border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copiedQuery ? (
                    <Check className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Available Versions */}
            {library.versions && library.versions.length > 0 && (
              <div className="border border-border p-6">
                <h2 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase text-foreground">
                  <Code className="h-4 w-4 text-accent" />
                  Available Versions
                </h2>
                <div className="flex flex-wrap gap-2">
                  {library.versions.slice(0, 10).map((version) => (
                    <span
                      key={version}
                      className={`border px-3 py-1 font-mono text-xs ${
                        version === library.version
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {version}
                      {version === library.version && " (current)"}
                    </span>
                  ))}
                  {library.versions.length > 10 && (
                    <span className="border border-border px-3 py-1 font-mono text-xs text-muted-foreground">
                      +{library.versions.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Source Information */}
            <div className="border border-border p-6">
              <h2 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase text-foreground">
                <Globe className="h-4 w-4 text-accent" />
                Source Information
              </h2>
              <dl className="space-y-3 font-mono text-xs">
                <div className="flex items-start justify-between">
                  <dt className="uppercase text-muted-foreground">Source Type</dt>
                  <dd className="font-bold uppercase text-foreground">
                    {library.sourceType}
                  </dd>
                </div>
                {library.sourceUrl && (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="uppercase text-muted-foreground">Documentation URL</dt>
                    <dd className="text-right">
                      <a
                        href={library.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent hover:underline"
                      >
                        {new URL(library.sourceUrl).hostname}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </dd>
                  </div>
                )}
                {library.context7Id && (
                  <div className="flex items-start justify-between">
                    <dt className="uppercase text-muted-foreground">Context7 ID</dt>
                    <dd className="text-foreground">
                      {library.context7Id}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ask AI card */}
            <div className="border border-accent bg-accent/5 p-6">
              <h3 className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase text-foreground">
                <Zap className="h-3.5 w-3.5 text-accent" />
                Ask Your AI
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                Query this library through your AI assistant:
              </p>
              <pre className="mt-3 overflow-x-auto border border-border bg-background p-3 font-mono text-[10px]">
                <code className="text-foreground">
                  "How do I use {library.name}?"
                </code>
              </pre>
            </div>

            {/* Library Details */}
            <div className="border border-border p-6">
              <h3 className="mb-4 font-mono text-xs font-bold uppercase text-foreground">
                Details
              </h3>
              <dl className="space-y-3 font-mono text-xs">
                {category && (
                  <div className="flex items-center justify-between">
                    <dt className="uppercase text-muted-foreground">Category</dt>
                    <dd className="font-bold uppercase text-foreground">
                      {category}
                    </dd>
                  </div>
                )}
                {library.version && (
                  <div className="flex items-center justify-between">
                    <dt className="uppercase text-muted-foreground">Version</dt>
                    <dd className="text-foreground">
                      {library.version}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="uppercase text-muted-foreground">Status</dt>
                  <dd className={`font-bold uppercase ${
                    library.indexStatus === "indexed" 
                      ? "text-accent" 
                      : library.indexStatus === "indexing"
                      ? "text-yellow-500"
                      : "text-muted-foreground"
                  }`}>
                    {library.indexStatus === "indexed" ? "Ready" : 
                     library.indexStatus === "indexing" ? "Indexing" :
                     library.indexStatus === "failed" ? "Failed" : "Pending"}
                  </dd>
                </div>
                {library.context7TrustScore && (
                  <div className="flex items-center justify-between">
                    <dt className="uppercase text-muted-foreground">Trust</dt>
                    <dd className="flex items-center gap-1 text-foreground">
                      <span className="font-bold">{library.context7TrustScore}/10</span>
                      <span className="text-muted-foreground">
                        ({getTrustLabel(library.context7TrustScore)})
                      </span>
                    </dd>
                  </div>
                )}
                {library.context7BenchmarkScore && (
                  <div className="flex items-center justify-between">
                    <dt className="uppercase text-muted-foreground">Quality</dt>
                    <dd className="font-bold text-foreground">
                      {library.context7BenchmarkScore}%
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Categories */}
            {library.categories && library.categories.length > 0 && (
              <div className="border border-border p-6">
                <h3 className="mb-4 font-mono text-xs font-bold uppercase text-foreground">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {library.categories.map((cat) => (
                    <Link
                      key={cat}
                      to="/"
                      search={{ q: cat }}
                      className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
