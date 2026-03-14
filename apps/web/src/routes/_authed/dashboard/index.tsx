import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Key,
  Zap,
  CreditCard,
  ArrowRight,
  Clock,
  Lock,
  Database,
  Brain,
  Folder,
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
  };
  skills: {
    installed: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

function DashboardPage() {
  const { session } = Route.useRouteContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

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
        },
        skills: {
          installed: 0,
        },
        recentActivity: [],
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-8">
        <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Plan Banner */}
      <div className="mb-8 border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-sm font-bold uppercase text-foreground">
                {stats?.plan === "free" ? "Free Plan" : stats?.plan === "pro" ? "Pro Plan" : "Team Plan"}
              </h2>
              <span className="border border-border px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                {stats?.plan?.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {stats?.plan === "free" 
                ? "Upgrade to Pro for unlimited API calls"
                : stats?.plan === "pro"
                  ? "You have access to all Pro features"
                  : "Team plan with shared resources"
              }
            </p>
          </div>
          {stats?.plan === "free" && (
            <Link
              to="/dashboard/billing"
              className="inline-flex items-center gap-2 border border-accent bg-accent px-4 py-2 font-mono text-xs font-bold uppercase text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Upgrade
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* API Calls */}
        <div className="border border-border p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
              API Calls
            </span>
          </div>
          <div className="mt-3">
            <p className="font-mono text-2xl font-bold text-foreground">
              {stats?.apiCalls.used.toLocaleString()}
            </p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">
              {stats?.apiCalls.limit 
                ? `of ${stats.apiCalls.limit.toLocaleString()}`
                : "this month"
              }
            </p>
          </div>
          {stats?.apiCalls.limit && (
            <div className="mt-3">
              <div className="h-1 bg-muted">
                <div 
                  className="h-1 bg-accent"
                  style={{ width: `${Math.min(stats.apiCalls.percentUsed, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* API Keys */}
        <Link
          to="/dashboard/keys"
          className="border border-border p-4 transition-colors hover:border-foreground"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                API Keys
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-3">
            <p className="font-mono text-2xl font-bold text-foreground">
              {stats?.apiKeys.count}
            </p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">
              of {stats?.apiKeys.limit}
            </p>
          </div>
        </Link>

        {/* Installed Skills */}
        <Link
          to="/dashboard/skills"
          className="border border-border p-4 transition-colors hover:border-foreground"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                Skills
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-3">
            <p className="font-mono text-2xl font-bold text-foreground">
              {stats?.skills.installed}
            </p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">
              installed
            </p>
          </div>
        </Link>

        {/* Billing */}
        <Link
          to="/dashboard/billing"
          className="border border-border p-4 transition-colors hover:border-foreground"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-[10px] font-bold uppercase text-muted-foreground">
                Billing
              </span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-3">
            <p className="font-mono text-2xl font-bold text-foreground">
              {stats?.plan === "free" ? "$0" : stats?.plan === "pro" ? "$5" : "$5+"}
            </p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">
              {stats?.plan === "free" ? "free" : "/month"}
            </p>
          </div>
        </Link>
      </div>

      {/* Pro Features - Coming Soon */}
      <div className="mb-8">
        <h2 className="mb-4 font-mono text-sm font-bold uppercase text-foreground">
          Pro Features
          <span className="ml-2 border border-accent bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent">
            Coming Soon
          </span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Private Repos */}
          <div className="border border-dashed border-border p-4 opacity-60">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs font-bold uppercase text-foreground">
                Private Repos
              </span>
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              Index and query your private GitHub repositories
            </p>
          </div>

          {/* Private Skills */}
          <div className="border border-dashed border-border p-4 opacity-60">
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs font-bold uppercase text-foreground">
                Private Skills
              </span>
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              Create and manage private AI agent skills
            </p>
          </div>

          {/* Expanded Memories */}
          <div className="border border-dashed border-border p-4 opacity-60">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-xs font-bold uppercase text-foreground">
                Expanded Memories
              </span>
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              10x more memory storage for your AI context
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="mb-4 font-mono text-sm font-bold uppercase text-foreground">
          Quick Links
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/dashboard/keys"
            className="inline-flex items-center gap-2 border border-border px-4 py-2 font-mono text-xs uppercase text-foreground transition-colors hover:border-foreground"
          >
            <Key className="h-3.5 w-3.5" />
            API Keys
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 border border-border px-4 py-2 font-mono text-xs uppercase text-foreground transition-colors hover:border-foreground"
          >
            <Zap className="h-3.5 w-3.5 text-accent" />
            Browse Content
          </Link>
          <Link
            to="/dashboard/billing"
            className="inline-flex items-center gap-2 border border-border px-4 py-2 font-mono text-xs uppercase text-foreground transition-colors hover:border-foreground"
          >
            <CreditCard className="h-3.5 w-3.5" />
            Billing
          </Link>
          <a
            href="https://docs.nexus.yogan.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-border px-4 py-2 font-mono text-xs uppercase text-foreground transition-colors hover:border-foreground"
          >
            <Database className="h-3.5 w-3.5" />
            Docs
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 font-mono text-sm font-bold uppercase text-foreground">
          Recent Activity
        </h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="border border-border">
            {stats.recentActivity.map((activity, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 ${
                  i !== stats.recentActivity.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-mono text-xs text-foreground">{activity.description}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-border p-8 text-center">
            <Clock className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              No recent activity
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
