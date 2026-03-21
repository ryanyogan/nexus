# discover-servers

Search for MCP servers by capability, category, or name. Returns matching servers with installation instructions.

## Usage

```
Tool: discover-servers
Parameters:
  - query (optional): What you're looking for
  - category (optional): Filter by category
  - capabilities (optional): Filter by capabilities
  - official (optional): Only official servers
  - limit (optional): Max results (1-20, default 10)
```

## Example

**Input:**

```json
{
  "query": "postgresql database",
  "category": "database"
}
```

**Output:**

```json
{
  "servers": [
    {
      "id": "postgres",
      "name": "PostgreSQL",
      "description": "Query and manage PostgreSQL databases",
      "official": true,
      "category": "database",
      "capabilities": ["tools", "resources"]
    }
  ]
}
```

## Parameters

| Parameter      | Type     | Required | Description                             |
| -------------- | -------- | -------- | --------------------------------------- |
| `query`        | string   | No       | Natural language search                 |
| `category`     | string   | No       | Filter by category                      |
| `capabilities` | string[] | No       | Filter: `tools`, `resources`, `prompts` |
| `official`     | boolean  | No       | Only official MCP servers               |
| `limit`        | number   | No       | Max results 1-20, default 10            |

## Categories

- `database` - PostgreSQL, SQLite, MongoDB
- `filesystem` - File operations, directory access
- `devtools` - Git, GitHub, build tools
- `ai` - AI/ML integrations
- `cloud` - AWS, GCP, Azure
- `productivity` - Slack, Notion, Linear
