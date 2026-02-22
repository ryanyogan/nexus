import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { CodeBlock } from "../../components/docs/CodeBlock";
import { Callout } from "../../components/docs/Callout";

export const Route = createFileRoute("/docs/getting-started")({
  component: GettingStarted,
});

function GettingStarted() {
  const toc = [
    { id: "installation", title: "Installation", level: 2 },
    { id: "claude-desktop", title: "Claude Desktop", level: 3 },
    { id: "cursor", title: "Cursor", level: 3 },
    { id: "other-clients", title: "Other Clients", level: 3 },
    { id: "first-query", title: "Your First Query", level: 2 },
    { id: "workflow", title: "Typical Workflow", level: 2 },
    { id: "using-memory", title: "Using Memory", level: 2 },
    { id: "save-project-context", title: "Save Project Context", level: 3 },
    { id: "session-summaries", title: "Session Summaries", level: 3 },
    { id: "recall-context", title: "Recall Context", level: 3 },
    { id: "tips", title: "Tips for Better Results", level: 2 },
  ];

  return (
    <DocsLayout
      title="Getting Started"
      description="Set up Nexus with your AI coding assistant in minutes"
      toc={toc}
    >
      {/* Installation */}
      <section className="mb-12">
        <h2 id="installation" className="mb-4 text-xl font-semibold text-foreground">
          Installation
        </h2>

        <p className="mb-6 text-muted-foreground">
          Nexus works with any AI coding assistant that supports the Model Context
          Protocol (MCP). Below are setup instructions for popular clients.
        </p>

        {/* Claude Desktop */}
        <h3 id="claude-desktop" className="mb-3 text-lg font-semibold text-foreground">
          Claude Desktop
        </h3>

        <p className="mb-4 text-muted-foreground">
          Add Nexus to your Claude Desktop configuration file:
        </p>

        <div className="mb-4 space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>macOS:</strong>{" "}
            <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">
              ~/Library/Application Support/Claude/claude_desktop_config.json
            </code>
          </p>
          <p>
            <strong>Windows:</strong>{" "}
            <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">
              %APPDATA%\Claude\claude_desktop_config.json
            </code>
          </p>
        </div>

        <CodeBlock language="json" filename="claude_desktop_config.json">
{`{
  "mcpServers": {
    "nexus": {
      "url": "https://api.nexus.yogan.dev/mcp"
    }
  }
}`}
        </CodeBlock>

        <Callout type="info">
          After saving the config, restart Claude Desktop for the changes to take effect.
        </Callout>

        {/* Cursor */}
        <h3 id="cursor" className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Cursor
        </h3>

        <p className="mb-4 text-muted-foreground">
          Add Nexus to your Cursor MCP configuration:
        </p>

        <CodeBlock language="json" filename=".cursor/mcp.json">
{`{
  "mcpServers": {
    "nexus": {
      "url": "https://api.nexus.yogan.dev/mcp"
    }
  }
}`}
        </CodeBlock>

        {/* Other Clients */}
        <h3 id="other-clients" className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Other MCP Clients
        </h3>

        <p className="mb-4 text-muted-foreground">
          For other MCP-compatible clients (Windsurf, Continue, etc.), add the Nexus
          server URL to your MCP configuration:
        </p>

        <CodeBlock language="text">
{`Server URL: https://api.nexus.yogan.dev/mcp
Protocol: MCP over HTTP`}
        </CodeBlock>
      </section>

      {/* First Query */}
      <section className="mb-12">
        <h2 id="first-query" className="mb-4 text-xl font-semibold text-foreground">
          Your First Query
        </h2>

        <p className="mb-4 text-muted-foreground">
          Once configured, you can ask your AI assistant to use Nexus for documentation
          queries. Here's an example conversation:
        </p>

        <div className="space-y-4 rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-sm font-medium text-muted-foreground">You:</p>
            <p className="text-foreground">
              How do I create a route handler in Hono?
            </p>
          </div>

          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-sm font-medium text-primary">Assistant:</p>
            <p className="text-muted-foreground text-sm italic mb-2">
              (Uses resolve-library to find "hono", then query-docs to search)
            </p>
            <p className="text-foreground">
              In Hono, you can create route handlers using the HTTP method functions.
              Here's an example:
            </p>
            <CodeBlock language="typescript">
{`import { Hono } from 'hono'

const app = new Hono()

app.get('/hello', (c) => {
  return c.text('Hello Hono!')
})

app.post('/users', async (c) => {
  const body = await c.req.json()
  return c.json({ user: body })
})`}
            </CodeBlock>
          </div>
        </div>
      </section>

      {/* Typical Workflow */}
      <section className="mb-12">
        <h2 id="workflow" className="mb-4 text-xl font-semibold text-foreground">
          Typical Workflow
        </h2>

        <p className="mb-4 text-muted-foreground">
          The AI assistant typically follows this workflow when using Nexus:
        </p>

        <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
          <li>
            <strong className="text-foreground">Resolve Library</strong> - Find the
            library ID by name using <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">resolve-library</code>
          </li>
          <li>
            <strong className="text-foreground">Query Documentation</strong> - Search
            the library's docs using <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">query-docs</code>
          </li>
          <li>
            <strong className="text-foreground">Provide Answer</strong> - Use the
            retrieved documentation to give an accurate, up-to-date answer
          </li>
        </ol>

        <Callout type="tip" title="Automatic Tool Selection">
          Most AI assistants will automatically determine when to use Nexus tools
          based on your question. You don't need to explicitly ask for documentation
          lookups.
        </Callout>
      </section>

      {/* Using Memory */}
      <section className="mb-12">
        <h2 id="using-memory" className="mb-4 text-xl font-semibold text-foreground">
          Using Memory
        </h2>

        <p className="mb-6 text-muted-foreground">
          Nexus's memory system lets your AI assistant remember context across sessions.
          No more re-explaining your project every time you start a new conversation.
        </p>

        {/* Save Project Context */}
        <h3 id="save-project-context" className="mb-3 text-lg font-semibold text-foreground">
          Save Project Context
        </h3>

        <p className="mb-4 text-muted-foreground">
          At the start of a project (or when your architecture changes), ask your AI 
          assistant to save the project context:
        </p>

        <div className="space-y-4 rounded-lg border border-border/50 bg-card/50 p-4 mb-4">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-sm font-medium text-muted-foreground">You:</p>
            <p className="text-foreground">
              Save this project context to Nexus: This is a pnpm monorepo with TanStack Start 
              for the web app and Hono for the API. We use Cloudflare Workers for deployment, 
              D1 for the database, R2 for storage, and Vectorize for embeddings. Auth is 
              handled by Better Auth in the web app.
            </p>
          </div>

          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-sm font-medium text-primary">Assistant:</p>
            <p className="text-muted-foreground text-sm italic mb-2">
              (Uses save-memory with type "project_context")
            </p>
            <p className="text-foreground">
              I've saved the project context. In future sessions, I can recall this 
              information automatically when you're working on this project.
            </p>
          </div>
        </div>

        <Callout type="info" title="Memory Types">
          Use <code className="text-xs">project_context</code> for architecture and tech stack,{" "}
          <code className="text-xs">decision</code> for architectural decisions,{" "}
          <code className="text-xs">correction</code> for lessons learned, and{" "}
          <code className="text-xs">session_summary</code> for end-of-session notes.
        </Callout>

        {/* Session Summaries */}
        <h3 id="session-summaries" className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Session Summaries
        </h3>

        <p className="mb-4 text-muted-foreground">
          At the end of a coding session, save a summary of what was accomplished:
        </p>

        <div className="space-y-4 rounded-lg border border-border/50 bg-card/50 p-4 mb-4">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-sm font-medium text-muted-foreground">You:</p>
            <p className="text-foreground">
              Save a session summary: Today we implemented the memory system for Nexus. 
              Added 6 new MCP tools (save-memory, recall-memories, get-project-context, 
              list-memories, update-memory, delete-memory), created the D1 schema, set up 
              Vectorize index, and integrated with the existing MCP server.
            </p>
          </div>

          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-sm font-medium text-primary">Assistant:</p>
            <p className="text-muted-foreground text-sm italic mb-2">
              (Uses save-memory with type "session_summary")
            </p>
            <p className="text-foreground">
              Session summary saved. Next time we work on this project, I'll be able to 
              recall what we accomplished today.
            </p>
          </div>
        </div>

        {/* Recall Context */}
        <h3 id="recall-context" className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Recall Context
        </h3>

        <p className="mb-4 text-muted-foreground">
          When starting a new session, your AI assistant can automatically recall 
          relevant context:
        </p>

        <div className="space-y-4 rounded-lg border border-border/50 bg-card/50 p-4 mb-4">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="text-sm font-medium text-muted-foreground">You:</p>
            <p className="text-foreground">
              Let's continue working on Nexus.
            </p>
          </div>

          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-sm font-medium text-primary">Assistant:</p>
            <p className="text-muted-foreground text-sm italic mb-2">
              (Uses get-project-context or recall-memories)
            </p>
            <p className="text-foreground">
              I recall that Nexus is a pnpm monorepo with TanStack Start and Hono on 
              Cloudflare Workers. In our last session, we implemented the memory system 
              with 6 new MCP tools. What would you like to work on today?
            </p>
          </div>
        </div>

        <Callout type="tip" title="Automatic Context Retrieval">
          You can ask your AI assistant to automatically retrieve project context at the 
          start of each session. Many assistants will do this proactively when you mention 
          continuing work on a known project.
        </Callout>
      </section>

      {/* Tips */}
      <section className="mb-12">
        <h2 id="tips" className="mb-4 text-xl font-semibold text-foreground">
          Tips for Better Results
        </h2>

        <div className="space-y-4">
          <TipCard
            title="Be Specific"
            description="Instead of 'how do I use React hooks', ask 'how do I use useEffect cleanup functions in React'."
          />
          <TipCard
            title="Mention the Library"
            description="Include the library name in your question for faster resolution: 'How do I create middleware in Hono?'"
          />
          <TipCard
            title="Ask for Examples"
            description="Nexus indexes code examples, so asking 'show me an example of...' often yields helpful snippets."
          />
          <TipCard
            title="Save Important Decisions"
            description="When you make architectural decisions, ask your AI to save them. This prevents re-debating the same issues."
          />
          <TipCard
            title="Use Project Names Consistently"
            description="When saving memories, use consistent project names so related memories can be recalled together."
          />
          <TipCard
            title="Check Available Libraries"
            description="Use the Explore page to see which libraries are indexed. Not all libraries may be available."
          />
        </div>
      </section>

      {/* Next steps */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Next Steps
        </h2>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>
            Learn about all{" "}
            <a href="/docs/mcp-tools" className="text-primary hover:underline">
              MCP tools
            </a>{" "}
            available
          </li>
          <li>
            Explore the{" "}
            <a href="/docs/api" className="text-primary hover:underline">
              REST API
            </a>{" "}
            for programmatic access
          </li>
          <li>
            <a href="/docs/submit" className="text-primary hover:underline">
              Submit a library
            </a>{" "}
            for indexing
          </li>
          <li>
            <a href="/explore" className="text-primary hover:underline">
              Browse indexed libraries
            </a>{" "}
            to see what's available
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}

function TipCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
