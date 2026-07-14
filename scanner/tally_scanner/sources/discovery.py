"""
SearXNG-powered ATS slug discovery via founding/confession dorks.
Optional — enable SearXNG compose profile. Failures are non-fatal.
Prefer sources.search_ingest.search_ats_postings for full search→job resolution.
"""

from __future__ import annotations

import logging
import re
from typing import Iterable

import httpx

from tally_scanner.config import get_settings
from tally_scanner.sources.search_queries import ATS_SITE_DORKS

logger = logging.getLogger(__name__)

PATTERNS = [
    (re.compile(r"boards\.greenhouse\.io/([a-zA-Z0-9_-]+)", re.I), "greenhouse"),
    (re.compile(r"job-boards\.greenhouse\.io/([a-zA-Z0-9_-]+)", re.I), "greenhouse"),
    (re.compile(r"jobs\.lever\.co/([a-zA-Z0-9_-]+)", re.I), "lever"),
    (re.compile(r"jobs\.ashbyhq\.com/([a-zA-Z0-9_-]+)", re.I), "ashby"),
]


def _extract_slugs(urls: Iterable[str]) -> set[tuple[str, str]]:
    found: set[tuple[str, str]] = set()
    for url in urls:
        for pattern, ats in PATTERNS:
            m = pattern.search(url)
            if m:
                slug = m.group(1).lower()
                if slug not in {"embed", "v1", "api", "jobs"}:
                    found.add((slug, ats))
    return found


def discover_slugs() -> list[dict]:
    settings = get_settings()
    base = settings.searxng_url.rstrip("/")
    discovered: set[tuple[str, str]] = set()

    with httpx.Client(timeout=settings.http_timeout, follow_redirects=True) as client:
        try:
            probe = client.get(f"{base}/")
            if probe.status_code >= 500:
                logger.info("SearXNG unavailable (%s) — skipping slug discovery", probe.status_code)
                return []
        except Exception as e:
            logger.info("SearXNG unreachable (%s) — skipping slug discovery", e)
            return []

        for q in ATS_SITE_DORKS:
            try:
                r = client.get(
                    f"{base}/search",
                    params={"q": q, "format": "json"},
                    headers={"User-Agent": settings.user_agent},
                )
                if r.status_code != 200:
                    logger.warning("SearXNG query failed (%s): %s", r.status_code, q)
                    continue
                data = r.json()
                urls = [hit.get("url", "") for hit in data.get("results") or []]
                batch = _extract_slugs(urls)
                logger.info("dork %r → %d slugs", q[:60], len(batch))
                discovered |= batch
            except Exception as e:
                logger.warning("SearXNG dork error: %s", e)

    return [{"slug": s, "ats": a} for s, a in sorted(discovered)]
