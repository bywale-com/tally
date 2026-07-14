-- Tally Scanner — Postgres schema (handoff §4)
-- Applied on first Postgres container boot via docker-entrypoint-initdb.d

CREATE SCHEMA IF NOT EXISTS n8n;

CREATE TABLE IF NOT EXISTS postings (
  id              SERIAL PRIMARY KEY,
  dedup_hash      TEXT UNIQUE NOT NULL,   -- sha256(lower(company) || '|' || lower(title))
  company         TEXT NOT NULL,
  title           TEXT NOT NULL,
  source          TEXT NOT NULL,          -- primary/first board name
  url             TEXT,
  raw_text        TEXT,                   -- primary body (company board preferred)
  confession_hit  BOOLEAN DEFAULT FALSE,
  confession_quote TEXT,
  first_seen      TIMESTAMPTZ DEFAULT now(),
  scored          BOOLEAN DEFAULT FALSE,
  score_json      JSONB,
  lane            TEXT                    -- 'A' | 'B' | 'DQ' | NULL
);

CREATE TABLE IF NOT EXISTS posting_sources (
  posting_id  INT NOT NULL REFERENCES postings(id) ON DELETE CASCADE,
  source      TEXT NOT NULL,
  url         TEXT,
  raw_text    TEXT,
  PRIMARY KEY (posting_id, source)
);

CREATE TABLE IF NOT EXISTS company_slugs (
  slug        TEXT NOT NULL,
  ats         TEXT NOT NULL,              -- greenhouse | lever | ashby
  discovered  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (slug, ats)
);

CREATE INDEX IF NOT EXISTS idx_postings_scored_false
  ON postings (id) WHERE scored = FALSE;

CREATE INDEX IF NOT EXISTS idx_postings_lane
  ON postings (lane);

CREATE INDEX IF NOT EXISTS idx_company_slugs_ats
  ON company_slugs (ats);

-- Seed a few known high-signal boards for first-run smoke tests.
-- Slug discovery (SearXNG) will grow this table.
INSERT INTO company_slugs (slug, ats) VALUES
  ('anthropic', 'greenhouse'),
  ('stripe', 'greenhouse'),
  ('notion', 'ashby'),
  ('ramp', 'ashby'),
  ('openai', 'ashby'),
  ('superpanel', 'ashby'),
  ('superpanel', 'greenhouse'),
  ('superpanel', 'lever')
ON CONFLICT DO NOTHING;
