-- MCP Server Submissions table
CREATE TABLE IF NOT EXISTS server_submissions (
  id TEXT PRIMARY KEY,
  
  -- Server identity
  name TEXT NOT NULL,
  display_name TEXT,
  description TEXT,
  
  -- Source information
  repository_url TEXT NOT NULL,
  package_name TEXT,
  package_type TEXT DEFAULT 'npm',
  transport_type TEXT DEFAULT 'stdio',
  
  -- Submitter info
  submitter_email TEXT,
  submitter_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Review status
  status TEXT NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  
  -- If approved, link to created server
  server_id TEXT REFERENCES mcp_servers(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TEXT NOT NULL,
  processed_at TEXT
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS server_submissions_status_idx ON server_submissions(status);
CREATE INDEX IF NOT EXISTS server_submissions_created_at_idx ON server_submissions(created_at);
CREATE INDEX IF NOT EXISTS server_submissions_user_idx ON server_submissions(submitter_user_id);
