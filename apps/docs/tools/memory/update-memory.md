# update-memory

Update an existing memory. Can modify content, title, tags, importance, or summary.

## Usage

```
Tool: update-memory
Parameters:
  - memoryId (required): ID of memory to update
  - title (optional): New title
  - content (optional): New content
  - tags (optional): New tags
  - importance (optional): New importance (1-10)
  - summary (optional): New summary
```

## Example

**Input:**
```json
{
  "memoryId": "mem_abc123",
  "content": "Updated: Using NextAuth.js v5 with database sessions",
  "importance": 9
}
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `memoryId` | string | Yes | Memory ID to update |
| `title` | string | No | New title |
| `content` | string | No | New content (regenerates embedding) |
| `tags` | string[] | No | New tags |
| `importance` | number | No | New importance 1-10 |
| `summary` | string | No | New summary |

## Authentication

This tool requires authentication.
