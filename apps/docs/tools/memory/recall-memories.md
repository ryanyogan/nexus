# recall-memories

Search for relevant memories using semantic search. Returns memories that match conceptually, not just by keywords.

## Usage

```
Tool: recall-memories
Parameters:
  - query (required): What to search for (natural language)
  - project (optional): Filter by project name
  - type (optional): Filter by memory type
  - tags (optional): Filter by tags (all must match)
  - limit (optional): Max results (1-10, default 5)
```

## Example

**Input:**
```json
{
  "query": "how do we handle authentication",
  "project": "my-saas",
  "limit": 3
}
```

**Output:**
```json
{
  "memories": [
    {
      "id": "mem_abc123",
      "title": "Authentication Architecture",
      "content": "Using NextAuth.js with Prisma adapter...",
      "type": "decision",
      "relevance": 0.92
    }
  ]
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Natural language search query |
| `project` | string | No | Filter to specific project |
| `type` | string | No | Filter by memory type |
| `tags` | string[] | No | Filter by tags |
| `limit` | number | No | Max results 1-10, default 5 |

## Returns

Array of matching memories with relevance scores.
