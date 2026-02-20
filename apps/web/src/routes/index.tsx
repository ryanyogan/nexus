import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
import { NeuralNetwork } from "../components/NeuralNetwork";
import { HolographicText } from "../components/HolographicText";
import { FloatingParticles } from "../components/FloatingParticles";

gsap.registerPlugin(ScrollTrigger);

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero animations
    const heroTl = gsap.timeline({ delay: 0.2 });
    
    heroTl
      .fromTo(
        ".hero-badge",
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      )
      .fromTo(
        ".hero-title",
        { opacity: 0, y: 30, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
        "-=0.3"
      )
      .fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo(
        ".hero-cta",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.2"
      )
      .fromTo(
        ".hero-code",
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" },
        "-=0.3"
      );

    // Feature cards scroll animation
    gsap.fromTo(
      ".feature-card",
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Section headers animation
    gsap.utils.toArray<HTMLElement>(".section-header").forEach((header) => {
      gsap.fromTo(
        header,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Step cards animation
    gsap.fromTo(
      ".step-card",
      { opacity: 0, x: -40 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // CTA section animation
    gsap.fromTo(
      ".cta-content",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Parallax effect for background elements
    gsap.to(".parallax-slow", {
      y: -100,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="relative flex flex-col overflow-hidden">
      {/* Global floating particles */}
      <FloatingParticles />

      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          )`,
        }}
      />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden py-20 sm:py-32">
        {/* Neural network background */}
        <div className="absolute inset-0 -z-10">
          <NeuralNetwork />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
          <div className="parallax-slow absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[128px]" />
          <div className="parallax-slow absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[128px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="hero-badge mb-8 flex items-center justify-center gap-3">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg"
                style={{
                  boxShadow: `
                    0 0 30px rgba(139, 92, 246, 0.4),
                    0 0 60px rgba(139, 92, 246, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `,
                }}
              >
                <Layers className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>

            {/* Title with holographic effect */}
            <h1 className="hero-title text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              <HolographicText as="span" delay={0.5}>
                One MCP Server to
              </HolographicText>{" "}
              <span
                className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent"
                style={{
                  animation: "gradient-shift 3s linear infinite",
                }}
              >
                Rule Them All
              </span>
            </h1>

            <p className="hero-subtitle mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Discover, compose, and invoke MCP servers from one unified
              endpoint. The universal registry for Model Context Protocol
              servers.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/explore"
                className="hero-cta group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-all duration-300"
                style={{
                  boxShadow: `
                    0 0 20px rgba(139, 92, 246, 0.3),
                    0 4px 15px rgba(139, 92, 246, 0.2)
                  `,
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Servers
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hero-cta inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card/50 px-8 text-base font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </div>

            {/* Code snippet preview */}
            <div className="hero-code mx-auto mt-16 max-w-2xl">
              <div
                className="rounded-xl border border-border bg-card/80 p-1 backdrop-blur-sm"
                style={{
                  boxShadow: `
                    0 0 60px rgba(139, 92, 246, 0.1),
                    0 25px 50px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05)
                  `,
                }}
              >
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    agent.ts
                  </span>
                </div>
                <pre className="overflow-x-auto p-4 text-left font-mono text-sm">
                  <code>
                    <span className="text-muted-foreground/60">{"// Just describe what you need"}</span>{"\n"}
                    <span className="text-accent">const</span>{" "}
                    <span className="text-foreground">tools</span>{" "}
                    <span className="text-accent">=</span>{" "}
                    <span className="text-accent">await</span>{" "}
                    <span className="text-foreground">nexus</span>
                    <span className="text-muted-foreground">.</span>
                    <span className="text-primary">search</span>
                    <span className="text-muted-foreground">(</span>
                    <span className="text-green-400">"read a PDF and summarize it"</span>
                    <span className="text-muted-foreground">)</span>{"\n\n"}
                    <span className="text-muted-foreground/60">{"// Returns: ["}</span>{"\n"}
                    <span className="text-muted-foreground/60">{"//   { server: 'pdf-tools', tool: 'extract_text', score: 0.94 },"}</span>{"\n"}
                    <span className="text-muted-foreground/60">{"//   { server: 'anthropic', tool: 'summarize', score: 0.91 },"}</span>{"\n"}
                    <span className="text-muted-foreground/60">{"//   { server: 'openai', tool: 'gpt4_completion', score: 0.87 },"}</span>{"\n"}
                    <span className="text-muted-foreground/60">{"// ]"}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-1">
            <div className="h-2 w-1 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative border-t border-border/50 bg-card/30 py-20 backdrop-blur-sm sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="section-header text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Why Nexus?
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Everything you need to discover, compose, and use MCP servers
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search className="h-6 w-6" />}
              title="Universal Registry"
              description="Browse and search all registered MCP servers with rich metadata, capability tags, and quality signals."
              color="purple"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Intelligent Routing"
              description="Just call the tool you need. Nexus figures out which server handles it and routes automatically."
              color="cyan"
            />
            <FeatureCard
              icon={<Puzzle className="h-6 w-6" />}
              title="Compose Stacks"
              description="Combine multiple MCP servers into one endpoint. Create your perfect dev stack."
              color="purple"
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6" />}
              title="Semantic Matching"
              description="Ask for 'read a PDF' and Nexus finds the right tool, even if it's named differently."
              color="cyan"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Auth Aggregation"
              description="Store credentials once. Nexus handles authentication to all your connected servers."
              color="purple"
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title="Edge Powered"
              description="Built on Cloudflare Workers for ultra-low latency responses worldwide."
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section ref={stepsRef} className="relative py-20 sm:py-32">
        {/* Background accent */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/10 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="section-header text-center">
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
      <section ref={ctaRef} className="relative border-t border-border/50 bg-gradient-to-b from-card/30 to-background py-20 sm:py-32">
        <div className="cta-content mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-all"
                style={{
                  boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Browse Registry
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                to="/docs"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card/50 px-8 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-card"
              >
                <Terminal className="h-5 w-5" />
                Read the Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
                style={{
                  boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)",
                }}
              >
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

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "purple" | "cyan";
}) {
  const colorClasses = {
    purple: {
      glow: "rgba(139, 92, 246, 0.3)",
      bg: "bg-primary/10",
      bgHover: "bg-primary",
      text: "text-primary",
    },
    cyan: {
      glow: "rgba(6, 182, 212, 0.3)",
      bg: "bg-accent/10",
      bgHover: "bg-accent",
      text: "text-accent",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className="feature-card group relative rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
      style={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) => {
        const card = e.currentTarget;
        card.style.boxShadow = `0 0 30px ${colors.glow}, 0 4px 20px rgba(0, 0, 0, 0.2)`;
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget;
        card.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
      }}
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${colors.bg} ${colors.text} transition-all duration-300 group-hover:${colors.bgHover} group-hover:text-white`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>

      {/* Corner accent */}
      <div
        className="absolute right-0 top-0 h-16 w-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 100% 0%, ${colors.glow} 0%, transparent 70%)`,
        }}
      />
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
    <div className="step-card relative rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30">
      <div
        className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
        style={{
          boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)",
        }}
      >
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>

      {/* Connection line to next step (hidden on last item and mobile) */}
      {number !== "3" && (
        <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 -translate-y-1/2 bg-gradient-to-r from-primary/50 to-transparent lg:block" />
      )}
    </div>
  );
}
