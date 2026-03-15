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

### Remote Mode (Recommended)

Use `mcp-remote` to connect to the hosted Nexus service. Pass your API key via the `--header` flag:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.nexus.yogan.dev/sse",
        "--header",
        "Authorization:Bearer ${NEXUS_API_KEY}"
      ],
      "env": {
        "NEXUS_API_KEY": "nxs_your_api_key_here"
      }
    }
  }
}
```

::: tip How it works
The `mcp-remote` package bridges your local MCP client to the remote Nexus server. The `--header` flag passes your API key as a Bearer token. The `${NEXUS_API_KEY}` syntax references the environment variable.
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
- [OpenCode](/configuration/opencode)

### Direct HTTP Connection

For clients supporting HTTP transport (SSE/Streamable HTTP) directly:

```
URL: https://mcp.nexus.yogan.dev/sse
Headers:
  Authorization: Bearer nxs_your_api_key_here
```

Or for the HTTP endpoint:

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
    "message": "Authentication required. Get your API key at https://nexus.yogan.dev/dashboard/settings or run: npx @nexus/cli auth login",
    "data": {
      "docsUrl": "https://nexus.yogan.dev/docs/api/authentication",
      "dashboardUrl": "https://nexus.yogan.dev/dashboard/settings",
      "cliCommand": "npx @nexus/cli auth login"
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
