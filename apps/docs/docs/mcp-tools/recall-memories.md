# recall-memories

Search for relevant memories using semantic search. Returns memories that match the query conceptually, not just by keywords.

## Description

The `recall-memories` tool performs vector-based semantic search across stored memories. It understands the meaning of your query and finds relevant memories even when exact terms don't match. Use this to retrieve project context, past decisions, or lessons learned.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | What to search for (natural language) |
| `type` | string | No | Filter by memory type: `project_context`, `session_summary`, `decision`, `correction` |
| `project` | string | No | Filter by project name |
| `tags` | array | No | Filter by tags (all must match) |
| `limit` | number | No | Maximum results (1-10, default 5) |

## Response

Returns an object containing:

- `success` — Whether the search succeeded
- `query` — The search query
- `filters` — Applied filters
- `resultCount` — Number of results
- `memories` — Array of matching memories:
  - `memoryId` — Unique identifier
  - `title` — Memory title
  - `content` — Full content
  - `type` — Memory type
  - `project` — Associated project
  - `tags` — Memory tags
  - `importance` — Importance score
  - `relevanceScore` — How well it matches (0-1)
  - `createdAt` — Creation timestamp

## Example Usage

### Basic Search

```json
{
  "name": "recall-memories",
  "arguments": {
    "query": "how does authentication work in this project"
  }
}
```

**Response:**
```json
{
  "success": true,
  "query": "how does authentication work in this project",
  "filters": {},
  "resultCount": 3,
  "memories": [
    {
      "memoryId": "mem_abc123",
      "title": "Nexus Authentication Architecture",
      "content": "The Nexus project uses Better Auth with GitHub OAuth...",
      "type": "project_context",
      "project": "nexus",
      "tags": ["auth", "architecture"],
      "importance": 8,
      "relevanceScore": 0.92,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "memoryId": "mem_def456",
      "title": "Session handling decision",
      "content": "Decided to use httpOnly cookies instead of localStorage...",
      "type": "decision",
      "project": "nexus",
      "tags": ["auth", "security"],
      "importance": 7,
      "relevanceScore": 0.78,
      "createdAt": "2024-01-10T14:30:00Z"
    }
  ]
}
```

### Search with Filters

```json
{
  "name": "recall-memories",
  "arguments": {
    "query": "database schema patterns",
    "project": "nexus",
    "type": "decision",
    "limit": 3
  }
}
```

### Search by Tags

```json
{
  "name": "recall-memories",
  "arguments": {
    "query": "common mistakes and gotchas",
    "type": "correction",
    "tags": ["cloudflare"]
  }
}
```

## AI Conversation Example

```
User: What did we decide about the caching strategy?

AI: Let me search for any decisions about caching.

[Calls recall-memories with query: "caching strategy decisions"]

Found 2 relevant memories:

1. **Cache-Control Headers Decision** (importance: 8)
   Decided to use stale-while-revalidate pattern for API responses.
   - Static assets: 1 year cache
   - API responses: 60s with SWR
   - User-specific data: no-cache
   
2. **KV vs D1 for Caching** (importance: 6)
   Using KV for session caching because of:
   - Lower latency for reads
   - Automatic global distribution
   - No cold start issues

Would you like more details on either decision?
```

## Use Cases

1. **Session start** — Recall project context before starting work
2. **Decision lookup** — Find past architectural decisions
3. **Avoid mistakes** — Search for corrections/lessons learned
4. **Context building** — Gather relevant information for a task

## Query Tips

**Good queries:**
- "How does error handling work in this codebase"
- "Why did we choose this database"
- "Common issues with the deployment process"

**Poor queries:**
- "stuff" (too vague)
- "code" (not specific enough)

## Notes

- Semantic search finds conceptually similar content, not just keyword matches
- Results are ranked by relevance score and importance
- Higher importance memories rank higher when relevance is similar
- Anonymous users can only see global/public memories

## Related Tools

- [save-memory](/mcp-tools/save-memory) — Store new memories
- [get-project-context](/mcp-tools/get-project-context) — Get all context for a project
- [list-memories](/mcp-tools/list-memories) — Browse memories with filtering
