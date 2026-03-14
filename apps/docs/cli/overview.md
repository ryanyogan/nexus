# CLI Overview

The Nexus CLI provides commands for configuration, authentication, and running Nexus locally.

## Installation

```bash
npm install -g @nexus/cli
```

Or use npx without installing:

```bash
npx @nexus/cli <command>
```

## Commands

| Command | Description |
|---------|-------------|
| [`nexus init`](/cli/init) | Configure AI clients automatically |
| [`nexus auth`](/cli/auth) | Authentication management |
| [`nexus docs`](/cli/docs) | Search documentation from CLI |
| [`nexus servers`](/cli/servers) | Browse MCP server registry |
| [`nexus skills`](/cli/skills) | Browse skill templates |
| [`nexus serve`](/cli/serve) | Run Nexus locally |

## Quick Reference

```bash
# Configure your AI clients
nexus init

# Authenticate for memory features
nexus auth login

# Search documentation
nexus docs search react "useEffect hooks"

# Find MCP servers
nexus servers search database

# Run Nexus locally
nexus serve
```

## Global Options

| Option | Description |
|--------|-------------|
| `--help`, `-h` | Show help |
| `--version`, `-v` | Show version |
| `--verbose` | Verbose output |
