-- Add github_stars column to libraries table for direct GitHub-sourced stars
-- This replaces the legacy context7_stars field for libraries indexed from GitHub

ALTER TABLE libraries ADD COLUMN github_stars INTEGER DEFAULT 0;

-- Create index for sorting by popularity
CREATE INDEX IF NOT EXISTS libraries_github_stars_idx ON libraries(github_stars);
