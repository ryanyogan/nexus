# get-project-context

Get all stored context for a specific project. Returns project architecture, conventions, recent decisions, and lessons learned.

## Description

The `get-project-context` tool retrieves all memories associated with a project, organized by type. Use this at the start of a session to quickly understand a project's architecture, conventions, and important decisions. It's more efficient than multiple `recall-memories` calls when you need comprehensive context.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project` | string | Yes | Project name (e.g., 'nexus', 'my-app') |
| `includeTypes` | array | No | Filter to specific types (default: all types) |
| `limit` | number | No | Maximum memories per type (default 5) |

### Memory Types

- `project_context` — Architecture, tech stack, conventions
- `session_summary` — Past session recaps
- `decision` — Architectural decisions with rationale
- `correction` — Lessons learned, things to avoid

## Response

Returns an object containing memories organized by type:

- `success` — Whether the request succeeded
- `project` — Project name
- `totalMemories` — Total count across all types
- `context` — Object with memories by type:
  - `project_context` — Array of context memories
  - `session_summary` — Array of session summaries
  - `decision` — Array of decisions
  - `correction` — Array of corrections/lessons
- `summary` — Brief overview of what's available

## Example Usage

### Get All Context

```json
{
  "name": "get-project-context",
  "arguments": {
    "project": "nexus"
  }
}
```

**Response:**
```json
{
  "success": true,
  "project": "nexus",
  "totalMemories": 12,
  "context": {
    "project_context": [
      {
        "memoryId": "mem_001",
        "title": "Nexus Tech Stack",
        "content": "Nexus is a monorepo using:\n- Turborepo for build orchestration\n- Cloudflare Workers for API\n- D1 for database\n- R2 for object storage...",
        "importance": 9,
        "createdAt": "2024-01-10T10:00:00Z"
      },
      {
        "memoryId": "mem_002", 
        "title": "Code Conventions",
        "content": "- Use Biome for formatting\n- Prefer const over let\n- Always use TypeScript strict mode...",
        "importance": 7,
        "createdAt": "2024-01-12T11:00:00Z"
      }
    ],
    "decision": [
      {
        "memoryId": "mem_003",
        "title": "Chose Drizzle over Prisma",
        "content": "Decision: Using Drizzle ORM instead of Prisma...",
        "importance": 7,
        "createdAt": "2024-01-08T09:00:00Z"
      }
    ],
    "correction": [
      {
        "memoryId": "mem_004",
        "title": "R2 bucket naming gotcha",
        "content": "R2 bucket names must be lowercase and use kebab-case...",
        "importance": 6,
        "createdAt": "2024-01-14T16:00:00Z"
      }
    ],
    "session_summary": []
  },
  "summary": "Project 'nexus' has 2 context entries, 1 decision, 1 correction, and 0 session summaries."
}
```

### Get Only Architecture and Decisions

```json
{
  "name": "get-project-context",
  "arguments": {
    "project": "nexus",
    "includeTypes": ["project_context", "decision"],
    "limit": 3
  }
}
```

## AI Conversation Example

```
User: I'm starting work on the nexus project. What do I need to know?

AI: Let me load the project context.

[Calls get-project-context with project: "nexus"]

Here's what I know about the Nexus project:

**Tech Stack:**
- Turborepo monorepo
- Cloudflare Workers (API)
- D1 database with Drizzle ORM
- R2 for documentation storage
- Better Auth for authentication

**Key Decisions:**
- Using Drizzle over Prisma for D1 compatibility
- Hono framework for Workers compatibility
- Vector search via Cloudflare Vectorize

**Watch Out For:**
- R2 bucket names must be lowercase kebab-case
- D1 has 1MB row size limit for embeddings

**Conventions:**
- Biome for formatting
- TypeScript strict mode
- Conventional commits

What would you like to work on?
```

## Use Cases

1. **Session start** — Load full project context before coding
2. **Onboarding** — Understand a project's architecture quickly
3. **Context refresh** — Remind yourself of decisions and conventions
4. **Handoff preparation** — Gather context to share with others

## Notes

- Memories are sorted by importance within each type
- Use `includeTypes` to reduce response size if you only need specific context
- Empty arrays are returned for types with no memories
- Works best when memories are well-organized with consistent project names

## Related Tools

- [save-memory](/mcp-tools/save-memory) — Store new project context
- [recall-memories](/mcp-tools/recall-memories) — Search for specific memories
- [list-memories](/mcp-tools/list-memories) — Browse all memories
