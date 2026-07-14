-- Add AI filter columns to existing DBs (schema.sql only runs on first Postgres boot).
ALTER TABLE postings ADD COLUMN IF NOT EXISTS filter_status TEXT;
ALTER TABLE postings ADD COLUMN IF NOT EXISTS filter_reason TEXT;
ALTER TABLE postings ADD COLUMN IF NOT EXISTS filter_json JSONB;

CREATE INDEX IF NOT EXISTS idx_postings_filter_status
  ON postings (filter_status);
