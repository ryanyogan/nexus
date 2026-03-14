-- Add Context7 metadata fields to libraries table
ALTER TABLE libraries ADD COLUMN versions TEXT DEFAULT '[]';
ALTER TABLE libraries ADD COLUMN context7_trust_score INTEGER;
ALTER TABLE libraries ADD COLUMN context7_benchmark_score INTEGER;
ALTER TABLE libraries ADD COLUMN context7_total_snippets INTEGER;
ALTER TABLE libraries ADD COLUMN context7_stars INTEGER;
ALTER TABLE libraries ADD COLUMN context7_branch TEXT;
ALTER TABLE libraries ADD COLUMN context7_state TEXT;
ALTER TABLE libraries ADD COLUMN context7_last_updated_at TEXT;
ALTER TABLE libraries ADD COLUMN context7_synced_at TEXT;

-- Create sync_jobs table for tracking sync history
CREATE TABLE IF NOT EXISTS sync_jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('context7_libraries', 'context7_skills')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  successful_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  errors TEXT DEFAULT '[]',
  triggered_by TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sync_jobs_type_idx ON sync_jobs(type);
CREATE INDEX IF NOT EXISTS sync_jobs_status_idx ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS sync_jobs_created_at_idx ON sync_jobs(created_at);
