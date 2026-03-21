import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Plus, X, BookOpen, Zap } from "lucide-react";
import { authFetch } from "../../../lib/api";

export const Route = createFileRoute("/_authed/dashboard/prompts/new")({
  component: NewPromptPage,
});

interface PromptForm {
  name: string;
  description: string;
  systemPrompt: string;
  parentPromptId: string;
  category: string;
  skills: string[];
  libraries: string[];
  mcpServers: string[];
  preferences: {
    verbosity: "concise" | "balanced" | "detailed";
    codeStyle: "minimal" | "documented" | "verbose";
  };
  tags: string[];
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

function NewPromptPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parentPrompts, setParentPrompts] = useState<ParentPrompt[]>([]);
  const [newTag, setNewTag] = useState("");
  const [newLibrary, setNewLibrary] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const [form, setForm] = useState<PromptForm>({
    name: "",
    description: "",
    systemPrompt: "",
    parentPromptId: "",
    category: "general",
    skills: [],
    libraries: [],
    mcpServers: [],
    preferences: {
      verbosity: "balanced",
      codeStyle: "documented",
    },
    tags: [],
  });

  useEffect(() => {
    fetchParentPrompts();
  }, []);

  async function fetchParentPrompts() {
    try {
      const res = await authFetch("/api/prompts?starter=true");
      if (res.ok) {
        const data = (await res.json()) as { prompts: ParentPrompt[] };
        setParentPrompts(data.prompts || []);
      }
    } catch (err) {
      console.error("Failed to fetch parent prompts:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.systemPrompt.trim()) {
      setError("System prompt is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authFetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          systemPrompt: form.systemPrompt.trim(),
          parentPromptId: form.parentPromptId || undefined,
          category: form.category,
          skills: form.skills,
          libraries: form.libraries,
          mcpServers: form.mcpServers,
          preferences: form.preferences,
          tags: form.tags,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to create prompt");
      }

      await res.json();
      navigate({ to: "/dashboard/prompts" as any });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prompt");
    } finally {
      setLoading(false);
    }
  }

  function addTag() {
    const tag = newTag.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag("");
    }
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  function addLibrary() {
    const lib = newLibrary.trim().toLowerCase();
    if (lib && !form.libraries.includes(lib)) {
      setForm((prev) => ({ ...prev, libraries: [...prev.libraries, lib] }));
      setNewLibrary("");
    }
  }

  function removeLibrary(lib: string) {
    setForm((prev) => ({ ...prev, libraries: prev.libraries.filter((l) => l !== lib) }));
  }

  function addSkill() {
    const skill = newSkill.trim().toLowerCase();
    if (skill && !form.skills.includes(skill)) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
      setNewSkill("");
    }
  }

  function removeSkill(skill: string) {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  }

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
          <h1 className="font-mono text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
            Create Prompt
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground sm:text-sm">
            Define a pre-configured AI working environment
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 border border-destructive bg-destructive/10 p-4">
            <p className="font-mono text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
          {/* Basic Info */}
          <div className="border border-border bg-background p-4 sm:p-6">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              Basic Info
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-muted-foreground">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., React + TypeScript Expert"
                  className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-muted-foreground">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this prompt"
                  className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-muted-foreground">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-foreground focus:outline-none"
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
                    Extend From
                  </label>
                  <select
                    value={form.parentPromptId}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, parentPromptId: e.target.value }))
                    }
                    className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-foreground focus:outline-none"
                  >
                    <option value="">None (standalone)</option>
                    {parentPrompts.map((prompt) => (
                      <option key={prompt.id} value={prompt.id}>
                        {prompt.name}
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
              System Prompt *
            </h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Define how the AI should behave when this flow is active
            </p>

            <textarea
              value={form.systemPrompt}
              onChange={(e) => setForm((prev) => ({ ...prev, systemPrompt: e.target.value }))}
              placeholder="You are an expert in..."
              rows={12}
              className="mt-4 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
            />
          </div>

          {/* Resources */}
          <div className="border border-border bg-background p-4 sm:p-6">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              Resources
            </h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Add libraries, skills, and tags
            </p>

            <div className="mt-4 space-y-4">
              {/* Libraries */}
              <div>
                <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  Libraries
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.libraries.map((lib) => (
                    <span
                      key={lib}
                      className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-1 font-mono text-xs"
                    >
                      {lib}
                      <button
                        type="button"
                        onClick={() => removeLibrary(lib)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newLibrary}
                    onChange={(e) => setNewLibrary(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLibrary())}
                    placeholder="e.g., react, nextjs"
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
              </div>

              {/* Skills */}
              <div>
                <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  Skills
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-1 font-mono text-xs"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="e.g., typescript-strict"
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
              </div>

              {/* Tags */}
              <div>
                <label className="font-mono text-xs font-bold uppercase text-muted-foreground">
                  Tags
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 border border-border bg-muted px-2 py-1 font-mono text-xs"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add a tag"
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
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="border border-border bg-background p-4 sm:p-6">
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">
              Preferences
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-muted-foreground">
                  Verbosity
                </label>
                <select
                  value={form.preferences.verbosity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, verbosity: e.target.value as any },
                    }))
                  }
                  className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-foreground focus:outline-none"
                >
                  <option value="concise">Concise</option>
                  <option value="balanced">Balanced</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-muted-foreground">
                  Code Style
                </label>
                <select
                  value={form.preferences.codeStyle}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      preferences: { ...prev.preferences, codeStyle: e.target.value as any },
                    }))
                  }
                  className="mt-1 w-full border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-foreground focus:outline-none"
                >
                  <option value="minimal">Minimal</option>
                  <option value="documented">Documented</option>
                  <option value="verbose">Verbose</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Link
              to={"/dashboard/prompts" as any}
              className="px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 border border-foreground bg-foreground px-6 py-2 font-mono text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Prompt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
