# update-memory

Update an existing memory. Can modify content, title, tags, importance, or summary.

## Description

The `update-memory` tool modifies an existing memory. Use it to keep memories current as projects evolve, fix errors, or adjust importance levels. If you update the content, the semantic search embedding is regenerated automatically.

:::info Authentication
This tool requires authentication. Only the memory owner can update their memories.
:::

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `memoryId` | string | Yes | ID of memory to update |
| `content` | string | No | New content (will regenerate embedding) |
| `title` | string | No | New title |
| `tags` | array | No | New tags (replaces existing) |
| `importance` | number | No | New importance score (1-10) |
| `summary` | string | No | New summary |

## Response

Returns an object containing:

- `success` — Whether the update succeeded
- `memoryId` — The updated memory ID
- `message` — Confirmation message
- `updated` — Object showing what fields were changed
- `memory` — The updated memory object

## Example Usage

### Update Content

```json
{
  "name": "update-memory",
  "arguments": {
    "memoryId": "mem_abc123",
    "content": "The Nexus project now uses Better Auth v2 with GitHub OAuth and Google OAuth. Sessions are stored in D1 with 30-day expiry. Added support for magic link authentication in v1.2.",
    "summary": "Auth architecture with GitHub, Google, and magic links"
  }
}
```

**Response:**
```json
{
  "success": true,
  "memoryId": "mem_abc123",
  "message": "Memory updated successfully",
  "updated": {
    "content": true,
    "summary": true,
    "embedding": true
  },
  "memory": {
    "id": "mem_abc123",
    "title": "Nexus Authentication Architecture",
    "type": "project_context",
    "project": "nexus",
    "importance": 8,
    "updatedAt": "2024-01-20T16:45:00Z"
  }
}
```

### Update Importance

```json
{
  "name": "update-memory",
  "arguments": {
    "memoryId": "mem_def456",
    "importance": 9
  }
}
```

### Update Tags

```json
{
  "name": "update-memory",
  "arguments": {
    "memoryId": "mem_def456",
    "tags": ["auth", "security", "oauth", "production"]
  }
}
```

### Update Title

```json
{
  "name": "update-memory",
  "arguments": {
    "memoryId": "mem_ghi789",
    "title": "Database Schema v2 (Post-Migration)"
  }
}
```

## AI Conversation Example

```
User: Update the auth memory to include the new Google OAuth support

AI: Let me update the authentication memory.

[First calls recall-memories with query: "authentication architecture" to get the memory ID]

Found the auth memory (mem_abc123). Updating it now.

[Calls update-memory with:
  memoryId: "mem_abc123"
  content: "The Nexus project uses Better Auth with multiple providers:
  - GitHub OAuth (primary)
  - Google OAuth (added in v1.2)
  - Magic link email auth
  
  Sessions are stored in D1 database with 30-day expiry.
  The auth middleware extracts user from session cookie.
  
  New in v1.2:
  - Google OAuth support
  - Account linking between providers
  - Session refresh tokens"
]

Updated! The authentication memory now includes Google OAuth and the v1.2 changes.
```

## Use Cases

1. **Keep current** — Update memories as projects evolve
2. **Fix errors** — Correct mistakes in stored information
3. **Adjust importance** — Increase importance for critical info
4. **Better organization** — Update tags for improved searchability
5. **Add context** — Expand memories with new learnings

## Notes

- Updating content regenerates the semantic search embedding
- Tags are replaced entirely, not merged
- You can update multiple fields in a single call
- Only the memory owner can perform updates

## Related Tools

- [save-memory](/mcp-tools/save-memory) — Create new memories
- [recall-memories](/mcp-tools/recall-memories) — Find memories to update
- [list-memories](/mcp-tools/list-memories) — Browse memories
- [delete-memory](/mcp-tools/delete-memory) — Remove memories
