# Creating Custom Flows

This guide walks you through creating your own custom flows in Nexus.

## Flow Structure

A flow consists of several components:

```typescript
interface Flow {
  name: string;           // Display name
  slug: string;           // URL-friendly identifier
  description: string;    // What this flow does
  systemPrompt: string;   // AI instructions
  parentFlowId?: string;  // Optional parent to extend
  libraries: string[];    // Documentation to include
  skills: string[];       // Skills to enable
  mcpServers: string[];   // MCP servers to suggest
  preferences: {
    verbosity: 'concise' | 'balanced' | 'detailed';
    codeStyle: 'minimal' | 'documented' | 'verbose';
    responseFormat: 'full' | 'compact' | 'code-only' | 'summary';
    useEmojis: boolean;
    preferredLanguage?: string;
  };
  category: string;       // For organization
  tags: string[];         // Searchable tags
}
```

## Creating via Dashboard

1. Navigate to [Flows Dashboard](/dashboard/flows)
2. Click "Create Flow"
3. Fill in the form:
   - **Name**: Human-readable name
   - **Slug**: URL-safe identifier (auto-generated from name)
   - **Description**: What the flow is for
   - **System Prompt**: Instructions for the AI
   - **Parent Flow**: Optional flow to extend
4. Configure libraries, skills, and preferences
5. Click "Create"

## Creating via CLI

### Interactive Mode

```bash
nexus flow create --interactive
```

This guides you through each option with prompts.

### Direct Creation

```bash
nexus flow create \
  --name "React Testing Expert" \
  --slug "react-testing" \
  --description "Focused on React component and integration testing" \
  --parent testing-qa-engineer \
  --libraries react,vitest,testing-library \
  --prompt "You are an expert in React testing..."
```

## Writing Effective System Prompts

### Structure

A good system prompt includes:

1. **Role Definition**: Who the AI is
2. **Expertise Areas**: What it knows well
3. **Behavioral Guidelines**: How it should respond
4. **Constraints**: What to avoid
5. **Examples**: Sample interactions (optional)

### Example System Prompt

```markdown
You are an expert React and TypeScript developer with deep knowledge of:
- React 18+ features (hooks, suspense, concurrent rendering)
- TypeScript 5+ with strict type checking
- Modern state management (Zustand, Jotai, React Query)
- Testing with Vitest and React Testing Library

## Guidelines
- Prefer functional components with hooks over class components
- Always use TypeScript with explicit return types for exported functions
- Suggest appropriate error boundaries for production code
- Include accessibility attributes (aria-*, role) in UI components

## Code Style
- Use named exports over default exports
- Destructure props in function parameters
- Prefer early returns for guard clauses
- Add JSDoc comments for public APIs

## Constraints
- Do not suggest deprecated patterns (componentWillMount, etc.)
- Avoid inline styles; prefer CSS modules or Tailwind
- Do not use `any` type; prefer `unknown` with type guards
```

## Extending Existing Flows

### Using Inheritance

Extend a flow to add or override configuration:

```bash
nexus flow create \
  --name "React E2E Testing" \
  --parent react-testing \
  --libraries playwright \
  --prompt "Additional focus on end-to-end testing with Playwright..."
```

### Inheritance Rules

1. **System Prompts**: Child prompt appended to parent
2. **Libraries**: Merged (union of both)
3. **Skills**: Merged (union of both)
4. **Preferences**: Child overrides parent
5. **Max Depth**: 3 levels of inheritance

### Example Inheritance Chain

```
base-developer (Level 0)
  └── typescript-expert (Level 1)
       └── react-typescript (Level 2)
            └── react-testing (Level 3) ← Maximum depth
```

## Configuring Preferences

### Verbosity

| Level | Description |
|-------|-------------|
| `concise` | Minimal explanations, focus on code |
| `balanced` | Moderate explanations with code |
| `detailed` | Thorough explanations and context |

### Code Style

| Style | Description |
|-------|-------------|
| `minimal` | Just the essential code |
| `documented` | Code with inline comments |
| `verbose` | Extensive comments and examples |

### Response Format

| Format | Description |
|--------|-------------|
| `full` | Complete response with metadata |
| `compact` | Essential information only |
| `code-only` | Just code blocks |
| `summary` | Brief overview |

## Including Libraries

Add documentation libraries to your flow:

```bash
# Find available libraries
nexus docs list

# Add to flow
nexus flow create \
  --libraries react,typescript,tailwindcss,prisma
```

Libraries provide pre-indexed documentation that the AI can query.

## Including Skills

Add specialized skills:

```bash
# Find available skills
nexus skills list

# Add to flow
nexus flow create \
  --skills code-review,security-audit,performance-optimization
```

## Best Practices

### 1. Start Specific

Create focused flows rather than trying to cover everything:

```
Good: "React Form Validation Expert"
  └── Focused on forms, validation, error handling

Bad: "Full-Stack Everything Expert"
  └── Too broad to be useful
```

### 2. Use Inheritance Wisely

Build a hierarchy of flows:

```
frontend-base
  ├── react-expert
  │   ├── react-forms
  │   └── react-data-fetching
  └── vue-expert
      └── vue-composition
```

### 3. Test Your Flows

After creating a flow:

1. Activate it: `nexus flow activate my-flow`
2. Try various prompts
3. Verify the AI behavior matches expectations
4. Refine the system prompt as needed

### 4. Document Your Flows

Add clear descriptions so others (or future you) understand:

```bash
nexus flow create \
  --description "For greenfield React projects using TypeScript 5+, 
                 React Query for data, and Tailwind for styling. 
                 Assumes Vite as build tool."
```

## Sharing Flows

Currently, flows are private to your account. Team sharing features are coming with the Pro tier.

To share a flow configuration:

1. Download the flow: `nexus flow download my-flow`
2. Share the FLOW.md file
3. Others can import or recreate the flow

## Troubleshooting

### Flow Not Activating

Check that you're authenticated:

```bash
nexus auth status
```

### Inheritance Not Working

Verify parent flow exists:

```bash
nexus flow get parent-flow-slug
```

### System Prompt Too Long

Keep prompts focused. If you need extensive instructions, consider:

1. Using inheritance to split into layers
2. Linking to external documentation
3. Using skills for specialized knowledge
