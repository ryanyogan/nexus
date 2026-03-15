# Introduction

**Nexus is the missing brain in your AI workflow.**

Every time you start a new AI session, you lose context. You re-explain your project structure, remind the AI about your conventions, and watch your token budget evaporate on information you've provided a dozen times before.

Nexus fixes this. It gives your AI assistant persistent memory, instant access to up-to-date documentation, and a curated registry of MCP servers—all through a single MCP connection.

<script setup>
import Tabs from '../.vitepress/theme/components/Tabs.vue'
import Tab from '../.vitepress/theme/components/Tab.vue'
import Terminal from '../.vitepress/theme/components/Terminal.vue'
import CliCommand from '../.vitepress/theme/components/CliCommand.vue'
import Callout from '../.vitepress/theme/components/Callout.vue'
import FeatureGrid from '../.vitepress/theme/components/FeatureGrid.vue'
import FeatureCard from '../.vitepress/theme/components/FeatureCard.vue'
import StatsGrid from '../.vitepress/theme/components/StatsGrid.vue'
import StatItem from '../.vitepress/theme/components/StatItem.vue'
</script>

## Why Nexus?

<FeatureGrid>
  <FeatureCard
    icon="&#x1F50D;"
    title="Documentation Search"
    description="Semantic search across 500+ indexed libraries. Get accurate, up-to-date code examples without hallucinations."
  />
  <FeatureCard
    icon="&#x1F9E0;"
    title="Persistent Memory"
    description="Your AI remembers your projects across sessions. Store decisions, conventions, and learnings."
  />
  <FeatureCard
    icon="&#x1F6E0;"
    title="MCP Server Registry"
    description="Discover and configure MCP servers for databases, APIs, and cloud services."
  />
  <FeatureCard
    icon="&#x26A1;"
    title="Token Efficiency"
    description="Semantic search returns only relevant chunks. Save 90%+ on context tokens."
  />
</FeatureGrid>

## Quick Install

Choose your deployment mode:

<Tabs :labels="['Remote (Recommended)', 'Local']">
  <Tab :index="0">

### Remote Mode

Connect directly to the hosted Nexus service. Zero setup required.

<Terminal title="Claude Code">
<span class="terminal-line prompt">claude mcp add nexus -- npx -y @anthropic-ai/mcp-remote https://api.nexus.yogan.dev/sse</span>
<span class="terminal-line"></span>
<span class="terminal-line output"><span class="text-green">Added MCP server nexus</span></span>
</Terminal>

Or add to your MCP configuration file:

```json
{
  "mcpServers": {
    "nexus": {
      "url": "https://api.nexus.yogan.dev/sse"
    }
  }
}
```

<Callout type="tip" title="Recommended">
Remote mode is recommended for most users. The hosted service provides instant access with no setup, automatic updates, and handles all infrastructure.
</Callout>

  </Tab>
  <Tab :index="1">

### Local Mode

Run Nexus locally for offline access or development.

<Terminal title="Terminal">
<span class="terminal-line prompt">npm install -g @nexus/cli</span>
<span class="terminal-line"></span>
<span class="terminal-line prompt">nexus serve</span>
<span class="terminal-line output">Starting Nexus MCP server on stdio...</span>
<span class="terminal-line output"><span class="text-green">Server ready</span></span>
</Terminal>

Then add to your MCP configuration:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "nexus",
      "args": ["serve"]
    }
  }
}
```

<Callout type="info" title="Local Development">
Local mode is useful for offline development, custom configurations, or contributing to Nexus.
</Callout>

  </Tab>
</Tabs>

## Architecture

Nexus is a Model Context Protocol (MCP) server that provides your AI assistant with three core capabilities:

```
                          ┌──────────────────────────────────────────┐
                          │              Your AI Client              │
                          │     (Claude Code, Cursor, VS Code)       │
                          └─────────────────────┬────────────────────┘
                                                │
                                                │ MCP Protocol
                                                │
                          ┌─────────────────────▼────────────────────┐
                          │              Nexus Server                │
                          │                                          │
                          │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
                          │  │   Docs   │ │  Memory  │ │ Registry │  │
                          │  │  Tools   │ │  Tools   │ │  Tools   │  │
                          │  └────┬─────┘ └────┬─────┘ └────┬─────┘  │
                          │       │            │            │        │
                          └───────┼────────────┼────────────┼────────┘
                                  │            │            │
              ┌───────────────────▼────┐       │    ┌───────▼───────────────┐
              │     Documentation      │       │    │    Server Registry    │
              │        Database        │       │    │       Database        │
              │                        │       │    │                       │
              │ - 500+ libraries       │       │    │ - Official MCP servers│
              │ - Semantic embeddings  │       │    │ - Community servers   │
              │ - Code examples        │       │    │ - Install configs     │
              └────────────────────────┘       │    └───────────────────────┘
                                               │
                              ┌────────────────▼────────────────┐
                              │        Memory Store             │
                              │                                 │
                              │ - Project context               │
                              │ - Session summaries             │
                              │ - Architectural decisions       │
                              │ - Lessons learned               │
                              └─────────────────────────────────┘
```

## Token Savings

Context is expensive. Nexus uses semantic search to return only the relevant chunks instead of entire documentation pages.

<StatsGrid>
  <StatItem value="90%" label="Token savings" />
  <StatItem value="~50ms" label="Avg latency" />
  <StatItem value="500+" label="Libraries" />
  <StatItem value="100k+" label="Snippets" />
</StatsGrid>

### Before vs After

| Without Nexus | With Nexus |
|---------------|------------|
| Re-explain project structure every session | Load context in one tool call |
| Paste documentation into chat | AI queries docs directly |
| Search for MCP server setup guides | Get instant installation configs |
| Lose context between conversations | Persistent memory across sessions |

## Available Tools

### Documentation Tools

| Tool | Description |
|------|-------------|
| [`resolve-library`](/tools/docs/resolve-library) | Find library IDs for documentation queries |
| [`query-docs`](/tools/docs/query-docs) | Search indexed documentation with semantic search |
| [`get-library-info`](/tools/docs/get-library-info) | Get detailed library metadata and stats |
| [`list-libraries`](/tools/docs/list-libraries) | Browse all indexed documentation |

### Memory Tools

| Tool | Description |
|------|-------------|
| [`save-memory`](/tools/memory/save-memory) | Store project context, decisions, and learnings |
| [`recall-memories`](/tools/memory/recall-memories) | Retrieve relevant memories using natural language |
| [`get-project-context`](/tools/memory/get-project-context) | Load all context for a specific project |
| [`list-memories`](/tools/memory/list-memories) | Browse and manage stored memories |
| [`update-memory`](/tools/memory/update-memory) | Update an existing memory |
| [`delete-memory`](/tools/memory/delete-memory) | Delete a memory permanently |

### Server Registry Tools

| Tool | Description |
|------|-------------|
| [`discover-servers`](/tools/servers/discover-servers) | Find MCP servers by capability or category |
| [`get-server-info`](/tools/servers/get-server-info) | Get detailed server documentation |
| [`get-server-config`](/tools/servers/get-server-config) | Generate ready-to-use MCP configurations |

## Next Steps

<FeatureGrid>
  <FeatureCard
    icon="&#x1F4E6;"
    title="Installation"
    description="Detailed setup for Claude Desktop, Cursor, VS Code, and other clients."
    link="/getting-started/installation"
  />
  <FeatureCard
    icon="&#x1F680;"
    title="Quick Start"
    description="Get up and running with Nexus in 5 minutes."
    link="/getting-started/quickstart"
  />
  <FeatureCard
    icon="&#x1F6E0;"
    title="MCP Tools"
    description="Explore all available tools for documentation, memory, and server discovery."
    link="/tools/overview"
  />
  <FeatureCard
    icon="&#x1F4DA;"
    title="Guides"
    description="Learn advanced workflows for token savings, project memory, and more."
    link="/guides/ai-clients"
  />
</FeatureGrid>
