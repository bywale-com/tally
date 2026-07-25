"""HTTP entrypoint: pipeline run + Indeed search for the Tally enrichment UI."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

app = FastAPI(title="Tally Scanner", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    discover: bool = True
    score: bool = True
    write_notion: bool = False
    limit: int | None = None
    fresh: bool = False
    include_slug_boards: bool = True


class RunResponse(BaseModel):
    ok: bool = True
    result: dict = Field(default_factory=dict)


class IndeedSearchRequest(BaseModel):
    query: str = ""
    location: str = ""
    country: str = "Canada"
    radius: int | None = 25
    results_wanted: int = 25
    match_mode: str = "broad"
    fromage_days: int | None = None
    salary_min: int | None = None
    url: str | None = None
    allow_fixture: bool = True


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/run", response_model=RunResponse)
def run(
    body: RunRequest | None = None,
    x_scanner_token: str | None = Header(default=None),
) -> RunResponse:
    """
    Trigger one daily pipeline run.
    Optional header X-Scanner-Token if SCANNER_API_TOKEN is set in env (future).
    """
    req = body or RunRequest()
    try:
        from tally_scanner.pipeline import run_daily

        result = run_daily(
            discover=req.discover,
            score=req.score,
            write_notion=req.write_notion,
            limit=req.limit,
            fresh=req.fresh,
            include_slug_boards=req.include_slug_boards,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return RunResponse(ok=True, result=result)


@app.post("/indeed/search")
def indeed_search(body: IndeedSearchRequest) -> dict[str, Any]:
    """
    Live Indeed search for enrichment trigger Run / Pull.
    Returns Tower-style { items, itemCount, pulledAt } plus transport metadata.
    """
    from tally_scanner.sources.indeed import (
        IndeedSearchCriteria,
        search_from_url,
        search_indeed,
    )

    mode = body.match_mode if body.match_mode in ("broad", "phrase", "boolean") else "broad"

    try:
        if body.url:
            result = search_from_url(
                body.url,
                results_wanted=body.results_wanted,
                allow_fixture=body.allow_fixture,
            )
        else:
            if not (body.query or "").strip():
                raise HTTPException(status_code=400, detail="query or url required")
            criteria = IndeedSearchCriteria(
                query=body.query,
                location=body.location,
                country=body.country,
                radius=body.radius,
                results_wanted=body.results_wanted,
                match_mode=mode,
                fromage_days=body.fromage_days,
                salary_min=body.salary_min,
            )
            result = search_indeed(criteria, allow_fixture=body.allow_fixture)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    items: list[dict[str, Any]] = []
    for p in result.postings:
        meta = p.meta or {}
        items.append(
            {
                "company": p.company,
                "title": p.title,
                "url": p.url,
                "source": p.source or "indeed",
                "raw_text": (p.raw_text or "")[:2000],
                "jk": meta.get("jk"),
                "location": meta.get("location") or body.location,
                "posted_at": meta.get("posted_at"),
            }
        )

    return {
        "ok": not result.blocked,
        "blocked": result.blocked,
        "transport": result.transport,
        "error": result.error,
        "items": items,
        "itemCount": len(items),
        "pulledAt": datetime.now(timezone.utc).isoformat(),
        "criteria": result.criteria.to_dict() if result.criteria else None,
        "raw_job_count": result.raw_job_count,
        "search_url": result.search_url,
        "raw_markdown": (result.raw_markdown or "")[:12000] or None,
    }


class LinkedInCrawlStartRequest(BaseModel):
    seed_url: str
    # Kept for API compat; job URL extract always uses one scrape (no graph follow).
    max_hops: int = 0
    max_pages: int = 1
    coffee_every: int = 12


@app.post("/crawl/linkedin/start")
def crawl_linkedin_start(body: LinkedInCrawlStartRequest) -> dict[str, Any]:
    """Create crawl_runs row and trigger linkedin-crawl-orchestrator on Trigger.dev."""
    from tally_scanner.crawl_api import create_crawl_run

    try:
        return {"ok": True, "run": create_crawl_run(
            seed_url=body.seed_url,
            max_hops=body.max_hops,
            max_pages=body.max_pages,
            coffee_every=body.coffee_every,
        )}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/crawl/linkedin/runs/{run_id}")
def crawl_linkedin_run(run_id: str) -> dict[str, Any]:
    from tally_scanner.crawl_api import get_crawl_run

    row = get_crawl_run(run_id)
    if not row:
        raise HTTPException(status_code=404, detail="run not found")
    return {"ok": True, "run": row}


@app.get("/crawl/linkedin/active")
def crawl_linkedin_active() -> dict[str, Any]:
    from tally_scanner.crawl_api import latest_active_crawl

    row = latest_active_crawl()
    return {"ok": True, "run": row}


class CrawlFetchRequest(BaseModel):
    url: str
    timeout_ms: int = Field(default=90_000, ge=5_000, le=180_000)


@app.post("/crawl/fetch")
def crawl_fetch(body: CrawlFetchRequest) -> dict[str, Any]:
    """
    StealthyFetcher HTML fetch for LinkedIn guest pages (and other blocked URLs).
    Used by Trigger.dev crawl tasks via SCANNER_URL — Scrapling cannot run in Node.
    """
    from tally_scanner.stealthy_fetch import fetch_stealthy

    result = fetch_stealthy(body.url, timeout_ms=body.timeout_ms)
    return {
        "ok": result["ok"],
        "status_code": result["status_code"],
        "html": result["html"],
        "error": result.get("error") or "",
        "transport": result.get("transport") or "stealthy",
        "final_url": result.get("final_url") or body.url,
    }

