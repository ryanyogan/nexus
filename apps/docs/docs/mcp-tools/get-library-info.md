# get-library-info

Get detailed information about a specific library including description, version, documentation coverage, and usage statistics.

## Description

The `get-library-info` tool retrieves comprehensive metadata about an indexed library. Use it to understand what documentation is available, check the library version, or see usage statistics.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `libraryId` | string | Yes | The library ID (e.g., 'react', 'nextjs', 'hono') |

## Response

Returns an object containing:

- `libraryId` — The library identifier
- `name` — Display name
- `description` — Library description
- `version` — Indexed version
- `categories` — Library categories
- `source` — Source information:
  - `type` — Source type (github, npm, etc.)
  - `url` — Source URL
  - `repository` — Repository URL
  - `homepage` — Homepage URL
- `documentation` — Documentation stats:
  - `status` — Index status (indexed, pending, failed)
  - `totalChunks` — Number of documentation chunks
  - `totalTokens` — Estimated total tokens
  - `lastIndexedAt` — Last indexing timestamp
- `usage` — Usage statistics (if available):
  - `totalQueries` — Number of queries
  - `totalChunkHits` — Total chunk retrievals
  - `lastQueriedAt` — Last query timestamp
- `isFeatured` — Whether this is a featured library

## Example Usage

### Basic Request

```json
{
  "name": "get-library-info",
  "arguments": {
    "libraryId": "hono"
  }
}
```

**Response:**
```json
{
  "libraryId": "hono",
  "name": "Hono",
  "description": "Small, simple, and ultrafast web framework for Cloudflare Workers, Fastly, Deno, Bun, Vercel, and Node.js",
  "version": "4.0.0",
  "categories": ["backend", "web-framework"],
  "source": {
    "type": "github",
    "url": "https://github.com/honojs/hono",
    "repository": "https://github.com/honojs/hono",
    "homepage": "https://hono.dev"
  },
  "documentation": {
    "status": "indexed",
    "totalChunks": 850,
    "totalTokens": 320000,
    "lastIndexedAt": "2024-01-15T10:30:00Z"
  },
  "usage": {
    "totalQueries": 1250,
    "totalChunkHits": 4800,
    "lastQueriedAt": "2024-01-20T14:22:00Z"
  },
  "isFeatured": true
}
```

## AI Conversation Example

```
User: Is the Drizzle ORM documentation available in Nexus?

AI: Let me check if Drizzle ORM documentation is indexed.

[Calls resolve-library with libraryName: "drizzle"]

Found it! Let me get the details.

[Calls get-library-info with libraryId: "drizzle-orm"]

Yes, Drizzle ORM documentation is available:
- Version: 0.29.0
- Coverage: 620 documentation chunks
- Categories: database, orm
- Last updated: January 18, 2024

The documentation covers the full Drizzle API including:
- Schema definitions
- Query building  
- Migrations
- Database adapters

Would you like me to search for something specific?
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "libraryId is required" | Missing library ID | Provide a valid library ID |
| "Library not found" | Invalid or unknown ID | Use `resolve-library` to find valid IDs |

## Use Cases

1. **Check documentation availability** — Verify a library is indexed before querying
2. **Version verification** — Ensure docs match your library version
3. **Coverage assessment** — See how much documentation is available
4. **Explore categories** — Understand library classification

## Notes

- Usage statistics may be null for new or rarely-used libraries
- The `lastIndexedAt` timestamp shows documentation freshness
- Featured libraries are highlighted in listings

## Related Tools

- [resolve-library](/mcp-tools/resolve-library) — Find library IDs by name
- [query-docs](/mcp-tools/query-docs) — Search library documentation
- [list-libraries](/mcp-tools/list-libraries) — Browse all available libraries
