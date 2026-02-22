import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { CodeBlock } from "../../components/docs/CodeBlock";
import { Callout } from "../../components/docs/Callout";
import { Link } from "@tanstack/react-router";
import {
  Zap,
  Search,
  Code,
  Database,
  ArrowRight,
  Brain,
  History,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/docs/")({
  component: DocsOverview,
});

function DocsOverview() {
  return (
    <DocsLayout
      title="Documentation"
      description="Learn how to use Nexus - Documentation Search + Persistent Memory for AI"
    >
      {/* Hero section */}
      <div className="mb-12 rounded-xl border border-border/50 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          What is Nexus?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Nexus is an MCP server that combines <strong className="text-foreground">instant documentation search</strong> with{" "}
          <strong className="text-foreground">persistent memory</strong> across coding sessions.
          It solves the two biggest pain points with AI coding assistants: slow documentation lookups
          and having to re-explain your project every session.
        </p>
      </div>

      {/* What is MCP? */}
      <section className="mb-12">
        <h2 id="what-is-mcp" className="mb-6 text-xl font-semibold text-foreground">
          What is MCP?
        </h2>

        <p className="mb-4 text-muted-foreground">
          <strong className="text-foreground">Model Context Protocol (MCP)</strong> is an open standard
          that enables AI assistants to securely access external tools and data sources. Think of it
          as a universal adapter that lets AI assistants use specialized capabilities.
        </p>

        <div className="mb-6 rounded-lg border border-border/50 bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">How it works:</strong> Your AI assistant (Claude, Cursor, Windsurf, etc.)
            connects to MCP servers that provide specific capabilities. When you ask a question, the AI
            can call tools from these servers to get information or perform actions.
          </p>
        </div>

        <p className="text-muted-foreground">
          Nexus is an MCP server that provides 10 tools: 4 for documentation search and 6 for
          persistent memory. Once connected, your AI assistant can automatically use these tools
          to look up library documentation and remember context across sessions.
        </p>
      </section>

      {/* What Problems Nexus Solves */}
      <section className="mb-12">
        <h2 id="problems-solved" className="mb-6 text-xl font-semibold text-foreground">
          What Problems Nexus Solves
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <ProblemSolutionCard
            problem="Slow Documentation Fetching"
            problemIcon={<Clock className="h-5 w-5" />}
            description="Other MCP tools fetch docs in real-time, taking 2-10+ seconds per query."
            solution="Pre-indexed docs return in milliseconds"
            solutionIcon={<Zap className="h-5 w-5" />}
          />
          <ProblemSolutionCard
            problem="Re-explaining Your Project"
            problemIcon={<AlertTriangle className="h-5 w-5" />}
            description="Every new session starts from scratch - you have to re-describe your architecture."
            solution="Memory persists across sessions"
            solutionIcon={<History className="h-5 w-5" />}
          />
          <ProblemSolutionCard
            problem="Rate Limits & Failures"
            problemIcon={<AlertTriangle className="h-5 w-5" />}
            description="Real-time fetching hits GitHub API limits and website blocks."
            solution="No external fetches during queries"
            solutionIcon={<CheckCircle className="h-5 w-5" />}
          />
          <ProblemSolutionCard
            problem="Poor Search Quality"
            problemIcon={<AlertTriangle className="h-5 w-5" />}
            description="Keyword matching misses conceptually related content."
            solution="Semantic vector search by meaning"
            solutionIcon={<Brain className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 id="how-it-works" className="mb-6 text-xl font-semibold text-foreground">
          How It Works
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<Database className="h-5 w-5" />}
            title="1. Index"
            description="Documentation is crawled, chunked, and embedded using AI models for semantic understanding."
          />
          <FeatureCard
            icon={<Search className="h-5 w-5" />}
            title="2. Search"
            description="Queries are embedded and matched against the vector index to find relevant documentation."
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="3. Retrieve"
            description="The most relevant chunks are fetched from storage and returned with context."
          />
          <FeatureCard
            icon={<Code className="h-5 w-5" />}
            title="4. Use"
            description="AI assistants use the documentation to provide accurate, up-to-date answers."
          />
        </div>
      </section>

      {/* Quick start */}
      <section className="mb-12">
        <h2 id="quick-start" className="mb-6 text-xl font-semibold text-foreground">
          Quick Start
        </h2>

        <p className="mb-4 text-muted-foreground">
          Add Nexus to your AI coding assistant's MCP configuration:
        </p>

        <CodeBlock language="json" filename="mcp_config.json">
{`{
  "mcpServers": {
    "nexus": {
      "url": "https://api.nexus.yogan.dev/mcp"
    }
  }
}`}
        </CodeBlock>

        <Callout type="tip" title="Works with any MCP client">
          Nexus works with Claude Desktop, Cursor, Windsurf, and any other
          AI coding assistant that supports MCP.
        </Callout>
      </section>

      {/* Integration options */}
      <section className="mb-12">
        <h2 id="integration" className="mb-6 text-xl font-semibold text-foreground">
          Integration Options
        </h2>

        <div className="space-y-4">
          <IntegrationCard
            href="/docs/mcp-tools"
            title="MCP Tools"
            description="Use the Model Context Protocol for seamless AI integration. Best for Claude Desktop, Cursor, and similar tools."
            badge="Recommended"
          />
          <IntegrationCard
            href="/docs/api"
            title="REST API"
            description="Direct HTTP access to all Nexus features. Best for custom integrations and programmatic access."
          />
          <IntegrationCard
            href="/docs/web-ui"
            title="Web Interface"
            description="Browse and explore indexed libraries through the web UI at nexus.yogan.dev."
          />
        </div>
      </section>

      {/* Available tools */}
      <section className="mb-12">
        <h2 id="tools" className="mb-6 text-xl font-semibold text-foreground">
          Available MCP Tools
        </h2>

        <h3 className="mb-4 text-lg font-medium text-foreground">Documentation Tools</h3>
        <div className="mb-6 overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Tool</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3">
                  <Link
                    to="/docs/mcp-tools/resolve-library"
                    className="font-mono text-primary hover:underline"
                  >
                    resolve-library
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Search for a library by name to get its ID
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3">
                  <Link
                    to="/docs/mcp-tools/query-docs"
                    className="font-mono text-primary hover:underline"
                  >
                    query-docs
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Semantic search within a library's documentation
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3">
                  <Link
                    to="/docs/mcp-tools/get-library-info"
                    className="font-mono text-primary hover:underline"
                  >
                    get-library-info
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Get detailed information about a specific library
                </td>
              </tr>
              <tr className="bg-card/10">
                <td className="px-4 py-3">
                  <Link
                    to="/docs/mcp-tools/list-libraries"
                    className="font-mono text-primary hover:underline"
                  >
                    list-libraries
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  List all available indexed libraries
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <h3 className="text-lg font-medium text-foreground">Memory Tools</h3>
          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            New
          </span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Tool</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3">
                  <code className="font-mono text-primary">save-memory</code>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Store memories (project context, decisions, lessons learned)
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3">
                  <code className="font-mono text-primary">recall-memories</code>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Semantic search across stored memories
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3">
                  <code className="font-mono text-primary">get-project-context</code>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Get all stored context for a project
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3">
                  <code className="font-mono text-primary">list-memories</code>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Browse stored memories with filtering
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3">
                  <code className="font-mono text-primary">update-memory</code>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Update an existing memory's content or metadata
                </td>
              </tr>
              <tr className="bg-card/10">
                <td className="px-4 py-3">
                  <code className="font-mono text-primary">delete-memory</code>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Remove a stored memory
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Memory Types */}
      <section className="mb-12">
        <h2 id="memory-types" className="mb-6 text-xl font-semibold text-foreground">
          Memory Types
        </h2>

        <p className="mb-4 text-muted-foreground">
          Nexus supports different types of memories for different use cases:
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <MemoryTypeCard
            type="project_context"
            title="Project Context"
            description="Architecture, tech stack, conventions. Store once, recall every session."
            example="We use TanStack Start with Hono on Cloudflare Workers..."
          />
          <MemoryTypeCard
            type="session_summary"
            title="Session Summary"
            description="What was accomplished in a session. Enables continuity across conversations."
            example="Implemented user authentication with Better Auth..."
          />
          <MemoryTypeCard
            type="decision"
            title="Decision"
            description="Architectural decisions with rationale. Stop re-debating settled questions."
            example="Chose D1 over Postgres because of edge deployment..."
          />
          <MemoryTypeCard
            type="correction"
            title="Correction"
            description="Lessons learned, things to avoid. Build institutional knowledge."
            example="Don't use fetch in server loaders, use direct DB calls..."
          />
        </div>
      </section>

      {/* Links */}
      <section>
        <h2 id="resources" className="mb-6 text-xl font-semibold text-foreground">
          Resources
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResourceLink
            href="https://github.com/ryanyogan/nexus"
            title="GitHub Repository"
            description="View the source code and contribute"
          />
          <ResourceLink
            href="/explore"
            title="Explore Libraries"
            description="Browse all indexed documentation"
          />
          <ResourceLink
            href="/docs/submit"
            title="Submit a Library"
            description="Request indexing for a new library"
          />
          <ResourceLink
            href="https://modelcontextprotocol.io"
            title="MCP Documentation"
            description="Learn more about the Model Context Protocol"
          />
        </div>
      </section>
    </DocsLayout>
  );
}

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
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ProblemSolutionCard({
  problem,
  problemIcon,
  description,
  solution,
  solutionIcon,
}: {
  problem: string;
  problemIcon: React.ReactNode;
  description: string;
  solution: string;
  solutionIcon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <div className="mb-2 flex items-center gap-2 text-destructive">
        {problemIcon}
        <h3 className="font-semibold">{problem}</h3>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{description}</p>
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        {solutionIcon}
        <span className="text-sm font-medium">{solution}</span>
      </div>
    </div>
  );
}

function MemoryTypeCard({
  type,
  title,
  description,
  example,
}: {
  type: string;
  title: string;
  description: string;
  example: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <code className="mb-2 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {type}
      </code>
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="mb-2 text-sm text-muted-foreground">{description}</p>
      <p className="text-xs italic text-muted-foreground/70">"{example}"</p>
    </div>
  );
}

function IntegrationCard({
  href,
  title,
  description,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/50"
    >
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {badge && (
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}

function ResourceLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  const isExternal = href.startsWith("http");
  const Component = isExternal ? "a" : Link;
  const props = isExternal
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { to: href };

  return (
    <Component
      {...(props as any)}
      className="group rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/50"
    >
      <h3 className="font-semibold text-foreground group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Component>
  );
}
