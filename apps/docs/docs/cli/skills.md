# nexus skills

Manage AI skills - specialized capabilities that enhance your AI assistant.

## Synopsis

```bash
nexus skills <subcommand> [options]
```

## Subcommands

| Subcommand | Description |
|------------|-------------|
| `list` | List available skills |
| `add` | Search and install a skill |
| `gain` | AI-powered skill discovery and installation |
| `remove` | Uninstall a skill |

---

## nexus skills list

List available skills from the Nexus skill registry.

### Synopsis

```bash
nexus skills list [options]
```

### Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--installed` | `-i` | Show only installed skills |
| `--category <category>` | `-c` | Filter by category |
| `--json` | | Output results as JSON |

### Categories

- `coding` - Code generation and refactoring
- `testing` - Test writing and debugging
- `docs` - Documentation generation
- `devops` - CI/CD and infrastructure
- `data` - Data processing and analysis
- `security` - Security analysis and auditing

### Examples

```bash
# List all available skills
nexus skills list

# List only installed skills
nexus skills list --installed

# Filter by category
nexus skills list --category testing
```

### Output

```bash
$ nexus skills list

Available Skills

  typescript-expert
    Advanced TypeScript patterns, generics, and type manipulation
  react-testing
    Write comprehensive React tests with Testing Library and Jest
  api-design
    RESTful and GraphQL API design best practices
  sql-optimizer
    SQL query optimization and database schema design
```

### JSON Output

```json
{
  "skills": [
    {
      "id": "typescript-expert",
      "name": "typescript-expert",
      "description": "Advanced TypeScript patterns, generics, and type manipulation",
      "categories": ["coding"]
    }
  ]
}
```

---

## nexus skills add

Search for and install a skill by name.

### Synopsis

```bash
nexus skills add <name> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `name` | Skill name to search for |

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Requirements

- Must be authenticated (`nexus auth login`)

### Examples

```bash
# Search and install TypeScript skill
nexus skills add typescript

# Install React testing skill
nexus skills add react-testing
```

### Output

```bash
$ nexus skills add typescript

Searching for skill: typescript
Found: typescript-expert

Installing typescript-expert...
  ✓ Skill installed successfully

The skill is now available in your MCP-enabled editors.
```

### JSON Output

```json
{
  "skill": "typescript-expert",
  "status": "installed",
  "message": "Skill installed successfully"
}
```

---

## nexus skills gain

AI-powered skill discovery - describe what you want to accomplish and let AI find the right skills.

### Synopsis

```bash
nexus skills gain <description> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `description` | Natural language description of what you want to accomplish |

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Requirements

- Must be authenticated (`nexus auth login`)

### Examples

```bash
# Find skills for writing better tests
nexus skills gain "I want to write better unit tests for React components"

# Find skills for API development
nexus skills gain "Help me design RESTful APIs with proper error handling"

# Find skills for TypeScript
nexus skills gain "I struggle with TypeScript generics and advanced types"
```

### Output

```bash
$ nexus skills gain "I want to write better unit tests for React components"

Analyzing: "I want to write better unit tests for React components"

Recommended skills:
  1. react-testing (95% match)
     Write comprehensive React tests with Testing Library and Jest
  
  2. jest-expert (82% match)
     Advanced Jest configuration and mocking patterns
  
  3. tdd-master (71% match)
     Test-driven development practices and patterns

Install a skill? [1/2/3/n]:
```

### JSON Output

```json
{
  "description": "I want to write better unit tests for React components",
  "recommendations": [
    {
      "skill": "react-testing",
      "match": 0.95,
      "description": "Write comprehensive React tests with Testing Library and Jest"
    },
    {
      "skill": "jest-expert",
      "match": 0.82,
      "description": "Advanced Jest configuration and mocking patterns"
    }
  ]
}
```

---

## nexus skills remove

Uninstall a skill from your account.

### Synopsis

```bash
nexus skills remove <name> [options]
```

### Arguments

| Argument | Description |
|----------|-------------|
| `name` | Skill name to remove |

### Options

| Option | Description |
|--------|-------------|
| `--json` | Output results as JSON |

### Requirements

- Must be authenticated (`nexus auth login`)

### Examples

```bash
# Remove a skill
nexus skills remove typescript-expert
```

### Output

```bash
$ nexus skills remove typescript-expert

Removing skill: typescript-expert
  ✓ Skill removed successfully
```

### JSON Output

```json
{
  "skill": "typescript-expert",
  "status": "removed"
}
```

---

## How Skills Work

Skills are specialized instruction sets that enhance your AI assistant's capabilities in specific domains. When installed:

1. **Activated automatically** - Skills become available in your MCP-enabled editors
2. **Context-aware** - Skills are loaded when relevant to your current task
3. **Combinable** - Multiple skills can work together
4. **Updatable** - Skills receive updates from the registry

## Skill Storage

Installed skills are tracked in your Nexus account and synchronized across devices. Local caching is stored in:

```
~/.nexus/cache/skills/
```

## Creating Custom Skills

You can create and share custom skills. See the [Submitting Guide](/guides/submitting) for details on contributing.

## See Also

- [nexus auth](./auth.md) - Authentication required for skill management
- [nexus serve](./serve.md) - Run MCP server with skills enabled
