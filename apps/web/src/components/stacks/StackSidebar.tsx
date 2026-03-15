import type { DragEvent } from "react";
import {
  Layers,
  GitBranch,
  Package,
  FileText,
  GripVertical,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import type { NodeType } from "./nodes";

interface DraggableNodeProps {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  data?: Record<string, unknown>;
}

function DraggableNode({ type, label, description, icon, color, data }: DraggableNodeProps) {
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData("application/reactflow-type", type);
    if (data) {
      event.dataTransfer.setData("application/reactflow-data", JSON.stringify(data));
    }
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group flex cursor-grab items-center gap-3 border border-border bg-background p-3 transition-all hover:border-foreground/50 hover:shadow-[2px_2px_0_0_var(--color-border)] active:cursor-grabbing"
    >
      <div className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4" />
      </div>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center"
        style={{ backgroundColor: color || "var(--color-muted)", color: color ? "white" : undefined }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-xs font-bold uppercase tracking-wide truncate">
          {label}
        </div>
        <div className="font-mono text-[10px] text-muted-foreground truncate">
          {description}
        </div>
      </div>
    </div>
  );
}

interface StackLibraryItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  isStarter?: boolean;
}

interface StackSidebarProps {
  starterStacks?: StackLibraryItem[];
  onStackSelect?: (stack: StackLibraryItem) => void;
}

export function StackSidebar({ starterStacks = [], onStackSelect }: StackSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    components: true,
    stacks: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const filteredStacks = starterStacks.filter(
    (stack) =>
      stack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stack.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onStackDragStart = (event: DragEvent<HTMLDivElement>, stack: StackLibraryItem) => {
    event.dataTransfer.setData("application/reactflow-type", "stack");
    event.dataTransfer.setData(
      "application/reactflow-data",
      JSON.stringify({
        label: stack.name,
        description: stack.description,
        icon: stack.icon,
        color: stack.color,
        category: stack.category,
        stackId: stack.id,
        isStarter: stack.isStarter,
      })
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Search */}
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-border bg-background py-2 pl-8 pr-3 font-mono text-xs placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Components section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection("components")}
            className="flex w-full items-center justify-between px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <span>Components</span>
            {expandedSections.components ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>

          {expandedSections.components && (
            <div className="space-y-2 px-3 pb-3">
              <DraggableNode
                type="stack"
                label="Stack"
                description="Compose child stacks"
                icon={<Layers className="h-4 w-4" />}
                color="var(--color-accent)"
              />
              <DraggableNode
                type="repo"
                label="Repository"
                description="GitHub repo reference"
                icon={<GitBranch className="h-4 w-4" />}
                color="#24292e"
              />
              <DraggableNode
                type="package"
                label="Package"
                description="npm/cargo/etc package"
                icon={<Package className="h-4 w-4" />}
                color="#CB3837"
              />
              <DraggableNode
                type="instruction"
                label="Instructions"
                description="Text instructions"
                icon={<FileText className="h-4 w-4" />}
              />
            </div>
          )}
        </div>

        {/* Starter Stacks section */}
        {starterStacks.length > 0 && (
          <div className="border-b border-border">
            <button
              onClick={() => toggleSection("stacks")}
              className="flex w-full items-center justify-between px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <span>Starter Stacks</span>
              {expandedSections.stacks ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>

            {expandedSections.stacks && (
              <div className="space-y-2 px-3 pb-3">
                {filteredStacks.map((stack) => (
                  <div
                    key={stack.id}
                    draggable
                    onDragStart={(e) => onStackDragStart(e, stack)}
                    onClick={() => onStackSelect?.(stack)}
                    className="group flex cursor-grab items-center gap-3 border border-border bg-background p-2.5 transition-all hover:border-foreground/50 hover:shadow-[2px_2px_0_0_var(--color-border)] active:cursor-grabbing"
                  >
                    <div className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                    <div
                      className="flex h-6 w-6 shrink-0 items-center justify-center text-[10px]"
                      style={{
                        backgroundColor: stack.color || "var(--color-accent)",
                        color: "white",
                      }}
                    >
                      {stack.icon || <Layers className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-wide truncate">
                        {stack.name}
                      </div>
                      {stack.category && (
                        <div className="font-mono text-[9px] text-muted-foreground uppercase">
                          {stack.category}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredStacks.length === 0 && searchQuery && (
                  <div className="py-4 text-center">
                    <p className="font-mono text-[10px] text-muted-foreground">
                      No stacks found
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-border p-3">
        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
          Drag components to the canvas to build your stack. Connect nodes to define relationships.
        </p>
      </div>
    </div>
  );
}

export default StackSidebar;
