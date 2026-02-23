import { createFileRoute, Link } from "@tanstack/react-router";
import { DocsLayout } from "../../../components/docs/DocsLayout";
import { CodeBlock } from "../../../components/docs/CodeBlock";
import { Callout } from "../../../components/docs/Callout";
import { Lock, Shield, Key, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/docs/features/secrets")({
  component: SecretsDocs,
});

function SecretsDocs() {
  return (
    <DocsLayout
      title="Secrets Vault"
      description="Encrypted storage for your API keys"
    >
      {/* Hero */}
      <div className="mb-12 rounded-xl border border-border/50 bg-gradient-to-br from-green-500/10 via-transparent to-primary/10 p-8">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-6 w-6 text-green-600" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Secure by Design</span>
        </div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Your API Keys, Encrypted
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The Secrets Vault provides encrypted storage for your API keys and credentials.
          Use AES-256-GCM encryption to store OpenAI, Anthropic, and other provider keys
          securely in your Nexus account.
        </p>
      </div>

      {/* Security Features */}
      <section className="mb-12">
        <h2 id="security" className="mb-6 text-xl font-semibold text-foreground">
          Security Features
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="AES-256-GCM Encryption"
            description="Industry-standard encryption. Keys are encrypted before storage and never leave your account."
          />
          <FeatureCard
            icon={<Key className="h-5 w-5" />}
            title="Per-User Isolation"
            description="Each user has their own encryption key. Your secrets are never accessible to other users."
          />
          <FeatureCard
            icon={<RefreshCw className="h-5 w-5" />}
            title="Key Rotation"
            description="Rotate your secrets at any time. Old values are immediately invalidated."
          />
          <FeatureCard
            icon={<Lock className="h-5 w-5" />}
            title="Access Logging"
            description="Track when secrets are accessed. Know exactly who and when."
          />
        </div>
      </section>

      {/* Supported Providers */}
      <section className="mb-12">
        <h2 id="providers" className="mb-6 text-xl font-semibold text-foreground">
          Supported Providers
        </h2>

        <div className="grid gap-4 md:grid-cols-3">
          <ProviderCard name="OpenAI" prefix="sk-..." />
          <ProviderCard name="Anthropic" prefix="sk-ant-..." />
          <ProviderCard name="Google" prefix="AIza..." />
          <ProviderCard name="Azure" prefix="..." />
          <ProviderCard name="AWS" prefix="AKIA..." />
          <ProviderCard name="GitHub" prefix="ghp_..." />
          <ProviderCard name="Cloudflare" prefix="..." />
          <ProviderCard name="Custom" prefix="any" />
        </div>
      </section>

      {/* Using Secrets */}
      <section className="mb-12">
        <h2 id="usage" className="mb-6 text-xl font-semibold text-foreground">
          Managing Secrets
        </h2>

        <p className="mb-4 text-muted-foreground">
          Access your secrets vault from the settings page:
        </p>

        <ol className="mb-6 space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">1</span>
            <span>Go to <Link to="/settings/secrets" className="text-primary hover:underline">Settings &gt; Secrets</Link></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">2</span>
            <span>Click "Add Secret" and select a provider</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">3</span>
            <span>Enter your API key - it's encrypted immediately</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">4</span>
            <span>Use the secret in your MCP configurations</span>
          </li>
        </ol>

        <Callout type="warning" title="Security reminder">
          Never share your API keys. Nexus encrypts your secrets, but you should still
          rotate keys regularly and use separate keys for development and production.
        </Callout>
      </section>

      {/* API Access */}
      <section className="mb-12">
        <h2 id="api" className="mb-6 text-xl font-semibold text-foreground">
          API Access
        </h2>

        <p className="mb-4 text-muted-foreground">
          Manage secrets programmatically via the REST API (requires authentication):
        </p>

        <CodeBlock language="bash">
{`# List your secrets (values are hidden)
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.nexus.yogan.dev/api/secrets

# Add a new secret
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My OpenAI Key", "provider": "openai", "value": "sk-..."}' \\
  https://api.nexus.yogan.dev/api/secrets

# Retrieve a secret (decrypted)
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.nexus.yogan.dev/api/secrets/SECRET_ID?decrypt=true

# Rotate a secret
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"value": "sk-new-key..."}' \\
  https://api.nexus.yogan.dev/api/secrets/SECRET_ID/rotate`}
        </CodeBlock>
      </section>

      {/* Best Practices */}
      <section>
        <h2 id="best-practices" className="mb-6 text-xl font-semibold text-foreground">
          Best Practices
        </h2>

        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Use descriptive names: "OpenAI Production" vs "OpenAI Dev"
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Rotate keys every 90 days for security
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Use separate keys for different environments
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Review access logs periodically
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            Delete unused secrets promptly
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
        <div className="text-green-600">{icon}</div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ProviderCard({ name, prefix }: { name: string; prefix: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/50 p-4">
      <h3 className="font-semibold text-foreground">{name}</h3>
      <code className="text-xs text-muted-foreground">{prefix}</code>
    </div>
  );
}
