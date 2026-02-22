import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import {
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  FileText,
  Clock,
  Star,
  Sparkles,
  X,
} from "lucide-react";
import { ExplorePageSkeleton } from "../components/skeletons";
import { getLibraries } from "../lib/queries";
import { LIBRARY_CATEGORIES } from "../lib/api";
import type { LibraryListResult } from "../lib/types";

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

export const Route = createFileRoute("/explore")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({
    q: search.q,
    category: search.category,
  }),
  loader: async ({ deps }): Promise<LibraryListResult> => {
    return getLibraries({
      data: {
        search: deps.q,
        category: deps.category,
        limit: 50,
      },
    });
  },
  pendingComponent: ExplorePageSkeleton,
  component: ExplorePage,
});

// ============================================================================
// Categories (with "All" option for filtering)
// ============================================================================

const CATEGORIES = [
  { id: "all", label: "All" },
  ...LIBRARY_CATEGORIES,
];

// ============================================================================
// Library Type (from loader result)
// ============================================================================

type Library = LibraryListResult["libraries"][number];

// ============================================================================
// Main Component
// ============================================================================

function ExplorePage() {
  const navigate = useNavigate({ from: "/explore" });
  const { q, category } = Route.useSearch();
  const data = Route.useLoaderData();

  // Derive state from URL params
  const searchQuery = q || "";
  const selectedCategory = category || "all";
  const libraries = data.libraries;

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

  const indexedLibraries = libraries.filter((lib) => lib.indexStatus === "indexed");
  const pendingLibraries = libraries.filter((lib) => lib.indexStatus !== "indexed");

  return (
    <div className="relative min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Documentation Library
              </h1>
              <p className="text-muted-foreground">
                Browse {libraries.length} indexed libraries with semantic search
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search libraries by name..."
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
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <Filter className="h-4 w-4" />
              Filters
            </button>
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
            <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
              {CATEGORIES.map((cat) => (
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
                  <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
                    <option>Most Popular</option>
                    <option>Recently Indexed</option>
                    <option>Alphabetical</option>
                  </select>
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
          <span>{library.totalChunks} chunks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>~</span>
          <span>{(library.totalTokens / 1000).toFixed(1)}k tokens</span>
        </div>
        {library.lastIndexedAt && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            <span>Updated {new Date(library.lastIndexedAt).toLocaleDateString()}</span>
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
