# Marketplace

The Stacks Marketplace lets you discover, share, and use community-created stacks.

## Browsing Stacks

### On the Landing Page

Visit [nexus.yogan.dev](https://nexus.yogan.dev) and click the **STACKS** tab to browse public stacks without signing in.

### Filtering

Filter stacks by:
- **Category** - infrastructure, database, backend, fullstack, frontend, styling, tui, tooling
- **Sort** - Popular, Trending, Recent
- **Search** - Find by name or description

### Stack Detail Pages

Click any stack to view:
- Full description and instructions
- Token budget and compiled size
- Author information
- Fork and use counts
- Copy-ready prompt

## Publishing a Stack

### Requirements

- Nexus account with Pro plan
- Stack must have meaningful instructions
- Description should be clear and helpful

### Steps

1. Create or edit your stack
2. Add a clear description
3. Set visibility to **Public**
4. Click **Publish**

Your stack will be immediately available in the marketplace.

### Guidelines

**Do:**
- Write clear, actionable instructions
- Include best practices and conventions
- Test your stack before publishing
- Keep token usage reasonable

**Don't:**
- Include sensitive information
- Copy others' stacks without attribution
- Publish incomplete or broken stacks
- Use misleading names or descriptions

## Forking Stacks

Fork a stack to create your own copy:

1. Open a public stack
2. Click **Fork Stack**
3. The stack is copied to your account
4. Customize as needed

Forked stacks:
- Start as private
- Can be modified freely
- Track their original source
- Can be published independently

## Featured Stacks

Featured stacks appear prominently in the marketplace. Stacks may be featured for:
- High quality instructions
- Active maintenance
- Community popularity
- Official technology stacks

## Starter Stacks

Nexus provides 25+ starter stacks covering common technologies:

### Infrastructure (Layer 0)
- Cloudflare Workers
- Vercel Edge

### Database (Layer 0)
- Supabase Backend
- Turso SQLite
- Drizzle ORM

### Backend (Layer 1)
- Hono API
- tRPC
- Rust + Axum

### Fullstack (Layer 1)
- TanStack Start
- Next.js App Router
- Rails 8 Trifecta
- Phoenix LiveView
- Leptos Fullstack

### Frontend (Layer 2)
- Vite + React
- Svelte 5 + SvelteKit
- Vue 3 + Nuxt
- Rust + WASM

### Desktop (Layer 2)
- Rust + Tauri v2
- Omarchy Desktop

### Styling (Layer 2)
- TailwindCSS v4
- shadcn/ui

### TUI (Layer 3)
- Ratatui TUI (Rust)
- Bubbletea TUI (Go)
- Ink React CLI

### Tooling (Layer 3)
- Vitest + Testing Library

## Moderation

The marketplace uses flag-based moderation:

- Users can flag inappropriate stacks
- Flagged stacks are reviewed
- Violations may result in stack removal
- Repeat offenders may be banned

### Reporting Issues

To report a stack:
1. Open the stack detail page
2. Click the **Report** button
3. Select the reason
4. Provide details (optional)

## Using Marketplace Stacks

### Via MCP Tools

```typescript
// Get any public stack
get-stack: { stackId: "tanstack-start" }
```

### Via CLI

```bash
# Use a marketplace stack
nexus stack use tanstack-start

# Fork to your account
nexus stack fork drizzle-orm
```

### Via Dashboard

1. Find a stack in the marketplace
2. Click **Use Stack** to add to your project
3. Or **Fork** to customize

## Pro Features

Pro plan includes:
- Unlimited public stacks
- Private stacks
- GitHub private repo analysis
- Priority compilation
- Analytics (coming soon)

Free tier includes:
- 3 private stacks
- Unlimited public stack usage
- Public repo analysis only
