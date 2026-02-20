import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";
import { ParamTable } from "../../../components/docs/ParamTable";

export const Route = createFileRoute("/docs/mcp-tools/resolve-library")({
  component: ResolveLibraryDocs,
});

function ResolveLibraryDocs() {
  const toc = [
    { id: "description", title: "Description", level: 2 },
    { id: "parameters", title: "Parameters", level: 2 },
    { id: "response", title: "Response", level: 2 },
    { id: "examples", title: "Examples", level: 2 },
  ];

  return (
    <DocsLayout
      title="resolve-library"
      description="Search for a library by name to get its Nexus library ID"
      toc={toc}
    >
      {/* Description */}
      <section className="mb-12">
        <h2 id="description" className="mb-4 text-xl font-semibold text-foreground">
          Description
        </h2>

        <p className="mb-4 text-muted-foreground">
          Search for a library/package by name to get its Nexus-compatible library ID.
          This tool should be called before <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">query-docs</code> to
          find the correct library ID.
        </p>

        <p className="text-muted-foreground">
          Returns matching libraries with their IDs, descriptions, and documentation
          coverage statistics.
        </p>

        <Callout type="tip" title="Fuzzy Matching">
          The search uses fuzzy matching, so "nextjs" will match "next.js" and
          "react" will match "react-dom".
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
              name: "libraryName",
              type: "string",
              required: true,
              description:
                "The name of the library to search for (e.g., 'react', 'nextjs', 'hono')",
            },
            {
              name: "query",
              type: "string",
              required: false,
              description:
                "Optional: The task or question you need help with. Used to rank results by relevance.",
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
          Returns a JSON object containing matched libraries:
        </p>

        <CodeBlock language="json">
{`{
  "success": true,
  "query": "hono",
  "results": [
    {
      "libraryId": "hono",
      "name": "Hono",
      "description": "Ultrafast web framework for the Edges",
      "version": "4.0.0",
      "documentationCoverage": {
        "chunks": 245,
        "estimatedTokens": 125000
      },
      "categories": ["backend", "cloud"],
      "links": {
        "homepage": "https://hono.dev",
        "repository": "https://github.com/honojs/hono"
      }
    }
  ],
  "recommendation": "Use libraryId \\"hono\\" with query-docs to search this library's documentation."
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Response Fields
        </h3>

        <ParamTable
          parameters={[
            {
              name: "success",
              type: "boolean",
              description: "Whether the search was successful",
            },
            {
              name: "query",
              type: "string",
              description: "The search query that was used",
            },
            {
              name: "results",
              type: "array",
              description: "Array of matching libraries (max 10)",
            },
            {
              name: "recommendation",
              type: "string",
              description: "Suggested next step for using the results",
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
          Basic Search
        </h3>

        <CodeBlock language="json" filename="Request">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "resolve-library",
    "arguments": {
      "libraryName": "react"
    }
  }
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Search with Context
        </h3>

        <p className="mb-4 text-muted-foreground">
          Providing a query helps rank results when there are multiple matches:
        </p>

        <CodeBlock language="json" filename="Request">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "resolve-library",
    "arguments": {
      "libraryName": "next",
      "query": "How do I create API routes in Next.js?"
    }
  }
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          No Results
        </h3>

        <p className="mb-4 text-muted-foreground">
          When no libraries match, the response includes suggestions:
        </p>

        <CodeBlock language="json" filename="Response">
{`{
  "success": false,
  "message": "No libraries found matching \\"unknownlib\\". Use list-libraries to see available libraries.",
  "suggestions": []
}`}
        </CodeBlock>
      </section>
    </DocsLayout>
  );
}
