-- Flows: Pre-configured AI working environments
-- ============================================================================

-- Main flows table
CREATE TABLE IF NOT EXISTS `flows` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text REFERENCES `users`(`id`) ON DELETE CASCADE,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `description` text,
  `system_prompt` text NOT NULL,
  `r2_key` text,
  `parent_flow_id` text,
  `skills` text DEFAULT '[]' NOT NULL,
  `libraries` text DEFAULT '[]' NOT NULL,
  `mcp_servers` text DEFAULT '[]' NOT NULL,
  `preferences` text DEFAULT '{}',
  `category` text DEFAULT 'general' NOT NULL,
  `tags` text DEFAULT '[]' NOT NULL,
  `is_public` integer DEFAULT false NOT NULL,
  `is_starter_pack` integer DEFAULT false NOT NULL,
  `is_featured` integer DEFAULT false NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `install_count` integer DEFAULT 0 NOT NULL,
  `usage_count` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `flows_user_id_idx` ON `flows` (`user_id`);
CREATE INDEX IF NOT EXISTS `flows_slug_idx` ON `flows` (`slug`);
CREATE INDEX IF NOT EXISTS `flows_parent_idx` ON `flows` (`parent_flow_id`);
CREATE INDEX IF NOT EXISTS `flows_category_idx` ON `flows` (`category`);
CREATE INDEX IF NOT EXISTS `flows_public_idx` ON `flows` (`is_public`);
CREATE INDEX IF NOT EXISTS `flows_starter_idx` ON `flows` (`is_starter_pack`);
CREATE INDEX IF NOT EXISTS `flows_featured_idx` ON `flows` (`is_featured`);
CREATE INDEX IF NOT EXISTS `flows_active_idx` ON `flows` (`is_active`);

-- User's installed/active flows
CREATE TABLE IF NOT EXISTS `user_flows` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `flow_id` text NOT NULL REFERENCES `flows`(`id`) ON DELETE CASCADE,
  `custom_prompt` text,
  `custom_preferences` text,
  `is_active` integer DEFAULT false NOT NULL,
  `display_order` integer DEFAULT 0 NOT NULL,
  `installed_at` text NOT NULL,
  `last_used_at` text
);

CREATE INDEX IF NOT EXISTS `user_flows_user_idx` ON `user_flows` (`user_id`);
CREATE INDEX IF NOT EXISTS `user_flows_flow_idx` ON `user_flows` (`flow_id`);
CREATE INDEX IF NOT EXISTS `user_flows_active_idx` ON `user_flows` (`is_active`);
CREATE INDEX IF NOT EXISTS `user_flows_order_idx` ON `user_flows` (`display_order`);

-- Flow sessions tracking
CREATE TABLE IF NOT EXISTS `flow_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `flow_id` text NOT NULL REFERENCES `flows`(`id`) ON DELETE CASCADE,
  `project` text,
  `started_at` text NOT NULL,
  `ended_at` text
);

CREATE INDEX IF NOT EXISTS `flow_sessions_user_idx` ON `flow_sessions` (`user_id`);
CREATE INDEX IF NOT EXISTS `flow_sessions_flow_idx` ON `flow_sessions` (`flow_id`);
CREATE INDEX IF NOT EXISTS `flow_sessions_project_idx` ON `flow_sessions` (`project`);
CREATE INDEX IF NOT EXISTS `flow_sessions_started_idx` ON `flow_sessions` (`started_at`);

-- Add flow association to memories
ALTER TABLE `memories` ADD COLUMN `flow_id` text;
ALTER TABLE `memories` ADD COLUMN `flow_session_id` text;
CREATE INDEX IF NOT EXISTS `memories_flow_idx` ON `memories` (`flow_id`);
