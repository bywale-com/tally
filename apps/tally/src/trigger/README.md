# LinkedIn graph crawl (Trigger.dev)

Governed LinkedIn guest crawl: Postgres frontier + StealthyFetcher fetch seam + Trigger.dev parent/child tasks + Crawl Run panel in Tally.

## Prerequisites

1. **Postgres** — `cd scanner && docker compose up -d postgres` then apply crawl schema if DB already existed:
   ```bash
   docker compose exec -T postgres psql -U tally -d tally_scanner < db/crawl_schema.sql
   ```
2. **Env** (gitignored) in `apps/tally/.env` and `scanner/.env`:
   - `TRIGGER_SECRET_KEY`
   - `DATABASE_URL=postgresql://tally:tally@localhost:5432/tally_scanner`
   - `SCANNER_URL=http://127.0.0.1:8000` (Trigger worker → StealthyFetcher)
   - `FIRECRAWL_API_KEY` (optional; non-LinkedIn only)
3. **Scrapling browsers** (once per machine):
   ```bash
   pip install -r requirements.txt
   scrapling install
   ```
4. **Secrets stay local** — never commit `.env`.

## Run (three processes)

```bash
# 1) Postgres + scanner API (hosts /crawl/fetch StealthyFetcher)
cd scanner
docker compose up -d postgres
uvicorn tally_scanner.api:app --reload --port 8000

# 2) Trigger.dev worker (from apps/tally)
cd apps/tally
npm run trigger:dev

# 3) Tally UI
npm run dev
```

In the app: **Board → Enrichment → LinkedIn crawl** → paste a guest `/jobs/view/` URL → **Run**.

Smoke fetch (no DB/Trigger):

```bash
cd apps/tally
npx tsx scripts/smokeFetch.ts "https://www.linkedin.com/jobs/view/..."
```

## Fetch seam

| URL class | Transport |
|-----------|-----------|
| `linkedin.com` | **StealthyFetcher** via `POST {SCANNER_URL}/crawl/fetch`, then direct/proxy fallback |
| other | Firecrawl, then direct |

### Job URL extract (current product mode)

- **One scrape per seed job URL** — no frontier follow of similar jobs.
- Similar job cards from the HTML are stored as `similar_pages` JSON on the row.
- Crawl Run panel shows a **results grid** (fields fill live). **Export to List** is enabled when the run finishes (does not auto-create a list).
- Company profile scrape: set `enrichCompany: true` on `crawl-page` (cache in `crawl_companies`). Offline batch: `python scripts/linkedin_company_enrich.py --smoke 3` then `--founding-only` / `--publish`.

| Piece | Role |
|-------|------|
| `crawl_runs` / `crawl_jobs` (+ `similar_pages`) | Durable run + primary job |
| `linkedin-crawl-orchestrator` | One `crawl-page` per seed; metadata.rows for UI |
| `crawl-page` | Fetch → parse → write job + similar_pages (no follow) |
| `fetchGuestPage` | Seam: stealthy → direct (LinkedIn) |
| Crawl Run panel | Results table + Export to List |

## Build order status

1. Schema — `scanner/db/crawl_schema.sql`
2. Parsers + fetch seam — `src/trigger/crawl/*`
3. Child + parent tasks — `src/trigger/crawlPage.ts`, `linkedinCrawlOrchestrator.ts`
4. FastAPI start/status + stealth fetch — `POST /crawl/linkedin/start`, `POST /crawl/fetch`, …
5. UI panel + StatusBar signal — done (poll-based; Trigger Realtime token can layer later)

## Note on Trigger Cloud

Local `trigger:dev` can reach `127.0.0.1:8000`. Cloud-hosted Trigger workers cannot — point `SCANNER_URL` at a reachable host (tunnel/VPS) or keep the worker local for LinkedIn crawls.
