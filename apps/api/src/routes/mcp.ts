import { Hono } from "hono";
import { eq, and, sql, inArray } from "drizzle-orm";
import { tools, servers, serverStats, type Database } from "@nexus/db";
import type { AppContext, MCPRequest, MCPResponse, MCPToolDefinition } from "../types";

const mcpRouter = new Hono<AppContext>();

// MCP Protocol endpoint (Streamable HTTP transport)
mcpRouter.post("/", async (c) => {
  const request = await c.req.json<MCPRequest>();
  const db = c.get("db");

  try {
    const response = await handleMCPRequest(request, db, c.env);
    return c.json(response);
  } catch (error) {
    return c.json({
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : "Internal error",
      },
    } satisfies MCPResponse);
  }
});

async function handleMCPRequest(
  request: MCPRequest,
  db: Database,
  env: Env
): Promise<MCPResponse> {
  switch (request.method) {
    case "initialize":
      return handleInitialize(request);

    case "tools/list":
      return handleToolsList(request, db, env);

    case "tools/call":
      return handleToolsCall(request, db, env);

    default:
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32601,
          message: `Method not found: ${request.method}`,
        },
      };
  }
}

function handleInitialize(request: MCPRequest): MCPResponse {
  return {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: { listChanged: true },
      },
      serverInfo: {
        name: "Nexus",
        version: "0.1.0",
      },
    },
  };
}

async function handleToolsList(
  request: MCPRequest,
  db: Database,
  env: Env
): Promise<MCPResponse> {
  // Try to get from cache first
  const cacheKey = "mcp:tools:list";
  const cached = await env.KV.get<MCPToolDefinition[]>(cacheKey, "json");

  if (cached) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: { tools: cached },
    };
  }

  // Fetch all tools from active servers using Drizzle
  const result = await db
    .select({
      namespace: tools.namespace,
      name: tools.name,
      description: tools.description,
      inputSchema: tools.inputSchema,
    })
    .from(tools)
    .innerJoin(servers, eq(tools.serverId, servers.id))
    .where(eq(servers.isActive, true))
    .orderBy(tools.namespace, tools.name);

  // Transform to MCP tool format with namespaced names
  const mcpTools: MCPToolDefinition[] = result.map((t) => ({
    name: `nexus.${t.namespace}.${t.name}`,
    description: t.description,
    inputSchema: t.inputSchema as MCPToolDefinition["inputSchema"],
  }));

  // Cache for 5 minutes
  await env.KV.put(cacheKey, JSON.stringify(mcpTools), { expirationTtl: 300 });

  return {
    jsonrpc: "2.0",
    id: request.id,
    result: { tools: mcpTools },
  };
}

async function handleToolsCall(
  request: MCPRequest,
  db: Database,
  env: Env
): Promise<MCPResponse> {
  const params = request.params as { name: string; arguments?: Record<string, unknown> };

  if (!params?.name) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32602,
        message: "Invalid params: 'name' is required",
      },
    };
  }

  // Parse tool name: nexus.{namespace}.{tool_name} or just {tool_name}
  const toolRoute = parseToolName(params.name);

  if (!toolRoute) {
    // Try semantic matching via Vectorize
    return await handleSemanticToolCall(request, params, db, env);
  }

  // Find the tool and its server using Drizzle
  const result = await db
    .select({
      id: tools.id,
      serverId: tools.serverId,
      name: tools.name,
      description: tools.description,
      inputSchema: tools.inputSchema,
      namespace: tools.namespace,
      endpoint: servers.endpoint,
      transport: servers.transport,
      authType: servers.authType,
    })
    .from(tools)
    .innerJoin(servers, eq(tools.serverId, servers.id))
    .where(
      and(
        eq(tools.namespace, toolRoute.namespace),
        eq(tools.name, toolRoute.toolName),
        eq(servers.isActive, true)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32602,
        message: `Tool not found: ${params.name}`,
      },
    };
  }

  const tool = result[0];

  // Proxy the call to the backend MCP server
  return await proxyToolCall(request, tool, params.arguments || {}, db);
}

function parseToolName(name: string): { namespace: string; toolName: string } | null {
  const parts = name.split(".");

  if (parts.length === 3 && parts[0] === "nexus") {
    return { namespace: parts[1], toolName: parts[2] };
  }

  if (parts.length === 2) {
    return { namespace: parts[0], toolName: parts[1] };
  }

  return null;
}

async function handleSemanticToolCall(
  request: MCPRequest,
  params: { name: string; arguments?: Record<string, unknown> },
  db: Database,
  env: Env
): Promise<MCPResponse> {
  // Generate embedding for the tool name/intent using Workers AI
  const embeddingResult = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
    text: params.name,
  });

  // Handle the embedding response
  const embedding = Array.isArray(embeddingResult)
    ? embeddingResult[0]
    : (embeddingResult as { data: number[][] }).data[0];

  // Search for matching tools
  const matches = await env.VECTORIZE.query(embedding, {
    topK: 1,
    returnMetadata: "all",
  });

  if (matches.matches.length === 0 || matches.matches[0].score < 0.7) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32602,
        message: `No matching tool found for: ${params.name}`,
      },
    };
  }

  // Get the matched tool using Drizzle
  const toolId = matches.matches[0].id;
  const result = await db
    .select({
      id: tools.id,
      serverId: tools.serverId,
      name: tools.name,
      description: tools.description,
      inputSchema: tools.inputSchema,
      namespace: tools.namespace,
      endpoint: servers.endpoint,
      transport: servers.transport,
      authType: servers.authType,
    })
    .from(tools)
    .innerJoin(servers, eq(tools.serverId, servers.id))
    .where(and(eq(tools.id, toolId), eq(servers.isActive, true)))
    .limit(1);

  if (result.length === 0) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32602,
        message: `Tool not found: ${params.name}`,
      },
    };
  }

  return await proxyToolCall(request, result[0], params.arguments || {}, db);
}

type ToolWithServer = {
  id: string;
  serverId: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  namespace: string;
  endpoint: string;
  transport: string;
  authType: string;
};

async function proxyToolCall(
  request: MCPRequest,
  tool: ToolWithServer,
  args: Record<string, unknown>,
  db: Database
): Promise<MCPResponse> {
  const startTime = Date.now();

  try {
    // TODO: Implement actual MCP server proxy
    // This would:
    // 1. Establish connection to backend server based on transport type
    // 2. Forward the tools/call request
    // 3. Return the response

    // For now, simulate the call
    const result = {
      content: [
        {
          type: "text",
          text: `[Nexus Proxy] Tool '${tool.name}' from '${tool.namespace}' would be called with args: ${JSON.stringify(args)}`,
        },
      ],
    };

    // Update stats
    const latency = Date.now() - startTime;
    await updateServerStats(db, tool.serverId, true, latency);

    return {
      jsonrpc: "2.0",
      id: request.id,
      result,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    await updateServerStats(db, tool.serverId, false, latency);

    throw error;
  }
}

async function updateServerStats(
  db: Database,
  serverId: string,
  success: boolean,
  latencyMs: number
): Promise<void> {
  // Check if stats exist
  const existing = await db
    .select()
    .from(serverStats)
    .where(eq(serverStats.serverId, serverId))
    .limit(1);

  const now = new Date().toISOString();

  if (existing.length === 0) {
    // Insert new stats
    await db.insert(serverStats).values({
      serverId,
      totalCalls: 1,
      successCount: success ? 1 : 0,
      totalLatencyMs: latencyMs,
      lastCalledAt: now,
    });
  } else {
    // Update existing stats
    await db
      .update(serverStats)
      .set({
        totalCalls: sql`${serverStats.totalCalls} + 1`,
        successCount: success
          ? sql`${serverStats.successCount} + 1`
          : serverStats.successCount,
        totalLatencyMs: sql`${serverStats.totalLatencyMs} + ${latencyMs}`,
        lastCalledAt: now,
      })
      .where(eq(serverStats.serverId, serverId));
  }
}

export { mcpRouter };
