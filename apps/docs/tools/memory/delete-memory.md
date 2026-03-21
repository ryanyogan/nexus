# delete-memory

Delete a memory permanently.

## Example Prompts

> "Delete the outdated authentication decision"

> "Remove the memory about the old database setup"

> "Clear the incorrect project context memory"

## Usage

```
Tool: delete-memory
Parameters:
  - memoryId (required): ID of memory to delete
```

## Example

**Input:**

```json
{
  "memoryId": "mem_abc123"
}
```

**Output:**

```json
{
  "deleted": true,
  "id": "mem_abc123"
}
```

## Parameters

| Parameter  | Type   | Required | Description         |
| ---------- | ------ | -------- | ------------------- |
| `memoryId` | string | Yes      | Memory ID to delete |

## Authentication

This tool requires authentication.

## Warning

This action is permanent and cannot be undone.
