# TALLY SCANNER PIPELINE — BUILD HANDOFF V1

**Audience:** Claude Code (or any coding agent) executing this build on a local machine with Docker Desktop.
**Owner:** Wale / Omcoda
**Purpose:** An automated daily pipeline that scrapes job boards for early sales hires at funded B2B companies, filters them, scores them against the Tally Scanner rubric via LLM, and writes a ranked, lane-assigned table to Notion. This is the sourcing engine for Tally (pay-per-qualified-meeting fractional sales service).

**Layout note:** Pipeline code lives in repo `scanner/`. Future Tally product app goes in repo-root `apps/`.

---

## 0. Decisions already made — do not relitigate

1. **Orchestrator is n8n, not Cursor/IDE.** The IDE is build-time only. n8n runs the pipeline on a cron schedule inside Docker.
2. **Batch mode.** One run per day. All new survivors are scored in a single LLM batch call producing one daily digest. Never per-posting scoring.
3. **LLM cost is accepted; scraping cost is the constraint.** Do not use Apify actors or any paid scraping service. Free/open-source only. It is fine (encouraged) to let the LLM do per-candidate enrichment via web search — few candidates survive filtering, so this is cheaper than data subscriptions.
4. **Regex filter is deliberately loose.** Its job is to kill obvious garbage, not to be precise. Borderline postings pass through; the LLM scorer disqualifies them. False positives at the regex layer are cheap; false negatives are lost deals.
5. **Only new survivors go to the scorer.** Dedup happens before scoring. Never re-score a posting already in the database. This is the detail most likely to be lost — enforce it.
6. **Output destination is Notion.**

---

## 1. Architecture overview

```
[Job boards & APIs]
        ↓
[Scraper tier]         ← JobSpy, ATS JSON APIs, Crawlee, Playwright, RSS
        ↓
[Regex filter]         ← role strings + confession strings (loose)
        ↓
[Dedup store]          ← Postgres, hash(company + title)  [source NOT in key]
        ↓  (new rows only)
[LLM scorer — batch]   ← Claude API + web search tool, Tally Scanner prompt
        ↓
[Notion table]         ← ranked by ACV desc, lane assigned
```

Everything runs from one `docker-compose.yml`: **n8n**, **Postgres**, **scraper worker(s)** (Python container(s) n8n triggers via webhook). Optional: **SearXNG** container for automated Google dorking.

**Daily run boundary (strict):**
cron fires once daily → all sources polled → regex filter → dedup against Postgres → *only new survivors* sent to the scorer in **one batch call** → one digest written to Notion, sorted by ACV descending with lane tags.

---

## 2. Sources — in priority build order

### Tier 1: Structured APIs (no scraping, build first)

- **Greenhouse:** `https://boards-api.greenhouse.io/v1/boards/{company}/jobs?content=true`
- **Lever:** `https://api.lever.co/v0/postings/{company}?mode=json`
- **Ashby:** `https://api.ashbyhq.com/posting-api/job-board/{company}`
- **Company slug discovery:** Google dorks via self-hosted **SearXNG**. Persist slugs in Postgres.
- **Hacker News "Who is Hiring":** Algolia API (`hn.algolia.com`) — build later.
- **Remote OK:** `https://remoteok.com/api` — later.
- **We Work Remotely:** RSS — later.
- **Adzuna / Jooble:** free API tiers — later.
- **Getro-powered VC portfolio boards:** later.

### Tier 2: JobSpy

- **`python-jobspy`** — LinkedIn, Indeed, Glassdoor, ZipRecruiter, Google Jobs. Not yet wired.

### Tier 3: Custom scrapers (build last, or never)

- Crawlee, Scrapy long tail, Playwright stealth (Wellfound/Otta).
- Twitter/X: excluded.

---

## 3. Regex filter spec — VERBATIM strings

Implemented in `tally_scanner/filter.py`. Case-insensitive; normalize whitespace/hyphens. Pass if **any role string** OR **any confession string**.

**Role strings:** founding account executive, founding AE, first sales hire, founding sales, first account executive, head of sales (co-occur: early stage | seed | series a), founding GTM, go-to-market lead, first BDR, player-coach (co-occur: sales).

**Confession strings:** self-sourced, no inbound, no SDR, build your own pipeline, no leads provided, 100% new business, greenfield, from scratch, first sales hire reporting to the CEO.

---

## 4. Dedup store — Postgres schema

See `db/schema.sql`. Dedup key is `hash(company + title)` — **not** including source. Same role on company + recruiter boards → one posting + multiple `posting_sources`. Scorer receives ALL source texts.

---

## 5. LLM scorer — batch call

Model: Claude via Anthropic API with web search. Prompt + JSON schema in `tally_scanner/scorer.py`. Unknown fields stay `"UNKNOWN"`.

---

## 6. Notion sink

New database under parent `37272d09-0a44-80ec-a852-000b049519b1`. Properties per handoff. Do not write into the SOPs database.

---

## 7. Build order

1. ✅ docker-compose (n8n + Postgres + SearXNG optional)
2. ✅ Postgres schema
3. ✅ Tier 1 ATS + slug discovery
4. ✅ Regex → dedup → scorer → Notion E2E (Tier 1)
5. ⬜ JobSpy
6. ⬜ HN / Remote OK / WWR / Adzuna / Jooble
7. ⬜ Getro
8. ⬜ Scrapy long tail
9. ⬜ Wellfound/Otta Playwright

---

## 8. Acceptance checks

- Two consecutive runs → zero duplicate Notion rows, zero re-scored postings.
- `self-sourced` in body → `confession_hit = true` + quote.
- Findable ACV → real value, not UNKNOWN.
- Existing SDR team → Lane B or DQ, never Lane A.
- No paid scraping in dependency tree.

**Reference smoke case:** Superpanel — expected Lane A, high rank.
