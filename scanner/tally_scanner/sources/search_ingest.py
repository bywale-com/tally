"""
Search-first ingestion.

Flow:
  1. Run SearXNG dorks / phrase searches against ATS hosts
  2. Resolve hit URLs into individual RawPosting rows (prefer job-level fetch)
  3. For board-only hits, fetch the board and keep only keyword-matching jobs

This is the opposite of "poll mega company boards and dump everything."
"""

from __future__ import annotations

import logging
import re
from typing import Iterable
from urllib.parse import urlparse

import httpx

from tally_scanner.config import get_settings
from tally_scanner.filter import filter_posting, normalize_text
from tally_scanner.models import RawPosting
from tally_scanner.sources import ats
from tally_scanner.sources.html_utils import html_to_text
from tally_scanner.sources.search_queries import ATS_SITE_DORKS, ROLE_QUERIES

logger = logging.getLogger(__name__)

# Job-level URL → (ats, slug, job_id)
JOB_URL_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"(?:boards|job-boards)\.greenhouse\.io/([a-zA-Z0-9_-]+)/jobs/(\d+)", re.I), "greenhouse"),
    (re.compile(r"jobs\.lever\.co/([a-zA-Z0-9_-]+)/([a-zA-Z0-9-]+)", re.I), "lever"),
    (re.compile(r"jobs\.ashbyhq\.com/([a-zA-Z0-9_-]+)/([a-f0-9-]{36})", re.I), "ashby"),
]

# Board-level URL → (ats, slug)
BOARD_URL_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"(?:boards|job-boards)\.greenhouse\.io/([a-zA-Z0-9_-]+)/?$", re.I), "greenhouse"),
    (re.compile(r"jobs\.lever\.co/([a-zA-Z0-9_-]+)/?$", re.I), "lever"),
    (re.compile(r"jobs\.ashbyhq\.com/([a-zA-Z0-9_-]+)/?$", re.I), "ashby"),
]

SKIP_SLUGS = {"embed", "v1", "api", "jobs", "job", "embeddable"}

# Aggregators / mega boards that look like ATS but are not a single early-stage company
SKIP_BOARD_SLUGS = {
    "jobgether",  # multi-tenant aggregator — thousands of listings
}


def keyword_gate(title: str, body: str) -> bool:
    """Cheap gate: posting must look like a founding/confession hit."""
    return filter_posting(title, body).passed


def _client() -> httpx.Client:
    s = get_settings()
    return httpx.Client(
        timeout=s.http_timeout,
        headers={"User-Agent": s.user_agent},
        follow_redirects=True,
    )


def parse_job_url(url: str) -> tuple[str, str, str] | None:
    """Return (ats, slug, job_id) or None."""
    for pattern, ats_name in JOB_URL_PATTERNS:
        m = pattern.search(url or "")
        if m:
            slug = m.group(1).lower()
            if slug in SKIP_SLUGS:
                return None
            return ats_name, slug, m.group(2)
    return None


def parse_board_url(url: str) -> tuple[str, str] | None:
    for pattern, ats_name in BOARD_URL_PATTERNS:
        m = pattern.search(url or "")
        if m:
            slug = m.group(1).lower()
            if slug in SKIP_SLUGS:
                return None
            return ats_name, slug
    return None


def fetch_greenhouse_job(slug: str, job_id: str) -> RawPosting | None:
    url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs/{job_id}"
    with _client() as client:
        try:
            r = client.get(url)
            if r.status_code == 404:
                return None
            r.raise_for_status()
            job = r.json()
        except Exception as e:
            logger.warning("greenhouse job fetch failed %s/%s: %s", slug, job_id, e)
            return None

    title = (job.get("title") or "").strip()
    if not title:
        return None
    company = (job.get("company") or {}).get("name") or slug
    return RawPosting(
        company=str(company),
        title=title,
        source="greenhouse",
        url=job.get("absolute_url"),
        raw_text=html_to_text(job.get("content")),
        meta={"slug": slug, "ats_id": job.get("id"), "via": "search"},
    )


def fetch_lever_job(slug: str, job_id: str) -> RawPosting | None:
    # Lever's public JSON is a list; find the matching id
    jobs = ats.fetch_lever(slug)
    for j in jobs:
        if str(j.meta.get("ats_id") or "") == job_id or (j.url and job_id in (j.url or "")):
            j.meta["via"] = "search"
            return j
    # Fallback: construct posting page scrape-ish via API mode json item
    url = f"https://api.lever.co/v0/postings/{slug}/{job_id}"
    with _client() as client:
        try:
            r = client.get(url)
            if r.status_code != 200:
                return None
            job = r.json()
        except Exception:
            return None
    title = (job.get("text") or "").strip()
    if not title:
        return None
    body = job.get("descriptionPlain") or html_to_text(job.get("description"))
    return RawPosting(
        company=slug,
        title=title,
        source="lever",
        url=job.get("hostedUrl") or job.get("applyUrl"),
        raw_text=body or "",
        meta={"slug": slug, "ats_id": job_id, "via": "search"},
    )


def fetch_ashby_job(slug: str, job_id: str) -> RawPosting | None:
    jobs = ats.fetch_ashby(slug)
    for j in jobs:
        ats_id = str(j.meta.get("ats_id") or "")
        if ats_id == job_id or (j.url and job_id in (j.url or "")):
            j.meta["via"] = "search"
            return j
    return None


def fetch_from_job_url(url: str) -> RawPosting | None:
    parsed = parse_job_url(url)
    if not parsed:
        return None
    ats_name, slug, job_id = parsed
    if ats_name == "greenhouse":
        return fetch_greenhouse_job(slug, job_id)
    if ats_name == "lever":
        return fetch_lever_job(slug, job_id)
    if ats_name == "ashby":
        return fetch_ashby_job(slug, job_id)
    return None


def keyword_matching_from_board(ats_name: str, slug: str) -> list[RawPosting]:
    """Fetch a board discovered via search, keep only founding/confession matches."""
    if slug.lower() in SKIP_BOARD_SLUGS:
        logger.info("Skipping aggregator/mega board %s/%s", ats_name, slug)
        return []
    fetcher = ats.FETCHERS.get(ats_name)
    if not fetcher:
        return []
    jobs = fetcher(slug)
    kept: list[RawPosting] = []
    for j in jobs:
        if keyword_gate(j.title, j.raw_text):
            j.meta["via"] = "search_board_gate"
            kept.append(j)
    logger.info("%s/%s board gate: %d/%d kept", ats_name, slug, len(kept), len(jobs))
    return kept


def searxng_search_urls(queries: Iterable[str]) -> list[str]:
    settings = get_settings()
    base = settings.searxng_url.rstrip("/")
    urls: list[str] = []
    seen: set[str] = set()

    with _client() as client:
        try:
            probe = client.get(f"{base}/")
            if probe.status_code >= 500:
                logger.info("SearXNG unavailable (%s)", probe.status_code)
                return []
        except Exception as e:
            logger.info("SearXNG unreachable (%s)", e)
            return []

        for q in queries:
            try:
                r = client.get(
                    f"{base}/search",
                    params={"q": q, "format": "json"},
                    headers={"User-Agent": settings.user_agent},
                )
                if r.status_code != 200:
                    logger.warning("SearXNG query failed (%s): %s", r.status_code, q[:80])
                    continue
                for hit in r.json().get("results") or []:
                    u = (hit.get("url") or "").strip()
                    if not u or u in seen:
                        continue
                    seen.add(u)
                    urls.append(u)
                logger.info("search %r → cumulative %d urls", q[:50], len(urls))
            except Exception as e:
                logger.warning("SearXNG error on %r: %s", q[:50], e)
    return urls


def collect_from_urls(urls: Iterable[str]) -> tuple[list[RawPosting], list[dict]]:
    """
    Resolve search hit URLs into postings + any board slugs discovered.
    Returns (postings, [{slug, ats}, ...]).
    """
    postings: list[RawPosting] = []
    seen_hashes: set[str] = set()
    boards: set[tuple[str, str]] = set()

    for url in urls:
        job_ref = parse_job_url(url)
        if job_ref:
            p = fetch_from_job_url(url)
            if p and p.hash not in seen_hashes:
                # Search already targeted founding phrases; still gate titles/bodies
                # that are clearly off (e.g. random page)
                if keyword_gate(p.title, p.raw_text) or _title_looks_sales_founding(p.title):
                    seen_hashes.add(p.hash)
                    postings.append(p)
            boards.add((job_ref[1], job_ref[0]))  # slug, ats — order for upsert later
            continue

        board_ref = parse_board_url(url)
        if board_ref:
            ats_name, slug = board_ref
            boards.add((slug, ats_name))
            for p in keyword_matching_from_board(ats_name, slug):
                if p.hash not in seen_hashes:
                    seen_hashes.add(p.hash)
                    postings.append(p)

    slug_rows = [{"slug": s, "ats": a} for s, a in sorted(boards)]
    return postings, slug_rows


def _title_looks_sales_founding(title: str) -> bool:
    t = normalize_text(title)
    needles = [
        "founding",
        "first sales",
        "first ae",
        "founding ae",
        "founding account",
        "go to market lead",
        "gtm lead",
        "first bdr",
        "player coach",
    ]
    return any(n in t for n in needles)


def search_ats_postings() -> tuple[list[RawPosting], list[dict]]:
    """Primary intake: dork ATS hosts for founding / confession queries."""
    queries = list(ATS_SITE_DORKS)
    # A few bare phrase searches as backstop (less precise)
    for phrase in ROLE_QUERIES[:6]:
        queries.append(f'"{phrase}" (greenhouse OR lever OR ashby OR "account executive")')

    urls = searxng_search_urls(queries)
    logger.info("Search returned %d unique URLs", len(urls))
    return collect_from_urls(urls)


def poll_slugs_keyword_only(slugs: Iterable[dict]) -> list[RawPosting]:
    """
    Optional secondary path: known early-stage slugs, but NEVER dump the board —
    keep only keyword/confession matches.
    """
    out: list[RawPosting] = []
    seen: set[str] = set()
    for row in slugs:
        ats_name = (row.get("ats") or "").lower()
        slug = (row.get("slug") or "").strip()
        if not ats_name or not slug:
            continue
        for p in keyword_matching_from_board(ats_name, slug):
            if p.hash not in seen:
                seen.add(p.hash)
                out.append(p)
    return out
