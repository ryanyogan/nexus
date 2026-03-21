# Prompt CLI Commands

The Nexus CLI provides comprehensive commands for managing prompts.

## nexus prompt list

List all available prompts.

```bash
nexus prompt list [options]
```

### Options

| Option        | Description                  |
| ------------- | ---------------------------- |
| `--active`    | Only show active prompts       |
| `--installed` | Only show installed prompts    |
| `--starter`   | Only show starter pack prompts |
| `--json`      | Output as JSON               |

### Examples

```bash
# List all prompts
nexus prompt list

# List only active prompts
nexus prompt list --active

# List starter packs
nexus prompt list --starter

# Get JSON output for scripting
nexus prompt list --json
```

## nexus prompt get

Get detailed information about a specific prompt.

```bash
nexus prompt get <prompt-id-or-slug>
```

### Examples

```bash
# Get prompt by slug
nexus prompt get react-typescript-expert

# Get prompt by ID
nexus prompt get flw_abc123
```

## nexus prompt active

Show currently active prompts.

```bash
nexus prompt active [options]
```

### Options

| Option   | Description    |
| -------- | -------------- |
| `--json` | Output as JSON |

### Examples

```bash
# Show active prompts
nexus prompt active

# Get JSON output
nexus prompt active --json
```

## nexus prompt activate

Activate a prompt.

```bash
nexus prompt activate <prompt-id-or-slug> [options]
```

### Options

| Option                | Description                            |
| --------------------- | -------------------------------------- |
| `--priority <number>` | Set priority (lower = higher priority) |

### Examples

```bash
# Activate a prompt
nexus prompt activate react-typescript-expert

# Activate with specific priority
nexus prompt activate testing-qa --priority 2
```

## nexus prompt deactivate

Deactivate a prompt.

```bash
nexus prompt deactivate <prompt-id-or-slug>
```

### Examples

```bash
# Deactivate a specific prompt
nexus prompt deactivate react-typescript-expert

# Deactivate all prompts
nexus prompt deactivate --all
```

## nexus prompt download

Download a prompt as a FLOW.md file.

```bash
nexus prompt download <prompt-id-or-slug> [options]
```

### Options

| Option            | Description                          |
| ----------------- | ------------------------------------ |
| `--output <path>` | Output file path (default: FLOW.md)  |
| `--resolve`       | Include resolved parent prompt content |

### Examples

```bash
# Download to FLOW.md
nexus prompt download react-typescript-expert

# Download to specific file
nexus prompt download react-typescript-expert --output ./docs/react-prompt.md

# Download with inheritance resolved
nexus prompt download my-custom-prompt --resolve
```

## nexus prompt create

Create a new custom prompt.

```bash
nexus prompt create [options]
```

### Options

| Option                 | Description                          |
| ---------------------- | ------------------------------------ |
| `--name <name>`        | Prompt name                            |
| `--slug <slug>`        | URL-friendly slug                    |
| `--description <desc>` | Prompt description                     |
| `--prompt <prompt>`    | System prompt                        |
| `--parent <id>`        | Parent prompt to extend                |
| `--libraries <ids>`    | Comma-separated library IDs          |
| `--skills <ids>`       | Comma-separated skill IDs            |
| `--interactive`        | Interactive mode (prompts for input) |

### Examples

```bash
# Interactive creation
nexus prompt create --interactive

# Create with options
nexus prompt create \
  --name "My React Prompt" \
  --slug "my-react-prompt" \
  --description "Custom React setup" \
  --parent react-typescript-expert \
  --libraries react,typescript
```

## Environment Variables

| Variable             | Description                |
| -------------------- | -------------------------- |
| `NEXUS_API_KEY`      | API key for authentication |
| `NEXUS_DEFAULT_FLOW` | Default prompt to activate   |

## Exit Codes

| Code | Meaning                 |
| ---- | ----------------------- |
| 0    | Success                 |
| 1    | General error           |
| 2    | Authentication required |
| 3    | Prompt not found          |
| 4    | Permission denied       |
