import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Key, Zap, CreditCard, ArrowRight, Copy, Check, ArrowUpRight, Layers } from "lucide-react";
import { useDashboardStats } from "../../../hooks/use-dashboard-queries";

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/_authed/dashboard/")({
  component: DashboardPage,
});

// ============================================================================
// Loading Skeleton
// ============================================================================

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="pb-6 pt-8 md:pb-8 md:pt-12">
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-background p-4 sm:p-6">
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-8 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-1 h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>

        {/* Sections */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="mt-8 md:mt-12">
            <div className="mb-4 flex items-center justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-32 animate-pulse rounded border border-border bg-muted/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function DashboardPage() {
  const { session } = Route.useRouteContext();
  const { data: stats, isPending } = useDashboardStats();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyId: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isPending) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="pb-6 pt-8 md:pb-8 md:pt-12">
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
            Welcome back, {session?.user?.name || session?.user?.email?.split("@")[0]}
          </p>
        </div>

        {/* Plan & Usage Stats */}
        <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
          {/* Plan Status */}
          <div className="bg-background p-4 sm:p-6">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Plan
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-foreground sm:text-3xl">
                {stats?.plan === "free" ? "Free" : stats?.plan === "pro" ? "Pro" : "Team"}
              </span>
              {stats?.plan === "free" && (
                <Link
                  to="/dashboard/billing"
                  className="font-mono text-xs font-bold uppercase text-accent hover:underline"
                >
                  Upgrade
                </Link>
              )}
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {stats?.plan === "free" ? "2,000 API calls/month" : "Unlimited API calls"}
            </p>
          </div>

          {/* API Calls */}
          <div className="bg-background p-4 sm:p-6">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              MCP Queries
            </span>
            <div className="mt-2">
              <span className="font-mono text-2xl font-bold text-foreground sm:text-3xl">
                {stats?.mcpQueries.used.toLocaleString()}
              </span>
              {stats?.mcpQueries.limit && (
                <span className="font-mono text-sm text-muted-foreground">
                  {" "}
                  / {stats.mcpQueries.limit.toLocaleString()}
                </span>
              )}
            </div>
            {stats?.mcpQueries.limit && (
              <div className="mt-2 h-1 w-full bg-border">
                <div
                  className="h-1 bg-accent transition-all"
                  style={{ width: `${Math.min(stats.mcpQueries.percentUsed, 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* API Keys */}
          <div className="bg-background p-4 sm:p-6">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              API Keys
            </span>
            <div className="mt-2">
              <span className="font-mono text-2xl font-bold text-foreground sm:text-3xl">
                {stats?.apiKeys.count}
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                {" "}
                / {stats?.apiKeys.limit}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {stats?.plan === "free" ? "1 key included" : "10 keys included"}
            </p>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="mt-8 md:mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              API Keys
            </h2>
            <Link
              to="/dashboard/keys"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-accent hover:underline"
            >
              Manage Keys
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats?.apiKeys.keys && stats.apiKeys.keys.length > 0 ? (
            <div className="border border-border">
              {stats.apiKeys.keys.map((key, idx) => (
                <div
                  key={key.id}
                  className={`flex items-center justify-between p-4 ${
                    idx !== stats.apiKeys.keys.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-mono text-sm font-bold text-foreground">{key.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {key.prefix}••••••••
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(key.prefix, key.id)}
                    className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copiedKey === key.id ? (
                      <Check className="h-4 w-4 text-accent" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border p-8 text-center">
              <Key className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-mono text-sm text-muted-foreground">No API keys yet</p>
              <Link
                to="/dashboard/keys"
                className="mt-4 inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-foreground/90"
              >
                Create Your First Key
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* My Stacks Section */}
        <div className="mt-8 md:mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              My Stacks
            </h2>
            <Link
              to="/dashboard/stacks"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-accent hover:underline"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats?.stacks.recent && stats.stacks.recent.length > 0 ? (
            <div className="border border-border">
              {stats.stacks.recent.map((stack, idx) => (
                <Link
                  key={stack.id}
                  to="/dashboard/stacks/$stackId"
                  params={{ stackId: stack.id }}
                  className={`flex items-center gap-3 p-4 transition-colors hover:bg-muted/30 ${
                    idx !== stats.stacks.recent.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center"
                    style={{
                      backgroundColor: stack.color || "var(--color-accent)",
                      color: "white",
                    }}
                  >
                    <Layers className="h-4 w-4" />
                  </div>
                  <span className="truncate font-mono text-sm font-bold uppercase">
                    {stack.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border p-8 text-center">
              <Layers className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-mono text-sm text-muted-foreground">No stacks yet</p>
              <Link
                to="/dashboard/stacks/new"
                className="mt-4 inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-foreground/90"
              >
                Create Your First Stack
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* My Prompts Section */}
        <div className="mt-8 md:mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              My Prompts
            </h2>
            <Link
              to="/dashboard/prompts"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase text-accent hover:underline"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {stats?.prompts.recent && stats.prompts.recent.length > 0 ? (
            <div className="border border-border">
              {stats.prompts.recent.map((prompt, idx) => (
                <Link
                  key={prompt.id}
                  to="/dashboard/prompts/$promptId"
                  params={{ promptId: prompt.id }}
                  className={`flex items-center gap-3 p-4 transition-colors hover:bg-muted/30 ${
                    idx !== stats.prompts.recent.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  {prompt.isActive && (
                    <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" />
                  )}
                  <Zap className="h-4 w-4 shrink-0 text-accent" />
                  <span className="truncate font-mono text-sm font-bold uppercase">
                    {prompt.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border p-8 text-center">
              <Zap className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 font-mono text-sm text-muted-foreground">No prompts yet</p>
              <Link
                to="/dashboard/prompts/new"
                className="mt-4 inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-foreground/90"
              >
                Create Your First Prompt
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          <Link
            to="/dashboard/keys"
            className="group bg-background p-4 transition-colors hover:bg-muted/30 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <Key className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                API Keys
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Create and manage API keys
            </p>
          </Link>

          <Link
            to="/dashboard/stacks"
            className="group bg-background p-4 transition-colors hover:bg-muted/30 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Stacks
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              AI project scaffolding templates
            </p>
          </Link>

          <Link
            to="/dashboard/prompts"
            className="group bg-background p-4 transition-colors hover:bg-muted/30 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Prompts
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              AI coding preferences and context
            </p>
          </Link>

          <Link
            to="/dashboard/billing"
            className="group bg-background p-4 transition-colors hover:bg-muted/30 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Billing
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Manage subscription and payment
            </p>
          </Link>
        </div>

        {/* Upgrade Banner (for free users) */}
        {stats?.plan === "free" && (
          <div className="mt-8 border border-accent p-6 sm:p-8 md:mt-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                  Upgrade to Pro
                </h2>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Unlimited API calls, 10 keys, persistent memory, and more
                </p>
              </div>
              <Link
                to="/dashboard/billing"
                className="inline-flex items-center justify-center gap-2 bg-accent px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-accent/90"
              >
                Upgrade — $5/mo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-8 border-t border-border pb-8 pt-6 md:mt-12 md:pb-12 md:pt-8">
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs uppercase">
            <a
              href="https://docs.nexus.yogan.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent"
            >
              Docs
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <span className="text-border">|</span>
            <a
              href="https://github.com/ryanyogan/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent"
            >
              GitHub
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <span className="text-border">|</span>
            <a
              href="mailto:hello@nexus.yogan.dev"
              className="text-muted-foreground transition-colors hover:text-accent"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
