import { createFileRoute, Outlet, Link, useMatches } from "@tanstack/react-router";
import { BookOpen, Server, Zap, Layers, BarChart3 } from "lucide-react";

/**
 * Explore layout route.
 * Provides tab navigation for docs, servers, skills, and stacks.
 */
export const Route = createFileRoute("/explore")({
  component: ExploreLayout,
});

// ============================================================================
// Tab Configuration
// ============================================================================

interface TabItem {
  href: string;
  label: string;
  icon: typeof BookOpen;
  matchPrefix: string;
}

const TABS: TabItem[] = [
  {
    href: "/",
    label: "All",
    icon: BarChart3,
    matchPrefix: "/explore/stats",
  },
  {
    href: "/explore/docs",
    label: "Docs",
    icon: BookOpen,
    matchPrefix: "/explore/docs",
  },
  {
    href: "/explore/servers",
    label: "Servers",
    icon: Server,
    matchPrefix: "/explore/servers",
  },
  {
    href: "/explore/skills",
    label: "Skills",
    icon: Zap,
    matchPrefix: "/explore/skills",
  },
  {
    href: "/explore/stacks",
    label: "Stacks",
    icon: Layers,
    matchPrefix: "/explore/stacks",
  },
];

// ============================================================================
// Explore Layout Component
// ============================================================================

function ExploreLayout() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname || "/explore";

  // Check if we're on a detail page (has ID in URL)
  const isDetailPage = currentPath.split("/").length > 3 && !currentPath.endsWith("/");

  return (
    <div className="min-h-screen bg-background">
      {/* Tab Navigation - Only show on index pages, not detail pages */}
      {!isDetailPage && (
        <div className="border-b border-border">
          <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
            <nav className="flex items-center gap-0 overflow-x-auto">
              {TABS.map((tab) => {
                const isActive = currentPath.startsWith(tab.matchPrefix);

                return (
                  <Link
                    key={tab.href}
                    to={tab.href}
                    className={`flex items-center gap-1.5 border-b-2 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wide transition-colors ${
                      isActive
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <Outlet />
    </div>
  );
}
