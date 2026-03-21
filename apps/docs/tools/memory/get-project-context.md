# get-project-context

Get all stored context for a specific project. Returns project architecture, conventions, recent decisions, and lessons learned.

## Example Prompts

Use this at the start of a new session to catch up on project context:

> "Load the context for my-saas project"

> "What do you know about the nexus project?"

> "Get me up to speed on this codebase"

> "Recall all project context and decisions"

## Usage

```
Tool: get-project-context
Parameters:
  - project (required): Project name
  - includeTypes (optional): Filter to specific types
  - limit (optional): Max memories per type (default 5)
```

## Example

**Input:**

```json
{
  "project": "my-saas"
}
```

**Output:**

```json
{
  "project": "my-saas",
  "context": {
    "project_context": [...],
    "decision": [...],
    "correction": [...],
    "session_summary": [...]
  }
}
```

## Parameters

| Parameter      | Type     | Required | Description                      |
| -------------- | -------- | -------- | -------------------------------- |
| `project`      | string   | Yes      | Project name                     |
| `includeTypes` | string[] | No       | Filter to specific types         |
| `limit`        | number   | No       | Max memories per type, default 5 |

## Tip

Call this at the start of each session to load all project context.
