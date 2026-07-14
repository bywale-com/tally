# Tally

Monorepo for the Tally product and its sourcing engine.

| Path | Purpose |
|------|---------|
| `apps/` | Future Tally product app (pay-per-qualified-meeting fractional sales). Reserved — not part of this pipeline build. |
| `scanner/` | **Tally Scanner pipeline** — daily job-board scrape → regex filter → dedup → LLM score → Notion. |

## Quick start (scanner)

```bash
cd scanner
cp .env.example .env   # fill ANTHROPIC_API_KEY, NOTION_* 
docker compose up -d
docker compose exec scanner python -m tally_scanner run
```

See [`scanner/README.md`](scanner/README.md) for architecture, build order, and acceptance checks.
