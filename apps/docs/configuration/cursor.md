# Cursor Configuration

Configure Nexus with Cursor IDE.

## Configuration File Location

| Platform | Path |
|----------|------|
| macOS/Linux | `~/.cursor/mcp.json` |
| Windows | `%USERPROFILE%\.cursor\mcp.json` |

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

1. Restart Cursor
2. Open the AI chat
3. Ask about available tools
