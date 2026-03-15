# API Overview

The Nexus API provides programmatic access to documentation search, memory, and server registry.

<script setup>
import Callout from '../.vitepress/theme/components/Callout.vue'
</script>

## Base URL

```
https://api.nexus.yogan.dev
```

## Authentication

<Callout type="warning" title="API Key Required">
All API and MCP tool calls require an API key. Get one by running `npx @nexus/cli auth login` or at [nexus.yogan.dev/dashboard/keys](https://nexus.yogan.dev/dashboard/keys).
</Callout>

Include your API key in the Authorization header:

```
Authorization: Bearer nxs_your_api_key_here
```

See the [Authentication Guide](/api/authentication) for detailed setup instructions.

## MCP Endpoint

For MCP clients (AI assistants), use:

```
https://api.nexus.yogan.dev/mcp
```

Configure your MCP client with the Nexus CLI:

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

## REST Endpoints

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/libraries` | List libraries |
| GET | `/libraries/:id` | Get library info |
| POST | `/libraries/:id/query` | Search documentation |

### Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/memories` | List memories |
| POST | `/memories` | Create memory |
| GET | `/memories/:id` | Get memory |
| PATCH | `/memories/:id` | Update memory |
| DELETE | `/memories/:id` | Delete memory |
| POST | `/memories/search` | Search memories |

### Servers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/servers` | List servers |
| GET | `/servers/:id` | Get server info |
| GET | `/servers/:id/config` | Get install config |

## Response Format

All responses are JSON:

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

## Errors

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Library not found"
  }
}
```

### Authentication Errors

```json
{
  "error": {
    "code": -32001,
    "message": "API key required. Get your API key at https://nexus.yogan.dev/dashboard/keys or run: npx @nexus/cli auth login"
  }
}
```

## Rate Limits

| Plan | Requests/Month |
|------|----------------|
| Free | 2,000 |
| Pro | Unlimited |
| Team | Unlimited |

See [Rate Limits](/api/rate-limits) for details.
