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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LIBRARY_CATEGORIES } from "../../lib/api";
import { getDb } from "../../server/db";
import * as schema from "@nexus/db";
import { like, or, desc, sql, and, count } from "drizzle-orm";
import { logger } from "../../lib/server-fn";

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

interface PaginatedResult {
  libraries: Library[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// Server Functions
// ============================================================================

const getLibrariesFn = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { search?: string; category?: string; page?: number; pageSize?: number }) => data
  )
  .handler(async ({ data }): Promise<PaginatedResult> => {
    const startTime = Date.now();
    const fnName = "getLibrariesFn";

    try {
      logger.debug(`${fnName} started`, { input: data });

      const db = getDb();
      const { search, category, page = 1, pageSize = 20 } = data;
      const offset = (page - 1) * pageSize;

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
        conditions.push(
          sql`json_array_length(${schema.libraries.categories}) > 0 AND EXISTS (SELECT 1 FROM json_each(${schema.libraries.categories}) WHERE json_each.value = ${category})`
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [countResult] = await db
        .select({ count: count() })
        .from(schema.libraries)
        .where(whereClause);

      const total = countResult?.count ?? 0;

      // Get paginated results
      const libraries = await db.query.libraries.findMany({
        where: whereClause,
        orderBy: [desc(schema.libraries.isFeatured), desc(schema.libraries.lastIndexedAt)],
        limit: pageSize,
        offset,
      });

      const durationMs = Date.now() - startTime;
      logger.info(`${fnName} completed`, { durationMs, count: libraries.length, total });

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
          lastIndexedAt: lib.lastIndexedAt ?? null,
        })),
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
// Categories
// ============================================================================

const DOC_CATEGORIES = [{ id: "all", label: "All" }, ...LIBRARY_CATEGORIES];

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore/docs")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
    page: search.page ?? 1,
  }),
  loader: async ({ deps }) => {
    return getLibrariesFn({
      data: {
        search: deps.q,
        category: deps.category,
        page: deps.page,
        pageSize: 20,
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Search skeleton */}
      <div className="mb-8">
        <div className="h-12 animate-pulse rounded-xl bg-stone-200" />
      </div>

      {/* Categories skeleton */}
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-lg bg-stone-200" />
        ))}
      </div>

      {/* List skeleton */}
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

function DocsPage() {
  const navigate = useNavigate({ from: "/explore/docs" });
  const { q, category, page } = Route.useSearch();
  const loaderData = Route.useLoaderData();

  const [libraries, setLibraries] = useState<Library[]>(loaderData.libraries);
  const [total, setTotal] = useState(loaderData.total);
  const [totalPages, setTotalPages] = useState(loaderData.totalPages);

  const searchQuery = q || "";
  const selectedCategory = category || "all";
  const currentPage = page ?? 1;

  // Auto-refresh when there are indexing libraries
  const hasIndexingLibraries = libraries.some((lib) => lib.indexStatus === "indexing");

  useEffect(() => {
    if (!hasIndexingLibraries) return;

    const interval = setInterval(async () => {
      const data = await getLibrariesFn({
        data: {
          search: searchQuery || undefined,
          category: selectedCategory === "all" ? undefined : selectedCategory,
          page: currentPage,
          pageSize: 20,
        },
      });
      setLibraries(data.libraries);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasIndexingLibraries, searchQuery, selectedCategory, currentPage]);

  // Update when loader data changes
  useEffect(() => {
    setLibraries(loaderData.libraries);
    setTotal(loaderData.total);
    setTotalPages(loaderData.totalPages);
  }, [loaderData]);

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
        // Reset to page 1 when search/category changes
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

  const indexedLibraries = libraries.filter((lib) => lib.indexStatus === "indexed");
  const pendingLibraries = libraries.filter((lib) => lib.indexStatus !== "indexed");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-stone-900">Documentation</h1>
        <p className="mt-1 text-stone-600">Pre-indexed docs with semantic search</p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search libraries..."
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
        {DOC_CATEGORIES.map((cat) => (
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
          {total} librarie{total !== 1 ? "s" : ""}
          {searchQuery && ` for "${searchQuery}"`}
        </span>
        {hasIndexingLibraries && (
          <span className="flex items-center gap-1.5 text-emerald-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            Refreshing
          </span>
        )}
      </div>

      {/* Library List - Minimal Design */}
      {indexedLibraries.length > 0 && (
        <div className="space-y-1">
          {indexedLibraries.map((library) => (
            <LibraryRow key={library.id} library={library} />
          ))}
        </div>
      )}

      {/* Pending Libraries */}
      {pendingLibraries.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-medium text-stone-500">Coming Soon</h3>
          <div className="space-y-1">
            {pendingLibraries.map((library) => (
              <PendingLibraryRow key={library.id} library={library} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {libraries.length === 0 && (
        <div className="py-16 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-4 text-stone-600">No libraries found</p>
          <button
            onClick={() => updateSearch({ q: "", category: "all" })}
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
// Library Row Component - Minimal List Item
// ============================================================================

function LibraryRow({ library }: { library: Library }) {
  return (
    <Link
      to="/libraries/$libraryId"
      params={{ libraryId: library.id }}
      className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-stone-100"
    >
      {/* Icon */}
      {library.iconUrl ? (
        <img
          src={library.iconUrl}
          alt={library.name}
          className="h-8 w-8 shrink-0 rounded-md bg-stone-100 object-contain p-1"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-100">
          <BookOpen className="h-4 w-4 text-emerald-600" />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-900">{library.name}</span>
          {library.isFeatured && <Star className="h-3.5 w-3.5 text-amber-500" />}
        </div>
        {library.description && (
          <p className="truncate text-sm text-stone-500">{library.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="hidden shrink-0 items-center gap-4 text-xs text-stone-400 sm:flex">
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {library.totalChunks}
        </span>
        {library.lastIndexedAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(library.lastIndexedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Arrow */}
      <ExternalLink className="h-4 w-4 shrink-0 text-stone-300 transition-colors group-hover:text-stone-500" />
    </Link>
  );
}

// ============================================================================
// Pending Library Row
// ============================================================================

function PendingLibraryRow({ library }: { library: Library }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-3 opacity-60">
      {library.iconUrl ? (
        <img
          src={library.iconUrl}
          alt={library.name}
          className="h-8 w-8 shrink-0 rounded-md bg-stone-100 object-contain p-1"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-stone-100">
          <BookOpen className="h-4 w-4 text-stone-400" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <span className="font-medium text-stone-600">{library.name}</span>
      </div>

      <span className="text-xs text-stone-400">
        {library.indexStatus === "indexing" ? (
          <span className="flex items-center gap-1 text-emerald-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            Indexing
          </span>
        ) : library.indexStatus === "failed" ? (
          <span className="text-red-500">Failed</span>
        ) : (
          "Pending"
        )}
      </span>
    </div>
  );
}
