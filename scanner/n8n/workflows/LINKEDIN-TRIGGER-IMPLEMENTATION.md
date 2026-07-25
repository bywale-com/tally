# Architecture plan — LinkedIn graph crawl on Trigger.dev → Tally

See conversation with solutions consultant (2026-07-19). Implementation status lives in `apps/tally/src/trigger/README.md`.

## Locked decisions

| Store | New `crawl_*` Postgres tables |
| Identity | LinkedIn numeric `job_id` |
| Tasks | Parent orchestrator + per-page child |
| UI | Dedicated Crawl Run panel + StatusBar |
| Transport | Metadata on `crawl_runs.metadata` (poll) + Trigger `run.metadata`; Realtime hooks later |
| Fetch | Direct guest + optional `HTTPS_PROXY` — **Firecrawl does not support LinkedIn** |

## Build order

1. Schema ✅ `scanner/db/crawl_schema.sql`
2. Child parsers + seam ✅
3. Fetch (direct/proxy) ✅ — needs residential proxy for live LinkedIn from datacenter IPs
4. Parent orchestrator ✅
5. Metadata ✅
6. Crawl Run panel ✅
7. StatusBar + start API ✅
