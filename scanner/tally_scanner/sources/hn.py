"""
Hacker News Algolia — free search for founding-sales signals.
Comments/stories often include direct apply links + founder context.
"""

from __future__ import annotations

import logging
import re
import time

import httpx

from tally_scanner.config import get_settings
from tally_scanner.models import RawPosting
from tally_scanner.sources.search_queries import ROLE_QUERIES

logger = logging.getLogger(__name__)

ALGOLIA_BY_DATE = "https://hn.algolia.com/api/v1/search_by_date"

# Keep HN ingest inside the deep-screener recency window by default.
DEFAULT_MAX_AGE_DAYS = 60


def search_hn_founding_sales(
    *,
    hits_per_query: int = 30,
    max_age_days: int = DEFAULT_MAX_AGE_DAYS,
) -> list[RawPosting]:
    settings = get_settings()
    out: list[RawPosting] = []
    seen: set[str] = set()
    queries = ROLE_QUERIES[:8]
    created_after = int(time.time()) - max(1, max_age_days) * 86400

    with httpx.Client(timeout=settings.http_timeout, headers={"User-Agent": settings.user_agent}) as client:
        for q in queries:
            try:
                r = client.get(
                    ALGOLIA_BY_DATE,
                    params={
                        "query": q,
                        "tags": "comment",
                        "hitsPerPage": hits_per_query,
                        "numericFilters": f"created_at_i>{created_after}",
                    },
                )
                r.raise_for_status()
                hits = r.json().get("hits") or []
            except Exception as e:
                logger.warning("HN Algolia failed for %r: %s", q, e)
                continue

            kept = 0
            for hit in hits:
                text = (hit.get("comment_text") or hit.get("story_text") or "").strip()
                if not text:
                    continue
                # Strip simple HTML
                text_plain = re.sub(r"<[^>]+>", " ", text)
                text_plain = re.sub(r"\s+", " ", text_plain).strip()
                title = f"HN: {q}"
                # Prefer a company-ish first line
                first = text_plain[:120]
                company = "hackernews"
                url = (
                    f"https://news.ycombinator.com/item?id={hit.get('objectID')}"
                    if hit.get("objectID")
                    else None
                )
                p = RawPosting(
                    company=company,
                    title=f"{title} — {first}",
                    source="hackernews",
                    url=url,
                    raw_text=text_plain[:8000],
                    meta={
                        "via": "hn_algolia_by_date",
                        "query": q,
                        "object_id": hit.get("objectID"),
                        "created_at_i": hit.get("created_at_i"),
                    },
                )
                if p.hash in seen:
                    continue
                # Require some sales founding signal in body
                low = text_plain.lower()
                if not any(
                    s in low
                    for s in (
                        "founding",
                        "first sales",
                        "account executive",
                        "self-sourced",
                        "no sdr",
                        "first ae",
                        "founding gtm",
                        "founding sales",
                    )
                ):
                    continue
                seen.add(p.hash)
                out.append(p)
                kept += 1
            logger.info("HN %r → %d hits / %d kept (cumulative %d)", q, len(hits), kept, len(out))

    return out
