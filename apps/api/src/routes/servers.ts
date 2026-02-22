import { Hono } from "hono";
import { eq, like, and, desc, or, sql } from "drizzle-orm";
import { mcpServers, mcpServerStats, mcpServerDocs, type Database } from "@nexus/db";
import type { AppContext } from "../types";

const serversRouter = new Hono<AppContext>();

// ============================================================================
// GET /api/servers - List MCP servers
// ============================================================================

serversRouter.get("/", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);

  // Query params
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const search = url.searchParams.get("search");
  const category = url.searchParams.get("category");
  const transportType = url.searchParams.get("transport");
  const hasTools = url.searchParams.get("hasTools") === "true";
  const hasResources = url.searchParams.get("hasResources") === "true";
  const hasPrompts = url.searchParams.get("hasPrompts") === "true";
  const official = url.searchParams.get("official") === "true";
  const featured = url.searchParams.get("featured") === "true";

  // Build conditions
  const conditions = [eq(mcpServers.isActive, true)];

  if (search) {
    const searchTerm = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${mcpServers.name})`, searchTerm),
        like(sql`lower(${mcpServers.displayName})`, searchTerm),
        like(sql`lower(${mcpServers.description})`, searchTerm)
      )!
    );
  }

  if (transportType) {
    conditions.push(eq(mcpServers.transportType, transportType as "stdio" | "http" | "sse"));
  }

  if (hasTools) {
    conditions.push(eq(mcpServers.hasTools, true));
  }

  if (hasResources) {
    conditions.push(eq(mcpServers.hasResources, true));
  }

  if (hasPrompts) {
    conditions.push(eq(mcpServers.hasPrompts, true));
  }

  if (official) {
    conditions.push(eq(mcpServers.isOfficial, true));
  }

  if (featured) {
    conditions.push(eq(mcpServers.isFeatured, true));
  }

  // Get servers
  const servers = await db
    .select({
      id: mcpServers.id,
      namespace: mcpServers.namespace,
      name: mcpServers.name,
      displayName: mcpServers.displayName,
      description: mcpServers.description,
      version: mcpServers.version,
      transportType: mcpServers.transportType,
      packageType: mcpServers.packageType,
      packageName: mcpServers.packageName,
      hasTools: mcpServers.hasTools,
      hasResources: mcpServers.hasResources,
      hasPrompts: mcpServers.hasPrompts,
      repositoryUrl: mcpServers.repositoryUrl,
      homepageUrl: mcpServers.homepageUrl,
      iconUrl: mcpServers.iconUrl,
      author: mcpServers.author,
      categories: mcpServers.categories,
      keywords: mcpServers.keywords,
      weeklyDownloads: mcpServers.weeklyDownloads,
      githubStars: mcpServers.githubStars,
      isVerified: mcpServers.isVerified,
      isOfficial: mcpServers.isOfficial,
      isFeatured: mcpServers.isFeatured,
      createdAt: mcpServers.createdAt,
    })
    .from(mcpServers)
    .where(and(...conditions))
    .orderBy(desc(mcpServers.isOfficial), desc(mcpServers.isFeatured), desc(mcpServers.githubStars))
    .limit(limit)
    .offset(offset);

  // Filter by category in JS (since categories is JSON)
  const filteredServers = category
    ? servers.filter((s) => s.categories?.includes(category))
    : servers;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(mcpServers)
    .where(and(...conditions));

  return c.json({
    servers: filteredServers,
    total: countResult[0]?.count || 0,
    limit,
    offset,
  });
});

// ============================================================================
// GET /api/servers/categories - List available categories
// ============================================================================

serversRouter.get("/categories", async (c) => {
  const db = c.get("db");

  const servers = await db
    .select({ categories: mcpServers.categories })
    .from(mcpServers)
    .where(eq(mcpServers.isActive, true));

  // Collect unique categories
  const categorySet = new Set<string>();
  for (const server of servers) {
    for (const cat of server.categories || []) {
      categorySet.add(cat);
    }
  }

  const categories = Array.from(categorySet).sort();

  return c.json({ categories });
});

// ============================================================================
// GET /api/servers/:id - Get server details
// ============================================================================

serversRouter.get("/:id", async (c) => {
  const db = c.get("db");
  const serverId = c.req.param("id");

  const [server] = await db
    .select()
    .from(mcpServers)
    .where(eq(mcpServers.id, serverId))
    .limit(1);

  if (!server) {
    return c.json({ error: "Server not found" }, 404);
  }

  // Get stats
  const [stats] = await db
    .select()
    .from(mcpServerStats)
    .where(eq(mcpServerStats.serverId, serverId))
    .limit(1);

  // Get linked documentation
  const docs = await db
    .select({ libraryId: mcpServerDocs.libraryId })
    .from(mcpServerDocs)
    .where(eq(mcpServerDocs.serverId, serverId));

  return c.json({
    server,
    stats: stats || { totalDiscoveries: 0, totalConfigCopies: 0 },
    linkedDocs: docs.map((d) => d.libraryId),
  });
});

// ============================================================================
// GET /api/servers/:id/config - Get installation config
// ============================================================================

serversRouter.get("/:id/config", async (c) => {
  const db = c.get("db");
  const serverId = c.req.param("id");
  const format = c.req.query("format") || "claude-desktop";

  const [server] = await db
    .select()
    .from(mcpServers)
    .where(eq(mcpServers.id, serverId))
    .limit(1);

  if (!server) {
    return c.json({ error: "Server not found" }, 404);
  }

  // Update stats (non-blocking)
  updateConfigCopyStats(db, serverId).catch(console.error);

  // Generate config based on format
  let config: Record<string, unknown>;

  if (server.transportType === "http" || server.transportType === "sse") {
    // Remote server config
    config = {
      [server.id]: {
        url: server.packageName, // For remote servers, packageName is the URL
        type: "http",
      },
    };
  } else {
    // STDIO server config
    const args = [...(server.installArgs || [])];
    if (server.packageName && !args.includes(server.packageName)) {
      args.unshift("-y", server.packageName);
    }

    config = {
      [server.id]: {
        command: server.installCommand || "npx",
        args,
        ...(Object.keys(server.envVars || {}).length > 0 && { env: server.envVars }),
      },
    };
  }

  if (format === "claude-desktop") {
    return c.json({
      format: "claude-desktop",
      config: { mcpServers: config },
      instructions: `Add this to your Claude Desktop config at:\n- macOS: ~/Library/Application Support/Claude/claude_desktop_config.json\n- Windows: %APPDATA%\\Claude\\claude_desktop_config.json`,
    });
  } else if (format === "vscode") {
    return c.json({
      format: "vscode",
      config,
      instructions: `Add this to your VS Code mcp.json file`,
    });
  } else {
    return c.json({
      format: "generic",
      config,
      server: {
        id: server.id,
        name: server.displayName || server.name,
        command: server.installCommand,
        args: server.installArgs,
        packageName: server.packageName,
        envVars: server.envVars,
      },
    });
  }
});

// ============================================================================
// Helper Functions
// ============================================================================

async function updateConfigCopyStats(db: Database, serverId: string): Promise<void> {
  const now = new Date().toISOString();

  try {
    const result = await db
      .update(mcpServerStats)
      .set({
        totalConfigCopies: sql`${mcpServerStats.totalConfigCopies} + 1`,
      })
      .where(eq(mcpServerStats.serverId, serverId));

    const changes = (result as { meta?: { changes?: number } }).meta?.changes;
    if (changes === 0) {
      await db.insert(mcpServerStats).values({
        serverId,
        totalDiscoveries: 0,
        totalConfigCopies: 1,
        lastDiscoveredAt: now,
      });
    }
  } catch (error) {
    console.warn(`Failed to update config copy stats for ${serverId}:`, error);
  }
}

export { serversRouter };
