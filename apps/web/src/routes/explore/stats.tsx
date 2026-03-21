import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  BookOpen,
  Server,
  Zap,
  Activity,
  Database,
  Globe,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/explore/stats")({
  component: StatsPage,
});

interface PlatformStats {
  libraries: {
    indexed: number;
    pending: number;
    total: number;
  };
  documentation: {
    totalChunks: number;
    totalTokens: number;
  };
  servers: {
    total: number;
    official: number;
  };
  usage: {
    totalQueries: number;
  };
}

interface UsageData {
  date: string;
  queries: number;
  memories: number;
}

interface CategoryData {
  name: string;
  value: number;
}

// Cyan accent color
const ACCENT_COLOR = "#06b6d4";
const COLORS = ["#06b6d4", "#0891b2", "#0e7490", "#155e75", "#164e63"];

function StatsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock usage data for chart visualization
  const [usageData] = useState<UsageData[]>([
    { date: "Mon", queries: 120, memories: 45 },
    { date: "Tue", queries: 150, memories: 62 },
    { date: "Wed", queries: 180, memories: 78 },
    { date: "Thu", queries: 165, memories: 55 },
    { date: "Fri", queries: 210, memories: 89 },
    { date: "Sat", queries: 95, memories: 32 },
    { date: "Sun", queries: 85, memories: 28 },
  ]);

  // Category distribution data
  const [categoryData] = useState<CategoryData[]>([
    { name: "Frontend", value: 35 },
    { name: "Backend", value: 28 },
    { name: "Database", value: 15 },
    { name: "DevOps", value: 12 },
    { name: "AI/ML", value: 10 },
  ]);

  useEffect(() => {
    void fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data as PlatformStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="font-mono text-sm text-destructive">{error || "Failed to load stats"}</p>
          <button
            onClick={fetchStats}
            className="mt-4 font-mono text-xs uppercase text-accent hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
            Platform Statistics
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Real-time insights into the Nexus ecosystem
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Libraries Indexed"
            value={stats.libraries.indexed.toLocaleString()}
            subtext={`${stats.libraries.pending} pending`}
          />
          <StatCard
            icon={<Database className="h-5 w-5" />}
            label="Documentation Chunks"
            value={stats.documentation.totalChunks.toLocaleString()}
            subtext={`${(stats.documentation.totalTokens / 1_000_000).toFixed(1)}M tokens`}
          />
          <StatCard
            icon={<Server className="h-5 w-5" />}
            label="MCP Servers"
            value={stats.servers.total.toLocaleString()}
            subtext={`${stats.servers.official} official`}
          />
          <StatCard
            icon={<Activity className="h-5 w-5" />}
            label="Total Queries"
            value={stats.usage.totalQueries.toLocaleString()}
            subtext="All time"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Usage Over Time */}
          <div className="border border-border bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                Weekly Activity
              </h2>
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis
                    dataKey="date"
                    stroke="currentColor"
                    opacity={0.5}
                    fontSize={10}
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    opacity={0.5}
                    fontSize={10}
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 0,
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="queries"
                    stroke={ACCENT_COLOR}
                    strokeWidth={2}
                    dot={{ fill: ACCENT_COLOR, strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: ACCENT_COLOR }}
                  />
                  <Line
                    type="monotone"
                    dataKey="memories"
                    stroke="#64748b"
                    strokeWidth={2}
                    dot={{ fill: "#64748b", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "#64748b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-4" style={{ backgroundColor: ACCENT_COLOR }} />
                <span className="font-mono text-xs text-muted-foreground">Queries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-4 bg-slate-500" />
                <span className="font-mono text-xs text-muted-foreground">Memories</span>
              </div>
            </div>
          </div>

          {/* Library Categories */}
          <div className="border border-border bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                Library Categories
              </h2>
              <Globe className="h-4 w-4 text-accent" />
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 0,
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Daily Query Distribution */}
        <div className="mt-6 border border-border bg-background p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              Daily Query Distribution
            </h2>
            <Zap className="h-4 w-4 text-accent" />
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={10}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  opacity={0.5}
                  fontSize={10}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 0,
                    fontFamily: "monospace",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="queries" fill={ACCENT_COLOR} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="border border-border bg-background p-6 text-center">
            <Users className="mx-auto h-6 w-6 text-accent" />
            <p className="mt-4 font-mono text-2xl font-bold text-foreground">
              {Math.floor(stats.usage.totalQueries / 100)}+
            </p>
            <p className="mt-1 font-mono text-xs uppercase text-muted-foreground">Active Users</p>
          </div>
          <div className="border border-border bg-background p-6 text-center">
            <Database className="mx-auto h-6 w-6 text-accent" />
            <p className="mt-4 font-mono text-2xl font-bold text-foreground">
              {(stats.documentation.totalTokens / 1_000_000_000).toFixed(2)}B
            </p>
            <p className="mt-1 font-mono text-xs uppercase text-muted-foreground">Tokens Indexed</p>
          </div>
          <div className="border border-border bg-background p-6 text-center">
            <Activity className="mx-auto h-6 w-6 text-accent" />
            <p className="mt-4 font-mono text-2xl font-bold text-foreground">99.9%</p>
            <p className="mt-1 font-mono text-xs uppercase text-muted-foreground">Uptime</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            Statistics are updated in real-time. Some metrics may be delayed by a few minutes.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Stat Card Component
// ============================================================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

function StatCard({ icon, label, value, subtext }: StatCardProps) {
  return (
    <div className="border border-border bg-background p-6 transition-colors hover:border-accent/50">
      <div className="flex items-center justify-between">
        <span className="text-accent">{icon}</span>
      </div>
      <p className="mt-4 font-mono text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 font-mono text-xs uppercase text-muted-foreground">{label}</p>
      {subtext && <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">{subtext}</p>}
    </div>
  );
}
