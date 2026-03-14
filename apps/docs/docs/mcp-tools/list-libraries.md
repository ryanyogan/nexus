# list-libraries

List all available indexed libraries. Optionally filter by category to discover what documentation is available.

## Description

The `list-libraries` tool returns a paginated list of all libraries with indexed documentation in Nexus. Use it to discover available libraries or explore documentation by category.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category (see categories below) |
| `limit` | number | No | Maximum results to return (1-50, default 20) |

### Available Categories

- `frontend` — React, Vue, Angular, Svelte, etc.
- `backend` — Express, Hono, Fastify, etc.
- `fullstack` — Next.js, Remix, Nuxt, etc.
- `database` — Drizzle, Prisma, Mongoose, etc.
- `cloud` — AWS SDK, Cloudflare, Vercel, etc.
- `devops` — Docker, Kubernetes, Terraform, etc.
- `ai` — OpenAI, LangChain, Transformers, etc.
- `testing` — Jest, Vitest, Playwright, etc.
- `mobile` — React Native, Expo, etc.
- `utilities` — Lodash, date-fns, Zod, etc.

## Response

Returns an object containing:

- `success` — Whether the request succeeded
- `category` — Category filter applied (or "all")
- `count` — Number of libraries returned
- `libraries` — Array of library summaries:
  - `libraryId` — The ID for use with other tools
  - `name` — Library display name
  - `description` — Brief description
  - `categories` — All categories for this library
  - `version` — Current indexed version
  - `documentationChunks` — Number of doc chunks
  - `isFeatured` — Whether library is featured
- `availableCategories` — List of all valid categories

## Example Usage

### List All Libraries

```json
{
  "name": "list-libraries",
  "arguments": {}
}
```

### Filter by Category

```json
{
  "name": "list-libraries",
  "arguments": {
    "category": "database",
    "limit": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "category": "database",
  "count": 8,
  "libraries": [
    {
      "libraryId": "drizzle-orm",
      "name": "Drizzle ORM",
      "description": "TypeScript ORM with maximum type safety",
      "categories": ["database", "orm"],
      "version": "0.29.0",
      "documentationChunks": 620,
      "isFeatured": true
    },
    {
      "libraryId": "prisma",
      "name": "Prisma",
      "description": "Next-generation ORM for Node.js and TypeScript",
      "categories": ["database", "orm"],
      "version": "5.8.0",
      "documentationChunks": 1100,
      "isFeatured": true
    }
  ],
  "availableCategories": [
    "frontend", "backend", "fullstack", "database",
    "cloud", "devops", "ai", "testing", "mobile", "utilities"
  ]
}
```

## AI Conversation Example

```
User: What frontend libraries do you have documentation for?

AI: Let me check the available frontend libraries.

[Calls list-libraries with category: "frontend"]

Here are the frontend libraries with indexed documentation:

| Library | Version | Coverage |
|---------|---------|----------|
| React | 18.2.0 | 1,250 chunks |
| Vue.js | 3.4.0 | 980 chunks |
| Svelte | 4.2.0 | 650 chunks |
| Angular | 17.0.0 | 1,400 chunks |
| Solid.js | 1.8.0 | 420 chunks |

All of these have semantic search available. Which would you like to explore?
```

## Use Cases

1. **Discovery** — Find what libraries have documentation available
2. **Category exploration** — Browse libraries in a specific domain
3. **Coverage comparison** — Compare documentation depth across libraries
4. **Featured libraries** — Find popular, well-documented libraries

## Notes

- Results are ordered by featured status and documentation coverage
- Featured libraries appear first
- A library may appear in multiple categories
- Documentation chunk count indicates coverage depth

## Related Tools

- [resolve-library](/mcp-tools/resolve-library) — Search for a specific library by name
- [get-library-info](/mcp-tools/get-library-info) — Get detailed library metadata
- [query-docs](/mcp-tools/query-docs) — Search library documentation
