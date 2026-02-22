-- Migration: Add context7_id column to libraries table
-- This enables sourcing documentation from Context7's pre-indexed docs API

ALTER TABLE libraries ADD COLUMN context7_id TEXT;
