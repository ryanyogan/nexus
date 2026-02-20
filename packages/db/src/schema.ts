import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================================
// Servers - MCP server registry
// ============================================================================

export const servers = sqliteTable(
  "servers",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    endpoint: text("endpoint").notNull(),
    transport: text("transport", { enum: ["stdio", "sse", "streamable-http"] }).notNull(),
    authType: text("auth_type", { enum: ["none", "api_key", "oauth"] }).notNull(),
    categories: text("categories", { mode: "json" }).$type<string[]>().notNull(),
    iconUrl: text("icon_url"),
    homepageUrl: text("homepage_url"),
    repositoryUrl: text("repository_url"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
    isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("servers_name_idx").on(table.name),
    index("servers_active_idx").on(table.isActive),
  ]
);

export const serversRelations = relations(servers, ({ many, one }) => ({
  tools: many(tools),
  stats: one(serverStats),
}));

// ============================================================================
// Tools - Individual tools exposed by servers
// ============================================================================

export const tools = sqliteTable(
  "tools",
  {
    id: text("id").primaryKey(),
    serverId: text("server_id")
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    inputSchema: text("input_schema", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    namespace: text("namespace").notNull(), // e.g., "github", "cloudflare"
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("tools_server_id_idx").on(table.serverId),
    index("tools_namespace_idx").on(table.namespace),
    index("tools_name_idx").on(table.name),
  ]
);

export const toolsRelations = relations(tools, ({ one }) => ({
  server: one(servers, {
    fields: [tools.serverId],
    references: [servers.id],
  }),
}));

// ============================================================================
// Server Stats - Usage statistics
// ============================================================================

export const serverStats = sqliteTable("server_stats", {
  serverId: text("server_id")
    .primaryKey()
    .references(() => servers.id, { onDelete: "cascade" }),
  totalCalls: integer("total_calls").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  totalLatencyMs: integer("total_latency_ms").notNull().default(0),
  lastCalledAt: text("last_called_at"),
});

export const serverStatsRelations = relations(serverStats, ({ one }) => ({
  server: one(servers, {
    fields: [serverStats.serverId],
    references: [servers.id],
  }),
}));

// ============================================================================
// Compositions - User-defined server groupings
// ============================================================================

export const compositions = sqliteTable(
  "compositions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(), // References Better Auth user
    name: text("name").notNull(),
    description: text("description"),
    serverIds: text("server_ids", { mode: "json" }).$type<string[]>().notNull(),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("compositions_user_id_idx").on(table.userId),
  ]
);

// ============================================================================
// Type exports
// ============================================================================

export type Server = typeof servers.$inferSelect;
export type NewServer = typeof servers.$inferInsert;
export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;
export type ServerStats = typeof serverStats.$inferSelect;
export type Composition = typeof compositions.$inferSelect;
export type NewComposition = typeof compositions.$inferInsert;
