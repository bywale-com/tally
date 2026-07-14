"""
Hacker News Algolia — free search for founding-sales signals.
Comments/stories often include direct apply links + founder context.
"""

from __future__ import annotations

import logging
import re

import httpx

from tally_scanner.config import get_settings
from tally_scanner.models import RawPosting
from tally_scanner.sources.search_queries import ROLE_QUERIES

logger = logging.getLogger(__name__)

ALGOLIA = "https://hn.algolia.com/api/v1/search"


def search_hn_founding_sales(*, hits_per_query: int = 20) -> list[RawPosting]:
    settings = get_settings()
    out: list[RawPosting] = []
    seen: set[str] = set()
    queries = ROLE_QUERIES[:8]

    with httpx.Client(timeout=settings.http_timeout, headers={"User-Agent": settings.user_agent}) as client:
        for q in queries:
            try:
                r = client.get(
                    ALGOLIA,
                    params={
                        "query": q,
                        "tags": "comment",
                        "hitsPerPage": hits_per_query,
                    },
                )
                r.raise_for_status()
                hits = r.json().get("hits") or []
            except Exception as e:
                logger.warning("HN Algolia failed for %r: %s", q, e)
                continue

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
                    meta={"via": "hn_algolia", "query": q, "object_id": hit.get("objectID")},
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
                    )
                ):
                    continue
                seen.add(p.hash)
                out.append(p)
            logger.info("HN %r → %d kept (cumulative %d)", q, len(hits), len(out))

    return out
