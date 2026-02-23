import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useSession } from "@nexus/auth/client";
import { authFetch } from "../../lib/api";

export const Route = createFileRoute("/dashboard/keys")({
  component: ApiKeysPage,
});

interface ApiKey {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

function ApiKeysPage() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      window.location.href = "/sign-in";
    }
  }, [session, isPending]);

  useEffect(() => {
    if (session?.user) {
      fetchKeys();
    }
  }, [session]);

  async function fetchKeys() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/user/tokens");
      if (!res.ok) throw new Error("Failed to fetch API keys");
      const data = await res.json() as { tokens: ApiKey[] };
      setKeys(data.tokens || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  }

  async function copyKey(value: string, id: string) {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function deleteKey(id: string) {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    try {
      const res = await authFetch(`/api/user/tokens/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete API key");
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your API keys for MCP server access
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Key
          </button>
        </div>
      </div>

      {/* New Key Display */}
      {newKeyValue && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800/50 dark:bg-green-900/20">
          <h3 className="font-medium text-green-900 dark:text-green-100">
            API Key Created
          </h3>
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            Copy this key now. You won&apos;t be able to see it again.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded bg-green-100 px-3 py-2 font-mono text-sm dark:bg-green-900/50">
              {newKeyValue}
            </code>
            <button
              onClick={() => copyKey(newKeyValue, "new")}
              className="rounded-lg p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50"
            >
              {copiedId === "new" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
          </div>
          <button
            onClick={() => setNewKeyValue(null)}
            className="mt-3 text-sm text-green-600 hover:underline dark:text-green-400"
          >
            I&apos;ve copied the key
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Keys List */}
      {keys.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <Key className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No API keys yet</h3>
          <p className="mt-1 text-muted-foreground">
            Create your first API key to start using Nexus MCP
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Key
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <div
              key={key.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{key.name}</h3>
                      {!key.isActive && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-sm text-muted-foreground">
                      {key.tokenPrefix}...
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.lastUsedAt && (
                        <span>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                      )}
                      {key.expiresAt && (
                        <span>Expires {new Date(key.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Key Modal */}
      {showCreateModal && (
        <CreateKeyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(token) => {
            setShowCreateModal(false);
            setNewKeyValue(token);
            fetchKeys();
          }}
        />
      )}
    </div>
  );
}

function CreateKeyModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (token: string) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch("/api/user/tokens", {
        method: "POST",
        body: JSON.stringify({ 
          name, 
          scopes: ["read:docs", "read:memories", "write:memories", "read:servers"] 
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Failed to create API key");
      }

      const data = await res.json() as { token: string };
      onSuccess(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-foreground">Create API Key</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This key will have full access to your Nexus account
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Key Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My API Key"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
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
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              Create Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
