# Troubleshooting

Common issues and solutions.

## Connection Issues

### "Cannot connect to Nexus"

**Check your configuration:**

1. Verify the config file syntax (valid JSON)
2. Ensure the URL is correct: `https://mcp.nexus.yogan.dev/sse`
3. Check your internet connection

**For local mode:**

1. Ensure the CLI is installed: `npm install -g @nexus/cli`
2. Verify `nexus serve` runs without errors

### "Tool not found"

The AI client may not have loaded the MCP server:

1. Restart the AI client completely
2. Check the client logs for errors
3. Verify the MCP configuration

## Authentication Issues

### "Authentication required"

Memory write operations need authentication:

```bash
nexus auth login
```

### "Token expired"

Tokens expire after 30 days. Re-authenticate:

```bash
nexus auth login
```

### "Invalid token"

Clear and re-authenticate:

```bash
nexus auth logout
nexus auth login
```

## Search Issues

### "Library not found"

The library may not be indexed. Use `list-libraries` to see available libraries:

```
list-libraries --category frontend
```

### "No results"

Try a more specific or different query:

```
Bad: "hooks"
Good: "React useEffect cleanup function"
```

## Memory Issues

### "Memory not saving"

1. Check authentication: `nexus auth status`
2. Verify you have write permissions
3. Check for rate limiting

### "Memories not found"

Ensure you're searching with the correct project name and filters.

## Performance Issues

### "Slow responses"

- Check your internet connection
- Try using `tokens: "compact"` for faster responses
- Rate limiting may be in effect

## Getting Help

If you can't resolve the issue:

1. Check the [GitHub Issues](https://github.com/ryanyogan/nexus/issues)
2. Open a new issue with:
   - Error message
   - Client and version
   - Steps to reproduce
