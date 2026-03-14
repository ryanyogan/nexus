# REST API Overview

The Nexus REST API provides direct access to documentation search, MCP server registry, skills, and memory features outside of the MCP protocol.

## Base URL

```
https://api.nexus.yogan.dev
```

All API endpoints are relative to this base URL.

## API Endpoints

| Resource | Description |
|----------|-------------|
| [Libraries](/api/libraries) | Search and query indexed documentation |
| [Servers](/api/servers) | Browse and configure MCP servers |
| [Skills](/api/skills) | Discover and install AI skills |
| [Memory](/api/memory) | Store and retrieve persistent memories |

## Request Format

All requests should use JSON for request bodies:

```bash
curl -X POST https://api.nexus.yogan.dev/api/libraries/search \
  -H "Content-Type: application/json" \
  -d '{"query": "authentication", "libraryId": "nextjs"}'
```

## Response Format

All responses return JSON with consistent structure:

```json
{
  "data": { ... },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 100,
    "hasMore": true
  }
}
```

Error responses follow a standard format:

```json
{
  "error": "Error type",
  "message": "Human-readable error description"
}
```

## Authentication

Most read endpoints are public. Write operations and higher rate limits require authentication.

See [Authentication](/api/authentication) for details on API keys and authentication methods.

## Rate Limiting

All endpoints are rate-limited. Authenticated requests receive higher limits.

See [Rate Limits](/api/rate-limits) for details on limits and headers.

## HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | Success |
| `400` | Bad request - invalid parameters |
| `401` | Unauthorized - authentication required |
| `403` | Forbidden - insufficient permissions |
| `404` | Not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

## CORS

The API supports CORS for browser-based applications from approved origins:

- `https://nexus.yogan.dev`
- `https://code.nexus.yogan.dev`
- `http://localhost:3000` (development)

## Versioning

The API is currently at v1. Breaking changes will be communicated in advance and versioned appropriately.
