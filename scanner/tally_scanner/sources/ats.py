from __future__ import annotations

import logging
from typing import Iterable

import httpx

from tally_scanner.config import get_settings
from tally_scanner.models import RawPosting
from tally_scanner.sources.html_utils import html_to_text

logger = logging.getLogger(__name__)


def _client() -> httpx.Client:
    s = get_settings()
    return httpx.Client(
        timeout=s.http_timeout,
        headers={"User-Agent": s.user_agent},
        follow_redirects=True,
    )


def fetch_greenhouse(slug: str) -> list[RawPosting]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true"
    out: list[RawPosting] = []
    with _client() as client:
        try:
            r = client.get(url)
            if r.status_code == 404:
                logger.debug("greenhouse slug not found: %s", slug)
                return []
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            logger.warning("greenhouse fetch failed %s: %s", slug, e)
            return []

    company = data.get("name") or slug
    for job in data.get("jobs") or []:
        title = (job.get("title") or "").strip()
        if not title:
            continue
        body = html_to_text(job.get("content"))
        job_url = job.get("absolute_url") or ""
        out.append(
            RawPosting(
                company=company,
                title=title,
                source="greenhouse",
                url=job_url,
                raw_text=body,
                meta={"slug": slug, "ats_id": job.get("id")},
            )
        )
    return out


def fetch_lever(slug: str) -> list[RawPosting]:
    url = f"https://api.lever.co/v0/postings/{slug}?mode=json"
    out: list[RawPosting] = []
    with _client() as client:
        try:
            r = client.get(url)
            if r.status_code == 404:
                logger.debug("lever slug not found: %s", slug)
                return []
            r.raise_for_status()
            jobs = r.json()
            if not isinstance(jobs, list):
                return []
        except Exception as e:
            logger.warning("lever fetch failed %s: %s", slug, e)
            return []

    for job in jobs:
        title = (job.get("text") or "").strip()
        if not title:
            continue
        body = job.get("descriptionPlain") or html_to_text(job.get("description"))
        out.append(
            RawPosting(
                company=slug,
                title=title,
                source="lever",
                url=job.get("hostedUrl") or job.get("applyUrl"),
                raw_text=body or "",
                meta={"slug": slug, "ats_id": job.get("id")},
            )
        )
    return out


def fetch_ashby(slug: str) -> list[RawPosting]:
    url = f"https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true"
    out: list[RawPosting] = []
    with _client() as client:
        try:
            r = client.get(url)
            if r.status_code == 404:
                logger.debug("ashby slug not found: %s", slug)
                return []
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            logger.warning("ashby fetch failed %s: %s", slug, e)
            return []

    for job in data.get("jobs") or []:
        title = (job.get("title") or "").strip()
        if not title:
            continue
        body = html_to_text(job.get("descriptionHtml")) or (job.get("descriptionPlain") or "")
        company = (data.get("jobsBoardName") or slug)
        # Prefer department/team context if present
        out.append(
            RawPosting(
                company=str(company),
                title=title,
                source="ashby",
                url=job.get("jobUrl") or job.get("applyUrl"),
                raw_text=body,
                meta={
                    "slug": slug,
                    "ats_id": job.get("id"),
                    "compensation": job.get("compensation"),
                },
            )
        )
    return out


FETCHERS = {
    "greenhouse": fetch_greenhouse,
    "lever": fetch_lever,
    "ashby": fetch_ashby,
}


def poll_all_slugs(slugs: Iterable[dict]) -> list[RawPosting]:
    """slugs: iterable of {slug, ats}."""
    results: list[RawPosting] = []
    for row in slugs:
        ats = (row.get("ats") or "").lower()
        slug = (row.get("slug") or "").strip()
        fetcher = FETCHERS.get(ats)
        if not fetcher or not slug:
            continue
        jobs = fetcher(slug)
        logger.info("%s/%s → %d jobs", ats, slug, len(jobs))
        results.extend(jobs)
    return results
