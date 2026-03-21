# Installation

This guide covers setting up Nexus with various AI clients. Choose your preferred method below.

<script setup>
import Tabs from '../.vitepress/theme/components/Tabs.vue'
import Tab from '../.vitepress/theme/components/Tab.vue'
import Terminal from '../.vitepress/theme/components/Terminal.vue'
import CliCommand from '../.vitepress/theme/components/CliCommand.vue'
import Callout from '../.vitepress/theme/components/Callout.vue'
</script>

## Prerequisites

- An MCP-compatible AI client (Claude Desktop, Cursor, VS Code, etc.)
- Node.js 18+ (for npx, only needed for local mode)

## Step 1: Get Your API Key

Nexus requires an API key for all tool calls. Choose one of these methods:

### Option A: CLI Login (Recommended)

The easiest way - opens your browser for GitHub/Google authentication:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth login</span>
<span class="terminal-line output"></span>
<span class="terminal-line output"><span class="text-muted">Opening browser for authentication...</span></span>
<span class="terminal-line output"><span class="text-green">Authenticated successfully!</span></span>
<span class="terminal-line output">API key saved to ~/.nexus/config.json</span>
</Terminal>

View your API key anytime:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth status</span>
<span class="terminal-line output">API Key: nxs_abc123...</span>
</Terminal>

### Option B: Dashboard

1. Sign in at [nexus.yogan.dev](https://nexus.yogan.dev)
2. Go to [Dashboard → API Keys](https://nexus.yogan.dev/dashboard/keys)
3. Click **Create API Key**
4. Copy your key (starts with `nxs_`)

<Callout type="warning" title="Save Your Key">
API keys are only shown once. Store it securely - you'll need it for Step 2!
</Callout>

## Step 2: Configure Your AI Client

<Tabs :labels="['OpenCode', 'Claude Code', 'Claude Desktop', 'Cursor', 'VS Code', 'Other Clients']">
  <Tab :index="0">

### OpenCode (Native Remote)

OpenCode supports native remote MCP - the simplest config:

Edit `~/.config/opencode/config.json`:

```json
{
  "mcp": {
    "nexus": {
      "type": "remote",
      "url": "https://api.nexus.yogan.dev/sse",
      "enabled": true,
      "headers": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

That's it! No dependencies, no bridge packages.

  </Tab>
  <Tab :index="1">

### Claude Code

**Remote Mode (Recommended):**

<Terminal title="Terminal">
<span class="terminal-line prompt">claude mcp add nexus -e NEXUS_API_KEY=nxs_your_key_here -- npx -y mcp-remote https://api.nexus.yogan.dev/sse --header "NEXUS_API_KEY:\${NEXUS_API_KEY}"</span>
<span class="terminal-line output"><span class="text-green">Added MCP server nexus</span></span>
</Terminal>

**Local Mode (uses stored CLI credentials):**

<Terminal title="Terminal">
<span class="terminal-line prompt">claude mcp add nexus -- npx -y @nexus/cli serve</span>
<span class="terminal-line output"><span class="text-green">Added MCP server nexus</span></span>
</Terminal>

If you used `npx @nexus/cli auth login`, the CLI automatically uses your stored API key.

To verify:

<Terminal title="Terminal">
<span class="terminal-line prompt">claude mcp list</span>
<span class="terminal-line output">nexus    npx -y mcp-remote https://api.nexus.yogan.dev/sse ...</span>
</Terminal>

  </Tab>
  <Tab :index="2">

### Claude Desktop

Edit your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Linux:** `~/.config/Claude/claude_desktop_config.json`

**Remote Mode (Recommended):**

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.nexus.yogan.dev/sse",
        "--header",
        "NEXUS_API_KEY:${NEXUS_API_KEY}"
      ],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

**Local Mode:**

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

<Callout type="tip" title="Local mode with CLI login">
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can omit the `env` section in local mode.
</Callout>

Restart Claude Desktop after saving the file.

  </Tab>
  <Tab :index="3">

### Cursor

Edit your Cursor MCP configuration:

**macOS/Linux:** `~/.cursor/mcp.json`

**Windows:** `%USERPROFILE%\.cursor\mcp.json`

**Remote Mode (Recommended):**

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.nexus.yogan.dev/sse",
        "--header",
        "NEXUS_API_KEY:${NEXUS_API_KEY}"
      ],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

**Local Mode:**

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

Restart Cursor after saving the file.

  </Tab>
  <Tab :index="4">

### VS Code (Copilot)

Edit your VS Code settings:

1. Open Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "MCP"
3. Click "Edit in settings.json"

**Remote Mode (Recommended):**

```json
{
  "github.copilot.chat.mcpServers": {
    "nexus": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.nexus.yogan.dev/sse",
        "--header",
        "NEXUS_API_KEY:${NEXUS_API_KEY}"
      ],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

**Local Mode:**

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
  <Tab :index="5">

### Other MCP Clients

**If your client supports native remote mode** (like OpenCode), use:

| Setting | Value                                 |
| ------- | ------------------------------------- |
| Type    | `remote`                              |
| URL     | `https://api.nexus.yogan.dev/sse`     |
| Headers | `{ "NEXUS_API_KEY": "nxs_your_key" }` |

**Otherwise, use mcp-remote:**

| Setting     | Value                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| Command     | `npx`                                                                                                   |
| Args        | `["-y", "mcp-remote", "https://api.nexus.yogan.dev/sse", "--header", "NEXUS_API_KEY:${NEXUS_API_KEY}"]` |
| Environment | `NEXUS_API_KEY=nxs_your_key`                                                                            |

Example for Cline (`~/.cline/mcp.json`):

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.nexus.yogan.dev/sse",
        "--header",
        "NEXUS_API_KEY:${NEXUS_API_KEY}"
      ],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

**Local Mode:**

| Setting     | Value                                           |
| ----------- | ----------------------------------------------- |
| Command     | `npx`                                           |
| Args        | `["-y", "@nexus/cli", "serve"]`                 |
| Environment | `NEXUS_API_KEY=nxs_your_key` (or use CLI login) |

  </Tab>
</Tabs>

## Remote vs Local Mode

| Feature            | Native Remote  | mcp-remote      | Local Mode     |
| ------------------ | -------------- | --------------- | -------------- |
| **Setup**          | Just config    | Config + bridge | CLI install    |
| **Dependencies**   | None           | `mcp-remote`    | `@nexus/cli`   |
| **Client Support** | OpenCode       | Most clients    | All clients    |
| **Offline**        | No             | No              | Yes (cached)   |
| **Best for**       | OpenCode users | Most users      | Offline access |

## Using the CLI Auto-Config

The Nexus CLI can automatically configure your AI clients with local mode:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth login</span>
<span class="terminal-line output"><span class="text-green">Authenticated successfully!</span></span>
<span class="terminal-line"></span>
<span class="terminal-line prompt">npx @nexus/cli init</span>
<span class="terminal-line output"><span class="text-bold">Nexus Setup</span></span>
<span class="terminal-line output"></span>
<span class="terminal-line output"><span class="text-muted">Select clients to configure:</span></span>
<span class="terminal-line output"><span class="text-green">></span> [x] Claude Desktop</span>
<span class="terminal-line output">  [x] Cursor</span>
<span class="terminal-line output"></span>
<span class="terminal-line output"><span class="text-green">Configured Claude Desktop</span></span>
<span class="terminal-line output"><span class="text-green">Configured Cursor</span></span>
</Terminal>

## Verifying Installation

After installation, verify Nexus is working by asking your AI assistant:

> "Use Nexus to search for React useEffect documentation"

The AI should use the `query-docs` tool to search the React documentation.

<Callout type="warning" title="Authentication Error?">
If you see "API key required" or "Authentication required":
1. Make sure you have your API key from Step 1
2. Verify your API key is set in `headers` (native remote) or `env` (mcp-remote/local)
3. Check the header name is `NEXUS_API_KEY`
</Callout>

<Callout type="tip" title="Troubleshooting">
If Nexus isn't working, check the [Troubleshooting Guide](/troubleshooting) for common issues and solutions.
</Callout>

## Next Steps

- [Quick Start](/getting-started/quickstart) - Learn the basics of using Nexus
- [Authentication Guide](/api/authentication) - Learn more about API keys and scopes
- [MCP Tools](/tools/overview) - Explore all available tools
- [Memory Guide](/guides/project-memory) - Set up persistent project memory
