# OpenCode Configuration

Configure Nexus with OpenCode.

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

## Configuration File

OpenCode uses `~/.config/opencode/config.json` on Linux/macOS.

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
        "Authorization:Bearer ${NEXUS_API_KEY}"
      ],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

<Callout type="info" title="How it works">
The `mcp-remote` package bridges your local MCP client to the remote Nexus server. The `--header` flag passes your API key as a Bearer token for authentication.
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

1. Restart OpenCode
2. Ask: "What Nexus tools do you have available?"
3. You should see tools like `query-docs`, `save-memory`, etc.

## Troubleshooting

### "API key required" Error

Make sure your API key is configured:
- **Remote mode**: Check the `--header` argument and `NEXUS_API_KEY` env var
- **Local mode**: Set `NEXUS_API_KEY` env var, or use CLI login

### Testing Your Setup

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli serve</span>
<span class="terminal-line output">Nexus MCP server running...</span>
</Terminal>
