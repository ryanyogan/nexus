import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Zap,
  Code2,
  Database,
  Globe,
  ArrowRight,
  Github,
  Terminal,
  FileText,
  Star,
  TrendingUp,
  AlertTriangle,
  Clock,
  XCircle,
  CheckCircle,
  Layers,
  RefreshCw,
  Server,
  Brain,
} from "lucide-react";
import { API_URL } from "../lib/api";

interface Stats {
  libraries: { total: number; indexed: number };
  documentation: { totalChunks: number; totalTokens: number };
  usage: { totalQueries: number };
}

interface FeaturedLibrary {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  totalChunks: number;
  categories: string[];
}

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [featuredLibraries, setFeaturedLibraries] = useState<FeaturedLibrary[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, librariesRes] = await Promise.all([
          fetch(`${API_URL}/api/stats`),
          fetch(`${API_URL}/api/libraries?featured=true&limit=6`),
        ]);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json() as Stats;
          setStats(statsData);
        }
        
        if (librariesRes.ok) {
          const librariesData = await librariesRes.json() as { libraries: FeaturedLibrary[] };
          setFeaturedLibraries(librariesData.libraries || []);
        }
      } catch (error) {
        console.error("Failed to fetch landing page data:", error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative border-b border-border/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Server className="h-4 w-4" />
              MCP Server for Documentation
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Pre-indexed Documentation{" "}
              <span className="text-primary">for AI Coding Assistants</span>
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Nexus solves the biggest limitation of MCP-based documentation tools: 
              <strong className="text-foreground"> real-time fetching is slow, unreliable, and expensive</strong>. 
              We pre-index documentation from popular libraries, chunk it intelligently, 
              and serve it instantly via semantic search.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/explore"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse Libraries
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/docs"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Terminal className="h-5 w-5" />
                Read the Docs
              </Link>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mx-auto mt-16 max-w-3xl">
              <div className="grid grid-cols-2 gap-6 rounded-xl border border-border bg-card p-6 sm:grid-cols-4">
                <StatItem
                  icon={<BookOpen className="h-5 w-5" />}
                  value={stats.libraries.indexed}
                  label="Libraries Indexed"
                />
                <StatItem
                  icon={<FileText className="h-5 w-5" />}
                  value={stats.documentation.totalChunks}
                  label="Doc Chunks"
                />
                <StatItem
                  icon={<Database className="h-5 w-5" />}
                  value={Math.round(stats.documentation.totalTokens / 1000)}
                  label="K Tokens"
                  suffix="K"
                />
                <StatItem
                  icon={<TrendingUp className="h-5 w-5" />}
                  value={stats.usage.totalQueries}
                  label="Queries Served"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* The Problem Section */}
      <section className="border-b border-border/50 bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The Problem with Current MCP Documentation Tools
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              MCP (Model Context Protocol) enables AI assistants to access external tools and data. 
              But current documentation MCP servers have fundamental limitations.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ProblemCard
              icon={<Clock className="h-6 w-6" />}
              title="Slow Real-Time Fetching"
              description="Every query requires fetching docs from the source, parsing HTML, and extracting content. This adds 2-10+ seconds per request, breaking the flow of AI-assisted coding."
            />
            <ProblemCard
              icon={<AlertTriangle className="h-6 w-6" />}
              title="Rate Limits & Failures"
              description="GitHub API limits, website blocks, and network failures cause frequent errors. Your AI assistant fails exactly when you need documentation most."
            />
            <ProblemCard
              icon={<XCircle className="h-6 w-6" />}
              title="Poor Chunk Quality"
              description="On-the-fly parsing creates inconsistent chunks. Code examples get split mid-function, context is lost, and search results are often irrelevant."
            />
            <ProblemCard
              icon={<Database className="h-6 w-6" />}
              title="No Semantic Understanding"
              description="Basic keyword search can't understand 'how do I handle errors in useEffect?' - it just matches words, missing the most relevant documentation."
            />
            <ProblemCard
              icon={<RefreshCw className="h-6 w-6" />}
              title="Redundant Processing"
              description="Every user fetches and processes the same React docs separately. This wastes bandwidth, increases latency, and burns API quotas."
            />
            <ProblemCard
              icon={<Layers className="h-6 w-6" />}
              title="No Multi-Library Search"
              description="Want to find docs across React, Next.js, and TanStack Query? Current tools require separate queries to each source with no unified search."
            />
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="border-b border-border/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How Nexus Solves This
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              Pre-indexed, semantically searchable documentation served at the edge. 
              One MCP server endpoint for all your library documentation needs.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <SolutionCard
              icon={<Zap className="h-6 w-6" />}
              title="Instant Responses"
              description="Documentation is pre-indexed and cached at the edge. Queries return in milliseconds, not seconds. No waiting for fetches or parsing."
              benefits={[
                "Sub-100ms response times globally",
                "No network fetches during queries",
                "Works offline once cached",
              ]}
            />
            <SolutionCard
              icon={<Brain className="h-6 w-6" />}
              title="Semantic Vector Search"
              description="Each documentation chunk is embedded using AI models and stored in Cloudflare Vectorize. Search by meaning, not just keywords."
              benefits={[
                "Understands natural language queries",
                "Finds conceptually related content",
                "Ranks by relevance, not just matches",
              ]}
            />
            <SolutionCard
              icon={<Code2 className="h-6 w-6" />}
              title="Intelligent Chunking"
              description="Documentation is carefully split to preserve code examples, maintain context, and respect section boundaries. No more broken snippets."
              benefits={[
                "Complete code examples preserved",
                "Section context maintained",
                "Optimal chunk sizes for LLMs",
              ]}
            />
            <SolutionCard
              icon={<Globe className="h-6 w-6" />}
              title="Unified Multi-Library Search"
              description="Search across all indexed libraries at once, or filter by specific library. Find the right documentation regardless of which package it's in."
              benefits={[
                "Cross-library semantic search",
                "Filter by category or library",
                "Discover related packages",
              ]}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="border-b border-border/50 bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              Connect Nexus to your AI coding assistant in minutes. Works with Claude, Cursor, Windsurf, and any MCP-compatible client.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <StepCard
              number="1"
              title="Add the MCP Server"
              description="Add Nexus as an MCP server in your AI assistant's configuration. Just one URL endpoint handles everything."
              code={`{
  "mcpServers": {
    "nexus": {
      "url": "https://api.nexus.yogan.dev/mcp"
    }
  }
}`}
            />
            <StepCard
              number="2"
              title="Find Your Library"
              description="Use resolve-library to search for any library by name. Get the library ID and see what documentation is available."
              code={`// Ask your AI assistant:
"Find documentation for TanStack Query"

// Nexus returns:
{
  "id": "tanstack-query",
  "name": "TanStack Query",
  "totalChunks": 847
}`}
            />
            <StepCard
              number="3"
              title="Query Documentation"
              description="Ask questions in natural language. Nexus returns the most relevant documentation chunks with code examples."
              code={`// Ask your AI assistant:
"How do I invalidate queries 
after a mutation in TanStack Query?"

// Returns relevant docs with
// code examples instantly`}
            />
          </div>
        </div>
      </section>

      {/* MCP Tools Section */}
      <section className="border-b border-border/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Available MCP Tools
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              Four powerful tools that give your AI assistant complete access to indexed documentation.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <ToolCard
              name="resolve-library"
              description="Search for libraries by name. Returns matching libraries with their IDs, descriptions, and documentation stats. Use this first to find the right library."
              parameters={["libraryName: string"]}
            />
            <ToolCard
              name="query-docs"
              description="Semantic search within a library's documentation. Ask questions in natural language and get the most relevant chunks with code examples."
              parameters={["libraryId: string", "query: string", "limit?: number"]}
            />
            <ToolCard
              name="get-library-info"
              description="Get detailed information about a specific library including categories, chunk count, token count, and indexing status."
              parameters={["libraryId: string"]}
            />
            <ToolCard
              name="list-libraries"
              description="Browse all indexed libraries. Filter by category (frontend, backend, database, etc.) and paginate through results."
              parameters={["category?: string", "limit?: number", "offset?: number"]}
            />
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/docs/mcp-tools"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
            >
              View full MCP documentation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Libraries Section */}
      {featuredLibraries.length > 0 && (
        <section className="border-b border-border/50 bg-muted/30 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Featured Libraries
                </h2>
                <p className="mt-2 text-lg text-muted-foreground">
                  Popular libraries with fully indexed documentation
                </p>
              </div>
              <Link
                to="/explore"
                className="hidden items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 sm:flex"
              >
                View all libraries
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredLibraries.map((lib) => (
                <Link
                  key={lib.id}
                  to="/libraries/$libraryId"
                  params={{ libraryId: lib.id }}
                  className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                >
                  {lib.iconUrl ? (
                    <img
                      src={lib.iconUrl}
                      alt={lib.name}
                      className="h-10 w-10 rounded-lg bg-muted object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{lib.name}</h3>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {lib.description || "No description available"}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{lib.totalChunks} chunks</span>
                      {lib.categories?.[0] && (
                        <>
                          <span>-</span>
                          <span className="capitalize">{lib.categories[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                View all libraries
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Architecture Section */}
      <section className="border-b border-border/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for Speed and Scale
            </h2>
            <p className="mt-4 text-center text-lg text-muted-foreground">
              Nexus is built entirely on Cloudflare's edge infrastructure for maximum performance and reliability.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <ArchCard
              icon={<Server className="h-6 w-6" />}
              title="Workers"
              description="API runs on Cloudflare Workers at 300+ edge locations worldwide"
            />
            <ArchCard
              icon={<Database className="h-6 w-6" />}
              title="D1 Database"
              description="Library metadata and chunk info stored in globally replicated D1"
            />
            <ArchCard
              icon={<Brain className="h-6 w-6" />}
              title="Vectorize"
              description="AI embeddings stored in Vectorize for semantic similarity search"
            />
            <ArchCard
              icon={<FileText className="h-6 w-6" />}
              title="R2 Storage"
              description="Full documentation chunks stored in R2 object storage"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Add Nexus to your AI coding assistant and get instant access to documentation for {stats?.libraries.indexed || "20+"} libraries.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/docs/getting-started"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/ryanyogan/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Nexus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Cloudflare Workers, Hono, and TanStack Start
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component definitions

function StatItem({
  icon,
  value,
  label,
  suffix,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="text-center">
      <div className="mb-2 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground">
        {value.toLocaleString()}{suffix && <span className="text-lg">{suffix}</span>}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ProblemCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function SolutionCard({
  icon,
  title,
  description,
  benefits,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 text-muted-foreground">{description}</p>
      <ul className="space-y-2">
        {benefits.map((benefit, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span className="text-muted-foreground">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  code,
}: {
  number: string;
  title: string;
  description: string;
  code: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mb-4 text-muted-foreground">{description}</p>
      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
        <code className="text-muted-foreground">{code}</code>
      </pre>
    </div>
  );
}

function ToolCard({
  name,
  description,
  parameters,
}: {
  name: string;
  description: string;
  parameters: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <code className="mb-3 inline-block rounded-md bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
        {name}
      </code>
      <p className="mb-4 text-muted-foreground">{description}</p>
      <div className="space-y-1">
        <p className="text-xs font-medium text-foreground">Parameters:</p>
        {parameters.map((param, i) => (
          <code key={i} className="block text-xs text-muted-foreground">
            {param}
          </code>
        ))}
      </div>
    </div>
  );
}

function ArchCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <div className="mb-3 flex justify-center text-primary">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
