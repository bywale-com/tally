# Founding / Founding Sales enrichment — walkthrough

**Status (2026-07-18):** Phase 1 mostly complete. Phase 2 blocked on OpenAI billing quota.

## What ran

1. **Website resolution** (`companywebsite`) for `dead` + `insufficient_data` rows via BuiltIn scrape → Firecrawl search → OpenAI web search.
2. **Deep screen** (OpenAI rubric / `deep_screen_one`) for `insufficient_data` — **not started** (quota hit during Phase 1).

## Blockers

| Provider   | Error                         | Effect                                      |
|------------|-------------------------------|---------------------------------------------|
| Firecrawl  | HTTP 402 insufficient credits | Search fallback disabled                    |
| OpenAI     | 429 `insufficient_quota`      | Website lookup + deep screen cannot finish |

## Current CSV snapshot

| Metric | Count |
|--------|------:|
| Total rows | 436 |
| `call-ready` | 11 |
| `conditional` | 43 |
| `dead` | 157 |
| `insufficient_data` (awaiting deep screen) | 225 |
| `companywebsite` resolved | ~300+ |
| OpenAI re-screens written | 0 |

Nearly all `insufficient_data` rows now have a homepage URL ready for Phase 2.

## Files

- Analysis: `scanner/data/founding_sales_analysis.csv`
- Survivors: `scanner/data/founding_sales_survivors.csv` (54 = call-ready + conditional)
- Resume script: `scanner/data/resume_enrichment.py`
- Progress: `scanner/data/enrichment_progress.json`
- Tally list seeds: `apps/tally/src/app/data/seedInventoryLists.json`

## Resume after topping up OpenAI

From `scanner/`:

```powershell
$env:PYTHONUNBUFFERED='1'; $env:PYTHONIOENCODING='utf-8'
python -u data/resume_enrichment.py
```

Then refresh lists:

```powershell
python data/rebuild_survivors_and_seeds.py
```

The resume script skips rows already marked `analyzed_by=openai` with a real verdict, and circuit-breaks on Firecrawl 402 / OpenAI quota so it will not spin forever.
