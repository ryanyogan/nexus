# Servers API

Browse and get information about MCP servers.

## List Servers

```
GET /servers
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `official` | boolean | Only official servers |
| `q` | string | Search query |
| `limit` | number | Max results |

### Response

```json
{
  "data": {
    "servers": [
      {
        "id": "postgres",
        "name": "PostgreSQL",
        "description": "Query PostgreSQL databases",
        "official": true,
        "category": "database"
      }
    ]
  }
}
```

## Get Server

```
GET /servers/:id
```

### Response

```json
{
  "data": {
    "id": "postgres",
    "name": "PostgreSQL",
    "description": "Query PostgreSQL databases",
    "official": true,
    "tools": [...],
    "resources": [...],
    "documentation": "https://..."
  }
}
```

## Get Server Config

```
GET /servers/:id/config
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `format` | string | `claude-desktop`, `vscode`, `generic` |

### Response

```json
{
  "data": {
    "format": "claude-desktop",
    "config": {
      "mcpServers": {
        "postgres": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-postgres"]
        }
      }
    }
  }
}
```
