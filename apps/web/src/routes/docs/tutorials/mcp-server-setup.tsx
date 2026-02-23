import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";

export const Route = createFileRoute("/docs/tutorials/mcp-server-setup")({
  component: McpServerSetupTutorial,
});

function McpServerSetupTutorial() {
  const toc = [
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "what-are-mcp-servers", title: "What Are MCP Servers?", level: 2 },
    { id: "step-1", title: "Step 1: Discover Servers", level: 2 },
    { id: "step-2", title: "Step 2: Get Server Details", level: 2 },
    { id: "step-3", title: "Step 3: Generate Config", level: 2 },
    { id: "step-4", title: "Step 4: Install and Configure", level: 2 },
    { id: "popular-servers", title: "Popular MCP Servers", level: 2 },
    { id: "troubleshooting", title: "Troubleshooting", level: 2 },
  ];

  return (
    <DocsLayout
      title="MCP Server Setup"
      description="Discover, install, and configure MCP servers to extend AI capabilities"
      toc={toc}
    >
      {/* Introduction */}
      <section className="mb-12">
        <h2 id="introduction" className="mb-4 text-xl font-semibold text-foreground">
          Introduction
        </h2>
        <p className="mb-4 text-muted-foreground">
          MCP (Model Context Protocol) servers extend what your AI assistant can do.
          While Nexus provides documentation search and memory, other MCP servers can
          give your AI access to databases, file systems, APIs, and more.
        </p>
        <p className="mb-4 text-muted-foreground">
          In this tutorial, you'll learn how to use Nexus to discover MCP servers and
          get installation configurations for your preferred client.
        </p>
      </section>

      {/* What Are MCP Servers */}
      <section className="mb-12">
        <h2 id="what-are-mcp-servers" className="mb-4 text-xl font-semibold text-foreground">
          What Are MCP Servers?
        </h2>
        <p className="mb-4 text-muted-foreground">
          MCP servers are plugins that connect AI assistants to external tools and data
          sources. They follow a standard protocol, making them compatible with any
          MCP-enabled client.
        </p>
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">Database Access</h3>
            <p className="text-sm text-muted-foreground">
              Query PostgreSQL, SQLite, or other databases directly from the AI.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">File System</h3>
            <p className="text-sm text-muted-foreground">
              Read, write, and manage files on your local or remote systems.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">API Integrations</h3>
            <p className="text-sm text-muted-foreground">
              Connect to GitHub, Slack, Linear, and other services.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">Browser Control</h3>
            <p className="text-sm text-muted-foreground">
              Automate web browsers for testing or data extraction.
            </p>
          </div>
        </div>
      </section>

      {/* Step 1 */}
      <section className="mb-12">
        <h2 id="step-1" className="mb-4 text-xl font-semibold text-foreground">
          Step 1: Discover Servers
        </h2>
        <p className="mb-4 text-muted-foreground">
          Use the <code>discover-servers</code> tool to find MCP servers that match
          your needs:
        </p>
        <CodeBlock language="text">
{`You: "Find MCP servers for database access"

AI: *calls discover-servers with query: "database access"*

Results:
1. postgres - PostgreSQL database integration
2. sqlite - SQLite database with full SQL support  
3. mysql - MySQL database access
4. supabase - Supabase client with auth and storage`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          You can also filter by category or capabilities:
        </p>
        <CodeBlock language="text">
{`You: "Show me official MCP servers in the devtools category"

AI: *calls discover-servers with:*
  - category: "devtools"
  - official: true`}
        </CodeBlock>
        <Callout type="tip" title="Browse All Servers">
          Visit the{" "}
          <a href="/explore/servers" className="text-primary hover:underline">
            Server Gallery
          </a>{" "}
          to browse all available MCP servers with filtering and search.
        </Callout>
      </section>

      {/* Step 2 */}
      <section className="mb-12">
        <h2 id="step-2" className="mb-4 text-xl font-semibold text-foreground">
          Step 2: Get Server Details
        </h2>
        <p className="mb-4 text-muted-foreground">
          Once you find a server you're interested in, get detailed information:
        </p>
        <CodeBlock language="text">
{`You: "Tell me more about the postgres MCP server"

AI: *calls get-server-info with serverId: "postgres"*

Response: 
Name: PostgreSQL Server
Description: Query and manage PostgreSQL databases
Package: @modelcontextprotocol/server-postgres
Transport: stdio

Tools provided:
- query: Execute SQL queries
- list_tables: List database tables
- describe_table: Get table schema

Required configuration:
- connectionString: PostgreSQL connection URL`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          This helps you understand what tools the server provides and what
          configuration it needs.
        </p>
      </section>

      {/* Step 3 */}
      <section className="mb-12">
        <h2 id="step-3" className="mb-4 text-xl font-semibold text-foreground">
          Step 3: Generate Config
        </h2>
        <p className="mb-4 text-muted-foreground">
          Get a ready-to-use configuration for your MCP client:
        </p>
        <CodeBlock language="text">
{`You: "Generate an OpenCode config for the postgres server"

AI: *calls get-server-config with:*
  - serverId: "postgres"
  - format: "opencode"`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          The result is a configuration snippet you can add directly to your client:
        </p>
        <CodeBlock language="json">
{`{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:password@localhost/mydb"
      ]
    }
  }
}`}
        </CodeBlock>
        <Callout type="info" title="Multiple Formats">
          Nexus supports config generation for OpenCode, Claude Desktop, VS Code, and
          generic JSON format.
        </Callout>
      </section>

      {/* Step 4 */}
      <section className="mb-12">
        <h2 id="step-4" className="mb-4 text-xl font-semibold text-foreground">
          Step 4: Install and Configure
        </h2>
        <p className="mb-4 text-muted-foreground">
          Add the generated config to your MCP client. Here's how for each client:
        </p>
        
        <h3 className="mt-6 mb-2 text-lg font-medium text-foreground">OpenCode</h3>
        <p className="mb-2 text-muted-foreground">
          Add to <code>~/.config/opencode/config.json</code> or project-level <code>.opencode/config.json</code>:
        </p>
        <CodeBlock language="json">
{`{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "YOUR_CONNECTION_STRING"]
    }
  }
}`}
        </CodeBlock>

        <h3 className="mt-6 mb-2 text-lg font-medium text-foreground">Claude Desktop</h3>
        <p className="mb-2 text-muted-foreground">
          Add to <code>claude_desktop_config.json</code>:
        </p>
        <CodeBlock language="json">
{`{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "YOUR_CONNECTION_STRING"]
    }
  }
}`}
        </CodeBlock>

        <h3 className="mt-6 mb-2 text-lg font-medium text-foreground">Cursor</h3>
        <p className="mb-2 text-muted-foreground">
          Add to <code>.cursor/mcp.json</code> in your project:
        </p>
        <CodeBlock language="json">
{`{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "YOUR_CONNECTION_STRING"]
    }
  }
}`}
        </CodeBlock>

        <p className="mt-4 text-muted-foreground">
          After adding the configuration, restart your MCP client to load the new server.
        </p>
      </section>

      {/* Popular Servers */}
      <section className="mb-12">
        <h2 id="popular-servers" className="mb-4 text-xl font-semibold text-foreground">
          Popular MCP Servers
        </h2>
        <p className="mb-4 text-muted-foreground">
          Here are some commonly used MCP servers to get you started:
        </p>
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">filesystem</h3>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400">
                Official
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Read and write files on your local filesystem with configurable access paths.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">github</h3>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400">
                Official
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Interact with GitHub repositories, issues, pull requests, and more.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">postgres</h3>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400">
                Official
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Query PostgreSQL databases directly from your AI assistant.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">puppeteer</h3>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400">
                Official
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Browser automation for web scraping, testing, and screenshots.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">slack</h3>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:text-blue-400">
                Official
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Send messages, read channels, and manage Slack workspaces.
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12">
        <h2 id="troubleshooting" className="mb-4 text-xl font-semibold text-foreground">
          Troubleshooting
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Server doesn't appear in tools list
            </h3>
            <p className="text-muted-foreground">
              Make sure you've restarted your MCP client after adding the configuration.
              Check the client's logs for connection errors.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-foreground">
              "Command not found" error
            </h3>
            <p className="text-muted-foreground">
              Ensure Node.js is installed and <code>npx</code> is available in your PATH.
              Try running the npx command manually to verify.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Connection refused to database
            </h3>
            <p className="text-muted-foreground">
              Verify your connection string is correct and the database is running.
              Check firewall rules if connecting to a remote database.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-medium text-foreground">
              Tool calls timing out
            </h3>
            <p className="text-muted-foreground">
              Some operations (like large database queries) may take time. Check if
              there's a timeout configuration in your MCP client.
            </p>
          </div>
        </div>
        <Callout type="info" title="Need More Help?">
          Check the{" "}
          <a href="/docs/troubleshooting" className="text-primary hover:underline">
            Troubleshooting guide
          </a>{" "}
          for more solutions, or visit the GitHub repository of the specific MCP server.
        </Callout>
      </section>
    </DocsLayout>
  );
}
