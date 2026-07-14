# Tally Scanner

Daily sourcing pipeline for **Tally** (pay-per-qualified-meeting fractional sales).

**Search** job boards for founding AE / first-sales / pipeline-confession postings → **AI triage** (tag in/out, keep all) → Postgres dedup → **Claude score** (ACV + Lane A/B/DQ) → Postgres results.

> Full current-state writeup: [`docs/STATE.md`](docs/STATE.md)

## Architecture (search-first)

```
[Search queries — founding AE / confession phrases]
        ↓
[SearXNG ATS dorks + HN + keyword-gated boards]
        ↓
[AI triage]              ← in | out (outs kept)
        ↓
[Postgres dedup]
        ↓  (new filter INs only)
[Claude scorer — batch]  ← ACV, confession quote, lanes
        ↓
[Postgres results]
```

**Not** “dump Notion/Ramp/Stripe career pages and filter afterward.”

## Quick start

```bash
cd scanner
cp .env.example .env   # OPENAI_API_KEY required for triage; ANTHROPIC for scoring

docker compose up -d postgres scanner adminer
docker compose --profile searxng up -d

# Search → AI triage → Postgres (no scorer)
docker compose exec scanner python -m tally_scanner run --fresh --no-score --limit 30
```

- Adminer: http://localhost:8081 (server=`postgres`, user/pass/db=`tally`/`tally`/`tally_scanner`)
- Health: http://localhost:8000/health
- State doc: [`docs/STATE.md`](docs/STATE.md)
- Handoff history: [`docs/HANDOFF.md`](docs/HANDOFF.md)

## Layout

```
scanner/
  docs/STATE.md              # current state (read this)
  docs/HANDOFF.md
  db/schema.sql
  db/migrate_*.sql
  tally_scanner/
    pipeline.py
    ai_filter.py
    scorer.py
    sources/search_queries.py
    sources/search_ingest.py
    sources/hn.py
    sources/ats.py
    ...
```

## Tests

```bash
cd scanner
pip install -r requirements.txt pytest
pytest -q
```
