"""
Resume-friendly enrichment for founding_sales_analysis.csv:
  Phase 1 — resolve companywebsite for dead / insufficient_data rows
  Phase 2 — deep_screen_one (OpenAI rubric) for insufficient_data rows
"""
from __future__ import annotations

import csv
import json
import os
import re
import sys
import time
import urllib.parse
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from tally_scanner.config import get_settings  # noqa: E402
from tally_scanner.deep_screener import deep_screen_one, fetch_site_context  # noqa: E402

CSV_PATH = ROOT_DIR / "data" / "founding_sales_analysis.csv"
PACK_PATH = ROOT_DIR / "data" / "founding_sales_pack.json"
PROGRESS_PATH = ROOT_DIR / "data" / "enrichment_progress.json"
LOCK_PATH = ROOT_DIR / "data" / "enrichment.lock"


def pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    if sys.platform == "win32":
        try:
            import ctypes

            SYNCHRONIZE = 0x00100000
            handle = ctypes.windll.kernel32.OpenProcess(SYNCHRONIZE, False, pid)
            if handle:
                ctypes.windll.kernel32.CloseHandle(handle)
                return True
            return False
        except Exception:
            return False
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def acquire_lock() -> None:
    if LOCK_PATH.exists():
        try:
            old_pid = int(LOCK_PATH.read_text(encoding="utf-8").strip() or "0")
        except ValueError:
            old_pid = 0
        if old_pid and pid_alive(old_pid):
            print(f"ERROR: enrichment already running (pid={old_pid}). Aborting.")
            sys.exit(2)
    LOCK_PATH.write_text(str(os.getpid()), encoding="utf-8")


def release_lock() -> None:
    try:
        if LOCK_PATH.exists():
            LOCK_PATH.unlink()
    except OSError:
        pass


BAD_DOMAINS = {
    "linkedin.com",
    "wellfound.com",
    "builtin.com",
    "crunchbase.com",
    "pitchbook.com",
    "zoominfo.com",
    "github.com",
    "twitter.com",
    "x.com",
    "facebook.com",
    "youtube.com",
    "instagram.com",
    "glassdoor.com",
    "g2.com",
    "apollo.io",
    "tracxn.com",
    "ycombinator.com",
    "startup.jobs",
    "indeed.com",
    "ziprecruiter.com",
    "simplyhired.com",
    "glassdoor.co.in",
    "lusha.com",
    "signalhire.com",
    "cbinsights.com",
    "dnb.com",
    "rocketreach.co",
    "careerarc.com",
    "askforfunding.com",
    "theorg.com",
    "scamadviser.com",
    "pingojo.com",
    # Generic / search / wiki — never company homepages
    "google.com",
    "google.co",
    "bing.com",
    "yahoo.com",
    "duckduckgo.com",
    "wikipedia.org",
    "wikidata.org",
    "medium.com",
    "substack.com",
    "reddit.com",
    "quora.com",
    "producthunt.com",
    "angel.co",
    "techcrunch.com",
    "forbes.com",
    "bloomberg.com",
    "notion.so",
    "notion.site",
    "slack.com",
    "microsoft.com",
    "apple.com",
    "amazon.com",
    "aws.amazon.com",
}


def clean_url(url: str) -> str:
    if not url:
        return "UNKNOWN"
    if "uddg=" in url:
        parsed = urllib.parse.urlparse(url)
        qs = urllib.parse.parse_qs(parsed.query)
        if "uddg" in qs:
            url = qs["uddg"][0]
    try:
        p = urllib.parse.urlparse(url)
        if p.scheme and p.netloc:
            return f"{p.scheme}://{p.netloc}/"
    except Exception:
        pass
    return url


def domain_of(url: str) -> str:
    try:
        domain = urllib.parse.urlparse(url).netloc.lower()
    except Exception:
        return ""
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


def is_bad_domain(url: str, company_name: str = "") -> bool:
    domain = domain_of(url)
    if not domain:
        return True
    name_l = re.sub(r"[^a-z0-9]", "", (company_name or "").lower())
    for bad in BAD_DOMAINS:
        if bad not in domain:
            continue
        brand = bad.split(".")[0]
        # Allow when the company itself is that brand (e.g. Apollo.io → apollo.io)
        if brand and name_l and (brand in name_l or name_l in brand):
            continue
        return True
    return False


def name_tokens(company_name: str) -> list[str]:
    raw = re.sub(r"[^a-z0-9\s]", " ", (company_name or "").lower())
    stop = {
        "inc",
        "llc",
        "ltd",
        "co",
        "company",
        "the",
        "ai",
        "io",
        "labs",
        "lab",
        "technologies",
        "technology",
        "tech",
        "software",
        "systems",
        "group",
        "app",
        "apps",
    }
    toks = [t for t in raw.split() if len(t) >= 3 and t not in stop]
    compact = re.sub(r"[^a-z0-9]", "", (company_name or "").lower())
    if compact and compact not in toks and len(compact) >= 4:
        toks.append(compact)
    return toks


def plausible_company_url(company_name: str, url: str) -> bool:
    """Reject obvious wrong domains; soft-accept when name token appears in host."""
    if not url or url == "UNKNOWN" or is_bad_domain(url, company_name):
        return False
    domain = domain_of(url)
    host = domain.split(":")[0]
    if host.count(".") < 1:
        return False
    toks = name_tokens(company_name)
    if not toks:
        return True
    host_compact = host.replace(".", "").replace("-", "")
    for t in toks:
        if t in host or t in host_compact:
            return True
    return False


def safe_print(msg: str) -> None:
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode("ascii", "replace").decode("ascii"))


# Firecrawl credit exhaustion — skip further paid search calls this process.
_FIRECRAWL_DISABLED = False
# OpenAI billing/quota exhaustion — stop LLM + web_search calls.
_OPENAI_DISABLED = False


def firecrawl_search(query: str, *, limit: int = 5) -> list[dict]:
    """Return Firecrawl v1 search hit dicts (url/title/description)."""
    global _FIRECRAWL_DISABLED
    if _FIRECRAWL_DISABLED:
        return []
    key = (get_settings().firecrawl_api_key or "").strip()
    if not key:
        return []
    try:
        r = httpx.post(
            "https://api.firecrawl.dev/v1/search",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"query": query, "limit": limit},
            timeout=30.0,
        )
        if r.status_code == 402:
            _FIRECRAWL_DISABLED = True
            print("  Firecrawl credits exhausted (402) — switching to OpenAI web search.")
            return []
        if r.status_code != 200:
            print(f"  Firecrawl search HTTP {r.status_code}: {r.text[:200]}")
            return []
        payload = r.json()
        data = payload.get("data")
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            return list(data.get("web") or data.get("results") or [])
    except Exception as e:
        print(f"  Firecrawl search error: {e}")
    return []


def scrape_builtin_website(url: str) -> str | None:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    }
    try:
        r = httpx.get(url, headers=headers, follow_redirects=True, timeout=8.0)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, "html.parser")
        for a in soup.find_all("a"):
            href = a.get("href", "") or ""
            if href and "view website" in a.get_text(strip=True).lower():
                return clean_url(href)
            text = a.get_text(strip=True).lower()
            if href and any(x in text for x in ("website", "company website")):
                resolved = clean_url(href)
                if not is_bad_domain(resolved):
                    return resolved
    except Exception as e:
        print(f"BuiltIn scrape failed for {url}: {e}")
    return None


def pick_website_from_hits(hits: list[dict], company_name: str = "") -> str:
    for hit in hits:
        url = hit.get("url") or hit.get("link") or ""
        resolved = clean_url(url)
        if company_name:
            if plausible_company_url(company_name, resolved):
                return resolved
        elif resolved != "UNKNOWN" and not is_bad_domain(resolved):
            return resolved
    return "UNKNOWN"


def _openai_client():
    from openai import OpenAI

    return OpenAI(api_key=get_settings().openai_api_key)


def extract_url_from_text(text: str, company_name: str = "") -> str:
    if not text:
        return "UNKNOWN"
    candidates: list[str] = []
    for m in re.finditer(r"https?://[^\s\)\]\"'<>]+", text):
        resolved = clean_url(m.group(0).rstrip(".,;"))
        if resolved == "UNKNOWN":
            continue
        if is_bad_domain(resolved, company_name):
            continue
        if resolved not in candidates:
            candidates.append(resolved)
    if not candidates:
        return "UNKNOWN"
    # Prefer domains that look like the company name
    for c in candidates:
        if company_name and plausible_company_url(company_name, c):
            return c
    # Otherwise accept first non-blocklisted domain (OpenAI web search hit)
    return candidates[0]


def openai_resolve_website(company_name: str, role_title: str = "", social_url: str = "") -> str:
    """Resolve official homepage via Responses API + web_search."""
    global _OPENAI_DISABLED
    if _OPENAI_DISABLED:
        return "UNKNOWN"
    settings = get_settings()
    model = settings.openai_filter_model or "gpt-4o-mini"
    prompt = (
        f"Find the official company homepage URL for the startup/company named "
        f'"{company_name}".'
    )
    if role_title:
        prompt += f' They are hiring for "{role_title}".'
    if social_url:
        prompt += f" Known profile/posting URL: {social_url}."
    prompt += (
        " Prefer the company's own marketing domain (not LinkedIn, Wellfound, BuiltIn, "
        "Crunchbase, Google, Wikipedia, job boards, or news). "
        "The domain should usually contain the company name or a clear brand slug. "
        "Reply with ONLY the homepage URL (https://...) or the word UNKNOWN."
    )
    try:
        print(f"  OpenAI web search: {company_name}")
        resp = _openai_client().responses.create(
            model=model,
            tools=[{"type": "web_search_preview"}],
            input=prompt,
        )
        text = (getattr(resp, "output_text", None) or "").strip()
        resolved = extract_url_from_text(text, company_name)
        if resolved != "UNKNOWN":
            return resolved
        # One retry with stricter instruction if model returned junk / no match
        retry_prompt = (
            f'The previous answer was unusable for "{company_name}". '
            "Return ONLY that company's real homepage URL if you can verify it, "
            "else UNKNOWN. Do not return google.com or any search engine."
        )
        resp2 = _openai_client().responses.create(
            model=model,
            tools=[{"type": "web_search_preview"}],
            input=retry_prompt,
        )
        text2 = (getattr(resp2, "output_text", None) or "").strip()
        return extract_url_from_text(text2, company_name)
    except Exception as e:
        err = str(e)
        if "insufficient_quota" in err or "429" in err and "quota" in err.lower():
            _OPENAI_DISABLED = True
            print("  OpenAI quota exhausted — pausing LLM/web-search calls.")
        print(f"  OpenAI website resolve error: {e}")
        return "UNKNOWN"


def openai_job_snippets(company_name: str, role_title: str) -> str:
    global _OPENAI_DISABLED
    if _OPENAI_DISABLED:
        return ""
    settings = get_settings()
    model = settings.openai_filter_model or "gpt-4o-mini"
    prompt = (
        f'Find short public job-description snippets for "{company_name}" hiring '
        f'"{role_title}". Return up to 400 words of relevant posting text only, '
        "or UNKNOWN if nothing useful."
    )
    try:
        print(f"  OpenAI job snippets: {company_name}")
        resp = _openai_client().responses.create(
            model=model,
            tools=[{"type": "web_search_preview"}],
            input=prompt,
        )
        text = (getattr(resp, "output_text", None) or "").strip()
        if not text or text.upper() == "UNKNOWN":
            return ""
        return text[:2500]
    except Exception as e:
        err = str(e)
        if "insufficient_quota" in err or ("429" in err and "quota" in err.lower()):
            _OPENAI_DISABLED = True
            print("  OpenAI quota exhausted — pausing LLM/web-search calls.")
        print(f"  OpenAI job snippet error: {e}")
        return ""


def search_website(company_name: str, role_title: str = "", social_url: str = "") -> str:
    if social_url and "builtin.com/company/" in social_url:
        print(f"  Scraping BuiltIn profile for {company_name}...")
        web = scrape_builtin_website(social_url)
        if web and web != "UNKNOWN":
            return web

    slug = ""
    if social_url:
        m = re.search(r"company/([a-zA-Z0-9_-]+)", social_url)
        if m:
            slug = m.group(1)

    # Cheap Firecrawl pass first (skipped automatically after 402)
    if not _FIRECRAWL_DISABLED:
        queries: list[str] = []
        if slug:
            queries.append(f"{slug} official company website")
        queries.append(f"{company_name} startup official website")
        for query in queries[:2]:
            print(f"  Firecrawl search: {query[:80]}")
            hits = firecrawl_search(query, limit=5)
            picked = pick_website_from_hits(hits, company_name)
            if picked != "UNKNOWN":
                return picked
            if _FIRECRAWL_DISABLED:
                break
            time.sleep(0.2)

    if _OPENAI_DISABLED:
        return "UNKNOWN"
    return openai_resolve_website(company_name, role_title, social_url)


def search_job_description(company_name: str, role_title: str) -> str:
    if not _FIRECRAWL_DISABLED:
        query = f'"{company_name}" "{role_title}" job description'
        print(f"  Firecrawl job snippets: {query[:80]}")
        hits = firecrawl_search(query, limit=5)
        snippets: list[str] = []
        for hit in hits:
            desc = (hit.get("description") or hit.get("snippet") or hit.get("markdown") or "").strip()
            title = (hit.get("title") or "").strip()
            if desc:
                snippets.append(f"{title}\n{desc}" if title else desc)
        if snippets:
            return "\n\n".join(snippets[:4])
    return openai_job_snippets(company_name, role_title)


def map_result_to_row(result: dict, company_id: str, company_name: str, original_row: dict) -> dict:
    l2 = result.get("layer_2") or {}
    l3 = result.get("layer_3_acv") or {}
    l4 = result.get("layer_4") or {}

    l0_block = result.get("layer_0") or {}
    l0_status = l0_block.get("status", "") if isinstance(l0_block, dict) else str(l0_block)
    l0_reason = l0_block.get("reason", "") if isinstance(l0_block, dict) else ""

    l1a_block = result.get("layer_1a_buyer") or {}
    l1a_status = l1a_block.get("status", "") if isinstance(l1a_block, dict) else str(l1a_block)
    l1a_reason = l1a_block.get("reason", "") if isinstance(l1a_block, dict) else ""

    l1b_block = result.get("layer_1b_pipeline") or {}
    l1b_status = l1b_block.get("status", "") if isinstance(l1b_block, dict) else str(l1b_block)
    l1b_reason = l1b_block.get("reason", "") if isinstance(l1b_block, dict) else ""

    l2_status = l2.get("status", "") if isinstance(l2, dict) else str(l2)
    l2_scenario = l2.get("scenario", "") if isinstance(l2, dict) else ""

    l3_status = l3.get("status", "") if isinstance(l3, dict) else str(l3)
    l3_acv = l3.get("acv", "") if isinstance(l3, dict) else ""
    l3_risk = l3.get("economic_risk", "") if isinstance(l3, dict) else ""

    l4_status = l4.get("status", "") if isinstance(l4, dict) else str(l4)
    l4_reason = l4.get("reason", "") if isinstance(l4, dict) else ""

    commod = result.get("commoditization_risk", "")
    if not commod and isinstance(l4, dict):
        commod = l4.get("commoditization_risk", "") or ""
    if not commod:
        commod = "none"

    verdict = (result.get("verdict") or "").strip().lower()
    killed_at = result.get("killed_at") or ""
    if not verdict:
        if killed_at and str(killed_at).lower() not in {"", "none", "null"}:
            verdict = "dead"
        elif str(l0_status).upper() == "KILL":
            verdict = "dead"
            killed_at = killed_at or "0"
        elif str(l1a_status).upper() == "KILL":
            verdict = "dead"
            killed_at = killed_at or "1a"
        elif str(l1b_status).upper() == "KILL":
            verdict = "dead"
            killed_at = killed_at or "1b"
        elif str(l2_status).upper() == "KILL":
            verdict = "dead"
            killed_at = killed_at or "2"

    notes = result.get("verdict_notes") or ""
    if not notes and verdict == "dead" and l0_reason:
        notes = l0_reason

    return {
        "company_id": company_id,
        "company_name": company_name,
        "website": original_row.get("website", ""),
        "company_size": original_row.get("company_size", "UNKNOWN"),
        "company_stage": original_row.get("company_stage", ""),
        "founded_or_started": original_row.get("founded_or_started", "UNKNOWN"),
        "industries": original_row.get("industries", ""),
        "role_tags": original_row.get("role_tags", ""),
        "role_title": original_row.get("role_title", ""),
        "posting_url": original_row.get("posting_url", ""),
        "salary_raw": original_row.get("salary_raw", ""),
        "layer_0": l0_status,
        "layer_0_reason": l0_reason,
        "layer_1a": l1a_status,
        "layer_1a_reason": l1a_reason,
        "layer_1b": l1b_status,
        "layer_1b_reason": l1b_reason,
        "layer_2": l2_status,
        "scenario": l2_scenario,
        "layer_3_acv": f"{l3_status}: {l3_acv}".strip(": ") if l3_acv else l3_status,
        "economic_risk": l3_risk,
        "layer_4": f"{l4_status}: {l4_reason}".strip(": ") if l4_reason else l4_status,
        "commoditization_risk": commod,
        "verdict": verdict,
        "lane": result.get("lane", ""),
        "kill_layer": killed_at,
        "one_fact_to_verify": result.get("one_fact_to_verify", ""),
        "opener": result.get("draft_opener", ""),
        "verdict_notes": notes,
        "dialability_rank_hint": str(result.get("dialability_rank_hint", "")),
        "legibility_trap": str(result.get("legibility_trap", "")).lower(),
        "analyzed_by": "openai",
        "analyzed_at": "2026-07-18",
        "companywebsite": original_row.get("companywebsite", "UNKNOWN"),
    }


def save_csv(headers: list[str], rows: list[dict]) -> None:
    with CSV_PATH.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_progress(payload: dict) -> None:
    PROGRESS_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def already_screened(row: dict) -> bool:
    if row.get("analyzed_by") != "openai":
        return False
    if not (row.get("analyzed_at") or "").startswith("2026-07-18"):
        return False
    # Require a real verdict so empty/partial mappings get retried
    return bool((row.get("verdict") or "").strip())


def needs_website(row: dict) -> bool:
    verdict = (row.get("verdict") or "").lower()
    if verdict not in ("dead", "insufficient_data"):
        return False
    web = (row.get("companywebsite") or "").strip()
    return not web or web == "UNKNOWN"


def main() -> None:
    acquire_lock()
    try:
        _main_locked()
    finally:
        release_lock()


def _main_locked() -> None:
    global _FIRECRAWL_DISABLED, _OPENAI_DISABLED
    settings = get_settings()
    if not settings.openai_api_key:
        print("ERROR: OPENAI_API_KEY not loaded. Run from scanner/ with .env present.")
        sys.exit(1)
    # Firecrawl credits were exhausted earlier in this enrichment cycle.
    # Prefer OpenAI web_search unless FORCE_FIRECRAWL=1.
    if os.environ.get("FORCE_FIRECRAWL", "").strip() == "1":
        if not (settings.firecrawl_api_key or "").strip():
            _FIRECRAWL_DISABLED = True
            print("No FIRECRAWL_API_KEY — using OpenAI web search.")
    else:
        _FIRECRAWL_DISABLED = True
        print("Using OpenAI web search for website/snippet lookup (Firecrawl skipped).")
    print(f"OpenAI key loaded; score model={settings.openai_score_model}")
    print(f"Lock acquired pid={os.getpid()}")
    print(f"Firecrawl enabled={not _FIRECRAWL_DISABLED}")

    if not PACK_PATH.exists():
        print(f"Error: pack file not found at {PACK_PATH}")
        return
    pack_data = json.loads(PACK_PATH.read_text(encoding="utf-8"))
    pack_dict = {p["company_id"]: p for p in pack_data}

    if not CSV_PATH.exists():
        print(f"Error: target CSV not found at {CSV_PATH}")
        return

    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        headers = list(reader.fieldnames or [])
        rows = list(reader)

    if "companywebsite" not in headers:
        headers.append("companywebsite")
        for row in rows:
            row["companywebsite"] = "UNKNOWN"

    resolved_count = 0
    screened_count = 0
    phase1_targets = sum(1 for r in rows if needs_website(r))
    phase2_targets = sum(
        1
        for r in rows
        if (r.get("verdict") or "").lower() == "insufficient_data" and not already_screened(r)
    )
    print(
        f"Loaded {len(rows)} rows. Phase1 remaining={phase1_targets}, "
        f"Phase2 remaining={phase2_targets}"
    )
    write_progress(
        {
            "phase": "1_website",
            "phase1_remaining": phase1_targets,
            "phase2_remaining": phase2_targets,
            "resolved_this_run": 0,
            "screened_this_run": 0,
        }
    )

    # Phase 1: website resolution — insufficient_data first, then dead
    phase1_rows = [r for r in rows if needs_website(r)]
    phase1_rows.sort(
        key=lambda r: 0 if (r.get("verdict") or "").lower() == "insufficient_data" else 1
    )
    for i, row in enumerate(phase1_rows):
        name = row["company_name"]
        title = row.get("role_title") or ""
        social = row.get("website") or ""
        print(
            f"[P1 {i+1}/{len(phase1_rows)}] Resolving website for {name} "
            f"({row.get('verdict')})..."
        )
        company_web = search_website(name, title, social)
        row["companywebsite"] = company_web
        print(f"  Result: {company_web}")
        resolved_count += 1
        if resolved_count % 5 == 0:
            save_csv(headers, rows)
            write_progress(
                {
                    "phase": "1_website",
                    "phase1_remaining": sum(1 for r in rows if needs_website(r)),
                    "phase2_remaining": phase2_targets,
                    "resolved_this_run": resolved_count,
                    "screened_this_run": screened_count,
                    "last_company": name,
                }
            )

    save_csv(headers, rows)
    print(f"Phase 1 complete! Resolved {resolved_count} websites this run.")

    if _OPENAI_DISABLED:
        print("Skipping Phase 2 — OpenAI quota exhausted. Top up billing and re-run.")
        write_progress(
            {
                "phase": "blocked_openai_quota",
                "resolved_this_run": resolved_count,
                "screened_this_run": screened_count,
                "phase1_remaining": sum(1 for r in rows if needs_website(r)),
                "phase2_remaining": sum(
                    1
                    for r in rows
                    if (r.get("verdict") or "").lower() == "insufficient_data"
                    and not already_screened(r)
                ),
            }
        )
        return

    # Phase 2: deep screen insufficient_data
    for i, row in enumerate(rows):
        if _OPENAI_DISABLED:
            print("OpenAI quota hit mid Phase 2 — stopping.")
            break
        verdict = (row.get("verdict") or "").lower()
        if verdict != "insufficient_data":
            continue
        if already_screened(row):
            print(f"[P2 {i+1}/{len(rows)}] Skipping {row['company_name']} — already screened.")
            continue

        name = row["company_name"]
        title = row.get("role_title") or ""
        comp_id = row["company_id"]
        company_web = row.get("companywebsite") or "UNKNOWN"
        print(f"[P2 {i+1}/{len(rows)}] Deep screening {name} ({title})...")

        pack_item = pack_dict.get(comp_id, {})
        desc = pack_item.get("description") or ""
        if len(desc) < 200:
            print(f"  Description thin ({len(desc)} chars). Searching snippets...")
            snippets = search_job_description(name, title)
            if snippets:
                desc = f"{desc}\n\nEnriched context from web search:\n{snippets}"
                print(f"  Enriched to {len(desc)} chars.")

        site_ctx = None
        if company_web and company_web != "UNKNOWN":
            safe_print(f"  Fetching site context for {company_web}...")
            site_ctx = fetch_site_context(company_web, raw_text_hint=desc)
            tag = (site_ctx.get("tagline") or "UNKNOWN")[:80]
            safe_print(f"  Site tagline: {tag}...")

        try:
            print("  Calling deep_screen_one...")
            result = deep_screen_one(
                company=name,
                title=title,
                raw_text=desc,
                url=company_web if company_web != "UNKNOWN" else None,
                site_context=site_ctx,
            )
            flat_data = map_result_to_row(result, comp_id, name, row)
            flat_data["companywebsite"] = company_web
            row.update(flat_data)
            print(f"  Done. New verdict: {row['verdict']}")
            screened_count += 1
            save_csv(headers, rows)
            write_progress(
                {
                    "phase": "2_screen",
                    "phase1_remaining": sum(1 for r in rows if needs_website(r)),
                    "phase2_remaining": sum(
                        1
                        for r in rows
                        if (r.get("verdict") or "").lower() == "insufficient_data"
                        and not already_screened(r)
                    ),
                    "resolved_this_run": resolved_count,
                    "screened_this_run": screened_count,
                    "last_company": name,
                    "last_verdict": row.get("verdict"),
                }
            )
        except Exception as e:
            err = str(e)
            if "insufficient_quota" in err or ("429" in err and "quota" in err.lower()):
                _OPENAI_DISABLED = True
                print("  OpenAI quota exhausted during deep screen — stopping Phase 2.")
            print(f"  Error screening {name}: {e}")
            write_progress(
                {
                    "phase": "2_screen_error",
                    "last_company": name,
                    "error": str(e),
                    "resolved_this_run": resolved_count,
                    "screened_this_run": screened_count,
                }
            )

    save_csv(headers, rows)
    write_progress(
        {
            "phase": "done",
            "resolved_this_run": resolved_count,
            "screened_this_run": screened_count,
            "phase1_remaining": sum(1 for r in rows if needs_website(r)),
            "phase2_remaining": sum(
                1
                for r in rows
                if (r.get("verdict") or "").lower() == "insufficient_data"
                and not already_screened(r)
            ),
        }
    )
    print(f"Phase 2 complete! Screened {screened_count} records this run.")
    print("All tasks completed successfully!")


if __name__ == "__main__":
    main()
