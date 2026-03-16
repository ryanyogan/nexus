import { Hono } from "hono";
import { eq, like, and, or, desc, sql, isNull } from "drizzle-orm";
import { libraries, libraryStats, mcpServers, mcpServerStats, stacks, userStacks, STACK_CATEGORIES, type Database, type TokenBudget, type StackCategory } from "@nexus/db";
import { generateQueryEmbedding } from "../lib/embeddings";
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
} from "../lib/memory";
import type { AppContext, MCPRequest, MCPResponse, MCPToolDefinition, MemoryType, ResponseFormat, MCPSession } from "../types";

const mcpRouter = new Hono<AppContext>();

// ============================================================================
// Response Format Helpers
// ============================================================================

/**
 * Format tool response based on requested format for token efficiency.
 */
function formatToolResponse(
  result: unknown,
  toolName: string,
  format: ResponseFormat = "full"
): unknown {
  if (format === "full" || typeof result !== "object" || result === null) {
    return result;
  }

  const obj = result as Record<string, unknown>;

  switch (format) {
    case "compact":
      return formatCompact(obj, toolName);
    case "code-only":
      return formatCodeOnly(obj, toolName);
    case "summary":
      return formatSummary(obj, toolName);
    default:
      return result;
  }
}

/**
 * Compact format - essential data only, no metadata.
 */
function formatCompact(obj: Record<string, unknown>, toolName: string): unknown {
  // Remove verbose fields while keeping essential data
  const { success, message, recommendation, hints, suggestions, availableCategories, ...rest } = obj;
  
  // For query-docs, only keep essential result fields
  if (toolName === "query-docs" && Array.isArray(rest.results)) {
    return {
      library: rest.libraryName,
      results: (rest.results as Array<Record<string, unknown>>).map((r) => ({
        title: r.title,
        content: r.content,
        source: r.sourceFile,
      })),
    };
  }

  // For resolve-library, simplify results
  if (toolName === "resolve-library" && Array.isArray(rest.results)) {
    return {
      results: (rest.results as Array<Record<string, unknown>>).map((r) => ({
        id: r.libraryId,
        name: r.name,
        chunks: (r.documentationCoverage as Record<string, unknown>)?.chunks,
      })),
    };
  }

  // For recall-memories, keep just memories
  if (toolName === "recall-memories" && Array.isArray(rest.memories)) {
    return {
      memories: (rest.memories as Array<Record<string, unknown>>).map((m) => ({
        id: m.memoryId,
        title: m.title,
        content: m.content,
        project: m.project,
      })),
    };
  }

  return rest;
}

/**
 * Code-only format - extract code blocks and minimal context.
 */
function formatCodeOnly(obj: Record<string, unknown>, toolName: string): unknown {
  // For query-docs, extract only code content
  if (toolName === "query-docs" && Array.isArray(obj.results)) {
    const codeResults = (obj.results as Array<Record<string, unknown>>)
      .filter((r) => r.contentType === "code" || (r.content as string)?.includes("```"))
      .map((r) => {
        const content = r.content as string;
        // Extract code blocks if mixed content
        const codeBlocks = content.match(/```[\s\S]*?```/g);
        return {
          title: r.title,
          code: codeBlocks ? codeBlocks.join("\n\n") : content,
          source: r.sourceFile,
        };
      });
    
    return {
      library: obj.libraryName,
      codeExamples: codeResults,
    };
  }

  // For other tools, return compact format
  return formatCompact(obj, toolName);
}

/**
 * Summary format - brief overview with key points.
 */
function formatSummary(obj: Record<string, unknown>, toolName: string): unknown {
  // For query-docs, provide a brief summary
  if (toolName === "query-docs" && Array.isArray(obj.results)) {
    const results = obj.results as Array<Record<string, unknown>>;
    return {
      library: obj.libraryName,
      query: obj.query,
      found: results.length,
      topics: results.slice(0, 3).map((r) => r.title).filter(Boolean),
      hint: results.length > 0 
        ? "Use 'compact' or 'full' format for complete content."
        : "No results found. Try different search terms.",
    };
  }

  // For resolve-library, summarize matches
  if (toolName === "resolve-library" && Array.isArray(obj.results)) {
    const results = obj.results as Array<Record<string, unknown>>;
    const best = results[0];
    return {
      found: results.length,
      bestMatch: best ? { id: best.libraryId, name: best.name } : null,
      otherMatches: results.slice(1, 4).map((r) => r.name),
    };
  }

  // For list-libraries, just show count and categories
  if (toolName === "list-libraries" && Array.isArray(obj.libraries)) {
    const libs = obj.libraries as Array<Record<string, unknown>>;
    return {
      total: libs.length,
      featured: libs.filter((l) => l.isFeatured).map((l) => l.name),
      categories: obj.availableCategories,
    };
  }

  // Default: return key fields only
  const { success, results, libraries, memories, ...rest } = obj;
  return {
    status: success ? "ok" : "error",
    count: Array.isArray(results) ? results.length 
         : Array.isArray(libraries) ? libraries.length
         : Array.isArray(memories) ? memories.length
         : undefined,
    ...rest,
  };
}

// ============================================================================
// Tool Definitions
// ============================================================================

const TOOLS: MCPToolDefinition[] = [
  {
    name: "resolve-library",
    description:
      "Search for a library/package by name to get its Context7-compatible library ID. " +
      "Use this before query-docs to find the correct library ID. " +
      "Returns matching libraries with their IDs, descriptions, and documentation coverage stats.",
    inputSchema: {
      type: "object",
      properties: {
        libraryName: {
          type: "string",
          description: "The name of the library to search for (e.g., 'react', 'nextjs', 'hono')",
        },
        query: {
          type: "string",
          description:
            "Optional: The task or question you need help with. Used to rank results by relevance.",
        },
      },
      required: ["libraryName"],
    },
  },
  {
    name: "query-docs",
    description:
      "Search documentation for a specific library using semantic search. " +
      "Returns relevant code examples, API references, and explanations. " +
      "You must call resolve-library first to get the library ID.",
    inputSchema: {
      type: "object",
      properties: {
        libraryId: {
          type: "string",
          description: "The library ID obtained from resolve-library (e.g., 'react', 'nextjs')",
        },
        query: {
          type: "string",
          description:
            "The question or task you need help with. Be specific. " +
            "Good: 'How to set up authentication with JWT' " +
            "Bad: 'auth'",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (1-10, default 5)",
        },
        tokens: {
          type: "string",
          enum: ["full", "compact", "code-only", "summary"],
          description:
            "Response format for token efficiency. 'full' (default): complete response with metadata. " +
            "'compact': essential data only. 'code-only': only code blocks. 'summary': brief overview.",
        },
      },
      required: ["libraryId", "query"],
    },
  },
  {
    name: "get-library-info",
    description:
      "Get detailed information about a specific library including description, " +
      "version, documentation coverage, and usage statistics.",
    inputSchema: {
      type: "object",
      properties: {
        libraryId: {
          type: "string",
          description: "The library ID (e.g., 'react', 'nextjs', 'hono')",
        },
      },
      required: ["libraryId"],
    },
  },
  {
    name: "list-libraries",
    description:
      "List all available indexed libraries. Optionally filter by category. " +
      "Use this to discover what documentation is available.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            "Filter by category: frontend, backend, fullstack, database, cloud, devops, ai, testing, mobile, utilities",
        },
        limit: {
          type: "number",
          description: "Maximum number of results (1-50, default 20)",
        },
      },
    },
  },

  // ============================================================================
  // Memory Tools
  // ============================================================================

  {
    name: "save-memory",
    description:
      "Store a memory for later retrieval. Memories persist across sessions and can be " +
      "searched semantically. Use this to save project context, session summaries, " +
      "architectural decisions, or lessons learned. Requires authentication for writing.",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The full content of the memory to store",
        },
        title: {
          type: "string",
          description: "A short, descriptive title (max 100 chars)",
        },
        type: {
          type: "string",
          description:
            "Memory type: 'project_context' (architecture, tech stack, conventions), " +
            "'session_summary' (what was accomplished), 'decision' (architectural decisions with rationale), " +
            "'correction' (lessons learned, things to avoid)",
        },
        tags: {
          type: "array",
          description: "Tags for categorization (e.g., ['auth', 'cloudflare'])",
        },
        project: {
          type: "string",
          description: "Project name (e.g., 'nexus')",
        },
        summary: {
          type: "string",
          description: "Optional short summary for listing (max 200 chars)",
        },
        importance: {
          type: "number",
          description: "Importance score 1-10 (default 5). Higher = more relevant in searches.",
        },
      },
      required: ["content", "title", "type"],
    },
  },
  {
    name: "recall-memories",
    description:
      "Search for relevant memories using semantic search. Returns memories that match " +
      "the query conceptually, not just by keywords. Use this to retrieve context, " +
      "past decisions, or lessons learned.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "What to search for (natural language)",
        },
        type: {
          type: "string",
          description: "Filter by memory type: project_context, session_summary, decision, correction",
        },
        project: {
          type: "string",
          description: "Filter by project name",
        },
        tags: {
          type: "array",
          description: "Filter by tags (all must match)",
        },
        limit: {
          type: "number",
          description: "Max results (1-10, default 5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get-project-context",
    description:
      "Get all stored context for a specific project. Returns project architecture, " +
      "conventions, recent decisions, and lessons learned. Use this at the start of " +
      "a session to understand the project.",
    inputSchema: {
      type: "object",
      properties: {
        project: {
          type: "string",
          description: "Project name (e.g., 'nexus')",
        },
        includeTypes: {
          type: "array",
          description: "Filter to specific types (default: all)",
        },
        limit: {
          type: "number",
          description: "Max memories per type (default 5)",
        },
      },
      required: ["project"],
    },
  },
  {
    name: "list-memories",
    description:
      "Browse stored memories with filtering. Returns summaries without full content. " +
      "Use recall-memories for semantic search instead.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "Filter by memory type",
        },
        project: {
          type: "string",
          description: "Filter by project name",
        },
        limit: {
          type: "number",
          description: "Max results (1-50, default 20)",
        },
        offset: {
          type: "number",
          description: "Pagination offset",
        },
      },
    },
  },
  {
    name: "update-memory",
    description: "Update an existing memory. Can modify content, title, tags, importance, or summary.",
    inputSchema: {
      type: "object",
      properties: {
        memoryId: {
          type: "string",
          description: "ID of memory to update",
        },
        content: {
          type: "string",
          description: "New content (will regenerate embedding)",
        },
        title: {
          type: "string",
          description: "New title",
        },
        tags: {
          type: "array",
          description: "New tags",
        },
        importance: {
          type: "number",
          description: "New importance (1-10)",
        },
        summary: {
          type: "string",
          description: "New summary",
        },
      },
      required: ["memoryId"],
    },
  },
  {
    name: "delete-memory",
    description: "Delete a memory permanently.",
    inputSchema: {
      type: "object",
      properties: {
        memoryId: {
          type: "string",
          description: "ID of memory to delete",
        },
      },
      required: ["memoryId"],
    },
  },

  // ============================================================================
  // MCP Server Registry Tools
  // ============================================================================

  {
    name: "discover-servers",
    description:
      "Search for MCP servers by capability, category, or name. " +
      "Returns matching servers with their installation instructions and capabilities. " +
      "Use this to find servers that can give AI access to databases, filesystems, APIs, etc.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "What you're looking for (e.g., 'database access', 'file system', 'github')",
        },
        capabilities: {
          type: "array",
          description: "Filter by capabilities: 'tools', 'resources', 'prompts'",
        },
        category: {
          type: "string",
          description:
            "Filter by category: database, filesystem, devtools, ai, cloud, productivity, etc.",
        },
        official: {
          type: "boolean",
          description: "Only show official MCP servers from modelcontextprotocol org",
        },
        limit: {
          type: "number",
          description: "Maximum results (1-20, default 10)",
        },
      },
    },
  },
  {
    name: "get-server-info",
    description:
      "Get detailed information about a specific MCP server including its tools, " +
      "resources, prompts, installation instructions, and documentation links.",
    inputSchema: {
      type: "object",
      properties: {
        serverId: {
          type: "string",
          description: "The server ID (e.g., 'filesystem', 'postgres', 'github')",
        },
      },
      required: ["serverId"],
    },
  },
  {
    name: "get-server-config",
    description:
      "Generate installation configuration for an MCP server. " +
      "Returns ready-to-use config for Claude Desktop, VS Code, or other MCP clients.",
    inputSchema: {
      type: "object",
      properties: {
        serverId: {
          type: "string",
          description: "The server ID to get config for",
        },
        format: {
          type: "string",
          description: "Config format: 'claude-desktop' (default), 'vscode', 'generic'",
        },
      },
      required: ["serverId"],
    },
  },
  {
    name: "list-server-categories",
    description: "List all available MCP server categories for filtering.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // ============================================================================
  // Stack Tools
  // ============================================================================

  {
    name: "get-stack",
    description:
      "Get compiled prompt for a specific stack. Returns token-efficient context " +
      "including stack instructions, CLI preferences, repo patterns, and package documentation. " +
      "Use this to bootstrap AI with project scaffolding knowledge.",
    inputSchema: {
      type: "object",
      properties: {
        stackId: {
          type: "string",
          description: "The stack ID or slug (e.g., 'tanstack-start', 'hono-api')",
        },
        tokenBudget: {
          type: "string",
          enum: ["minimal", "standard", "comprehensive"],
          description:
            "Token budget for the response. 'minimal' (~2K tokens), " +
            "'standard' (~5K tokens, default), 'comprehensive' (~10K tokens)",
        },
      },
      required: ["stackId"],
    },
  },
  {
    name: "list-stacks",
    description:
      "List available stacks. Returns featured stacks, user's installed stacks, " +
      "or search results. Use this to discover project scaffolding templates.",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          enum: ["featured", "installed", "mine", "all"],
          description:
            "Filter stacks: 'featured' (popular public), 'installed' (user's installed), " +
            "'mine' (user's created), 'all' (search all public). Default: 'featured'",
        },
        category: {
          type: "string",
          description:
            "Filter by category: infrastructure, database, backend, fullstack, frontend, " +
            "desktop, styling, tui, tooling",
        },
        query: {
          type: "string",
          description: "Search query for finding stacks by name or description",
        },
        limit: {
          type: "number",
          description: "Maximum results (1-20, default 10)",
        },
      },
    },
  },
];

// ============================================================================
// MCP Protocol Endpoint - Streamable HTTP with JSON Response Mode
// ============================================================================

// Session expiry in seconds (1 hour)
const SESSION_EXPIRY_SECONDS = 60 * 60;

// KV-based session management
async function getSession(kv: KVNamespace, sessionId: string): Promise<MCPSession | null> {
  try {
    const session = await kv.get<MCPSession>(`mcp:session:${sessionId}`, "json");
    if (session) {
      // Update last accessed time
      const updated: MCPSession = {
        ...session,
        lastAccessedAt: Date.now(),
        requestCount: session.requestCount + 1,
      };
      await kv.put(`mcp:session:${sessionId}`, JSON.stringify(updated), {
        expirationTtl: SESSION_EXPIRY_SECONDS,
      });
      return updated;
    }
    return null;
  } catch {
    return null;
  }
}

async function createSession(kv: KVNamespace, userId?: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const session: MCPSession = {
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    userId,
    requestCount: 0,
  };
  await kv.put(`mcp:session:${sessionId}`, JSON.stringify(session), {
    expirationTtl: SESSION_EXPIRY_SECONDS,
  });
  return sessionId;
}

async function deleteSession(kv: KVNamespace, sessionId: string): Promise<boolean> {
  try {
    await kv.delete(`mcp:session:${sessionId}`);
    return true;
  } catch {
    return false;
  }
}

// Friendly error message for missing API key
const API_KEY_REQUIRED_ERROR = {
  code: -32001,
  message: "API key required. Get your free API key at https://nexus.yogan.dev/dashboard/keys or run 'npx @nexus/cli login' to authenticate.",
  data: {
    docsUrl: "https://docs.nexus.yogan.dev/getting-started",
    dashboardUrl: "https://nexus.yogan.dev/dashboard/keys",
    cliCommand: "npx @nexus/cli login",
  },
};

// POST /mcp - Main MCP endpoint (supports both stateful and stateless)
mcpRouter.post("/", async (c) => {
  const request = await c.req.json<MCPRequest>();
  const db = c.get("db");
  const kv = c.env.KV;
  const user = c.get("user");
  const authType = c.get("authType");

  // Require authentication for tool calls
  // Allow initialize, tools/list, resources/list, prompts/list without auth (discovery)
  const publicMethods = ["initialize", "tools/list", "resources/list", "prompts/list"];
  const requiresAuth = !publicMethods.includes(request.method);

  if (requiresAuth && authType === "anonymous") {
    return c.json({
      jsonrpc: "2.0",
      id: request.id,
      error: API_KEY_REQUIRED_ERROR,
    } satisfies MCPResponse, 401);
  }

  // Session management using KV
  let sessionId = c.req.header("Mcp-Session-Id");
  let isNewSession = false;

  // For initialize requests, create a new session
  if (request.method === "initialize") {
    sessionId = await createSession(kv, user?.id);
    isNewSession = true;
  } else if (sessionId) {
    // Validate existing session
    const session = await getSession(kv, sessionId);
    if (!session) {
      // Session expired or invalid - create new one
      sessionId = await createSession(kv, user?.id);
      isNewSession = true;
    }
  }

  try {
    const response = await handleMCPRequest(request, db, c.env);
    
    // Add session ID to response headers for new sessions
    if (isNewSession && sessionId) {
      c.header("Mcp-Session-Id", sessionId);
    }
    
    return c.json(response);
  } catch (error) {
    console.error("MCP request error:", error);
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

// GET /mcp - Server-Sent Events endpoint for streaming (optional)
mcpRouter.get("/", async (c) => {
  const sessionId = c.req.header("Mcp-Session-Id");
  const kv = c.env.KV;
  
  if (!sessionId) {
    return c.json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32000,
        message: "Missing session ID. Initialize a session first with POST.",
      },
    }, 400);
  }

  const session = await getSession(kv, sessionId);
  if (!session) {
    return c.json({
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32000,
        message: "Invalid or expired session ID. Initialize a new session with POST.",
      },
    }, 400);
  }

  // For now, return a simple status. Full SSE streaming can be added later.
  return c.json({
    jsonrpc: "2.0",
    id: null,
    result: {
      status: "connected",
      sessionId,
      requestCount: session.requestCount,
      message: "SSE streaming not yet implemented. Use POST for tool calls.",
    },
  });
});

// DELETE /mcp - Close session
mcpRouter.delete("/", async (c) => {
  const sessionId = c.req.header("Mcp-Session-Id");
  const kv = c.env.KV;
  
  if (sessionId) {
    const deleted = await deleteSession(kv, sessionId);
    if (deleted) {
      return c.json({ success: true, message: "Session closed" });
    }
  }
  
  return c.json({ success: false, message: "Session not found" }, 404);
});

// ============================================================================
// Request Handler
// ============================================================================

async function handleMCPRequest(
  request: MCPRequest,
  db: Database,
  env: Env
): Promise<MCPResponse> {
  switch (request.method) {
    case "initialize":
      return handleInitialize(request);

    case "tools/list":
      return handleToolsList(request);

    case "tools/call":
      return handleToolsCall(request, db, env);

    case "resources/list":
      return handleResourcesList(request, db);

    case "resources/read":
      return handleResourcesRead(request, db, env);

    case "prompts/list":
      return handlePromptsList(request);

    case "prompts/get":
      return handlePromptsGet(request, db, env);

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

// ============================================================================
// Protocol Handlers
// ============================================================================

function handleInitialize(request: MCPRequest): MCPResponse {
  return {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
        prompts: { listChanged: false },
      },
      serverInfo: {
        name: "Nexus Documentation Oracle",
        version: "1.0.0",
        description: "AI-powered documentation search, MCP server registry, and persistent memory for coding assistants.",
      },
    },
  };
}

function handleToolsList(request: MCPRequest): MCPResponse {
  return {
    jsonrpc: "2.0",
    id: request.id,
    result: { tools: TOOLS },
  };
}

async function handleToolsCall(
  request: MCPRequest,
  db: Database,
  env: Env
): Promise<MCPResponse> {
  const params = request.params as {
    name: string;
    arguments?: Record<string, unknown>;
  };

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

  const args = params.arguments || {};
  
  // Extract response format from args (defaults to "full")
  const responseFormat = (args.tokens as ResponseFormat) || "full";

  try {
    let result: unknown;

    switch (params.name) {
      case "resolve-library":
        result = await toolResolveLibrary(args, db, env);
        break;

      case "query-docs":
        result = await toolQueryDocs(args, db, env);
        break;

      case "get-library-info":
        result = await toolGetLibraryInfo(args, db);
        break;

      case "list-libraries":
        result = await toolListLibraries(args, db);
        break;

      // Memory tools
      case "save-memory":
        result = await toolSaveMemory(args, db, env);
        break;

      case "recall-memories":
        result = await toolRecallMemories(args, db, env);
        break;

      case "get-project-context":
        result = await toolGetProjectContext(args, db, env);
        break;

      case "list-memories":
        result = await toolListMemories(args, db);
        break;

      case "update-memory":
        result = await toolUpdateMemory(args, db, env);
        break;

      case "delete-memory":
        result = await toolDeleteMemory(args, db, env);
        break;

      // MCP Server Registry tools
      case "discover-servers":
        result = await toolDiscoverServers(args, db);
        break;

      case "get-server-info":
        result = await toolGetServerInfo(args, db);
        break;

      case "get-server-config":
        result = await toolGetServerConfig(args, db);
        break;

      case "list-server-categories":
        result = await toolListServerCategories(db);
        break;

      // Stack tools
      case "get-stack":
        result = await toolGetStack(args, db, env);
        break;

      case "list-stacks":
        result = await toolListStacks(args, db, env);
        break;

      default:
        return {
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: -32602,
            message: `Unknown tool: ${params.name}`,
          },
        };
    }

    // Apply response format transformation
    const formattedResult = formatToolResponse(result, params.name, responseFormat);
    
    // Use compact JSON for non-full formats
    const jsonIndent = responseFormat === "full" ? 2 : undefined;

    return {
      jsonrpc: "2.0",
      id: request.id,
      result: {
        content: [
          {
            type: "text",
            text: typeof formattedResult === "string" 
              ? formattedResult 
              : JSON.stringify(formattedResult, null, jsonIndent),
          },
        ],
      },
    };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : "Tool execution failed",
      },
    };
  }
}

// ============================================================================
// Resources Handlers
// ============================================================================

async function handleResourcesList(
  request: MCPRequest,
  db: Database
): Promise<MCPResponse> {
  // List indexed libraries as resources
  const indexedLibraries = await db
    .select({
      id: libraries.id,
      name: libraries.name,
      description: libraries.description,
      totalChunks: libraries.totalChunks,
    })
    .from(libraries)
    .where(and(eq(libraries.isActive, true), eq(libraries.indexStatus, "indexed")))
    .orderBy(desc(libraries.isFeatured), desc(libraries.totalChunks))
    .limit(50);

  const resources = indexedLibraries.map((lib) => ({
    uri: `nexus://library/${lib.id}/docs`,
    name: `${lib.name} Documentation`,
    description: lib.description || `Documentation for ${lib.name}`,
    mimeType: "text/markdown",
  }));

  // Also list MCP servers as resources
  const servers = await db
    .select({
      id: mcpServers.id,
      displayName: mcpServers.displayName,
      name: mcpServers.name,
      description: mcpServers.description,
    })
    .from(mcpServers)
    .where(eq(mcpServers.isActive, true))
    .orderBy(desc(mcpServers.isOfficial), desc(mcpServers.isFeatured))
    .limit(50);

  const serverResources = servers.map((server) => ({
    uri: `nexus://server/${server.id}/config`,
    name: `${server.displayName || server.name} Config`,
    description: `Installation config for ${server.displayName || server.name}`,
    mimeType: "application/json",
  }));

  return {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      resources: [...resources, ...serverResources],
    },
  };
}

async function handleResourcesRead(
  request: MCPRequest,
  db: Database,
  env: Env
): Promise<MCPResponse> {
  const params = request.params as { uri?: string };
  const uri = params?.uri;

  if (!uri) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32602,
        message: "uri is required",
      },
    };
  }

  // Parse the URI
  // nexus://library/{libraryId}/docs
  // nexus://server/{serverId}/config
  const libraryMatch = uri.match(/^nexus:\/\/library\/([^/]+)\/docs$/);
  const serverMatch = uri.match(/^nexus:\/\/server\/([^/]+)\/config$/);

  if (libraryMatch) {
    const libraryId = libraryMatch[1];
    const [library] = await db
      .select()
      .from(libraries)
      .where(eq(libraries.id, libraryId))
      .limit(1);

    if (!library) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32602,
          message: `Library "${libraryId}" not found`,
        },
      };
    }

    // Return library metadata as content
    const content = `# ${library.name}

${library.description || ""}

## Quick Info
- **Repository**: ${library.repositoryUrl || "N/A"}
- **Homepage**: ${library.homepageUrl || "N/A"}
- **Documentation Chunks**: ${library.totalChunks}
- **Total Tokens**: ${library.totalTokens}
- **Categories**: ${library.categories.join(", ") || "N/A"}

## Usage
Use the \`query-docs\` tool with libraryId "${library.id}" to search this library's documentation.

Example:
\`\`\`json
{
  "name": "query-docs",
  "arguments": {
    "libraryId": "${library.id}",
    "query": "your question here"
  }
}
\`\`\`
`;

    return {
      jsonrpc: "2.0",
      id: request.id,
      result: {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: content,
          },
        ],
      },
    };
  }

  if (serverMatch) {
    const serverId = serverMatch[1];
    const [server] = await db
      .select()
      .from(mcpServers)
      .where(eq(mcpServers.id, serverId))
      .limit(1);

    if (!server) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32602,
          message: `Server "${serverId}" not found`,
        },
      };
    }

    // Generate config
    let config: Record<string, unknown>;
    if (server.transportType === "http" || server.transportType === "sse") {
      config = {
        mcpServers: {
          [server.id]: {
            url: server.packageName,
            type: "http",
          },
        },
      };
    } else {
      const args = [...(server.installArgs || [])];
      if (server.packageName && !args.includes(server.packageName)) {
        args.unshift("-y", server.packageName);
      }
      config = {
        mcpServers: {
          [server.id]: {
            command: server.installCommand || "npx",
            args,
            ...(Object.keys(server.envVars || {}).length > 0 && { env: server.envVars }),
          },
        },
      };
    }

    return {
      jsonrpc: "2.0",
      id: request.id,
      result: {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(config, null, 2),
          },
        ],
      },
    };
  }

  return {
    jsonrpc: "2.0",
    id: request.id,
    error: {
      code: -32602,
      message: `Invalid resource URI: ${uri}`,
    },
  };
}

// ============================================================================
// Prompts Handlers
// ============================================================================

const PROMPTS = [
  {
    name: "debug-with-docs",
    description: "Debug an error using library documentation for context",
    arguments: [
      {
        name: "error",
        description: "The error message or stack trace",
        required: true,
      },
      {
        name: "library",
        description: "The library name (e.g., 'react', 'nextjs')",
        required: true,
      },
    ],
  },
  {
    name: "setup-mcp-server",
    description: "Get step-by-step instructions to set up an MCP server",
    arguments: [
      {
        name: "serverId",
        description: "The MCP server ID (use discover-servers to find IDs)",
        required: true,
      },
      {
        name: "client",
        description: "The MCP client: 'claude-desktop', 'vscode', or 'other'",
        required: false,
      },
    ],
  },
  {
    name: "learn-library",
    description: "Get a structured learning path for a library",
    arguments: [
      {
        name: "library",
        description: "The library name (e.g., 'react', 'hono')",
        required: true,
      },
      {
        name: "experience",
        description: "Your experience level: 'beginner', 'intermediate', 'advanced'",
        required: false,
      },
    ],
  },
];

function handlePromptsList(request: MCPRequest): MCPResponse {
  return {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      prompts: PROMPTS,
    },
  };
}

async function handlePromptsGet(
  request: MCPRequest,
  db: Database,
  env: Env
): Promise<MCPResponse> {
  const params = request.params as { name?: string; arguments?: Record<string, string> };
  const promptName = params?.name;
  const promptArgs = params?.arguments || {};

  if (!promptName) {
    return {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: -32602,
        message: "name is required",
      },
    };
  }

  let messages: Array<{ role: string; content: { type: string; text: string } }> = [];

  switch (promptName) {
    case "debug-with-docs": {
      const error = promptArgs.error || "No error provided";
      const library = promptArgs.library || "unknown";

      messages = [
        {
          role: "user",
          content: {
            type: "text",
            text: `I'm encountering this error while using ${library}:

\`\`\`
${error}
\`\`\`

Please help me debug this. First, use the query-docs tool to search for relevant documentation about this error or related concepts in ${library}. Then provide a clear explanation of:
1. What the error means
2. Common causes
3. How to fix it with code examples`,
          },
        },
      ];
      break;
    }

    case "setup-mcp-server": {
      const serverId = promptArgs.serverId || "unknown";
      const client = promptArgs.client || "claude-desktop";

      messages = [
        {
          role: "user",
          content: {
            type: "text",
            text: `Help me set up the MCP server "${serverId}" for ${client}.

Please:
1. Use get-server-info to get details about this server
2. Use get-server-config to get the installation configuration
3. Provide clear step-by-step instructions including:
   - Any prerequisites or API keys needed
   - Where to add the configuration
   - How to verify it's working`,
          },
        },
      ];
      break;
    }

    case "learn-library": {
      const library = promptArgs.library || "unknown";
      const experience = promptArgs.experience || "beginner";

      messages = [
        {
          role: "user",
          content: {
            type: "text",
            text: `I want to learn ${library}. My experience level is: ${experience}.

Please:
1. Use resolve-library to find ${library}
2. Use query-docs to search for "getting started" and "core concepts"
3. Create a structured learning path with:
   - Prerequisites
   - Core concepts to understand first
   - Key features to learn
   - Best practices
   - Common pitfalls to avoid
   - Recommended next steps

Include code examples from the documentation where helpful.`,
          },
        },
      ];
      break;
    }

    default:
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32602,
          message: `Unknown prompt: ${promptName}`,
        },
      };
  }

  return {
    jsonrpc: "2.0",
    id: request.id,
    result: {
      description: PROMPTS.find((p) => p.name === promptName)?.description,
      messages,
    },
  };
}

// ============================================================================
// Tool Implementations
// ============================================================================

interface ResolveLibraryArgs {
  libraryName?: string;
  query?: string;
}

async function toolResolveLibrary(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const { libraryName, query } = args as ResolveLibraryArgs;

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
    return {
      success: false,
      message: `No libraries found matching "${libraryName}". Use list-libraries to see available libraries.`,
      suggestions: [],
    };
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

interface QueryDocsArgs {
  libraryId?: string;
  query?: string;
  limit?: number;
}

async function toolQueryDocs(
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
    throw new Error(
      `Library "${libraryId}" not found. Use resolve-library to search for available libraries.`
    );
  }

  if (library.indexStatus !== "indexed") {
    throw new Error(
      `Library "${libraryId}" is not yet indexed (status: ${library.indexStatus}). Try again later.`
    );
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
      message: "No relevant documentation found for this query. Try rephrasing or being more specific.",
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

interface GetLibraryInfoArgs {
  libraryId?: string;
}

async function toolGetLibraryInfo(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const { libraryId } = args as GetLibraryInfoArgs;

  if (!libraryId) {
    throw new Error("libraryId is required");
  }

  const [library] = await db
    .select()
    .from(libraries)
    .where(eq(libraries.id, libraryId))
    .limit(1);

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

interface ListLibrariesArgs {
  category?: string;
  limit?: number;
}

async function toolListLibraries(
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
  const filtered = category
    ? results.filter((lib) => lib.categories.includes(category))
    : results;

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

async function updateQueryStats(
  db: Database,
  libraryId: string,
  chunkHits: number
): Promise<void> {
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

// ============================================================================
// Memory Tool Implementations
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

async function toolSaveMemory(
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

interface RecallMemoriesArgs {
  query?: string;
  type?: string;
  project?: string;
  tags?: string[];
  limit?: number;
}

async function toolRecallMemories(
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

interface GetProjectContextArgs {
  project?: string;
  includeTypes?: string[];
  limit?: number;
}

async function toolGetProjectContext(
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

interface ListMemoriesArgs {
  type?: string;
  project?: string;
  limit?: number;
  offset?: number;
}

async function toolListMemories(
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

interface UpdateMemoryArgs {
  memoryId?: string;
  content?: string;
  title?: string;
  tags?: string[];
  importance?: number;
  summary?: string;
}

async function toolUpdateMemory(
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

interface DeleteMemoryArgs {
  memoryId?: string;
}

async function toolDeleteMemory(
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

// ============================================================================
// MCP Server Registry Tool Implementations
// ============================================================================

interface DiscoverServersArgs {
  query?: string;
  capabilities?: string[];
  category?: string;
  official?: boolean;
  limit?: number;
}

async function toolDiscoverServers(
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
    hint: formattedResults.length > 0
      ? `Use get-server-config with serverId "${formattedResults[0].serverId}" to get installation instructions.`
      : "No servers found. Try a different search or use list-server-categories to see available categories.",
  };
}

interface GetServerInfoArgs {
  serverId?: string;
}

async function toolGetServerInfo(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const { serverId } = args as GetServerInfoArgs;

  if (!serverId) {
    throw new Error("serverId is required");
  }

  const [server] = await db
    .select()
    .from(mcpServers)
    .where(eq(mcpServers.id, serverId))
    .limit(1);

  if (!server) {
    throw new Error(`Server "${serverId}" not found. Use discover-servers to find available servers.`);
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

interface GetServerConfigArgs {
  serverId?: string;
  format?: string;
}

async function toolGetServerConfig(
  args: Record<string, unknown>,
  db: Database
): Promise<object> {
  const { serverId, format = "claude-desktop" } = args as GetServerConfigArgs;

  if (!serverId) {
    throw new Error("serverId is required");
  }

  const [server] = await db
    .select()
    .from(mcpServers)
    .where(eq(mcpServers.id, serverId))
    .limit(1);

  if (!server) {
    throw new Error(`Server "${serverId}" not found. Use discover-servers to find available servers.`);
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
  const fullConfig = format === "claude-desktop" 
    ? { mcpServers: config }
    : config;

  // Note about env vars
  const envVarNote = Object.keys(server.envVars || {}).length > 0
    ? `\n\nRequired environment variables:\n${Object.entries(server.envVars || {}).map(([k, v]) => `- ${k}: ${v || "(your value)"}`).join("\n")}`
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

async function toolListServerCategories(db: Database): Promise<object> {
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

// Helper function to update discovery stats
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

// ============================================================================
// Stack Tool Implementations
// ============================================================================

async function toolGetStack(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const stackId = args.stackId as string;
  const tokenBudget = (args.tokenBudget as TokenBudget) || "standard";

  if (!stackId) {
    return {
      success: false,
      error: "stackId is required",
    };
  }

  // Find stack by ID or slug
  const [stack] = await db
    .select()
    .from(stacks)
    .where(
      and(
        or(eq(stacks.id, stackId), eq(stacks.slug, stackId)),
        eq(stacks.isActive, true),
        or(eq(stacks.isPublic, true), eq(stacks.isStarter, true))
      )
    )
    .limit(1);

  if (!stack) {
    return {
      success: false,
      error: `Stack not found: ${stackId}`,
      hint: "Use list-stacks to discover available stacks.",
    };
  }

  // Check if compiled prompt exists
  if (!stack.compiledPrompt && stack.learningStatus !== "complete") {
    return {
      success: false,
      error: "Stack has not been compiled yet",
      stackId: stack.id,
      stackName: stack.name,
      learningStatus: stack.learningStatus,
      hint: "The stack owner needs to compile this stack first.",
    };
  }

  // Get compiled prompt - may be in R2 for large prompts
  let compiledPrompt = stack.compiledPrompt;
  
  if (stack.r2Key && env.DOCS_BUCKET) {
    try {
      const object = await env.DOCS_BUCKET.get(stack.r2Key);
      if (object) {
        compiledPrompt = await object.text();
      }
    } catch (error) {
      console.warn(`Failed to fetch stack prompt from R2: ${stack.r2Key}`, error);
    }
  }

  // Apply token budget truncation if needed
  const budgetLimits: Record<TokenBudget, number> = {
    minimal: 2000,
    standard: 5000,
    comprehensive: 10000,
  };
  const maxTokens = budgetLimits[tokenBudget];
  
  // Rough token estimation (4 chars per token)
  const estimatedTokens = Math.ceil((compiledPrompt?.length || 0) / 4);
  let truncatedPrompt = compiledPrompt;
  
  if (estimatedTokens > maxTokens && compiledPrompt) {
    // Truncate to fit budget
    const maxChars = maxTokens * 4;
    truncatedPrompt = compiledPrompt.slice(0, maxChars) + "\n\n[... truncated to fit token budget ...]";
  }

  // Update use count
  await db
    .update(stacks)
    .set({
      useCount: sql`${stacks.useCount} + 1`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(stacks.id, stack.id));

  return {
    success: true,
    stack: {
      id: stack.id,
      name: stack.name,
      slug: stack.slug,
      description: stack.description,
      category: stack.category,
      layer: stack.layer,
      tokenBudget: tokenBudget,
      estimatedTokens: Math.ceil((truncatedPrompt?.length || 0) / 4),
    },
    prompt: truncatedPrompt,
    preferences: stack.cliPreferences,
    hint: estimatedTokens > maxTokens
      ? `Prompt truncated from ~${estimatedTokens} to ~${maxTokens} tokens. Use 'comprehensive' budget for full content.`
      : undefined,
  };
}

async function toolListStacks(
  args: Record<string, unknown>,
  db: Database,
  env: Env
): Promise<object> {
  const filter = (args.filter as string) || "featured";
  const category = args.category as string | undefined;
  const query = args.query as string | undefined;
  const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 20);

  // Build conditions based on filter
  const conditions: ReturnType<typeof eq>[] = [eq(stacks.isActive, true)];

  switch (filter) {
    case "featured":
      conditions.push(or(eq(stacks.isFeatured, true), eq(stacks.isStarter, true))!);
      break;
    case "all":
      conditions.push(eq(stacks.isPublic, true));
      break;
    // 'installed' and 'mine' require auth - will return empty for now
    case "installed":
    case "mine":
      return {
        success: true,
        stacks: [],
        count: 0,
        hint: "Authentication required to view installed or owned stacks. Use the web dashboard instead.",
      };
  }

  // Add category filter
  if (category && STACK_CATEGORIES.includes(category as StackCategory)) {
    conditions.push(eq(stacks.category, category as StackCategory));
  }

  // Add search query
  if (query) {
    conditions.push(
      or(
        like(stacks.name, `%${query}%`),
        like(stacks.description, `%${query}%`)
      )!
    );
  }

  const results = await db
    .select({
      id: stacks.id,
      name: stacks.name,
      slug: stacks.slug,
      description: stacks.description,
      category: stacks.category,
      layer: stacks.layer,
      icon: stacks.icon,
      color: stacks.color,
      isStarter: stacks.isStarter,
      isFeatured: stacks.isFeatured,
      useCount: stacks.useCount,
      forkCount: stacks.forkCount,
      tokenCount: stacks.tokenCount,
      learningStatus: stacks.learningStatus,
    })
    .from(stacks)
    .where(and(...conditions))
    .orderBy(desc(stacks.isFeatured), desc(stacks.isStarter), desc(stacks.useCount))
    .limit(limit);

  return {
    success: true,
    filter,
    category: category || "all",
    query: query || undefined,
    stacks: results.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      category: s.category,
      layer: s.layer,
      icon: s.icon,
      isStarter: s.isStarter,
      isFeatured: s.isFeatured,
      stats: {
        uses: s.useCount,
        forks: s.forkCount,
        tokens: s.tokenCount,
      },
      ready: s.learningStatus === "complete",
    })),
    count: results.length,
    hint:
      results.length === 0
        ? "No stacks found. Try different filters or search terms."
        : "Use get-stack with a stack ID or slug to retrieve the compiled prompt.",
  };
}

/**
 * Handle MCP request with full context (for use from /sse endpoint)
 * Returns the response body and metadata without wrapping in Hono response
 */
export async function handleMCPRequestWithContext(
  request: MCPRequest,
  c: import("hono").Context<AppContext>
): Promise<{ body: MCPResponse; sessionId?: string; status: number }> {
  const db = c.get("db");
  const kv = c.env.KV;
  const user = c.get("user");
  const authType = c.get("authType");

  // Require authentication for tool calls
  const publicMethods = ["initialize", "tools/list", "resources/list", "prompts/list"];
  const requiresAuth = !publicMethods.includes(request.method);

  if (requiresAuth && authType === "anonymous") {
    return {
      body: {
        jsonrpc: "2.0",
        id: request.id,
        error: API_KEY_REQUIRED_ERROR,
      },
      status: 401,
    };
  }

  // Session management using KV
  let sessionId = c.req.header("Mcp-Session-Id");
  let isNewSession = false;

  if (request.method === "initialize") {
    sessionId = await createSession(kv, user?.id);
    isNewSession = true;
  } else if (sessionId) {
    const session = await getSession(kv, sessionId);
    if (!session) {
      sessionId = await createSession(kv, user?.id);
      isNewSession = true;
    }
  }

  try {
    const response = await handleMCPRequest(request, db, c.env);
    return {
      body: response,
      sessionId: isNewSession ? sessionId : undefined,
      status: 200,
    };
  } catch (error) {
    console.error("MCP request error:", error);
    return {
      body: {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal error",
        },
      },
      status: 500,
    };
  }
}

export { mcpRouter };
