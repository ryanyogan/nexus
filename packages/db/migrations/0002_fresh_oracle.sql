-- Drop old MCP server proxy tables
DROP TABLE IF EXISTS `tools`;
DROP TABLE IF EXISTS `server_stats`;
DROP TABLE IF EXISTS `servers`;
DROP TABLE IF EXISTS `compositions`;

-- Create new documentation oracle tables

-- Libraries - Indexed documentation sources
CREATE TABLE `libraries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`source_type` text NOT NULL,
	`source_url` text NOT NULL,
	`repository_url` text,
	`homepage_url` text,
	`icon_url` text,
	`version` text,
	`categories` text DEFAULT '[]' NOT NULL,
	`total_chunks` integer DEFAULT 0 NOT NULL,
	`total_tokens` integer DEFAULT 0 NOT NULL,
	`index_status` text DEFAULT 'pending' NOT NULL,
	`last_indexed_at` text,
	`index_error` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `libraries_name_idx` ON `libraries` (`name`);
--> statement-breakpoint
CREATE INDEX `libraries_status_idx` ON `libraries` (`index_status`);
--> statement-breakpoint
CREATE INDEX `libraries_active_idx` ON `libraries` (`is_active`);
--> statement-breakpoint
CREATE INDEX `libraries_featured_idx` ON `libraries` (`is_featured`);

-- Chunks - Documentation chunks (content in R2, embeddings in Vectorize)
--> statement-breakpoint
CREATE TABLE `chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`library_id` text NOT NULL,
	`title` text,
	`content_type` text DEFAULT 'text' NOT NULL,
	`token_count` integer DEFAULT 0 NOT NULL,
	`source_file` text,
	`source_url` text,
	`r2_key` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chunks_library_id_idx` ON `chunks` (`library_id`);
--> statement-breakpoint
CREATE INDEX `chunks_content_type_idx` ON `chunks` (`content_type`);

-- Library Stats - Usage statistics
--> statement-breakpoint
CREATE TABLE `library_stats` (
	`library_id` text PRIMARY KEY NOT NULL,
	`total_queries` integer DEFAULT 0 NOT NULL,
	`total_chunk_hits` integer DEFAULT 0 NOT NULL,
	`last_queried_at` text,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Submissions - User-submitted library requests
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`library_name` text NOT NULL,
	`source_url` text NOT NULL,
	`description` text,
	`submitter_email` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`library_id` text,
	`created_at` text NOT NULL,
	`processed_at` text,
	FOREIGN KEY (`library_id`) REFERENCES `libraries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `submissions_status_idx` ON `submissions` (`status`);
--> statement-breakpoint
CREATE INDEX `submissions_created_at_idx` ON `submissions` (`created_at`);
