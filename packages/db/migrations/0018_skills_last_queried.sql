-- Add lastQueriedAt column to skills table for trending functionality
ALTER TABLE skills ADD COLUMN last_queried_at TEXT;
