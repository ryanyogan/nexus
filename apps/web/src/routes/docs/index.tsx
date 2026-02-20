import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { CodeBlock } from "../../components/docs/CodeBlock";
import { Callout } from "../../components/docs/Callout";
import { Link } from "@tanstack/react-router";
import { Zap, Search, Code, Database, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/docs/")({
  component: DocsOverview,
});

function DocsOverview() {
  return (
    <DocsLayout
      title="Documentation"
      description="Learn how to use Nexus - The Documentation Oracle for AI"
    >
      {/* Hero section */}
      <div className="mb-12 rounded-xl border border-border/50 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-8">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          What is Nexus?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Nexus is a documentation aggregation and semantic search platform that makes
          library documentation accessible to AI coding assistants. It indexes
          documentation from popular libraries and frameworks, then serves relevant
          snippets via MCP (Model Context Protocol) tools or REST API.
        </p>
      </div>

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
      </section>

      {/* Links */}
      <section>
        <h2 id="resources" className="mb-6 text-xl font-semibold text-foreground">
          Resources
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <ResourceLink
            href="https://github.com/yogan/nexus"
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
