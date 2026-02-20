import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { ParamTable } from "../../../components/docs/ParamTable";

export const Route = createFileRoute("/docs/mcp-tools/get-library-info")({
  component: GetLibraryInfoDocs,
});

function GetLibraryInfoDocs() {
  const toc = [
    { id: "description", title: "Description", level: 2 },
    { id: "parameters", title: "Parameters", level: 2 },
    { id: "response", title: "Response", level: 2 },
    { id: "examples", title: "Examples", level: 2 },
  ];

  return (
    <DocsLayout
      title="get-library-info"
      description="Get detailed information about a specific library"
      toc={toc}
    >
      {/* Description */}
      <section className="mb-12">
        <h2 id="description" className="mb-4 text-xl font-semibold text-foreground">
          Description
        </h2>

        <p className="text-muted-foreground">
          Get detailed metadata about a specific library including description,
          version, documentation coverage, and usage statistics. Useful for
          understanding what documentation is available before querying.
        </p>
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
              description: "The library ID (e.g., 'react', 'nextjs', 'hono')",
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
          Returns comprehensive information about the library:
        </p>

        <CodeBlock language="json">
{`{
  "libraryId": "hono",
  "name": "Hono",
  "description": "Ultrafast web framework for the Edges",
  "version": "4.0.0",
  "categories": ["backend", "cloud"],
  "source": {
    "type": "github",
    "url": "https://github.com/honojs/hono",
    "repository": "https://github.com/honojs/hono",
    "homepage": "https://hono.dev"
  },
  "documentation": {
    "status": "indexed",
    "totalChunks": 245,
    "totalTokens": 125000,
    "lastIndexedAt": "2024-01-15T10:30:00Z"
  },
  "usage": {
    "totalQueries": 1523,
    "totalChunkHits": 4521,
    "lastQueriedAt": "2024-01-20T15:45:00Z"
  },
  "isFeatured": true
}`}
        </CodeBlock>

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Response Fields
        </h3>

        <ParamTable
          parameters={[
            {
              name: "libraryId",
              type: "string",
              description: "Unique identifier for the library",
            },
            {
              name: "name",
              type: "string",
              description: "Display name of the library",
            },
            {
              name: "description",
              type: "string",
              description: "Brief description of the library",
            },
            {
              name: "version",
              type: "string",
              description: "Latest indexed version",
            },
            {
              name: "categories",
              type: "string[]",
              description: "Categories the library belongs to",
            },
            {
              name: "source",
              type: "object",
              description: "Source repository and homepage links",
            },
            {
              name: "documentation",
              type: "object",
              description: "Documentation indexing status and coverage",
            },
            {
              name: "usage",
              type: "object | null",
              description: "Usage statistics (may be null if never queried)",
            },
            {
              name: "isFeatured",
              type: "boolean",
              description: "Whether this is a featured library",
            },
          ]}
        />

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Documentation Status Values
        </h3>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-green-400">indexed</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Documentation is fully indexed and searchable
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3 font-mono text-yellow-400">indexing</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Currently being indexed
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-blue-400">pending</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Queued for indexing
                </td>
              </tr>
              <tr className="bg-card/10">
                <td className="px-4 py-3 font-mono text-red-400">failed</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Indexing failed
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Examples */}
      <section className="mb-12">
        <h2 id="examples" className="mb-4 text-xl font-semibold text-foreground">
          Examples
        </h2>

        <h3 className="mb-3 text-lg font-semibold text-foreground">
          Get Library Information
        </h3>

        <CodeBlock language="json" filename="Request">
{`{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get-library-info",
    "arguments": {
      "libraryId": "react"
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
    </DocsLayout>
  );
}
