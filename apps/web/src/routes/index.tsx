import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
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
  TrendingUp,
  Flame,
  Clock,
  ExternalLink,
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

function extractDomain(url: string | null): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  } catch {
    return "";
  }
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
  beforeLoad: async ({ context }) => {
    const { session } = context;
    if (session?.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
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
  const { sort, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const inputRef = useRef<HTMLInputElement>(null);

  const activeSort = (sort || "popular") as SortMode;
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
  
  // Effective sort - when searching, we show search results
  const effectiveSort = isSearching ? "search" : activeSort;

  // Sync input with URL
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Auto-search when debounced value changes
  useEffect(() => {
    const trimmed = debouncedInputValue.trim();
    const currentUrlQuery = searchQuery || "";
    if (trimmed !== currentUrlQuery && !(trimmed === "" && currentUrlQuery === "")) {
      navigate({
        search: (prev) => ({
          ...prev,
          q: trimmed || undefined,
        }),
      });
    }
  }, [debouncedInputValue, navigate, searchQuery]);

  // Reset state when loader data changes
  useEffect(() => {
    setItems(loaderData.items);
    setHasMore(loaderData.hasMore);
    setCursor(PAGE_SIZE);
  }, [loaderData]);

  // Client-side sort when sort mode changes (no refetch needed)
  const sortedItems = useMemo(() => {
    if (isSearching) return items; // Search results come pre-sorted
    return normalizeAndSort([...items], activeSort);
  }, [items, activeSort, isSearching]);

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

  const handleSortChange = (newSort: SortMode) => {
    // Blur search and clear search state
    setSearchFocused(false);
    inputRef.current?.blur();
    navigate({
      search: {
        sort: newSort === "popular" ? undefined : newSort,
        q: undefined, // Clear search when switching tabs
      },
    });
  };

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

  // Tabs configuration
  const tabs: { id: SortMode | "search"; label: string; icon: React.ReactNode }[] = [
    { id: "popular", label: "POPULAR", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { id: "trending", label: "TRENDING", icon: <Flame className="h-3.5 w-3.5" /> },
    { id: "recent", label: "RECENT", icon: <Clock className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[880px] px-4 lg:px-0">
        {/* Hero */}
        <div className="pt-20">
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
            Ship faster with pre-indexed docs,
            <br />
            MCP servers, and AI skills
          </h1>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            <span className="font-bold text-foreground">~5K TOKENS</span> instead of ~500K{" "}
            <span className="text-border">|</span>{" "}
            Vector embeddings with semantic search{" "}
            <span className="text-border">|</span>{" "}
            Always up-to-date
          </p>
        </div>

        {/* Pro hint section */}
        <div className="mb-12 mt-4">
          <Link
            to="/dashboard/billing"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold text-muted-foreground transition-colors hover:text-accent"
          >
            <span className="text-accent">PRO</span>
            <span className="text-border">→</span>
            <span>Unlimited queries</span>
            <span className="hidden text-border sm:inline">·</span>
            <span className="hidden sm:inline">Private repos</span>
            <span className="hidden text-border sm:inline">·</span>
            <span className="hidden sm:inline">Nexus Brain</span>
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex h-12 max-w-md items-center gap-2 border border-border bg-background px-3 font-mono">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Search docs, servers, skills..."
              className="h-full flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
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
        <div className="mb-6 flex items-center gap-0 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSortChange(t.id as SortMode)}
              className={`flex items-center gap-2 border-b px-4 py-2.5 font-mono text-xs font-bold tracking-wide transition-colors -mb-px ${
                effectiveSort === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
          {/* Search tab - only visible when searching */}
          {isSearching && (
            <button
              onClick={handleSearchTabClick}
              className="flex items-center gap-2 border-b border-accent px-4 py-2.5 font-mono text-xs font-bold tracking-wide text-accent -mb-px"
            >
              <Search className="h-3.5 w-3.5" />
              SEARCH
            </button>
          )}
        </div>

        {/* Results count */}
        {searchQuery && (
          <div className="mb-4 font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {sortedItems.length} result{sortedItems.length !== 1 ? "s" : ""} for "{searchQuery}"
          </div>
        )}

        {/* Content */}
        <div>
          {sortedItems.map((item, idx) => (
            <ContentRow key={`${item.type}-${item.id}`} item={item} isLast={idx === sortedItems.length - 1} />
          ))}
        </div>

        {/* Empty state */}
        {sortedItems.length === 0 && !isLoadingMore && (
          <div className="py-16 text-center">
            <Search className="mx-auto h-12 w-12 text-border" />
            <p className="mt-4 font-mono text-sm text-muted-foreground">
              {searchQuery ? `No results for "${searchQuery}"` : "Nothing here yet"}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-4 font-mono text-xs font-bold uppercase text-accent hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* View More button */}
        <div className="mt-8 flex items-center justify-center py-4">
          {isLoadingMore && (
            <div className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              Loading...
            </div>
          )}
          {!isLoadingMore && hasMore && sortedItems.length > 0 && (
            <button
              onClick={loadMore}
              className="border border-border bg-background px-6 py-2 font-mono text-xs font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-muted"
            >
              View More
            </button>
          )}
          {!hasMore && sortedItems.length > 0 && (
            <p className="font-mono text-xs uppercase text-muted-foreground">End of list</p>
          )}
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-border pb-12 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
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

          <div className="mt-6 font-mono text-xs text-muted-foreground">
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
        return <BookOpen className="h-4 w-4 text-muted-foreground" />;
      case "server":
        return <Server className="h-4 w-4 text-muted-foreground" />;
      case "skill":
        return <Zap className="h-4 w-4 text-accent" />;
    }
  };

  const getName = () => {
    if (item.type === "server") {
      return item.displayName || item.name;
    }
    return item.name;
  };

  const getDomain = () => {
    if (item.type === "doc") {
      return extractDomain(item.sourceUrl);
    }
    if (item.type === "server") {
      return extractDomain(item.repositoryUrl);
    }
    return extractDomain(item.sourceUrl);
  };

  const getStat1 = () => {
    if (item.type === "doc") {
      return formatNumber(item.totalTokens);
    }
    if (item.type === "server") {
      return formatNumber(item.weeklyDownloads);
    }
    return formatNumber(item.installCount);
  };

  const getStat2 = () => {
    if (item.type === "doc") {
      return item.totalChunks.toLocaleString();
    }
    if (item.type === "server") {
      return `★ ${formatNumber(item.githubStars)}`;
    }
    return `↑ ${formatNumber(item.usageCount)}`;
  };

  const getRelativeTime = () => {
    if (item.type === "doc") {
      return formatRelativeTime(item.lastIndexedAt);
    }
    return formatRelativeTime(item.updatedAt);
  };

  const getBadges = () => {
    const badges: string[] = [];
    if (item.type === "doc" && item.isFeatured) {
      badges.push("Featured");
    }
    if (item.type === "server" && item.isOfficial) {
      badges.push("Official");
    }
    return badges;
  };

  const domain = getDomain();

  return (
    <Link
      to={getDetailUrl()}
      className={`group flex items-center gap-3 py-3 transition-colors ${!isLast ? "border-b border-border" : ""}`}
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-muted">
        {getIcon()}
      </div>

      {/* Name + description */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-sm font-bold text-foreground transition-colors group-hover:text-accent">
            {getName()}
          </span>
          {getBadges().map((badge) => (
            <span
              key={badge}
              className="shrink-0 border border-accent bg-accent/10 px-1 py-0.5 font-mono text-[10px] font-bold uppercase text-accent"
            >
              {badge}
            </span>
          ))}
        </div>
        {item.description && (
          <p className="truncate font-mono text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>

      {/* Domain */}
      {domain && (
        <div className="hidden w-32 shrink-0 items-center gap-1 truncate font-mono text-xs text-muted-foreground sm:flex">
          <ExternalLink className="h-3 w-3 shrink-0" />
          {domain}
        </div>
      )}

      {/* Stats */}
      <div className="hidden w-14 shrink-0 text-right font-mono text-xs text-muted-foreground md:block">
        {getStat1()}
      </div>
      <div className="hidden w-14 shrink-0 text-right font-mono text-xs text-muted-foreground md:block">
        {getStat2()}
      </div>

      {/* Relative time */}
      <div className="hidden w-16 shrink-0 text-right font-mono text-xs text-muted-foreground lg:block">
        {getRelativeTime()}
      </div>
    </Link>
  );
}
