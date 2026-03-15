import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  Save,
  X,
  BookOpen,
  Zap,
  Trash2,
  Play,
  Pause,
  Download,
} from "lucide-react";
import { authFetch } from "../../../lib/api";

export const Route = createFileRoute("/_authed/dashboard/flows/$flowId")({
  component: EditFlowPage,
});

interface FlowPreferences {
  verbosity?: "concise" | "balanced" | "detailed";
  codeStyle?: "minimal" | "documented" | "verbose";
  responseFormat?: "full" | "compact" | "code-only" | "summary";
  useEmojis?: boolean;
  preferredLanguage?: string;
}

interface Flow {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  description: string | null;
  systemPrompt: string;
  parentFlowId: string | null;
  skills: string[];
  libraries: string[];
  mcpServers: string[];
  preferences: FlowPreferences;
  category: string;
  tags: string[];
  isPublic: boolean;
  isStarterPack: boolean;
  isFeatured: boolean;
  isInstalled?: boolean;
  isActive?: boolean;
  isOwned?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ParentFlow {
  id: string;
  name: string;
  description: string | null;
  isStarterPack: boolean;
}

const CATEGORIES = [
  "frontend",
  "backend",
  "fullstack",
  "testing",
  "devops",
  "design",
  "api",
  "mobile",
  "ai",
  "general",
];

function EditFlowPage() {
  const { flowId } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [parentFlows, setParentFlows] = useState<ParentFlow[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newLibrary, setNewLibrary] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchFlow();
    fetchParentFlows();
  }, [flowId]);

  async function fetchFlow() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/api/flows/${flowId}`);
      if (!res.ok) throw new Error("Failed to fetch flow");
      const data = (await res.json()) as { flow: Flow };
      setFlow(data.flow);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch flow");
    } finally {
      setLoading(false);
    }
  }

  async function fetchParentFlows() {
    try {
      const res = await authFetch("/api/flows?starter=true");
      if (res.ok) {
        const data = (await res.json()) as { flows: ParentFlow[] };
        setParentFlows(data.flows.filter(f => f.id !== flowId) || []);
      }
    } catch (err) {
      console.error("Failed to fetch parent flows:", err);
    }
  }

  async function handleSave() {
    if (!flow) return;
    
    setSaving(true);
    setError(null);

    try {
      const res = await authFetch(`/api/flows/${flowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: flow.name,
          description: flow.description || undefined,
          systemPrompt: flow.systemPrompt,
          parentFlowId: flow.parentFlowId || undefined,
          category: flow.category,
          skills: flow.skills,
          libraries: flow.libraries,
          mcpServers: flow.mcpServers,
          preferences: flow.preferences,
          tags: flow.tags,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Failed to save flow");
      }

      // Refresh flow data
      await fetchFlow();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flow");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this flow? This cannot be undone.")) return;
    
    setActionLoading(true);
    try {
      const res = await authFetch(`/api/flows/${flowId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete flow");
      navigate({ to: "/dashboard/flows" as any });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete flow");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleActivate() {
    if (!flow) return;
    setActionLoading(true);
    try {
      if (!flow.isInstalled) {
        await authFetch(`/api/flows/${flowId}/install`, { method: "POST" });
      }
      await authFetch(`/api/flows/${flowId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchFlow();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate flow");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeactivate() {
    setActionLoading(true);
    try {
      await authFetch(`/api/flows/${flowId}/deactivate`, { method: "POST" });
      await fetchFlow();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate flow");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownload() {
    try {
      const res = await authFetch(`/api/flows/${flowId}/download`);
      if (!res.ok) throw new Error("Failed to download flow");
      const data = (await res.json()) as { filename: string; content: string };
      
      const blob = new Blob([data.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download flow");
    }
  }

  function updateFlow(updates: Partial<Flow>) {
    setFlow(prev => prev ? { ...prev, ...updates } : null);
  }

  function addTag() {
    if (!flow) return;
    const tag = newTag.trim().toLowerCase();
    if (tag && !flow.tags.includes(tag)) {
      updateFlow({ tags: [...flow.tags, tag] });
      setNewTag("");
    }
  }

  function removeTag(tag: string) {
    if (!flow) return;
    updateFlow({ tags: flow.tags.filter(t => t !== tag) });
  }

  function addLibrary() {
    if (!flow) return;
    const lib = newLibrary.trim().toLowerCase();
    if (lib && !flow.libraries.includes(lib)) {
      updateFlow({ libraries: [...flow.libraries, lib] });
      setNewLibrary("");
    }
  }

  function removeLibrary(lib: string) {
    if (!flow) return;
    updateFlow({ libraries: flow.libraries.filter(l => l !== lib) });
  }

  function addSkill() {
    if (!flow) return;
    const skill = newSkill.trim().toLowerCase();
    if (skill && !flow.skills.includes(skill)) {
      updateFlow({ skills: [...flow.skills, skill] });
      setNewSkill("");
    }
  }

  function removeSkill(skill: string) {
    if (!flow) return;
    updateFlow({ skills: flow.skills.filter(s => s !== skill) });
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0 py-12 text-center">
          <p className="font-mono text-sm text-muted-foreground">Flow not found</p>
          <Link
            to={"/dashboard/flows" as any}
            className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-accent hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Flows
          </Link>
        </div>
      </div>
    );
  }

  const isReadOnly = flow.isStarterPack || !flow.isOwned;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="pt-8 pb-6 md:pt-12 md:pb-8">
          <Link
            to={"/dashboard/flows" as any}
            className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Flows
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                  {flow.name}
                </h1>
                {flow.isStarterPack && (
                  <span className="border border-accent/50 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                    Starter
                  </span>
                )}
                {flow.isActive && (
                  <span className="border border-green-500/50 bg-green-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-green-500">
                    Active
                  </span>
                )}
              </div>
              {isReadOnly && (
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  View only - you cannot edit starter pack flows
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {actionLoading ? (
                <div className="flex h-9 w-9 items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : flow.isActive ? (
                <button
                  onClick={handleDeactivate}
                  className="flex h-9 w-9 items-center justify-center border border-accent text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                  title="Deactivate"
                >
                  <Pause className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleActivate}
                  className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  title="Activate"
                >
                  <Play className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleDownload}
                className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                title="Download FLOW.md"
              >
                <Download className="h-4 w-4" />
              </button>
              {!isReadOnly && (
                <button
                  onClick={handleDelete}
                  className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 border border-destructive bg-destructive/10 p-4">
            <p className="font-mono text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6 pb-12">
          {/* Basic Info */}
          <div className="border border-border bg-background p-4 sm:p-6">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              Basic Info
            </h2>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-muted-foreground">
                  Name
                </label>
                <input
                  type="text"
                  value={flow.name}
                  onChange={(e) => updateFlow({ name: e.target.value })}
                  disabled={isReadOnly}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-muted-foreground">
                  Description
                </label>
                <input
                  type="text"
                  value={flow.description || ""}
                  onChange={(e) => updateFlow({ description: e.target.value })}
                  disabled={isReadOnly}
                  className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-muted-foreground">
                    Category
                  </label>
                  <select
                    value={flow.category}
                    onChange={(e) => updateFlow({ category: e.target.value })}
                    disabled={isReadOnly}
                    className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-muted-foreground">
                    Extends From
                  </label>
                  <select
                    value={flow.parentFlowId || ""}
                    onChange={(e) => updateFlow({ parentFlowId: e.target.value || null })}
                    disabled={isReadOnly}
                    className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
                  >
                    <option value="">None (standalone)</option>
                    {parentFlows.map(pf => (
                      <option key={pf.id} value={pf.id}>
                        {pf.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="border border-border bg-background p-4 sm:p-6">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              System Prompt
            </h2>
            
            <textarea
              value={flow.systemPrompt}
              onChange={(e) => updateFlow({ systemPrompt: e.target.value })}
              disabled={isReadOnly}
              rows={16}
              className="mt-4 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
            />
          </div>

          {/* Resources */}
          <div className="border border-border bg-background p-4 sm:p-6">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              Resources
            </h2>
            
            <div className="mt-4 space-y-4">
              {/* Libraries */}
              <div>
                <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  Libraries
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {flow.libraries.map(lib => (
                    <span
                      key={lib}
                      className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-1 font-mono text-xs"
                    >
                      {lib}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeLibrary(lib)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {flow.libraries.length === 0 && (
                    <span className="font-mono text-xs text-muted-foreground">None</span>
                  )}
                </div>
                {!isReadOnly && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newLibrary}
                      onChange={(e) => setNewLibrary(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLibrary())}
                      placeholder="Add library"
                      className="flex-1 border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addLibrary}
                      className="border border-border px-3 py-1.5 font-mono text-xs font-bold uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  Skills
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {flow.skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-1 font-mono text-xs"
                    >
                      {skill}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {flow.skills.length === 0 && (
                    <span className="font-mono text-xs text-muted-foreground">None</span>
                  )}
                </div>
                {!isReadOnly && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add skill"
                      className="flex-1 border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="border border-border px-3 py-1.5 font-mono text-xs font-bold uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="font-mono text-xs font-bold uppercase text-muted-foreground">
                  Tags
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {flow.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-1 font-mono text-xs"
                    >
                      #{tag}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {flow.tags.length === 0 && (
                    <span className="font-mono text-xs text-muted-foreground">None</span>
                  )}
                </div>
                {!isReadOnly && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add tag"
                      className="flex-1 border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="border border-border px-3 py-1.5 font-mono text-xs font-bold uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {!isReadOnly && (
            <div className="flex items-center justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 border border-foreground bg-foreground px-6 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
