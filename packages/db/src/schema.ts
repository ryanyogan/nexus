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

    // GitHub source details
    githubOwner: text("github_owner"),
    githubRepo: text("github_repo"),
    githubBranch: text("github_branch").default("main"),
    githubDocsPaths: text("github_docs_paths", { mode: "json" }).$type<string[]>().default([]),
    lastCommitSha: text("last_commit_sha"),

    // Website source details
    websiteUrl: text("website_url"),
    websiteContentSelector: text("website_content_selector"),

    // Version tracking
    version: text("version"),
    // Available versions (JSON array of version objects)
    versions: text("versions", { mode: "json" }).$type<string[]>().default([]),

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

    // Quality metrics (our own analysis)
    benchmarkScore: integer("benchmark_score"), // 0-100 quality score
    trustScore: integer("trust_score"), // 0-100 trust/authority score
    qualityAnalysis: text("quality_analysis"), // JSON serialized QualityAnalysis

    // Refresh tracking
    lastRefreshRequestedAt: text("last_refresh_requested_at"),
    refreshScheduledAt: text("refresh_scheduled_at"),

    // Context7 metadata (populated by weekly sync - legacy)
    context7TrustScore: integer("context7_trust_score"), // 0-10 source reputation
    context7BenchmarkScore: integer("context7_benchmark_score"), // 0-100 quality score (stored as integer, divide by 100 for decimal)
    context7TotalSnippets: integer("context7_total_snippets"), // Number of code snippets
    context7Stars: integer("context7_stars"), // GitHub stars count
    context7Branch: text("context7_branch"), // Git branch being tracked
    context7State: text("context7_state", {
      enum: ["finalized", "initial", "processing", "error", "delete"],
    }),
    context7LastUpdatedAt: text("context7_last_updated_at"), // When Context7 last updated this library
    context7SyncedAt: text("context7_synced_at"), // When we last synced from Context7

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
// Library Files - Track individual files for incremental updates
// ============================================================================

export const libraryFiles = sqliteTable(
  "library_files",
  {
    id: text("id").primaryKey(),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, { onDelete: "cascade" }),
    filePath: text("file_path").notNull(),
    fileType: text("file_type").default("markdown"),
    fileSha: text("file_sha"),
    contentHash: text("content_hash"),
    chunkCount: integer("chunk_count").default(0),
    tokenCount: integer("token_count").default(0),
    lastFetchedAt: text("last_fetched_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("library_files_library_idx").on(table.libraryId),
    index("library_files_sha_idx").on(table.fileSha),
  ]
);

export const libraryFilesRelations = relations(libraryFiles, ({ one }) => ({
  library: one(libraries, {
    fields: [libraryFiles.libraryId],
    references: [libraries.id],
  }),
}));

// ============================================================================
// Library Versions - Track multiple versions of library documentation
// ============================================================================

export const libraryVersions = sqliteTable(
  "library_versions",
  {
    id: text("id").primaryKey(),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    versionTag: text("version_tag"),
    isDefault: integer("is_default", { mode: "boolean" }).default(false),
    totalChunks: integer("total_chunks").default(0),
    totalTokens: integer("total_tokens").default(0),
    indexedAt: text("indexed_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("library_versions_library_idx").on(table.libraryId),
    index("library_versions_default_idx").on(table.isDefault),
  ]
);

export const libraryVersionsRelations = relations(libraryVersions, ({ one }) => ({
  library: one(libraries, {
    fields: [libraryVersions.libraryId],
    references: [libraries.id],
  }),
}));

// ============================================================================
// Refresh Jobs - Track documentation refresh requests
// ============================================================================

export const REFRESH_JOB_STATUSES = ["pending", "running", "completed", "failed"] as const;
export type RefreshJobStatus = (typeof REFRESH_JOB_STATUSES)[number];

export const refreshJobs = sqliteTable(
  "refresh_jobs",
  {
    id: text("id").primaryKey(),
    libraryId: text("library_id")
      .notNull()
      .references(() => libraries.id, { onDelete: "cascade" }),
    status: text("status", { enum: REFRESH_JOB_STATUSES }).notNull().default("pending"),
    triggeredBy: text("triggered_by"),
    filesProcessed: integer("files_processed").default(0),
    filesChanged: integer("files_changed").default(0),
    chunksUpdated: integer("chunks_updated").default(0),
    errorMessage: text("error_message"),
    startedAt: text("started_at"),
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("refresh_jobs_library_idx").on(table.libraryId),
    index("refresh_jobs_status_idx").on(table.status),
  ]
);

export const refreshJobsRelations = relations(refreshJobs, ({ one }) => ({
  library: one(libraries, {
    fields: [refreshJobs.libraryId],
    references: [libraries.id],
  }),
}));

// ============================================================================
// Skill Submissions - User-submitted skill requests
// ============================================================================

export const SKILL_SUBMISSION_STATUSES = ["pending", "approved", "rejected", "indexing"] as const;
export type SkillSubmissionStatus = (typeof SKILL_SUBMISSION_STATUSES)[number];

export const skillSubmissions = sqliteTable(
  "skill_submissions",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    skillUrl: text("skill_url").notNull(),
    sourceRepo: text("source_repo"),
    type: text("type", { enum: ["analysis", "generation", "transformation", "integration", "utility"] }).notNull(),
    categories: text("categories", { mode: "json" }).$type<string[]>().default([]),
    contentPreview: text("content_preview"),
    submittedBy: text("submitted_by"),
    submitterEmail: text("submitter_email"),
    status: text("status", { enum: SKILL_SUBMISSION_STATUSES }).notNull().default("pending"),
    adminNotes: text("admin_notes"),
    reviewedAt: text("reviewed_at"),
    reviewedBy: text("reviewed_by"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("skill_submissions_status_idx").on(table.status),
    index("skill_submissions_created_idx").on(table.createdAt),
  ]
);

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
// MCP Server Submissions - User-submitted server requests
// ============================================================================

export const SERVER_SUBMISSION_STATUSES = ["pending", "approved", "rejected"] as const;
export type ServerSubmissionStatus = (typeof SERVER_SUBMISSION_STATUSES)[number];

export const serverSubmissions = sqliteTable(
  "server_submissions",
  {
    id: text("id").primaryKey(),

    // Server identity
    name: text("name").notNull(), // e.g., "my-awesome-server"
    displayName: text("display_name"), // e.g., "My Awesome Server"
    description: text("description"),

    // Source information
    repositoryUrl: text("repository_url").notNull(),
    packageName: text("package_name"), // e.g., "@myorg/server-name"
    packageType: text("package_type", { 
      enum: ["npm", "pypi", "docker", "binary", "remote"] 
    }).default("npm"),
    transportType: text("transport_type", { 
      enum: ["stdio", "http", "sse"] 
    }).default("stdio"),

    // Submitter info
    submitterEmail: text("submitter_email"),
    submitterUserId: text("submitter_user_id").references(() => users.id),

    // Review status
    status: text("status", { enum: SERVER_SUBMISSION_STATUSES })
      .notNull()
      .default("pending"),
    rejectionReason: text("rejection_reason"),

    // If approved, link to created server
    serverId: text("server_id").references(() => mcpServers.id),

    // Timestamps
    createdAt: text("created_at").notNull(),
    processedAt: text("processed_at"),
  },
  (table) => [
    index("server_submissions_status_idx").on(table.status),
    index("server_submissions_created_at_idx").on(table.createdAt),
    index("server_submissions_user_idx").on(table.submitterUserId),
  ]
);

export const serverSubmissionsRelations = relations(serverSubmissions, ({ one }) => ({
  server: one(mcpServers, {
    fields: [serverSubmissions.serverId],
    references: [mcpServers.id],
  }),
  submitter: one(users, {
    fields: [serverSubmissions.submitterUserId],
    references: [users.id],
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
    
    // Flow association - which flow was active when memory was saved
    flowId: text("flow_id"), // References flows.id
    flowSessionId: text("flow_session_id"), // References flowSessions.id

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
    index("memories_flow_idx").on(table.flowId),
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
// User Secrets - Encrypted credential vault for API keys
// ============================================================================

export const SECRET_PROVIDERS = [
  "openai",
  "anthropic",
  "google",
  "azure",
  "aws",
  "github",
  "cloudflare",
  "custom",
] as const;
export type SecretProvider = (typeof SECRET_PROVIDERS)[number];

export const userSecrets = sqliteTable(
  "user_secrets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Secret identity
    name: text("name").notNull(), // User-friendly name, e.g., "My OpenAI Key"
    provider: text("provider", { enum: SECRET_PROVIDERS }).notNull(),

    // Encrypted value (AES-GCM encrypted, base64 encoded)
    encryptedValue: text("encrypted_value").notNull(),
    iv: text("iv").notNull(), // Initialization vector for AES-GCM

    // Metadata (not encrypted)
    description: text("description"),
    keyPrefix: text("key_prefix"), // First 4 chars for display, e.g., "sk-a..."

    // Usage tracking
    lastUsedAt: text("last_used_at"),
    usageCount: integer("usage_count").notNull().default(0),

    // Status
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    expiresAt: text("expires_at"), // Optional expiration
  },
  (table) => [
    index("user_secrets_user_idx").on(table.userId),
    index("user_secrets_provider_idx").on(table.provider),
    index("user_secrets_active_idx").on(table.isActive),
  ]
);

export const userSecretsRelations = relations(userSecrets, ({ one }) => ({
  user: one(users, {
    fields: [userSecrets.userId],
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
    
    // Security Profile - helps users understand what access the server needs
    // Risk level: low (read-only/sandboxed), medium (writes to specific locations), high (system access), critical (full system/network)
    securityRiskLevel: text("security_risk_level", { 
      enum: ["low", "medium", "high", "critical"] 
    }).default("medium"),
    
    // Access capabilities (JSON array of what the server can access)
    // Examples: "filesystem:read", "filesystem:write", "network:outbound", "shell:execute", "database:read", "database:write"
    securityCapabilities: text("security_capabilities", { mode: "json" })
      .$type<string[]>()
      .default([]),
    
    // Human-readable security notes (e.g., "Can read/write files in specified directories")
    securityNotes: text("security_notes"),
    
    // Whether this server has been security audited
    isSecurityAudited: integer("is_security_audited", { mode: "boolean" }).notNull().default(false),
    securityAuditedAt: text("security_audited_at"),
    
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
// Subscriptions - User billing and plans
// ============================================================================

export const SUBSCRIPTION_PLANS = ["free", "pro", "team"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "paused",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Plan info
    plan: text("plan", { enum: SUBSCRIPTION_PLANS }).notNull().default("free"),
    status: text("status", { enum: SUBSCRIPTION_STATUSES })
      .notNull()
      .default("active"),

    // Stripe integration
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),

    // Billing cycle
    currentPeriodStart: text("current_period_start"),
    currentPeriodEnd: text("current_period_end"),

    // Usage limits (NULL = unlimited)
    apiCallsLimit: integer("api_calls_limit"), // Monthly limit
    apiCallsUsed: integer("api_calls_used").notNull().default(0),
    apiKeysLimit: integer("api_keys_limit").notNull().default(1),

    // Team reference (if team plan)
    teamId: text("team_id").references(() => teams.id),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    canceledAt: text("canceled_at"),
  },
  (table) => [
    index("subscriptions_user_idx").on(table.userId),
    index("subscriptions_stripe_customer_idx").on(table.stripeCustomerId),
    index("subscriptions_stripe_sub_idx").on(table.stripeSubscriptionId),
    index("subscriptions_team_idx").on(table.teamId),
  ]
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [subscriptions.teamId],
    references: [teams.id],
  }),
}));

// ============================================================================
// Teams - Collaborative workspaces
// ============================================================================

export const TEAM_ROLES = ["owner", "admin", "member"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const teams = sqliteTable(
  "teams",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(), // URL-friendly identifier
    description: text("description"),
    iconUrl: text("icon_url"),

    // Owner
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),

    // Settings
    settings: text("settings", { mode: "json" })
      .$type<{
        allowMemberInvites?: boolean;
        defaultMemorySharing?: boolean;
      }>()
      .default({}),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("teams_slug_idx").on(table.slug),
    index("teams_owner_idx").on(table.ownerId),
  ]
);

export const teamMembers = sqliteTable(
  "team_members",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: TEAM_ROLES }).notNull().default("member"),

    // Timestamps
    joinedAt: text("joined_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("team_members_team_idx").on(table.teamId),
    index("team_members_user_idx").on(table.userId),
  ]
);

export const teamsRelations = relations(teams, ({ one, many }) => ({
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
  members: many(teamMembers),
  subscription: one(subscriptions),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Skills - Agent skills registry (like Anthropic skills)
// ============================================================================

export const SKILL_TYPES = [
  "analysis",
  "generation",
  "transformation",
  "integration",
  "utility",
] as const;
export type SkillType = (typeof SKILL_TYPES)[number];

export const SKILL_FORMATS = ["markdown", "yaml", "json"] as const;
export type SkillFormat = (typeof SKILL_FORMATS)[number];

export const skills = sqliteTable(
  "skills",
  {
    id: text("id").primaryKey(), // e.g., "pdf", "code-review", "react-best-practices"

    // Identity
    name: text("name").notNull(), // Display name
    slug: text("slug").notNull().unique(), // URL-friendly
    description: text("description"),

    // Source
    sourceUrl: text("source_url"), // GitHub URL or original source
    sourceRepo: text("source_repo"), // e.g., "anthropics/skills"
    author: text("author"),
    version: text("version"),

    // Classification
    type: text("type", { enum: SKILL_TYPES }).notNull().default("utility"),
    categories: text("categories", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),

    // Content
    format: text("format", { enum: SKILL_FORMATS }).notNull().default("markdown"),
    r2Key: text("r2_key").notNull(), // Full content stored in R2
    contentPreview: text("content_preview"), // First 500 chars for display

    // Requirements
    requiredTools: text("required_tools", { mode: "json" })
      .$type<string[]>()
      .default([]),
    requiredMcpServers: text("required_mcp_servers", { mode: "json" })
      .$type<string[]>()
      .default([]),

    // Usage stats
    installCount: integer("install_count").notNull().default(0),
    usageCount: integer("usage_count").notNull().default(0),
    rating: integer("rating"), // 1-5 average
    lastQueriedAt: text("last_queried_at"), // Track when skill was last queried via MCP

    // Flags
    isOfficial: integer("is_official", { mode: "boolean" })
      .notNull()
      .default(false), // From official repos
    isFeatured: integer("is_featured", { mode: "boolean" })
      .notNull()
      .default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    isVerified: integer("is_verified", { mode: "boolean" })
      .notNull()
      .default(false),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("skills_slug_idx").on(table.slug),
    index("skills_type_idx").on(table.type),
    index("skills_source_repo_idx").on(table.sourceRepo),
    index("skills_official_idx").on(table.isOfficial),
    index("skills_featured_idx").on(table.isFeatured),
    index("skills_active_idx").on(table.isActive),
    index("skills_install_count_idx").on(table.installCount),
  ]
);

// Track skill installations per user
export const userSkills = sqliteTable(
  "user_skills",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),

    // Installation config (user overrides)
    customConfig: text("custom_config", { mode: "json" }).$type<Record<string, unknown>>(),

    // Timestamps
    installedAt: text("installed_at").notNull(),
    lastUsedAt: text("last_used_at"),
  },
  (table) => [
    index("user_skills_user_idx").on(table.userId),
    index("user_skills_skill_idx").on(table.skillId),
  ]
);

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

// ============================================================================
// Flows - Pre-configured AI working environments
// ============================================================================

export const FLOW_CATEGORIES = [
  "frontend",
  "backend",
  "fullstack",
  "testing",
  "devops",
  "design",
  "api",
  "mobile",
  "ai",
  "general",
] as const;
export type FlowCategory = (typeof FLOW_CATEGORIES)[number];

export const FLOW_VERBOSITY = ["concise", "balanced", "detailed"] as const;
export type FlowVerbosity = (typeof FLOW_VERBOSITY)[number];

export const FLOW_CODE_STYLE = ["minimal", "documented", "verbose"] as const;
export type FlowCodeStyle = (typeof FLOW_CODE_STYLE)[number];

export interface FlowPreferences {
  verbosity?: FlowVerbosity;
  codeStyle?: FlowCodeStyle;
  responseFormat?: ResponseFormat;
  useEmojis?: boolean;
  preferredLanguage?: string;
  customRules?: string[];
}

export const flows = sqliteTable(
  "flows",
  {
    id: text("id").primaryKey(),
    
    // Ownership
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // NULL = system/starter pack
    
    // Identity
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    
    // The core system prompt
    systemPrompt: text("system_prompt").notNull(),
    
    // Full content stored in R2 (for large prompts/additional context)
    r2Key: text("r2_key"),
    
    // Inheritance - allows flows to extend other flows (max 3 levels)
    // Self-reference handled via relation, not FK constraint for SQLite compatibility
    parentFlowId: text("parent_flow_id"),
    
    // Link to project (for project-specific flows)
    projectId: text("project_id"),
    
    // Bundled resources (JSON arrays of IDs)
    skills: text("skills", { mode: "json" }).$type<string[]>().notNull().default([]),
    libraries: text("libraries", { mode: "json" }).$type<string[]>().notNull().default([]),
    mcpServers: text("mcp_servers", { mode: "json" }).$type<string[]>().notNull().default([]),
    
    // Preferences
    preferences: text("preferences", { mode: "json" }).$type<FlowPreferences>().default({}),
    
    // Classification
    category: text("category", { enum: FLOW_CATEGORIES }).notNull().default("general"),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
    
    // Visibility & status
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
    isStarterPack: integer("is_starter_pack", { mode: "boolean" }).notNull().default(false),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    
    // Stats
    installCount: integer("install_count").notNull().default(0),
    usageCount: integer("usage_count").notNull().default(0),
    
    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("flows_user_id_idx").on(table.userId),
    index("flows_slug_idx").on(table.slug),
    index("flows_parent_idx").on(table.parentFlowId),
    index("flows_project_idx").on(table.projectId),
    index("flows_category_idx").on(table.category),
    index("flows_public_idx").on(table.isPublic),
    index("flows_starter_idx").on(table.isStarterPack),
    index("flows_featured_idx").on(table.isFeatured),
    index("flows_active_idx").on(table.isActive),
  ]
);

// User's installed/active flows
export const userFlows = sqliteTable(
  "user_flows",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    flowId: text("flow_id")
      .notNull()
      .references(() => flows.id, { onDelete: "cascade" }),
    
    // Customization - user's additions/overrides
    customPrompt: text("custom_prompt"), // Additional instructions
    customPreferences: text("custom_preferences", { mode: "json" }).$type<FlowPreferences>(),
    
    // State
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0), // For multiple active flows
    
    // Timestamps
    installedAt: text("installed_at").notNull(),
    lastUsedAt: text("last_used_at"),
  },
  (table) => [
    index("user_flows_user_idx").on(table.userId),
    index("user_flows_flow_idx").on(table.flowId),
    index("user_flows_active_idx").on(table.isActive),
    index("user_flows_order_idx").on(table.displayOrder),
  ]
);

// Track flow sessions (when flows are used)
export const flowSessions = sqliteTable(
  "flow_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    flowId: text("flow_id")
      .notNull()
      .references(() => flows.id, { onDelete: "cascade" }),
    
    // Context
    project: text("project"), // Project name if provided
    
    // Timestamps
    startedAt: text("started_at").notNull(),
    endedAt: text("ended_at"),
  },
  (table) => [
    index("flow_sessions_user_idx").on(table.userId),
    index("flow_sessions_flow_idx").on(table.flowId),
    index("flow_sessions_project_idx").on(table.project),
    index("flow_sessions_started_idx").on(table.startedAt),
  ]
);

// Relations
export const flowsRelations = relations(flows, ({ one, many }) => ({
  user: one(users, {
    fields: [flows.userId],
    references: [users.id],
  }),
  parentFlow: one(flows, {
    fields: [flows.parentFlowId],
    references: [flows.id],
    relationName: "flowInheritance",
  }),
  childFlows: many(flows, { relationName: "flowInheritance" }),
  userFlows: many(userFlows),
  sessions: many(flowSessions),
}));

export const userFlowsRelations = relations(userFlows, ({ one }) => ({
  user: one(users, {
    fields: [userFlows.userId],
    references: [users.id],
  }),
  flow: one(flows, {
    fields: [userFlows.flowId],
    references: [flows.id],
  }),
}));

export const flowSessionsRelations = relations(flowSessions, ({ one }) => ({
  user: one(users, {
    fields: [flowSessions.userId],
    references: [users.id],
  }),
  flow: one(flows, {
    fields: [flowSessions.flowId],
    references: [flows.id],
  }),
}));

// ============================================================================
// Learnings - System corrections, patterns, preferences
// ============================================================================

export const LEARNING_TYPES = ["correction", "pattern", "preference", "skill"] as const;
export type LearningType = (typeof LEARNING_TYPES)[number];

export const LEARNING_SOURCES = ["explicit", "implicit", "community"] as const;
export type LearningSource = (typeof LEARNING_SOURCES)[number];

export const LEARNING_SCOPES = ["global", "project", "library", "flow"] as const;
export type LearningScope = (typeof LEARNING_SCOPES)[number];

export const learnings = sqliteTable(
  "learnings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Learning classification
    type: text("type", { enum: LEARNING_TYPES }).notNull().default("correction"),
    category: text("category"), // e.g., 'code_style', 'architecture', 'testing'

    // Content
    trigger: text("trigger").notNull(), // What triggered this learning
    response: text("response").notNull(), // What the AI should do/remember
    context: text("context"), // Additional context

    // Source tracking
    source: text("source", { enum: LEARNING_SOURCES }).notNull().default("explicit"),
    sourceMemoryId: text("source_memory_id"),
    sourceConversationId: text("source_conversation_id"),

    // Application scope
    scope: text("scope", { enum: LEARNING_SCOPES }).notNull().default("global"),
    project: text("project"),
    libraryId: text("library_id"),
    flowId: text("flow_id"),

    // Quality & usage
    confidence: integer("confidence").notNull().default(80),
    usageCount: integer("usage_count").notNull().default(0),
    successRate: integer("success_rate").default(100),
    lastUsedAt: text("last_used_at"),

    // Status
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("learnings_user_idx").on(table.userId),
    index("learnings_type_idx").on(table.type),
    index("learnings_scope_idx").on(table.scope),
    index("learnings_project_idx").on(table.project),
    index("learnings_active_idx").on(table.isActive),
    index("learnings_source_idx").on(table.source),
  ]
);

export const learningsRelations = relations(learnings, ({ one }) => ({
  user: one(users, {
    fields: [learnings.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Intelligence Scores - XP and leveling system
// ============================================================================

export const intelligenceScores = sqliteTable(
  "intelligence_scores",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    // Current score
    totalXp: integer("total_xp").notNull().default(0),
    level: integer("level").notNull().default(1),
    currentLevelXp: integer("current_level_xp").notNull().default(0),

    // Category breakdown
    categoryXp: text("category_xp", { mode: "json" })
      .$type<Record<string, number>>()
      .default({}),

    // Streak tracking
    currentStreak: integer("current_streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    lastActivityDate: text("last_activity_date"),

    // Achievements
    achievements: text("achievements", { mode: "json" })
      .$type<string[]>()
      .default([]),

    // Stats
    totalQueries: integer("total_queries").notNull().default(0),
    totalMemories: integer("total_memories").notNull().default(0),
    totalLearnings: integer("total_learnings").notNull().default(0),
    totalFlowsCreated: integer("total_flows_created").notNull().default(0),
    totalReposIndexed: integer("total_repos_indexed").notNull().default(0),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("intelligence_scores_user_idx").on(table.userId),
    index("intelligence_scores_level_idx").on(table.level),
    index("intelligence_scores_xp_idx").on(table.totalXp),
  ]
);

export const intelligenceScoresRelations = relations(intelligenceScores, ({ one }) => ({
  user: one(users, {
    fields: [intelligenceScores.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// XP Events - Log of all XP-earning activities
// ============================================================================

export const XP_EVENT_TYPES = [
  "query_docs",
  "save_memory",
  "create_learning",
  "create_flow",
  "index_repo",
  "streak_bonus",
  "achievement",
  "first_action",
] as const;
export type XpEventType = (typeof XP_EVENT_TYPES)[number];

export const XP_CATEGORIES = [
  "docs",
  "memory",
  "learning",
  "flows",
  "repos",
  "achievement",
] as const;
export type XpCategory = (typeof XP_CATEGORIES)[number];

export const xpEvents = sqliteTable(
  "xp_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Event details
    eventType: text("event_type", { enum: XP_EVENT_TYPES }).notNull(),
    xpAmount: integer("xp_amount").notNull(),
    category: text("category", { enum: XP_CATEGORIES }).notNull(),

    // Context
    description: text("description"),
    referenceId: text("reference_id"),
    referenceType: text("reference_type"),

    // Multipliers
    baseXp: integer("base_xp").notNull(),
    multiplier: text("multiplier").default("1.0"),

    // Timestamp
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("xp_events_user_idx").on(table.userId),
    index("xp_events_type_idx").on(table.eventType),
    index("xp_events_category_idx").on(table.category),
    index("xp_events_created_idx").on(table.createdAt),
  ]
);

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
  user: one(users, {
    fields: [xpEvents.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Connected Repos - GitHub repository connections
// ============================================================================

export const REPO_INDEX_STATUS = ["pending", "indexing", "indexed", "failed"] as const;
export type RepoIndexStatus = (typeof REPO_INDEX_STATUS)[number];

export const connectedRepos = sqliteTable(
  "connected_repos",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // GitHub info
    githubId: integer("github_id").notNull(),
    owner: text("owner").notNull(),
    name: text("name").notNull(),
    fullName: text("full_name").notNull(),
    description: text("description"),
    htmlUrl: text("html_url").notNull(),
    defaultBranch: text("default_branch").notNull().default("main"),

    // Visibility
    isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(false),

    // Indexing status
    indexStatus: text("index_status", { enum: REPO_INDEX_STATUS })
      .notNull()
      .default("pending"),
    lastIndexedAt: text("last_indexed_at"),
    indexError: text("index_error"),

    // Storage
    r2Prefix: text("r2_prefix"),
    totalFiles: integer("total_files").notNull().default(0),
    totalBytes: integer("total_bytes").notNull().default(0),
    indexedFiles: integer("indexed_files").notNull().default(0),

    // Last known state
    lastCommitSha: text("last_commit_sha"),
    lastCommitAt: text("last_commit_at"),

    // Settings
    autoSync: integer("auto_sync", { mode: "boolean" }).notNull().default(false),
    includePatterns: text("include_patterns", { mode: "json" })
      .$type<string[]>()
      .default([]),
    excludePatterns: text("exclude_patterns", { mode: "json" })
      .$type<string[]>()
      .default([]),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("connected_repos_user_idx").on(table.userId),
    index("connected_repos_github_id_idx").on(table.githubId),
    index("connected_repos_full_name_idx").on(table.fullName),
    index("connected_repos_status_idx").on(table.indexStatus),
  ]
);

export const connectedReposRelations = relations(connectedRepos, ({ one, many }) => ({
  user: one(users, {
    fields: [connectedRepos.userId],
    references: [users.id],
  }),
  files: many(repoFiles),
}));

// ============================================================================
// Repo Files - Indexed files from connected repositories
// ============================================================================

export const REPO_FILE_TYPES = [
  "readme",
  "docs",
  "config",
  "types",
  "source",
  "test",
  "other",
] as const;
export type RepoFileType = (typeof REPO_FILE_TYPES)[number];

export const repoFiles = sqliteTable(
  "repo_files",
  {
    id: text("id").primaryKey(),
    repoId: text("repo_id")
      .notNull()
      .references(() => connectedRepos.id, { onDelete: "cascade" }),

    // File info
    path: text("path").notNull(),
    fileType: text("file_type", { enum: REPO_FILE_TYPES }).notNull(),
    language: text("language"),

    // Content
    r2Key: text("r2_key").notNull(),
    contentHash: text("content_hash"),
    sizeBytes: integer("size_bytes").notNull().default(0),
    lineCount: integer("line_count"),

    // Metadata
    title: text("title"),
    summary: text("summary"),

    // Git info
    lastCommitSha: text("last_commit_sha"),
    lastModifiedAt: text("last_modified_at"),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("repo_files_repo_idx").on(table.repoId),
    index("repo_files_path_idx").on(table.path),
    index("repo_files_type_idx").on(table.fileType),
  ]
);

export const repoFilesRelations = relations(repoFiles, ({ one }) => ({
  repo: one(connectedRepos, {
    fields: [repoFiles.repoId],
    references: [connectedRepos.id],
  }),
}));

// ============================================================================
// Projects - Auto-detected project fingerprints
// ============================================================================

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Identity
    name: text("name").notNull(),
    path: text("path"),
    description: text("description"),

    // Tech stack fingerprint
    stack: text("stack", { mode: "json" })
      .$type<Record<string, string>>()
      .default({}),
    dependencies: text("dependencies", { mode: "json" })
      .$type<string[]>()
      .default([]),
    devDependencies: text("dev_dependencies", { mode: "json" })
      .$type<string[]>()
      .default([]),

    // Detected patterns
    patterns: text("patterns", { mode: "json" })
      .$type<Record<string, unknown>>()
      .default({}),

    // Linked resources
    repoId: text("repo_id"),
    flowId: text("flow_id"),

    // Suggested flows
    suggestedFlows: text("suggested_flows", { mode: "json" })
      .$type<string[]>()
      .default([]),

    // Stats
    sessionCount: integer("session_count").notNull().default(0),
    lastSessionAt: text("last_session_at"),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("projects_user_idx").on(table.userId),
    index("projects_name_idx").on(table.name),
    index("projects_repo_idx").on(table.repoId),
    index("projects_flow_idx").on(table.flowId),
  ]
);

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Community Learnings - Shared learning patterns
// ============================================================================

export const communityLearnings = sqliteTable(
  "community_learnings",
  {
    id: text("id").primaryKey(),

    // Source
    sourceLearningId: text("source_learning_id"),
    sourceUserId: text("source_user_id").references(() => users.id, { onDelete: "set null" }),

    // Content
    type: text("type", { enum: LEARNING_TYPES }).notNull(),
    category: text("category"),
    trigger: text("trigger").notNull(),
    response: text("response").notNull(),
    context: text("context"),

    // Scope
    scope: text("scope", { enum: LEARNING_SCOPES }).notNull().default("library"),
    libraryId: text("library_id"),
    framework: text("framework"),

    // Quality metrics
    upvotes: integer("upvotes").notNull().default(0),
    downvotes: integer("downvotes").notNull().default(0),
    adoptionCount: integer("adoption_count").notNull().default(0),
    confidence: integer("confidence").notNull().default(70),

    // Status
    isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("community_learnings_type_idx").on(table.type),
    index("community_learnings_library_idx").on(table.libraryId),
    index("community_learnings_scope_idx").on(table.scope),
    index("community_learnings_active_idx").on(table.isActive),
    index("community_learnings_upvotes_idx").on(table.upvotes),
  ]
);

export const communityLearningsRelations = relations(communityLearnings, ({ one, many }) => ({
  sourceUser: one(users, {
    fields: [communityLearnings.sourceUserId],
    references: [users.id],
  }),
  adoptions: many(learningAdoptions),
}));

// ============================================================================
// Learning Adoptions - Track which community learnings users adopted
// ============================================================================

export const learningAdoptions = sqliteTable(
  "learning_adoptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    communityLearningId: text("community_learning_id")
      .notNull()
      .references(() => communityLearnings.id, { onDelete: "cascade" }),

    // User's local learning
    learningId: text("learning_id"),

    // Feedback
    vote: integer("vote"), // 1 = upvote, -1 = downvote

    // Timestamps
    adoptedAt: text("adopted_at").notNull(),
  },
  (table) => [
    index("learning_adoptions_user_idx").on(table.userId),
    index("learning_adoptions_community_idx").on(table.communityLearningId),
  ]
);

export const learningAdoptionsRelations = relations(learningAdoptions, ({ one }) => ({
  user: one(users, {
    fields: [learningAdoptions.userId],
    references: [users.id],
  }),
  communityLearning: one(communityLearnings, {
    fields: [learningAdoptions.communityLearningId],
    references: [communityLearnings.id],
  }),
}));

// ============================================================================
// User Preferences - Settings for MCP response format, etc.
// ============================================================================

export const RESPONSE_FORMATS = ["full", "compact", "code-only", "summary"] as const;
export type ResponseFormat = (typeof RESPONSE_FORMATS)[number];

export const userPreferences = sqliteTable(
  "user_preferences",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    // Response format preference for MCP tools
    defaultResponseFormat: text("default_response_format", { enum: RESPONSE_FORMATS })
      .notNull()
      .default("full"),

    // Token budget preference (max tokens to return)
    defaultTokenBudget: integer("default_token_budget"),

    // Other preferences
    showCodeLineNumbers: integer("show_code_line_numbers", { mode: "boolean" })
      .notNull()
      .default(true),
    preferredCodeLanguage: text("preferred_code_language"), // e.g., "typescript", "python"

    // Email preferences
    emailNotifications: integer("email_notifications", { mode: "boolean" })
      .notNull()
      .default(true),
    emailWeeklyDigest: integer("email_weekly_digest", { mode: "boolean" })
      .notNull()
      .default(false),

    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("user_preferences_user_idx").on(table.userId)]
);

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Sync Jobs - Track Context7 sync history
// ============================================================================

export const SYNC_JOB_TYPES = ["context7_libraries", "context7_skills"] as const;
export type SyncJobType = (typeof SYNC_JOB_TYPES)[number];

export const SYNC_JOB_STATUSES = ["pending", "running", "completed", "failed"] as const;
export type SyncJobStatus = (typeof SYNC_JOB_STATUSES)[number];

export const syncJobs = sqliteTable(
  "sync_jobs",
  {
    id: text("id").primaryKey(),
    
    // Job type
    type: text("type", { enum: SYNC_JOB_TYPES }).notNull(),
    
    // Status
    status: text("status", { enum: SYNC_JOB_STATUSES }).notNull().default("pending"),
    
    // Progress tracking
    totalItems: integer("total_items").notNull().default(0),
    processedItems: integer("processed_items").notNull().default(0),
    successfulItems: integer("successful_items").notNull().default(0),
    failedItems: integer("failed_items").notNull().default(0),
    
    // Error details (JSON array of errors)
    errors: text("errors", { mode: "json" }).$type<Array<{ item: string; error: string }>>().default([]),
    
    // Trigger info
    triggeredBy: text("triggered_by"), // "cron" or userId
    
    // Timestamps
    startedAt: text("started_at"),
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("sync_jobs_type_idx").on(table.type),
    index("sync_jobs_status_idx").on(table.status),
    index("sync_jobs_created_at_idx").on(table.createdAt),
  ]
);

// ============================================================================
// Stacks - AI-powered project scaffolding templates
// ============================================================================

export const STACK_CATEGORIES = [
  "infrastructure",
  "database",
  "backend",
  "fullstack",
  "frontend",
  "desktop",
  "styling",
  "tui",
  "tooling",
  "general",
] as const;
export type StackCategory = (typeof STACK_CATEGORIES)[number];

export const STACK_LAYERS = [0, 1, 2, 3] as const;
export type StackLayer = (typeof STACK_LAYERS)[number];

export const STACK_LEARNING_STATUSES = [
  "pending",
  "researching",
  "compiling",
  "complete",
  "failed",
] as const;
export type StackLearningStatus = (typeof STACK_LEARNING_STATUSES)[number];

export const TOKEN_BUDGETS = ["minimal", "standard", "comprehensive"] as const;
export type TokenBudget = (typeof TOKEN_BUDGETS)[number];

export const PACKAGE_MANAGERS = ["npm", "pnpm", "bun", "yarn", "cargo", "mix", "bundler", "go"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export interface StackPreferences {
  // Generation
  useOfficialCLIs?: boolean;
  preferredPackageManager?: PackageManager;
  
  // Code Style
  useTypeScript?: boolean;
  strictMode?: boolean;
  preferFunctionalComponents?: boolean;
  
  // Formatting
  usePrettier?: boolean;
  useESLint?: boolean;
  useBiome?: boolean;
  
  // Testing
  includeTests?: boolean;
  testingFramework?: "vitest" | "jest" | "playwright" | "rspec" | "exunit";
  
  // Documentation
  generateReadme?: boolean;
  inlineComments?: "minimal" | "standard" | "verbose";
  
  // AI Behavior
  verbosity?: "concise" | "balanced" | "detailed";
  codeBlockStyle?: "full-file" | "diff-only" | "snippet";
  explainDecisions?: boolean;
  
  // Project Structure
  monorepoReady?: boolean;
  preferTurborepo?: boolean;
  
  // Custom Rules
  customRules?: string[];
}

export const stacks = sqliteTable(
  "stacks",
  {
    id: text("id").primaryKey(),
    
    // Ownership
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }), // NULL = system starter
    
    // Identity
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    icon: text("icon"), // emoji or lucide icon name
    color: text("color"), // hex color for visual canvas
    
    // Classification
    category: text("category", { enum: STACK_CATEGORIES }).notNull().default("general"),
    layer: integer("layer").notNull().default(0), // 0=infra, 1=backend, 2=frontend, 3=tooling
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
    
    // Instructions & Config
    instructions: text("instructions"), // User's stack instructions (markdown)
    cliPreferences: text("cli_preferences", { mode: "json" }).$type<StackPreferences>().default({}),
    
    // Package Manifest (optional)
    manifestType: text("manifest_type"), // package.json, Cargo.toml, mix.exs, Gemfile
    manifestContent: text("manifest_content"), // Raw manifest content
    
    // Visual Canvas Data (React Flow)
    canvasData: text("canvas_data", { mode: "json" }).$type<{
      nodes: Array<{ id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }>;
      edges: Array<{ id: string; source: string; target: string; type?: string }>;
      viewport?: { x: number; y: number; zoom: number };
    }>(),
    
    // Generated Context (compiled prompt)
    compiledPrompt: text("compiled_prompt"), // AI-generated optimized prompt
    compiledAt: text("compiled_at"),
    tokenCount: integer("token_count"),
    tokenBudget: text("token_budget", { enum: TOKEN_BUDGETS }).notNull().default("standard"),
    
    // Full content stored in R2 (for large compiled prompts)
    r2Key: text("r2_key"),
    
    // Learning Status
    learningStatus: text("learning_status", { enum: STACK_LEARNING_STATUSES }).notNull().default("pending"),
    learningProgress: integer("learning_progress").notNull().default(0), // 0-100
    learningError: text("learning_error"),
    
    // Forking
    forkedFromId: text("forked_from_id"), // Original stack if forked
    
    // Visibility & Sharing
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isStarter: integer("is_starter", { mode: "boolean" }).notNull().default(false), // System starter stacks
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    
    // Stats
    forkCount: integer("fork_count").notNull().default(0),
    useCount: integer("use_count").notNull().default(0),
    installCount: integer("install_count").notNull().default(0),
    
    // Timestamps
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("stacks_user_id_idx").on(table.userId),
    index("stacks_slug_idx").on(table.slug),
    index("stacks_category_idx").on(table.category),
    index("stacks_layer_idx").on(table.layer),
    index("stacks_public_idx").on(table.isPublic),
    index("stacks_featured_idx").on(table.isFeatured),
    index("stacks_starter_idx").on(table.isStarter),
    index("stacks_active_idx").on(table.isActive),
    index("stacks_learning_status_idx").on(table.learningStatus),
    index("stacks_forked_from_idx").on(table.forkedFromId),
  ]
);

// Stack Repositories - GitHub repos for learning
export const STACK_REPO_STATUSES = ["pending", "analyzing", "complete", "failed"] as const;
export type StackRepoStatus = (typeof STACK_REPO_STATUSES)[number];

export const stackRepos = sqliteTable(
  "stack_repos",
  {
    id: text("id").primaryKey(),
    stackId: text("stack_id")
      .notNull()
      .references(() => stacks.id, { onDelete: "cascade" }),
    
    // Repository Info
    githubUrl: text("github_url").notNull(),
    isPrivate: integer("is_private", { mode: "boolean" }).notNull().default(false),
    branch: text("branch").default("main"),
    paths: text("paths", { mode: "json" }).$type<string[]>(), // Specific paths to analyze
    
    // Extracted Knowledge
    r2Key: text("r2_key"), // Full analysis stored in R2
    summary: text("summary"), // AI-generated summary
    paradigms: text("paradigms", { mode: "json" }).$type<string[]>(), // Detected patterns
    packages: text("packages", { mode: "json" }).$type<string[]>(), // Extracted dependencies
    directoryStructure: text("directory_structure"), // JSON tree structure
    
    // Status
    status: text("status", { enum: STACK_REPO_STATUSES }).notNull().default("pending"),
    indexedAt: text("indexed_at"),
    error: text("error"),
    
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("stack_repos_stack_idx").on(table.stackId),
    index("stack_repos_status_idx").on(table.status),
  ]
);

// Stack Compositions - Stacks built on top of other stacks
export const stackCompositions = sqliteTable(
  "stack_compositions",
  {
    id: text("id").primaryKey(),
    parentStackId: text("parent_stack_id")
      .notNull()
      .references(() => stacks.id, { onDelete: "cascade" }),
    childStackId: text("child_stack_id")
      .notNull()
      .references(() => stacks.id, { onDelete: "cascade" }),
    
    // Position in composition order
    position: integer("position").notNull().default(0),
    
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("stack_compositions_parent_idx").on(table.parentStackId),
    index("stack_compositions_child_idx").on(table.childStackId),
  ]
);

// Stack Packages - Package research results
export const PACKAGE_REGISTRIES = ["npm", "cargo", "pypi", "hex", "rubygems", "go"] as const;
export type PackageRegistry = (typeof PACKAGE_REGISTRIES)[number];

export const STACK_PACKAGE_STATUSES = ["pending", "researching", "complete", "failed"] as const;
export type StackPackageStatus = (typeof STACK_PACKAGE_STATUSES)[number];

export const stackPackages = sqliteTable(
  "stack_packages",
  {
    id: text("id").primaryKey(),
    stackId: text("stack_id")
      .notNull()
      .references(() => stacks.id, { onDelete: "cascade" }),
    
    // Package Info
    name: text("name").notNull(),
    registry: text("registry", { enum: PACKAGE_REGISTRIES }).notNull().default("npm"),
    version: text("version"),
    
    // Research Results
    libraryId: text("library_id").references(() => libraries.id), // Link to indexed docs
    documentationSummary: text("documentation_summary"),
    keyApis: text("key_apis", { mode: "json" }).$type<string[]>(), // Important APIs/patterns
    
    // Status
    status: text("status", { enum: STACK_PACKAGE_STATUSES }).notNull().default("pending"),
    researchedAt: text("researched_at"),
    error: text("error"),
    
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("stack_packages_stack_idx").on(table.stackId),
    index("stack_packages_library_idx").on(table.libraryId),
    index("stack_packages_status_idx").on(table.status),
  ]
);

// User's Stack Installations
export const userStacks = sqliteTable(
  "user_stacks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stackId: text("stack_id")
      .notNull()
      .references(() => stacks.id, { onDelete: "cascade" }),
    
    // Customization
    customInstructions: text("custom_instructions"),
    customPreferences: text("custom_preferences", { mode: "json" }).$type<StackPreferences>(),
    
    // Timestamps
    installedAt: text("installed_at").notNull(),
    lastUsedAt: text("last_used_at"),
  },
  (table) => [
    index("user_stacks_user_idx").on(table.userId),
    index("user_stacks_stack_idx").on(table.stackId),
  ]
);

// Relations
export const stacksRelations = relations(stacks, ({ one, many }) => ({
  user: one(users, {
    fields: [stacks.userId],
    references: [users.id],
  }),
  forkedFrom: one(stacks, {
    fields: [stacks.forkedFromId],
    references: [stacks.id],
    relationName: "forks",
  }),
  forks: many(stacks, { relationName: "forks" }),
  repos: many(stackRepos),
  packages: many(stackPackages),
  parentCompositions: many(stackCompositions, { relationName: "parentStack" }),
  childCompositions: many(stackCompositions, { relationName: "childStack" }),
  userStacks: many(userStacks),
}));

export const stackReposRelations = relations(stackRepos, ({ one }) => ({
  stack: one(stacks, {
    fields: [stackRepos.stackId],
    references: [stacks.id],
  }),
}));

export const stackCompositionsRelations = relations(stackCompositions, ({ one }) => ({
  parentStack: one(stacks, {
    fields: [stackCompositions.parentStackId],
    references: [stacks.id],
    relationName: "parentStack",
  }),
  childStack: one(stacks, {
    fields: [stackCompositions.childStackId],
    references: [stacks.id],
    relationName: "childStack",
  }),
}));

export const stackPackagesRelations = relations(stackPackages, ({ one }) => ({
  stack: one(stacks, {
    fields: [stackPackages.stackId],
    references: [stacks.id],
  }),
  library: one(libraries, {
    fields: [stackPackages.libraryId],
    references: [libraries.id],
  }),
}));

export const userStacksRelations = relations(userStacks, ({ one }) => ({
  user: one(users, {
    fields: [userStacks.userId],
    references: [users.id],
  }),
  stack: one(stacks, {
    fields: [userStacks.stackId],
    references: [stacks.id],
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
export type UserSecret = typeof userSecrets.$inferSelect;
export type NewUserSecret = typeof userSecrets.$inferInsert;
export type ServerSubmission = typeof serverSubmissions.$inferSelect;
export type NewServerSubmission = typeof serverSubmissions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;
export type UserSkill = typeof userSkills.$inferSelect;
export type NewUserSkill = typeof userSkills.$inferInsert;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
export type SyncJob = typeof syncJobs.$inferSelect;
export type NewSyncJob = typeof syncJobs.$inferInsert;
export type LibraryFile = typeof libraryFiles.$inferSelect;
export type NewLibraryFile = typeof libraryFiles.$inferInsert;
export type LibraryVersion = typeof libraryVersions.$inferSelect;
export type NewLibraryVersion = typeof libraryVersions.$inferInsert;
export type RefreshJob = typeof refreshJobs.$inferSelect;
export type NewRefreshJob = typeof refreshJobs.$inferInsert;
export type SkillSubmission = typeof skillSubmissions.$inferSelect;
export type NewSkillSubmission = typeof skillSubmissions.$inferInsert;
export type Flow = typeof flows.$inferSelect;
export type NewFlow = typeof flows.$inferInsert;
export type UserFlow = typeof userFlows.$inferSelect;
export type NewUserFlow = typeof userFlows.$inferInsert;
export type FlowSession = typeof flowSessions.$inferSelect;
export type NewFlowSession = typeof flowSessions.$inferInsert;
export type Learning = typeof learnings.$inferSelect;
export type NewLearning = typeof learnings.$inferInsert;
export type IntelligenceScore = typeof intelligenceScores.$inferSelect;
export type NewIntelligenceScore = typeof intelligenceScores.$inferInsert;
export type XpEvent = typeof xpEvents.$inferSelect;
export type NewXpEvent = typeof xpEvents.$inferInsert;
export type ConnectedRepo = typeof connectedRepos.$inferSelect;
export type NewConnectedRepo = typeof connectedRepos.$inferInsert;
export type RepoFile = typeof repoFiles.$inferSelect;
export type NewRepoFile = typeof repoFiles.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type CommunityLearning = typeof communityLearnings.$inferSelect;
export type NewCommunityLearning = typeof communityLearnings.$inferInsert;
export type LearningAdoption = typeof learningAdoptions.$inferSelect;
export type NewLearningAdoption = typeof learningAdoptions.$inferInsert;
export type Stack = typeof stacks.$inferSelect;
export type NewStack = typeof stacks.$inferInsert;
export type StackRepo = typeof stackRepos.$inferSelect;
export type NewStackRepo = typeof stackRepos.$inferInsert;
export type StackComposition = typeof stackCompositions.$inferSelect;
export type NewStackComposition = typeof stackCompositions.$inferInsert;
export type StackPackage = typeof stackPackages.$inferSelect;
export type NewStackPackage = typeof stackPackages.$inferInsert;
export type UserStack = typeof userStacks.$inferSelect;
export type NewUserStack = typeof userStacks.$inferInsert;
