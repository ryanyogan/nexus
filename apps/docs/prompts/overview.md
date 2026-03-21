# Prompts Overview

Prompts are pre-configured AI working environments that bundle together skills, documentation, system prompts, and preferences. When activated, a Prompt puts your AI agent into the right "headspace" immediately.

## What is a Prompt?

Think of Prompts as **AI personality profiles** or **specialized work modes**. Instead of manually configuring your AI for each type of task, a Prompt provides:

- **System prompts** - Custom instructions for how the AI should behave
- **Documentation** - Pre-loaded library references (React, TypeScript, etc.)
- **Skills** - Specialized capabilities and knowledge
- **Preferences** - Code style, verbosity, response format settings

## Key Features

### Multiple Active Prompts

You can have multiple prompts active simultaneously. When prompts are stacked, their configurations are merged:

- System prompts are concatenated
- Documentation libraries are combined
- Skills are merged (no duplicates)
- Preferences from later prompts override earlier ones

### Prompt Inheritance

Prompts can extend other prompts, inheriting their configuration while adding or overriding specific settings. This allows you to:

- Create a base "TypeScript Developer" prompt
- Extend it with "React + TypeScript" that adds React-specific config
- Further extend with "React Testing" that adds testing tools

Inheritance is limited to 3 levels deep to prevent complexity.

### Starter Pack Prompts

Nexus includes 6 pre-configured starter prompts:

| Prompt                          | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| **React + TypeScript Expert**   | Modern React development with TypeScript, hooks, and best practices |
| **Full-Stack Developer**        | End-to-end web development across frontend and backend              |
| **Testing & QA Engineer**       | Comprehensive testing strategies and quality assurance              |
| **UI/UX Designer**              | Design systems, accessibility, and user experience                  |
| **API Developer**               | REST and GraphQL API design and implementation                      |
| **TanStack Start + Cloudflare** | Full-stack with TanStack Router, Start, and Cloudflare Workers      |

## Getting Started

### Using the CLI

```bash
# List available prompts
nexus prompt list

# See your active prompts
nexus prompt active

# Activate a prompt
nexus prompt activate react-typescript-expert

# Deactivate a prompt
nexus prompt deactivate react-typescript-expert

# Download a prompt as PROMPT.md
nexus prompt download react-typescript-expert
```

### Using MCP Tools

Your AI agent has access to prompt tools:

- `list-prompts` - Browse available prompts
- `get-prompt` - Get a specific prompt by ID
- `search-prompts` - Search prompts semantically
- `save-prompt` - Save a new prompt from the agent

### Using the Dashboard

Visit the [Prompts Dashboard](/dashboard/prompts) to:

- Browse and search prompts
- Activate/deactivate prompts with one click
- Create custom prompts
- Manage prompt priorities

## Auto-Activation

### Project Configuration

Create a `.nexus/config.json` in your project root:

```json
{
  "defaultPrompt": "react-typescript-expert"
}
```

### Prompt Suggestions

The AI can analyze your project and recommend appropriate prompts based on:

- Package.json dependencies
- File structure and patterns
- Technology stack detection

## Creating Custom Prompts

You can create your own prompts that combine:

1. **System Prompt** - Instructions for the AI
2. **Libraries** - Documentation to pre-load
3. **Skills** - Capabilities to enable
4. **Preferences** - Response formatting options

See [Creating Prompts](./creating-prompts) for a detailed guide.

## Memory Integration

When you save a memory while a prompt is active, the memory is associated with that prompt. This allows for:

- Prompt-specific knowledge accumulation
- Context-aware memory recall
- Better organization of project learnings

## Next Steps

- [CLI Commands](./cli-commands) - Full CLI reference for prompts
- [MCP Tools](./mcp-tools) - Using prompts with AI agents
- [Creating Prompts](./creating-prompts) - Build your own custom prompts
- [Best Practices](./best-practices) - Tips for effective prompt usage
