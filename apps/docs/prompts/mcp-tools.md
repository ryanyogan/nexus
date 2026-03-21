# Prompt MCP Tools

Nexus exposes prompt management through MCP tools, allowing AI agents to work with prompts programmatically.

## Available Tools

### list-prompts

List all available prompts with optional filtering.

**Parameters:**

| Parameter       | Type    | Description                      |
| --------------- | ------- | -------------------------------- |
| `activeOnly`    | boolean | Only return active prompts       |
| `installedOnly` | boolean | Only return installed prompts    |
| `starterOnly`   | boolean | Only return starter pack prompts |

**Example:**

```json
{
  "name": "list-prompts",
  "arguments": {
    "activeOnly": false,
    "installedOnly": true
  }
}
```

### get-prompt

Get detailed information about a specific prompt.

**Parameters:**

| Parameter  | Type    | Required | Description               |
| ---------- | ------- | -------- | ------------------------- |
| `promptId` | string  | Yes      | Prompt ID or slug         |
| `resolve`  | boolean | No       | Resolve inheritance chain |

**Example:**

```json
{
  "name": "get-prompt",
  "arguments": {
    "promptId": "react-typescript-expert",
    "resolve": true
  }
}
```

### get-active-prompts

Get all currently active prompts for the user, ordered by priority.

**Parameters:** None

**Returns:** Array of active prompts with their configurations merged.

### activate-prompt

Activate a prompt for the current user.

**Parameters:**

| Parameter  | Type   | Required | Description                              |
| ---------- | ------ | -------- | ---------------------------------------- |
| `promptId` | string | Yes      | Prompt ID or slug                        |
| `priority` | number | No       | Priority order (lower = higher priority) |

**Example:**

```json
{
  "name": "activate-prompt",
  "arguments": {
    "promptId": "testing-qa-engineer",
    "priority": 2
  }
}
```

### deactivate-prompt

Deactivate a specific prompt or all prompts.

**Parameters:**

| Parameter  | Type    | Required | Description                     |
| ---------- | ------- | -------- | ------------------------------- |
| `promptId` | string  | No\*     | Prompt ID or slug to deactivate |
| `all`      | boolean | No\*     | Deactivate all prompts          |

\*One of `promptId` or `all` is required.

**Example:**

```json
{
  "name": "deactivate-prompt",
  "arguments": {
    "promptId": "react-typescript-expert"
  }
}
```

### download-prompt

Download a prompt as markdown content.

**Parameters:**

| Parameter  | Type    | Required | Description                     |
| ---------- | ------- | -------- | ------------------------------- |
| `promptId` | string  | Yes      | Prompt ID or slug               |
| `resolve`  | boolean | No       | Include resolved parent content |

**Returns:** Markdown content of the prompt suitable for FLOW.md files.

### suggest-prompts

Get AI-powered prompt suggestions based on project context.

**Parameters:**

| Parameter      | Type     | Required | Description              |
| -------------- | -------- | -------- | ------------------------ |
| `projectPath`  | string   | No       | Path to analyze          |
| `dependencies` | string[] | No       | Package dependencies     |
| `files`        | string[] | No       | File patterns in project |
| `description`  | string   | No       | Project description      |

**Example:**

```json
{
  "name": "suggest-prompts",
  "arguments": {
    "dependencies": ["react", "typescript", "vitest"],
    "description": "React app with testing"
  }
}
```

**Returns:** Array of recommended prompts with confidence scores.

### create-prompt

Create a new custom prompt.

**Parameters:**

| Parameter        | Type     | Required | Description             |
| ---------------- | -------- | -------- | ----------------------- |
| `name`           | string   | Yes      | Prompt name             |
| `slug`           | string   | Yes      | URL-friendly slug       |
| `description`    | string   | No       | Prompt description      |
| `systemPrompt`   | string   | Yes      | System prompt content   |
| `parentPromptId` | string   | No       | Parent prompt to extend |
| `libraries`      | string[] | No       | Library IDs to include  |
| `skills`         | string[] | No       | Skill IDs to include    |
| `preferences`    | object   | No       | Response preferences    |

**Example:**

```json
{
  "name": "create-prompt",
  "arguments": {
    "name": "My Custom Prompt",
    "slug": "my-custom-prompt",
    "systemPrompt": "You are a helpful assistant...",
    "libraries": ["react", "typescript"],
    "preferences": {
      "verbosity": "concise",
      "codeStyle": "documented"
    }
  }
}
```

## Usage Patterns

### Initial Context Loading

At the start of a session, check for active prompts:

```
1. Call get-active-prompts to see current configuration
2. If no prompts active, call suggest-prompts with project context
3. Offer to activate recommended prompts
```

### Project-Aware Activation

When entering a new project directory:

```
1. Check for .nexus/config.json with defaultPrompt
2. If found, call activate-prompt with the default
3. Otherwise, call suggest-prompts for recommendations
```

### Memory Association

When saving memories while prompts are active:

```
1. Call get-active-prompts to get current prompt IDs
2. Include promptId in save-memory call
3. Memories are automatically associated
```

## Error Handling

All tools return standardized errors:

| Error                 | Code | Description                     |
| --------------------- | ---- | ------------------------------- |
| `PromptNotFound`      | 404  | Prompt ID or slug doesn't exist |
| `NotAuthenticated`    | 401  | API key required                |
| `PromptAlreadyActive` | 409  | Prompt is already activated     |
| `MaxDepthExceeded`    | 400  | Inheritance chain too deep      |
| `PermissionDenied`    | 403  | Cannot modify this prompt       |
