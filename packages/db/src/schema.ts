import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ============================================================================
// Libraries - Indexed documentation sources
// ============================================================================

export const libraries = sqliteTable(
  "libraries",
  {
    id: text("id").primaryKey(), // e.g., "react", "nextjs", "hono"
    name: text("name").notNull(),
    description: text("description"),

    // Source information
    sourceType: text("source_type", {
      enum: ["github", "website", "npm", "context7"],
    }).notNull(),
    // Context7 library ID (e.g., "/vercel/next.js") - used when sourceType is "context7"
    context7Id: text("context7_id"),
    sourceUrl: text("source_url").notNull(),
    repositoryUrl: text("repository_url"),
    homepageUrl: text("homepage_url"),
    iconUrl: text("icon_url"),

    // Version tracking
    version: text("version"),

    // Categories (JSON array)
    categories: text("categories", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),

    // Indexing metadata
    totalChunks: integer("total_chunks").notNull().default(0),
    totalTokens: integer("total_tokens").notNull().default(0),
    indexStatus: text("index_status", {
      enum: ["pending", "indexing", "indexed", "failed"],
    })
      .notNull()
      .default("pending"),
    lastIndexedAt: text("last_indexed_at"),
    indexError: text("index_error"),

    // Flags
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),

    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("libraries_name_idx").on(table.name),
    index("libraries_status_idx").on(table.indexStatus),
    index("libraries_active_idx").on(table.isActive),
    index("libraries_featured_idx").on(table.isFeatured),
  ]
);

export const librariesRelations = relations(libraries, ({ many, one }) => ({
  chunks: many(chunks),
  stats: one(libraryStats),
}));

// ============================================================================
// Chunks - Documentation chunks (content in R2, embeddings in Vectorize)
// ============================================================================

export const chunks = sqliteTable(
  "chunks",
  {
    id: text("id").primaryKey(), // UUID, also used as Vectorize vector ID
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, { onDelete: "cascade" }),

    // Content metadata (actual content stored in R2)
    title: text("title"),
    contentType: text("content_type", {
      enum: ["text", "code", "mixed"],
    })
      .notNull()
      .default("text"),
    tokenCount: integer("token_count").notNull().default(0),

    // Source location
    sourceFile: text("source_file"), // e.g., "docs/getting-started.md"
    sourceUrl: text("source_url"),

    // R2 storage key
    r2Key: text("r2_key").notNull(),

    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("chunks_library_id_idx").on(table.libraryId),
    index("chunks_content_type_idx").on(table.contentType),
  ]
);

export const chunksRelations = relations(chunks, ({ one }) => ({
  library: one(libraries, {
    fields: [chunks.libraryId],
    references: [libraries.id],
  }),
}));

// ============================================================================
// Library Stats - Usage statistics
// ============================================================================

export const libraryStats = sqliteTable("library_stats", {
  libraryId: text("library_id")
    .primaryKey()
    .references(() => libraries.id, { onDelete: "cascade" }),
  totalQueries: integer("total_queries").notNull().default(0),
  totalChunkHits: integer("total_chunk_hits").notNull().default(0),
  lastQueriedAt: text("last_queried_at"),
});

export const libraryStatsRelations = relations(libraryStats, ({ one }) => ({
  library: one(libraries, {
    fields: [libraryStats.libraryId],
    references: [libraries.id],
  }),
}));

// ============================================================================
// Submissions - User-submitted library requests
// ============================================================================

export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    libraryName: text("library_name").notNull(),
    sourceUrl: text("source_url").notNull(),
    description: text("description"),
    submitterEmail: text("submitter_email"),
    status: text("status", {
      enum: ["pending", "approved", "rejected", "indexed"],
    })
      .notNull()
      .default("pending"),
    libraryId: text("library_id").references(() => libraries.id),
    createdAt: text("created_at").notNull(),
    processedAt: text("processed_at"),
  },
  (table) => [
    index("submissions_status_idx").on(table.status),
    index("submissions_created_at_idx").on(table.createdAt),
  ]
);

export const submissionsRelations = relations(submissions, ({ one }) => ({
  library: one(libraries, {
    fields: [submissions.libraryId],
    references: [libraries.id],
  }),
}));

// ============================================================================
// Auth Tables (Better Auth)
// ============================================================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)]
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)]
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)]
);

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Memories - Persistent AI assistant context
// ============================================================================

export const MEMORY_TYPES = [
  "project_context",
  "session_summary",
  "decision",
  "correction",
] as const;
export type MemoryType = (typeof MEMORY_TYPES)[number];

export const MEMORY_SCOPES = ["global", "user"] as const;
export type MemoryScope = (typeof MEMORY_SCOPES)[number];

export const memories = sqliteTable(
  "memories",
  {
    id: text("id").primaryKey(),

    // Ownership & scope
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // NULL = global
    scope: text("scope", { enum: MEMORY_SCOPES }).notNull().default("global"),

    // Classification
    type: text("type", { enum: MEMORY_TYPES }).notNull(),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),

    // Content
    title: text("title").notNull(),
    summary: text("summary"), // Short summary for listing
    r2Key: text("r2_key").notNull(), // Full content in R2

    // Context
    project: text("project"), // Optional project name (e.g., "nexus")
    importance: integer("importance").notNull().default(5), // 1-10

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    expiresAt: text("expires_at"), // Optional TTL
  },
  (table) => [
    index("memories_user_id_idx").on(table.userId),
    index("memories_scope_idx").on(table.scope),
    index("memories_type_idx").on(table.type),
    index("memories_project_idx").on(table.project),
    index("memories_created_at_idx").on(table.createdAt),
  ]
);

export const memoriesRelations = relations(memories, ({ one }) => ({
  user: one(users, {
    fields: [memories.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// API Tokens - For MCP authentication
// ============================================================================

export const API_TOKEN_SCOPES = [
  "read:docs",
  "read:memories",
  "write:memories",
  "read:servers",
] as const;
export type ApiTokenScope = (typeof API_TOKEN_SCOPES)[number];

export const apiTokens = sqliteTable(
  "api_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull(),
    tokenPrefix: text("token_prefix").notNull(), // First 8 chars for display
    scopes: text("scopes", { mode: "json" }).$type<ApiTokenScope[]>().notNull().default([]),
    lastUsedAt: text("last_used_at"),
    expiresAt: text("expires_at"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("api_tokens_user_idx").on(table.userId),
    index("api_tokens_hash_idx").on(table.tokenHash),
    index("api_tokens_active_idx").on(table.isActive),
  ]
);

export const apiTokensRelations = relations(apiTokens, ({ one }) => ({
  user: one(users, {
    fields: [apiTokens.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// MCP Servers - Registry of MCP servers
// ============================================================================

export const TRANSPORT_TYPES = ["stdio", "http", "sse"] as const;
export type TransportType = (typeof TRANSPORT_TYPES)[number];

export const PACKAGE_TYPES = ["npm", "pypi", "docker", "binary", "remote"] as const;
export type PackageType = (typeof PACKAGE_TYPES)[number];

export const mcpServers = sqliteTable(
  "mcp_servers",
  {
    id: text("id").primaryKey(), // e.g., "filesystem", "postgres", "github"
    
    // Identity
    namespace: text("namespace").notNull(), // e.g., "modelcontextprotocol", "anthropic"
    name: text("name").notNull(), // e.g., "server-filesystem"
    displayName: text("display_name"), // e.g., "Filesystem"
    description: text("description"),
    
    // Version
    version: text("version"),
    
    // Transport & Installation
    transportType: text("transport_type", { enum: TRANSPORT_TYPES }).notNull().default("stdio"),
    packageType: text("package_type", { enum: PACKAGE_TYPES }).notNull().default("npm"),
    packageName: text("package_name"), // e.g., "@modelcontextprotocol/server-filesystem"
    
    // Installation command parts (stored as JSON for flexibility)
    installCommand: text("install_command"), // e.g., "npx"
    installArgs: text("install_args", { mode: "json" }).$type<string[]>().default([]),
    
    // Environment variables required (JSON object)
    envVars: text("env_vars", { mode: "json" }).$type<Record<string, string>>().default({}),
    
    // Capabilities (discovered or declared) - JSON objects
    tools: text("tools", { mode: "json" }).$type<Array<{name: string; description?: string}>>().default([]),
    resources: text("resources", { mode: "json" }).$type<Array<{uri: string; name?: string}>>().default([]),
    prompts: text("prompts", { mode: "json" }).$type<Array<{name: string; description?: string}>>().default([]),
    
    // Capability flags for easy filtering
    hasTools: integer("has_tools", { mode: "boolean" }).notNull().default(false),
    hasResources: integer("has_resources", { mode: "boolean" }).notNull().default(false),
    hasPrompts: integer("has_prompts", { mode: "boolean" }).notNull().default(false),
    
    // Links
    repositoryUrl: text("repository_url"),
    documentationUrl: text("documentation_url"),
    homepageUrl: text("homepage_url"),
    iconUrl: text("icon_url"),
    
    // Auth requirements
    requiresAuth: integer("requires_auth", { mode: "boolean" }).notNull().default(false),
    authType: text("auth_type", { enum: ["oauth", "api_key", "env", "none"] }).default("none"),
    
    // Metadata
    author: text("author"),
    license: text("license"),
    keywords: text("keywords", { mode: "json" }).$type<string[]>().default([]),
    categories: text("categories", { mode: "json" }).$type<string[]>().default([]),
    
    // Stats
    weeklyDownloads: integer("weekly_downloads").notNull().default(0),
    githubStars: integer("github_stars").notNull().default(0),
    
    // Verification & Status
    isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
    verifiedAt: text("verified_at"),
    isOfficial: integer("is_official", { mode: "boolean" }).notNull().default(false), // From modelcontextprotocol org
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    
    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("mcp_servers_namespace_idx").on(table.namespace),
    index("mcp_servers_name_idx").on(table.name),
    index("mcp_servers_transport_idx").on(table.transportType),
    index("mcp_servers_package_idx").on(table.packageType),
    index("mcp_servers_has_tools_idx").on(table.hasTools),
    index("mcp_servers_has_resources_idx").on(table.hasResources),
    index("mcp_servers_official_idx").on(table.isOfficial),
    index("mcp_servers_featured_idx").on(table.isFeatured),
    index("mcp_servers_active_idx").on(table.isActive),
  ]
);

// Link MCP servers to their documentation (if indexed)
export const mcpServerDocs = sqliteTable(
  "mcp_server_docs",
  {
    serverId: text("server_id")
      .notNull()
      .references(() => mcpServers.id, { onDelete: "cascade" }),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("mcp_server_docs_server_idx").on(table.serverId),
    index("mcp_server_docs_library_idx").on(table.libraryId),
  ]
);

// MCP Server Stats
export const mcpServerStats = sqliteTable("mcp_server_stats", {
  serverId: text("server_id")
    .primaryKey()
    .references(() => mcpServers.id, { onDelete: "cascade" }),
  totalDiscoveries: integer("total_discoveries").notNull().default(0),
  totalConfigCopies: integer("total_config_copies").notNull().default(0),
  lastDiscoveredAt: text("last_discovered_at"),
});

export const mcpServersRelations = relations(mcpServers, ({ many, one }) => ({
  docs: many(mcpServerDocs),
  stats: one(mcpServerStats),
}));

export const mcpServerDocsRelations = relations(mcpServerDocs, ({ one }) => ({
  server: one(mcpServers, {
    fields: [mcpServerDocs.serverId],
    references: [mcpServers.id],
  }),
  library: one(libraries, {
    fields: [mcpServerDocs.libraryId],
    references: [libraries.id],
  }),
}));

export const mcpServerStatsRelations = relations(mcpServerStats, ({ one }) => ({
  server: one(mcpServers, {
    fields: [mcpServerStats.serverId],
    references: [mcpServers.id],
  }),
}));

// ============================================================================
// Type exports
// ============================================================================

export type Library = typeof libraries.$inferSelect;
export type NewLibrary = typeof libraries.$inferInsert;
export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
export type LibraryStats = typeof libraryStats.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;
export type McpServer = typeof mcpServers.$inferSelect;
export type NewMcpServer = typeof mcpServers.$inferInsert;
export type McpServerDocs = typeof mcpServerDocs.$inferSelect;
export type McpServerStats = typeof mcpServerStats.$inferSelect;
export type ApiToken = typeof apiTokens.$inferSelect;
export type NewApiToken = typeof apiTokens.$inferInsert;
