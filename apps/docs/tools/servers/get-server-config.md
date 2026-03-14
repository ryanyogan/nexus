# get-server-config

Generate installation configuration for an MCP server. Returns ready-to-use config for various clients.

## Usage

```
Tool: get-server-config
Parameters:
  - serverId (required): The server ID
  - format (optional): Config format
```

## Example

**Input:**
```json
{
  "serverId": "postgres",
  "format": "claude-desktop"
}
```

**Output:**
```json
{
  "format": "claude-desktop",
  "config": {
    "mcpServers": {
      "postgres": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-postgres"],
        "env": {
          "POSTGRES_URL": "postgresql://user:pass@localhost:5432/db"
        }
      }
    }
  },
  "instructions": "Add to ~/Library/Application Support/Claude/claude_desktop_config.json"
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serverId` | string | Yes | Server ID |
| `format` | string | No | `claude-desktop` (default), `vscode`, `generic` |

## Config Formats

| Format | Description |
|--------|-------------|
| `claude-desktop` | Claude Desktop configuration |
| `vscode` | VS Code / Copilot configuration |
| `generic` | Generic MCP configuration |

## Returns

- Ready-to-use configuration JSON
- Instructions for where to add it
- Required environment variables
