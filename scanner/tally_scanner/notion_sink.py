"""Notion sink — one row per newly scored company. Does not write into the SOPs database."""

from __future__ import annotations

import logging
from typing import Any

from notion_client import Client

from tally_scanner.config import get_settings

logger = logging.getLogger(__name__)

# Parent page from handoff §6
DEFAULT_PARENT = "37272d09-0a44-80ec-a852-000b049519b1"


def _client() -> Client:
    settings = get_settings()
    if not settings.notion_token:
        raise RuntimeError("NOTION_TOKEN is not set")
    return Client(auth=settings.notion_token)


def ensure_database() -> str:
    """
    Return NOTION_DATABASE_ID if set; otherwise create a new scanner results DB
    under the handoff parent page and return its id (caller should persist it).
    """
    settings = get_settings()
    if settings.notion_database_id:
        return settings.notion_database_id

    notion = _client()
    parent_id = settings.notion_parent_page_id or DEFAULT_PARENT
    # Notion IDs may be hyphenated UUID
    db = notion.databases.create(
        parent={"type": "page_id", "page_id": parent_id},
        title=[{"type": "text", "text": {"content": "Tally Scanner Results"}}],
        properties={
            "Company": {"title": {}},
            "Posting URL": {"url": {}},
            "Role title": {"rich_text": {}},
            "Lane": {
                "select": {
                    "options": [
                        {"name": "A", "color": "green"},
                        {"name": "B", "color": "yellow"},
                        {"name": "DQ", "color": "red"},
                    ]
                }
            },
            "Lane reason": {"rich_text": {}},
            "ACV": {"rich_text": {}},
            "ACV numeric": {"number": {"format": "dollar"}},
            "Confession quote": {"rich_text": {}},
            "Funding/stage": {"rich_text": {}},
            "Headcount": {"rich_text": {}},
            "Founder-led": {"checkbox": {}},
            "Buyer": {"rich_text": {}},
            "Phone-reachable": {
                "select": {
                    "options": [
                        {"name": "yes", "color": "green"},
                        {"name": "no", "color": "red"},
                        {"name": "unknown", "color": "gray"},
                    ]
                }
            },
            "Sales cycle": {"rich_text": {}},
            "Pipeline spend": {"rich_text": {}},
            "Delivery risk": {"rich_text": {}},
            "First seen": {"date": {}},
            "Source(s)": {"rich_text": {}},
            "Unknowns": {"rich_text": {}},
            "Posting ID": {"number": {}},
        },
    )
    db_id = db["id"]
    logger.warning(
        "Created Notion database %s — set NOTION_DATABASE_ID=%s in .env",
        db_id,
        db_id,
    )
    return db_id


def _rt(text: str | None) -> list[dict]:
    if not text:
        return []
    return [{"type": "text", "text": {"content": str(text)[:2000]}}]


def write_scored_company(
    db_id: str,
    company: dict[str, Any],
    *,
    first_seen: str | None = None,
    unknowns: str | None = None,
) -> str:
    """Insert one Notion row. Returns page id."""
    notion = _client()
    phone = (company.get("phone_reachable") or "unknown").lower()
    if phone not in {"yes", "no", "unknown"}:
        phone = "unknown"
    lane = company.get("lane") or "DQ"
    if lane not in {"A", "B", "DQ"}:
        lane = "DQ"

    sources = company.get("sources") or []
    if isinstance(sources, list):
        sources_str = ", ".join(str(s) for s in sources)
    else:
        sources_str = str(sources)

    props: dict[str, Any] = {
        "Company": {"title": _rt(company.get("company") or "UNKNOWN")},
        "Role title": {"rich_text": _rt(company.get("role_title"))},
        "Lane": {"select": {"name": lane}},
        "Lane reason": {"rich_text": _rt(company.get("lane_reason"))},
        "ACV": {"rich_text": _rt(company.get("acv"))},
        "Confession quote": {"rich_text": _rt(company.get("pipeline_confession"))},
        "Funding/stage": {"rich_text": _rt(company.get("funding_stage"))},
        "Headcount": {"rich_text": _rt(str(company.get("headcount")) if company.get("headcount") is not None else None)},
        "Founder-led": {"checkbox": bool(company.get("founder_led") is True)},
        "Buyer": {"rich_text": _rt(company.get("buyer"))},
        "Phone-reachable": {"select": {"name": phone}},
        "Sales cycle": {"rich_text": _rt(company.get("sales_cycle"))},
        "Pipeline spend": {"rich_text": _rt(company.get("pipeline_spend"))},
        "Delivery risk": {"rich_text": _rt(company.get("delivery_risk"))},
        "Source(s)": {"rich_text": _rt(sources_str)},
        "Unknowns": {"rich_text": _rt(unknowns)},
    }
    url = company.get("posting_url")
    if url and url != "UNKNOWN" and str(url).startswith("http"):
        props["Posting URL"] = {"url": url}
    if company.get("acv_numeric") is not None:
        try:
            props["ACV numeric"] = {"number": float(company["acv_numeric"])}
        except (TypeError, ValueError):
            pass
    if company.get("posting_id") is not None:
        props["Posting ID"] = {"number": int(company["posting_id"])}
    if first_seen:
        props["First seen"] = {"date": {"start": first_seen[:10]}}

    page = notion.pages.create(parent={"database_id": db_id}, properties=props)
    return page["id"]


def push_digest(scored: dict[str, Any], posting_meta: dict[int, dict]) -> list[str]:
    """
    Write all newly scored companies to Notion.
    posting_meta: posting_id -> {first_seen, ...}
    """
    settings = get_settings()
    if settings.scanner_dry_run or not settings.notion_token:
        logger.warning("Skipping Notion write (dry-run or missing NOTION_TOKEN)")
        return []

    db_id = ensure_database()
    unknowns_by_id: dict[int, list[str]] = {}
    for u in scored.get("unknowns_that_change_routing") or []:
        pid = u.get("posting_id")
        if pid is None:
            continue
        unknowns_by_id.setdefault(int(pid), []).append(
            f"{u.get('unknown_field')}: {u.get('why_it_matters')}"
        )

    page_ids = []
    for c in scored.get("companies") or []:
        pid = c.get("posting_id")
        meta = posting_meta.get(int(pid), {}) if pid is not None else {}
        first_seen = None
        if meta.get("first_seen"):
            first_seen = str(meta["first_seen"])
        unk = "; ".join(unknowns_by_id.get(int(pid), [])) if pid is not None else None
        page_ids.append(write_scored_company(db_id, c, first_seen=first_seen, unknowns=unk or None))
    logger.info("Wrote %d Notion rows", len(page_ids))
    return page_ids
