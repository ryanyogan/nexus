import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { CodeBlock } from "../../components/docs/CodeBlock";
import { Callout } from "../../components/docs/Callout";

export const Route = createFileRoute("/docs/sdk")({
  component: SDKPage,
});

function SDKPage() {
  const toc = [
    { id: "installation", title: "Installation", level: 2 },
    { id: "quick-start", title: "Quick Start", level: 2 },
    { id: "documentation-search", title: "Documentation Search", level: 2 },
    { id: "search-libraries", title: "Search Libraries", level: 3 },
    { id: "query-docs", title: "Query Documentation", level: 3 },
    { id: "memory", title: "Persistent Memory", level: 2 },
    { id: "save-memory", title: "Save Memory", level: 3 },
    { id: "recall-memory", title: "Recall Memory", level: 3 },
    { id: "mcp-servers", title: "MCP Server Discovery", level: 2 },
    { id: "tunnel", title: "OpenCode Remote Tunnel", level: 2 },
    { id: "tunnel-programmatic", title: "Programmatic Usage", level: 3 },
    { id: "tunnel-cli", title: "CLI Usage", level: 3 },
    { id: "error-handling", title: "Error Handling", level: 2 },
    { id: "api-reference", title: "API Reference", level: 2 },
  ];

  return (
    <DocsLayout
      title="SDK"
      description="Official TypeScript SDK for the Nexus API"
      toc={toc}
    >
      <p className="mb-6 text-lg text-muted-foreground">
        The <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">@nexus/sdk</code> package 
        provides a TypeScript client for documentation search, persistent memory, MCP server discovery, 
        and OpenCode remote tunnel capabilities.
      </p>

      {/* Installation */}
      <section className="mb-12">
        <h2 id="installation" className="mb-4 text-xl font-semibold text-foreground">
          Installation
        </h2>

        <CodeBlock language="bash">
{`npm install @nexus/sdk
# or
pnpm add @nexus/sdk
# or
yarn add @nexus/sdk`}
        </CodeBlock>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 id="quick-start" className="mb-4 text-xl font-semibold text-foreground">
          Quick Start
        </h2>

        <CodeBlock language="typescript">
{`import { Nexus } from "@nexus/sdk";

const nexus = new Nexus({
  apiKey: "your-api-key", // Get from https://nexus.yogan.dev/dashboard/keys
});

// Search for libraries
const libraries = await nexus.searchLibrary("react hooks");
console.log(libraries[0].id); // "react"

// Query documentation
const docs = await nexus.queryDocs("react", "how to use useState");
docs.chunks.forEach(chunk => {
  console.log(chunk.title, chunk.content);
});

// Save a memory
await nexus.saveMemory({
  title: "Auth decision",
  content: "We chose JWT tokens in httpOnly cookies...",
  type: "decision",
  project: "my-app"
});

// Recall memories
const memories = await nexus.recallMemories({
  query: "authentication",
  project: "my-app"
});`}
        </CodeBlock>

        <Callout type="info">
          Get your API key from the <a href="/dashboard/keys" className="text-primary hover:underline">Dashboard</a>.
        </Callout>
      </section>

      {/* Documentation Search */}
      <section className="mb-12">
        <h2 id="documentation-search" className="mb-4 text-xl font-semibold text-foreground">
          Documentation Search
        </h2>

        <p className="mb-4 text-muted-foreground">
          Search and query documentation from 200+ indexed libraries.
        </p>

        <h3 id="search-libraries" className="mb-3 text-lg font-semibold text-foreground">
          Search Libraries
        </h3>

        <CodeBlock language="typescript">
{`// Search for libraries by name or description
const results = await nexus.searchLibrary("state management");

// Resolve a library name to its ID
const libraryId = await nexus.resolveLibraryId("nextjs");
// Returns: "nextjs"

// Get library details
const library = await nexus.getLibrary("react");
console.log(library.totalChunks, library.totalTokens);

// List all libraries with filters
const { libraries, total } = await nexus.listLibraries({
  category: "frontend",
  featured: true,
  limit: 20
});`}
        </CodeBlock>

        <h3 id="query-docs" className="mb-3 mt-6 text-lg font-semibold text-foreground">
          Query Documentation
        </h3>

        <CodeBlock language="typescript">
{`// Query documentation with semantic search
const docs = await nexus.queryDocs("react", "server components", {
  limit: 10
});

// Access the results
docs.chunks.forEach(chunk => {
  console.log("Title:", chunk.title);
  console.log("Content:", chunk.content);
  console.log("Score:", chunk.score);
  console.log("Source:", chunk.sourceUrl);
});

console.log("Total tokens:", docs.totalTokens);`}
        </CodeBlock>
      </section>

      {/* Persistent Memory */}
      <section className="mb-12">
        <h2 id="memory" className="mb-4 text-xl font-semibold text-foreground">
          Persistent Memory
        </h2>

        <p className="mb-4 text-muted-foreground">
          Store and retrieve project context, decisions, and lessons learned across sessions.
        </p>

        <h3 id="save-memory" className="mb-3 text-lg font-semibold text-foreground">
          Save Memory
        </h3>

        <CodeBlock language="typescript">
{`// Save project context
await nexus.saveMemory({
  title: "Project architecture",
  content: "This project uses a monorepo structure with pnpm workspaces...",
  type: "project_context",
  project: "my-app",
  tags: ["architecture", "monorepo"],
  importance: 8  // 1-10 scale
});

// Save a decision
await nexus.saveMemory({
  title: "Auth implementation decision",
  content: "We chose JWT tokens stored in httpOnly cookies because...",
  type: "decision",
  project: "my-app",
  tags: ["auth", "security"]
});

// Save a correction (lesson learned)
await nexus.saveMemory({
  title: "Don't use localStorage for tokens",
  content: "We learned that storing JWT in localStorage is insecure...",
  type: "correction",
  project: "my-app"
});

// Save a session summary
await nexus.saveMemory({
  title: "Session: Implemented user authentication",
  content: "Added login/logout, JWT auth, protected routes...",
  type: "session_summary",
  project: "my-app"
});`}
        </CodeBlock>

        <h3 id="recall-memory" className="mb-3 mt-6 text-lg font-semibold text-foreground">
          Recall Memory
        </h3>

        <CodeBlock language="typescript">
{`// Semantic search for memories
const memories = await nexus.recallMemories({
  query: "how does authentication work",
  project: "my-app",
  limit: 5
});

// Filter by type
const decisions = await nexus.recallMemories({
  query: "security decisions",
  type: "decision",
  project: "my-app"
});

// Filter by tags
const authMemories = await nexus.recallMemories({
  query: "user login",
  tags: ["auth"],
  project: "my-app"
});

// Get all project context at once
const context = await nexus.getProjectContext("my-app");
console.log(context.projectContext);  // Architecture, setup, etc.
console.log(context.decisions);       // Past decisions
console.log(context.corrections);     // Lessons learned
console.log(context.sessionSummaries); // Past session summaries

// Update a memory
await nexus.updateMemory("memory-id", {
  content: "Updated content...",
  importance: 9
});

// Delete a memory
await nexus.deleteMemory("memory-id");`}
        </CodeBlock>
      </section>

      {/* MCP Servers */}
      <section className="mb-12">
        <h2 id="mcp-servers" className="mb-4 text-xl font-semibold text-foreground">
          MCP Server Discovery
        </h2>

        <CodeBlock language="typescript">
{`// Discover MCP servers
const servers = await nexus.discoverServers({
  query: "database",
  category: "database",
  official: true,
  limit: 10
});

// Get server details
const server = await nexus.getServer("postgres");
console.log(server.description);
console.log(server.transportType);

// Get installation configs for different clients
const config = await nexus.getServerConfig("postgres");

console.log("Claude Desktop config:");
console.log(JSON.stringify(config.claudeDesktop, null, 2));

console.log("VS Code config:");
console.log(JSON.stringify(config.vscode, null, 2));

console.log("OpenCode config:");
console.log(JSON.stringify(config.opencode, null, 2));`}
        </CodeBlock>
      </section>

      {/* Tunnel */}
      <section className="mb-12">
        <h2 id="tunnel" className="mb-4 text-xl font-semibold text-foreground">
          OpenCode Remote Tunnel
        </h2>

        <p className="mb-4 text-muted-foreground">
          Connect to your local OpenCode session from anywhere. The tunnel creates a secure 
          connection between your local OpenCode server and the Nexus web terminal, allowing 
          you to control your AI coding assistant from any device.
        </p>

        <h3 id="tunnel-programmatic" className="mb-3 text-lg font-semibold text-foreground">
          Programmatic Usage
        </h3>

        <CodeBlock language="typescript">
{`import { NexusTunnel } from "@nexus/sdk/tunnel";

const tunnel = new NexusTunnel({
  apiKey: "your-api-key",
  serverUrl: "http://localhost:4096", // Your local OpenCode server
  autoReconnect: true,
  sessionName: "my-dev-machine"
});

// Connect to the tunnel service
await tunnel.connect();

// Get the public URL
console.log("Public URL:", tunnel.status.publicUrl);
// Output: https://nexus.yogan.dev/terminal?session=abc123

// Listen for events
tunnel.on("connected", (event) => {
  console.log("Tunnel connected:", event.data);
});

tunnel.on("activity", (event) => {
  const { path, status } = event.data;
  console.log(\`Request: \${path} (\${status})\`);
});

tunnel.on("disconnected", (event) => {
  console.log("Tunnel disconnected:", event.data);
});

tunnel.on("error", (event) => {
  console.error("Tunnel error:", event.data);
});

// Check status
console.log("Connected:", tunnel.isConnected);
console.log("Messages relayed:", tunnel.status.messagesRelayed);

// Disconnect when done
tunnel.disconnect();`}
        </CodeBlock>

        <h3 id="tunnel-cli" className="mb-3 mt-6 text-lg font-semibold text-foreground">
          CLI Usage
        </h3>

        <CodeBlock language="bash">
{`# Start tunnel with API key
npx @nexus/sdk tunnel --api-key=YOUR_KEY

# Or use environment variable
export NEXUS_API_KEY=your-api-key
npx @nexus/sdk tunnel

# Specify local OpenCode server
npx @nexus/sdk tunnel --api-key=YOUR_KEY --server=http://localhost:4096

# Custom session name
npx @nexus/sdk tunnel --api-key=YOUR_KEY --name=my-laptop`}
        </CodeBlock>

        <Callout type="info">
          <strong>How it works:</strong>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Start your local OpenCode server (runs on port 4096 by default)</li>
            <li>Run the tunnel command to get a public URL</li>
            <li>Open <code className="rounded bg-muted/50 px-1 font-mono text-xs">https://nexus.yogan.dev/terminal</code></li>
            <li>Enter your session ID or scan the QR code</li>
            <li>Control your OpenCode session from any device!</li>
          </ol>
        </Callout>
      </section>

      {/* Error Handling */}
      <section className="mb-12">
        <h2 id="error-handling" className="mb-4 text-xl font-semibold text-foreground">
          Error Handling
        </h2>

        <CodeBlock language="typescript">
{`import { Nexus, NexusError } from "@nexus/sdk";
import { NexusTunnel, TunnelError } from "@nexus/sdk/tunnel";

// API errors
try {
  const docs = await nexus.queryDocs("unknown-lib", "query");
} catch (error) {
  if (error instanceof NexusError) {
    console.error(\`API Error (\${error.statusCode}): \${error.message}\`);
    
    if (error.statusCode === 401) {
      console.error("Invalid API key");
    } else if (error.statusCode === 404) {
      console.error("Library not found");
    } else if (error.statusCode === 429) {
      console.error("Rate limit exceeded");
    }
  }
}

// Tunnel errors
try {
  await tunnel.connect();
} catch (error) {
  if (error instanceof TunnelError) {
    console.error("Tunnel error:", error.message);
  }
}`}
        </CodeBlock>
      </section>

      {/* API Reference */}
      <section className="mb-12">
        <h2 id="api-reference" className="mb-4 text-xl font-semibold text-foreground">
          API Reference
        </h2>

        <h3 className="mb-3 text-lg font-semibold text-foreground">
          Nexus Client Options
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 text-left font-semibold">Option</th>
                <th className="py-2 pr-4 text-left font-semibold">Type</th>
                <th className="py-2 pr-4 text-left font-semibold">Default</th>
                <th className="py-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-foreground">apiKey</td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2 pr-4">required</td>
                <td className="py-2">Your Nexus API key</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-foreground">baseUrl</td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2 pr-4 font-mono text-xs">https://api.nexus.yogan.dev</td>
                <td className="py-2">API base URL</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-foreground">timeout</td>
                <td className="py-2 pr-4">number</td>
                <td className="py-2 pr-4">30000</td>
                <td className="py-2">Request timeout in ms</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Tunnel Client Options
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 text-left font-semibold">Option</th>
                <th className="py-2 pr-4 text-left font-semibold">Type</th>
                <th className="py-2 pr-4 text-left font-semibold">Default</th>
                <th className="py-2 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-foreground">apiKey</td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2 pr-4">required</td>
                <td className="py-2">Your Nexus API key</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-foreground">serverUrl</td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2 pr-4 font-mono text-xs">http://localhost:4096</td>
                <td className="py-2">Local OpenCode server URL</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-foreground">autoReconnect</td>
                <td className="py-2 pr-4">boolean</td>
                <td className="py-2 pr-4">true</td>
                <td className="py-2">Auto-reconnect on disconnect</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-foreground">reconnectDelay</td>
                <td className="py-2 pr-4">number</td>
                <td className="py-2 pr-4">3000</td>
                <td className="py-2">Reconnect delay in ms</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4 font-mono text-foreground">sessionName</td>
                <td className="py-2 pr-4">string</td>
                <td className="py-2 pr-4">hostname</td>
                <td className="py-2">Session identifier</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DocsLayout>
  );
}
