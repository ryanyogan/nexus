# list-libraries

List all available indexed libraries. Optionally filter by category.

## Example Prompts

> "What documentation libraries are available?"

> "Show me all the backend framework docs you have"

> "List the database libraries with indexed documentation"

> "What testing frameworks can you help me with?"

## Usage

```
Tool: list-libraries
Parameters:
  - category (optional): Filter by category
  - limit (optional): Max results (1-50, default 20)
```

## Example

**Input:**

```json
{
  "category": "frontend",
  "limit": 10
}
```

**Output:**

```json
{
  "libraries": [
    { "id": "react", "name": "React", "snippets": 2341 },
    { "id": "vue", "name": "Vue.js", "snippets": 1892 },
    { "id": "svelte", "name": "Svelte", "snippets": 987 }
  ],
  "total": 45
}
```

## Parameters

| Parameter  | Type   | Required | Description                  |
| ---------- | ------ | -------- | ---------------------------- |
| `category` | string | No       | Filter by category           |
| `limit`    | number | No       | Max results 1-50, default 20 |

## Categories

- `frontend` - React, Vue, Svelte, Angular
- `backend` - Express, Fastify, NestJS, Hono
- `fullstack` - Next.js, Remix, Nuxt, SvelteKit
- `database` - Prisma, Drizzle, Mongoose
- `cloud` - AWS SDK, Cloudflare Workers
- `devops` - Docker, Kubernetes
- `ai` - LangChain, OpenAI, Anthropic
- `testing` - Jest, Vitest, Playwright
- `mobile` - React Native, Expo
- `utilities` - Lodash, date-fns, zod

## Returns

- `libraries` - Array of library summaries
- `total` - Total count in category
