import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { docsNavigation, type NavSection, type NavItem } from "./navigation";

export function DocsSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 overflow-y-auto max-h-[calc(100vh-8rem)] pb-8">
        <nav className="space-y-6">
          {docsNavigation.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              currentPath={currentPath}
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
}: {
  section: NavSection;
  currentPath: string;
}) {
  return (
    <div>
      <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {section.title}
      </h3>
      <ul className="space-y-1">
        {section.items.map((item) => (
          <SidebarItem key={item.href} item={item} currentPath={currentPath} />
        ))}
      </ul>
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
  const isParentActive = currentPath.startsWith(item.href) && item.href !== "/docs";

  return (
    <li>
      <Link
        to={item.href}
        className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
          isActive
            ? "bg-primary text-primary-foreground font-medium"
            : isParentActive
              ? "text-foreground bg-muted/50"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
        style={
          isActive
            ? { boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)" }
            : {}
        }
      >
        {item.items && (
          <ChevronRight
            className={`h-3 w-3 transition-transform ${
              isParentActive ? "rotate-90" : ""
            }`}
          />
        )}
        <span>{item.title}</span>
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/50 p-6 lg:hidden overflow-y-auto">
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

        <nav className="space-y-6">
          {docsNavigation.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              currentPath={currentPath}
            />
          ))}
        </nav>
      </div>
    </>
  );
}
