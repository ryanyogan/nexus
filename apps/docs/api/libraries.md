# Libraries API

Search and query indexed library documentation.

## List Libraries

```
GET /libraries
```

### Query Parameters

| Parameter  | Type   | Description        |
| ---------- | ------ | ------------------ |
| `category` | string | Filter by category |
| `limit`    | number | Max results (1-50) |
| `offset`   | number | Pagination offset  |

### Response

```json
{
  "data": {
    "libraries": [
      {
        "id": "react",
        "name": "React",
        "description": "A JavaScript library for building user interfaces",
        "snippets": 2341,
        "category": "frontend"
      }
    ],
    "total": 500
  }
}
```

## Get Library

```
GET /libraries/:id
```

### Response

```json
{
  "data": {
    "id": "react",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "version": "18.2.0",
    "snippets": 2341,
    "category": "frontend",
    "sourceUrl": "https://react.dev"
  }
}
```

## Query Documentation

```
POST /libraries/:id/query
```

### Request Body

```json
{
  "query": "useEffect cleanup function",
  "limit": 5,
  "tokens": "full"
}
```

### Response

```json
{
  "data": {
    "results": [
      {
        "title": "Cleaning up Effects",
        "content": "Return a cleanup function...",
        "source": "react.dev/reference/react/useEffect",
        "relevance": 0.95
      }
    ]
  }
}
```
