import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { z } from "zod";
import {
  Search,
  ExternalLink,
  BookOpen,
  FileText,
  Clock,
  Star,
  X,
  Server,
  Github,
  CheckCircle,
  Sparkles,
  Loader2,
  Zap,
  Download,
} from "lucide-react";
import {
  librariesQueryOptions,
  serversQueryOptions,
  serverCategoriesQueryOptions,
  skillsQueryOptions,
  skillCategoriesQueryOptions,
  type Library,
  type McpServer,
  type Skill,
} from "../lib/query-options";
import {
  ExplorePageSkeleton,
  LibraryCardSkeleton,
  ServerCardSkeleton,
} from "../components/skeletons";
import { LIBRARY_CATEGORIES } from "../lib/api";

// ============================================================================
// Search Params Schema
// ============================================================================

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
  tab: z.enum(["docs", "servers", "skills"]).optional().catch("docs"),
});

type SearchParams = z.infer<typeof searchSchema>;

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
    tab: search.tab || "docs",
  }),
  loader: async ({ context, deps }) => {
    // Prefetch data based on active tab
    if (deps.tab === "docs") {
      await context.queryClient.ensureQueryData(
        librariesQueryOptions({
          search: deps.q,
          category: deps.category,
          limit: 100,
        })
      );
    } else if (deps.tab === "servers") {
      await Promise.all([
        context.queryClient.ensureQueryData(
          serversQueryOptions({
            search: deps.q,
            category: deps.category,
            limit: 100,
          })
        ),
        context.queryClient.ensureQueryData(serverCategoriesQueryOptions),
      ]);
    } else if (deps.tab === "skills") {
      await Promise.all([
        context.queryClient.ensureQueryData(
          skillsQueryOptions({
            search: deps.q,
            category: deps.category,
            limit: 100,
          })
        ),
        context.queryClient.ensureQueryData(skillCategoriesQueryOptions),
      ]);
    }
  },
  pendingComponent: ExplorePageSkeleton,
  component: ExplorePage,
});

// ============================================================================
// Categories for Docs
// ============================================================================

const DOC_CATEGORIES = [
  { id: "all", label: "All" },
  ...LIBRARY_CATEGORIES,
];

// ============================================================================
// Main Component
// ============================================================================

function ExplorePage() {
  const navigate = useNavigate({ from: "/explore" });
  const { q, category, tab } = Route.useSearch();

  // Derive state from URL params
  const searchQuery = q || "";
  const selectedCategory = category || "all";
  const activeTab = tab || "docs";

  // Update URL with new search params
  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...updates,
        // Clean up undefined values
        q: updates.q !== undefined ? updates.q || undefined : prev.q,
        category:
          updates.category !== undefined
            ? updates.category === "all"
              ? undefined
              : updates.category
            : prev.category,
        tab:
          updates.tab !== undefined
            ? updates.tab === "docs"
              ? undefined
              : updates.tab
            : prev.tab,
      }),
    });
  };

  // Handle tab change - reset filters when switching tabs
  const handleTabChange = (newTab: "docs" | "servers" | "skills") => {
    navigate({
      search: {
        tab: newTab === "docs" ? undefined : newTab,
        // Reset filters when switching tabs
        q: undefined,
        category: undefined,
      },
    });
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSearch({ q: e.target.value });
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    updateSearch({ category: categoryId });
  };

  // Clear search
  const clearSearch = () => {
    updateSearch({ q: "" });
  };

  // Clear all filters
  const clearAllFilters = () => {
    updateSearch({ q: "", category: "all" });
  };

  return (
    <div className="relative min-h-screen">
      {/* Header with Tabs */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Explore</h1>
              <p className="mt-1 text-muted-foreground">
                Discover documentation libraries and MCP servers
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => handleTabChange("docs")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "docs"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Documentation</span>
              <span className="sm:hidden">Docs</span>
            </button>
            <button
              onClick={() => handleTabChange("servers")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "servers"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">MCP Servers</span>
              <span className="sm:hidden">Servers</span>
            </button>
            <button
              onClick={() => handleTabChange("skills")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "skills"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-4 w-4" />
              Skills
            </button>
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={
                  activeTab === "docs"
                    ? "Search documentation libraries..."
                    : activeTab === "servers"
                      ? "Search MCP servers..."
                      : "Search skills..."
                }
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

      {/* Content Area with Suspense */}
      <Suspense
        fallback={
          <ContentSkeleton
            tab={activeTab as "docs" | "servers" | "skills"}
            selectedCategory={selectedCategory}
          />
        }
      >
        {activeTab === "docs" ? (
          <DocsContent
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onClearFilters={clearAllFilters}
          />
        ) : activeTab === "servers" ? (
          <ServersContent
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onClearFilters={clearAllFilters}
          />
        ) : (
          <SkillsContent
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onClearFilters={clearAllFilters}
          />
        )}
      </Suspense>
    </div>
  );
}

// ============================================================================
// Content Skeleton (for tab switching)
// ============================================================================

function ContentSkeleton({
  tab,
  selectedCategory,
}: {
  tab: "docs" | "servers" | "skills";
  selectedCategory: string;
}) {
  const categories =
    tab === "docs"
      ? DOC_CATEGORIES
      : tab === "servers"
        ? [{ id: "all", label: "All Servers" }]
        : [{ id: "all", label: "All Skills" }];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-56">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Categories
          </h2>
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                disabled
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) =>
              tab === "docs" ? (
                <LibraryCardSkeleton key={i} />
              ) : (
                <ServerCardSkeleton key={i} />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Docs Content Component
// ============================================================================

function DocsContent({
  searchQuery,
  selectedCategory,
  onCategoryChange,
  onClearFilters,
}: {
  searchQuery: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}) {
  // Use useQuery with smart polling for libraries that are indexing
  const queryOptions = librariesQueryOptions({
    search: searchQuery || undefined,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    limit: 100,
  });

  const { data } = useQuery({
    ...queryOptions,
    refetchInterval: (query) => {
      // Poll every 5s if any libraries are indexing
      const hasIndexing = query.state.data?.libraries?.some(
        (lib) => lib.indexStatus === "indexing"
      );
      return hasIndexing ? 5000 : false;
    },
  });

  const libraries = data?.libraries ?? [];
  const hasIndexingLibraries = libraries.some(
    (lib) => lib.indexStatus === "indexing"
  );

  const indexedLibraries = libraries.filter(
    (lib) => lib.indexStatus === "indexed"
  );
  const pendingLibraries = libraries.filter(
    (lib) => lib.indexStatus !== "indexed"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-56">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Categories
          </h2>
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
            {DOC_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Library Grid */}
        <div className="flex-1">
          {/* Info banner */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Documentation Libraries
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  Pre-indexed documentation with semantic search. Ask your AI
                  assistant questions and get relevant code examples instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Indexed Libraries */}
          {indexedLibraries.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {indexedLibraries.length}
                  </span>{" "}
                  indexed librar{indexedLibraries.length !== 1 ? "ies" : "y"}
                </p>
                {hasIndexingLibraries && (
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Auto-refreshing
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {indexedLibraries.map((library) => (
                  <LibraryCard key={library.id} library={library} />
                ))}
              </div>
            </>
          )}

          {/* Pending Libraries */}
          {pendingLibraries.length > 0 && (
            <>
              <h3 className="mb-4 mt-8 text-lg font-semibold text-foreground">
                Coming Soon
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pendingLibraries.map((library) => (
                  <PendingLibraryCard key={library.id} library={library} />
                ))}
              </div>
            </>
          )}

          {libraries.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">
                No libraries found
              </p>
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
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Servers Content Component
// ============================================================================

function ServersContent({
  searchQuery,
  selectedCategory,
  onCategoryChange,
  onClearFilters,
}: {
  searchQuery: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}) {
  const { data: serversData } = useSuspenseQuery(
    serversQueryOptions({
      search: searchQuery || undefined,
      category: selectedCategory === "all" ? undefined : selectedCategory,
      limit: 100,
    })
  );
  const { data: categories } = useSuspenseQuery(serverCategoriesQueryOptions);

  const servers = serversData.servers;
  const total = serversData.total;

  const officialServers = servers.filter((s) => s.isOfficial);
  const communityServers = servers.filter((s) => !s.isOfficial);

  const allCategories = [
    { id: "all", label: "All Servers", count: total },
    ...categories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      count: cat.count,
    })),
  ];

  return (
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
                onClick={() => onCategoryChange(cat.id)}
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
                onClick={onClearFilters}
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
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Server Card Component
// ============================================================================

function ServerCard({ server }: { server: McpServer }) {
  const displayName = server.displayName || server.name;
  const category = server.categories?.[0];

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
// Library Card Component
// ============================================================================

function LibraryCard({ library }: { library: Library }) {
  return (
    <Link
      to="/libraries/$libraryId"
      params={{ libraryId: library.id }}
      className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {library.iconUrl ? (
            <img
              src={library.iconUrl}
              alt={library.name}
              className="h-10 w-10 rounded-lg bg-muted object-contain p-1"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{library.name}</h3>
              {library.isFeatured && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Star className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {library.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="rounded-md bg-muted px-1.5 py-0.5 capitalize text-muted-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {library.description || "No description available"}
      </p>

      <div className="flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span>{library.totalChunks.toLocaleString()} chunks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>~</span>
          <span>{(library.totalTokens / 1000).toFixed(1)}k tokens</span>
        </div>
        {library.lastIndexedAt && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            <span>
              Updated {new Date(library.lastIndexedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ============================================================================
// Pending Library Card Component
// ============================================================================

function PendingLibraryCard({ library }: { library: Library }) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4 opacity-60">
      <div className="flex items-center gap-3">
        {library.iconUrl ? (
          <img
            src={library.iconUrl}
            alt={library.name}
            className="h-8 w-8 rounded-lg bg-muted object-contain p-1"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div>
          <h3 className="font-medium text-muted-foreground">{library.name}</h3>
          <div className="flex items-center gap-1.5 text-xs">
            {library.indexStatus === "indexing" ? (
              <span className="flex items-center gap-1 text-primary">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Indexing...
              </span>
            ) : library.indexStatus === "failed" ? (
              <span className="text-destructive">Failed</span>
            ) : (
              <span className="text-muted-foreground">Pending</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Skills Content Component
// ============================================================================

function SkillsContent({
  searchQuery,
  selectedCategory,
  onCategoryChange,
  onClearFilters,
}: {
  searchQuery: string;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}) {
  const { data: skillsData } = useSuspenseQuery(
    skillsQueryOptions({
      search: searchQuery || undefined,
      category: selectedCategory === "all" ? undefined : selectedCategory,
      limit: 100,
    })
  );
  const { data: categories } = useSuspenseQuery(skillCategoriesQueryOptions);

  const skills = skillsData.skills;
  const total = skillsData.total;

  const officialSkills = skills.filter((s) => s.isOfficial);
  const communitySkills = skills.filter((s) => !s.isOfficial);

  const allCategories = [
    { id: "all", label: "All Skills", count: total },
    ...categories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      count: cat.count,
    })),
  ];

  return (
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
                onClick={() => onCategoryChange(cat.id)}
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
          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800/50 dark:bg-purple-900/20">
            <div className="flex items-start gap-3">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="font-medium text-purple-900 dark:text-purple-100">
                  Agent Skills
                </h3>
                <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
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
                onClick={onClearFilters}
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
                    {officialSkills.map((skill) => (
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
                    {communitySkills.map((skill) => (
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
  );
}

// ============================================================================
// Skill Card Component
// ============================================================================

function SkillCard({ skill }: { skill: Skill }) {
  const typeColors: Record<string, string> = {
    analysis: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    generation: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    transformation: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    integration: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    utility: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div
      className="group flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 cursor-pointer"
      onClick={() => {
        // TODO: Navigate to skill detail page when created
        window.open(`https://api.nexus.yogan.dev/api/skills/${skill.id}/content`, "_blank");
      }}
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
    </div>
  );
}
