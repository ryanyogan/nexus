# Memory API

The Memory API provides persistent storage for AI context, decisions, and learnings. Access memories via the MCP protocol tools or directly through the REST API.

:::info MCP Recommended
For AI assistants, use the [MCP tools](/mcp-tools/) (`save-memory`, `recall-memories`, etc.) which provide a more natural interface. The REST API is useful for administrative access and integrations.
:::

## MCP Memory Tools

The primary interface for memory operations is through MCP tools:

| Tool | Description |
|------|-------------|
| `save-memory` | Store a new memory |
| `recall-memories` | Semantic search for memories |
| `get-project-context` | Get all context for a project |
| `list-memories` | Browse memories with filtering |
| `update-memory` | Modify an existing memory |
| `delete-memory` | Permanently delete a memory |

## Memory Types

Memories are categorized by type:

| Type | Description | Use Case |
|------|-------------|----------|
| `project_context` | Architecture, tech stack, conventions | "This project uses Next.js with App Router" |
| `session_summary` | What was accomplished in a session | "Implemented OAuth login with GitHub" |
| `decision` | Architectural decisions with rationale | "Using Drizzle ORM because of type safety" |
| `correction` | Lessons learned, things to avoid | "Don't use deprecated API routes" |

## Save Memory

Save a new memory via MCP:

```json
{
  "name": "save-memory",
  "arguments": {
    "content": "This project uses Hono as the API framework on Cloudflare Workers. Authentication is handled by Better Auth with GitHub OAuth. The database is Cloudflare D1 with Drizzle ORM.",
    "title": "Nexus Tech Stack",
    "type": "project_context",
    "project": "nexus",
    "tags": ["architecture", "cloudflare", "hono"],
    "importance": 8
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Full content of the memory |
| `title` | string | Yes | Short descriptive title (max 100 chars) |
| `type` | string | Yes | Memory type (see above) |
| `project` | string | No | Project name for grouping |
| `tags` | string[] | No | Tags for categorization |
| `summary` | string | No | Brief summary (max 200 chars) |
| `importance` | number | No | Importance score 1-10 (default 5) |

### Response

```json
{
  "success": true,
  "memoryId": "mem_abc123",
  "message": "Memory saved successfully"
}
```

## Recall Memories

Search memories using semantic search:

```json
{
  "name": "recall-memories",
  "arguments": {
    "query": "authentication pattern",
    "project": "nexus",
    "limit": 5
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |
| `type` | string | No | Filter by memory type |
| `project` | string | No | Filter by project |
| `tags` | string[] | No | Filter by tags (all must match) |
| `limit` | number | No | Max results (1-10, default 5) |

### Response

```json
{
  "success": true,
  "query": "authentication pattern",
  "memories": [
    {
      "memoryId": "mem_abc123",
      "title": "Auth Implementation",
      "content": "JWT tokens with refresh rotation. Access tokens expire in 15 minutes...",
      "type": "project_context",
      "project": "nexus",
      "tags": ["auth", "jwt"],
      "importance": 8,
      "relevanceScore": 0.92,
      "createdAt": "2024-01-10T15:30:00Z"
    }
  ],
  "hint": "Found 1 relevant memory"
}
```

## Get Project Context

Retrieve all stored context for a project:

```json
{
  "name": "get-project-context",
  "arguments": {
    "project": "nexus",
    "limit": 5
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `project` | string | Yes | Project name |
| `includeTypes` | string[] | No | Filter to specific types |
| `limit` | number | No | Max memories per type (default 5) |

### Response

```json
{
  "success": true,
  "project": "nexus",
  "context": {
    "project_context": [
      {
        "memoryId": "mem_abc123",
        "title": "Nexus Tech Stack",
        "content": "This project uses Hono...",
        "importance": 8,
        "createdAt": "2024-01-10T15:30:00Z"
      }
    ],
    "decision": [
      {
        "memoryId": "mem_def456",
        "title": "Use Drizzle ORM",
        "content": "Chose Drizzle over Prisma for type safety...",
        "importance": 7,
        "createdAt": "2024-01-08T10:00:00Z"
      }
    ],
    "correction": [],
    "session_summary": []
  },
  "totalMemories": 2
}
```

## List Memories

Browse memories with filtering:

```json
{
  "name": "list-memories",
  "arguments": {
    "project": "nexus",
    "type": "decision",
    "limit": 20
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Filter by memory type |
| `project` | string | No | Filter by project |
| `limit` | number | No | Max results (1-50, default 20) |
| `offset` | number | No | Pagination offset |

### Response

```json
{
  "success": true,
  "memories": [
    {
      "memoryId": "mem_abc123",
      "title": "Use Drizzle ORM",
      "summary": "Chose Drizzle over Prisma for type safety",
      "type": "decision",
      "project": "nexus",
      "importance": 7,
      "createdAt": "2024-01-08T10:00:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

## Update Memory

Modify an existing memory:

```json
{
  "name": "update-memory",
  "arguments": {
    "memoryId": "mem_abc123",
    "content": "Updated content...",
    "importance": 9
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `memoryId` | string | Yes | ID of memory to update |
| `content` | string | No | New content (regenerates embedding) |
| `title` | string | No | New title |
| `tags` | string[] | No | New tags |
| `importance` | number | No | New importance (1-10) |
| `summary` | string | No | New summary |

### Response

```json
{
  "success": true,
  "message": "Memory updated successfully"
}
```

## Delete Memory

Permanently delete a memory:

```json
{
  "name": "delete-memory",
  "arguments": {
    "memoryId": "mem_abc123"
  }
}
```

### Response

```json
{
  "success": true,
  "message": "Memory deleted successfully"
}
```

## Best Practices

### 1. Use Descriptive Titles

Good titles make memories easier to find and understand:

```
"JWT Auth with Refresh Tokens"   // Good
"auth"                            // Too vague
```

### 2. Include Rationale in Decisions

Explain *why*, not just *what*:

```
"Using Hono over Express because it's optimized for Cloudflare Workers 
and has better TypeScript support. Express middleware doesn't work well 
in the Workers environment."
```

### 3. Tag Consistently

Use consistent tag naming across projects:

```json
["auth", "cloudflare", "security"]  // Good
["Auth", "cf", "SEC"]               // Inconsistent
```

### 4. Set Appropriate Importance

High importance (8-10) for:
- Core architectural decisions
- Security-critical patterns
- Frequently referenced conventions

Medium importance (5-7) for:
- Implementation details
- Session summaries

Low importance (1-4) for:
- Temporary notes
- Minor corrections

### 5. Use Project Context at Session Start

Call `get-project-context` when starting work on a project:

```json
{
  "name": "get-project-context",
  "arguments": {
    "project": "nexus"
  }
}
```

This loads all relevant context in one call, saving tokens on re-explanation.
