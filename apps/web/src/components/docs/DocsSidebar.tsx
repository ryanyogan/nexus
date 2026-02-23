import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Rocket, Wrench, Server, BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { docsNavigation, getDefaultCollapsedState, type NavSection, type NavItem } from "./navigation";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Wrench,
  Server,
  BookOpen,
  GraduationCap,
  Sparkles,
};

export function DocsSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Load collapsed state from localStorage, defaulting to all collapsed except Getting Started
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return getDefaultCollapsedState();
    try {
      const saved = localStorage.getItem("docs-sidebar-collapsed");
      if (saved) {
        return JSON.parse(saved);
      }
      // First visit - use defaults (all collapsed except Getting Started)
      return getDefaultCollapsedState();
    } catch {
      return getDefaultCollapsedState();
    }
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("docs-sidebar-collapsed", JSON.stringify(collapsedSections));
    }
  }, [collapsedSections]);

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)] pb-8">
        <nav className="space-y-2">
          {docsNavigation.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              currentPath={currentPath}
              isCollapsed={collapsedSections[section.title] || false}
              onToggle={() => toggleSection(section.title)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function SidebarSection({
  section,
  currentPath,
  isCollapsed,
  onToggle,
}: {
  section: NavSection;
  currentPath: string;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const Icon = iconMap[section.icon] || BookOpen;

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{section.title}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isCollapsed ? "-rotate-90" : ""
          }`}
        />
      </button>
      
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isCollapsed ? "max-h-0" : "max-h-96"
        }`}
      >
        <ul className="mt-1 space-y-1 pl-6">
          {section.items.map((item) => (
            <SidebarItem key={item.href} item={item} currentPath={currentPath} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function SidebarItem({
  item,
  currentPath,
}: {
  item: NavItem;
  currentPath: string;
}) {
  const isActive = currentPath === item.href;

  return (
    <li>
      <Link
        to={item.href}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-primary text-primary-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        {item.title}
        {item.isNew && (
          <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400">
            NEW
          </span>
        )}
      </Link>
    </li>
  );
}

// Mobile sidebar (drawer style)
export function MobileDocsSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Load collapsed state from localStorage, defaulting to all collapsed except Getting Started
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return getDefaultCollapsedState();
    try {
      const saved = localStorage.getItem("docs-sidebar-collapsed");
      if (saved) {
        return JSON.parse(saved);
      }
      return getDefaultCollapsedState();
    } catch {
      return getDefaultCollapsedState();
    }
  });

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const newState = { ...prev, [title]: !prev[title] };
      if (typeof window !== "undefined") {
        localStorage.setItem("docs-sidebar-collapsed", JSON.stringify(newState));
      }
      return newState;
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-background p-6 lg:hidden overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">Documentation</span>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-2">
          {docsNavigation.map((section) => {
            const Icon = iconMap[section.icon] || BookOpen;
            const isCollapsed = collapsedSections[section.title] || false;

            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{section.title}</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isCollapsed ? "max-h-0" : "max-h-96"
                  }`}
                >
                  <ul className="mt-1 space-y-1 pl-6">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          onClick={onClose}
                          className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                            currentPath === item.href
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
