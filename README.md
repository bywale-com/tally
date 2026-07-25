# Tally

Monorepo for the Tally product and its sourcing engine.

| Path | Purpose |
|------|---------|
| `apps/tally/` | **Tally Operator app** — scan board, tab workspace, Console, Register |
| `scanner/` | **Tally Scanner** — search founding AE / confession postings → AI triage → dedup → score → **Postgres** |
| `docs/build-foundation/` | Omcoda rudiments pack + `PROJECT-BRIEF.md` |

## Quick start (operator app)

```bash
cd apps/tally
npm install
npm run dev
```

- App: http://localhost:5173/
- Register: http://localhost:5173/register (password `register` by default)

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
- Operator brief: [`docs/build-foundation/PROJECT-BRIEF.md`](docs/build-foundation/PROJECT-BRIEF.md)
