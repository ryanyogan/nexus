# Nexus CLI

The official CLI for Nexus - Documentation search, skills, MCP servers, and more for AI assistants.

## Installation

```bash
npm install -g nexus-cli
```

Or use it directly with npx:

```bash
npx nexus-cli --help
```

## Quick Start

```bash
# Initialize Nexus and configure your editors
nexus init

# Authenticate with Nexus
nexus auth login

# Search documentation
nexus docs search "react useEffect"

# Download docs for offline use
nexus docs download react typescript

# View your usage stats
nexus stats
```

## Commands

### Authentication

```bash
nexus auth login          # Authenticate via browser
nexus auth login --token  # Authenticate with API token
nexus auth logout         # Clear credentials
nexus auth status         # Show current auth state
```

### Documentation

```bash
nexus docs search <query>           # Search across libraries
nexus docs fetch <library> <query>  # Fetch from specific library
nexus docs download <libs...>       # Cache docs for offline use
nexus docs download --from-deps     # Cache docs for package.json deps
nexus docs cached                   # List cached docs
nexus docs clear                    # Clear doc cache
```

### Skills

```bash
nexus skills list                   # List available skills
nexus skills list --installed       # List installed skills
nexus skills add <name>             # Search and install a skill
nexus skills gain "<description>"   # AI-powered skill discovery
nexus skills remove <name>          # Uninstall a skill
```

### MCP Servers

```bash
nexus servers list                  # List available servers
nexus servers search <query>        # Search by capability
nexus servers add <name>            # Install to your editors
nexus servers info <name>           # Show server details
nexus servers remove <name>         # Remove from editors
```

### MCP Server Mode

```bash
nexus serve                         # Run as stdio MCP server
nexus serve --http                  # Run as HTTP MCP server
nexus serve --offline               # Run in offline mode
```

### Other Commands

```bash
nexus init                          # Interactive setup wizard
nexus stats                         # View usage and billing
```

## Global Options

All commands support these options:

```bash
--json        Output results as JSON (for CI/scripts)
--verbose     Enable verbose logging
--no-color    Disable colored output
```

## Configuration

### Global Config

Located at `~/.nexus/config.json`:

```json
{
  "auth": {
    "token": "nxs_...",
    "email": "user@example.com"
  },
  "editors": ["claude-code", "cursor", "opencode"],
  "preferences": {
    "warnOnRateLimit": true
  }
}
```

### Project Config

Located at `.nexus/config.json` in your project:

```json
{
  "editors": ["claude-code"],
  "cachedLibraries": ["react", "typescript"]
}
```

### Offline Cache

Documentation is cached in `.nexus/cache/docs/` for offline use:

```
.nexus/
├── config.json
└── cache/
    └── docs/
        ├── react.json
        └── typescript.json
```

## Supported Editors

The CLI can configure MCP servers for:

- **Claude Code** - Uses `claude mcp add` CLI
- **Cursor** - Updates `~/.cursor/mcp.json`
- **OpenCode** - Updates `opencode.json`
- **VS Code** - Updates `.vscode/mcp.json`
- **Zed** - Updates `~/.config/zed/settings.json`

## License

MIT
