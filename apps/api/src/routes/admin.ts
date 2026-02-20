import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { servers, tools, serverStats } from "@nexus/db/schema";
import type { AppContext } from "../types";

const adminRouter = new Hono<AppContext>();

// Seed demo data
adminRouter.post("/seed", async (c) => {
  const db = c.get("db");
  const now = new Date().toISOString();

  // Demo MCP servers
  const demoServers = [
    {
      id: "github",
      name: "GitHub",
      description: "Interact with GitHub repositories, issues, pull requests, and more.",
      endpoint: "https://github-mcp.example.com",
      transport: "streamable-http" as const,
      authType: "oauth" as const,
      categories: ["code", "api"],
      iconUrl: "https://github.githubassets.com/favicons/favicon.svg",
      homepageUrl: "https://github.com",
      repositoryUrl: "https://github.com/modelcontextprotocol/servers",
      isActive: true,
      isVerified: true,
    },
    {
      id: "cloudflare",
      name: "Cloudflare",
      description: "Manage Cloudflare Workers, D1 databases, KV storage, and other Cloudflare services.",
      endpoint: "https://cloudflare-mcp.example.com",
      transport: "streamable-http" as const,
      authType: "api_key" as const,
      categories: ["cloud", "api"],
      iconUrl: "https://www.cloudflare.com/favicon.ico",
      homepageUrl: "https://cloudflare.com",
      repositoryUrl: "https://github.com/cloudflare/mcp-server-cloudflare",
      isActive: true,
      isVerified: true,
    },
    {
      id: "brave-search",
      name: "Brave Search",
      description: "Search the web using Brave's privacy-focused search engine.",
      endpoint: "https://brave-mcp.example.com",
      transport: "streamable-http" as const,
      authType: "api_key" as const,
      categories: ["search", "api"],
      iconUrl: "https://brave.com/static-assets/images/brave-favicon.png",
      homepageUrl: "https://search.brave.com",
      repositoryUrl: "https://github.com/modelcontextprotocol/servers",
      isActive: true,
      isVerified: true,
    },
    {
      id: "filesystem",
      name: "Filesystem",
      description: "Read, write, and manage files on the local filesystem with configurable access controls.",
      endpoint: "stdio://filesystem",
      transport: "stdio" as const,
      authType: "none" as const,
      categories: ["filesystem", "local"],
      isActive: true,
      isVerified: true,
    },
    {
      id: "git",
      name: "Git",
      description: "Execute git commands, manage repositories, branches, and commits.",
      endpoint: "stdio://git",
      transport: "stdio" as const,
      authType: "none" as const,
      categories: ["code", "local"],
      isActive: true,
      isVerified: true,
    },
    {
      id: "postgresql",
      name: "PostgreSQL",
      description: "Connect to and query PostgreSQL databases with full SQL support.",
      endpoint: "stdio://postgresql",
      transport: "stdio" as const,
      authType: "api_key" as const,
      categories: ["database"],
      isActive: true,
      isVerified: true,
    },
    {
      id: "context7",
      name: "Context7",
      description: "Access up-to-date documentation and code examples for any programming library.",
      endpoint: "https://mcp.context7.com",
      transport: "streamable-http" as const,
      authType: "none" as const,
      categories: ["code", "api"],
      homepageUrl: "https://context7.com",
      isActive: true,
      isVerified: true,
    },
    {
      id: "playwright",
      name: "Playwright",
      description: "Control headless browsers for web scraping, testing, and automation.",
      endpoint: "stdio://playwright",
      transport: "stdio" as const,
      authType: "none" as const,
      categories: ["browser", "automation"],
      isActive: true,
      isVerified: true,
    },
  ];

  // Demo tools for each server
  const demoTools = [
    // GitHub tools
    { serverId: "github", namespace: "github", name: "create_repository", description: "Create a new GitHub repository", inputSchema: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, private: { type: "boolean" } }, required: ["name"] } },
    { serverId: "github", namespace: "github", name: "create_issue", description: "Create a new issue in a repository", inputSchema: { type: "object", properties: { repo: { type: "string" }, title: { type: "string" }, body: { type: "string" } }, required: ["repo", "title"] } },
    { serverId: "github", namespace: "github", name: "create_pull_request", description: "Create a new pull request", inputSchema: { type: "object", properties: { repo: { type: "string" }, title: { type: "string" }, head: { type: "string" }, base: { type: "string" } }, required: ["repo", "title", "head", "base"] } },
    { serverId: "github", namespace: "github", name: "list_repositories", description: "List repositories for a user or organization", inputSchema: { type: "object", properties: { user: { type: "string" }, org: { type: "string" } } } },
    { serverId: "github", namespace: "github", name: "get_file_contents", description: "Get the contents of a file from a repository", inputSchema: { type: "object", properties: { repo: { type: "string" }, path: { type: "string" } }, required: ["repo", "path"] } },
    { serverId: "github", namespace: "github", name: "search_repositories", description: "Search for repositories matching a query", inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } },
    { serverId: "github", namespace: "github", name: "create_branch", description: "Create a new branch in a repository", inputSchema: { type: "object", properties: { repo: { type: "string" }, branch: { type: "string" }, from: { type: "string" } }, required: ["repo", "branch"] } },
    { serverId: "github", namespace: "github", name: "push_files", description: "Push multiple files to a repository in a single commit", inputSchema: { type: "object", properties: { repo: { type: "string" }, branch: { type: "string" }, files: { type: "array" }, message: { type: "string" } }, required: ["repo", "files", "message"] } },

    // Cloudflare tools
    { serverId: "cloudflare", namespace: "cloudflare", name: "deploy_worker", description: "Deploy a Cloudflare Worker", inputSchema: { type: "object", properties: { name: { type: "string" }, script: { type: "string" } }, required: ["name", "script"] } },
    { serverId: "cloudflare", namespace: "cloudflare", name: "list_workers", description: "List all Cloudflare Workers", inputSchema: { type: "object", properties: {} } },
    { serverId: "cloudflare", namespace: "cloudflare", name: "kv_get", description: "Get a value from KV storage", inputSchema: { type: "object", properties: { namespace: { type: "string" }, key: { type: "string" } }, required: ["namespace", "key"] } },
    { serverId: "cloudflare", namespace: "cloudflare", name: "kv_put", description: "Store a value in KV storage", inputSchema: { type: "object", properties: { namespace: { type: "string" }, key: { type: "string" }, value: { type: "string" } }, required: ["namespace", "key", "value"] } },
    { serverId: "cloudflare", namespace: "cloudflare", name: "d1_query", description: "Execute a query on a D1 database", inputSchema: { type: "object", properties: { database: { type: "string" }, sql: { type: "string" } }, required: ["database", "sql"] } },

    // Brave Search tools
    { serverId: "brave-search", namespace: "brave", name: "web_search", description: "Search the web using Brave Search", inputSchema: { type: "object", properties: { query: { type: "string" }, count: { type: "number" } }, required: ["query"] } },
    { serverId: "brave-search", namespace: "brave", name: "local_search", description: "Search for local businesses and places", inputSchema: { type: "object", properties: { query: { type: "string" }, location: { type: "string" } }, required: ["query"] } },

    // Filesystem tools
    { serverId: "filesystem", namespace: "filesystem", name: "read_file", description: "Read the contents of a file", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } },
    { serverId: "filesystem", namespace: "filesystem", name: "write_file", description: "Write content to a file", inputSchema: { type: "object", properties: { path: { type: "string" }, content: { type: "string" } }, required: ["path", "content"] } },
    { serverId: "filesystem", namespace: "filesystem", name: "list_directory", description: "List contents of a directory", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } },
    { serverId: "filesystem", namespace: "filesystem", name: "delete_file", description: "Delete a file or directory", inputSchema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] } },

    // Git tools
    { serverId: "git", namespace: "git", name: "status", description: "Get the status of a git repository", inputSchema: { type: "object", properties: { path: { type: "string" } } } },
    { serverId: "git", namespace: "git", name: "commit", description: "Create a git commit", inputSchema: { type: "object", properties: { message: { type: "string" }, path: { type: "string" } }, required: ["message"] } },
    { serverId: "git", namespace: "git", name: "diff", description: "Show changes between commits or working tree", inputSchema: { type: "object", properties: { path: { type: "string" }, staged: { type: "boolean" } } } },
    { serverId: "git", namespace: "git", name: "log", description: "Show commit history", inputSchema: { type: "object", properties: { path: { type: "string" }, count: { type: "number" } } } },

    // PostgreSQL tools
    { serverId: "postgresql", namespace: "postgresql", name: "query", description: "Execute a SQL query", inputSchema: { type: "object", properties: { sql: { type: "string" }, params: { type: "array" } }, required: ["sql"] } },
    { serverId: "postgresql", namespace: "postgresql", name: "list_tables", description: "List all tables in the database", inputSchema: { type: "object", properties: { schema: { type: "string" } } } },
    { serverId: "postgresql", namespace: "postgresql", name: "describe_table", description: "Get the schema of a table", inputSchema: { type: "object", properties: { table: { type: "string" } }, required: ["table"] } },

    // Context7 tools
    { serverId: "context7", namespace: "context7", name: "resolve_library", description: "Resolve a library name to its Context7 ID", inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] } },
    { serverId: "context7", namespace: "context7", name: "query_docs", description: "Query documentation for a library", inputSchema: { type: "object", properties: { libraryId: { type: "string" }, query: { type: "string" } }, required: ["libraryId", "query"] } },

    // Playwright tools
    { serverId: "playwright", namespace: "playwright", name: "navigate", description: "Navigate to a URL", inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] } },
    { serverId: "playwright", namespace: "playwright", name: "screenshot", description: "Take a screenshot of the page", inputSchema: { type: "object", properties: { path: { type: "string" }, fullPage: { type: "boolean" } } } },
    { serverId: "playwright", namespace: "playwright", name: "click", description: "Click an element on the page", inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] } },
    { serverId: "playwright", namespace: "playwright", name: "fill", description: "Fill a form field", inputSchema: { type: "object", properties: { selector: { type: "string" }, value: { type: "string" } }, required: ["selector", "value"] } },
    { serverId: "playwright", namespace: "playwright", name: "get_text", description: "Get text content from an element", inputSchema: { type: "object", properties: { selector: { type: "string" } }, required: ["selector"] } },
  ];

  // Clear existing data
  await db.delete(serverStats);
  await db.delete(tools);
  await db.delete(servers);

  // Insert servers
  for (const server of demoServers) {
    await db.insert(servers).values({
      ...server,
      createdAt: now,
      updatedAt: now,
    });

    // Initialize stats
    await db.insert(serverStats).values({
      serverId: server.id,
      totalCalls: Math.floor(Math.random() * 50000) + 1000,
      successCount: Math.floor(Math.random() * 45000) + 900,
      totalLatencyMs: Math.floor(Math.random() * 1000000) + 10000,
      lastCalledAt: now,
    });
  }

  // Insert tools and generate embeddings
  const toolEmbeddings: { id: string; values: number[]; metadata: Record<string, string> }[] = [];

  for (const tool of demoTools) {
    const id = `${tool.serverId}-${tool.name}`;

    await db.insert(tools).values({
      id,
      serverId: tool.serverId,
      namespace: tool.namespace,
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      createdAt: now,
      updatedAt: now,
    });

    // Generate embedding for the tool
    const textToEmbed = `${tool.name}: ${tool.description}`;
    const embeddingResult = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: textToEmbed,
    });

    const embedding = Array.isArray(embeddingResult)
      ? embeddingResult[0]
      : (embeddingResult as { data: number[][] }).data[0];

    toolEmbeddings.push({
      id,
      values: embedding,
      metadata: {
        name: tool.name,
        namespace: tool.namespace,
        description: tool.description,
        serverId: tool.serverId,
      },
    });
  }

  // Upsert embeddings to Vectorize in batches
  const batchSize = 100;
  for (let i = 0; i < toolEmbeddings.length; i += batchSize) {
    const batch = toolEmbeddings.slice(i, i + batchSize);
    await c.env.VECTORIZE.upsert(batch);
  }

  // Clear the tools list cache
  await c.env.KV.delete("mcp:tools:list");

  return c.json({
    message: "Demo data seeded successfully",
    servers: demoServers.length,
    tools: demoTools.length,
    embeddings: toolEmbeddings.length,
  });
});

// Approve a server (make it active)
adminRouter.post("/servers/:id/approve", async (c) => {
  const { id } = c.req.param();
  const db = c.get("db");
  const now = new Date().toISOString();

  const result = await db
    .update(servers)
    .set({ isActive: true, isVerified: true, updatedAt: now })
    .where(eq(servers.id, id));

  // Clear tools cache
  await c.env.KV.delete("mcp:tools:list");

  return c.json({ message: "Server approved", id });
});

// Regenerate embeddings for all tools
adminRouter.post("/reindex", async (c) => {
  const db = c.get("db");

  const allTools = await db
    .select({
      id: tools.id,
      name: tools.name,
      description: tools.description,
      namespace: tools.namespace,
      serverId: tools.serverId,
    })
    .from(tools);

  const embeddings: { id: string; values: number[]; metadata: Record<string, string> }[] = [];

  for (const tool of allTools) {
    const textToEmbed = `${tool.name}: ${tool.description}`;
    const embeddingResult = await c.env.AI.run("@cf/baai/bge-base-en-v1.5", {
      text: textToEmbed,
    });

    const embedding = Array.isArray(embeddingResult)
      ? embeddingResult[0]
      : (embeddingResult as { data: number[][] }).data[0];

    embeddings.push({
      id: tool.id,
      values: embedding,
      metadata: {
        name: tool.name,
        namespace: tool.namespace,
        description: tool.description,
        serverId: tool.serverId,
      },
    });
  }

  // Upsert all embeddings
  const batchSize = 100;
  for (let i = 0; i < embeddings.length; i += batchSize) {
    const batch = embeddings.slice(i, i + batchSize);
    await c.env.VECTORIZE.upsert(batch);
  }

  return c.json({
    message: "Reindexed all tools",
    count: embeddings.length,
  });
});

export { adminRouter };
