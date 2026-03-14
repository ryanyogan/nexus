# Nexus - MCP Platform Specification

## Overview

Nexus is a comprehensive MCP (Model Context Protocol) platform competing with Context7. It provides AI agents with access to library documentation, MCP servers, AI skills, and persistent memory - all optimized for token efficiency.

**Live URLs:**
- Web: https://nexus.yogan.dev
- API: https://api.nexus.yogan.dev
- Docs: https://docs.nexus.yogan.dev

## Architecture

### Tech Stack
- **Frontend**: TanStack Start (React), TailwindCSS, deployed on Cloudflare Workers
- **API**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Vector Search**: Cloudflare Vectorize (for docs and memories)
- **Storage**: Cloudflare R2 (docs bucket, memories bucket)
- **Auth**: Better Auth with GitHub/Google OAuth
- **Docs Site**: Astro Starlight

### Key Features
1. **Library Documentation** - Indexed docs with semantic search, 4 response formats
2. **MCP Servers** - Directory of MCP servers with installation configs
3. **AI Skills** - Installable skills that enhance AI capabilities
4. **Memory System** - Persistent project context, decisions, corrections
5. **User Preferences** - Customizable response formats, token budgets

---

## Completed Work

### Phase 1: UI Redesign (Matching Context7 Style)

#### Header Redesign
- **File**: `/apps/web/src/components/Header.tsx`
- CSS-based hover dropdown for "More..." menu
- Links to: Libraries, MCP Servers, AI Skills, Memory, Documentation
- Settings link in authenticated user menu
- Clean, minimal design

#### Landing Page Enhancement
- **File**: `/apps/web/src/routes/index.tsx`
- Token savings section (90% savings claim, ~50ms latency)
- "How It Works" section (4-step process: Query -> Search -> Filter -> Deliver)
- Response formats section showing all 4 format options
- Feature cards for Libraries, MCP Servers, Skills, Memory

#### Explore Pages Redesign
All explore pages now use minimal list design with pagination:

1. **Libraries** (`/apps/web/src/routes/explore/docs.tsx`)
   - Compact library rows with search
   - Category filter pills
   - URL-based pagination via TanStack Router search params

2. **MCP Servers** (`/apps/web/src/routes/explore/servers.index.tsx`)
   - Compact server rows with security indicators
   - Category filtering
   - Pagination

3. **AI Skills** (`/apps/web/src/routes/explore/skills.index.tsx`)
   - Compact skill rows with type badges
   - Pagination

### Phase 2: User Settings System

#### Database Schema
- **File**: `/packages/db/src/schema.ts`
- Added `userPreferences` table:
  - `defaultResponseFormat`: full | compact | code-only | summary
  - `defaultTokenBudget`: optional token limit
  - `showCodeLineNumbers`: boolean
  - `preferredCodeLanguage`: string
  - `emailNotifications`: boolean
  - `emailWeeklyDigest`: boolean

#### API Endpoints
- **File**: `/apps/api/src/routes/user.ts`
- `GET /user/preferences` - Fetch preferences (returns defaults if none)
- `PUT /user/preferences` - Create/update preferences with validation

#### Settings Page
- **File**: `/apps/web/src/routes/_authed/settings/index.tsx`
- Response format selection with visual cards
- Token budget input with validation
- Code preferences (line numbers, preferred language)
- Email notification toggles
- Loading state, error handling, success feedback

#### Migration
- **File**: `/packages/db/migrations/0015_user_preferences.sql`
- Creates `user_preferences` table
- Unique index on `user_id`
- Deployed to production D1

### Phase 3: Documentation

#### Architecture Docs
- **File**: `/apps/docs/src/content/docs/features/architecture.mdx`
- Explains token savings mechanism
- Infrastructure diagram (Cloudflare stack)
- Query flow explanation
- Response format details

#### Sidebar Update
- **File**: `/apps/docs/astro.config.mjs`
- Added Architecture link to Features section

### Phase 4: Nexus CLI (Complete)

#### Package Setup
- **Location**: `/packages/cli/`
- **Package name**: `nexus-cli`
- **Commands**: `nexus` and `nxs` (aliases)
- **Framework**: Commander.js for CLI parsing

#### CLI Structure
```
nexus auth login       # OAuth via browser or API token
nexus auth logout      # Clear credentials
nexus auth status      # Show authentication state

nexus docs search      # Search documentation across libraries
nexus docs fetch       # Fetch docs for specific library
nexus docs download    # Download docs for offline use
nexus docs cached      # List cached documentation
nexus docs clear       # Clear documentation cache

nexus servers list     # List available MCP servers
nexus servers search   # Search servers by capability
nexus servers add      # Install server to editors
nexus servers remove   # Remove server from editors
nexus servers info     # Show server details
nexus servers installed # List installed servers per editor

nexus skills list      # List available skills (stub)
nexus skills add       # Add skill (stub)

nexus init             # Setup wizard
nexus stats            # Usage dashboard
nexus serve            # Run MCP server locally
```

#### MCP Server Mode
The CLI can run as a local MCP server via `nexus serve`:
- **Transport**: stdio (for local integration)
- **Tools exposed**:
  - `resolve-library` - Find libraries by name
  - `query-docs` - Search documentation
  - `get-library-info` - Get library details
  - `list-libraries` - List all indexed libraries
  - `save-memory` - Store context/decisions
  - `recall-memories` - Search stored memories
  - `get-project-context` - Get all project context
  - `discover-servers` - Find MCP servers
  - `get-server-info` - Get server details
  - `get-server-config` - Get installation config

#### Browser Auth Flow
CLI uses a polling-based browser auth flow:
1. CLI calls `POST /api/cli/auth/start` to get a verification code
2. CLI opens browser to `/auth/cli?code={code}`
3. User signs in via OAuth (GitHub/Google)
4. Web app calls `POST /api/cli/auth/complete`
5. CLI polls `GET /api/cli/auth/poll` until complete
6. CLI receives and stores API token

#### Editor Adapters
Full adapter system for managing MCP server configs across editors:

| Editor | Config Location | Format |
|--------|----------------|--------|
| Claude Code | `~/.claude/` (via CLI) | `claude mcp add` command |
| Cursor | `~/.cursor/mcp.json` | `{ "mcpServers": { ... } }` |
| VS Code | `.vscode/mcp.json` | `{ "servers": { ... } }` |
| OpenCode | `opencode.json` | `{ "mcp": { ... } }` |
| Zed | `~/.config/zed/settings.json` | `{ "context_servers": { ... } }` |

**Adapter Files:**
- `adapters/types.ts` - Interface definitions
- `adapters/base.ts` - Abstract base class for JSON config editors
- `adapters/cursor.ts` - Cursor adapter
- `adapters/vscode.ts` - VS Code adapter
- `adapters/opencode.ts` - OpenCode adapter
- `adapters/zed.ts` - Zed adapter
- `adapters/claude-code.ts` - Claude Code adapter (uses CLI)
- `adapters/index.ts` - Registry and factory functions

#### SDK Integration
- Uses `@nexus/sdk` for API calls
- Methods: `searchLibrary()`, `queryDocs()`, `getLibrary()`, `discoverServers()`, `getServer()`, `getServerConfig()`

#### Config Management
- Global config: `~/.nexus/config.json` (auth, default editors)
- Project config: `.nexus/config.json` (project-specific editors)
- Cache: `.nexus/cache/docs/` (downloaded documentation)

---

## Remaining Work / Future Enhancements

### High Priority

1. **Documentation Crawler Completion** (See "Current Work" section below)
   - Public submission pages for libraries and skills
   - Library detail page redesign with quality metrics
   - Apply migration to production D1
   - Weekly refresh cron job

2. **Apply User Preferences to MCP Queries**
   - Currently preferences are stored but not used
   - Need to read user's `defaultResponseFormat` when handling MCP tool calls
   - Apply `defaultTokenBudget` to limit response size

3. **API Token Scopes**
   - Tokens have scopes defined but not enforced
   - Implement scope checking in API routes

4. **Usage Analytics**
   - Analytics Engine binding exists but not used
   - Track API calls per user for billing/limits

### Medium Priority

5. **CLI Interactive TUI**
   - Ink-based React components for interactive selection
   - Better UX for `nexus init`, `nexus servers add`

6. **Improve Search Quality**
   - Better ranking for library search results
   - Hybrid search (keyword + semantic)

7. **Memory System Enhancements**
   - Memory tagging UI
   - Memory search in web UI (currently MCP only)

### Low Priority / Nice-to-Have

8. **Dark Mode**
   - Design system supports it, needs implementation

9. **Performance Optimization**
   - Code splitting for CodeMirror (large bundle)
   - Lazy load explore pages

10. **Email Integration**
    - Weekly digest emails (preferences exist, no email service)
    - Notification emails for submissions

11. **Team Features**
    - Team subscription exists in schema
    - Need team management UI, shared memories

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts (Better Auth) |
| `accounts` | OAuth connections |
| `sessions` | Auth sessions |
| `libraries` | Indexed documentation libraries |
| `libraryVersions` | Version tracking for libraries |
| `libraryFiles` | Individual files per library (for incremental updates) |
| `refreshJobs` | Documentation refresh job tracking |
| `chunks` | Chunked docs for vector search |
| `libraryStats` | Usage statistics per library |
| `mcpServers` | MCP server directory |
| `mcpServerDocs` | Links servers to their documentation |
| `mcpServerStats` | Usage statistics per server |
| `serverSubmissions` | User-submitted servers pending review |
| `skills` | AI skill definitions |
| `skillSubmissions` | User-submitted skills pending review |
| `userSkills` | Installed skills per user |
| `memories` | Persistent memory storage |
| `userPreferences` | User settings (response format, etc.) |
| `apiTokens` | API authentication tokens |
| `userSecrets` | Encrypted secrets for MCP servers |
| `subscriptions` | User subscription status |
| `teams` | Team organizations |
| `teamMembers` | Team membership |
| `syncJobs` | Context7 sync job history (legacy) |

---

## API Routes

### Public
- `GET /libraries` - List libraries
- `GET /libraries/:id` - Get library details
- `GET /servers` - List MCP servers
- `GET /servers/:id` - Get server details
- `GET /skills` - List skills

### MCP Tools (API key required)
- `POST /mcp/resolve-library` - Find library ID by name
- `POST /mcp/query-docs` - Search documentation
- `POST /mcp/get-library-info` - Get library metadata
- `POST /mcp/list-libraries` - List all libraries
- Memory tools (save, recall, list, update, delete)
- Server tools (discover, get-info, get-config)

### Authenticated (session required)
- `GET /user/stats` - Dashboard statistics
- `GET/POST/DELETE /user/tokens` - API token management
- `GET/PUT /user/preferences` - User settings
- `GET /user/skills` - Installed skills
- `POST /user/skills/:id/install` - Install skill
- `POST /user/skills/:id/uninstall` - Uninstall skill
- `GET /user/subscription` - Subscription info

### Admin
- `GET/POST /admin/libraries` - Manage libraries
- `GET/POST /admin/submissions` - Review submissions
- `GET/POST /admin/servers` - Manage MCP servers

---

## Deployment

All apps deploy to Cloudflare:

```bash
# API
cd apps/api && pnpm run deploy

# Web
cd apps/web && pnpm run deploy

# Docs
cd apps/docs && pnpm run deploy
```

### Environment Variables (API)
- `BETTER_AUTH_SECRET` - Auth encryption key
- `BETTER_AUTH_URL` - API URL for auth
- `GITHUB_CLIENT_ID/SECRET` - GitHub OAuth
- `GOOGLE_CLIENT_ID/SECRET` - Google OAuth (optional)
- `ADMIN_API_KEY` - Admin access key

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-12 | 4cfae32 | CLI MCP server mode (nexus serve) |
| 2026-03-12 | 8ca6a9c | CLI browser auth flow |
| 2026-03-12 | fdab0e0 | CLI package with editor adapters |
| 2026-03-12 | b85a011c | Added user preferences API endpoints |
| 2026-03-12 | 73185a21 | Settings page with API integration |
| 2026-03-12 | - | Database migration for user_preferences table |
| 2026-03-13 | - | Independent documentation crawler (replacing Context7 dependency) |

---

## Current Work: Documentation Crawler

### Goal
Build an independent documentation crawler to replace Context7 dependency (which rate-limits us). The crawler should:
1. Fetch documentation from GitHub repositories (prioritizing LLM.txt files)
2. Crawl documentation websites
3. Parse markdown/MDX with smart chunking
4. Generate quality metrics (benchmark score, trust score)
5. Support user submissions for libraries and skills
6. Create Context7-style detail pages with versions, metrics, and interactive search

### Key Decisions Made
- **Source Priority**: GitHub first, always seek `llms.txt`, `llms-full.txt`, `*llm*` files
- **Quality Threshold**: Show all libraries but display warnings (yellow < 50, red < 25 benchmark score)
- **Version Tracking**: Track ALL versions
- **Refresh Schedule**: Weekly auto-refresh + manual "Refresh Docs" button on detail page
- **Skills Format**: Markdown

### Completed (2026-03-13)

#### 1. Enhanced GitHub Fetcher
**File**: `apps/api/src/lib/fetchers/github.ts`
- LLM.txt detection and priority fetching (`llms.txt`, `llms-full.txt`)
- Version tracking from GitHub tags/releases
- Incremental update support (compare commits, fetch only changed files)
- Repository metadata extraction (stars, branch, commit SHA)
- Exports: `fetchGitHubDocsEnhanced()`, `fetchIncrementalChanges()`, `checkForLlmTxt()`

#### 2. Website Fetcher
**File**: `apps/api/src/lib/fetchers/website.ts`
- Crawls documentation websites with depth control
- CSS selector-based content extraction
- LLM.txt detection for websites (`/llms.txt`, `/.well-known/llms.txt`)
- Sitemap parsing support
- Exports: `fetchWebsiteDocs()`, `fetchWebsiteLlmTxt()`, `checkWebsiteForLlmTxt()`

#### 3. Markdown Parser
**File**: `apps/api/src/lib/parsers/markdown.ts`
- Extracts frontmatter, headings, sections, code blocks, links
- Heading hierarchy tracking (parent/child relationships)
- MDX component stripping
- Metadata calculation (word count, estimated tokens, primary language)
- Exports: `parseMarkdown()`, `parseMultipleDocuments()`, `stripMdxComponents()`

#### 4. AI Quality Analysis
**File**: `apps/api/src/lib/analysis.ts`
- Calculates benchmark score (0-100) based on content quality, code examples, coverage, structure
- Calculates trust score (0-100) based on stars, freshness, documentation depth
- Generates quality breakdown with individual metrics
- Generates improvement suggestions
- Optional AI enhancement via Workers AI
- Exports: `analyzeDocumentation()`, `quickBenchmarkScore()`, `serializeAnalysis()`

#### 5. Database Migration Applied
**File**: `packages/db/migrations/0017_crawler_enhancements.sql`
- Applied manually to local D1 database

**New columns on `libraries` table:**
- `github_owner`, `github_repo`, `github_branch`, `github_docs_paths`, `last_commit_sha`
- `website_url`, `website_content_selector`
- `benchmark_score`, `trust_score`, `quality_analysis`
- `last_refresh_requested_at`, `refresh_scheduled_at`

**New tables:**
- `library_files` - Track individual files for incremental updates
- `library_versions` - Track multiple versions per library
- `refresh_jobs` - Track documentation refresh requests
- `skill_submissions` - User-submitted skills pending review

#### 6. Updated Drizzle Schema
**File**: `packages/db/src/schema.ts`
- Added new columns to `libraries` table
- Added new tables: `libraryFiles`, `libraryVersions`, `refreshJobs`, `skillSubmissions`
- Added type exports

#### 7. Updated Ingestion Pipeline
**File**: `apps/api/src/lib/ingestion.ts`
- Uses enhanced GitHub fetcher with LLM.txt priority
- Supports `website` source type
- Runs quality analysis after indexing
- Stores benchmark/trust scores and quality analysis in database
- Extracts and stores version information

### Remaining Work

#### High Priority
1. **Public Submission Pages** - Allow library/skill submissions without auth
   - `apps/web/src/routes/submit/index.tsx` - Library submission
   - `apps/web/src/routes/submit/skill.tsx` - Skill submission

2. **Library Detail Page Redesign** - Context7-style with:
   - Versions dropdown
   - Quality metrics display (benchmark score, trust score)
   - Tabs: Context / Skills / Chat / Benchmark
   - "Refresh Docs" button
   - Token count and snippet count

#### Medium Priority
3. **API Endpoints for New Features**
   - `POST /api/libraries/:id/refresh` - Trigger documentation refresh
   - `GET /api/libraries/:id/versions` - List available versions
   - `GET /api/libraries/:id/files` - List indexed files

4. **Weekly Refresh Cron Job**
   - Scheduled trigger to refresh all libraries
   - Use incremental updates where possible

5. **Apply Migration to Production D1**
   - Run `0017_crawler_enhancements.sql` on production

### Database Location (Local Dev)
```
/home/ryan/personal/nexus/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/396fc0c6b453bd2bb61c1acdb35a47ea7fff62811b0495bd7470f0cc69221e44.sqlite
```

### Testing Notes
- Analyze endpoint works: `GET /api/analyze?url=https://github.com/honojs/hono`
- Most repos don't have LLM.txt yet (Hono, Drizzle, Next.js, Anthropic SDK all lack it)
- Crawler falls back to docs folder when no LLM.txt found
