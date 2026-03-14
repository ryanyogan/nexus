# list-memories

Browse stored memories with filtering. Returns summaries without full content.

## Description

The `list-memories` tool returns a paginated list of memories with basic metadata. Unlike `recall-memories`, it doesn't perform semantic search—it simply lists memories with optional filtering. Use this to browse what's stored or find memories by type/project.

:::tip
Use [recall-memories](/mcp-tools/recall-memories) for semantic search when you know what you're looking for but not the exact title.
:::

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by memory type: `project_context`, `session_summary`, `decision`, `correction` |
| `project` | string | No | Filter by project name |
| `limit` | number | No | Maximum results (1-50, default 20) |
| `offset` | number | No | Pagination offset for browsing |

## Response

Returns an object containing:

- `success` — Whether the request succeeded
- `filters` — Applied filters
- `count` — Number of memories returned
- `total` — Total memories matching filters
- `memories` — Array of memory summaries:
  - `memoryId` — Unique identifier
  - `title` — Memory title
  - `summary` — Short summary (if available)
  - `type` — Memory type
  - `project` — Associated project
  - `tags` — Memory tags
  - `importance` — Importance score
  - `createdAt` — Creation timestamp
  - `updatedAt` — Last update timestamp

## Example Usage

### List All Memories

```json
{
  "name": "list-memories",
  "arguments": {}
}
```

**Response:**
```json
{
  "success": true,
  "filters": {},
  "count": 15,
  "total": 15,
  "memories": [
    {
      "memoryId": "mem_abc123",
      "title": "Nexus Tech Stack",
      "summary": "Monorepo with Turborepo, Cloudflare Workers, D1, R2",
      "type": "project_context",
      "project": "nexus",
      "tags": ["architecture", "tech-stack"],
      "importance": 9,
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T14:00:00Z"
    },
    {
      "memoryId": "mem_def456",
      "title": "Chose Drizzle over Prisma",
      "summary": "Better D1 support, smaller bundle size",
      "type": "decision",
      "project": "nexus",
      "tags": ["database", "orm"],
      "importance": 7,
      "createdAt": "2024-01-08T09:00:00Z",
      "updatedAt": null
    }
  ]
}
```

### Filter by Project

```json
{
  "name": "list-memories",
  "arguments": {
    "project": "nexus",
    "limit": 10
  }
}
```

### Filter by Type

```json
{
  "name": "list-memories",
  "arguments": {
    "type": "decision"
  }
}
```

### Paginate Results

```json
{
  "name": "list-memories",
  "arguments": {
    "limit": 10,
    "offset": 10
  }
}
```

## AI Conversation Example

```
User: What memories do I have stored?

AI: Let me list your stored memories.

[Calls list-memories with limit: 20]

You have 15 memories stored:

**Project Context (4):**
- Nexus Tech Stack (importance: 9)
- Code Conventions (importance: 7)
- API Authentication Flow (importance: 8)
- Database Schema Overview (importance: 7)

**Decisions (6):**
- Chose Drizzle over Prisma
- Using Hono for API framework
- Vector search with Vectorize
- ...and 3 more

**Corrections (3):**
- R2 bucket naming gotcha
- D1 row size limits
- Wrangler dev quirks

**Session Summaries (2):**
- Jan 15: Initial project setup
- Jan 18: Auth implementation

Would you like details on any of these?
```

## Use Cases

1. **Inventory check** — See all stored memories
2. **Browse by project** — Find memories for a specific codebase
3. **Type filtering** — List all decisions or all corrections
4. **Memory management** — Find memories to update or delete

## Notes

- Does not return full content, only summaries
- Use `recall-memories` for semantic search
- Use pagination for large memory collections
- Anonymous users only see global/public memories

## Related Tools

- [recall-memories](/mcp-tools/recall-memories) — Search memories semantically
- [get-project-context](/mcp-tools/get-project-context) — Get all context for a project
- [update-memory](/mcp-tools/update-memory) — Modify a memory
- [delete-memory](/mcp-tools/delete-memory) — Remove a memory
