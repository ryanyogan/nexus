# nexus servers

Browse and search the MCP server registry.

## Usage

```bash
nexus servers <command> [options]
```

## Commands

| Command          | Description            |
| ---------------- | ---------------------- |
| `search <query>` | Search for servers     |
| `list`           | List available servers |
| `info <id>`      | Get server details     |
| `config <id>`    | Generate config        |

## Examples

```bash
# Search for database servers
nexus servers search database

# List all servers
nexus servers list

# Get server info
nexus servers info postgres

# Generate Claude Desktop config
nexus servers config postgres --format claude-desktop
```

## Options

| Option             | Description           |
| ------------------ | --------------------- |
| `--category <cat>` | Filter by category    |
| `--official`       | Only official servers |
| `--format <fmt>`   | Config format         |
