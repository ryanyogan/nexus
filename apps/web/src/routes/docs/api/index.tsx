import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";
import { ApiPlayground } from "../../../components/docs/ApiPlayground";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/docs/api/")({
  component: ApiOverview,
});

function ApiOverview() {
  const toc = [
    { id: "overview", title: "Overview", level: 2 },
    { id: "base-url", title: "Base URL", level: 2 },
    { id: "authentication", title: "Authentication", level: 2 },
    { id: "rate-limiting", title: "Rate Limiting", level: 2 },
    { id: "endpoints", title: "Endpoints", level: 2 },
    { id: "playground", title: "API Playground", level: 2 },
  ];

  return (
    <DocsLayout
      title="REST API"
      description="Direct HTTP access to Nexus documentation search"
      toc={toc}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 id="overview" className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>

        <p className="mb-4 text-muted-foreground">
          The Nexus REST API provides programmatic access to all Nexus features.
          Use it to search documentation, list libraries, submit new libraries for
          indexing, and retrieve statistics.
        </p>

        <Callout type="info">
          For AI coding assistants, we recommend using the{" "}
          <Link to="/docs/mcp-tools" className="text-primary hover:underline">
            MCP tools
          </Link>{" "}
          instead of the REST API for better integration.
        </Callout>
      </section>

      {/* Base URL */}
      <section className="mb-12">
        <h2 id="base-url" className="mb-4 text-xl font-semibold text-foreground">
          Base URL
        </h2>

        <CodeBlock language="text">
{`https://api.nexus.yogan.dev`}
        </CodeBlock>

        <p className="mt-4 text-muted-foreground">
          All API endpoints are prefixed with <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">/api</code>.
        </p>
      </section>

      {/* Authentication */}
      <section className="mb-12">
        <h2 id="authentication" className="mb-4 text-xl font-semibold text-foreground">
          Authentication
        </h2>

        <p className="mb-4 text-muted-foreground">
          Currently, the Nexus API is open and does not require authentication.
          All endpoints are publicly accessible.
        </p>

        <Callout type="warning" title="Rate Limits Apply">
          While no authentication is required, rate limits are enforced to ensure
          fair usage. See the rate limiting section below.
        </Callout>
      </section>

      {/* Rate Limiting */}
      <section className="mb-12">
        <h2 id="rate-limiting" className="mb-4 text-xl font-semibold text-foreground">
          Rate Limiting
        </h2>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold">Endpoint Type</th>
                <th className="px-4 py-3 text-left font-semibold">Rate Limit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 bg-card/30">
                <td className="px-4 py-3">Read endpoints (GET)</td>
                <td className="px-4 py-3 text-muted-foreground">
                  100 requests per minute
                </td>
              </tr>
              <tr className="border-b border-border/30 bg-card/10">
                <td className="px-4 py-3">Search endpoints (POST /search)</td>
                <td className="px-4 py-3 text-muted-foreground">
                  30 requests per minute
                </td>
              </tr>
              <tr className="bg-card/30">
                <td className="px-4 py-3">Submit endpoints (POST /submissions)</td>
                <td className="px-4 py-3 text-muted-foreground">
                  10 requests per minute
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-muted-foreground">
          Rate limit headers are included in all responses:
        </p>

        <CodeBlock language="text">
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800`}
        </CodeBlock>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 id="endpoints" className="mb-4 text-xl font-semibold text-foreground">
          Endpoints
        </h2>

        <div className="space-y-4">
          <EndpointGroup
            title="Libraries"
            description="Search and retrieve library documentation"
            href="/docs/api/libraries"
            endpoints={[
              { method: "GET", path: "/api/libraries" },
              { method: "GET", path: "/api/libraries/:id" },
              { method: "GET", path: "/api/libraries/:id/chunks" },
              { method: "POST", path: "/api/libraries/search" },
            ]}
          />
          <EndpointGroup
            title="Submissions"
            description="Submit new libraries for indexing"
            href="/docs/api/submissions"
            endpoints={[
              { method: "POST", path: "/api/submissions" },
              { method: "GET", path: "/api/submissions" },
              { method: "GET", path: "/api/submissions/:id" },
            ]}
          />
          <EndpointGroup
            title="Stats"
            description="Platform statistics and popular libraries"
            href="/docs/api/stats"
            endpoints={[
              { method: "GET", path: "/api/stats" },
              { method: "GET", path: "/api/stats/popular" },
              { method: "GET", path: "/api/stats/recent" },
            ]}
          />
        </div>
      </section>

      {/* Playground */}
      <section className="mb-12">
        <h2 id="playground" className="mb-4 text-xl font-semibold text-foreground">
          API Playground
        </h2>

        <p className="mb-4 text-muted-foreground">
          Try out the API directly from this page. Select an endpoint, configure
          parameters, and send requests.
        </p>

        <ApiPlayground />
      </section>
    </DocsLayout>
  );
}

function EndpointGroup({
  title,
  description,
  href,
  endpoints,
}: {
  title: string;
  description: string;
  href: string;
  endpoints: Array<{ method: string; path: string }>;
}) {
  const methodColors: Record<string, string> = {
    GET: "text-green-400",
    POST: "text-blue-400",
    PUT: "text-yellow-400",
    DELETE: "text-red-400",
  };

  return (
    <Link
      to={href}
      className="group block rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/50"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {endpoints.map((endpoint, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 rounded bg-muted/30 px-2 py-1 text-xs font-mono"
          >
            <span className={methodColors[endpoint.method]}>{endpoint.method}</span>
            <span className="text-muted-foreground">{endpoint.path}</span>
          </span>
        ))}
      </div>
    </Link>
  );
}
