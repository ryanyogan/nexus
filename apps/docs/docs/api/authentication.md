# Authentication

The Nexus API supports two authentication methods: session cookies for browser applications and API tokens for programmatic access.

## API Tokens

API tokens are the recommended authentication method for CLI tools, MCP clients, and server-to-server integrations.

### Token Format

API tokens use the prefix `nxs_` followed by a random string:

```
nxs_abc123def456...
```

### Using API Tokens

Include the token in the `Authorization` header as a Bearer token:

```bash
curl https://api.nexus.yogan.dev/api/libraries \
  -H "Authorization: Bearer nxs_your_token_here"
```

### Getting an API Token

1. Sign in at [nexus.yogan.dev](https://nexus.yogan.dev)
2. Navigate to **Settings** > **API Tokens**
3. Click **Create Token**
4. Select the scopes you need
5. Copy and securely store the token

:::warning
API tokens are shown only once at creation. Store them securely - you cannot retrieve the token value later.
:::

### Token Scopes

Tokens can be scoped to limit access:

| Scope | Description |
|-------|-------------|
| `read` | Read-only access to libraries, servers, and public memories |
| `write` | Create and modify memories |
| `admin` | Full administrative access |

When creating a token, select only the scopes your application needs.

### Token Management

You can view, rename, and revoke tokens from the Settings page:

```bash
# List your tokens (requires session auth)
curl https://api.nexus.yogan.dev/api/user/tokens \
  -H "Cookie: your_session_cookie"
```

## Session Authentication

Browser applications can use session cookies from Better Auth OAuth flow.

### OAuth Providers

Nexus supports OAuth sign-in via:

- **GitHub** - Recommended for developers
- **Google** - Alternative option

### OAuth Flow

1. Redirect to `/api/auth/signin/{provider}`
2. User authenticates with the provider
3. Callback redirects back with session cookie set
4. Cookie automatically included in subsequent requests

```javascript
// Example: Redirect to GitHub OAuth
window.location.href = 'https://api.nexus.yogan.dev/api/auth/signin/github';
```

## Anonymous Access

Many read endpoints work without authentication:

- `GET /api/libraries` - List libraries
- `GET /api/libraries/:id` - Get library details
- `GET /api/servers` - List MCP servers
- `GET /api/skills` - List skills
- `POST /api/libraries/search` - Search documentation

Anonymous requests have lower rate limits. Authenticate for higher limits.

## Authentication Errors

### 401 Unauthorized

No valid authentication provided:

```json
{
  "error": "Unauthorized",
  "message": "Authentication required. Provide a valid session cookie or API token."
}
```

### 403 Forbidden

Token lacks required scope:

```json
{
  "error": "Forbidden",
  "message": "This action requires the 'write' scope."
}
```

## Best Practices

1. **Use API tokens for automation** - Don't store session cookies in scripts
2. **Limit scopes** - Request only the permissions you need
3. **Rotate tokens** - Create new tokens periodically and revoke old ones
4. **Keep tokens secret** - Never commit tokens to version control
5. **Use environment variables** - Store tokens in `NEXUS_API_TOKEN` or similar
