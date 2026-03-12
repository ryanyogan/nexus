import { Command } from "commander";
import chalk from "chalk";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { logger } from "../utils/logger.js";
import { outputJson, isJsonOutput } from "../utils/json.js";
import { getToken, isAuthenticated, getApiUrl } from "../services/config.js";
import { Nexus } from "@nexus/sdk";

interface ServeOptions {
  port?: string;
  offline?: boolean;
  json?: boolean;
}

/**
 * Serve command - Run Nexus as an MCP server
 *
 * nexus serve              - Run as stdio MCP server
 * nexus serve --offline    - Run in offline mode (cache only)
 */
export const serveCommand = new Command("serve")
  .description("Run Nexus as an MCP server")
  .option("-p, --port <port>", "Port for HTTP server (not yet implemented)", "3456")
  .option("--offline", "Use cached docs only (no API calls)")
  .action(async (options: ServeOptions) => {
    const jsonOutput = isJsonOutput(options);

    if (!isAuthenticated() && !options.offline) {
      if (jsonOutput) {
        outputJson({ error: "Not authenticated. Use --offline for cache-only mode." });
      } else {
        logger.warn("Not authenticated. API calls will be limited.");
        logger.info("Run 'nexus auth login' for full access, or use --offline for cache-only mode.");
        logger.newline();
      }
    }

    if (options.offline) {
      if (!jsonOutput) {
        logger.info("Running in offline mode (cache only)");
      }
    }

    await runStdioServer(options);
  });

/**
 * Create the Nexus SDK client
 */
function createClient(): Nexus | null {
  const token = getToken();
  if (!token) {
    return null;
  }

  return new Nexus({
    apiKey: token,
    baseUrl: getApiUrl(),
  });
}

/**
 * Run as stdio MCP server
 */
async function runStdioServer(options: ServeOptions): Promise<void> {
  const client = createClient();

  // Create MCP server
  const server = new McpServer({
    name: "nexus",
    version: "1.0.0",
  });

  // ============================================================================
  // Documentation Tools
  // ============================================================================

  server.registerTool(
    "resolve-library",
    {
      description: "Search for libraries by name to find their library ID for querying documentation",
      inputSchema: {
        libraryName: z.string().describe("The name of the library to search for (e.g., 'react', 'nextjs', 'hono')"),
        query: z.string().optional().describe("Optional: The task or question you need help with. Used to rank results by relevance."),
      },
    },
    async ({ libraryName, query }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const libraries = await client.searchLibrary(query || libraryName, { limit: 10 });

        if (libraries.length === 0) {
          return {
            content: [{ type: "text", text: `No libraries found matching "${libraryName}". Try a different search term.` }],
          };
        }

        const results = libraries.map((lib) => ({
          id: lib.id,
          name: lib.name,
          description: lib.description,
          categories: lib.categories,
          totalSnippets: lib.totalSnippets,
          trustScore: lib.trustScore,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ libraries: results }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "query-docs",
    {
      description: "Search documentation for a specific library. Returns relevant code examples, API references, and explanations.",
      inputSchema: {
        libraryId: z.string().describe("The library ID obtained from resolve-library (e.g., 'react', 'nextjs')"),
        query: z.string().describe("The question or task you need help with. Be specific. Good: 'How to set up authentication with JWT' Bad: 'auth'"),
        limit: z.number().optional().describe("Maximum number of results to return (1-10, default 5)"),
      },
    },
    async ({ libraryId, query, limit }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.queryDocs(libraryId, query, { limit: limit || 5 });

        const response = {
          libraryId: result.libraryId,
          libraryName: result.libraryName,
          query: result.query,
          totalTokens: result.totalTokens,
          chunks: result.chunks.map((chunk) => ({
            title: chunk.title,
            content: chunk.content,
            contentType: chunk.contentType,
            sourceFile: chunk.sourceFile,
            sourceUrl: chunk.sourceUrl,
            score: chunk.score,
          })),
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "get-library-info",
    {
      description: "Get detailed information about a specific library including description, version, and documentation coverage.",
      inputSchema: {
        libraryId: z.string().describe("The library ID (e.g., 'react', 'nextjs', 'hono')"),
      },
    },
    async ({ libraryId }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const library = await client.getLibrary(libraryId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(library, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "list-libraries",
    {
      description: "List all available indexed libraries. Optionally filter by category.",
      inputSchema: {
        category: z.string().optional().describe("Filter by category: frontend, backend, fullstack, database, cloud, devops, ai, testing, mobile, utilities"),
        limit: z.number().optional().describe("Maximum number of results (1-50, default 20)"),
        featured: z.boolean().optional().describe("Only show featured libraries"),
      },
    },
    async ({ category, limit, featured }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.listLibraries({
          category,
          limit: limit || 20,
          featured,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ libraries: result.libraries, total: result.total }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // ============================================================================
  // Memory Tools
  // ============================================================================

  server.registerTool(
    "save-memory",
    {
      description: "Store a memory for later retrieval. Memories persist across sessions and can be searched semantically. Use this to save project context, session summaries, architectural decisions, or lessons learned.",
      inputSchema: {
        title: z.string().describe("A short, descriptive title (max 100 chars)"),
        content: z.string().describe("The full content of the memory to store"),
        type: z.enum(["project_context", "session_summary", "decision", "correction"]).describe("Memory type: 'project_context' (architecture, tech stack), 'session_summary' (what was accomplished), 'decision' (architectural decisions), 'correction' (lessons learned)"),
        project: z.string().optional().describe("Project name (e.g., 'nexus')"),
        tags: z.array(z.string()).optional().describe("Tags for categorization (e.g., ['auth', 'cloudflare'])"),
        importance: z.number().optional().describe("Importance score 1-10 (default 5). Higher = more relevant in searches."),
        summary: z.string().optional().describe("Optional short summary for listing (max 200 chars)"),
      },
    },
    async ({ title, content, type, project, tags, importance, summary }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const memory = await client.saveMemory({
          title,
          content,
          type,
          project,
          tags,
          importance,
          summary,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, memoryId: memory.id, title: memory.title }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "recall-memories",
    {
      description: "Search for relevant memories using semantic search. Returns memories that match the query conceptually. Use this to retrieve context, past decisions, or lessons learned.",
      inputSchema: {
        query: z.string().describe("What to search for (natural language)"),
        project: z.string().optional().describe("Filter by project name"),
        type: z.enum(["project_context", "session_summary", "decision", "correction"]).optional().describe("Filter by memory type"),
        tags: z.array(z.string()).optional().describe("Filter by tags (all must match)"),
        limit: z.number().optional().describe("Max results (1-10, default 5)"),
      },
    },
    async ({ query, project, type, tags, limit }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const memories = await client.recallMemories({
          query,
          project,
          type,
          tags,
          limit,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ memories }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "get-project-context",
    {
      description: "Get all stored context for a specific project. Returns project architecture, conventions, recent decisions, and lessons learned. Use this at the start of a session to understand the project.",
      inputSchema: {
        project: z.string().describe("Project name (e.g., 'nexus')"),
        limit: z.number().optional().describe("Max memories per type (default 5)"),
      },
    },
    async ({ project, limit }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const context = await client.getProjectContext(project, { limit });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(context, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // ============================================================================
  // MCP Server Discovery Tools
  // ============================================================================

  server.registerTool(
    "discover-servers",
    {
      description: "Search for MCP servers by capability, category, or name. Returns matching servers with their installation instructions and capabilities.",
      inputSchema: {
        query: z.string().optional().describe("What you're looking for (e.g., 'database access', 'file system', 'github')"),
        category: z.string().optional().describe("Filter by category: database, filesystem, devtools, ai, cloud, productivity, etc."),
        official: z.boolean().optional().describe("Only show official MCP servers from modelcontextprotocol org"),
        limit: z.number().optional().describe("Maximum results (1-20, default 10)"),
      },
    },
    async ({ query, category, official, limit }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const servers = await client.discoverServers({
          query,
          category,
          official,
          limit,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ servers }, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "get-server-info",
    {
      description: "Get detailed information about a specific MCP server including its tools, resources, prompts, installation instructions, and documentation links.",
      inputSchema: {
        serverId: z.string().describe("The server ID (e.g., 'filesystem', 'postgres', 'github')"),
      },
    },
    async ({ serverId }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const serverInfo = await client.getServer(serverId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(serverInfo, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "get-server-config",
    {
      description: "Generate installation configuration for an MCP server. Returns ready-to-use config for Claude Desktop, VS Code, or other MCP clients.",
      inputSchema: {
        serverId: z.string().describe("The server ID to get config for"),
        format: z.enum(["claude-desktop", "vscode", "opencode", "generic"]).optional().describe("Config format (default: generic)"),
      },
    },
    async ({ serverId, format }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const config = await client.getServerConfig(serverId, format);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(config, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  // ============================================================================
  // Start the server
  // ============================================================================

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is for MCP protocol)
  console.error(chalk.green("Nexus MCP server running on stdio"));
  console.error(chalk.gray("Tools available: resolve-library, query-docs, get-library-info, list-libraries,"));
  console.error(chalk.gray("                 save-memory, recall-memories, get-project-context,"));
  console.error(chalk.gray("                 discover-servers, get-server-info, get-server-config"));
}
