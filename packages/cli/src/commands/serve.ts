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

// Type definitions for SDK types
interface LearningType {
  id: string;
  type: "correction" | "pattern" | "preference" | "skill";
  trigger: string;
  response: string;
  context: string | null;
  scope: string;
  project: string | null;
}

interface ConnectedRepoType {
  id: string;
  fullName: string;
  indexStatus: string;
  totalFiles: number;
  totalBytes: number;
}

interface RepoFileType {
  id: string;
  path: string;
  fileType: string;
  language: string | null;
  sizeBytes: number;
  summary: string | null;
  content?: string;
}

interface RepoTreeNodeType {
  name: string;
  type: string;
  children?: RepoTreeNodeType[];
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

        const results = libraries.map((lib: { id: string; name: string; description: string | null; categories: string[]; totalSnippets: number; trustScore: number }) => ({
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
          chunks: result.chunks.map((chunk: { title: string | null; content: string; contentType: string; sourceFile: string | null; sourceUrl: string | null; score: number }) => ({
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
  // Flow Tools
  // ============================================================================

  server.registerTool(
    "list-flows",
    {
      description: "List available flows (starter packs + your custom flows). Flows are pre-configured AI working environments that bundle skills, docs, and preferences.",
      inputSchema: {
        search: z.string().optional().describe("Search flows by name or description"),
        category: z.string().optional().describe("Filter by category: frontend, backend, fullstack, testing, devops, design, api, mobile, ai, general"),
        starter: z.boolean().optional().describe("Only show official starter pack flows"),
        my: z.boolean().optional().describe("Only show flows you created"),
        limit: z.number().optional().describe("Maximum results (default 20)"),
      },
    },
    async ({ search, category, starter, my, limit }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.listFlows({ search, category, starter, my, limit });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
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
    "get-flow",
    {
      description: "Get detailed information about a specific flow, including its resolved system prompt (with inheritance applied).",
      inputSchema: {
        flowId: z.string().describe("The flow ID (e.g., 'flow-react-typescript', 'flow-tanstack-cloudflare')"),
      },
    },
    async ({ flowId }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.getFlow(flowId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
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
    "get-active-flows",
    {
      description: "Get the user's currently active flows. Active flows define the current AI working environment.",
      inputSchema: {},
    },
    async () => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.getActiveFlows();

        if (result.flows.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No active flows. Use activate-flow to activate a flow, or list-flows to see available flows.",
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
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
    "create-flow",
    {
      description: "Create a new custom flow. A flow bundles a system prompt with skills, libraries, and preferences to configure the AI's behavior.",
      inputSchema: {
        name: z.string().describe("Name for your flow (e.g., 'My React Expert')"),
        systemPrompt: z.string().describe("The system prompt instructions that define how the AI should behave"),
        description: z.string().optional().describe("Short description of what this flow does"),
        parentFlowId: z.string().optional().describe("Optional: ID of a flow to extend/inherit from (max 3 levels deep)"),
        skills: z.array(z.string()).optional().describe("Skill IDs to include (e.g., ['typescript-strict'])"),
        libraries: z.array(z.string()).optional().describe("Library IDs for documentation access (e.g., ['react', 'nextjs'])"),
        mcpServers: z.array(z.string()).optional().describe("MCP server IDs to recommend"),
        category: z.string().optional().describe("Category: frontend, backend, fullstack, testing, devops, design, api, mobile, ai, general"),
        tags: z.array(z.string()).optional().describe("Tags for categorization"),
      },
    },
    async ({ name, systemPrompt, description, parentFlowId, skills, libraries, mcpServers, category, tags }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.createFlow({
          name,
          systemPrompt,
          description,
          parentFlowId,
          skills,
          libraries,
          mcpServers,
          category: category as any,
          tags,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ ...result, message: `Flow "${name}" created successfully!` }, null, 2),
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
    "activate-flow",
    {
      description: "Activate a flow to configure the AI's working environment. Multiple flows can be active simultaneously. The flow's system prompt and context will be applied.",
      inputSchema: {
        flowId: z.string().describe("The flow ID to activate"),
        project: z.string().optional().describe("Optional: Project name to associate with this flow session"),
      },
    },
    async ({ flowId, project }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        // First ensure the flow is installed
        try {
          await client.installFlow(flowId);
        } catch {
          // Ignore if already installed
        }

        const result = await client.activateFlow(flowId, { project });

        // Return the flow's system prompt so the AI can adopt it
        return {
          content: [
            {
              type: "text",
              text: `Flow "${result.flow.name}" activated!\n\n` +
                `Session ID: ${result.sessionId}\n\n` +
                `## System Prompt\n\n${result.flow.systemPrompt}\n\n` +
                `## Libraries\n${result.flow.libraries.join(", ") || "None"}\n\n` +
                `## Skills\n${result.flow.skills.join(", ") || "None"}\n\n` +
                `---\nPlease follow the system prompt above for this session.`,
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
    "deactivate-flow",
    {
      description: "Deactivate a specific flow or all active flows. Use this to clean up context or switch to a different working mode.",
      inputSchema: {
        flowId: z.string().optional().describe("Specific flow ID to deactivate. If omitted, deactivates ALL active flows."),
      },
    },
    async ({ flowId }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        if (flowId) {
          await client.deactivateFlow(flowId);
          return {
            content: [{ type: "text", text: `Flow ${flowId} deactivated.` }],
          };
        } else {
          await client.deactivateAllFlows();
          return {
            content: [{ type: "text", text: "All flows deactivated. Context cleared." }],
          };
        }
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "download-flow",
    {
      description: "Download a flow as FLOW.md content. This can be saved to your project directory and referenced by CLAUDE.md or other instruction files.",
      inputSchema: {
        flowId: z.string().describe("The flow ID to download"),
      },
    },
    async ({ flowId }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.downloadFlow(flowId);

        return {
          content: [
            {
              type: "text",
              text: `# ${result.filename}\n\n\`\`\`markdown\n${result.content}\n\`\`\`\n\nSave this content to FLOW.md in your project directory.`,
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
    "suggest-flows",
    {
      description: "Suggest flows based on project dependencies or context. Analyzes package.json dependencies to recommend relevant flows.",
      inputSchema: {
        dependencies: z.array(z.string()).optional().describe("List of project dependencies (e.g., from package.json)"),
        projectName: z.string().optional().describe("Project name for context"),
      },
    },
    async ({ dependencies, projectName }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.suggestFlows({ dependencies, projectName });

        if (result.flows.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No matching flows found. Use list-flows to see all available flows.",
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Suggested flows based on your project:\n\n${result.flows.map((f: { id: string; name: string; description: string | null }) => 
                `- **${f.name}** (${f.id}): ${f.description || "No description"}`
              ).join("\n")}\n\nUse activate-flow to activate any of these.`,
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
  // Brain Tools - Learnings & Intelligence
  // ============================================================================

  server.registerTool(
    "record-learning",
    {
      description: "Record a correction, pattern, preference, or skill for the AI to learn from. Learnings are applied immediately in future interactions. Earns XP!",
      inputSchema: {
        type: z.enum(["correction", "pattern", "preference", "skill"]).optional().describe("Learning type: 'correction' (fix a mistake), 'pattern' (code pattern to use), 'preference' (user preference), 'skill' (new capability)"),
        trigger: z.string().describe("What triggers this learning (e.g., 'When writing React components', 'When user asks for tests')"),
        response: z.string().describe("The correct response/behavior (e.g., 'Always use TypeScript', 'Include edge case tests')"),
        context: z.string().optional().describe("Additional context about when this applies"),
        scope: z.enum(["global", "project", "library", "flow"]).optional().describe("Scope: 'global' (always applies), 'project' (specific project), 'library' (when using library), 'flow' (with specific flow)"),
        project: z.string().optional().describe("Project name (when scope='project')"),
        libraryId: z.string().optional().describe("Library ID (when scope='library')"),
        flowId: z.string().optional().describe("Flow ID (when scope='flow')"),
        confidence: z.number().optional().describe("Confidence level 0-1 (default 0.8)"),
      },
    },
    async ({ type, trigger, response, context, scope, project, libraryId, flowId, confidence }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.createLearning({
          type: type || "correction",
          trigger,
          response,
          context,
          scope: scope || "global",
          project,
          libraryId,
          flowId,
          confidence,
        });

        return {
          content: [
            {
              type: "text",
              text: `Learning recorded!\n\n` +
                `ID: ${result.learningId}\n` +
                `Type: ${type || "correction"}\n` +
                `Trigger: "${trigger}"\n` +
                `Response: "${response}"\n\n` +
                `+${result.xp.xpAwarded} XP earned!` +
                (result.xp.leveledUp ? ` Level up! Now level ${result.xp.newLevel}!` : ""),
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
    "get-learnings",
    {
      description: "Get learnings that apply to the current context. Use at the start of a session to load applicable corrections, patterns, and preferences.",
      inputSchema: {
        project: z.string().optional().describe("Project name to get project-specific learnings"),
        library: z.string().optional().describe("Library ID to get library-specific learnings"),
        flow: z.string().optional().describe("Flow ID to get flow-specific learnings"),
      },
    },
    async ({ project, library, flow }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.getActiveLearnings({ project, library, flow });

        if (result.learnings.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No learnings found for this context. Use record-learning to create learnings.",
              },
            ],
          };
        }

        const grouped = {
          corrections: result.learnings.filter((l: LearningType) => l.type === "correction"),
          patterns: result.learnings.filter((l: LearningType) => l.type === "pattern"),
          preferences: result.learnings.filter((l: LearningType) => l.type === "preference"),
          skills: result.learnings.filter((l: LearningType) => l.type === "skill"),
        };

        let output = "# Active Learnings\n\n";
        
        if (grouped.corrections.length > 0) {
          output += "## Corrections\n";
          grouped.corrections.forEach((l: LearningType) => {
            output += `- **${l.trigger}** → ${l.response}\n`;
          });
          output += "\n";
        }
        
        if (grouped.patterns.length > 0) {
          output += "## Patterns\n";
          grouped.patterns.forEach((l: LearningType) => {
            output += `- **${l.trigger}** → ${l.response}\n`;
          });
          output += "\n";
        }
        
        if (grouped.preferences.length > 0) {
          output += "## Preferences\n";
          grouped.preferences.forEach((l: LearningType) => {
            output += `- **${l.trigger}** → ${l.response}\n`;
          });
          output += "\n";
        }
        
        if (grouped.skills.length > 0) {
          output += "## Skills\n";
          grouped.skills.forEach((l: LearningType) => {
            output += `- **${l.trigger}** → ${l.response}\n`;
          });
        }

        output += `\nTotal: ${result.learnings.length} learnings loaded. Apply these throughout the session.`;

        return {
          content: [{ type: "text", text: output }],
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
    "get-intelligence-score",
    {
      description: "Get your Nexus Intelligence Score - XP, level, streak, achievements, and stats. Gamified tracking of your AI collaboration journey.",
      inputSchema: {},
    },
    async () => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const { score } = await client.getIntelligenceScore();

        const progressBar = (current: number, total: number) => {
          const filled = Math.round((current / total) * 20);
          return "█".repeat(filled) + "░".repeat(20 - filled);
        };

        return {
          content: [
            {
              type: "text",
              text: `# Nexus Intelligence Score\n\n` +
                `**Level ${score.level}** - ${score.totalXp.toLocaleString()} XP\n` +
                `${progressBar(score.currentLevelXp, score.xpToNextLevel)} ${score.currentLevelXp}/${score.xpToNextLevel} XP to next level\n\n` +
                `**Streak:** ${score.currentStreak} days (longest: ${score.longestStreak})\n\n` +
                `**Stats:**\n` +
                `- Queries: ${score.stats.totalQueries}\n` +
                `- Memories: ${score.stats.totalMemories}\n` +
                `- Learnings: ${score.stats.totalLearnings}\n` +
                `- Flows Created: ${score.stats.totalFlowsCreated}\n` +
                `- Repos Indexed: ${score.stats.totalReposIndexed}\n\n` +
                (score.achievements.length > 0 ? `**Achievements:** ${score.achievements.join(", ")}` : ""),
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
  // Repository Tools - GitHub Integration
  // ============================================================================

  server.registerTool(
    "list-repos",
    {
      description: "List your connected GitHub repositories. These repos are indexed for AI-assisted code context.",
      inputSchema: {},
    },
    async () => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.listConnectedRepos();

        if (result.repos.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No repositories connected.\n\n` +
                  `**Tier:** ${result.tier}\n` +
                  `**Limits:** ${result.limits.currentRepoCount}/${result.limits.maxRepos} repos\n\n` +
                  `Connect repos at https://nexus.yogan.dev/dashboard/repos`,
              },
            ],
          };
        }

        let output = `# Connected Repositories\n\n`;
        output += `**Tier:** ${result.tier} | ${result.limits.currentRepoCount}/${result.limits.maxRepos} repos used\n\n`;

        result.repos.forEach((repo: ConnectedRepoType) => {
          const status = repo.indexStatus === "indexed" ? "✓" : repo.indexStatus === "indexing" ? "⏳" : "⚠";
          output += `- **${repo.fullName}** [${status}] - ${repo.totalFiles} files, ${(repo.totalBytes / 1024).toFixed(1)}KB\n`;
          output += `  ID: \`${repo.id}\`\n`;
        });

        return {
          content: [{ type: "text", text: output }],
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
    "get-repo-structure",
    {
      description: "Get the directory structure of a connected repository. Useful for understanding project layout.",
      inputSchema: {
        repoId: z.string().describe("Repository ID (from list-repos)"),
      },
    },
    async ({ repoId }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.getRepoStructure(repoId);

        const renderTree = (node: { name: string; type: string; children?: any[] }, indent = ""): string => {
          let output = `${indent}${node.type === "directory" ? "📁" : "📄"} ${node.name}\n`;
          if (node.children) {
            node.children.forEach((child, i) => {
              const isLast = i === node.children!.length - 1;
              const newIndent = indent + (isLast ? "  " : "│ ");
              output += renderTree(child, newIndent);
            });
          }
          return output;
        };

        return {
          content: [
            {
              type: "text",
              text: `# Repository Structure\n\n\`\`\`\n${renderTree(result.structure)}\`\`\``,
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
    "get-repo-file",
    {
      description: "Get the content of a file from a connected repository. Use this to read README, config files, types, or source code.",
      inputSchema: {
        repoId: z.string().describe("Repository ID (from list-repos)"),
        filePath: z.string().describe("Path to the file within the repository (e.g., 'README.md', 'src/index.ts')"),
      },
    },
    async ({ repoId, filePath }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.getRepoFile(repoId, filePath);

        return {
          content: [
            {
              type: "text",
              text: `# ${result.file.path}\n\n` +
                `Type: ${result.file.fileType} | Language: ${result.file.language || "unknown"} | Size: ${result.file.sizeBytes} bytes\n\n` +
                (result.file.summary ? `**Summary:** ${result.file.summary}\n\n` : "") +
                `\`\`\`${result.file.language || ""}\n${result.file.content}\n\`\`\``,
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
    "search-repo-files",
    {
      description: "Search for files in a connected repository by type or pattern. Returns a list of files matching the criteria.",
      inputSchema: {
        repoId: z.string().describe("Repository ID (from list-repos)"),
        fileType: z.enum(["readme", "docs", "config", "types", "source", "test", "other"]).optional().describe("Filter by file type"),
      },
    },
    async ({ repoId, fileType }) => {
      if (!client) {
        return {
          content: [{ type: "text", text: "Error: Not authenticated. Run 'nexus auth login' first." }],
          isError: true,
        };
      }

      try {
        const result = await client.getConnectedRepo(repoId);

        let files: RepoFileType[] = result.files;
        if (fileType) {
          files = files.filter((f: RepoFileType) => f.fileType === fileType);
        }

        if (files.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: fileType
                  ? `No ${fileType} files found in this repository.`
                  : "No indexed files found in this repository.",
              },
            ],
          };
        }

        const grouped: Record<string, RepoFileType[]> = {};
        files.forEach((f: RepoFileType) => {
          const type = f.fileType || "other";
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push(f);
        });

        let output = `# Files in ${result.repo.fullName}\n\n`;
        
        Object.entries(grouped).forEach(([type, typeFiles]) => {
          output += `## ${type.charAt(0).toUpperCase() + type.slice(1)} (${typeFiles.length})\n`;
          typeFiles.forEach((f: RepoFileType) => {
            output += `- \`${f.path}\``;
            if (f.summary) output += ` - ${f.summary}`;
            output += "\n";
          });
          output += "\n";
        });

        output += `Use get-repo-file to read any file's content.`;

        return {
          content: [{ type: "text", text: output }],
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
  console.error(chalk.gray("Tools available:"));
  console.error(chalk.gray("  Docs: resolve-library, query-docs, get-library-info, list-libraries"));
  console.error(chalk.gray("  Memory: save-memory, recall-memories, get-project-context"));
  console.error(chalk.gray("  Servers: discover-servers, get-server-info, get-server-config"));
  console.error(chalk.gray("  Flows: list-flows, get-flow, get-active-flows, create-flow, activate-flow,"));
  console.error(chalk.gray("         deactivate-flow, download-flow, suggest-flows"));
  console.error(chalk.gray("  Brain: record-learning, get-learnings, get-intelligence-score"));
  console.error(chalk.gray("  Repos: list-repos, get-repo-structure, get-repo-file, search-repo-files"));
}
