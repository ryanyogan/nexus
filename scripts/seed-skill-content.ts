/**
 * Seed skill content to R2
 * Run with: npx tsx scripts/seed-skill-content.ts
 */

const SKILLS_CONTENT: Record<string, string> = {
  "pdf-extraction": `# PDF Extraction Skill

Use this skill when you need to extract content from PDF files.

## Capabilities

- Extract text from PDF documents
- Parse tables into structured data
- Handle multi-page documents
- OCR support for scanned PDFs
- Preserve document structure and formatting

## Usage Guidelines

1. **Text Extraction**: For standard PDFs, extract text while preserving paragraph structure
2. **Table Extraction**: Identify tables and convert to structured formats (CSV, JSON)
3. **Image Handling**: Note image locations and provide alt-text descriptions
4. **Metadata**: Extract document metadata (author, title, creation date)

## Best Practices

- Always verify extracted content against the original
- For complex layouts, describe the structure before extracting
- Handle multi-column layouts by processing columns separately
- For scanned documents, mention OCR confidence levels

## Example Workflow

\`\`\`
1. Receive PDF file
2. Analyze document structure (pages, sections, tables)
3. Extract text content preserving hierarchy
4. Parse any tables into structured format
5. Return organized content with metadata
\`\`\`
`,

  "code-review": `# Code Review Skill

Perform thorough code reviews that improve code quality and team knowledge sharing.

## Review Checklist

### Correctness
- [ ] Does the code do what it's supposed to do?
- [ ] Are edge cases handled?
- [ ] Are there any potential bugs or logic errors?

### Security
- [ ] Input validation present?
- [ ] No hardcoded secrets or credentials?
- [ ] SQL injection / XSS prevention?
- [ ] Authentication/authorization correct?

### Performance
- [ ] Efficient algorithms used?
- [ ] No unnecessary database queries?
- [ ] Appropriate caching?
- [ ] Memory leaks avoided?

### Maintainability
- [ ] Clear, descriptive naming?
- [ ] Appropriate comments for complex logic?
- [ ] DRY principles followed?
- [ ] Single responsibility?

### Testing
- [ ] Unit tests for new code?
- [ ] Edge cases tested?
- [ ] Integration tests if needed?

## Feedback Guidelines

1. **Be specific**: Point to exact lines and explain the issue
2. **Suggest solutions**: Don't just identify problems, propose fixes
3. **Prioritize**: Label issues as critical, major, minor, or nitpick
4. **Be constructive**: Focus on the code, not the person
5. **Acknowledge good work**: Highlight well-written code too

## Response Format

\`\`\`markdown
## Code Review Summary

**Overall Assessment**: [APPROVE / REQUEST_CHANGES / COMMENT]

### Critical Issues
- [Issue description with file:line reference]

### Suggestions
- [Improvement suggestions]

### Positive Notes
- [Good practices observed]
\`\`\`
`,

  "typescript-strict": `# TypeScript Strict Mode Skill

Write TypeScript code with strict type safety and modern best practices.

## Core Principles

1. **Never use \`any\`** - Use \`unknown\` and type guards instead
2. **Explicit return types** - Define return types for all functions
3. **Strict null checks** - Handle null/undefined explicitly
4. **Discriminated unions** - Use for complex state management

## Type Patterns

### Prefer Interfaces for Objects
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}
\`\`\`

### Use Type for Unions/Intersections
\`\`\`typescript
type Status = 'pending' | 'active' | 'completed';
type AdminUser = User & { permissions: string[] };
\`\`\`

### Generic Constraints
\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
\`\`\`

### Type Guards
\`\`\`typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}
\`\`\`

## Avoid These Patterns

❌ \`any\` type
❌ Type assertions without validation
❌ Non-null assertions (!) without checks
❌ Implicit any in function parameters

## Compiler Options

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
\`\`\`
`,

  "react-best-practices": `# React Best Practices Skill

Build maintainable React applications with modern patterns and hooks.

## Component Design

### Functional Components
Always use functional components with hooks:
\`\`\`tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId);
  
  if (isLoading) return <Skeleton />;
  return <ProfileCard user={user} />;
}
\`\`\`

### Component Composition
Prefer composition over prop drilling:
\`\`\`tsx
<Card>
  <Card.Header>
    <Card.Title>Settings</Card.Title>
  </Card.Header>
  <Card.Content>
    <SettingsForm />
  </Card.Content>
</Card>
\`\`\`

## Hooks Guidelines

### useState
- Group related state or use useReducer for complex state
- Use functional updates when new state depends on previous

### useEffect
- One effect per concern
- Always specify dependencies
- Clean up subscriptions and timers

### useMemo / useCallback
- Only for expensive calculations or stable references
- Don't prematurely optimize

### Custom Hooks
Extract reusable logic:
\`\`\`tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}
\`\`\`

## Performance

- Use React.memo for expensive pure components
- Virtualize long lists
- Code split with React.lazy
- Use Suspense for loading states
`,

  "nextjs-app-router": `# Next.js App Router Skill

Build modern Next.js applications with the App Router and React Server Components.

## File Conventions

\`\`\`
app/
├── layout.tsx      # Root layout (required)
├── page.tsx        # Home page
├── loading.tsx     # Loading UI
├── error.tsx       # Error UI
├── not-found.tsx   # 404 page
└── [slug]/
    └── page.tsx    # Dynamic route
\`\`\`

## Server Components (Default)

\`\`\`tsx
// app/posts/page.tsx - This is a Server Component
async function PostsPage() {
  const posts = await db.posts.findMany();
  return <PostList posts={posts} />;
}
\`\`\`

## Client Components

\`\`\`tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

## Data Fetching

### Server Components
\`\`\`tsx
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // ISR
  });
  return <Component data={data} />;
}
\`\`\`

### Server Actions
\`\`\`tsx
async function createPost(formData: FormData) {
  'use server';
  await db.posts.create({ data: Object.fromEntries(formData) });
  revalidatePath('/posts');
}
\`\`\`

## Metadata

\`\`\`tsx
export const metadata = {
  title: 'My App',
  description: 'Built with Next.js',
};
\`\`\`
`,

  "security-audit": `# Security Audit Skill

Identify and remediate security vulnerabilities in code and applications.

## OWASP Top 10 Checklist

### 1. Injection
- [ ] Parameterized queries for SQL
- [ ] Input sanitization
- [ ] No eval() or dynamic code execution

### 2. Broken Authentication
- [ ] Strong password requirements
- [ ] Rate limiting on login
- [ ] Secure session management
- [ ] MFA support

### 3. Sensitive Data Exposure
- [ ] Data encrypted at rest
- [ ] HTTPS enforced
- [ ] No secrets in code/logs

### 4. XXE
- [ ] XML parsing disabled or secured
- [ ] DTD processing disabled

### 5. Broken Access Control
- [ ] Authorization on all endpoints
- [ ] No IDOR vulnerabilities
- [ ] Principle of least privilege

### 6. Security Misconfiguration
- [ ] Default credentials changed
- [ ] Unnecessary features disabled
- [ ] Error messages don't leak info

### 7. XSS
- [ ] Output encoding
- [ ] Content Security Policy
- [ ] HttpOnly cookies

### 8. Insecure Deserialization
- [ ] Input validation before deserializing
- [ ] Type checking

### 9. Using Components with Known Vulnerabilities
- [ ] Dependencies up to date
- [ ] Security advisories monitored

### 10. Insufficient Logging
- [ ] Security events logged
- [ ] Logs protected from tampering

## Response Format

\`\`\`markdown
## Security Audit Report

### Critical Vulnerabilities
| ID | Type | Location | Description | Remediation |
|----|------|----------|-------------|-------------|

### Recommendations
1. ...
\`\`\`
`,

  "cloudflare-workers": `# Cloudflare Workers Skill

Build edge-first applications with Cloudflare Workers and the Cloudflare ecosystem.

## Project Structure

\`\`\`
my-worker/
├── src/
│   └── index.ts
├── wrangler.toml
├── package.json
└── tsconfig.json
\`\`\`

## Basic Worker

\`\`\`typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/hello') {
      return Response.json({ message: 'Hello from the edge!' });
    }
    
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
\`\`\`

## KV Storage

\`\`\`typescript
// Read
const value = await env.MY_KV.get('key');

// Write
await env.MY_KV.put('key', 'value', { expirationTtl: 3600 });

// Delete
await env.MY_KV.delete('key');
\`\`\`

## D1 Database

\`\`\`typescript
const result = await env.DB.prepare(
  'SELECT * FROM users WHERE id = ?'
).bind(userId).first();

const { results } = await env.DB.prepare(
  'SELECT * FROM users'
).all();
\`\`\`

## R2 Object Storage

\`\`\`typescript
// Upload
await env.BUCKET.put('file.txt', fileContent);

// Download
const object = await env.BUCKET.get('file.txt');
const content = await object?.text();

// Delete
await env.BUCKET.delete('file.txt');
\`\`\`

## Durable Objects

\`\`\`typescript
export class Counter implements DurableObject {
  constructor(private state: DurableObjectState) {}

  async fetch(request: Request) {
    const count = (await this.state.storage.get<number>('count')) || 0;
    await this.state.storage.put('count', count + 1);
    return Response.json({ count: count + 1 });
  }
}
\`\`\`
`,

  "mcp-server-builder": `# MCP Server Builder Skill

Create Model Context Protocol (MCP) servers to extend AI assistant capabilities.

## MCP Server Structure

\`\`\`typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-mcp-server",
  version: "1.0.0",
}, {
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
  },
});
\`\`\`

## Defining Tools

\`\`\`typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "calculate",
    description: "Perform mathematical calculations",
    inputSchema: {
      type: "object",
      properties: {
        expression: { type: "string", description: "Math expression" }
      },
      required: ["expression"]
    }
  }]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calculate") {
    const result = evaluate(request.params.arguments.expression);
    return { content: [{ type: "text", text: String(result) }] };
  }
  throw new Error("Unknown tool");
});
\`\`\`

## Resources

\`\`\`typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [{
    uri: "file:///config.json",
    name: "Configuration",
    mimeType: "application/json"
  }]
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => ({
  contents: [{
    uri: request.params.uri,
    mimeType: "application/json",
    text: JSON.stringify(config)
  }]
}));
\`\`\`

## Running the Server

\`\`\`typescript
const transport = new StdioServerTransport();
await server.connect(transport);
\`\`\`

## Installation Config (Claude Desktop)

\`\`\`json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "my-mcp-server"]
    }
  }
}
\`\`\`
`,
};

// Generate placeholder content for remaining skills
const PLACEHOLDER_SKILLS = [
  "docx-extraction",
  "xlsx-analysis",
  "csv-processing",
  "performance-optimization",
  "tailwind-styling",
  "hono-api",
  "database-design",
  "drizzle-orm",
  "supabase-postgres",
  "testing-strategies",
  "web-testing",
  "ci-cd-pipelines",
  "docker-containers",
  "documentation-writer",
  "api-design",
  "accessibility-audit",
  "seo-optimization",
  "error-handling",
  "logging-observability",
  "git-workflow",
  "commit-messages",
  "browser-automation",
  "d1-database",
];

for (const skill of PLACEHOLDER_SKILLS) {
  if (!SKILLS_CONTENT[skill]) {
    const name = skill
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    SKILLS_CONTENT[skill] = `# ${name} Skill

Use this skill for ${name.toLowerCase()} tasks.

## Overview

This skill provides guidance for ${name.toLowerCase()} in your projects.

## Best Practices

- Follow industry standards
- Document your approach
- Test thoroughly

## Usage

Apply this skill when working on related tasks.

*Full documentation coming soon.*
`;
  }
}

async function uploadSkillContent() {
  console.log("Uploading skill content to R2...\n");

  // This would upload to R2 via wrangler or API
  // For now, output the content that needs to be uploaded

  for (const [skillId, content] of Object.entries(SKILLS_CONTENT)) {
    console.log(`📝 skills/${skillId}.md (${content.length} bytes)`);
  }

  console.log(`\n✅ ${Object.keys(SKILLS_CONTENT).length} skills ready for upload`);
  console.log("\nTo upload, run:");
  console.log("  wrangler r2 object put nexus-docs/skills/<skill-id>.md --file <content>");
}

uploadSkillContent();
