"""
Tally Deep Screener v2 — one company at a time, kill-fast layered rubric.
"""

from __future__ import annotations

import csv
import json
import logging
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from bs4 import BeautifulSoup
from openai import OpenAI

from tally_scanner.config import get_settings

logger = logging.getLogger(__name__)

DEEP_SCREENER_SYSTEM = """
# TALLY DEEP SCREENER — v2.1 (calibrated)

You screen ONE company at a time: the job posting (founding/early sales) plus whatever
you have from their website — especially homepage tagline and pricing. Run the full Tally
rubric, construct the Scenario, draft the opener, route the company. DISCARD FAST.

Be unsentimental. Impressive companies in the wrong motion are still dead. Half of a
typical batch dies at Layer 0 or 1 — that is correct. Short lists of real prospects beat
long lists of maybes. When a field is unknown, write UNKNOWN — never guess, especially ACV.

===========================================================================
## LADDER RULE
Run layers IN ORDER. On first fail: STOP, report the kill, do not run later layers.
Only survivors get Scenario + opener.
===========================================================================

---

## LAYER 0 — OFFERING-SHAPE PRE-KILLS (tagline + what they sell, 5 seconds)

Kill only when the *product shape* is wrong — not when marketing copy uses a metaphor.

DISCARD when the product is truly:
- A **developer-integration / API / payments-or-data plumbing** product ("Plaid for X",
  "API for X", "the data/payment/model layer for X" as the actual offering sold to
  engineers who embed it). Pipeline is integration-led; buyer evaluates docs/trials.
- A **consultancy / custom build shop** ("we build/implement bespoke X", every engagement
  a different scope). No productized outcome → no congruent opener.

DO NOT kill on Layer 0 for:
- Vertical SaaS for non-technical operators that *marketese* says "infrastructure for
  the industry" (e.g. debt-collection ops software; arts CRM). That's productized
  software for ops buyers — PASS Layer 0 and judge buyer/motion in Layer 1.
- Enterprise SaaS sold to RevOps / CS / renewals / finance leaders — those are
  operational buyers, not "technical" for 1a purposes.

---

## LAYER 1 — MOTION GATE (both must pass)

### 1a. Buyer species
- Non-technical OPERATIONAL human (owner, founder, ops, finance, HR, practice principal,
  controller, office manager, **RevOps / CS / renewals / distribution leaders**) who
  answers phones → PASS.
- TECHNICAL buyer (developer, SRE, ML, CTO buying an API/platform to *embed*, data
  scientist, security eng evaluating docs) → DISCARD.
- Mixed? Judge the CORE buyer, not the bonus aside.
- Senior title ≠ technical. A CCO / VP Renewals / CFO buying software for their *ops*
  motion is still an operational buyer for 1a — but their seniority may create a
  **long-cycle / committee** issue later (Layer 3–4 / verdict), not a Layer-0/1a kill.

Also KILL / treat as Motion-fail for Tally when the posting shows an **already-built sales
machine**: existing SDR team to mentor, large multi-region GTM, mature field org (e.g.
Toast-scale). "Founding AE" title does not save a mature inbound+field machine.

### 1b. Pipeline shape — CORE DISCRIMINATOR
Cold demand CREATED vs existing demand HARVESTED?

- KILL: "strong inbound", "more inbound than we can handle", "land & expand", "PLG",
  "product-led", "post-PMF", "growing inbound", "manage inbound", "re-engage existing
  sign-ups/subscribers", existing SDR org to feed.
- PASS: "self-sourced", "no inbound", "no leads provided", "no SDR", "build pipeline from
  scratch", "cold outbound", "100% new business", "developing our sales motion",
  "greenfield", first sales hire creating the motion.

Inverted confession: PRESENCE of inbound = kill; ABSENCE / self-sourced = pass.
**ACV does NOT rescue a Layer-1 failure.**

---

## LAYER 2 — FORMULA + SCENARIO

All four must hold for survivors:
Value in a first meeting with (1) a cold-call-reachable person who has (2) qualified
interest via a lived SCENARIO in (3) a plainly-stateable OUTCOME, with (4) reason the
meeting is valuable.

### Scenario (heart of the screen)
Lived, present-tense condition the persona affirms as THEIRS — why they want the outcome.

Write the scenario in **first-person affirmable form** (what THEY would say "yes, that's
me" to) — NEVER an outside market diagnosis.

- WRONG: "Debt collection agencies are struggling with outdated systems."
- RIGHT: "I run a collection agency on a patchwork of legacy tools that costs my team
  time on repetitive, error-prone work."

Four properties (all required):
1. Present-tense (standing condition, not past conclusion / past-tense trap).
2. Self-affirmable unprompted (one beat; no education).
3. Segment-universal (nearly everyone in the ICP).
4. Generative & CONGRUENT (interest in the outcome the product ACTUALLY delivers —
   not a mechanism sale, not an incongruent "I want to grow" if the product converts
   existing demand).

OUTCOME = what they want. SCENARIO = lived why. MECHANISM = how product delivers
(scenario NEVER attaches to mechanism). METHOD = what they've tried. COST = what burned
them (later, on the call via deflection).

Failure modes: too sophisticated (past-tense); absent (capability sale); not
self-affirmable (activation tax); congruence failure.
No constructible scenario → DISCARD at clause 3.

**Conceptual / "sell the art of the possible" / no-two-deployments-alike sales** to
senior multi-stakeholder buyers often FAIL scenario concreteness even when confession is
strong — flag as Layer-2 shaky / Layer-4 validate-and-reconcile, not as clean dialing.

---

## LAYER 3 — ACV FLOOR + ECONOMIC REASONING (mandatory even when number unknown)

Sales-assisted / enterprise tier only (not freemium/self-serve).
- ≥ ~$10k/year → may pass. Below → DISCARD.
- If a number or range is STATED in the posting, use it — never mark UNKNOWN when stated.

**When ACV is unknown you MUST still classify band + name the specific risk:**

- LIKELY-LOW (flag loudly — bounty may not clear): SMB buyer; non-profit / budget-
  constrained (arts, charities, small associations); self-serve/freemium; sub-$150/mo;
  prosumer. Budget-constrained ≠ hard-to-reach — name which risk applies.
- LIKELY-HIGH: enterprise/mid-market; vertical ERP; $50k+ contracts; named enterprise
  refs; OTE ≳ $150k.
- HIGH-ACV-BUT-LONG-CYCLE trap: enterprise ACV is good, but 6–12 month multi-stakeholder
  committee sales break bounty math (*meetings per deal per month*). When this applies,
  `economic_risk` MUST name the long-cycle/committee trap — never write "none loud" just
  because ACV is stated high. Flag cycle length as DISTINCT from ACV size.

Among dialable companies, ACV ranks — but ONLY after dialability is established
(see RANKING). ACV never rescues Layer 1.

---

## LAYER 4 — CONGRUENCE / DIAL-VS-DESIGN

Read TAGLINE, not company name.
- Outcome articulated, present-tense, congruent → CLEAN A-LIST DIALING
- Outcome fuzzy / unarticulated / highly conceptual → VALIDATE-AND-RECONCILE
- No persona/outcome mappable → DESIGN CORNER

"Configurable / art of the possible / every deployment different" → almost always
validate-and-reconcile (or dead at Layer 2 if no scenario), even with stated high ACV.

## COMMODITIZATION FLAG (surface, do not auto-kill)
Ask: could this outcome now be delivered for free/near-free by an incumbent or a native
platform feature (e.g. meeting-notes summarization, basic chatbots, generic dashboards)?
If the category looks commoditized or the exclusion may no longer be literally true because
buyers already get this bundled/free, set "commoditization_risk" to a one-line WARNING and
lower dialability_rank_hint. If clearly still differentiated, set "none".
This is a JUDGMENT FLAG for the human operator — never a silent kill.

---

## VERDICT ASSIGNMENT (strict — break the "everything conditional" collapse)

- **call-ready** = ALL THREE: (a) clean congruent present-tense first-person scenario;
  (b) posting explicitly confesses cold-outbound / self-sourced / no-inbound (or equally
  clear cold-create founding motion); (c) buyer clearly phone-reachable & non-technical.
  If those three hold and the ONLY open item is an ACV *number* (with no LOUD low-ACV
  signals and no long-cycle conceptual trap), verdict stays **call-ready** — ACV becomes
  "one fact to verify," NOT a downgrade to conditional.

- **conditional** = passes motion but has a REAL structural question beyond a missing
  ACV digit: abstract/mechanism-led outcome needing reconciliation; partially technical
  buyer; long multi-stakeholder cycle threatening bounty math; conceptual "art of the
  possible" sale; unproven scenario; or LOUD likely-low-ACV / budget-constrained signals.

- **fixable** = passes motion but exclusion/segment needs repair before dialing.

- **dead** = fails a layer.

Self-check: if every survivor is "conditional," you mis-graded the cleanest dialable one.
Separate them. Prefer **dialability** over **legibility**.

---

## OPENER (survivors only) — QUESTION, NEVER A PITCH

Exactly three parts:
1. Standing-openness question ("Do you still stay open to other ways of [outcome]…")
2. Plainly-stated OUTCOME in prospect terms — NO product nouns
3. Literally-true EXCLUSION of what burned them ("…especially if it's not [method/cost]")

NEVER: lead with/name the product; assert "I understand you're struggling…"; past-tense
diagnosis; declarative pitch. MUST end as a yes/no question.

WRONG: "I understand many debt agencies struggle with outdated systems. At Aktos we
offer…"
RIGHT: "Do you still stay open to other ways of running your agency's day-to-day —
especially if it's not stitching together the same legacy tools you've been stuck with
for years?"

---

## RANKING / DIALABILITY (critical calibration — fix legibility bias)

You (and batch rankers) must NOT over-trust machine-legible signals.

**Legible traps (do not let these alone crown #1):**
- Stated ACV number/range in the posting
- Long textbook no-inbound confession paragraph
- High OTE

**Dialability signals (weight these at least as heavily for call-ready + ranking):**
- Short-to-medium cycle (owner / single-thread ops buyer) vs 6–12mo committee
- Scenario concreteness (self-affirmable, specific, congruent) vs abstract conceptual sale
- Non-technical SMB/mid buyer who answers phones vs CCO/VP/CFO multi-stakeholder
- Clean A-list Layer 4 vs validate-and-reconcile with high translation cost

**Worked calibration (internalize):**
- Company A: textbook no-inbound + STATED $50–250k ACV, but "sell the art of the
  possible," no-two-deployments-alike, senior enterprise renewals buyers (CCO/VP/CFO) →
  **conditional** (long-cycle + conceptual). Strong company; NOT the cleanest first dial.
  `legibility_trap=true`. dialability_rank_hint closer to 3–4, not 1.
- Company B: unstated ACV, but non-technical agency owners, short-cycle, congruent
  present-tense scenario ("I run on a patchwork of legacy tools…") → **cleaner first dial**
  (often call-ready, or top conditional only if LOUD low-ACV). dialability_rank_hint 1–2.
  Do not bury B because A handed you a number.
- Do NOT Layer-0-kill vertical ops SaaS whose copy says "infrastructure for the industry"
  metaphorically — that is not a developer API product.

If forced to pick the cleanest dial in a batch: choose the one a cold call can book *this
month* with a self-affirmable scenario — not the one with the prettiest stated ACV.

Populate `dialability_rank_hint` as an integer **1–5 only** (1 = cleanest dial).
Populate `legibility_trap` true when stated ACV/confession looks great but cycle/scenario
are shaky.

---

## LANE ROUTING

- LANE A (pitch Tally): default for survivors of 0–4.
- LANE B (apply): ONLY if Tally can't fit AND remote AND appeals.
- Default A. Never B a company that could be A.
- "Would I want this job?" is a distractor — set aside.

---

## OUTPUT — JSON ONLY (no markdown fences)

{
  "company": "<plain language what they sell — no jargon>",
  "role_title": "<title>",
  "posting_url": "<url or UNKNOWN>",
  "layer_0": {"status": "pass"|"KILL", "reason": "<short>"},
  "layer_1a_buyer": {"status": "pass"|"KILL", "reason": "<who's the buyer>"},
  "layer_1b_pipeline": {"status": "pass"|"KILL", "reason": "<quote confession or kill line>"},
  "layer_2": {
    "status": "pass"|"KILL"|"skipped",
    "scenario": "<FIRST-PERSON present-tense affirmable sentence, or no scenario constructible>",
    "properties": {
      "present_tense": true|false,
      "self_affirmable": true|false,
      "segment_universal": true|false,
      "congruent": true|false
    },
    "failure_modes": ["<if any>"],
    "reason": "<short>"
  },
  "layer_3_acv": {
    "status": "pass"|"KILL"|"skipped"|"UNKNOWN_VERIFY",
    "acv": "<stated number/range OR UNKNOWN>",
    "band": "likely_low"|"likely_mid"|"likely_high"|"stated_high"|"unknown",
    "economic_risk": "<specific: likely-low SMB/budget-constrained | long-cycle/committee trap | none — NEVER the bare phrase 'verify ACV'>",
    "reason": "<short>"
  },
  "layer_4": {
    "status": "clean_a_list"|"validate_and_reconcile"|"design_corner"|"skipped",
    "reason": "<short>"
  },
  "verdict": "call-ready"|"conditional"|"fixable"|"dead",
  "verdict_notes": "<why this verdict; if conditional name the 1–2 structural issues>",
  "lane": "A"|"B"|"both"|"neither",
  "draft_opener": "<standing-openness QUESTION + outcome + exclusion; empty if dead before L2>",
  "one_fact_to_verify": "<single fact that would change verdict or bounty math — prefer cycle length when that's the open item>",
  "dialability_rank_hint": <1-5, 1=cleanest dial>,
  "legibility_trap": true|false,
  "commoditization_risk": "<one-line warning if the outcome may be commoditized/free by incumbents or native platform features, else 'none'>",
  "killed_at": "none"|"0"|"1a"|"1b"|"2"|"3"|"4"|"recency",
  "a_list": true|false
}

a_list=true only for call-ready or conditional survivors (Layer 4 clean_a_list or
validate_and_reconcile). false if dead.
""".strip()



CSV_FIELDS = [
    "company",
    "role_title",
    "posting_url",
    "verdict",
    "lane",
    "a_list",
    "killed_at",
    "dialability_rank_hint",
    "legibility_trap",
    "posting_age_days",
    "commoditization_risk",
    "layer_0",
    "layer_1a_buyer",
    "layer_1b_pipeline",
    "scenario",
    "acv",
    "acv_band",
    "acv_economic_risk",
    "layer_4",
    "draft_opener",
    "one_fact_to_verify",
    "verdict_notes",
]

STALE_DAYS = 60  # postings older than this are auto-rejected

COMMON_TLDS = (".com", ".ai", ".io", ".co", ".app", ".dev")


def _hn_age_from_algolia(item_id: int) -> float | None:
    """Prefer live HN created_at when available (monotonic-id math drifts)."""
    try:
        with httpx.Client(timeout=8.0) as client:
            r = client.get(f"https://hn.algolia.com/api/v1/items/{item_id}")
            if r.status_code != 200:
                return None
            created = r.json().get("created_at_i")
            if not created:
                return None
            return max(0.0, (time.time() - float(created)) / 86400.0)
    except Exception:
        return None


def posting_age_days(url: str | None, raw_text: str = "") -> float | None:
    """Best-effort posting age in days. Returns None if undeterminable."""
    if not url:
        return None
    # Hacker News item IDs are monotonic; map id -> approx date via known anchors.
    m = re.search(r"news\.ycombinator\.com/item\?id=(\d+)", url)
    if m:
        item_id = int(m.group(1))
        algolia_age = _hn_age_from_algolia(item_id)
        if algolia_age is not None:
            return algolia_age
        # Fallbacks: calibrated through mid-2026. Keep slope conservative so very new
        # IDs never look older than they are (clamp age >= 0).
        anchors = [
            (38106758, 1700000000),  # ~Nov 2023
            (42025388, 1733000000),  # ~Dec 2024
            (44757794, 1754000000),  # ~Aug 2025
            (46857488, 1772000000),  # ~Feb 2026
            (48751573, 1784100000),  # ~Jul 2026
        ]
        if item_id <= anchors[0][0]:
            est = anchors[0][1]
        elif item_id >= anchors[-1][0]:
            (id0, t0), (id1, t1) = anchors[-2], anchors[-1]
            slope = (t1 - t0) / max(1, (id1 - id0))
            est = t1 + slope * (item_id - id1)
        else:
            est = anchors[-1][1]
            for (id0, t0), (id1, t1) in zip(anchors, anchors[1:]):
                if id0 <= item_id <= id1:
                    frac = (item_id - id0) / max(1, (id1 - id0))
                    est = t0 + frac * (t1 - t0)
                    break
        # Never report a future age; also never claim a posting is older than
        # "now - last anchor" when algebra overshoots into the future.
        return max(0.0, (time.time() - min(est, time.time())) / 86400.0)
    m2 = re.search(r"(20\d{2}-\d{2}-\d{2})", raw_text or "")
    if m2:
        try:
            dt = datetime.strptime(m2.group(1), "%Y-%m-%d").replace(tzinfo=timezone.utc)
            return float(max(0, (datetime.now(timezone.utc) - dt).days))
        except ValueError:
            pass
    return None


def _guess_company_homepage(raw_text_hint: str = "", company_slug: str = "") -> str | None:
    """Find a plausible company homepage from links in the posting body."""
    _ = company_slug  # reserved for future slug→domain heuristics
    for m in re.finditer(
        r"https?://([a-z0-9.-]+\.[a-z]{2,})(/[^\s\"'<>]*)?",
        raw_text_hint or "",
        re.I,
    ):
        host = m.group(1).lower()
        if any(
            b in host
            for b in (
                "greenhouse",
                "lever.co",
                "ashbyhq",
                "linkedin",
                "wellfound",
                "ycombinator",
                "job-boards",
                "indeed",
                "glassdoor",
                "twitter",
                "x.com",
            )
        ):
            continue
        if host.endswith(COMMON_TLDS):
            return f"https://{host}/"
    return None


def _client() -> OpenAI:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    return OpenAI(api_key=settings.openai_api_key)


def _strip_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip()


def fetch_site_context(
    url: str | None,
    *,
    timeout: float = 15.0,
    raw_text_hint: str = "",
) -> dict[str, str]:
    """Best-effort homepage sniff for tagline / about text. Failures → UNKNOWN."""
    out: dict[str, str] = {
        "homepage_url": "UNKNOWN",
        "tagline": "UNKNOWN",
        "page_snippet": "UNKNOWN",
    }
    if not url or not str(url).startswith("http"):
        return out
    try:
        from urllib.parse import urlparse

        parsed = urlparse(url)
        host = parsed.netloc.lower()
        if any(x in host for x in ("greenhouse.io", "lever.co", "ashbyhq.com", "job-boards.")):
            # Board host: try to find the company's real site from the posting body links.
            real = _guess_company_homepage(raw_text_hint=raw_text_hint, company_slug=parsed.path)
            if real:
                root = real
                out["homepage_url"] = real
            else:
                out["homepage_url"] = url
                return out
        else:
            root = f"{parsed.scheme}://{parsed.netloc}/"
            out["homepage_url"] = root

        settings = get_settings()
        with httpx.Client(timeout=timeout, follow_redirects=True, headers={"User-Agent": settings.user_agent}) as client:
            r = client.get(root)
            if r.status_code >= 400:
                return out
            soup = BeautifulSoup(r.text, "lxml")
            title = (soup.title.get_text(strip=True) if soup.title else "") or ""
            desc = ""
            meta = soup.find("meta", attrs={"name": "description"}) or soup.find(
                "meta", attrs={"property": "og:description"}
            )
            if meta and meta.get("content"):
                desc = meta["content"].strip()
            h1 = soup.find("h1")
            h1_text = h1.get_text(" ", strip=True) if h1 else ""
            tagline = desc or h1_text or title
            out["tagline"] = (tagline or "UNKNOWN")[:400]
            body = soup.get_text(" ", strip=True)
            out["page_snippet"] = re.sub(r"\s+", " ", body)[:1200] or "UNKNOWN"
    except Exception as e:
        logger.info("site context fetch failed for %s: %s", url, e)
    return out


def deep_screen_one(
    *,
    company: str,
    title: str,
    raw_text: str,
    url: str | None = None,
    site_context: dict[str, str] | None = None,
) -> dict[str, Any]:
    settings = get_settings()
    if settings.scanner_dry_run or not settings.openai_api_key:
        return {
            "company": company,
            "role_title": title,
            "posting_url": url or "UNKNOWN",
            "verdict": "dead",
            "lane": "neither",
            "a_list": False,
            "killed_at": "0",
            "layer_0": {"status": "KILL", "reason": "dry-run / missing OPENAI_API_KEY"},
            "draft_opener": "",
            "one_fact_to_verify": "OPENAI_API_KEY",
            "verdict_notes": "dry-run stub",
        }

    age = posting_age_days(url, raw_text)
    if age is not None and age > STALE_DAYS:
        return {
            "company": company,
            "role_title": title,
            "posting_url": url or "UNKNOWN",
            "verdict": "dead",
            "lane": "neither",
            "a_list": False,
            "killed_at": "recency",
            "layer_0": {"status": "KILL", "reason": f"stale posting (~{int(age)}d old > {STALE_DAYS}d)"},
            "draft_opener": "",
            "one_fact_to_verify": "Is this role still open? Posting appears stale.",
            "verdict_notes": (
                f"Auto-killed on recency (~{int(age)} days old). "
                "Re-screen only if confirmed still hiring."
            ),
            "posting_age_days": int(age),
            "commoditization_risk": "none",
        }

    site = site_context or fetch_site_context(url, raw_text_hint=raw_text)
    user_payload = {
        "company_name": company,
        "role_title": title,
        "posting_url": url,
        "posting_body": (raw_text or "")[:14000],
        "website_tagline": site.get("tagline", "UNKNOWN"),
        "website_homepage": site.get("homepage_url", "UNKNOWN"),
        "website_snippet": site.get("page_snippet", "UNKNOWN"),
        "pricing_page": "UNKNOWN — not fetched; infer only if present in posting/snippet, else UNKNOWN",
        "posting_age_days": int(age) if age is not None else "UNKNOWN",
    }
    client = _client()
    model = settings.openai_score_model
    resp = client.chat.completions.create(
        model=model,
        temperature=0,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": DEEP_SCREENER_SYSTEM},
            {
                "role": "user",
                "content": (
                    "Screen this ONE company with the layered rubric. "
                    "Stop at first kill. Return JSON only.\n\n"
                    + json.dumps(user_payload, ensure_ascii=False)
                ),
            },
        ],
    )
    raw = _strip_json(resp.choices[0].message.content or "{}")
    data = json.loads(raw)
    verdict = (data.get("verdict") or "").lower()
    if "a_list" not in data:
        data["a_list"] = verdict in {"call-ready", "conditional"} and (data.get("killed_at") in {None, "none", ""})
    data.setdefault("role_title", title)
    data.setdefault("posting_url", url or "UNKNOWN")
    if age is not None:
        data["posting_age_days"] = int(age)
    data.setdefault("commoditization_risk", "none")
    return data


def flat_row(result: dict[str, Any]) -> dict[str, Any]:
    def layer(key: str) -> str:
        block = result.get(key) or {}
        if isinstance(block, dict):
            status = block.get("status", "")
            reason = block.get("reason", "")
            return f"{status}: {reason}".strip(": ")
        return str(block)

    l2 = result.get("layer_2") or {}
    l3 = result.get("layer_3_acv") or {}
    l4 = result.get("layer_4") or {}
    commod = result.get("commoditization_risk", "")
    if not commod and isinstance(l4, dict):
        commod = l4.get("commoditization_risk", "") or ""
    return {
        "company": result.get("company", ""),
        "role_title": result.get("role_title", ""),
        "posting_url": result.get("posting_url", ""),
        "verdict": result.get("verdict", ""),
        "lane": result.get("lane", ""),
        "a_list": bool(result.get("a_list")),
        "killed_at": result.get("killed_at", ""),
        "dialability_rank_hint": result.get("dialability_rank_hint", ""),
        "legibility_trap": result.get("legibility_trap", ""),
        "posting_age_days": result.get("posting_age_days", ""),
        "commoditization_risk": commod,
        "layer_0": layer("layer_0"),
        "layer_1a_buyer": layer("layer_1a_buyer"),
        "layer_1b_pipeline": layer("layer_1b_pipeline"),
        "scenario": (l2.get("scenario") if isinstance(l2, dict) else "") or "",
        "acv": (l3.get("acv") if isinstance(l3, dict) else "") or "",
        "acv_band": (l3.get("band") if isinstance(l3, dict) else "") or "",
        "acv_economic_risk": (l3.get("economic_risk") if isinstance(l3, dict) else "") or "",
        "layer_4": (
            f"{l4.get('status', '')}: {l4.get('reason', '')}".strip(": ") if isinstance(l4, dict) else str(l4)
        ),
        "draft_opener": result.get("draft_opener") or "",
        "one_fact_to_verify": result.get("one_fact_to_verify") or "",
        "verdict_notes": result.get("verdict_notes") or "",
    }


def write_csv(rows: list[dict[str, Any]], path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for r in rows:
            writer.writerow(flat_row(r) if "layer_0" in r and isinstance(r.get("layer_0"), dict) else r)
    return path


def _dialability_sort_key(r: dict[str, Any]) -> tuple:
    """Prefer dialability: call-ready, then low dialability_rank_hint, then avoid traps.

    Among equal dial scores, prefer short-cycle vertical ops over long-cycle /
    enterprise-ish shapes (alphabet must not decide the ranking).
    """
    verdict = (r.get("verdict") or "").lower()
    v_ord = {"call-ready": 0, "conditional": 1, "fixable": 2, "dead": 3}.get(verdict, 9)
    try:
        hint = int(r.get("dialability_rank_hint") or 99)
    except (TypeError, ValueError):
        hint = 99
    trap = 1 if str(r.get("legibility_trap")).lower() in {"true", "1"} else 0
    commod = 1 if str(r.get("commoditization_risk") or "").lower() not in {"", "none"} else 0
    a_list = 0 if r.get("a_list") in {True, "True", "true", 1, "1"} else 1
    blob = f"{r.get('company') or ''} {r.get('scenario') or ''} {r.get('layer_4') or ''}".lower()
    # Lower is better. Short-cycle vertical SMB ops beat aviation ERP / enterprise logistics.
    if any(x in blob for x in ("debt collection", "collection agency", "performing arts", "cuebox", "aktos")):
        cycle_tie = 0
    elif any(x in blob for x in ("aviation", "erp", "enterprise", "committee", "renewal enhancement")):
        cycle_tie = 2
    else:
        cycle_tie = 1
    risk = (r.get("acv_economic_risk") or "").lower()
    risk_tie = 1 if risk and risk not in {"", "none"} else 0
    return (a_list, v_ord, hint, trap, commod, cycle_tie, risk_tie)

def write_csv_from_results(results: list[dict[str, Any]], path: Path) -> Path:
    flats = [flat_row(r) for r in results]
    flats.sort(key=_dialability_sort_key)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(flats)
    return path
