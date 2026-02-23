import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";

export const Route = createFileRoute("/docs/tutorials/build-with-nexus")({
  component: BuildWithNexusTutorial,
});

function BuildWithNexusTutorial() {
  const toc = [
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "prerequisites", title: "Prerequisites", level: 2 },
    { id: "step-1", title: "Step 1: Install Nexus", level: 2 },
    { id: "step-2", title: "Step 2: Find Your Library", level: 2 },
    { id: "step-3", title: "Step 3: Query Documentation", level: 2 },
    { id: "step-4", title: "Step 4: Real-World Example", level: 2 },
    { id: "step-5", title: "Step 5: Advanced Workflows", level: 2 },
    { id: "next-steps", title: "Next Steps", level: 2 },
  ];

  return (
    <DocsLayout
      title="Build with Nexus"
      description="A step-by-step tutorial on using Nexus to accelerate your development"
      toc={toc}
    >
      {/* Introduction */}
      <section className="mb-12">
        <h2 id="introduction" className="mb-4 text-xl font-semibold text-foreground">
          Introduction
        </h2>
        <p className="mb-4 text-muted-foreground">
          In this tutorial, you'll learn how to use Nexus to supercharge your development
          workflow. We'll build a real feature using documentation from multiple libraries,
          showing you how Nexus can help you write better code faster.
        </p>
        <Callout type="info" title="What You'll Learn">
          <ul className="mt-2 list-disc pl-4 text-sm">
            <li>How to find and query library documentation</li>
            <li>Best practices for crafting effective queries</li>
            <li>Combining multiple library docs in one workflow</li>
            <li>Using Nexus memory to save project context</li>
          </ul>
        </Callout>
      </section>

      {/* Prerequisites */}
      <section className="mb-12">
        <h2 id="prerequisites" className="mb-4 text-xl font-semibold text-foreground">
          Prerequisites
        </h2>
        <p className="mb-4 text-muted-foreground">
          Before starting, make sure you have:
        </p>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li>An MCP-compatible client (OpenCode, Claude Desktop, Cursor, etc.)</li>
          <li>A project you want to work on</li>
          <li>Nexus configured in your MCP client</li>
        </ul>
        <p className="text-muted-foreground">
          If you haven't set up Nexus yet, check out the{" "}
          <a href="/docs/getting-started" className="text-primary hover:underline">
            Quick Start guide
          </a>.
        </p>
      </section>

      {/* Step 1 */}
      <section className="mb-12">
        <h2 id="step-1" className="mb-4 text-xl font-semibold text-foreground">
          Step 1: Install Nexus
        </h2>
        <p className="mb-4 text-muted-foreground">
          Add Nexus to your MCP client configuration. Here's the recommended setup for OpenCode:
        </p>
        <CodeBlock language="json">
{`{
  "mcpServers": {
    "nexus": {
      "command": "npx",
      "args": ["-y", "@anthropic/nexus-mcp"]
    }
  }
}`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          Restart your MCP client to load the Nexus tools.
        </p>
      </section>

      {/* Step 2 */}
      <section className="mb-12">
        <h2 id="step-2" className="mb-4 text-xl font-semibold text-foreground">
          Step 2: Find Your Library
        </h2>
        <p className="mb-4 text-muted-foreground">
          Let's say you want to build a React application with TanStack Query. First, find
          the library IDs:
        </p>
        <CodeBlock language="text">
{`You: "Find the library ID for TanStack Query"

AI: *calls resolve-library with libraryName: "tanstack-query"*

Result: Found library '/tanstack/query' with 847 code snippets indexed`}
        </CodeBlock>
        <Callout type="tip" title="Pro Tip">
          If you're not sure of the exact name, try searching with partial names or
          common aliases. Nexus will find the best match.
        </Callout>
      </section>

      {/* Step 3 */}
      <section className="mb-12">
        <h2 id="step-3" className="mb-4 text-xl font-semibold text-foreground">
          Step 3: Query Documentation
        </h2>
        <p className="mb-4 text-muted-foreground">
          Now let's get relevant documentation for your task:
        </p>
        <CodeBlock language="text">
{`You: "How do I set up optimistic updates with TanStack Query?"

AI: *calls query-docs with:*
  - libraryId: "/tanstack/query"
  - query: "optimistic updates mutation"

Result: Returns code examples and explanations for implementing
optimistic updates using useMutation and onMutate callbacks`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          Nexus uses semantic search, so you don't need to know the exact terminology.
          Describe what you want to accomplish, and it will find relevant documentation.
        </p>
        <h3 className="mt-6 mb-2 text-lg font-medium text-foreground">
          Effective Query Tips
        </h3>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li className="mb-2">
            <strong>Be specific:</strong> "How to handle JWT refresh tokens" is better
            than "authentication"
          </li>
          <li className="mb-2">
            <strong>Include context:</strong> "Setting up SSR with TanStack Query in Next.js"
          </li>
          <li className="mb-2">
            <strong>Ask for examples:</strong> "Code example for infinite scroll pagination"
          </li>
        </ul>
      </section>

      {/* Step 4 */}
      <section className="mb-12">
        <h2 id="step-4" className="mb-4 text-xl font-semibold text-foreground">
          Step 4: Real-World Example
        </h2>
        <p className="mb-4 text-muted-foreground">
          Let's build a complete feature: a user profile page with data fetching,
          mutations, and optimistic updates.
        </p>
        <CodeBlock language="text">
{`You: "I need to build a user profile page. The user can view their 
profile and update their name. I want optimistic updates so the UI 
feels snappy. I'm using React with TanStack Query."

AI: *Queries documentation for:*
1. useQuery for fetching user profile
2. useMutation for updating profile
3. Optimistic updates with onMutate/onError/onSettled

*Returns relevant code patterns and combines them into a solution*`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          The AI will use Nexus to gather documentation from multiple sources and
          synthesize a complete solution for you.
        </p>
        <CodeBlock language="tsx">
{`// Generated with help from Nexus documentation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', userId] });
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData(['user', userId]);
      
      // Optimistically update
      queryClient.setQueryData(['user', userId], newData);
      
      return { previousUser };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['user', userId], context?.previousUser);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  // ... rest of component
}`}
        </CodeBlock>
      </section>

      {/* Step 5 */}
      <section className="mb-12">
        <h2 id="step-5" className="mb-4 text-xl font-semibold text-foreground">
          Step 5: Advanced Workflows
        </h2>
        <p className="mb-4 text-muted-foreground">
          Nexus really shines when you need to combine multiple libraries:
        </p>
        <CodeBlock language="text">
{`You: "I need to build a form with React Hook Form that submits
via TanStack Query mutation, with Zod validation"

AI: *Queries multiple libraries:*
1. resolve-library: react-hook-form
2. query-docs: "form submission with external handler"
3. resolve-library: zod  
4. query-docs: "schema validation with resolver"
5. query-docs: "useMutation with form data"

*Combines documentation to create an integrated solution*`}
        </CodeBlock>
        <Callout type="info" title="Library Coverage">
          Nexus has documentation for 30+ popular libraries. Use the{" "}
          <a href="/explore" className="text-primary hover:underline">
            Explore page
          </a>{" "}
          to see all available libraries.
        </Callout>
      </section>

      {/* Next Steps */}
      <section className="mb-12">
        <h2 id="next-steps" className="mb-4 text-xl font-semibold text-foreground">
          Next Steps
        </h2>
        <p className="mb-4 text-muted-foreground">
          Now that you know how to use Nexus for documentation lookup, explore these
          advanced features:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li className="mb-2">
            <a href="/docs/tutorials/project-memory" className="text-primary hover:underline">
              Set up Project Memory
            </a>{" "}
            - Store context that persists across sessions
          </li>
          <li className="mb-2">
            <a href="/docs/tutorials/mcp-server-setup" className="text-primary hover:underline">
              Discover MCP Servers
            </a>{" "}
            - Find and install servers for databases, APIs, and more
          </li>
          <li className="mb-2">
            <a href="/docs/submit" className="text-primary hover:underline">
              Submit a Library
            </a>{" "}
            - Request documentation for a library you need
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
