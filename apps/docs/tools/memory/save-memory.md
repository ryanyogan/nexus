# save-memory

Store a memory for later retrieval. Memories persist across sessions and can be searched semantically.

## Example Prompts

> "Remember that this project uses TypeScript strict mode and Tailwind CSS"

> "Save this as a project decision: we're using Drizzle ORM because it has better TypeScript support than Prisma"

> "Make a note that we should never use `any` types in this codebase"

> "Remember this lesson: always add indexes for foreign keys in PostgreSQL"

> "Save the current project context for my-saas project"

## Usage

```
Tool: save-memory
Parameters:
  - title (required): Short, descriptive title (max 100 chars)
  - content (required): The full content to store
  - type (required): Memory type
  - project (optional): Project name
  - tags (optional): Tags for categorization
  - importance (optional): Importance score 1-10
  - summary (optional): Short summary (max 200 chars)
```

## Example

**Input:**

```json
{
  "title": "Authentication Architecture",
  "content": "Using NextAuth.js with Prisma adapter. JWT sessions stored in HttpOnly cookies. Refresh tokens in database with 30-day expiry.",
  "type": "decision",
  "project": "my-saas",
  "tags": ["auth", "security"],
  "importance": 8
}
```

**Output:**

```json
{
  "id": "mem_abc123",
  "title": "Authentication Architecture",
  "created": "2024-03-15T10:30:00Z"
}
```

## Parameters

| Parameter    | Type     | Required | Description                   |
| ------------ | -------- | -------- | ----------------------------- |
| `title`      | string   | Yes      | Short title (max 100 chars)   |
| `content`    | string   | Yes      | Full content to store         |
| `type`       | string   | Yes      | Memory type (see below)       |
| `project`    | string   | No       | Project name for organization |
| `tags`       | string[] | No       | Tags for filtering            |
| `importance` | number   | No       | Score 1-10 (default 5)        |
| `summary`    | string   | No       | Brief summary (max 200 chars) |

## Memory Types

| Type              | Use For                                |
| ----------------- | -------------------------------------- |
| `project_context` | Tech stack, architecture, conventions  |
| `session_summary` | What was accomplished in a session     |
| `decision`        | Architectural decisions with rationale |
| `correction`      | Lessons learned, things to avoid       |

## Authentication

This tool requires authentication. Run `nexus auth login` first.
