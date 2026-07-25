"""Merge analysis JSONL rows into founding_sales_analysis.csv."""
from __future__ import annotations

import csv
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
CSV_PATH = OUT / "founding_sales_analysis.csv"
JSONL_PATH = OUT / "founding_sales_analyses.jsonl"

FIELDS = [
    "founded_or_started",
    "company_size",
    "company_stage",
    "layer_0",
    "layer_0_reason",
    "layer_1a",
    "layer_1a_reason",
    "layer_1b",
    "layer_1b_reason",
    "layer_2",
    "scenario",
    "layer_3_acv",
    "economic_risk",
    "layer_4",
    "commoditization_risk",
    "verdict",
    "lane",
    "kill_layer",
    "one_fact_to_verify",
    "opener",
    "verdict_notes",
    "dialability_rank_hint",
    "legibility_trap",
    "analyzed_by",
    "analyzed_at",
]


def main() -> None:
    if not JSONL_PATH.exists():
        print("no jsonl yet")
        return
    updates: dict[str, dict] = {}
    for line in JSONL_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        row = json.loads(line)
        updates[row["company_id"]] = row

    with CSV_PATH.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
        fieldnames = list(rows[0].keys()) if rows else []

    n = 0
    for row in rows:
        u = updates.get(row["company_id"])
        if not u:
            continue
        for k in FIELDS:
            if k in u and u[k] is not None and u[k] != "":
                row[k] = u[k]
        n += 1

    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)
    print(f"merged {n} analyses; {len(updates)} unique ids in jsonl")


if __name__ == "__main__":
    main()
