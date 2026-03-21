# list-memories

Browse stored memories with filtering. Returns summaries without full content.

## Example Prompts

> "Show me all the memories for this project"

> "List the architectural decisions we've saved"

> "What memories do you have stored?"

> "Show me recent session summaries"

## Usage

```
Tool: list-memories
Parameters:
  - project (optional): Filter by project name
  - type (optional): Filter by memory type
  - limit (optional): Max results (1-50, default 20)
  - offset (optional): Pagination offset
```

## Example

**Input:**

```json
{
  "project": "my-saas",
  "type": "decision",
  "limit": 10
}
```

**Output:**

```json
{
  "memories": [
    {
      "id": "mem_abc123",
      "title": "Authentication Architecture",
      "type": "decision",
      "summary": "NextAuth.js with Prisma adapter",
      "created": "2024-03-15T10:30:00Z"
    }
  ],
  "total": 15,
  "hasMore": true
}
```

## Parameters

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| `project` | string | No       | Filter by project            |
| `type`    | string | No       | Filter by memory type        |
| `limit`   | number | No       | Max results 1-50, default 20 |
| `offset`  | number | No       | Pagination offset            |
