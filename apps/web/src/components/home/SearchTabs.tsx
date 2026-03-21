import { Link } from "@tanstack/react-router";
import { BookOpen, Server, Zap, Layers, FileText, Search } from "lucide-react";
import type { ContentFilter } from "../../types/home";

// ============================================================================
// Types
// ============================================================================

interface TabConfig {
  id: ContentFilter;
  label: string;
  icon: "docs" | "servers" | "skills" | "stacks" | "prompts" | null;
  href?: string;
}

interface SearchTabsProps {
  activeFilter: ContentFilter;
  isSearching: boolean;
  onClearSearch: () => void;
  onSearchTabClick: () => void;
}

// ============================================================================
// Tab Configuration
// ============================================================================

const TABS: TabConfig[] = [
  { id: "all", label: "ALL", icon: null },
  { id: "docs", label: "DOCS", icon: "docs" },
  { id: "servers", label: "SERVERS", icon: "servers" },
  { id: "skills", label: "SKILLS", icon: "skills" },
  { id: "stacks", label: "STACKS", icon: "stacks" },
  { id: "prompts", label: "PROMPTS", icon: "prompts" },
];

// ============================================================================
// Icon Mapping
// ============================================================================

function getTabIcon(iconType: "docs" | "servers" | "skills" | "stacks" | "prompts" | null) {
  if (!iconType) return null;
  const iconClass = "h-3 w-3 sm:h-3.5 sm:w-3.5";

  switch (iconType) {
    case "docs":
      return <BookOpen className={iconClass} />;
    case "servers":
      return <Server className={iconClass} />;
    case "skills":
      return <Zap className={iconClass} />;
    case "stacks":
      return <Layers className={iconClass} />;
    case "prompts":
      return <FileText className={iconClass} />;
  }
}

// ============================================================================
// SearchTabs Component
// ============================================================================

export function SearchTabs({
  activeFilter,
  isSearching,
  onClearSearch,
  onSearchTabClick,
}: SearchTabsProps) {
  return (
    <div className="mt-8 mb-5 flex items-center gap-0 border-b border-border md:mt-8 md:mb-6 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = !isSearching && activeFilter === tab.id;

        return (
          <Link
            key={tab.id}
            to="."
            search={{ filter: tab.id === "all" ? undefined : tab.id }}
            resetScroll={false}
            onClick={onClearSearch}
            className={`flex items-center gap-1.5 border-b px-3 py-2.5 font-mono text-xs font-bold tracking-wide transition-colors -mb-px sm:gap-1.5 sm:px-4 md:py-3 ${
              isActive
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {getTabIcon(tab.icon)}
            <span>{tab.label}</span>
          </Link>
        );
      })}

      {/* Search tab - only visible when searching */}
      {isSearching && (
        <button
          onClick={onSearchTabClick}
          className="flex items-center gap-1.5 border-b border-accent px-3 py-2.5 font-mono text-xs font-bold tracking-wide text-accent -mb-px sm:gap-1.5 sm:px-4 md:py-3"
        >
          <Search className="h-3 w-3" />
          <span>SEARCH</span>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Skeleton for SearchTabs
// ============================================================================

export function SearchTabsSkeleton() {
  return (
    <div className="mt-8 mb-5 flex items-center gap-0 border-b border-border md:mt-8 md:mb-6 overflow-x-auto animate-pulse">
      {TABS.map((tab) => (
        <div key={tab.id} className="flex items-center gap-1.5 px-3 py-2.5 -mb-px sm:px-4 md:py-3">
          <div className="h-3 w-3 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
