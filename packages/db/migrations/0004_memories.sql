-- Migration: Add memories table for persistent AI assistant context
-- This enables semantic search over project context, session summaries,
-- architectural decisions, and lessons learned.

CREATE TABLE memories (
  id TEXT PRIMARY KEY,
  
  -- Ownership & scope (NULL user_id = global memory)
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global', 'user')),
  
  -- Classification
  type TEXT NOT NULL CHECK (type IN ('project_context', 'session_summary', 'decision', 'correction')),
  tags TEXT NOT NULL DEFAULT '[]',  -- JSON array of strings
  
  -- Content
  title TEXT NOT NULL,
  summary TEXT,  -- Short summary for listing
  r2_key TEXT NOT NULL,  -- Full content stored in R2
  
  -- Context
  project TEXT,  -- Optional project name (e.g., "nexus")
  importance INTEGER NOT NULL DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
  
  -- Timestamps
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT  -- Optional TTL for auto-cleanup
);

-- Indexes for common query patterns
CREATE INDEX memories_user_id_idx ON memories(user_id);
CREATE INDEX memories_scope_idx ON memories(scope);
CREATE INDEX memories_type_idx ON memories(type);
CREATE INDEX memories_project_idx ON memories(project);
CREATE INDEX memories_created_at_idx ON memories(created_at);
