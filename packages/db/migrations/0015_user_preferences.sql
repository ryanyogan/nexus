-- Add user preferences table for storing user settings
CREATE TABLE IF NOT EXISTS `user_preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`default_response_format` text DEFAULT 'full' NOT NULL,
	`default_token_budget` integer,
	`show_code_line_numbers` integer DEFAULT true NOT NULL,
	`preferred_code_language` text,
	`email_notifications` integer DEFAULT true NOT NULL,
	`email_weekly_digest` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

-- Add unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS `user_preferences_user_id_unique` ON `user_preferences` (`user_id`);
