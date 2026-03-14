# delete-memory

Delete a memory permanently.

## Description

The `delete-memory` tool permanently removes a memory from storage. This action cannot be undone. Use it to clean up outdated, incorrect, or duplicate memories.

:::warning
This action is permanent. The memory and its embedding will be deleted and cannot be recovered.
:::

:::info Authentication
This tool requires authentication. Only the memory owner can delete their memories.
:::

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `memoryId` | string | Yes | ID of memory to delete |

## Response

Returns an object containing:

- `success` — Whether the deletion succeeded
- `memoryId` — The deleted memory ID
- `message` — Confirmation message

## Example Usage

### Delete a Memory

```json
{
  "name": "delete-memory",
  "arguments": {
    "memoryId": "mem_abc123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "memoryId": "mem_abc123",
  "message": "Memory deleted successfully"
}
```

## AI Conversation Example

```
User: Delete that outdated database memory from before the migration

AI: Let me find the old database memory first.

[Calls recall-memories with query: "database memory before migration"]

Found it - "Database Schema v1 (Deprecated)" (mem_old456). 

Are you sure you want to delete this? This cannot be undone.

User: Yes, delete it

AI: [Calls delete-memory with memoryId: "mem_old456"]

Done! The outdated database schema memory has been permanently deleted.
```

## Use Cases

1. **Remove outdated info** — Delete memories that are no longer accurate
2. **Clean up duplicates** — Remove duplicate entries
3. **Fix mistakes** — Delete incorrectly saved memories
4. **Privacy** — Remove sensitive information

## Best Practices

1. **Verify before deleting** — Use `recall-memories` or `list-memories` to confirm you have the right memory
2. **Consider updating instead** — If the info is partially correct, `update-memory` may be better
3. **Clean up regularly** — Remove stale session summaries and outdated context

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "memoryId is required" | Missing memory ID | Provide a valid memory ID |
| "Memory not found" | Invalid ID or already deleted | Verify the memory exists |
| "Unauthorized" | Not the memory owner | Can only delete your own memories |

## Notes

- Deletion is permanent and cannot be undone
- The memory's embedding is also deleted from vector storage
- Authentication required

## Related Tools

- [list-memories](/mcp-tools/list-memories) — Find memories to delete
- [recall-memories](/mcp-tools/recall-memories) — Search for specific memories
- [update-memory](/mcp-tools/update-memory) — Modify instead of delete
