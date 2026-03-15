# Claude Desktop Configuration

Configure Nexus with Claude Desktop.

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
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

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

After saving the configuration:

1. Restart Claude Desktop completely
2. Start a new conversation
3. Ask: "List the MCP tools you have available"
4. You should see Nexus tools listed

## Troubleshooting

### "API key required" Error

Make sure you've added your API key to the config:
- Via `env.NEXUS_API_KEY` in the config file, OR
- Via CLI login (`npx @nexus/cli auth login`)

### Nexus Not Appearing

1. Check the config file syntax (valid JSON)
2. Ensure npx is available in your PATH
3. Check Claude Desktop logs for errors
4. Try restarting Claude Desktop

### Testing Your Setup

Run the CLI directly to test:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli serve</span>
<span class="terminal-line output">Nexus MCP server running...</span>
</Terminal>

If you see errors, the issue is with your API key or network connection.
