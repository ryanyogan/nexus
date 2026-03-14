# discover-servers

Search for MCP servers by capability, category, or name. Returns matching servers with their installation instructions and capabilities.

## Description

The `discover-servers` tool searches the Nexus MCP server registry to find servers that match your needs. Use it to find servers that can give your AI access to databases, filesystems, APIs, cloud services, and more.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | What you're looking for (e.g., 'database access', 'file system', 'github') |
| `capabilities` | array | No | Filter by capabilities: `tools`, `resources`, `prompts` |
| `category` | string | No | Filter by category (see categories below) |
| `official` | boolean | No | Only show official MCP servers from modelcontextprotocol org |
| `limit` | number | No | Maximum results (1-20, default 10) |

### Server Categories

- `database` — PostgreSQL, MySQL, SQLite, MongoDB, etc.
- `filesystem` — File system access, local files
- `devtools` — Git, GitHub, development tools
- `ai` — AI/ML services, embeddings, LLMs
- `cloud` — AWS, GCP, Azure, Cloudflare
- `productivity` — Notion, Slack, email, calendar
- `web` — Browser automation, web scraping
- `communication` — Chat, email, messaging

## Response

Returns an object containing:

- `success` — Whether the search succeeded
- `query` — Search query used
- `filters` — Applied filters
- `resultCount` — Number of results
- `results` — Array of matching servers:
  - `serverId` — Server identifier for other tools
  - `name` — Display name
  - `description` — Server description
  - `namespace` — Package namespace
  - `transport` — Transport type (stdio, http, sse)
  - `package` — Package name
  - `capabilities` — Object with tools/resources/prompts booleans
  - `categories` — Server categories
  - `securityRiskLevel` — Security risk (low, medium, high)
  - `badges` — Array of badges (official, verified, security-audited)
- `hint` — Suggested next step

## Example Usage

### Search by Query

```json
{
  "name": "discover-servers",
  "arguments": {
    "query": "postgres"
  }
}
```

**Response:**
```json
{
  "success": true,
  "query": "postgres",
  "filters": {},
  "resultCount": 2,
  "results": [
    {
      "serverId": "postgres",
      "name": "PostgreSQL",
      "description": "Query and manage PostgreSQL databases",
      "namespace": "modelcontextprotocol",
      "transport": "stdio",
      "package": "@modelcontextprotocol/server-postgres",
      "capabilities": {
        "tools": true,
        "resources": true,
        "prompts": false
      },
      "categories": ["database"],
      "securityRiskLevel": "medium",
      "badges": ["official"]
    }
  ],
  "hint": "Use get-server-config with serverId \"postgres\" to get installation instructions."
}
```

### Filter by Category

```json
{
  "name": "discover-servers",
  "arguments": {
    "category": "database",
    "limit": 5
  }
}
```

### Filter by Capabilities

```json
{
  "name": "discover-servers",
  "arguments": {
    "capabilities": ["tools", "resources"],
    "official": true
  }
}
```

### Find Official Servers Only

```json
{
  "name": "discover-servers",
  "arguments": {
    "official": true,
    "limit": 20
  }
}
```

## AI Conversation Example

```
User: I need to connect to my PostgreSQL database from Claude

AI: Let me find PostgreSQL MCP servers for you.

[Calls discover-servers with query: "postgresql"]

Found 2 PostgreSQL servers:

1. **PostgreSQL** (official)
   - Package: @modelcontextprotocol/server-postgres
   - Capabilities: tools, resources
   - Security: medium risk (database access)
   
2. **Neon** (verified)
   - Package: @neondatabase/mcp-server
   - Capabilities: tools
   - Optimized for Neon serverless Postgres

The official PostgreSQL server is the most versatile. Would you like me to 
generate the installation config for Claude Desktop?

User: Yes, for the official one

AI: [Calls get-server-config with serverId: "postgres", format: "claude-desktop"]

Here's your config...
```

## Use Cases

1. **Find database access** — Search for servers supporting your database
2. **Discover capabilities** — Find servers that provide specific MCP features
3. **Official servers** — Find trusted, official MCP implementations
4. **Category browsing** — Explore servers in a domain (devtools, cloud, etc.)

## Security Notes

- Review the `securityRiskLevel` before installing servers
- Official and verified badges indicate trusted sources
- Servers with database/filesystem access have elevated risks
- Always review environment variables before use

## Notes

- Results are ordered by official status, featured status, then GitHub stars
- Categories filter in JavaScript, so results may be fewer than limit
- Use `get-server-info` for detailed server information
- Use `get-server-config` for installation configuration

## Related Tools

- [get-server-info](/mcp-tools/get-server-info) — Get detailed server information
- [get-server-config](/mcp-tools/get-server-config) — Get installation configuration
