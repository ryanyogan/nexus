import { eq, and, desc, sql } from "drizzle-orm";
import { memories, type Database, type Memory, type NewMemory } from "@nexus/db";
import { generateQueryEmbedding } from "./embeddings";
import type { MemoryType, MemoryScope, MemoryMetadata, MemoryResult } from "../types";

// ============================================================================
// Constants
// ============================================================================

const MEMORY_TYPES: MemoryType[] = [
  "project_context",
  "session_summary",
  "decision",
  "correction",
];

// ============================================================================
// Memory Storage
// ============================================================================

export interface SaveMemoryInput {
  content: string;
  title: string;
  type: MemoryType;
  tags?: string[];
  project?: string;
  summary?: string;
  importance?: number;
  userId?: string; // If provided, creates user-scoped memory
  expiresIn?: string; // e.g., "7d", "30d"
}

export interface SaveMemoryResult {
  success: boolean;
  memoryId: string;
  message: string;
}

/**
 * Save a new memory to D1, R2, and Vectorize
 */
export async function saveMemory(
  input: SaveMemoryInput,
  db: Database,
  env: Env
): Promise<SaveMemoryResult> {
  const {
    content,
    title,
    type,
    tags = [],
    project,
    summary,
    importance = 5,
    userId,
    expiresIn,
  } = input;

  // Validate type
  if (!MEMORY_TYPES.includes(type)) {
    throw new Error(`Invalid memory type: ${type}. Must be one of: ${MEMORY_TYPES.join(", ")}`);
  }

  // Validate importance
  if (importance < 1 || importance > 10) {
    throw new Error("Importance must be between 1 and 10");
  }

  // Generate unique ID
  const memoryId = `mem_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const now = new Date().toISOString();
  const scope: MemoryScope = userId ? "user" : "global";

  // Calculate expiration if provided
  let expiresAt: string | undefined;
  if (expiresIn) {
    const match = expiresIn.match(/^(\d+)(d|h|m)$/);
    if (match) {
      const [, num, unit] = match;
      const ms =
        unit === "d"
          ? parseInt(num) * 24 * 60 * 60 * 1000
          : unit === "h"
          ? parseInt(num) * 60 * 60 * 1000
          : parseInt(num) * 60 * 1000;
      expiresAt = new Date(Date.now() + ms).toISOString();
    }
  }

  // Generate embedding for semantic search
  const embedding = await generateQueryEmbedding(content, env.AI);

  // Store content in R2
  const r2Key = scope === "user" ? `users/${userId}/${memoryId}` : `global/${memoryId}`;
  await env.MEMORY_BUCKET.put(r2Key, content, {
    customMetadata: {
      title,
      type,
      project: project || "",
      tags: JSON.stringify(tags),
    },
  });

  // Store metadata in D1
  const memoryRecord: NewMemory = {
    id: memoryId,
    userId: userId || null,
    scope,
    type,
    tags,
    title,
    summary: summary || null,
    r2Key,
    project: project || null,
    importance,
    createdAt: now,
    updatedAt: now,
    expiresAt: expiresAt || null,
  };

  await db.insert(memories).values(memoryRecord);

  // Store embedding in Vectorize with metadata
  const vectorMetadata: MemoryMetadata = {
    id: memoryId,
    scope,
    type,
    project: project || null,
    userId: userId || null,
    title,
    tags,
  };

  await env.MEMORY_VECTORIZE.upsert([
    {
      id: memoryId,
      values: embedding,
      metadata: vectorMetadata as unknown as Record<string, string>,
    },
  ]);

  return {
    success: true,
    memoryId,
    message: `Memory saved successfully as ${scope} memory`,
  };
}

// ============================================================================
// Memory Retrieval
// ============================================================================

export interface RecallMemoriesInput {
  query: string;
  type?: MemoryType;
  project?: string;
  tags?: string[];
  scope?: "global" | "user" | "all";
  userId?: string; // Required if scope includes "user"
  limit?: number;
}

export interface RecallMemoriesResult {
  success: boolean;
  query: string;
  results: MemoryResult[];
  totalFound: number;
}

/**
 * Semantic search for memories
 */
export async function recallMemories(
  input: RecallMemoriesInput,
  db: Database,
  env: Env
): Promise<RecallMemoriesResult> {
  const {
    query,
    type,
    project,
    tags,
    scope = "all",
    userId,
    limit = 5,
  } = input;

  const clampedLimit = Math.min(Math.max(1, limit), 10);

  // Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query, env.AI);

  // Build filter for Vectorize
  const filter: VectorizeVectorMetadataFilter = {};

  if (type) {
    filter.type = type;
  }

  if (project) {
    filter.project = project;
  }

  // Handle scope filtering
  if (scope === "global") {
    filter.scope = "global";
  } else if (scope === "user") {
    if (!userId) {
      throw new Error("userId is required when scope is 'user'");
    }
    filter.scope = "user";
    filter.userId = userId;
  }
  // For "all" scope, we don't add scope filter but need to handle user memories
  // User can see global + their own user memories

  // Query Vectorize
  const matches = await env.MEMORY_VECTORIZE.query(queryEmbedding, {
    topK: clampedLimit * 2, // Get more to filter
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    returnMetadata: "all",
  });

  if (matches.matches.length === 0) {
    return {
      success: true,
      query,
      results: [],
      totalFound: 0,
    };
  }

  // Filter results for "all" scope (user can see global + own user memories)
  let filteredMatches = matches.matches;
  if (scope === "all" && userId) {
    filteredMatches = matches.matches.filter((m) => {
      const meta = m.metadata as unknown as MemoryMetadata;
      return meta.scope === "global" || meta.userId === userId;
    });
  } else if (scope === "all" && !userId) {
    // Anonymous user can only see global
    filteredMatches = matches.matches.filter((m) => {
      const meta = m.metadata as unknown as MemoryMetadata;
      return meta.scope === "global";
    });
  }

  // Filter by tags if provided (all tags must match)
  if (tags && tags.length > 0) {
    filteredMatches = filteredMatches.filter((m) => {
      const meta = m.metadata as unknown as MemoryMetadata;
      return tags.every((tag) => meta.tags.includes(tag));
    });
  }

  // Limit results
  filteredMatches = filteredMatches.slice(0, clampedLimit);

  // Fetch content from R2
  const results: MemoryResult[] = await Promise.all(
    filteredMatches.map(async (match) => {
      const meta = match.metadata as unknown as MemoryMetadata;

      // Get full memory record from D1 for timestamps
      const [memoryRecord] = await db
        .select()
        .from(memories)
        .where(eq(memories.id, meta.id))
        .limit(1);

      // Get content from R2
      const r2Key =
        meta.scope === "user"
          ? `users/${meta.userId}/${meta.id}`
          : `global/${meta.id}`;
      const object = await env.MEMORY_BUCKET.get(r2Key);
      const content = object ? await object.text() : "[Content unavailable]";

      return {
        memoryId: meta.id,
        title: meta.title,
        type: meta.type,
        content,
        summary: memoryRecord?.summary || null,
        tags: meta.tags,
        project: meta.project,
        importance: memoryRecord?.importance || 5,
        relevanceScore: match.score,
        createdAt: memoryRecord?.createdAt || "",
        updatedAt: memoryRecord?.updatedAt || "",
      };
    })
  );

  return {
    success: true,
    query,
    results,
    totalFound: results.length,
  };
}

// ============================================================================
// Get Project Context
// ============================================================================

export interface GetProjectContextInput {
  project: string;
  includeTypes?: MemoryType[];
  userId?: string; // To include user-scoped memories
  limit?: number;
}

export interface GetProjectContextResult {
  success: boolean;
  project: string;
  context: {
    project_context: MemoryResult[];
    decisions: MemoryResult[];
    corrections: MemoryResult[];
    recent_sessions: MemoryResult[];
  };
}

/**
 * Get all context for a specific project, organized by type
 */
export async function getProjectContext(
  input: GetProjectContextInput,
  db: Database,
  env: Env
): Promise<GetProjectContextResult> {
  const { project, includeTypes, userId, limit = 5 } = input;

  const typesToInclude: MemoryType[] = includeTypes || [
    "project_context",
    "decision",
    "correction",
    "session_summary",
  ];

  const context: GetProjectContextResult["context"] = {
    project_context: [],
    decisions: [],
    corrections: [],
    recent_sessions: [],
  };

  // Query each type
  for (const type of typesToInclude) {
    // Build scope conditions
    const scopeConditions = userId
      ? sql`(${memories.scope} = 'global' OR (${memories.scope} = 'user' AND ${memories.userId} = ${userId}))`
      : sql`${memories.scope} = 'global'`;

    const results = await db
      .select()
      .from(memories)
      .where(
        and(
          eq(memories.project, project),
          eq(memories.type, type),
          scopeConditions
        )
      )
      .orderBy(desc(memories.importance), desc(memories.createdAt))
      .limit(limit);

    // Fetch content for each
    const memoriesWithContent: MemoryResult[] = await Promise.all(
      results.map(async (mem) => {
        const object = await env.MEMORY_BUCKET.get(mem.r2Key);
        const content = object ? await object.text() : "[Content unavailable]";

        return {
          memoryId: mem.id,
          title: mem.title,
          type: mem.type as MemoryType,
          content,
          summary: mem.summary,
          tags: mem.tags as string[],
          project: mem.project,
          importance: mem.importance,
          createdAt: mem.createdAt,
          updatedAt: mem.updatedAt,
        };
      })
    );

    // Add to appropriate category
    switch (type) {
      case "project_context":
        context.project_context = memoriesWithContent;
        break;
      case "decision":
        context.decisions = memoriesWithContent;
        break;
      case "correction":
        context.corrections = memoriesWithContent;
        break;
      case "session_summary":
        context.recent_sessions = memoriesWithContent;
        break;
    }
  }

  return {
    success: true,
    project,
    context,
  };
}

// ============================================================================
// List Memories
// ============================================================================

export interface ListMemoriesInput {
  type?: MemoryType;
  project?: string;
  scope?: "global" | "user" | "all";
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface ListMemoriesResult {
  success: boolean;
  memories: Array<{
    memoryId: string;
    title: string;
    type: MemoryType;
    summary: string | null;
    tags: string[];
    project: string | null;
    importance: number;
    scope: MemoryScope;
    createdAt: string;
  }>;
  total: number;
  hasMore: boolean;
}

/**
 * List memories with filtering (no content, just metadata)
 */
export async function listMemories(
  input: ListMemoriesInput,
  db: Database
): Promise<ListMemoriesResult> {
  const { type, project, scope = "all", userId, limit = 20, offset = 0 } = input;

  const clampedLimit = Math.min(Math.max(1, limit), 50);

  // Build where conditions
  const conditions: ReturnType<typeof eq>[] = [];

  if (type) {
    conditions.push(eq(memories.type, type));
  }

  if (project) {
    conditions.push(eq(memories.project, project));
  }

  // Scope filtering
  if (scope === "global") {
    conditions.push(eq(memories.scope, "global"));
  } else if (scope === "user") {
    if (!userId) {
      throw new Error("userId is required when scope is 'user'");
    }
    conditions.push(eq(memories.scope, "user"));
    conditions.push(eq(memories.userId, userId));
  }
  // For "all" scope with userId, show global + user's memories
  // For "all" scope without userId, show only global

  const results = await db
    .select({
      id: memories.id,
      title: memories.title,
      type: memories.type,
      summary: memories.summary,
      tags: memories.tags,
      project: memories.project,
      importance: memories.importance,
      scope: memories.scope,
      createdAt: memories.createdAt,
      userId: memories.userId,
    })
    .from(memories)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(memories.createdAt))
    .limit(clampedLimit + 1)
    .offset(offset);

  // Filter for "all" scope
  let filtered = results;
  if (scope === "all") {
    filtered = results.filter((m) => {
      if (m.scope === "global") return true;
      if (m.scope === "user" && m.userId === userId) return true;
      return false;
    });
  }

  const hasMore = filtered.length > clampedLimit;
  const finalResults = filtered.slice(0, clampedLimit);

  return {
    success: true,
    memories: finalResults.map((m) => ({
      memoryId: m.id,
      title: m.title,
      type: m.type as MemoryType,
      summary: m.summary,
      tags: m.tags as string[],
      project: m.project,
      importance: m.importance,
      scope: m.scope as MemoryScope,
      createdAt: m.createdAt,
    })),
    total: finalResults.length,
    hasMore,
  };
}

// ============================================================================
// Update Memory
// ============================================================================

export interface UpdateMemoryInput {
  memoryId: string;
  userId?: string; // For ownership check
  content?: string;
  title?: string;
  tags?: string[];
  importance?: number;
  summary?: string;
}

export interface UpdateMemoryResult {
  success: boolean;
  message: string;
}

/**
 * Update an existing memory
 */
export async function updateMemory(
  input: UpdateMemoryInput,
  db: Database,
  env: Env
): Promise<UpdateMemoryResult> {
  const { memoryId, userId, content, title, tags, importance, summary } = input;

  // Fetch existing memory
  const [existing] = await db
    .select()
    .from(memories)
    .where(eq(memories.id, memoryId))
    .limit(1);

  if (!existing) {
    throw new Error(`Memory not found: ${memoryId}`);
  }

  // Check ownership
  if (existing.scope === "user" && existing.userId !== userId) {
    throw new Error("You don't have permission to update this memory");
  }

  // If it's a global memory, only the owner or admin can update
  // For now, we'll allow any authenticated user to update global memories they created
  // In the future, we could add an admin check here

  const now = new Date().toISOString();
  const updates: Partial<Memory> = { updatedAt: now };

  if (title !== undefined) updates.title = title;
  if (tags !== undefined) updates.tags = tags;
  if (importance !== undefined) {
    if (importance < 1 || importance > 10) {
      throw new Error("Importance must be between 1 and 10");
    }
    updates.importance = importance;
  }
  if (summary !== undefined) updates.summary = summary;

  // If content changed, update R2 and regenerate embedding
  if (content !== undefined) {
    // Update R2
    await env.MEMORY_BUCKET.put(existing.r2Key, content, {
      customMetadata: {
        title: title || existing.title,
        type: existing.type,
        project: existing.project || "",
        tags: JSON.stringify(tags || existing.tags),
      },
    });

    // Regenerate embedding
    const embedding = await generateQueryEmbedding(content, env.AI);

    // Update Vectorize
    const vectorMetadata: MemoryMetadata = {
      id: memoryId,
      scope: existing.scope as MemoryScope,
      type: existing.type as MemoryType,
      project: existing.project,
      userId: existing.userId,
      title: title || existing.title,
      tags: tags || (existing.tags as string[]),
    };

    await env.MEMORY_VECTORIZE.upsert([
      {
        id: memoryId,
        values: embedding,
        metadata: vectorMetadata as unknown as Record<string, string>,
      },
    ]);
  }

  // Update D1
  await db.update(memories).set(updates).where(eq(memories.id, memoryId));

  return {
    success: true,
    message: "Memory updated successfully",
  };
}

// ============================================================================
// Delete Memory
// ============================================================================

export interface DeleteMemoryInput {
  memoryId: string;
  userId?: string; // For ownership check
}

export interface DeleteMemoryResult {
  success: boolean;
  message: string;
}

/**
 * Delete a memory from all stores
 */
export async function deleteMemory(
  input: DeleteMemoryInput,
  db: Database,
  env: Env
): Promise<DeleteMemoryResult> {
  const { memoryId, userId } = input;

  // Fetch existing memory
  const [existing] = await db
    .select()
    .from(memories)
    .where(eq(memories.id, memoryId))
    .limit(1);

  if (!existing) {
    throw new Error(`Memory not found: ${memoryId}`);
  }

  // Check ownership
  if (existing.scope === "user" && existing.userId !== userId) {
    throw new Error("You don't have permission to delete this memory");
  }

  // Delete from R2
  await env.MEMORY_BUCKET.delete(existing.r2Key);

  // Delete from Vectorize
  await env.MEMORY_VECTORIZE.deleteByIds([memoryId]);

  // Delete from D1
  await db.delete(memories).where(eq(memories.id, memoryId));

  return {
    success: true,
    message: "Memory deleted successfully",
  };
}
