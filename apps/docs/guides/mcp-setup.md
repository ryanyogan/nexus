# MCP Setup Guide

Understanding the Model Context Protocol and how Nexus uses it.

## What is MCP?

The Model Context Protocol (MCP) is a standard for AI assistants to access external tools and data. It allows AI clients to:

- Call tools (like search, memory, etc.)
- Access resources (like files, databases)
- Use prompts (predefined templates)

## How Nexus Uses MCP

Nexus is an MCP server that provides:

- **Tools**: 13 tools for docs, memory, and servers
- **Resources**: Not currently used
- **Prompts**: Not currently used

## Connection Modes

### Remote Mode

Connect directly to the hosted service:

```
https://mcp.nexus.yogan.dev/sse
```

Uses Server-Sent Events (SSE) for communication.

### Local Mode

Run Nexus locally:

```bash
nexus serve
```

Uses stdio for communication.

## Troubleshooting

### "MCP server not responding"

1. Check your internet connection
2. Verify the config syntax
3. Restart your AI client

### "Tool not found"

1. Ensure Nexus is properly configured
2. Check that the MCP server is running
3. Look for errors in client logs

### "Authentication required"

Memory write operations need authentication:

```bash
nexus auth login
```

## Learn More

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP Servers Registry](https://github.com/modelcontextprotocol/servers)
