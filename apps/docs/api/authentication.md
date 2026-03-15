# Authentication

Nexus requires an API key for all MCP tool calls. This enables usage tracking, personalization, and ensures fair access to resources.

## Getting an API Key

### Option 1: CLI Login (Recommended)

The easiest way to get started:

```bash
npx @nexus/cli login
```

This opens your browser for GitHub authentication and automatically generates an API key stored in `~/.nexus/config.json`.

### Option 2: Dashboard

1. Sign in at [nexus.yogan.dev](https://nexus.yogan.dev)
2. Go to [Dashboard → API Keys](https://nexus.yogan.dev/dashboard/keys)
3. Click **Create API Key**
4. Copy your key (starts with `nxs_`)

::: warning
API keys are only shown once. Store them securely!
:::

## Configuring Your AI Client

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@nexus/cli", "serve"],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project or global config:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@nexus/cli", "serve"],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

### VS Code (Copilot / Continue)

Add to your VS Code settings or MCP config:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@nexus/cli", "serve"],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

### Cline

Configure in Cline's MCP settings panel or `~/.cline/mcp.json`:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@nexus/cli", "serve"],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

### OpenCode / Codex / Other Clients

Most MCP clients follow a similar pattern. The key configuration:

| Setting | Value |
|---------|-------|
| Command | `npx` |
| Args | `["-y", "@nexus/cli", "serve"]` |
| Environment | `NEXUS_API_KEY=nxs_your_key` |

### Remote HTTP Connection

For clients supporting HTTP transport (SSE/Streamable HTTP):

```
URL: https://api.nexus.yogan.dev/mcp
Headers:
  Authorization: Bearer nxs_your_api_key_here
```

## API Key Scopes

API keys can have specific scopes for fine-grained access:

| Scope | Description |
|-------|-------------|
| `read:docs` | Query documentation |
| `read:memories` | Read stored memories |
| `write:memories` | Create and update memories |
| `read:servers` | Discover MCP servers |

By default, CLI-generated keys include all scopes.

## Rate Limits

| Plan | Requests/Month | Keys Allowed |
|------|----------------|--------------|
| Free | 2,000 | 1 |
| Pro | Unlimited | 10 |
| Team | Unlimited | 100 |

## Error Messages

### Missing API Key

If you try to use Nexus without an API key:

```json
{
  "error": {
    "code": -32001,
    "message": "API key required. Get your free API key at https://nexus.yogan.dev/dashboard/keys or run 'npx @nexus/cli login' to authenticate.",
    "data": {
      "docsUrl": "https://docs.nexus.yogan.dev/getting-started",
      "dashboardUrl": "https://nexus.yogan.dev/dashboard/keys",
      "cliCommand": "npx @nexus/cli login"
    }
  }
}
```

### Invalid API Key

```json
{
  "error": {
    "code": -32001,
    "message": "Invalid API key. Please check your key at https://nexus.yogan.dev/dashboard/keys"
  }
}
```

## Public Endpoints

These methods work without authentication (for discovery):

- `initialize` - Initialize MCP session
- `tools/list` - List available tools
- `resources/list` - List available resources
- `prompts/list` - List available prompts

Tool calls (`tools/call`) require authentication.

## Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Rotate keys periodically** - Delete old keys in the dashboard
3. **Use minimal scopes** - Only request the access you need
4. **Monitor usage** - Check the dashboard for unusual activity
