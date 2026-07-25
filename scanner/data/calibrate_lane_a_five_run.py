"""
Final calibration pass: screen ALL fresh filter-INs, rank by dialability, emit top 5.
Does not wipe DB. Seeds (original 5) must all recency-kill.
"""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path

from tally_scanner import db
from tally_scanner.deep_screener import (
    STALE_DAYS,
    deep_screen_one,
    posting_age_days,
    write_csv_from_results,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

TARGET = 5
OUT = Path("data/lane_a_five.csv")
OUT_CAL = Path("data/lane_a_five_calibrated.csv")
LOG = Path("data/lane_a_five_calibration_log.csv")

SEED_URLS = [
    "https://news.ycombinator.com/item?id=42025388",
    "https://news.ycombinator.com/item?id=46857490",
    "https://news.ycombinator.com/item?id=44758710",
    "https://news.ycombinator.com/item?id=4054942",
    "https://news.ycombinator.com/item?id=38106758",
]


def company_key(company: str, url: str, title: str) -> str:
    blob = f"{company} {url} {title}".lower()
    # Collapse near-duplicates (same product line / board family)
    for token, key in (
        ("aktos", "aktos"),
        ("cuebox", "cuebox"),
        ("cue box", "cuebox"),
        ("computergeneratedsolutions", "cgs"),
        ("corepilot", "corepilot"),
        ("bigblue", "bigblue"),
        ("superset", "superset_kana"),
        ("kana", "superset_kana"),
        ("agentic marketing", "superset_kana"),
        ("ai-driven marketing", "superset_kana"),
        ("doitintl", "doit"),
        ("attribute", "doit"),
        ("devrev", "devrev"),
        ("statuspal", "statuspal"),
        ("kinelo", "kinelo"),
        ("unusual", "unusual"),
        ("spiceai", "spiceai"),
        ("getduranta", "duranta"),
        ("matcha", "matcha"),
    ):
        if token in blob:
            return key
    m = re.search(r"(greenhouse\.io|lever\.co|ashbyhq\.com)/([^/]+)", url or "")
    if m:
        return m.group(2).lower()
    m2 = re.search(r"item\?id=(\d+)", url or "")
    if m2:
        return f"hn:{m2.group(1)}"
    return (company or title or url or "x")[:40].lower()


def alignment_issues(result: dict, *, expected_stale: bool = False) -> list[str]:
    issues: list[str] = []
    url = result.get("posting_url") or ""
    age = result.get("posting_age_days")
    if age in ("", None):
        computed = posting_age_days(url, "")
        if computed is not None:
            age = int(computed)
    killed = (result.get("killed_at") or "").lower()
    verdict = (result.get("verdict") or "").lower()

    if expected_stale or (isinstance(age, (int, float)) and age > STALE_DAYS):
        if killed != "recency" or verdict != "dead":
            issues.append(f"STALE_NOT_KILLED age={age} killed={killed} verdict={verdict}")
        return issues
    if killed == "recency":
        return issues

    opener = result.get("draft_opener") or ""
    scenario = ""
    l2 = result.get("layer_2")
    if isinstance(l2, dict):
        scenario = l2.get("scenario") or ""

    if verdict != "dead":
        if opener and "?" not in opener:
            issues.append("OPENER_NOT_QUESTION")
        if opener and re.search(r"\bAt [A-Z][a-zA-Z0-9]+\b", opener):
            issues.append("OPENER_NAMES_PRODUCT")
        if scenario and scenario.strip() and not re.match(
            r"^(I |I'm |I am |We |We're |My |Our )", scenario.strip(), re.I
        ):
            issues.append("SCENARIO_NOT_FIRST_PERSON")
        if isinstance(age, (int, float)) and age < 0:
            issues.append(f"NEGATIVE_AGE {age}")
    return issues


def rank_key(r: dict) -> tuple:
    verdict = (r.get("verdict") or "").lower()
    dial = int(r.get("dialability_rank_hint") or 99)
    trap = 1 if r.get("legibility_trap") in (True, "True", "true") else 0
    commod = 0 if str(r.get("commoditization_risk") or "").lower() in {"", "none"} else 1
    verdict_rank = {"call-ready": 0, "conditional": 1, "fixable": 2}.get(verdict, 9)
    # Prefer shorter, cleaner dials over "stated high ACV" traps
    return (verdict_rank, dial, trap, commod)


def screen_row(row: dict) -> dict:
    return deep_screen_one(
        company=row["company"],
        title=row["title"],
        raw_text=row.get("raw_text") or "",
        url=row.get("url"),
    )


def main() -> None:
    all_results: list[dict] = []
    notes: list[str] = []
    seed_ok = True

    # Seed recency gates
    with db.connect() as conn:
        for url in SEED_URLS:
            row = conn.execute(
                "SELECT id, company, title, url, raw_text FROM postings WHERE url=%s LIMIT 1",
                (url,),
            ).fetchone()
            row = dict(row) if row else {
                "id": None,
                "company": "seed",
                "title": "seed",
                "url": url,
                "raw_text": "",
            }
            age = posting_age_days(url, row.get("raw_text") or "")
            result = screen_row(row)
            result["posting_id"] = row.get("id")
            issues = alignment_issues(result, expected_stale=True)
            all_results.append(result)
            notes.append(
                f"SEED age={None if age is None else round(float(age),1)} "
                f"killed={result.get('killed_at')} issues={issues}"
            )
            if issues:
                seed_ok = False

    # Fresh filter-INs (URL-deduped). Prefer founding / first-sales titles.
    with db.connect() as conn:
        rows = [
            dict(r)
            for r in conn.execute(
                """
                SELECT id, company, title, url, raw_text
                FROM postings
                WHERE filter_status = 'in'
                ORDER BY id
                """
            ).fetchall()
        ]

    age_cache: dict[str, float | None] = {}
    survivors: dict[str, dict] = {}
    seen_urls: set[str] = set()

    def cached_age(u: str, text: str = "") -> float | None:
        if u not in age_cache:
            age_cache[u] = posting_age_days(u, text)
        return age_cache[u]

    def looks_founding(title: str) -> bool:
        t = (title or "").lower()
        if any(
            x in t
            for x in (
                "territory",
                "district manager",
                "retail account",
                "software engineer",
                "product manager",
                "gtm engineer",
                "partner business",
            )
        ):
            return False
        return any(
            x in t
            for x in (
                "founding",
                "first sales",
                "first ae",
                "founding ae",
                "founding gtm",
                "founding account",
                "founding sales",
            )
        ) or ("account executive" in t and "toast" not in t)

    for row in rows:
        url = row.get("url") or ""
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        age = cached_age(url, row.get("raw_text") or "")
        if age is not None and age > STALE_DAYS:
            result = screen_row(row)
            result["posting_id"] = row.get("id")
            issues = alignment_issues(result, expected_stale=True)
            all_results.append(result)
            if issues:
                notes.append(f"STALE FAIL {url}: {issues}")
            continue

        if not looks_founding(row.get("title") or ""):
            notes.append(f"SKIP non-founding title #{row.get('id')}")
            continue

        key = company_key(row.get("company") or "", url, row.get("title") or "")
        logging.info("Screen #%s key=%s %s", row.get("id"), key, (row.get("title") or "")[:50])
        result = screen_row(row)
        result["posting_id"] = row.get("id")
        issues = alignment_issues(result, expected_stale=False)
        all_results.append(result)
        if issues:
            notes.append(f"MISALIGNED {key}: {issues}")
            continue

        lane = (result.get("lane") or "").upper()
        verdict = (result.get("verdict") or "").lower()
        if lane == "A" and verdict != "dead":
            prev = survivors.get(key)
            if prev is None or rank_key(result) < rank_key(prev):
                survivors[key] = result
            notes.append(
                f"PASS {key} verdict={verdict} dial={result.get('dialability_rank_hint')} "
                f"trap={result.get('legibility_trap')}"
            )
            logging.info("  PASS %s", key)
        else:
            notes.append(f"REJECT {key} lane={lane} verdict={verdict}")
            logging.info("  reject lane=%s verdict=%s", lane, verdict)

    finals = sorted(survivors.values(), key=rank_key)[:TARGET]
    write_csv_from_results(all_results, LOG)
    write_csv_from_results(finals, OUT)
    write_csv_from_results(finals, OUT_CAL)

    summary = {
        "seed_ok": seed_ok,
        "survivors_unique": len(survivors),
        "lane_a_aligned_count": len(finals),
        "target": TARGET,
        "notes": notes,
        "companies": [
            {
                "rank": i + 1,
                "company": r.get("company"),
                "verdict": r.get("verdict"),
                "dialability_rank_hint": r.get("dialability_rank_hint"),
                "legibility_trap": r.get("legibility_trap"),
                "commoditization_risk": r.get("commoditization_risk"),
                "url": r.get("posting_url"),
                "opener": (r.get("draft_opener") or "")[:160],
                "scenario": (
                    (r.get("layer_2") or {}).get("scenario")
                    if isinstance(r.get("layer_2"), dict)
                    else ""
                ),
            }
            for i, r in enumerate(finals)
        ],
    }
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    if not seed_ok or len(finals) < TARGET:
        raise SystemExit(
            f"Calibration incomplete seed_ok={seed_ok} count={len(finals)}/{TARGET}"
        )


if __name__ == "__main__":
    main()
