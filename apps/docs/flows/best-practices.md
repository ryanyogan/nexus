# Flow Best Practices

Get the most out of Nexus Flows with these proven patterns and recommendations.

## Organizing Your Flows

### Create a Flow Hierarchy

Build flows that progressively specialize:

```
Level 0: Base Flows
├── typescript-fundamentals
├── testing-fundamentals
└── devops-fundamentals

Level 1: Technology Stacks
├── react-typescript (extends typescript-fundamentals)
├── node-typescript (extends typescript-fundamentals)
└── fullstack-typescript (extends both)

Level 2: Project-Specific
├── my-saas-frontend (extends react-typescript)
└── my-saas-backend (extends node-typescript)
```

### One Flow Per Concern

Rather than one large flow, use multiple focused flows:

```bash
# Multiple active flows for a testing session
nexus flow activate react-typescript-expert
nexus flow activate testing-qa-engineer

# Flows are merged: React knowledge + Testing expertise
```

### Priority Ordering

When multiple flows are active, earlier flows take precedence for conflicts:

```bash
# Priority 1 (highest)
nexus flow activate react-typescript-expert --priority 1

# Priority 2
nexus flow activate testing-qa-engineer --priority 2
```

## Writing Effective System Prompts

### Be Specific About Constraints

Instead of:
```
Be careful with security.
```

Write:
```
Security Requirements:
- Always sanitize user inputs before database queries
- Use parameterized queries, never string concatenation
- Validate file uploads: check MIME types, limit size to 5MB
- Hash passwords with bcrypt (cost factor 12+)
```

### Include Anti-Patterns

Tell the AI what NOT to do:

```markdown
## Avoid These Patterns
- Never use `any` type; use `unknown` with type guards
- Don't use `var`; prefer `const`, then `let`
- Avoid default exports; use named exports
- Don't mutate state directly; use immutable patterns
```

### Provide Context

Explain WHY, not just WHAT:

```markdown
## Why These Choices

We use Zustand instead of Redux because:
- Smaller bundle size for our performance requirements
- Simpler API for our team's experience level
- Better TypeScript inference

This context helps you make consistent recommendations.
```

## Leveraging Flow Inheritance

### Create Reusable Base Flows

```markdown
# Base: typescript-strict

System Prompt:
- Use TypeScript strict mode conventions
- Explicit return types for all exported functions
- No implicit any
- Prefer interfaces over type aliases for objects
```

### Override Only What Changes

Child flows should add, not repeat:

```markdown
# Child: react-typescript (extends typescript-strict)

System Prompt:
# React-Specific Additions
- Use functional components with hooks
- Prefer composition over inheritance
- (TypeScript rules are inherited automatically)
```

### Document Inheritance

Add comments explaining the chain:

```markdown
# Flow: react-testing
# Extends: react-typescript -> typescript-strict
# Purpose: React component testing with Vitest
```

## Managing Flow Preferences

### Match Team Conventions

Align preferences with your team's style guide:

```json
{
  "verbosity": "balanced",
  "codeStyle": "documented",
  "responseFormat": "full"
}
```

### Project-Specific Preferences

Different projects may need different settings:

| Project | Verbosity | Code Style |
|---------|-----------|------------|
| Greenfield | Detailed | Documented |
| Maintenance | Concise | Minimal |
| Documentation | Detailed | Verbose |

## Auto-Activation Patterns

### Project Configuration

Create `.nexus/config.json` in your project root:

```json
{
  "defaultFlow": "my-project-flow",
  "autoActivate": true
}
```

### Monorepo Setup

For monorepos, configure per-package:

```
my-monorepo/
├── .nexus/config.json          # Base config
├── packages/
│   ├── frontend/
│   │   └── .nexus/config.json  # Frontend-specific flow
│   └── backend/
│       └── .nexus/config.json  # Backend-specific flow
```

## Memory Integration

### Flow-Specific Learning

When saving memories, associate them with flows:

```typescript
// Memory is automatically tagged with active flows
save-memory({
  title: "React Query caching pattern",
  content: "...",
  // flowId is automatically added based on active flows
})
```

### Recall by Flow

Query memories in flow context:

```typescript
recall-memories({
  query: "caching patterns",
  // Automatically prioritizes memories from active flows
})
```

## Performance Tips

### Limit Active Flows

Each active flow adds to context size. Aim for 2-3 active flows maximum.

### Use Focused Libraries

Include only necessary documentation:

```
Good: react, react-query, zod
Bad: react, vue, angular, svelte, solid... (everything)
```

### Streamline System Prompts

Keep prompts under 2000 tokens for optimal performance.

## Troubleshooting Flows

### Unexpected Behavior

1. Check active flows: `nexus flow active`
2. Review merged configuration
3. Verify priority order
4. Check for conflicting instructions

### Prompt Not Taking Effect

1. Ensure flow is activated
2. Check inheritance chain
3. Verify you're authenticated
4. Try deactivating/reactivating

### Context Overload

If responses seem unfocused:

1. Reduce number of active flows
2. Trim system prompts
3. Remove unnecessary libraries
4. Use more specific flows

## Common Patterns

### The "Project Onboarding" Flow

```markdown
# System Prompt

When starting work on this project:
1. Read README.md for project overview
2. Check package.json for dependencies
3. Review .nexus/config.json for project conventions
4. Look for existing patterns in src/ before creating new ones

Key conventions:
- [Project-specific rules here]
```

### The "Code Review" Flow

```markdown
# System Prompt

When reviewing code:
1. Check for type safety issues
2. Verify error handling
3. Look for performance concerns
4. Ensure accessibility compliance
5. Validate test coverage

Output format:
- List issues by severity (Critical > High > Medium > Low)
- Include line numbers
- Provide fix suggestions
```

### The "Documentation" Flow

```markdown
# System Prompt

When writing documentation:
1. Start with a one-line summary
2. Include usage examples
3. Document all parameters
4. Add error scenarios
5. Include related functions/components

Style:
- Use present tense
- Be concise but complete
- Include TypeScript types in examples
```

## Next Steps

- [Flow CLI Commands](./cli-commands) - Full CLI reference
- [MCP Tools](./mcp-tools) - Programmatic flow management
- [Creating Flows](./creating-flows) - Build custom flows
