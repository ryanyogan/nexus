# Setting Up MCP Servers

The Model Context Protocol (MCP) lets AI assistants connect to external tools and data sources. Nexus includes a registry of MCP servers you can discover, configure, and install.

## How to Discover Servers

### Browse by Category

Use `discover-servers` to find servers by category:

```typescript
discover-servers: {
  category: "database"
}
// Returns: postgres, sqlite, mysql, mongodb servers...
```

Available categories:
- `database` — PostgreSQL, SQLite, MongoDB, Redis
- `filesystem` — File operations, directory access
- `devtools` — Git, GitHub, npm, build tools
- `cloud` — AWS, GCP, Cloudflare, Vercel
- `ai` — OpenAI, Anthropic, vector databases
- `productivity` — Notion, Slack, email, calendars

### Search by Capability

Find servers that do what you need:

```typescript
discover-servers: {
  query: "vector database for embeddings"
}
// Returns: pinecone, qdrant, chromadb servers...
```

### Find Official Servers

Filter to official MCP servers from the modelcontextprotocol org:

```typescript
discover-servers: {
  official: true
}
```

### Get Server Details

Once you find a server, get full details:

```typescript
get-server-info: {
  serverId: "postgres"
}
// Returns: description, capabilities, tools, installation instructions
```

## Installing Servers in Different Clients

### Claude Desktop

Claude Desktop uses a JSON configuration file.

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**Get the config:**

```typescript
get-server-config: {
  serverId: "postgres",
  format: "claude-desktop"
}
```

**Example config:**

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_URL": "postgresql://user:pass@localhost:5432/mydb"
      }
    }
  }
}
```

:::tip Multiple servers
You can add multiple servers to the same config file. Each server gets its own key under `mcpServers`.
:::

### VS Code / Cursor

VS Code and Cursor support MCP through extensions or settings.

**Get the config:**

```typescript
get-server-config: {
  serverId: "filesystem",
  format: "vscode"
}
```

**Settings location:** `.vscode/settings.json` or user settings

```json
{
  "mcp.servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
    }
  }
}
```

### Generic / Other Clients

For other MCP clients:

```typescript
get-server-config: {
  serverId: "github",
  format: "generic"
}
```

Returns a portable format you can adapt:

```json
{
  "name": "github",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_TOKEN": "<your-token>"
  }
}
```

## Installing Remote Servers (SSE)

Some servers run as remote services instead of local processes. Nexus itself is a remote server:

```json
{
  "mcpServers": {
    "nexus": {
      "url": "https://mcp.nexus.yogan.dev/sse"
    }
  }
}
```

Remote servers use `url` instead of `command`. They're simpler to set up but require internet access.

## Environment Variables

Most servers need configuration through environment variables.

### Secure Storage

:::warning Never commit secrets
Don't put API keys or passwords directly in config files that you commit to version control.
:::

**Option 1: Environment file**

Create a `.env` file (add to `.gitignore`):

```bash
POSTGRES_URL=postgresql://user:password@localhost:5432/mydb
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

Reference in config:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_URL": "${POSTGRES_URL}"
      }
    }
  }
}
```

**Option 2: System environment**

Set variables in your shell profile (`~/.bashrc`, `~/.zshrc`):

```bash
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
```

### Common Environment Variables

| Server | Variable | Description |
|--------|----------|-------------|
| postgres | `POSTGRES_URL` | PostgreSQL connection string |
| github | `GITHUB_TOKEN` | GitHub personal access token |
| slack | `SLACK_BOT_TOKEN` | Slack bot OAuth token |
| openai | `OPENAI_API_KEY` | OpenAI API key |

## Troubleshooting Common Issues

### Server Won't Start

**Symptom:** Server appears in config but doesn't connect.

**Check:**

1. **Node.js installed?**
   ```bash
   node --version  # Should be v18+
   ```

2. **npx available?**
   ```bash
   npx --version
   ```

3. **Package exists?**
   ```bash
   npx -y @modelcontextprotocol/server-postgres --help
   ```

4. **Config syntax valid?**
   ```bash
   # Validate JSON
   cat ~/.config/Claude/claude_desktop_config.json | jq .
   ```

### "Command not found"

**Symptom:** Error message about missing command.

**Solution:** Ensure the command is in your PATH. For npx-based servers, make sure npm is installed globally.

```bash
# Install Node.js if needed
curl -fsSL https://fnm.vercel.app/install | bash
fnm install --lts
```

### Environment Variables Not Loading

**Symptom:** Server starts but can't authenticate or connect.

**Check:**

1. **Variable is set:**
   ```bash
   echo $POSTGRES_URL
   ```

2. **Variable is exported:**
   ```bash
   export POSTGRES_URL="..."  # Note: export is required
   ```

3. **Client loads env:** Some clients need restart to pick up new variables.

### Connection Timeouts (Remote Servers)

**Symptom:** Remote server connection times out or fails.

**Check:**

1. **URL is correct:**
   ```bash
   curl -I https://mcp.nexus.yogan.dev/sse
   ```

2. **Network allows connection:** Check firewall, VPN, proxy settings.

3. **Server is up:** Check the server's status page if available.

### Permission Denied (Filesystem Server)

**Symptom:** Filesystem server can't read/write files.

**Solution:** The filesystem server only accesses directories you explicitly allow:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/me/projects",
        "/Users/me/documents"
      ]
    }
  }
}
```

Each path after the package name is an allowed directory.

### Multiple Server Conflicts

**Symptom:** Servers interfere with each other or have naming conflicts.

**Solution:** Use unique names for each server:

```json
{
  "mcpServers": {
    "postgres-prod": { ... },
    "postgres-dev": { ... }
  }
}
```

## Testing Your Setup

After configuring a server:

1. **Restart your AI client** (Claude Desktop, VS Code, etc.)

2. **Check server status:** Most clients show connected servers in settings or status bar.

3. **Test a simple command:**
   - Filesystem: "List files in my project directory"
   - GitHub: "Show my recent GitHub notifications"
   - Postgres: "List tables in the database"

4. **Check logs:** Look for errors in client logs if something isn't working.

## Server Recommendations

### For Most Users

| Need | Recommended Server |
|------|-------------------|
| File access | `filesystem` |
| Git/GitHub | `github` |
| Documentation | `nexus` |
| Web browsing | `puppeteer` or `playwright` |

### For Developers

| Need | Recommended Server |
|------|-------------------|
| PostgreSQL | `postgres` |
| SQLite | `sqlite` |
| Shell commands | `shell` (use with caution) |
| Docker | `docker` |

### For Data Work

| Need | Recommended Server |
|------|-------------------|
| Vector search | `qdrant`, `pinecone` |
| Data analysis | `jupyter` |
| APIs | `http` |

## Next Steps

- **[MCP Tools Reference](/mcp-tools)** — Learn what each Nexus tool does
- **[Troubleshooting](/troubleshooting)** — More detailed problem-solving
- **[Submitting Servers](/guides/submitting)** — Add your own server to the registry
