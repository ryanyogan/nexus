# Skills API

Browse skill templates.

## List Skills

```
GET /skills
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category |
| `q` | string | Search query |
| `limit` | number | Max results |

### Response

```json
{
  "data": {
    "skills": [
      {
        "id": "code-review",
        "name": "Code Review",
        "description": "Systematic code review workflow",
        "category": "development"
      }
    ]
  }
}
```

## Get Skill

```
GET /skills/:id
```

### Response

```json
{
  "data": {
    "id": "code-review",
    "name": "Code Review",
    "description": "Systematic code review workflow",
    "content": "...",
    "category": "development",
    "tags": ["review", "quality"]
  }
}
```
