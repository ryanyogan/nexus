import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { ApiEndpoint } from "../../../components/docs/ApiEndpoint";
import { Callout } from "../../../components/docs/Callout";

export const Route = createFileRoute("/docs/api/libraries")({
  component: LibrariesApiDocs,
});

function LibrariesApiDocs() {
  const toc = [
    { id: "list-libraries", title: "List Libraries", level: 2 },
    { id: "get-library", title: "Get Library", level: 2 },
    { id: "get-chunks", title: "Get Chunks", level: 2 },
    { id: "search", title: "Search Documentation", level: 2 },
  ];

  return (
    <DocsLayout
      title="Libraries API"
      description="Endpoints for listing, retrieving, and searching library documentation"
      toc={toc}
    >
      {/* List Libraries */}
      <section className="mb-12">
        <h2 id="list-libraries" className="mb-4 text-xl font-semibold text-foreground">
          List Libraries
        </h2>

        <ApiEndpoint
          method="GET"
          path="/api/libraries"
          description="List all indexed libraries with optional filtering and pagination."
          parameters={[
            {
              name: "category",
              type: "string",
              description:
                "Filter by category: frontend, backend, fullstack, database, cloud, devops, ai, testing, mobile, utilities",
            },
            {
              name: "search",
              type: "string",
              description: "Search libraries by name",
            },
            {
              name: "status",
              type: "string",
              description: "Filter by indexing status: pending, indexing, indexed, failed",
            },
            {
              name: "featured",
              type: "boolean",
              description: "Filter to only featured libraries",
            },
            {
              name: "limit",
              type: "number",
              default: "20",
              description: "Number of results to return (1-100)",
            },
            {
              name: "offset",
              type: "number",
              default: "0",
              description: "Offset for pagination",
            },
          ]}
          response={{
            description: "Returns a paginated list of libraries",
            example: `{
  "libraries": [
    {
      "id": "hono",
      "name": "Hono",
      "description": "Ultrafast web framework for the Edges",
      "categories": ["backend", "cloud"],
      "version": "4.0.0",
      "iconUrl": "https://hono.dev/images/logo.png",
      "homepageUrl": "https://hono.dev",
      "repositoryUrl": "https://github.com/honojs/hono",
      "totalChunks": 245,
      "totalTokens": 125000,
      "indexStatus": "indexed",
      "isFeatured": true,
      "lastIndexedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 45,
    "hasMore": true
  }
}`,
          }}
        />
      </section>

      {/* Get Library */}
      <section className="mb-12">
        <h2 id="get-library" className="mb-4 text-xl font-semibold text-foreground">
          Get Library
        </h2>

        <ApiEndpoint
          method="GET"
          path="/api/libraries/:id"
          description="Get detailed information about a specific library including usage statistics."
          parameters={[
            {
              name: "id",
              type: "string",
              required: true,
              description: "The library ID (path parameter)",
            },
          ]}
          response={{
            description: "Returns the library details and stats",
            example: `{
  "library": {
    "id": "hono",
    "name": "Hono",
    "description": "Ultrafast web framework for the Edges",
    "categories": ["backend", "cloud"],
    "version": "4.0.0",
    "sourceType": "github",
    "sourceUrl": "https://github.com/honojs/hono",
    "homepageUrl": "https://hono.dev",
    "repositoryUrl": "https://github.com/honojs/hono",
    "iconUrl": "https://hono.dev/images/logo.png",
    "totalChunks": 245,
    "totalTokens": 125000,
    "indexStatus": "indexed",
    "isFeatured": true,
    "isActive": true,
    "lastIndexedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "stats": {
    "totalQueries": 1523,
    "totalChunkHits": 4521
  }
}`,
          }}
        />

        <Callout type="info">
          If the library is not found, a 404 response is returned with an error message.
        </Callout>
      </section>

      {/* Get Chunks */}
      <section className="mb-12">
        <h2 id="get-chunks" className="mb-4 text-xl font-semibold text-foreground">
          Get Library Chunks
        </h2>

        <ApiEndpoint
          method="GET"
          path="/api/libraries/:id/chunks"
          description="Get the documentation chunks for a specific library. Useful for understanding what content is indexed."
          parameters={[
            {
              name: "id",
              type: "string",
              required: true,
              description: "The library ID (path parameter)",
            },
            {
              name: "limit",
              type: "number",
              default: "20",
              description: "Number of chunks to return (1-100)",
            },
            {
              name: "offset",
              type: "number",
              default: "0",
              description: "Offset for pagination",
            },
          ]}
          response={{
            description: "Returns a paginated list of documentation chunks",
            example: `{
  "chunks": [
    {
      "id": "abc123",
      "title": "Getting Started",
      "contentType": "guide",
      "tokenCount": 512,
      "sourceFile": "docs/getting-started.md",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "def456",
      "title": "Routing",
      "contentType": "api",
      "tokenCount": 384,
      "sourceFile": "docs/routing.md",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 245,
    "hasMore": true
  }
}`,
          }}
        />
      </section>

      {/* Search */}
      <section className="mb-12">
        <h2 id="search" className="mb-4 text-xl font-semibold text-foreground">
          Search Documentation
        </h2>

        <ApiEndpoint
          method="POST"
          path="/api/libraries/search"
          description="Perform semantic search across documentation. Returns relevant chunks ranked by relevance."
          requestBody={{
            description: "Search query and optional filters",
            example: `{
  "query": "How to create middleware in Hono",
  "libraryId": "hono",
  "limit": 5
}`,
          }}
          response={{
            description: "Returns matching documentation chunks with relevance scores",
            example: `{
  "results": [
    {
      "id": "chunk-123",
      "libraryId": "hono",
      "title": "Middleware",
      "content": "# Middleware\\n\\nMiddleware works before and after the Handler...",
      "contentType": "guide",
      "sourceFile": "docs/middleware.md",
      "score": 0.92
    },
    {
      "id": "chunk-456",
      "libraryId": "hono",
      "title": "Built-in Middleware",
      "content": "Hono provides several built-in middleware functions...",
      "contentType": "api",
      "sourceFile": "docs/api/middleware.md",
      "score": 0.85
    }
  ],
  "query": "How to create middleware in Hono",
  "libraryId": "hono"
}`,
          }}
        />

        <Callout type="tip" title="Better Search Results">
          For best results, be specific in your query. Include the task or problem
          you're trying to solve, not just keywords.
        </Callout>
      </section>
    </DocsLayout>
  );
}
