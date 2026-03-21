import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { z } from "zod";
import { Search, Github, ArrowUpRight, X, Loader2 } from "lucide-react";
import { useDebounce } from "../hooks/use-debounce";
import { getHomePageData, normalizeAndSort, PAGE_SIZE } from "../server/home";
import { ContentRow, ContentListSkeleton } from "../components/home";
import { SearchTabs } from "../components/home/SearchTabs";
import type { SortMode, ContentFilter, ContentItem } from "../types/home";

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
  loaderDeps: ({ search }) => ({
    q: search.q,
    filter: search.filter,
  }),
  loader: async ({ deps }) => {
    return getHomePageData({
      data: {
        sort: "popular",
        filter: deps.filter,
        q: deps.q,
        cursor: 0,
      },
    });
  },
  pendingComponent: HomePageSkeleton,
  component: HomePage,
});

// ============================================================================
// Skeleton Component (Shows during route transitions)
// ============================================================================

function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Hero Skeleton */}
        <div className="pt-10 md:pt-14 lg:pt-20 animate-pulse">
          <div className="h-12 w-32 bg-muted rounded mb-3 sm:h-14 lg:h-16" />
          <div className="h-8 w-64 bg-muted rounded mb-2 sm:w-80" />
          <div className="h-6 w-96 bg-muted rounded mb-5" />
          <div className="h-4 w-72 bg-muted rounded" />
        </div>

        {/* Search Skeleton */}
        <div className="mt-10 md:mt-12 lg:mt-16 animate-pulse">
          <div className="h-12 max-w-lg bg-muted border border-border rounded" />
          <div className="mt-8 mb-5 flex items-center gap-4 border-b border-border pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-16 bg-muted rounded" />
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
  const loaderData = Route.useLoaderData();
  const { sort, filter, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSort = (sort || "popular") as SortMode;
  const activeFilter = (filter || "all") as ContentFilter;
  const searchQuery = q || "";

  // Local state for UI
  const [items, setItems] = useState<ContentItem[]>(loaderData.items);
  const [hasMore, setHasMore] = useState(loaderData.hasMore);
  const [cursor, setCursor] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [inputValue, setInputValue] = useState(searchQuery);
  const [searchFocused, setSearchFocused] = useState(false);

  // Debounce search input
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Determine if we're in search mode
  const isSearching = Boolean(searchQuery) || searchFocused;

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
      navigate({
        search: (prev) => ({
          ...prev,
          q: trimmed || undefined,
        }),
      });
    }
  }, [debouncedInputValue, navigate, searchQuery, inputValue]);

  // Reset state when loader data changes
  useEffect(() => {
    setItems(loaderData.items);
    setHasMore(loaderData.hasMore);
    setCursor(PAGE_SIZE);
  }, [loaderData]);

  // Client-side sort and filter
  const sortedItems = useMemo(() => {
    let filtered = items;

    // Apply content type filter for client-side filtering
    if (activeFilter !== "all") {
      const typeMap: Record<ContentFilter, string> = {
        all: "all",
        docs: "doc",
        servers: "server",
        skills: "skill",
        stacks: "stack",
        prompts: "prompt",
      };
      filtered = items.filter((item) => item.type === typeMap[activeFilter]);
    }

    if (isSearching) return filtered;
    return normalizeAndSort([...filtered], activeSort);
  }, [items, activeSort, activeFilter, isSearching]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const data = await getHomePageData({
        data: {
          sort: activeSort,
          filter: activeFilter,
          q: searchQuery || undefined,
          cursor,
        },
      });

      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setCursor((prev) => prev + PAGE_SIZE);
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeSort, activeFilter, hasMore, cursor, searchQuery, isLoadingMore]);

  const handleSearchTabClick = () => {
    inputRef.current?.focus();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
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
    navigate({
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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Hero Section */}
        <div className="pt-10 md:pt-14 lg:pt-20">
          <h1 className="font-mono text-4xl font-black uppercase tracking-tight text-accent sm:text-5xl lg:text-6xl">
            Ship.
          </h1>
          <p className="mt-3 font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl lg:text-3xl md:mt-4">
            Docs compressed. Stacks ready.
          </p>
          <p className="mt-2 font-mono text-base uppercase tracking-wide text-foreground/80 sm:text-lg lg:text-xl md:mt-3">
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
              className="group ml-2 sm:ml-2 inline-flex items-center gap-1 transition-colors"
            >
              <span className="font-bold text-accent">PRO</span>
              <ArrowUpRight className="h-3 w-3 text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </p>
        </div>

        {/* Search + Tabs */}
        <div className="mt-10 md:mt-12 lg:mt-16">
          <form onSubmit={handleSearch}>
            <div className="flex h-12 max-w-lg items-center gap-4 border border-foreground bg-background px-4 font-mono md:h-12 shadow-[3px_3px_0_0_rgba(0,0,0,1)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.3)]">
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
              {inputValue && (
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

          {/* Content List */}
          <div>
            {sortedItems.map((item, idx) => (
              <ContentRow
                key={`${item.type}-${item.id}`}
                item={item}
                isLast={idx === sortedItems.length - 1}
              />
            ))}
          </div>

          {/* Empty state */}
          {sortedItems.length === 0 && !isLoadingMore && (
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
            {isLoadingMore && (
              <div className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Loading...
              </div>
            )}
            {!isLoadingMore && hasMore && sortedItems.length > 0 && (
              <button
                onClick={loadMore}
                className="border border-border bg-background px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted sm:px-6 sm:py-2"
              >
                View More
              </button>
            )}
            {!hasMore && sortedItems.length > 0 && (
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
              <span>{loaderData.stats.libraries} libraries</span>
              <span className="text-border">|</span>
              <span>{loaderData.stats.servers} servers</span>
              <span className="text-border">|</span>
              <span>{loaderData.stats.skills} skills</span>
              <span className="text-border">|</span>
              <span>{loaderData.stats.stacks} stacks</span>
              <span className="text-border">|</span>
              <span>{loaderData.stats.prompts} prompts</span>
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
