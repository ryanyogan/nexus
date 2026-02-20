import { Hono } from "hono";
import { eq, and, inArray } from "drizzle-orm";
import { tools, servers } from "@nexus/db/schema";
import type { AppContext } from "../types";

const toolsRouter = new Hono<AppContext>();

// List all tools (with optional filtering)
toolsRouter.get("/", async (c) => {
  const { server_id, namespace, search } = c.req.query();
  const db = c.get("db");

  // Build conditions
  const conditions = [eq(servers.isActive, true)];

  if (server_id) {
    conditions.push(eq(tools.serverId, server_id));
  }

  if (namespace) {
    conditions.push(eq(tools.namespace, namespace));
  }

  const result = await db
    .select({
      id: tools.id,
      serverId: tools.serverId,
      name: tools.name,
      description: tools.description,
      inputSchema: tools.inputSchema,
      namespace: tools.namespace,
      createdAt: tools.createdAt,
      updatedAt: tools.updatedAt,
      serverName: servers.name,
    })
    .from(tools)
    .innerJoin(servers, eq(tools.serverId, servers.id))
    .where(and(...conditions))
    .orderBy(tools.namespace, tools.name);

  // Filter by search in memory
  let filtered = result;
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = result.filter(
      (t) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower)
    );
  }

  return c.json({
    tools: filtered,
    total: filtered.length,
  });
});

// Search tools semantically using Vectorize
toolsRouter.get("/search", async (c) => {
  const { q, limit = "10" } = c.req.query();
  const db = c.get("db");

  if (!q) {
    return c.json({ error: "Query parameter 'q' is required" }, 400);
  }

  // Generate embedding for the query using Workers AI
  const embeddingResult = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
    text: q,
  });

  // Handle the embedding response
  const embedding = Array.isArray(embeddingResult)
    ? embeddingResult[0]
    : (embeddingResult as { data: number[][] }).data[0];

  // Search Vectorize
  const matches = await c.env.VECTORIZE.query(embedding, {
    topK: parseInt(limit),
    returnMetadata: "all",
  });

  const toolIds = matches.matches.map((m) => m.id);

  if (toolIds.length === 0) {
    return c.json({ tools: [], total: 0 });
  }

  // Get full tool details using Drizzle
  const result = await db
    .select({
      id: tools.id,
      serverId: tools.serverId,
      name: tools.name,
      description: tools.description,
      inputSchema: tools.inputSchema,
      namespace: tools.namespace,
      createdAt: tools.createdAt,
      updatedAt: tools.updatedAt,
      serverName: servers.name,
    })
    .from(tools)
    .innerJoin(servers, eq(tools.serverId, servers.id))
    .where(and(eq(servers.isActive, true), inArray(tools.id, toolIds)));

  // Preserve order from vector search (by relevance)
  const toolMap = new Map(result.map((t) => [t.id, t]));
  const orderedTools = toolIds.map((id) => toolMap.get(id)).filter(Boolean);

  return c.json({
    tools: orderedTools,
    total: orderedTools.length,
    query: q,
  });
});

// Get single tool
toolsRouter.get("/:id", async (c) => {
  const { id } = c.req.param();
  const db = c.get("db");

  const result = await db
    .select({
      id: tools.id,
      serverId: tools.serverId,
      name: tools.name,
      description: tools.description,
      inputSchema: tools.inputSchema,
      namespace: tools.namespace,
      createdAt: tools.createdAt,
      updatedAt: tools.updatedAt,
      serverName: servers.name,
      serverEndpoint: servers.endpoint,
    })
    .from(tools)
    .innerJoin(servers, eq(tools.serverId, servers.id))
    .where(eq(tools.id, id))
    .limit(1);

  if (result.length === 0) {
    return c.json({ error: "Tool not found" }, 404);
  }

  return c.json({ tool: result[0] });
});

export { toolsRouter };
