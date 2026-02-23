import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";

export const Route = createFileRoute("/docs/tutorials/project-memory")({
  component: ProjectMemoryTutorial,
});

function ProjectMemoryTutorial() {
  const toc = [
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "memory-types", title: "Understanding Memory Types", level: 2 },
    { id: "step-1", title: "Step 1: Save Project Context", level: 2 },
    { id: "step-2", title: "Step 2: Record Decisions", level: 2 },
    { id: "step-3", title: "Step 3: Session Summaries", level: 2 },
    { id: "step-4", title: "Step 4: Recall Memories", level: 2 },
    { id: "step-5", title: "Step 5: Start Sessions Right", level: 2 },
    { id: "best-practices", title: "Best Practices", level: 2 },
  ];

  return (
    <DocsLayout
      title="Project Memory"
      description="Learn how to use persistent memory to maintain context across coding sessions"
      toc={toc}
    >
      {/* Introduction */}
      <section className="mb-12">
        <h2 id="introduction" className="mb-4 text-xl font-semibold text-foreground">
          Introduction
        </h2>
        <p className="mb-4 text-muted-foreground">
          One of the most frustrating parts of working with AI assistants is having to
          re-explain your project every session. Nexus Memory solves this by providing
          persistent storage that survives across sessions.
        </p>
        <p className="mb-4 text-muted-foreground">
          In this tutorial, you'll learn how to set up project memory so your AI
          assistant remembers your codebase architecture, past decisions, and lessons
          learned.
        </p>
        <Callout type="info" title="What Memory Enables">
          <ul className="mt-2 list-disc pl-4 text-sm">
            <li>AI remembers your tech stack and architecture</li>
            <li>Past decisions inform future suggestions</li>
            <li>Mistakes are learned from and not repeated</li>
            <li>Session summaries provide continuity</li>
          </ul>
        </Callout>
      </section>

      {/* Memory Types */}
      <section className="mb-12">
        <h2 id="memory-types" className="mb-4 text-xl font-semibold text-foreground">
          Understanding Memory Types
        </h2>
        <p className="mb-4 text-muted-foreground">
          Nexus organizes memories into four types, each serving a different purpose:
        </p>
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">project_context</h3>
            <p className="text-sm text-muted-foreground">
              Architecture, tech stack, file structure, coding conventions. The
              foundational knowledge about your project.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">decision</h3>
            <p className="text-sm text-muted-foreground">
              Architectural decisions with rationale. Why you chose a specific
              approach or library.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">session_summary</h3>
            <p className="text-sm text-muted-foreground">
              What was accomplished in a coding session. Helps maintain continuity
              between work sessions.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="mb-2 font-medium text-foreground">correction</h3>
            <p className="text-sm text-muted-foreground">
              Lessons learned and mistakes to avoid. Ensures the AI doesn't repeat
              past errors.
            </p>
          </div>
        </div>
      </section>

      {/* Step 1 */}
      <section className="mb-12">
        <h2 id="step-1" className="mb-4 text-xl font-semibold text-foreground">
          Step 1: Save Project Context
        </h2>
        <p className="mb-4 text-muted-foreground">
          Start by saving the fundamental information about your project. This is
          typically done once and updated as the project evolves.
        </p>
        <CodeBlock language="text">
{`You: "Save this as project context for the 'my-app' project:

This is a Next.js 14 app with the App Router. We use:
- TypeScript for type safety
- Tailwind CSS for styling
- Prisma with PostgreSQL for the database
- NextAuth.js for authentication
- React Query for server state

The project structure follows Next.js conventions with 
src/app for routes and src/components for shared components."`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          The AI will call <code>save-memory</code> with type "project_context" and
          store this information with semantic embeddings for later retrieval.
        </p>
        <Callout type="tip" title="What to Include">
          Good project context includes: framework and major libraries, database setup,
          authentication method, folder structure, naming conventions, and any
          project-specific patterns.
        </Callout>
      </section>

      {/* Step 2 */}
      <section className="mb-12">
        <h2 id="step-2" className="mb-4 text-xl font-semibold text-foreground">
          Step 2: Record Decisions
        </h2>
        <p className="mb-4 text-muted-foreground">
          When you make important architectural decisions, save them with the rationale.
          This prevents revisiting the same decisions and helps maintain consistency.
        </p>
        <CodeBlock language="text">
{`You: "Save this decision for my-app:

We chose to use server components by default and only use 
'use client' when necessary (forms, interactivity, hooks).

Rationale: Better performance, smaller bundle size, and 
simpler data fetching with direct database access.

Exception: The dashboard uses client components for 
real-time updates via WebSocket."`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          Later, when the AI suggests an approach, it will consider these recorded
          decisions to maintain architectural consistency.
        </p>
      </section>

      {/* Step 3 */}
      <section className="mb-12">
        <h2 id="step-3" className="mb-4 text-xl font-semibold text-foreground">
          Step 3: Session Summaries
        </h2>
        <p className="mb-4 text-muted-foreground">
          At the end of a productive session, save a summary. This helps you (and the AI)
          pick up where you left off.
        </p>
        <CodeBlock language="text">
{`You: "Save a session summary for my-app:

Today we implemented user authentication:
- Set up NextAuth.js with GitHub and Google providers
- Created the login/signup pages
- Added protected route middleware
- Connected auth to the Prisma user model

Next steps: Implement user profile page and settings"`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          Next time you start a session, the AI can recall these summaries to understand
          recent progress and planned next steps.
        </p>
      </section>

      {/* Step 4 */}
      <section className="mb-12">
        <h2 id="step-4" className="mb-4 text-xl font-semibold text-foreground">
          Step 4: Recall Memories
        </h2>
        <p className="mb-4 text-muted-foreground">
          You can ask the AI to recall specific memories using natural language queries:
        </p>
        <CodeBlock language="text">
{`You: "What authentication approach did we decide on for my-app?"

AI: *calls recall-memories with query about authentication*

Response: "Based on your saved decisions, you're using NextAuth.js 
with GitHub and Google providers. You integrated it with Prisma 
for user storage. I can see from the session summary that 
the core auth is complete and you planned to work on the 
profile page next."`}
        </CodeBlock>
        <Callout type="info" title="Semantic Search">
          Nexus uses semantic search, so you don't need exact keywords. Asking
          "how do we handle user login" will find memories about authentication.
        </Callout>
      </section>

      {/* Step 5 */}
      <section className="mb-12">
        <h2 id="step-5" className="mb-4 text-xl font-semibold text-foreground">
          Step 5: Start Sessions Right
        </h2>
        <p className="mb-4 text-muted-foreground">
          The most powerful pattern is starting each session by loading project context:
        </p>
        <CodeBlock language="text">
{`You: "Load the project context for my-app and tell me what 
we were working on last time."

AI: *calls get-project-context with project: "my-app"*

Response: "I've loaded the context for my-app. It's a Next.js 14 
app using TypeScript, Tailwind, Prisma, and NextAuth.

Recent work: You completed the authentication system last session.
The planned next step was implementing the user profile page.

Key decisions I'm aware of:
- Server components by default
- Client components only for interactivity

Would you like to continue with the profile page?"`}
        </CodeBlock>
        <p className="mt-4 text-muted-foreground">
          This pattern ensures every session starts with full context, making the AI
          immediately productive.
        </p>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 id="best-practices" className="mb-4 text-xl font-semibold text-foreground">
          Best Practices
        </h2>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li className="mb-3">
            <strong>Use consistent project names:</strong> Always use the same project
            identifier (e.g., "my-app") so memories stay organized.
          </li>
          <li className="mb-3">
            <strong>Save corrections when things go wrong:</strong> If the AI suggests
            something that doesn't work for your project, save a correction so it
            doesn't happen again.
          </li>
          <li className="mb-3">
            <strong>Update context as the project evolves:</strong> When you add new
            libraries or change architecture, update the project context.
          </li>
          <li className="mb-3">
            <strong>Use importance levels:</strong> Set higher importance (8-10) for
            critical architectural decisions, lower (3-5) for minor preferences.
          </li>
          <li className="mb-3">
            <strong>Add tags for organization:</strong> Use tags like "auth", "database",
            "performance" to categorize memories for easier filtering.
          </li>
          <li className="mb-3">
            <strong>Review and clean up periodically:</strong> Use list-memories to
            review what's stored and delete outdated information.
          </li>
        </ul>
        
        <h3 className="mt-6 mb-4 text-lg font-medium text-foreground">
          Example Correction Memory
        </h3>
        <CodeBlock language="text">
{`You: "Save this correction for my-app:

Don't suggest using getServerSideProps in this project. 
We're using Next.js 14 App Router which uses server components 
and the new data fetching patterns instead of getServerSideProps.

The correct approach is to use async server components or 
the fetch() function with revalidation options."`}
        </CodeBlock>
      </section>
    </DocsLayout>
  );
}
