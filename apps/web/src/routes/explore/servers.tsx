import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { z } from "zod";
import {
  Search,
  Server,
  ExternalLink,
  Github,
  Star,
  X,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import {
  serversQueryOptions,
  serverCategoriesQueryOptions,
  type McpServer,
} from "../../lib/query-options";
import { ServerCardSkeleton } from "../../components/skeletons";

// ============================================================================
// Search Params Schema
// ============================================================================

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
});

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore/servers")({
  validateSearch: searchSchema,
  loader: ({ context }) => {
    // Prefetch servers and categories
    context.queryClient.ensureQueryData(
      serversQueryOptions({
        search: undefined,
        category: undefined,
        limit: 50,
      })
    );
    context.queryClient.ensureQueryData(serverCategoriesQueryOptions);
  },
  component: ServersPage,
});

// ============================================================================
// Main Component
// ============================================================================

function ServersPage() {
  const navigate = useNavigate({ from: "/explore/servers" });
  const { q, category } = Route.useSearch();

  // Derive state from URL params
  const searchQuery = q || "";
  const selectedCategory = category || "all";

  // Update search params (URL-based filtering)
  const updateSearch = (newQ?: string, newCategory?: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        q: newQ || undefined,
        category: newCategory === "all" ? undefined : newCategory,
      }),
    });
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearch(e.target.value, selectedCategory);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    updateSearch(searchQuery, categoryId);
  };

  // Clear search
  const clearSearch = () => {
    updateSearch("", selectedCategory);
  };

  // Clear all filters
  const clearAllFilters = () => {
    updateSearch("", "all");
  };

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Server className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                MCP Server Registry
              </h1>
              <p className="text-muted-foreground">
                Discover and install MCP servers with ready-to-use configurations
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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-56">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Categories
            </h2>
            <Suspense fallback={<CategoriesSkeleton />}>
              <CategoriesList
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </Suspense>
          </aside>

          {/* Server Grid */}
          <div className="flex-1">
            <Suspense fallback={<ServersGridSkeleton />}>
              <ServersGrid
                searchQuery={searchQuery}
                category={selectedCategory}
                onClearFilters={clearAllFilters}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Categories List Component
// ============================================================================

function CategoriesList({
  selectedCategory,
  onCategoryChange,
}: {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  const { data: categories } = useSuspenseQuery(serverCategoriesQueryOptions);

  const allCategories = [
    { id: "all", label: "All Servers" },
    ...categories.map((cat) => ({
      id: cat.id,
      label: cat.label,
    })),
  ];

  return (
    <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
      {allCategories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
            selectedCategory === cat.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span className="capitalize">{cat.label}</span>
        </button>
      ))}
    </nav>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-10 w-24 animate-pulse rounded-lg bg-muted/50 lg:w-full"
        />
      ))}
    </div>
  );
}

// ============================================================================
// Servers Grid Component
// ============================================================================

function ServersGrid({
  searchQuery,
  category,
  onClearFilters,
}: {
  searchQuery: string;
  category: string;
  onClearFilters: () => void;
}) {
  const { data } = useSuspenseQuery(
    serversQueryOptions({
      search: searchQuery || undefined,
      category: category !== "all" ? category : undefined,
      limit: 50,
    })
  );

  const servers = data.servers;
  const officialServers = servers.filter((s) => s.isOfficial);
  const communityServers = servers.filter((s) => !s.isOfficial);

  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
        <Server className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium text-foreground">No servers found</p>
        <p className="mt-1 text-muted-foreground">
          Try adjusting your search or filters
        </p>
        <button
          onClick={onClearFilters}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
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
            {officialServers.map((server) => (
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
            {communityServers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function ServersGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <ServerCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// Server Card Component
// ============================================================================

function ServerCard({ server }: { server: McpServer }) {
  return (
    <a
      href={`/explore/servers/${server.id}`}
      className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {server.iconUrl ? (
            <img
              src={server.iconUrl}
              alt={server.name}
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
              <h3 className="font-semibold text-foreground">
                {server.name}
              </h3>
              {server.isOfficial && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  Official
                </span>
              )}
              {server.isFeatured && !server.isOfficial && (
                <Star className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            {server.npmPackage && (
              <p className="text-xs text-muted-foreground">
                {server.npmPackage}
              </p>
            )}
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {server.description || "No description available"}
      </p>

      {/* Capabilities */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {/* Removed the individual hasTools/hasResources/hasPrompts checks since they don't exist on McpServer type */}
        {server.category && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground capitalize">
            {server.category}
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
    </a>
  );
}
