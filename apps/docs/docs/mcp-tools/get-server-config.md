# get-server-config

Generate installation configuration for an MCP server. Returns ready-to-use config for Claude Desktop, VS Code, or other MCP clients.

## Description

The `get-server-config` tool generates copy-paste ready configuration for installing an MCP server. It handles the differences between transport types (stdio vs http) and output formats for different MCP clients.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `serverId` | string | Yes | The server ID to get config for |
| `format` | string | No | Config format: `claude-desktop` (default), `vscode`, `generic` |

### Config Formats

| Format | Description | Config File Location |
|--------|-------------|---------------------|
| `claude-desktop` | Claude Desktop app | `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows) |
| `vscode` | VS Code extension | `.vscode/mcp.json` |
| `generic` | Bare config object | Any MCP client |

## Response

Returns an object containing:

- `success` — Whether the request succeeded
- `serverId` — Server ID
- `serverName` — Server display name
- `format` — Output format
- `config` — Configuration object (ready to merge)
- `configJson` — Config as formatted JSON string
- `instructions` — Setup instructions including env vars

## Example Usage

### Claude Desktop Config

```json
{
  "name": "get-server-config",
  "arguments": {
    "serverId": "postgres"
  }
}
```

**Response:**
```json
{
  "success": true,
  "serverId": "postgres",
  "serverName": "PostgreSQL",
  "format": "claude-desktop",
  "config": {
    "mcpServers": {
      "postgres": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-postgres"],
        "env": {
          "POSTGRES_URL": "(your database URL)"
        }
      }
    }
  },
  "configJson": "{\n  \"mcpServers\": {\n    \"postgres\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@modelcontextprotocol/server-postgres\"],\n      \"env\": {\n        \"POSTGRES_URL\": \"(your value)\"\n      }\n    }\n  }\n}",
  "instructions": "Add this to your Claude Desktop config:\n- macOS: ~/Library/Application Support/Claude/claude_desktop_config.json\n- Windows: %APPDATA%\\Claude\\claude_desktop_config.json\n\nMerge the \"mcpServers\" object with any existing servers.\n\nRequired environment variables:\n- POSTGRES_URL: (your value)"
}
```

### VS Code Config

```json
{
  "name": "get-server-config",
  "arguments": {
    "serverId": "filesystem",
    "format": "vscode"
  }
}
```

### HTTP/SSE Server Config

```json
{
  "name": "get-server-config",
  "arguments": {
    "serverId": "nexus"
  }
}
```

**Response (HTTP server):**
```json
{
  "success": true,
  "serverId": "nexus",
  "serverName": "Nexus",
  "format": "claude-desktop",
  "config": {
    "mcpServers": {
      "nexus": {
        "url": "https://mcp.nexus.yogan.dev/sse",
        "type": "http"
      }
    }
  },
  "configJson": "{\n  \"mcpServers\": {\n    \"nexus\": {\n      \"url\": \"https://mcp.nexus.yogan.dev/sse\",\n      \"type\": \"http\"\n    }\n  }\n}",
  "instructions": "Add this to your MCP client configuration."
}
```

## AI Conversation Example

```
User: Set up the filesystem MCP server for me

AI: Let me generate the configuration for the filesystem server.

[Calls get-server-config with serverId: "filesystem", format: "claude-desktop"]

Here's your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
    }
  }
}
```

**Setup steps:**

1. Open your Claude Desktop config file:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

2. Merge this config with your existing `mcpServers` section

3. Replace `/path/to/allowed/directory` with the actual directory you want to allow access to

4. Restart Claude Desktop

The filesystem server will then let me read and write files in that directory.
```

## Use Cases

1. **Quick setup** — Get copy-paste config without reading docs
2. **Multiple clients** — Generate configs for different MCP clients
3. **Environment variables** — See what credentials are needed
4. **HTTP vs stdio** — Automatic handling of transport differences

## Config Merging

When adding to existing config, merge the `mcpServers` objects:

```json
// Existing config
{
  "mcpServers": {
    "nexus": { "url": "https://mcp.nexus.yogan.dev/sse" }
  }
}

// Add postgres - merge into mcpServers
{
  "mcpServers": {
    "nexus": { "url": "https://mcp.nexus.yogan.dev/sse" },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": { "POSTGRES_URL": "postgres://..." }
    }
  }
}
```

## Notes

- Environment variables are shown with placeholder values
- STDIO servers use `command` and `args`
- HTTP/SSE servers use `url` and `type`
- Always review environment variables before adding real credentials

## Related Tools

- [discover-servers](/mcp-tools/discover-servers) — Find servers by capability
- [get-server-info](/mcp-tools/get-server-info) — Get detailed server information
