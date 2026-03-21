# nexus flow

Manage AI working environments (flows).

## Usage

```bash
nexus flow <command> [options]
```

## Commands

### list

List available flows.

```bash
nexus flow list [options]
```

**Options:**

| Option        | Description                  |
| ------------- | ---------------------------- |
| `--active`    | Only show active flows       |
| `--installed` | Only show installed flows    |
| `--starter`   | Only show starter pack flows |
| `--json`      | Output as JSON               |

**Examples:**

```bash
# List all flows
nexus flow list

# List active flows only
nexus flow list --active

# Get JSON for scripting
nexus flow list --json
```

### get

Get details about a specific flow.

```bash
nexus flow get <flow-id>
```

**Arguments:**

| Argument  | Description     |
| --------- | --------------- |
| `flow-id` | Flow ID or slug |

**Examples:**

```bash
nexus flow get react-typescript-expert
```

### active

Show currently active flows.

```bash
nexus flow active [options]
```

**Options:**

| Option   | Description    |
| -------- | -------------- |
| `--json` | Output as JSON |

### activate

Activate a flow.

```bash
nexus flow activate <flow-id> [options]
```

**Arguments:**

| Argument  | Description                 |
| --------- | --------------------------- |
| `flow-id` | Flow ID or slug to activate |

**Options:**

| Option           | Description                            |
| ---------------- | -------------------------------------- |
| `--priority <n>` | Set priority (lower = higher priority) |

**Examples:**

```bash
# Activate a flow
nexus flow activate react-typescript-expert

# Activate with specific priority
nexus flow activate testing-qa --priority 2
```

### deactivate

Deactivate a flow.

```bash
nexus flow deactivate <flow-id>
nexus flow deactivate --all
```

**Arguments:**

| Argument  | Description                   |
| --------- | ----------------------------- |
| `flow-id` | Flow ID or slug to deactivate |

**Options:**

| Option  | Description          |
| ------- | -------------------- |
| `--all` | Deactivate all flows |

### download

Download a flow as FLOW.md.

```bash
nexus flow download <flow-id> [options]
```

**Arguments:**

| Argument  | Description                 |
| --------- | --------------------------- |
| `flow-id` | Flow ID or slug to download |

**Options:**

| Option            | Description                         |
| ----------------- | ----------------------------------- |
| `--output <path>` | Output file path (default: FLOW.md) |
| `--resolve`       | Include resolved parent content     |

**Examples:**

```bash
# Download to FLOW.md
nexus flow download react-typescript-expert

# Download to custom path
nexus flow download my-flow --output ./docs/flow.md
```

### create

Create a new custom flow.

```bash
nexus flow create [options]
```

**Options:**

| Option                 | Description                 |
| ---------------------- | --------------------------- |
| `--name <name>`        | Flow name                   |
| `--slug <slug>`        | URL-friendly slug           |
| `--description <desc>` | Flow description            |
| `--prompt <prompt>`    | System prompt               |
| `--parent <id>`        | Parent flow to extend       |
| `--libraries <ids>`    | Comma-separated library IDs |
| `--skills <ids>`       | Comma-separated skill IDs   |
| `--interactive`        | Interactive mode            |

**Examples:**

```bash
# Interactive creation
nexus flow create --interactive

# Direct creation
nexus flow create \
  --name "My Flow" \
  --slug "my-flow" \
  --description "Custom flow" \
  --parent react-typescript-expert
```

## Starter Pack Flows

Nexus includes these pre-configured flows:

| Slug                      | Description                   |
| ------------------------- | ----------------------------- |
| `react-typescript-expert` | Modern React with TypeScript  |
| `fullstack-developer`     | Full-stack web development    |
| `testing-qa-engineer`     | Testing and quality assurance |
| `ui-ux-designer`          | Design systems and UX         |
| `api-developer`           | REST and GraphQL APIs         |
| `tanstack-cloudflare`     | TanStack Start + Cloudflare   |

## See Also

- [Flows Overview](/flows/overview)
- [Creating Flows](/flows/creating-flows)
- [Flow MCP Tools](/flows/mcp-tools)
