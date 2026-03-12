import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Server,
  Github,
  Copy,
  Check,
  Wrench,
  Star,
  Package,
  Globe,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { getDb } from "../../server/db";
import * as schema from "@nexus/db";
import { eq } from "drizzle-orm";
import { API_URL } from "../../lib/api";
import { logger } from "../../lib/server-fn";

// ============================================================================
// Server Functions
// ============================================================================

const getServerFn = createServerFn({ method: "GET" })
  .inputValidator((data: { serverId: string }) => data)
  .handler(async ({ data }) => {
    const startTime = Date.now();
    const fnName = "getServerFn";

    try {
      logger.debug(`${fnName} started`, { serverId: data.serverId });

      const db = getDb();
      const server = await db.query.mcpServers.findFirst({
        where: eq(schema.mcpServers.id, data.serverId),
      });

      if (!server) {
        throw new Error("Server not found");
      }

      const durationMs = Date.now() - startTime;
      logger.info(`${fnName} completed`, { durationMs, serverId: data.serverId });

      return { server };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`${fnName} failed`, { durationMs, serverId: data.serverId }, err);
      throw error;
    }
  });

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/explore/servers/$serverId")({
  loader: async ({ params }) => {
    return getServerFn({ data: { serverId: params.serverId } });
  },
  component: ServerDetailPage,
});

// ============================================================================
// Main Component
// ============================================================================

function ServerDetailPage() {
  const { server } = Route.useLoaderData();
  const displayName = server.displayName || server.name;
  const category = server.categories?.[0];
  
  const [configFormat, setConfigFormat] = useState<"opencode" | "claude-desktop" | "vscode">("opencode");
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Fetch config when format changes
  useEffect(() => {
    const fetchConfig = async () => {
      setConfigLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/servers/${server.id}/config?format=${configFormat}`
        );
        if (res.ok) {
          const data = (await res.json()) as { config: Record<string, unknown> };
          setConfig(data.config);
        }
      } catch (error) {
        console.error("Failed to fetch config:", error);
      } finally {
        setConfigLoading(false);
      }
    };
    fetchConfig();
  }, [server.id, configFormat]);

  const copyConfig = async () => {
    if (!config) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy config:", error);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            to="/explore/servers"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to servers
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {/* Icon */}
              {server.iconUrl ? (
                <img
                  src={server.iconUrl}
                  alt={displayName}
                  className="h-16 w-16 rounded-xl bg-muted object-contain p-2"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                  <Server className="h-8 w-8 text-primary" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">
                    {displayName}
                  </h1>
                  {server.isOfficial && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Official
                    </span>
                  )}
                  {server.isFeatured && !server.isOfficial && (
                    <Star className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">
                  {server.description}
                </p>

                {/* Meta info */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  {category && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-muted-foreground capitalize">
                      {category}
                    </span>
                  )}
                  {server.packageName && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      {server.packageName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-2">
              {server.repositoryUrl && (
                <a
                  href={server.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              )}
              {server.packageName && (
                <a
                  href={`https://npmjs.com/package/${server.packageName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Globe className="h-4 w-4" />
                  npm
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Installation Config */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Wrench className="h-5 w-5" />
                Installation
              </h2>

              {/* Format selector */}
              <div className="mb-4 flex gap-2">
                <FormatButton
                  label="OpenCode"
                  recommended
                  active={configFormat === "opencode"}
                  onClick={() => setConfigFormat("opencode")}
                />
                <FormatButton
                  label="Claude Desktop"
                  active={configFormat === "claude-desktop"}
                  onClick={() => setConfigFormat("claude-desktop")}
                />
                <FormatButton
                  label="VS Code"
                  active={configFormat === "vscode"}
                  onClick={() => setConfigFormat("vscode")}
                />
              </div>

              {/* Config preview */}
              {configLoading ? (
                <div className="h-32 animate-pulse rounded-lg bg-muted" />
              ) : (
                <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                  <code className="text-muted-foreground">
                    {config ? JSON.stringify(config, null, 2) : "Failed to load config"}
                  </code>
                </pre>
              )}

              {/* Copy button */}
              <button
                onClick={copyConfig}
                disabled={!config || configLoading}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Configuration
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick info */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Quick Info
              </h3>
              <dl className="space-y-3 text-sm">
                {server.installCommand && (
                  <div>
                    <dt className="text-muted-foreground">Install Command</dt>
                    <dd className="mt-1 font-mono text-foreground">
                      {server.installCommand}
                    </dd>
                  </div>
                )}
                {category && (
                  <div>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="mt-1 capitalize text-foreground">
                      {category}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Security */}
            <SecurityCard server={server} />

            {/* Need help? */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Need help?
              </h3>
              <p className="text-sm text-muted-foreground">
                Ask your AI assistant to set up this MCP server:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                <code className="text-muted-foreground">
                  "Help me install the {displayName} MCP server"
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Format Button Component
// ============================================================================

function FormatButton({
  label,
  recommended,
  active,
  onClick,
}: {
  label: string;
  recommended?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      {recommended && (
        <span className="ml-1 rounded bg-green-500/20 px-1 py-0.5 text-[10px] font-semibold text-green-600 dark:text-green-400">
          Recommended
        </span>
      )}
    </button>
  );
}

// ============================================================================
// Security Card Component
// ============================================================================

type RiskLevel = "low" | "medium" | "high" | "critical";

const securityConfig: Record<
  RiskLevel,
  { icon: LucideIcon; color: string; bg: string; border: string; label: string; description: string }
> = {
  low: {
    icon: ShieldCheck,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "Low Risk",
    description: "Read-only or sandboxed access. Minimal security concerns.",
  },
  medium: {
    icon: Shield,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    label: "Medium Risk",
    description: "Can write to specific locations or make network requests.",
  },
  high: {
    icon: ShieldAlert,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    label: "High Risk",
    description: "Has significant system access. Review permissions carefully.",
  },
  critical: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "Critical",
    description: "Full system access. Use only if you trust the source.",
  },
};

function SecurityCard({ server }: { server: { 
  securityRiskLevel?: string | null;
  securityCapabilities?: string[] | null;
  securityNotes?: string | null;
  isSecurityAudited?: boolean | null;
}}) {
  const riskLevel = (server.securityRiskLevel || "medium") as RiskLevel;
  const security = securityConfig[riskLevel];
  const SecurityIcon = security.icon;
  const capabilities = server.securityCapabilities || [];

  return (
    <div className={`rounded-lg border ${security.border} ${security.bg} p-6`}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
        <SecurityIcon className={`h-5 w-5 ${security.color}`} />
        Security Profile
      </h3>

      {/* Risk Level Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${security.bg} ${security.color}`}
        >
          <SecurityIcon className="h-4 w-4" />
          {security.label}
        </span>
        {server.isSecurityAudited && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
            <CheckCircle className="h-3 w-3" />
            Audited
          </span>
        )}
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {security.description}
      </p>

      {/* Capabilities */}
      {capabilities.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Access Capabilities
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {capabilities.map((cap) => (
              <span
                key={cap}
                className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Security Notes */}
      {server.securityNotes && (
        <p className="text-xs text-muted-foreground italic">
          {server.securityNotes}
        </p>
      )}
    </div>
  );
}
