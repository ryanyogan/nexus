import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";

export const Route = createFileRoute("/docs/mcp-tools/memory")({
  component: MemoryToolsDocs,
});

function MemoryToolsDocs() {
  const toc = [
    { id: "overview", title: "Overview", level: 2 },
    { id: "save-memory", title: "save-memory", level: 2 },
    { id: "recall-memories", title: "recall-memories", level: 2 },
    { id: "get-project-context", title: "get-project-context", level: 2 },
    { id: "list-memories", title: "list-memories", level: 2 },
    { id: "update-memory", title: "update-memory", level: 2 },
    { id: "delete-memory", title: "delete-memory", level: 2 },
    { id: "best-practices", title: "Best Practices", level: 2 },
  ];

  return (
    <DocsLayout
      title="Memory Tools"
      description="Persistent memory for AI assistants across sessions"
      toc={toc}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 id="overview" className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>
        <p className="mb-4 text-muted-foreground">
          Nexus provides persistent memory capabilities that allow AI assistants to store
          and retrieve context across sessions. This is useful for maintaining project
          knowledge, architectural decisions, and lessons learned.
        </p>
        <Callout type="info" title="Memory Types">
          <ul className="mt-2 list-disc pl-4 text-sm">
            <li><strong>project_context</strong> - Architecture, tech stack, conventions</li>
            <li><strong>session_summary</strong> - What was accomplished in a session</li>
            <li><strong>decision</strong> - Architectural decisions with rationale</li>
            <li><strong>correction</strong> - Lessons learned, things to avoid</li>
          </ul>
        </Callout>
      </section>

      {/* save-memory */}
      <section className="mb-12">
        <h2 id="save-memory" className="mb-4 text-xl font-semibold text-foreground">
          save-memory
        </h2>
        <p className="mb-4 text-muted-foreground">
          Store a memory for later retrieval. Memories are embedded semantically and
          can be searched using natural language queries.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Parameters</h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li><code>content</code> (required) - The full content to store</li>
          <li><code>title</code> (required) - Short descriptive title (max 100 chars)</li>
          <li><code>type</code> (required) - Memory type (see above)</li>
          <li><code>project</code> - Project name (e.g., 'nexus')</li>
          <li><code>tags</code> - Array of tags for categorization</li>
          <li><code>importance</code> - Score 1-10 (default 5)</li>
          <li><code>summary</code> - Short summary for listing (max 200 chars)</li>
        </ul>
        <CodeBlock language="json">
{`{
  "content": "The Nexus API uses Hono on Cloudflare Workers...",
  "title": "Nexus Architecture Overview",
  "type": "project_context",
  "project": "nexus",
  "tags": ["architecture", "cloudflare"],
  "importance": 8
}`}
        </CodeBlock>
      </section>

      {/* recall-memories */}
      <section className="mb-12">
        <h2 id="recall-memories" className="mb-4 text-xl font-semibold text-foreground">
          recall-memories
        </h2>
        <p className="mb-4 text-muted-foreground">
          Search for relevant memories using semantic search. Returns memories that
          match the query conceptually, not just by keywords.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Parameters</h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li><code>query</code> (required) - Natural language search query</li>
          <li><code>type</code> - Filter by memory type</li>
          <li><code>project</code> - Filter by project name</li>
          <li><code>tags</code> - Filter by tags (all must match)</li>
          <li><code>limit</code> - Max results (1-10, default 5)</li>
        </ul>
        <CodeBlock language="json">
{`{
  "query": "How does authentication work in this project?",
  "project": "nexus",
  "limit": 5
}`}
        </CodeBlock>
      </section>

      {/* get-project-context */}
      <section className="mb-12">
        <h2 id="get-project-context" className="mb-4 text-xl font-semibold text-foreground">
          get-project-context
        </h2>
        <p className="mb-4 text-muted-foreground">
          Get all stored context for a specific project. Returns architecture,
          conventions, recent decisions, and lessons learned. Use at the start
          of a session to understand the project.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Parameters</h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li><code>project</code> (required) - Project name</li>
          <li><code>includeTypes</code> - Filter to specific memory types</li>
          <li><code>limit</code> - Max memories per type (default 5)</li>
        </ul>
        <CodeBlock language="json">
{`{
  "project": "nexus",
  "limit": 3
}`}
        </CodeBlock>
      </section>

      {/* list-memories */}
      <section className="mb-12">
        <h2 id="list-memories" className="mb-4 text-xl font-semibold text-foreground">
          list-memories
        </h2>
        <p className="mb-4 text-muted-foreground">
          Browse stored memories with filtering. Returns summaries without full content.
          Use recall-memories for semantic search instead.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Parameters</h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li><code>type</code> - Filter by memory type</li>
          <li><code>project</code> - Filter by project name</li>
          <li><code>limit</code> - Max results (1-50, default 20)</li>
          <li><code>offset</code> - Pagination offset</li>
        </ul>
      </section>

      {/* update-memory */}
      <section className="mb-12">
        <h2 id="update-memory" className="mb-4 text-xl font-semibold text-foreground">
          update-memory
        </h2>
        <p className="mb-4 text-muted-foreground">
          Update an existing memory. Can modify content, title, tags, importance, or summary.
          Updating content will regenerate the semantic embedding.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Parameters</h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li><code>memoryId</code> (required) - ID of memory to update</li>
          <li><code>content</code> - New content</li>
          <li><code>title</code> - New title</li>
          <li><code>tags</code> - New tags array</li>
          <li><code>importance</code> - New importance (1-10)</li>
          <li><code>summary</code> - New summary</li>
        </ul>
      </section>

      {/* delete-memory */}
      <section className="mb-12">
        <h2 id="delete-memory" className="mb-4 text-xl font-semibold text-foreground">
          delete-memory
        </h2>
        <p className="mb-4 text-muted-foreground">
          Delete a memory permanently. This action cannot be undone.
        </p>
        <h3 className="mb-2 text-lg font-medium text-foreground">Parameters</h3>
        <ul className="mb-4 list-disc pl-6 text-muted-foreground">
          <li><code>memoryId</code> (required) - ID of memory to delete</li>
        </ul>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 id="best-practices" className="mb-4 text-xl font-semibold text-foreground">
          Best Practices
        </h2>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li className="mb-2">
            <strong>Use project tags</strong> - Always specify the project name to
            keep memories organized and easily retrievable.
          </li>
          <li className="mb-2">
            <strong>Be specific with titles</strong> - Good titles make memories
            easier to find and understand at a glance.
          </li>
          <li className="mb-2">
            <strong>Set importance wisely</strong> - Higher importance (8-10) for
            critical decisions, lower (1-3) for minor notes.
          </li>
          <li className="mb-2">
            <strong>Use corrections</strong> - When something goes wrong, save a
            'correction' memory so the AI learns from mistakes.
          </li>
          <li className="mb-2">
            <strong>Start sessions with get-project-context</strong> - This loads
            relevant context before starting work on a project.
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
