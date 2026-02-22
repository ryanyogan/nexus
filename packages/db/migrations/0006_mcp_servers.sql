-- MCP Servers Registry
CREATE TABLE `mcp_servers` (
  `id` text PRIMARY KEY NOT NULL,
  `namespace` text NOT NULL,
  `name` text NOT NULL,
  `display_name` text,
  `description` text,
  `version` text,
  `transport_type` text DEFAULT 'stdio' NOT NULL,
  `package_type` text DEFAULT 'npm' NOT NULL,
  `package_name` text,
  `install_command` text,
  `install_args` text DEFAULT '[]',
  `env_vars` text DEFAULT '{}',
  `tools` text DEFAULT '[]',
  `resources` text DEFAULT '[]',
  `prompts` text DEFAULT '[]',
  `has_tools` integer DEFAULT false NOT NULL,
  `has_resources` integer DEFAULT false NOT NULL,
  `has_prompts` integer DEFAULT false NOT NULL,
  `repository_url` text,
  `documentation_url` text,
  `homepage_url` text,
  `icon_url` text,
  `requires_auth` integer DEFAULT false NOT NULL,
  `auth_type` text DEFAULT 'none',
  `author` text,
  `license` text,
  `keywords` text DEFAULT '[]',
  `categories` text DEFAULT '[]',
  `weekly_downloads` integer DEFAULT 0 NOT NULL,
  `github_stars` integer DEFAULT 0 NOT NULL,
  `is_verified` integer DEFAULT false NOT NULL,
  `verified_at` text,
  `is_official` integer DEFAULT false NOT NULL,
  `is_featured` integer DEFAULT false NOT NULL,
  `is_active` integer DEFAULT true NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

-- MCP Server Documentation Links
CREATE TABLE `mcp_server_docs` (
  `server_id` text NOT NULL REFERENCES `mcp_servers`(`id`) ON DELETE CASCADE,
  `library_id` text NOT NULL REFERENCES `libraries`(`id`) ON DELETE CASCADE
);

-- MCP Server Stats
CREATE TABLE `mcp_server_stats` (
  `server_id` text PRIMARY KEY NOT NULL REFERENCES `mcp_servers`(`id`) ON DELETE CASCADE,
  `total_discoveries` integer DEFAULT 0 NOT NULL,
  `total_config_copies` integer DEFAULT 0 NOT NULL,
  `last_discovered_at` text
);

-- Indexes
CREATE INDEX `mcp_servers_namespace_idx` ON `mcp_servers` (`namespace`);
CREATE INDEX `mcp_servers_name_idx` ON `mcp_servers` (`name`);
CREATE INDEX `mcp_servers_transport_idx` ON `mcp_servers` (`transport_type`);
CREATE INDEX `mcp_servers_package_idx` ON `mcp_servers` (`package_type`);
CREATE INDEX `mcp_servers_has_tools_idx` ON `mcp_servers` (`has_tools`);
CREATE INDEX `mcp_servers_has_resources_idx` ON `mcp_servers` (`has_resources`);
CREATE INDEX `mcp_servers_official_idx` ON `mcp_servers` (`is_official`);
CREATE INDEX `mcp_servers_featured_idx` ON `mcp_servers` (`is_featured`);
CREATE INDEX `mcp_servers_active_idx` ON `mcp_servers` (`is_active`);
CREATE INDEX `mcp_server_docs_server_idx` ON `mcp_server_docs` (`server_id`);
CREATE INDEX `mcp_server_docs_library_idx` ON `mcp_server_docs` (`library_id`);
