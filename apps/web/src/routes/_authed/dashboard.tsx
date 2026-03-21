import { createFileRoute, Outlet, Link, useMatches } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Key,
  Brain,
  CreditCard,
  Layers,
  FileText,
  Cog,
  Zap,
  FolderGit2,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { LAYOUT_WIDTHS } from "../../components/layout/PageContainer";

/**
 * Dashboard layout route.
 * Provides consistent sidebar navigation for all dashboard pages.
 */
export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardLayout,
});

// ============================================================================
// Navigation Configuration
// ============================================================================

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/prompts", label: "Prompts", icon: FileText },
  { href: "/dashboard/stacks", label: "Stacks", icon: Layers },
  { href: "/dashboard/brain", label: "Brain", icon: Brain },
  { href: "/dashboard/repos", label: "Repos", icon: FolderGit2 },
  { href: "/dashboard/skills", label: "Skills", icon: Zap },
  { href: "/dashboard/keys", label: "API Keys", icon: Key },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

const SETTINGS_ITEMS: NavItem[] = [{ href: "/settings", label: "Settings", icon: Cog }];

// ============================================================================
// Dashboard Layout Component
// ============================================================================

function DashboardLayout() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname || "/dashboard";
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close more menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Items to show in mobile horizontal nav (first 4)
  const mobileNavItems = NAV_ITEMS.slice(0, 4);
  // Items to show in "More" dropdown
  const moreNavItems = [...NAV_ITEMS.slice(4), ...SETTINGS_ITEMS];

  return (
    <div className="min-h-screen bg-background">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${LAYOUT_WIDTHS.full}`}>
        <div className="flex flex-col lg:flex-row lg:gap-10">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:block lg:w-52 lg:shrink-0 lg:pt-8">
            <nav className="sticky top-20 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  (item.href !== "/dashboard" && currentPath.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent border-l-2 border-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="my-4 border-t border-border" />

              {SETTINGS_ITEMS.map((item) => {
                const isActive = currentPath.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 font-mono text-xs uppercase tracking-wide transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent border-l-2 border-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Navigation - Horizontal tabs with dropdown */}
          <div className="lg:hidden border-b border-border">
            <nav className="flex items-center py-2 px-1">
              {/* Primary nav items */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {mobileNavItems.map((item) => {
                  const isActive =
                    currentPath === item.href ||
                    (item.href !== "/dashboard" && currentPath.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center gap-1.5 px-3 py-2 font-mono text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="hidden xs:inline">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* More dropdown */}
              <div className="relative ml-auto" ref={moreMenuRef}>
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 font-mono text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${
                    moreNavItems.some(
                      (item) =>
                        currentPath === item.href ||
                        (item.href !== "/dashboard" && currentPath.startsWith(item.href))
                    )
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  More
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${moreMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {moreMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 border border-border bg-background shadow-md">
                    {moreNavItems.map((item, index) => {
                      const isActive =
                        currentPath === item.href ||
                        (item.href !== "/dashboard" && currentPath.startsWith(item.href));
                      const isFirstSettings = index === NAV_ITEMS.length - 4;

                      return (
                        <div key={item.href}>
                          {isFirstSettings && <div className="border-t border-border" />}
                          <Link
                            to={item.href}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`flex items-center gap-2 px-4 py-3 font-mono text-xs uppercase tracking-wide transition-colors ${
                              isActive
                                ? "bg-accent/10 text-accent"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
