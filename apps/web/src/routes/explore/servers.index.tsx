import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { logger } from "../../lib/server-fn";
import {
  Search,
  ExternalLink,
  X,
  Server,
  Github,
  CheckCircle,
  Star,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface McpServer {
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  categories: string[];
  isOfficial: boolean;
  isFeatured: boolean;
  iconUrl: string | null;
  repositoryUrl: string | null;
  packageName: string | null;
  securityRiskLevel: "low" | "medium" | "high" | "critical" | null;
  isSecurityAudited: boolean;
}

interface ServerCategory {
  id: string;
  label: string;
  count: number;
}

interface PaginatedResult {
  servers: McpServer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Server Functions
// ============================================================================

interface GetServersInput {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

const getServers = createServerFn({ method: "GET" })
  .inputValidator((data: GetServersInput) => data)
  .handler(async ({ data }): Promise<PaginatedResult> => {
    const startTime = Date.now();
    const fnName = "getServers";

    try {
      logger.debug(`${fnName} started`, { input: data });

      const db = drizzle(env.DB, { schema });
      const { search, category, page = 1, pageSize = 20 } = data;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(schema.mcpServers.isActive, true)];

      if (search) {
        conditions.push(
          sql`(${schema.mcpServers.name} LIKE ${"%" + search + "%"} OR ${schema.mcpServers.displayName} LIKE ${"%" + search + "%"} OR ${schema.mcpServers.description} LIKE ${"%" + search + "%"})`
        );
      }

      if (category) {
        conditions.push(
          sql`json_array_length(${schema.mcpServers.categories}) > 0 AND EXISTS (SELECT 1 FROM json_each(${schema.mcpServers.categories}) WHERE json_each.value = ${category})`
        );
      }

      const whereClause = and(...conditions);

      // Get total count
      const [countResult] = await db
        .select({ count: count() })
        .from(schema.mcpServers)
        .where(whereClause);

      const total = countResult?.count ?? 0;

      // Get paginated results
      const servers = await db
        .select({
          id: schema.mcpServers.id,
          name: schema.mcpServers.name,
          displayName: schema.mcpServers.displayName,
          description: schema.mcpServers.description,
          categories: schema.mcpServers.categories,
          isOfficial: schema.mcpServers.isOfficial,
          isFeatured: schema.mcpServers.isFeatured,
          iconUrl: schema.mcpServers.iconUrl,
          repositoryUrl: schema.mcpServers.repositoryUrl,
          packageName: schema.mcpServers.packageName,
          securityRiskLevel: schema.mcpServers.securityRiskLevel,
          isSecurityAudited: schema.mcpServers.isSecurityAudited,
        })
        .from(schema.mcpServers)
        .where(whereClause)
        .orderBy(
          desc(schema.mcpServers.isOfficial),
          desc(schema.mcpServers.isFeatured),
          schema.mcpServers.name
        )
        .limit(pageSize)
        .offset(offset);

      const durationMs = Date.now() - startTime;
      logger.info(`${fnName} completed`, { durationMs, count: servers.length, total });

      return {
        servers: servers as McpServer[],
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

const getServerCategories = createServerFn({ method: "GET" }).handler(async () => {
  const startTime = Date.now();
  const fnName = "getServerCategories";

  try {
    logger.debug(`${fnName} started`);

    const db = drizzle(env.DB, { schema });

    const servers = await db
      .select({ categories: schema.mcpServers.categories })
      .from(schema.mcpServers)
      .where(eq(schema.mcpServers.isActive, true));

    const categoryCounts = new Map<string, number>();
    for (const server of servers) {
      if (server.categories && Array.isArray(server.categories)) {
        for (const cat of server.categories) {
          categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
        }
      }
    }

    const categories: ServerCategory[] = Array.from(categoryCounts.entries())
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
  page: z.coerce.number().min(1).optional().catch(1),
});

type SearchParams = z.infer<typeof searchSchema>;

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore/servers/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
    page: search.page ?? 1,
  }),
  loader: async ({ deps }) => {
    const [serversData, categories] = await Promise.all([
      getServers({
        data: {
          search: deps.q,
          category: deps.category,
          page: deps.page,
          pageSize: 20,
        },
      }),
      getServerCategories(),
    ]);

    return { serversData, categories };
  },
  pendingComponent: ServersPageSkeleton,
  component: ServersPage,
});

// ============================================================================
// Page Skeleton
// ============================================================================

function ServersPageSkeleton() {
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

function ServersPage() {
  const navigate = useNavigate({ from: "/explore/servers/" });
  const { q, category, page } = Route.useSearch();
  const { serversData, categories } = Route.useLoaderData();

  const searchQuery = q || "";
  const selectedCategory = category || "";
  const currentPage = page ?? 1;

  const { servers, total, totalPages } = serversData;

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
    ...categories.map((cat: ServerCategory) => ({
      id: cat.id,
      label: cat.label,
      count: cat.count,
    })),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-stone-900">MCP Servers</h1>
        <p className="mt-1 text-stone-600">Discover and install Model Context Protocol servers</p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search servers..."
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
          {total} server{total !== 1 ? "s" : ""}
          {searchQuery && ` for "${searchQuery}"`}
        </span>
      </div>

      {/* Server List - Minimal Design */}
      {servers.length > 0 ? (
        <div className="space-y-1">
          {servers.map((server: McpServer) => (
            <ServerRow key={server.id} server={server} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Server className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-4 text-stone-600">No servers found</p>
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
// Server Row Component - Minimal List Item
// ============================================================================

const securityConfig = {
  low: { icon: ShieldCheck, color: "text-green-600" },
  medium: { icon: Shield, color: "text-yellow-600" },
  high: { icon: ShieldAlert, color: "text-orange-600" },
  critical: { icon: AlertTriangle, color: "text-red-600" },
} as const;

function ServerRow({ server }: { server: McpServer }) {
  const displayName = server.displayName || server.name;
  const riskLevel = server.securityRiskLevel || "medium";
  const security = securityConfig[riskLevel];
  const SecurityIcon = security.icon;

  return (
    <Link
      to="/explore/servers/$serverId"
      params={{ serverId: server.id }}
      className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-stone-100"
    >
      {/* Icon */}
      {server.iconUrl ? (
        <img
          src={server.iconUrl}
          alt={displayName}
          className="h-8 w-8 shrink-0 rounded-md bg-stone-100 object-contain p-1"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-100">
          <Server className="h-4 w-4 text-emerald-600" />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-900">{displayName}</span>
          {server.isOfficial && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              Official
            </span>
          )}
          {server.isFeatured && !server.isOfficial && (
            <Star className="h-3.5 w-3.5 text-amber-500" />
          )}
        </div>
        {server.description && (
          <p className="truncate text-sm text-stone-500">{server.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="hidden shrink-0 items-center gap-3 sm:flex">
        <SecurityIcon className={`h-4 w-4 ${security.color}`} />
        {server.isSecurityAudited && (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
        {server.repositoryUrl && (
          <Github className="h-4 w-4 text-stone-400" />
        )}
      </div>

      {/* Arrow */}
      <ExternalLink className="h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-stone-500" />
    </Link>
  );
}
