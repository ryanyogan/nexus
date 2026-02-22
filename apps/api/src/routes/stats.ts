import { Hono } from "hono";
import { sql, eq, desc } from "drizzle-orm";
import { libraries, libraryStats, mcpServers } from "@nexus/db";
import type { AppContext } from "../types";

const statsRouter = new Hono<AppContext>();

// ============================================================================
// GET /api/stats - Get global statistics
// ============================================================================

statsRouter.get("/", async (c) => {
  const db = c.get("db");

  // Get library counts by status
  const libraryCounts = await db
    .select({
      status: libraries.indexStatus,
      count: sql<number>`count(*)`,
    })
    .from(libraries)
    .where(eq(libraries.isActive, true))
    .groupBy(libraries.indexStatus);

  // Get total indexed libraries
  const indexedCount = libraryCounts.find((c) => c.status === "indexed")?.count || 0;
  const pendingCount = libraryCounts.find((c) => c.status === "pending")?.count || 0;
  const indexingCount = libraryCounts.find((c) => c.status === "indexing")?.count || 0;

  // Get total chunks and tokens
  const totals = await db
    .select({
      totalChunks: sql<number>`sum(${libraries.totalChunks})`,
      totalTokens: sql<number>`sum(${libraries.totalTokens})`,
    })
    .from(libraries)
    .where(eq(libraries.indexStatus, "indexed"));

  // Get total queries
  const queryStats = await db
    .select({
      totalQueries: sql<number>`sum(${libraryStats.totalQueries})`,
      totalChunkHits: sql<number>`sum(${libraryStats.totalChunkHits})`,
    })
    .from(libraryStats);

  // Get MCP server count
  const serverCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(mcpServers)
    .where(eq(mcpServers.isActive, true));

  return c.json({
    libraries: {
      total: indexedCount + pendingCount + indexingCount,
      indexed: indexedCount,
      pending: pendingCount,
      indexing: indexingCount,
    },
    documentation: {
      totalChunks: totals[0]?.totalChunks || 0,
      totalTokens: totals[0]?.totalTokens || 0,
    },
    servers: {
      total: serverCount[0]?.count || 0,
    },
    usage: {
      totalQueries: queryStats[0]?.totalQueries || 0,
      totalChunkHits: queryStats[0]?.totalChunkHits || 0,
    },
  });
});

// ============================================================================
// GET /api/stats/popular - Get most queried libraries
// ============================================================================

statsRouter.get("/popular", async (c) => {
  const db = c.get("db");

  const popular = await db
    .select({
      id: libraries.id,
      name: libraries.name,
      iconUrl: libraries.iconUrl,
      totalQueries: libraryStats.totalQueries,
      totalChunkHits: libraryStats.totalChunkHits,
    })
    .from(libraryStats)
    .innerJoin(libraries, eq(libraryStats.libraryId, libraries.id))
    .where(eq(libraries.isActive, true))
    .orderBy(desc(libraryStats.totalQueries))
    .limit(10);

  return c.json({ popular });
});

// ============================================================================
// GET /api/stats/recent - Get recently indexed libraries
// ============================================================================

statsRouter.get("/recent", async (c) => {
  const db = c.get("db");

  const recent = await db
    .select({
      id: libraries.id,
      name: libraries.name,
      description: libraries.description,
      iconUrl: libraries.iconUrl,
      totalChunks: libraries.totalChunks,
      lastIndexedAt: libraries.lastIndexedAt,
    })
    .from(libraries)
    .where(eq(libraries.indexStatus, "indexed"))
    .orderBy(desc(libraries.lastIndexedAt))
    .limit(10);

  return c.json({ recent });
});

export { statsRouter };
