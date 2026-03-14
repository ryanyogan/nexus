# nexus init

Interactive setup wizard for Nexus. Configures MCP servers in your AI-powered editors.

## Synopsis

```bash
nexus init [options]
```

## Description

The `init` command provides an interactive setup wizard that:

1. Detects installed AI editors on your system
2. Lets you select which editors to configure
3. Configures the Nexus MCP server in each selected editor
4. Optionally starts the authentication flow

When run without flags, it launches a full-screen interactive UI using Ink. If the terminal doesn't support interactivity (non-TTY), it automatically falls back to simple mode.

## Options

| Option | Description |
|--------|-------------|
| `--simple` | Use simple non-interactive mode |
| `--json` | Output current state as JSON (no interactive setup) |

## Interactive Mode

The interactive wizard provides a rich terminal UI:

```
  ╭──────────────────────────────────────────╮
  │                                          │
  │   Welcome to Nexus!                      │
  │   The AI Documentation & Skills Hub      │
  │                                          │
  ╰──────────────────────────────────────────╯

  Select editors to configure:
  
  [x] Claude Code
  [x] Cursor  
  [ ] VS Code
  [ ] OpenCode
  [ ] Zed
  
  Press <space> to toggle, <enter> to confirm
```

Use arrow keys to navigate, space to toggle selection, and enter to confirm.

## Simple Mode

Use `--simple` for non-interactive output that shows manual configuration instructions:

```bash
nexus init --simple
```

Output:

```
  ╭──────────────────────────────────────────╮
  │                                          │
  │   Welcome to Nexus!                      │
  │   The AI Documentation & Skills Hub      │
  │                                          │
  ╰──────────────────────────────────────────╯

  Configure MCP server in your editors:
  ────────────────────────────────────────

  Claude Code:
  claude mcp add nexus --transport http https://mcp.nexus.yogan.dev

  Cursor (add to ~/.cursor/mcp.json):
  { "mcpServers": { "nexus": { "url": "https://mcp.nexus.yogan.dev" } } }

  OpenCode (add to opencode.json):
  { "mcp": { "nexus": { "type": "remote", "url": "https://mcp.nexus.yogan.dev", "enabled": true } } }

  ────────────────────────────────────────

  Quick commands:
    nexus docs search react hooks
    nexus skills list
    nexus servers list
```

## JSON Output

When using `--json`, returns the current state without running setup:

```bash
nexus init --json
```

```json
{
  "authenticated": false,
  "editors": [],
  "message": "Interactive mode not available with --json flag"
}
```

## Examples

### Basic interactive setup

```bash
nexus init
```

### Non-interactive setup (CI/scripts)

```bash
nexus init --simple
```

### Check current state

```bash
nexus init --json
```

## Post-Setup

After running `init`, you can:

1. **Authenticate** to enable full API access:
   ```bash
   nexus auth login
   ```

2. **Search documentation** immediately:
   ```bash
   nexus docs search react useState
   ```

3. **Install additional MCP servers**:
   ```bash
   nexus servers add filesystem
   ```

## Supported Editors

The wizard detects and can configure:

| Editor | Detection | Config Location |
|--------|-----------|-----------------|
| Claude Code | `claude` command | Built-in MCP command |
| Cursor | `~/.cursor/` directory | `~/.cursor/mcp.json` |
| VS Code | `code` command | `~/.vscode/mcp.json` |
| OpenCode | `opencode.json` in project | `opencode.json` |
| Zed | `~/.config/zed/` directory | `~/.config/zed/settings.json` |

## Notes

- The interactive UI requires a TTY terminal
- In CI environments or piped output, simple mode is used automatically
- Editor configuration is stored in the global config at `~/.nexus/config.json`
- Per-project editor overrides can be set in `.nexus/config.json`

## See Also

- [Configuration](./configuration.md) - Config file details
- [nexus auth](./auth.md) - Authentication commands
- [nexus servers](./servers.md) - MCP server management
