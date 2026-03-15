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

## Remote Mode (Recommended)

Connect directly to the hosted Nexus service:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.nexus.yogan.dev/sse",
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
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can omit the `env` section in local mode.
</Callout>

## Verification

1. Restart Cursor
2. Open the AI chat
3. Ask: "What Nexus tools do you have available?"
4. You should see tools like `query-docs`, `save-memory`, etc.

## Troubleshooting

### "API key required" Error

Make sure your API key is configured:
- **Remote mode**: Check the `--header` argument and `NEXUS_API_KEY` env var
- **Local mode**: Set `NEXUS_API_KEY` env var, or use CLI login

### Nexus Not Appearing

1. Check the config file syntax (valid JSON)
2. Ensure the file is in the correct location
3. Try restarting Cursor

### Testing Your Setup

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli serve</span>
<span class="terminal-line output">Nexus MCP server running...</span>
</Terminal>
