# Skills API

The Skills API provides access to AI skills - reusable prompts and workflows that enhance AI assistant capabilities.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/skills` | List skills |
| `GET` | `/api/skills/:id` | Get skill details |
| `GET` | `/api/skills/:id/content` | Get raw skill content |
| `POST` | `/api/skills/:id/install` | Track installation |
| `POST` | `/api/skills/:id/use` | Track usage |
| `GET` | `/api/skills/types` | List skill types |
| `GET` | `/api/skills/categories` | List categories |
| `GET` | `/api/skills/sources` | List source repos |
| `GET` | `/api/skills/user/installed` | Get user's installed skills |

## List Skills

```
GET /api/skills
```

Returns a paginated list of available skills.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | — | Search by name or description |
| `type` | string | — | Filter by type |
| `category` | string | — | Filter by category |
| `tag` | string | — | Filter by tag |
| `sourceRepo` | string | — | Filter by source repository |
| `official` | boolean | — | Only official skills |
| `featured` | boolean | — | Only featured skills |
| `limit` | number | 20 | Results per page (max 100) |
| `offset` | number | 0 | Pagination offset |

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/skills?type=generation&limit=10"
```

### Example Response

```json
{
  "skills": [
    {
      "id": "sk_abc123",
      "name": "Code Review",
      "slug": "code-review",
      "description": "Thorough code review with security and performance analysis",
      "sourceUrl": "https://github.com/anthropics/courses/blob/main/skills/code-review.md",
      "sourceRepo": "anthropics/courses",
      "author": "Anthropic",
      "version": "1.0.0",
      "type": "analysis",
      "categories": ["development", "security"],
      "tags": ["code", "review", "security"],
      "format": "markdown",
      "contentPreview": "You are an expert code reviewer...",
      "requiredTools": ["read_file"],
      "requiredMcpServers": ["filesystem"],
      "installCount": 1500,
      "usageCount": 8500,
      "rating": 4.8,
      "isOfficial": true,
      "isFeatured": true,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 85,
  "limit": 10,
  "offset": 0
}
```

## Get Skill

```
GET /api/skills/:id
```

Returns detailed information about a specific skill, including full content.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Skill ID |

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/skills/sk_abc123"
```

### Example Response

```json
{
  "skill": {
    "id": "sk_abc123",
    "name": "Code Review",
    "slug": "code-review",
    "description": "Thorough code review with security and performance analysis",
    "sourceUrl": "https://github.com/anthropics/courses/blob/main/skills/code-review.md",
    "sourceRepo": "anthropics/courses",
    "author": "Anthropic",
    "version": "1.0.0",
    "type": "analysis",
    "categories": ["development", "security"],
    "tags": ["code", "review", "security"],
    "format": "markdown",
    "contentPreview": "You are an expert code reviewer...",
    "r2Key": "skills/sk_abc123.md",
    "requiredTools": ["read_file"],
    "requiredMcpServers": ["filesystem"],
    "installCount": 1500,
    "usageCount": 8500,
    "rating": 4.8,
    "isOfficial": true,
    "isFeatured": true,
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "content": "# Code Review Skill\n\nYou are an expert code reviewer with deep knowledge..."
}
```

## Get Skill Content

```
GET /api/skills/:id/content
```

Returns raw skill content with appropriate content type.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Skill ID |

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/skills/sk_abc123/content"
```

### Response

Returns raw content with `Content-Type` header based on skill format:

- `text/markdown` for Markdown skills
- `application/json` for JSON skills
- `text/yaml` for YAML skills

## Track Installation

```
POST /api/skills/:id/install
```

Records a skill installation. Increments install count and tracks user installation if authenticated.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Skill ID |

### Example Request

```bash
curl -X POST "https://api.nexus.yogan.dev/api/skills/sk_abc123/install" \
  -H "Authorization: Bearer nxs_your_token"
```

### Example Response

```json
{
  "success": true
}
```

## Track Usage

```
POST /api/skills/:id/use
```

Records skill usage. Increments usage count and updates last used timestamp for authenticated users.

### Path Parameters

| Parameter | Description |
|-----------|-------------|
| `id` | Skill ID |

### Example Request

```bash
curl -X POST "https://api.nexus.yogan.dev/api/skills/sk_abc123/use" \
  -H "Authorization: Bearer nxs_your_token"
```

### Example Response

```json
{
  "success": true
}
```

## List Skill Types

```
GET /api/skills/types
```

Returns available skill types.

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/skills/types"
```

### Example Response

```json
{
  "types": [
    { "id": "analysis", "label": "Analysis", "description": "Analyze code, content, or data" },
    { "id": "generation", "label": "Generation", "description": "Generate code, content, or assets" },
    { "id": "transformation", "label": "Transformation", "description": "Transform or convert data" },
    { "id": "integration", "label": "Integration", "description": "Integrate with external services" },
    { "id": "utility", "label": "Utility", "description": "General purpose utilities" }
  ]
}
```

## List Categories

```
GET /api/skills/categories
```

Returns available categories with counts.

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/skills/categories"
```

### Example Response

```json
{
  "categories": [
    { "id": "development", "label": "Development", "count": 25 },
    { "id": "security", "label": "Security", "count": 12 },
    { "id": "documentation", "label": "Documentation", "count": 18 },
    { "id": "testing", "label": "Testing", "count": 15 }
  ]
}
```

## List Source Repositories

```
GET /api/skills/sources
```

Returns source repositories where skills are sourced from.

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/skills/sources"
```

### Example Response

```json
{
  "sources": [
    { "id": "anthropics/courses", "label": "courses", "url": "https://github.com/anthropics/courses" },
    { "id": "vercel-labs/ai-sdk", "label": "ai-sdk", "url": "https://github.com/vercel-labs/ai-sdk" }
  ]
}
```

## Get User's Installed Skills

```
GET /api/skills/user/installed
```

Returns skills installed by the authenticated user. **Requires authentication.**

### Example Request

```bash
curl "https://api.nexus.yogan.dev/api/skills/user/installed" \
  -H "Authorization: Bearer nxs_your_token"
```

### Example Response

```json
{
  "skills": [
    {
      "skillId": "sk_abc123",
      "installedAt": "2024-01-10T15:30:00Z",
      "lastUsedAt": "2024-01-15T10:00:00Z",
      "customConfig": null,
      "skill": {
        "id": "sk_abc123",
        "name": "Code Review",
        "slug": "code-review",
        "description": "Thorough code review with security and performance analysis",
        "type": "analysis",
        "isOfficial": true
      }
    }
  ]
}
```

## Error Responses

### 404 Not Found

```json
{
  "error": "Skill not found"
}
```

### 401 Unauthorized

For protected endpoints:

```json
{
  "error": "Authentication required"
}
```
