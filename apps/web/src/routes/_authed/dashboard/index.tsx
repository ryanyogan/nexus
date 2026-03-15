import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Key,
  Zap,
  CreditCard,
  ArrowRight,
  Copy,
  Check,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/_authed/dashboard/")({
  component: DashboardPage,
});

interface DashboardStats {
  plan: "free" | "pro" | "team";
  apiCalls: {
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
}

function DashboardPage() {
  const { session } = Route.useRouteContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Fetch dashboard stats
  useEffect(() => {
    if (session?.user) {
      fetchStats();
    }
  }, [session]);

  async function fetchStats() {
    setLoading(true);
    try {
      // For now, return mock data - we'll add the API endpoint later
      setStats({
        plan: "free",
        apiCalls: {
          used: 0,
          limit: 2000,
          percentUsed: 0,
        },
        apiKeys: {
          count: 0,
          limit: 1,
          keys: [],
        },
        skills: {
          installed: 0,
        },
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
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
              {stats?.plan === "free"
                ? "2,000 API calls/month"
                : "Unlimited API calls"}
            </p>
          </div>

          {/* API Calls */}
          <div className="bg-background p-4 sm:p-6">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
              API Calls
            </span>
            <div className="mt-2">
              <span className="font-mono text-2xl font-bold text-foreground sm:text-3xl">
                {stats?.apiCalls.used.toLocaleString()}
              </span>
              {stats?.apiCalls.limit && (
                <span className="font-mono text-sm text-muted-foreground">
                  {" "}/ {stats.apiCalls.limit.toLocaleString()}
                </span>
              )}
            </div>
            {stats?.apiCalls.limit && (
              <div className="mt-2 h-1 w-full bg-border">
                <div
                  className="h-1 bg-accent transition-all"
                  style={{ width: `${Math.min(stats.apiCalls.percentUsed, 100)}%` }}
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
                {" "}/ {stats?.apiKeys.limit}
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
                      <p className="font-mono text-sm font-bold text-foreground">
                        {key.name}
                      </p>
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
              <p className="mt-3 font-mono text-sm text-muted-foreground">
                No API keys yet
              </p>
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

        {/* Quick Actions */}
        <div className="mt-8 md:mt-12 grid grid-cols-1 gap-px bg-border border border-border sm:grid-cols-3">
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
              Create and manage API keys for your integrations
            </p>
          </Link>

          <Link
            to="/"
            className="group bg-background p-4 sm:p-6 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                Browse Content
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Explore docs, servers, and skills
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
              Manage your subscription and payment
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
