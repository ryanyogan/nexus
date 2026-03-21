# Environment Variables

Configure Nexus behavior with environment variables.

## Available Variables

| Variable           | Description            | Default                       |
| ------------------ | ---------------------- | ----------------------------- |
| `NEXUS_API_URL`    | API endpoint URL       | `https://api.nexus.yogan.dev` |
| `NEXUS_AUTH_TOKEN` | Authentication token   | None                          |
| `NEXUS_VERBOSE`    | Enable verbose logging | `false`                       |
| `NEXUS_TIMEOUT`    | Request timeout (ms)   | `30000`                       |

## Setting Environment Variables

### In MCP Configuration

```json
{
  "mcpServers": {
    "nexus": {
      "command": "nexus",
      "args": ["serve"],
      "env": {
        "NEXUS_VERBOSE": "true"
      }
    }
  }
}
```

### System-wide

**macOS/Linux:**

```bash
export NEXUS_VERBOSE=true
```

**Windows:**

```powershell
$env:NEXUS_VERBOSE = "true"
```

## Authentication Token

For automated workflows, you can set an auth token instead of using interactive login:

```bash
export NEXUS_AUTH_TOKEN="your-token-here"
```

Get your token from the Nexus dashboard or by running `nexus auth token`.
