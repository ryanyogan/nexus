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
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can omit the `env` section in local mode:

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

Make sure your API key is configured:
- **Remote mode**: Check the `--header` argument and `NEXUS_API_KEY` env var
- **Local mode**: Set `NEXUS_API_KEY` env var, or use CLI login

### Nexus Not Appearing

1. Check the config file syntax (valid JSON)
2. Ensure npx is available in your PATH
3. Check Claude Desktop logs for errors
4. Try restarting Claude Desktop

### Testing Remote Connection

Test that `mcp-remote` can connect:

<Terminal title="Terminal">
<span class="terminal-line prompt">NEXUS_API_KEY=nxs_your_key npx mcp-remote https://mcp.nexus.yogan.dev/sse --header "NEXUS_API_KEY:\${NEXUS_API_KEY}"</span>
</Terminal>

### Testing Local Mode

<Terminal title="Terminal">
<span class="terminal-line prompt">npx @nexus/cli serve</span>
<span class="terminal-line output">Nexus MCP server running...</span>
</Terminal>
