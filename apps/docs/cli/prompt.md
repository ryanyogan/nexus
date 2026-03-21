# nexus prompt

Manage AI working environments (prompts).

## Usage

```bash
nexus prompt <command> [options]
```

## Commands

### list

List available prompts.

```bash
nexus prompt list [options]
```

**Options:**

| Option        | Description                    |
| ------------- | ------------------------------ |
| `--active`    | Only show active prompts       |
| `--installed` | Only show installed prompts    |
| `--starter`   | Only show starter pack prompts |
| `--json`      | Output as JSON                 |

**Examples:**

```bash
# List all prompts
nexus prompt list

# List active prompts only
nexus prompt list --active

# Get JSON for scripting
nexus prompt list --json
```

### get

Get details about a specific prompt.

```bash
nexus prompt get <prompt-id>
```

**Arguments:**

| Argument    | Description       |
| ----------- | ----------------- |
| `prompt-id` | Prompt ID or slug |

**Examples:**

```bash
nexus prompt get react-typescript-expert
```

### active

Show currently active prompts.

```bash
nexus prompt active [options]
```

**Options:**

| Option   | Description    |
| -------- | -------------- |
| `--json` | Output as JSON |

### activate

Activate a prompt.

```bash
nexus prompt activate <prompt-id> [options]
```

**Arguments:**

| Argument    | Description                   |
| ----------- | ----------------------------- |
| `prompt-id` | Prompt ID or slug to activate |

**Options:**

| Option           | Description                            |
| ---------------- | -------------------------------------- |
| `--priority <n>` | Set priority (lower = higher priority) |

**Examples:**

```bash
# Activate a prompt
nexus prompt activate react-typescript-expert

# Activate with specific priority
nexus prompt activate testing-qa --priority 2
```

### deactivate

Deactivate a prompt.

```bash
nexus prompt deactivate <prompt-id>
nexus prompt deactivate --all
```

**Arguments:**

| Argument    | Description                     |
| ----------- | ------------------------------- |
| `prompt-id` | Prompt ID or slug to deactivate |

**Options:**

| Option  | Description            |
| ------- | ---------------------- |
| `--all` | Deactivate all prompts |

### download

Download a prompt as FLOW.md.

```bash
nexus prompt download <prompt-id> [options]
```

**Arguments:**

| Argument    | Description                   |
| ----------- | ----------------------------- |
| `prompt-id` | Prompt ID or slug to download |

**Options:**

| Option            | Description                         |
| ----------------- | ----------------------------------- |
| `--output <path>` | Output file path (default: FLOW.md) |
| `--resolve`       | Include resolved parent content     |

**Examples:**

```bash
# Download to FLOW.md
nexus prompt download react-typescript-expert

# Download to custom path
nexus prompt download my-prompt --output ./docs/prompt.md
```

### create

Create a new custom prompt.

```bash
nexus prompt create [options]
```

**Options:**

| Option                 | Description                 |
| ---------------------- | --------------------------- |
| `--name <name>`        | Prompt name                 |
| `--slug <slug>`        | URL-friendly slug           |
| `--description <desc>` | Prompt description          |
| `--prompt <prompt>`    | System prompt               |
| `--parent <id>`        | Parent prompt to extend     |
| `--libraries <ids>`    | Comma-separated library IDs |
| `--skills <ids>`       | Comma-separated skill IDs   |
| `--interactive`        | Interactive mode            |

**Examples:**

```bash
# Interactive creation
nexus prompt create --interactive

# Direct creation
nexus prompt create \
  --name "My Prompt" \
  --slug "my-prompt" \
  --description "Custom prompt" \
  --parent react-typescript-expert
```

## Starter Pack Prompts

Nexus includes these pre-configured prompts:

| Slug                      | Description                   |
| ------------------------- | ----------------------------- |
| `react-typescript-expert` | Modern React with TypeScript  |
| `fullstack-developer`     | Full-stack web development    |
| `testing-qa-engineer`     | Testing and quality assurance |
| `ui-ux-designer`          | Design systems and UX         |
| `api-developer`           | REST and GraphQL APIs         |
| `tanstack-cloudflare`     | TanStack Start + Cloudflare   |

## See Also

- [Prompts Overview](/prompts/overview)
- [Creating Prompts](/prompts/creating-prompts)
- [Prompt MCP Tools](/prompts/mcp-tools)
