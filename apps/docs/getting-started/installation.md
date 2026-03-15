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
- Node.js 18+ (for CLI mode)

## Step 1: Get Your API Key

Nexus requires an API key for all tool calls. Choose one of these methods:

### Option A: CLI Login (Recommended)

The easiest way - opens your browser for GitHub authentication:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth login</span>
<span class="terminal-line output"></span>
<span class="terminal-line output"><span class="text-muted">Opening browser for authentication...</span></span>
<span class="terminal-line output"><span class="text-green">Authenticated successfully!</span></span>
<span class="terminal-line output">API key saved to ~/.nexus/config.json</span>
</Terminal>

Your API key is automatically stored and used by the CLI.

### Option B: Dashboard

1. Sign in at [nexus.yogan.dev](https://nexus.yogan.dev)
2. Go to [Dashboard → API Keys](https://nexus.yogan.dev/dashboard/keys)
3. Click **Create API Key**
4. Copy your key (starts with `nxs_`)

<Callout type="warning" title="Save Your Key">
API keys are only shown once. Store it securely - you'll need it for Step 2!
</Callout>

## Step 2: Configure Your AI Client

<Tabs :labels="['Claude Code', 'Claude Desktop', 'Cursor', 'VS Code', 'Other Clients']">
  <Tab :index="0">

### Claude Code

The fastest way to add Nexus:

<Terminal title="Terminal">
<span class="terminal-line prompt">claude mcp add nexus -- npx -y @nexus/cli serve</span>
<span class="terminal-line output"><span class="text-green">Added MCP server nexus</span></span>
</Terminal>

If you used CLI login, you're done! The CLI automatically uses your stored API key.

**Manual API key setup:**

<Terminal title="Terminal">
<span class="terminal-line prompt">claude mcp add nexus -e NEXUS_API_KEY=nxs_your_key_here -- npx -y @nexus/cli serve</span>
</Terminal>

To verify the installation:

<Terminal title="Terminal">
<span class="terminal-line prompt">claude mcp list</span>
<span class="terminal-line output">nexus    npx -y @nexus/cli serve</span>
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
      "args": ["-y", "@nexus/cli", "serve"],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

<Callout type="tip" title="Skip the env if you used CLI login">
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can omit the `env` section.
</Callout>

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
      "args": ["-y", "@nexus/cli", "serve"],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

<Callout type="tip" title="Skip the env if you used CLI login">
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can omit the `env` section.
</Callout>

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
      "args": ["-y", "@nexus/cli", "serve"],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

Restart VS Code after saving.

  </Tab>
  <Tab :index="4">

### Other MCP Clients

Most MCP clients (Cline, Continue, Codex, goose, etc.) follow a similar pattern:

| Setting | Value |
|---------|-------|
| Command | `npx` |
| Args | `["-y", "@nexus/cli", "serve"]` |
| Environment | `NEXUS_API_KEY=nxs_your_key` |

Example for Cline (`~/.cline/mcp.json`):

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@nexus/cli", "serve"],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

### HTTP Transport (Advanced)

For clients supporting HTTP/SSE transport:

```
URL: https://api.nexus.yogan.dev/mcp
Headers:
  Authorization: Bearer nxs_your_api_key_here
```

  </Tab>
</Tabs>

## Using the CLI Auto-Config

The Nexus CLI can automatically configure your AI clients:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli init</span>
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

<Callout type="warning" title="Authentication Error?">
If you see an error like "API key required", make sure you've completed Step 1 and configured your API key in Step 2.
</Callout>

<Callout type="tip" title="Troubleshooting">
If Nexus isn't working, check the [Troubleshooting Guide](/troubleshooting) for common issues and solutions.
</Callout>

## Next Steps

- [Quick Start](/getting-started/quickstart) - Learn the basics of using Nexus
- [Authentication Guide](/api/authentication) - Learn more about API keys and scopes
- [MCP Tools](/tools/overview) - Explore all available tools
- [Memory Guide](/guides/project-memory) - Set up persistent project memory
