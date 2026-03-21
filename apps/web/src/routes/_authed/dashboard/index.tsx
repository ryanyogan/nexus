import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Key, Zap, CreditCard, ArrowRight, Copy, Check, ArrowUpRight, Layers } from "lucide-react";
import { authFetch } from "../../../lib/api";

export const Route = createFileRoute("/_authed/dashboard/")({
  component: DashboardPage,
});

interface DashboardStats {
  plan: "free" | "pro" | "team";
  mcpQueries: {
    used: number;
    limit: number | null;
    percentUsed: number;
  };
  apiKeys: {
    count: number;
    limit: number;
    keys: Array<{
      id: string;
      name: string;
      prefix: string;
      lastUsed: string | null;
    }>;
  };
  skills: {
    installed: number;
  };
  stacks: {
    count: number;
    recent: Array<{
      id: string;
      name: string;
      slug: string;
      icon: string | null;
      color: string | null;
    }>;
  };
  prompts: {
    count: number;
    recent: Array<{
      id: string;
      name: string;
      isActive: boolean;
    }>;
  };
}

function DashboardPage() {
  const { session } = Route.useRouteContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch dashboard stats
  useEffect(() => {
    if (session?.user) {
      void fetchStats();
    }
  }, [session]);

  async function fetchStats() {
    setLoading(true);
    try {
      // Fetch user stats, tokens, stacks, and prompts in parallel
      const [statsRes, tokensRes, stacksRes, promptsRes] = await Promise.all([
        authFetch("/api/user/stats"),
        authFetch("/api/user/tokens"),
        authFetch("/api/stacks?filter=my&limit=3"),
        authFetch("/api/prompts?filter=my&limit=3"),
      ]);

      const statsData = (statsRes.ok ? await statsRes.json() : {}) as any;
      const tokensData = (tokensRes.ok ? await tokensRes.json() : { tokens: [] }) as any;
      const stacksData = (stacksRes.ok ? await stacksRes.json() : { stacks: [], total: 0 }) as any;
      const promptsData = (
        promptsRes.ok ? await promptsRes.json() : { prompts: [], total: 0 }
      ) as any;

      setStats({
        plan: statsData.plan || "free",
        mcpQueries: {
          used: statsData.mcpQueries?.used || 0,
          limit: statsData.mcpQueries?.limit || 2000,
          percentUsed: statsData.mcpQueries?.percentUsed || 0,
        },
        apiKeys: {
          count: statsData.apiKeys?.count || 0,
          limit: statsData.apiKeys?.limit || 1,
          keys: (tokensData.tokens || []).slice(0, 3).map((t: any) => ({
            id: t.id,
            name: t.name,
            prefix: t.tokenPrefix,
            lastUsed: t.lastUsedAt,
          })),
        },
        skills: {
          installed: statsData.skills?.installed || 0,
        },
        stacks: {
          count: stacksData.total || stacksData.stacks?.length || 0,
          recent: (stacksData.stacks || []).slice(0, 3).map((s: any) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            icon: s.icon,
            color: s.color,
          })),
        },
        prompts: {
          count: promptsData.total || promptsData.prompts?.length || 0,
          recent: (promptsData.prompts || []).slice(0, 3).map((p: any) => ({
            id: p.id,
            name: p.name,
            isActive: p.isActive,
          })),
        },
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      // Fallback to defaults on error
      setStats({
        plan: "free",
        mcpQueries: { used: 0, limit: 2000, percentUsed: 0 },
        apiKeys: { count: 0, limit: 1, keys: [] },
        skills: { installed: 0 },
        stacks: { count: 0, recent: [] },
        prompts: { count: 0, recent: [] },
      });
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string, keyId: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
            Dashboard
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
            Welcome back, {session?.user?.name || session?.user?.email?.split("@")[0]}
          </p>
        </div>

        {/* Plan & Usage Stats */}
        <div className="grid grid-cols-1 gap-px bg-border border border-border md:grid-cols-3">
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
          <div className="flex items-center justify-between mb-4">
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
          <div className="flex items-center justify-between mb-4">
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
                  <span className="font-mono text-sm font-bold uppercase truncate">
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

        {/* My Flows Section */}
        <div className="mt-8 md:mt-12">
          <div className="flex items-center justify-between mb-4">
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
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent animate-pulse" />
                  )}
                  <Zap className="h-4 w-4 shrink-0 text-accent" />
                  <span className="font-mono text-sm font-bold uppercase truncate">
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
        <div className="mt-8 md:mt-12 grid grid-cols-1 gap-px bg-border border border-border sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/dashboard/keys"
            className="group bg-background p-4 sm:p-6 transition-colors hover:bg-muted/30"
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
            className="group bg-background p-4 sm:p-6 transition-colors hover:bg-muted/30"
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
            className="group bg-background p-4 sm:p-6 transition-colors hover:bg-muted/30"
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
            className="group bg-background p-4 sm:p-6 transition-colors hover:bg-muted/30"
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
          <div className="mt-8 md:mt-12 border border-accent p-6 sm:p-8">
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
