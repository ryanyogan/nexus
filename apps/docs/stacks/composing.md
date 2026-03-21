# Composing Stacks

Stack composition allows you to combine multiple stacks into a unified context, enabling full-stack coverage with modular, reusable components.

## The Power of Composition

Instead of creating one massive stack, compose smaller, focused stacks:

```
┌─────────────────────────────────┐
│      My Fullstack Project       │
├─────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐   │
│  │ TanStack  │  │  Drizzle  │   │
│  │   Start   │  │    ORM    │   │
│  │ (Layer 1) │  │ (Layer 0) │   │
│  └───────────┘  └───────────┘   │
│  ┌───────────┐  ┌───────────┐   │
│  │ shadcn/ui │  │  Vitest   │   │
│  │ (Layer 2) │  │ (Layer 3) │   │
│  └───────────┘  └───────────┘   │
└─────────────────────────────────┘
```

## How It Works

### Parent-Child Relationships

When you add a child stack:

1. The parent stack inherits all instructions from children
2. Instructions are merged in layer order (0 → 3)
3. Conflicts are resolved by parent override

### Layer Ordering

Stacks have layers that determine merge order:

| Layer | Type                    | Examples                      |
| ----- | ----------------------- | ----------------------------- |
| 0     | Infrastructure/Database | Cloudflare, Supabase, Drizzle |
| 1     | Backend/Fullstack       | Hono, TanStack Start, Next.js |
| 2     | Frontend/Styling        | React, shadcn/ui, Tailwind    |
| 3     | Tooling                 | Vitest, ESLint                |

Lower layers are applied first, higher layers can override.

## Adding Child Stacks

### Via Visual Canvas

1. Open your stack in Canvas mode
2. Drag a **Stack Node** onto the canvas
3. Search for and select the child stack
4. Connect to your main stack node

### Via API

```typescript
// POST /api/stacks/:stackId/compositions
{
  "childStackId": "stk_drizzle",
  "position": 0  // Optional: override default layer ordering
}
```

## Composition Rules

### Instruction Merging

Instructions from child stacks are merged:

```markdown
# Parent Stack

- Always use TypeScript
- Prefer functional patterns

# Child Stack (Drizzle)

- Use Drizzle ORM for database access
- Define schema in schema.ts
```

**Merged Result:**

```markdown
# Combined Stack

- Always use TypeScript
- Prefer functional patterns
- Use Drizzle ORM for database access
- Define schema in schema.ts
```

### Conflict Resolution

When instructions conflict:

1. Parent stack instructions take precedence
2. Later layers override earlier layers
3. Explicit overrides are noted

Example:

```markdown
# Parent: "Use Prisma for ORM"

# Child: "Use Drizzle for ORM"

# Result: Uses parent's "Prisma" instruction
```

### Token Budget

Composed stacks combine token usage:

```
Parent (standard: 5K)
├── Child 1 (minimal: 2K)
├── Child 2 (minimal: 2K)
└── Child 3 (standard: 5K)

Total potential: 14K tokens
Optimized/merged: ~8K tokens
```

The compiler optimizes by:

- Removing duplicate instructions
- Condensing similar patterns
- Respecting parent's token budget

## Best Practices

### 1. Keep Stacks Focused

```
✓ "Drizzle ORM" - focused on ORM patterns
✗ "Drizzle + Postgres + Migrations + Auth" - too broad
```

### 2. Use Layer Hierarchy

```
Layer 0: Cloudflare Workers (infrastructure)
Layer 0: Drizzle ORM (database)
Layer 1: Hono API (backend)
Layer 2: Tailwind CSS (styling)
Layer 3: Vitest (testing)
```

### 3. Limit Composition Depth

```
✓ Parent → Child (1 level)
✓ Parent → Child → Grandchild (2 levels)
✗ More than 3 levels (complexity)
```

### 4. Test Compiled Output

After composing, check the compiled prompt:

1. Click **Compile** in the editor
2. Review the merged instructions
3. Verify token count is acceptable

## Common Compositions

### Full-Stack Web App

```
TanStack Start (fullstack)
├── Drizzle ORM (database)
├── Cloudflare Workers (infrastructure)
├── shadcn/ui (styling)
└── Vitest (testing)
```

### API Backend

```
Hono API (backend)
├── Drizzle ORM (database)
├── Cloudflare Workers (infrastructure)
└── Vitest (testing)
```

### Desktop App

```
Tauri v2 (desktop)
├── Vite + React (frontend)
├── Tailwind CSS (styling)
└── Vitest (testing)
```

## Troubleshooting

### Token budget exceeded

- Reduce child stacks
- Use minimal budget children
- Remove redundant instructions

### Instructions not merging

- Check stack is saved and compiled
- Verify child stack is public or owned
- Re-compile the parent stack

### Circular dependency

- Stack A cannot contain Stack B if B already contains A
- Remove the circular reference
