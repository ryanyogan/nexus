# Token Savings Guide

How Nexus helps you save tokens and reduce costs.

## The Problem

Without Nexus, you waste tokens on:

- Re-explaining project structure every session
- Pasting documentation into chat
- Describing conventions repeatedly
- Context that gets lost between conversations

## How Nexus Saves Tokens

### 1. Semantic Search

Instead of pasting entire documentation pages, Nexus returns only relevant chunks:

| Approach              | Tokens  |
| --------------------- | ------- |
| Paste React docs page | ~5,000  |
| Nexus query result    | ~500    |
| **Savings**           | **90%** |

### 2. Persistent Memory

Load all project context with one tool call:

| Approach           | Tokens per session |
| ------------------ | ------------------ |
| Re-explain context | ~2,000             |
| Load from memory   | ~200               |
| **Savings**        | **90%**            |

### 3. Targeted Results

Nexus returns ranked results with relevance scores, so you get the most useful information first.

## Best Practices

### Use Specific Queries

```
Bad: "useEffect"
Good: "useEffect cleanup function for subscriptions"
```

### Use Token Formats

```json
{
  "query": "...",
  "tokens": "compact" // or "code-only", "summary"
}
```

### Save Once, Use Many

Save project context once at the start, then load it in every session.

## Measuring Savings

Track your token usage:

1. Note tokens used before Nexus
2. Use Nexus for a week
3. Compare usage

Most users see 50-90% reduction in context tokens.
