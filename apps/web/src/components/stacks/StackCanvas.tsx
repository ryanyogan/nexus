import { useCallback, useMemo, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes, type NodeType } from "./nodes";
import type { StackNodeData } from "./nodes/StackNode";
import type { RepoNodeData } from "./nodes/RepoNode";
import type { PackageNodeData } from "./nodes/PackageNode";
import type { InstructionNodeData } from "./nodes/InstructionNode";

// Canvas data structure that matches DB schema
export interface CanvasData {
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
  }>;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

type AllNodeData = StackNodeData | RepoNodeData | PackageNodeData | InstructionNodeData;

export interface StackCanvasProps {
  initialData?: CanvasData;
  onChange?: (data: CanvasData) => void;
  readOnly?: boolean;
}

export function StackCanvas({ initialData, onChange, readOnly = false }: StackCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Initialize nodes and edges from canvas data
  const initialNodes = useMemo(() => {
    if (!initialData?.nodes) return [];
    return initialData.nodes.map((node) => ({
      ...node,
      type: node.type as NodeType,
      data: node.data as AllNodeData,
    })) as Node<AllNodeData>[];
  }, [initialData]);

  const initialEdges = useMemo(() => {
    if (!initialData?.edges) return [];
    return initialData.edges as Edge[];
  }, [initialData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<AllNodeData>>[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: "smoothstep" }, eds));
    },
    [setEdges]
  );

  // Notify parent of changes
  const notifyChange = useCallback(() => {
    if (onChange) {
      const canvasData: CanvasData = {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type || "default",
          position: node.position,
          data: node.data as Record<string, unknown>,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
        })),
      };
      onChange(canvasData);
    }
  }, [nodes, edges, onChange]);

  // Handle drag over for adding new nodes
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop to add new nodes
  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow-type") as NodeType;
      const dataJson = event.dataTransfer.getData("application/reactflow-data");

      if (!type || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const data = dataJson ? JSON.parse(dataJson) : getDefaultNodeData(type);

      const newNode: Node<AllNodeData> = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : handleNodesChange}
        onEdgesChange={readOnly ? undefined : handleEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onDragOver={readOnly ? undefined : onDragOver}
        onDrop={readOnly ? undefined : onDrop}
        onNodeDragStop={notifyChange}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { strokeWidth: 2 },
        }}
        connectionLineStyle={{ strokeWidth: 2 }}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Controls
          showZoom
          showFitView
          showInteractive={!readOnly}
          className="!border-2 !border-border !bg-background !rounded-none !shadow-none [&>button]:!border-border [&>button]:!bg-background [&>button]:!rounded-none [&>button:hover]:!bg-muted"
        />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!border-2 !border-border !bg-background !rounded-none"
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          className="!bg-background"
          color="var(--color-border)"
        />

        {/* Help panel */}
        <Panel position="bottom-center" className="mb-4">
          <div className="border border-border bg-background/90 px-3 py-1.5 backdrop-blur">
            <span className="font-mono text-[10px] text-muted-foreground">
              Drag components from sidebar to add. Connect nodes by dragging from handles.
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// Default data for new nodes
function getDefaultNodeData(type: NodeType): AllNodeData {
  switch (type) {
    case "stack":
      return {
        label: "New Stack",
        description: "",
        category: "general",
      } as StackNodeData;
    case "repo":
      return {
        label: "Repository",
        githubUrl: "https://github.com/owner/repo",
        branch: "main",
        status: "pending",
      } as RepoNodeData;
    case "package":
      return {
        label: "Package",
        name: "package-name",
        registry: "npm",
        status: "pending",
      } as PackageNodeData;
    case "instruction":
      return {
        label: "Instructions",
        content: "Enter your instructions here...",
      } as InstructionNodeData;
    default:
      return { label: "Node" } as StackNodeData;
  }
}

export default StackCanvas;
