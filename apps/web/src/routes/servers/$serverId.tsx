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
} from "lucide-react";
import { useState } from "react";

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

  // TODO: Fetch server data based on _serverId
  const server = MOCK_SERVER;

  const copyEndpoint = () => {
    navigator.clipboard.writeText(server.endpoint);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/explore"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {server.iconUrl ? (
                <img
                  src={server.iconUrl}
                  alt={server.name}
                  className="h-16 w-16 rounded-xl"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                  <Server className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {server.name}
                  </h1>
                  {server.isVerified && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
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
                      className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground"
                    >
                      {cat}
                    </span>
                  ))}
                  {server.homepageUrl && (
                    <a
                      href={server.homepageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
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
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Github className="h-3.5 w-3.5" />
                      Source
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <Play className="h-4 w-4" />
                Try in Playground
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              icon={<Wrench className="h-5 w-5" />}
              label="Tools"
              value={server.tools.length.toString()}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Total Calls"
              value={`${(server.stats.totalCalls / 1000).toFixed(1)}k`}
            />
            <StatCard
              icon={<Check className="h-5 w-5" />}
              label="Success Rate"
              value={`${server.stats.successRate}%`}
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Avg Latency"
              value={`${server.stats.avgLatency}ms`}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Tools List */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Available Tools ({server.tools.length})
            </h2>
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {server.tools.map((tool) => (
                <div
                  key={tool.id}
                  className="group flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary">
                        {tool.namespace}.{tool.name}
                      </code>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connection */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 font-semibold text-foreground">
                Connect via Nexus
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs text-muted-foreground">
                    Endpoint
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-sm text-foreground">
                      {server.endpoint}
                    </code>
                    <button
                      onClick={copyEndpoint}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
                    >
                      {copiedEndpoint ? (
                        <Check className="h-4 w-4 text-green-500" />
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
                  <p className="text-sm text-foreground">{server.transport}</p>
                </div>
              </div>
            </div>

            {/* Quick Start */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 font-semibold text-foreground">
                Quick Start
              </h3>
              <div className="rounded-lg bg-muted p-3">
                <pre className="overflow-x-auto text-xs text-muted-foreground">
                  <code>
                    {`// Call a tool through Nexus
await nexus.call(
  "nexus.${server.tools[0]?.namespace}.${server.tools[0]?.name}",
  { /* args */ }
);`}
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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 text-muted-foreground">{icon}</div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
