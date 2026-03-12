import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect } from "react";
import {
  ArrowRight,
  Github,
  Search,
  History,
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
import { useSession } from "@/lib/auth";

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
    <div className="relative overflow-y-auto overflow-x-hidden pb-0">
      {/* Hero Section */}
      <section className="flex flex-col gap-3 px-4 pt-10 md:gap-4 md:pt-[60px]">
        <div className="mx-auto flex w-full max-w-[880px] flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
            Documentation + Memory for{" "}
            <span className="text-emerald-600">AI Coding Assistants</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-stone-600">
            Documentation search, MCP server registry, AI skills, and persistent memory. 
            Everything your AI assistant needs in one MCP server.
          </p>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://docs.nexus.yogan.dev/getting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              <Search className="h-4 w-4" />
              Explore Platform
            </Link>
            <a
              href="https://github.com/ryanyogan/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>

          {/* Pricing Badge */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm text-emerald-700">
            <span>Free tier with 2,000 API calls/month</span>
            <span className="opacity-50">|</span>
            <span className="font-semibold">Pro: $5/mo</span>
          </div>

          {/* Stats */}
          <Suspense fallback={<StatsSkeleton />}>
            <StatsDisplay />
          </Suspense>
        </div>
      </section>

      {/* Core Features Grid - 8 cards */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-[880px] px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              One MCP Server, Everything You Need
            </h2>
            <p className="mt-4 text-lg text-stone-600">
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
      <section className="border-t border-stone-200 bg-gradient-to-br from-purple-500/5 to-emerald-500/5 py-16 sm:py-24">
        <div className="mx-auto max-w-[880px] px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-300/30 bg-purple-500/10 px-3 py-1 text-sm text-purple-600">
                <Zap className="h-4 w-4" />
                New Feature
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                AI Agent Skills
              </h2>
              <p className="mt-2 text-lg text-stone-600">
                Pre-built instructions for common development tasks
              </p>
            </div>
            <Link
              to="/explore"
              search={{ tab: "skills" }}
              className="hidden items-center gap-2 text-emerald-600 hover:underline sm:inline-flex"
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
              className="inline-flex items-center gap-2 text-emerald-600 hover:underline"
            >
              Browse all skills
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* OpenCode Remote Terminal Section */}
      <section className="border-t border-stone-200 py-16 sm:py-24">
        <div className="mx-auto max-w-[880px] px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-600">
                <Smartphone className="h-4 w-4" />
                Remote Access
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                OpenCode Remote Terminal
              </h2>
              <p className="mt-4 text-lg text-stone-600">
                Control your OpenCode session from anywhere. Connect to your running 
                AI coding assistant remotely from your phone, tablet, or any browser.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-2 text-stone-600">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Connect to your OpenCode server remotely
                </li>
                <li className="flex items-center gap-2 text-stone-600">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Real-time streaming of AI responses
                </li>
                <li className="flex items-center gap-2 text-stone-600">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Live events: file edits, tool calls, todos
                </li>
                <li className="flex items-center gap-2 text-stone-600">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  Session management and history
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/terminal"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-8 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <Terminal className="h-5 w-5" />
                  Launch Terminal
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-stone-200 bg-[#282a36] p-4 font-mono text-sm shadow-2xl">
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
      <section className="border-t border-stone-200 bg-stone-50 py-16 sm:py-24">
        <div className="mx-auto max-w-[880px] px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                MCP Server Registry
              </h2>
              <p className="mt-2 text-lg text-stone-600">
                Discover and install MCP servers with one-click configs
              </p>
            </div>
            <Link
              to="/explore"
              search={{ tab: "servers" }}
              className="hidden items-center gap-2 text-emerald-600 hover:underline sm:inline-flex"
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
              className="inline-flex items-center gap-2 text-emerald-600 hover:underline"
            >
              View all servers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-t border-stone-200 py-16 sm:py-24">
        <div className="mx-auto max-w-[880px] px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Simple, Affordable Pricing
            </h2>
            <p className="mt-4 text-lg text-stone-600">
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
              ctaLink="https://docs.nexus.yogan.dev/getting-started"
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
      <section className="border-t border-stone-200 bg-stone-50 py-16 sm:py-24">
        <div className="mx-auto max-w-[880px] px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              How Nexus Compares
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              See why developers are switching to Nexus for AI-assisted development
            </p>
          </div>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-stone-200 p-4 text-left font-semibold text-stone-900">Feature</th>
                  <th className="border-b border-stone-200 p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-emerald-600 text-lg">Nexus</span>
                      <span className="text-xs text-stone-500">by yogan.dev</span>
                    </div>
                  </th>
                  <th className="border-b border-stone-200 p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-stone-900">Context7</span>
                      <span className="text-xs text-stone-500">context7.com</span>
                    </div>
                  </th>
                  <th className="border-b border-stone-200 p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold text-stone-900">Cursor Docs</span>
                      <span className="text-xs text-stone-500">Built-in</span>
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
                <tr className="bg-stone-100/50">
                  <td className="border-b border-stone-200 p-4 font-semibold text-stone-900">Free Tier</td>
                  <td className="border-b border-stone-200 p-4 text-center">
                    <span className="font-bold text-emerald-600">2,000 calls/mo</span>
                  </td>
                  <td className="border-b border-stone-200 p-4 text-center">
                    <span className="text-stone-500">Limited</span>
                  </td>
                  <td className="border-b border-stone-200 p-4 text-center">
                    <span className="text-stone-500">With IDE</span>
                  </td>
                </tr>
                <tr className="bg-emerald-50">
                  <td className="border-b border-stone-200 p-4 font-semibold text-stone-900">Pro Price</td>
                  <td className="border-b border-stone-200 p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold text-emerald-600">$5</span>
                      <span className="text-xs text-stone-500">/month</span>
                    </div>
                  </td>
                  <td className="border-b border-stone-200 p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-semibold text-stone-900">$10</span>
                      <span className="text-xs text-stone-500">/month</span>
                    </div>
                  </td>
                  <td className="border-b border-stone-200 p-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-semibold text-stone-900">$20</span>
                      <span className="text-xs text-stone-500">/month</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-stone-900">Memory Included</td>
                  <td className="p-4 text-center">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                      Always FREE
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-stone-500">-</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-stone-500">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-stone-600">
              Save <span className="font-semibold text-emerald-600">70%</span> compared to Context7. 
              Memory is always free on Nexus because we believe AI assistants should remember context.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-stone-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 py-16 sm:py-24">
        <div className="mx-auto max-w-[880px] px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              Ready to supercharge your AI coding?
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Join developers using Nexus for documentation, MCP servers, skills, and memory.
              Start free, upgrade when you need more.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://docs.nexus.yogan.dev/getting-started"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-8 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/ryanyogan/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-stone-300 px-8 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50"
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
      <div className="grid grid-cols-2 gap-6 rounded-lg border border-stone-200 bg-white p-6 sm:grid-cols-5">
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
      <div className="text-2xl font-bold text-stone-900">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-stone-500">{label}</div>
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
    analysis: "bg-blue-100 text-blue-700",
    generation: "bg-emerald-100 text-emerald-700",
    transformation: "bg-purple-100 text-purple-700",
    integration: "bg-orange-100 text-orange-700",
    utility: "bg-stone-200 text-stone-700",
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
          <div key={i} className="rounded-lg border border-stone-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Zap className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-stone-900">{skill.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[skill.type]}`}>
                    {skill.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-600 line-clamp-2">{skill.desc}</p>
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
          className="group rounded-lg border border-stone-200 bg-white p-5 transition-colors hover:border-emerald-300"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Zap className="h-5 w-5 text-purple-700" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-stone-900">{skill.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[skill.type] || typeColors.utility}`}>
                  {skill.type}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-600 line-clamp-2">{skill.description || ""}</p>
              {skill.installCount > 0 && (
                <p className="mt-2 text-xs text-stone-500">
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
        <div key={i} className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-stone-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
              <div className="h-3 w-full animate-pulse rounded bg-stone-200" />
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
      className="group flex items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 transition-colors hover:border-emerald-300"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
        {server.iconUrl ? (
          <img
            src={server.iconUrl}
            alt={server.name}
            className="h-6 w-6 object-contain"
          />
        ) : (
          <Database className="h-5 w-5 text-emerald-600" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-stone-900">{server.name}</h3>
          {server.isOfficial && (
            <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
              Official
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">
          {server.description}
        </p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100" />
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
    <div className="relative rounded-lg border border-stone-200 bg-white p-6">
      {isNew && (
        <div className="absolute -top-2 -right-2 rounded-full bg-purple-500 px-2 py-0.5 text-[10px] font-bold text-white">
          NEW
        </div>
      )}
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-600">{description}</p>
      {badge && (
        <div className="mt-3">
          <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
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
  const isExternal = ctaLink.startsWith("mailto:") || ctaLink.startsWith("http");
  
  return (
    <div className={`relative flex flex-col rounded-lg border p-6 ${
      highlighted ? "border-emerald-300 bg-emerald-50 shadow-lg" : "border-stone-200 bg-white"
    }`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-stone-900">{name}</h3>
        <p className="mt-1 text-sm text-stone-600">{description}</p>
      </div>
      
      <div className="mb-6">
        <span className="text-3xl font-bold text-stone-900">{price}</span>
        <span className="text-stone-600">{period}</span>
      </div>
      
      <ul className="mb-6 flex-1 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span className="text-sm text-stone-900">{feature}</span>
          </li>
        ))}
      </ul>
      
      {isExternal ? (
        <a
          href={ctaLink}
          className={`w-full rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${
            highlighted
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-stone-300 text-stone-700 hover:bg-stone-50"
          }`}
        >
          {cta}
        </a>
      ) : (
        <Link
          to={ctaLink}
          className={`w-full rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${
            highlighted
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-stone-300 text-stone-700 hover:bg-stone-50"
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
    <tr className="hover:bg-stone-50">
      <td className="border-b border-stone-200 p-4 text-stone-900">{feature}</td>
      <td className="border-b border-stone-200 p-4 text-center">
        <div className="flex flex-col items-center gap-1">
          {nexus ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <span className="text-stone-400">-</span>
          )}
          {nexusNote && <span className="text-xs text-stone-500">{nexusNote}</span>}
        </div>
      </td>
      <td className="border-b border-stone-200 p-4 text-center">
        <div className="flex flex-col items-center gap-1">
          {context7 ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <span className="text-stone-400">-</span>
          )}
          {context7Note && <span className="text-xs text-stone-500">{context7Note}</span>}
        </div>
      </td>
      <td className="border-b border-stone-200 p-4 text-center">
        <div className="flex flex-col items-center gap-1">
          {cursor ? (
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          ) : (
            <span className="text-stone-400">-</span>
          )}
          {cursorNote && <span className="text-xs text-stone-500">{cursorNote}</span>}
        </div>
      </td>
    </tr>
  );
}
