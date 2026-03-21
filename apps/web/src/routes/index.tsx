import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect, useRef, useMemo } from "react";
import { z } from "zod";
import {
  Search,
  Github,
  ArrowUpRight,
  X,
  Loader2,
  BookOpen,
  Brain,
  Server,
  FileText,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "../hooks/use-debounce";
import { getHomePageData, normalizeAndSort } from "../server/home";
import {
  ContentRow,
  ContentListSkeleton,
  ContentCard,
  ContentGridSkeleton,
} from "../components/home";
import { SearchTabs } from "../components/home/SearchTabs";
import { queryKeys } from "../lib/query-keys";
import type { SortMode, ContentFilter } from "../types/home";

// ============================================================================
// Search Params Schema
// ============================================================================

const searchSchema = z.object({
  sort: z.enum(["popular", "trending", "recent"]).optional().catch("popular"),
  filter: z.enum(["all", "docs", "servers", "skills", "stacks", "prompts"]).optional().catch("all"),
  q: z.string().optional().catch(undefined),
});

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  // No loaderDeps - TanStack Query handles search param changes
  loader: async ({ context }) => {
    // Prefetch initial page data for SSR
    await context.queryClient.prefetchInfiniteQuery({
      queryKey: queryKeys.home.list({ sort: "popular", filter: "all", q: undefined }),
      queryFn: ({ pageParam = 0 }) =>
        getHomePageData({
          data: { sort: "popular", filter: "all", cursor: pageParam },
        }),
      initialPageParam: 0,
    });
    return {};
  },
  component: HomePage,
});

// ============================================================================
// Skeleton Component (Shows during initial load)
// ============================================================================

function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Hero Skeleton */}
        <div className="animate-pulse pt-12 md:pt-16 lg:pt-24">
          <div className="h-10 w-48 bg-muted sm:h-12 lg:h-14" />
          <div className="mt-4 h-6 w-64 bg-muted md:mt-5" />
          <div className="mt-6 flex gap-4 md:mt-8">
            <div className="h-4 w-24 bg-muted" />
            <div className="h-4 w-24 bg-muted" />
            <div className="h-4 w-20 bg-muted" />
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="mt-10 animate-pulse md:mt-12 lg:mt-16">
          <div className="h-12 border border-border bg-muted md:h-14" />
          <div className="mt-8 md:mt-10">
            {/* Mobile skeleton */}
            <div className="h-11 w-full border border-border bg-muted md:hidden" />
            {/* Desktop skeleton */}
            <div className="hidden items-center gap-2 md:flex">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 w-20 border border-border bg-muted" />
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid Skeleton - mobile list, desktop grid */}
        <div className="md:hidden">
          <ContentListSkeleton count={10} />
        </div>
        <div className="hidden md:block">
          <ContentGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function HomePage() {
  const { sort, filter, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSort = (sort || "popular") as SortMode;
  const activeFilter = (filter || "all") as ContentFilter;
  const searchQuery = q || "";

  // Local state for search input
  const [inputValue, setInputValue] = useState(searchQuery);
  const [searchFocused, setSearchFocused] = useState(false);

  // Debounce search input
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Determine if we're in search mode
  const isSearching = Boolean(searchQuery) || searchFocused;

  // ========================================
  // TanStack Query - Infinite Query
  // ========================================

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: queryKeys.home.list({
        sort: activeSort,
        filter: activeFilter,
        q: searchQuery || undefined,
      }),
      queryFn: ({ pageParam = 0 }) =>
        getHomePageData({
          data: {
            sort: activeSort,
            filter: activeFilter,
            q: searchQuery || undefined,
            cursor: pageParam,
          },
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
      // Keep previous data visible while fetching new data (smooth UX)
      placeholderData: keepPreviousData,
    });

  // Flatten pages into items
  const allItems = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  // Get stats from first page
  const stats = data?.pages[0]?.stats;

  // Client-side sort (only when not searching - search results are pre-sorted by relevance)
  const sortedItems = useMemo(() => {
    let filtered = allItems;

    // Apply content type filter (already filtered server-side, but double-check)
    if (activeFilter !== "all") {
      const typeMap: Record<ContentFilter, string> = {
        all: "all",
        docs: "doc",
        servers: "server",
        skills: "skill",
        stacks: "stack",
        prompts: "prompt",
      };
      filtered = allItems.filter((item) => item.type === typeMap[activeFilter]);
    }

    // Don't re-sort search results
    if (isSearching) return filtered;
    return normalizeAndSort([...filtered], activeSort);
  }, [allItems, activeSort, activeFilter, isSearching]);

  // ========================================
  // Search Input Effects
  // ========================================

  // Sync input with URL
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Auto-search when debounced value changes
  useEffect(() => {
    const trimmed = debouncedInputValue.trim();
    const currentUrlQuery = searchQuery || "";
    const currentInputTrimmed = inputValue.trim();

    if (
      trimmed !== currentUrlQuery &&
      trimmed === currentInputTrimmed &&
      !(trimmed === "" && currentUrlQuery === "")
    ) {
      void navigate({
        search: (prev) => ({
          ...prev,
          q: trimmed || undefined,
        }),
      });
    }
  }, [debouncedInputValue, navigate, searchQuery, inputValue]);

  // ========================================
  // Event Handlers
  // ========================================

  const handleSearchTabClick = () => {
    inputRef.current?.focus();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void navigate({
      search: (prev) => ({
        ...prev,
        q: inputValue.trim() || undefined,
      }),
    });
  };

  const clearSearch = () => {
    setInputValue("");
    setSearchFocused(false);
    inputRef.current?.blur();
  };

  const handleClearAndNavigate = () => {
    clearSearch();
    void navigate({
      search: (prev) => ({
        ...prev,
        q: undefined,
      }),
      replace: true,
    });
  };

  const handleInputFocus = () => {
    setSearchFocused(true);
  };

  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      setSearchFocused(false);
    }
  };

  // Show skeleton only on initial load (no cached data)
  if (isPending) {
    return <HomePageSkeleton />;
  }

  // Detect if we're fetching new search results (not loading more)
  const isRefetching = isFetching && !isFetchingNextPage;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Hero Section */}
        <div className="pt-12 md:pt-16 lg:pt-24">
          <h1 className="font-mono text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            NEXUS<span className="text-accent">.</span>
          </h1>
          <p className="mt-4 font-mono text-lg text-muted-foreground sm:text-xl md:mt-5 lg:text-2xl">
            Context for AI, pre-indexed.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-muted-foreground md:mt-8 md:text-sm">
            <span>
              <span className="font-bold text-foreground">~5K tokens</span> vs ~500K
            </span>
            <span className="hidden text-border sm:inline">|</span>
            <span>Semantic search</span>
            <span className="hidden text-border sm:inline">|</span>
            <span>Always current</span>
            <span className="hidden text-border sm:inline">|</span>
            <Link
              to="/plans"
              className="group inline-flex items-center gap-1 font-bold text-accent transition-colors hover:underline"
            >
              PRO
              <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Search + Tabs */}
        <div className="mt-10 md:mt-12 lg:mt-16">
          <form onSubmit={handleSearch}>
            <div className="flex h-12 items-center gap-4 border border-foreground bg-background px-4 font-mono shadow-[3px_3px_0_0_rgba(0,0,0,1)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.3)] md:h-14">
              <Search className="h-5 w-5 shrink-0 text-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleClearAndNavigate();
                  }
                }}
                placeholder="Search docs, servers, skills, prompts..."
                className="h-full flex-1 bg-transparent text-base text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              />
              {/* Show loading spinner during search/filter changes */}
              {isRefetching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />}
              {inputValue && !isRefetching && (
                <button
                  type="button"
                  onClick={handleClearAndNavigate}
                  className="shrink-0 p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>

          <SearchTabs
            activeFilter={activeFilter}
            isSearching={isSearching}
            onClearSearch={clearSearch}
            onSearchTabClick={handleSearchTabClick}
          />
        </div>

        {/* Results */}
        <div>
          {/* Results count */}
          {searchQuery && (
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-muted-foreground md:mb-4">
              {sortedItems.length} result{sortedItems.length !== 1 ? "s" : ""} for "{searchQuery}"
            </div>
          )}

          {/* Content display - slightly faded during refetch for subtle feedback */}
          <div className={cn(isRefetching && "opacity-60 transition-opacity")}>
            {/* Mobile: List view */}
            <div className="md:hidden">
              {sortedItems.map((item, idx) => (
                <ContentRow
                  key={`${item.type}-${item.id}`}
                  item={item}
                  isLast={idx === sortedItems.length - 1}
                />
              ))}
            </div>

            {/* Desktop: Grid view */}
            <div className="hidden md:block">
              <div className="grid grid-cols-2 gap-px bg-border border border-border">
                {sortedItems.map((item) => (
                  <ContentCard key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            </div>
          </div>

          {/* Empty state */}
          {sortedItems.length === 0 && !isFetching && (
            <div className="py-8 text-center md:py-12">
              <Search className="mx-auto h-8 w-8 text-border md:h-10 md:w-10" />
              <p className="mt-3 font-mono text-sm text-muted-foreground md:mt-4">
                {searchQuery ? `No results for "${searchQuery}"` : "Nothing here yet"}
              </p>
              {searchQuery && (
                <button
                  onClick={handleClearAndNavigate}
                  className="mt-3 font-mono text-xs font-bold uppercase text-accent hover:underline md:mt-4"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* View More button */}
          <div className="mt-4 flex items-center justify-center md:mt-6">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Loading...
              </div>
            )}
            {!isFetchingNextPage && hasNextPage && sortedItems.length > 0 && (
              <button
                onClick={() => void fetchNextPage()}
                className="border border-border bg-background px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted sm:px-6 sm:py-2"
              >
                View More
              </button>
            )}
            {!hasNextPage && sortedItems.length > 0 && (
              <p className="font-mono text-xs uppercase text-muted-foreground">End of list</p>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 md:mt-24">
          <div className="mb-6 md:mb-8">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              What's Inside
            </h2>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Everything to supercharge your AI coding workflow
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {/* Documentation */}
            <div className="bg-background p-5 transition-colors hover:bg-muted/30">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Docs
                </span>
              </div>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                500+ libraries pre-indexed with semantic search. Get accurate code examples, not
                hallucinations.
              </p>
            </div>

            {/* Memory */}
            <div className="bg-background p-5 transition-colors hover:bg-muted/30">
              <div className="mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Memory
                </span>
                <span className="border border-accent bg-accent px-1.5 py-0.5 font-mono text-[10px] font-bold text-background">
                  PRO
                </span>
              </div>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                Persistent context across sessions. Store decisions, conventions, and learnings
                permanently.
              </p>
            </div>

            {/* MCP Servers */}
            <div className="bg-background p-5 transition-colors hover:bg-muted/30">
              <div className="mb-3 flex items-center gap-2">
                <Server className="h-4 w-4 text-accent" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  MCP Servers
                </span>
              </div>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                Discover and configure MCP servers for databases, APIs, and cloud services.
              </p>
            </div>

            {/* Prompts */}
            <div className="bg-background p-5 transition-colors hover:bg-muted/30">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Prompts
                </span>
              </div>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                Save, share, and extend system prompts. Build on community templates or create your
                own.
              </p>
            </div>

            {/* Stacks */}
            <div className="bg-background p-5 transition-colors hover:bg-muted/30">
              <div className="mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  Stacks
                </span>
              </div>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                AI-powered project scaffolding. Compose instructions, CLI preferences, and repo
                patterns.
              </p>
            </div>

            {/* CTA */}
            <Link
              to="/plans"
              className="flex flex-col justify-center bg-accent/5 p-5 transition-colors hover:bg-accent/10"
            >
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-accent">
                Upgrade to Pro
              </span>
              <span className="mt-2 font-mono text-xs text-muted-foreground">
                Unlimited calls, memory, private repos →
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 border-t border-border pb-8 pt-6 md:mt-24 md:pb-12 md:pt-8">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase">
              <a
                href="https://docs.nexus.yogan.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent"
              >
                Docs
                <ArrowUpRight className="h-3 w-3" />
              </a>
              <span className="text-border">|</span>
              <Link
                to="/submit"
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                Add Library
              </Link>
              <span className="text-border">|</span>
              <a
                href="https://github.com/ryanyogan/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-accent"
              >
                <Github className="h-3 w-3" />
                GitHub
              </a>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
              <span>{stats?.libraries ?? 0} libraries</span>
              <span className="text-border">|</span>
              <span>{stats?.servers ?? 0} servers</span>
              <span className="text-border">|</span>
              <span>{stats?.skills ?? 0} skills</span>
              <span className="text-border">|</span>
              <span>{stats?.stacks ?? 0} stacks</span>
              <span className="text-border">|</span>
              <span>{stats?.prompts ?? 0} prompts</span>
            </div>
          </div>

          <div className="mt-4 font-mono text-xs text-muted-foreground md:mt-6">
            <p>
              Pre-indexed docs with vector embeddings <span className="text-border">|</span> ~5K
              tokens instead of ~500K <span className="text-border">|</span> Free tier: 2,000
              calls/month <span className="text-border">|</span>{" "}
              <Link to="/dashboard/billing" className="font-bold text-accent hover:underline">
                PRO FROM $5/MO
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
