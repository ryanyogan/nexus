# nexus auth

Manage authentication for Nexus memory features.

## Usage

```bash
nexus auth <command>
```

## Commands

| Command | Description |
|---------|-------------|
| `login` | Authenticate with Nexus |
| `logout` | Remove authentication |
| `status` | Check authentication status |

## Examples

```bash
# Login with browser
nexus auth login

# Check status
nexus auth status

# Logout
nexus auth logout
```

## Authentication Methods

The CLI supports OAuth login via browser. When you run `nexus auth login`, it will:

1. Open your browser to the authentication page
2. Wait for you to complete the login
3. Store credentials securely

## Token Storage

Tokens are stored securely in:

- **macOS**: Keychain
- **Linux**: Secret Service / libsecret
- **Windows**: Credential Manager
