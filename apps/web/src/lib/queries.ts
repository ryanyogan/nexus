import { createServerFn } from "@tanstack/react-start";
import { eq, like, desc, sql, and } from "drizzle-orm";
import { libraries, chunks, libraryStats } from "@nexus/db";
import { getDb } from "./db";
import type {
  LibraryListParams,
  LibraryListResult,
  LibraryDetailResult,
  ChunkListResult,
} from "./types";

// Re-export types for convenience
export type {
  LibraryListParams,
  LibraryListResult,
  LibraryDetailResult,
  ChunkListResult,
} from "./types";

// ============================================================================
// Server Functions
// ============================================================================

export const getLibraries = createServerFn({ method: "GET" })
  .inputValidator((params: LibraryListParams) => params)
  .handler(async ({ data: params }): Promise<LibraryListResult> => {
    const {
      category,
      search,
      status,
      featured,
      limit = 50,
      offset = 0,
    } = params;

    const db = getDb();

    // Build conditions
    const conditions = [eq(libraries.isActive, true)];

    if (status) {
      conditions.push(eq(libraries.indexStatus, status));
    }

    if (featured) {
      conditions.push(eq(libraries.isFeatured, true));
    }

    if (search) {
      conditions.push(like(libraries.name, `%${search}%`));
    }

    // Execute query
    const results = await db
      .select({
        id: libraries.id,
        name: libraries.name,
        description: libraries.description,
        categories: libraries.categories,
        version: libraries.version,
        iconUrl: libraries.iconUrl,
        homepageUrl: libraries.homepageUrl,
        repositoryUrl: libraries.repositoryUrl,
        totalChunks: libraries.totalChunks,
        totalTokens: libraries.totalTokens,
        indexStatus: libraries.indexStatus,
        isFeatured: libraries.isFeatured,
        lastIndexedAt: libraries.lastIndexedAt,
      })
      .from(libraries)
      .where(and(...conditions))
      .orderBy(desc(libraries.isFeatured), desc(libraries.totalChunks))
      .limit(limit)
      .offset(offset);

    // Filter by category in JS (since it's a JSON array)
    const filtered = category
      ? results.filter((lib) => lib.categories.includes(category))
      : results;

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(libraries)
      .where(and(...conditions));

    const total = countResult[0]?.count || 0;

    return {
      libraries: filtered,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + filtered.length < total,
      },
    };
  });

export const getLibrary = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }): Promise<LibraryDetailResult | null> => {
    const db = getDb();

    const [library] = await db
      .select()
      .from(libraries)
      .where(eq(libraries.id, id))
      .limit(1);

    if (!library) {
      return null;
    }

    // Get stats
    const [stats] = await db
      .select()
      .from(libraryStats)
      .where(eq(libraryStats.libraryId, id))
      .limit(1);

    return {
      library: {
        id: library.id,
        name: library.name,
        description: library.description,
        categories: library.categories,
        version: library.version,
        iconUrl: library.iconUrl,
        homepageUrl: library.homepageUrl,
        repositoryUrl: library.repositoryUrl,
        sourceUrl: library.sourceUrl,
        totalChunks: library.totalChunks,
        totalTokens: library.totalTokens,
        indexStatus: library.indexStatus,
        isFeatured: library.isFeatured,
        lastIndexedAt: library.lastIndexedAt,
        createdAt: library.createdAt,
      },
      stats: {
        totalQueries: stats?.totalQueries || 0,
        totalChunkHits: stats?.totalChunkHits || 0,
      },
    };
  });

export const getLibraryChunks = createServerFn({ method: "GET" })
  .inputValidator((params: { libraryId: string; limit?: number; offset?: number }) => params)
  .handler(async ({ data: params }): Promise<ChunkListResult> => {
    const { libraryId, limit = 20, offset = 0 } = params;
    const db = getDb();

    // Get chunks
    const chunkResults = await db
      .select({
        id: chunks.id,
        title: chunks.title,
        contentType: chunks.contentType,
        tokenCount: chunks.tokenCount,
        sourceFile: chunks.sourceFile,
        createdAt: chunks.createdAt,
      })
      .from(chunks)
      .where(eq(chunks.libraryId, libraryId))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(chunks)
      .where(eq(chunks.libraryId, libraryId));

    const total = countResult[0]?.count || 0;

    return {
      chunks: chunkResults,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + chunkResults.length < total,
      },
    };
  });
