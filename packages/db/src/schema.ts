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
