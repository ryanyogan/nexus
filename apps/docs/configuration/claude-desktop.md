# Claude Desktop Configuration

Configure Nexus with Claude Desktop.

## Configuration File Location

| Platform | Path |
|----------|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

## Remote Mode (Recommended)

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-remote", "https://mcp.nexus.yogan.dev/sse"]
    }
  }
}
```

## Local Mode

```json
{
  "mcpServers": {
    "nexus": {
      "command": "nexus",
      "args": ["serve"]
    }
  }
}
```

## Verification

After saving the configuration:

1. Restart Claude Desktop completely
2. Start a new conversation
3. Ask: "List the MCP tools you have available"
4. You should see Nexus tools listed

## Troubleshooting

If Nexus isn't working:

1. Check the config file syntax (valid JSON)
2. Ensure npx is available in your PATH
3. Check Claude Desktop logs for errors
