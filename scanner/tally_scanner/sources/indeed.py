"""
Indeed search adapter — search-first source for Tally.

Reality (2026-07):
  - Bare httpx / curl_cffi to ca.indeed.com → Cloudflare captcha (403).
  - python-jobspy does not install cleanly on Python 3.13 (pins old numpy).
  - Firecrawl stealth proxy successfully returns SERP markdown.

Transport order:
  1. Firecrawl API when FIRECRAWL_API_KEY is set (production path)
  2. Local fixture JSON (dev / UI Pull shape verification)
  3. Clear blocked error otherwise

URL contract (from operator captures):
  q       → search query
  l       → location
  radius  → distance km/mi (Indeed CA uses km-ish; we pass through as int)
  host    → country (ca.indeed.com → Canada)
  from, vjk → navigation noise, ignored for search criteria
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote_plus, urlencode, urlparse

import httpx

from tally_scanner.config import get_settings
from tally_scanner.models import RawPosting

logger = logging.getLogger(__name__)

FIXTURE_DIR = Path(__file__).resolve().parents[2] / "data" / "fixtures"
DEFAULT_FIXTURE = FIXTURE_DIR / "indeed_montreal_founding_bd.json"

# Host TLD → JobSpy/Firecrawl country label
HOST_COUNTRY: dict[str, str] = {
    "ca": "Canada",
    "www": "USA",
    "uk": "UK",
    "au": "Australia",
    "de": "Germany",
    "fr": "France",
    "in": "India",
}

COUNTRY_HOST: dict[str, str] = {
    "canada": "ca.indeed.com",
    "usa": "www.indeed.com",
    "us": "www.indeed.com",
    "uk": "uk.indeed.com",
    "australia": "au.indeed.com",
    "germany": "de.indeed.com",
    "france": "fr.indeed.com",
    "india": "in.indeed.com",
}


@dataclass
class IndeedSearchCriteria:
    """Enrollment / CLI search knobs for Indeed."""

    query: str
    location: str = ""
    country: str = "Canada"
    radius: int | None = 25
    results_wanted: int = 25
    # broad | phrase | boolean — boolean preserves "…" AND/OR "…" for description match
    match_mode: str = "broad"
    sort: str | None = None  # relevance | date
    fromage_days: int | None = None  # Indeed fromage; None = All (omit)
    salary_min: int | None = None  # dollars; None = All (omit salaryType)
    search_url: str | None = None  # original pasted URL if any

    def compiled_query(self) -> str:
        q = normalize_query(self.query, self.match_mode)
        return q

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class IndeedFetchResult:
    postings: list[RawPosting] = field(default_factory=list)
    criteria: IndeedSearchCriteria | None = None
    transport: str = ""
    blocked: bool = False
    error: str | None = None
    raw_job_count: int = 0
    search_url: str | None = None
    raw_markdown: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "transport": self.transport,
            "blocked": self.blocked,
            "error": self.error,
            "raw_job_count": self.raw_job_count,
            "posting_count": len(self.postings),
            "search_url": self.search_url,
            "raw_markdown": (self.raw_markdown or "")[:8000] or None,
            "criteria": self.criteria.to_dict() if self.criteria else None,
            "postings": [
                {
                    "company": p.company,
                    "title": p.title,
                    "url": p.url,
                    "source": p.source,
                    "raw_text": (p.raw_text or "")[:400],
                    "meta": p.meta,
                }
                for p in self.postings
            ],
        }


def normalize_query(query: str, match_mode: str = "broad") -> str:
    """
    Normalize operator query quirks observed on Indeed:
      - Double quotes around a single word often zero results ("founding")
      - Single quotes behave like unquoted terms ('founding')
      - boolean: preserve "phrase" AND/OR "phrase" for description-exact search
    We strip decorative quotes for broad mode; phrase mode uses proper "…".
    """
    q = (query or "").strip()
    if not q:
        return ""
    # Convert curly quotes
    q = q.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    if match_mode == "boolean":
        return re.sub(r"\s+", " ", q).strip()
    if match_mode == "phrase":
        inner = re.sub(r'^["\']+|["\']+$', "", q).strip()
        return f'"{inner}"'
    # broad: remove all quote characters used as decoration
    q = q.replace('"', " ").replace("'", " ")
    q = re.sub(r"\s+", " ", q).strip()
    return q


def _format_salary_type(salary_min: int) -> str:
    # Indeed expects salaryType=$50,000
    return f"${salary_min:,}"


def build_search_url(criteria: IndeedSearchCriteria) -> str:
    host = host_for_country(criteria.country)
    params: dict[str, str] = {"q": criteria.compiled_query()}
    if criteria.location:
        params["l"] = criteria.location
    if criteria.radius is not None:
        params["radius"] = str(criteria.radius)
    if criteria.sort:
        params["sort"] = criteria.sort
    if criteria.fromage_days is not None and criteria.fromage_days > 0:
        params["fromage"] = str(criteria.fromage_days)
    if criteria.salary_min is not None and criteria.salary_min > 0:
        params["salaryType"] = _format_salary_type(criteria.salary_min)
    return f"https://{host}/jobs?{urlencode(params)}"


def country_from_host(host: str) -> str:
    host = (host or "").lower().removeprefix("www.")
    if host.endswith(".indeed.com") or host == "indeed.com":
        prefix = host.split(".")[0] if host != "indeed.com" else "www"
        if prefix == "indeed":
            return "USA"
        return HOST_COUNTRY.get(prefix, "USA")
    return "Canada"


def host_for_country(country: str) -> str:
    return COUNTRY_HOST.get((country or "").strip().lower(), "ca.indeed.com")


def parse_indeed_url(url: str) -> IndeedSearchCriteria | None:
    """
    Parse an Indeed search URL into criteria.
    Returns None for unsupported shapes (homepage, bare domain without q).
    Single-job URLs return a synthetic criteria with query empty + job key in meta via search_url.
    """
    try:
        parsed = urlparse(url.strip())
    except Exception:
        return None
    host = (parsed.hostname or "").lower()
    if "indeed." not in host:
        return None

    path = parsed.path or "/"
    qs = parse_qs(parsed.query)

    # Single job: /viewjob?jk=… or /rc/clk?jk=…
    jk = (qs.get("jk") or [None])[0]
    if "/viewjob" in path or (path.startswith("/rc/clk") and jk):
        return IndeedSearchCriteria(
            query="",
            location="",
            country=country_from_host(host),
            radius=None,
            results_wanted=1,
            search_url=url,
        )

    # Search SERP
    if path.rstrip("/") in ("", "/jobs") or path.startswith("/jobs"):
        q = unquote_plus((qs.get("q") or [""])[0])
        loc = unquote_plus((qs.get("l") or [""])[0])
        radius_raw = (qs.get("radius") or [None])[0]
        radius = int(radius_raw) if radius_raw and str(radius_raw).isdigit() else 25
        sort = (qs.get("sort") or [None])[0]
        fromage = (qs.get("fromage") or [None])[0]
        fromage_days = int(fromage) if fromage and str(fromage).isdigit() else None
        salary_raw = unquote_plus((qs.get("salaryType") or [""])[0])
        salary_digits = re.sub(r"[^\d]", "", salary_raw)
        salary_min = int(salary_digits) if salary_digits.isdigit() else None
        looks_boolean = bool(re.search(r'"[^"]+"\s+(AND|OR)\s+"', q, re.I)) or bool(
            re.search(r"\b(AND|OR)\b", q)
        )
        match_mode = "boolean" if looks_boolean else "broad"
        if not q and not loc:
            # bare indeed.com / jobs with no params — catalog source, empty criteria
            return IndeedSearchCriteria(
                query="",
                location="",
                country=country_from_host(host),
                radius=25,
                search_url=url,
            )
        return IndeedSearchCriteria(
            query=q,
            location=loc,
            country=country_from_host(host),
            radius=radius,
            sort=sort,
            fromage_days=fromage_days,
            salary_min=salary_min,
            match_mode=match_mode,
            search_url=url,
        )

    # Company pages etc. — unsupported for search-first yet
    return None


def _parse_jk(url: str) -> str | None:
    m = re.search(r"[?&]jk=([a-f0-9]{16})", url or "", re.I)
    return m.group(1) if m else None


def _normalize_serp_markdown(md: str) -> str:
    """Firecrawl sometimes emits table cells with <br> instead of newlines."""
    text = md or ""
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</?t[dh][^>]*>", "\n", text, flags=re.I)
    text = re.sub(r"</?tr[^>]*>", "\n", text, flags=re.I)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def parse_jobs_from_markdown(md: str, *, country: str = "Canada") -> list[dict[str, Any]]:
    """
    Parse Firecrawl-style Indeed SERP markdown into job dicts.
    Pattern: ### [Title](url) then company / location lines.
    """
    md = _normalize_serp_markdown(md)
    jobs: list[dict[str, Any]] = []
    # Heading link only — company/location parsed from following text lines
    heading = re.compile(r"###\s+\[([^\]]+)\]\((https?://[^)]+)\)", re.M)

    def _next_text_lines(start: int, n: int = 2) -> list[str]:
        lines: list[str] = []
        for ln in md[start:].splitlines():
            s = ln.strip().strip("|").strip()
            if not s:
                continue
            if s.lower() == "easily apply":
                continue
            if s.startswith("![") or s.startswith("<img"):
                continue
            if s in {"|", "---", "-"}:
                continue
            lines.append(s)
            if len(lines) >= n:
                break
        return lines

    for m in heading.finditer(md or ""):
        title, url = m.group(1), m.group(2)
        following = _next_text_lines(m.end(), 2)
        if len(following) < 2:
            continue
        company, location = following[0], following[1]
        if company.lower().startswith("sort by"):
            continue
        if len(company) > 120 or len(location) > 120:
            continue
        # Snippet: following bullet-ish lines until next ###
        start = m.end()
        nxt = md.find("\n### ", start)
        block = md[start : nxt if nxt != -1 else start + 600]
        snippet_lines = [
            ln.strip(" -*\t")
            for ln in block.splitlines()
            if ln.strip().startswith("-") and "View all" not in ln and "Salary Search" not in ln
        ]
        # Prefer longer descriptive bullets over benefit chips ("Full-time", "Dental care")
        snippet_lines = sorted(snippet_lines, key=len, reverse=True)
        snippet = " ".join(snippet_lines[:3])[:800]
        jk = _parse_jk(url)
        # Normalize clk URLs to stable viewjob when possible
        stable = f"https://{host_for_country(country)}/viewjob?jk={jk}" if jk else url
        jobs.append(
            {
                "title": title.strip(),
                "company": company,
                "location": location,
                "url": stable,
                "jk": jk,
                "snippet": snippet,
            }
        )
    # Dedup by jk/url
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for j in jobs:
        key = j.get("jk") or j.get("url") or j["title"]
        if key in seen:
            continue
        seen.add(key)
        out.append(j)
    return out


def jobs_to_postings(jobs: list[dict[str, Any]], *, criteria: IndeedSearchCriteria) -> list[RawPosting]:
    postings: list[RawPosting] = []
    for j in jobs:
        title = (j.get("title") or "").strip()
        company = (j.get("company") or "").strip() or "Unknown"
        if not title:
            continue
        snippet = j.get("snippet") or j.get("description") or ""
        loc = j.get("location") or criteria.location
        raw = "\n".join(x for x in [title, company, loc, snippet] if x)
        postings.append(
            RawPosting(
                company=company,
                title=title,
                source="indeed",
                url=j.get("url"),
                raw_text=raw,
                meta={
                    "jk": j.get("jk"),
                    "location": loc,
                    "country": criteria.country,
                    "query": criteria.compiled_query(),
                    "search_location": criteria.location,
                    "radius": criteria.radius,
                },
            )
        )
    return postings


def _fetch_via_firecrawl(url: str) -> tuple[str | None, str | None]:
    settings = get_settings()
    key = (settings.firecrawl_api_key or "").strip()
    if not key:
        return None, "FIRECRAWL_API_KEY not set"
    payload = {
        "url": url,
        "formats": ["markdown"],
        "onlyMainContent": True,
        "waitFor": 8000,
        "proxy": "stealth",
        "location": {"country": "CA", "languages": ["en"]},
    }
    try:
        with httpx.Client(timeout=90.0) as client:
            r = client.post(
                "https://api.firecrawl.dev/v1/scrape",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            if r.status_code >= 400:
                return None, f"Firecrawl HTTP {r.status_code}: {r.text[:300]}"
            data = r.json()
            md = (
                (data.get("data") or {}).get("markdown")
                or data.get("markdown")
                or ""
            )
            if not md:
                return None, "Firecrawl returned empty markdown"
            if "Additional Verification Required" in md or "Security Check" in md:
                return None, "Indeed Cloudflare captcha (Firecrawl still blocked)"
            return md, None
    except Exception as e:
        return None, f"Firecrawl error: {e}"


def _load_fixture(path: Path | None = None) -> dict[str, Any] | None:
    p = path or DEFAULT_FIXTURE
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        logger.warning("fixture load failed %s: %s", p, e)
        return None


def search_indeed(
    criteria: IndeedSearchCriteria,
    *,
    allow_fixture: bool = True,
    fixture_path: Path | None = None,
) -> IndeedFetchResult:
    """Run an Indeed search via Firecrawl (or fixture fallback)."""
    if not criteria.query and criteria.search_url and "/viewjob" not in (criteria.search_url or ""):
        return IndeedFetchResult(
            criteria=criteria,
            blocked=False,
            error="Indeed search requires a query (q=). Paste a search URL or set query.",
            transport="none",
        )

    url = criteria.search_url if criteria.query == "" and criteria.search_url else build_search_url(criteria)
    # Prefer rebuilding URL from criteria when we have a query (drop vjk/from noise)
    if criteria.query:
        url = build_search_url(criteria)

    md, err = _fetch_via_firecrawl(url)
    if md:
        jobs = parse_jobs_from_markdown(md, country=criteria.country)[: criteria.results_wanted]
        postings = jobs_to_postings(jobs, criteria=criteria)
        return IndeedFetchResult(
            postings=postings,
            criteria=criteria,
            transport="firecrawl",
            blocked=False,
            raw_job_count=len(jobs),
            search_url=url,
            raw_markdown=md,
        )

    firecrawl_err = err
    if allow_fixture:
        fixture = _load_fixture(fixture_path)
        if fixture:
            # Only use fixture when criteria roughly matches fixture intent OR explicit path
            jobs = fixture.get("jobs") or []
            fixture_md = fixture.get("markdown")
            if not jobs and fixture_md:
                jobs = parse_jobs_from_markdown(fixture_md, country=criteria.country)
            jobs = jobs[: criteria.results_wanted]
            postings = jobs_to_postings(jobs, criteria=criteria)
            return IndeedFetchResult(
                postings=postings,
                criteria=criteria,
                transport="fixture",
                blocked=False,
                error=f"Live fetch unavailable ({firecrawl_err}); served fixture",
                raw_job_count=len(jobs),
                search_url=url,
                raw_markdown=fixture_md if isinstance(fixture_md, str) else None,
            )

    return IndeedFetchResult(
        criteria=criteria,
        transport="blocked",
        blocked=True,
        search_url=url,
        error=(
            f"Indeed live search unavailable. {firecrawl_err}. "
            "Direct HTTP is Cloudflare-blocked; set FIRECRAWL_API_KEY for stealth scrape, "
            "or use the bundled fixture for offline shape verification."
        ),
    )


def search_from_url(
    url: str,
    *,
    results_wanted: int = 25,
    allow_fixture: bool = True,
) -> IndeedFetchResult:
    criteria = parse_indeed_url(url)
    if not criteria:
        return IndeedFetchResult(
            blocked=False,
            error=f"Unsupported Indeed URL shape: {url}",
            transport="none",
        )
    criteria.results_wanted = results_wanted
    if not criteria.query:
        # Try to keep going with fixture for shape verification when URL is catalog-only
        if allow_fixture and _load_fixture():
            criteria.query = "founding business development"
            criteria.location = criteria.location or "Montréal, QC"
    return search_indeed(criteria, allow_fixture=allow_fixture)


# Shape advertised to enrollment / Pull
INDEED_FIELD_SHAPE = [
    {"path": "company", "label": "Company", "type": "string"},
    {"path": "title", "label": "Role title", "type": "string"},
    {"path": "url", "label": "Posting URL", "type": "url"},
    {"path": "raw_text", "label": "Body / snippet", "type": "string"},
    {"path": "location", "label": "Location", "type": "string"},
    {"path": "jk", "label": "Indeed job key", "type": "string"},
    {"path": "source", "label": "Source id", "type": "string"},
]
