-- Add MCP query counter to users table for simple usage tracking
-- Replaces Analytics Engine with direct D1 counter increments
-- Only MCP queries are counted (not general API calls)
ALTER TABLE users ADD COLUMN mcp_query_count INTEGER NOT NULL DEFAULT 0;

-- Reset date for monthly billing cycle
ALTER TABLE users ADD COLUMN mcp_query_count_reset_at INTEGER;

-- Index for efficient querying of high-usage users
CREATE INDEX IF NOT EXISTS users_mcp_query_count_idx ON users(mcp_query_count);
