import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
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
import { FloatingParticles } from "../components/FloatingParticles";
import { ExplorePageSkeleton } from "../components/skeletons";
import { getLibraries } from "../lib/queries";
import type { LibraryListResult } from "../lib/types";

// ============================================================================
// Search Params Schema
// ============================================================================

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  category: z.string().optional().catch(undefined),
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
// Categories
// ============================================================================

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "fullstack", label: "Full Stack" },
  { id: "database", label: "Database" },
  { id: "cloud", label: "Cloud" },
  { id: "ai", label: "AI / ML" },
  { id: "testing", label: "Testing" },
  { id: "utilities", label: "Utilities" },
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
  
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    searchInputRef.current?.focus();
  };

  // Clear all filters
  const clearAllFilters = () => {
    updateSearch("", "all");
  };

  // Animations
  useEffect(() => {
    // Header animation
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );

    // Categories animation
    gsap.fromTo(
      ".category-btn",
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.3,
      }
    );
  }, []);

  // Re-animate cards when data changes
  useEffect(() => {
    if (libraries.length > 0) {
      gsap.fromTo(
        ".library-card",
        { opacity: 0, y: 20, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
        }
      );
    }
  }, [libraries]);

  const indexedLibraries = libraries.filter((lib) => lib.indexStatus === "indexed");
  const pendingLibraries = libraries.filter((lib) => lib.indexStatus !== "indexed");

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <FloatingParticles />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div
        ref={headerRef}
        className="relative border-b border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
              style={{
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)",
              }}
            >
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
                ref={searchInputRef}
                type="text"
                placeholder="Search libraries by name..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="h-12 w-full rounded-xl border border-border/50 bg-card/50 pl-10 pr-10 text-foreground backdrop-blur-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/50 px-5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card">
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
                  className={`category-btn flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }
                      : {}
                  }
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
                  <select className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm text-foreground backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
                    <option>Most Popular</option>
                    <option>Recently Indexed</option>
                    <option>Alphabetical</option>
                  </select>
                </div>

                <div ref={gridRef} className="grid gap-4 sm:grid-cols-2">
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
              <div
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 py-16 backdrop-blur-sm"
                style={{
                  boxShadow: "inset 0 0 60px rgba(139, 92, 246, 0.05)",
                }}
              >
                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">
                  No libraries found
                </p>
                <p className="mt-1 text-muted-foreground">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
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
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  return (
    <Link
      ref={cardRef}
      to="/libraries/$libraryId"
      params={{ libraryId: library.id }}
      className="library-card group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/50"
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {library.iconUrl ? (
            <img
              src={library.iconUrl}
              alt={library.name}
              className="h-10 w-10 rounded-lg bg-card object-contain p-1"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
              style={{
                boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)",
              }}
            >
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{library.name}</h3>
              {library.isFeatured && (
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                  style={{
                    boxShadow: "0 0 10px rgba(139, 92, 246, 0.4)",
                  }}
                >
                  <Star className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {library.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="rounded-md bg-muted/50 px-1.5 py-0.5 capitalize text-muted-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>

      <p className="relative mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {library.description || "No description available"}
      </p>

      <div className="relative flex items-center gap-4 border-t border-border/50 pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary/70" />
          <span>{library.totalChunks} chunks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-accent/70">~</span>
          <span>{(library.totalTokens / 1000).toFixed(1)}k tokens</span>
        </div>
        {library.lastIndexedAt && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-green-500/70" />
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
    <div className="library-card flex flex-col rounded-xl border border-border/30 bg-card/30 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {library.iconUrl ? (
          <img
            src={library.iconUrl}
            alt={library.name}
            className="h-8 w-8 rounded-lg bg-card object-contain p-1 opacity-50"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
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
