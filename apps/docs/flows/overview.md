# Flows Overview

Flows are pre-configured AI working environments that bundle together skills, documentation, system prompts, and preferences. When activated, a Flow puts your AI agent into the right "headspace" immediately.

## What is a Flow?

Think of Flows as **AI personality profiles** or **specialized work modes**. Instead of manually configuring your AI for each type of task, a Flow provides:

- **System prompts** - Custom instructions for how the AI should behave
- **Documentation** - Pre-loaded library references (React, TypeScript, etc.)
- **Skills** - Specialized capabilities and knowledge
- **Preferences** - Code style, verbosity, response format settings

## Key Features

### Multiple Active Flows

You can have multiple flows active simultaneously. When flows are stacked, their configurations are merged:

- System prompts are concatenated
- Documentation libraries are combined
- Skills are merged (no duplicates)
- Preferences from later flows override earlier ones

### Flow Inheritance

Flows can extend other flows, inheriting their configuration while adding or overriding specific settings. This allows you to:

- Create a base "TypeScript Developer" flow
- Extend it with "React + TypeScript" that adds React-specific config
- Further extend with "React Testing" that adds testing tools

Inheritance is limited to 3 levels deep to prevent complexity.

### Starter Pack Flows

Nexus includes 6 pre-configured starter flows:

| Flow | Description |
|------|-------------|
| **React + TypeScript Expert** | Modern React development with TypeScript, hooks, and best practices |
| **Full-Stack Developer** | End-to-end web development across frontend and backend |
| **Testing & QA Engineer** | Comprehensive testing strategies and quality assurance |
| **UI/UX Designer** | Design systems, accessibility, and user experience |
| **API Developer** | REST and GraphQL API design and implementation |
| **TanStack Start + Cloudflare** | Full-stack with TanStack Router, Start, and Cloudflare Workers |

## Getting Started

### Using the CLI

```bash
# List available flows
nexus flow list

# See your active flows
nexus flow active

# Activate a flow
nexus flow activate react-typescript-expert

# Deactivate a flow
nexus flow deactivate react-typescript-expert

# Download a flow as FLOW.md
nexus flow download react-typescript-expert
```

### Using MCP Tools

Your AI agent has access to flow tools:

- `list-flows` - Browse available flows
- `get-active-flows` - See currently active flows
- `activate-flow` - Enable a flow
- `deactivate-flow` - Disable a flow
- `suggest-flows` - Get AI recommendations based on your project

### Using the Dashboard

Visit the [Flows Dashboard](/dashboard/flows) to:

- Browse and search flows
- Activate/deactivate flows with one click
- Create custom flows
- Manage flow priorities

## Auto-Activation

### Project Configuration

Create a `.nexus/config.json` in your project root:

```json
{
  "defaultFlow": "react-typescript-expert"
}
```

### Flow Suggestions

The `suggest-flows` MCP tool analyzes your project and recommends appropriate flows based on:

- Package.json dependencies
- File structure and patterns
- Technology stack detection

## Creating Custom Flows

You can create your own flows that combine:

1. **System Prompt** - Instructions for the AI
2. **Libraries** - Documentation to pre-load
3. **Skills** - Capabilities to enable
4. **Preferences** - Response formatting options

See [Creating Flows](./creating-flows) for a detailed guide.

## Memory Integration

When you save a memory while a flow is active, the memory is associated with that flow. This allows for:

- Flow-specific knowledge accumulation
- Context-aware memory recall
- Better organization of project learnings

## Next Steps

- [CLI Commands](./cli-commands) - Full CLI reference for flows
- [MCP Tools](./mcp-tools) - Using flows with AI agents
- [Creating Flows](./creating-flows) - Build your own custom flows
- [Best Practices](./best-practices) - Tips for effective flow usage
