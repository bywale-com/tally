"""One-off: LinkedIn seed pile stats by relevance tier."""

from __future__ import annotations

import csv
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
WASHED = ROOT.parent / "apps" / "tally" / "public" / "washed-jobs.json"
JOB_RE = re.compile(r"linkedin\.com/jobs/view/[^\s,\"']*?(\d{6,})", re.I)


def urls_from_csv(path: Path) -> tuple[set[str], set[str]]:
    urls: set[str] = set()
    ids: set[str] = set()
    if not path.exists():
        return urls, ids
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        for row in csv.DictReader(f):
            u = ""
            for key in ("url", "posting_url"):
                if row.get(key) and "linkedin.com/jobs/view" in row[key]:
                    u = row[key]
                    break
            if not u:
                for v in row.values():
                    if isinstance(v, str) and "linkedin.com/jobs/view" in v:
                        u = v
                        break
            if not u:
                continue
            clean = u.split("?")[0]
            urls.add(clean)
            m = JOB_RE.search(u)
            if m:
                ids.add(m.group(1))
    return urls, ids


def main() -> None:
    jobs = json.loads(WASHED.read_text(encoding="utf-8"))["jobs"]
    li = [j for j in jobs if j.get("source") == "linkedin"]

    by_rel: dict[str, set[str]] = defaultdict(set)
    by_co: dict[str, set[str]] = defaultdict(set)
    co_to_rel: dict[str, set[str]] = defaultdict(set)

    for j in li:
        url = (j.get("url") or "").split("?")[0]
        rel = j.get("relevance") or "other"
        co = j.get("company") or ""
        if url:
            by_rel[rel].add(url)
            by_co[co].add(url)
        co_to_rel[co].add(rel)

    print("=== LinkedIn jobs in washed inventory ===")
    for rel in ("founding_sales", "founding", "sales", "other"):
        print(f"  {rel}: {len(by_rel[rel])} unique job URLs")
    all_urls = set().union(*by_rel.values())
    print(f"  TOTAL unique LinkedIn job URLs: {len(all_urls)}")
    print(f"  unique companies (display name): {len(by_co)}")
    multi = sum(1 for rels in co_to_rel.values() if len(rels) > 1)
    print(f"  companies in >1 relevance tier: {multi}")

    u_fs, i_fs = urls_from_csv(DATA / "jobs_founding_sales.csv")
    u_fa, i_fa = urls_from_csv(DATA / "founding_sales_analysis.csv")
    u_sv, i_sv = urls_from_csv(DATA / "founding_sales_survivors.csv")
    print("\n=== founding CSVs (job id overlap) ===")
    print(f"  jobs_founding_sales: {len(i_fs)} ids")
    print(f"  founding_sales_analysis: {len(i_fa)} ids")
    print(f"  founding_sales_survivors: {len(i_sv)} ids")
    print(f"  union founding CSV ids: {len(i_fs | i_fa | i_sv)}")
    print(f"  founding_sales ∩ analysis: {len(i_fs & i_fa)}")
    print(f"  founding_sales ∩ survivors: {len(i_fs & i_sv)}")


if __name__ == "__main__":
    main()
