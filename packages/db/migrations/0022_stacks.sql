-- ============================================================================
-- Stacks - AI-powered project scaffolding templates
-- Migration: 0022_stacks.sql
-- ============================================================================

-- Main stacks table
CREATE TABLE IF NOT EXISTS `stacks` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text REFERENCES `users`(`id`) ON DELETE CASCADE,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `description` text,
  `icon` text,
  `color` text,
  `category` text DEFAULT 'general' NOT NULL,
  `layer` integer DEFAULT 0 NOT NULL,
  `tags` text DEFAULT '[]' NOT NULL,
  `instructions` text,
  `cli_preferences` text DEFAULT '{}',
  `manifest_type` text,
  `manifest_content` text,
  `canvas_data` text,
  `compiled_prompt` text,
  `compiled_at` text,
  `token_count` integer,
  `token_budget` text DEFAULT 'standard' NOT NULL,
  `r2_key` text,
  `learning_status` text DEFAULT 'pending' NOT NULL,
  `learning_progress` integer DEFAULT 0 NOT NULL,
  `learning_error` text,
  `forked_from_id` text,
  `is_public` integer DEFAULT 0 NOT NULL,
  `is_featured` integer DEFAULT 0 NOT NULL,
  `is_starter` integer DEFAULT 0 NOT NULL,
  `is_active` integer DEFAULT 1 NOT NULL,
  `fork_count` integer DEFAULT 0 NOT NULL,
  `use_count` integer DEFAULT 0 NOT NULL,
  `install_count` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `stacks_user_id_idx` ON `stacks`(`user_id`);
CREATE INDEX IF NOT EXISTS `stacks_slug_idx` ON `stacks`(`slug`);
CREATE INDEX IF NOT EXISTS `stacks_category_idx` ON `stacks`(`category`);
CREATE INDEX IF NOT EXISTS `stacks_layer_idx` ON `stacks`(`layer`);
CREATE INDEX IF NOT EXISTS `stacks_public_idx` ON `stacks`(`is_public`);
CREATE INDEX IF NOT EXISTS `stacks_featured_idx` ON `stacks`(`is_featured`);
CREATE INDEX IF NOT EXISTS `stacks_starter_idx` ON `stacks`(`is_starter`);
CREATE INDEX IF NOT EXISTS `stacks_active_idx` ON `stacks`(`is_active`);
CREATE INDEX IF NOT EXISTS `stacks_learning_status_idx` ON `stacks`(`learning_status`);
CREATE INDEX IF NOT EXISTS `stacks_forked_from_idx` ON `stacks`(`forked_from_id`);

-- Stack Repositories - GitHub repos for learning
CREATE TABLE IF NOT EXISTS `stack_repos` (
  `id` text PRIMARY KEY NOT NULL,
  `stack_id` text NOT NULL REFERENCES `stacks`(`id`) ON DELETE CASCADE,
  `github_url` text NOT NULL,
  `is_private` integer DEFAULT 0 NOT NULL,
  `branch` text DEFAULT 'main',
  `paths` text,
  `r2_key` text,
  `summary` text,
  `paradigms` text,
  `packages` text,
  `directory_structure` text,
  `status` text DEFAULT 'pending' NOT NULL,
  `indexed_at` text,
  `error` text,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `stack_repos_stack_idx` ON `stack_repos`(`stack_id`);
CREATE INDEX IF NOT EXISTS `stack_repos_status_idx` ON `stack_repos`(`status`);

-- Stack Compositions - Stacks built on top of other stacks
CREATE TABLE IF NOT EXISTS `stack_compositions` (
  `id` text PRIMARY KEY NOT NULL,
  `parent_stack_id` text NOT NULL REFERENCES `stacks`(`id`) ON DELETE CASCADE,
  `child_stack_id` text NOT NULL REFERENCES `stacks`(`id`) ON DELETE CASCADE,
  `position` integer DEFAULT 0 NOT NULL,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `stack_compositions_parent_idx` ON `stack_compositions`(`parent_stack_id`);
CREATE INDEX IF NOT EXISTS `stack_compositions_child_idx` ON `stack_compositions`(`child_stack_id`);

-- Stack Packages - Package research results
CREATE TABLE IF NOT EXISTS `stack_packages` (
  `id` text PRIMARY KEY NOT NULL,
  `stack_id` text NOT NULL REFERENCES `stacks`(`id`) ON DELETE CASCADE,
  `name` text NOT NULL,
  `registry` text DEFAULT 'npm' NOT NULL,
  `version` text,
  `library_id` text REFERENCES `libraries`(`id`),
  `documentation_summary` text,
  `key_apis` text,
  `status` text DEFAULT 'pending' NOT NULL,
  `researched_at` text,
  `error` text,
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `stack_packages_stack_idx` ON `stack_packages`(`stack_id`);
CREATE INDEX IF NOT EXISTS `stack_packages_library_idx` ON `stack_packages`(`library_id`);
CREATE INDEX IF NOT EXISTS `stack_packages_status_idx` ON `stack_packages`(`status`);

-- User's Stack Installations
CREATE TABLE IF NOT EXISTS `user_stacks` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `stack_id` text NOT NULL REFERENCES `stacks`(`id`) ON DELETE CASCADE,
  `custom_instructions` text,
  `custom_preferences` text,
  `installed_at` text NOT NULL,
  `last_used_at` text
);

CREATE INDEX IF NOT EXISTS `user_stacks_user_idx` ON `user_stacks`(`user_id`);
CREATE INDEX IF NOT EXISTS `user_stacks_stack_idx` ON `user_stacks`(`stack_id`);
