# MCP Tools

Stacks integrate with the Nexus MCP server, providing tools for AI assistants to access stack prompts.

## Available Tools

### get-stack

Retrieve a compiled stack prompt by ID or slug.

**Parameters:**

| Name      | Type   | Required | Description      |
| --------- | ------ | -------- | ---------------- |
| `stackId` | string | Yes      | Stack ID or slug |

**Example:**

```typescript
// Using stack slug
get-stack: { stackId: "tanstack-start" }

// Using stack ID
get-stack: { stackId: "stk_tanstack_start" }
```

**Response:**

```json
{
  "id": "stk_tanstack_start",
  "name": "TanStack Start",
  "slug": "tanstack-start",
  "description": "Full-stack React framework with file-based routing",
  "category": "fullstack",
  "tokenBudget": "standard",
  "tokenCount": 4523,
  "compiledPrompt": "# TanStack Start Stack\n\n## Core Concepts...",
  "learningStatus": "complete"
}
```

### list-stacks

List available stacks with optional filtering.

**Parameters:**

| Name       | Type   | Required | Description               |
| ---------- | ------ | -------- | ------------------------- |
| `category` | string | No       | Filter by category        |
| `layer`    | number | No       | Filter by layer (0-3)     |
| `search`   | string | No       | Search query              |
| `limit`    | number | No       | Max results (default: 20) |

**Example:**

```typescript
// List all fullstack stacks
list-stacks: { category: "fullstack" }

// Search for React-related stacks
list-stacks: { search: "react" }
```

**Response:**

```json
{
  "stacks": [
    {
      "id": "stk_tanstack_start",
      "name": "TanStack Start",
      "slug": "tanstack-start",
      "description": "Full-stack React framework",
      "category": "fullstack",
      "layer": 1,
      "tokenCount": 4523,
      "isStarter": true,
      "isFeatured": true
    }
  ],
  "total": 1
}
```

## Usage Patterns

### Starting a Project

```
User: "Help me start a new project using the Cloudflare Workers stack"

AI: [Calls get-stack with "cloudflare-workers"]
AI: "Based on the Cloudflare Workers stack, here's how to set up your project..."
```

### Combining Stacks

```
User: "I need help with a fullstack app using TanStack Start and Drizzle ORM"

AI: [Calls get-stack with "tanstack-start"]
AI: [Calls get-stack with "drizzle-orm"]
AI: "I've loaded both stack contexts. Here's how to integrate them..."
```

### Discovering Stacks

```
User: "What stacks are available for frontend development?"

AI: [Calls list-stacks with { category: "frontend" }]
AI: "Here are the available frontend stacks:
     - Vite + React
     - Svelte 5 + SvelteKit
     - Vue 3 + Nuxt"
```

## Integration

### Claude Desktop

The Nexus MCP server automatically includes stack tools. Configure in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "nexus-mcp"],
      "env": {
        "NEXUS_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Cursor / VS Code

Add to your MCP configuration:

```json
{
  "servers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "nexus-mcp"]
    }
  }
}
```

## Token Usage

Stack prompts count against your token budget. The `tokenCount` field shows the compiled prompt size:

| Budget        | Typical Size   |
| ------------- | -------------- |
| Minimal       | 1,500 - 2,500  |
| Standard      | 4,000 - 6,000  |
| Comprehensive | 8,000 - 12,000 |

## Error Handling

Common errors:

| Code                  | Meaning                     | Solution                            |
| --------------------- | --------------------------- | ----------------------------------- |
| `STACK_NOT_FOUND`     | Stack ID/slug doesn't exist | Check the ID or use `list-stacks`   |
| `STACK_NOT_PUBLIC`    | Stack is private            | Use your own stacks or public ones  |
| `COMPILATION_PENDING` | Stack not yet compiled      | Wait for background job to complete |

## Best Practices

1. **Cache stack prompts** - Reuse within a conversation
2. **Use slugs** - More readable than IDs
3. **Check token count** - Avoid exceeding context limits
4. **Combine wisely** - Don't overload with too many stacks
