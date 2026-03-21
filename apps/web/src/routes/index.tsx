import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { useState, useEffect, useRef, useMemo } from "react";
import { z } from "zod";
import { Search, Github, ArrowUpRight, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "../hooks/use-debounce";
import { getHomePageData, normalizeAndSort } from "../server/home";
import { ContentRow, ContentListSkeleton } from "../components/home";
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
        <div className="animate-pulse pt-10 md:pt-14 lg:pt-20">
          <div className="mb-3 h-12 w-32 rounded bg-muted sm:h-14 lg:h-16" />
          <div className="mb-2 h-8 w-64 rounded bg-muted sm:w-80" />
          <div className="mb-5 h-6 w-96 rounded bg-muted" />
          <div className="h-4 w-72 rounded bg-muted" />
        </div>

        {/* Search Skeleton */}
        <div className="mt-10 animate-pulse md:mt-12 lg:mt-16">
          <div className="h-12 max-w-lg rounded border border-border bg-muted" />
          <div className="mb-5 mt-8 flex items-center gap-4 border-b border-border pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-16 rounded bg-muted" />
            ))}
          </div>
        </div>

        {/* Content List Skeleton */}
        <ContentListSkeleton count={10} />
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
        <div className="pt-10 md:pt-14 lg:pt-20">
          <h1 className="font-mono text-4xl font-black uppercase tracking-tight text-accent sm:text-5xl lg:text-6xl">
            Ship.
          </h1>
          <p className="mt-3 font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl md:mt-4 lg:text-3xl">
            Docs compressed. Stacks ready.
          </p>
          <p className="mt-2 font-mono text-base uppercase tracking-wide text-foreground/80 sm:text-lg md:mt-3 lg:text-xl">
            MCP servers, starter stacks, persistent <span className="text-accent">memory</span> —
            pre-indexed.
          </p>
          <p className="mt-5 font-mono text-sm text-muted-foreground sm:text-sm md:mt-6">
            <span className="font-bold text-foreground">~5K tokens</span>
            <span className="mx-2 sm:mx-2"> instead of ~500K</span>
            <span className="text-border">|</span>
            <span className="mx-2 sm:mx-2">Semantic search</span>
            <span className="text-border">|</span>
            <span className="mx-2 sm:mx-2">Always current</span>
            <span className="text-border">|</span>
            <Link
              to="/plans"
              className="group ml-2 inline-flex items-center gap-1 transition-colors sm:ml-2"
            >
              <span className="font-bold text-accent">PRO</span>
              <ArrowUpRight className="h-3 w-3 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>

        {/* Search + Tabs */}
        <div className="mt-10 md:mt-12 lg:mt-16">
          <form onSubmit={handleSearch}>
            <div className="flex h-12 max-w-lg items-center gap-4 border border-foreground bg-background px-4 font-mono shadow-[3px_3px_0_0_rgba(0,0,0,1)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.3)] md:h-12">
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

          {/* Content List - slightly faded during refetch for subtle feedback */}
          <div className={cn(isRefetching && "opacity-60 transition-opacity")}>
            {sortedItems.map((item, idx) => (
              <ContentRow
                key={`${item.type}-${item.id}`}
                item={item}
                isLast={idx === sortedItems.length - 1}
              />
            ))}
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

        {/* Bottom section */}
        <div className="mt-8 border-t border-border pb-8 pt-6 md:mt-12 md:pb-12 md:pt-8">
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
