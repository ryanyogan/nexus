import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";
import { ParamTable } from "../../../components/docs/ParamTable";

export const Route = createFileRoute("/docs/mcp-tools/list-libraries")({
  component: ListLibrariesDocs,
});

function ListLibrariesDocs() {
  const toc = [
    { id: "description", title: "Description", level: 2 },
    { id: "parameters", title: "Parameters", level: 2 },
    { id: "categories", title: "Categories", level: 2 },
    { id: "response", title: "Response", level: 2 },
    { id: "examples", title: "Examples", level: 2 },
  ];

  return (
    <DocsLayout
      title="list-libraries"
      description="List all available indexed libraries"
      toc={toc}
    >
      {/* Description */}
      <section className="mb-12">
        <h2 id="description" className="mb-4 text-xl font-semibold text-foreground">
          Description
        </h2>

        <p className="text-muted-foreground">
          List all available indexed libraries. Optionally filter by category to
          discover what documentation is available in Nexus.
        </p>

        <Callout type="tip">
          Use this tool to explore available libraries before using{" "}
          <code className="font-mono">resolve-library</code> or{" "}
          <code className="font-mono">query-docs</code>.
        </Callout>
      </section>

      {/* Parameters */}
      <section className="mb-12">
        <h2 id="parameters" className="mb-4 text-xl font-semibold text-foreground">
          Parameters
        </h2>

        <ParamTable
          parameters={[
            {
              name: "category",
              type: "string",
              required: false,
              description: "Filter by category (see available categories below)",
            },
            {
              name: "limit",
              type: "number",
              required: false,
              default: "20",
              description: "Maximum number of results (1-50)",
            },
          ]}
        />
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 id="categories" className="mb-4 text-xl font-semibold text-foreground">
          Available Categories
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <CategoryBadge name="frontend" description="React, Vue, Angular, etc." />
          <CategoryBadge name="backend" description="Express, Hono, FastAPI, etc." />
          <CategoryBadge name="fullstack" description="Next.js, Nuxt, SvelteKit, etc." />
          <CategoryBadge name="database" description="Prisma, Drizzle, MongoDB, etc." />
          <CategoryBadge name="cloud" description="AWS, GCP, Cloudflare, etc." />
          <CategoryBadge name="devops" description="Docker, Kubernetes, Terraform, etc." />
          <CategoryBadge name="ai" description="LangChain, OpenAI, Vercel AI, etc." />
          <CategoryBadge name="testing" description="Jest, Vitest, Playwright, etc." />
          <CategoryBadge name="mobile" description="React Native, Flutter, etc." />
          <CategoryBadge name="utilities" description="Lodash, date-fns, zod, etc." />
        </div>
      </section>

      {/* Response */}
      <section className="mb-12">
        <h2 id="response" className="mb-4 text-xl font-semibold text-foreground">
          Response
        </h2>

        <p className="mb-4 text-muted-foreground">
          Returns a list of libraries with basic information:
        </p>

        <CodeBlock language="json">
{`{
  "success": true,
  "category": "backend",
  "count": 5,
  "libraries": [
    {
      "libraryId": "hono",
      "name": "Hono",
      "description": "Ultrafast web framework for the Edges",
      "categories": ["backend", "cloud"],
      "version": "4.0.0",
      "documentationChunks": 245,
      "isFeatured": true
    },
    {
      "libraryId": "express",
      "name": "Express",
      "description": "Fast, unopinionated web framework for Node.js",
      "categories": ["backend"],
      "version": "4.18.2",
      "documentationChunks": 189,
      "isFeatured": true
    }
  ],
  "availableCategories": [
    "frontend",
    "backend",
    "fullstack",
    "database",
    "cloud",
    "devops",
    "ai",
    "testing",
    "mobile",
    "utilities"
  ]
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Library Fields
        </h3>

        <ParamTable
          parameters={[
            {
              name: "libraryId",
              type: "string",
              description: "Unique identifier to use with other tools",
            },
            {
              name: "name",
              type: "string",
              description: "Display name of the library",
            },
            {
              name: "description",
              type: "string",
              description: "Brief description",
            },
            {
              name: "categories",
              type: "string[]",
              description: "Categories this library belongs to",
            },
            {
              name: "version",
              type: "string",
              description: "Latest indexed version",
            },
            {
              name: "documentationChunks",
              type: "number",
              description: "Number of documentation chunks indexed",
            },
            {
              name: "isFeatured",
              type: "boolean",
              description: "Whether this is a featured library",
            },
          ]}
        />
      </section>

      {/* Examples */}
      <section className="mb-12">
        <h2 id="examples" className="mb-4 text-xl font-semibold text-foreground">
          Examples
        </h2>

        <h3 className="mb-3 text-lg font-semibold text-foreground">
          List All Libraries
        </h3>

        <CodeBlock language="json" filename="Request">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list-libraries",
    "arguments": {}
  }
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Filter by Category
        </h3>

        <CodeBlock language="json" filename="Request">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list-libraries",
    "arguments": {
      "category": "ai",
      "limit": 10
    }
  }
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Get More Results
        </h3>

        <CodeBlock language="json" filename="Request">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list-libraries",
    "arguments": {
      "limit": 50
    }
  }
}`}
        </CodeBlock>
      </section>
    </DocsLayout>
  );
}

function CategoryBadge({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-3">
      <code className="rounded bg-primary/10 px-1.5 py-0.5 text-sm font-mono text-primary">
        {name}
      </code>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
