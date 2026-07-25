"""Continue deep-screen until 20 unique A-list rows; write CSVs."""

from __future__ import annotations

import csv
import json
import logging
from pathlib import Path

from tally_scanner import db
from tally_scanner.deep_screener import CSV_FIELDS, deep_screen_one, flat_row

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

TARGET = 20
prev_path = Path("data/deep_screen_a_list.csv")
prev_companies: set[str] = set()
prev_results_rows: list[dict] = []

if prev_path.exists():
    with prev_path.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            prev_results_rows.append(row)
            key = (row.get("role_title") or "").strip().lower() + "|" + (row.get("posting_url") or "").strip().lower()
            prev_companies.add(key)

with db.connect() as conn:
    rows = conn.execute(
        """
        SELECT id, company, title, url, raw_text
        FROM postings
        WHERE filter_status = 'in'
        ORDER BY id
        """
    ).fetchall()

a_list = [r for r in prev_results_rows if str(r.get("a_list", "")).lower() in {"true", "1"}]
logging.info("existing a_list=%s screened=%s db_ins=%s", len(a_list), len(prev_results_rows), len(rows))

for row in rows:
    if len({(r.get("company") or "").strip().lower() for r in a_list}) >= TARGET:
        break
    key = (row["title"] or "").strip().lower() + "|" + (row.get("url") or "").strip().lower()
    if key in prev_companies:
        continue
    logging.info("screening #%s %s — %s", row["id"], row["company"], (row["title"] or "")[:60])
    result = deep_screen_one(
        company=row["company"],
        title=row["title"],
        raw_text=row["raw_text"] or "",
        url=row.get("url"),
    )
    fr = flat_row(result)
    prev_results_rows.append(fr)
    prev_companies.add(key)
    if result.get("a_list"):
        a_list.append(fr)
        logging.info("A-LIST (%s) verdict=%s", len(a_list), result.get("verdict"))
    else:
        logging.info("kill verdict=%s at=%s", result.get("verdict"), result.get("killed_at"))

full_path = Path("data/deep_screen_full.csv")
with full_path.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
    w.writeheader()
    rows_out = sorted(
        prev_results_rows,
        key=lambda r: (0 if str(r.get("a_list")).lower() in {"true", "1"} else 1, r.get("company") or ""),
    )
    w.writerows(rows_out)

a_path = Path("data/tally_a_list_20.csv")
seen: set[str] = set()
deduped: list[dict] = []
for r in a_list:
    c = (r.get("company") or "").strip().lower()
    if not c or c in seen:
        continue
    seen.add(c)
    deduped.append(r)
deduped = deduped[:TARGET]

with a_path.open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
    w.writeheader()
    w.writerows(deduped)

# Also copy an easy name
easy = Path("data/tally_a_list.csv")
easy.write_text(a_path.read_text(encoding="utf-8"), encoding="utf-8")

print(
    json.dumps(
        {
            "a_list_unique": len(deduped),
            "a_list_csv": str(a_path.resolve()),
            "full_csv": str(full_path.resolve()),
            "companies": [r.get("company") for r in deduped],
        },
        indent=2,
    )
)
