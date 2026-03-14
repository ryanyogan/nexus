-- Crawler enhancements migration
-- Adds support for GitHub-based crawling, quality metrics, and version tracking

-- Add GitHub source columns to libraries
ALTER TABLE libraries ADD COLUMN github_owner TEXT;
ALTER TABLE libraries ADD COLUMN github_repo TEXT;
ALTER TABLE libraries ADD COLUMN github_branch TEXT DEFAULT 'main';
ALTER TABLE libraries ADD COLUMN github_docs_paths TEXT DEFAULT '[]';
ALTER TABLE libraries ADD COLUMN last_commit_sha TEXT;

-- Add quality metrics
ALTER TABLE libraries ADD COLUMN benchmark_score INTEGER;
ALTER TABLE libraries ADD COLUMN trust_score INTEGER;
ALTER TABLE libraries ADD COLUMN quality_analysis TEXT;

-- Add website source columns
ALTER TABLE libraries ADD COLUMN website_url TEXT;
ALTER TABLE libraries ADD COLUMN website_content_selector TEXT;

-- Add refresh tracking
ALTER TABLE libraries ADD COLUMN last_refresh_requested_at TEXT;
ALTER TABLE libraries ADD COLUMN refresh_scheduled_at TEXT;

-- Track individual files for incremental updates
CREATE TABLE IF NOT EXISTS library_files (
  id TEXT PRIMARY KEY,
  library_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT DEFAULT 'markdown',
  file_sha TEXT,
  content_hash TEXT,
  chunk_count INTEGER DEFAULT 0,
  token_count INTEGER DEFAULT 0,
  last_fetched_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(library_id, file_path),
  FOREIGN KEY (library_id) REFERENCES libraries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS library_files_library_idx ON library_files(library_id);
CREATE INDEX IF NOT EXISTS library_files_sha_idx ON library_files(file_sha);

-- Skill submissions table
CREATE TABLE IF NOT EXISTS skill_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  skill_url TEXT NOT NULL,
  source_repo TEXT,
  type TEXT NOT NULL CHECK (type IN ('analysis', 'generation', 'transformation', 'integration', 'utility')),
  categories TEXT DEFAULT '[]',
  content_preview TEXT,
  submitted_by TEXT,
  submitter_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'indexing')),
  admin_notes TEXT,
  reviewed_at TEXT,
  reviewed_by TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS skill_submissions_status_idx ON skill_submissions(status);
CREATE INDEX IF NOT EXISTS skill_submissions_created_idx ON skill_submissions(created_at);

-- Library versions table for tracking multiple versions
CREATE TABLE IF NOT EXISTS library_versions (
  id TEXT PRIMARY KEY,
  library_id TEXT NOT NULL,
  version TEXT NOT NULL,
  version_tag TEXT,
  is_default INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  indexed_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(library_id, version),
  FOREIGN KEY (library_id) REFERENCES libraries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS library_versions_library_idx ON library_versions(library_id);
CREATE INDEX IF NOT EXISTS library_versions_default_idx ON library_versions(is_default);

-- Refresh jobs table for tracking refresh requests
CREATE TABLE IF NOT EXISTS refresh_jobs (
  id TEXT PRIMARY KEY,
  library_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  triggered_by TEXT,
  files_processed INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  chunks_updated INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (library_id) REFERENCES libraries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS refresh_jobs_library_idx ON refresh_jobs(library_id);
CREATE INDEX IF NOT EXISTS refresh_jobs_status_idx ON refresh_jobs(status);
