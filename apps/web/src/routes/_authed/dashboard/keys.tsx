import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Key, Plus, Trash2, Copy, Check, Loader2, AlertCircle, ArrowLeft, X } from "lucide-react";
import { authFetch } from "../../../lib/api";

export const Route = createFileRoute("/_authed/dashboard/keys")({
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
  const { session } = Route.useRouteContext();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

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
      const data = (await res.json()) as { tokens: ApiKey[] };
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

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="pt-8 pb-6 md:pt-12 md:pb-8">
          <Link
            to="/dashboard"
            className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                API Keys
              </h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
                Manage your API keys for Nexus access
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-foreground/90"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Create Key</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {/* New Key Display */}
        {newKeyValue && (
          <div className="mb-6 border border-accent bg-accent/5 p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-mono text-sm font-bold uppercase text-foreground">
                  API Key Created
                </h3>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Copy this key now. You won&apos;t be able to see it again.
                </p>
              </div>
              <button
                onClick={() => setNewKeyValue(null)}
                className="p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <code className="flex-1 border border-border bg-background px-3 py-2 font-mono text-xs sm:text-sm">
                {newKeyValue}
              </code>
              <button
                onClick={() => copyKey(newKeyValue, "new")}
                className="border border-border p-2 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                {copiedId === "new" ? (
                  <Check className="h-4 w-4 text-accent" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 border border-red-500/50 bg-red-500/5 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="font-mono text-xs text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Keys List */}
        {keys.length === 0 ? (
          <div className="border border-dashed border-border p-8 text-center sm:p-12">
            <Key className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-4 font-mono text-sm font-bold uppercase text-foreground">
              No API keys yet
            </h3>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Create your first API key to start using Nexus
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-foreground/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Your First Key
            </button>
          </div>
        ) : (
          <div className="border border-border">
            {keys.map((key, idx) => (
              <div
                key={key.id}
                className={`flex items-center justify-between p-4 sm:p-5 ${
                  idx !== keys.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 items-center justify-center border border-border">
                    <Key className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-mono text-sm font-bold text-foreground">{key.name}</h3>
                      {!key.isActive && (
                        <span className="border border-red-500/50 bg-red-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-red-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {key.tokenPrefix}••••••••
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] text-muted-foreground sm:gap-3 sm:text-xs">
                      <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                      {key.lastUsedAt && (
                        <>
                          <span className="text-border">|</span>
                          <span>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="p-2 text-muted-foreground transition-colors hover:text-red-500"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Usage Info */}
        <div className="mt-8 border-t border-border pt-6 md:mt-12 md:pt-8">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
            Using Your API Key
          </h2>
          <div className="mt-4 space-y-4 font-mono text-xs text-muted-foreground">
            <p>Include your API key in the Authorization header:</p>
            <code className="block border border-border bg-muted/30 p-3 text-foreground">
              Authorization: Bearer YOUR_API_KEY
            </code>
            <p>
              Or use the <span className="text-foreground">X-API-Key</span> header:
            </p>
            <code className="block border border-border bg-muted/30 p-3 text-foreground">
              X-API-Key: YOUR_API_KEY
            </code>
          </div>
        </div>
      </div>

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
          scopes: ["read:docs", "read:memories", "write:memories", "read:servers"],
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Failed to create API key");
      }

      const data = (await res.json()) as { token: string };
      onSuccess(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create API key");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md border border-border bg-background p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
            Create API Key
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          This key will have full access to your Nexus account
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label className="block font-mono text-xs font-bold uppercase text-foreground">
              Key Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My API Key"
              className="mt-2 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              required
            />
          </div>

          {error && (
            <div className="mt-4 border border-red-500/50 bg-red-500/5 p-3">
              <p className="font-mono text-xs text-red-500">{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-border px-4 py-2 font-mono text-xs font-bold uppercase text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
