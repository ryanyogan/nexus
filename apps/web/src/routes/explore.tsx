import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Filter,
  ExternalLink,
  Check,
  Server,
  Wrench,
  Clock,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/explore")({ component: ExplorePage });

// Mock data - will be replaced with API calls
const MOCK_SERVERS = [
  {
    id: "github",
    name: "GitHub",
    description:
      "Interact with GitHub repositories, issues, pull requests, and more.",
    categories: ["code", "api"],
    toolCount: 25,
    isVerified: true,
    stats: { calls: 15420, avgLatency: 145 },
    iconUrl: "https://github.githubassets.com/favicons/favicon.svg",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    description:
      "Manage Cloudflare Workers, D1 databases, KV storage, and other Cloudflare services.",
    categories: ["cloud", "api"],
    toolCount: 32,
    isVerified: true,
    stats: { calls: 8930, avgLatency: 89 },
    iconUrl: "https://www.cloudflare.com/favicon.ico",
  },
  {
    id: "brave-search",
    name: "Brave Search",
    description: "Search the web using Brave's privacy-focused search engine.",
    categories: ["search", "api"],
    toolCount: 3,
    isVerified: true,
    stats: { calls: 22150, avgLatency: 203 },
    iconUrl: "https://brave.com/static-assets/images/brave-favicon.png",
  },
  {
    id: "filesystem",
    name: "Filesystem",
    description:
      "Read, write, and manage files on the local filesystem with configurable access controls.",
    categories: ["filesystem", "local"],
    toolCount: 12,
    isVerified: true,
    stats: { calls: 45200, avgLatency: 12 },
  },
  {
    id: "git",
    name: "Git",
    description:
      "Execute git commands, manage repositories, branches, and commits.",
    categories: ["code", "local"],
    toolCount: 18,
    isVerified: true,
    stats: { calls: 31400, avgLatency: 35 },
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    description:
      "Connect to and query PostgreSQL databases with full SQL support.",
    categories: ["database"],
    toolCount: 8,
    isVerified: true,
    stats: { calls: 12800, avgLatency: 67 },
  },
  {
    id: "context7",
    name: "Context7",
    description:
      "Access up-to-date documentation and code examples for any programming library.",
    categories: ["code", "api"],
    toolCount: 2,
    isVerified: true,
    stats: { calls: 9870, avgLatency: 312 },
  },
  {
    id: "playwright",
    name: "Playwright",
    description:
      "Control headless browsers for web scraping, testing, and automation.",
    categories: ["browser", "automation"],
    toolCount: 15,
    isVerified: true,
    stats: { calls: 6540, avgLatency: 1250 },
  },
];

const CATEGORIES = [
  { id: "all", label: "All", count: MOCK_SERVERS.length },
  {
    id: "code",
    label: "Code",
    count: MOCK_SERVERS.filter((s) => s.categories.includes("code")).length,
  },
  {
    id: "api",
    label: "API",
    count: MOCK_SERVERS.filter((s) => s.categories.includes("api")).length,
  },
  {
    id: "database",
    label: "Database",
    count: MOCK_SERVERS.filter((s) => s.categories.includes("database")).length,
  },
  {
    id: "filesystem",
    label: "Filesystem",
    count: MOCK_SERVERS.filter((s) => s.categories.includes("filesystem"))
      .length,
  },
  {
    id: "browser",
    label: "Browser",
    count: MOCK_SERVERS.filter((s) => s.categories.includes("browser")).length,
  },
];

function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredServers = MOCK_SERVERS.filter((server) => {
    const matchesSearch =
      searchQuery === "" ||
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      server.categories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground">
            Explore MCP Servers
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover and connect to {MOCK_SERVERS.length}+ MCP servers
          </p>

          {/* Search */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search servers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
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
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>{category.label}</span>
                  <span
                    className={`text-xs ${selectedCategory === category.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {category.count}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Server Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredServers.length} server
                {filteredServers.length !== 1 ? "s" : ""} found
              </p>
              <select className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                <option>Most Popular</option>
                <option>Recently Added</option>
                <option>Alphabetical</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {filteredServers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>

            {filteredServers.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
                <Server className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">
                  No servers found
                </p>
                <p className="mt-1 text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServerCard({
  server,
}: {
  server: (typeof MOCK_SERVERS)[0];
}) {
  return (
    <Link
      to="/servers/$serverId"
      params={{ serverId: server.id }}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {server.iconUrl ? (
            <img
              src={server.iconUrl}
              alt={server.name}
              className="h-10 w-10 rounded-lg"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{server.name}</h3>
              {server.isVerified && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {server.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded bg-muted px-1.5 py-0.5 capitalize"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {server.description}
      </p>

      <div className="flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Wrench className="h-3.5 w-3.5" />
          <span>{server.toolCount} tools</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{(server.stats.calls / 1000).toFixed(1)}k calls</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{server.stats.avgLatency}ms</span>
        </div>
      </div>
    </Link>
  );
}
