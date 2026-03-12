import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@nexus/db";
import { sql, eq } from "drizzle-orm";
import { withLogging } from "../lib/server-fn";
import {
  ArrowRight,
  Search,
  Server,
  Zap,
  History,
  Github,
  BookOpen,
  FileText,
  Database,
  Sparkles,
  TrendingDown,
  Clock,
  CheckCircle,
} from "lucide-react";

const getHomePageData = createServerFn({ method: "GET" }).handler(
  withLogging("getHomePageData", async () => {
    const db = drizzle(env.DB, { schema });

    // Get stats
    const [libraryStats] = await db
      .select({
        total: sql<number>`count(*)`,
        indexed: sql<number>`sum(case when index_status = 'indexed' then 1 else 0 end)`,
      })
      .from(schema.libraries)
      .where(eq(schema.libraries.isActive, true));

    const [serverStats] = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(schema.mcpServers)
      .where(eq(schema.mcpServers.isActive, true));

    const [skillStats] = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(schema.skills)
      .where(eq(schema.skills.isActive, true));

    return {
      stats: {
        libraries: Number(libraryStats?.indexed ?? 0),
        servers: Number(serverStats?.total ?? 0),
        skills: Number(skillStats?.total ?? 0),
      },
    };
  })
);

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const { session } = context;
    if (session?.user) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: () => getHomePageData(),
  component: HomePage,
});

function HomePage() {
  const { stats } = Route.useLoaderData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/explore/docs", search: { q: searchQuery.trim() } });
    } else {
      navigate({ to: "/explore/docs" });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero Section - Centered */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
        <div className="mx-auto w-full max-w-3xl text-center">
          {/* Logo/Title */}
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Nexus
          </h1>
          <p className="mt-4 text-xl text-muted-foreground sm:text-2xl">
            Up-to-date documentation for AI code editors
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-10">
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation..."
                className="h-14 w-full rounded-xl border border-border bg-background pl-12 pr-32 text-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/explore/docs"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <BookOpen className="h-4 w-4" />
              Browse Docs
            </Link>
            <Link
              to="/explore/servers"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Server className="h-4 w-4" />
              MCP Servers
            </Link>
            <Link
              to="/explore/skills"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Zap className="h-4 w-4" />
              AI Skills
            </Link>
            <a
              href="https://github.com/ryanyogan/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          {/* Stats - Subtle */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span>{stats.libraries}+ libraries</span>
            <span className="h-4 w-px bg-border" />
            <span>{stats.servers}+ servers</span>
            <span className="h-4 w-px bg-border" />
            <span>{stats.skills}+ skills</span>
          </div>
        </div>
      </main>

      {/* Token Savings Section */}
      <section className="border-t border-border bg-emerald-50/50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Save 90% on Context Tokens
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Instead of stuffing your entire codebase into context, Nexus retrieves only the relevant documentation chunks you need.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-foreground">~500k</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Tokens with raw context stuffing
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Sparkles className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-emerald-700">~5k</div>
              <div className="mt-1 text-sm text-emerald-600">
                Tokens with Nexus semantic search
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground">~50ms</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Average query latency
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Nexus pre-indexes documentation and uses vector embeddings to find exactly what you need.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StepItem
              number={1}
              icon={<FileText className="h-5 w-5" />}
              title="Pre-indexed Docs"
              description="Documentation is chunked and indexed ahead of time"
            />
            <StepItem
              number={2}
              icon={<Database className="h-5 w-5" />}
              title="Vector Embeddings"
              description="Each chunk is embedded using Cloudflare AI"
            />
            <StepItem
              number={3}
              icon={<Search className="h-5 w-5" />}
              title="Semantic Search"
              description="Your query finds the most relevant chunks"
            />
            <StepItem
              number={4}
              icon={<Zap className="h-5 w-5" />}
              title="Instant Results"
              description="Get code examples and docs in milliseconds"
            />
          </div>
        </div>
      </section>

      {/* Features - Minimal Grid */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureItem
              icon={<Search className="h-5 w-5" />}
              title="Documentation"
              description="Pre-indexed docs with semantic search"
            />
            <FeatureItem
              icon={<Server className="h-5 w-5" />}
              title="MCP Servers"
              description="Discover and install with one click"
            />
            <FeatureItem
              icon={<Zap className="h-5 w-5" />}
              title="AI Skills"
              description="Curated prompts for common tasks"
            />
            <FeatureItem
              icon={<History className="h-5 w-5" />}
              title="Memory"
              description="Remember context across sessions"
            />
          </div>
        </div>
      </section>

      {/* Response Formats Section */}
      <section className="border-t border-border py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Control Your Token Budget
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Choose from 4 response formats to balance detail vs token efficiency.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormatCard
              title="Full"
              description="Complete documentation with all metadata"
              tokens="~5,000"
            />
            <FormatCard
              title="Compact"
              description="Essential data, minimal formatting"
              tokens="~2,000"
              highlighted
            />
            <FormatCard
              title="Code Only"
              description="Just the code blocks"
              tokens="~1,000"
            />
            <FormatCard
              title="Summary"
              description="Brief overview with key points"
              tokens="~500"
            />
          </div>
        </div>
      </section>

      {/* CTA - Simple */}
      <section className="border-t border-border py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-lg text-muted-foreground">
            Free tier with 2,000 API calls/month.{" "}
            <Link to="/dashboard/billing" className="text-primary hover:underline">
              Pro from $5/mo
            </Link>
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <a
              href="https://github.com/ryanyogan/nexus#installation"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Install MCP Server
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Add Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2026 Nexus by{" "}
              <a href="https://yogan.dev" className="hover:underline">
                yogan.dev
              </a>
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="https://docs.nexus.yogan.dev" className="hover:text-foreground">
                Docs
              </a>
              <a href="https://github.com/ryanyogan/nexus" className="hover:text-foreground">
                GitHub
              </a>
              <Link to="/terminal" className="hover:text-foreground">
                Terminal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepItem({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
        {number}
      </div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FormatCard({
  title,
  description,
  tokens,
  highlighted,
}: {
  title: string;
  description: string;
  tokens: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlighted
          ? "border-emerald-300 bg-emerald-50"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className={`font-medium ${highlighted ? "text-emerald-900" : "text-foreground"}`}>
          {title}
        </h3>
        {highlighted && (
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        )}
      </div>
      <p className={`mt-1 text-sm ${highlighted ? "text-emerald-700" : "text-muted-foreground"}`}>
        {description}
      </p>
      <div className={`mt-3 text-xs font-medium ${highlighted ? "text-emerald-600" : "text-muted-foreground"}`}>
        {tokens} tokens
      </div>
    </div>
  );
}
