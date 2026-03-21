# nexus docs

Search library documentation from the command line.

## Usage

```bash
nexus docs <command> [options]
```

## Commands

| Command                    | Description              |
| -------------------------- | ------------------------ |
| `search <library> <query>` | Search documentation     |
| `list`                     | List available libraries |
| `info <library>`           | Get library info         |

## Examples

```bash
# Search React documentation
nexus docs search react "useEffect cleanup"

# List all libraries
nexus docs list

# Get library info
nexus docs info nextjs

# Filter by category
nexus docs list --category frontend
```

## Options

| Option             | Description               |
| ------------------ | ------------------------- |
| `--limit <n>`      | Max results (default 5)   |
| `--format <fmt>`   | Output format: text, json |
| `--category <cat>` | Filter by category        |
