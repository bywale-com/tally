# Tally Scanner

Daily sourcing pipeline for **Tally** (pay-per-qualified-meeting fractional sales): scrape early sales hires at funded B2B companies → loose regex filter → Postgres dedup → **one** Claude batch score → ranked Notion table.

Lives under `scanner/` so the future Tally product app can occupy `apps/` without colliding.

## Architecture

```
[Job boards & APIs]
        ↓
[Scraper tier]         ← Tier 1 ATS APIs first (Greenhouse / Lever / Ashby)
        ↓
[Regex filter]         ← role + confession strings (loose)
        ↓
[Dedup store]          ← Postgres, hash(company + title) — source NOT in key
        ↓  (new rows only, scored = false)
[LLM scorer — batch]   ← Claude + web search, Tally Scanner prompt
        ↓
[Notion table]         ← ranked by ACV desc, lane A / B / DQ
```

**Orchestrator:** n8n (cron inside Docker). IDE is build-time only.

## Stack

| Service | Role |
|---------|------|
| `postgres` | Dedup + slug store + n8n metadata (`n8n` schema) |
| `scanner` | Python worker (FastAPI `/run` + CLI) |
| `n8n` | Daily cron → `POST http://scanner:8000/run` |
| `searxng` | Optional profile — ATS slug discovery via dorks |

**No paid scrapers.** No Apify. JobSpy / Scrapy / Playwright come later per build order.

## Quick start

```bash
cd scanner
cp .env.example .env
# Fill ANTHROPIC_API_KEY and NOTION_TOKEN when ready to score + write

docker compose up -d postgres scanner
# Optional slug discovery:
# docker compose --profile searxng up -d

# Ingest only (no LLM / Notion) — proves filter + dedup:
docker compose exec scanner python -m tally_scanner run --no-score --no-notion --no-discover

# Full daily boundary:
docker compose exec scanner python -m tally_scanner run
```

n8n UI: http://localhost:5678 — import `n8n/workflows/daily-scanner.json` (cron 07:00 local).

## Repo layout

```
scanner/
  docker-compose.yml
  Dockerfile
  db/schema.sql
  data/seed_slugs.txt
  n8n/workflows/
  searxng/
  tally_scanner/
    filter.py          # §3 verbatim strings
    db.py              # postings / posting_sources / company_slugs
    sources/ats.py     # Greenhouse, Lever, Ashby
    sources/discovery.py
    scorer.py          # batch Claude + web search
    notion_sink.py
    pipeline.py        # daily run boundary
    api.py             # POST /run for n8n
  tests/
  docs/HANDOFF.md      # full build handoff V1
```

## Decisions (do not relitigate)

1. n8n orchestrates; not the IDE at runtime.
2. **Batch mode** — one LLM call (or chunks) for all new survivors; never per-posting scoring.
3. LLM cost OK; scraping cost is the constraint — free/open-source only.
4. Regex filter is deliberately loose.
5. **Only new survivors go to the scorer** — never re-score rows already in Postgres.
6. Output destination is Notion (new DB under parent `37272d09-0a44-80ec-a852-000b049519b1`).

## Build order (status)

1. ✅ `docker-compose.yml`: n8n + Postgres (+ SearXNG optional)
2. ✅ Postgres schema
3. ✅ Tier 1 ATS pollers + slug discovery hooks
4. ✅ Regex → dedup → scorer → Notion **end-to-end wiring** (Tier 1 only)
5. ⬜ JobSpy (Tier 2)
6. ⬜ HN Algolia, Remote OK, WWR RSS, Adzuna/Jooble
7. ⬜ Getro portfolio boards
8. ⬜ Scrapy long tail / recruiter agencies
9. ⬜ Wellfound/Otta Playwright stealth (last, if ever)

## Acceptance checks

- Running the pipeline twice → **zero** duplicate Notion rows, zero re-scored postings.
- Body containing `self-sourced` → `confession_hit = true` + quote on the record.
- Survivor with findable pricing ACV → real ACV, not UNKNOWN.
- Existing SDR team → Lane B or DQ, never Lane A.
- No paid scraping service in the dependency tree.

**Scorer smoke reference:** Superpanel (Lane A expected) — see handoff §8.

## Local tests

```bash
cd scanner
pip install -r requirements.txt pytest
pytest -q
```
