---
layout: home

hero:
  name: "NEXUS"
  text: "The Documentation Oracle for AI"
  tagline: Persistent memory, documentation search, and MCP server discovery for AI coding assistants
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/ryanyogan/nexus
---

<script setup>
import Terminal from './.vitepress/theme/components/Terminal.vue'
import StatsGrid from './.vitepress/theme/components/StatsGrid.vue'
import StatItem from './.vitepress/theme/components/StatItem.vue'
</script>

<div class="feature-grid">
  <div class="feature-card">
    <div class="feature-card-icon">01</div>
    <div class="feature-card-title">Documentation Search</div>
    <p class="feature-card-description">Semantic search across 500+ indexed libraries. Get accurate, up-to-date code examples without hallucinations.</p>
  </div>
  <div class="feature-card">
    <div class="feature-card-icon">02</div>
    <div class="feature-card-title">Persistent Memory</div>
    <p class="feature-card-description">Your AI remembers your projects across sessions. Store decisions, conventions, and learnings.</p>
  </div>
  <div class="feature-card">
    <div class="feature-card-icon">03</div>
    <div class="feature-card-title">MCP Server Registry</div>
    <p class="feature-card-description">Discover and configure MCP servers for databases, APIs, and cloud services with copy-paste configs.</p>
  </div>
  <div class="feature-card">
    <div class="feature-card-icon">04</div>
    <div class="feature-card-title">Token Efficiency</div>
    <p class="feature-card-description">Semantic search returns only relevant chunks. Save 90%+ on context tokens compared to full docs.</p>
  </div>
</div>

## Quick Start

Add Nexus to your AI client in 30 seconds:

<Terminal title="Add to Claude Code">
<span class="terminal-line prompt">claude mcp add nexus -- npx -y @anthropic-ai/mcp-remote https://mcp.nexus.yogan.dev/sse</span>
<span class="terminal-line"></span>
<span class="terminal-line output"><span class="text-cyan">Added MCP server nexus</span></span>
</Terminal>

Or add directly to your MCP config file:

```json
{
  "mcpServers": {
    "nexus": {
      "url": "https://mcp.nexus.yogan.dev/sse"
    }
  }
}
```

::: tip Ready to dive in?
Head to the [Installation Guide](/getting-started/installation) for detailed setup instructions, or jump straight to the [Quick Start](/getting-started/quickstart) to set up your editors automatically.
:::

---

## Token Savings

Context is expensive. Nexus uses semantic search to return only the relevant chunks instead of entire documentation pages.

<StatsGrid>
  <StatItem value="90%" label="Token savings" />
  <StatItem value="~50ms" label="Avg latency" />
  <StatItem value="500+" label="Libraries" />
  <StatItem value="100k+" label="Snippets" />
</StatsGrid>

| Without Nexus | With Nexus |
|--------------|------------|
| Re-explain project structure every session | Load context in one tool call |
| Paste documentation into chat | AI queries docs directly |
| Search for MCP server setup guides | Get instant installation configs |

---

## How It Works

```
                              MCP Protocol
     ┌─────────────────┐          │          ┌─────────────────┐
     │   AI Client     │◄─────────┼─────────►│     Nexus       │
     │ (Claude, etc.)  │          │          │   MCP Server    │
     └─────────────────┘          │          └────────┬────────┘
                                  │                   │
                      ┌───────────┴───────────────────┼───────────┐
                      │                               │           │
                 ┌────▼────┐                   ┌──────▼─────┐ ┌───▼────┐
                 │  Docs   │                   │   Memory   │ │Registry│
                 │ Search  │                   │   Store    │ │   DB   │
                 └─────────┘                   └────────────┘ └────────┘
```

<Terminal title="Example: Querying Documentation">
<span class="terminal-line"><span class="text-muted"># Your AI needs to know about React hooks</span></span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-bold">AI:</span> Let me search the React documentation...</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-muted">Calling</span> <span class="text-cyan">query-docs</span></span>
<span class="terminal-line"><span class="text-muted">  libraryId:</span> react</span>
<span class="terminal-line"><span class="text-muted">  query:</span> "useEffect cleanup function best practices"</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-cyan text-bold">Nexus:</span> Found 5 relevant results</span>
<span class="terminal-line"></span>
<span class="terminal-line"><span class="text-muted">1.</span> <span class="text-bold">Cleaning up Effects</span></span>
<span class="terminal-line">   Return a cleanup function to avoid memory leaks...</span>
</Terminal>

---

## Features at a Glance

### Documentation Tools

| Tool | Description |
|------|-------------|
| `resolve-library` | Find library IDs for documentation queries |
| `query-docs` | Search indexed documentation with semantic search |
| `get-library-info` | Get detailed library metadata and stats |
| `list-libraries` | Browse all indexed documentation |

### Memory Tools

| Tool | Description |
|------|-------------|
| `save-memory` | Store project context, decisions, and learnings |
| `recall-memories` | Retrieve relevant memories using natural language |
| `get-project-context` | Load all context for a specific project |
| `list-memories` | Browse and manage stored memories |

### Server Registry Tools

| Tool | Description |
|------|-------------|
| `discover-servers` | Find MCP servers by capability or category |
| `get-server-info` | Get detailed server documentation |
| `get-server-config` | Generate ready-to-use MCP configurations |
