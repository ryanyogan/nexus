import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  Search,
  ExternalLink,
  BookOpen,
  FileText,
  Clock,
  Star,
  X,
  Loader2,
} from "lucide-react";
import { LibraryCardSkeleton } from "../../components/skeletons";
import { LIBRARY_CATEGORIES } from "../../lib/api";
import { getDb } from "../../server/db";
import * as schema from "@nexus/db";
import { eq, like, or, desc, sql, and, inArray } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

interface Library {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  isFeatured: boolean;
  indexStatus: string;
  totalChunks: number;
  totalTokens: number;
  categories: string[];
  lastIndexedAt: string | null;
}

// ============================================================================
// Server Functions
// ============================================================================

const getLibrariesFn = createServerFn({ method: "GET" })
  .validator((data: { search?: string; category?: string; limit?: number }) => data)
  .handler(async ({ data }) => {
    const db = getDb();
    const { search, category, limit = 100 } = data;

    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(schema.libraries.name, `%${search}%`),
          like(schema.libraries.description, `%${search}%`)
        )
      );
    }

    if (category && category !== "all") {
      // Filter by category using JSON array
      conditions.push(
        sql`json_array_length(${schema.libraries.categories}) > 0 AND EXISTS (SELECT 1 FROM json_each(${schema.libraries.categories}) WHERE json_each.value = ${category})`
      );
    }

    const libraries = await db.query.libraries.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(schema.libraries.isFeatured), desc(schema.libraries.lastIndexedAt)],
      limit,
    });

    return {
      libraries: libraries.map((lib) => ({
        id: lib.id,
        name: lib.name,
        description: lib.description,
        iconUrl: lib.iconUrl,
        isFeatured: lib.isFeatured,
        indexStatus: lib.indexStatus,
        totalChunks: lib.totalChunks,
        totalTokens: lib.totalTokens,
        categories: lib.categories ?? [],
        lastIndexedAt: lib.lastIndexedAt?.toISOString() ?? null,
      })),
    };
  });

// ============================================================================
// Search Params Schema
// ============================================================================

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
});

type SearchParams = z.infer<typeof searchSchema>;

// ============================================================================
// Categories
// ============================================================================

const DOC_CATEGORIES = [
  { id: "all", label: "All" },
  ...LIBRARY_CATEGORIES,
];

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore/docs")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
  }),
  loader: async ({ deps }) => {
    return getLibrariesFn({
      data: {
        search: deps.q,
        category: deps.category,
        limit: 100,
      },
    });
  },
  pendingComponent: DocsPageSkeleton,
  component: DocsPage,
});

// ============================================================================
// Page Skeleton
// ============================================================================

function DocsPageSkeleton() {
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
                disabled
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted-foreground"
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <LibraryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function DocsPage() {
  const navigate = useNavigate({ from: "/explore/docs" });
  const { q, category } = Route.useSearch();
  const loaderData = Route.useLoaderData();
  
  const [libraries, setLibraries] = useState<Library[]>(loaderData.libraries);

  const searchQuery = q || "";
  const selectedCategory = category || "all";

  // Auto-refresh when there are indexing libraries
  const hasIndexingLibraries = libraries.some(
    (lib) => lib.indexStatus === "indexing"
  );

  useEffect(() => {
    if (!hasIndexingLibraries) return;
    
    const interval = setInterval(async () => {
      const data = await getLibrariesFn({
        data: {
          search: searchQuery || undefined,
          category: selectedCategory === "all" ? undefined : selectedCategory,
          limit: 100,
        },
      });
      setLibraries(data.libraries);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasIndexingLibraries, searchQuery, selectedCategory]);

  // Update libraries when loader data changes
  useEffect(() => {
    setLibraries(loaderData.libraries);
  }, [loaderData.libraries]);

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

  const indexedLibraries = libraries.filter(
    (lib) => lib.indexStatus === "indexed"
  );
  const pendingLibraries = libraries.filter(
    (lib) => lib.indexStatus !== "indexed"
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documentation libraries..."
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
                onClick={() => handleCategoryChange(cat.id)}
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
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <h3 className="font-medium text-emerald-900">
                  Documentation Libraries
                </h3>
                <p className="mt-1 text-sm text-emerald-700">
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
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-600">
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
                onClick={clearAllFilters}
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
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
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
