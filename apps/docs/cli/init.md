# nexus init

Configure AI clients automatically. Detects installed clients and adds Nexus configuration.

## Usage

```bash
nexus init [options]
```

## Options

| Option            | Description                         |
| ----------------- | ----------------------------------- |
| `--local`         | Configure for local mode            |
| `--remote`        | Configure for remote mode (default) |
| `--client <name>` | Specific client to configure        |
| `--force`         | Overwrite existing configuration    |

## Examples

```bash
# Interactive configuration
nexus init

# Configure specific client
nexus init --client claude-desktop

# Configure for local mode
nexus init --local
```

## Supported Clients

- Claude Desktop
- Cursor
- VS Code (Copilot)
- OpenCode
