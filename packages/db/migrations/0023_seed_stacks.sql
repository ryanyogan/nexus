-- Seed 25 Starter Stacks
-- These are pre-built stacks covering common development patterns

-- Infrastructure (Layer 0)
INSERT INTO stacks (id, name, slug, description, category, layer, tags, instructions, token_budget, is_public, is_starter, is_featured, learning_status, created_at, updated_at) VALUES
('stk_cloudflare_wkrs', 'Cloudflare Workers', 'cloudflare-workers', 'Edge-first serverless applications with Cloudflare Workers, D1, R2, KV, and Queues.', 'infrastructure', 0, '["cloudflare", "edge", "serverless", "workers"]', 
'# Cloudflare Workers Stack

## Core Technologies
- Cloudflare Workers for edge compute
- D1 for SQLite database
- R2 for object storage
- KV for key-value storage
- Queues for background jobs

## Best Practices
- Use wrangler.jsonc for configuration
- Prefer D1 with Drizzle ORM for type-safe queries
- Use environment bindings, not environment variables
- Deploy with `wrangler deploy`

## Project Structure
```
src/
  index.ts        # Worker entry point
  routes/         # Hono routes
  lib/            # Utilities
wrangler.jsonc    # Configuration
```', 'standard', 1, 1, 1, 'pending', datetime('now'), datetime('now')),

('stk_vercel_edge', 'Vercel Edge', 'vercel-edge', 'Deploy to Vercel Edge Functions with Next.js or standalone edge functions.', 'infrastructure', 0, '["vercel", "edge", "serverless"]',
'# Vercel Edge Stack

## Core Technologies
- Vercel Edge Functions
- Vercel KV / Postgres / Blob
- Next.js App Router (optional)

## Best Practices
- Use edge runtime for low-latency responses
- Leverage Vercel''s caching and CDN
- Use environment variables for configuration

## Deployment
- Connect GitHub repo to Vercel
- Configure environment variables in dashboard
- Deploy with `vercel deploy`', 'minimal', 1, 1, 0, 'pending', datetime('now'), datetime('now'));

-- Database (Layer 0)
INSERT INTO stacks (id, name, slug, description, category, layer, tags, instructions, token_budget, is_public, is_starter, is_featured, learning_status, created_at, updated_at) VALUES
('stk_supabase', 'Supabase Backend', 'supabase-backend', 'Full backend with Supabase: Postgres, Auth, Storage, Realtime, and Edge Functions.', 'database', 0, '["supabase", "postgres", "auth", "realtime"]',
'# Supabase Stack

## Core Features
- PostgreSQL database with Row Level Security
- Built-in authentication (email, OAuth, magic links)
- Realtime subscriptions
- Storage for files and media
- Edge Functions (Deno)

## Best Practices
- Always enable RLS on tables
- Use database functions for complex queries
- Leverage realtime for live updates
- Use storage policies for access control

## Client Setup
```typescript
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(url, anonKey)
```', 'standard', 1, 1, 1, 'pending', datetime('now'), datetime('now')),

('stk_turso', 'Turso SQLite', 'turso-sqlite', 'Edge-native SQLite with Turso (libSQL) - embedded replicas and global distribution.', 'database', 0, '["turso", "sqlite", "libsql", "edge"]',
'# Turso Stack

## Core Features
- Distributed SQLite (libSQL)
- Embedded replicas for local reads
- Global edge distribution
- Compatible with better-sqlite3

## Best Practices
- Use embedded replicas for read-heavy workloads
- Sync writes through primary
- Use transactions for consistency

## Client Setup
```typescript
import { createClient } from "@libsql/client"
const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN
})
```', 'minimal', 1, 1, 0, 'pending', datetime('now'), datetime('now')),

('stk_drizzle', 'Drizzle ORM', 'drizzle-orm', 'Type-safe SQL with Drizzle ORM - zero dependencies, maximum type safety.', 'database', 0, '["drizzle", "orm", "typescript", "sql"]',
'# Drizzle ORM Stack

## Core Features
- 100% type-safe SQL queries
- Zero runtime dependencies
- Works with any SQL database
- Drizzle Kit for migrations

## Schema Definition
```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
})
```

## Query Patterns
- Use `db.select()` for reads
- Use `db.insert()`, `db.update()`, `db.delete()` for writes
- Use `eq()`, `and()`, `or()` for conditions', 'standard', 1, 1, 1, 'pending', datetime('now'), datetime('now'));

-- Backend (Layer 1)
INSERT INTO stacks (id, name, slug, description, category, layer, tags, instructions, token_budget, is_public, is_starter, is_featured, learning_status, created_at, updated_at) VALUES
('stk_hono', 'Hono API', 'hono-api', 'Ultrafast web framework for the edge - works on Cloudflare, Deno, Bun, and Node.', 'backend', 1, '["hono", "api", "edge", "typescript"]',
'# Hono Stack

## Core Features
- Ultrafast routing (~2ms cold start)
- Works on all runtimes (CF Workers, Deno, Bun, Node)
- Built-in middleware ecosystem
- Type-safe with TypeScript

## Basic Setup
```typescript
import { Hono } from "hono"
const app = new Hono()

app.get("/", (c) => c.json({ message: "Hello" }))
app.post("/users", async (c) => {
  const body = await c.req.json()
  return c.json(body, 201)
})

export default app
```

## Best Practices
- Use context (c) for request/response
- Leverage middleware for auth, logging, CORS
- Use zValidator for request validation', 'standard', 1, 1, 1, 'pending', datetime('now'), datetime('now')),

('stk_trpc', 'tRPC', 'trpc', 'End-to-end typesafe APIs with tRPC - no code generation, just TypeScript.', 'backend', 1, '["trpc", "api", "typescript", "rpc"]',
'# tRPC Stack

## Core Features
- End-to-end type safety
- No code generation needed
- Automatic type inference
- Works with React Query

## Router Definition
```typescript
import { initTRPC } from "@trpc/server"
const t = initTRPC.create()

export const appRouter = t.router({
  hello: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => `Hello ${input.name}`),
})
```

## Client Usage
```typescript
const { data } = trpc.hello.useQuery({ name: "World" })
```', 'standard', 1, 1, 0, 'pending', datetime('now'), datetime('now')),

('stk_axum', 'Rust + Axum', 'rust-axum', 'High-performance async web framework in Rust with Axum and Tokio.', 'backend', 1, '["rust", "axum", "tokio", "async"]',
'# Axum Stack

## Core Features
- Async-first with Tokio runtime
- Type-safe extractors
- Tower middleware ecosystem
- Excellent performance

## Basic Setup
```rust
use axum::{routing::get, Router, Json};

async fn hello() -> Json<Value> {
    Json(json!({ "message": "Hello" }))
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(hello));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
```

## Best Practices
- Use extractors for parsing requests
- Leverage Tower middleware
- Use sqlx or sea-orm for database', 'standard', 1, 1, 0, 'pending', datetime('now'), datetime('now'));

-- Fullstack (Layer 1)
INSERT INTO stacks (id, name, slug, description, category, layer, tags, instructions, token_budget, is_public, is_starter, is_featured, learning_status, created_at, updated_at) VALUES
('stk_tanstack', 'TanStack Start', 'tanstack-start', 'Full-stack React with TanStack Start, Router, and Query - SSR and client navigation.', 'fullstack', 1, '["tanstack", "react", "ssr", "router"]',
'# TanStack Start Stack

## Core Features
- File-based routing with TanStack Router
- Server functions and loaders
- TanStack Query integration
- SSR with streaming

## Route Definition
```typescript
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/posts/$postId")({
  loader: async ({ params }) => fetchPost(params.postId),
  component: PostPage,
})
```

## Best Practices
- Use loaders for data fetching
- Leverage search params for filters
- Use server functions for mutations', 'standard', 1, 1, 1, 'pending', datetime('now'), datetime('now')),

('stk_nextjs', 'Next.js App Router', 'nextjs-app-router', 'React framework with App Router, Server Components, and Server Actions.', 'fullstack', 1, '["nextjs", "react", "ssr", "app-router"]',
'# Next.js App Router Stack

## Core Features
- React Server Components
- Server Actions for mutations
- File-based routing
- Built-in optimization

## Server Component
```typescript
// app/posts/page.tsx
export default async function PostsPage() {
  const posts = await db.query.posts.findMany()
  return <PostList posts={posts} />
}
```

## Server Action
```typescript
"use server"
export async function createPost(formData: FormData) {
  await db.insert(posts).values({ title: formData.get("title") })
  revalidatePath("/posts")
}
```', 'standard', 1, 1, 1, 'pending', datetime('now'), datetime('now')),

('stk_rails8', 'Rails 8 Trifecta', 'rails-8-trifecta', 'Ruby on Rails 8 with Hotwire, Turbo, Stimulus, and Kamal for deployment.', 'fullstack', 1, '["rails", "ruby", "hotwire", "turbo"]',
'# Rails 8 Stack

## Core Features
- Hotwire for reactive UIs
- Turbo for fast navigation
- Stimulus for JS sprinkles
- Kamal for deployment

## Convention Over Configuration
- Models in app/models/
- Controllers in app/controllers/
- Views in app/views/

## Turbo Frames
```erb
<%= turbo_frame_tag "post" do %>
  <%= render @post %>
<% end %>
```

## Deployment
```bash
kamal deploy
```', 'standard', 1, 1, 0, 'pending', datetime('now'), datetime('now')),

('stk_phoenix', 'Phoenix LiveView', 'phoenix-liveview', 'Real-time Elixir web apps with Phoenix LiveView - server-rendered reactive UIs.', 'fullstack', 1, '["elixir", "phoenix", "liveview", "realtime"]',
'# Phoenix LiveView Stack

## Core Features
- Server-rendered reactive UIs
- Real-time updates over WebSocket
- Functional programming with Elixir
- Excellent fault tolerance

## LiveView Component
```elixir
defmodule AppWeb.CounterLive do
  use AppWeb, :live_view

  def mount(_params, _session, socket) do
    {:ok, assign(socket, count: 0)}
  end

  def handle_event("increment", _, socket) do
    {:noreply, update(socket, :count, &(&1 + 1))}
  end
end
```', 'standard', 1, 1, 0, 'pending', datetime('now'), datetime('now')),

('stk_leptos', 'Leptos Fullstack', 'leptos-fullstack', 'Full-stack Rust with Leptos - reactive UI with WASM and SSR.', 'fullstack', 1, '["rust", "leptos", "wasm", "ssr"]',
'# Leptos Stack

## Core Features
- Fine-grained reactivity
- Server-side rendering
- WASM for client-side
- Rust type safety everywhere

## Component
```rust
#[component]
fn Counter() -> impl IntoView {
    let (count, set_count) = create_signal(0);
    view! {
        <button on:click=move |_| set_count.update(|n| *n += 1)>
            "Count: " {count}
        </button>
    }
}
```', 'standard', 1, 1, 0, 'pending', datetime('now'), datetime('now'));

-- Frontend (Layer 2)
INSERT INTO stacks (id, name, slug, description, category, layer, tags, instructions, token_budget, is_public, is_starter, is_featured, learning_status, created_at, updated_at) VALUES
('stk_vite_react', 'Vite + React', 'vite-react', 'Modern React development with Vite - fast HMR and optimized builds.', 'frontend', 2, '["vite", "react", "typescript"]',
'# Vite + React Stack

## Core Features
- Lightning-fast HMR
- Optimized production builds
- Native ESM development
- TypeScript support

## Project Setup
```bash
pnpm create vite my-app --template react-ts
```

## Best Practices
- Use absolute imports with aliases
- Lazy load routes with React.lazy
- Use Vite plugins for optimization', 'minimal', 1, 1, 0, 'pending', datetime('now'), datetime('now')),

('stk_svelte', 'Svelte 5 + SvelteKit', 'svelte-sveltekit', 'Compile-time reactive framework with SvelteKit for full-stack apps.', 'frontend', 2, '["svelte", "sveltekit", "runes"]',
'# Svelte 5 Stack

## Core Features
- Compile-time reactivity
- Runes for state ($state, $derived)
- SvelteKit for routing
- Zero runtime overhead

## Runes
```svelte
<script>
  let count = $state(0)
  let doubled = $derived(count * 2)
</script>

<button onclick={() => count++}>
  {count} doubled is {doubled}
</button>
```', 'standard', 1, 1, 0, 'pending', datetime('now'), datetime('now')),

('stk_vue_nuxt', 'Vue 3 + Nuxt', 'vue-nuxt', 'Progressive Vue framework with Nuxt for SSR and static generation.', 'frontend', 2, '["vue", "nuxt", "composition-api"]',
'# Vue 3 + Nuxt Stack

## Core Features
- Composition API
- Auto-imports
- File-based routing
- SSR / SSG / SPA modes

## Composition API
```vue
<script setup>
const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```', 'standard', 1, 1, 0, 'pending', datetime('now'), datetime('now')),

('stk_rust_wasm', 'Rust + WASM', 'rust-wasm', 'High-performance web apps with Rust compiled to WebAssembly.', 'frontend', 2, '["rust", "wasm", "webassembly"]',
'# Rust + WASM Stack

## Core Features
- Near-native performance
- Type safety in browser
- wasm-pack for builds
- wasm-bindgen for JS interop

## Setup
```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

## Build
```bash
wasm-pack build --target web
```', 'minimal', 1, 1, 0, 'pending', datetime('now'), datetime('now'));

-- Desktop (Layer 2)
INSERT INTO stacks (id, name, slug, description, category, layer, tags, instructions, token_budget, is_public, is_starter, is_featured, learning_status, created_at, updated_at) VALUES
('stk_tauri', 'Rust + Tauri v2', 'rust-tauri-v2', 'Build desktop apps with web technologies and Rust backend using Tauri v2.', 'desktop', 2, '["tauri", "rust", "desktop", "electron-alternative"]',
'# Tauri v2 Stack

## Core Features
- Tiny bundle size (~600KB)
- Rust backend with security
- Any frontend framework
- Cross-platform (Windows, macOS, Linux)

## Tauri Command
```rust
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

## Frontend Call
```typescript
import { invoke } from "@tauri-apps/api/core"
const greeting = await invoke("greet", { name: "World" })
```', 'standard', 1, 1, 1, 'pending', datetime('now'), datetime('now')),

('stk_omarchy', 'Omarchy Desktop', 'omarchy-desktop', 'Hyprland-based Linux desktop with custom configurations and workflows.', 'desktop', 2, '["linux", "hyprland", "omarchy", "wayland"]',
'# Omarchy Desktop Stack

## Core Components
- Hyprland window manager
- Waybar status bar
- Walker app launcher
- Alacritty/Kitty terminal
- Mako notifications

## Configuration Locations
- ~/.config/hypr/hyprland.conf
- ~/.config/waybar/
- ~/.config/walker/
- ~/.config/omarchy/

## Best Practices
- Use exec-once for startup apps
- Configure monitor layouts
- Set up workspace rules
- Customize keybindings', 'minimal', 1, 1, 0, 'pending', datetime('now'), datetime('now'));

-- Styling (Layer 2)
INSERT INTO stacks (id, name, slug, description, category, layer, tags, instructions, token_budget, is_public, is_starter, is_featured, learning_status, created_at, updated_at) VALUES
('stk_tailwind', 'TailwindCSS v4', 'tailwindcss-v4', 'Utility-first CSS framework with TailwindCSS v4 - CSS-first configuration.', 'styling', 2, '["tailwind", "css", "utility-first"]',
'# TailwindCSS v4 Stack

## Core Features
- CSS-first configuration
- No config file needed
- Lightning CSS engine
- Automatic dark mode

## Setup
```css
@import "tailwindcss";
```

## CSS Variables
```css
@theme {
  --color-primary: #3b82f6;
  --font-display: "Inter", sans-serif;
}
```

## Best Practices
- Use @apply sparingly
- Leverage CSS variables for theming
- Use arbitrary values when needed', 'minimal', 1, 1, 1, 'pending', datetime('now'), datetime('now')),

('stk_shadcn', 'shadcn/ui', 'shadcn-ui', 'Beautiful, accessible components built with Radix UI and Tailwind CSS.', 'styling', 2, '["shadcn", "radix", "components", "ui"]',
'# shadcn/ui Stack

## Core Features
- Copy-paste components
- Radix UI primitives
- Tailwind styling
- Full customization

## Installation
```bash
npx shadcn@latest init
npx shadcn@latest add button dialog
```

## Usage
```tsx
import { Button } from "@/components/ui/button"

<Button variant="outline">Click me</Button>
```

## Best Practices
- Customize components in components/ui
- Use the CLI to add components
- Follow the compound component pattern', 'minimal', 1, 1, 1, 'pending', datetime('now'), datetime('now'));

-- TUI (Layer 3)
INSERT INTO stacks (id, name, slug, description, category, layer, tags, instructions, token_budget, is_public, is_starter, is_featured, learning_status, created_at, updated_at) VALUES
('stk_ratatui', 'Ratatui TUI', 'ratatui-tui', 'Build terminal user interfaces in Rust with Ratatui.', 'tui', 3, '["rust", "ratatui", "tui", "terminal"]',
'# Ratatui Stack

## Core Features
- Immediate mode rendering
- Widget-based UI
- Multiple backends (crossterm, termion)
- Excellent performance

## Basic App
```rust
use ratatui::prelude::*;

fn ui(frame: &mut Frame) {
    frame.render_widget(
        Paragraph::new("Hello, Ratatui!")
            .block(Block::bordered().title("App")),
        frame.area(),
    );
}
```', 'standard', 1, 1, 0, 'pending', datetime('now'), datetime('now')),

('stk_bubbletea', 'Bubbletea TUI', 'bubbletea-tui', 'Build terminal apps in Go with Bubble Tea and Lip Gloss.', 'tui', 3, '["go", "bubbletea", "tui", "terminal"]',
'# Bubbletea Stack

## Core Features
- Elm-like architecture
- Lip Gloss for styling
- Bubbles component library
- Excellent UX

## Model
```go
type model struct {
    count int
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
    switch msg := msg.(type) {
    case tea.KeyMsg:
        if msg.String() == "q" { return m, tea.Quit }
        if msg.String() == "+" { m.count++ }
    }
    return m, nil
}
```', 'standard', 1, 1, 0, 'pending', datetime('now'), datetime('now')),

('stk_ink', 'Ink React CLI', 'ink-react-cli', 'Build CLI apps with React using Ink - interactive command-line interfaces.', 'tui', 3, '["ink", "react", "cli", "terminal"]',
'# Ink Stack

## Core Features
- React for CLI
- Component-based UI
- Hooks support
- Interactive prompts

## Component
```tsx
import { render, Text, Box } from "ink"

const App = () => (
  <Box flexDirection="column">
    <Text color="green">Hello from Ink!</Text>
  </Box>
)

render(<App />)
```

## Hooks
- useInput for keyboard
- useApp for app control
- useState for state', 'minimal', 1, 1, 0, 'pending', datetime('now'), datetime('now'));

-- Tooling (Layer 3)
INSERT INTO stacks (id, name, slug, description, category, layer, tags, instructions, token_budget, is_public, is_starter, is_featured, learning_status, created_at, updated_at) VALUES
('stk_vitest', 'Vitest + Testing Library', 'vitest-testing', 'Modern testing with Vitest and Testing Library - fast, ESM-native tests.', 'tooling', 3, '["vitest", "testing", "testing-library"]',
'# Vitest Stack

## Core Features
- Vite-powered test runner
- ESM-native
- Jest-compatible API
- Watch mode with HMR

## Test Example
```typescript
import { render, screen } from "@testing-library/react"
import { expect, test } from "vitest"

test("renders greeting", () => {
  render(<Greeting name="World" />)
  expect(screen.getByText("Hello, World!")).toBeInTheDocument()
})
```

## Config
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
})
```', 'minimal', 1, 1, 0, 'pending', datetime('now'), datetime('now'));
