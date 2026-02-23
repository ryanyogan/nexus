import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/docs/mcp-tools/")({
  component: McpToolsOverview,
});

function McpToolsOverview() {
  const toc = [
    { id: "overview", title: "Overview", level: 2 },
    { id: "documentation-tools", title: "Documentation Tools", level: 2 },
    { id: "memory-tools", title: "Memory Tools", level: 2 },
    { id: "server-tools", title: "Server Registry Tools", level: 2 },
    { id: "protocol", title: "MCP Protocol", level: 2 },
    { id: "error-handling", title: "Error Handling", level: 2 },
  ];

  return (
    <DocsLayout
      title="MCP Tools"
      description="Model Context Protocol tools for AI coding assistants"
      toc={toc}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 id="overview" className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>

        <p className="mb-4 text-muted-foreground">
          Nexus exposes its functionality through the Model Context Protocol (MCP),
          allowing AI coding assistants to access library documentation, persistent
          memory, and MCP server discovery. The MCP endpoint provides <strong className="text-foreground">14 tools</strong>:
          4 for documentation search, 6 for memory management, and 4 for MCP server discovery.
        </p>

        <CodeBlock language="text">
{`MCP Endpoint: https://api.nexus.yogan.dev/mcp
Protocol Version: 2024-11-05`}
        </CodeBlock>

        <Callout type="info" title="What is MCP?">
          The Model Context Protocol is an open standard that enables AI assistants
          to connect to external data sources and tools. Learn more at{" "}
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            modelcontextprotocol.io
          </a>
        </Callout>
      </section>

      {/* Documentation Tools */}
      <section className="mb-12">
        <h2 id="documentation-tools" className="mb-4 text-xl font-semibold text-foreground">
          Documentation Tools
        </h2>

        <p className="mb-4 text-muted-foreground">
          These tools provide access to pre-indexed library documentation with semantic search.
        </p>

        <div className="space-y-4">
          <ToolCard
            name="resolve-library"
            description="Search for a library by name to get its Nexus library ID. This should be called first to find the correct library before querying documentation."
            href="/docs/mcp-tools/resolve-library"
          />
          <ToolCard
            name="query-docs"
            description="Perform semantic search within a library's documentation. Returns relevant code examples, API references, and explanations ranked by relevance."
            href="/docs/mcp-tools/query-docs"
          />
          <ToolCard
            name="get-library-info"
            description="Get detailed metadata about a specific library including version, documentation coverage, and usage statistics."
            href="/docs/mcp-tools/get-library-info"
          />
          <ToolCard
            name="list-libraries"
            description="List all available indexed libraries. Optionally filter by category to discover what documentation is available."
            href="/docs/mcp-tools/list-libraries"
          />
        </div>
      </section>

      {/* Memory Tools */}
      <section className="mb-12">
        <h2 id="memory-tools" className="mb-4 text-xl font-semibold text-foreground">
          Memory Tools
          <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            New
          </span>
        </h2>

        <p className="mb-4 text-muted-foreground">
          These tools provide persistent memory across sessions. Store project context,
          architectural decisions, session summaries, and lessons learned.
        </p>

        <div className="space-y-4">
          <ToolCard
            name="Memory Tools (6)"
            description="Store and retrieve project context, architectural decisions, session summaries, and lessons learned. Includes save-memory, recall-memories, get-project-context, list-memories, update-memory, and delete-memory."
            href="/docs/mcp-tools/memory"
          />
        </div>

        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h3 className="mb-2 font-semibold text-foreground">Memory Types</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><code className="text-primary">project_context</code> - Architecture, tech stack, conventions</li>
            <li><code className="text-primary">session_summary</code> - What was accomplished in a session</li>
            <li><code className="text-primary">decision</code> - Architectural decisions with rationale</li>
            <li><code className="text-primary">correction</code> - Lessons learned, things to avoid</li>
          </ul>
        </div>
      </section>

      {/* Server Registry Tools */}
      <section className="mb-12">
        <h2 id="server-tools" className="mb-4 text-xl font-semibold text-foreground">
          Server Registry Tools
          <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            New
          </span>
        </h2>

        <p className="mb-4 text-muted-foreground">
          These tools help discover and install MCP servers that extend AI capabilities
          with access to databases, file systems, APIs, and more.
        </p>

        <div className="space-y-4">
          <ToolCard
            name="Server Registry Tools (4)"
            description="Discover MCP servers by category or capability, get server details and installation instructions. Includes discover-servers, get-server-info, get-server-config, and list-server-categories."
            href="/docs/mcp-tools/servers"
          />
        </div>
      </section>

      {/* Protocol */}
      <section className="mb-12">
        <h2 id="protocol" className="mb-4 text-xl font-semibold text-foreground">
          MCP Protocol
        </h2>

        <p className="mb-4 text-muted-foreground">
          Nexus implements the MCP protocol over HTTP. Requests are sent as JSON-RPC
          2.0 messages:
        </p>

        <CodeBlock language="json" filename="Request">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "resolve-library",
    "arguments": {
      "libraryName": "react"
    }
  }
}`}
        </CodeBlock>

        <CodeBlock language="json" filename="Response">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\\"success\\": true, \\"results\\": [...]}"
      }
    ]
  }
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Supported Methods
        </h3>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Method</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-primary">initialize</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Initialize the MCP connection
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3 font-mono text-primary">tools/list</td>
                <td className="px-4 py-3 text-muted-foreground">
                  List available tools and their schemas
                </td>
              </tr>
              <tr className="bg-card/30">
                <td className="px-4 py-3 font-mono text-primary">tools/call</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Execute a tool with arguments
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Error Handling */}
      <section className="mb-12">
        <h2 id="error-handling" className="mb-4 text-xl font-semibold text-foreground">
          Error Handling
        </h2>

        <p className="mb-4 text-muted-foreground">
          Errors are returned using standard JSON-RPC error codes:
        </p>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono">-32601</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Method not found
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3 font-mono">-32602</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Invalid params (missing required arguments)
                </td>
              </tr>
              <tr className="bg-card/30">
                <td className="px-4 py-3 font-mono">-32603</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Internal error (tool execution failed)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CodeBlock language="json" filename="Error Response">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "libraryName is required"
  }
}`}
        </CodeBlock>
      </section>
    </DocsLayout>
  );
}

function ToolCard({
  name,
  description,
  href,
}: {
  name: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/50"
    >
      <div>
        <h3 className="font-mono font-semibold text-foreground">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}


