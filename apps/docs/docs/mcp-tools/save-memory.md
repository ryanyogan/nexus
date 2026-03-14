# save-memory

Store a memory for later retrieval. Memories persist across sessions and can be searched semantically.

## Description

The `save-memory` tool creates persistent memories that your AI can recall in future sessions. Use it to store project context, architectural decisions, session summaries, or lessons learned. Memories are searchable using natural language through the `recall-memories` tool.

:::info Authentication
This tool requires authentication for writing. Anonymous users cannot create memories.
:::

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | The full content of the memory to store |
| `title` | string | Yes | A short, descriptive title (max 100 chars) |
| `type` | string | Yes | Memory type (see types below) |
| `tags` | array | No | Tags for categorization (e.g., `['auth', 'cloudflare']`) |
| `project` | string | No | Project name (e.g., 'nexus', 'my-app') |
| `summary` | string | No | Short summary for listing (max 200 chars) |
| `importance` | number | No | Importance score 1-10 (default 5). Higher = more relevant in searches. |

### Memory Types

| Type | Description | Use For |
|------|-------------|---------|
| `project_context` | Architecture, tech stack, conventions | Project setup, coding standards |
| `session_summary` | What was accomplished | End-of-session recaps |
| `decision` | Architectural decisions with rationale | Important choices with reasoning |
| `correction` | Lessons learned, things to avoid | Mistakes to remember, gotchas |

## Response

Returns an object containing:

- `success` — Whether the memory was saved
- `memoryId` — Unique identifier for the memory
- `message` — Confirmation message
- `memory` — The saved memory object

## Example Usage

### Save Project Context

```json
{
  "name": "save-memory",
  "arguments": {
    "title": "Nexus Authentication Architecture",
    "content": "The Nexus project uses Better Auth with GitHub OAuth. Sessions are stored in D1 database with 30-day expiry. The auth middleware extracts user from session cookie and attaches to request context. API routes requiring auth should use the authMiddleware.",
    "type": "project_context",
    "project": "nexus",
    "tags": ["auth", "architecture"],
    "importance": 8
  }
}
```

**Response:**
```json
{
  "success": true,
  "memoryId": "mem_abc123xyz",
  "message": "Memory saved successfully",
  "memory": {
    "id": "mem_abc123xyz",
    "title": "Nexus Authentication Architecture",
    "type": "project_context",
    "project": "nexus",
    "tags": ["auth", "architecture"],
    "importance": 8,
    "createdAt": "2024-01-20T15:30:00Z"
  }
}
```

### Save a Decision

```json
{
  "name": "save-memory",
  "arguments": {
    "title": "Chose Drizzle over Prisma",
    "content": "Decision: Using Drizzle ORM instead of Prisma.\n\nRationale:\n1. Better Cloudflare D1 support\n2. Smaller bundle size for Workers\n3. TypeScript-first with no code generation\n4. Simpler migration workflow\n\nTradeoffs accepted:\n- Less mature ecosystem\n- Fewer learning resources",
    "type": "decision",
    "project": "nexus",
    "tags": ["database", "orm", "drizzle"],
    "importance": 7
  }
}
```

### Save a Correction

```json
{
  "name": "save-memory",
  "arguments": {
    "title": "R2 bucket names must be lowercase",
    "content": "Learned the hard way: R2 bucket names must be lowercase and can't contain underscores. Got cryptic errors until changed DOCS_BUCKET to docs-bucket. Always use kebab-case for Cloudflare resources.",
    "type": "correction",
    "project": "nexus",
    "tags": ["cloudflare", "r2", "gotcha"],
    "importance": 6
  }
}
```

## AI Conversation Example

```
User: We just decided to use Hono instead of Express. Save that decision.

AI: I'll save this architectural decision for future reference.

[Calls save-memory with:
  title: "Chose Hono over Express"
  content: "Decision: Using Hono as the web framework instead of Express.

  Rationale:
  - Native Cloudflare Workers support
  - TypeScript-first design
  - Smaller bundle size
  - Built-in middleware patterns

  Migration notes:
  - app.get() syntax is similar
  - Middleware uses c.next() instead of next()
  - Use c.json() instead of res.json()"
  type: "decision"
  project: "my-project"
  tags: ["framework", "hono", "architecture"]]

Saved! I've recorded the Hono decision with the rationale. This will be available 
in future sessions when working on this project.
```

## Best Practices

1. **Be descriptive** — Include context that will make sense later
2. **Use appropriate types** — Choose the type that best fits the content
3. **Tag consistently** — Use consistent tag names across memories
4. **Set importance wisely** — Reserve high importance (8-10) for critical info
5. **Include rationale** — For decisions, explain the "why" not just the "what"

## Notes

- Memories are stored with vector embeddings for semantic search
- Content can include code blocks, lists, and markdown
- Importance affects ranking in search results
- Project names help organize memories by codebase

## Related Tools

- [recall-memories](/mcp-tools/recall-memories) — Search memories semantically
- [get-project-context](/mcp-tools/get-project-context) — Get all memories for a project
- [update-memory](/mcp-tools/update-memory) — Modify existing memories
- [delete-memory](/mcp-tools/delete-memory) — Remove memories
