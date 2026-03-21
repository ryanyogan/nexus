import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Key, Plus, Trash2, Copy, Check, Loader2, AlertCircle, X } from "lucide-react";
import { PageHeader, PageSkeleton } from "../../../components/layout";
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from "../../../hooks/use-dashboard-queries";

// ============================================================================
// Route Definition
// ============================================================================

export const Route = createFileRoute("/_authed/dashboard/keys")({
  pendingComponent: () => <PageSkeleton hasBack hasIcon hasActions rows={3} />,
  component: ApiKeysPage,
});

// ============================================================================
// Main Component
// ============================================================================

function ApiKeysPage() {
  const { data, isPending, error: queryError } = useApiKeys();
  const deleteKeyMutation = useDeleteApiKey();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);

  const keys = data?.tokens ?? [];
  const error = queryError?.message || (deleteKeyMutation.error?.message ?? null);

  async function copyKey(value: string, id: string) {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleDeleteKey(id: string) {
    if (!confirm("Are you sure you want to delete this API key?")) return;
    deleteKeyMutation.mutate(id);
  }

  if (isPending) {
    return <PageSkeleton hasBack hasIcon hasActions rows={3} />;
  }

  return (
    <div className="py-8 md:py-12">
      <PageHeader
        title="API Keys"
        description="Manage your API keys for Nexus access"
        icon={<Key className="h-5 w-5 md:h-6 md:w-6" />}
        backHref="/dashboard"
        backLabel="Dashboard"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-foreground/90"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create Key</span>
            <span className="sm:hidden">New</span>
          </button>
        }
      />

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
                onClick={() => handleDeleteKey(key.id)}
                disabled={deleteKeyMutation.isPending}
                className="p-2 text-muted-foreground transition-colors hover:text-red-500 disabled:opacity-50"
                title="Delete"
              >
                {deleteKeyMutation.isPending && deleteKeyMutation.variables === key.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
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

      {/* Create Key Modal */}
      {showCreateModal && (
        <CreateKeyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(token) => {
            setShowCreateModal(false);
            setNewKeyValue(token);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Create Key Modal
// ============================================================================

function CreateKeyModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (token: string) => void;
}) {
  const [name, setName] = useState("");
  const createKeyMutation = useCreateApiKey();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createKeyMutation.mutate(
      {
        name,
        scopes: ["read:docs", "read:memories", "write:memories", "read:servers"],
      },
      {
        onSuccess: (data) => {
          onSuccess(data.token);
        },
      }
    );
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

          {createKeyMutation.error && (
            <div className="mt-4 border border-red-500/50 bg-red-500/5 p-3">
              <p className="font-mono text-xs text-red-500">{createKeyMutation.error.message}</p>
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
              disabled={createKeyMutation.isPending || !name.trim()}
              className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-mono text-xs font-bold uppercase text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {createKeyMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
