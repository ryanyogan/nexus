# get-server-info

Get detailed information about a specific MCP server including tools, resources, prompts, and documentation.

## Example Prompts

> "Tell me more about the PostgreSQL MCP server"

> "What tools does the GitHub MCP server provide?"

> "How does the filesystem MCP server work?"

> "What can the Slack MCP server do?"

## Usage

```
Tool: get-server-info
Parameters:
  - serverId (required): The server ID
```

## Example

**Input:**

```json
{
  "serverId": "postgres"
}
```

**Output:**

```json
{
  "id": "postgres",
  "name": "PostgreSQL",
  "description": "Query and manage PostgreSQL databases",
  "official": true,
  "version": "1.0.0",
  "tools": [
    { "name": "query", "description": "Execute SQL queries" },
    { "name": "list_tables", "description": "List database tables" }
  ],
  "resources": [{ "name": "schema", "description": "Database schema" }],
  "documentation": "https://github.com/modelcontextprotocol/servers/tree/main/postgres",
  "installCommand": "npx -y @modelcontextprotocol/server-postgres"
}
```

## Parameters

| Parameter  | Type   | Required | Description                     |
| ---------- | ------ | -------- | ------------------------------- |
| `serverId` | string | Yes      | Server ID from discover-servers |

## Returns

Detailed server information including:

- Available tools and their descriptions
- Resources provided by the server
- Prompts if available
- Documentation links
- Installation command
