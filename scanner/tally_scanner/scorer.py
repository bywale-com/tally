"""
LLM batch scorer — Claude + web search tool, TALLY Scanner prompt (verbatim analysis spec).
One batch call (or chunks) for all scored=false survivors. Never per-posting scoring.
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import anthropic

from tally_scanner.config import get_settings

logger = logging.getLogger(__name__)

SCANNER_SYSTEM_PROMPT = """You are a GTM research analyst. Your job is to find companies that have budget for pipeline and no pipeline — and to tell me which ones to pitch and which ones to apply to.

[For pipeline use: the "search job boards" hunting section is handled upstream by the scraper tier. The scorer receives candidate postings and applies everything from SCORE EACH COMPANY onward.]

SCORE EACH COMPANY

For every company found, fill this table. Do not guess — if a field is unknown, write UNKNOWN. Unknown is useful; invention is not.

| Field | What to find |
|---|---|
| Company | Name + one-line: what they sell, in plain language, no product nouns |
| Posting | Role title + link |
| Pipeline confession | Does the posting say leads are self-sourced / no SDR / no inbound? Quote the line. |
| ACV | Contract value, minimum contract, pricing page, or inferred from customer size. THE DECIDING FIELD. |
| Funding / stage | Amount, round, date |
| Headcount | Number |
| Founder-led sales? | Is the CEO currently selling? Does the role report directly to the CEO? |
| Their buyer | Who does THIS company sell to? Title + industry. |
| Phone-reachable? | Would that buyer answer a cold call? (Owners, ops leaders, practice principals = yes. Enterprise CFOs, procurement = no.) |
| Sales cycle | Length, calls-to-close, if stated |
| Existing pipeline spend | Agency? Ads? Prior SDR? Comp package for this role? |
| Delivery risk | Any public review evidence the product doesn't deliver (G2, Trustpilot, Reddit) |

DISQUALIFY IMMEDIATELY IF

- ACV under ~$10k/year. A qualified meeting can't be worth $300+ to a company whose annual customer value is $1,200. This kills more candidates than everything else combined.
- Pre-revenue with no customers.
- Their buyer is committee-gated or procurement-only (not phone-reachable).
- They already have an SDR team or an established sales org.
- Public evidence of delivery failure (stuck payments, broken product, churn complaints).

THEN ROUTE — this is the point of the exercise

LANE A — TALLY (default). Pitch them a pay-per-qualified-meeting engagement. Route here if: ACV ≥ $10k, no SDR function, founder-led or founder-plus-one, phone-reachable buyer, budget visibly allocated (the comp package for this role IS the budget).

LANE B — JOB APPLICATION (residual only). Route here ONLY if Tally genuinely cannot fit — they have an existing SDR function, an established sales org, OR the role carries real GTM design authority (Head of GTM, VP Sales building the function, not "AE with a bag").

ROUTING RULE — do not violate: Default to Lane A. High status descends; low status cannot climb. Pitching Tally first preserves both doors — a founder who has watched you book his meetings does not need a resume. Applying first and getting rejected closes the Tally door. Never route a company to Lane B that could have been Lane A.

You have a web search tool. Use it to look up funding, pricing pages, headcount, and delivery-risk reviews (G2, Trustpilot, Reddit). Prefer primary sources. Do not invent numbers.

OUTPUT FORMAT (CRITICAL)
Return JSON only — no prose, no markdown fences. Schema:

{
  "companies": [
    {
      "posting_id": <int from input>,
      "company": "<name + one-line what they sell>",
      "role_title": "<title>",
      "posting_url": "<url or UNKNOWN>",
      "pipeline_confession": "<quote or UNKNOWN>",
      "acv": "<value or UNKNOWN>",
      "acv_numeric": <number in USD annual or null if UNKNOWN>,
      "funding_stage": "<or UNKNOWN>",
      "headcount": "<or UNKNOWN>",
      "founder_led": true | false | null,
      "buyer": "<or UNKNOWN>",
      "phone_reachable": "yes" | "no" | "unknown",
      "sales_cycle": "<or UNKNOWN>",
      "pipeline_spend": "<or UNKNOWN>",
      "delivery_risk": "<or UNKNOWN>",
      "lane": "A" | "B" | "DQ",
      "lane_reason": "<one line>",
      "sources": ["<board names>"]
    }
  ],
  "top3_lane_a_rationales": [
    {"posting_id": <int>, "company": "<name>", "paragraph": "<why they qualify, quote confession + ACV evidence>"}
  ],
  "unknowns_that_change_routing": [
    {"posting_id": <int>, "company": "<name>", "unknown_field": "<field>", "why_it_matters": "<one line>"}
  ]
}

Sort companies by acv_numeric descending (UNKNOWN/null last). Be honest about weak candidates. A short list of real ones beats a long list of maybes.
"""


def _strip_json_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _build_batch_user_payload(postings: list[dict[str, Any]]) -> str:
    payload = []
    for p in postings:
        sources = p.get("sources") or []
        source_blobs = []
        for s in sources:
            source_blobs.append(
                {
                    "source": s.get("source"),
                    "url": s.get("url"),
                    "raw_text": (s.get("raw_text") or "")[:12000],
                }
            )
        payload.append(
            {
                "posting_id": p["id"],
                "company": p["company"],
                "title": p["title"],
                "url": p.get("url"),
                "confession_hit": p.get("confession_hit"),
                "confession_quote": p.get("confession_quote"),
                "primary_raw_text": (p.get("raw_text") or "")[:12000],
                "all_sources": source_blobs,
            }
        )
    return (
        "Score the following candidate postings. Use every source text for each "
        "posting (recruiter boards often contain ACV/cycle/comp). Return JSON only.\n\n"
        + json.dumps(payload, ensure_ascii=False, indent=2)
    )


def score_batch(postings: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Score a list of unscored postings in one LLM call (caller chunks if needed).
    Uses Anthropic Messages API with web_search tool when available.
    """
    settings = get_settings()
    if not postings:
        return {"companies": [], "top3_lane_a_rationales": [], "unknowns_that_change_routing": []}

    if settings.scanner_dry_run or not settings.anthropic_api_key:
        logger.warning("Dry-run / no API key — returning stub scores (lane=DQ stub)")
        return {
            "companies": [
                {
                    "posting_id": p["id"],
                    "company": p["company"],
                    "role_title": p["title"],
                    "posting_url": p.get("url") or "UNKNOWN",
                    "pipeline_confession": p.get("confession_quote") or "UNKNOWN",
                    "acv": "UNKNOWN",
                    "acv_numeric": None,
                    "funding_stage": "UNKNOWN",
                    "headcount": "UNKNOWN",
                    "founder_led": None,
                    "buyer": "UNKNOWN",
                    "phone_reachable": "unknown",
                    "sales_cycle": "UNKNOWN",
                    "pipeline_spend": "UNKNOWN",
                    "delivery_risk": "UNKNOWN",
                    "lane": "DQ",
                    "lane_reason": "dry-run stub — not scored by LLM",
                    "sources": [p.get("source")],
                }
                for p in postings
            ],
            "top3_lane_a_rationales": [],
            "unknowns_that_change_routing": [],
            "_dry_run": True,
        }

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    user_content = _build_batch_user_payload(postings)

    # Prefer web_search tool; fall back to plain completion if tool unsupported.
    tools = [
        {
            "type": "web_search_20250305",
            "name": "web_search",
            "max_uses": 20,
        }
    ]

    try:
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=16000,
            system=SCANNER_SYSTEM_PROMPT,
            tools=tools,
            messages=[{"role": "user", "content": user_content}],
        )
    except Exception as e:
        logger.warning("web_search tool call failed (%s) — retrying without tools", e)
        response = client.messages.create(
            model=settings.anthropic_model,
            max_tokens=16000,
            system=SCANNER_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )

    text_parts: list[str] = []
    for block in response.content:
        if getattr(block, "type", None) == "text":
            text_parts.append(block.text)
    raw = _strip_json_fences("\n".join(text_parts))
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Last-ditch: find outermost JSON object
        start, end = raw.find("{"), raw.rfind("}")
        if start >= 0 and end > start:
            return json.loads(raw[start : end + 1])
        logger.error("Failed to parse scorer JSON: %s", raw[:500])
        raise


def score_all_unscored(postings: list[dict[str, Any]], batch_size: int | None = None) -> dict[str, Any]:
    settings = get_settings()
    size = batch_size or settings.scorer_batch_size
    merged: dict[str, Any] = {
        "companies": [],
        "top3_lane_a_rationales": [],
        "unknowns_that_change_routing": [],
    }
    for i in range(0, len(postings), size):
        chunk = postings[i : i + size]
        logger.info("Scoring batch %d–%d of %d", i + 1, i + len(chunk), len(postings))
        result = score_batch(chunk)
        merged["companies"].extend(result.get("companies") or [])
        merged["top3_lane_a_rationales"].extend(result.get("top3_lane_a_rationales") or [])
        merged["unknowns_that_change_routing"].extend(result.get("unknowns_that_change_routing") or [])

    # Re-sort by acv_numeric desc
    merged["companies"].sort(
        key=lambda c: (c.get("acv_numeric") is not None, c.get("acv_numeric") or 0),
        reverse=True,
    )
    return merged
