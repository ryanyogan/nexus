# Authentication

Authentication is required for memory write operations.

## Getting a Token

### Via CLI

```bash
nexus auth login
nexus auth token
```

### Via OAuth

1. Navigate to `https://nexus.yogan.dev/auth`
2. Complete the OAuth flow
3. Copy your access token

## Using the Token

Include in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.nexus.yogan.dev/memories
```

## Token Expiration

Tokens expire after 30 days. Refresh by running `nexus auth login` again.

## Public Endpoints

These endpoints don't require authentication:

- `/libraries` - List and search libraries
- `/servers` - List and search servers
- Read-only memory operations with public memories
