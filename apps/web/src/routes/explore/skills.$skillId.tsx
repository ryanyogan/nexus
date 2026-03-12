import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";
import { eq } from "drizzle-orm";
import { API_URL } from "../../lib/api";
import {
  ArrowLeft,
  Zap,
  Github,
  Copy,
  Check,
  Download,
  Star,
  ExternalLink,
  Tag,
} from "lucide-react";
import { Skeleton } from "../../components/skeletons";
import { logger } from "../../lib/server-fn";

// ============================================================================
// Types
// ============================================================================

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sourceUrl: string | null;
  sourceRepo: string | null;
  author: string | null;
  version: string | null;
  type: "analysis" | "generation" | "transformation" | "integration" | "utility";
  categories: string[];
  tags: string[];
  format: "markdown" | "yaml" | "json";
  contentPreview: string | null;
  requiredTools: string[] | null;
  requiredMcpServers: string[] | null;
  installCount: number;
  usageCount: number;
  rating: number | null;
  isOfficial: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  r2Key: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Server Functions
// ============================================================================

const getSkill = createServerFn({ method: "GET" })
  .inputValidator((d: { skillId: string }) => d)
  .handler(async ({ data }) => {
    const startTime = Date.now();
    const fnName = "getSkill";

    try {
      logger.debug(`${fnName} started`, { skillId: data.skillId });

      const db = drizzle(env.DB, { schema });

      const skill = await db
        .select()
        .from(schema.skills)
        .where(eq(schema.skills.id, data.skillId))
        .get();

      if (!skill) {
        throw new Error("Skill not found");
      }

      const durationMs = Date.now() - startTime;
      logger.info(`${fnName} completed`, { durationMs, skillId: data.skillId });

      // Return skill without content - content will be fetched client-side
      return { skill: skill as Skill, content: null as string | null };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`${fnName} failed`, { durationMs, skillId: data.skillId }, err);
      throw error;
    }
  });

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore/skills/$skillId")({
  loader: async ({ params }) => {
    const data = await getSkill({ data: { skillId: params.skillId } });
    return data;
  },
  pendingComponent: SkillDetailSkeleton,
  component: SkillDetailPage,
});

// ============================================================================
// Main Component
// ============================================================================

function SkillDetailPage() {
  const { skill } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(true);

  // Fetch content client-side from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/skills/${skill.id}/content`);
        if (res.ok) {
          const text = await res.text();
          setContent(text);
        }
      } catch (error) {
        console.error("Failed to fetch skill content:", error);
      } finally {
        setContentLoading(false);
      }
    };
    fetchContent();
  }, [skill.id]);

  const copyContent = async () => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy content:", error);
    }
  };

  const typeColors: Record<string, string> = {
    analysis: "bg-blue-100 text-blue-700",
    generation: "bg-emerald-100 text-emerald-700",
    transformation: "bg-yellow-100 text-yellow-700",
    integration: "bg-purple-100 text-purple-700",
    utility: "bg-stone-100 text-stone-700",
  };

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            to="/explore/skills"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to skills
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {skill.name}
                  </h1>
                  {skill.isOfficial && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Official
                    </span>
                  )}
                  {skill.isFeatured && !skill.isOfficial && (
                    <Star className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {skill.description}
                </p>

                {/* Meta info */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className={`inline-flex items-center rounded-lg px-2 py-1 capitalize ${typeColors[skill.type] || typeColors.utility}`}>
                    {skill.type}
                  </span>
                  {skill.version && (
                    <span className="text-muted-foreground">
                      v{skill.version}
                    </span>
                  )}
                  {skill.author && (
                    <span className="text-muted-foreground">
                      by {skill.author}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-2">
              {skill.sourceUrl && (
                <a
                  href={skill.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Github className="h-4 w-4" />
                  Source
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Skill Content */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Zap className="h-5 w-5" />
                  Skill Content
                </h2>
                <button
                  onClick={copyContent}
                  disabled={!content || contentLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Skill
                    </>
                  )}
                </button>
              </div>

              {/* Content preview */}
              {contentLoading ? (
                <div className="h-64 animate-pulse rounded-lg bg-muted" />
              ) : content ? (
                <pre className="max-h-[600px] overflow-auto rounded-lg bg-muted p-4 text-sm">
                  <code className="text-muted-foreground whitespace-pre-wrap">
                    {content}
                  </code>
                </pre>
              ) : (
                <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                  Content not available
                </div>
              )}
            </div>

            {/* Requirements */}
            {((skill.requiredTools && skill.requiredTools.length > 0) || 
              (skill.requiredMcpServers && skill.requiredMcpServers.length > 0)) && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Requirements
                </h2>
                <div className="space-y-4">
                  {skill.requiredTools && skill.requiredTools.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-foreground">
                        Required Tools
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skill.requiredTools.map((tool: string) => (
                          <span
                            key={tool}
                            className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skill.requiredMcpServers && skill.requiredMcpServers.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-foreground">
                        Required MCP Servers
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skill.requiredMcpServers.map((server: string) => (
                          <Link
                            key={server}
                            to="/explore/servers/$serverId"
                            params={{ serverId: server }}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
                          >
                            {server}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick info */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Quick Info
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Format</dt>
                  <dd className="font-mono text-foreground uppercase">
                    {skill.format}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Installs</dt>
                  <dd className="flex items-center gap-1 text-foreground">
                    <Download className="h-4 w-4" />
                    {skill.installCount.toLocaleString()}
                  </dd>
                </div>
                {skill.rating !== null && (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Rating</dt>
                    <dd className="flex items-center gap-1 text-foreground">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {skill.rating}/5
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Updated</dt>
                  <dd className="text-foreground">
                    {new Date(skill.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Categories */}
            {skill.categories.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.categories.map((cat: string) => (
                    <span
                      key={cat}
                      className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground capitalize"
                    >
                      {cat.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {skill.tags.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Usage help */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                How to use
              </h3>
              <p className="text-sm text-muted-foreground">
                Copy this skill to your project&apos;s skill directory or ask your AI assistant:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                <code className="text-muted-foreground">
                  &quot;Help me install the {skill.name} skill&quot;
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton Component
// ============================================================================

function SkillDetailSkeleton() {
  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-4 w-32" />
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-6 w-20 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
