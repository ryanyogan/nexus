import {
  Save,
  Play,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layout,
  FileText,
  Settings,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";

export type EditorMode = "visual" | "text" | "options";

export interface StackToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onSave?: () => void;
  onCompile?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isSaving?: boolean;
  isCompiling?: boolean;
  compilationStatus?: "pending" | "researching" | "compiling" | "complete" | "failed";
  hasUnsavedChanges?: boolean;
}

export function StackToolbar({
  mode,
  onModeChange,
  onSave,
  onCompile,
  onExport,
  onImport,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  canUndo = false,
  canRedo = false,
  isSaving = false,
  isCompiling = false,
  compilationStatus,
  hasUnsavedChanges = false,
}: StackToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
      {/* Left section - Mode toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-border">
          <button
            onClick={() => onModeChange("visual")}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors ${
              mode === "visual"
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layout className="h-3.5 w-3.5" />
            Visual
          </button>
          <button
            onClick={() => onModeChange("text")}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors ${
              mode === "text"
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Text
          </button>
          <button
            onClick={() => onModeChange("options")}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors ${
              mode === "options"
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Options
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Zoom controls (visual mode only) */}
        {mode === "visual" && (
          <div className="flex items-center gap-1">
            <button
              onClick={onZoomOut}
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={onZoomIn}
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={onFitView}
              className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              title="Fit View"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Center section - Status */}
      <div className="flex items-center gap-2">
        {hasUnsavedChanges && (
          <span className="font-mono text-[10px] uppercase text-amber-500">Unsaved changes</span>
        )}
        {compilationStatus && compilationStatus !== "complete" && (
          <div className="flex items-center gap-1.5">
            {compilationStatus === "researching" || compilationStatus === "compiling" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            ) : compilationStatus === "failed" ? (
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            ) : null}
            <span className="font-mono text-[10px] uppercase text-muted-foreground">
              {compilationStatus}
            </span>
          </div>
        )}
        {compilationStatus === "complete" && (
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-green-500" />
            <span className="font-mono text-[10px] uppercase text-muted-foreground">Compiled</span>
          </div>
        )}
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Import/Export */}
        <div className="flex items-center gap-1">
          <button
            onClick={onImport}
            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            title="Import"
          >
            <Upload className="h-4 w-4" />
          </button>
          <button
            onClick={onExport}
            className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border" />

        {/* Save */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs font-bold uppercase text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Save
        </button>

        {/* Compile */}
        <button
          onClick={onCompile}
          disabled={isCompiling}
          className="flex items-center gap-1.5 border border-accent bg-accent px-3 py-1.5 font-mono text-xs font-bold uppercase text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {isCompiling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Compile
        </button>
      </div>
    </div>
  );
}

export default StackToolbar;
