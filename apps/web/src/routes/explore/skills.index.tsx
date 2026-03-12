import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  Search,
  ExternalLink,
  X,
  Zap,
  CheckCircle,
  Sparkles,
  Star,
  Download,
} from "lucide-react";
import { ServerCardSkeleton } from "../../components/skeletons";

// ============================================================================
// Types
// ============================================================================

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: "analysis" | "generation" | "transformation" | "integration" | "utility";
  categories: string[];
  isOfficial: boolean;
  isFeatured: boolean;
  installCount: number;
}

interface SkillCategory {
  id: string;
  label: string;
  count: number;
}

// ============================================================================
// Server Functions
// ============================================================================

const getSkills = createServerFn({ method: "GET" })
  .inputValidator((d: { search?: string; category?: string; type?: string }) => d)
  .handler(async ({ data }) => {
    const db = drizzle(env.DB, { schema });

    const conditions = [eq(schema.skills.isActive, true)];

    if (data.search) {
      conditions.push(
        sql`(${schema.skills.name} LIKE ${"%" + data.search + "%"} OR ${schema.skills.description} LIKE ${"%" + data.search + "%"})`
      );
    }

    if (data.category) {
      // Categories are stored as JSON array
      conditions.push(
        sql`json_array_length(${schema.skills.categories}) > 0 AND EXISTS (SELECT 1 FROM json_each(${schema.skills.categories}) WHERE json_each.value = ${data.category})`
      );
    }

    if (data.type) {
      conditions.push(eq(schema.skills.type, data.type as schema.SkillType));
    }

    const skills = await db
      .select({
        id: schema.skills.id,
        name: schema.skills.name,
        slug: schema.skills.slug,
        description: schema.skills.description,
        type: schema.skills.type,
        categories: schema.skills.categories,
        isOfficial: schema.skills.isOfficial,
        isFeatured: schema.skills.isFeatured,
        installCount: schema.skills.installCount,
      })
      .from(schema.skills)
      .where(and(...conditions))
      .orderBy(
        desc(schema.skills.isOfficial),
        desc(schema.skills.isFeatured),
        desc(schema.skills.installCount)
      )
      .limit(100);

    return { skills: skills as Skill[], total: skills.length };
  });

const getSkillCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = drizzle(env.DB, { schema });

    // Get all active skills and count categories
    const skills = await db
      .select({
        categories: schema.skills.categories,
      })
      .from(schema.skills)
      .where(eq(schema.skills.isActive, true));

    // Count occurrences of each category
    const categoryCounts = new Map<string, number>();
    for (const skill of skills) {
      if (skill.categories && Array.isArray(skill.categories)) {
        for (const cat of skill.categories) {
          categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
        }
      }
    }

    // Convert to array and sort by count
    const categories: SkillCategory[] = Array.from(categoryCounts.entries())
      .map(([id, count]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return categories;
  }
);

// ============================================================================
// Search Params Schema
// ============================================================================

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
});

type SearchParams = z.infer<typeof searchSchema>;

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore/skills/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
    type: search.type,
  }),
  loader: async ({ deps }) => {
    const [skillsData, categories] = await Promise.all([
      getSkills({
        data: {
          search: deps.q,
          category: deps.category,
          type: deps.type,
        },
      }),
      getSkillCategories(),
    ]);

    return { skillsData, categories };
  },
  pendingComponent: SkillsPageSkeleton,
  component: SkillsPage,
});

// ============================================================================
// Main Component
// ============================================================================

function SkillsPage() {
  const navigate = useNavigate({ from: "/explore/skills/" });
  const { q, category } = Route.useSearch();
  const { skillsData, categories } = Route.useLoaderData();

  const searchQuery = q || "";
  const selectedCategory = category || "all";

  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...updates,
        q: updates.q !== undefined ? updates.q || undefined : prev.q,
        category:
          updates.category !== undefined
            ? updates.category === "all"
              ? undefined
              : updates.category
            : prev.category,
      }),
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearch({ q: e.target.value });
  };

  const handleCategoryChange = (categoryId: string) => {
    updateSearch({ category: categoryId });
  };

  const clearSearch = () => {
    updateSearch({ q: "" });
  };

  const clearAllFilters = () => {
    updateSearch({ q: "", category: "all" });
  };

  const skills = skillsData.skills;
  const total = skillsData.total;

  const officialSkills = skills.filter((s: Skill) => s.isOfficial);
  const communitySkills = skills.filter((s: Skill) => !s.isOfficial);

  const allCategories = [
    { id: "all", label: "All Skills", count: total },
    ...categories.map((cat: SkillCategory) => ({
      id: cat.id,
      label: cat.label,
      count: cat.count,
    })),
  ];

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Agent Skills
              </h1>
              <p className="mt-1 text-muted-foreground">
                Pre-built skills for AI agents. Copy to your project or use with OpenCode.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-56">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Categories
            </h2>
            <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span className="capitalize">{cat.label}</span>
                  {cat.count !== undefined && (
                    <span className="ml-2 text-xs opacity-70">{cat.count}</span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Skill Grid */}
          <div className="flex-1">
            {/* Info banner */}
            <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-start gap-3">
                <Zap className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                <div>
                  <h3 className="font-medium text-purple-900">
                    Agent Skills
                  </h3>
                  <p className="mt-1 text-sm text-purple-700">
                    Pre-built skills for AI agents. Copy to your project or use with OpenCode&apos;s skill system.
                  </p>
                </div>
              </div>
            </div>

            {skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
                <Zap className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">
                  No skills found
                </p>
                <p className="mt-1 text-muted-foreground">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {/* Official Skills */}
                {officialSkills.length > 0 && (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Official Skills
                      </h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {officialSkills.length}
                      </span>
                    </div>
                    <div className="mb-8 grid gap-4 sm:grid-cols-2">
                      {officialSkills.map((skill: Skill) => (
                        <SkillCard key={skill.id} skill={skill} />
                      ))}
                    </div>
                  </>
                )}

                {/* Community Skills */}
                {communitySkills.length > 0 && (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Community Skills
                      </h3>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {communitySkills.length}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {communitySkills.map((skill: Skill) => (
                        <SkillCard key={skill.id} skill={skill} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Skill Card Component
// ============================================================================

const typeColors: Record<string, string> = {
  analysis: "bg-blue-100 text-blue-700",
  generation: "bg-emerald-100 text-emerald-700",
  transformation: "bg-yellow-100 text-yellow-700",
  integration: "bg-purple-100 text-purple-700",
  utility: "bg-stone-100 text-stone-700",
};

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link
      to="/explore/skills/$skillId"
      params={{ skillId: skill.id }}
      className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{skill.name}</h3>
              {skill.isOfficial && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  Official
                </span>
              )}
              {skill.isFeatured && !skill.isOfficial && (
                <Star className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`rounded-md px-1.5 py-0.5 capitalize ${typeColors[skill.type] || typeColors.utility}`}>
                {skill.type}
              </span>
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {skill.description || "No description available"}
      </p>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {skill.categories.slice(0, 2).map((cat) => (
          <span
            key={cat}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground capitalize"
          >
            {cat.replace(/-/g, " ")}
          </span>
        ))}
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Download className="h-3 w-3" />
          <span>{skill.installCount}</span>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// Skeleton Components
// ============================================================================

function SkillsPageSkeleton() {
  return (
    <div className="relative min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-9 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-muted" />
          <div className="mt-6 h-12 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-56">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-full animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          </aside>
          <div className="flex-1">
            <div className="mb-6 h-24 animate-pulse rounded-lg bg-purple-50" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServerCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
