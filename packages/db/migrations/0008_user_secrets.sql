-- User Secrets - Encrypted credential vault for API keys
CREATE TABLE `user_secrets` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `name` text NOT NULL,
  `provider` text NOT NULL,
  `encrypted_value` text NOT NULL,
  `iv` text NOT NULL,
  `description` text,
  `key_prefix` text,
  `last_used_at` text,
  `usage_count` integer DEFAULT 0 NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `expires_at` text
);

CREATE INDEX `user_secrets_user_idx` ON `user_secrets` (`user_id`);
CREATE INDEX `user_secrets_provider_idx` ON `user_secrets` (`provider`);
CREATE INDEX `user_secrets_active_idx` ON `user_secrets` (`is_active`);
