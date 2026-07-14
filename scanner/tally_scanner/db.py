"""Postgres access — postings, posting_sources, company_slugs."""

from __future__ import annotations

import json
import logging
from contextlib import contextmanager
from typing import Any, Iterator

import psycopg
from psycopg.rows import dict_row

from tally_scanner.config import get_settings
from tally_scanner.models import RawPosting

logger = logging.getLogger(__name__)


@contextmanager
def connect() -> Iterator[psycopg.Connection]:
    settings = get_settings()
    with psycopg.connect(settings.database_url, row_factory=dict_row) as conn:
        yield conn


def upsert_company_slug(conn: psycopg.Connection, slug: str, ats: str) -> None:
    conn.execute(
        """
        INSERT INTO company_slugs (slug, ats)
        VALUES (%s, %s)
        ON CONFLICT DO NOTHING
        """,
        (slug.strip().lower(), ats.strip().lower()),
    )


def list_company_slugs(conn: psycopg.Connection, ats: str | None = None) -> list[dict]:
    if ats:
        rows = conn.execute(
            "SELECT slug, ats, discovered FROM company_slugs WHERE ats = %s ORDER BY slug",
            (ats,),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT slug, ats, discovered FROM company_slugs ORDER BY ats, slug"
        ).fetchall()
    return list(rows)


def truncate_postings(conn: psycopg.Connection) -> None:
    """Clear posting tables for a clean pilot re-ingest."""
    conn.execute("TRUNCATE postings, posting_sources RESTART IDENTITY CASCADE")


def upsert_posting(
    conn: psycopg.Connection,
    posting: RawPosting,
    *,
    filter_status: str | None = None,
    filter_reason: str | None = None,
    filter_json: dict | None = None,
    confession_hit: bool = False,
    confession_quote: str | None = None,
) -> tuple[int, bool]:
    """
    Insert posting if new, always add posting_sources row.
    Returns (posting_id, is_new).
    Filter outs are stored too — filter_status tags in vs out.
    """
    h = posting.hash
    existing = conn.execute(
        "SELECT id, confession_hit FROM postings WHERE dedup_hash = %s",
        (h,),
    ).fetchone()

    if existing is None:
        row = conn.execute(
            """
            INSERT INTO postings (
              dedup_hash, company, title, source, url, raw_text,
              filter_status, filter_reason, filter_json,
              confession_hit, confession_quote, scored
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, FALSE)
            RETURNING id
            """,
            (
                h,
                posting.company.strip(),
                posting.title.strip(),
                posting.source,
                posting.url,
                posting.raw_text,
                filter_status,
                filter_reason,
                json.dumps(filter_json) if filter_json is not None else None,
                confession_hit,
                confession_quote,
            ),
        ).fetchone()
        posting_id = int(row["id"])
        is_new = True
    else:
        posting_id = int(existing["id"])
        is_new = False
        conn.execute(
            """
            UPDATE postings
            SET
              filter_status = COALESCE(%s, filter_status),
              filter_reason = COALESCE(%s, filter_reason),
              filter_json = COALESCE(%s::jsonb, filter_json),
              confession_hit = CASE WHEN %s THEN TRUE ELSE confession_hit END,
              confession_quote = CASE
                WHEN %s THEN COALESCE(%s, confession_quote)
                ELSE confession_quote
              END,
              url = COALESCE(%s, url),
              raw_text = COALESCE(%s, raw_text)
            WHERE id = %s
            """,
            (
                filter_status,
                filter_reason,
                json.dumps(filter_json) if filter_json is not None else None,
                confession_hit,
                confession_hit,
                confession_quote,
                posting.url,
                posting.raw_text,
                posting_id,
            ),
        )

    conn.execute(
        """
        INSERT INTO posting_sources (posting_id, source, url, raw_text)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (posting_id, source) DO UPDATE SET
          url = EXCLUDED.url,
          raw_text = COALESCE(EXCLUDED.raw_text, posting_sources.raw_text)
        """,
        (posting_id, posting.source, posting.url, posting.raw_text),
    )
    return posting_id, is_new


def list_unscored(conn: psycopg.Connection) -> list[dict[str, Any]]:
    """Filter INs with scored=false — ONLY these go to the scorer."""
    rows = conn.execute(
        """
        SELECT
          p.id, p.company, p.title, p.source, p.url, p.raw_text,
          p.filter_status, p.filter_reason,
          p.confession_hit, p.confession_quote, p.first_seen,
          COALESCE(
            (
              SELECT json_agg(json_build_object(
                'source', ps.source,
                'url', ps.url,
                'raw_text', ps.raw_text
              ))
              FROM posting_sources ps WHERE ps.posting_id = p.id
            ),
            '[]'::json
          ) AS sources
        FROM postings p
        WHERE p.scored = FALSE
          AND (p.filter_status = 'in' OR p.filter_status IS NULL)
        ORDER BY p.id
        """
    ).fetchall()
    out = []
    for r in rows:
        d = dict(r)
        if isinstance(d.get("sources"), str):
            d["sources"] = json.loads(d["sources"])
        out.append(d)
    return out


def mark_scored(
    conn: psycopg.Connection,
    posting_id: int,
    score_json: dict,
    lane: str,
) -> None:
    conn.execute(
        """
        UPDATE postings
        SET scored = TRUE, score_json = %s::jsonb, lane = %s
        WHERE id = %s
        """,
        (json.dumps(score_json), lane, posting_id),
    )


def already_scored_hashes(conn: psycopg.Connection) -> set[str]:
    rows = conn.execute("SELECT dedup_hash FROM postings WHERE scored = TRUE").fetchall()
    return {r["dedup_hash"] for r in rows}
