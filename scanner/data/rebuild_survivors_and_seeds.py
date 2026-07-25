"""Rebuild survivors CSV + Tally seed lists from founding_sales_analysis.csv."""
from __future__ import annotations

import csv
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "data" / "founding_sales_analysis.csv"
SURV_PATH = ROOT / "data" / "founding_sales_survivors.csv"
SEED_PATH = (
    ROOT.parents[0]
    / "apps"
    / "tally"
    / "src"
    / "app"
    / "data"
    / "seedInventoryLists.json"
)


def main() -> None:
    with CSV_PATH.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    from collections import Counter

    print("verdicts", dict(Counter(r.get("verdict") or "" for r in rows)))
    print(
        "companywebsite resolved",
        sum(
            1
            for r in rows
            if (r.get("companywebsite") or "").strip()
            and r.get("companywebsite") != "UNKNOWN"
        ),
    )
    print(
        "openai screened",
        sum(1 for r in rows if r.get("analyzed_by") == "openai"),
    )
    print(
        "insufficient left",
        sum(1 for r in rows if (r.get("verdict") or "").lower() == "insufficient_data"),
    )

    survivors = [
        r
        for r in rows
        if (r.get("verdict") or "").lower() in ("call-ready", "conditional")
    ]
    cols = [
        "verdict",
        "dialability_rank_hint",
        "company_name",
        "company_id",
        "website",
        "companywebsite",
        "company_size",
        "founded_or_started",
        "role_title",
        "posting_url",
        "salary_raw",
        "layer_3_acv",
        "economic_risk",
        "scenario",
        "opener",
        "one_fact_to_verify",
        "verdict_notes",
        "commoditization_risk",
        "legibility_trap",
        "lane",
        "analyzed_by",
        "analyzed_at",
    ]
    with SURV_PATH.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in sorted(
            survivors,
            key=lambda x: (
                0 if (x.get("verdict") or "").lower() == "call-ready" else 1,
                x.get("dialability_rank_hint") or "9",
                (x.get("company_name") or "").lower(),
            ),
        ):
            w.writerow(r)
    print(f"wrote {len(survivors)} survivors -> {SURV_PATH}")

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
    all_ids: list[str] = []
    seen: set[str] = set()
    for r in rows:
        cid = r.get("company_id") or ""
        if cid and cid not in seen:
            seen.add(cid)
            all_ids.append(cid)
    surv_ids: list[str] = []
    seen_s: set[str] = set()
    for r in survivors:
        cid = r.get("company_id") or ""
        if cid and cid not in seen_s:
            seen_s.add(cid)
            surv_ids.append(cid)

    lists = [
        {
            "id": "list-founding-sales-analysis",
            "name": "Founding / Founding Sales — full set",
            "kind": "companies",
            "createdAt": now,
            "updatedAt": now,
            "recordIds": all_ids,
            "filterSummary": (
                f"Founding + Founding Sales · {len(all_ids)} companies · "
                "rubric pass (composer + openai enrichment)"
            ),
        },
        {
            "id": "list-founding-sales-survivors",
            "name": "Founding / Founding Sales — survivors",
            "kind": "companies",
            "createdAt": now,
            "updatedAt": now,
            "recordIds": surv_ids,
            "filterSummary": (
                f"call-ready + conditional · {len(surv_ids)} companies · "
                "after website + deep-screen enrichment"
            ),
        },
    ]
    SEED_PATH.write_text(json.dumps(lists, indent=2), encoding="utf-8")
    print(f"wrote seed lists -> {SEED_PATH} (full={len(all_ids)}, survivors={len(surv_ids)})")


if __name__ == "__main__":
    main()
