import { eq, like, and, desc, sql } from "drizzle-orm";
import { libraries, libraryStats, type Database } from "@nexus/db";
import { generateQueryEmbedding } from "../../../lib/embeddings";

// ============================================================================
// Argument Types
// ============================================================================

interface ResolveLibraryArgs {
  libraryName?: string;
  query?: string;
}

interface QueryDocsArgs {
  libraryId?: string;
  query?: string;
  limit?: number;
}

interface GetLibraryInfoArgs {
  libraryId?: string;
}

interface ListLibrariesArgs {
  category?: string;
  limit?: number;
}

// ============================================================================
// Tool Implementations
// ============================================================================

export async function toolResolveLibrary(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const { libraryName } = args as ResolveLibraryArgs;

  if (!libraryName) {
    throw new Error("libraryName is required");
  }

  // Search by name (fuzzy match)
  const searchTerm = `%${libraryName.toLowerCase()}%`;

  const results = await db
    .select({
      id: libraries.id,
      name: libraries.name,
      description: libraries.description,
      version: libraries.version,
      totalChunks: libraries.totalChunks,
      totalTokens: libraries.totalTokens,
      categories: libraries.categories,
      homepageUrl: libraries.homepageUrl,
      repositoryUrl: libraries.repositoryUrl,
    })
    .from(libraries)
    .where(
      and(
        eq(libraries.isActive, true),
        eq(libraries.indexStatus, "indexed"),
        like(sql`lower(${libraries.name})`, searchTerm)
      )
    )
    .orderBy(desc(libraries.isFeatured), desc(libraries.totalChunks))
    .limit(10);

  if (results.length === 0) {
    // Try to resolve and queue the library for indexing
    const { resolveAndQueueLibrary } = await import("../../../lib/library-resolver");
    const resolved = await resolveAndQueueLibrary(libraryName, db, env);

    switch (resolved.status) {
      case "queued":
        return {
          success: false,
          status: "indexing",
          message: `We don't have docs for "${libraryName}" yet, but we're fetching them now! Try again in ~${resolved.estimatedReadyIn} seconds.`,
          libraryId: resolved.libraryId,
          libraryName: resolved.libraryName,
          repositoryUrl: resolved.repositoryUrl,
          description: resolved.description,
          estimatedReadyIn: resolved.estimatedReadyIn,
        };

      case "indexing":
        return {
          success: false,
          status: "indexing",
          message: `Documentation for "${libraryName}" is currently being indexed. Try again in ~${resolved.estimatedReadyIn} seconds.`,
          libraryId: resolved.libraryId,
          libraryName: resolved.libraryName,
          estimatedReadyIn: resolved.estimatedReadyIn,
        };

      case "indexed":
        // Race condition: library was indexed between our search and resolve
        return {
          success: true,
          libraryId: resolved.libraryId,
          libraryName: resolved.libraryName,
          message: "Library is now available!",
          recommendation: `Use libraryId "${resolved.libraryId}" with query-docs to search this library's documentation.`,
        };

      case "rejected":
      default:
        return {
          success: false,
          status: "not_found",
          message: resolved.reason || `No libraries found matching "${libraryName}".`,
          submitUrl: "https://nexus.yogan.dev/submit",
        };
    }
  }

  // Format results
  const formattedResults = results.map((lib) => ({
    libraryId: lib.id,
    name: lib.name,
    description: lib.description,
    version: lib.version,
    documentationCoverage: {
      chunks: lib.totalChunks,
      estimatedTokens: lib.totalTokens,
    },
    categories: lib.categories,
    links: {
      homepage: lib.homepageUrl,
      repository: lib.repositoryUrl,
    },
  }));

  return {
    success: true,
    query: libraryName,
    results: formattedResults,
    recommendation:
      results.length > 0
        ? `Use libraryId "${results[0].id}" with query-docs to search this library's documentation.`
        : null,
  };
}

export async function toolQueryDocs(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const { libraryId, query, limit = 5 } = args as QueryDocsArgs;

  if (!libraryId) {
    throw new Error("libraryId is required. Use resolve-library first to find the library ID.");
  }

  if (!query) {
    throw new Error("query is required. Describe what you're looking for.");
  }

  // Verify library exists and is indexed
  const [library] = await db
    .select({
      id: libraries.id,
      name: libraries.name,
      version: libraries.version,
      indexStatus: libraries.indexStatus,
    })
    .from(libraries)
    .where(eq(libraries.id, libraryId))
    .limit(1);

  if (!library) {
    // Try to resolve and queue the library
    const { resolveAndQueueLibrary } = await import("../../../lib/library-resolver");
    const resolved = await resolveAndQueueLibrary(libraryId, db, env);

    if (resolved.status === "queued" || resolved.status === "indexing") {
      return {
        success: false,
        status: "indexing",
        message: `Documentation for "${libraryId}" is being indexed. Try again in ~${resolved.estimatedReadyIn || 30} seconds.`,
        libraryId: resolved.libraryId,
        estimatedReadyIn: resolved.estimatedReadyIn || 30,
      };
    }

    throw new Error(
      resolved.reason ||
        `Library "${libraryId}" not found. Use resolve-library to search for available libraries.`
    );
  }

  if (library.indexStatus !== "indexed") {
    // Return a helpful response instead of throwing
    return {
      success: false,
      status: library.indexStatus,
      message:
        library.indexStatus === "indexing" || library.indexStatus === "pending"
          ? `Documentation for "${libraryId}" is being indexed. Try again in ~30 seconds.`
          : `Library "${libraryId}" indexing failed. Use resolve-library to check status or submit for re-indexing.`,
      libraryId: library.id,
      libraryName: library.name,
      estimatedReadyIn:
        library.indexStatus === "indexing" || library.indexStatus === "pending" ? 30 : undefined,
    };
  }

  // Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query, env.AI);

  // Search Vectorize with library filter
  const clampedLimit = Math.min(Math.max(1, limit), 10);
  const matches = await env.VECTORIZE.query(queryEmbedding, {
    topK: clampedLimit,
    filter: { libraryId },
    returnMetadata: "all",
  });

  if (matches.matches.length === 0) {
    return {
      success: true,
      libraryId,
      libraryName: library.name,
      query,
      results: [],
      message:
        "No relevant documentation found for this query. Try rephrasing or being more specific.",
    };
  }

  // Fetch chunk content from R2
  const results = await Promise.all(
    matches.matches.map(async (match) => {
      const r2Key = `${libraryId}/${match.id}`;
      const object = await env.DOCS_BUCKET.get(r2Key);
      const content = object ? await object.text() : null;

      return {
        title: match.metadata?.title as string | null,
        content: content || "[Content unavailable]",
        contentType: match.metadata?.contentType as string,
        sourceFile: match.metadata?.sourceFile as string | null,
        relevanceScore: match.score,
      };
    })
  );

  // Update stats (non-blocking)
  updateQueryStats(db, libraryId, results.length).catch(console.error);

  return {
    success: true,
    libraryId,
    libraryName: library.name,
    version: library.version,
    query,
    resultCount: results.length,
    results,
  };
}

export async function toolGetLibraryInfo(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const { libraryId } = args as GetLibraryInfoArgs;

  if (!libraryId) {
    throw new Error("libraryId is required");
  }

  const [library] = await db.select().from(libraries).where(eq(libraries.id, libraryId)).limit(1);

  if (!library) {
    throw new Error(
      `Library "${libraryId}" not found. Use resolve-library to search for available libraries.`
    );
  }

  // Get stats
  const [stats] = await db
    .select()
    .from(libraryStats)
    .where(eq(libraryStats.libraryId, libraryId))
    .limit(1);

  return {
    libraryId: library.id,
    name: library.name,
    description: library.description,
    version: library.version,
    categories: library.categories,
    source: {
      type: library.sourceType,
      url: library.sourceUrl,
      repository: library.repositoryUrl,
      homepage: library.homepageUrl,
    },
    documentation: {
      status: library.indexStatus,
      totalChunks: library.totalChunks,
      totalTokens: library.totalTokens,
      lastIndexedAt: library.lastIndexedAt,
    },
    usage: stats
      ? {
          totalQueries: stats.totalQueries,
          totalChunkHits: stats.totalChunkHits,
          lastQueriedAt: stats.lastQueriedAt,
        }
      : null,
    isFeatured: library.isFeatured,
  };
}

export async function toolListLibraries(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const { category, limit = 20 } = args as ListLibrariesArgs;

  const clampedLimit = Math.min(Math.max(1, limit), 50);

  const results = await db
    .select({
      id: libraries.id,
      name: libraries.name,
      description: libraries.description,
      categories: libraries.categories,
      version: libraries.version,
      totalChunks: libraries.totalChunks,
      isFeatured: libraries.isFeatured,
    })
    .from(libraries)
    .where(and(eq(libraries.isActive, true), eq(libraries.indexStatus, "indexed")))
    .orderBy(desc(libraries.isFeatured), desc(libraries.totalChunks))
    .limit(clampedLimit);

  // Filter by category if specified
  const filtered = category ? results.filter((lib) => lib.categories.includes(category)) : results;

  const formattedResults = filtered.map((lib) => ({
    libraryId: lib.id,
    name: lib.name,
    description: lib.description,
    categories: lib.categories,
    version: lib.version,
    documentationChunks: lib.totalChunks,
    isFeatured: lib.isFeatured,
  }));

  return {
    success: true,
    category: category || "all",
    count: formattedResults.length,
    libraries: formattedResults,
    availableCategories: [
      "frontend",
      "backend",
      "fullstack",
      "database",
      "cloud",
      "devops",
      "ai",
      "testing",
      "mobile",
      "utilities",
    ],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

async function updateQueryStats(db: Database, libraryId: string, chunkHits: number): Promise<void> {
  const now = new Date().toISOString();

  try {
    // Try to update existing stats
    const result = await db
      .update(libraryStats)
      .set({
        totalQueries: sql`${libraryStats.totalQueries} + 1`,
        totalChunkHits: sql`${libraryStats.totalChunkHits} + ${chunkHits}`,
        lastQueriedAt: now,
      })
      .where(eq(libraryStats.libraryId, libraryId));

    // If no rows updated, insert new stats
    // Check if result has meta.changes (D1-specific)
    const changes = (result as { meta?: { changes?: number } }).meta?.changes;
    if (changes === 0) {
      await db.insert(libraryStats).values({
        libraryId,
        totalQueries: 1,
        totalChunkHits: chunkHits,
        lastQueriedAt: now,
      });
    }
  } catch (error) {
    console.warn(`Failed to update stats for ${libraryId}:`, error);
  }
}
