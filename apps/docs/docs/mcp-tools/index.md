# MCP Tools

Nexus provides a comprehensive set of MCP tools organized into three categories: Documentation, Memory, and Server Registry. These tools give your AI assistant the ability to search documentation, remember context across sessions, and discover MCP servers.

## Overview

| Tool | Category | Description |
|------|----------|-------------|
| [resolve-library](/mcp-tools/resolve-library) | Documentation | Search for libraries by name to get IDs |
| [query-docs](/mcp-tools/query-docs) | Documentation | Search library documentation semantically |
| [get-library-info](/mcp-tools/get-library-info) | Documentation | Get detailed library information |
| [list-libraries](/mcp-tools/list-libraries) | Documentation | List all indexed libraries |
| [save-memory](/mcp-tools/save-memory) | Memory | Store persistent memory |
| [recall-memories](/mcp-tools/recall-memories) | Memory | Search memories semantically |
| [get-project-context](/mcp-tools/get-project-context) | Memory | Get all context for a project |
| [list-memories](/mcp-tools/list-memories) | Memory | Browse stored memories |
| [update-memory](/mcp-tools/update-memory) | Memory | Update an existing memory |
| [delete-memory](/mcp-tools/delete-memory) | Memory | Delete a memory permanently |
| [discover-servers](/mcp-tools/discover-servers) | Server Registry | Search for MCP servers |
| [get-server-info](/mcp-tools/get-server-info) | Server Registry | Get server details |
| [get-server-config](/mcp-tools/get-server-config) | Server Registry | Get installation configuration |

## Documentation Tools

These tools help your AI access up-to-date library documentation:

- **resolve-library** — Find the library ID before querying docs
- **query-docs** — Semantic search across indexed documentation
- **get-library-info** — Detailed metadata about a library
- **list-libraries** — Discover available documentation

## Memory Tools

Persistent memory that survives across sessions:

- **save-memory** — Store project context, decisions, and learnings
- **recall-memories** — Retrieve relevant memories using natural language
- **get-project-context** — Load all context for a specific project
- **list-memories** — Browse memories with filtering
- **update-memory** — Modify existing memories
- **delete-memory** — Remove memories permanently

:::info Authentication
Memory write operations (save, update, delete) require authentication. Read operations work anonymously but only return global/public memories.
:::

## Server Registry Tools

Discover and configure MCP servers:

- **discover-servers** — Search by capability, category, or name
- **get-server-info** — Detailed server information and capabilities
- **get-server-config** — Ready-to-use installation configuration

## Response Formats

Most tools support a `tokens` parameter to control response verbosity:

| Format | Description | Best For |
|--------|-------------|----------|
| `full` | Complete response with all metadata | Debugging, exploration |
| `compact` | Essential data only | Normal usage |
| `code-only` | Only code blocks | Quick examples |
| `summary` | Brief overview | Checking availability |

```json
{
  "name": "query-docs",
  "arguments": {
    "libraryId": "nextjs",
    "query": "app router setup",
    "tokens": "compact"
  }
}
```

## Typical Workflow

### Searching Documentation

1. Use `resolve-library` to find the library ID
2. Use `query-docs` with the ID to search documentation
3. Optionally use `get-library-info` for metadata

### Managing Memory

1. Use `save-memory` to store project context
2. Use `recall-memories` to find relevant context later
3. Use `get-project-context` at session start

### Finding MCP Servers

1. Use `discover-servers` to find servers by need
2. Use `get-server-info` for detailed capabilities
3. Use `get-server-config` for installation config
