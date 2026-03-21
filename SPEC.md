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

| Editor      | Config Location               | Format                           |
| ----------- | ----------------------------- | -------------------------------- |
| Claude Code | `~/.claude/` (via CLI)        | `claude mcp add` command         |
| Cursor      | `~/.cursor/mcp.json`          | `{ "mcpServers": { ... } }`      |
| VS Code     | `.vscode/mcp.json`            | `{ "servers": { ... } }`         |
| OpenCode    | `opencode.json`               | `{ "mcp": { ... } }`             |
| Zed         | `~/.config/zed/settings.json` | `{ "context_servers": { ... } }` |

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

| Table               | Purpose                                                |
| ------------------- | ------------------------------------------------------ |
| `users`             | User accounts (Better Auth)                            |
| `accounts`          | OAuth connections                                      |
| `sessions`          | Auth sessions                                          |
| `libraries`         | Indexed documentation libraries                        |
| `libraryVersions`   | Version tracking for libraries                         |
| `libraryFiles`      | Individual files per library (for incremental updates) |
| `refreshJobs`       | Documentation refresh job tracking                     |
| `chunks`            | Chunked docs for vector search                         |
| `libraryStats`      | Usage statistics per library                           |
| `mcpServers`        | MCP server directory                                   |
| `mcpServerDocs`     | Links servers to their documentation                   |
| `mcpServerStats`    | Usage statistics per server                            |
| `serverSubmissions` | User-submitted servers pending review                  |
| `skills`            | AI skill definitions                                   |
| `skillSubmissions`  | User-submitted skills pending review                   |
| `userSkills`        | Installed skills per user                              |
| `memories`          | Persistent memory storage                              |
| `userPreferences`   | User settings (response format, etc.)                  |
| `apiTokens`         | API authentication tokens                              |
| `userSecrets`       | Encrypted secrets for MCP servers                      |
| `subscriptions`     | User subscription status                               |
| `teams`             | Team organizations                                     |
| `teamMembers`       | Team membership                                        |
| `syncJobs`          | Context7 sync job history (legacy)                     |

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

| Date       | Version  | Changes                                                           |
| ---------- | -------- | ----------------------------------------------------------------- |
| 2026-03-12 | 4cfae32  | CLI MCP server mode (nexus serve)                                 |
| 2026-03-12 | 8ca6a9c  | CLI browser auth flow                                             |
| 2026-03-12 | fdab0e0  | CLI package with editor adapters                                  |
| 2026-03-12 | b85a011c | Added user preferences API endpoints                              |
| 2026-03-12 | 73185a21 | Settings page with API integration                                |
| 2026-03-12 | -        | Database migration for user_preferences table                     |
| 2026-03-13 | -        | Independent documentation crawler (replacing Context7 dependency) |

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

---

## Planned: Context7-Style Ingestion Improvements

### Background

Context7 achieves better retrieval quality through several AI-powered techniques that Nexus currently lacks. After analyzing their approach (see their [Quality and Safety blog post](https://upstash.com/blog/context7-quality-and-safety)), we've identified key improvements to adopt while keeping costs minimal using Workers AI (Llama).

**Context7's Key Techniques:**

- Uses Gemini Flash, OpenAI, and Anthropic for AI processing
- Benchmark-driven scoring with AI-generated developer questions
- Cosine similarity deduplication for near-duplicate removal
- Trust scores based on repository signals (stars, activity, account age) and website signals (TLS, domain authority, backlinks)
- Version-aware parsing to exclude outdated documentation
- Two-pass prompt injection detection pipeline

### Current Nexus vs Context7

| Feature           | Nexus (Current)            | Context7                                   |
| ----------------- | -------------------------- | ------------------------------------------ |
| Code extraction   | Regex-based                | AI-powered (Gemini Flash)                  |
| Deduplication     | Content hash only          | Cosine similarity + exact match            |
| Benchmark scoring | Heuristic formulas         | AI-generated questions + retrieval testing |
| Chunking          | Fixed 512 tokens           | Semantic boundaries                        |
| Quality filtering | None (indexes everything)  | AI-assessed relevance filtering            |
| Token counting    | `text.length / 4` estimate | Actual tokenizer                           |

### Implementation Plan

#### Phase 1: Semantic Deduplication

**Goal**: Remove near-duplicate content using cosine similarity, not just exact hash matching.

**Files to modify/create**:

- `apps/api/src/lib/similarity.ts` (new) - Cosine similarity utilities
- `apps/api/src/lib/chunker.ts` - Add deduplication pass
- `apps/api/src/lib/ingestion.ts` - Reorder pipeline

**Key functions**:

```typescript
export function cosineSimilarity(a: number[], b: number[]): number;
export function deduplicateChunks(
  chunks: Chunk[],
  embeddings: number[][],
  threshold?: number
): Chunk[];
```

**Threshold**: Remove chunks with similarity > 0.92 (configurable)

**Estimated effort**: 1-2 hours

#### Phase 2: AI-Powered Code Extraction

**Goal**: Use Workers AI (Llama) to identify relevant code snippets and generate better descriptions.

**Files to create**:

- `apps/api/src/lib/extractors/code.ts` - AI code extractor

**AI prompt template**:

```
Analyze this code snippet from {library} documentation:

\`\`\`{language}
{code}
\`\`\`

Context: {surrounding_text}

Return JSON:
- relevance_score: 0-100 (how useful is this for developers?)
- title: short descriptive title
- description: 1-2 sentence explanation
- is_boilerplate: true/false
```

**Changes**:

- Score each code block for relevance (0-100)
- Generate AI titles/descriptions for code snippets
- Filter out boilerplate (install commands, imports only, etc.)

**Estimated effort**: 3-4 hours

#### Phase 3: Quality-Based Filtering

**Goal**: Score content relevance before indexing, filter low-quality chunks.

**Files to create**:

- `apps/api/src/lib/quality/scorer.ts` - Content quality scorer

**Scoring dimensions**:

- Relevance (0-100): Is this useful documentation?
- Completeness (0-100): Is this a complete thought/example?
- Actionability (0-100): Can a developer use this immediately?

**Filtering thresholds**:

- Score < 30: Don't index (boilerplate, legal text, etc.)
- Score 30-50: Index but lower priority in retrieval
- Score > 50: Full indexing

**Estimated effort**: 2-3 hours

#### Phase 4: Benchmark-Driven Scoring

**Goal**: Generate developer questions and test retrieval accuracy to score libraries.

**Files to create**:

- `apps/api/src/lib/benchmark/questions.ts` - Question generator
- `apps/api/src/lib/benchmark/evaluator.ts` - Retrieval tester

**Process**:

1. After indexing, generate 10-20 developer-style questions using AI
2. For each question, query Vectorize
3. AI-evaluate how well results answer the question
4. Average scores = benchmark score

**Question generation prompt**:

```
You are generating test questions for {library} documentation.
Generate 15 questions a developer would ask, covering:
- Installation and setup
- Core concepts
- Common use cases
- API usage
- Error handling
- Best practices

Return as JSON array of question strings.
```

**Evaluation prompt**:

```
Question: {question}
Retrieved content: {retrieved_chunks}

Score 0-100: How well does this content answer the question?
```

**Database changes**:

- Add `benchmark_questions` JSON column to `libraries` table
- Store questions and scores for transparency

**Estimated effort**: 4-5 hours

#### Phase 5: Integration & Testing

**Goal**: Tie everything together with feature flags for gradual rollout.

**Feature flags** (`apps/api/src/lib/config.ts`):

```typescript
export const INGESTION_FEATURES = {
  semanticDedup: true,
  aiCodeExtraction: true,
  qualityFiltering: true,
  benchmarkScoring: true,
};
```

**Updated pipeline order**:

```
Fetch docs → Parse markdown → AI code extraction →
Chunk content → Generate embeddings → Semantic deduplication →
Quality filtering → Store in Vectorize → Run benchmark → Update scores
```

**Metrics to track**:

- Chunks filtered by deduplication
- Chunks filtered by quality
- Average benchmark scores
- AI processing time

**Estimated effort**: 2-3 hours

### Cost Analysis (Workers AI)

Workers AI Llama pricing:

- **Free tier**: 10,000 neurons/day
- **Paid**: $0.011 per 1,000 neurons

**Per library estimate** (500 chunks):

| Task                     | AI Calls | Neurons | Cost        |
| ------------------------ | -------- | ------- | ----------- |
| Code extraction          | ~500     | 500k    | $0.0055     |
| Quality scoring          | ~500     | 250k    | $0.0028     |
| Benchmark (20 questions) | ~40      | 80k     | $0.0009     |
| **Total**                | ~1040    | 830k    | **~$0.009** |

This is extremely cost-effective (~1 cent per library).

### Priority Order

| Phase                 | Priority | Effort | Impact   |
| --------------------- | -------- | ------ | -------- |
| 1. Semantic Dedup     | High     | 1-2h   | Medium   |
| 2. AI Code Extraction | High     | 3-4h   | High     |
| 3. Quality Filtering  | Medium   | 2-3h   | Medium   |
| 4. Benchmark Scoring  | Medium   | 4-5h   | High     |
| 5. Integration        | High     | 2-3h   | Required |

**Total estimated effort**: 12-17 hours

### Success Metrics

1. **Retrieval quality**: Side-by-side comparison with Context7 for same libraries
2. **Index size reduction**: Target 20-30% smaller index via deduplication
3. **Benchmark scores**: Compare AI-generated scores vs heuristic scores
4. **User feedback**: Track if users report better documentation results

---

## 2026-03 Codebase Overhaul

### Executive Summary

This section outlines the comprehensive overhaul of the Nexus codebase, covering tooling migration, code deduplication, feature renaming, testing, design system unification, and documentation.

### Key Decisions

1. **Database**: ALTER TABLE RENAME (preserves data) for flows → prompts
2. **Visual Builder**: Adapt StackCanvas for PromptCanvas with new node types
3. **Usage Tracking**: Simple `UPDATE users SET api_call_count = api_call_count + 1`
4. **Testing**: API/MCP tools first, then UI (90% coverage target)
5. **Design**: Keep neobrutalist (squared, mono, cyan accent) - just consistency polish
6. **Dead Code**: Delete `apps/code` and `packages/api` entirely

---

### Phase Breakdown

#### PHASE 1: Migrate to Vite+ and Oxlint/Oxfmt ecosystem

- [ ] 1.1 Install vite-plus and run `vp migrate --no-interactive`
- [ ] 1.2 Upgrade to Vite 8 across all packages
- [ ] 1.3 Configure unified vite.config.ts with lint/fmt/test blocks
- [ ] 1.4 Remove ESLint, Prettier and old configs - replace with oxlint/oxfmt
- [ ] 1.5 Update pnpm-workspace.yaml with vite/vitest overrides

#### PHASE 2: Delete dead code and eliminate duplication

- [x] 2.1 Delete apps/code entirely (no longer used)
- [x] 2.2 Delete packages/api entirely (duplicates apps/api)
- [ ] 2.3 Remove apps/code from turbo.json and pnpm-workspace
- [ ] 2.4 Consolidate UI components - move apps/web/components/ui to @nexus/ui
- [ ] 2.5 Clean up any remaining code references to apps/code

#### PHASE 3: Rename Flows to Prompts (DB + API + Frontend)

- [ ] 3.1 Create migration: ALTER TABLE flows RENAME TO prompts (and related tables)
- [ ] 3.2 Update schema.ts exports: flows→prompts, userFlows→userPrompts, etc.
- [ ] 3.3 Rename API routes: apps/api/src/routes/flows.ts → prompts.ts
- [ ] 3.4 Update all API endpoints: /api/flows → /api/prompts
- [ ] 3.5 Rename frontend routes: flows.index.tsx → prompts.index.tsx, etc.
- [ ] 3.6 Update all frontend imports and references from flows to prompts
- [ ] 3.7 Add isPublic sharing with search integration on home page

#### PHASE 4: Add Prompts MCP tools for agent access

- [ ] 4.1 Add list-prompts tool (list public + user's prompts)
- [ ] 4.2 Add get-prompt tool (get prompt by ID)
- [ ] 4.3 Add search-prompts tool (semantic search public prompts)
- [ ] 4.4 Add save-prompt tool (save prompt from agent session)
- [ ] 4.5 Update MCP tool definitions and documentation

#### PHASE 5: Simplify usage tracking (remove Analytics Engine)

- [ ] 5.1 Remove Analytics Engine binding from wrangler.jsonc
- [ ] 5.2 Add apiCallCount, apiCallCountDaily, apiCallCountMonthly to users schema
- [ ] 5.3 Update usage middleware to increment D1 counter directly
- [ ] 5.4 Add daily/monthly reset cron job or on-demand reset logic

#### PHASE 6: Testing infrastructure (90% coverage, API first)

- [ ] 6.1 Configure Vitest with V8 coverage, 90% threshold
- [ ] 6.2 Create test utilities: mock D1, mock auth, fixtures
- [ ] 6.3 Write unit tests for MCP tools (mcp.ts handlers)
- [ ] 6.4 Write unit tests for prompts API routes
- [ ] 6.5 Write unit tests for memory/brain routes
- [ ] 6.6 Write integration tests for MCP server protocol
- [ ] 6.7 Write component tests for @nexus/ui components

#### PHASE 7: Home page and search fixes

- [ ] 7.1 Refactor index.tsx - extract types to types/home.ts
- [ ] 7.2 Extract server functions to lib/home-data.server.ts
- [ ] 7.3 Create ContentRow, HomeStats, SearchTabs components
- [ ] 7.4 Add skeleton loaders for search results
- [ ] 7.5 Fix search UX with TanStack Query for client-side loading
- [ ] 7.6 Add prompts to home page search results (public prompts)

#### PHASE 8: Design consistency (keep neobrutalist, just polish)

- [ ] 8.1 Create PageContainer, PageHeader layout components for consistency
- [ ] 8.2 Standardize spacing across all dashboard pages
- [ ] 8.3 Ensure consistent typography weights and sizes
- [ ] 8.4 Add skeleton loaders to all routes (pendingComponent)

#### PHASE 9: Nested layouts and route refactoring

- [ ] 9.1 Create \_authed/dashboard.tsx layout with consistent wrapper
- [ ] 9.2 Create explore/\_layout.tsx with tabs
- [ ] 9.3 Make route files thin - extract to components/hooks

#### PHASE 10: Split large files for maintainability

- [ ] 10.1 Split mcp.ts (2612 lines) into mcp/tools/\*.ts
- [ ] 10.2 Split schema.ts (2303 lines) into schema/\*.ts
- [ ] 10.3 Split admin.ts (2078 lines) into admin/\*.ts

#### PHASE 11: Documentation overhaul

- [ ] 11.1 Rename flows/ to prompts/ in docs, update all references
- [ ] 11.2 Update VitePress theme to match main site (Geist mono, cyan accent, squared)
- [ ] 11.3 Audit and update all docs for accuracy
- [ ] 11.4 Document new prompts MCP tools
- [ ] 11.5 Add dark mode styling consistent with main app

---

### Technical Details

#### Prompts Schema (renamed from Flows)

```sql
-- Migration
ALTER TABLE flows RENAME TO prompts;
ALTER TABLE user_flows RENAME TO user_prompts;
ALTER TABLE flow_sessions RENAME TO prompt_sessions;

-- Add canvas data for visual builder
ALTER TABLE prompts ADD COLUMN canvas_data TEXT;
```

#### New MCP Tools for Prompts

```typescript
{
  name: "list-prompts",
  description: "List public prompts or user's saved prompts",
  inputSchema: {
    type: "object",
    properties: {
      category: { type: "string" },
      query: { type: "string" }
    }
  }
},
{
  name: "get-prompt",
  description: "Get a specific prompt by ID",
  inputSchema: {
    type: "object",
    properties: { promptId: { type: "string" } },
    required: ["promptId"]
  }
},
{
  name: "search-prompts",
  description: "Search all public prompts semantically",
  inputSchema: {
    type: "object",
    properties: { query: { type: "string" } },
    required: ["query"]
  }
},
{
  name: "save-prompt",
  description: "Save a new prompt from the agent",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      content: { type: "string" },
      isPublic: { type: "boolean" }
    },
    required: ["name", "content"]
  }
}
```

#### Usage Tracking (Simplified)

```typescript
// New middleware - replaces Analytics Engine
async function trackUsage(c: Context, next: () => Promise<void>) {
  await next();

  const userId = c.get("userId") || c.get("apiKeyUserId");
  if (userId) {
    await c.env.DB.prepare("UPDATE users SET api_call_count = api_call_count + 1 WHERE id = ?")
      .bind(userId)
      .run();
  }
}
```

#### Vite+ Configuration

```typescript
// vite.config.ts (root)
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    ignorePatterns: ["dist/**", ".wrangler/**"],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    semi: true,
    singleQuote: false,
    tabWidth: 2,
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      thresholds: {
        global: { lines: 90, branches: 80, functions: 90, statements: 90 },
      },
    },
  },
  staged: { "*": "vp check --fix" },
});
```

---

### Execution Order

```
PHASE 1 (Vite+) ──┬──> PHASE 2 (Dead code deletion)
                  │
                  └──> PHASE 7 (Testing setup)
                       │
PHASE 3 (Flows→Prompts) ─────┴──> PHASE 4 (MCP tools)
                                  │
PHASE 5 (Visual Builder) ─────────┴──> PHASE 6 (Usage tracking)
                                       │
PHASE 8 (Home page) ───────────────────┴──> PHASE 9 (Design polish)
                                            │
PHASE 10 (Layouts) ─────────────────────────┴──> PHASE 11 (Split files)
                                                 │
PHASE 12 (Docs) ─────────────────────────────────┘
```

---

### Success Criteria

- [ ] `vp check` passes with no errors
- [ ] `vp test` achieves 90% coverage
- [ ] `vp build` succeeds for all apps
- [ ] All flows renamed to prompts throughout codebase
- [ ] MCP tools for prompts working in agent sessions
- [ ] Visual prompt builder functional
- [ ] Home page search smooth with skeleton loaders
- [ ] Documentation updated and styled consistently
