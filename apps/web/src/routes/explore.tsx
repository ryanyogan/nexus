import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  Search,
  Filter,
  ExternalLink,
  Check,
  Server,
  Wrench,
  Clock,
  TrendingUp,
  Sparkles,
  X,
} from "lucide-react";
import { FloatingParticles } from "../components/FloatingParticles";

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Header animation
    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );

    // Stagger cards on initial load
    gsap.fromTo(
      ".server-card",
      { opacity: 0, y: 30, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.2,
      }
    );

    // Categories animation
    gsap.fromTo(
      ".category-btn",
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.3,
      }
    );
  }, []);

  // Re-animate cards when filter changes
  useEffect(() => {
    gsap.fromTo(
      ".server-card",
      { opacity: 0, y: 20, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      }
    );
  }, [selectedCategory, searchQuery]);

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <FloatingParticles />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div
        ref={headerRef}
        className="relative border-b border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
              style={{
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.2)",
              }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Explore MCP Servers
              </h1>
              <p className="text-muted-foreground">
                Discover and connect to {MOCK_SERVERS.length}+ MCP servers
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <div
              className={`relative flex-1 transition-all duration-300 ${
                isSearchFocused ? "scale-[1.02]" : ""
              }`}
            >
              <Search
                className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
                  isSearchFocused ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <input
                type="text"
                placeholder="Search servers by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="h-12 w-full rounded-xl border border-border/50 bg-card/50 pl-10 pr-10 text-foreground backdrop-blur-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{
                  boxShadow: isSearchFocused
                    ? "0 0 30px rgba(139, 92, 246, 0.15)"
                    : "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/50 px-5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card">
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
                  className={`category-btn flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                  style={
                    selectedCategory === category.id
                      ? { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }
                      : {}
                  }
                >
                  <span>{category.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      selectedCategory === category.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
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
                <span className="font-medium text-foreground">
                  {filteredServers.length}
                </span>{" "}
                server{filteredServers.length !== 1 ? "s" : ""} found
              </p>
              <select className="rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-sm text-foreground backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20">
                <option>Most Popular</option>
                <option>Recently Added</option>
                <option>Alphabetical</option>
              </select>
            </div>

            <div ref={gridRef} className="grid gap-4 sm:grid-cols-2">
              {filteredServers.map((server) => (
                <ServerCard key={server.id} server={server} />
              ))}
            </div>

            {filteredServers.length === 0 && (
              <div
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-card/30 py-16 backdrop-blur-sm"
                style={{
                  boxShadow: "inset 0 0 60px rgba(139, 92, 246, 0.05)",
                }}
              >
                <Server className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">
                  No servers found
                </p>
                <p className="mt-1 text-muted-foreground">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServerCard({ server }: { server: (typeof MOCK_SERVERS)[0] }) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  return (
    <Link
      ref={cardRef}
      to="/servers/$serverId"
      params={{ serverId: server.id }}
      className="server-card group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/50"
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {server.iconUrl ? (
            <img
              src={server.iconUrl}
              alt={server.name}
              className="h-10 w-10 rounded-lg bg-card object-contain p-1"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"
              style={{
                boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)",
              }}
            >
              <Server className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{server.name}</h3>
              {server.isVerified && (
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                  style={{
                    boxShadow: "0 0 10px rgba(139, 92, 246, 0.4)",
                  }}
                >
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {server.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-md bg-muted/50 px-1.5 py-0.5 capitalize text-muted-foreground"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>

      <p className="relative mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
        {server.description}
      </p>

      <div className="relative flex items-center gap-4 border-t border-border/50 pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Wrench className="h-3.5 w-3.5 text-primary/70" />
          <span>{server.toolCount} tools</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-accent/70" />
          <span>{(server.stats.calls / 1000).toFixed(1)}k calls</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-green-500/70" />
          <span>{server.stats.avgLatency}ms</span>
        </div>
      </div>
    </Link>
  );
}
