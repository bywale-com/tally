"""Postgres access — postings, posting_sources, company_slugs."""

from __future__ import annotations

import json
import logging
from contextlib import contextmanager
from typing import Any, Iterator

import psycopg
from psycopg.rows import dict_row

from tally_scanner.config import get_settings
from tally_scanner.models import RawPosting, dedup_hash

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


def upsert_posting(
    conn: psycopg.Connection,
    posting: RawPosting,
    *,
    confession_hit: bool = False,
    confession_quote: str | None = None,
) -> tuple[int, bool]:
    """
    Insert posting if new, always add posting_sources row.
    Returns (posting_id, is_new).
    is_new=True only when this company+title was never seen — those go to the scorer.
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
              confession_hit, confession_quote, scored
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, FALSE)
            RETURNING id
            """,
            (
                h,
                posting.company.strip(),
                posting.title.strip(),
                posting.source,
                posting.url,
                posting.raw_text,
                confession_hit,
                confession_quote,
            ),
        ).fetchone()
        posting_id = int(row["id"])
        is_new = True
    else:
        posting_id = int(existing["id"])
        is_new = False
        # Upgrade confession flag if a later source hits
        if confession_hit and not existing["confession_hit"]:
            conn.execute(
                """
                UPDATE postings
                SET confession_hit = TRUE, confession_quote = COALESCE(%s, confession_quote)
                WHERE id = %s
                """,
                (confession_quote, posting_id),
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
    """Survivors with scored=false — ONLY these go to the LLM."""
    rows = conn.execute(
        """
        SELECT
          p.id, p.company, p.title, p.source, p.url, p.raw_text,
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
