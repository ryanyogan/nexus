# resolve-library

Search for a library or package by name to get its library ID. Use this tool before `query-docs` to find the correct library identifier.

## Description

The `resolve-library` tool performs a fuzzy search across all indexed libraries and returns matching results with their IDs, descriptions, and documentation coverage statistics. This is typically the first step when you want to search library documentation.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `libraryName` | string | Yes | The name of the library to search for (e.g., 'react', 'nextjs', 'hono') |
| `query` | string | No | The task or question you need help with. Used to rank results by relevance. |

## Response

Returns an object containing:

- `success` — Whether the search succeeded
- `query` — The search term used
- `results` — Array of matching libraries with:
  - `libraryId` — The ID to use with `query-docs`
  - `name` — Library display name
  - `description` — Brief description
  - `version` — Current indexed version
  - `documentationCoverage` — Chunk and token counts
  - `categories` — Library categories
  - `links` — Homepage and repository URLs
- `recommendation` — Suggested next step

## Example Usage

### Basic Search

```json
{
  "name": "resolve-library",
  "arguments": {
    "libraryName": "react"
  }
}
```

**Response:**
```json
{
  "success": true,
  "query": "react",
  "results": [
    {
      "libraryId": "react",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "version": "18.2.0",
      "documentationCoverage": {
        "chunks": 1250,
        "estimatedTokens": 450000
      },
      "categories": ["frontend", "ui"],
      "links": {
        "homepage": "https://react.dev",
        "repository": "https://github.com/facebook/react"
      }
    }
  ],
  "recommendation": "Use libraryId \"react\" with query-docs to search this library's documentation."
}
```

### Search with Context

```json
{
  "name": "resolve-library",
  "arguments": {
    "libraryName": "next",
    "query": "server components and data fetching"
  }
}
```

## AI Conversation Example

```
User: How do I set up routing in Next.js 15?

AI: Let me find the Next.js documentation first.

[Calls resolve-library with libraryName: "nextjs"]

Found Next.js with library ID "nextjs". Now searching for routing documentation...

[Calls query-docs with libraryId: "nextjs", query: "app router setup"]

Here's how to set up routing in Next.js 15...
```

## Notes

- The search is case-insensitive and performs fuzzy matching
- Results are ordered by featured status and documentation coverage
- Multiple libraries may match a single query (e.g., "react" matches "react", "react-router", etc.)
- Use the most specific match for your needs

## Related Tools

- [query-docs](/mcp-tools/query-docs) — Search documentation with the library ID
- [get-library-info](/mcp-tools/get-library-info) — Get detailed library metadata
- [list-libraries](/mcp-tools/list-libraries) — Browse all available libraries
