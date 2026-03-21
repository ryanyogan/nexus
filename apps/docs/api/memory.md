# Memory API

Store and retrieve persistent memories.

## List Memories

```
GET /memories
```

### Query Parameters

| Parameter | Type   | Description       |
| --------- | ------ | ----------------- |
| `project` | string | Filter by project |
| `type`    | string | Filter by type    |
| `limit`   | number | Max results       |
| `offset`  | number | Pagination        |

### Response

```json
{
  "data": {
    "memories": [
      {
        "id": "mem_abc123",
        "title": "Project Architecture",
        "type": "project_context",
        "project": "my-app",
        "createdAt": "2024-03-15T10:00:00Z"
      }
    ],
    "total": 15
  }
}
```

## Create Memory

```
POST /memories
```

**Requires authentication**

### Request Body

```json
{
  "title": "Authentication Decision",
  "content": "Using NextAuth.js with Prisma adapter",
  "type": "decision",
  "project": "my-app",
  "tags": ["auth", "security"],
  "importance": 8
}
```

## Search Memories

```
POST /memories/search
```

### Request Body

```json
{
  "query": "how do we handle authentication",
  "project": "my-app",
  "limit": 5
}
```

## Update Memory

```
PATCH /memories/:id
```

**Requires authentication**

## Delete Memory

```
DELETE /memories/:id
```

**Requires authentication**
