import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { authFetch } from "../../../lib/api";
import {
  StackCanvas,
  StackSidebar,
  StackToolbar,
  InstructionsEditor,
  type CanvasData,
  type EditorMode,
} from "../../../components/stacks";

export const Route = createFileRoute("/_authed/dashboard/stacks/new")({
  component: NewStackPage,
});

interface StackFormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  instructions: string;
  tokenBudget: "minimal" | "standard" | "comprehensive";
  isPublic: boolean;
  canvasData: CanvasData;
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

function NewStackPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<EditorMode>("visual");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [starterStacks, setStarterStacks] = useState<any[]>([]);

  const [formData, setFormData] = useState<StackFormData>({
    name: "",
    description: "",
    category: "general",
    tags: [],
    instructions: "",
    tokenBudget: "standard",
    isPublic: false,
    canvasData: { nodes: [], edges: [] },
  });

  // Fetch starter stacks for the sidebar
  useEffect(() => {
    async function fetchStarters() {
      try {
        const res = await authFetch("/api/stacks/starters");
        if (res.ok) {
          const data = (await res.json()) as { stacks: any[] };
          setStarterStacks(data.stacks || []);
        }
      } catch {
        // Ignore errors for starters
      }
    }
    fetchStarters();
  }, []);

  const handleCanvasChange = useCallback((data: CanvasData) => {
    setFormData((prev) => ({ ...prev, canvasData: data }));
    setHasChanges(true);
  }, []);

  const handleInstructionsChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, instructions: value }));
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await authFetch("/api/stacks", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          tags: formData.tags,
          instructions: formData.instructions || undefined,
          tokenBudget: formData.tokenBudget,
          isPublic: formData.isPublic,
          canvasData: formData.canvasData,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to create stack");
      }

      const data = (await res.json()) as { stack: { id: string } };
      setHasChanges(false);
      navigate({ to: "/dashboard/stacks/$stackId", params: { stackId: data.stack.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create stack");
    } finally {
      setSaving(false);
    }
  };

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
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              setHasChanges(true);
            }}
            placeholder="Stack Name"
            className="border-none bg-transparent font-mono text-sm font-bold uppercase tracking-wide text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Category */}
          <select
            value={formData.category}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, category: e.target.value }));
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
            value={formData.tokenBudget}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, tokenBudget: e.target.value as any }));
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
              checked={formData.isPublic}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, isPublic: e.target.checked }));
                setHasChanges(true);
              }}
              className="h-4 w-4 border border-border bg-background checked:bg-accent"
            />
            <span className="font-mono text-xs uppercase text-muted-foreground">Public</span>
          </label>
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
        isSaving={saving}
        hasUnsavedChanges={hasChanges}
      />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {mode === "visual" && (
          <StackSidebar starterStacks={starterStacks} />
        )}

        {/* Canvas or Text Editor */}
        <div className="flex-1">
          {mode === "visual" ? (
            <StackCanvas
              initialData={formData.canvasData}
              onChange={handleCanvasChange}
            />
          ) : (
            <InstructionsEditor
              value={formData.instructions}
              onChange={handleInstructionsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
