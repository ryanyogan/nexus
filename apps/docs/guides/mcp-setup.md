# MCP Setup Guide

Understanding the Model Context Protocol and how Nexus uses it.

<script setup>
import Terminal from '../.vitepress/theme/components/Terminal.vue'
import Callout from '../.vitepress/theme/components/Callout.vue'
</script>

## What is MCP?

The Model Context Protocol (MCP) is a standard for AI assistants to access external tools and data. It allows AI clients to:

- Call tools (like search, memory, etc.)
- Access resources (like files, databases)
- Use prompts (predefined templates)

## How Nexus Uses MCP

Nexus is an MCP server that provides:

- **Tools**: 13+ tools for docs, memory, servers, and stacks
- **Resources**: Not currently used
- **Prompts**: Not currently used

## Prerequisites

<Callout type="warning" title="API Key Required">
All Nexus tool calls require an API key. Get one before setting up:

```bash
npx @nexus/cli auth login
```

Or create one at [nexus.yogan.dev/dashboard/keys](https://nexus.yogan.dev/dashboard/keys).
</Callout>

## Quick Setup

The fastest way to set up Nexus with your AI client:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth login</span>
<span class="terminal-line output"><span class="text-green">Authenticated successfully!</span></span>
<span class="terminal-line"></span>
<span class="terminal-line prompt">npx @nexus/cli init</span>
<span class="terminal-line output"><span class="text-muted">Select clients to configure:</span></span>
<span class="terminal-line output"><span class="text-green">></span> [x] Claude Desktop</span>
<span class="terminal-line output">  [x] Cursor</span>
</Terminal>

## Manual Configuration

Add Nexus to your MCP client config:

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

<Callout type="tip" title="Using CLI Login?">
If you authenticated with `npx @nexus/cli auth login`, you can omit the `env` section - the CLI uses your stored key automatically.
</Callout>

## Client-Specific Guides

- [Claude Desktop](/configuration/claude-desktop)
- [Cursor](/configuration/cursor)
- [VS Code](/configuration/vscode)
- [OpenCode](/configuration/opencode)

## HTTP Transport (Advanced)

For clients supporting HTTP/SSE transport:

```
URL: https://api.nexus.yogan.dev/mcp
Headers:
  Authorization: Bearer nxs_your_api_key_here
```

## Troubleshooting

### "API key required" or "Authentication required"

You need to authenticate:

```bash
npx @nexus/cli auth login
```

Or add your API key to the MCP config's `env` section.

### "MCP server not responding"

1. Check your internet connection
2. Verify the config syntax (valid JSON)
3. Restart your AI client
4. Test the CLI directly: `npx @nexus/cli serve`

### "Tool not found"

1. Ensure Nexus is properly configured
2. Check that the MCP server is running
3. Look for errors in client logs

### Testing Your Setup

Run the CLI directly to verify it works:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli serve</span>
<span class="terminal-line output">Nexus MCP server running...</span>
</Terminal>

If you see errors, check your API key and network connection.

## Learn More

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)
- [Authentication Guide](/api/authentication)
