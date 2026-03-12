import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Shield,
  AlertCircle,
} from "lucide-react";
import { authFetch, SECRET_PROVIDERS, type SecretProvider } from "../../../lib/api";

export const Route = createFileRoute("/_authed/settings/secrets")({
  component: SecretsPage,
});

interface UserSecret {
  id: string;
  name: string;
  provider: SecretProvider;
  description?: string;
  keyPrefix?: string;
  lastUsedAt?: string;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
}

const PROVIDER_LABELS: Record<SecretProvider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google AI",
  azure: "Azure",
  aws: "AWS",
  github: "GitHub",
  cloudflare: "Cloudflare",
  custom: "Custom",
};

const PROVIDER_COLORS: Record<SecretProvider, string> = {
  openai: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  anthropic: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  google: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  azure: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  aws: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  github: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  cloudflare: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  custom: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

function SecretsPage() {
  const { session } = Route.useRouteContext();
  const [secrets, setSecrets] = useState<UserSecret[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch secrets
  useEffect(() => {
    if (session?.user) {
      fetchSecrets();
    }
  }, [session]);

  async function fetchSecrets() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/secrets");
      if (!res.ok) throw new Error("Failed to fetch secrets");
      const data = await res.json() as { secrets: UserSecret[] };
      setSecrets(data.secrets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch secrets");
    } finally {
      setLoading(false);
    }
  }

  async function revealSecret(id: string) {
    try {
      const res = await authFetch(`/api/secrets/${id}?decrypt=true`);
      if (!res.ok) throw new Error("Failed to reveal secret");
      const data = await res.json() as { secret: { value: string } };
      setRevealedSecrets((prev) => ({ ...prev, [id]: data.secret.value }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reveal secret");
    }
  }

  function hideSecret(id: string) {
    setRevealedSecrets((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }

  async function copySecret(id: string) {
    const value = revealedSecrets[id];
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  async function deleteSecret(id: string) {
    if (!confirm("Are you sure you want to delete this secret?")) return;
    try {
      const res = await authFetch(`/api/secrets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete secret");
      setSecrets((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete secret");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Key Vault</h1>
          <p className="mt-1 text-muted-foreground">
            Securely store your API keys for use with MCP servers
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Secret
        </button>
      </div>

      {/* Security Notice */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-900/20">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              End-to-End Encryption
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Your secrets are encrypted with AES-256-GCM before storage. Only you can decrypt them.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Secrets List */}
      {secrets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Key className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No secrets yet</h3>
          <p className="mt-1 text-muted-foreground">
            Add your first API key to get started
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Secret
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {secrets.map((secret) => (
            <div
              key={secret.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{secret.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${PROVIDER_COLORS[secret.provider]}`}
                      >
                        {PROVIDER_LABELS[secret.provider]}
                      </span>
                      {!secret.isActive && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Inactive
                        </span>
                      )}
                    </div>
                    {secret.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {secret.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-mono">{secret.keyPrefix}</span>
                      <span>Used {secret.usageCount} times</span>
                      {secret.lastUsedAt && (
                        <span>
                          Last used {new Date(secret.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {revealedSecrets[secret.id] ? (
                    <>
                      <button
                        onClick={() => copySecret(secret.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Copy"
                      >
                        {copiedId === secret.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => hideSecret(secret.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Hide"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => revealSecret(secret.id)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Reveal"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteSecret(secret.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {revealedSecrets[secret.id] && (
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <code className="break-all text-sm text-foreground">
                    {revealedSecrets[secret.id]}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Secret Modal */}
      {showAddModal && (
        <AddSecretModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchSecrets();
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Add Secret Modal
// ============================================================================

function AddSecretModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<SecretProvider>("openai");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch("/api/secrets", {
        method: "POST",
        body: JSON.stringify({ name, provider, value, description }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Failed to add secret");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add secret");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-foreground">Add New Secret</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your secret will be encrypted before storage
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My OpenAI Key"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as SecretProvider)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {SECRET_PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              API Key / Secret
            </label>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="sk-..."
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Used for personal projects"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800/50 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
              Add Secret
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
