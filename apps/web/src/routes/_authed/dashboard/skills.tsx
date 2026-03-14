import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Zap,
  ArrowLeft,
  Search,
  ExternalLink,
  Trash2,
  Clock,
  Star,
} from "lucide-react";
import { authFetch } from "../../../lib/api";

export const Route = createFileRoute("/_authed/dashboard/skills")({
  component: InstalledSkillsPage,
});

interface InstalledSkill {
  id: string;
  skill: {
    id: string;
    name: string;
    description: string;
    type: string;
    category: string;
  };
  installedAt: string;
  usageCount: number;
  lastUsedAt: string | null;
}

const typeColors: Record<string, string> = {
  analysis: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  generation: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  transformation: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  integration: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  utility: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

function InstalledSkillsPage() {
  const { session } = Route.useRouteContext();
  const [skills, setSkills] = useState<InstalledSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchInstalledSkills();
    }
  }, [session]);

  async function fetchInstalledSkills() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/user/skills");
      if (!res.ok) throw new Error("Failed to fetch installed skills");
      const data = await res.json() as { skills: InstalledSkill[] };
      setSkills(data.skills || []);
    } catch (err) {
      // For now, return empty - API endpoint doesn't exist yet
      setSkills([]);
      console.error("Failed to fetch skills:", err);
    } finally {
      setLoading(false);
    }
  }

  async function uninstallSkill(skillId: string) {
    if (!confirm("Are you sure you want to uninstall this skill?")) return;
    
    try {
      const res = await authFetch(`/api/skills/${skillId}/uninstall`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to uninstall skill");
      setSkills((prev) => prev.filter((s) => s.skill.id !== skillId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to uninstall skill");
    }
  }

  const filteredSkills = skills.filter(
    (s) =>
      s.skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.skill.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Installed Skills</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your AI agent skills
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
            Browse Skills
          </Link>
        </div>
      </div>

      {/* Search */}
      {skills.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search installed skills..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Skills List */}
      {filteredSkills.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {skills.length === 0 ? "No skills installed" : "No matching skills"}
          </h3>
          <p className="mt-1 text-muted-foreground">
            {skills.length === 0
              ? "Browse the skills registry to find useful AI agent skills"
              : "Try a different search term"}
          </p>
          {skills.length === 0 && (
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              Browse Skills
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSkills.map((installed) => (
            <div
              key={installed.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {installed.skill.name}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          typeColors[installed.skill.type] || typeColors.utility
                        }`}
                      >
                        {installed.skill.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {installed.skill.description}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Installed {new Date(installed.installedAt).toLocaleDateString()}
                      </span>
                      {installed.usageCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Used {installed.usageCount} times
                        </span>
                      )}
                      {installed.lastUsedAt && (
                        <span>
                          Last used {new Date(installed.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/"
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="View Details"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => uninstallSkill(installed.skill.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="Uninstall"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Stats */}
      {skills.length > 0 && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Usage Statistics</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{skills.length}</p>
              <p className="text-sm text-muted-foreground">Installed Skills</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {skills.reduce((sum, s) => sum + s.usageCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Uses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {skills.filter((s) => s.lastUsedAt).length}
              </p>
              <p className="text-sm text-muted-foreground">Active This Month</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
