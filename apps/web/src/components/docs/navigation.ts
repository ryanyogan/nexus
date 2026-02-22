// Documentation navigation structure

export interface NavItem {
  title: string;
  href: string;
}

export interface NavSection {
  title: string;
  icon: string; // Icon name from lucide-react
  items: NavItem[];
}

export const docsNavigation: NavSection[] = [
  {
    title: "Getting Started",
    icon: "Rocket",
    items: [
      { title: "Overview", href: "/docs" },
      { title: "Quick Start", href: "/docs/getting-started" },
    ],
  },
  {
    title: "MCP Tools",
    icon: "Wrench",
    items: [
      { title: "Overview", href: "/docs/mcp-tools" },
      { title: "resolve-library", href: "/docs/mcp-tools/resolve-library" },
      { title: "query-docs", href: "/docs/mcp-tools/query-docs" },
      { title: "get-library-info", href: "/docs/mcp-tools/get-library-info" },
      { title: "list-libraries", href: "/docs/mcp-tools/list-libraries" },
    ],
  },
  {
    title: "REST API",
    icon: "Server",
    items: [
      { title: "Overview", href: "/docs/api" },
      { title: "Libraries", href: "/docs/api/libraries" },
      { title: "Submissions", href: "/docs/api/submissions" },
      { title: "Stats", href: "/docs/api/stats" },
    ],
  },
  {
    title: "Guides",
    icon: "BookOpen",
    items: [
      { title: "Using the Web UI", href: "/docs/web-ui" },
      { title: "Submit a Library", href: "/docs/submit" },
    ],
  },
];

// Flatten navigation for prev/next links
export function getFlatNavigation(): NavItem[] {
  return docsNavigation.flatMap((section) => section.items);
}

// Get previous and next pages
export function getPrevNext(currentPath: string): {
  prev: NavItem | null;
  next: NavItem | null;
} {
  const flat = getFlatNavigation();
  const currentIndex = flat.findIndex((item) => item.href === currentPath);

  return {
    prev: currentIndex > 0 ? flat[currentIndex - 1] : null,
    next: currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null,
  };
}
