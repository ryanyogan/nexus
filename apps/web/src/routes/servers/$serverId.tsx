import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Server,
  Wrench,
  Clock,
  TrendingUp,
  Github,
  Globe,
  Copy,
  Play,
  ChevronRight,
  Zap,
  Shield,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FloatingParticles } from "../../components/FloatingParticles";

export const Route = createFileRoute("/servers/$serverId")({
  component: ServerDetailPage,
});

// Mock data - will be replaced with API calls
const MOCK_SERVER = {
  id: "github",
  name: "GitHub",
  description:
    "Interact with GitHub repositories, issues, pull requests, and more. Full access to the GitHub API through a simple MCP interface.",
  endpoint: "https://nexus.yogan.dev/mcp",
  transport: "streamable-http",
  categories: ["code", "api"],
  isVerified: true,
  isActive: true,
  iconUrl: "https://github.githubassets.com/favicons/favicon.svg",
  homepageUrl: "https://github.com",
  repositoryUrl: "https://github.com/modelcontextprotocol/servers",
  stats: {
    totalCalls: 15420,
    successRate: 99.2,
    avgLatency: 145,
  },
  tools: [
    {
      id: "1",
      name: "create_repository",
      description: "Create a new GitHub repository",
      namespace: "github",
    },
    {
      id: "2",
      name: "create_issue",
      description: "Create a new issue in a repository",
      namespace: "github",
    },
    {
      id: "3",
      name: "create_pull_request",
      description: "Create a new pull request",
      namespace: "github",
    },
    {
      id: "4",
      name: "list_repositories",
      description: "List repositories for a user or organization",
      namespace: "github",
    },
    {
      id: "5",
      name: "get_file_contents",
      description: "Get the contents of a file from a repository",
      namespace: "github",
    },
    {
      id: "6",
      name: "search_repositories",
      description: "Search for repositories matching a query",
      namespace: "github",
    },
    {
      id: "7",
      name: "create_branch",
      description: "Create a new branch in a repository",
      namespace: "github",
    },
    {
      id: "8",
      name: "push_files",
      description: "Push multiple files to a repository in a single commit",
      namespace: "github",
    },
  ],
};

function ServerDetailPage() {
  const { serverId: _serverId } = Route.useParams();
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  // TODO: Fetch server data based on _serverId
  const server = MOCK_SERVER;

  useEffect(() => {
    // Header animation
    const tl = gsap.timeline();

    tl.fromTo(
      ".back-link",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    )
      .fromTo(
        ".server-icon",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.2"
      )
      .fromTo(
        ".server-info",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
        "-=0.3"
      )
      .fromTo(
        ".action-buttons",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.2"
      );

    // Stats cards animation
    gsap.fromTo(
      ".stat-card",
      { opacity: 0, y: 20, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.4,
      }
    );

    // Tools animation
    gsap.fromTo(
      ".tool-item",
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.6,
      }
    );

    // Sidebar animation
    gsap.fromTo(
      ".sidebar-card",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.5,
      }
    );
  }, []);

  const copyEndpoint = () => {
    navigator.clipboard.writeText(server.endpoint);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <FloatingParticles />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div
        ref={headerRef}
        className="relative border-b border-border/50 bg-card/30 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/explore"
            className="back-link mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {server.iconUrl ? (
                <div
                  className="server-icon flex h-16 w-16 items-center justify-center rounded-xl bg-card p-2"
                  style={{
                    boxShadow: "0 0 30px rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <img
                    src={server.iconUrl}
                    alt={server.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="server-icon flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10"
                  style={{
                    boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <Server className="h-8 w-8 text-primary" />
                </div>
              )}
              <div className="server-info">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {server.name}
                  </h1>
                  {server.isVerified && (
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-primary"
                      style={{
                        boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
                      }}
                    >
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <span
                    className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400"
                    style={{
                      boxShadow: "0 0 10px rgba(34, 197, 94, 0.2)",
                    }}
                  >
                    Active
                  </span>
                </div>
                <p className="mt-1 max-w-2xl text-muted-foreground">
                  {server.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {server.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-lg bg-muted/50 px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground"
                    >
                      {cat}
                    </span>
                  ))}
                  {server.homepageUrl && (
                    <a
                      href={server.homepageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Website
                    </a>
                  )}
                  {server.repositoryUrl && (
                    <a
                      href={server.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github className="h-3.5 w-3.5" />
                      Source
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="action-buttons flex gap-3">
              <button
                className="group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all"
                style={{
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
                }}
              >
                <Play className="h-4 w-4" />
                Try in Playground
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-accent to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={<Wrench className="h-5 w-5" />}
              label="Tools"
              value={server.tools.length.toString()}
              color="purple"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Total Calls"
              value={`${(server.stats.totalCalls / 1000).toFixed(1)}k`}
              color="cyan"
            />
            <StatCard
              icon={<Shield className="h-5 w-5" />}
              label="Success Rate"
              value={`${server.stats.successRate}%`}
              color="green"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Avg Latency"
              value={`${server.stats.avgLatency}ms`}
              color="yellow"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Tools List */}
          <div ref={toolsRef} className="lg:col-span-2">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Zap className="h-5 w-5 text-primary" />
              Available Tools ({server.tools.length})
            </h2>
            <div className="divide-y divide-border/50 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
              {server.tools.map((tool) => (
                <ToolItem key={tool.id} tool={tool} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connection */}
            <div
              className="sidebar-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Globe className="h-4 w-4 text-primary" />
                Connect via Nexus
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">
                    Endpoint
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">
                      {server.endpoint}
                    </code>
                    <button
                      onClick={copyEndpoint}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 transition-all hover:border-primary/50 hover:bg-muted"
                      style={
                        copiedEndpoint
                          ? { boxShadow: "0 0 15px rgba(34, 197, 94, 0.3)" }
                          : {}
                      }
                    >
                      {copiedEndpoint ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">
                    Transport
                  </label>
                  <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground">
                    {server.transport}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Start */}
            <div
              className="sidebar-card rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm"
              style={{
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Play className="h-4 w-4 text-accent" />
                Quick Start
              </h3>
              <div
                className="rounded-lg border border-border/50 bg-muted/30 p-4"
                style={{
                  boxShadow: "inset 0 0 30px rgba(139, 92, 246, 0.05)",
                }}
              >
                <pre className="overflow-x-auto font-mono text-xs">
                  <code>
                    <span className="text-muted-foreground/60">
                      {"// Call a tool through Nexus"}
                    </span>
                    {"\n"}
                    <span className="text-accent">await</span>{" "}
                    <span className="text-foreground">nexus</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-primary">call</span>
                    <span className="text-muted-foreground">(</span>
                    {"\n"}
                    {"  "}
                    <span className="text-green-400">
                      "nexus.{server.tools[0]?.namespace}.{server.tools[0]?.name}"
                    </span>
                    <span className="text-muted-foreground">,</span>
                    {"\n"}
                    {"  "}
                    <span className="text-muted-foreground">{"{ "}</span>
                    <span className="text-muted-foreground/60">/* args */</span>
                    <span className="text-muted-foreground">{" }"}</span>
                    {"\n"}
                    <span className="text-muted-foreground">);</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolItem({
  tool,
}: {
  tool: { id: string; name: string; description: string; namespace: string };
}) {
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    gsap.to(itemRef.current, {
      x: 4,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(itemRef.current, {
      x: 0,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={itemRef}
      className="tool-item group flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        <div className="flex items-center gap-2">
          <code
            className="rounded-md bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary"
            style={{
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.1)",
            }}
          >
            {tool.namespace}.{tool.name}
          </code>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "purple" | "cyan" | "green" | "yellow";
}) {
  const colorMap = {
    purple: {
      bg: "bg-primary/10",
      text: "text-primary",
      glow: "rgba(139, 92, 246, 0.2)",
    },
    cyan: {
      bg: "bg-accent/10",
      text: "text-accent",
      glow: "rgba(6, 182, 212, 0.2)",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      glow: "rgba(34, 197, 94, 0.2)",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      glow: "rgba(234, 179, 8, 0.2)",
    },
  };

  const colors = colorMap[color];

  return (
    <div
      className="stat-card rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
      style={{
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.1)`,
      }}
    >
      <div className={`mb-2 ${colors.text}`}>{icon}</div>
      <p
        className="text-2xl font-bold text-foreground"
        style={{
          textShadow: `0 0 20px ${colors.glow}`,
        }}
      >
        {value}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
