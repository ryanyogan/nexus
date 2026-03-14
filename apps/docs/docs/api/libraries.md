# Libraries API

The Libraries API provides access to indexed documentation for programming libraries and frameworks.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/libraries` | List libraries |
| `GET` | `/api/libraries/:id` | Get library details |
| `POST` | `/api/libraries/search` | Semantic search |
| `GET` | `/api/libraries/:id/chunks` | Get documentation chunks |
| `GET` | `/api/libraries/meta/categories` | List categories |

## List Libraries

```
GET /api/libraries
```

Returns a paginated list of indexed libraries.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `category` | string | — | Filter by category |
| `search` | string | — | Search by name |
| `status` | string | — | Filter by index status: `pending`, `indexing`, `indexed`, `failed` |
| `featured` | boolean | — | Only featured libraries |
| `limit` | number | 20 | Results per page (max 500) |
| `offset` | number | 0 | Pagination offset |

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/libraries?category=frontend&limit=10"
```

### Example Response

```json
{
  "libraries": [
    {
      "id": "react",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "categories": ["frontend"],
      "version": "18.2.0",
      "iconUrl": "https://...",
      "homepageUrl": "https://react.dev",
      "repositoryUrl": "https://github.com/facebook/react",
      "totalChunks": 1250,
      "totalTokens": 450000,
      "indexStatus": "indexed",
      "isFeatured": true,
      "lastIndexedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 150,
    "hasMore": true
  }
}
```

## Get Library

```
GET /api/libraries/:id
```

Returns detailed information about a specific library.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Library ID (e.g., `react`, `nextjs`) |

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/libraries/nextjs"
```

### Example Response

```json
{
  "library": {
    "id": "nextjs",
    "name": "Next.js",
    "description": "The React Framework for the Web",
    "categories": ["frontend", "fullstack"],
    "version": "14.0.0",
    "sourceType": "github",
    "sourceUrl": "https://github.com/vercel/next.js",
    "homepageUrl": "https://nextjs.org",
    "repositoryUrl": "https://github.com/vercel/next.js",
    "totalChunks": 2500,
    "totalTokens": 890000,
    "indexStatus": "indexed",
    "isFeatured": true,
    "isActive": true,
    "lastIndexedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "stats": {
    "totalQueries": 15420,
    "totalChunkHits": 45000
  }
}
```

## Search Documentation

```
POST /api/libraries/search
```

Performs semantic search across indexed documentation.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | Yes | Search query (1-1000 chars) |
| `libraryId` | string | No | Limit search to specific library |
| `limit` | number | No | Results to return (1-20, default 5) |

### Example Request

```bash
curl -X POST "https://api.nexus.yogan.dev/api/libraries/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "how to use server components",
    "libraryId": "nextjs",
    "limit": 5
  }'
```

### Example Response

```json
{
  "results": [
    {
      "id": "chunk_abc123",
      "libraryId": "nextjs",
      "title": "Server Components",
      "content": "React Server Components allow you to render components on the server...",
      "contentType": "guide",
      "sourceFile": "docs/app/building-your-application/rendering/server-components.md",
      "score": 0.92
    }
  ],
  "query": "how to use server components",
  "libraryId": "nextjs"
}
```

## Get Documentation Chunks

```
GET /api/libraries/:id/chunks
```

Returns raw documentation chunks for a library.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Library ID |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 20 | Results per page (max 100) |
| `offset` | number | 0 | Pagination offset |

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/libraries/react/chunks?limit=5"
```

### Example Response

```json
{
  "chunks": [
    {
      "id": "chunk_xyz789",
      "title": "useState Hook",
      "contentType": "api-reference",
      "tokenCount": 850,
      "sourceFile": "docs/reference/react/useState.md",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 5,
    "offset": 0,
    "total": 1250,
    "hasMore": true
  }
}
```

## List Categories

```
GET /api/libraries/meta/categories
```

Returns available library categories.

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/libraries/meta/categories"
```

### Example Response

```json
{
  "categories": [
    { "id": "frontend", "label": "Frontend", "icon": "layout" },
    { "id": "backend", "label": "Backend", "icon": "server" },
    { "id": "fullstack", "label": "Full Stack", "icon": "layers" },
    { "id": "database", "label": "Database", "icon": "database" },
    { "id": "cloud", "label": "Cloud", "icon": "cloud" },
    { "id": "devops", "label": "DevOps", "icon": "settings" },
    { "id": "ai", "label": "AI / ML", "icon": "brain" },
    { "id": "testing", "label": "Testing", "icon": "check-circle" },
    { "id": "mobile", "label": "Mobile", "icon": "smartphone" },
    { "id": "utilities", "label": "Utilities", "icon": "wrench" }
  ]
}
```

## Error Responses

### 404 Not Found

```json
{
  "error": "Library not found"
}
```

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "too_small",
        "minimum": 1,
        "path": ["query"],
        "message": "String must contain at least 1 character(s)"
      }
    ]
  }
}
```
