import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Server,
  Github,
  Package,
  Plug,
} from "lucide-react";
import { useSession } from "@/lib/auth";
import { API_URL } from "../lib/api";

export const Route = createFileRoute("/submit-server")({ component: SubmitServerPage });

// Package types and transport types
const PACKAGE_TYPES = [
  { id: "npm", label: "npm", description: "Node.js package (npx)" },
  { id: "pypi", label: "PyPI", description: "Python package (uvx/pipx)" },
  { id: "docker", label: "Docker", description: "Docker container" },
  { id: "binary", label: "Binary", description: "Standalone executable" },
  { id: "remote", label: "Remote", description: "HTTP/SSE endpoint" },
] as const;

const TRANSPORT_TYPES = [
  { id: "stdio", label: "stdio", description: "Standard input/output (most common)" },
  { id: "http", label: "HTTP", description: "HTTP/REST endpoint" },
  { id: "sse", label: "SSE", description: "Server-Sent Events" },
] as const;

function SubmitServerPage() {
  const { data: session, isPending: sessionPending } = useSession();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [packageName, setPackageName] = useState("");
  const [packageType, setPackageType] = useState<string>("npm");
  const [transportType, setTransportType] = useState<string>("stdio");

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (!sessionPending && !session?.user) {
      window.location.href = "/sign-in";
    }
  }, [session, sessionPending]);

  // Auto-generate name from repository URL
  useEffect(() => {
    if (repositoryUrl && !name) {
      const match = repositoryUrl.match(/github\.com\/[^\/]+\/([^\/]+)/);
      if (match) {
        setName(match[1].replace(/^server-|^mcp-server-|-mcp$|-server$/g, "").toLowerCase());
      }
    }
  }, [repositoryUrl, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !repositoryUrl.trim()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${API_URL}/api/server-submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          displayName: displayName.trim() || undefined,
          description: description.trim() || undefined,
          repositoryUrl: repositoryUrl.trim(),
          packageName: packageName.trim() || undefined,
          packageType,
          transportType,
          email: session?.user?.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string; error?: string };
        throw new Error(errorData.message || errorData.error || "Failed to submit server");
      }

      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit server");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitSuccess(false);
    setName("");
    setDisplayName("");
    setDescription("");
    setRepositoryUrl("");
    setPackageName("");
    setPackageType("npm");
    setTransportType("stdio");
    setSubmitError(null);
  };

  if (sessionPending) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (submitSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Server Submission Received!</h1>
          <p className="mb-6 text-muted-foreground">
            We'll review your MCP server submission and add it to the registry if it meets our criteria.
            You'll receive an email notification when it's processed.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/explore/servers"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse Servers
            </Link>
            <button
              onClick={resetForm}
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="rounded-xl border border-border bg-card p-8">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Server className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Submit an MCP Server</h1>
            <p className="text-muted-foreground">
              Request an MCP server to be added to the registry
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repository URL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Repository URL <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="url"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/owner/mcp-server-name"
                required
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              GitHub, GitLab, or npm package URL
            </p>
          </div>

          {/* Server Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Server ID <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="my-server"
              required
              className="h-11 w-full rounded-lg border border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="My Awesome Server"
              className="h-11 w-full rounded-lg border border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Human-readable name (optional)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this MCP server do?"
              rows={3}
              className="w-full rounded-lg border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Package Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Package Name
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="@scope/package-name or package-name"
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              npm package name, PyPI package, or Docker image
            </p>
          </div>

          {/* Package Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Package Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PACKAGE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPackageType(type.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    packageType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  <span className="block text-sm font-medium text-foreground">{type.label}</span>
                  <span className="block text-xs text-muted-foreground">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transport Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Transport Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TRANSPORT_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTransportType(type.id)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    transportType === type.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plug className={`h-4 w-4 ${transportType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium text-foreground">{type.label}</span>
                  </div>
                  <span className="mt-1 block text-xs text-muted-foreground">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !name.trim() || !repositoryUrl.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Submit for Review
          </button>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Submission Guidelines</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
            Server must be a valid MCP (Model Context Protocol) implementation
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
            Must have public documentation or README explaining usage
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
            Should be actively maintained (recent commits preferred)
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
            Open source or publicly available package
          </li>
        </ul>
      </div>
    </div>
  );
}
