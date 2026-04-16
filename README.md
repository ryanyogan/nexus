# Nexus

Shared memory and documentation search for multi-agent AI systems, deployed on Cloudflare Workers.

## What It Is

Nexus is an MCP platform that solves two problems current agent tooling handles poorly: agents cannot share memory across sessions, and documentation search requires per-library integration work that nobody wants to maintain.

The memory system stores context as semantic embeddings across Cloudflare's D1 (metadata), R2 (content), and Vectorize (768-dimensional vectors). When Agent A saves a decision — "we chose JWT tokens in httpOnly cookies for auth" — Agent B can recall it later by meaning, not keywords. Memories are typed (project context, session summaries, decisions, corrections), scoped (global or per-user), and importance-weighted. This makes institutional knowledge persistent and compound across conversations instead of dying when a session ends.

The documentation layer provides semantic search across 100+ libraries, synced weekly from Context7 and indexed via Cloudflare Workers AI embeddings. Query by meaning ("how to memoize with useCallback") rather than keyword matching. Responses are configurable: full, compact, code-only, or summary — because token budgets matter when you are inside an MCP tool call.

Nexus started as a context-injection tool for a single editor. After user testing, it became clear that the real gap was not "inject docs into my prompt" but "let multiple agents build shared understanding." The pivot reshaped the entire architecture around multi-agent memory as the primary use case.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Monorepo (Turbo)                     │
│                                                           │
│  apps/                          packages/                 │
│  ├── web (TanStack Start)       ├── cli (nexus-cli)      │
│  ├── api (Hono on Workers)      ├── sdk (@nexus/sdk)     │
│  └── docs                       ├── db (Drizzle + D1)    │
│                                  ├── auth (Better Auth)   │
│                                  ├── logger               │
│                                  └── ui (shared React)    │
└──────────────────────────────────────────────────────────┘

Memory Flow:
  save-memory ─► Workers AI (embed) ─► D1 (metadata)
                                    ─► R2 (content)
                                    ─► Vectorize (768D vector)

  recall-memories ─► Vectorize (semantic search)
                  ─► R2 (hydrate content)
                  ─► D1 (filter by type/scope/project)

Documentation Flow:
  resolve-library ─► D1 (lookup library ID)
  query-docs ─► Vectorize (semantic search over chunks)
             ─► R2 (retrieve chunk content)
             ─► format response (full/compact/code-only/summary)
```

### MCP Surface

33 MCP tools exposed via HTTP, stdio, and SSE transports:

| Category | Tools | Purpose |
|----------|-------|---------|
| **Documentation** | resolve-library, query-docs, get-library-info, list-libraries | Semantic search across 100+ indexed libraries |
| **Memory** | save-memory, recall-memories, get-project-context, list-memories, update-memory, delete-memory | Persistent, shared context across agents and sessions |
| **Servers** | discover-servers, get-server-config, list-server-categories | MCP server directory and installation configs |
| **Skills** | Dynamic discovery | AI skill marketplace |
| **Stacks** | Tech detection | Repository technology analysis |

### Async Processing

Two Cloudflare Queue workers handle background jobs:

- **nexus-ingestion**: Fetches library docs from GitHub/websites, chunks content, generates embeddings, upserts into D1/R2/Vectorize. Retries up to 3 times.
- **nexus-stack-learning**: Analyzes repositories for tech stack detection (package.json, Dockerfile, requirements.txt).

Weekly scheduled sync (Sundays 2am UTC) keeps 100+ library indexes current against Context7.

## Why This Matters

The current MCP ecosystem treats each agent as isolated. Your coding assistant in VS Code and your coding assistant in the terminal build no shared understanding — every session starts from zero. Production teams running multiple agents across different tools lose context at every boundary.

Nexus makes memory a shared resource rather than a per-agent feature. The semantic embedding layer means agents find relevant context by meaning, not by knowing which exact key to look up. The type system (decisions, corrections, project context, session summaries) means you can ask "what architectural decisions have been made on this project" and get a structured answer from across every agent that has ever contributed.

The documentation search exists because the alternative — each MCP server reimplementing docs lookup for each library — does not scale. One ingestion pipeline, one embedding model, one search interface, 100+ libraries.

## Status

Active development. API deployed on Cloudflare Workers. Documentation index covers 100+ libraries. Memory system is functional and in use. CLI and SDK published on npm.

## Stack

- **API:** Hono on Cloudflare Workers
- **Frontend:** TanStack Start (React)
- **Database:** Cloudflare D1 (SQLite) via Drizzle ORM
- **Vector search:** Cloudflare Vectorize (768D, bge-base-en-v1.5)
- **Object storage:** Cloudflare R2
- **Embeddings:** Cloudflare Workers AI
- **Queue:** Cloudflare Queues (async ingestion)
- **Auth:** Better Auth + Google/GitHub OAuth
- **Monorepo:** Turbo + pnpm workspaces
- **Languages:** TypeScript throughout

## License

MIT
