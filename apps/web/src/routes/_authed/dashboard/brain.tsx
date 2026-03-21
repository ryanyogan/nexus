import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Brain,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Sparkles,
  Flame,
  Trophy,
  Target,
  BookOpen,
  TrendingUp,
  Check,
  X,
} from "lucide-react";
import { authFetch } from "../../../lib/api";

export const Route = createFileRoute("/_authed/dashboard/brain")({
  component: BrainPage,
});

interface Learning {
  id: string;
  type: "correction" | "pattern" | "preference" | "skill";
  category: string | null;
  trigger: string;
  response: string;
  context: string | null;
  source: "explicit" | "implicit" | "community";
  scope: "global" | "project" | "library" | "flow";
  project: string | null;
  libraryId: string | null;
  flowId: string | null;
  confidence: number;
  usageCount: number;
  successRate: number | null;
  isActive: boolean;
  createdAt: string;
}

interface IntelligenceScore {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  categoryXp: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  achievements: string[];
  stats: {
    totalQueries: number;
    totalMemories: number;
    totalLearnings: number;
    totalFlowsCreated: number;
    totalReposIndexed: number;
  };
}

interface XpEvent {
  id: string;
  eventType: string;
  xpAmount: number;
  category: string;
  description: string | null;
  createdAt: string;
}

const ACCENT_COLOR = "#06b6d4";

function BrainPage() {
  const { session } = Route.useRouteContext();
  const [score, setScore] = useState<IntelligenceScore | null>(null);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [xpHistory, setXpHistory] = useState<XpEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"learnings" | "xp">("learnings");
  const [learningFilter, setLearningFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // New learning form state
  const [showNewLearning, setShowNewLearning] = useState(false);
  const [newLearning, setNewLearning] = useState({
    trigger: "",
    response: "",
    type: "correction" as const,
    scope: "global" as const,
  });

  useEffect(() => {
    if (session?.user) {
      void fetchData();
    }
  }, [session]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [scoreRes, learningsRes, xpRes] = await Promise.all([
        authFetch("/api/brain/score"),
        authFetch("/api/brain/learnings?limit=50"),
        authFetch("/api/brain/xp-history?limit=20"),
      ]);

      if (!scoreRes.ok || !learningsRes.ok || !xpRes.ok) {
        throw new Error("Failed to fetch brain data");
      }

      const scoreData = (await scoreRes.json()) as { score: IntelligenceScore };
      const learningsData = (await learningsRes.json()) as { learnings: Learning[] };
      const xpData = (await xpRes.json()) as { events: XpEvent[] };

      setScore(scoreData.score);
      setLearnings(learningsData.learnings || []);
      setXpHistory(xpData.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  async function createLearning() {
    if (!newLearning.trigger || !newLearning.response) return;

    setActionLoading("new");
    try {
      const res = await authFetch("/api/brain/learnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLearning),
      });

      if (!res.ok) throw new Error("Failed to create learning");

      setShowNewLearning(false);
      setNewLearning({ trigger: "", response: "", type: "correction", scope: "global" });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create learning");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteLearning(id: string) {
    if (!confirm("Are you sure you want to delete this learning?")) return;

    setActionLoading(id);
    try {
      await authFetch(`/api/brain/learnings/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete learning");
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleLearning(id: string, isActive: boolean) {
    setActionLoading(id);
    try {
      await authFetch(`/api/brain/learnings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update learning");
    } finally {
      setActionLoading(null);
    }
  }

  // Filter learnings
  const filteredLearnings = learnings.filter((l) => {
    if (learningFilter === "all") return true;
    return l.type === learningFilter;
  });

  // XP chart data
  const xpChartData = xpHistory
    .slice()
    .reverse()
    .map((e) => ({
      date: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      xp: e.xpAmount,
    }));

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="pt-8 pb-6 md:pt-12 md:pb-8">
          <Link
            to="/dashboard"
            className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                Nexus Brain
              </h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
                Your AI learns and improves from every interaction
              </p>
            </div>
            <button
              onClick={() => setShowNewLearning(true)}
              className="flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Learning</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 border border-destructive bg-destructive/10 p-4">
            <p className="font-mono text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Intelligence Score Card */}
        {score && (
          <div className="mb-8 border border-accent bg-accent/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border border-accent bg-accent/10">
                  <Brain className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-foreground">
                    Level {score.level}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {score.totalXp.toLocaleString()} Total XP
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-mono text-sm font-bold text-foreground">
                      {score.currentStreak} day streak
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Best: {score.longestStreak} days
                  </p>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-muted-foreground">Level Progress</span>
                <span className="font-mono text-xs text-accent">
                  {score.currentLevelXp} / {score.xpToNextLevel} XP
                </span>
              </div>
              <div className="h-2 bg-muted">
                <div
                  className="h-full bg-accent transition-all"
                  style={{ width: `${(score.currentLevelXp / score.xpToNextLevel) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-5 gap-2">
              <StatMini icon={<Target />} value={score.stats.totalQueries} label="Queries" />
              <StatMini icon={<BookOpen />} value={score.stats.totalMemories} label="Memories" />
              <StatMini icon={<Sparkles />} value={score.stats.totalLearnings} label="Learnings" />
              <StatMini icon={<TrendingUp />} value={score.stats.totalFlowsCreated} label="Flows" />
              <StatMini icon={<Trophy />} value={score.achievements.length} label="Achievements" />
            </div>

            {/* Achievements */}
            {score.achievements.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {score.achievements.map((a, i) => (
                  <span
                    key={i}
                    className="border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[10px] uppercase text-accent"
                  >
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-0 border-b border-border">
          <button
            onClick={() => setActiveTab("learnings")}
            className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-colors -mb-px border-b-2 ${
              activeTab === "learnings"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Learnings ({learnings.length})
          </button>
          <button
            onClick={() => setActiveTab("xp")}
            className={`px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wide transition-colors -mb-px border-b-2 ${
              activeTab === "xp"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            XP History
          </button>
        </div>

        {/* Learnings Tab */}
        {activeTab === "learnings" && (
          <>
            {/* Filter */}
            <div className="mb-4 flex gap-2">
              {["all", "correction", "pattern", "preference", "skill"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLearningFilter(filter)}
                  className={`px-3 py-1.5 font-mono text-xs uppercase transition-colors ${
                    learningFilter === filter
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Learnings List */}
            <div className="space-y-3">
              {filteredLearnings.length === 0 ? (
                <div className="border border-border bg-background p-8 text-center">
                  <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 font-mono text-sm text-muted-foreground">
                    No learnings yet. Add your first learning to start teaching your AI.
                  </p>
                </div>
              ) : (
                filteredLearnings.map((learning) => (
                  <LearningCard
                    key={learning.id}
                    learning={learning}
                    actionLoading={actionLoading}
                    onDelete={deleteLearning}
                    onToggle={toggleLearning}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* XP History Tab */}
        {activeTab === "xp" && (
          <>
            {/* XP Chart */}
            {xpChartData.length > 0 && (
              <div className="mb-6 border border-border bg-background p-6">
                <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-foreground">
                  XP Over Time
                </h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={xpChartData}>
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
                        dataKey="xp"
                        stroke={ACCENT_COLOR}
                        strokeWidth={2}
                        dot={{ fill: ACCENT_COLOR, strokeWidth: 0, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* XP Events List */}
            <div className="space-y-2">
              {xpHistory.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between border border-border bg-background p-3"
                >
                  <div>
                    <p className="font-mono text-sm text-foreground">
                      {event.description || event.eventType}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-accent">
                    +{event.xpAmount} XP
                  </span>
                </div>
              ))}
              {xpHistory.length === 0 && (
                <div className="border border-border bg-background p-8 text-center">
                  <p className="font-mono text-sm text-muted-foreground">
                    No XP events yet. Start using Nexus to earn XP!
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* New Learning Modal */}
        {showNewLearning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
            <div className="w-full max-w-lg border border-border bg-background p-6 shadow-xl">
              <h2 className="mb-4 font-mono text-lg font-bold uppercase text-foreground">
                Add Learning
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">
                    Trigger
                  </label>
                  <input
                    type="text"
                    value={newLearning.trigger}
                    onChange={(e) => setNewLearning({ ...newLearning, trigger: e.target.value })}
                    placeholder="When I ask about..."
                    className="w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">
                    Response
                  </label>
                  <textarea
                    value={newLearning.response}
                    onChange={(e) => setNewLearning({ ...newLearning, response: e.target.value })}
                    placeholder="Always do..."
                    rows={3}
                    className="w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">
                      Type
                    </label>
                    <select
                      value={newLearning.type}
                      onChange={(e) =>
                        setNewLearning({
                          ...newLearning,
                          type: e.target.value as typeof newLearning.type,
                        })
                      }
                      className="w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                    >
                      <option value="correction">Correction</option>
                      <option value="pattern">Pattern</option>
                      <option value="preference">Preference</option>
                      <option value="skill">Skill</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">
                      Scope
                    </label>
                    <select
                      value={newLearning.scope}
                      onChange={(e) =>
                        setNewLearning({
                          ...newLearning,
                          scope: e.target.value as typeof newLearning.scope,
                        })
                      }
                      className="w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
                    >
                      <option value="global">Global</option>
                      <option value="project">Project</option>
                      <option value="library">Library</option>
                      <option value="flow">Flow</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowNewLearning(false)}
                  className="border border-border px-4 py-2 font-mono text-xs font-bold uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={createLearning}
                  disabled={
                    !newLearning.trigger || !newLearning.response || actionLoading === "new"
                  }
                  className="border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                >
                  {actionLoading === "new" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Components
// ============================================================================

function StatMini({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-1 flex h-6 w-6 items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <p className="font-mono text-lg font-bold text-foreground">{value}</p>
      <p className="font-mono text-[9px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}

interface LearningCardProps {
  learning: Learning;
  actionLoading: string | null;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

function LearningCard({ learning, actionLoading, onDelete, onToggle }: LearningCardProps) {
  const isLoading = actionLoading === learning.id;

  const typeColors: Record<string, string> = {
    correction: "border-red-500/50 text-red-500",
    pattern: "border-blue-500/50 text-blue-500",
    preference: "border-green-500/50 text-green-500",
    skill: "border-purple-500/50 text-purple-500",
  };

  return (
    <div
      className={`border bg-background p-4 transition-colors ${
        learning.isActive ? "border-border" : "border-border/50 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                typeColors[learning.type] || "border-border text-muted-foreground"
              }`}
            >
              {learning.type}
            </span>
            {learning.scope !== "global" && (
              <span className="font-mono text-[10px] text-muted-foreground">
                {learning.scope}
                {learning.project && `: ${learning.project}`}
              </span>
            )}
            {!learning.isActive && (
              <span className="font-mono text-[10px] text-muted-foreground">DISABLED</span>
            )}
          </div>
          <p className="font-mono text-sm font-medium text-foreground">{learning.trigger}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{learning.response}</p>
          {learning.usageCount > 0 && (
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              Used {learning.usageCount} times
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <button
                onClick={() => onToggle(learning.id, learning.isActive)}
                className={`flex h-8 w-8 items-center justify-center border transition-colors ${
                  learning.isActive
                    ? "border-accent text-accent hover:bg-accent/10"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
                title={learning.isActive ? "Disable" : "Enable"}
              >
                {learning.isActive ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </button>
              <button
                onClick={() => onDelete(learning.id)}
                className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
