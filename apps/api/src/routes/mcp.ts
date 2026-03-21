import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { libraries, mcpServers, PROMPT_CATEGORIES, type Database } from "@nexus/db";
import type {
  AppContext,
  MCPRequest,
  MCPResponse,
  MCPToolDefinition,
  ResponseFormat,
  MCPSession,
} from "../types";

// Tool implementations (extracted to separate modules)
import { formatToolResponse } from "./mcp/format";
import {
  toolListPrompts,
  toolGetPrompt,
  toolSearchPrompts,
  toolSavePrompt,
} from "./mcp/tools/prompts";
import {
  toolSaveMemory,
  toolRecallMemories,
  toolGetProjectContext,
  toolListMemories,
  toolUpdateMemory,
  toolDeleteMemory,
} from "./mcp/tools/memories";
import {
  toolDiscoverServers,
  toolGetServerInfo,
  toolGetServerConfig,
  toolListServerCategories,
} from "./mcp/tools/servers";
import { toolGetStack, toolListStacks } from "./mcp/tools/stacks";
import {
  toolResolveLibrary,
  toolQueryDocs,
  toolGetLibraryInfo,
  toolListLibraries,
} from "./mcp/tools/libraries";

const mcpRouter = new Hono<AppContext>();

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
          description:
            "Filter by memory type: project_context, session_summary, decision, correction",
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
    description:
      "Update an existing memory. Can modify content, title, tags, importance, or summary.",
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
          description: "What you're looking for (e.g., 'database access', 'file system', 'github')",
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

  // ============================================================================
  // Prompt Tools
  // ============================================================================

  {
    name: "list-prompts",
    description:
      "List available prompts (system prompts, starter packs). Returns prompts with their " +
      "system instructions, skills, libraries, and MCP servers. Use this to discover " +
      "pre-built prompt configurations for different use cases.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Filter by category: " + PROMPT_CATEGORIES.join(", "),
        },
        starterOnly: {
          type: "boolean",
          description: "Only show starter pack prompts (default: true)",
        },
        search: {
          type: "string",
          description: "Search prompts by name or description",
        },
        limit: {
          type: "number",
          description: "Maximum results (1-20, default 10)",
        },
      },
    },
  },
  {
    name: "get-prompt",
    description:
      "Get detailed information about a specific prompt by ID or slug. Returns the full " +
      "system prompt, skills, libraries, MCP servers, and preferences. Use this to " +
      "retrieve a prompt configuration to apply to your session.",
    inputSchema: {
      type: "object",
      properties: {
        promptId: {
          type: "string",
          description: "The prompt ID or slug (e.g., 'typescript-expert', 'react-developer')",
        },
        resolve: {
          type: "boolean",
          description: "Resolve inheritance chain and merge parent prompts (default: true)",
        },
      },
      required: ["promptId"],
    },
  },
  {
    name: "search-prompts",
    description:
      "Search for prompts by keywords in name, description, or system prompt content. " +
      "Returns matching prompts ranked by relevance.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (keywords to find in prompts)",
        },
        category: {
          type: "string",
          description: "Filter by category: " + PROMPT_CATEGORIES.join(", "),
        },
        limit: {
          type: "number",
          description: "Maximum results (1-10, default 5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "save-prompt",
    description:
      "Create or update a user prompt. Requires authentication. Use this to save " +
      "custom prompt configurations for reuse across sessions.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Prompt name (e.g., 'My TypeScript Config')",
        },
        description: {
          type: "string",
          description: "Short description of what this prompt is for",
        },
        systemPrompt: {
          type: "string",
          description: "The system prompt / instructions content",
        },
        parentPromptId: {
          type: "string",
          description: "Optional parent prompt ID to inherit from",
        },
        skills: {
          type: "array",
          description: "Skill identifiers to include (e.g., ['typescript', 'react'])",
        },
        libraries: {
          type: "array",
          description: "Library identifiers for documentation (e.g., ['hono', 'drizzle'])",
        },
        mcpServers: {
          type: "array",
          description: "MCP server identifiers (e.g., ['filesystem', 'postgres'])",
        },
        category: {
          type: "string",
          description: "Category: " + PROMPT_CATEGORIES.join(", "),
        },
        tags: {
          type: "array",
          description: "Tags for organization (e.g., ['backend', 'api'])",
        },
        isPublic: {
          type: "boolean",
          description: "Make this prompt publicly discoverable (default: false)",
        },
        promptId: {
          type: "string",
          description: "If updating an existing prompt, provide its ID",
        },
      },
      required: ["name", "systemPrompt"],
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
  message:
    "API key required. Get your free API key at https://nexus.yogan.dev/dashboard/keys or run 'npx @nexus/cli login' to authenticate.",
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
    return c.json(
      {
        jsonrpc: "2.0",
        id: request.id,
        error: API_KEY_REQUIRED_ERROR,
      } satisfies MCPResponse,
      401
    );
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
    return c.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: "Missing session ID. Initialize a session first with POST.",
        },
      },
      400
    );
  }

  const session = await getSession(kv, sessionId);
  if (!session) {
    return c.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: "Invalid or expired session ID. Initialize a new session with POST.",
        },
      },
      400
    );
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

async function handleMCPRequest(request: MCPRequest, db: Database, env: Env): Promise<MCPResponse> {
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
        description:
          "AI-powered documentation search, MCP server registry, and persistent memory for coding assistants.",
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

async function handleToolsCall(request: MCPRequest, db: Database, env: Env): Promise<MCPResponse> {
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

      // Prompt tools
      case "list-prompts":
        result = await toolListPrompts(args, db);
        break;

      case "get-prompt":
        result = await toolGetPrompt(args, db);
        break;

      case "search-prompts":
        result = await toolSearchPrompts(args, db);
        break;

      case "save-prompt":
        result = await toolSavePrompt(args, db);
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
            text:
              typeof formattedResult === "string"
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

async function handleResourcesList(request: MCPRequest, db: Database): Promise<MCPResponse> {
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
    const [library] = await db.select().from(libraries).where(eq(libraries.id, libraryId)).limit(1);

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
    const [server] = await db.select().from(mcpServers).where(eq(mcpServers.id, serverId)).limit(1);

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

async function handlePromptsGet(request: MCPRequest, db: Database, env: Env): Promise<MCPResponse> {
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
