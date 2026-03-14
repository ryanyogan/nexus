# Token Savings with Nexus

Every AI interaction costs tokens. When you paste documentation, re-explain your project structure, or provide context your AI already knew yesterday, you're burning through your budget on repetitive overhead.

Nexus solves this with **semantic search** and **persistent memory**—giving your AI the information it needs without the bloat.

## Semantic Search vs. Full Context

### The Problem with Full Context

Traditional approaches to giving AI documentation access involve:

1. **Pasting documentation** — Copy-paste relevant docs into your chat
2. **RAG with full retrieval** — Dump entire files into context
3. **Re-explaining every session** — Tell the AI the same things repeatedly

This is expensive. A typical React documentation page is 5,000-15,000 tokens. The Next.js App Router docs? Over 100,000 tokens. Your project conventions doc? Another 10,000 tokens every single session.

### How Nexus Does It Differently

Nexus uses semantic search to return **only the relevant portions** of documentation:

```
┌─────────────────────────────────────────────────────────────┐
│ Traditional Approach                                        │
│                                                             │
│ "How do I use useEffect?"                                   │
│     ↓                                                       │
│ Paste entire React hooks documentation (50,000 tokens)      │
│     ↓                                                       │
│ AI finds the relevant paragraph                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Nexus Approach                                              │
│                                                             │
│ "How do I use useEffect?"                                   │
│     ↓                                                       │
│ Semantic search finds relevant chunks (2,000 tokens)        │
│     ↓                                                       │
│ AI gets exactly what it needs                               │
└─────────────────────────────────────────────────────────────┘
```

## Token Comparison

Here's what this looks like in practice:

| Scenario | Without Nexus | With Nexus | Savings |
|----------|---------------|------------|---------|
| Query React docs | 50,000 tokens | 2,000-5,000 tokens | **90-96%** |
| Load project context | 15,000 tokens/session | 500 tokens (one-time save) | **97%** |
| Find MCP server setup | 10,000 tokens (manual search) | 1,000 tokens | **90%** |
| Weekly total (50 queries) | 2,500,000 tokens | 175,000 tokens | **93%** |

:::tip Real-world example
A team querying documentation 50 times per week saved approximately **2.3 million tokens monthly** by switching to Nexus semantic search.
:::

## Best Practices for Queries

### Be Specific

The more specific your query, the more precise the results:

```
❌ "Tell me about React"
   → Returns general React overview (high token count)

✅ "How do I clean up subscriptions in useEffect?"
   → Returns specific cleanup pattern (low token count)
```

### Use Natural Language

Nexus understands intent, not just keywords:

```
✅ "How do I handle authentication errors in Hono middleware?"
✅ "What's the best way to validate forms in React Hook Form?"
✅ "Show me how to set up Drizzle with PostgreSQL"
```

### Combine Tools Efficiently

For maximum efficiency, combine library resolution with targeted queries:

```typescript
// Step 1: Resolve the library (one-time)
resolve-library: "nextjs"
→ Returns: /vercel/next.js

// Step 2: Query specific topics
query-docs: {
  libraryId: "/vercel/next.js",
  query: "server actions with form validation"
}
→ Returns: Exactly what you need
```

## Memory Saves Tokens Too

Project context is even more expensive to repeat than documentation queries. With Nexus memory:

| Context Type | Without Memory | With Memory |
|--------------|----------------|-------------|
| Project architecture | Re-explain every session | Save once, recall forever |
| Coding conventions | 5,000 tokens/session | 200 tokens to recall |
| Past decisions | Search old chats | Instant semantic recall |
| Lessons learned | Forgotten | Available when relevant |

### Example: Project Setup

Instead of explaining your project every time:

```
You: "This is a monorepo using Turborepo with apps/ for 
applications and packages/ for shared code. We use TypeScript 
everywhere, Hono for APIs, React for frontend, and deploy to 
Cloudflare. Our auth uses JWTs stored in httpOnly cookies..."
```

Save it once:

```typescript
save-memory: {
  title: "Project Architecture",
  type: "project_context",
  project: "my-project",
  content: "Monorepo with Turborepo. apps/ contains web (React), 
           api (Hono on Workers), docs (Docusaurus). packages/ has 
           shared db, ui, and utils. TypeScript everywhere. 
           Cloudflare deployment. JWT auth with httpOnly cookies."
}
```

Recall when needed:

```typescript
get-project-context: { project: "my-project" }
// Returns all relevant context in ~500 tokens
```

## Measuring Your Savings

Track your token usage before and after Nexus:

1. **Document your baseline** — Note how many tokens you typically use per session
2. **Enable Nexus** — Use semantic search and memory features
3. **Compare after a week** — Most users see 40-60% reduction

:::note
Token savings vary based on usage patterns. Users who frequently reference documentation or switch between projects see the highest savings.
:::

## Summary

| Strategy | Impact |
|----------|--------|
| Use semantic search instead of pasting docs | 90%+ reduction per query |
| Save project context to memory | Eliminate repetitive explanations |
| Be specific with queries | Get targeted results, fewer tokens |
| Use `get-project-context` at session start | One call replaces lengthy explanations |

The key insight: **pay tokens once to save information, query efficiently forever**.
