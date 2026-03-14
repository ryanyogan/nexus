# Configuration

Nexus CLI configuration includes global settings, project-local overrides, and environment variables.

## Configuration Files

### Global Configuration

Location: `~/.nexus/config.json`

Stores user-wide settings including authentication, editor preferences, and API configuration.

```json
{
  "auth": {
    "token": "nxs_xxxxxxxxxxxx",
    "tokenPrefix": "nxs_xxxxxxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "userId": "usr_abc123",
    "expiresAt": "2026-01-01T00:00:00.000Z"
  },
  "editors": ["claude-code", "cursor"],
  "preferences": {
    "defaultResponseFormat": "full",
    "warnOnRateLimit": true
  },
  "apiUrl": "https://api.nexus.yogan.dev"
}
```

#### Auth Fields

| Field | Description |
|-------|-------------|
| `token` | API token for authentication |
| `tokenPrefix` | First 12 characters (for display) |
| `email` | User's email address |
| `name` | User's display name |
| `userId` | Unique user identifier |
| `expiresAt` | Token expiration date (ISO 8601) |

#### Preferences

| Field | Default | Description |
|-------|---------|-------------|
| `defaultResponseFormat` | `"full"` | Default format: `full`, `compact`, `code-only`, `summary` |
| `warnOnRateLimit` | `true` | Show warnings when approaching rate limits |

#### Editors

Array of configured editor IDs:

- `"claude-code"` - Claude Code
- `"cursor"` - Cursor
- `"vscode"` - VS Code
- `"opencode"` - OpenCode
- `"zed"` - Zed

### Project Configuration

Location: `.nexus/config.json` (in project root)

Project-specific settings that override global configuration.

```json
{
  "editors": ["cursor", "vscode"],
  "cachedLibraries": ["react", "nextjs", "typescript"]
}
```

| Field | Description |
|-------|-------------|
| `editors` | Override global editor list for this project |
| `cachedLibraries` | Libraries with locally cached documentation |

### Project Cache

Location: `.nexus/cache/` (in project root)

Cached documentation and resources for offline use.

```
.nexus/
  config.json         # Project config
  cache/
    docs/             # Cached documentation
      react.json
      nextjs.json
    skills/           # Cached skills
    servers/          # Cached server configs
```

Add to `.gitignore`:

```gitignore
# Nexus cache (don't commit cached data)
.nexus/cache/

# Optionally include project config
# .nexus/config.json
```

## Environment Variables

Environment variables override config file settings.

| Variable | Description |
|----------|-------------|
| `NEXUS_API_KEY` | API token (overrides stored auth) |
| `NEXUS_API_URL` | API base URL (default: `https://api.nexus.yogan.dev`) |
| `NEXUS_CONFIG_DIR` | Override global config directory |
| `NO_COLOR` | Disable colored output (any value) |

### Example Usage

```bash
# Use a different API key for CI
NEXUS_API_KEY=nxs_ci_token nexus docs search react

# Use development API server
NEXUS_API_URL=http://localhost:3000 nexus serve

# Disable colors in scripts
NO_COLOR=1 nexus servers list
```

## Editor Configuration

### Claude Code

Claude Code uses its built-in MCP management:

```bash
# Add remote Nexus server
claude mcp add nexus --transport http https://mcp.nexus.yogan.dev

# Add local Nexus server
claude mcp add nexus-local -- nexus serve

# List configured servers
claude mcp list

# Remove server
claude mcp remove nexus
```

### Cursor

Config file: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "nexus": {
      "url": "https://mcp.nexus.yogan.dev"
    },
    "nexus-local": {
      "command": "nexus",
      "args": ["serve"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    }
  }
}
```

### VS Code

Config file: `~/.vscode/mcp.json`

```json
{
  "mcpServers": {
    "nexus": {
      "url": "https://mcp.nexus.yogan.dev"
    }
  }
}
```

### OpenCode

Config file: `opencode.json` (project) or `~/.config/opencode/opencode.json` (global)

```json
{
  "mcp": {
    "nexus": {
      "type": "remote",
      "url": "https://mcp.nexus.yogan.dev",
      "enabled": true
    },
    "nexus-local": {
      "type": "stdio",
      "command": "nexus",
      "args": ["serve"],
      "enabled": true
    }
  }
}
```

### Zed

Config file: `~/.config/zed/settings.json`

```json
{
  "context_servers": {
    "nexus": {
      "url": "https://mcp.nexus.yogan.dev"
    },
    "nexus-local": {
      "command": {
        "path": "nexus",
        "args": ["serve"]
      }
    }
  }
}
```

## Directory Structure

### Global

```
~/.nexus/
  config.json          # Global configuration
```

### Project

```
your-project/
  .nexus/
    config.json        # Project-specific config
    cache/
      docs/            # Cached documentation
        react.json
        nextjs.json
      skills/          # Cached skills
      servers/         # Cached server configs
```

## Configuration Precedence

Settings are applied in this order (later overrides earlier):

1. **Default values** - Built-in defaults
2. **Global config** - `~/.nexus/config.json`
3. **Project config** - `.nexus/config.json`
4. **Environment variables** - `NEXUS_*` variables
5. **Command-line flags** - `--json`, `--verbose`, etc.

### Example

```bash
# Global config has editor: ["claude-code"]
# Project config has editor: ["cursor"]
# Command specifies: --editor vscode

# Result: vscode is used (CLI flag wins)
nexus servers add filesystem --editor vscode
```

## Resetting Configuration

### Clear authentication

```bash
nexus auth logout
```

### Reset global config

```bash
rm ~/.nexus/config.json
```

### Reset project config

```bash
rm -rf .nexus/
```

### Clear all caches

```bash
rm -rf ~/.nexus/cache/
rm -rf .nexus/cache/
```

## Troubleshooting

### Config not loading

```bash
# Check if config exists
cat ~/.nexus/config.json

# Verify JSON syntax
npx jsonlint ~/.nexus/config.json
```

### Authentication issues

```bash
# Check auth status
nexus auth status

# Re-authenticate
nexus auth logout
nexus auth login
```

### Editor not detected

```bash
# Run init to re-detect editors
nexus init

# Manually specify editor
nexus servers add filesystem --editor cursor
```

## See Also

- [nexus init](./init.md) - Initial setup wizard
- [nexus auth](./auth.md) - Authentication commands
- [nexus serve](./serve.md) - Running as MCP server
