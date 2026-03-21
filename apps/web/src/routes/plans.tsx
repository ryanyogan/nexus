import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X, ArrowRight, Search, Brain, Server, Zap, Sparkles, Layers } from "lucide-react";

export const Route = createFileRoute("/plans")({
  component: PlansPage,
});

// ============================================================================
// Plan Data
// ============================================================================

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with Nexus",
    features: [
      { text: "2,000 API calls/month", included: true },
      { text: "1 API key", included: true },
      { text: "Documentation search", included: true },
      { text: "MCP server discovery", included: true },
      { text: "3 Stacks", included: true },
      { text: "Community support", included: true },
      { text: "Persistent memory", included: false },
      { text: "Private repositories", included: false },
      { text: "Stack marketplace publishing", included: false },
    ],
    cta: "Get Started",
    ctaLink: "/sign-in",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$5",
    period: "/month",
    description: "For power users and teams",
    features: [
      { text: "Unlimited API calls", included: true },
      { text: "10 API keys", included: true },
      { text: "Documentation search", included: true },
      { text: "MCP server discovery", included: true },
      { text: "Unlimited Stacks", included: true },
      { text: "Priority support", included: true },
      { text: "Unlimited persistent memory", included: true },
      { text: "Private repositories", included: true },
      { text: "Stack marketplace publishing", included: true },
    ],
    cta: "Upgrade to Pro",
    ctaLink: "/dashboard/billing",
    highlighted: true,
  },
];

const features = [
  {
    id: "01",
    title: "Documentation Search",
    description:
      "Semantic search across 500+ indexed libraries. Get accurate, up-to-date code examples without hallucinations.",
    icon: Search,
    pro: false,
  },
  {
    id: "02",
    title: "Persistent Memory",
    description:
      "Your AI remembers your projects across sessions. Store decisions, conventions, and learnings permanently.",
    icon: Brain,
    pro: true,
  },
  {
    id: "03",
    title: "MCP Server Registry",
    description:
      "Discover and configure MCP servers for databases, APIs, and cloud services with copy-paste configs.",
    icon: Server,
    pro: false,
  },
  {
    id: "04",
    title: "Stacks",
    description:
      "AI-powered project scaffolding. Compose stack instructions, CLI preferences, and repo knowledge into token-efficient prompts.",
    icon: Layers,
    pro: false,
  },
  {
    id: "05",
    title: "Token Efficiency",
    description:
      "Semantic search returns only relevant chunks. Save 90%+ on context tokens compared to full docs.",
    icon: Zap,
    pro: false,
  },
];

// ============================================================================
// Component
// ============================================================================

function PlansPage() {
  const { session } = Route.useRouteContext();
  const isSignedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Hero */}
        <div className="pt-24 pb-16">
          <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
            Choose your plan
          </h1>
          <p className="mt-6 font-mono text-sm text-muted-foreground">
            Start free, upgrade when you need more power.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-px bg-border border border-border md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-background p-8 ${plan.highlighted ? "relative" : ""}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-px left-8 right-8 h-px bg-accent" />
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-mono text-sm font-bold uppercase tracking-wider">
                    {plan.name}
                  </h2>
                  {plan.highlighted && (
                    <span className="flex items-center gap-1 border border-accent bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                      <Sparkles className="h-3 w-3" />
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="font-mono text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-3 font-mono text-xs text-muted-foreground">{plan.description}</p>
              </div>

              {/* Features List */}
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={`flex items-center gap-3 font-mono text-xs ${
                      feature.included ? "text-foreground" : "text-muted-foreground/50"
                    }`}
                  >
                    {feature.included ? (
                      <Check className="h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <X className="h-4 w-4 shrink-0" />
                    )}
                    {feature.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.id === "free" && isSignedIn ? (
                <div className="flex h-11 items-center justify-center border border-border bg-muted/30 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Plan
                </div>
              ) : (
                <Link
                  to={plan.ctaLink}
                  className={`flex h-11 items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                    plan.highlighted
                      ? "bg-accent text-background hover:bg-accent/90"
                      : "border border-foreground bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="mt-24 mb-8">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground mb-2">
            What's Included
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            Everything you need to supercharge your AI coding workflow
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px bg-border border border-border md:grid-cols-2 mb-24">
          {features.map((feature) => (
            <div key={feature.id} className="bg-background p-6 transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[10px] font-bold text-muted-foreground">
                  {feature.id}
                </span>
                {feature.pro && (
                  <span className="border border-accent bg-accent px-1.5 py-0.5 font-mono text-[10px] font-bold text-background">
                    PRO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <feature.icon className="h-4 w-4 text-foreground" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                  {feature.title}
                </h3>
              </div>
              <p className="font-mono text-xs leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* FAQ / Contact Section */}
        <div className="border-t border-border py-16 text-center">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground mb-4">
            Questions?
          </h2>
          <p className="font-mono text-xs text-muted-foreground mb-6">
            Need a custom plan for your team? Have questions about features?
          </p>
          <a
            href="mailto:hello@nexus.yogan.dev"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-accent hover:underline"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
