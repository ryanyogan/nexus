import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";

export const Route = createFileRoute("/docs/mcp-tools/servers")({
  component: ServerToolsDocs,
});

function ServerToolsDocs() {
  const toc = [
    { id: "overview", title: "Overview", level: 2 },
    { id: "discover-servers", title: "discover-servers", level: 2 },
    { id: "get-server-info", title: "get-server-info", level: 2 },
    { id: "get-server-config", title: "get-server-config", level: 2 },
    { id: "list-server-categories", title: "list-server-categories", level: 2 },
    { id: "examples", title: "Examples", level: 2 },
  ];

  return (
    <DocsLayout
      title="MCP Server Registry Tools"
      description="Discover and install MCP servers for AI capabilities"
      toc={toc}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 id="overview" className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>
        <p className="mb-4 text-muted-foreground">
          Nexus maintains a registry of MCP servers that extend AI capabilities.
          These tools help discover servers, get installation instructions, and
          generate configuration for various MCP clients.
        </p>
        <Callout type="info" title="What are MCP Servers?">
          MCP (Model Context Protocol) servers provide AI assistants with access to
          external tools, resources, and capabilities like file systems, databases,
          APIs, and more.
        </Callout>
      </section>

      {/* discover-servers */}
      <section className="mb-12">
        <h2 id="discover-servers" className="mb-4 text-xl font-semibold text-foreground">
          discover-servers
        </h2>
        <p className="mb-4 text-muted-foreground">
          Search for MCP servers by capability, category, or name. Returns matching
          servers with their installation instructions and capabilities.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Parameters</h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li><code>query</code> - Search query (e.g., 'database access', 'github')</li>
          <li><code>capabilities</code> - Filter by: 'tools', 'resources', 'prompts'</li>
          <li><code>category</code> - Filter by category (database, filesystem, devtools, ai, cloud, etc.)</li>
          <li><code>official</code> - Only show official MCP servers</li>
          <li><code>limit</code> - Max results (1-20, default 10)</li>
        </ul>
        <CodeBlock language="json">
{`{
  "query": "database access",
  "capabilities": ["tools"],
  "category": "database",
  "limit": 5
}`}
        </CodeBlock>
      </section>

      {/* get-server-info */}
      <section className="mb-12">
        <h2 id="get-server-info" className="mb-4 text-xl font-semibold text-foreground">
          get-server-info
        </h2>
        <p className="mb-4 text-muted-foreground">
          Get detailed information about a specific MCP server including its tools,
          resources, prompts, installation instructions, and documentation links.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Parameters</h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li><code>serverId</code> (required) - The server ID (e.g., 'postgres', 'filesystem')</li>
        </ul>
        <CodeBlock language="json">
{`{
  "serverId": "postgres"
}`}
        </CodeBlock>
        <h3 className="mb-2 mt-4 text-lg font-medium text-foreground">Response</h3>
        <CodeBlock language="json">
{`{
  "success": true,
  "server": {
    "id": "postgres",
    "displayName": "PostgreSQL",
    "description": "Connect to PostgreSQL databases",
    "namespace": "modelcontextprotocol",
    "version": "0.5.0",
    "transportType": "stdio",
    "packageType": "npm",
    "packageName": "@modelcontextprotocol/server-postgres",
    "tools": [
      { "name": "query", "description": "Execute SQL queries" },
      { "name": "list_tables", "description": "List database tables" }
    ],
    "hasTools": true,
    "hasResources": true,
    "requiresAuth": true,
    "authType": "env",
    "isOfficial": true
  }
}`}
        </CodeBlock>
      </section>

      {/* get-server-config */}
      <section className="mb-12">
        <h2 id="get-server-config" className="mb-4 text-xl font-semibold text-foreground">
          get-server-config
        </h2>
        <p className="mb-4 text-muted-foreground">
          Generate installation configuration for an MCP server. Returns ready-to-use
          config for OpenCode, Claude Desktop, VS Code, or generic format.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Parameters</h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li><code>serverId</code> (required) - The server ID</li>
          <li><code>format</code> - Config format: 'opencode' (recommended), 'claude-desktop', 'vscode', 'generic'</li>
        </ul>
        <CodeBlock language="json">
{`{
  "serverId": "filesystem",
  "format": "opencode"
}`}
        </CodeBlock>
        <h3 className="mb-2 mt-4 text-lg font-medium text-foreground">Response (OpenCode format)</h3>
        <CodeBlock language="json">
{`{
  "format": "opencode",
  "config": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/dir"]
    }
  },
  "instructions": "Add to your opencode.json mcpServers section"
}`}
        </CodeBlock>
      </section>

      {/* list-server-categories */}
      <section className="mb-12">
        <h2 id="list-server-categories" className="mb-4 text-xl font-semibold text-foreground">
          list-server-categories
        </h2>
        <p className="mb-4 text-muted-foreground">
          List all available MCP server categories for filtering.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Response</h3>
        <CodeBlock language="json">
{`{
  "categories": [
    { "id": "database", "label": "Database", "count": 5 },
    { "id": "filesystem", "label": "File System", "count": 3 },
    { "id": "devtools", "label": "Developer Tools", "count": 8 },
    { "id": "ai", "label": "AI & ML", "count": 4 },
    { "id": "cloud", "label": "Cloud Services", "count": 6 },
    { "id": "productivity", "label": "Productivity", "count": 3 }
  ]
}`}
        </CodeBlock>
      </section>

      {/* Examples */}
      <section className="mb-12">
        <h2 id="examples" className="mb-4 text-xl font-semibold text-foreground">
          Examples
        </h2>
        
        <h3 className="mb-2 text-lg font-medium text-foreground">Find a Database Server</h3>
        <p className="mb-2 text-muted-foreground">
          Search for database-related MCP servers:
        </p>
        <CodeBlock language="json">
{`// Request
{ "query": "postgres database", "category": "database" }

// Then get the config
{ "serverId": "postgres", "format": "opencode" }`}
        </CodeBlock>

        <h3 className="mb-2 mt-6 text-lg font-medium text-foreground">Find Official Servers</h3>
        <p className="mb-2 text-muted-foreground">
          List only official MCP servers from the modelcontextprotocol org:
        </p>
        <CodeBlock language="json">
{`{ "official": true, "limit": 20 }`}
        </CodeBlock>

        <h3 className="mb-2 mt-6 text-lg font-medium text-foreground">Find Servers with Tools</h3>
        <p className="mb-2 text-muted-foreground">
          Find servers that provide tool capabilities:
        </p>
        <CodeBlock language="json">
{`{ "capabilities": ["tools"], "limit": 10 }`}
        </CodeBlock>
      </section>
    </DocsLayout>
  );
}
