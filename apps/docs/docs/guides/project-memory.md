# Using Project Memory

Nexus memory gives your AI persistent context across sessions. Instead of re-explaining your project architecture, coding conventions, and past decisions every time, save them once and recall them when needed.

## Memory Types

Nexus organizes memories into four types, each serving a specific purpose:

### project_context

**Use for:** Project architecture, tech stack, conventions, and structure.

This is the foundational context about your project that rarely changes. Load it at the start of sessions to give your AI immediate understanding of your codebase.

```typescript
save-memory: {
  title: "Project Architecture",
  type: "project_context",
  project: "nexus",
  content: `
    Monorepo using Turborepo and pnpm.
    
    Structure:
    - apps/api: Hono API on Cloudflare Workers
    - apps/web: React SPA with TanStack Router
    - apps/docs: Docusaurus documentation site
    - packages/db: Drizzle ORM with D1
    - packages/ui: Shared React components
    
    Key patterns:
    - All code is TypeScript with strict mode
    - API routes use Hono with Zod validation
    - Database access through Drizzle ORM
    - Deployed to Cloudflare (Workers, Pages, D1)
  `,
  tags: ["architecture", "monorepo", "cloudflare"]
}
```

### session_summary

**Use for:** Summaries of what was accomplished in a session.

Save these at the end of significant work sessions to maintain continuity. They help your AI understand recent progress and pick up where you left off.

```typescript
save-memory: {
  title: "Implemented User Authentication",
  type: "session_summary",
  project: "nexus",
  content: `
    Completed JWT authentication system:
    - Added login/register endpoints in apps/api/src/routes/auth.ts
    - Created auth middleware for protected routes
    - Implemented refresh token rotation
    - Added httpOnly cookie handling
    
    Pending:
    - Email verification flow
    - Password reset functionality
  `,
  tags: ["auth", "api", "security"],
  importance: 7
}
```

### decision

**Use for:** Architectural decisions and their rationale.

Document the "why" behind important choices. This helps your AI understand constraints and make consistent recommendations.

```typescript
save-memory: {
  title: "Chose Hono over Express",
  type: "decision",
  project: "nexus",
  content: `
    Decision: Use Hono for API development
    
    Context: Needed a TypeScript-first API framework for Cloudflare Workers
    
    Options considered:
    1. Express - Popular but not edge-native, requires polyfills
    2. Fastify - Good performance but Worker support is experimental
    3. Hono - Built for edge, excellent TypeScript, tiny bundle
    
    Decision: Hono
    
    Rationale:
    - Native Cloudflare Workers support
    - Built-in middleware for common patterns
    - Excellent TypeScript inference
    - Active development and growing ecosystem
    
    Trade-offs:
    - Smaller ecosystem than Express
    - Team needs to learn new patterns
  `,
  tags: ["architecture", "api", "framework"],
  importance: 8
}
```

### correction

**Use for:** Lessons learned and things to avoid.

When you discover a bug, hit a limitation, or learn something the hard way, document it. These memories help your AI avoid repeating mistakes.

```typescript
save-memory: {
  title: "D1 doesn't support JSON columns",
  type: "correction",
  project: "nexus",
  content: `
    Problem: Tried to use JSON column type in D1 schema
    
    What happened: D1 doesn't support native JSON columns like PostgreSQL.
    Drizzle accepts the schema but queries fail at runtime.
    
    Solution: Store JSON as TEXT and parse manually:
    - Define column as text('settings')
    - Use JSON.stringify() when inserting
    - Use JSON.parse() when reading
    - Consider using a $type<MyType>() for TypeScript typing
    
    Alternative: Use SQLite's json_extract() functions for queries
  `,
  tags: ["d1", "database", "gotcha"],
  importance: 9
}
```

## When to Save Memories

### Save project_context when:

- Starting a new project
- Making significant architectural changes
- Updating tech stack or dependencies
- Changing coding conventions

### Save session_summary when:

- Completing a feature or milestone
- Ending a work session with pending tasks
- Making changes that affect future work
- Another person might continue the work

### Save decision when:

- Choosing between competing approaches
- Making irreversible technical choices
- Establishing patterns for the team
- Evaluating trade-offs

### Save correction when:

- Discovering a bug or limitation
- Finding a workaround for an issue
- Learning something non-obvious
- Hitting a "gotcha" others should know about

:::tip Automate session summaries
Ask your AI to save a session summary at the end of each significant session. This builds a valuable history over time.
:::

## Organizing with Tags

Tags make memories searchable and filterable. Use consistent tagging for maximum benefit.

### Recommended Tag Categories

**Technical domain:**
- `auth`, `api`, `database`, `frontend`, `deployment`
- `testing`, `performance`, `security`, `monitoring`

**Scope:**
- `architecture`, `implementation`, `configuration`
- `infrastructure`, `devops`, `tooling`

**Technology:**
- `react`, `hono`, `cloudflare`, `drizzle`
- `typescript`, `d1`, `workers`

**Status/importance:**
- `critical`, `gotcha`, `tip`, `warning`
- `deprecated`, `experimental`

### Tag Best Practices

```typescript
// Good: Specific, consistent tags
tags: ["auth", "api", "jwt", "security"]

// Avoid: Vague or inconsistent tags  
tags: ["stuff", "code", "Auth", "API"]  // Inconsistent casing
```

:::warning Tag casing
Tags are case-sensitive. Use consistent lowercase for all tags to ensure reliable filtering.
:::

## Best Practices

### 1. Keep Memories Focused

One topic per memory. If you're covering multiple areas, split them:

```typescript
// Good: Focused memories
save-memory: { title: "Authentication Architecture", ... }
save-memory: { title: "API Rate Limiting Setup", ... }

// Avoid: Kitchen sink memory
save-memory: { title: "All Backend Stuff", ... }
```

### 2. Use Importance Scores

Importance (1-10) affects how memories rank in search results:

| Score | Use for |
|-------|---------|
| 9-10 | Critical bugs, security issues, breaking changes |
| 7-8 | Important decisions, core architecture |
| 5-6 | Standard features, typical patterns |
| 3-4 | Nice-to-know, minor preferences |
| 1-2 | Temporary notes, experimental ideas |

### 3. Write for Your Future AI

Include enough context that your AI can understand the memory without additional explanation:

```typescript
// Good: Self-contained
content: `
  We use Drizzle ORM with D1 (SQLite). Schema is in packages/db/src/schema.ts.
  Run migrations with: pnpm --filter @nexus/db migrate
  Generate migrations with: pnpm --filter @nexus/db generate
`

// Less useful: Assumes context
content: `
  Use the usual Drizzle commands for migrations.
`
```

### 4. Update Outdated Memories

When information changes, update existing memories rather than creating duplicates:

```typescript
update-memory: {
  memoryId: "mem_abc123",
  content: "Updated architecture description...",
  tags: ["architecture", "v2"]
}
```

### 5. Start Sessions with Context

Begin sessions by loading relevant project context:

```typescript
// At the start of a session
get-project-context: { project: "nexus" }
// Returns all project_context, recent decisions, and corrections
```

## Querying Memories

### Semantic Recall

Use natural language to find relevant memories:

```typescript
recall-memories: {
  query: "How do we handle authentication?",
  project: "nexus"
}
// Returns memories about auth, even if they don't contain the exact word
```

### Filtered Queries

Narrow results with filters:

```typescript
recall-memories: {
  query: "database issues",
  project: "nexus",
  type: "correction",
  tags: ["d1"]
}
```

### Browse All Memories

List memories without semantic search:

```typescript
list-memories: {
  project: "nexus",
  type: "decision",
  limit: 10
}
```

## Memory Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Create    │────►│   Recall    │────►│   Update    │
│  (save)     │     │  (query)    │     │  (modify)   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Delete    │
                                        │ (if stale)  │
                                        └─────────────┘
```

1. **Create** memories when you have valuable context
2. **Recall** memories when you need that context
3. **Update** memories when information changes
4. **Delete** memories when they're no longer relevant

## Summary

| Memory Type | Purpose | Save When |
|-------------|---------|-----------|
| `project_context` | Architecture, stack, conventions | Project setup, major changes |
| `session_summary` | Work accomplished, pending tasks | End of sessions, milestones |
| `decision` | Choices and rationale | Architectural decisions |
| `correction` | Lessons learned, gotchas | Discovering bugs, limitations |

Effective memory use transforms your AI from a stateless tool into a knowledgeable assistant that understands your project deeply.
