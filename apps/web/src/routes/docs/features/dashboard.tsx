import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { Callout } from "../../../components/docs/Callout";
import { BarChart3, Key, Zap, CreditCard, Settings } from "lucide-react";

export const Route = createFileRoute("/docs/features/dashboard")({
  component: DashboardDocs,
});

function DashboardDocs() {
  return (
    <DocsLayout
      title="User Dashboard"
      description="Manage your Nexus account, API keys, and usage"
    >
      {/* Hero */}
      <div className="mb-12 rounded-xl border border-border/50 bg-gradient-to-br from-blue-500/10 via-transparent to-primary/10 p-8">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Your Account</span>
        </div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The user dashboard gives you a central place to manage your Nexus account.
          View usage stats, create API keys, manage installed skills, and upgrade your plan.
        </p>
      </div>

      {/* Dashboard Sections */}
      <section className="mb-12">
        <h2 id="sections" className="mb-6 text-xl font-semibold text-foreground">
          Dashboard Sections
        </h2>

        <div className="space-y-4">
          <SectionCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Usage Stats"
            description="Track your API calls, see usage trends, and monitor your quota."
            link="/dashboard"
          />
          <SectionCard
            icon={<Key className="h-5 w-5" />}
            title="API Keys"
            description="Create and manage API keys for MCP server access. Rotate keys and track usage."
            link="/dashboard/keys"
          />
          <SectionCard
            icon={<Zap className="h-5 w-5" />}
            title="Installed Skills"
            description="View and manage your installed AI skills. Uninstall or browse new ones."
            link="/dashboard/skills"
          />
          <SectionCard
            icon={<CreditCard className="h-5 w-5" />}
            title="Billing"
            description="View your current plan, upgrade to Pro, or manage your subscription."
            link="/dashboard/billing"
          />
        </div>
      </section>

      {/* Plans */}
      <section className="mb-12">
        <h2 id="plans" className="mb-6 text-xl font-semibold text-foreground">
          Plans & Pricing
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <PlanCard
            name="Free"
            price="$0"
            features={[
              "2,000 API calls/month",
              "1 API key",
              "5 memories",
              "All documentation",
              "All MCP servers",
            ]}
          />
          <PlanCard
            name="Pro"
            price="$5/mo"
            highlighted
            features={[
              "Unlimited API calls",
              "10 API keys",
              "Unlimited memories",
              "Usage analytics",
              "Email support",
            ]}
          />
          <PlanCard
            name="Team"
            price="$5/user/mo"
            features={[
              "Everything in Pro",
              "Shared memories",
              "Team API keys",
              "Admin dashboard",
              "Priority support",
            ]}
          />
        </div>

        <Callout type="info" title="Memory is always free">
          Unlike other platforms, Nexus keeps memory storage free for all users.
          We believe persistent context is essential for AI coding assistants.
        </Callout>
      </section>

      {/* API Keys */}
      <section className="mb-12">
        <h2 id="api-keys" className="mb-6 text-xl font-semibold text-foreground">
          API Keys
        </h2>

        <p className="mb-4 text-muted-foreground">
          API keys let you access Nexus from your own applications or MCP clients.
        </p>

        <ol className="mb-6 space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">1</span>
            <span>Go to <Link to="/dashboard/keys" className="text-primary hover:underline">Dashboard &gt; API Keys</Link></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">2</span>
            <span>Click "Create Key" and give it a name</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">3</span>
            <span>Copy the key immediately - it won't be shown again</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">4</span>
            <span>Use the key in your MCP configuration or API calls</span>
          </li>
        </ol>

        <Callout type="warning" title="Keep your keys secure">
          API keys provide full access to your account. Never commit them to git
          or share them publicly. Rotate keys if you suspect they've been compromised.
        </Callout>
      </section>

      {/* Getting Started */}
      <section>
        <h2 id="getting-started" className="mb-6 text-xl font-semibold text-foreground">
          Getting Started
        </h2>

        <p className="mb-4 text-muted-foreground">
          Ready to explore your dashboard?
        </p>

        <div className="flex gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Settings className="h-4 w-4" />
            Open Dashboard
          </Link>
          <Link
            to="/dashboard/billing"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            View Plans
          </Link>
        </div>
      </section>
    </DocsLayout>
  );
}

function SectionCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="flex items-start gap-4 rounded-lg border border-border/50 bg-card/50 p-4 transition-colors hover:border-primary/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function PlanCard({
  name,
  price,
  features,
  highlighted,
}: {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${highlighted ? "border-primary bg-primary/5" : "border-border/50 bg-card/50"}`}>
      {highlighted && (
        <span className="mb-2 inline-block rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          Popular
        </span>
      )}
      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
      <p className="mb-4 text-2xl font-bold text-foreground">{price}</p>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
