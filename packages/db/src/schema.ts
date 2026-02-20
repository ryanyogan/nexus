import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

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
      enum: ["github", "website", "npm"],
    }).notNull(),
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
// Type exports
// ============================================================================

export type Library = typeof libraries.$inferSelect;
export type NewLibrary = typeof libraries.$inferInsert;
export type Chunk = typeof chunks.$inferSelect;
export type NewChunk = typeof chunks.$inferInsert;
export type LibraryStats = typeof libraryStats.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
