export { default as StackNode } from "./StackNode";
export { default as RepoNode } from "./RepoNode";
export { default as PackageNode } from "./PackageNode";
export { default as InstructionNode } from "./InstructionNode";

export type { StackNodeData, StackNodeType } from "./StackNode";
export type { RepoNodeData, RepoNodeType } from "./RepoNode";
export type { PackageNodeData, PackageNodeType } from "./PackageNode";
export type { InstructionNodeData, InstructionNodeType } from "./InstructionNode";

import StackNode from "./StackNode";
import RepoNode from "./RepoNode";
import PackageNode from "./PackageNode";
import InstructionNode from "./InstructionNode";

export const nodeTypes = {
  stack: StackNode,
  repo: RepoNode,
  package: PackageNode,
  instruction: InstructionNode,
} as const;

export type NodeType = keyof typeof nodeTypes;
