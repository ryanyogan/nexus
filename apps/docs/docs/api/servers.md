# Servers API

The Servers API provides access to the MCP server registry for discovering and configuring MCP servers.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/servers` | List MCP servers |
| `GET` | `/api/servers/:id` | Get server details |
| `GET` | `/api/servers/:id/config` | Get installation config |
| `GET` | `/api/servers/categories` | List categories |

## List Servers

```
GET /api/servers
```

Returns a paginated list of MCP servers.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | — | Search by name or description |
| `category` | string | — | Filter by category |
| `transport` | string | — | Filter by transport: `stdio`, `http`, `sse` |
| `hasTools` | boolean | — | Only servers with tools |
| `hasResources` | boolean | — | Only servers with resources |
| `hasPrompts` | boolean | — | Only servers with prompts |
| `official` | boolean | — | Only official MCP servers |
| `featured` | boolean | — | Only featured servers |
| `limit` | number | 20 | Results per page (max 100) |
| `offset` | number | 0 | Pagination offset |

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/servers?category=database&hasTools=true"
```

### Example Response

```json
{
  "servers": [
    {
      "id": "postgres",
      "namespace": "modelcontextprotocol",
      "name": "postgres",
      "displayName": "PostgreSQL",
      "description": "Query and manage PostgreSQL databases",
      "version": "1.0.0",
      "transportType": "stdio",
      "packageType": "npm",
      "packageName": "@modelcontextprotocol/server-postgres",
      "hasTools": true,
      "hasResources": true,
      "hasPrompts": false,
      "repositoryUrl": "https://github.com/modelcontextprotocol/servers",
      "homepageUrl": "https://modelcontextprotocol.io",
      "author": "Anthropic",
      "categories": ["database"],
      "keywords": ["postgres", "sql", "database"],
      "weeklyDownloads": 15000,
      "githubStars": 5000,
      "isVerified": true,
      "isOfficial": true,
      "isFeatured": true,
      "securityRiskLevel": "medium",
      "securityCapabilities": ["database_read", "database_write"],
      "isSecurityAudited": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

## Get Server

```
GET /api/servers/:id
```

Returns detailed information about a specific MCP server.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Server ID (e.g., `postgres`, `filesystem`) |

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/servers/filesystem"
```

### Example Response

```json
{
  "server": {
    "id": "filesystem",
    "namespace": "modelcontextprotocol",
    "name": "filesystem",
    "displayName": "Filesystem",
    "description": "Read and write files on the local filesystem",
    "version": "1.0.0",
    "transportType": "stdio",
    "packageType": "npm",
    "packageName": "@modelcontextprotocol/server-filesystem",
    "installCommand": "npx",
    "installArgs": ["-y", "@modelcontextprotocol/server-filesystem"],
    "envVars": {},
    "hasTools": true,
    "hasResources": true,
    "hasPrompts": false,
    "tools": [
      {
        "name": "read_file",
        "description": "Read contents of a file"
      },
      {
        "name": "write_file",
        "description": "Write contents to a file"
      }
    ],
    "resources": [
      {
        "name": "file",
        "description": "Access file contents"
      }
    ],
    "prompts": [],
    "repositoryUrl": "https://github.com/modelcontextprotocol/servers",
    "documentationUrl": "https://modelcontextprotocol.io/servers/filesystem",
    "homepageUrl": "https://modelcontextprotocol.io",
    "author": "Anthropic",
    "license": "MIT",
    "categories": ["filesystem", "devtools"],
    "keywords": ["files", "filesystem", "read", "write"],
    "weeklyDownloads": 25000,
    "githubStars": 5000,
    "isVerified": true,
    "isOfficial": true,
    "isFeatured": true,
    "securityRiskLevel": "high",
    "securityCapabilities": ["file_read", "file_write"],
    "securityNotes": "Grants access to filesystem. Use with caution.",
    "isSecurityAudited": false
  },
  "stats": {
    "totalDiscoveries": 5000,
    "totalConfigCopies": 2500
  },
  "linkedDocs": ["nodejs", "typescript"]
}
```

## Get Installation Config

```
GET /api/servers/:id/config
```

Generates ready-to-use installation configuration for an MCP server.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Server ID |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | `claude-desktop` | Config format: `claude-desktop`, `vscode`, `generic` |

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/servers/postgres/config?format=claude-desktop"
```

### Example Response (Claude Desktop)

```json
{
  "format": "claude-desktop",
  "config": {
    "mcpServers": {
      "postgres": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-postgres"],
        "env": {
          "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/db"
        }
      }
    }
  },
  "instructions": "Add this to your Claude Desktop config at:\n- macOS: ~/Library/Application Support/Claude/claude_desktop_config.json\n- Windows: %APPDATA%\\Claude\\claude_desktop_config.json\n\nRequired environment variables:\n- POSTGRES_CONNECTION_STRING: (your value)"
}
```

### Example Response (VS Code)

```json
{
  "format": "vscode",
  "config": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/db"
      }
    }
  },
  "instructions": "Add this to your VS Code mcp.json file"
}
```

### Example Response (HTTP Server)

For remote HTTP/SSE servers:

```json
{
  "format": "claude-desktop",
  "config": {
    "mcpServers": {
      "remote-server": {
        "url": "https://mcp.example.com/sse",
        "type": "http"
      }
    }
  },
  "instructions": "Add this to your MCP client configuration."
}
```

## List Categories

```
GET /api/servers/categories
```

Returns available server categories with counts.

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/servers/categories"
```

### Example Response

```json
{
  "categories": [
    { "id": "database", "label": "Database", "count": 12 },
    { "id": "filesystem", "label": "Filesystem", "count": 5 },
    { "id": "devtools", "label": "Devtools", "count": 18 },
    { "id": "ai", "label": "Ai", "count": 8 },
    { "id": "cloud", "label": "Cloud", "count": 15 },
    { "id": "productivity", "label": "Productivity", "count": 10 }
  ]
}
```

## Transport Types

MCP servers use different transport mechanisms:

| Type | Description |
|------|-------------|
| `stdio` | Local process communication (most common) |
| `http` | Remote HTTP-based communication |
| `sse` | Server-Sent Events for streaming |

## Security Risk Levels

Servers are categorized by security risk:

| Level | Description |
|-------|-------------|
| `low` | Read-only access, no sensitive operations |
| `medium` | Some write access or network requests |
| `high` | File system access, database writes, or code execution |
| `critical` | Full system access or root-level operations |

## Error Responses

### 404 Not Found

```json
{
  "error": "Server not found"
}
```
