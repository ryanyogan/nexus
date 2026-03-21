# VS Code Configuration

Configure Nexus with VS Code and GitHub Copilot.

<script setup>
import Callout from '../.vitepress/theme/components/Callout.vue'
import Terminal from '../.vitepress/theme/components/Terminal.vue'
</script>

## Prerequisites

- VS Code 1.99+
- GitHub Copilot extension
- MCP support enabled in Copilot
- Nexus API key

Get your API key by running:

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli auth login</span>
</Terminal>

Or create one at [nexus.yogan.dev/dashboard/keys](https://nexus.yogan.dev/dashboard/keys).

## Settings Configuration

1. Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "MCP"
3. Click "Edit in settings.json"

## Remote Mode (Recommended)

Connect directly to the hosted Nexus service:

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

<Callout type="info" title="How it works">
The `mcp-remote` package bridges your local MCP client to the remote Nexus server. The `--header` flag passes your API key for authentication.
</Callout>

## Local Mode

Run the Nexus CLI locally (useful for offline access):

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
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can omit the `env` section in local mode.
</Callout>

## Verification

1. Restart VS Code
2. Open Copilot Chat
3. Ask: "What Nexus tools do you have available?"
4. You should see tools like `query-docs`, `save-memory`, etc.

## Troubleshooting

### "API key required" Error

Make sure your API key is configured:

- **Remote mode**: Check the `--header` argument and `NEXUS_API_KEY` env var
- **Local mode**: Set `NEXUS_API_KEY` env var, or use CLI login

### Nexus Not Appearing

1. Ensure MCP is enabled in Copilot settings
2. Check that the JSON syntax is valid
3. Try restarting VS Code

### Testing Your Setup

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli serve</span>
<span class="terminal-line output">Nexus MCP server running...</span>
</Terminal>
