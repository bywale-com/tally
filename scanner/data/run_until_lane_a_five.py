"""Fresh deep-screen until N unique Lane A companies; write CSV."""

from __future__ import annotations

import csv
import json
import logging
from pathlib import Path

from tally_scanner import db
from tally_scanner.deep_screener import CSV_FIELDS, deep_screen_one, flat_row, write_csv_from_results
from tally_scanner.pipeline import run_daily

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

TARGET_LANE_A = 5
OUT = Path("data/lane_a_five.csv")
FULL = Path("data/lane_a_five_full_screen_log.csv")


def main() -> None:
    logging.info("Fresh intake (triage only) to refill candidates…")
    stats = run_daily(discover=True, score=False, write_notion=False, limit=100, fresh=True)
    logging.info("Intake stats: %s", stats.get("stats"))

    with db.connect() as conn:
        rows = conn.execute(
            """
            SELECT id, company, title, url, raw_text
            FROM postings
            WHERE filter_status = 'in'
            ORDER BY id
            """
        ).fetchall()

    logging.info("%d filter-INs to deep-screen", len(rows))
    all_results: list[dict] = []
    lane_a: list[dict] = []
    seen_keys: set[str] = set()

    for row in rows:
        if len(lane_a) >= TARGET_LANE_A:
            break
        key = f"{(row['company'] or '').lower()}|{(row['title'] or '').lower()}"
        if key in seen_keys:
            continue
        seen_keys.add(key)

        logging.info("Deep screen #%s %s — %s", row["id"], row["company"], (row["title"] or "")[:55])
        result = deep_screen_one(
            company=row["company"],
            title=row["title"],
            raw_text=row["raw_text"] or "",
            url=row.get("url"),
        )
        result["posting_id"] = row["id"]
        all_results.append(result)

        lane = (result.get("lane") or "").upper()
        verdict = (result.get("verdict") or "").lower()
        logging.info(
            "→ verdict=%s lane=%s dial_hint=%s trap=%s",
            verdict,
            lane,
            result.get("dialability_rank_hint"),
            result.get("legibility_trap"),
        )

        if lane == "A" and verdict != "dead":
            # Dedupe by plain company one-liner
            ckey = (result.get("company") or row["company"] or "").strip().lower()[:50]
            if any((r.get("company") or "").strip().lower()[:50] == ckey for r in lane_a):
                logging.info("  skip duplicate company key %s", ckey)
                continue
            lane_a.append(result)
            logging.info("  LANE A count %d/%d", len(lane_a), TARGET_LANE_A)

    write_csv_from_results(all_results, FULL)
    write_csv_from_results(lane_a, OUT)

    # Also copy to repo root for easy open
    root_out = Path("/app/data/lane_a_five.csv")
    summary = {
        "lane_a_count": len(lane_a),
        "screened": len(all_results),
        "csv": str(OUT.resolve()),
        "companies": [
            {
                "company": r.get("company"),
                "verdict": r.get("verdict"),
                "dialability_rank_hint": r.get("dialability_rank_hint"),
                "legibility_trap": r.get("legibility_trap"),
                "url": r.get("posting_url"),
            }
            for r in lane_a
        ],
    }
    print(json.dumps(summary, indent=2, ensure_ascii=False))
    if len(lane_a) < TARGET_LANE_A:
        raise SystemExit(f"Only found {len(lane_a)} Lane A (wanted {TARGET_LANE_A})")


if __name__ == "__main__":
    main()
