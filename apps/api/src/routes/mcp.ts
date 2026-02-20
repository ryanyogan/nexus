import { Hono } from "hono";
import { eq, like, and, desc, sql } from "drizzle-orm";
import { libraries, libraryStats, type Database } from "@nexus/db";
import { generateQueryEmbedding } from "../lib/embeddings";
import type { AppContext, MCPRequest, MCPResponse, MCPToolDefinition } from "../types";

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
];

// ============================================================================
// MCP Protocol Endpoint
// ============================================================================

mcpRouter.post("/", async (c) => {
  const request = await c.req.json<MCPRequest>();
  const db = c.get("db");

  try {
    const response = await handleMCPRequest(request, db, c.env);
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
      },
      serverInfo: {
        name: "Nexus Documentation Oracle",
        version: "1.0.0",
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

    return {
      jsonrpc: "2.0",
      id: request.id,
      result: {
        content: [
          {
            type: "text",
            text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
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

export { mcpRouter };
