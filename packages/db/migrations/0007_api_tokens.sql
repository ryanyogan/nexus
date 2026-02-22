-- API Tokens for MCP authentication
CREATE TABLE `api_tokens` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text REFERENCES `users`(`id`) ON DELETE CASCADE,
  `name` text NOT NULL,
  `token_hash` text NOT NULL,
  `token_prefix` text NOT NULL,
  `scopes` text DEFAULT '[]',
  `last_used_at` text,
  `expires_at` text,
  `is_active` integer DEFAULT true NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX `api_tokens_user_idx` ON `api_tokens` (`user_id`);
CREATE INDEX `api_tokens_hash_idx` ON `api_tokens` (`token_hash`);
CREATE INDEX `api_tokens_active_idx` ON `api_tokens` (`is_active`);
