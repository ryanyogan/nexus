import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  ArrowLeft,
  BookOpen,
  Terminal,
  Layers,
  Sparkles,
  Zap,
  Shield,
  Code,
} from "lucide-react";
import { FloatingParticles } from "../components/FloatingParticles";

export const Route = createFileRoute("/docs")({ component: DocsPage });

function DocsPage() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Header animation
    gsap.fromTo(
      ".back-link",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    );

    gsap.fromTo(
      ".docs-header",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.1 }
    );

    // Sections animation
    gsap.fromTo(
      ".doc-section",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3,
      }
    );

    // TOC animation
    gsap.fromTo(
      ".toc-item",
      { opacity: 0, x: -10 },
      {
        opacity: 1,
        x: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.4,
      }
    );
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <FloatingParticles />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="back-link mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex gap-12">
          {/* Main Content */}
          <div className="flex-1">
            <div ref={headerRef} className="docs-header mb-12">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"
                  style={{
                    boxShadow: "0 0 25px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    Documentation
                  </h1>
                  <p className="mt-1 text-lg text-muted-foreground">
                    Learn how to use Nexus to connect to MCP servers
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <DocSection
                id="getting-started"
                icon={<Layers className="h-6 w-6" />}
                title="Getting Started"
                description="Connect your MCP client to Nexus in minutes"
              >
                <p className="mb-4 text-muted-foreground">
                  Nexus provides a single endpoint that gives you access to all
                  registered MCP servers. No need to configure multiple connections.
                </p>
                <CodeBlock>
                  {`// 1. Point your MCP client to Nexus
const client = new MCPClient("https://nexus.yogan.dev/mcp");

// 2. List available tools
const tools = await client.listTools();

// 3. Call any tool
const result = await client.call("nexus.github.create_pr", {
  title: "My PR",
  body: "Description"
});`}
                </CodeBlock>
              </DocSection>

              <DocSection
                id="namespacing"
                icon={<Terminal className="h-6 w-6" />}
                title="Tool Namespacing"
                description="Tools are namespaced by their source server"
              >
                <p className="mb-4 text-muted-foreground">
                  All tools in Nexus follow the pattern{" "}
                  <code className="rounded-md bg-primary/10 px-2 py-0.5 text-sm text-primary">
                    nexus.{"{server}"}.{"{tool}"}
                  </code>
                </p>
                <div className="space-y-3">
                  <ToolExample
                    tool="nexus.github.create_pr"
                    description="Create a GitHub pull request"
                  />
                  <ToolExample
                    tool="nexus.cloudflare.deploy_worker"
                    description="Deploy a Cloudflare Worker"
                  />
                  <ToolExample
                    tool="nexus.filesystem.read_file"
                    description="Read a local file"
                  />
                </div>
              </DocSection>

              <DocSection
                id="semantic-search"
                icon={<Sparkles className="h-6 w-6" />}
                title="Semantic Search"
                description="Don't know the exact tool name? Just describe what you need"
              >
                <p className="mb-4 text-muted-foreground">
                  Nexus uses AI-powered semantic search to match your intent to the
                  right tool. Just describe what you want and Nexus will find the
                  best match across all registered servers.
                </p>
                <CodeBlock>
                  {`// Describe what you need in natural language
const tools = await nexus.search("read a PDF and summarize it");

// Returns ranked matches:
// [
//   { server: 'pdf-tools', tool: 'extract_text', score: 0.94 },
//   { server: 'anthropic', tool: 'summarize', score: 0.91 },
// ]`}
                </CodeBlock>
              </DocSection>

              <DocSection
                id="compositions"
                icon={<Zap className="h-6 w-6" />}
                title="Compositions"
                description="Combine multiple servers into your perfect stack"
              >
                <p className="mb-4 text-muted-foreground">
                  Create custom compositions of MCP servers tailored to your workflow.
                  Only get the tools you need, nothing more.
                </p>
                <CodeBlock>
                  {`// Create a composition with specific servers
const myStack = await nexus.createComposition({
  name: "My Dev Stack",
  servers: ["github", "cloudflare", "postgresql"]
});

// Use your custom endpoint
const client = new MCPClient(myStack.endpoint);`}
                </CodeBlock>
              </DocSection>

              <DocSection
                id="authentication"
                icon={<Shield className="h-6 w-6" />}
                title="Authentication"
                description="Store credentials once, use everywhere"
              >
                <p className="mb-4 text-muted-foreground">
                  Nexus handles authentication to all your connected servers.
                  Store your API keys and tokens securely, and Nexus will use them
                  automatically when calling tools.
                </p>
                <CodeBlock>
                  {`// Connect your GitHub account
await nexus.connectOAuth("github");

// Your credentials are stored securely
// All GitHub API calls are now authenticated`}
                </CodeBlock>
              </DocSection>
            </div>
          </div>

          {/* Table of Contents */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-24">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                On this page
              </h3>
              <nav className="space-y-1">
                <TOCItem href="#getting-started" icon={<Layers className="h-3.5 w-3.5" />}>
                  Getting Started
                </TOCItem>
                <TOCItem href="#namespacing" icon={<Terminal className="h-3.5 w-3.5" />}>
                  Tool Namespacing
                </TOCItem>
                <TOCItem href="#semantic-search" icon={<Sparkles className="h-3.5 w-3.5" />}>
                  Semantic Search
                </TOCItem>
                <TOCItem href="#compositions" icon={<Zap className="h-3.5 w-3.5" />}>
                  Compositions
                </TOCItem>
                <TOCItem href="#authentication" icon={<Shield className="h-3.5 w-3.5" />}>
                  Authentication
                </TOCItem>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TOCItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="toc-item flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
    >
      <span className="text-primary/60">{icon}</span>
      {children}
    </a>
  );
}

function DocSection({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="doc-section scroll-mt-24 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
          style={{
            boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)",
          }}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="pl-13">{children}</div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div
      className="rounded-lg border border-border/50 bg-muted/30 p-4"
      style={{
        boxShadow: "inset 0 0 30px rgba(139, 92, 246, 0.05)",
      }}
    >
      <pre className="overflow-x-auto font-mono text-sm">
        <code>
          {children.split("\n").map((line, i) => (
            <div key={i}>
              {line.startsWith("//") ? (
                <span className="text-muted-foreground/60">{line}</span>
              ) : (
                <span className="text-foreground">{line}</span>
              )}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function ToolExample({
  tool,
  description,
}: {
  tool: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
      <Code className="h-4 w-4 text-primary/60" />
      <code className="text-sm text-primary">{tool}</code>
      <span className="text-sm text-muted-foreground">- {description}</span>
    </div>
  );
}
