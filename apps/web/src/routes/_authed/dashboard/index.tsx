import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Key,
  Zap,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  Code,
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const planColors = {
    free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    pro: "bg-primary/10 text-primary",
    team: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Plan Banner */}
      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {stats?.plan === "free" ? "Free Plan" : stats?.plan === "pro" ? "Pro Plan" : "Team Plan"}
                </h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${planColors[stats?.plan || "free"]}`}>
                  {stats?.plan?.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {stats?.plan === "free" 
                  ? "Upgrade to Pro for unlimited API calls and more features"
                  : stats?.plan === "pro"
                    ? "You have access to all Pro features"
                    : "Team plan with shared resources"
                }
              </p>
            </div>
          </div>
          {stats?.plan === "free" && (
            <Link
              to="/dashboard/billing"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Upgrade to Pro
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* API Calls */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">
              {stats?.apiCalls.used.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {stats?.apiCalls.limit 
                ? `of ${stats.apiCalls.limit.toLocaleString()} API calls`
                : "API calls this month"
              }
            </p>
          </div>
          {stats?.apiCalls.limit && (
            <div className="mt-3">
              <div className="h-2 rounded-full bg-muted">
                <div 
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${Math.min(stats.apiCalls.percentUsed, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* API Keys */}
        <Link
          to="/dashboard/keys"
          className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Key className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">
              {stats?.apiKeys.count}
            </p>
            <p className="text-sm text-muted-foreground">
              of {stats?.apiKeys.limit} API keys
            </p>
          </div>
        </Link>

        {/* Installed Skills */}
        <Link
          to="/dashboard/skills"
          className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">
              {stats?.skills.installed}
            </p>
            <p className="text-sm text-muted-foreground">
              Installed skills
            </p>
          </div>
        </Link>

        {/* Billing */}
        <Link
          to="/dashboard/billing"
          className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-foreground">
              {stats?.plan === "free" ? "$0" : stats?.plan === "pro" ? "$5" : "$5+"}
            </p>
            <p className="text-sm text-muted-foreground">
              {stats?.plan === "free" ? "Free forever" : "per month"}
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/dashboard/keys"
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Create API Key</h3>
              <p className="text-sm text-muted-foreground">Generate a new API key for MCP access</p>
            </div>
          </Link>

          <Link
            to="/explore"
            search={{ tab: "skills" }}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Browse Skills</h3>
              <p className="text-sm text-muted-foreground">Discover AI agent skills</p>
            </div>
          </Link>

          <Link
            to="/settings/secrets"
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Manage Secrets</h3>
              <p className="text-sm text-muted-foreground">Store API keys securely</p>
            </div>
          </Link>

          <Link
            to="/code"
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
              <Code className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Code Editor</h3>
              <p className="text-sm text-muted-foreground">Connect to OpenCode remotely</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="rounded-lg border border-border bg-card">
            {stats.recentActivity.map((activity, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 ${
                  i !== stats.recentActivity.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No recent activity. Start using Nexus to see your activity here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
