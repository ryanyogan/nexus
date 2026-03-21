# MCP Tools Overview

Nexus provides 13 MCP tools organized into three categories: Documentation, Memory, and Server Registry.

<script setup>
import FeatureGrid from '../.vitepress/theme/components/FeatureGrid.vue'
import FeatureCard from '../.vitepress/theme/components/FeatureCard.vue'
import Callout from '../.vitepress/theme/components/Callout.vue'
</script>

## Documentation Tools

Search and explore indexed library documentation with semantic search.

<FeatureGrid>
  <FeatureCard
    icon="&#x1F50D;"
    title="resolve-library"
    description="Find library IDs for documentation queries. Search by name to get the exact ID."
    link="/tools/docs/resolve-library"
  />
  <FeatureCard
    icon="&#x1F4DA;"
    title="query-docs"
    description="Search indexed documentation using semantic search. Returns relevant code examples."
    link="/tools/docs/query-docs"
  />
  <FeatureCard
    icon="&#x2139;&#xFE0F;"
    title="get-library-info"
    description="Get detailed metadata about a library including description and snippet count."
    link="/tools/docs/get-library-info"
  />
  <FeatureCard
    icon="&#x1F4CB;"
    title="list-libraries"
    description="Browse all indexed libraries. Filter by category."
    link="/tools/docs/list-libraries"
  />
</FeatureGrid>

### Quick Reference

| Tool               | Parameters                                | Description             |
| ------------------ | ----------------------------------------- | ----------------------- |
| `resolve-library`  | `libraryName`, `query?`                   | Find library ID by name |
| `query-docs`       | `libraryId`, `query`, `limit?`, `tokens?` | Search documentation    |
| `get-library-info` | `libraryId`                               | Get library metadata    |
| `list-libraries`   | `category?`, `limit?`                     | List indexed libraries  |

## Memory Tools

Store and retrieve persistent context across AI sessions.

<FeatureGrid>
  <FeatureCard
    icon="&#x1F4BE;"
    title="save-memory"
    description="Store project context, decisions, and learnings. Persists across sessions."
    link="/tools/memory/save-memory"
  />
  <FeatureCard
    icon="&#x1F9E0;"
    title="recall-memories"
    description="Retrieve relevant memories using semantic search."
    link="/tools/memory/recall-memories"
  />
  <FeatureCard
    icon="&#x1F4C2;"
    title="get-project-context"
    description="Load all stored context for a specific project."
    link="/tools/memory/get-project-context"
  />
  <FeatureCard
    icon="&#x1F4DD;"
    title="list-memories"
    description="Browse stored memories with filtering options."
    link="/tools/memory/list-memories"
  />
</FeatureGrid>

### Quick Reference

| Tool                  | Parameters                                                     | Description             |
| --------------------- | -------------------------------------------------------------- | ----------------------- |
| `save-memory`         | `title`, `content`, `type`, `project?`, `tags?`, `importance?` | Store a memory          |
| `recall-memories`     | `query`, `project?`, `type?`, `tags?`, `limit?`                | Search memories         |
| `get-project-context` | `project`, `includeTypes?`, `limit?`                           | Get all project context |
| `list-memories`       | `project?`, `type?`, `limit?`, `offset?`                       | Browse memories         |
| `update-memory`       | `memoryId`, `title?`, `content?`, `tags?`, `importance?`       | Update a memory         |
| `delete-memory`       | `memoryId`                                                     | Delete a memory         |

### Memory Types

| Type              | Description                            | Example                                |
| ----------------- | -------------------------------------- | -------------------------------------- |
| `project_context` | Architecture, tech stack, conventions  | "Next.js 14 with App Router"           |
| `session_summary` | What was accomplished                  | "Added authentication flow"            |
| `decision`        | Architectural decisions with rationale | "Chose Prisma over Drizzle because..." |
| `correction`      | Lessons learned, things to avoid       | "Don't use library X, it has issue Y"  |

## Server Registry Tools

Discover and configure MCP servers for additional AI capabilities.

<FeatureGrid>
  <FeatureCard
    icon="&#x1F50E;"
    title="discover-servers"
    description="Find MCP servers by capability, category, or name."
    link="/tools/servers/discover-servers"
  />
  <FeatureCard
    icon="&#x1F4E6;"
    title="get-server-info"
    description="Get detailed documentation about an MCP server."
    link="/tools/servers/get-server-info"
  />
  <FeatureCard
    icon="&#x2699;&#xFE0F;"
    title="get-server-config"
    description="Generate ready-to-use installation configs."
    link="/tools/servers/get-server-config"
  />
</FeatureGrid>

### Quick Reference

| Tool                | Parameters                                                    | Description              |
| ------------------- | ------------------------------------------------------------- | ------------------------ |
| `discover-servers`  | `query?`, `category?`, `capabilities?`, `official?`, `limit?` | Search servers           |
| `get-server-info`   | `serverId`                                                    | Get server documentation |
| `get-server-config` | `serverId`, `format?`                                         | Generate config          |

### Server Categories

- **database** - PostgreSQL, SQLite, MongoDB, etc.
- **filesystem** - File operations, directory access
- **devtools** - Git, GitHub, build tools
- **ai** - AI/ML integrations
- **cloud** - AWS, GCP, Azure services
- **productivity** - Slack, Notion, Linear, etc.

## Authentication

<Callout type="info" title="Authentication Required">
Memory tools (`save-memory`, `update-memory`, `delete-memory`) require authentication. Use the CLI to authenticate:
</Callout>

```bash
nexus auth login
```

Documentation and server registry tools work without authentication.

## Rate Limits

| Plan       | Requests/minute | Requests/day |
| ---------- | --------------- | ------------ |
| Free       | 20              | 1,000        |
| Pro        | 100             | 10,000       |
| Enterprise | Unlimited       | Unlimited    |

## Next Steps

- [resolve-library](/tools/docs/resolve-library) - Start searching documentation
- [save-memory](/tools/memory/save-memory) - Set up persistent memory
- [discover-servers](/tools/servers/discover-servers) - Find MCP servers
