# Quickstart

Create your first Stack in 5 minutes.

## Prerequisites

- A Nexus account (sign up at [nexus.yogan.dev](https://nexus.yogan.dev))
- Basic understanding of your target technology stack

## Step 1: Create a New Stack

1. Navigate to **Dashboard > Stacks**
2. Click **Create Stack**
3. Enter a name and description

```
Name: My React Project Stack
Description: Best practices for React 19 with TypeScript
```

## Step 2: Add Instructions

Switch to the **Instructions** tab and add your rules:

```markdown
# My React Stack

## Core Technologies
- React 19 with TypeScript strict mode
- Vite for bundling
- TanStack Query for data fetching
- Tailwind CSS for styling

## Best Practices
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use React Server Components where applicable

## File Structure
```
src/
  components/     # Reusable UI components
  features/       # Feature-specific code
  hooks/          # Custom React hooks
  lib/            # Utilities and helpers
  routes/         # Page components
```

## Naming Conventions
- Components: PascalCase (Button.tsx)
- Hooks: camelCase with "use" prefix (useAuth.ts)
- Utils: camelCase (formatDate.ts)
```

## Step 3: Set Token Budget

Choose your token budget in the **Options** panel:

| Budget | Tokens | Best For |
|--------|--------|----------|
| Minimal | ~2K | Quick prompts, specific questions |
| Standard | ~5K | General development (recommended) |
| Comprehensive | ~10K | Complex projects, full documentation |

## Step 4: Save and Test

1. Click **Save Stack**
2. Test it using the MCP tool:

```
"Use my React Project Stack to help me build a todo app"
```

The AI will now have access to your stack's instructions and best practices.

## Step 5: Enhance with Learning (Optional)

Add GitHub repositories for the AI to learn from:

1. Open the **Canvas** view
2. Drag a **Repository** node onto the canvas
3. Enter a GitHub URL (e.g., `https://github.com/tanstack/query`)
4. Click **Learn** to trigger background analysis

The AI will analyze the repository and incorporate patterns into your stack.

## Using via MCP Tools

Once your stack is saved, use it via MCP:

```typescript
// In Claude/Cursor/VS Code
get-stack: { stackId: "my-react-project-stack" }

// Returns your compiled prompt with instructions
```

## Using via CLI

```bash
# List your stacks
nexus stack list

# Use a stack in your current project
nexus stack use my-react-project-stack

# Create a new stack from the CLI
nexus stack create "NextJS 15 App" --infer
```

## Next Steps

- [Visual Canvas](/stacks/visual-canvas) - Build stacks visually
- [Composing Stacks](/stacks/composing) - Combine multiple stacks
- [Marketplace](/stacks/marketplace) - Share and discover stacks
