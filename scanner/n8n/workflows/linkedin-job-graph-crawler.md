# LinkedIn Job Graph Crawler (n8n)

Governed harvest loop: one LinkedIn guest job URL in → primary job row + discovered job URLs out → queue refeeds the fetch until the hop/page governor stops it.

Import: `linkedin-job-graph-crawler.json` into n8n.

## Why a loop

LinkedIn is a **graph source**, not a lookup. The guest page yields contract-grade JSON-LD for the main job **and** ~30 similar/people-also-viewed cards. Those cards are the next inputs. This workflow is harvest → queue → refeed, with pacing and a hard volume cap.

## Sheet setup (Google Sheets)

Create one spreadsheet, then two tabs:

### Tab: `LinkedIn Jobs` (primary rows)

| Column | Notes |
|--------|--------|
| job_id | Stable key from `/jobs/view/...-{id}` |
| source | `linkedin` |
| fidelity | `primary` |
| url | Canonical guest job URL |
| title | From JSON-LD |
| description | From JSON-LD |
| employment_type | |
| date_posted | |
| valid_through | |
| location | |
| geo_lat / geo_lng | When present |
| months_of_experience | `experienceRequirements.monthsOfExperience` |
| founder_or_report_line | Best-effort from description |
| company_name | |
| company_linkedin_url | JSON-LD `hiringOrganization.sameAs` (LinkedIn-internal) |
| company_slug | Parsed from LinkedIn company path |
| company_host | e.g. `uk.linkedin.com` — HQ geography tell |
| salary_raw | Empty on primary (salary lives on graph cards) |
| gaps | Pipe-delimited labels |
| hop | Distance from seed |
| scraped_at | ISO timestamp |
| seed_url | Original seed for this run |

### Tab: `Discovery Queue`

| Column | Notes |
|--------|--------|
| job_id | Dedupe key |
| url | Guest `/jobs/view/...` URL |
| hop | `parent_hop + 1` |
| status | `queued` / `done` / `skipped` |
| discovered_from_job_id | Parent job_id |
| company_name | Card text |
| company_slug | |
| company_host | Country subdomain if present |
| location | |
| date_text | Card date |
| salary_raw | Card salary band (benchmark fuel) |
| fidelity | `graph` |
| gaps | |
| first_seen_at | |

Set the spreadsheet ID on every Google Sheets node (`YOUR_GOOGLE_SHEET_ID`).

## Pacing (built into the loop)

| Mechanism | Where | Default |
|-----------|--------|---------|
| Baseline heartbeat | After process, before next pop | Uniform random **4–9s** |
| Coffee break | Every `coffee_every` pages | Uniform random **30–60s** |
| Back-off-then-stop | Abnormal HTTP | Wait **120s**, retry **once**, then `Stop and Error` |
| Governor | Init + pop | `max_hops` (default 2) + `max_pages` (default 25) |

Waits control speed; the governor controls quantity. Both are load-bearing.

## Deferred (not in this workflow)

- **Website resolution** — separate enrichment once per unique company.
- **Cross-source merge** — LinkedIn ↔ startup.jobs ↔ Built In reconciliation downstream.

## Manual trigger inputs

| Field | Default | Meaning |
|-------|---------|---------|
| `seed_url` | (required) | Guest LinkedIn job URL |
| `max_hops` | `2` | Max distance from seed |
| `max_pages` | `25` | Hard fetch ceiling this run |
| `coffee_every` | `12` | Longer pause cadence |

## Node map (high level)

1. Manual Trigger → Config → Init Queue (seed + empty seen set)
2. Pop Next URL → IF none left → Done
3. HTTP GET guest page (browser UA) → IF abnormal → Backoff → Retry once → Stop
4. HTML Extract: `jsonld` text + `similar_raw` `.base-card` outerHTML array
5. Parse Main Job → Harvest Graph → Stamp Gaps
6. Append primary → `LinkedIn Jobs`
7. Enqueue discoveries (dedupe on job_id) → Append new rows → `Discovery Queue`
8. Baseline Wait → optional Coffee Wait → back to Pop Next

## Extra terrain notes

- Dedupe on **job_id**, not company slug (Slingshot-style dual slugs).
- Salary is on **graph cards**, not the main JobPosting — keep harvesting even when not following a URL.
- Country subdomains on company links (`uk.`, `de.`) are captured as `company_host`.
- Primary vs graph fidelity is intentional — do not blend confidence.
