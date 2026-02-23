import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, like, desc, sql, and, inArray } from "drizzle-orm";
import { libraries, chunks, libraryStats } from "@nexus/db";
import { generateQueryEmbedding } from "../lib/embeddings";
import type { AppContext } from "../types";

const librariesRouter = new Hono<AppContext>();

// ============================================================================
// GET /api/libraries - List libraries with filtering and pagination
// ============================================================================

librariesRouter.get(
  "/",
  zValidator(
    "query",
    z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      status: z.enum(["pending", "indexing", "indexed", "failed"]).optional(),
      featured: z.enum(["true", "false"]).optional(),
      limit: z.coerce.number().min(1).max(500).default(20),
      offset: z.coerce.number().min(0).default(0),
    })
  ),
  async (c) => {
    const { category, search, status, featured, limit, offset } = c.req.valid("query");
    const db = c.get("db");

    // Build conditions
    const conditions = [eq(libraries.isActive, true)];

    if (status) {
      conditions.push(eq(libraries.indexStatus, status));
    }

    if (featured === "true") {
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
        indexError: libraries.indexError,
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

    return c.json({
      libraries: filtered,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + filtered.length < total,
      },
    });
  }
);

// ============================================================================
// GET /api/libraries/:id - Get a single library
// ============================================================================

librariesRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.get("db");

  const [library] = await db
    .select()
    .from(libraries)
    .where(eq(libraries.id, id))
    .limit(1);

  if (!library) {
    return c.json({ error: "Library not found" }, 404);
  }

  // Get stats
  const [stats] = await db
    .select()
    .from(libraryStats)
    .where(eq(libraryStats.libraryId, id))
    .limit(1);

  return c.json({
    library,
    stats: stats || { totalQueries: 0, totalChunkHits: 0 },
  });
});

// ============================================================================
// POST /api/libraries/search - Semantic search across documentation
// ============================================================================

librariesRouter.post(
  "/search",
  zValidator(
    "json",
    z.object({
      query: z.string().min(1).max(1000),
      libraryId: z.string().optional(),
      limit: z.number().min(1).max(20).default(5),
    })
  ),
  async (c) => {
    const { query, libraryId, limit } = c.req.valid("json");
    const db = c.get("db");
    const env = c.env;

    // Generate embedding for query
    const queryEmbedding = await generateQueryEmbedding(query, env.AI);

    // Search Vectorize
    const filter = libraryId ? { libraryId } : undefined;
    const matches = await env.VECTORIZE.query(queryEmbedding, {
      topK: limit,
      filter,
      returnMetadata: "all",
    });

    if (matches.matches.length === 0) {
      return c.json({
        results: [],
        query,
        libraryId,
      });
    }

    // Fetch chunk content from R2
    const results = await Promise.all(
      matches.matches.map(async (match) => {
        const r2Key = `${match.metadata?.libraryId}/${match.id}`;
        const object = await env.DOCS_BUCKET.get(r2Key);
        const content = object ? await object.text() : "[Content not found]";

        return {
          id: match.id,
          libraryId: match.metadata?.libraryId as string,
          title: match.metadata?.title as string,
          content,
          contentType: match.metadata?.contentType as string,
          sourceFile: match.metadata?.sourceFile as string,
          score: match.score,
        };
      })
    );

    // Update stats for matched libraries
    const libraryIds = [...new Set(results.map((r) => r.libraryId))];
    await updateSearchStats(db, libraryIds, results.length);

    return c.json({
      results,
      query,
      libraryId,
    });
  }
);

// ============================================================================
// GET /api/libraries/:id/chunks - Get chunks for a library
// ============================================================================

librariesRouter.get(
  "/:id/chunks",
  zValidator(
    "query",
    z.object({
      limit: z.coerce.number().min(1).max(100).default(20),
      offset: z.coerce.number().min(0).default(0),
    })
  ),
  async (c) => {
    const id = c.req.param("id");
    const { limit, offset } = c.req.valid("query");
    const db = c.get("db");

    // Verify library exists
    const [library] = await db
      .select({ id: libraries.id })
      .from(libraries)
      .where(eq(libraries.id, id))
      .limit(1);

    if (!library) {
      return c.json({ error: "Library not found" }, 404);
    }

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
      .where(eq(chunks.libraryId, id))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(chunks)
      .where(eq(chunks.libraryId, id));

    const total = countResult[0]?.count || 0;

    return c.json({
      chunks: chunkResults,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + chunkResults.length < total,
      },
    });
  }
);

// ============================================================================
// GET /api/libraries/categories - Get available categories
// ============================================================================

librariesRouter.get("/meta/categories", async (c) => {
  // Static list of categories
  const categories = [
    { id: "frontend", label: "Frontend", icon: "layout" },
    { id: "backend", label: "Backend", icon: "server" },
    { id: "fullstack", label: "Full Stack", icon: "layers" },
    { id: "database", label: "Database", icon: "database" },
    { id: "cloud", label: "Cloud", icon: "cloud" },
    { id: "devops", label: "DevOps", icon: "settings" },
    { id: "ai", label: "AI / ML", icon: "brain" },
    { id: "testing", label: "Testing", icon: "check-circle" },
    { id: "mobile", label: "Mobile", icon: "smartphone" },
    { id: "utilities", label: "Utilities", icon: "wrench" },
  ];

  return c.json({ categories });
});

// ============================================================================
// Helper Functions
// ============================================================================

async function updateSearchStats(
  db: ReturnType<typeof import("@nexus/db").createDb>,
  libraryIds: string[],
  chunkHits: number
): Promise<void> {
  const now = new Date().toISOString();

  for (const libraryId of libraryIds) {
    try {
      await db
        .update(libraryStats)
        .set({
          totalQueries: sql`${libraryStats.totalQueries} + 1`,
          totalChunkHits: sql`${libraryStats.totalChunkHits} + ${chunkHits}`,
          lastQueriedAt: now,
        })
        .where(eq(libraryStats.libraryId, libraryId));
    } catch (error) {
      // Stats update is non-critical, log and continue
      console.warn(`Failed to update stats for ${libraryId}:`, error);
    }
  }
}

export { librariesRouter };
