# VS Code Configuration

Configure Nexus with VS Code and GitHub Copilot.

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

## Requirements

- VS Code 1.99+
- GitHub Copilot extension
- MCP support enabled in Copilot

## Settings Configuration

1. Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "MCP"
3. Click "Edit in settings.json"

## Configuration

Add the following to your settings:

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

<Callout type="tip" title="Using CLI Login?">
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can simplify the config:

```json
{
  "github.copilot.chat.mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@nexus/cli", "serve"]
    }
  }
}
```
</Callout>

## Verification

1. Restart VS Code
2. Open Copilot Chat
3. Ask: "What Nexus tools do you have available?"
4. You should see tools like `query-docs`, `save-memory`, etc.

## Troubleshooting

### "API key required" Error

Make sure you've added your API key:
- Via `env.NEXUS_API_KEY` in the settings, OR
- Via CLI login (`npx @nexus/cli auth login`)

### Nexus Not Appearing

1. Ensure MCP is enabled in Copilot settings
2. Check that the JSON syntax is valid
3. Try restarting VS Code

### Testing Your Setup

Run the CLI directly to test:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli serve</span>
<span class="terminal-line output">Nexus MCP server running...</span>
</Terminal>
