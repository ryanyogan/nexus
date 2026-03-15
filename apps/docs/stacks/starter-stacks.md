# Starter Stacks

Nexus includes 25 pre-built starter stacks covering popular development technologies. These stacks are ready to use immediately and serve as great starting points for your own customizations.

## Overview

Starter stacks are organized by layer:

- **Layer 0** - Infrastructure and Database
- **Layer 1** - Backend and Fullstack Frameworks
- **Layer 2** - Frontend, Styling, and Desktop
- **Layer 3** - TUI and Tooling

## Infrastructure (Layer 0)

### Cloudflare Workers

```
Slug: cloudflare-workers
Category: infrastructure
```

Edge-first serverless applications with Cloudflare Workers, D1, R2, KV, and Queues.

**Key Technologies:**
- Cloudflare Workers for edge compute
- D1 for SQLite database
- R2 for object storage
- KV for key-value storage
- Queues for background jobs
- Wrangler CLI for deployment

### Vercel Edge

```
Slug: vercel-edge
Category: infrastructure
```

Deploy to Vercel Edge Functions with Next.js or standalone edge functions.

**Key Technologies:**
- Vercel Edge Functions
- Vercel KV / Postgres / Blob
- Next.js App Router (optional)
- Automatic deployments via Git

## Database (Layer 0)

### Supabase Backend

```
Slug: supabase-backend
Category: database
```

Full backend with Supabase: Postgres, Auth, Storage, Realtime, and Edge Functions.

**Key Technologies:**
- PostgreSQL with Row Level Security
- Built-in authentication
- Realtime subscriptions
- Storage for files and media
- Edge Functions (Deno)

### Turso SQLite

```
Slug: turso-sqlite
Category: database
```

Edge-native SQLite with Turso (libSQL) - embedded replicas and global distribution.

**Key Technologies:**
- Distributed SQLite (libSQL)
- Embedded replicas for local reads
- Global edge distribution
- Compatible with better-sqlite3

### Drizzle ORM

```
Slug: drizzle-orm
Category: database
```

Type-safe SQL with Drizzle ORM - zero dependencies, maximum type safety.

**Key Technologies:**
- 100% type-safe queries
- SQL-like syntax
- Zero runtime dependencies
- Support for D1, Postgres, SQLite, MySQL

## Backend (Layer 1)

### Hono API

```
Slug: hono-api
Category: backend
```

Ultra-fast web framework for the edge with Hono.

**Key Technologies:**
- Hono web framework
- Edge-first design
- Middleware system
- OpenAPI integration

### tRPC

```
Slug: trpc
Category: backend
```

End-to-end type-safe APIs with tRPC.

**Key Technologies:**
- Type-safe API layer
- No code generation
- React Query integration
- WebSocket support

### Rust + Axum

```
Slug: rust-axum
Category: backend
```

High-performance APIs with Rust and Axum framework.

**Key Technologies:**
- Axum web framework
- Tokio async runtime
- Tower middleware
- SQLx for database

## Fullstack (Layer 1)

### TanStack Start

```
Slug: tanstack-start
Category: fullstack
```

Full-stack React framework with file-based routing, SSR, and streaming.

**Key Technologies:**
- React 19 with Server Components
- File-based routing
- TanStack Query
- Vinxi/Vite build system

### Next.js App Router

```
Slug: nextjs-app-router
Category: fullstack
```

React framework with App Router, Server Components, and Server Actions.

**Key Technologies:**
- Next.js 15
- App Router
- Server Components
- Server Actions

### Rails 8 Trifecta

```
Slug: rails8-trifecta
Category: fullstack
```

Ruby on Rails 8 with Hotwire, Turbo, and Stimulus.

**Key Technologies:**
- Rails 8
- Hotwire / Turbo
- Stimulus JS
- SQLite / PostgreSQL

### Phoenix LiveView

```
Slug: phoenix-liveview
Category: fullstack
```

Real-time applications with Elixir and Phoenix LiveView.

**Key Technologies:**
- Phoenix Framework
- LiveView for real-time UI
- Ecto for database
- PubSub for messaging

### Leptos Fullstack

```
Slug: leptos-fullstack
Category: fullstack
```

Full-stack Rust web framework with fine-grained reactivity.

**Key Technologies:**
- Leptos framework
- Fine-grained reactivity
- SSR and hydration
- Actix or Axum backend

## Frontend (Layer 2)

### Vite + React

```
Slug: vite-react
Category: frontend
```

Modern React development with Vite bundler.

**Key Technologies:**
- React 19
- Vite build tool
- TypeScript
- Fast HMR

### Svelte 5 + SvelteKit

```
Slug: svelte5-sveltekit
Category: frontend
```

Compile-time framework with Svelte 5 runes and SvelteKit.

**Key Technologies:**
- Svelte 5 with runes
- SvelteKit
- TypeScript
- Vite

### Vue 3 + Nuxt

```
Slug: vue3-nuxt
Category: frontend
```

Progressive framework with Vue 3 Composition API and Nuxt 3.

**Key Technologies:**
- Vue 3
- Composition API
- Nuxt 3
- TypeScript

### Rust + WASM

```
Slug: rust-wasm
Category: frontend
```

WebAssembly applications with Rust.

**Key Technologies:**
- Rust compiled to WASM
- wasm-bindgen
- web-sys
- js-sys

## Desktop (Layer 2)

### Rust + Tauri v2

```
Slug: tauri-v2
Category: desktop
```

Cross-platform desktop apps with Tauri v2.

**Key Technologies:**
- Tauri v2
- Rust backend
- Web frontend
- Native system access

### Omarchy Desktop

```
Slug: omarchy-desktop
Category: desktop
```

Linux desktop with Hyprland and custom configurations.

**Key Technologies:**
- Hyprland
- Waybar
- Alacritty/Kitty
- Mako notifications

## Styling (Layer 2)

### TailwindCSS v4

```
Slug: tailwindcss-v4
Category: styling
```

Utility-first CSS framework with Tailwind v4.

**Key Technologies:**
- Tailwind CSS v4
- CSS variables
- Lightning CSS
- Oxide engine

### shadcn/ui

```
Slug: shadcn-ui
Category: styling
```

Re-usable components built with Radix UI and Tailwind CSS.

**Key Technologies:**
- Radix UI primitives
- Tailwind CSS
- TypeScript
- Copy-paste components

## TUI (Layer 3)

### Ratatui TUI (Rust)

```
Slug: ratatui-tui
Category: tui
```

Terminal user interfaces in Rust with Ratatui.

**Key Technologies:**
- Ratatui
- Crossterm
- Tokio async
- Widget system

### Bubbletea TUI (Go)

```
Slug: bubbletea-tui
Category: tui
```

Elegant TUI framework for Go.

**Key Technologies:**
- Bubbletea
- Bubbles components
- Lip Gloss styling
- Elm architecture

### Ink React CLI

```
Slug: ink-react-cli
Category: tui
```

Build CLI applications with React and Ink.

**Key Technologies:**
- Ink
- React components
- TypeScript
- Node.js

## Tooling (Layer 3)

### Vitest + Testing Library

```
Slug: vitest-testing
Category: tooling
```

Modern testing with Vitest and Testing Library.

**Key Technologies:**
- Vitest test runner
- Testing Library
- Mock Service Worker
- Code coverage

## Using Starter Stacks

### Browse

Visit the [Stacks marketplace](https://nexus.yogan.dev/?filter=stacks) to browse all starter stacks.

### Use Directly

```typescript
// Via MCP
get-stack: { stackId: "tanstack-start" }
```

### Fork and Customize

1. Open a starter stack
2. Click **Fork Stack**
3. Add your own instructions
4. Save and use

### Compose Together

Combine multiple starters for full coverage:

```
My App Stack
├── TanStack Start (fullstack)
├── Drizzle ORM (database)
├── shadcn/ui (styling)
└── Vitest (testing)
```
