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
  ExternalLink,
  Terminal,
  Zap,
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
  const [copiedInstall, setCopiedInstall] = useState(false);
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

  const copyInstallCommand = async () => {
    if (!server.installCommand) return;
    try {
      await navigator.clipboard.writeText(server.installCommand);
      setCopiedInstall(true);
      setTimeout(() => setCopiedInstall(false), 2000);
    } catch (error) {
      console.error("Failed to copy install command:", error);
    }
  };

  const riskLevel = (server.securityRiskLevel || "medium") as RiskLevel;
  const security = securityConfig[riskLevel];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Back link */}
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-8 border-b border-border pb-8">
          <div className="flex items-start gap-4">
            {/* Icon */}
            {server.iconUrl ? (
              <img
                src={server.iconUrl}
                alt={displayName}
                className="h-16 w-16 border border-border bg-muted object-contain p-2"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center border border-border bg-muted">
                <Server className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-mono text-2xl font-bold uppercase tracking-tight text-foreground">
                  {displayName}
                </h1>
                {server.isOfficial && (
                  <span className="inline-flex items-center gap-1 border border-accent bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                    <CheckCircle className="h-3 w-3" />
                    Official
                  </span>
                )}
                {server.isFeatured && !server.isOfficial && (
                  <span className="inline-flex items-center gap-1 border border-yellow-500 bg-yellow-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-yellow-500">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                )}
              </div>
              
              {server.description && (
                <p className="mt-2 font-mono text-sm text-muted-foreground">
                  {server.description}
                </p>
              )}

              {/* Meta */}
              <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs">
                {category && (
                  <span className="uppercase text-muted-foreground">{category}</span>
                )}
                {server.packageName && (
                  <>
                    <span className="text-border">|</span>
                    <span className="text-muted-foreground">{server.packageName}</span>
                  </>
                )}
                <span className="text-border">|</span>
                <span className={security.color}>{security.label}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-2">
            {server.repositoryUrl && (
              <a
                href={server.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:bg-muted"
              >
                <Github className="h-3.5 w-3.5" />
                Source
              </a>
            )}
            {server.packageName && (
              <a
                href={`https://npmjs.com/package/${server.packageName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border bg-background px-4 py-2 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:bg-muted"
              >
                <Globe className="h-3.5 w-3.5" />
                npm
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-6 font-mono text-xs">
          {server.hasTools && (
            <div className="flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-bold text-foreground">{server.tools?.length || 0}</span>
              <span className="uppercase text-muted-foreground">tools</span>
            </div>
          )}
          {server.hasResources && (
            <div className="flex items-center gap-2">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-bold text-foreground">{server.resources?.length || 0}</span>
              <span className="uppercase text-muted-foreground">resources</span>
            </div>
          )}
          {server.isSecurityAudited && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              <span className="uppercase text-muted-foreground">Audited</span>
            </div>
          )}
          {server.version && (
            <div className="flex items-center gap-2">
              <span className="uppercase text-muted-foreground">v{server.version}</span>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Quick Install */}
            {server.installCommand && (
              <div className="border border-border p-6">
                <h2 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase text-foreground">
                  <Terminal className="h-4 w-4 text-accent" />
                  Quick Install
                </h2>
                <div className="relative">
                  <pre className="overflow-x-auto border border-border bg-muted p-4 pr-12 font-mono text-xs">
                    <code className="text-foreground">{server.installCommand}</code>
                  </pre>
                  <button
                    onClick={copyInstallCommand}
                    className="absolute right-2 top-2 border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copiedInstall ? (
                      <Check className="h-3.5 w-3.5 text-accent" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Configuration */}
            <div className="border border-border p-6">
              <h2 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase text-foreground">
                <Wrench className="h-4 w-4 text-accent" />
                MCP Configuration
              </h2>

              {/* Format selector */}
              <div className="mb-4 flex flex-wrap gap-2">
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
              <div className="relative">
                {configLoading ? (
                  <div className="h-40 animate-pulse border border-border bg-muted" />
                ) : (
                  <pre className="max-h-80 overflow-auto border border-border bg-muted p-4 pr-12 font-mono text-xs">
                    <code className="text-foreground">
                      {config ? JSON.stringify(config, null, 2) : "Failed to load config"}
                    </code>
                  </pre>
                )}
                <button
                  onClick={copyConfig}
                  disabled={!config || configLoading}
                  className="absolute right-2 top-2 border border-border bg-background p-2 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-accent" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Copy button */}
              <button
                onClick={copyConfig}
                disabled={!config || configLoading}
                className="mt-4 inline-flex items-center gap-2 border border-accent bg-accent px-4 py-2 font-mono text-xs font-bold uppercase text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Config
                  </>
                )}
              </button>
            </div>

            {/* Security Profile */}
            <SecurityCard server={server} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ask AI card */}
            <div className="border border-accent bg-accent/5 p-6">
              <h3 className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase text-foreground">
                <Zap className="h-3.5 w-3.5 text-accent" />
                Quick Setup
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                Ask your AI assistant to set up this server:
              </p>
              <pre className="mt-3 overflow-x-auto border border-border bg-background p-3 font-mono text-[10px]">
                <code className="text-foreground">
                  "Install the {displayName} MCP server"
                </code>
              </pre>
            </div>

            {/* Quick info */}
            <div className="border border-border p-6">
              <h3 className="mb-4 font-mono text-xs font-bold uppercase text-foreground">
                Details
              </h3>
              <dl className="space-y-3 font-mono text-xs">
                {category && (
                  <div className="flex items-center justify-between">
                    <dt className="uppercase text-muted-foreground">Category</dt>
                    <dd className="font-bold uppercase text-foreground">
                      {category}
                    </dd>
                  </div>
                )}
                {server.version && (
                  <div className="flex items-center justify-between">
                    <dt className="uppercase text-muted-foreground">Version</dt>
                    <dd className="text-foreground">
                      {server.version}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="uppercase text-muted-foreground">Risk</dt>
                  <dd className={`font-bold uppercase ${security.color}`}>
                    {security.label}
                  </dd>
                </div>
                {server.isSecurityAudited && (
                  <div className="flex items-center justify-between">
                    <dt className="uppercase text-muted-foreground">Audited</dt>
                    <dd className="flex items-center gap-1 text-accent">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Yes
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Capabilities */}
            {server.securityCapabilities && server.securityCapabilities.length > 0 && (
              <div className="border border-border p-6">
                <h3 className="mb-4 font-mono text-xs font-bold uppercase text-foreground">
                  Capabilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {server.securityCapabilities.map((cap) => (
                    <span
                      key={cap}
                      className="border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
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
      className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors ${
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
      }`}
    >
      {label}
      {recommended && !active && (
        <span className="text-[8px] text-accent">*</span>
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
  { icon: LucideIcon; color: string; border: string; label: string; description: string }
> = {
  low: {
    icon: ShieldCheck,
    color: "text-green-500",
    border: "border-green-500/30",
    label: "Low Risk",
    description: "Read-only or sandboxed access. Minimal security concerns.",
  },
  medium: {
    icon: Shield,
    color: "text-yellow-500",
    border: "border-yellow-500/30",
    label: "Medium Risk",
    description: "Can write to specific locations or make network requests.",
  },
  high: {
    icon: ShieldAlert,
    color: "text-orange-500",
    border: "border-orange-500/30",
    label: "High Risk",
    description: "Has significant system access. Review permissions carefully.",
  },
  critical: {
    icon: AlertTriangle,
    color: "text-red-500",
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

  return (
    <div className={`border ${security.border} p-6`}>
      <h3 className="mb-4 flex items-center gap-2 font-mono text-sm font-bold uppercase text-foreground">
        <SecurityIcon className={`h-4 w-4 ${security.color}`} />
        Security Profile
      </h3>

      {/* Risk Level Badge */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 border px-3 py-1 font-mono text-xs font-bold uppercase ${security.border} ${security.color}`}
        >
          <SecurityIcon className="h-3.5 w-3.5" />
          {security.label}
        </span>
        {server.isSecurityAudited && (
          <span className="inline-flex items-center gap-1 border border-accent px-2 py-1 font-mono text-[10px] font-bold uppercase text-accent">
            <CheckCircle className="h-3 w-3" />
            Audited
          </span>
        )}
      </div>

      <p className="font-mono text-xs text-muted-foreground">
        {security.description}
      </p>

      {/* Security Notes */}
      {server.securityNotes && (
        <p className="mt-4 border-l-2 border-border pl-3 font-mono text-xs italic text-muted-foreground">
          {server.securityNotes}
        </p>
      )}
    </div>
  );
}
