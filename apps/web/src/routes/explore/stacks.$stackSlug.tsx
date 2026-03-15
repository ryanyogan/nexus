import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";
import { eq, or, and } from "drizzle-orm";
import {
  ArrowLeft,
  Layers,
  Copy,
  Check,
  GitFork,
  Activity,
  Tag,
  Clock,
  User,
  Star,
  Cloud,
  Triangle,
  Database,
  Flame,
  Zap,
  Cog,
  Box,
  Gem,
  Bird,
  Monitor,
  Palette,
  Component,
  Terminal,
  TestTube,
} from "lucide-react";
import { logger } from "../../lib/server-fn";

// ============================================================================
// Types
// ============================================================================

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
  instructions: string | null;
  tokenBudget: string;
  tokenCount: number | null;
  compiledPrompt: string | null;
  learningStatus: string;
  useCount: number;
  forkCount: number;
  isStarter: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
}

// ============================================================================
// Server Functions
// ============================================================================

const getPublicStack = createServerFn({ method: "GET" })
  .inputValidator((d: { stackSlug: string }) => d)
  .handler(async ({ data }) => {
    const startTime = Date.now();
    const fnName = "getPublicStack";

    try {
      logger.debug(`${fnName} started`, { stackSlug: data.stackSlug });

      const db = drizzle(env.DB, { schema });

      // Find stack by ID or slug - must be public or starter
      const stack = await db
        .select({
          id: schema.stacks.id,
          name: schema.stacks.name,
          slug: schema.stacks.slug,
          description: schema.stacks.description,
          icon: schema.stacks.icon,
          color: schema.stacks.color,
          category: schema.stacks.category,
          layer: schema.stacks.layer,
          tags: schema.stacks.tags,
          instructions: schema.stacks.instructions,
          tokenBudget: schema.stacks.tokenBudget,
          tokenCount: schema.stacks.tokenCount,
          compiledPrompt: schema.stacks.compiledPrompt,
          learningStatus: schema.stacks.learningStatus,
          useCount: schema.stacks.useCount,
          forkCount: schema.stacks.forkCount,
          isStarter: schema.stacks.isStarter,
          isFeatured: schema.stacks.isFeatured,
          createdAt: schema.stacks.createdAt,
          updatedAt: schema.stacks.updatedAt,
          userId: schema.stacks.userId,
        })
        .from(schema.stacks)
        .where(
          and(
            or(eq(schema.stacks.id, data.stackSlug), eq(schema.stacks.slug, data.stackSlug)),
            eq(schema.stacks.isActive, true),
            or(eq(schema.stacks.isPublic, true), eq(schema.stacks.isStarter, true))
          )
        )
        .get();

      if (!stack) {
        throw new Error("Stack not found");
      }

      // Get user info if stack has an owner
      let user = null;
      if (stack.userId) {
        const userResult = await db
          .select({
            id: schema.users.id,
            name: schema.users.name,
            image: schema.users.image,
          })
          .from(schema.users)
          .where(eq(schema.users.id, stack.userId))
          .get();
        user = userResult || null;
      }

      const durationMs = Date.now() - startTime;
      logger.info(`${fnName} completed`, { durationMs, stackSlug: data.stackSlug });

      return {
        stack: {
          ...stack,
          user,
        } as Stack,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`${fnName} failed`, { durationMs, stackSlug: data.stackSlug }, err);
      throw error;
    }
  });

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore/stacks/$stackSlug")({
  loader: async ({ params }) => {
    return getPublicStack({ data: { stackSlug: params.stackSlug } });
  },
  component: StackDetailPage,
  errorComponent: StackNotFound,
});

function StackNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 py-16 text-center sm:px-6 lg:px-0">
        <Layers className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-mono text-xl font-bold uppercase tracking-tight">
          Stack Not Found
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          This stack doesn't exist or is not publicly available.
        </p>
        <Link
          to="/"
          search={{ filter: "stacks" }}
          className="mt-6 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-accent hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse Stacks
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Helper: Get Stack Icon
// ============================================================================

function getStackIcon(iconName: string | null, className: string) {
  switch (iconName) {
    case "cloud": return <Cloud className={className} />;
    case "triangle": return <Triangle className={className} />;
    case "database": return <Database className={className} />;
    case "flame": return <Flame className={className} />;
    case "zap": return <Zap className={className} />;
    case "cog": return <Cog className={className} />;
    case "layers": return <Layers className={className} />;
    case "box": return <Box className={className} />;
    case "gem": return <Gem className={className} />;
    case "bird": return <Bird className={className} />;
    case "monitor": return <Monitor className={className} />;
    case "palette": return <Palette className={className} />;
    case "component": return <Component className={className} />;
    case "terminal": return <Terminal className={className} />;
    case "test-tube": return <TestTube className={className} />;
    default: return <Layers className={className} />;
  }
}

// ============================================================================
// Main Component
// ============================================================================

function StackDetailPage() {
  const { stack } = Route.useLoaderData();
  const [copied, setCopied] = useState<"name" | "prompt" | null>(null);

  const copyToClipboard = async (text: string, type: "name" | "prompt") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getLayerLabel = (layer: number) => {
    switch (layer) {
      case 0:
        return "Infrastructure";
      case 1:
        return "Backend";
      case 2:
        return "Frontend";
      case 3:
        return "Tooling";
      default:
        return "General";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="pt-8 md:pt-12">
          <Link
            to="/"
            search={{ filter: "stacks" }}
            className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stacks
          </Link>
        </div>

        {/* Stack Info */}
        <div className="mt-8 border border-border bg-background p-6 md:p-8">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center text-lg md:h-16 md:w-16"
              style={{
                backgroundColor: stack.color || "var(--color-accent)",
                color: "white",
              }}
            >
              {getStackIcon(stack.icon, "h-6 w-6 md:h-8 md:w-8")}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-mono text-lg font-bold uppercase tracking-tight md:text-xl">
                  {stack.name}
                </h1>
                {stack.isStarter && (
                  <span className="border border-accent bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                    Starter
                  </span>
                )}
                {stack.isFeatured && (
                  <span className="border border-amber-500 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-500">
                    <Star className="mr-1 inline h-3 w-3" />
                    Featured
                  </span>
                )}
              </div>

              {stack.description && (
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  {stack.description}
                </p>
              )}

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {getCategoryLabel(stack.category)}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Layer {stack.layer}: {getLayerLabel(stack.layer)}
                </span>
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {stack.useCount} uses
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="h-3 w-3" />
                  {stack.forkCount} forks
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Updated {formatDate(stack.updatedAt)}
                </span>
              </div>

              {/* Tags */}
              {stack.tags && stack.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {stack.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Author */}
              {stack.user && (
                <div className="mt-4 flex items-center gap-2">
                  {stack.user.image ? (
                    <img
                      src={stack.user.image}
                      alt={stack.user.name || "Author"}
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-mono text-xs text-muted-foreground">
                    by {stack.user.name || "Anonymous"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-6">
            <button
              onClick={() => copyToClipboard(stack.slug, "name")}
              className="flex items-center gap-2 border border-border px-3 py-2 font-mono text-xs font-bold uppercase transition-colors hover:bg-muted"
            >
              {copied === "name" ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy Slug
            </button>

            {stack.compiledPrompt && stack.learningStatus === "complete" && (
              <button
                onClick={() => copyToClipboard(stack.compiledPrompt!, "prompt")}
                className="flex items-center gap-2 border border-accent bg-accent px-3 py-2 font-mono text-xs font-bold uppercase text-accent-foreground transition-colors hover:bg-accent/90"
              >
                {copied === "prompt" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy Prompt
              </button>
            )}

            <Link
              to="/sign-in"
              search={{ redirect: `/explore/stacks/${stack.slug}` }}
              className="flex items-center gap-2 border border-border px-3 py-2 font-mono text-xs font-bold uppercase transition-colors hover:bg-muted"
            >
              <GitFork className="h-4 w-4" />
              Fork Stack
            </Link>
          </div>
        </div>

        {/* Token Budget & Status */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="border border-border bg-background p-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Token Budget
            </div>
            <div className="mt-1 font-mono text-lg font-bold uppercase">
              {stack.tokenBudget}
            </div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              {stack.tokenCount ? `~${stack.tokenCount.toLocaleString()} tokens` : "Not compiled"}
            </div>
          </div>

          <div className="border border-border bg-background p-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Status
            </div>
            <div
              className={`mt-1 font-mono text-lg font-bold uppercase ${
                stack.learningStatus === "complete"
                  ? "text-green-500"
                  : stack.learningStatus === "failed"
                  ? "text-red-500"
                  : "text-amber-500"
              }`}
            >
              {stack.learningStatus}
            </div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              {stack.learningStatus === "complete"
                ? "Ready to use"
                : stack.learningStatus === "failed"
                ? "Compilation failed"
                : "Processing..."}
            </div>
          </div>

          <div className="border border-border bg-background p-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              MCP Tool
            </div>
            <div className="mt-1 font-mono text-sm font-bold">
              get-stack
            </div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              Use with stackId: "{stack.slug}"
            </div>
          </div>
        </div>

        {/* Instructions Preview */}
        {stack.instructions && (
          <div className="mt-6 border border-border bg-background">
            <div className="border-b border-border px-4 py-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wide">
                Instructions Preview
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                {stack.instructions.slice(0, 2000)}
                {stack.instructions.length > 2000 && "\n\n... (truncated)"}
              </pre>
            </div>
          </div>
        )}

        {/* Compiled Prompt Preview */}
        {stack.compiledPrompt && stack.learningStatus === "complete" && (
          <div className="mt-6 border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wide">
                Compiled Prompt Preview
              </span>
              <button
                onClick={() => copyToClipboard(stack.compiledPrompt!, "prompt")}
                className="flex items-center gap-1 font-mono text-[10px] uppercase text-muted-foreground transition-colors hover:text-foreground"
              >
                {copied === "prompt" ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                Copy All
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                {stack.compiledPrompt.slice(0, 5000)}
                {stack.compiledPrompt.length > 5000 && "\n\n... (truncated)"}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-border py-8">
          <Link
            to="/"
            search={{ filter: "stacks" }}
            className="font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Browse More Stacks
          </Link>
        </div>
      </div>
    </div>
  );
}
