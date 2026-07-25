-- LinkedIn graph crawl (Trigger.dev) — crawl-owned tables
-- Separate from scanner postings / company_slugs (ATS). Do not join LinkedIn
-- company_slug to ATS company_slugs without an explicit resolver.

CREATE TABLE IF NOT EXISTS crawl_runs (
  id              UUID PRIMARY KEY,
  trigger_run_id  TEXT,
  seed_url        TEXT NOT NULL,
  seed_job_id     TEXT,
  max_hops        INT NOT NULL DEFAULT 2,
  max_pages       INT NOT NULL DEFAULT 25,
  coffee_every    INT NOT NULL DEFAULT 12,
  status          TEXT NOT NULL DEFAULT 'queued',
  pages_fetched   INT NOT NULL DEFAULT 0,
  fail_reason     TEXT,
  metadata        JSONB,
  started_at      TIMESTAMPTZ DEFAULT now(),
  ended_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS crawl_frontier (
  run_id                  UUID NOT NULL REFERENCES crawl_runs(id) ON DELETE CASCADE,
  job_id                  TEXT NOT NULL,
  url                     TEXT NOT NULL,
  hop                     INT NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'queued',
  discovered_from_job_id  TEXT,
  company_name            TEXT,
  company_slug            TEXT,
  location                TEXT,
  date_text               TEXT,
  salary_raw              TEXT,
  enqueued_at             TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (run_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_crawl_frontier_pop
  ON crawl_frontier (run_id, status, hop, enqueued_at)
  WHERE status = 'queued';

CREATE TABLE IF NOT EXISTS crawl_jobs (
  run_id                      UUID NOT NULL REFERENCES crawl_runs(id) ON DELETE CASCADE,
  job_id                      TEXT NOT NULL,
  source                      TEXT NOT NULL DEFAULT 'linkedin',
  fidelity                    TEXT NOT NULL DEFAULT 'primary',
  url                         TEXT NOT NULL,
  title                       TEXT,
  description                 TEXT,
  employment_type             TEXT,
  date_posted                 TEXT,
  valid_through               TEXT,
  location                    TEXT,
  geo_lat                     TEXT,
  geo_lng                     TEXT,
  months_of_experience        TEXT,
  founder_or_report_line      TEXT,
  company_name                TEXT,
  company_linkedin_url        TEXT,
  company_slug                TEXT,
  company_host                TEXT,
  salary_raw                  TEXT,
  gaps                        TEXT,
  hop                         INT NOT NULL DEFAULT 0,
  seed_url                    TEXT,
  website                     TEXT,
  company_employee_count      TEXT,
  company_follower_count      TEXT,
  company_hq_country          TEXT,
  company_hq_locality         TEXT,
  company_hq_region           TEXT,
  company_founded             TEXT,
  company_recent_post_themes  TEXT,
  company_host_canonical      TEXT,
  similar_pages               JSONB,
  scraped_at                  TIMESTAMPTZ DEFAULT now(),
  enriched_at                 TIMESTAMPTZ,
  PRIMARY KEY (run_id, job_id)
);

-- Existing DBs created before similar_pages:
ALTER TABLE crawl_jobs ADD COLUMN IF NOT EXISTS similar_pages JSONB;

CREATE TABLE IF NOT EXISTS crawl_companies (
  company_slug            TEXT PRIMARY KEY,
  website                 TEXT,
  employee_count          TEXT,
  size_bucket             TEXT,
  follower_count          TEXT,
  hq_country              TEXT,
  hq_locality             TEXT,
  hq_region               TEXT,
  company_host_canonical  TEXT,
  founded                 TEXT,
  recent_post_themes      TEXT,
  org_description         TEXT,
  resolved                BOOLEAN NOT NULL DEFAULT FALSE,
  enrich_flag             TEXT,
  resolved_at             TIMESTAMPTZ
);
