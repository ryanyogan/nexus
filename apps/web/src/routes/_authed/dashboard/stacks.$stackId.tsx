import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { authFetch } from "../../../lib/api";
import {
  StackCanvas,
  StackSidebar,
  StackToolbar,
  InstructionsEditor,
  StackOptionsPanel,
  type CanvasData,
  type EditorMode,
  type StackPreferences,
  type TokenBudget,
} from "../../../components/stacks";

export const Route = createFileRoute("/_authed/dashboard/stacks/$stackId")({
  component: StackEditorPage,
});

interface Stack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string;
  layer: number;
  tags: string[];
  instructions: string | null;
  cliPreferences: StackPreferences | null;
  tokenBudget: string;
  learningStatus: string;
  learningProgress: number | null;
  compiledPrompt: string | null;
  tokenCount: number | null;
  isPublic: boolean;
  canvasData: CanvasData | null;
  repos: any[];
  packages: any[];
  compositions: any[];
}

const CATEGORIES = [
  "infrastructure",
  "database",
  "backend",
  "fullstack",
  "frontend",
  "desktop",
  "styling",
  "tui",
  "tooling",
  "general",
] as const;

function StackEditorPage() {
  const { stackId } = Route.useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<EditorMode>("visual");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [stack, setStack] = useState<Stack | null>(null);
  const [starterStacks, setStarterStacks] = useState<any[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [cliPreferences, setCliPreferences] = useState<StackPreferences>({});
  const [tokenBudget, setTokenBudget] = useState<TokenBudget>("standard");
  const [isPublic, setIsPublic] = useState(false);
  const [canvasData, setCanvasData] = useState<CanvasData>({ nodes: [], edges: [] });

  // Fetch stack data
  useEffect(() => {
    async function fetchStack() {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch(`/api/stacks/${stackId}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Stack not found");
          }
          throw new Error("Failed to fetch stack");
        }
        const data = (await res.json()) as { stack: Stack };
        const s = data.stack;
        setStack(s);
        setName(s.name);
        setDescription(s.description || "");
        setCategory(s.category);
        setTags(s.tags || []);
        setInstructions(s.instructions || "");
        setCliPreferences(s.cliPreferences || {});
        setTokenBudget((s.tokenBudget as TokenBudget) || "standard");
        setIsPublic(s.isPublic);
        setCanvasData(s.canvasData || { nodes: [], edges: [] });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stack");
      } finally {
        setLoading(false);
      }
    }
    fetchStack();
  }, [stackId]);

  // Fetch starter stacks for sidebar
  useEffect(() => {
    async function fetchStarters() {
      try {
        const res = await authFetch("/api/stacks/starters");
        if (res.ok) {
          const data = (await res.json()) as { stacks: any[] };
          setStarterStacks(data.stacks || []);
        }
      } catch {
        // Ignore
      }
    }
    fetchStarters();
  }, []);

  const handleCanvasChange = useCallback((data: CanvasData) => {
    setCanvasData(data);
    setHasChanges(true);
  }, []);

  const handleInstructionsChange = useCallback((value: string) => {
    setInstructions(value);
    setHasChanges(true);
  }, []);

  const handlePreferencesChange = useCallback((prefs: StackPreferences) => {
    setCliPreferences(prefs);
    setHasChanges(true);
  }, []);

  const handleTokenBudgetChange = useCallback((budget: TokenBudget) => {
    setTokenBudget(budget);
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await authFetch(`/api/stacks/${stackId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          description: description || undefined,
          category,
          tags,
          instructions: instructions || undefined,
          cliPreferences,
          tokenBudget,
          isPublic,
          canvasData,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to save stack");
      }

      setHasChanges(false);
      
      // Refresh stack data
      const refreshRes = await authFetch(`/api/stacks/${stackId}`);
      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as { stack: Stack };
        setStack(data.stack);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save stack");
    } finally {
      setSaving(false);
    }
  };

  const handleCompile = async () => {
    setCompiling(true);
    setError(null);

    try {
      const res = await authFetch(`/api/stacks/${stackId}/compile`, { method: "POST" });
      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to start compilation");
      }

      // Refresh stack data to get new status
      const refreshRes = await authFetch(`/api/stacks/${stackId}`);
      if (refreshRes.ok) {
        const data = (await refreshRes.json()) as { stack: Stack };
        setStack(data.stack);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compile stack");
    } finally {
      setCompiling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this stack? This cannot be undone.")) {
      return;
    }

    try {
      const res = await authFetch(`/api/stacks/${stackId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete stack");
      }
      navigate({ to: "/dashboard/stacks" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete stack");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stack) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Stack not found</p>
        <Link
          to="/dashboard/stacks"
          className="mt-4 font-mono text-xs uppercase text-accent hover:underline"
        >
          Back to Stacks
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/stacks"
            className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div className="h-4 w-px bg-border" />
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setHasChanges(true);
            }}
            className="border-none bg-transparent font-mono text-sm font-bold uppercase tracking-wide text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {stack.learningStatus === "complete" && (
            <span className="border border-green-500/50 bg-green-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-green-500">
              Compiled
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Category */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setHasChanges(true);
            }}
            className="border border-border bg-background px-2 py-1 font-mono text-xs uppercase text-muted-foreground focus:border-foreground focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Token Budget */}
          <select
            value={tokenBudget}
            onChange={(e) => {
              setTokenBudget(e.target.value as any);
              setHasChanges(true);
            }}
            className="border border-border bg-background px-2 py-1 font-mono text-xs uppercase text-muted-foreground focus:border-foreground focus:outline-none"
          >
            <option value="minimal">2K tokens</option>
            <option value="standard">5K tokens</option>
            <option value="comprehensive">10K tokens</option>
          </select>

          {/* Public toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => {
                setIsPublic(e.target.checked);
                setHasChanges(true);
              }}
              className="h-4 w-4 border border-border bg-background checked:bg-accent"
            />
            <span className="font-mono text-xs uppercase text-muted-foreground">Public</span>
          </label>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            title="Delete Stack"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-b border-destructive bg-destructive/10 px-4 py-2">
          <p className="font-mono text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Toolbar */}
      <StackToolbar
        mode={mode}
        onModeChange={setMode}
        onSave={handleSave}
        onCompile={handleCompile}
        isSaving={saving}
        isCompiling={compiling || stack.learningStatus === "researching" || stack.learningStatus === "compiling"}
        compilationStatus={stack.learningStatus as any}
        hasUnsavedChanges={hasChanges}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {mode === "visual" && (
          <StackSidebar starterStacks={starterStacks} />
        )}

        {/* Canvas, Text Editor, or Options Panel */}
        <div className="flex-1">
          {mode === "visual" ? (
            <StackCanvas
              initialData={canvasData}
              onChange={handleCanvasChange}
            />
          ) : mode === "text" ? (
            <InstructionsEditor
              value={instructions}
              onChange={handleInstructionsChange}
            />
          ) : (
            <StackOptionsPanel
              preferences={cliPreferences}
              tokenBudget={tokenBudget}
              onPreferencesChange={handlePreferencesChange}
              onTokenBudgetChange={handleTokenBudgetChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
