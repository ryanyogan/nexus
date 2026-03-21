import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { BookOpen, Server, Zap, Layers, FileText, Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentFilter } from "../../types/home";

// ============================================================================
// Types
// ============================================================================

interface TabConfig {
  id: ContentFilter;
  label: string;
  icon: typeof BookOpen | null;
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
  { id: "all", label: "All", icon: null },
  { id: "docs", label: "Docs", icon: BookOpen },
  { id: "servers", label: "Servers", icon: Server },
  { id: "skills", label: "Skills", icon: Zap },
  { id: "stacks", label: "Stacks", icon: Layers },
  { id: "prompts", label: "Prompts", icon: FileText },
];

// ============================================================================
// Mobile Dropdown Component
// ============================================================================

interface MobileDropdownProps {
  activeFilter: ContentFilter;
  isSearching: boolean;
  onClearSearch: () => void;
  onSearchTabClick: () => void;
}

function MobileDropdown({
  activeFilter,
  isSearching,
  onClearSearch,
  onSearchTabClick,
}: MobileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const activeTab = TABS.find((t) => t.id === activeFilter) || TABS[0];
  const ActiveIcon = activeTab.icon;

  return (
    <div ref={dropdownRef} className="relative md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 border bg-background px-4 font-mono text-xs font-bold uppercase tracking-wide transition-colors",
          isSearching
            ? "border-accent text-accent"
            : "border-border text-foreground hover:border-foreground/50"
        )}
      >
        <span className="flex items-center gap-2">
          {isSearching ? (
            <>
              <Search className="h-4 w-4" />
              <span>Search Results</span>
            </>
          ) : (
            <>
              {ActiveIcon && <ActiveIcon className="h-4 w-4" />}
              <span>{activeTab.label}</span>
            </>
          )}
        </span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-border bg-background shadow-lg">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = !isSearching && activeFilter === tab.id;

            return (
              <Link
                key={tab.id}
                to="."
                search={{ filter: tab.id === "all" ? undefined : tab.id }}
                resetScroll={false}
                onClick={() => {
                  onClearSearch();
                  setIsOpen(false);
                }}
                className={cn(
                  "flex h-11 items-center gap-3 px-4 font-mono text-xs uppercase tracking-wide transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="flex-1">{tab.label}</span>
                {isActive && <Check className="h-4 w-4" />}
              </Link>
            );
          })}

          {isSearching && (
            <button
              onClick={() => {
                onSearchTabClick();
                setIsOpen(false);
              }}
              className="flex h-11 w-full items-center gap-3 border-t border-border px-4 font-mono text-xs uppercase tracking-wide text-accent"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search Results</span>
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Desktop Pills Component
// ============================================================================

interface DesktopPillsProps {
  activeFilter: ContentFilter;
  isSearching: boolean;
  onClearSearch: () => void;
  onSearchTabClick: () => void;
}

function DesktopPills({
  activeFilter,
  isSearching,
  onClearSearch,
  onSearchTabClick,
}: DesktopPillsProps) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = !isSearching && activeFilter === tab.id;

        return (
          <Link
            key={tab.id}
            to="."
            search={{ filter: tab.id === "all" ? undefined : tab.id }}
            resetScroll={false}
            onClick={onClearSearch}
            className={cn(
              "flex h-9 items-center gap-1.5 border px-3 font-mono text-xs font-bold uppercase tracking-wide transition-colors",
              isActive
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:border-foreground/50 hover:text-foreground"
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{tab.label}</span>
          </Link>
        );
      })}

      {/* Search pill - only visible when searching */}
      {isSearching && (
        <button
          onClick={onSearchTabClick}
          className="flex h-9 items-center gap-1.5 border border-accent bg-accent/10 px-3 font-mono text-xs font-bold uppercase tracking-wide text-accent"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SearchTabs Component (Responsive Wrapper)
// ============================================================================

export function SearchTabs(props: SearchTabsProps) {
  return (
    <div className="mt-8 mb-6 md:mt-10 md:mb-8">
      <MobileDropdown {...props} />
      <DesktopPills {...props} />
    </div>
  );
}

// ============================================================================
// Skeleton for SearchTabs
// ============================================================================

export function SearchTabsSkeleton() {
  return (
    <div className="mt-8 mb-6 md:mt-10 md:mb-8">
      {/* Mobile skeleton */}
      <div className="h-11 w-full animate-pulse border border-border bg-muted md:hidden" />

      {/* Desktop skeleton */}
      <div className="hidden items-center gap-2 md:flex">
        {TABS.map((tab) => (
          <div key={tab.id} className="h-9 w-20 animate-pulse border border-border bg-muted" />
        ))}
      </div>
    </div>
  );
}
