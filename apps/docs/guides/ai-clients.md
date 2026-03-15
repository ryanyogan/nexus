# AI Client Setup Guide

Best practices for using Nexus with different AI clients.

## Claude Desktop

Claude Desktop has native MCP support. See [Claude Desktop Configuration](/configuration/claude-desktop).

### Tips

- Restart after config changes
- Check logs at `~/Library/Logs/Claude/` (macOS)

## Cursor

Cursor supports MCP through its configuration. See [Cursor Configuration](/configuration/cursor).

### Tips

- Use Composer for multi-file operations
- Memory works well with project context

## VS Code

VS Code supports MCP through GitHub Copilot. See [VS Code Configuration](/configuration/vscode).

### Tips

- Requires Copilot extension
- Works in Copilot Chat panel

## Claude Code (CLI)

The fastest setup option:

```bash
claude mcp add nexus -- npx -y @anthropic-ai/mcp-remote https://api.nexus.yogan.dev/sse
```

## General Tips

1. **Save context early** - At the start of a project, save architecture and conventions
2. **Use project names** - Always include project names in memories
3. **Load context first** - Start sessions by loading project context
4. **Search before asking** - Use documentation search for library questions
