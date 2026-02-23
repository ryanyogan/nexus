// Documentation navigation structure

export interface NavItem {
  title: string;
  href: string;
  isNew?: boolean;
}

export interface NavSection {
  title: string;
  icon: string; // Icon name from lucide-react
  items: NavItem[];
  defaultOpen?: boolean; // Whether section is open by default
}

export const docsNavigation: NavSection[] = [
  {
    title: "Getting Started",
    icon: "Rocket",
    defaultOpen: true, // Only this section is open by default
    items: [
      { title: "Overview", href: "/docs" },
      { title: "Quick Start", href: "/docs/getting-started" },
      { title: "SDK", href: "/docs/sdk", isNew: true },
    ],
  },
  {
    title: "Features",
    icon: "Sparkles",
    items: [
      { title: "AI Skills", href: "/docs/features/skills", isNew: true },
      { title: "Secrets Vault", href: "/docs/features/secrets", isNew: true },
      { title: "Mobile Terminal", href: "/docs/mobile-terminal" },
      { title: "User Dashboard", href: "/docs/features/dashboard", isNew: true },
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
      { title: "Memory Tools", href: "/docs/mcp-tools/memory" },
      { title: "Server Registry", href: "/docs/mcp-tools/servers" },
    ],
  },
  {
    title: "REST API",
    icon: "Server",
    items: [
      { title: "Overview", href: "/docs/api" },
      { title: "Libraries", href: "/docs/api/libraries" },
      { title: "Servers", href: "/docs/api/servers", isNew: true },
      { title: "Skills", href: "/docs/api/skills", isNew: true },
      { title: "User & Auth", href: "/docs/api/user", isNew: true },
      { title: "Submissions", href: "/docs/api/submissions" },
      { title: "Stats", href: "/docs/api/stats" },
    ],
  },
  {
    title: "Tutorials",
    icon: "GraduationCap",
    items: [
      { title: "Vibe with Nexus", href: "/docs/tutorials/vibe-with-nexus" },
      { title: "Build with Nexus", href: "/docs/tutorials/build-with-nexus" },
      { title: "Project Memory", href: "/docs/tutorials/project-memory" },
      { title: "MCP Server Setup", href: "/docs/tutorials/mcp-server-setup" },
    ],
  },
  {
    title: "Guides",
    icon: "BookOpen",
    items: [
      { title: "Using the Web UI", href: "/docs/web-ui" },
      { title: "Submit a Library", href: "/docs/submit" },
      { title: "Troubleshooting", href: "/docs/troubleshooting" },
    ],
  },
];

// Get default collapsed state (all collapsed except defaultOpen sections)
export function getDefaultCollapsedState(): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  for (const section of docsNavigation) {
    // Collapsed means NOT open, so if defaultOpen is true, collapsed is false
    state[section.title] = !section.defaultOpen;
  }
  return state;
}

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
