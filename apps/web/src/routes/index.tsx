import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import {
  ArrowRight,
  Github,
  Search,
  History,
  Sparkles,
  Server,
  Zap,
  Database,
  ExternalLink,
  CheckCircle,
  Terminal,
  Smartphone,
  Users,
  Cpu,
  Lock,
} from "lucide-react";
import {
  statsQueryOptions,
  featuredServersQueryOptions,
  skillsQueryOptions,
  type McpServer,
  type Skill,
} from "../lib/query-options";
import {
  StatsSkeleton,
  ServerPreviewCardSkeleton,
} from "../components/skeletons";
import { useSession } from "@nexus/auth/client";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(statsQueryOptions);
    context.queryClient.ensureQueryData(featuredServersQueryOptions);
    context.queryClient.ensureQueryData(skillsQueryOptions({ limit: 6, featured: true }));
  },
  component: HomePage,
});

function HomePage() {
  const { data: session } = useSession();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session?.user) {
      navigate({ to: "/dashboard" });
    }
  }, [session, navigate]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="border-b border-border py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Docs + Servers + Skills + Memory
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The Complete{" "}
              <span className="text-primary">AI Coding Platform</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Documentation search, MCP server registry, AI agent skills, persistent memory, 
              and secure secrets vault. Everything your AI assistant needs in one MCP server.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/docs/getting-started"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Search className="h-5 w-5" />
                Explore Platform
              </Link>
            </div>

            {/* Pricing Badge */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <span>Free tier with 2,000 API calls/month</span>
              <span className="opacity-50">|</span>
              <span className="font-semibold">Pro: $5/mo</span>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<StatsSkeleton />}>
            <StatsDisplay />
          </Suspense>
        </div>
      </section>

      {/* Core Features Grid - 8 cards */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              One MCP Server, Everything You Need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Stop juggling multiple tools. Nexus brings documentation, servers, skills, and memory together.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="Doc Search"
              description="Pre-indexed documentation with semantic search. Millisecond queries with code examples."
              badge="30+ Libraries"
            />
            <FeatureCard
              icon={<Server className="h-6 w-6" />}
              title="Server Registry"
              description="Discover MCP servers. Get ready-to-use configs for Claude, VS Code, and OpenCode."
              badge="18+ Servers"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="AI Skills"
              description="Curated collection of AI agent skills. Code review, documentation, testing, and more."
              badge="31+ Skills"
              isNew
            />
            <FeatureCard
              icon={<History className="h-6 w-6" />}
              title="Persistent Memory"
              description="Remember project context, decisions, and lessons across sessions. Free for everyone."
              badge="Unlimited"
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6" />}
              title="Secrets Vault"
              description="Encrypted storage for API keys. AES-256-GCM encryption, never leaves your account."
              badge="Secure"
            />
            <FeatureCard
              icon={<Terminal className="h-6 w-6" />}
              title="Remote Terminal"
              description="Control OpenCode remotely from any device. Real-time streaming and live events."
              badge="Mobile Ready"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Team Workspaces"
              description="Share memories, skills, and API keys with your team. Role-based access control."
              badge="Coming Soon"
            />
            <FeatureCard
              icon={<Cpu className="h-6 w-6" />}
              title="Usage Analytics"
              description="Track API usage, popular queries, and team activity. Optimize your workflow."
              badge="Pro"
            />
          </div>
        </div>
      </section>

      {/* Skills Showcase Section */}
      <section className="border-t border-border bg-gradient-to-br from-purple-500/5 to-primary/5 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-sm text-purple-600 dark:text-purple-400">
                <Zap className="h-4 w-4" />
                New Feature
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                AI Agent Skills
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Pre-built instructions for common development tasks
              </p>
            </div>
            <Link
              to="/explore"
              search={{ tab: "skills" }}
              className="hidden items-center gap-2 text-primary hover:underline sm:inline-flex"
            >
              Browse all skills
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Suspense fallback={<SkillsSkeleton />}>
            <FeaturedSkillsDisplay />
          </Suspense>

          <div className="mt-6 sm:hidden">
            <Link
              to="/explore"
              search={{ tab: "skills" }}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Browse all skills
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* OpenCode Remote Terminal Section */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
                <Smartphone className="h-4 w-4" />
                Remote Access
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                OpenCode Remote Terminal
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Control your OpenCode session from anywhere. Connect to your running 
                AI coding assistant remotely from your phone, tablet, or any browser.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                  Connect to your OpenCode server remotely
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                  Real-time streaming of AI responses
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                  Live events: file edits, tool calls, todos
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                  Session management and history
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/terminal"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Terminal className="h-5 w-5" />
                  Launch Terminal
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-border bg-[#282a36] p-4 font-mono text-sm shadow-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-zinc-400">opencode remote</span>
                </div>
                <div className="space-y-2 text-[#f8f8f2]">
                  <p className="text-zinc-400 text-xs">Connected to: localhost:4096</p>
                  <p className="text-zinc-400 text-xs">Project: ~/my-project (main)</p>
                  <p className="mt-2 text-green-400">&gt; Add a dark mode toggle to the settings page</p>
                  <p className="mt-2 text-zinc-300">I'll add a dark mode toggle to your settings. Let me:</p>
                  <p className="text-zinc-400 pl-2">1. Create a theme context...</p>
                  <p className="text-zinc-400 pl-2">2. Add the toggle component...</p>
                  <p className="text-yellow-400 text-xs mt-2">Event: File edited - src/components/ThemeToggle.tsx</p>
                  <p className="text-green-400 mt-2">&gt; _</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MCP Server Gallery Section */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                MCP Server Registry
              </h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Discover and install MCP servers with one-click configs
              </p>
            </div>
            <Link
              to="/explore"
              search={{ tab: "servers" }}
              className="hidden items-center gap-2 text-primary hover:underline sm:inline-flex"
            >
              View all servers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Suspense fallback={<FeaturedServersSkeleton />}>
            <FeaturedServersDisplay />
          </Suspense>

          <div className="mt-6 sm:hidden">
            <Link
              to="/explore"
              search={{ tab: "servers" }}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              View all servers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, Affordable Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when you need more. Memory stays free forever.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <PricingCard
              name="Free"
              price="$0"
              period="forever"
              description="Perfect for trying out Nexus"
              features={[
                "2,000 API calls/month",
                "1 API key",
                "5 memories",
                "All documentation search",
                "All MCP servers",
                "Community support",
              ]}
              cta="Get Started"
              ctaLink="/docs/getting-started"
            />
            <PricingCard
              name="Pro"
              price="$5"
              period="/month"
              description="For power users"
              features={[
                "Unlimited API calls",
                "10 API keys",
                "Unlimited memories",
                "Priority doc indexing",
                "Usage analytics",
                "Email support",
              ]}
              cta="Upgrade to Pro"
              ctaLink="/dashboard/billing"
              highlighted
            />
            <PricingCard
              name="Team"
              price="$5"
              period="/user/month"
              description="For teams"
              features={[
                "Everything in Pro",
                "Shared team memories",
                "Team API keys",
                "Admin dashboard",
                "Priority support",
                "Custom integrations",
              ]}
              cta="Contact Us"
              ctaLink="mailto:hello@nexus.yogan.dev"
            />
          </div>
        </div>
      </section>

      {/* Comparison Matrix */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How Nexus Compares
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See why developers are switching to Nexus for AI-assisted development
            </p>
          </div>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-border p-4 text-left font-semibold text-foreground">Feature</th>
                  <th className="border-b border-border p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-primary text-lg">Nexus</span>
                      <span className="text-xs text-muted-foreground">by yogan.dev</span>
                    </div>
                  </th>
                  <th className="border-b border-border p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-foreground">Context7</span>
                      <span className="text-xs text-muted-foreground">context7.com</span>
                    </div>
                  </th>
                  <th className="border-b border-border p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-foreground">Cursor Docs</span>
                      <span className="text-xs text-muted-foreground">Built-in</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow 
                  feature="Documentation Search" 
                  nexus={true} 
                  context7={true} 
                  cursor={true}
                  nexusNote="50+ libraries indexed"
                  context7Note="1000+ libraries"
                  cursorNote="Web crawling"
                />
                <ComparisonRow 
                  feature="Persistent Memory" 
                  nexus={true} 
                  context7={false} 
                  cursor={false}
                  nexusNote="FREE for all users"
                />
                <ComparisonRow 
                  feature="MCP Server Registry" 
                  nexus={true} 
                  context7={true} 
                  cursor={false}
                  nexusNote="18+ servers with configs"
                />
                <ComparisonRow 
                  feature="AI Agent Skills" 
                  nexus={true} 
                  context7={false} 
                  cursor={false}
                  nexusNote="31+ curated skills"
                />
                <ComparisonRow 
                  feature="Secrets Vault" 
                  nexus={true} 
                  context7={false} 
                  cursor={false}
                  nexusNote="AES-256-GCM encrypted"
                />
                <ComparisonRow 
                  feature="Remote Terminal" 
                  nexus={true} 
                  context7={false} 
                  cursor={false}
                  nexusNote="Control from any device"
                />
                <ComparisonRow 
                  feature="User Dashboard" 
                  nexus={true} 
                  context7={true} 
                  cursor={true}
                />
                <ComparisonRow 
                  feature="Team Features" 
                  nexus={true} 
                  context7={true} 
                  cursor={true}
                  nexusNote="Coming soon"
                />
                <ComparisonRow 
                  feature="Open Source" 
                  nexus={true} 
                  context7={false} 
                  cursor={false}
                  nexusNote="MIT License"
                />
                <tr className="bg-muted/50">
                  <td className="border-b border-border p-4 font-semibold text-foreground">Free Tier</td>
                  <td className="border-b border-border p-4 text-center">
                    <span className="font-bold text-green-600 dark:text-green-400">2,000 calls/mo</span>
                  </td>
                  <td className="border-b border-border p-4 text-center">
                    <span className="text-muted-foreground">Limited</span>
                  </td>
                  <td className="border-b border-border p-4 text-center">
                    <span className="text-muted-foreground">With IDE</span>
                  </td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="border-b border-border p-4 font-semibold text-foreground">Pro Price</td>
                  <td className="border-b border-border p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-primary">$5</span>
                      <span className="text-xs text-muted-foreground">/month</span>
                    </div>
                  </td>
                  <td className="border-b border-border p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-semibold text-foreground">$10</span>
                      <span className="text-xs text-muted-foreground">/month</span>
                    </div>
                  </td>
                  <td className="border-b border-border p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-semibold text-foreground">$20</span>
                      <span className="text-xs text-muted-foreground">/month</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-foreground">Memory Included</td>
                  <td className="p-4 text-center">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Always FREE
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-muted-foreground">-</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-muted-foreground">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Save <span className="font-semibold text-primary">70%</span> compared to Context7. 
              Memory is always free on Nexus because we believe AI assistants should remember context.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-br from-primary/5 to-primary/10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to supercharge your AI coding?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join developers using Nexus for documentation, MCP servers, skills, and memory.
              Start free, upgrade when you need more.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/docs/getting-started"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/ryanyogan/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border px-8 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Stats Display Component (with Suspense)
// ============================================================================

function StatsDisplay() {
  const { data: stats } = useSuspenseQuery(statsQueryOptions);

  return (
    <div className="mx-auto mt-16 max-w-4xl">
      <div className="grid grid-cols-2 gap-6 rounded-lg border border-border bg-card p-6 sm:grid-cols-5">
        <StatItem value={stats.libraries.indexed} label="Libraries" />
        <StatItem value={stats.servers?.total || 18} label="MCP Servers" />
        <StatItem value={31} label="AI Skills" />
        <StatItem
          value={Math.round(stats.documentation.totalTokens / 1000)}
          label="K Tokens"
        />
        <StatItem value={stats.usage.totalQueries} label="Queries" />
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-foreground">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

// ============================================================================
// Featured Skills Display
// ============================================================================

function FeaturedSkillsDisplay() {
  const { data } = useSuspenseQuery(skillsQueryOptions({ limit: 6, featured: true }));
  const skills = data?.skills || [];

  const typeColors: Record<string, string> = {
    analysis: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    generation: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    transformation: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    integration: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    utility: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  if (skills.length === 0) {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Show placeholder skills */}
        {[
          { name: "Code Review", type: "analysis", desc: "Comprehensive code review following best practices" },
          { name: "React Best Practices", type: "generation", desc: "Write idiomatic React components" },
          { name: "API Documentation", type: "generation", desc: "Generate OpenAPI specs and API docs" },
          { name: "Database Schema", type: "analysis", desc: "Design and optimize database schemas" },
          { name: "Test Generation", type: "generation", desc: "Generate comprehensive test suites" },
          { name: "Performance Audit", type: "analysis", desc: "Identify and fix performance issues" },
        ].map((skill, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-200 dark:bg-purple-900/30">
                <Zap className="h-5 w-5 text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{skill.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[skill.type]}`}>
                    {skill.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{skill.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {skills.map((skill: Skill) => (
        <Link
          key={skill.id}
          to="/explore"
          search={{ tab: "skills" }}
          className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-200 dark:bg-purple-900/30">
              <Zap className="h-5 w-5 text-purple-700 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{skill.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[skill.type] || typeColors.utility}`}>
                  {skill.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{skill.description || ""}</p>
              {skill.installCount > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {skill.installCount.toLocaleString()} installs
                </p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SkillsSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Featured Servers Display (with Suspense)
// ============================================================================

function FeaturedServersDisplay() {
  const { data: servers } = useSuspenseQuery(featuredServersQueryOptions);

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {servers.map((server) => (
        <ServerPreviewCard key={server.id} server={server} />
      ))}
    </div>
  );
}

function FeaturedServersSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ServerPreviewCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ServerPreviewCard({ server }: { server: McpServer }) {
  return (
    <Link
      to="/explore/servers/$serverId"
      params={{ serverId: server.id }}
      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {server.iconUrl ? (
          <img
            src={server.iconUrl}
            alt={server.name}
            className="h-6 w-6 object-contain"
          />
        ) : (
          <Database className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-foreground">{server.name}</h3>
          {server.isOfficial && (
            <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Official
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {server.description}
        </p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

// ============================================================================
// Feature Card Component
// ============================================================================

function FeatureCard({
  icon,
  title,
  description,
  badge,
  isNew,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  isNew?: boolean;
}) {
  return (
    <div className="relative rounded-lg border border-border bg-card p-6">
      {isNew && (
        <div className="absolute -top-2 -right-2 rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-bold text-white">
          NEW
        </div>
      )}
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {badge && (
        <div className="mt-3">
          <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Pricing Card Component
// ============================================================================

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaLink,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  const isExternal = ctaLink.startsWith("mailto:");
  
  return (
    <div className={`relative flex flex-col rounded-lg border p-6 ${
      highlighted ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card"
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="mb-6">
        <span className="text-3xl font-bold text-foreground">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      
      <ul className="mb-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      
      {isExternal ? (
        <a
          href={ctaLink}
          className={`w-full rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${
            highlighted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border text-foreground hover:bg-muted"
          }`}
        >
          {cta}
        </a>
      ) : (
        <Link
          to={ctaLink}
          className={`w-full rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${
            highlighted
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border text-foreground hover:bg-muted"
          }`}
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

// ============================================================================
// Comparison Row Component
// ============================================================================

function ComparisonRow({
  feature,
  nexus,
  context7,
  cursor,
  nexusNote,
  context7Note,
  cursorNote,
}: {
  feature: string;
  nexus: boolean;
  context7: boolean;
  cursor: boolean;
  nexusNote?: string;
  context7Note?: string;
  cursorNote?: string;
}) {
  return (
    <tr className="hover:bg-muted/30">
      <td className="border-b border-border p-4 text-foreground">{feature}</td>
      <td className="border-b border-border p-4 text-center">
        <div className="flex flex-col items-center gap-1">
          {nexus ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
          {nexusNote && <span className="text-xs text-muted-foreground">{nexusNote}</span>}
        </div>
      </td>
      <td className="border-b border-border p-4 text-center">
        <div className="flex flex-col items-center gap-1">
          {context7 ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
          {context7Note && <span className="text-xs text-muted-foreground">{context7Note}</span>}
        </div>
      </td>
      <td className="border-b border-border p-4 text-center">
        <div className="flex flex-col items-center gap-1">
          {cursor ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
          {cursorNote && <span className="text-xs text-muted-foreground">{cursorNote}</span>}
        </div>
      </td>
    </tr>
  );
}
