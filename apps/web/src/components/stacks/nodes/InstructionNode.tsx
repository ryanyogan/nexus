import { memo, useState, useCallback } from "react";
import { Handle, Position, NodeToolbar, type NodeProps, type Node } from "@xyflow/react";
import { FileText, Settings, Trash2, Maximize2, Minimize2 } from "lucide-react";

export type InstructionNodeData = {
  label: string;
  content: string;
  expanded?: boolean;
};

export type InstructionNodeType = Node<InstructionNodeData, "instruction">;

function InstructionNode({ data, selected }: NodeProps<InstructionNodeType>) {
  const [expanded, setExpanded] = useState(data.expanded ?? false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // Count lines and characters
  const lines = data.content.split("\n").length;
  const chars = data.content.length;

  return (
    <>
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        offset={8}
        className="flex items-center gap-1 rounded-none border border-border bg-background p-1 shadow-lg"
      >
        <button
          onClick={toggleExpanded}
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
        <button
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          title="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
        <button
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </NodeToolbar>

      <div
        className={`border-2 bg-background transition-all ${
          expanded ? "min-w-[300px] max-w-[400px]" : "min-w-[180px] max-w-[220px]"
        } ${
          selected
            ? "border-foreground shadow-[3px_3px_0_0_var(--color-foreground)]"
            : "border-border hover:border-foreground/50"
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !rounded-none !border-2 !border-foreground !bg-background"
        />

        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
          <div className="flex h-6 w-6 items-center justify-center bg-muted text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs font-bold uppercase tracking-wide truncate">
              {data.label || "Instructions"}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {lines} lines, {chars} chars
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-3 py-2">
          {expanded ? (
            <pre className="font-mono text-[10px] text-foreground whitespace-pre-wrap overflow-auto max-h-[200px]">
              {data.content}
            </pre>
          ) : (
            <p className="font-mono text-[10px] text-muted-foreground line-clamp-3">
              {data.content}
            </p>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-3 !w-3 !rounded-none !border-2 !border-foreground !bg-background"
        />
      </div>
    </>
  );
}

export default memo(InstructionNode);
