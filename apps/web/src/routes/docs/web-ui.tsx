import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout } from "../../components/docs/DocsLayout";
import { Callout } from "../../components/docs/Callout";
import { ExternalLink, Search, BookOpen, Filter, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/docs/web-ui")({
  component: WebUiDocs,
});

function WebUiDocs() {
  const toc = [
    { id: "overview", title: "Overview", level: 2 },
    { id: "explore", title: "Explore Libraries", level: 2 },
    { id: "library-details", title: "Library Details", level: 2 },
    { id: "search", title: "Searching", level: 2 },
  ];

  return (
    <DocsLayout
      title="Using the Web UI"
      description="Browse and explore indexed libraries through the web interface"
      toc={toc}
    >
      {/* Overview */}
      <section className="mb-12">
        <h2 id="overview" className="mb-4 text-xl font-semibold text-foreground">
          Overview
        </h2>

        <p className="mb-4 text-muted-foreground">
          The Nexus web interface at{" "}
          <a
            href="https://nexus.yogan.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            nexus.yogan.dev
            <ExternalLink className="h-3 w-3" />
          </a>{" "}
          provides a visual way to explore indexed libraries, view documentation
          coverage, and understand what content is available.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <FeatureCard
            icon={<Search className="h-5 w-5" />}
            title="Search Libraries"
            description="Find libraries by name or browse by category"
          />
          <FeatureCard
            icon={<BookOpen className="h-5 w-5" />}
            title="View Details"
            description="See documentation coverage and statistics"
          />
          <FeatureCard
            icon={<Filter className="h-5 w-5" />}
            title="Filter & Sort"
            description="Filter by category, status, and more"
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Usage Stats"
            description="See how often libraries are queried"
          />
        </div>
      </section>

      {/* Explore */}
      <section className="mb-12">
        <h2 id="explore" className="mb-4 text-xl font-semibold text-foreground">
          Explore Libraries
        </h2>

        <p className="mb-4 text-muted-foreground">
          The{" "}
          <Link to="/explore" className="text-primary hover:underline">
            Explore page
          </Link>{" "}
          shows all indexed libraries in a grid layout. You can:
        </p>

        <ul className="mb-6 list-disc list-inside space-y-2 text-muted-foreground">
          <li>
            <strong className="text-foreground">Search by name</strong> - Type in the
            search box to filter libraries
          </li>
          <li>
            <strong className="text-foreground">Filter by category</strong> - Select
            a category like "frontend", "backend", or "database"
          </li>
          <li>
            <strong className="text-foreground">See featured libraries</strong> -
            Featured libraries are highlighted with a badge
          </li>
          <li>
            <strong className="text-foreground">View documentation size</strong> -
            Each card shows the number of indexed chunks
          </li>
        </ul>

        <Callout type="tip">
          Click on any library card to view its detailed information and
          documentation coverage.
        </Callout>
      </section>

      {/* Library Details */}
      <section className="mb-12">
        <h2 id="library-details" className="mb-4 text-xl font-semibold text-foreground">
          Library Details
        </h2>

        <p className="mb-4 text-muted-foreground">
          Each library has a detail page showing:
        </p>

        <div className="space-y-4">
          <DetailSection
            title="Basic Information"
            items={[
              "Library name and description",
              "Current indexed version",
              "Categories (e.g., frontend, backend)",
              "Links to homepage and repository",
            ]}
          />
          <DetailSection
            title="Documentation Coverage"
            items={[
              "Total number of documentation chunks",
              "Estimated token count",
              "Last indexed timestamp",
              "Indexing status",
            ]}
          />
          <DetailSection
            title="Usage Statistics"
            items={[
              "Total queries made",
              "Total documentation chunks retrieved",
              "Last queried timestamp",
            ]}
          />
        </div>
      </section>

      {/* Searching */}
      <section className="mb-12">
        <h2 id="search" className="mb-4 text-xl font-semibold text-foreground">
          Searching
        </h2>

        <p className="mb-4 text-muted-foreground">
          The web UI provides a simple search interface for finding libraries.
          For semantic documentation search, use one of these methods:
        </p>

        <div className="space-y-4">
          <SearchMethod
            title="MCP Tools"
            description="Use the query-docs tool from your AI coding assistant for the best semantic search experience."
            href="/docs/mcp-tools/query-docs"
          />
          <SearchMethod
            title="REST API"
            description="Use the POST /api/libraries/search endpoint for programmatic semantic search."
            href="/docs/api/libraries"
          />
          <SearchMethod
            title="API Playground"
            description="Try the interactive API playground on the REST API docs page to test searches."
            href="/docs/api"
          />
        </div>

        <Callout type="info" title="Why no web search?">
          Semantic search is computationally intensive and works best in the context
          of AI assistants that can interpret and use the results. The web UI focuses
          on browsing and discovery.
        </Callout>
      </section>

      {/* Next steps */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Next Steps
        </h2>

        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>
            <Link to="/explore" className="text-primary hover:underline">
              Explore available libraries
            </Link>
          </li>
          <li>
            <Link to="/docs/submit" className="text-primary hover:underline">
              Submit a library for indexing
            </Link>
          </li>
          <li>
            <Link to="/docs/getting-started" className="text-primary hover:underline">
              Set up Nexus with your AI assistant
            </Link>
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function DetailSection({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SearchMethod({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="block rounded-lg border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/50"
    >
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
