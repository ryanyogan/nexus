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
  FileText,
  Clock,
  User,
  CheckCircle,
  Server,
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
// Type Config
// ============================================================================

const typeConfig: Record<string, { color: string; label: string }> = {
  analysis: {
    color: "text-blue-500",
    label: "Analysis",
  },
  generation: {
    color: "text-emerald-500",
    label: "Generation",
  },
  transformation: {
    color: "text-yellow-500",
    label: "Transformation",
  },
  integration: {
    color: "text-purple-500",
    label: "Integration",
  },
  utility: {
    color: "text-stone-500",
    label: "Utility",
  },
};

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

  const typeInfo = typeConfig[skill.type] || typeConfig.utility;

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
            <div className="flex h-16 w-16 items-center justify-center border border-border bg-muted">
              <Zap className="h-8 w-8 text-accent" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-foreground">
                  {skill.name}
                </h1>
                {skill.isOfficial && (
                  <span className="inline-flex items-center gap-1 border border-accent bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                    <CheckCircle className="h-3 w-3" />
                    Official
                  </span>
                )}
                {skill.isFeatured && !skill.isOfficial && (
                  <span className="inline-flex items-center gap-1 border border-yellow-500 bg-yellow-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-yellow-500">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                )}
                {skill.isVerified && (
                  <span className="inline-flex items-center gap-1 border border-green-500 bg-green-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-green-500">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              
              {skill.description && (
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  {skill.description}
                </p>
              )}

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs">
                <span className={`font-bold uppercase ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
                {skill.version && (
                  <>
                    <span className="text-border">|</span>
                    <span className="text-muted-foreground">v{skill.version}</span>
                  </>
                )}
                {skill.author && (
                  <>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      {skill.author}
                    </span>
                  </>
                )}
                <span className="text-border">|</span>
                <span className="uppercase text-muted-foreground">{skill.format}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={copyContent}
              disabled={!content || contentLoading}
              className="inline-flex items-center gap-2 border border-accent bg-accent px-4 py-2 font-mono text-xs font-bold uppercase text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Skill
                </>
              )}
            </button>
            {skill.sourceUrl && (
              <a
                href={skill.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:bg-muted"
              >
                <Github className="h-3.5 w-3.5" />
                Source
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-bold text-foreground">{skill.installCount.toLocaleString()}</span>
            <span className="uppercase text-muted-foreground">installs</span>
          </div>
          {skill.rating !== null && (
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-yellow-500" />
              <span className="font-bold text-foreground">{skill.rating}</span>
              <span className="uppercase text-muted-foreground">/ 5</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="uppercase text-muted-foreground">
              Updated {new Date(skill.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Skill Content */}
            <div className="border border-border p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-mono text-sm font-bold uppercase text-foreground">
                  <FileText className="h-4 w-4 text-accent" />
                  Content
                </h2>
                <button
                  onClick={copyContent}
                  disabled={!content || contentLoading}
                  className="inline-flex items-center gap-2 border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-accent" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Content preview */}
              {contentLoading ? (
                <div className="h-64 animate-pulse border border-border bg-muted" />
              ) : content ? (
                <pre className="max-h-[600px] overflow-auto border border-border bg-muted p-4 font-mono text-xs">
                  <code className="whitespace-pre-wrap text-foreground">
                    {content}
                  </code>
                </pre>
              ) : (
                <div className="flex h-32 items-center justify-center border border-border bg-muted font-mono text-xs uppercase text-muted-foreground">
                  Content not available
                </div>
              )}
            </div>

            {/* Requirements */}
            {((skill.requiredTools && skill.requiredTools.length > 0) || 
              (skill.requiredMcpServers && skill.requiredMcpServers.length > 0)) && (
              <div className="border border-border p-6">
                <h2 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase text-foreground">
                  <Server className="h-4 w-4 text-accent" />
                  Requirements
                </h2>
                <div className="space-y-6">
                  {skill.requiredTools && skill.requiredTools.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-mono text-xs font-bold uppercase text-muted-foreground">
                        Required Tools
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skill.requiredTools.map((tool: string) => (
                          <span
                            key={tool}
                            className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skill.requiredMcpServers && skill.requiredMcpServers.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-mono text-xs font-bold uppercase text-muted-foreground">
                        Required MCP Servers
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {skill.requiredMcpServers.map((server: string) => (
                          <Link
                            key={server}
                            to="/explore/servers/$serverId"
                            params={{ serverId: server }}
                            className="inline-flex items-center gap-1.5 border border-accent bg-accent/10 px-2 py-1 font-mono text-[10px] uppercase text-accent transition-colors hover:bg-accent/20"
                          >
                            <Server className="h-3 w-3" />
                            {server}
                            <ExternalLink className="h-2.5 w-2.5" />
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
            {/* Ask AI card */}
            <div className="border border-accent bg-accent/5 p-6">
              <h3 className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase text-foreground">
                <Zap className="h-3.5 w-3.5 text-accent" />
                Quick Install
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                Ask your AI assistant to install this skill:
              </p>
              <pre className="mt-3 overflow-x-auto border border-border bg-background p-3 font-mono text-[10px]">
                <code className="text-foreground">
                  "Install the {skill.name} skill"
                </code>
              </pre>
            </div>

            {/* Quick info */}
            <div className="border border-border p-6">
              <h3 className="mb-4 font-mono text-xs font-bold uppercase text-foreground">
                Details
              </h3>
              <dl className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <dt className="uppercase text-muted-foreground">Type</dt>
                  <dd className={`font-bold uppercase ${typeInfo.color}`}>
                    {typeInfo.label}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="uppercase text-muted-foreground">Format</dt>
                  <dd className="uppercase text-foreground">
                    {skill.format}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="uppercase text-muted-foreground">Installs</dt>
                  <dd className="flex items-center gap-1 text-foreground">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    {skill.installCount.toLocaleString()}
                  </dd>
                </div>
                {skill.rating !== null && (
                  <div className="flex items-center justify-between">
                    <dt className="uppercase text-muted-foreground">Rating</dt>
                    <dd className="flex items-center gap-1 text-foreground">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      {skill.rating}/5
                    </dd>
                  </div>
                )}
                {skill.version && (
                  <div className="flex items-center justify-between">
                    <dt className="uppercase text-muted-foreground">Version</dt>
                    <dd className="text-foreground">
                      {skill.version}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="uppercase text-muted-foreground">Updated</dt>
                  <dd className="text-foreground">
                    {new Date(skill.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Categories */}
            {skill.categories.length > 0 && (
              <div className="border border-border p-6">
                <h3 className="mb-4 font-mono text-xs font-bold uppercase text-foreground">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.categories.map((cat: string) => (
                    <span
                      key={cat}
                      className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground"
                    >
                      {cat.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {skill.tags.length > 0 && (
              <div className="border border-border p-6">
                <h3 className="mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase text-foreground">
                  <Tag className="h-3.5 w-3.5 text-accent" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="border border-accent/30 bg-accent/5 px-2 py-1 font-mono text-[10px] text-accent"
                    >
                      #{tag}
                    </span>
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

// ============================================================================
// Skeleton Component
// ============================================================================

function SkillDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-8 h-4 w-16" />
        
        <div className="mb-8 border-b border-border pb-8">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16" />
            <div className="flex-1">
              <Skeleton className="mb-3 h-8 w-48" />
              <Skeleton className="h-4 w-96" />
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8 flex gap-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
