-- Nexus Brain: Learning System, Intelligence Score, GitHub Repos Integration
-- ============================================================================

-- ============================================================================
-- 1. Learnings - System corrections, patterns, preferences
-- ============================================================================

CREATE TABLE IF NOT EXISTS `learnings` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  -- Learning classification
  `type` text NOT NULL DEFAULT 'correction', -- 'correction', 'pattern', 'preference', 'skill'
  `category` text, -- e.g., 'code_style', 'architecture', 'testing', 'documentation'
  
  -- Content
  `trigger` text NOT NULL, -- What triggered this learning (e.g., "when I say X...")
  `response` text NOT NULL, -- What the AI should do/remember
  `context` text, -- Additional context or examples
  
  -- Source tracking
  `source` text NOT NULL DEFAULT 'explicit', -- 'explicit' (user told), 'implicit' (observed), 'community'
  `source_memory_id` text, -- If derived from a memory
  `source_conversation_id` text, -- If from a conversation
  
  -- Application scope
  `scope` text NOT NULL DEFAULT 'global', -- 'global', 'project', 'library', 'flow'
  `project` text, -- If project-scoped
  `library_id` text, -- If library-scoped
  `flow_id` text, -- If flow-scoped
  
  -- Quality & usage
  `confidence` integer DEFAULT 80 NOT NULL, -- 0-100
  `usage_count` integer DEFAULT 0 NOT NULL,
  `success_rate` integer DEFAULT 100, -- 0-100, track if learning was helpful
  `last_used_at` text,
  
  -- Status
  `is_active` integer DEFAULT true NOT NULL,
  
  -- Timestamps
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `learnings_user_idx` ON `learnings` (`user_id`);
CREATE INDEX IF NOT EXISTS `learnings_type_idx` ON `learnings` (`type`);
CREATE INDEX IF NOT EXISTS `learnings_scope_idx` ON `learnings` (`scope`);
CREATE INDEX IF NOT EXISTS `learnings_project_idx` ON `learnings` (`project`);
CREATE INDEX IF NOT EXISTS `learnings_active_idx` ON `learnings` (`is_active`);
CREATE INDEX IF NOT EXISTS `learnings_source_idx` ON `learnings` (`source`);

-- ============================================================================
-- 2. Intelligence Score - XP and leveling system
-- ============================================================================

CREATE TABLE IF NOT EXISTS `intelligence_scores` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL UNIQUE REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  -- Current score
  `total_xp` integer DEFAULT 0 NOT NULL,
  `level` integer DEFAULT 1 NOT NULL,
  `current_level_xp` integer DEFAULT 0 NOT NULL, -- XP within current level
  
  -- Category breakdown (JSON object with XP per category)
  `category_xp` text DEFAULT '{}', -- e.g., { "docs": 100, "memory": 50, "flows": 75 }
  
  -- Streak tracking
  `current_streak` integer DEFAULT 0 NOT NULL,
  `longest_streak` integer DEFAULT 0 NOT NULL,
  `last_activity_date` text, -- Date only (YYYY-MM-DD) for streak calculation
  
  -- Achievements (JSON array of unlocked achievement IDs)
  `achievements` text DEFAULT '[]',
  
  -- Stats
  `total_queries` integer DEFAULT 0 NOT NULL,
  `total_memories` integer DEFAULT 0 NOT NULL,
  `total_learnings` integer DEFAULT 0 NOT NULL,
  `total_flows_created` integer DEFAULT 0 NOT NULL,
  `total_repos_indexed` integer DEFAULT 0 NOT NULL,
  
  -- Timestamps
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `intelligence_scores_user_idx` ON `intelligence_scores` (`user_id`);
CREATE INDEX IF NOT EXISTS `intelligence_scores_level_idx` ON `intelligence_scores` (`level`);
CREATE INDEX IF NOT EXISTS `intelligence_scores_xp_idx` ON `intelligence_scores` (`total_xp`);

-- ============================================================================
-- 3. XP Events - Log of all XP-earning activities
-- ============================================================================

CREATE TABLE IF NOT EXISTS `xp_events` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  -- Event details
  `event_type` text NOT NULL, -- 'query_docs', 'save_memory', 'create_learning', 'create_flow', 'index_repo', 'streak_bonus', etc.
  `xp_amount` integer NOT NULL,
  `category` text NOT NULL, -- 'docs', 'memory', 'learning', 'flows', 'repos', 'achievement'
  
  -- Context
  `description` text, -- Human-readable description
  `reference_id` text, -- ID of related entity (memory, flow, repo, etc.)
  `reference_type` text, -- Type of related entity
  
  -- Multipliers applied
  `base_xp` integer NOT NULL, -- XP before multipliers
  `multiplier` real DEFAULT 1.0, -- Any multiplier applied (streak, achievement, etc.)
  
  -- Timestamp
  `created_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `xp_events_user_idx` ON `xp_events` (`user_id`);
CREATE INDEX IF NOT EXISTS `xp_events_type_idx` ON `xp_events` (`event_type`);
CREATE INDEX IF NOT EXISTS `xp_events_category_idx` ON `xp_events` (`category`);
CREATE INDEX IF NOT EXISTS `xp_events_created_idx` ON `xp_events` (`created_at`);

-- ============================================================================
-- 4. Connected Repos - GitHub repository connections
-- ============================================================================

CREATE TABLE IF NOT EXISTS `connected_repos` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  -- GitHub info
  `github_id` integer NOT NULL, -- GitHub repository ID
  `owner` text NOT NULL, -- GitHub owner (user or org)
  `name` text NOT NULL, -- Repository name
  `full_name` text NOT NULL, -- owner/name
  `description` text,
  `html_url` text NOT NULL,
  `default_branch` text DEFAULT 'main' NOT NULL,
  
  -- Visibility
  `is_private` integer DEFAULT false NOT NULL,
  
  -- Indexing status
  `index_status` text DEFAULT 'pending' NOT NULL, -- 'pending', 'indexing', 'indexed', 'failed'
  `last_indexed_at` text,
  `index_error` text,
  
  -- Storage
  `r2_prefix` text, -- R2 key prefix for stored files
  `total_files` integer DEFAULT 0 NOT NULL,
  `total_bytes` integer DEFAULT 0 NOT NULL,
  `indexed_files` integer DEFAULT 0 NOT NULL, -- Files actually indexed (after filtering)
  
  -- Last known state
  `last_commit_sha` text,
  `last_commit_at` text,
  
  -- Settings
  `auto_sync` integer DEFAULT false NOT NULL, -- Whether to auto-sync on push (future)
  `include_patterns` text DEFAULT '[]', -- JSON array of glob patterns to include
  `exclude_patterns` text DEFAULT '[]', -- JSON array of glob patterns to exclude
  
  -- Timestamps
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `connected_repos_user_idx` ON `connected_repos` (`user_id`);
CREATE INDEX IF NOT EXISTS `connected_repos_github_id_idx` ON `connected_repos` (`github_id`);
CREATE INDEX IF NOT EXISTS `connected_repos_full_name_idx` ON `connected_repos` (`full_name`);
CREATE INDEX IF NOT EXISTS `connected_repos_status_idx` ON `connected_repos` (`index_status`);

-- Unique constraint: one repo per user (can't connect same repo twice)
CREATE UNIQUE INDEX IF NOT EXISTS `connected_repos_user_repo_idx` ON `connected_repos` (`user_id`, `github_id`);

-- ============================================================================
-- 5. Repo Files - Indexed files from connected repositories
-- ============================================================================

CREATE TABLE IF NOT EXISTS `repo_files` (
  `id` text PRIMARY KEY NOT NULL,
  `repo_id` text NOT NULL REFERENCES `connected_repos`(`id`) ON DELETE CASCADE,
  
  -- File info
  `path` text NOT NULL, -- Relative path in repo
  `file_type` text NOT NULL, -- 'readme', 'docs', 'config', 'types', 'source', 'test', etc.
  `language` text, -- Programming language if applicable
  
  -- Content
  `r2_key` text NOT NULL, -- R2 storage key for content
  `content_hash` text, -- SHA256 of content for change detection
  `size_bytes` integer DEFAULT 0 NOT NULL,
  `line_count` integer DEFAULT 0,
  
  -- Metadata
  `title` text, -- Extracted title (e.g., from markdown heading)
  `summary` text, -- AI-generated summary (optional)
  
  -- Git info
  `last_commit_sha` text,
  `last_modified_at` text,
  
  -- Timestamps
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `repo_files_repo_idx` ON `repo_files` (`repo_id`);
CREATE INDEX IF NOT EXISTS `repo_files_path_idx` ON `repo_files` (`path`);
CREATE INDEX IF NOT EXISTS `repo_files_type_idx` ON `repo_files` (`file_type`);

-- Unique constraint: one file path per repo
CREATE UNIQUE INDEX IF NOT EXISTS `repo_files_repo_path_idx` ON `repo_files` (`repo_id`, `path`);

-- ============================================================================
-- 6. Projects - Auto-detected project fingerprints
-- ============================================================================

CREATE TABLE IF NOT EXISTS `projects` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  
  -- Identity
  `name` text NOT NULL,
  `path` text, -- Local path where project was detected
  `description` text,
  
  -- Tech stack fingerprint (JSON)
  `stack` text DEFAULT '{}', -- e.g., { "framework": "next.js", "language": "typescript", "ui": "tailwind" }
  `dependencies` text DEFAULT '[]', -- Key dependencies detected
  `dev_dependencies` text DEFAULT '[]',
  
  -- Detected patterns
  `patterns` text DEFAULT '{}', -- e.g., { "testing": "vitest", "monorepo": true, "packageManager": "pnpm" }
  
  -- Linked resources
  `repo_id` text REFERENCES `connected_repos`(`id`) ON DELETE SET NULL,
  `flow_id` text REFERENCES `flows`(`id`) ON DELETE SET NULL,
  
  -- Suggested flows (JSON array of flow IDs)
  `suggested_flows` text DEFAULT '[]',
  
  -- Stats
  `session_count` integer DEFAULT 0 NOT NULL,
  `last_session_at` text,
  
  -- Timestamps
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `projects_user_idx` ON `projects` (`user_id`);
CREATE INDEX IF NOT EXISTS `projects_name_idx` ON `projects` (`name`);
CREATE INDEX IF NOT EXISTS `projects_repo_idx` ON `projects` (`repo_id`);
CREATE INDEX IF NOT EXISTS `projects_flow_idx` ON `projects` (`flow_id`);

-- ============================================================================
-- 7. Community Learnings - Shared learning patterns
-- ============================================================================

CREATE TABLE IF NOT EXISTS `community_learnings` (
  `id` text PRIMARY KEY NOT NULL,
  
  -- Source (original learning that was shared)
  `source_learning_id` text, -- Original learning ID (if from user share)
  `source_user_id` text REFERENCES `users`(`id`) ON DELETE SET NULL, -- Who shared it
  
  -- Content
  `type` text NOT NULL, -- 'correction', 'pattern', 'preference', 'skill'
  `category` text,
  `trigger` text NOT NULL,
  `response` text NOT NULL,
  `context` text,
  
  -- Scope
  `scope` text NOT NULL DEFAULT 'library', -- 'global', 'library', 'framework'
  `library_id` text, -- Which library this applies to
  `framework` text, -- Which framework (if applicable)
  
  -- Quality metrics
  `upvotes` integer DEFAULT 0 NOT NULL,
  `downvotes` integer DEFAULT 0 NOT NULL,
  `adoption_count` integer DEFAULT 0 NOT NULL, -- How many users adopted this
  `confidence` integer DEFAULT 70 NOT NULL,
  
  -- Status
  `is_verified` integer DEFAULT false NOT NULL, -- Manually verified by admins
  `is_active` integer DEFAULT true NOT NULL,
  
  -- Timestamps
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `community_learnings_type_idx` ON `community_learnings` (`type`);
CREATE INDEX IF NOT EXISTS `community_learnings_library_idx` ON `community_learnings` (`library_id`);
CREATE INDEX IF NOT EXISTS `community_learnings_scope_idx` ON `community_learnings` (`scope`);
CREATE INDEX IF NOT EXISTS `community_learnings_active_idx` ON `community_learnings` (`is_active`);
CREATE INDEX IF NOT EXISTS `community_learnings_upvotes_idx` ON `community_learnings` (`upvotes`);

-- ============================================================================
-- 8. Learning Adoptions - Track which community learnings users adopted
-- ============================================================================

CREATE TABLE IF NOT EXISTS `learning_adoptions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `community_learning_id` text NOT NULL REFERENCES `community_learnings`(`id`) ON DELETE CASCADE,
  
  -- User's local learning (created when adopting)
  `learning_id` text REFERENCES `learnings`(`id`) ON DELETE SET NULL,
  
  -- Feedback
  `vote` integer, -- 1 = upvote, -1 = downvote, NULL = no vote
  
  -- Timestamps
  `adopted_at` text NOT NULL
);

CREATE INDEX IF NOT EXISTS `learning_adoptions_user_idx` ON `learning_adoptions` (`user_id`);
CREATE INDEX IF NOT EXISTS `learning_adoptions_community_idx` ON `learning_adoptions` (`community_learning_id`);

-- Unique constraint: one adoption per user per community learning
CREATE UNIQUE INDEX IF NOT EXISTS `learning_adoptions_user_community_idx` ON `learning_adoptions` (`user_id`, `community_learning_id`);

-- ============================================================================
-- Update accounts table to store GitHub access token with repo scope
-- ============================================================================

-- We don't need to alter accounts - Better Auth already stores access_token
-- But we need to request the 'repo' scope when authenticating with GitHub

-- ============================================================================
-- Add brain-related columns to flows
-- ============================================================================

-- Link flows to projects
ALTER TABLE `flows` ADD COLUMN `project_id` text REFERENCES `projects`(`id`) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS `flows_project_idx` ON `flows` (`project_id`);
