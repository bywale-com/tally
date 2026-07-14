"""
Daily pipeline orchestration.

cron → poll sources → regex filter → dedup (only NEW survivors) → one LLM batch → Notion

CRITICAL: never re-score a posting already in the database (scored or not for re-entry;
new rows only reach the scorer via scored=false).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from tally_scanner import db
from tally_scanner.filter import filter_posting
from tally_scanner.models import RawPosting
from tally_scanner.notion_sink import push_digest
from tally_scanner.scorer import score_all_unscored
from tally_scanner.sources.ats import poll_all_slugs
from tally_scanner.sources.discovery import discover_slugs

logger = logging.getLogger(__name__)


@dataclass
class RunStats:
    fetched: int = 0
    filter_passed: int = 0
    filter_rejected: int = 0
    new_survivors: int = 0
    duplicates: int = 0
    scored: int = 0
    notion_rows: int = 0
    slugs_discovered: int = 0
    errors: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return {
            "fetched": self.fetched,
            "filter_passed": self.filter_passed,
            "filter_rejected": self.filter_rejected,
            "new_survivors": self.new_survivors,
            "duplicates": self.duplicates,
            "scored": self.scored,
            "notion_rows": self.notion_rows,
            "slugs_discovered": self.slugs_discovered,
            "errors": self.errors,
        }


def ingest_raw(conn, postings: list[RawPosting], stats: RunStats) -> None:
    for p in postings:
        stats.fetched += 1
        result = filter_posting(p.title, p.raw_text)
        if not result.passed:
            stats.filter_rejected += 1
            continue
        stats.filter_passed += 1
        _, is_new = db.upsert_posting(
            conn,
            p,
            confession_hit=result.confession_hit,
            confession_quote=result.confession_quote,
        )
        if is_new:
            stats.new_survivors += 1
            logger.info(
                "NEW survivor: %s — %s [%s]%s",
                p.company,
                p.title,
                p.source,
                " ★ confession" if result.confession_hit else "",
            )
        else:
            stats.duplicates += 1


def run_daily(*, discover: bool = True, score: bool = True, write_notion: bool = True) -> dict[str, Any]:
    stats = RunStats()

    with db.connect() as conn:
        if discover:
            try:
                found = discover_slugs()
                for row in found:
                    db.upsert_company_slug(conn, row["slug"], row["ats"])
                stats.slugs_discovered = len(found)
                conn.commit()
            except Exception as e:
                stats.errors.append(f"discovery: {e}")
                logger.exception("Slug discovery failed")

        slugs = db.list_company_slugs(conn)
        logger.info("Polling %d company slugs", len(slugs))
        try:
            raw = poll_all_slugs(slugs)
        except Exception as e:
            stats.errors.append(f"poll: {e}")
            logger.exception("ATS poll failed")
            raw = []

        ingest_raw(conn, raw, stats)
        conn.commit()

        unscored = db.list_unscored(conn)
        logger.info("%d unscored survivors ready for LLM batch", len(unscored))

        scored_digest: dict[str, Any] = {
            "companies": [],
            "top3_lane_a_rationales": [],
            "unknowns_that_change_routing": [],
        }

        if score and unscored:
            try:
                scored_digest = score_all_unscored(unscored)
                # Dry-run stubs must NOT flip scored=true — real runs would never see them again.
                if scored_digest.get("_dry_run"):
                    logger.warning("Dry-run scorer output — not persisting scores or writing Notion")
                    stats.errors.append("dry-run: scores not persisted")
                else:
                    by_id = {c.get("posting_id"): c for c in scored_digest.get("companies") or []}
                    for p in unscored:
                        company_score = by_id.get(p["id"])
                        if not company_score:
                            # Model skipped — mark DQ so we never re-score forever
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
                logger.exception("Scoring failed — leaving rows unscored for retry")
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
