# VS Code Configuration

Configure Nexus with VS Code and GitHub Copilot.

## Settings Configuration

1. Open VS Code Settings (`Cmd+,` or `Ctrl+,`)
2. Search for "MCP"
3. Click "Edit in settings.json"

## Remote Mode (Recommended)

```json
{
  "github.copilot.chat.mcpServers": {
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
  "github.copilot.chat.mcpServers": {
    "nexus": {
      "command": "nexus",
      "args": ["serve"]
    }
  }
}
```

## Requirements

- VS Code 1.99+
- GitHub Copilot extension
- MCP support enabled in Copilot

## Verification

1. Restart VS Code
2. Open Copilot Chat
3. Ask about available tools
