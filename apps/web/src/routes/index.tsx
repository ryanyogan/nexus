import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { z } from "zod";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";
import { sql, eq, desc, like, or, and } from "drizzle-orm";
import { withLoggingInput } from "../lib/server-fn";
import { useDebounce } from "../hooks/use-debounce";
import {
  Search,
  BookOpen,
  Server,
  Zap,
  Github,
  ArrowUpRight,
  X,
  Loader2,
  Layers,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface LibraryItem {
  type: "doc";
  id: string;
  name: string;
  description: string | null;
  sourceUrl: string | null;
  totalTokens: number;
  totalChunks: number;
  lastIndexedAt: string | null;
  isFeatured: boolean;
  // For trending
  lastQueriedAt: string | null;
  totalQueries: number;
}

interface ServerItem {
  type: "server";
  id: string;
  name: string;
  displayName: string | null;
  description: string | null;
  repositoryUrl: string | null;
  weeklyDownloads: number;
  githubStars: number;
  updatedAt: string;
  isOfficial: boolean;
  // For trending
  lastDiscoveredAt: string | null;
  totalDiscoveries: number;
}

interface SkillItem {
  type: "skill";
  id: string;
  name: string;
  description: string | null;
  sourceUrl: string | null;
  installCount: number;
  usageCount: number;
  updatedAt: string;
  skillType: string;
  // For trending
  lastQueriedAt: string | null;
}

type ContentItem = LibraryItem | ServerItem | SkillItem;
type SortMode = "popular" | "trending" | "recent";
type ContentFilter = "all" | "docs" | "servers" | "skills";

interface HomePageData {
  stats: {
    libraries: number;
    servers: number;
    skills: number;
  };
  items: ContentItem[];
  hasMore: boolean;
  total: number;
}

// ============================================================================
// Constants
// ============================================================================

const PAGE_SIZE = 10;

// ============================================================================
// Utility Functions
// ============================================================================

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// ============================================================================
// Server Functions
// ============================================================================

const getHomePageData = createServerFn({ method: "GET" })
  .inputValidator((data: { sort: SortMode; q?: string; cursor?: number }) => data)
  .handler(
    withLoggingInput("getHomePageData", async ({ data }): Promise<HomePageData> => {
      const db = drizzle(env.DB, { schema });
      const { sort, q, cursor = 0 } = data;

      // Get stats (always)
      const [libraryStats] = await db
        .select({
          total: sql<number>`count(*)`,
          indexed: sql<number>`sum(case when index_status = 'indexed' then 1 else 0 end)`,
        })
        .from(schema.libraries)
        .where(eq(schema.libraries.isActive, true));

      const [serverStats] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.mcpServers)
        .where(eq(schema.mcpServers.isActive, true));

      const [skillStats] = await db
        .select({ total: sql<number>`count(*)` })
        .from(schema.skills)
        .where(eq(schema.skills.isActive, true));

      const stats = {
        libraries: Number(libraryStats?.indexed ?? 0),
        servers: Number(serverStats?.total ?? 0),
        skills: Number(skillStats?.total ?? 0),
      };

      // Build queries for all three content types
      const items: ContentItem[] = [];
      
      // Determine sort order for each type
      const getLibraryOrder = () => {
        switch (sort) {
          case "popular": return [desc(schema.libraries.totalChunks)];
          case "trending": return [desc(schema.libraryStats.lastQueriedAt), desc(schema.libraryStats.totalQueries)];
          case "recent": return [desc(schema.libraries.lastIndexedAt)];
        }
      };
      
      const getServerOrder = () => {
        switch (sort) {
          case "popular": return [desc(schema.mcpServers.weeklyDownloads), desc(schema.mcpServers.githubStars)];
          case "trending": return [desc(schema.mcpServerStats.lastDiscoveredAt), desc(schema.mcpServerStats.totalDiscoveries)];
          case "recent": return [desc(schema.mcpServers.updatedAt)];
        }
      };
      
      const getSkillOrder = () => {
        switch (sort) {
          case "popular": return [desc(schema.skills.installCount), desc(schema.skills.usageCount)];
          case "trending": return [desc(schema.skills.lastQueriedAt), desc(schema.skills.usageCount)];
          case "recent": return [desc(schema.skills.updatedAt)];
        }
      };

      // Fetch libraries with stats
      const libraryConditions = [eq(schema.libraries.indexStatus, "indexed")];
      if (q) {
        libraryConditions.push(
          or(
            like(schema.libraries.name, `%${q}%`),
            like(schema.libraries.description, `%${q}%`)
          )!
        );
      }
      
      const libraryResults = await db
        .select({
          id: schema.libraries.id,
          name: schema.libraries.name,
          description: schema.libraries.description,
          sourceUrl: schema.libraries.sourceUrl,
          totalTokens: schema.libraries.totalTokens,
          totalChunks: schema.libraries.totalChunks,
          lastIndexedAt: schema.libraries.lastIndexedAt,
          isFeatured: schema.libraries.isFeatured,
          lastQueriedAt: schema.libraryStats.lastQueriedAt,
          totalQueries: schema.libraryStats.totalQueries,
        })
        .from(schema.libraries)
        .leftJoin(schema.libraryStats, eq(schema.libraries.id, schema.libraryStats.libraryId))
        .where(and(...libraryConditions))
        .orderBy(...getLibraryOrder())
        .limit(PAGE_SIZE);

      for (const lib of libraryResults) {
        items.push({
          type: "doc",
          id: lib.id,
          name: lib.name,
          description: lib.description,
          sourceUrl: lib.sourceUrl,
          totalTokens: lib.totalTokens,
          totalChunks: lib.totalChunks,
          lastIndexedAt: lib.lastIndexedAt,
          isFeatured: lib.isFeatured,
          lastQueriedAt: lib.lastQueriedAt,
          totalQueries: lib.totalQueries ?? 0,
        });
      }

      // Fetch servers with stats
      const serverConditions = [eq(schema.mcpServers.isActive, true)];
      if (q) {
        serverConditions.push(
          sql`(${schema.mcpServers.name} LIKE ${"%" + q + "%"} OR ${schema.mcpServers.displayName} LIKE ${"%" + q + "%"} OR ${schema.mcpServers.description} LIKE ${"%" + q + "%"})`
        );
      }
      
      const serverResults = await db
        .select({
          id: schema.mcpServers.id,
          name: schema.mcpServers.name,
          displayName: schema.mcpServers.displayName,
          description: schema.mcpServers.description,
          repositoryUrl: schema.mcpServers.repositoryUrl,
          weeklyDownloads: schema.mcpServers.weeklyDownloads,
          githubStars: schema.mcpServers.githubStars,
          updatedAt: schema.mcpServers.updatedAt,
          isOfficial: schema.mcpServers.isOfficial,
          lastDiscoveredAt: schema.mcpServerStats.lastDiscoveredAt,
          totalDiscoveries: schema.mcpServerStats.totalDiscoveries,
        })
        .from(schema.mcpServers)
        .leftJoin(schema.mcpServerStats, eq(schema.mcpServers.id, schema.mcpServerStats.serverId))
        .where(and(...serverConditions))
        .orderBy(...getServerOrder())
        .limit(PAGE_SIZE);

      for (const server of serverResults) {
        items.push({
          type: "server",
          id: server.id,
          name: server.name,
          displayName: server.displayName,
          description: server.description,
          repositoryUrl: server.repositoryUrl,
          weeklyDownloads: server.weeklyDownloads,
          githubStars: server.githubStars,
          updatedAt: server.updatedAt,
          isOfficial: server.isOfficial,
          lastDiscoveredAt: server.lastDiscoveredAt,
          totalDiscoveries: server.totalDiscoveries ?? 0,
        });
      }

      // Fetch skills
      const skillConditions = [eq(schema.skills.isActive, true)];
      if (q) {
        skillConditions.push(
          sql`(${schema.skills.name} LIKE ${"%" + q + "%"} OR ${schema.skills.description} LIKE ${"%" + q + "%"})`
        );
      }
      
      const skillResults = await db
        .select({
          id: schema.skills.id,
          name: schema.skills.name,
          description: schema.skills.description,
          sourceUrl: schema.skills.sourceUrl,
          installCount: schema.skills.installCount,
          usageCount: schema.skills.usageCount,
          updatedAt: schema.skills.updatedAt,
          type: schema.skills.type,
          lastQueriedAt: schema.skills.lastQueriedAt,
        })
        .from(schema.skills)
        .where(and(...skillConditions))
        .orderBy(...getSkillOrder())
        .limit(PAGE_SIZE);

      for (const skill of skillResults) {
        items.push({
          type: "skill",
          id: skill.id,
          name: skill.name,
          description: skill.description,
          sourceUrl: skill.sourceUrl,
          installCount: skill.installCount,
          usageCount: skill.usageCount,
          updatedAt: skill.updatedAt,
          skillType: skill.type,
          lastQueriedAt: skill.lastQueriedAt,
        });
      }

      // Sort combined results by normalized score
      const sortedItems = normalizeAndSort(items, sort);
      
      // Calculate total
      const total = stats.libraries + stats.servers + stats.skills;

      return {
        stats,
        items: sortedItems.slice(cursor, cursor + PAGE_SIZE),
        hasMore: sortedItems.length > cursor + PAGE_SIZE,
        total,
      };
    })
  );

// Normalize scores across types and sort
function normalizeAndSort(items: ContentItem[], sort: SortMode): ContentItem[] {
  // Calculate max values for each type for normalization
  const docs = items.filter((i): i is LibraryItem => i.type === "doc");
  const servers = items.filter((i): i is ServerItem => i.type === "server");
  const skills = items.filter((i): i is SkillItem => i.type === "skill");
  
  const maxDocScore = Math.max(...docs.map(d => getDocScore(d, sort)), 1);
  const maxServerScore = Math.max(...servers.map(s => getServerScore(s, sort)), 1);
  const maxSkillScore = Math.max(...skills.map(s => getSkillScore(s, sort)), 1);
  
  // Assign normalized scores
  const scored = items.map(item => {
    let normalizedScore = 0;
    if (item.type === "doc") {
      normalizedScore = getDocScore(item, sort) / maxDocScore;
    } else if (item.type === "server") {
      normalizedScore = getServerScore(item, sort) / maxServerScore;
    } else {
      normalizedScore = getSkillScore(item, sort) / maxSkillScore;
    }
    return { item, score: normalizedScore };
  });
  
  // Sort by normalized score
  scored.sort((a, b) => b.score - a.score);
  
  return scored.map(s => s.item);
}

function getDocScore(doc: LibraryItem, sort: SortMode): number {
  switch (sort) {
    case "popular": return doc.totalChunks;
    case "trending": return doc.totalQueries + (doc.lastQueriedAt ? 1000 : 0);
    case "recent": return doc.lastIndexedAt ? new Date(doc.lastIndexedAt).getTime() : 0;
  }
}

function getServerScore(server: ServerItem, sort: SortMode): number {
  switch (sort) {
    case "popular": return server.weeklyDownloads + server.githubStars;
    case "trending": return server.totalDiscoveries + (server.lastDiscoveredAt ? 1000 : 0);
    case "recent": return new Date(server.updatedAt).getTime();
  }
}

function getSkillScore(skill: SkillItem, sort: SortMode): number {
  switch (sort) {
    case "popular": return skill.installCount + skill.usageCount;
    case "trending": return skill.usageCount + (skill.lastQueriedAt ? 1000 : 0);
    case "recent": return new Date(skill.updatedAt).getTime();
  }
}

// ============================================================================
// Search Params Schema
// ============================================================================

const searchSchema = z.object({
  sort: z.enum(["popular", "trending", "recent"]).optional().catch("popular"),
  filter: z.enum(["all", "docs", "servers", "skills"]).optional().catch("all"),
  q: z.string().optional().catch(undefined),
});

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    // Only q triggers refetch - sort is handled client-side
  }),
  loader: async ({ deps }) => {
    // Always fetch with popular sort on initial load
    // Client will re-sort based on selected tab
    return getHomePageData({
      data: {
        sort: "popular",
        q: deps.q,
        cursor: 0,
      },
    });
  },
  component: HomePage,
});

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

  // Local state
  const [items, setItems] = useState(loaderData.items);
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
  // Only navigate if the debounced value matches current input (prevents race conditions on clear)
  useEffect(() => {
    const trimmed = debouncedInputValue.trim();
    const currentUrlQuery = searchQuery || "";
    const currentInputTrimmed = inputValue.trim();
    
    // Only update URL if:
    // 1. Debounced value differs from URL
    // 2. Debounced value matches current input (no pending changes)
    // 3. Not both empty (no-op)
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
    
    // Apply content type filter
    if (activeFilter !== "all") {
      const typeMap: Record<ContentFilter, string> = {
        all: "all",
        docs: "doc",
        servers: "server",
        skills: "skill",
      };
      filtered = items.filter(item => item.type === typeMap[activeFilter]);
    }
    
    if (isSearching) return filtered; // Search results come pre-sorted
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
  }, [activeSort, hasMore, cursor, searchQuery, isLoadingMore]);

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
    // Only clear focus state if there's no search query
    if (!inputValue.trim()) {
      setSearchFocused(false);
    }
  };

  // Tabs configuration - content type filters with icons
  const tabs: { id: ContentFilter; label: string; icon: "docs" | "servers" | "skills" | "flows" | null; href?: string }[] = [
    { id: "all", label: "ALL", icon: null },
    { id: "docs", label: "DOCS", icon: "docs" },
    { id: "servers", label: "SERVERS", icon: "servers" },
    { id: "skills", label: "SKILLS", icon: "skills" },
    { id: "all", label: "FLOWS", icon: "flows", href: "/dashboard/flows" },
  ];
  
  const getTabIcon = (iconType: "docs" | "servers" | "skills" | "flows" | null) => {
    if (!iconType) return null;
    const iconClass = "h-3 w-3 sm:h-3.5 sm:w-3.5";
    switch (iconType) {
      case "docs": return <BookOpen className={iconClass} />;
      case "servers": return <Server className={iconClass} />;
      case "skills": return <Zap className={iconClass} />;
      case "flows": return <Layers className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Hero */}
        <div className="pt-6 md:pt-12 lg:pt-16">
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl lg:text-3xl">
            Ship faster with pre-indexed docs,
            <br />
            MCP servers, and AI skills
          </h1>
          <p className="mt-3 font-mono text-xs text-muted-foreground sm:text-sm md:mt-4">
            <span className="font-bold text-foreground">~5K TOKENS</span> instead of ~500K{" "}
            <span className="text-border">|</span>{" "}
            Vector embeddings with semantic search{" "}
            <span className="text-border">|</span>{" "}
            Always up-to-date
          </p>
          <p className="mt-1.5 md:mt-2">
            <Link
              to="/plans"
              className="group inline-flex items-center gap-2 font-mono text-xs transition-colors sm:text-sm"
            >
              <span className="font-bold text-accent">PRO</span>
              <span className="text-muted-foreground">—</span>
              <span className="text-muted-foreground group-hover:text-foreground">
                <span className="sm:hidden">Unlimited access</span>
                <span className="hidden sm:inline">Unlimited queries, memory, private repos</span>
              </span>
              <ArrowUpRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
            </Link>
          </p>
        </div>

        {/* Search + Tabs */}
        <div className="mt-8 md:mt-12 lg:mt-16">
          <form onSubmit={handleSearch}>
            <div className="flex h-10 max-w-md items-center gap-3 border border-foreground bg-background px-3 font-mono md:h-11 shadow-[3px_3px_0_0_rgba(0,0,0,1)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.3)]">
              <Search className="h-4 w-4 shrink-0 text-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    clearSearch();
                    inputRef.current?.blur();
                  }
                }}
                placeholder="Search docs, servers, skills..."
                className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Tabs */}
          <div className="mt-6 mb-4 flex items-center gap-0 border-b border-border md:mt-8 md:mb-6">
          {tabs.map((t, idx) => {
            const isActive = !isSearching && activeFilter === t.id && !t.href;
            
            // External link tab (e.g., Flows links to dashboard)
            if (t.href) {
              return (
                <Link
                  key={`${t.id}-${idx}`}
                  to={t.href as "/dashboard/flows"}
                  className="flex items-center gap-1 border-b border-transparent px-2 py-2 font-mono text-xs font-bold tracking-wide text-muted-foreground hover:text-foreground transition-colors -mb-px sm:gap-1.5 sm:px-4 md:py-2.5"
                >
                  {getTabIcon(t.icon)}
                  <span className={t.icon ? "hidden sm:inline" : ""}>{t.label}</span>
                </Link>
              );
            }
            
            return (
              <Link
                key={t.id}
                to="."
                search={{ filter: t.id === "all" ? undefined : t.id }}
                resetScroll={false}
                onClick={() => {
                  setSearchFocused(false);
                  setInputValue("");
                  inputRef.current?.blur();
                }}
                className={`flex items-center gap-1 border-b px-2 py-2 font-mono text-xs font-bold tracking-wide transition-colors -mb-px sm:gap-1.5 sm:px-4 md:py-2.5 ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {getTabIcon(t.icon)}
                <span className={t.icon ? "hidden sm:inline" : ""}>{t.label}</span>
              </Link>
            );
          })}
          {/* Search tab - only visible when searching */}
          {isSearching && (
            <button
              onClick={handleSearchTabClick}
              className="flex items-center gap-1 border-b border-accent px-2 py-2 font-mono text-xs font-bold tracking-wide text-accent -mb-px sm:gap-1.5 sm:px-4 md:py-2.5"
            >
              <Search className="h-3 w-3" />
              <span className="hidden sm:inline">SEARCH</span>
            </button>
          )}
        </div>
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
              <ContentRow key={`${item.type}-${item.id}`} item={item} isLast={idx === sortedItems.length - 1} />
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
                  onClick={clearSearch}
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
              <Link to="/submit" className="text-muted-foreground transition-colors hover:text-accent">
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
            </div>
          </div>

          <div className="mt-4 font-mono text-xs text-muted-foreground md:mt-6">
            <p>
              Pre-indexed docs with vector embeddings <span className="text-border">|</span> ~5K tokens instead of
              ~500K <span className="text-border">|</span> Free tier: 2,000 calls/month{" "}
              <span className="text-border">|</span>{" "}
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

// ============================================================================
// Content Row Component
// ============================================================================

function ContentRow({ item, isLast }: { item: ContentItem; isLast: boolean }) {
  const getDetailUrl = () => {
    switch (item.type) {
      case "doc":
        return `/explore/docs/${item.id}`;
      case "server":
        return `/explore/servers/${item.id}`;
      case "skill":
        return `/explore/skills/${item.id}`;
    }
  };

  const getIcon = () => {
    switch (item.type) {
      case "doc":
        return <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case "server":
        return <Server className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
      case "skill":
        return <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />;
    }
  };

  const getName = () => {
    if (item.type === "server") {
      return item.displayName || item.name;
    }
    return item.name;
  };

  // Get stats with labels based on item type
  const getStats = (): { value: string; label: string }[] => {
    if (item.type === "doc") {
      return [
        { value: formatNumber(item.totalTokens), label: "tokens" },
        { value: formatNumber(item.totalChunks), label: "chunks" },
      ];
    }
    if (item.type === "server") {
      return [
        { value: formatNumber(item.githubStars), label: "stars" },
        { value: formatNumber(item.weeklyDownloads), label: "downloads" },
      ];
    }
    // skills
    return [
      { value: formatNumber(item.installCount), label: "installs" },
      { value: formatNumber(item.usageCount), label: "uses" },
    ];
  };

  const stats = getStats();

  return (
    <Link
      to={getDetailUrl()}
      className={`group flex items-center gap-2 py-2 transition-colors hover:bg-muted/30 md:gap-3 md:py-2.5 lg:py-3 ${!isLast ? "border-b border-border/50" : ""}`}
    >
      {/* Icon */}
      <div className="w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground sm:w-4">
        {getIcon()}
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1">
        <span className="truncate font-mono text-xs text-foreground transition-colors group-hover:text-accent sm:text-sm">
          {getName()}
        </span>
      </div>

      {/* Mobile: show first stat only */}
      <div className="flex items-center font-mono text-xs text-muted-foreground sm:hidden">
        <span className="tabular-nums">
          <span className="text-foreground/70">{stats[0].value}</span>
          <span className="ml-1 text-[10px] text-muted-foreground/60">{stats[0].label}</span>
        </span>
      </div>

      {/* Desktop: show all stats */}
      <div className="hidden items-center gap-3 font-mono text-xs text-muted-foreground sm:flex md:gap-4">
        {stats.map((stat, idx) => (
          <span key={idx} className="tabular-nums">
            <span className="text-foreground/70">{stat.value}</span>
            <span className="ml-1 text-[10px] text-muted-foreground/60 md:text-xs">{stat.label}</span>
          </span>
        ))}
      </div>
    </Link>
  );
}
