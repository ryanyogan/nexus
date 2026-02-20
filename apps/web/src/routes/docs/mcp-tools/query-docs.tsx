import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";
import { ParamTable } from "../../../components/docs/ParamTable";

export const Route = createFileRoute("/docs/mcp-tools/query-docs")({
  component: QueryDocsDocs,
});

function QueryDocsDocs() {
  const toc = [
    { id: "description", title: "Description", level: 2 },
    { id: "parameters", title: "Parameters", level: 2 },
    { id: "response", title: "Response", level: 2 },
    { id: "examples", title: "Examples", level: 2 },
    { id: "tips", title: "Tips", level: 2 },
  ];

  return (
    <DocsLayout
      title="query-docs"
      description="Search documentation for a specific library using semantic search"
      toc={toc}
    >
      {/* Description */}
      <section className="mb-12">
        <h2 id="description" className="mb-4 text-xl font-semibold text-foreground">
          Description
        </h2>

        <p className="mb-4 text-muted-foreground">
          Perform semantic search within a library's documentation. Returns relevant
          code examples, API references, and explanations ranked by relevance score.
        </p>

        <Callout type="warning" title="Requires Library ID">
          You must call <code className="font-mono">resolve-library</code> first to
          get the library ID, unless you already know the exact ID.
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
              name: "libraryId",
              type: "string",
              required: true,
              description:
                "The library ID obtained from resolve-library (e.g., 'react', 'hono')",
            },
            {
              name: "query",
              type: "string",
              required: true,
              description:
                "The question or task you need help with. Be specific for better results.",
            },
            {
              name: "limit",
              type: "number",
              required: false,
              default: "5",
              description: "Maximum number of results to return (1-10)",
            },
          ]}
        />
      </section>

      {/* Response */}
      <section className="mb-12">
        <h2 id="response" className="mb-4 text-xl font-semibold text-foreground">
          Response
        </h2>

        <p className="mb-4 text-muted-foreground">
          Returns relevant documentation chunks with content and metadata:
        </p>

        <CodeBlock language="json">
{`{
  "success": true,
  "libraryId": "hono",
  "libraryName": "Hono",
  "version": "4.0.0",
  "query": "How to create middleware",
  "resultCount": 3,
  "results": [
    {
      "title": "Middleware",
      "content": "# Middleware\\n\\nMiddleware works before and after the Handler...\\n\\n\`\`\`ts\\napp.use(async (c, next) => {\\n  console.log('before')\\n  await next()\\n  console.log('after')\\n})\\n\`\`\`",
      "contentType": "guide",
      "sourceFile": "docs/middleware.md",
      "relevanceScore": 0.92
    },
    {
      "title": "Built-in Middleware",
      "content": "Hono provides several built-in middleware functions...",
      "contentType": "api",
      "sourceFile": "docs/api/middleware.md",
      "relevanceScore": 0.85
    }
  ]
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Result Fields
        </h3>

        <ParamTable
          parameters={[
            {
              name: "title",
              type: "string",
              description: "Title of the documentation section",
            },
            {
              name: "content",
              type: "string",
              description: "The actual documentation content (markdown)",
            },
            {
              name: "contentType",
              type: "string",
              description: "Type of content: 'guide', 'api', 'example', 'concept'",
            },
            {
              name: "sourceFile",
              type: "string",
              description: "Original file path in the documentation",
            },
            {
              name: "relevanceScore",
              type: "number",
              description: "Relevance score from 0 to 1 (higher is better)",
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
          Basic Query
        </h3>

        <CodeBlock language="json" filename="Request">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "query-docs",
    "arguments": {
      "libraryId": "hono",
      "query": "How do I handle form data in POST requests?"
    }
  }
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          With Custom Limit
        </h3>

        <CodeBlock language="json" filename="Request">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "query-docs",
    "arguments": {
      "libraryId": "react",
      "query": "useEffect cleanup function examples",
      "limit": 10
    }
  }
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Error: Library Not Found
        </h3>

        <CodeBlock language="json" filename="Error Response">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Library \\"unknownlib\\" not found. Use resolve-library to search for available libraries."
  }
}`}
        </CodeBlock>
      </section>

      {/* Tips */}
      <section className="mb-12">
        <h2 id="tips" className="mb-4 text-xl font-semibold text-foreground">
          Tips for Better Results
        </h2>

        <div className="space-y-4">
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <h4 className="mb-2 font-semibold text-green-400">Good Queries</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>"How to set up authentication with JWT in Express.js"</li>
              <li>"React useEffect cleanup function examples"</li>
              <li>"Hono middleware for request logging"</li>
            </ul>
          </div>

          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <h4 className="mb-2 font-semibold text-red-400">Bad Queries</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>"auth" (too vague)</li>
              <li>"hooks" (too broad)</li>
              <li>"middleware" (not specific enough)</li>
            </ul>
          </div>
        </div>

        <Callout type="tip" title="Include Context">
          The more specific your query, the better the results. Include what you're
          trying to accomplish, not just keywords.
        </Callout>
      </section>
    </DocsLayout>
  );
}
