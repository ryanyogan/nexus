# Flow MCP Tools

Nexus exposes flow management through MCP tools, allowing AI agents to work with flows programmatically.

## Available Tools

### list-flows

List all available flows with optional filtering.

**Parameters:**

| Parameter       | Type    | Description                    |
| --------------- | ------- | ------------------------------ |
| `activeOnly`    | boolean | Only return active flows       |
| `installedOnly` | boolean | Only return installed flows    |
| `starterOnly`   | boolean | Only return starter pack flows |

**Example:**

```json
{
  "name": "list-flows",
  "arguments": {
    "activeOnly": false,
    "installedOnly": true
  }
}
```

### get-flow

Get detailed information about a specific flow.

**Parameters:**

| Parameter | Type    | Required | Description               |
| --------- | ------- | -------- | ------------------------- |
| `flowId`  | string  | Yes      | Flow ID or slug           |
| `resolve` | boolean | No       | Resolve inheritance chain |

**Example:**

```json
{
  "name": "get-flow",
  "arguments": {
    "flowId": "react-typescript-expert",
    "resolve": true
  }
}
```

### get-active-flows

Get all currently active flows for the user, ordered by priority.

**Parameters:** None

**Returns:** Array of active flows with their configurations merged.

### activate-flow

Activate a flow for the current user.

**Parameters:**

| Parameter  | Type   | Required | Description                              |
| ---------- | ------ | -------- | ---------------------------------------- |
| `flowId`   | string | Yes      | Flow ID or slug                          |
| `priority` | number | No       | Priority order (lower = higher priority) |

**Example:**

```json
{
  "name": "activate-flow",
  "arguments": {
    "flowId": "testing-qa-engineer",
    "priority": 2
  }
}
```

### deactivate-flow

Deactivate a specific flow or all flows.

**Parameters:**

| Parameter | Type    | Required | Description                   |
| --------- | ------- | -------- | ----------------------------- |
| `flowId`  | string  | No\*     | Flow ID or slug to deactivate |
| `all`     | boolean | No\*     | Deactivate all flows          |

\*One of `flowId` or `all` is required.

**Example:**

```json
{
  "name": "deactivate-flow",
  "arguments": {
    "flowId": "react-typescript-expert"
  }
}
```

### download-flow

Download a flow as markdown content.

**Parameters:**

| Parameter | Type    | Required | Description                     |
| --------- | ------- | -------- | ------------------------------- |
| `flowId`  | string  | Yes      | Flow ID or slug                 |
| `resolve` | boolean | No       | Include resolved parent content |

**Returns:** Markdown content of the flow suitable for FLOW.md files.

### suggest-flows

Get AI-powered flow suggestions based on project context.

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
  "name": "suggest-flows",
  "arguments": {
    "dependencies": ["react", "typescript", "vitest"],
    "description": "React app with testing"
  }
}
```

**Returns:** Array of recommended flows with confidence scores.

### create-flow

Create a new custom flow.

**Parameters:**

| Parameter      | Type     | Required | Description            |
| -------------- | -------- | -------- | ---------------------- |
| `name`         | string   | Yes      | Flow name              |
| `slug`         | string   | Yes      | URL-friendly slug      |
| `description`  | string   | No       | Flow description       |
| `systemPrompt` | string   | Yes      | System prompt content  |
| `parentFlowId` | string   | No       | Parent flow to extend  |
| `libraries`    | string[] | No       | Library IDs to include |
| `skills`       | string[] | No       | Skill IDs to include   |
| `preferences`  | object   | No       | Response preferences   |

**Example:**

```json
{
  "name": "create-flow",
  "arguments": {
    "name": "My Custom Flow",
    "slug": "my-custom-flow",
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

At the start of a session, check for active flows:

```
1. Call get-active-flows to see current configuration
2. If no flows active, call suggest-flows with project context
3. Offer to activate recommended flows
```

### Project-Aware Activation

When entering a new project directory:

```
1. Check for .nexus/config.json with defaultFlow
2. If found, call activate-flow with the default
3. Otherwise, call suggest-flows for recommendations
```

### Memory Association

When saving memories while flows are active:

```
1. Call get-active-flows to get current flow IDs
2. Include flowId in save-memory call
3. Memories are automatically associated
```

## Error Handling

All tools return standardized errors:

| Error               | Code | Description                   |
| ------------------- | ---- | ----------------------------- |
| `FlowNotFound`      | 404  | Flow ID or slug doesn't exist |
| `NotAuthenticated`  | 401  | API key required              |
| `FlowAlreadyActive` | 409  | Flow is already activated     |
| `MaxDepthExceeded`  | 400  | Inheritance chain too deep    |
| `PermissionDenied`  | 403  | Cannot modify this flow       |
