# Quick Start

Get productive with Nexus in 5 minutes. This guide covers the essential workflows.

<script setup>
import Terminal from '../.vitepress/theme/components/Terminal.vue'
import Callout from '../.vitepress/theme/components/Callout.vue'
import FeatureGrid from '../.vitepress/theme/components/FeatureGrid.vue'
import FeatureCard from '../.vitepress/theme/components/FeatureCard.vue'
</script>

## Prerequisites

Before starting, make sure you've completed the [Installation](/getting-started/installation) guide:

1. **Get your API key** via CLI login or dashboard
2. **Configure your AI client** with your API key

<Callout type="tip" title="Quick Setup">
Run `npx @nexus/cli auth login` to authenticate, then `npx @nexus/cli init` to configure your AI client automatically.
</Callout>

## 1. Search Documentation

Ask your AI to search library documentation:

<Terminal title="Chat with AI">
<span class="terminal-line"><span class="text-blue text-bold">You:</span> Search the Next.js docs for how to use server actions</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-muted">→ Calling</span> <span class="text-green">query-docs</span></span>
<span class="terminal-line"><span class="text-muted">  libraryId:</span> nextjs</span>
<span class="terminal-line"><span class="text-muted">  query:</span> "server actions usage"</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-teal text-bold">AI:</span> Based on the Next.js documentation, here's how to use server actions:</span>
<span class="terminal-line"></span>
<span class="terminal-line">Server Actions are asynchronous functions executed on the server...</span>
</Terminal>

### Finding Library IDs

If you're not sure of the library ID, use `resolve-library`:

<Terminal title="Chat with AI">
<span class="terminal-line"><span class="text-blue text-bold">You:</span> Find the library ID for Prisma documentation</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-muted">→ Calling</span> <span class="text-green">resolve-library</span></span>
<span class="terminal-line"><span class="text-muted">  libraryName:</span> prisma</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-teal text-bold">AI:</span> Found: <span class="text-yellow">prisma</span></span>
<span class="terminal-line">Description: Next-generation ORM for Node.js and TypeScript</span>
<span class="terminal-line">Snippets: 1,234</span>
</Terminal>

## 2. Save Project Context

Store information about your project so the AI remembers it:

<Terminal title="Chat with AI">
<span class="terminal-line"><span class="text-blue text-bold">You:</span> Save this project context: This is a Next.js 14 app using</span>
<span class="terminal-line">      Prisma for the database, Tailwind for styling, and tRPC</span>
<span class="terminal-line">      for the API layer. We follow the App Router conventions.</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-muted">→ Calling</span> <span class="text-green">save-memory</span></span>
<span class="terminal-line"><span class="text-muted">  title:</span> "Project Tech Stack"</span>
<span class="terminal-line"><span class="text-muted">  type:</span> project_context</span>
<span class="terminal-line"><span class="text-muted">  project:</span> my-app</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-teal text-bold">AI:</span> <span class="text-green">Saved memory:</span> Project Tech Stack</span>
</Terminal>

### Memory Types

| Type | Use For |
|------|---------|
| `project_context` | Tech stack, architecture, conventions |
| `session_summary` | What was accomplished in a session |
| `decision` | Architectural decisions with rationale |
| `correction` | Lessons learned, things to avoid |

## 3. Recall Context

In a new session, load your project context:

<Terminal title="Chat with AI (New Session)">
<span class="terminal-line"><span class="text-blue text-bold">You:</span> Load the context for my-app project</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-muted">→ Calling</span> <span class="text-green">get-project-context</span></span>
<span class="terminal-line"><span class="text-muted">  project:</span> my-app</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-teal text-bold">AI:</span> Here's the context for my-app:</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-yellow">Project Context:</span></span>
<span class="terminal-line">- Next.js 14 with App Router</span>
<span class="terminal-line">- Prisma ORM</span>
<span class="terminal-line">- Tailwind CSS</span>
<span class="terminal-line">- tRPC API layer</span>
</Terminal>

## 4. Find MCP Servers

Discover MCP servers for additional capabilities:

<Terminal title="Chat with AI">
<span class="terminal-line"><span class="text-blue text-bold">You:</span> Find MCP servers for working with PostgreSQL</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-muted">→ Calling</span> <span class="text-green">discover-servers</span></span>
<span class="terminal-line"><span class="text-muted">  query:</span> "postgresql database"</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-teal text-bold">AI:</span> Found 3 MCP servers:</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-yellow">1. postgres</span> (Official)</span>
<span class="terminal-line">   Query and manage PostgreSQL databases</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-yellow">2. supabase</span></span>
<span class="terminal-line">   Supabase database and auth integration</span>
</Terminal>

### Get Installation Config

<Terminal title="Chat with AI">
<span class="terminal-line"><span class="text-blue text-bold">You:</span> Get the installation config for the postgres MCP server</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-muted">→ Calling</span> <span class="text-green">get-server-config</span></span>
<span class="terminal-line"><span class="text-muted">  serverId:</span> postgres</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-teal text-bold">AI:</span> Here's the config for Claude Desktop:</span>
</Terminal>

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_URL": "postgresql://user:pass@localhost:5432/db"
      }
    }
  }
}
```

## Common Workflows

<FeatureGrid>
  <FeatureCard
    icon="&#x1F4D6;"
    title="Learning a New Library"
    description="Use query-docs to search official documentation without hallucinations."
  />
  <FeatureCard
    icon="&#x1F504;"
    title="Continuing Work"
    description="Use get-project-context to load all saved context at the start of each session."
  />
  <FeatureCard
    icon="&#x1F4DD;"
    title="Recording Decisions"
    description="Use save-memory with type 'decision' to document architectural choices."
  />
  <FeatureCard
    icon="&#x1F50C;"
    title="Adding Integrations"
    description="Use discover-servers to find MCP servers for databases, APIs, and tools."
  />
</FeatureGrid>

## Tips for Best Results

<Callout type="tip" title="Be Specific">
When searching documentation, be specific about what you're looking for. "React useEffect cleanup" works better than just "useEffect".
</Callout>

<Callout type="tip" title="Use Project Names">
Always include a project name when saving memories. This keeps memories organized and makes retrieval more accurate.
</Callout>

<Callout type="tip" title="Save Often">
Save important context, decisions, and learnings as you work. Your future self (and AI) will thank you.
</Callout>

## Troubleshooting

<Callout type="warning" title="Authentication Error?">
If you see "API key required" or "Authentication required", make sure you've:
1. Run `npx @nexus/cli auth login` to get your API key
2. Added `NEXUS_API_KEY` to your client config (or used CLI login)

See the [Authentication Guide](/api/authentication) for detailed setup instructions.
</Callout>

## Next Steps

- [MCP Tools Reference](/tools/overview) - Detailed documentation for all tools
- [Memory Guide](/guides/project-memory) - Advanced memory management
- [AI Client Setup](/guides/ai-clients) - Platform-specific tips
