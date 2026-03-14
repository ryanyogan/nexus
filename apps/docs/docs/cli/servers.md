# nexus servers

Manage MCP (Model Context Protocol) servers - discover, install, and configure servers for your AI editors.

## Synopsis

```bash
nexus servers <subcommand> [options]
```

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `list` | List available MCP servers |
| `search` | Search MCP servers by capability |
| `add` | Install an MCP server to your editors |
| `info` | Show detailed information about a server |
| `remove` | Remove an MCP server from your editors |
| `installed` | List MCP servers installed in your editors |

---

## nexus servers list

List available MCP servers from the registry.

### Synopsis

```bash
nexus servers list [options]
```

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--installed` | `-i` | Show only installed servers |
| `--category <category>` | `-c` | Filter by category |
| `--json` | | Output results as JSON |

### Categories

- `database` - Database access (Postgres, MySQL, SQLite, etc.)
- `filesystem` - File system operations
- `devtools` - Development tools and APIs
- `ai` - AI and ML services
- `cloud` - Cloud provider integrations
- `productivity` - Productivity tools and services
- `communication` - Messaging and email
- `monitoring` - Logging and observability

### Examples

```bash
# List all available servers
nexus servers list

# Filter by category
nexus servers list --category database

# JSON output
nexus servers list --json
```

### Output

```bash
$ nexus servers list

Available MCP Servers

  filesystem [official]
    Read, write, and manage files on the local filesystem
    Category: filesystem
  postgres [official]
    Query PostgreSQL databases with full SQL support
    Category: database
  github [official]
    Interact with GitHub repositories, issues, and PRs
    Category: devtools
  slack
    Send messages and manage Slack workspaces
    Category: communication
```

### JSON Output

```json
{
  "servers": [
    {
      "id": "filesystem",
      "name": "filesystem",
      "description": "Read, write, and manage files on the local filesystem",
      "categories": ["filesystem"],
      "isOfficial": true,
      "isFeatured": true
    }
  ]
}
```

---

## nexus servers search

Search for MCP servers by capability or keyword.

### Synopsis

```bash
nexus servers search <query> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `query` | Search query |

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Examples

```bash
# Search for database servers
nexus servers search database

# Search for file management
nexus servers search "file operations"

# Search for specific technology
nexus servers search postgres
```

### Output

```bash
$ nexus servers search database

Search results for "database"

  postgres [official]
    Query PostgreSQL databases with full SQL support
  mysql
    Connect to MySQL and MariaDB databases
  sqlite [official]
    Work with SQLite databases
  mongodb
    Query and manage MongoDB collections
```

---

## nexus servers add

Install an MCP server to your configured editors.

### Synopsis

```bash
nexus servers add <name> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `name` | Server name to install |

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--force` | `-f` | Skip security warnings |
| `--editor <editor>` | `-e` | Install to specific editor only |
| `--json` | | Output results as JSON |

### Supported Editors

- `claude-code` / `claude` - Claude Code
- `cursor` - Cursor
- `vscode` / `code` - VS Code
- `opencode` - OpenCode
- `zed` - Zed

### Requirements

- Must be authenticated (`nexus auth login`)
- At least one editor must be configured (`nexus init`)

### Examples

```bash
# Install to all configured editors
nexus servers add filesystem

# Install to specific editor only
nexus servers add postgres --editor cursor

# Skip security prompts (for automation)
nexus servers add custom-server --force
```

### Output

```bash
$ nexus servers add filesystem

Installing filesystem to editors...
  Read, write, and manage files on the local filesystem

  ✓ Claude Code
  ✓ Cursor
  ✗ VS Code: Config file not found

Installed to 2 editor(s)
```

### JSON Output

```json
{
  "server": "filesystem",
  "results": [
    {
      "editor": "claude-code",
      "success": true,
      "message": "Server installed successfully"
    },
    {
      "editor": "cursor",
      "success": true,
      "message": "Server installed successfully"
    },
    {
      "editor": "vscode",
      "success": false,
      "error": "Config file not found"
    }
  ]
}
```

---

## nexus servers info

Show detailed information about an MCP server.

### Synopsis

```bash
nexus servers info <name> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `name` | Server name |

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Examples

```bash
nexus servers info filesystem
```

### Output

```bash
$ nexus servers info filesystem

filesystem
────────────────────────────────────────

  Read, write, and manage files on the local filesystem

  ID: filesystem
  Namespace: mcp
  Version: 1.0.0
  Transport: stdio
  Package: npm (@modelcontextprotocol/server-filesystem)
  Status: official, featured

  Categories:
    • filesystem
    • devtools
```

### JSON Output

```json
{
  "server": {
    "id": "filesystem",
    "name": "filesystem",
    "displayName": "Filesystem",
    "description": "Read, write, and manage files on the local filesystem",
    "namespace": "mcp",
    "version": "1.0.0",
    "transportType": "stdio",
    "packageType": "npm",
    "packageName": "@modelcontextprotocol/server-filesystem",
    "isOfficial": true,
    "isFeatured": true,
    "categories": ["filesystem", "devtools"]
  }
}
```

---

## nexus servers remove

Remove an MCP server from your configured editors.

### Synopsis

```bash
nexus servers remove <name> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `name` | Server name to remove |

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--editor <editor>` | `-e` | Remove from specific editor only |
| `--json` | | Output results as JSON |

### Examples

```bash
# Remove from all configured editors
nexus servers remove filesystem

# Remove from specific editor only
nexus servers remove postgres --editor cursor
```

### Output

```bash
$ nexus servers remove filesystem

Removing filesystem from editors...

  ✓ Claude Code
  ✓ Cursor

Removed from 2 editor(s)
```

### JSON Output

```json
{
  "server": "filesystem",
  "results": [
    {
      "editor": "claude-code",
      "success": true,
      "message": "Server removed successfully"
    },
    {
      "editor": "cursor",
      "success": true,
      "message": "Server removed successfully"
    }
  ]
}
```

---

## nexus servers installed

List MCP servers currently installed in your editors.

### Synopsis

```bash
nexus servers installed [options]
```

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--editor <editor>` | `-e` | Show only specific editor |
| `--json` | | Output results as JSON |

### Examples

```bash
# List all installed servers
nexus servers installed

# Show only Cursor installations
nexus servers installed --editor cursor
```

### Output

```bash
$ nexus servers installed

Installed MCP Servers

Claude Code
  • nexus
  • filesystem
  • postgres

Cursor
  • nexus
  • github

VS Code
  No servers installed
```

### JSON Output

```json
{
  "installed": {
    "claude-code": ["nexus", "filesystem", "postgres"],
    "cursor": ["nexus", "github"],
    "vscode": []
  }
}
```

---

## Transport Types

MCP servers use different transport mechanisms:

| Type | Description |
|------|-------------|
| `stdio` | Standard input/output (local process) |
| `http` | HTTP/HTTPS connection (remote server) |
| `sse` | Server-Sent Events (streaming) |

## Editor Config Locations

| Editor | Config File |
|--------|-------------|
| Claude Code | Uses `claude mcp add` command |
| Cursor | `~/.cursor/mcp.json` |
| VS Code | `~/.vscode/mcp.json` |
| OpenCode | `opencode.json` (project) or `~/.config/opencode/opencode.json` |
| Zed | `~/.config/zed/settings.json` |

## See Also

- [nexus init](./init.md) - Configure editors
- [nexus serve](./serve.md) - Run Nexus as an MCP server
- [Configuration](./configuration.md) - Editor configuration details
