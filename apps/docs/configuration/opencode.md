# OpenCode Configuration

Configure Nexus with OpenCode.

## Configuration File

OpenCode uses `~/.config/opencode/config.json` on Linux/macOS.

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

1. Restart OpenCode
2. Ask about available MCP tools
