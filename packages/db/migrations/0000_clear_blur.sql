CREATE TABLE `compositions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`server_ids` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `compositions_user_id_idx` ON `compositions` (`user_id`);--> statement-breakpoint
CREATE TABLE `server_stats` (
	`server_id` text PRIMARY KEY NOT NULL,
	`total_calls` integer DEFAULT 0 NOT NULL,
	`success_count` integer DEFAULT 0 NOT NULL,
	`total_latency_ms` integer DEFAULT 0 NOT NULL,
	`last_called_at` text,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `servers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`endpoint` text NOT NULL,
	`transport` text NOT NULL,
	`auth_type` text NOT NULL,
	`categories` text NOT NULL,
	`icon_url` text,
	`homepage_url` text,
	`repository_url` text,
	`is_active` integer DEFAULT false NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `servers_name_idx` ON `servers` (`name`);--> statement-breakpoint
CREATE INDEX `servers_active_idx` ON `servers` (`is_active`);--> statement-breakpoint
CREATE TABLE `tools` (
	`id` text PRIMARY KEY NOT NULL,
	`server_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`input_schema` text NOT NULL,
	`namespace` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`server_id`) REFERENCES `servers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tools_server_id_idx` ON `tools` (`server_id`);--> statement-breakpoint
CREATE INDEX `tools_namespace_idx` ON `tools` (`namespace`);--> statement-breakpoint
CREATE INDEX `tools_name_idx` ON `tools` (`name`);