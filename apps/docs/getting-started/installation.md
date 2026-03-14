# Installation

This guide covers setting up Nexus with various AI clients. Choose your preferred client below.

<script setup>
import Tabs from '../.vitepress/theme/components/Tabs.vue'
import Tab from '../.vitepress/theme/components/Tab.vue'
import Terminal from '../.vitepress/theme/components/Terminal.vue'
import CliCommand from '../.vitepress/theme/components/CliCommand.vue'
import Callout from '../.vitepress/theme/components/Callout.vue'
</script>

## Prerequisites

- An MCP-compatible AI client (Claude Desktop, Cursor, VS Code, etc.)
- Node.js 18+ (for local mode only)

## Remote Mode (Recommended)

Connect directly to the hosted Nexus service with zero setup.

<Tabs :labels="['Claude Code', 'Claude Desktop', 'Cursor', 'VS Code']">
  <Tab :index="0">

### Claude Code

The fastest way to add Nexus:

<Terminal title="Terminal">
<span class="terminal-line prompt">claude mcp add nexus -- npx -y @anthropic-ai/mcp-remote https://mcp.nexus.yogan.dev/sse</span>
<span class="terminal-line output"><span class="text-green">Added MCP server nexus</span></span>
</Terminal>

To verify the installation:

<Terminal title="Terminal">
<span class="terminal-line prompt">claude mcp list</span>
<span class="terminal-line output">nexus    npx -y @anthropic-ai/mcp-remote https://mcp.nexus.yogan.dev/sse</span>
</Terminal>

  </Tab>
  <Tab :index="1">

### Claude Desktop

Edit your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-remote", "https://mcp.nexus.yogan.dev/sse"]
    }
  }
}
```

Restart Claude Desktop after saving the file.

  </Tab>
  <Tab :index="2">

### Cursor

Edit your Cursor MCP configuration:

**macOS/Linux:** `~/.cursor/mcp.json`

**Windows:** `%USERPROFILE%\.cursor\mcp.json`

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-remote", "https://mcp.nexus.yogan.dev/sse"]
    }
  }
}
```

Restart Cursor after saving the file.

  </Tab>
  <Tab :index="3">

### VS Code (Copilot)

Edit your VS Code settings:

1. Open Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "MCP"
3. Click "Edit in settings.json"

```json
{
  "github.copilot.chat.mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-remote", "https://mcp.nexus.yogan.dev/sse"]
    }
  }
}
```

Restart VS Code after saving.

  </Tab>
</Tabs>

## Local Mode

Run Nexus locally for offline access or development.

### Install the CLI

<Terminal title="Terminal">
<span class="terminal-line prompt">npm install -g @nexus/cli</span>
<span class="terminal-line output"><span class="text-green">+ @nexus/cli@1.0.0</span></span>
<span class="terminal-line output">added 42 packages in 3s</span>
</Terminal>

Or use npx without installing:

<CliCommand command="npx @nexus/cli serve" />

### Configure Your Client

<Tabs :labels="['Claude Code', 'Claude Desktop', 'Cursor', 'VS Code']">
  <Tab :index="0">

### Claude Code (Local)

<Terminal title="Terminal">
<span class="terminal-line prompt">claude mcp add nexus-local -- nexus serve</span>
<span class="terminal-line output"><span class="text-green">Added MCP server nexus-local</span></span>
</Terminal>

  </Tab>
  <Tab :index="1">

### Claude Desktop (Local)

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

  </Tab>
  <Tab :index="2">

### Cursor (Local)

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

  </Tab>
  <Tab :index="3">

### VS Code (Local)

```json
{
  "github.copilot.chat.mcpServers": {
    "nexus": {
      "command": "nexus",
      "args": ["serve"]
    }
  }
}
```

  </Tab>
</Tabs>

## Using the CLI Auto-Config

The Nexus CLI can automatically configure your AI clients:

<Terminal title="Terminal">
<span class="terminal-line prompt">nexus init</span>
<span class="terminal-line"></span>
<span class="terminal-line output"><span class="text-bold">Nexus Setup</span></span>
<span class="terminal-line output"></span>
<span class="terminal-line output"><span class="text-muted">Select clients to configure:</span></span>
<span class="terminal-line output"><span class="text-green">></span> [x] Claude Desktop</span>
<span class="terminal-line output">  [x] Cursor</span>
<span class="terminal-line output">  [ ] VS Code</span>
<span class="terminal-line output">  [ ] OpenCode</span>
<span class="terminal-line output"></span>
<span class="terminal-line output"><span class="text-green">Configured Claude Desktop</span></span>
<span class="terminal-line output"><span class="text-green">Configured Cursor</span></span>
</Terminal>

## Verifying Installation

After installation, verify Nexus is working by asking your AI assistant:

> "Use Nexus to search for React useEffect documentation"

The AI should use the `query-docs` tool to search the React documentation.

<Callout type="tip" title="Troubleshooting">
If Nexus isn't working, check the [Troubleshooting Guide](/troubleshooting) for common issues and solutions.
</Callout>

## Next Steps

- [Quick Start](/getting-started/quickstart) - Learn the basics of using Nexus
- [MCP Tools](/tools/overview) - Explore all available tools
- [Memory Guide](/guides/project-memory) - Set up persistent project memory
