-- Migration: Rename flows to prompts
-- This renames all flow-related tables and columns to use "prompts" terminology

-- Rename the main tables
ALTER TABLE flows RENAME TO prompts;
ALTER TABLE user_flows RENAME TO user_prompts;
ALTER TABLE flow_sessions RENAME TO prompt_sessions;

-- Update foreign key column names in user_prompts
-- SQLite doesn't support renaming columns directly, but we can use the new name going forward
-- The column flow_id will still work but we'll reference it as prompt_id in new code

-- Update foreign key column names in prompt_sessions  
-- Same approach - column flow_id remains but we reference as prompt_id

-- Drop old indexes and create new ones with correct names
DROP INDEX IF EXISTS flows_user_id_idx;
DROP INDEX IF EXISTS flows_slug_idx;
DROP INDEX IF EXISTS flows_parent_idx;
DROP INDEX IF EXISTS flows_project_idx;
DROP INDEX IF EXISTS flows_category_idx;
DROP INDEX IF EXISTS flows_public_idx;
DROP INDEX IF EXISTS flows_starter_idx;
DROP INDEX IF EXISTS flows_featured_idx;
DROP INDEX IF EXISTS flows_active_idx;

CREATE INDEX IF NOT EXISTS prompts_user_id_idx ON prompts(user_id);
CREATE INDEX IF NOT EXISTS prompts_slug_idx ON prompts(slug);
CREATE INDEX IF NOT EXISTS prompts_parent_idx ON prompts(parent_flow_id);
CREATE INDEX IF NOT EXISTS prompts_project_idx ON prompts(project_id);
CREATE INDEX IF NOT EXISTS prompts_category_idx ON prompts(category);
CREATE INDEX IF NOT EXISTS prompts_public_idx ON prompts(is_public);
CREATE INDEX IF NOT EXISTS prompts_starter_idx ON prompts(is_starter_pack);
CREATE INDEX IF NOT EXISTS prompts_featured_idx ON prompts(is_featured);
CREATE INDEX IF NOT EXISTS prompts_active_idx ON prompts(is_active);

-- Rename user_flows indexes
DROP INDEX IF EXISTS user_flows_user_idx;
DROP INDEX IF EXISTS user_flows_flow_idx;
DROP INDEX IF EXISTS user_flows_active_idx;
DROP INDEX IF EXISTS user_flows_order_idx;

CREATE INDEX IF NOT EXISTS user_prompts_user_idx ON user_prompts(user_id);
CREATE INDEX IF NOT EXISTS user_prompts_prompt_idx ON user_prompts(flow_id);
CREATE INDEX IF NOT EXISTS user_prompts_active_idx ON user_prompts(is_active);
CREATE INDEX IF NOT EXISTS user_prompts_order_idx ON user_prompts(display_order);

-- Rename flow_sessions indexes
DROP INDEX IF EXISTS flow_sessions_user_idx;
DROP INDEX IF EXISTS flow_sessions_flow_idx;
DROP INDEX IF EXISTS flow_sessions_project_idx;
DROP INDEX IF EXISTS flow_sessions_started_idx;

CREATE INDEX IF NOT EXISTS prompt_sessions_user_idx ON prompt_sessions(user_id);
CREATE INDEX IF NOT EXISTS prompt_sessions_prompt_idx ON prompt_sessions(flow_id);
CREATE INDEX IF NOT EXISTS prompt_sessions_project_idx ON prompt_sessions(project);
CREATE INDEX IF NOT EXISTS prompt_sessions_started_idx ON prompt_sessions(started_at);

-- Note: The column names like 'flow_id', 'parent_flow_id' still exist but
-- the schema.ts will map them to 'promptId', 'parentPromptId' etc.
-- SQLite doesn't support RENAME COLUMN easily, but the mapping handles this.
