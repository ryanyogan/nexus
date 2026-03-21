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
} from "lucide-react";

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

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
          <aside className="hidden lg:block lg:w-48 lg:shrink-0 lg:pt-8">
            <nav className="sticky top-20 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  currentPath === item.href ||
                  (item.href !== "/dashboard" && currentPath.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
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
                    className={`flex items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
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

          {/* Mobile Navigation - Horizontal tabs */}
          <div className="lg:hidden overflow-x-auto border-b border-border">
            <nav className="flex items-center gap-1 py-2 px-1">
              {NAV_ITEMS.slice(0, 5).map((item) => {
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
                    {item.label}
                  </Link>
                );
              })}
              {/* More dropdown for remaining items */}
              <Link
                to="/dashboard/keys"
                className="flex items-center gap-1.5 px-3 py-2 font-mono text-xs uppercase tracking-wide whitespace-nowrap text-muted-foreground hover:text-foreground"
              >
                <Cog className="h-3.5 w-3.5" />
                More
              </Link>
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
