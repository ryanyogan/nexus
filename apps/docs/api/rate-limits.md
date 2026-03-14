# Rate Limits

The API enforces rate limits to ensure fair usage.

## Limits by Plan

| Plan | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 20 | 1,000 |
| Pro | 100 | 10,000 |
| Enterprise | Unlimited | Unlimited |

## Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1699488000
```

## Exceeding Limits

When you exceed the rate limit, you'll receive:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 60 seconds."
  }
}
```

HTTP Status: `429 Too Many Requests`

## Best Practices

- Cache responses when possible
- Use batch endpoints when available
- Implement exponential backoff for retries
