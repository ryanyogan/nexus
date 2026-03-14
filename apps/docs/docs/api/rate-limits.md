# Rate Limits

The Nexus API enforces rate limits to ensure fair usage and protect service availability.

## Rate Limit Tiers

| Authentication | Limit | Window |
|----------------|-------|--------|
| Anonymous | 20 requests | per minute |
| Authenticated User | 100 requests | per minute |
| API Token | 200 requests | per minute |

MCP protocol endpoints (`/mcp`) have the same tiered limits.

## Rate Limit Headers

Responses include headers to help you track your usage:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

## Exceeding Rate Limits

When you exceed the rate limit, the API returns a `429 Too Many Requests` response:

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please slow down.",
  "retryAfter": 60
}
```

The `retryAfter` field indicates seconds to wait before retrying.

### MCP Rate Limit Response

MCP endpoints return rate limit errors in JSON-RPC format:

```json
{
  "jsonrpc": "2.0",
  "id": null,
  "error": {
    "code": -32000,
    "message": "Rate limit exceeded. Please slow down.",
    "data": {
      "retryAfter": 60,
      "authType": "anonymous",
      "hint": "Sign in or use an API token for higher rate limits."
    }
  }
}
```

## Best Practices

### 1. Implement Exponential Backoff

When rate limited, wait and retry with increasing delays:

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000 * (i + 1)));
      continue;
    }
    
    return response;
  }
  throw new Error('Max retries exceeded');
}
```

### 2. Cache Responses

Many responses can be cached to reduce API calls:

```typescript
const cache = new Map<string, { data: any; expires: number }>();

async function cachedFetch(url: string) {
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  // Cache for 5 minutes
  cache.set(url, { data, expires: Date.now() + 5 * 60 * 1000 });
  return data;
}
```

### 3. Batch Requests

When possible, use endpoints that return multiple items:

```bash
# Instead of making 10 requests:
# GET /api/libraries/react
# GET /api/libraries/nextjs
# ...

# Use the list endpoint with search:
GET /api/libraries?search=react&limit=10
```

### 4. Monitor Usage

Track the rate limit headers to avoid hitting limits:

```typescript
function checkRateLimits(response: Response) {
  const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
  const limit = parseInt(response.headers.get('X-RateLimit-Limit') || '100');
  
  if (remaining < limit * 0.1) {
    console.warn(`Low rate limit: ${remaining}/${limit} remaining`);
  }
}
```

### 5. Authenticate for Higher Limits

If you need more requests, authenticate with an API token:

```bash
curl https://api.nexus.yogan.dev/api/libraries \
  -H "Authorization: Bearer nxs_your_token_here"
```

## Rate Limit by Endpoint

Different endpoints may have additional specific limits:

| Endpoint | Additional Limits |
|----------|------------------|
| `POST /api/libraries/search` | Standard tier limits |
| `POST /mcp` (tool calls) | Standard tier limits per tool call |
| `POST /api/submissions` | 10 per hour |
| `POST /api/server-submissions` | 10 per hour |

## Requesting Higher Limits

For high-volume applications that need higher limits, contact us with your use case. Include:

- Your application name and description
- Expected request volume
- Which endpoints you'll use most
