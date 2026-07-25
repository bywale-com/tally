"""Build 5 unique Lane A from last run log + continue screening."""

from __future__ import annotations

import csv
import json
import logging
import re
from pathlib import Path

from tally_scanner import db
from tally_scanner.deep_screener import (
    CSV_FIELDS,
    deep_screen_one,
    flat_row,
    write_csv_from_results,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

TARGET = 5
OUT = Path("data/lane_a_five.csv")
FULL = Path("data/lane_a_five_full_screen_log.csv")


def normalize_key(company: str, url: str, title: str) -> str:
    blob = f"{company} {url} {title}".lower()
    if any(x in blob for x in ("puntt", "review the world", "eliminate review", "eliminate performance")):
        return "puntt"
    if "niceboard" in blob or ("job board" in blob and "white-label" in blob):
        return "niceboard"
    if "nextpunch" in blob or ("mobile service" in blob and "location" in blob):
        return "nextpunch"
    if "cogram" in blob:
        return "cogram"
    if "aktos" in blob:
        return "aktos"
    if "corepilot" in blob:
        return "corepilot"
    if "cuebox" in blob:
        return "cuebox"
    if "kana" in blob or "agentic marketing" in blob:
        return "kana"
    if "computergenerated" in blob or "renewal enhancement" in blob:
        return "cgs"
    if "bigblue" in blob:
        return "bigblue"
    if "toast" in blob or "toasttab" in blob:
        return "toast"
    for pat, name in (
        (r"greenhouse\.io/([^/]+)", None),
        (r"job-boards\.greenhouse\.io/([^/]+)", None),
        (r"lever\.co/([^/]+)", None),
        (r"ashbyhq\.com/([^/]+)", None),
    ):
        m = re.search(pat, url.lower())
        if m:
            return m.group(1)
    return (company or title or "x")[:40].strip().lower()


def load_prior_flats() -> list[dict]:
    if not FULL.exists():
        return []
    with FULL.open(encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def flat_to_resultish(row: dict) -> dict:
    """Minimal structure write_csv_from_results/flat_row can re-emit via direct fields."""
    # We already have flats — write via DictWriter with CSV_FIELDS
    return row


def main() -> None:
    prior = load_prior_flats()
    lane_a: dict[str, dict] = {}

    # Recover Lane A from prior flats
    for row in prior:
        if (row.get("lane") or "").upper() != "A":
            continue
        if (row.get("verdict") or "").lower() == "dead":
            continue
        key = normalize_key(row.get("company") or "", row.get("posting_url") or "", row.get("role_title") or "")
        old = lane_a.get(key)
        if not old:
            lane_a[key] = row
        else:
            try:
                if int(row.get("dialability_rank_hint") or 99) < int(old.get("dialability_rank_hint") or 99):
                    lane_a[key] = row
            except (TypeError, ValueError):
                pass

    logging.info("Recovered %d unique Lane A from prior log: %s", len(lane_a), list(lane_a.keys()))

    screened_urls = {(r.get("posting_url") or "") for r in prior}

    with db.connect() as conn:
        rows = conn.execute(
            """
            SELECT id, company, title, url, raw_text
            FROM postings
            WHERE filter_status = 'in'
            ORDER BY id
            """
        ).fetchall()

    new_results: list[dict] = []
    for row in rows:
        if len(lane_a) >= TARGET:
            break
        url = row.get("url") or ""
        if url in screened_urls:
            continue
        key_preview = normalize_key(row["company"], url, row["title"])
        if key_preview in lane_a:
            continue

        logging.info("Deep screen #%s %s — %s", row["id"], row["company"], (row["title"] or "")[:55])
        result = deep_screen_one(
            company=row["company"],
            title=row["title"],
            raw_text=row["raw_text"] or "",
            url=url,
        )
        result["posting_id"] = row["id"]
        new_results.append(result)
        screened_urls.add(url)

        lane = (result.get("lane") or "").upper()
        verdict = (result.get("verdict") or "").lower()
        key = normalize_key(result.get("company") or row["company"], url, row["title"])
        logging.info("→ verdict=%s lane=%s key=%s hint=%s", verdict, lane, key, result.get("dialability_rank_hint"))
        if lane == "A" and verdict != "dead" and key not in lane_a:
            lane_a[key] = flat_row(result)
            logging.info("  LANE A unique %d/%d (%s)", len(lane_a), TARGET, key)

    # Merge new into full log
    all_flats = list(prior)
    for r in new_results:
        all_flats.append(flat_row(r))

    finals = list(lane_a.values())[:TARGET]
    # Sort with dialability
    def sk(r):
        v = {"call-ready": 0, "conditional": 1}.get((r.get("verdict") or "").lower(), 5)
        try:
            h = int(r.get("dialability_rank_hint") or 99)
        except (TypeError, ValueError):
            h = 99
        return (v, h)

    finals.sort(key=sk)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(finals)

    with FULL.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader()
        w.writerows(all_flats)

    print(
        json.dumps(
            {
                "lane_a_count": len(finals),
                "keys": list(lane_a.keys())[:TARGET],
                "csv": str(OUT.resolve()),
                "companies": [
                    {
                        "company": r.get("company"),
                        "verdict": r.get("verdict"),
                        "hint": r.get("dialability_rank_hint"),
                        "url": r.get("posting_url"),
                    }
                    for r in finals
                ],
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    if len(finals) < TARGET:
        raise SystemExit(f"Only {len(finals)} unique Lane A")


if __name__ == "__main__":
    main()
