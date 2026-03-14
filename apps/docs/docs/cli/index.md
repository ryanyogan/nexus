# Nexus CLI Reference

The Nexus CLI provides a command-line interface for managing documentation, AI skills, MCP servers, and authentication.

## Installation

```bash
# Install globally with npm
npm install -g @nexus/cli

# Or with pnpm
pnpm add -g @nexus/cli

# Or run directly with npx
npx @nexus/cli
```

## Quick Start

```bash
# Set up Nexus interactively
nexus init

# Authenticate with Nexus
nexus auth login

# Search documentation
nexus docs search react hooks

# List available MCP servers
nexus servers list

# Run as a local MCP server
nexus serve
```

## Global Options

These options are available for all commands:

| Option | Description |
|--------|-------------|
| `-v, --version` | Display the current version |
| `--json` | Output results as JSON (for scripting) |
| `--verbose` | Enable verbose logging |
| `--no-color` | Disable colored output |
| `-h, --help` | Display help for command |

### Examples

```bash
# Get version
nexus --version

# Get JSON output for scripting
nexus auth status --json

# Disable colors (useful for CI/logs)
nexus docs search react --no-color
```

## Commands

| Command | Description |
|---------|-------------|
| [`init`](./init.md) | Interactive setup wizard |
| [`auth`](./auth.md) | Manage authentication (login, logout, status) |
| [`docs`](./docs.md) | Search and cache documentation |
| [`skills`](./skills.md) | Manage AI skills |
| [`servers`](./servers.md) | Manage MCP servers |
| [`serve`](./serve.md) | Run Nexus as a local MCP server |
| [`stats`](#stats-command) | View usage and billing information |

## Stats Command

View your usage, billing, and subscription information.

```bash
nexus stats
```

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Output

The stats command displays:

- **Plan**: Your current subscription plan (Free, Pro, or Team)
- **Billing Period**: When your current billing cycle ends
- **API Usage**: Number of queries used this month with visual progress bar
- **Resources**: Count of API keys, installed skills, memories, and secrets

### Example

```bash
$ nexus stats

  Nexus Stats for user@example.com

  Plan: PRO (active)
  Billing Period ends: 12/31/2025

  ┌─────────────────────────────────────────────────────┐
  │ API Usage                                           │
  ├─────────────────────────────────────────────────────┤
  │ Queries this month:    150 / unlimited              │
  │ ██████████░░░░░░░░░░░░░░░░░░░░ 15%                  │
  └─────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────┐
  │ Resources                                           │
  ├─────────────────────────────────────────────────────┤
  │ API Keys:            2 / 10                         │
  │ Installed Skills:    5                              │
  │ Memories:           23 / 1000                       │
  │ Secrets:             3                              │
  └─────────────────────────────────────────────────────┘
```

## Configuration

See [Configuration](./configuration.md) for details on config files, environment variables, and editor setup.

## Supported Editors

Nexus CLI can configure MCP servers for:

- **Claude Code** - Anthropic's official CLI
- **Cursor** - AI-first code editor
- **VS Code** - Visual Studio Code
- **OpenCode** - Open-source AI coding assistant
- **Zed** - High-performance code editor

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | General error |
| `2` | Authentication required |
| `3` | Network/API error |
