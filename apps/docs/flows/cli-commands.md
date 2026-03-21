# Flow CLI Commands

The Nexus CLI provides comprehensive commands for managing flows.

## nexus flow list

List all available flows.

```bash
nexus flow list [options]
```

### Options

| Option        | Description                  |
| ------------- | ---------------------------- |
| `--active`    | Only show active flows       |
| `--installed` | Only show installed flows    |
| `--starter`   | Only show starter pack flows |
| `--json`      | Output as JSON               |

### Examples

```bash
# List all flows
nexus flow list

# List only active flows
nexus flow list --active

# List starter packs
nexus flow list --starter

# Get JSON output for scripting
nexus flow list --json
```

## nexus flow get

Get detailed information about a specific flow.

```bash
nexus flow get <flow-id-or-slug>
```

### Examples

```bash
# Get flow by slug
nexus flow get react-typescript-expert

# Get flow by ID
nexus flow get flw_abc123
```

## nexus flow active

Show currently active flows.

```bash
nexus flow active [options]
```

### Options

| Option   | Description    |
| -------- | -------------- |
| `--json` | Output as JSON |

### Examples

```bash
# Show active flows
nexus flow active

# Get JSON output
nexus flow active --json
```

## nexus flow activate

Activate a flow.

```bash
nexus flow activate <flow-id-or-slug> [options]
```

### Options

| Option                | Description                            |
| --------------------- | -------------------------------------- |
| `--priority <number>` | Set priority (lower = higher priority) |

### Examples

```bash
# Activate a flow
nexus flow activate react-typescript-expert

# Activate with specific priority
nexus flow activate testing-qa --priority 2
```

## nexus flow deactivate

Deactivate a flow.

```bash
nexus flow deactivate <flow-id-or-slug>
```

### Examples

```bash
# Deactivate a specific flow
nexus flow deactivate react-typescript-expert

# Deactivate all flows
nexus flow deactivate --all
```

## nexus flow download

Download a flow as a FLOW.md file.

```bash
nexus flow download <flow-id-or-slug> [options]
```

### Options

| Option            | Description                          |
| ----------------- | ------------------------------------ |
| `--output <path>` | Output file path (default: FLOW.md)  |
| `--resolve`       | Include resolved parent flow content |

### Examples

```bash
# Download to FLOW.md
nexus flow download react-typescript-expert

# Download to specific file
nexus flow download react-typescript-expert --output ./docs/react-flow.md

# Download with inheritance resolved
nexus flow download my-custom-flow --resolve
```

## nexus flow create

Create a new custom flow.

```bash
nexus flow create [options]
```

### Options

| Option                 | Description                          |
| ---------------------- | ------------------------------------ |
| `--name <name>`        | Flow name                            |
| `--slug <slug>`        | URL-friendly slug                    |
| `--description <desc>` | Flow description                     |
| `--prompt <prompt>`    | System prompt                        |
| `--parent <id>`        | Parent flow to extend                |
| `--libraries <ids>`    | Comma-separated library IDs          |
| `--skills <ids>`       | Comma-separated skill IDs            |
| `--interactive`        | Interactive mode (prompts for input) |

### Examples

```bash
# Interactive creation
nexus flow create --interactive

# Create with options
nexus flow create \
  --name "My React Flow" \
  --slug "my-react-flow" \
  --description "Custom React setup" \
  --parent react-typescript-expert \
  --libraries react,typescript
```

## Environment Variables

| Variable             | Description                |
| -------------------- | -------------------------- |
| `NEXUS_API_KEY`      | API key for authentication |
| `NEXUS_DEFAULT_FLOW` | Default flow to activate   |

## Exit Codes

| Code | Meaning                 |
| ---- | ----------------------- |
| 0    | Success                 |
| 1    | General error           |
| 2    | Authentication required |
| 3    | Flow not found          |
| 4    | Permission denied       |
