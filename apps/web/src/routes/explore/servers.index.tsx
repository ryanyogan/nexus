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
  Server,
  Github,
  CheckCircle,
  Sparkles,
  Star,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { ServerCardSkeleton } from "../../components/skeletons";

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
  // Security
  securityRiskLevel: "low" | "medium" | "high" | "critical" | null;
  isSecurityAudited: boolean;
}

interface ServerCategory {
  id: string;
  label: string;
  count: number;
}

// ============================================================================
// Server Functions
// ============================================================================

interface GetServersInput {
  search?: string;
  category?: string;
}

const getServers = createServerFn({ method: "GET" }).handler(
  async (ctx: { data: GetServersInput }) => {
    const { data } = ctx;
    const db = drizzle(env.DB, { schema });

    const conditions = [eq(schema.mcpServers.isActive, true)];

    if (data?.search) {
      conditions.push(
        sql`(${schema.mcpServers.name} LIKE ${"%" + data.search + "%"} OR ${schema.mcpServers.displayName} LIKE ${"%" + data.search + "%"} OR ${schema.mcpServers.description} LIKE ${"%" + data.search + "%"})`
      );
    }

    if (data?.category) {
      // Categories are stored as JSON array, so we need to check if the category is in the array
      conditions.push(
        sql`json_array_length(${schema.mcpServers.categories}) > 0 AND EXISTS (SELECT 1 FROM json_each(${schema.mcpServers.categories}) WHERE json_each.value = ${data.category})`
      );
    }

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
        // Security
        securityRiskLevel: schema.mcpServers.securityRiskLevel,
        isSecurityAudited: schema.mcpServers.isSecurityAudited,
      })
      .from(schema.mcpServers)
      .where(and(...conditions))
      .orderBy(
        desc(schema.mcpServers.isOfficial),
        desc(schema.mcpServers.isFeatured),
        schema.mcpServers.name
      )
      .limit(100);

    return { servers: servers as McpServer[], total: servers.length };
  }
);

const getServerCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const db = drizzle(env.DB, { schema });

    // Get all active servers and count categories
    const servers = await db
      .select({
        categories: schema.mcpServers.categories,
      })
      .from(schema.mcpServers)
      .where(eq(schema.mcpServers.isActive, true));

    // Count occurrences of each category
    const categoryCounts = new Map<string, number>();
    for (const server of servers) {
      if (server.categories && Array.isArray(server.categories)) {
        for (const cat of server.categories) {
          categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
        }
      }
    }

    // Convert to array and sort by count
    const categories: ServerCategory[] = Array.from(categoryCounts.entries())
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
  }),
  loader: async ({ deps }) => {
    const [serversData, categories] = await Promise.all([
      getServers({
        data: {
          search: deps.q,
          category: deps.category,
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
// Main Component
// ============================================================================

function ServersPage() {
  const navigate = useNavigate({ from: "/explore/servers/" });
  const { q, category } = Route.useSearch();
  const { serversData, categories } = Route.useLoaderData();

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

  const servers = serversData.servers;
  const total = serversData.total;

  const officialServers = servers.filter((s: McpServer) => s.isOfficial);
  const communityServers = servers.filter((s: McpServer) => !s.isOfficial);

  const allCategories = [
    { id: "all", label: "All Servers", count: total },
    ...categories.map((cat: ServerCategory) => ({
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
                MCP Servers
              </h1>
              <p className="mt-1 text-muted-foreground">
                Discover and install Model Context Protocol servers
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search MCP servers..."
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

          {/* Server Grid */}
          <div className="flex-1">
            {servers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
                <Server className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">
                  No servers found
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
                {/* Official Servers */}
                {officialServers.length > 0 && (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Official MCP Servers
                      </h3>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {officialServers.length}
                      </span>
                    </div>
                    <div className="mb-8 grid gap-4 sm:grid-cols-2">
                      {officialServers.map((server: McpServer) => (
                        <ServerCard key={server.id} server={server} />
                      ))}
                    </div>
                  </>
                )}

                {/* Community Servers */}
                {communityServers.length > 0 && (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">
                        Community Servers
                      </h3>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {communityServers.length}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {communityServers.map((server: McpServer) => (
                        <ServerCard key={server.id} server={server} />
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
// Server Card Component
// ============================================================================

// Security badge config
const securityConfig = {
  low: { icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10", label: "Low Risk" },
  medium: { icon: Shield, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Medium Risk" },
  high: { icon: ShieldAlert, color: "text-orange-500", bg: "bg-orange-500/10", label: "High Risk" },
  critical: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", label: "Critical" },
} as const;

function ServerCard({ server }: { server: McpServer }) {
  const displayName = server.displayName || server.name;
  const category = server.categories?.[0];
  const riskLevel = server.securityRiskLevel || "medium";
  const security = securityConfig[riskLevel];
  const SecurityIcon = security.icon;

  return (
    <Link
      to="/explore/servers/$serverId"
      params={{ serverId: server.id }}
      className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {server.iconUrl ? (
            <img
              src={server.iconUrl}
              alt={displayName}
              className="h-10 w-10 rounded-lg bg-muted object-contain p-1"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{displayName}</h3>
              {server.isOfficial && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  Official
                </span>
              )}
              {server.isFeatured && !server.isOfficial && (
                <Star className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            {server.packageName && (
              <p className="text-xs text-muted-foreground">
                {server.packageName}
              </p>
            )}
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {server.description || "No description available"}
      </p>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {/* Security Badge */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${security.bg} ${security.color}`}
          title={security.label}
        >
          <SecurityIcon className="h-3 w-3" />
          {security.label}
        </span>
        {server.isSecurityAudited && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
            <CheckCircle className="h-3 w-3" />
            Audited
          </span>
        )}
        {category && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground capitalize">
            {category}
          </span>
        )}
        {server.repositoryUrl && (
          <a
            href={server.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80"
          >
            <Github className="h-3 w-3" />
            GitHub
          </a>
        )}
      </div>
    </Link>
  );
}

// ============================================================================
// Skeleton Components
// ============================================================================

function ServersPageSkeleton() {
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
