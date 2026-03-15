# Cursor Configuration

Configure Nexus with Cursor IDE.

<script setup>
import Callout from '../.vitepress/theme/components/Callout.vue'
import Terminal from '../.vitepress/theme/components/Terminal.vue'
</script>

## Prerequisites

You need an API key to use Nexus. Get one by running:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth login</span>
</Terminal>

Or create one at [nexus.yogan.dev/dashboard/keys](https://nexus.yogan.dev/dashboard/keys).

## Configuration File Location

| Platform | Path |
|----------|------|
| macOS/Linux | `~/.cursor/mcp.json` |
| Windows | `%USERPROFILE%\.cursor\mcp.json` |

## Configuration

Add the following to your config file:

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
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can simplify the config:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@nexus/cli", "serve"]
    }
  }
}
```
</Callout>

## Verification

1. Restart Cursor
2. Open the AI chat
3. Ask: "What Nexus tools do you have available?"
4. You should see tools like `query-docs`, `save-memory`, etc.

## Troubleshooting

### "API key required" Error

Make sure you've added your API key:
- Via `env.NEXUS_API_KEY` in the config file, OR
- Via CLI login (`npx @nexus/cli auth login`)

### Nexus Not Appearing

1. Check the config file syntax (valid JSON)
2. Ensure the file is in the correct location
3. Try restarting Cursor

### Testing Your Setup

Run the CLI directly to test:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli serve</span>
<span class="terminal-line output">Nexus MCP server running...</span>
</Terminal>
