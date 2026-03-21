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

export const Route = createFileRoute("/_authed/dashboard/prompts/$promptId")({
  component: EditPromptPage,
});

interface PromptPreferences {
  verbosity?: "concise" | "balanced" | "detailed";
  codeStyle?: "minimal" | "documented" | "verbose";
  responseFormat?: "full" | "compact" | "code-only" | "summary";
  useEmojis?: boolean;
  preferredLanguage?: string;
}

interface Prompt {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  description: string | null;
  systemPrompt: string;
  parentPromptId: string | null;
  skills: string[];
  libraries: string[];
  mcpServers: string[];
  preferences: PromptPreferences;
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

interface ParentPrompt {
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

function EditPromptPage() {
  const { promptId } = Route.useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [parentPrompts, setParentPrompts] = useState<ParentPrompt[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newLibrary, setNewLibrary] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPrompt();
    fetchParentPrompts();
  }, [promptId]);

  async function fetchPrompt() {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/api/prompts/${promptId}`);
      if (!res.ok) throw new Error("Failed to fetch prompt");
      const data = (await res.json()) as { prompt: Prompt };
      setPrompt(data.prompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prompt");
    } finally {
      setLoading(false);
    }
  }

  async function fetchParentPrompts() {
    try {
      const res = await authFetch("/api/prompts?starter=true");
      if (res.ok) {
        const data = (await res.json()) as { prompts: ParentPrompt[] };
        setParentPrompts(data.prompts.filter((p) => p.id !== promptId) || []);
      }
    } catch (err) {
      console.error("Failed to fetch parent prompts:", err);
    }
  }

  async function handleSave() {
    if (!prompt) return;

    setSaving(true);
    setError(null);

    try {
      const res = await authFetch(`/api/prompts/${promptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: prompt.name,
          description: prompt.description || undefined,
          systemPrompt: prompt.systemPrompt,
          parentPromptId: prompt.parentPromptId || undefined,
          category: prompt.category,
          skills: prompt.skills,
          libraries: prompt.libraries,
          mcpServers: prompt.mcpServers,
          preferences: prompt.preferences,
          tags: prompt.tags,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Failed to save prompt");
      }

      // Refresh prompt data
      await fetchPrompt();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prompt");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this prompt? This cannot be undone.")) return;

    setActionLoading(true);
    try {
      const res = await authFetch(`/api/prompts/${promptId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete prompt");
      navigate({ to: "/dashboard/prompts" as any });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete prompt");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleActivate() {
    if (!prompt) return;
    setActionLoading(true);
    try {
      if (!prompt.isInstalled) {
        await authFetch(`/api/prompts/${promptId}/install`, { method: "POST" });
      }
      await authFetch(`/api/prompts/${promptId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchPrompt();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate prompt");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeactivate() {
    setActionLoading(true);
    try {
      await authFetch(`/api/prompts/${promptId}/deactivate`, { method: "POST" });
      await fetchPrompt();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate prompt");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownload() {
    try {
      const res = await authFetch(`/api/prompts/${promptId}/download`);
      if (!res.ok) throw new Error("Failed to download prompt");
      const data = (await res.json()) as { filename: string; content: string };

      const blob = new Blob([data.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download prompt");
    }
  }

  function updatePrompt(updates: Partial<Prompt>) {
    setPrompt((prev) => (prev ? { ...prev, ...updates } : null));
  }

  function addTag() {
    if (!prompt) return;
    const tag = newTag.trim().toLowerCase();
    if (tag && !prompt.tags.includes(tag)) {
      updatePrompt({ tags: [...prompt.tags, tag] });
      setNewTag("");
    }
  }

  function removeTag(tag: string) {
    if (!prompt) return;
    updatePrompt({ tags: prompt.tags.filter((t) => t !== tag) });
  }

  function addLibrary() {
    if (!prompt) return;
    const lib = newLibrary.trim().toLowerCase();
    if (lib && !prompt.libraries.includes(lib)) {
      updatePrompt({ libraries: [...prompt.libraries, lib] });
      setNewLibrary("");
    }
  }

  function removeLibrary(lib: string) {
    if (!prompt) return;
    updatePrompt({ libraries: prompt.libraries.filter((l) => l !== lib) });
  }

  function addSkill() {
    if (!prompt) return;
    const skill = newSkill.trim().toLowerCase();
    if (skill && !prompt.skills.includes(skill)) {
      updatePrompt({ skills: [...prompt.skills, skill] });
      setNewSkill("");
    }
  }

  function removeSkill(skill: string) {
    if (!prompt) return;
    updatePrompt({ skills: prompt.skills.filter((s) => s !== skill) });
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-6 w-6 animate-spin border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0 py-12 text-center">
          <p className="font-mono text-sm text-muted-foreground">Prompt not found</p>
          <Link
            to={"/dashboard/prompts" as any}
            className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-accent hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Prompts
          </Link>
        </div>
      </div>
    );
  }

  const isReadOnly = prompt.isStarterPack || !prompt.isOwned;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[960px] px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="pt-8 pb-6 md:pt-12 md:pb-8">
          <Link
            to={"/dashboard/prompts" as any}
            className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Prompts
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
                  {prompt.name}
                </h1>
                {prompt.isStarterPack && (
                  <span className="border border-accent/50 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-accent">
                    Starter
                  </span>
                )}
                {prompt.isActive && (
                  <span className="border border-green-500/50 bg-green-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-green-500">
                    Active
                  </span>
                )}
              </div>
              {isReadOnly && (
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  View only - you cannot edit starter pack prompts
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {actionLoading ? (
                <div className="flex h-9 w-9 items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : prompt.isActive ? (
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
                title="Download PROMPT.md"
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
                  value={prompt.name}
                  onChange={(e) => updatePrompt({ name: e.target.value })}
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
                  value={prompt.description || ""}
                  onChange={(e) => updatePrompt({ description: e.target.value })}
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
                    value={prompt.category}
                    onChange={(e) => updatePrompt({ category: e.target.value })}
                    disabled={isReadOnly}
                    className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
                  >
                    {CATEGORIES.map((cat) => (
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
                    value={prompt.parentPromptId || ""}
                    onChange={(e) => updatePrompt({ parentPromptId: e.target.value || null })}
                    disabled={isReadOnly}
                    className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
                  >
                    <option value="">None (standalone)</option>
                    {parentPrompts.map((pf) => (
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
              value={prompt.systemPrompt}
              onChange={(e) => updatePrompt({ systemPrompt: e.target.value })}
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
                  {prompt.libraries.map((lib) => (
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
                  {prompt.libraries.length === 0 && (
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
                  {prompt.skills.map((skill) => (
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
                  {prompt.skills.length === 0 && (
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
                  {prompt.tags.map((tag) => (
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
                  {prompt.tags.length === 0 && (
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
