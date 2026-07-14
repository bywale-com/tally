"""
AI filter agent — decides whether a posting is Tally-relevant (in) or not (out).

Replaces the loose regex gate. All postings are persisted; this only tags them.
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Any

from openai import OpenAI

from tally_scanner.config import get_settings
from tally_scanner.models import RawPosting

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """\
You are the Tally Scanner filter agent.

Tally sells pay-per-qualified-meeting fractional sales. We want roles that signal a company \
is early in building sales capacity — where an outside fractional seller could help — \
NOT every sales job at large, mature GTM orgs.

Mark IN when the role looks like any of:
- founding / first sales hire, founding AE, first AE, founding GTM, go-to-market lead, first BDR
- early head of sales / player-coach at seed–Series A stage
- clear “build the motion” / hunting / self-sourced / no SDR / greenfield language AND the \
  company still seems early (small sales team or first dedicated seller)

Mark OUT when:
- mid/late-stage or well-known large GTM orgs (Notion, Ramp, Stripe, OpenAI, Anthropic scale) \
  hiring AE/SDR/CS into an existing machine — even if the JD says “from scratch” or “hunt”
- non-sales roles (eng, finance, recruiting, marketing ops unless clearly founding GTM)
- confession-style phrases appear but the context is clearly a mature hunting AE seat
- support, enablement, or management of an already large team with no early-stage signal

Be strict on company stage. A single phrase like “from scratch” at a large company is OUT.

Return JSON only, matching the schema. One decision per posting_id given.
"""


@dataclass
class AIFilterResult:
    filter_status: str  # in | out
    filter_reason: str
    confession_hit: bool = False
    confession_quote: str | None = None
    signals: list[str] | None = None

    def as_json(self) -> dict[str, Any]:
        return {
            "filter_status": self.filter_status,
            "filter_reason": self.filter_reason,
            "confession_hit": self.confession_hit,
            "confession_quote": self.confession_quote,
            "signals": self.signals or [],
        }


def _client() -> OpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    return OpenAI(api_key=settings.openai_api_key)


def _truncate(text: str | None, limit: int = 2500) -> str:
    if not text:
        return ""
    t = re.sub(r"\s+", " ", text).strip()
    return t if len(t) <= limit else t[: limit - 1] + "…"


def filter_batch(postings: list[RawPosting], *, ids: list[int] | None = None) -> dict[int, AIFilterResult]:
    """
    Classify a batch of postings. Returns map of index → result (0-based),
    or posting_id → result when ids are provided (same length as postings).
    """
    if not postings:
        return {}

    settings = get_settings()
    if settings.scanner_dry_run or not settings.openai_api_key:
        logger.warning("AI filter dry-run / missing key — marking all OUT for safety")
        out: dict[int, AIFilterResult] = {}
        for i, _ in enumerate(postings):
            key = ids[i] if ids else i
            out[key] = AIFilterResult(
                filter_status="out",
                filter_reason="dry-run or missing OPENAI_API_KEY",
            )
        return out

    payload = []
    for i, p in enumerate(postings):
        key = ids[i] if ids else i
        payload.append(
            {
                "posting_id": key,
                "company": p.company,
                "title": p.title,
                "source": p.source,
                "body": _truncate(p.raw_text),
            }
        )

    user_msg = (
        "Classify each posting as filter_status \"in\" or \"out\".\n"
        "Respond with JSON: {\"decisions\":[{\"posting_id\":number,\"filter_status\":\"in\"|\"out\","
        "\"filter_reason\":string,\"confession_hit\":boolean,\"confession_quote\":string|null,"
        "\"signals\":[string]}]}\n\n"
        f"POSTINGS:\n{json.dumps(payload, ensure_ascii=False)}"
    )

    client = _client()
    resp = client.chat.completions.create(
        model=settings.openai_filter_model,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
    )
    content = resp.choices[0].message.content or "{}"
    data = json.loads(content)
    decisions = data.get("decisions") or []

    by_id: dict[int, AIFilterResult] = {}
    for d in decisions:
        try:
            pid = int(d["posting_id"])
        except (KeyError, TypeError, ValueError):
            continue
        status = str(d.get("filter_status") or "out").lower()
        if status not in ("in", "out"):
            status = "out"
        by_id[pid] = AIFilterResult(
            filter_status=status,
            filter_reason=str(d.get("filter_reason") or "")[:800],
            confession_hit=bool(d.get("confession_hit")),
            confession_quote=(str(d["confession_quote"])[:500] if d.get("confession_quote") else None),
            signals=[str(s) for s in (d.get("signals") or [])][:10],
        )

    # Fill gaps so every posting has a tag
    for i, _ in enumerate(postings):
        key = ids[i] if ids else i
        if key not in by_id:
            by_id[key] = AIFilterResult(
                filter_status="out",
                filter_reason="missing from model response",
            )

    logger.info(
        "AI filter: %d in, %d out (of %d)",
        sum(1 for r in by_id.values() if r.filter_status == "in"),
        sum(1 for r in by_id.values() if r.filter_status == "out"),
        len(by_id),
    )
    return by_id
