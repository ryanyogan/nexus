import { memo } from "react";
import { Handle, Position, NodeToolbar, type NodeProps, type Node } from "@xyflow/react";
import { Settings, Trash2, ExternalLink, BookOpen } from "lucide-react";

export type PackageNodeData = {
  label: string;
  name: string;
  registry?: "npm" | "cargo" | "pypi" | "go" | "hex" | "rubygems";
  version?: string;
  status?: "pending" | "researching" | "complete" | "failed";
  documentationSummary?: string;
  libraryId?: string;
};

export type PackageNodeType = Node<PackageNodeData, "package">;

const registryIcons: Record<string, string> = {
  npm: "N",
  cargo: "C",
  pypi: "Py",
  go: "Go",
  hex: "Hx",
  rubygems: "Rb",
};

const registryColors: Record<string, string> = {
  npm: "#CB3837",
  cargo: "#F74C00",
  pypi: "#3775A9",
  go: "#00ADD8",
  hex: "#6E4A7E",
  rubygems: "#E9573F",
};

function PackageNode({ data, selected }: NodeProps<PackageNodeType>) {
  const registry = data.registry || "npm";
  const color = registryColors[registry] || "#666";

  const getPackageUrl = () => {
    switch (registry) {
      case "npm":
        return `https://www.npmjs.com/package/${data.name}`;
      case "cargo":
        return `https://crates.io/crates/${data.name}`;
      case "pypi":
        return `https://pypi.org/project/${data.name}`;
      case "go":
        return `https://pkg.go.dev/${data.name}`;
      case "hex":
        return `https://hex.pm/packages/${data.name}`;
      case "rubygems":
        return `https://rubygems.org/gems/${data.name}`;
      default:
        return null;
    }
  };

  const packageUrl = getPackageUrl();

  return (
    <>
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        offset={8}
        className="flex items-center gap-1 rounded-none border border-border bg-background p-1 shadow-lg"
      >
        {packageUrl && (
          <a
            href={packageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            title={`Open on ${registry}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        {data.libraryId && (
          <a
            href={`/libraries/${data.libraryId}`}
            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-accent"
            title="View in Nexus"
          >
            <BookOpen className="h-3.5 w-3.5" />
          </a>
        )}
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
        className={`min-w-[160px] border-2 bg-background transition-all ${
          selected
            ? "shadow-[3px_3px_0_0]"
            : "border-border hover:border-foreground/50"
        }`}
        style={{
          borderColor: selected ? color : undefined,
          boxShadow: selected ? `3px 3px 0 0 ${color}` : undefined,
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !rounded-none !border-2 !border-foreground !bg-background"
        />

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div
            className="flex h-6 w-6 items-center justify-center font-mono text-[10px] font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {registryIcons[registry]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs font-bold tracking-wide truncate">
              {data.name}
            </div>
            {data.version && (
              <div className="font-mono text-[10px] text-muted-foreground">
                v{data.version}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        {data.status && data.status !== "complete" && (
          <div className="border-t border-border/50 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  data.status === "researching"
                    ? "animate-pulse bg-amber-500"
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

        {/* Library link indicator */}
        {data.libraryId && (
          <div className="border-t border-border/50 px-3 py-1.5">
            <div className="flex items-center gap-1 text-accent">
              <BookOpen className="h-2.5 w-2.5" />
              <span className="font-mono text-[10px] uppercase">Docs indexed</span>
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

export default memo(PackageNode);
