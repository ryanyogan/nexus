import { memo } from "react";
import { Handle, Position, NodeToolbar, type NodeProps, type Node } from "@xyflow/react";
import { Layers, Settings, Trash2, Copy } from "lucide-react";

export type StackNodeData = {
  label: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  layer?: number;
  stackId?: string;
  isStarter?: boolean;
  learningStatus?: string;
};

export type StackNodeType = Node<StackNodeData, "stack">;

function StackNode({ data, selected }: NodeProps<StackNodeType>) {
  const bgColor = data.color || "var(--color-accent)";
  
  return (
    <>
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        offset={8}
        className="flex items-center gap-1 rounded-none border border-border bg-background p-1 shadow-lg"
      >
        <button
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          title="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
        <button
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </NodeToolbar>

      <div
        className={`min-w-[180px] border-2 bg-background transition-all ${
          selected
            ? "border-accent shadow-[3px_3px_0_0_var(--color-accent)]"
            : "border-border hover:border-foreground/50"
        }`}
        style={{ borderColor: selected ? bgColor : undefined }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !rounded-none !border-2 !border-foreground !bg-background"
        />

        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ backgroundColor: `${bgColor}20` }}
        >
          <div
            className="flex h-6 w-6 items-center justify-center text-xs"
            style={{ backgroundColor: bgColor, color: "white" }}
          >
            {data.icon || <Layers className="h-3.5 w-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs font-bold uppercase tracking-wide truncate">
              {data.label}
            </div>
            {data.category && (
              <div className="font-mono text-[10px] uppercase text-muted-foreground">
                {data.category}
              </div>
            )}
          </div>
          {data.isStarter && (
            <span className="shrink-0 border border-accent/50 bg-accent/10 px-1 py-0.5 font-mono text-[8px] font-bold uppercase text-accent">
              Starter
            </span>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <div className="border-t border-border/50 px-3 py-2">
            <p className="font-mono text-[10px] text-muted-foreground line-clamp-2">
              {data.description}
            </p>
          </div>
        )}

        {/* Status indicator */}
        {data.learningStatus && data.learningStatus !== "complete" && (
          <div className="border-t border-border/50 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  data.learningStatus === "researching" || data.learningStatus === "compiling"
                    ? "animate-pulse bg-amber-500"
                    : data.learningStatus === "failed"
                    ? "bg-destructive"
                    : "bg-muted-foreground"
                }`}
              />
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                {data.learningStatus}
              </span>
            </div>
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-3 !w-3 !rounded-none !border-2 !border-foreground !bg-background"
        />
      </div>
    </>
  );
}

export default memo(StackNode);
