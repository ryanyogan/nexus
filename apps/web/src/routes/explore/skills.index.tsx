import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import {
  Search,
  ExternalLink,
  X,
  Zap,
  Star,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { logger } from "../../lib/server-fn";

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

interface PaginatedResult {
  skills: Skill[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Server Functions
// ============================================================================

const getSkills = createServerFn({ method: "GET" })
  .inputValidator((d: { search?: string; category?: string; type?: string; page?: number; pageSize?: number }) => d)
  .handler(async ({ data }): Promise<PaginatedResult> => {
    const startTime = Date.now();
    const fnName = "getSkills";

    try {
      logger.debug(`${fnName} started`, { input: data });

      const db = drizzle(env.DB, { schema });
      const { search, category, type, page = 1, pageSize = 20 } = data;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(schema.skills.isActive, true)];

      if (search) {
        conditions.push(
          sql`(${schema.skills.name} LIKE ${"%" + search + "%"} OR ${schema.skills.description} LIKE ${"%" + search + "%"})`
        );
      }

      if (category) {
        conditions.push(
          sql`json_array_length(${schema.skills.categories}) > 0 AND EXISTS (SELECT 1 FROM json_each(${schema.skills.categories}) WHERE json_each.value = ${category})`
        );
      }

      if (type) {
        conditions.push(eq(schema.skills.type, type as schema.SkillType));
      }

      const whereClause = and(...conditions);

      // Get total count
      const [countResult] = await db
        .select({ count: count() })
        .from(schema.skills)
        .where(whereClause);

      const total = countResult?.count ?? 0;

      // Get paginated results
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
        .where(whereClause)
        .orderBy(
          desc(schema.skills.isOfficial),
          desc(schema.skills.isFeatured),
          desc(schema.skills.installCount)
        )
        .limit(pageSize)
        .offset(offset);

      const durationMs = Date.now() - startTime;
      logger.info(`${fnName} completed`, { durationMs, count: skills.length, total });

      return {
        skills: skills as Skill[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`${fnName} failed`, { durationMs, input: data }, err);
      throw error;
    }
  });

const getSkillCategories = createServerFn({ method: "GET" }).handler(async () => {
  const startTime = Date.now();
  const fnName = "getSkillCategories";

  try {
    logger.debug(`${fnName} started`);

    const db = drizzle(env.DB, { schema });

    const skills = await db
      .select({ categories: schema.skills.categories })
      .from(schema.skills)
      .where(eq(schema.skills.isActive, true));

    const categoryCounts = new Map<string, number>();
    for (const skill of skills) {
      if (skill.categories && Array.isArray(skill.categories)) {
        for (const cat of skill.categories) {
          categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
        }
      }
    }

    const categories: SkillCategory[] = Array.from(categoryCounts.entries())
      .map(([id, count]) => ({
        id,
        label: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const durationMs = Date.now() - startTime;
    logger.info(`${fnName} completed`, { durationMs, count: categories.length });

    return categories;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`${fnName} failed`, { durationMs }, err);
    throw error;
  }
});

// ============================================================================
// Search Params Schema
// ============================================================================

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  page: z.coerce.number().min(1).optional().catch(1),
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
    page: search.page ?? 1,
  }),
  loader: async ({ deps }) => {
    const [skillsData, categories] = await Promise.all([
      getSkills({
        data: {
          search: deps.q,
          category: deps.category,
          type: deps.type,
          page: deps.page,
          pageSize: 20,
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
// Page Skeleton
// ============================================================================

function SkillsPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <div className="h-12 animate-pulse rounded-xl bg-stone-200" />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-stone-200" />
        ))}
      </div>
      <div className="space-y-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-stone-100" />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function SkillsPage() {
  const navigate = useNavigate({ from: "/explore/skills/" });
  const { q, category, page } = Route.useSearch();
  const { skillsData, categories } = Route.useLoaderData();

  const searchQuery = q || "";
  const selectedCategory = category || "";
  const currentPage = page ?? 1;

  const { skills, total, totalPages } = skillsData;

  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...updates,
        q: updates.q !== undefined ? updates.q || undefined : prev.q,
        category:
          updates.category !== undefined
            ? updates.category === ""
              ? undefined
              : updates.category
            : prev.category,
        page: updates.page ?? (updates.q !== undefined || updates.category !== undefined ? 1 : prev.page),
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

  const goToPage = (newPage: number) => {
    updateSearch({ page: newPage });
  };

  const allCategories = [
    { id: "", label: "All", count: total },
    ...categories.map((cat: SkillCategory) => ({
      id: cat.id,
      label: cat.label,
      count: cat.count,
    })),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-stone-900">AI Skills</h1>
        <p className="mt-1 text-stone-600">Pre-built skills for AI agents</p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-12 w-full rounded-xl border border-stone-300 bg-white pl-12 pr-10 text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {allCategories.slice(0, 10).map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-emerald-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results info */}
      <div className="mb-4 flex items-center justify-between text-sm text-stone-500">
        <span>
          {total} skill{total !== 1 ? "s" : ""}
          {searchQuery && ` for "${searchQuery}"`}
        </span>
      </div>

      {/* Skill List - Minimal Design */}
      {skills.length > 0 ? (
        <div className="space-y-1">
          {skills.map((skill: Skill) => (
            <SkillRow key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Zap className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-4 text-stone-600">No skills found</p>
          <button
            onClick={() => updateSearch({ q: "", category: "" })}
            className="mt-4 text-sm text-emerald-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-emerald-600 text-white"
                      : "border border-stone-300 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Skill Row Component - Minimal List Item
// ============================================================================

const typeColors: Record<string, string> = {
  analysis: "text-blue-600",
  generation: "text-emerald-600",
  transformation: "text-yellow-600",
  integration: "text-purple-600",
  utility: "text-stone-600",
};

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <Link
      to="/explore/skills/$skillId"
      params={{ skillId: skill.id }}
      className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-stone-100"
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-purple-100">
        <Zap className="h-4 w-4 text-purple-600" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-900">{skill.name}</span>
          {skill.isOfficial && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              Official
            </span>
          )}
          {skill.isFeatured && !skill.isOfficial && (
            <Star className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className={`text-xs capitalize ${typeColors[skill.type] || typeColors.utility}`}>
            {skill.type}
          </span>
        </div>
        {skill.description && (
          <p className="truncate text-sm text-stone-500">{skill.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="hidden shrink-0 items-center gap-1 text-xs text-stone-400 sm:flex">
        <Download className="h-3.5 w-3.5" />
        {skill.installCount}
      </div>

      {/* Arrow */}
      <ExternalLink className="h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-stone-500" />
    </Link>
  );
}
