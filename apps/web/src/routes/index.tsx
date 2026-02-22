import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  BookOpen,
  Brain,
  Globe,
  ArrowRight,
  Github,
  Search,
  History,
  Sparkles,
  Server,
  Zap,
  Database,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import {
  statsQueryOptions,
  featuredServersQueryOptions,
  type McpServer,
} from "../lib/query-options";
import {
  StatsSkeleton,
  ServerPreviewCardSkeleton,
} from "../components/skeletons";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    // Prefetch stats and featured servers on the server for SSR
    context.queryClient.ensureQueryData(statsQueryOptions);
    context.queryClient.ensureQueryData(featuredServersQueryOptions);
  },
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Documentation + Server Registry + Memory
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The AI Coding Assistant{" "}
              <span className="text-primary">That Remembers</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Instant documentation search, MCP server discovery, and persistent
              memory across sessions. One MCP server that does it all.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/docs/getting-started"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <BookOpen className="h-5 w-5" />
                Browse Libraries
              </Link>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<StatsSkeleton />}>
            <StatsDisplay />
          </Suspense>
        </div>
      </section>

      {/* Features Section - 6 cards */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything your AI needs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Documentation, server discovery, and memory in one unified MCP
              server.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="Instant Doc Search"
              description="Pre-indexed documentation with semantic search. Queries return in milliseconds with relevant code examples."
            />
            <FeatureCard
              icon={<Server className="h-6 w-6" />}
              title="MCP Server Registry"
              description="Discover and install MCP servers. Get ready-to-use configs for Claude Desktop, VS Code, and OpenCode."
            />
            <FeatureCard
              icon={<History className="h-6 w-6" />}
              title="Persistent Memory"
              description="Remember project context, architectural decisions, and lessons learned across sessions."
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              title="Semantic Understanding"
              description="AI-powered embeddings find conceptually related content, not just keyword matches."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Full MCP Protocol"
              description="Tools, Resources, and Prompts. The complete MCP experience with proper streaming support."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Multi-Library Search"
              description="Search across 30+ indexed libraries at once or filter by specific package."
            />
          </div>
        </div>
      </section>

      {/* MCP Server Gallery Section */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                MCP Server Registry
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Discover and install MCP servers with one-click configs
              </p>
            </div>
<Link
              to="/explore/servers"
              className="hidden items-center gap-2 text-primary hover:underline sm:inline-flex"
            >
              View all servers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Featured Servers */}
          <Suspense fallback={<FeaturedServersSkeleton />}>
            <FeaturedServersDisplay />
          </Suspense>

          <div className="mt-6 sm:hidden">
            <Link
              to="/explore/servers"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              View all servers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Get started in minutes
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Add Nexus to your AI coding assistant with a single configuration.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-4">
            <StepCard
              number="1"
              title="Add the MCP Server"
              description="Add Nexus to your AI assistant's MCP configuration."
              code={`{
  "mcpServers": {
    "nexus": {
      "url": "https://api.nexus.yogan.dev/mcp"
    }
  }
}`}
            />
            <StepCard
              number="2"
              title="Search Documentation"
              description="Find documentation for any library instantly."
              code={`// Ask your AI:
"Find docs for TanStack Query"

// Returns relevant code examples`}
            />
            <StepCard
              number="3"
              title="Discover MCP Servers"
              description="Find and install other MCP servers."
              code={`// Ask your AI:
"Find MCP servers for databases"

// Returns servers with configs`}
            />
            <StepCard
              number="4"
              title="Save & Remember"
              description="Store project context for future sessions."
              code={`// Save context:
"Remember we use Hono + D1"

// Recalled next session!`}
            />
          </div>
        </div>
      </section>

      {/* Why Nexus Section */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Nexus?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The problems we solve for AI-assisted development
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ProblemCard
              problem="AI forgets everything between sessions"
              solution="Persistent memory stores project context, decisions, and lessons learned"
            />
            <ProblemCard
              problem="Outdated docs in LLM training data"
              solution="Real-time indexed documentation always up-to-date"
            />
            <ProblemCard
              problem="Context window limits"
              solution="Semantic search returns only relevant chunks"
            />
            <ProblemCard
              problem="MCP server discovery is fragmented"
              solution="Curated registry with ready-to-use configs"
            />
            <ProblemCard
              problem="Configuration hell across clients"
              solution="Generate configs for Claude, VS Code, OpenCode"
            />
            <ProblemCard
              problem="No single source of truth"
              solution="One MCP server: docs + servers + memory"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Add Nexus to your AI coding assistant and get instant access to
              documentation for 30+ libraries, 18+ MCP servers, and persistent
              memory.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/docs/getting-started"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/ryanyogan/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Stats Display Component (with Suspense)
// ============================================================================

function StatsDisplay() {
  const { data: stats } = useSuspenseQuery(statsQueryOptions);

  return (
    <div className="mx-auto mt-16 max-w-4xl">
      <div className="grid grid-cols-2 gap-6 rounded-lg border border-border bg-card p-6 sm:grid-cols-5">
        <StatItem value={stats.libraries.indexed} label="Libraries" />
        <StatItem value={stats.servers?.total || 18} label="MCP Servers" />
        <StatItem value={stats.documentation.totalChunks} label="Doc Chunks" />
        <StatItem
          value={Math.round(stats.documentation.totalTokens / 1000)}
          label="K Tokens"
        />
        <StatItem value={stats.usage.totalQueries} label="Queries" />
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-foreground">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

// ============================================================================
// Featured Servers Display (with Suspense)
// ============================================================================

function FeaturedServersDisplay() {
  const { data: servers } = useSuspenseQuery(featuredServersQueryOptions);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {servers.map((server) => (
        <ServerPreviewCard key={server.id} server={server} />
      ))}
    </div>
  );
}

function FeaturedServersSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ServerPreviewCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ServerPreviewCard({ server }: { server: McpServer }) {
  return (
    <Link
      to="/explore/servers/$serverId"
      params={{ serverId: server.id }}
      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {server.iconUrl ? (
          <img
            src={server.iconUrl}
            alt={server.name}
            className="h-6 w-6 object-contain"
          />
        ) : (
          <Database className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-foreground">{server.name}</h3>
          {server.isOfficial && (
            <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Official
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {server.description}
        </p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

// ============================================================================
// Feature Card Component
// ============================================================================

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ============================================================================
// Problem/Solution Card Component
// ============================================================================

function ProblemCard({
  problem,
  solution,
}: {
  problem: string;
  solution: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="mb-3 text-sm font-medium text-destructive line-through decoration-destructive/50">
        {problem}
      </p>
      <div className="flex items-start gap-2">
        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
        <p className="text-sm text-foreground">{solution}</p>
      </div>
    </div>
  );
}

// ============================================================================
// Step Card Component
// ============================================================================

function StepCard({
  number,
  title,
  description,
  code,
}: {
  number: string;
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
        <code className="text-muted-foreground">{code}</code>
      </pre>
    </div>
  );
}
