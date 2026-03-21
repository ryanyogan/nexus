import { memo } from "react";
import { Handle, Position, NodeToolbar, type NodeProps, type Node } from "@xyflow/react";
import { GitBranch, Lock, Unlock, Settings, Trash2, ExternalLink } from "lucide-react";

export type RepoNodeData = {
  label: string;
  githubUrl: string;
  isPrivate?: boolean;
  branch?: string;
  paths?: string[];
  status?: "pending" | "analyzing" | "complete" | "failed";
  summary?: string;
};

export type RepoNodeType = Node<RepoNodeData, "repo">;

function RepoNode({ data, selected }: NodeProps<RepoNodeType>) {
  // Extract owner/repo from URL
  const match = data.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  const repoPath = match ? `${match[1]}/${match[2].replace(/\.git$/, "")}` : data.githubUrl;

  return (
    <>
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        offset={8}
        className="flex items-center gap-1 rounded-none border border-border bg-background p-1 shadow-lg"
      >
        <a
          href={data.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          title="Open in GitHub"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
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
        className={`min-w-[200px] border-2 bg-background transition-all ${
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
          <div className="flex h-6 w-6 items-center justify-center bg-foreground text-background">
            <GitBranch className="h-3.5 w-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs font-bold uppercase tracking-wide truncate">
              {data.label || repoPath}
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              {data.isPrivate ? (
                <Lock className="h-2.5 w-2.5" />
              ) : (
                <Unlock className="h-2.5 w-2.5" />
              )}
              <span className="truncate">{repoPath}</span>
            </div>
          </div>
        </div>

        {/* Branch and paths */}
        <div className="px-3 py-2 space-y-1">
          {data.branch && (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Branch:</span>
              <span className="font-mono text-[10px] text-foreground">{data.branch}</span>
            </div>
          )}
          {data.paths && data.paths.length > 0 && (
            <div className="flex items-start gap-1.5">
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Paths:</span>
              <span className="font-mono text-[10px] text-foreground">
                {data.paths.slice(0, 2).join(", ")}
                {data.paths.length > 2 && ` +${data.paths.length - 2}`}
              </span>
            </div>
          )}
        </div>

        {/* Status */}
        {data.status && (
          <div className="border-t border-border/50 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  data.status === "analyzing"
                    ? "animate-pulse bg-amber-500"
                    : data.status === "complete"
                      ? "bg-green-500"
                      : data.status === "failed"
                        ? "bg-destructive"
                        : "bg-muted-foreground"
                }`}
              />
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                {data.status}
              </span>
            </div>
          </div>
        )}

        {/* Summary */}
        {data.summary && data.status === "complete" && (
          <div className="border-t border-border/50 px-3 py-2">
            <p className="font-mono text-[10px] text-muted-foreground line-clamp-2">
              {data.summary}
            </p>
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

export default memo(RepoNode);
