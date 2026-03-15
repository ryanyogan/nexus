# Stacks Overview

Stacks are AI-powered project scaffolding templates that combine stack instructions, CLI preferences, GitHub repository knowledge, and package manifests into token-efficient context prompts.

## The Problem

When starting a new project or working with a new technology stack, AI assistants often:

- Suggest outdated patterns and deprecated APIs
- Miss important conventions specific to your stack
- Generate boilerplate that doesn't follow best practices
- Lack knowledge of your preferred tools and configurations

## The Solution

Stacks solve this by:

1. **Pre-researching** documentation, GitHub repos, and package APIs
2. **Compiling** this knowledge into token-efficient prompts
3. **Composing** multiple stacks together for full-stack coverage
4. **Sharing** community-created stacks through the marketplace

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        STACK                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Instructions   │  │   GitHub Repos  │  │   Packages   │ │
│  │  (Your rules)   │  │  (Learn from)   │  │  (Research)  │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬───────┘ │
│           │                    │                   │         │
│           └────────────────────┼───────────────────┘         │
│                                │                             │
│                    ┌───────────▼───────────┐                 │
│                    │    AI Compilation     │                 │
│                    │  (Background Job)     │                 │
│                    └───────────┬───────────┘                 │
│                                │                             │
│                    ┌───────────▼───────────┐                 │
│                    │   Compiled Prompt     │                 │
│                    │   (~2K-10K tokens)    │                 │
│                    └───────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### Visual Canvas

Build stacks visually using a drag-and-drop React Flow canvas. Add nodes for:

- **Instructions** - Your rules and preferences
- **Repositories** - GitHub repos to learn from
- **Packages** - npm/crate packages to research
- **Child Stacks** - Compose other stacks

### Text Mode

Prefer writing? Switch to text mode and write your instructions directly with Markdown support.

### Token Budget Control

Choose your token budget based on your needs:

- **Minimal (2K)** - Essential patterns only
- **Standard (5K)** - Balanced coverage
- **Comprehensive (10K)** - Full documentation

### Background Learning

When you add a GitHub repository, a background job:

1. Analyzes the repository structure
2. Extracts patterns and conventions
3. Identifies key files and configurations
4. Compiles findings into your stack

### Stack Composition

Compose stacks together for full-stack coverage:

```
┌────────────────────┐
│  My Fullstack App  │
├────────────────────┤
│ ├─ TanStack Start  │  (Fullstack framework)
│ ├─ Drizzle ORM     │  (Database)
│ ├─ shadcn/ui       │  (UI components)
│ └─ Vitest          │  (Testing)
└────────────────────┘
```

## Getting Started

1. **Browse Stacks** - Explore the [marketplace](https://nexus.yogan.dev/?filter=stacks) for community stacks
2. **Create Your Own** - Use the [visual canvas](/dashboard/stacks/new) to build a stack
3. **Use via MCP** - Query stacks with the `get-stack` tool
4. **Share** - Publish your stacks for others to use

## Use Cases

### New Project Setup

```
"I'm starting a new project using the TanStack Start stack"
→ AI receives comprehensive TanStack Start patterns,
  file structure, and best practices
```

### Learning a New Framework

```
"Help me add authentication to my Hono API"
→ Stack provides Hono-specific auth patterns,
  middleware setup, and security best practices
```

### Team Standardization

```
"Create a stack with our company's coding standards"
→ Everyone on the team gets consistent AI assistance
  following your conventions
```

## Next Steps

- [Quickstart Guide](/stacks/quickstart) - Create your first stack in 5 minutes
- [Visual Canvas](/stacks/visual-canvas) - Learn the canvas interface
- [Starter Stacks](/stacks/starter-stacks) - Explore 25+ pre-built stacks
