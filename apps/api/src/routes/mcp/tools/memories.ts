import type { Database } from "@nexus/db";
import {
  saveMemory,
  recallMemories,
  getProjectContext,
  listMemories,
  updateMemory,
  deleteMemory,
  type SaveMemoryInput,
  type RecallMemoriesInput,
  type GetProjectContextInput,
  type ListMemoriesInput,
  type UpdateMemoryInput,
  type DeleteMemoryInput,
} from "../../../lib/memory";
import type { MemoryType } from "../../../types";

// ============================================================================
// Argument Types
// ============================================================================

interface SaveMemoryArgs {
  content?: string;
  title?: string;
  type?: string;
  tags?: string[];
  project?: string;
  summary?: string;
  importance?: number;
}

interface RecallMemoriesArgs {
  query?: string;
  type?: string;
  project?: string;
  tags?: string[];
  limit?: number;
}

interface GetProjectContextArgs {
  project?: string;
  includeTypes?: string[];
  limit?: number;
}

interface ListMemoriesArgs {
  type?: string;
  project?: string;
  limit?: number;
  offset?: number;
}

interface UpdateMemoryArgs {
  memoryId?: string;
  content?: string;
  title?: string;
  tags?: string[];
  importance?: number;
  summary?: string;
}

interface DeleteMemoryArgs {
  memoryId?: string;
}

// ============================================================================
// Tool Implementations
// ============================================================================

export async function toolSaveMemory(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const { content, title, type, tags, project, summary, importance } = args as SaveMemoryArgs;

  if (!content) {
    throw new Error("content is required");
  }

  if (!title) {
    throw new Error("title is required");
  }

  if (!type) {
    throw new Error("type is required (project_context, session_summary, decision, correction)");
  }

  const validTypes: MemoryType[] = ["project_context", "session_summary", "decision", "correction"];
  if (!validTypes.includes(type as MemoryType)) {
    throw new Error(`Invalid type: ${type}. Must be one of: ${validTypes.join(", ")}`);
  }

  const input: SaveMemoryInput = {
    content,
    title,
    type: type as MemoryType,
    tags,
    project,
    summary,
    importance,
    // Note: userId would come from auth header in future
  };

  return saveMemory(input, db, env);
}

export async function toolRecallMemories(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const { query, type, project, tags, limit } = args as RecallMemoriesArgs;

  if (!query) {
    throw new Error("query is required");
  }

  const input: RecallMemoriesInput = {
    query,
    type: type as MemoryType | undefined,
    project,
    tags,
    limit,
    scope: "all", // Default to showing global memories (anonymous access)
  };

  return recallMemories(input, db, env);
}

export async function toolGetProjectContext(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const { project, includeTypes, limit } = args as GetProjectContextArgs;

  if (!project) {
    throw new Error("project is required");
  }

  const input: GetProjectContextInput = {
    project,
    includeTypes: includeTypes as MemoryType[] | undefined,
    limit,
  };

  return getProjectContext(input, db, env);
}

export async function toolListMemories(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const { type, project, limit, offset } = args as ListMemoriesArgs;

  const input: ListMemoriesInput = {
    type: type as MemoryType | undefined,
    project,
    scope: "all", // Default to showing global memories
    limit,
    offset,
  };

  return listMemories(input, db);
}

export async function toolUpdateMemory(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const { memoryId, content, title, tags, importance, summary } = args as UpdateMemoryArgs;

  if (!memoryId) {
    throw new Error("memoryId is required");
  }

  const input: UpdateMemoryInput = {
    memoryId,
    content,
    title,
    tags,
    importance,
    summary,
  };

  return updateMemory(input, db, env);
}

export async function toolDeleteMemory(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const { memoryId } = args as DeleteMemoryArgs;

  if (!memoryId) {
    throw new Error("memoryId is required");
  }

  const input: DeleteMemoryInput = {
    memoryId,
  };

  return deleteMemory(input, db, env);
}
