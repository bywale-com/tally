# Tally Scanner — State Document

**As of:** 2026-07-14  
**Owner:** Wale / Omcoda  
**Scope:** `scanner/` in the Tally monorepo  
**Audience:** Future you, coding agents, anyone picking this up cold

---

## 1. Why this exists

Tally sells **pay-per-qualified-meeting** outbound. One operator. No team.

The buyer is a funded, revenue-positive B2B company that has **budget for pipeline and no pipeline** — typically founder-led / founder-plus-one, no SDR team, ACV ≳ $10k/year.

**Job boards are the source** because a “Founding Account Executive” / “first sales hire” posting publicly confesses:

1. They have budget (comp package already approved).
2. They usually have no pipeline (“self-sourced”, “no SDR”, “no inbound”).
3. The founder feels it (role often reports to CEO).

That posting *is* the lead. The scanner’s job is to find those confessions daily, score them, and route:

| Lane | Meaning |
|------|---------|
| **A — Tally** | Default. Pitch pay-per-qualified-meeting. High status; can descend later. |
| **B — Job apply** | Residual only — Tally genuinely can’t fit (real GTM design seat, already-built sales org, etc.). |
| **DQ** | Disqualify (esp. low / unknown ACV that makes a $300 bounty absurd). |

**ACV is the deciding field.** Find it or mark `UNKNOWN` — never guess.

**Output destination:** Postgres (canonical). Notion is optional legacy, off by default.

---

## 2. Correct architecture (current intent)

```
[Search queries]
  founding AE / first sales hire / confession phrases
        ↓
[Source tier]
  SearXNG ATS dorks (Greenhouse / Lever / Ashby)
  + HN Algolia (free)
  + keyword-gated expansion of discovered boards
  (later: JobSpy, Wellfound, YC, sales/recruiter boards, Getro, …)
        ↓
[Cheap keyword gate]     ← role + confession strings (search lens, not the brain)
        ↓
[AI triage — OpenAI]     ← tag every row in | out; KEEP outs for audit
        ↓
[Postgres dedup]         ← hash(lower(company)|lower(title)); source NOT in key
        ↓  (new filter_status='in' only)
[LLM scorer — Claude]    ← Tally rubric: ACV, confession quote, Lane A/B/DQ
        ↓
[Postgres results]       ← ranked / lane-tagged table for dialing
```

**Orchestration:** n8n cron → `POST /run` (IDE is build-time only).

### What was wrong in the first draft (corrected)

| Wrong | Right |
|-------|--------|
| Poll mega-corp career boards (Notion, Ramp, Stripe, OpenAI, Anthropic) and dump all jobs | **Search** for founding/confession queries across ATS hosts |
| Regex as sole filter; discard rejects | Phrase lists drive **search**; AI triage tags **in/out**; outs kept |
| Notion as primary sink | **Postgres** as primary sink |
| Seed list = large GTM machines | Seeds empty; `company_slugs` filled by discovery |

---

## 3. What is implemented today

### 3.1 Runtime stack (`docker-compose.yml`)

| Service | Status | Ports | Notes |
|---------|--------|-------|--------|
| `postgres` | ✅ | `5432` | Schema + data volume |
| `scanner` | ✅ | `8000` | FastAPI + CLI; live-mounts `tally_scanner/` |
| `adminer` | ✅ | `8081` | Browser DB GUI |
| `searxng` | ✅ (profile `searxng`) | `8080` | Required for ATS dork search |
| `n8n` | Optional profile `bundled-n8n` | `5678` | Off by default |

### 3.2 Code map

| Path | Role |
|------|------|
| `tally_scanner/pipeline.py` | Daily boundary: search → triage → (score) → Postgres |
| `tally_scanner/sources/search_queries.py` | Role + confession query catalog + ATS dorks |
| `tally_scanner/sources/search_ingest.py` | SearXNG → job/board URL resolve → keyword-gated board fetch |
| `tally_scanner/sources/hn.py` | HN Algolia founding-sales comments |
| `tally_scanner/sources/ats.py` | Greenhouse / Lever / Ashby JSON fetchers |
| `tally_scanner/sources/discovery.py` | Slug extraction from dorks (lighter helper) |
| `tally_scanner/filter.py` | Phrase normalize + keyword gate (legacy regex tests still here) |
| `tally_scanner/ai_filter.py` | OpenAI triage agent (`in`/`out` + reason) |
| `tally_scanner/scorer.py` | Claude batch scorer (ACV + lanes) — wired, needs `ANTHROPIC_API_KEY` |
| `tally_scanner/db.py` | Upserts, truncate, list unscored INs |
| `tally_scanner/api.py` | `GET /health`, `POST /run` |
| `tally_scanner/notion_sink.py` | Legacy; opt-in via `--notion` |
| `db/schema.sql` | Fresh-DB schema |
| `db/migrate_ai_filter.sql` | Adds `filter_status` / `filter_reason` / `filter_json` |
| `db/migrate_drop_mega_seeds.sql` | Removes Notion/Ramp/… slug seeds |
| `docs/HANDOFF.md` | Original build handoff (partially updated) |
| `docs/STATE.md` | **This document** |

### 3.3 Postgres schema (relevant columns)

**`postings`**

| Column | Meaning |
|--------|---------|
| `dedup_hash` | `sha256(lower(company)\|lower(title))` |
| `company`, `title`, `source`, `url`, `raw_text` | Posting body |
| `filter_status` | `in` \| `out` \| NULL |
| `filter_reason` | Short AI / gate rationale |
| `filter_json` | Full triage payload |
| `confession_hit`, `confession_quote` | Prefer quoted confession |
| `scored`, `score_json`, `lane` | Scorer output (`A`/`B`/`DQ`) |

**`posting_sources`** — multi-source attach per posting (recruiter + company board).  
**`company_slugs`** — discovered ATS boards (early-stage only; no mega seeds).

### 3.4 Env vars (see `.env.example`)

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | Host-side Postgres URL |
| `OPENAI_API_KEY` | AI triage (`gpt-4o-mini` default) |
| `OPENAI_FILTER_MODEL` | Triage model |
| `ANTHROPIC_API_KEY` | Scorer (Claude + web search) |
| `SEARXNG_URL` | Inside Compose: `http://searxng:8080` |
| `NOTION_*` | Optional legacy sink |
| `SCANNER_DRY_RUN` | Skip live LLM when true |

**Never commit `.env`.** Rotate any key that was pasted into chat.

---

## 4. How to run

```bash
cd scanner
cp .env.example .env   # set OPENAI_API_KEY; ANTHROPIC when scoring

docker compose up -d postgres scanner adminer
docker compose --profile searxng up -d   # needed for ATS search

# Search → AI triage → Postgres (no scorer)
docker compose exec scanner python -m tally_scanner run --fresh --no-score --limit 30

# Full path including Claude scoring
docker compose exec scanner python -m tally_scanner run --no-score=false
# or simply omit --no-score once ANTHROPIC_API_KEY is set:
docker compose exec scanner python -m tally_scanner run
```

Useful flags:

| Flag | Effect |
|------|--------|
| `--fresh` | `TRUNCATE postings, posting_sources` before run |
| `--limit N` | Cap candidates entering AI triage |
| `--no-score` | Skip Claude scorer |
| `--no-discover` | Skip SearXNG/HN; only keyword-gate known slugs |
| `--no-slug-boards` | Don’t expand `company_slugs` boards |
| `--notion` | Opt-in Notion write |

**See data**

- Adminer: http://localhost:8081  
  - System: PostgreSQL  
  - Server: `postgres`  
  - User/Pass/DB: `tally` / `tally` / `tally_scanner`
- CLI:  
  `docker compose exec postgres psql -U tally -d tally_scanner`  
  (run from `scanner/`, not repo root)

Health: http://localhost:8000/health  
Docs: http://localhost:8000/docs  

---

## 5. Pilot results (2026-07-14)

### Run A — wrong funnel (historical)

- Mega-board dump (Notion/OpenAI/…) → regex/AI on random jobs  
- Mostly noise (e.g. Ramp “from scratch” enterprise AE)  
- **Discarded as invalid approach**

### Run B — search-first (current)

Command shape:

```text
python -m tally_scanner run --fresh --no-score --limit 30
```

Observed:

| Metric | Value |
|--------|------:|
| Search hits (pre-limit) | ~178 |
| Boards discovered into `company_slugs` | ~80 |
| AI-triaged (limit) | 30 |
| Tagged `in` | 23 |
| Tagged `out` | 7 |

**IN examples (the right shape):** Founding Account Executive at Superset, Kana, CueBox, Aktos, Corepilot, Turgon AI, SpiceAI, Bigblue, Duranta, Unusual (Rime/Roboto), Helmguard, Auctor, Sable, Crosby, Dex, Ajax, Atrix, Plotline, Flox, Clark, DevRev (Founding Sales Engineer), etc.

**OUT examples:** Ensono Sr BDE, AppDirect AE, Toast Calgary retail AE, Kana GTM Engineer, etc.

**Known triage mistakes still possible:** e.g. a Toast “Retail Account Executive” slipped `in` once — prompt/stage strictness needs tightening; scorer should DQ later if run.

**Aggregator skip:** `jobgether` (Lever mega-aggregator) added to `SKIP_BOARD_SLUGS` after it returned thousands of listings.

**Scorer:** Not yet run end-to-end on this search cohort (needs Anthropic key + intentional batch).

---

## 6. Decisions (current — do not quietly reverse)

1. **Search-first.** Never make mega-corp full-board dumps the primary intake.  
2. **n8n orchestrates runtime**; IDE builds only.  
3. **Batch scoring** for survivors; never per-posting scorer calls.  
4. **LLM OK; paid scraping not OK** (no Apify).  
5. **Tag, don’t discard** at triage — outs stay in Postgres.  
6. **Postgres is the sink.** Notion optional.  
7. **Lane A default**; never route to B what could have been A.  
8. **Dedup before score**; never re-score scored rows.  
9. **Confession quoted**, not paraphrased, when present.  
10. **ACV decide or UNKNOWN** — never invent.

---

## 7. Build order / backlog

| # | Item | Status |
|---|------|--------|
| 1 | Compose + Postgres + scanner API | ✅ |
| 2 | Schema + filter columns + Adminer | ✅ |
| 3 | Search queries + SearXNG ATS ingest + HN | ✅ |
| 4 | AI triage (OpenAI) with in/out retained | ✅ |
| 5 | Drop mega seeds; keyword-gated board expansion | ✅ |
| 6 | Claude scorer E2E on search cohort → lanes/ACV in Postgres | ⬜ next |
| 7 | JobSpy (LinkedIn / Indeed / Glassdoor / Google Jobs) | ⬜ |
| 8 | Wellfound, YC Work at a Startup, Built In, Otta | ⬜ |
| 9 | Sales/recruiter boards (Just Sales Jobs, RepVue, Rainmakers, Betts, …) | ⬜ |
| 10 | RemoteOK / WWR / Adzuna / Jooble | ⬜ |
| 11 | Getro VC portfolio boards | ⬜ |
| 12 | Harden AI triage (stage, mega brands, aggregator denylist) | ⬜ |
| 13 | Sampling across sources when `--limit` (not “first N of one board”) | ⬜ |
| 14 | n8n workflow pointed at search-first `/run` defaults | ⬜ |
| 15 | `SCANNER_API_TOKEN` enforcement on `/run` | ⬜ |
| 16 | Scrapy / Playwright long tail (last) | ⬜ |

`apps/` remains reserved for a future Tally product UI — empty.

---

## 8. Acceptance checks (target)

- Two consecutive runs → no duplicate `dedup_hash` rows; no re-scoring of `scored=true`.  
- Search returns companies **not** on a hand-maintained mega list.  
- Founding AE hits dominate `filter_status='in'`.  
- Confession present → quoted on the row.  
- Findable ACV → numeric-ish evidence in `score_json`, not hallucinated.  
- Existing large SDR org → not Lane A.  
- No paid scraper dependencies.  
- Ops can open Adminer and see **in vs out** without guessing.

---

## 9. Operational caveats

- **Always `cd scanner`** before `docker compose …` (compose file lives there).  
- Host `localhost:8000/` is 404 by design — use `/health` or `/docs`.  
- Postgres is not a browser app — use Adminer or `psql`.  
- SearXNG quality varies (rate limits / engine blocks); HN is a useful free backstop.  
- Board fetch still pulls full JSON then gates locally — expensive for huge boards; denylist aggregators.  
- OpenAI key in `.env` only; rotate if exposed.  
- Docker Desktop must be running.

---

## 10. Quick mental model

> **Search for the confession. Tag what matches. Score what might buy. Dial Lane A.**

If the table looks like Notion SDRs and Ramp enterprise AEs, the intake is wrong again. If it looks like “Founding Account Executive @ {unknown seed/A company}”, you’re aligned with the thesis.
