# Authentication

Nexus requires an API key for all MCP tool calls. This enables usage tracking, personalization, and ensures fair access to resources.

## Getting an API Key

### Option 1: CLI Login (Recommended)

The easiest way to get started:

```bash
npx @nexus/cli auth login
```

This opens your browser for GitHub/Google authentication and automatically generates an API key stored in `~/.nexus/config.json`.

### Option 2: Dashboard

1. Sign in at [nexus.yogan.dev](https://nexus.yogan.dev)
2. Go to [Dashboard → API Keys](https://nexus.yogan.dev/dashboard/keys)
3. Click **Create API Key**
4. Copy your key (starts with `nxs_`)

::: warning
API keys are only shown once. Store them securely!
:::

## Configuring Your AI Client

### Native Remote Mode (Simplest)

For clients that support native remote MCP connections (like OpenCode):

```json
{
  "mcp": {
    "nexus": {
      "type": "remote",
      "url": "https://api.nexus.yogan.dev/sse",
      "enabled": true,
      "headers": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

No dependencies needed - just paste your API key and go.

### Using mcp-remote (Most Clients)

For clients that don't support native remote (Claude Desktop, Cursor, VS Code, etc.), use `mcp-remote` as a bridge:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://api.nexus.yogan.dev/sse",
        "--header",
        "NEXUS_API_KEY:${NEXUS_API_KEY}"
      ],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

::: tip How it works
The `mcp-remote` package bridges your local MCP client to the remote Nexus server. The `--header` flag passes your API key. The `${NEXUS_API_KEY}` syntax references the environment variable.
:::

### Local Mode

Run the Nexus CLI locally. The CLI reads your API key from the environment or stored credentials:

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

::: tip Using CLI Login?
If you authenticated with `npx @nexus/cli auth login`, the CLI automatically uses your stored key. You can omit the `env` section.
:::

### Client-Specific Guides

- [Claude Desktop](/configuration/claude-desktop)
- [Cursor](/configuration/cursor)
- [VS Code](/configuration/vscode)
- [OpenCode](/configuration/opencode) - Native remote support

## Accepted Headers

Nexus accepts API keys via either header format:

| Header          | Format       | Example                |
| --------------- | ------------ | ---------------------- |
| `NEXUS_API_KEY` | Raw key      | `nxs_abc123...`        |
| `Authorization` | Bearer token | `Bearer nxs_abc123...` |

Native remote clients typically use `NEXUS_API_KEY`. The `Authorization: Bearer` format is also supported for standard HTTP clients.

### Direct HTTP Connection

For clients supporting HTTP transport (SSE/Streamable HTTP) directly:

```
URL: https://api.nexus.yogan.dev/sse
Headers:
  NEXUS_API_KEY: nxs_your_api_key_here
```

Or using Authorization header:

```
URL: https://api.nexus.yogan.dev/mcp
Headers:
  Authorization: Bearer nxs_your_api_key_here
```

## API Key Scopes

API keys can have specific scopes for fine-grained access:

| Scope            | Description                |
| ---------------- | -------------------------- |
| `read:docs`      | Query documentation        |
| `read:memories`  | Read stored memories       |
| `write:memories` | Create and update memories |
| `read:servers`   | Discover MCP servers       |

By default, CLI-generated keys include all scopes.

## Rate Limits

| Plan | Requests/Month | Keys Allowed |
| ---- | -------------- | ------------ |
| Free | 2,000          | 1            |
| Pro  | Unlimited      | 10           |
| Team | Unlimited      | 100          |

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
