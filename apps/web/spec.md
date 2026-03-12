# Nexus Web App - Development Spec

## Project Overview

**Nexus** is an MCP (Model Context Protocol) server platform with:
- **Web App**: `nexus.yogan.dev` - Main dashboard, docs, sign-in (TanStack Start on Cloudflare)
- **API**: `api.nexus.yogan.dev` - Hono-based API with Better Auth, MCP endpoints
- **Code Editor**: Now merged into web app at `/code` routes

**Tech Stack**: TanStack Start, TanStack Router, TanStack Query, Cloudflare Workers/D1, Hono, Drizzle ORM, Zustand, CodeMirror

---

## Recent Changes (Session Summary)

### 1. Code Editor Merged into Web App

The standalone code editor (`apps/code` at `code.nexus.yogan.dev`) has been merged into the main web app at `/code` routes.

#### New Routes
| Route | Description |
|-------|-------------|
| `/code` | Connection page - enter OpenCode server URL |
| `/code/sessions` | List of sessions for connected server |
| `/code/session/:sessionId` | Active session editor view |

#### New Files Created

**Routes (with lazy loading):**
- `src/routes/code/index.tsx` + `index.lazy.tsx`
- `src/routes/code/sessions.tsx` + `sessions.lazy.tsx`
- `src/routes/code/session.$sessionId.tsx` + `session.$sessionId.lazy.tsx`

**Page Components:**
- `src/components/code/pages/ConnectionPage.tsx`
- `src/components/code/pages/SessionsPage.tsx`
- `src/components/code/pages/SessionPage.tsx`

**UI Components:**
- `src/components/code/chat/ChatView.tsx`
- `src/components/code/editor/EditorView.tsx`
- `src/components/code/editor/CodeMirrorEditor.tsx`
- `src/components/code/files/FileExplorer.tsx`
- `src/components/code/layout/MobileLayout.tsx`

**Utilities:**
- `src/lib/code/opencode-types.ts` - TypeScript types for OpenCode API
- `src/lib/code/opencode-client.ts` - REST API client
- `src/lib/code/editor-theme.ts` - CodeMirror light/dark themes

**State:**
- `src/stores/editor-store.ts` - Zustand store for editor state

#### Modified Files
- `package.json` - Added CodeMirror, Zustand, vaul, react-resizable-panels
- `vite.config.ts` - CodeMirror chunking for lazy loading
- `src/routes/__root.tsx` - Hide footer on `/code` routes, add DevModeBadge
- `src/components/Header.tsx` - Updated Code link to `/code` route
- `src/routes/dashboard/index.tsx` - Added Code Editor quick action
- `src/routes/terminal.tsx` - Now redirects to `/code`

---

### 2. Build-Time Dev Auth Bypass

Implemented a safe dev-only auth bypass that:
- Auto-logs you in as "Ryan (admin)" on localhost
- Uses Vite's build-time env vars (completely removed in production)
- Shows visual indicator badge

#### How It Works

**Development (`pnpm dev`):**
- `.env.development` sets `VITE_DEV_BYPASS_AUTH=true`
- `useSession()` returns mock admin session
- Amber badge shows "DEV AUTH: Ryan (admin)"

**Production (`pnpm build`):**
- `VITE_DEV_BYPASS_AUTH` is undefined
- All dev bypass code is tree-shaken out
- Real Better Auth is used

#### Safety Layers
1. **Build-time**: Env var only in `.env.development`
2. **Vite behavior**: `.env.development` only loaded in dev mode
3. **Runtime failsafe**: `isLocalhost()` check as backup
4. **Tree-shaking**: Dev code removed from production bundle
5. **Visual indicator**: Badge makes dev mode obvious

#### Files
- `.env.development` - `VITE_DEV_BYPASS_AUTH=true`
- `src/env.d.ts` - TypeScript declarations
- `src/lib/auth.ts` - Auth wrapper with build-time bypass
- `src/components/DevModeBadge.tsx` - Visual indicator

---

## Current Architecture

### Auth Flow

```
src/lib/auth.ts (wrapper)
    ├── Dev mode (localhost + env var) → Returns mock session
    └── Production → Calls @nexus/auth/client → Better Auth API
```

All components import from `@/lib/auth` instead of `@nexus/auth/client` directly.

### Code Editor Flow

```
/code (ConnectionPage)
    ↓ connect to OpenCode server
/code/sessions (SessionsPage)
    ↓ select/create session
/code/session/:id (SessionPage)
    ├── MobileLayout (drawer-based)
    ├── ChatView (messages, todos)
    ├── EditorView → CodeMirrorEditor (lazy loaded)
    └── FileExplorer (file tree)
```

### State Management

- **Router Context**: `queryClient` (TanStack Query)
- **Editor State**: Zustand store (`src/stores/editor-store.ts`)
  - Connection status, server URL
  - Sessions list, active session
  - Messages, todos, streaming state
  - Open files, active file

---

## TODO / Future Work

### Code Editor
- [ ] Test with live OpenCode server
- [ ] Add tablet layout (larger screens)
- [ ] File editing support (currently read-only)
- [ ] Diff view for file changes
- [ ] Permission request handling UI
- [ ] Consider deprecating `apps/code` directory

### Auth
- [ ] Consider adding auth to router context for route-level guards
- [ ] Add more admin users to dev bypass if needed

### General
- [ ] Update docs to mention code editor feature
- [ ] Add code editor to landing page features
- [ ] Consider PWA features for mobile code editor

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server (with auth bypass)
cd apps/web
pnpm dev

# Type check
pnpm tsc --noEmit

# Build for production
pnpm build

# Preview production build
pnpm preview
```

---

## Environment Variables

### `.env.development` (Vite - client-side, dev only)
```bash
VITE_DEV_BYPASS_AUTH=true
```

### `.dev.vars` (Cloudflare Workers - server-side)
```bash
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/router.tsx` | TanStack Router setup with context |
| `src/routeTree.gen.ts` | Auto-generated route tree |
| `src/lib/auth.ts` | Auth wrapper with dev bypass |
| `src/stores/editor-store.ts` | Zustand store for code editor |
| `src/lib/code/opencode-client.ts` | OpenCode REST API client |
| `vite.config.ts` | Vite + TanStack Start + Cloudflare config |

---

## Pre-existing Issues (Not from this session)

These TypeScript errors existed before the code editor merge:
- `src/routes/explore/servers.tsx` - Route type issues
- `src/lib/auth.server.ts` - Cloudflare module import
- `src/routes/api/auth/$.ts` - Route type issues

They don't affect the build and are likely TanStack Router type generation edge cases.
