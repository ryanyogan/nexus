# Project Memory Guide

Best practices for using Nexus memory to maintain context across sessions.

## Memory Types

| Type              | When to Use                            |
| ----------------- | -------------------------------------- |
| `project_context` | Tech stack, architecture, conventions  |
| `session_summary` | End of session summaries               |
| `decision`        | Architectural decisions with rationale |
| `correction`      | Lessons learned, mistakes to avoid     |

## Setting Up a New Project

1. **Save the tech stack**

```
"This project uses Next.js 14 with App Router, Prisma ORM,
Tailwind CSS, and tRPC. We deploy to Vercel."
```

2. **Document conventions**

```
"We use the following conventions:
- Components in src/components with PascalCase
- API routes in src/app/api
- Database models in prisma/schema.prisma"
```

3. **Record important decisions**

```
"Decision: Use Prisma over Drizzle
Rationale: Team familiarity, better docs, stable migrations"
```

## Session Workflow

### Starting a Session

Ask your AI to:

> "Load the context for [project-name] project"

### During the Session

Save important information as you work:

- New architectural decisions
- Lessons learned
- Configuration details

### Ending a Session

Ask your AI to:

> "Summarize what we accomplished and save it as a session summary"

## Memory Importance

Use importance scores 1-10:

- **1-3**: Background info, nice to know
- **4-6**: Useful context (default: 5)
- **7-8**: Important decisions, key architecture
- **9-10**: Critical information, must not forget

## Tags

Use tags for better organization:

- `auth`, `database`, `api`, `frontend`
- `bug`, `feature`, `refactor`
- `urgent`, `todo`, `done`
