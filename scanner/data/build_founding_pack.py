"""Build Founding / Founding Sales analysis pack from washed inventory."""
from __future__ import annotations

import csv
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "apps" / "tally" / "public"
OUT = Path(__file__).resolve().parent

TARGET = {"founding", "founding_sales"}


def norm(s: str | None) -> str:
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def score_job(j: dict) -> tuple:
    rel = j.get("relevance") or ""
    if rel == "founding_sales":
        pri = 3
    elif rel == "founding":
        pri = 2
    elif "founding" in (j.get("title") or "").lower():
        pri = 1
    else:
        pri = 0
    desc = j.get("description") or ""
    return (pri, len(desc), j.get("posted_at") or "")


def main() -> None:
    companies = json.loads((BASE / "washed-companies.json").read_text(encoding="utf-8"))["companies"]
    jobs = json.loads((BASE / "washed-jobs.json").read_text(encoding="utf-8"))["jobs"]

    targets = [c for c in companies if set(c.get("role_tags") or []) & TARGET]

    by_company_url: dict[str, list] = defaultdict(list)
    by_name: dict[str, list] = defaultdict(list)
    for j in jobs:
        if j.get("company_url"):
            by_company_url[norm(j["company_url"])].append(j)
        by_name[norm(j.get("company"))].append(j)

    pack = []
    for c in targets:
        cands: list = []
        if c.get("url"):
            cands.extend(by_company_url.get(norm(c["url"]), []))
        cands.extend(by_name.get(norm(c["name"]), []))
        seen: set[str] = set()
        uniq = []
        for j in cands:
            if j["id"] in seen:
                continue
            seen.add(j["id"])
            uniq.append(j)
        foundingish = [
            j
            for j in uniq
            if (j.get("relevance") in TARGET)
            or re.search(r"founding", (j.get("title") or ""), re.I)
        ]
        pool = foundingish or uniq
        pool.sort(key=score_job, reverse=True)
        best = pool[0] if pool else None
        desc = (best.get("description") or "") if best else ""
        pack.append(
            {
                "company_id": c["id"],
                "company_name": c["name"],
                "website": c.get("url") or (best.get("company_url") if best else "") or "",
                "role_tags": ",".join(c.get("role_tags") or []),
                "job_count": c.get("job_count"),
                "sources": ",".join(c.get("sources") or []),
                "best_job_id": best["id"] if best else "",
                "role_title": best.get("title") if best else "",
                "posting_url": best.get("url") if best else "",
                "salary_raw": best.get("salary_raw") if best else "",
                "company_size": best.get("company_size") if best else "",
                "company_stage": best.get("company_stage") if best else "",
                "industries": ",".join(best.get("industries") or []) if best else "",
                "location_raw": best.get("location_raw") if best else "",
                "remote": best.get("remote") if best else "",
                "posted_at": best.get("posted_at") if best else "",
                "description": desc,
                "description_len": len(desc),
            }
        )

    print("pack", len(pack))
    print("with desc>200", sum(1 for p in pack if p["description_len"] > 200))
    print("with size", sum(1 for p in pack if p["company_size"]))
    print("with stage", sum(1 for p in pack if p["company_stage"]))

    (OUT / "founding_sales_pack.json").write_text(
        json.dumps(pack, indent=2), encoding="utf-8"
    )
    print("wrote", OUT / "founding_sales_pack.json")

    cols = [
        "company_id",
        "company_name",
        "website",
        "company_size",
        "company_stage",
        "founded_or_started",
        "industries",
        "role_tags",
        "role_title",
        "posting_url",
        "salary_raw",
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
    path = OUT / "founding_sales_analysis.csv"
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for p in sorted(pack, key=lambda x: x["company_name"].lower()):
            w.writerow(
                {
                    "company_id": p["company_id"],
                    "company_name": p["company_name"],
                    "website": p["website"],
                    "company_size": p["company_size"],
                    "company_stage": p["company_stage"],
                    "founded_or_started": "",
                    "industries": p["industries"],
                    "role_tags": p["role_tags"],
                    "role_title": p["role_title"],
                    "posting_url": p["posting_url"],
                    "salary_raw": p["salary_raw"],
                }
            )
    print("wrote", path, "rows", len(pack))


if __name__ == "__main__":
    main()
