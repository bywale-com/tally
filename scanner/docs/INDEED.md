# Indeed search-first source — operator notes

**As of:** 2026-07-16

## What works

| Shape | Example | Status |
|---|---|---|
| Search SERP | `https://ca.indeed.com/jobs?q=…&l=…&radius=25` | **Supported** — primary |
| Catalog host | `indeed.com` / `ca.indeed.com` | Catalog source; needs query in enrollment |
| Single job | `/viewjob?jk=…` | Parsed; fetch-one not primary yet |
| Company pages | `/cmp/…/jobs` | **Unsupported** for now |

## URL → criteria map

| Param | Meaning | Kept? |
|---|---|---|
| `q` | Search query | Yes |
| `l` | Location | Yes |
| `radius` | Distance | Yes |
| host (`ca.` / `www.`) | Country | Yes |
| `sort` | relevance \| date | Yes if present |
| `fromage` | Max age days | Yes if present |
| `from` | Nav analytics | **Ignored** |
| `vjk` | Selected job on SERP | **Ignored** |

## Query semantics (observed)

- `founding business development` → results
- `"founding" business development` (double quotes on one word) → **no results** in browser
- `'founding' business development` (single quotes) → behaves like unquoted

**Tally policy:** `match_mode=broad` strips decorative quotes/apostrophes. `match_mode=phrase` wraps the whole query in proper `"…"`.

## Live transport

- Direct `httpx` / `curl_cffi` → **Cloudflare captcha 403**
- `python-jobspy` → does not install on Python 3.13 (old numpy pin)
- **Firecrawl stealth** → works (set `FIRECRAWL_API_KEY`)
- Offline: `data/fixtures/indeed_montreal_founding_bd.json`

## CLI

```bash
cd scanner
python -m tally_scanner indeed-search --url "https://ca.indeed.com/jobs?q=founding+business+development&l=Montreal,+QC&radius=25"
python -m tally_scanner indeed-search -q "founding business development" -l "Toronto, ON" --limit 10
python -m tally_scanner indeed-search -q "founding AE" --no-fixture   # fail closed without Firecrawl
```

## HTTP (enrichment UI Run)

```bash
uvicorn tally_scanner.api:app --host 127.0.0.1 --port 8000
# POST /indeed/search → { items, itemCount, pulledAt, transport }
```

Vite proxies `/api/scanner` → `:8000`. Trigger modal **Run** fills Output (Schema · Table · JSON).

## Enrollment fields (UI)

When source = Indeed: query, location, country, radius, match mode — plus shared freshness / go-until.
Live rows land in the node Output pane after Run (not the cosmetic Pull shape check).
