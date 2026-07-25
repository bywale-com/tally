"""LinkedIn crawl run control — Postgres + Trigger.dev HTTP API."""

from __future__ import annotations

import logging
import os
import re
import uuid
from typing import Any

import httpx

from tally_scanner.db import connect

logger = logging.getLogger(__name__)

JOB_ID_RE = re.compile(r"/jobs/view/[^/?#]*?(\d{6,})(?:[/?#]|$)", re.I)


def job_id_from_url(url: str) -> str | None:
    m = JOB_ID_RE.search(url or "")
    return m.group(1) if m else None


def _trigger_secret() -> str:
    from tally_scanner.config import get_settings

    return (get_settings().trigger_secret_key or os.environ.get("TRIGGER_SECRET_KEY") or "").strip()


def create_crawl_run(
    *,
    seed_url: str,
    max_hops: int = 0,
    max_pages: int = 1,
    coffee_every: int = 12,
) -> dict[str, Any]:
    """
    Job URL extract: one scrape of the seed guest job page.
    max_hops / max_pages kept for DB compat; Trigger ignores frontier follow.
    """
    seed = (seed_url or "").strip()
    if "linkedin.com/jobs/view/" not in seed.lower():
        raise ValueError("seed_url must be a LinkedIn /jobs/view/ URL")

    seed_job_id = job_id_from_url(seed) or f"seed-{uuid.uuid4().hex[:10]}"
    run_id = str(uuid.uuid4())
    # Force single-URL extract semantics
    max_hops = 0
    max_pages = 1

    with connect() as conn:
        conn.execute(
            """
            INSERT INTO crawl_runs (
              id, seed_url, seed_job_id, max_hops, max_pages, coffee_every, status
            ) VALUES (%s, %s, %s, %s, %s, %s, 'queued')
            """,
            (run_id, seed.split("?")[0], seed_job_id, max_hops, max_pages, coffee_every),
        )
        conn.commit()

    secret = _trigger_secret()
    trigger_run_id = None
    if secret:
        try:
            trigger_run_id = _trigger_orchestrator(
                secret=secret,
                run_id=run_id,
                seed_url=seed.split("?")[0],
                max_hops=max_hops,
                max_pages=max_pages,
                coffee_every=coffee_every,
            )
            with connect() as conn:
                conn.execute(
                    "UPDATE crawl_runs SET trigger_run_id = %s, status = 'running' WHERE id = %s",
                    (trigger_run_id, run_id),
                )
                conn.commit()
        except Exception:
            logger.exception("Failed to trigger orchestrator for run %s", run_id)
            with connect() as conn:
                conn.execute(
                    "UPDATE crawl_runs SET status = 'failed', fail_reason = %s, ended_at = now() WHERE id = %s",
                    ("trigger_failed", run_id),
                )
                conn.commit()
            raise
    else:
        logger.warning("TRIGGER_SECRET_KEY missing — crawl row created but not triggered")

    return {
        "id": run_id,
        "trigger_run_id": trigger_run_id,
        "seed_url": seed.split("?")[0],
        "seed_job_id": seed_job_id,
        "max_hops": max_hops,
        "max_pages": max_pages,
        "coffee_every": coffee_every,
        "status": "running" if trigger_run_id else "queued",
    }


def _trigger_orchestrator(
    *,
    secret: str,
    run_id: str,
    seed_url: str,
    max_hops: int,
    max_pages: int,
    coffee_every: int,
) -> str:
    url = "https://api.trigger.dev/api/v1/tasks/linkedin-crawl-orchestrator/trigger"
    payload = {
        "payload": {
            "runId": run_id,
            "seedUrl": seed_url,
            "maxHops": max_hops,
            "maxPages": max_pages,
            "coffeeEvery": coffee_every,
        },
        "options": {
            "tags": [f"crawl_run:{run_id}"],
        },
    }
    with httpx.Client(timeout=30.0) as client:
        r = client.post(
            url,
            headers={
                "Authorization": f"Bearer {secret}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if r.status_code >= 400:
            raise RuntimeError(f"Trigger.dev HTTP {r.status_code}: {r.text[:400]}")
        data = r.json()
    # Response shapes vary by API version
    run = data.get("id") or data.get("runId") or (data.get("run") or {}).get("id")
    if not run:
        raise RuntimeError(f"Unexpected Trigger.dev response: {data}")
    return str(run)


def get_crawl_run(run_id: str) -> dict[str, Any] | None:
    with connect() as conn:
        row = conn.execute(
            """
            SELECT id, trigger_run_id, seed_url, seed_job_id, max_hops, max_pages,
                   coffee_every, status, pages_fetched, fail_reason, metadata,
                   started_at, ended_at
            FROM crawl_runs WHERE id = %s
            """,
            (run_id,),
        ).fetchone()
    if not row:
        return None
    out = dict(row)
    for k in ("started_at", "ended_at"):
        if out.get(k) is not None:
            out[k] = out[k].isoformat()
    return out


def latest_active_crawl() -> dict[str, Any] | None:
    try:
        with connect() as conn:
            row = conn.execute(
                """
                SELECT id, trigger_run_id, seed_url, status, pages_fetched, max_pages, metadata
                FROM crawl_runs
                WHERE status IN ('queued', 'running', 'waiting')
                ORDER BY started_at DESC
                LIMIT 1
                """
            ).fetchone()
    except Exception:
        logger.exception("latest_active_crawl failed")
        return None
    if not row:
        return None
    return dict(row)

