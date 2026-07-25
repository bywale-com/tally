"""Continue deep-screen until 5 unique Lane A (merge Puntt-like dupes)."""

from __future__ import annotations

import json
import logging
import re
from pathlib import Path

from tally_scanner import db
from tally_scanner.deep_screener import deep_screen_one, write_csv_from_results

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

TARGET = 5
OUT = Path("data/lane_a_five.csv")
FULL = Path("data/lane_a_five_full_screen_log.csv")


def normalize_company_key(company: str, url: str, title: str) -> str:
    blob = f"{company} {url} {title}".lower()
    if "puntt" in blob or "review the world" in blob or "eliminate review" in blob or "performance review" in blob and "ai-driven" in blob:
        return "puntt"
    if "niceboard" in blob or "job board software" in blob and "white-label" in blob:
        return "niceboard"
    if "nextpunch" in blob or "mobile service" in blob:
        return "nextpunch"
    if "cogram" in blob or "meeting" in blob and "summar" in blob:
        return "cogram"
    # slug from greenhouse/lever
    m = re.search(r"greenhouse\.io/([^/]+)", url.lower())
    if m:
        return m.group(1)
    m = re.search(r"lever\.co/([^/]+)", url.lower())
    if m:
        return m.group(1)
    m = re.search(r"ashbyhq\.com/([^/]+)", url.lower())
    if m:
        return m.group(1)
    # fallback: first 40 of company
    return (company or title or url)[:40].strip().lower()


def main() -> None:
    with db.connect() as conn:
        rows = conn.execute(
            """
            SELECT id, company, title, url, raw_text
            FROM postings
            WHERE filter_status = 'in'
            ORDER BY id
            """
        ).fetchall()

    # Resume: re-screen all until 5 unique keys (fresh calibrated)
    all_results: list[dict] = []
    lane_a_by_key: dict[str, dict] = {}
    screened_ids: set[int] = set()

    for row in rows:
        if len(lane_a_by_key) >= TARGET:
            break
        logging.info("Deep screen #%s %s — %s", row["id"], row["company"], (row["title"] or "")[:55])
        result = deep_screen_one(
            company=row["company"],
            title=row["title"],
            raw_text=row["raw_text"] or "",
            url=row.get("url"),
        )
        result["posting_id"] = row["id"]
        all_results.append(result)
        screened_ids.add(row["id"])

        lane = (result.get("lane") or "").upper()
        verdict = (result.get("verdict") or "").lower()
        key = normalize_company_key(
            result.get("company") or row["company"] or "",
            row.get("url") or "",
            row.get("title") or "",
        )
        logging.info(
            "→ verdict=%s lane=%s key=%s hint=%s",
            verdict,
            lane,
            key,
            result.get("dialability_rank_hint"),
        )
        if lane == "A" and verdict != "dead":
            if key not in lane_a_by_key:
                lane_a_by_key[key] = result
                logging.info("  LANE A unique %d/%d (%s)", len(lane_a_by_key), TARGET, key)
            else:
                # keep better dialability
                old = lane_a_by_key[key]
                try:
                    if int(result.get("dialability_rank_hint") or 99) < int(old.get("dialability_rank_hint") or 99):
                        lane_a_by_key[key] = result
                except (TypeError, ValueError):
                    pass

    lane_a = list(lane_a_by_key.values())
    write_csv_from_results(all_results, FULL)
    write_csv_from_results(lane_a, OUT)

    summary = {
        "lane_a_count": len(lane_a),
        "screened": len(all_results),
        "csv": str(OUT.resolve()),
        "keys": list(lane_a_by_key.keys()),
        "companies": [
            {
                "company": r.get("company"),
                "verdict": r.get("verdict"),
                "dialability_rank_hint": r.get("dialability_rank_hint"),
                "legibility_trap": r.get("legibility_trap"),
                "url": r.get("posting_url"),
                "opener": (r.get("draft_opener") or "")[:120],
            }
            for r in lane_a
        ],
    }
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    if len(lane_a) < TARGET:
        raise SystemExit(f"Only {len(lane_a)} unique Lane A (wanted {TARGET})")


if __name__ == "__main__":
    main()
