import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Terminal, Layers } from "lucide-react";

export const Route = createFileRoute("/docs")({ component: DocsPage });

function DocsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Documentation</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Learn how to use Nexus to connect to MCP servers
          </p>
        </div>

        <div className="space-y-8">
          <DocSection
            icon={<Layers className="h-6 w-6" />}
            title="Getting Started"
            description="Connect your MCP client to Nexus in minutes"
          >
            <pre className="overflow-x-auto rounded-lg bg-card p-4 text-sm">
              <code className="text-muted-foreground">
{`// 1. Point your MCP client to Nexus
const client = new MCPClient("https://nexus.yogan.dev/mcp");

// 2. List available tools
const tools = await client.listTools();

// 3. Call any tool
const result = await client.call("nexus.github.create_pr", {
  title: "My PR",
  body: "Description"
});`}
              </code>
            </pre>
          </DocSection>

          <DocSection
            icon={<Terminal className="h-6 w-6" />}
            title="Tool Namespacing"
            description="Tools are namespaced by their source server"
          >
            <p className="text-muted-foreground">
              All tools in Nexus follow the pattern{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-primary">
                nexus.{"{server}"}.{"{tool}"}
              </code>
            </p>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>
                <code className="text-primary">nexus.github.create_pr</code> -
                Create a GitHub pull request
              </li>
              <li>
                <code className="text-primary">nexus.cloudflare.deploy_worker</code> -
                Deploy a Cloudflare Worker
              </li>
              <li>
                <code className="text-primary">nexus.filesystem.read_file</code> -
                Read a local file
              </li>
            </ul>
          </DocSection>

          <DocSection
            icon={<BookOpen className="h-6 w-6" />}
            title="Semantic Search"
            description="Don't know the exact tool name? Just describe what you need"
          >
            <p className="text-muted-foreground">
              Nexus uses AI-powered semantic search to match your intent to the
              right tool. Just call with a description and Nexus will find the
              best match.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-card p-4 text-sm">
              <code className="text-muted-foreground">
{`// Semantic matching finds the right tool
await client.call("search the web for TypeScript tutorials");
// Routes to: nexus.brave-search.web_search`}
              </code>
            </pre>
          </DocSection>
        </div>
      </div>
    </div>
  );
}

function DocSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="pl-13">{children}</div>
    </section>
  );
}
