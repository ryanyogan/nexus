import { eq, like, and, or, desc, sql } from "drizzle-orm";
import { mcpServers, mcpServerStats, type Database } from "@nexus/db";

// ============================================================================
// Argument Types
// ============================================================================

interface DiscoverServersArgs {
  query?: string;
  capabilities?: string[];
  category?: string;
  official?: boolean;
  limit?: number;
}

interface GetServerInfoArgs {
  serverId?: string;
}

interface GetServerConfigArgs {
  serverId?: string;
  format?: string;
}

// ============================================================================
// Tool Implementations
// ============================================================================

export async function toolDiscoverServers(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const { query, capabilities, category, official, limit = 10 } = args as DiscoverServersArgs;

  const conditions = [eq(mcpServers.isActive, true)];

  // Search by query
  if (query) {
    const searchTerm = `%${query.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${mcpServers.name})`, searchTerm),
        like(sql`lower(${mcpServers.displayName})`, searchTerm),
        like(sql`lower(${mcpServers.description})`, searchTerm)
      )!
    );
  }

  // Filter by capabilities
  if (capabilities?.includes("tools")) {
    conditions.push(eq(mcpServers.hasTools, true));
  }
  if (capabilities?.includes("resources")) {
    conditions.push(eq(mcpServers.hasResources, true));
  }
  if (capabilities?.includes("prompts")) {
    conditions.push(eq(mcpServers.hasPrompts, true));
  }

  // Filter by official
  if (official) {
    conditions.push(eq(mcpServers.isOfficial, true));
  }

  const clampedLimit = Math.min(Math.max(1, limit), 20);

  const results = await db
    .select({
      id: mcpServers.id,
      namespace: mcpServers.namespace,
      name: mcpServers.name,
      displayName: mcpServers.displayName,
      description: mcpServers.description,
      transportType: mcpServers.transportType,
      packageType: mcpServers.packageType,
      packageName: mcpServers.packageName,
      hasTools: mcpServers.hasTools,
      hasResources: mcpServers.hasResources,
      hasPrompts: mcpServers.hasPrompts,
      categories: mcpServers.categories,
      isOfficial: mcpServers.isOfficial,
      isVerified: mcpServers.isVerified,
      // Security
      securityRiskLevel: mcpServers.securityRiskLevel,
      isSecurityAudited: mcpServers.isSecurityAudited,
    })
    .from(mcpServers)
    .where(and(...conditions))
    .orderBy(desc(mcpServers.isOfficial), desc(mcpServers.isFeatured), desc(mcpServers.githubStars))
    .limit(clampedLimit);

  // Filter by category in JS (since categories is JSON)
  const filteredResults = category
    ? results.filter((s) => s.categories?.includes(category))
    : results;

  // Format for better readability
  const formattedResults = filteredResults.map((server) => ({
    serverId: server.id,
    name: server.displayName || server.name,
    description: server.description,
    namespace: server.namespace,
    transport: server.transportType,
    package: server.packageName,
    capabilities: {
      tools: server.hasTools,
      resources: server.hasResources,
      prompts: server.hasPrompts,
    },
    categories: server.categories,
    securityRiskLevel: server.securityRiskLevel || "medium",
    badges: [
      server.isOfficial && "official",
      server.isVerified && "verified",
      server.isSecurityAudited && "security-audited",
    ].filter(Boolean),
  }));

  return {
    success: true,
    query: query || null,
    filters: { capabilities, category, official },
    resultCount: formattedResults.length,
    results: formattedResults,
    hint:
      formattedResults.length > 0
        ? `Use get-server-config with serverId "${formattedResults[0].serverId}" to get installation instructions.`
        : "No servers found. Try a different search or use list-server-categories to see available categories.",
  };
}

export async function toolGetServerInfo(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const { serverId } = args as GetServerInfoArgs;

  if (!serverId) {
    throw new Error("serverId is required");
  }

  const [server] = await db.select().from(mcpServers).where(eq(mcpServers.id, serverId)).limit(1);

  if (!server) {
    throw new Error(
      `Server "${serverId}" not found. Use discover-servers to find available servers.`
    );
  }

  // Update discovery stats (non-blocking)
  updateServerDiscoveryStats(db, serverId).catch(console.error);

  return {
    serverId: server.id,
    name: server.displayName || server.name,
    namespace: server.namespace,
    description: server.description,
    version: server.version,

    installation: {
      transport: server.transportType,
      packageType: server.packageType,
      package: server.packageName,
      command: server.installCommand,
      args: server.installArgs,
      requiredEnvVars: server.envVars,
    },

    capabilities: {
      hasTools: server.hasTools,
      hasResources: server.hasResources,
      hasPrompts: server.hasPrompts,
      tools: server.tools,
      resources: server.resources,
      prompts: server.prompts,
    },

    links: {
      repository: server.repositoryUrl,
      documentation: server.documentationUrl,
      homepage: server.homepageUrl,
    },

    metadata: {
      author: server.author,
      license: server.license,
      categories: server.categories,
      keywords: server.keywords,
    },

    stats: {
      githubStars: server.githubStars,
      weeklyDownloads: server.weeklyDownloads,
    },

    security: {
      riskLevel: server.securityRiskLevel || "medium",
      capabilities: server.securityCapabilities || [],
      notes: server.securityNotes,
      isAudited: server.isSecurityAudited || false,
      auditedAt: server.securityAuditedAt,
    },

    badges: [
      server.isOfficial && "official",
      server.isVerified && "verified",
      server.isFeatured && "featured",
      server.isSecurityAudited && "security-audited",
    ].filter(Boolean),

    hint: `Use get-server-config with serverId "${server.id}" to get ready-to-use installation config.`,
  };
}

export async function toolGetServerConfig(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const { serverId, format = "claude-desktop" } = args as GetServerConfigArgs;

  if (!serverId) {
    throw new Error("serverId is required");
  }

  const [server] = await db.select().from(mcpServers).where(eq(mcpServers.id, serverId)).limit(1);

  if (!server) {
    throw new Error(
      `Server "${serverId}" not found. Use discover-servers to find available servers.`
    );
  }

  // Generate config based on transport type
  let config: Record<string, unknown>;
  let instructions: string;

  if (server.transportType === "http" || server.transportType === "sse") {
    // Remote server config
    config = {
      [server.id]: {
        url: server.packageName,
        type: "http",
      },
    };
    instructions = "Add this to your MCP client configuration.";
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

    if (format === "claude-desktop") {
      instructions = `Add this to your Claude Desktop config:
- macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
- Windows: %APPDATA%\\Claude\\claude_desktop_config.json

Merge the "mcpServers" object with any existing servers.`;
    } else if (format === "vscode") {
      instructions = "Add this to your VS Code mcp.json settings file.";
    } else {
      instructions = "Use this configuration with your MCP client.";
    }
  }

  // Format the full config for Claude Desktop
  const fullConfig = format === "claude-desktop" ? { mcpServers: config } : config;

  // Note about env vars
  const envVarNote =
    Object.keys(server.envVars || {}).length > 0
      ? `\n\nRequired environment variables:\n${Object.entries(server.envVars || {})
          .map(([k, v]) => `- ${k}: ${v || "(your value)"}`)
          .join("\n")}`
      : "";

  return {
    success: true,
    serverId: server.id,
    serverName: server.displayName || server.name,
    format,
    config: fullConfig,
    configJson: JSON.stringify(fullConfig, null, 2),
    instructions: instructions + envVarNote,
  };
}

export async function toolListServerCategories(db: Database): Promise<object> {
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

  return {
    success: true,
    categories,
    count: categories.length,
    hint: "Use discover-servers with category filter to find servers in a specific category.",
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

async function updateServerDiscoveryStats(db: Database, serverId: string): Promise<void> {
  const now = new Date().toISOString();

  try {
    const result = await db
      .update(mcpServerStats)
      .set({
        totalDiscoveries: sql`${mcpServerStats.totalDiscoveries} + 1`,
        lastDiscoveredAt: now,
      })
      .where(eq(mcpServerStats.serverId, serverId));

    const changes = (result as { meta?: { changes?: number } }).meta?.changes;
    if (changes === 0) {
      await db.insert(mcpServerStats).values({
        serverId,
        totalDiscoveries: 1,
        totalConfigCopies: 0,
        lastDiscoveredAt: now,
      });
    }
  } catch (error) {
    console.warn(`Failed to update discovery stats for ${serverId}:`, error);
  }
}
