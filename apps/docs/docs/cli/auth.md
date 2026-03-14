# nexus auth

Manage authentication with Nexus. Includes subcommands for login, logout, and checking status.

## Synopsis

```bash
nexus auth <subcommand> [options]
```

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `login` | Authenticate with Nexus |
| `logout` | Clear stored credentials |
| `status` | Show current authentication status |

---

## nexus auth login

Authenticate with Nexus using browser-based OAuth or an API token.

### Synopsis

```bash
nexus auth login [options]
```

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--token` | `-t` | Enter API token manually instead of browser auth |
| `--json` | | Output results as JSON |

### Browser Authentication (Default)

By default, `login` uses a browser-based OAuth flow:

1. CLI starts an authentication session
2. A unique code is displayed in the terminal
3. Browser opens to the Nexus authentication page
4. After signing in, the CLI automatically receives the token

```bash
nexus auth login
```

Output:

```
Starting authentication...

  Authentication Code:
  ABC123

Opening browser for authentication...
If the browser doesn't open, visit:
  https://nexus.yogan.dev/auth/cli?code=ABC123

Waiting for authentication....

Authenticated as user@example.com
```

### Token Authentication

Use `--token` to manually enter an API token (useful for CI/CD or headless environments):

```bash
nexus auth login --token
```

Output:

```
Enter your Nexus API token:
Get one from https://nexus.yogan.dev/dashboard/settings

Token: nxs_xxxxxxxxxxxx

Authenticated successfully!
```

Tokens must start with `nxs_` prefix.

### JSON Output

```bash
nexus auth login --json
```

Success response:
```json
{
  "status": "authenticated",
  "email": "user@example.com"
}
```

Already authenticated:
```json
{
  "status": "already_authenticated",
  "email": "user@example.com"
}
```

Error response:
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token validation failed"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_TOKEN` | Token format invalid or validation failed |
| `EXPIRED` | Authentication code expired (try again) |
| `TIMEOUT` | Authentication timed out after 10 minutes |
| `CONNECTION_ERROR` | Failed to connect to Nexus API |
| `START_FAILED` | Failed to start authentication session |

---

## nexus auth logout

Clear stored credentials from the local config.

### Synopsis

```bash
nexus auth logout [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Example

```bash
nexus auth logout
```

Output:

```
Logged out from user@example.com
```

### JSON Output

```bash
nexus auth logout --json
```

Success:
```json
{
  "status": "logged_out",
  "email": "user@example.com"
}
```

Not authenticated:
```json
{
  "status": "not_authenticated"
}
```

---

## nexus auth status

Show current authentication status, configured editors, and API connection.

### Synopsis

```bash
nexus auth status [options]
```

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Example

```bash
nexus auth status
```

Output when authenticated:

```
Nexus CLI Status
────────────────────────────────────────

  ● Authenticated
    Email: user@example.com
    Name:  John Doe
    User:  usr_abc123

  ● API Connected
    URL: https://api.nexus.yogan.dev

  Configured editors:
    • claude-code
    • cursor
```

Output when not authenticated:

```
Nexus CLI Status
────────────────────────────────────────

  ○ Not authenticated
    Run nexus auth login to sign in

  ● API Connected
    URL: https://api.nexus.yogan.dev

  No editors configured
    Run nexus init to set up editors
```

### JSON Output

```bash
nexus auth status --json
```

```json
{
  "authenticated": true,
  "user": {
    "email": "user@example.com",
    "userId": "usr_abc123",
    "name": "John Doe"
  },
  "editors": ["claude-code", "cursor"],
  "apiUrl": "https://api.nexus.yogan.dev",
  "connection": {
    "connected": true,
    "error": null
  }
}
```

---

## Authentication Storage

Credentials are stored in the global config file:

```
~/.nexus/config.json
```

The stored auth data includes:

| Field | Description |
|-------|-------------|
| `token` | The API token |
| `tokenPrefix` | First 12 characters for display |
| `email` | User's email address |
| `name` | User's display name (optional) |
| `userId` | User ID |
| `expiresAt` | Token expiration date (optional) |

## Security

- Tokens are stored in plain text in your home directory
- Use `nexus auth logout` before sharing your machine
- Generate separate tokens for different machines in the dashboard
- Revoke compromised tokens at https://nexus.yogan.dev/dashboard/settings

## See Also

- [Configuration](./configuration.md) - Config file locations and options
- [nexus init](./init.md) - Initial setup wizard
- [nexus stats](#) - View usage statistics
