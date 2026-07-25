#!/usr/bin/env python3
"""
Smoke-test parsers + one Stealthy fetch each for Built In / startup.jobs.

No recursive company follow. Optional single Built In company page only.

Usage:
  python scripts/smoke_platform_fetch.py
  python scripts/smoke_platform_fetch.py --no-fetch   # parse-only against saved HTML if present
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tally_scanner.builtin_parse import (
    harvest_related_jobs,
    parse_company_page,
    parse_primary_job as parse_builtin,
)
from tally_scanner.startup_jobs_parse import (
    harvest_related_jobs as harvest_startup_related,
    parse_primary_job as parse_startup,
)
from tally_scanner.stealthy_fetch import fetch_stealthy

OUT = ROOT / "data" / "linkedin_extract" / "platform_smoke.json"


def pick_startup_url() -> str:
    csv_path = ROOT / "manual_scrapes_raw" / "startup.csv"
    if csv_path.exists():
        with csv_path.open(encoding="utf-8-sig", newline="") as fh:
            for row in csv.reader(fh):
                for cell in row:
                    if "startup.jobs/" in cell and "/company/" not in cell and re.search(r"-\d{4,}", cell):
                        return cell.strip().split("?")[0]
    return "https://startup.jobs/founding-sales-leader-cgs-immersive-8752827"


def summarize_job(label: str, parsed: dict, related: list) -> dict:
    return {
        "label": label,
        "url": parsed.get("url"),
        "parse_ok": parsed.get("parse_ok"),
        "title": parsed.get("title"),
        "company_name": parsed.get("company_name"),
        "company_url": parsed.get("company_url"),
        "website": parsed.get("website"),
        "description_len": len(parsed.get("description") or ""),
        "description_preview": (parsed.get("description") or "")[:240],
        "related_count": len(related),
        "related_sample": [r.get("url") for r in related[:5]],
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--fetch-company", action="store_true", help="Also fetch one Built In company page")
    ap.add_argument("--no-fetch", action="store_true", help="Skip network (exit after printing plan)")
    args = ap.parse_args()

    samples = [
        ("builtin_job", "https://builtin.com/job/founding-account-executive/10216174"),
        ("startup_job", pick_startup_url()),
    ]
    if args.fetch_company:
        samples.append(("builtin_company", "https://builtin.com/company/judgment-labs"))

    if args.no_fetch:
        print(json.dumps({"planned": samples}, indent=2))
        return

    results: list[dict] = []
    for label, url in samples:
        print(f"\n=== {label} ===\n{url}")
        r = fetch_stealthy(url, timeout_ms=90_000)
        html = r.get("html") or ""
        base = {
            "label": label,
            "url": url,
            "ok": r.get("ok"),
            "status_code": r.get("status_code"),
            "html_len": len(html),
        }
        if not r.get("ok") or len(html) < 800:
            results.append({**base, "error": r.get("error") or "fetch_failed"})
            print(f"  FAIL status={r.get('status_code')} err={r.get('error')}")
            continue

        if label == "builtin_job":
            parsed = parse_builtin(html=html, url=url, seed_url=url)
            related = harvest_related_jobs(html, str(parsed.get("job_id") or ""))
            summary = {**base, **summarize_job(label, parsed, related)}
        elif label == "startup_job":
            parsed = parse_startup(html=html, url=url, seed_url=url)
            related = harvest_startup_related(html, str(parsed.get("job_id") or ""))
            summary = {**base, **summarize_job(label, parsed, related)}
        else:
            co = parse_company_page(html, url=url)
            summary = {
                **base,
                "name": co.get("name"),
                "website": co.get("website"),
                "employee_count": co.get("employee_count"),
                "parse_ok": co.get("parse_ok"),
            }
        results.append(summary)
        print(json.dumps({k: summary[k] for k in summary if k != "description_preview"}, indent=2)[:1200])
        if summary.get("description_preview"):
            print(f"  preview: {summary['description_preview'][:200]}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {OUT}")


if __name__ == "__main__":
    main()
