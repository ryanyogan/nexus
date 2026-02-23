-- ============================================================================
-- Subscriptions - User billing and plans
-- ============================================================================

CREATE TABLE IF NOT EXISTS `teams` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `description` text,
  `icon_url` text,
  `owner_id` text NOT NULL,
  `settings` text DEFAULT '{}',
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `teams_slug_unique` ON `teams` (`slug`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `teams_slug_idx` ON `teams` (`slug`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `teams_owner_idx` ON `teams` (`owner_id`);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `plan` text DEFAULT 'free' NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `stripe_customer_id` text,
  `stripe_subscription_id` text,
  `stripe_price_id` text,
  `current_period_start` text,
  `current_period_end` text,
  `api_calls_limit` integer,
  `api_calls_used` integer DEFAULT 0 NOT NULL,
  `api_keys_limit` integer DEFAULT 1 NOT NULL,
  `team_id` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `canceled_at` text,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `subscriptions_user_idx` ON `subscriptions` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `subscriptions_stripe_customer_idx` ON `subscriptions` (`stripe_customer_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `subscriptions_stripe_sub_idx` ON `subscriptions` (`stripe_subscription_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `subscriptions_team_idx` ON `subscriptions` (`team_id`);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` text PRIMARY KEY NOT NULL,
  `team_id` text NOT NULL,
  `user_id` text NOT NULL,
  `role` text DEFAULT 'member' NOT NULL,
  `joined_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `team_members_team_idx` ON `team_members` (`team_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `team_members_user_idx` ON `team_members` (`user_id`);

-- ============================================================================
-- Skills - Agent skills registry
-- ============================================================================

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `skills` (
  `id` text PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `slug` text NOT NULL,
  `description` text,
  `source_url` text,
  `source_repo` text,
  `author` text,
  `version` text,
  `type` text DEFAULT 'utility' NOT NULL,
  `categories` text DEFAULT '[]' NOT NULL,
  `tags` text DEFAULT '[]' NOT NULL,
  `format` text DEFAULT 'markdown' NOT NULL,
  `r2_key` text NOT NULL,
  `content_preview` text,
  `required_tools` text DEFAULT '[]',
  `required_mcp_servers` text DEFAULT '[]',
  `install_count` integer DEFAULT 0 NOT NULL,
  `usage_count` integer DEFAULT 0 NOT NULL,
  `rating` integer,
  `is_official` integer DEFAULT false NOT NULL,
  `is_featured` integer DEFAULT false NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `is_verified` integer DEFAULT false NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `skills_slug_unique` ON `skills` (`slug`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `skills_slug_idx` ON `skills` (`slug`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `skills_type_idx` ON `skills` (`type`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `skills_source_repo_idx` ON `skills` (`source_repo`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `skills_official_idx` ON `skills` (`is_official`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `skills_featured_idx` ON `skills` (`is_featured`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `skills_active_idx` ON `skills` (`is_active`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `skills_install_count_idx` ON `skills` (`install_count`);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user_skills` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `skill_id` text NOT NULL,
  `custom_config` text,
  `installed_at` text NOT NULL,
  `last_used_at` text,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `user_skills_user_idx` ON `user_skills` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `user_skills_skill_idx` ON `user_skills` (`skill_id`);
