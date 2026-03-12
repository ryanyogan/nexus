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

### Phase 4: Nexus CLI (WIP)

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
nexus serve            # Run MCP server locally (stub)
```

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

1. **CLI Auth Flow**
   - API endpoints for CLI OAuth (`/api/cli/auth/*`)
   - Web route for browser callback (`/auth/cli`)
   - Token exchange flow

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

5. **CLI MCP Server Mode**
   - `nexus serve` to run bundled MCP server locally
   - Useful for development and testing

6. **CLI Interactive TUI**
   - Ink-based React components for interactive selection
   - Better UX for `nexus init`, `nexus servers add`

7. **Improve Search Quality**
   - Better ranking for library search results
   - Hybrid search (keyword + semantic)

8. **Library Submission Flow**
   - Users can submit libraries but approval workflow is basic
   - Add admin notifications, better review UI

9. **Memory System Enhancements**
   - Memory tagging UI
   - Memory search in web UI (currently MCP only)

### Low Priority / Nice-to-Have

7. **Dark Mode**
   - Design system supports it, needs implementation

8. **Performance Optimization**
   - Code splitting for CodeMirror (large bundle)
   - Lazy load explore pages

9. **Email Integration**
   - Weekly digest emails (preferences exist, no email service)
   - Notification emails for submissions

10. **Team Features**
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
| `documentChunks` | Chunked docs for vector search |
| `servers` | MCP server directory |
| `serverSubmissions` | User-submitted servers pending review |
| `skills` | AI skill definitions |
| `userSkills` | Installed skills per user |
| `memories` | Persistent memory storage |
| `userPreferences` | User settings (response format, etc.) |
| `apiTokens` | API authentication tokens |
| `userSecrets` | Encrypted secrets for MCP servers |
| `subscriptions` | User subscription status |
| `teams` | Team organizations |
| `teamMembers` | Team membership |

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
| 2026-03-12 | WIP | CLI package with editor adapters |
| 2026-03-12 | b85a011c | Added user preferences API endpoints |
| 2026-03-12 | 73185a21 | Settings page with API integration |
| 2026-03-12 | - | Database migration for user_preferences table |
