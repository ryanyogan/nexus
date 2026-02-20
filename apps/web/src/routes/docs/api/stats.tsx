import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { ApiEndpoint } from "../../../components/docs/ApiEndpoint";

export const Route = createFileRoute("/docs/api/stats")({
  component: StatsApiDocs,
});

function StatsApiDocs() {
  const toc = [
    { id: "global", title: "Global Stats", level: 2 },
    { id: "popular", title: "Popular Libraries", level: 2 },
    { id: "recent", title: "Recently Indexed", level: 2 },
  ];

  return (
    <DocsLayout
      title="Stats API"
      description="Endpoints for platform statistics and trending libraries"
      toc={toc}
    >
      {/* Global Stats */}
      <section className="mb-12">
        <h2 id="global" className="mb-4 text-xl font-semibold text-foreground">
          Global Statistics
        </h2>

        <ApiEndpoint
          method="GET"
          path="/api/stats"
          description="Get global platform statistics including total libraries, documentation coverage, and usage metrics."
          response={{
            description: "Returns aggregate statistics",
            example: `{
  "libraries": {
    "total": 52,
    "indexed": 45,
    "pending": 5,
    "indexing": 2
  },
  "documentation": {
    "totalChunks": 12450,
    "totalTokens": 6250000
  },
  "usage": {
    "totalQueries": 25430,
    "totalChunkHits": 76290
  }
}`,
          }}
        />

        <h3 className="mt-8 mb-3 text-lg font-semibold text-foreground">
          Response Fields
        </h3>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Field</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-primary">libraries.total</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Total number of active libraries
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3 font-mono text-primary">libraries.indexed</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Libraries with completed indexing
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-primary">documentation.totalChunks</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Total documentation chunks indexed
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3 font-mono text-primary">documentation.totalTokens</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Estimated total tokens across all docs
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3 font-mono text-primary">usage.totalQueries</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Total search queries executed
                </td>
              </tr>
              <tr className="bg-card/10">
                <td className="px-4 py-3 font-mono text-primary">usage.totalChunkHits</td>
                <td className="px-4 py-3 text-muted-foreground">
                  Total documentation chunks retrieved
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Popular Libraries */}
      <section className="mb-12">
        <h2 id="popular" className="mb-4 text-xl font-semibold text-foreground">
          Popular Libraries
        </h2>

        <ApiEndpoint
          method="GET"
          path="/api/stats/popular"
          description="Get the most queried libraries, ranked by total queries."
          response={{
            description: "Returns top 10 most popular libraries",
            example: `{
  "popular": [
    {
      "id": "react",
      "name": "React",
      "iconUrl": "https://react.dev/favicon.ico",
      "totalQueries": 5420,
      "totalChunkHits": 16260
    },
    {
      "id": "nextjs",
      "name": "Next.js",
      "iconUrl": "https://nextjs.org/favicon.ico",
      "totalQueries": 4210,
      "totalChunkHits": 12630
    },
    {
      "id": "hono",
      "name": "Hono",
      "iconUrl": "https://hono.dev/images/logo.png",
      "totalQueries": 1523,
      "totalChunkHits": 4569
    }
  ]
}`,
          }}
        />
      </section>

      {/* Recently Indexed */}
      <section className="mb-12">
        <h2 id="recent" className="mb-4 text-xl font-semibold text-foreground">
          Recently Indexed
        </h2>

        <ApiEndpoint
          method="GET"
          path="/api/stats/recent"
          description="Get the most recently indexed libraries."
          response={{
            description: "Returns top 10 most recently indexed libraries",
            example: `{
  "recent": [
    {
      "id": "drizzle-orm",
      "name": "Drizzle ORM",
      "description": "TypeScript ORM that feels like writing SQL",
      "iconUrl": "https://orm.drizzle.team/favicon.ico",
      "totalChunks": 189,
      "lastIndexedAt": "2024-01-20T14:30:00Z"
    },
    {
      "id": "tanstack-query",
      "name": "TanStack Query",
      "description": "Powerful asynchronous state management",
      "iconUrl": "https://tanstack.com/favicon.ico",
      "totalChunks": 245,
      "lastIndexedAt": "2024-01-19T10:15:00Z"
    }
  ]
}`,
          }}
        />
      </section>
    </DocsLayout>
  );
}
