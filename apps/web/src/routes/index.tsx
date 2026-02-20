import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Layers,
  Zap,
  Search,
  Puzzle,
  Shield,
  Globe,
  ArrowRight,
  Github,
  Terminal,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
          <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl">
            <div
              className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-primary to-accent opacity-20"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
                <Layers className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              One MCP Server to{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Rule Them All
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Discover, compose, and invoke MCP servers from one unified
              endpoint. The universal registry for Model Context Protocol
              servers.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/explore"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                Explore Servers
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </div>

            {/* Code snippet preview */}
            <div className="mx-auto mt-16 max-w-2xl">
              <div className="rounded-xl border border-border bg-card p-1 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-muted-foreground">
                    Connect to Nexus
                  </span>
                </div>
                <pre className="overflow-x-auto p-4 text-left text-sm">
                  <code className="text-muted-foreground">
                    <span className="text-accent">const</span>{" "}
                    <span className="text-foreground">nexus</span> ={" "}
                    <span className="text-accent">new</span>{" "}
                    <span className="text-primary">MCPClient</span>(
                    <span className="text-green-400">
                      "https://nexus.yogan.dev/mcp"
                    </span>
                    );{"\n\n"}
                    <span className="text-muted-foreground/60">
                      // Access 100+ tools from one endpoint
                    </span>
                    {"\n"}
                    <span className="text-accent">const</span>{" "}
                    <span className="text-foreground">result</span> ={" "}
                    <span className="text-accent">await</span>{" "}
                    <span className="text-foreground">nexus</span>.
                    <span className="text-primary">call</span>(
                    <span className="text-green-400">
                      "nexus.github.create_pr"
                    </span>
                    , {"{"}{"\n"}
                    {"  "}title:{" "}
                    <span className="text-green-400">"feat: add feature"</span>,
                    {"\n"}
                    {"}"});
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card/50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Nexus?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Everything you need to discover, compose, and use MCP servers
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="Universal Registry"
              description="Browse and search all registered MCP servers with rich metadata, capability tags, and quality signals."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Intelligent Routing"
              description="Just call the tool you need. Nexus figures out which server handles it and routes automatically."
            />
            <FeatureCard
              icon={<Puzzle className="h-6 w-6" />}
              title="Compose Stacks"
              description="Combine multiple MCP servers into one endpoint. Create your perfect dev stack."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Semantic Matching"
              description="Ask for 'read a PDF' and Nexus finds the right tool, even if it's named differently."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Auth Aggregation"
              description="Store credentials once. Nexus handles authentication to all your connected servers."
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Edge Powered"
              description="Built on Cloudflare Workers for ultra-low latency responses worldwide."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Connect once, access everything
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <StepCard
              number="1"
              title="Connect to Nexus"
              description="Point your MCP client to the Nexus endpoint. One connection gives you access to all registered servers."
            />
            <StepCard
              number="2"
              title="Discover Tools"
              description="Browse the registry or let Nexus's semantic search find the perfect tool for your task."
            />
            <StepCard
              number="3"
              title="Call Any Tool"
              description="Invoke tools from any server through the unified Nexus endpoint. We handle the routing."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-b from-card/50 to-background py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Explore the registry and start using MCP servers in seconds.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/explore"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
              >
                Browse Registry
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Layers className="h-4 w-4 text-primary-foreground" />
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
    <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-xl border border-border bg-card p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
