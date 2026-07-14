"""
Daily pipeline orchestration.

SEARCH-FIRST:
  job-board queries (founding AE / confession phrases)
    → resolve ATS URLs / keyword-gated boards / HN
    → AI triage (tag in|out, keep all)
    → dedup Postgres
    → score filter INs (optional)
    → Postgres results

CRITICAL: never re-score a posting already scored.
Never dump mega career boards as the primary intake.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from tally_scanner import db
from tally_scanner.ai_filter import filter_batch
from tally_scanner.config import get_settings
from tally_scanner.models import RawPosting
from tally_scanner.notion_sink import push_digest
from tally_scanner.scorer import score_all_unscored
from tally_scanner.sources.hn import search_hn_founding_sales
from tally_scanner.sources.search_ingest import poll_slugs_keyword_only, search_ats_postings

logger = logging.getLogger(__name__)


@dataclass
class RunStats:
    fetched: int = 0
    filter_passed: int = 0
    filter_rejected: int = 0
    new_rows: int = 0
    duplicates: int = 0
    scored: int = 0
    notion_rows: int = 0
    search_hits: int = 0
    slugs_discovered: int = 0
    errors: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return {
            "fetched": self.fetched,
            "filter_passed": self.filter_passed,
            "filter_rejected": self.filter_rejected,
            "new_rows": self.new_rows,
            "duplicates": self.duplicates,
            "scored": self.scored,
            "notion_rows": self.notion_rows,
            "search_hits": self.search_hits,
            "slugs_discovered": self.slugs_discovered,
            "errors": self.errors,
        }


def _dedupe_raw(postings: list[RawPosting]) -> list[RawPosting]:
    seen: set[str] = set()
    out: list[RawPosting] = []
    for p in postings:
        if p.hash in seen:
            continue
        seen.add(p.hash)
        out.append(p)
    return out


def ingest_raw(conn, postings: list[RawPosting], stats: RunStats) -> None:
    """AI-filter every posting and persist all with filter_status in|out."""
    if not postings:
        return

    settings = get_settings()
    batch_size = max(1, settings.filter_batch_size)

    for offset in range(0, len(postings), batch_size):
        chunk = postings[offset : offset + batch_size]
        decisions = filter_batch(chunk)

        for i, p in enumerate(chunk):
            stats.fetched += 1
            decision = decisions.get(i)
            if decision is None:
                stats.errors.append(f"filter missing for {p.company}/{p.title}")
                continue

            if decision.filter_status == "in":
                stats.filter_passed += 1
            else:
                stats.filter_rejected += 1

            _, is_new = db.upsert_posting(
                conn,
                p,
                filter_status=decision.filter_status,
                filter_reason=decision.filter_reason,
                filter_json=decision.as_json(),
                confession_hit=decision.confession_hit,
                confession_quote=decision.confession_quote,
            )
            if is_new:
                stats.new_rows += 1
            else:
                stats.duplicates += 1

            logger.info(
                "%s %s — %s [%s] (%s)",
                decision.filter_status.upper(),
                p.company,
                p.title[:80],
                p.source,
                (decision.filter_reason or "")[:120],
            )


def collect_search_postings(*, include_known_slugs: bool = True) -> tuple[list[RawPosting], list[dict], RunStats]:
    """Gather candidates from search (ATS dorks + HN) and optional keyword-gated slug boards."""
    stats = RunStats()
    raw: list[RawPosting] = []
    discovered_slugs: list[dict] = []

    try:
        ats_hits, discovered_slugs = search_ats_postings()
        raw.extend(ats_hits)
        stats.search_hits += len(ats_hits)
        stats.slugs_discovered = len(discovered_slugs)
        logger.info("ATS search → %d postings, %d board slugs", len(ats_hits), len(discovered_slugs))
    except Exception as e:
        stats.errors.append(f"ats_search: {e}")
        logger.exception("ATS search failed")

    try:
        hn = search_hn_founding_sales()
        raw.extend(hn)
        stats.search_hits += len(hn)
        logger.info("HN search → %d postings", len(hn))
    except Exception as e:
        stats.errors.append(f"hn_search: {e}")
        logger.exception("HN search failed")

    if include_known_slugs:
        # Keyword-gate only — never full board dumps
        pass  # slug list applied in run_daily with DB context

    return _dedupe_raw(raw), discovered_slugs, stats


def run_daily(
    *,
    discover: bool = True,
    score: bool = True,
    write_notion: bool = False,
    limit: int | None = None,
    fresh: bool = False,
    include_slug_boards: bool = True,
) -> dict[str, Any]:
    """
    discover=True: run SearXNG/HN search intake (primary).
    include_slug_boards: also keyword-gate any slugs already in company_slugs
      (discovery appends early-stage boards found via search — not mega dumps).
    """
    stats = RunStats()

    with db.connect() as conn:
        if fresh:
            logger.warning("TRUNCATE postings + posting_sources for fresh run")
            db.truncate_postings(conn)
            conn.commit()

        raw: list[RawPosting] = []

        if discover:
            search_raw, discovered, search_stats = collect_search_postings()
            stats.search_hits = search_stats.search_hits
            stats.slugs_discovered = search_stats.slugs_discovered
            stats.errors.extend(search_stats.errors)
            raw.extend(search_raw)
            for row in discovered:
                db.upsert_company_slug(conn, row["slug"], row["ats"])
            conn.commit()

        if include_slug_boards:
            slugs = db.list_company_slugs(conn)
            if slugs:
                logger.info("Keyword-gating %d known board slugs (no full dumps)", len(slugs))
                try:
                    gated = poll_slugs_keyword_only(slugs)
                    raw.extend(gated)
                except Exception as e:
                    stats.errors.append(f"slug_gate: {e}")
                    logger.exception("Slug keyword gate failed")

        raw = _dedupe_raw(raw)
        if limit is not None and limit >= 0:
            raw = raw[:limit]
            logger.info("Limited to %d postings for this run", len(raw))

        logger.info("Candidates entering AI triage: %d", len(raw))

        try:
            ingest_raw(conn, raw, stats)
            conn.commit()
        except Exception as e:
            stats.errors.append(f"filter/ingest: {e}")
            logger.exception("AI filter / ingest failed")
            conn.rollback()
            raise

        unscored = db.list_unscored(conn)
        logger.info("%d unscored filter-INs ready for LLM batch", len(unscored))

        scored_digest: dict[str, Any] = {
            "companies": [],
            "top3_lane_a_rationales": [],
            "unknowns_that_change_routing": [],
        }

        if score and unscored:
            try:
                scored_digest = score_all_unscored(unscored)
                if scored_digest.get("_dry_run"):
                    logger.warning("Dry-run scorer — not persisting scores")
                    stats.errors.append("dry-run: scores not persisted")
                else:
                    by_id = {c.get("posting_id"): c for c in scored_digest.get("companies") or []}
                    for p in unscored:
                        company_score = by_id.get(p["id"])
                        if not company_score:
                            company_score = {
                                "posting_id": p["id"],
                                "lane": "DQ",
                                "lane_reason": "missing from scorer response",
                                "company": p["company"],
                                "role_title": p["title"],
                            }
                            scored_digest["companies"].append(company_score)
                        lane = company_score.get("lane") or "DQ"
                        db.mark_scored(conn, p["id"], company_score, lane)
                        stats.scored += 1
                    conn.commit()
            except Exception as e:
                stats.errors.append(f"scorer: {e}")
                logger.exception("Scoring failed")
                conn.rollback()
                raise

        if (
            write_notion
            and scored_digest.get("companies")
            and not scored_digest.get("_dry_run")
            and stats.scored
        ):
            meta = {int(p["id"]): p for p in unscored}
            try:
                page_ids = push_digest(scored_digest, meta)
                stats.notion_rows = len(page_ids)
            except Exception as e:
                stats.errors.append(f"notion: {e}")
                logger.exception("Notion write failed")

    return {
        "stats": stats.as_dict(),
        "digest": {
            "companies_count": len(scored_digest.get("companies") or []),
            "top3": scored_digest.get("top3_lane_a_rationales") or [],
            "unknowns": scored_digest.get("unknowns_that_change_routing") or [],
        },
    }
