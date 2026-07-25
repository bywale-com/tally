# Solutions consultant brief — LinkedIn crawl → Tally (Trigger.dev)

**Audience:** Solutions consultant (architecture planning)  
**From:** Implementation agent (Cursor / Tally repo)  
**Ask of you:** Plan moving the LinkedIn **graph crawl** off Google Sheets n8n into **Trigger.dev**, wired to Tally so Run shows a live, non-verbose action chain (waits with timers, planned vs executing steps).  
**Ask of us after you plan:** Implementation in-repo (no speculative rewrites before the plan).

---

## 1. Idea behind the current workflow

LinkedIn guest job pages are a **graph source**, not a lookup:

1. Fetch one guest `/jobs/view/...` URL (only place LinkedIn sees us → pacing lives here).
2. Split: **JSON-LD** = contract-grade primary job; **`.base-card` HTML** = ~30 discovery cards (+ salary bands).
3. Stamp **gaps** (honest blind spots).
4. Write primary job; enqueue discoveries keyed on **`job_id`**.
5. Loop with governor (`max_hops`, `max_pages`) + layered waits (baseline jitter, coffee break, back-off-then-stop).

**v2 splice:** before writing the primary job, resolve the company page once per `company_slug` (in-run cache), unescape escaped Organization payload from full HTML body (not clean ld+json), merge website / headcount / HQ / recent post themes. Fail-open if company fetch fails.

**Still deferred:** cross-source merge (LinkedIn ↔ startup.jobs ↔ Built In). Cross-run company cache persistence optional.

Workflow artifact (v2): user’s `linkedin-job-graph-crawler (1).json` (also conceptual home: `scanner/n8n/workflows/`).

---

## 2. Transition we’re planning

| Today | Target |
|-------|--------|
| n8n form trigger → HTTP/HTML/Code/Wait → Google Sheets | **Trigger.dev** task(s) orchestrating the same loop |
| State in n8n static memory + Sheets | Durable run state + Tally-owned store |
| Operator watches n8n UI / Sheets | Operator clicks **Run in Tally** and sees a **live step chain** (Cursor-like: planned / running / waiting with timer / done / failed) — transparent, not verbose |
| Inventory UI is static washed JSON | Crawl outputs must eventually land where Tally reads jobs/companies (decide in plan) |

Implementation layer for the plan = **Cursor in this repo**. Trigger.dev assumed; confirm credentials / project placement in plan.

---

## 3. Workflow → Tally mapping (no code changes yet)

Concept-only affinity. **None of this is wired today.**

### A. Run control & live chain (UI)

| Workflow concept | Closest Tally surface today | Fit |
|------------------|----------------------------|-----|
| Start Crawl (seed_url, max_hops, max_pages, coffee_every) | Enrichment **Launch** / enrollment trigger Run | Run affordance exists; LinkedIn seed form does not |
| Pop → Fetch → Classify → Parse → Harvest → Gaps → Enrich → Write → Wait → loop | `EnrichmentRunsTab` + node `runStatus` chrome | Runs tab is **history rows only** (mock). Node chrome is static/mock except Indeed Pull |
| Baseline / coffee / enrich / backoff waits | *(none)* | **Gap:** need live “Waiting 4–9s…” with countdown |
| Crawl Complete / Stop soft-block | `workflow.runs[].status` (`done` / `failed`) | Shape exists; not connected to real crawls |
| Operator glanceable health | `StatusBar` | Label only; no run metrics |

Natural attach parents (surface registry): `enrichment-header`, `enrichment-body`, or a new holon under board `enrichment-section`. Pattern: wrap with `HolonBoundary` (`docs/build-foundation/02-surface-registry.md`).

### B. Persistence sinks (data)

| Workflow write | Logical entity | Closest Tally / scanner store | Notes |
|----------------|----------------|-------------------------------|-------|
| Append → LinkedIn Jobs (primary + enrichment cols) | Job posting | Washed jobs: `apps/tally/public/washed-jobs.json` **or** Postgres `postings` (+ `posting_sources`) | UI Inventory reads **washed JSON only**. Postgres is scanner pipeline sink; schema keyed on `dedup_hash(company|title)`, not LinkedIn `job_id` |
| Append → Discovery Queue | URL frontier | *(no UI table)*; scanner has search discovery via SearXNG / `company_slugs` (ATS-oriented) | Plan needs an explicit **queue/frontier** store for Trigger runs |
| Company cache (in-run static → desired Sheets tab) | Company enrichment | Washed companies: `apps/tally/public/washed-companies.json`; Postgres `company_slugs` is ATS slug≠LinkedIn slug | LinkedIn `company_slug` ≠ Greenhouse slug — don’t overload without a clear key |
| gaps / fidelity / hop / seed_url | Crawl provenance | Not in washed job shape today | Needs extension fields or side table |
| salary_raw on graph cards | Comp signal | `WashedJob.salary_*` | Graph harvest is benchmark fuel, not always a full job row |

### C. Field-level affinity (primary job → washed job)

| Workflow / Sheets column | Washed job (`InventoryPanel` / wash) | Gap? |
|--------------------------|--------------------------------------|------|
| job_id | `id` (wash hash, not LinkedIn numeric id) | Different identity scheme |
| url | `url` | OK |
| title | `title` | OK |
| description | `description` | OK |
| company_name | `company` | OK |
| company_linkedin_url / company_url | `company_url` | OK |
| location | `location_raw` | OK |
| employment_type | `employment_type` | OK |
| date_posted | `posted_at` / `posted_raw` | Partial |
| months_of_experience | — / `seniority` | Map or new field |
| salary_raw (graph) | `salary_raw` (+ min/max) | OK when present |
| source=`linkedin` | `source` | OK |
| relevance / founding tags | `relevance` | Crawl does not set Tally relevance — separate classifier |
| website (v2 enrich) | companies `url` often LinkedIn/Wellfound; no first-class company website in jobs | Company-level field |
| company_employee_count, followers, HQ*, founded, recent_post_themes | — | New company enrichment shape |
| gaps, fidelity, hop, seed_url, enriched_at | — | Provenance / run metadata |

### D. Orchestration analogues inside scanner (not LinkedIn)

| Existing | Relevance |
|----------|-----------|
| FastAPI `POST /run` | Batch discover→score; sync HTTP; **no** step events |
| FastAPI `POST /indeed/search` | Only live Enrichment Pull today (Vite proxy → `:8000`) |
| n8n `daily-scanner.json` | Cron → `/run` — line orchestrator, not graph crawl |
| `enrichment_progress.json` | CLI file progress only |
| Trigger.dev | **Not in repo** |

---

## 4. How Tally stores things today (source of truth)

### App (`apps/tally`) — what operators see

| Data | Location | Format | Truth |
|------|----------|--------|-------|
| Inventory jobs | `public/washed-jobs.json` | `{ washedAt, total, relevance, jobs[] }` | Published wash artifact |
| Inventory companies | `public/washed-companies.json` | companies + role_tags | Same |
| Saved lists | `localStorage` `tally.inventory.lists.v1` | `{ id, name, kind, recordIds[] }` (+ seeds in `seedInventoryLists.json`) | Browser-only |
| Enrichment workflows + mock runs | `localStorage` `tally.enrichment.workflows.v1` | nodes/edges/`runs[]` | Mock Launch (≈2s); not a real crawler |

No Postgres client in the React app. Inventory does not read Sheets or n8n.

### Scanner (`scanner/`) — pipeline / offline

| Data | Location | Notes |
|------|----------|-------|
| Live pipeline postings | Postgres `postings`, `posting_sources`, `company_slugs` | `schema.sql`; Docker |
| Wash working set | `data/washed/*.jsonl` | Publish → `apps/tally/public/` |
| Analysis CSVs / packs | `data/founding_sales_*.csv`, etc. | Analyst path |
| Offline enrich progress | `data/enrichment_progress.json` | CLI |
| This LinkedIn crawler | n8n JSON → Google Sheets (intended) | Parallel island |

### Identity warning for the plan

- Tally wash `id` ≠ LinkedIn URL `job_id`.
- Company list `role_tags` / job `relevance` are wash classifiers — crawl shouldn’t invent them without a defined step.
- Deduping companies on LinkedIn slug must not collide with ATS `company_slugs`.

---

## 5. Product requirement for Run UX (non-negotiable for plan)

On **Run**, operator must see **deeply transparent, non-verbose** live chain:

- Steps **planned** vs **executing** vs **done** / **failed**
- When waiting: **show waiting** + **live timer** (baseline / coffee / enrich / backoff)
- Spinners on active steps
- Same spirit as Cursor’s action chain — not a log dump

Implies Trigger (or equivalent) must emit **structured step events** the UI can subscribe to (SSE/WS/poll). n8n’s internal view is not the operator experience.

---

## 6. Decisions the plan should make (implementation will follow)

1. **Canonical store for crawl jobs + queue + company cache** — extend Postgres vs new tables vs wash-publish path vs hybrid.
2. **Identity** — keep LinkedIn `job_id` as crawl key; when/how map into wash `id` / Inventory.
3. **Trigger.dev shape** — one long-running orchestrator task vs parent + per-page child tasks; how waits are real and visible.
4. **Event contract** — step id, label, status, `waitUntil` / remaining seconds, counts (`pages_fetched`, `queue_remaining`, cache hit/miss).
5. **Tally surface** — extend Enrichment Runs vs dedicated Crawl run panel; StatusBar signal.
6. **What replaces Sheets append nodes** 1:1 without changing harvest semantics.
7. **Out of scope for v1** — cross-source merge; optional persistent company cache warm-start.

---

## 7. Node inventory (v2) for plan checklists

**Loop spine:** Start Crawl → Config → Init Queue → Pop Next URL → Has Next? → Fetch Guest Page → Classify → Abnormal? → (Backoff → Retry → Retry Still Bad? → Stop | continue) → HTML Extract → Parse Main Job → Harvest Graph → Stamp Gaps → *(fork)*  

**Fork A — primary + company enrich:** Emit Primary → Company Cache Lookup → Cached? → (hit) Merge → Append Jobs / (miss) Enrich Jitter → Enrich Wait → Fetch Company Page → Extract Company Body → Parse Company (unescape) → Write Company Cache → Merge → Append Jobs  

**Fork B — frontier + pacing:** Enqueue + Schedule Waits → Emit Discovery Rows → (optional) Append Discovery Queue → Reload Wait Plan → Baseline Wait → Coffee Break? → Coffee Wait? → Pop Next URL  

---

## 8. Key paths (repo)

```
apps/tally/public/washed-jobs.json
apps/tally/public/washed-companies.json
apps/tally/src/app/data/inventoryLists.ts
apps/tally/src/app/context/EnrichmentContext.tsx
apps/tally/src/app/components/enrichment/EnrichmentRunsTab.tsx
apps/tally/src/app/components/docs/HolonBoundary.tsx
scanner/db/schema.sql
scanner/tally_scanner/api.py
scanner/n8n/workflows/linkedin-job-graph-crawler.json  # earlier v1 in repo
scanner/n8n/workflows/linkedin-job-graph-crawler.md
# v2 with company hop: user's Downloads/linkedin-job-graph-crawler (1).json
```

---

**Bottom line for planning:** The algorithm and pace model are settled in n8n v2. Tally already has Inventory + a mock Enrichment run shell, and scanner Postgres for a different pipeline. The missing product is a **Trigger.dev-hosted governed crawl** whose **step/wait events** drive a **transparent Run chain in Tally**, with an explicit landing zone for jobs/queue/company cache that doesn’t pretend Sheets or wash JSON already are that store.
