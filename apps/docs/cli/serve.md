# nexus serve

Run Nexus as a local MCP server.

## Usage

```bash
nexus serve [options]
```

## Options

| Option          | Description                           |
| --------------- | ------------------------------------- |
| `--port <n>`    | HTTP port (default: none, uses stdio) |
| `--host <host>` | Host to bind (default: localhost)     |
| `--verbose`     | Verbose logging                       |

## Examples

```bash
# Run with stdio (for MCP clients)
nexus serve

# Run with HTTP server
nexus serve --port 3000

# Verbose mode
nexus serve --verbose
```

## Usage with AI Clients

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "nexus",
      "args": ["serve"]
    }
  }
}
```

## Environment Variables

| Variable        | Description                                         |
| --------------- | --------------------------------------------------- |
| `NEXUS_API_URL` | API endpoint (default: https://api.nexus.yogan.dev) |
| `NEXUS_VERBOSE` | Enable verbose logging                              |
