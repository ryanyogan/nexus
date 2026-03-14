# nexus serve

Run Nexus as a local MCP (Model Context Protocol) server. This allows AI editors to access Nexus documentation, memories, and server discovery directly.

## Synopsis

```bash
nexus serve [options]
```

## Description

The `serve` command starts Nexus as an MCP server using stdio transport. This is useful for:

- **Local development** - Run Nexus without requiring internet access to the cloud
- **Privacy** - Keep all interactions local
- **Customization** - Extend with your own tools
- **Editor integration** - Connect any MCP-compatible editor

## Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--port <port>` | `-p` | Port for HTTP server (default: 3456, not yet implemented) |
| `--offline` | | Use cached docs only (no API calls) |
| `--json` | | Output startup info as JSON |

## Usage

### Basic Usage

```bash
nexus serve
```

Output (to stderr):

```
Nexus MCP server running on stdio
Tools available: resolve-library, query-docs, get-library-info, list-libraries,
                 save-memory, recall-memories, get-project-context,
                 discover-servers, get-server-info, get-server-config
```

### Offline Mode

Run without API access, using only cached documentation:

```bash
nexus serve --offline
```

## Available Tools

The MCP server exposes the following tools to connected editors:

### Documentation Tools

| Tool | Description |
|------|-------------|
| `resolve-library` | Search for libraries by name to find their library ID |
| `query-docs` | Search documentation for a specific library |
| `get-library-info` | Get detailed information about a library |
| `list-libraries` | List all available indexed libraries |

### Memory Tools

| Tool | Description |
|------|-------------|
| `save-memory` | Store a memory for later retrieval |
| `recall-memories` | Search for relevant memories using semantic search |
| `get-project-context` | Get all stored context for a specific project |

### MCP Server Discovery Tools

| Tool | Description |
|------|-------------|
| `discover-servers` | Search for MCP servers by capability or category |
| `get-server-info` | Get detailed information about an MCP server |
| `get-server-config` | Generate installation configuration for an MCP server |

## Tool Schemas

### resolve-library

```typescript
{
  libraryName: string,  // Library name to search for (e.g., 'react', 'nextjs')
  query?: string        // Optional task/question for ranking by relevance
}
```

### query-docs

```typescript
{
  libraryId: string,  // Library ID from resolve-library (e.g., 'react', 'nextjs')
  query: string,      // Question or task (be specific)
  limit?: number      // Max results (1-10, default 5)
}
```

### get-library-info

```typescript
{
  libraryId: string   // Library ID (e.g., 'react', 'nextjs', 'hono')
}
```

### list-libraries

```typescript
{
  category?: string,   // Filter: frontend, backend, fullstack, database, cloud, devops, ai, testing, mobile, utilities
  limit?: number,      // Max results (1-50, default 20)
  featured?: boolean   // Only show featured libraries
}
```

### save-memory

```typescript
{
  title: string,       // Short, descriptive title (max 100 chars)
  content: string,     // Full content of the memory
  type: "project_context" | "session_summary" | "decision" | "correction",
  project?: string,    // Project name (e.g., 'nexus')
  tags?: string[],     // Tags for categorization
  importance?: number, // 1-10 (default 5), higher = more relevant
  summary?: string     // Short summary for listing (max 200 chars)
}
```

### recall-memories

```typescript
{
  query: string,        // Natural language search query
  project?: string,     // Filter by project name
  type?: "project_context" | "session_summary" | "decision" | "correction",
  tags?: string[],      // Filter by tags (all must match)
  limit?: number        // Max results (1-10, default 5)
}
```

### get-project-context

```typescript
{
  project: string,     // Project name (e.g., 'nexus')
  limit?: number       // Max memories per type (default 5)
}
```

### discover-servers

```typescript
{
  query?: string,      // Search query (e.g., 'database access', 'github')
  category?: string,   // Filter: database, filesystem, devtools, ai, cloud, etc.
  official?: boolean,  // Only official MCP servers
  limit?: number       // Max results (1-20, default 10)
}
```

### get-server-info

```typescript
{
  serverId: string     // Server ID (e.g., 'filesystem', 'postgres', 'github')
}
```

### get-server-config

```typescript
{
  serverId: string,    // Server ID to get config for
  format?: "claude-desktop" | "vscode" | "opencode" | "generic"
}
```

## Editor Integration

### Claude Code

```bash
claude mcp add nexus-local -- nexus serve
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "nexus-local": {
      "command": "nexus",
      "args": ["serve"]
    }
  }
}
```

### VS Code

Add to `~/.vscode/mcp.json`:

```json
{
  "mcpServers": {
    "nexus-local": {
      "command": "nexus",
      "args": ["serve"]
    }
  }
}
```

### OpenCode

Add to `opencode.json`:

```json
{
  "mcp": {
    "nexus-local": {
      "type": "stdio",
      "command": "nexus",
      "args": ["serve"],
      "enabled": true
    }
  }
}
```

### Zed

Add to `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "nexus-local": {
      "command": {
        "path": "nexus",
        "args": ["serve"]
      }
    }
  }
}
```

## Authentication

The serve command uses your stored authentication token from `nexus auth login`. If not authenticated:

- **With internet**: Limited API access with rate limiting
- **With `--offline`**: Only cached documentation is available

## Output

All status messages are written to stderr to avoid interfering with the MCP protocol on stdout:

```
# stdout: MCP JSON-RPC messages
# stderr: Status and debug messages
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXUS_API_KEY` | Override stored API token |
| `NEXUS_API_URL` | Override API URL (for development) |

## See Also

- [Configuration](./configuration.md) - Environment variables and config
- [nexus auth](./auth.md) - Authentication setup
- [nexus docs](./docs.md) - Download docs for offline use
