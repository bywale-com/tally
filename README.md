# Tally

Monorepo for the Tally product and its sourcing engine.

| Path | Purpose |
|------|---------|
| `apps/` | Future Tally product app (pay-per-qualified-meeting fractional sales). Reserved. |
| `scanner/` | **Tally Scanner** — search founding AE / confession postings → AI triage → dedup → score → **Postgres**. |

## Quick start (scanner)

```bash
cd scanner
cp .env.example .env   # OPENAI_API_KEY for triage; ANTHROPIC_API_KEY for scoring
docker compose up -d postgres scanner adminer
docker compose --profile searxng up -d
docker compose exec scanner python -m tally_scanner run --fresh --no-score --limit 30
```

- State document: [`scanner/docs/STATE.md`](scanner/docs/STATE.md)
- Scanner README: [`scanner/README.md`](scanner/README.md)
