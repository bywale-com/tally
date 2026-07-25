#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from tally_scanner.stealthy_fetch import fetch_stealthy

JSON_LD_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S,
)


def parse_ld(html: str) -> list:
    blocks = []
    for m in JSON_LD_RE.finditer(html):
        try:
            blocks.append(json.loads(m.group(1).strip()))
        except json.JSONDecodeError:
            pass
    return blocks


def find_type(blocks: list, typ: str) -> dict:
    for b in blocks:
        items = b if isinstance(b, list) else [b]
        if isinstance(b, dict) and "@graph" in b:
            items = b["@graph"]
        for it in items:
            if not isinstance(it, dict):
                continue
            ty = it.get("@type")
            types = ty if isinstance(ty, list) else [ty]
            if typ in types:
                return it
    return {}


URLS = {
    "builtin_job": "https://builtin.com/job/founding-account-executive/10216174",
    "builtin_company": "https://builtin.com/company/judgment-labs",
    "startup_job": "https://startup.jobs/founding-sales-leader-cgs-immersive-8752827",
    "startup_company": "https://startup.jobs/company/cgs-immersive",
}

results = {}
for label, url in URLS.items():
    r = fetch_stealthy(url)
    html = r.get("html") or ""
    blocks = parse_ld(html)
    entry = {"url": url, "ok": r.get("ok"), "status": r.get("status_code"), "html_len": len(html)}
    if "job" in label:
        jp = find_type(blocks, "JobPosting")
        org = jp.get("hiringOrganization") or {}
        entry.update(
            {
                "title": jp.get("title"),
                "description_len": len(jp.get("description") or ""),
                "description_preview": (jp.get("description") or "")[:240],
                "datePosted": jp.get("datePosted"),
                "employmentType": jp.get("employmentType"),
                "jobLocation": jp.get("jobLocation"),
                "baseSalary": jp.get("baseSalary"),
                "company_name": org.get("name"),
                "company_url": org.get("sameAs") or org.get("url"),
            }
        )
    else:
        org = find_type(blocks, "Organization")
        entry.update(
            {
                "name": org.get("name"),
                "url": org.get("url"),
                "sameAs": org.get("sameAs"),
                "description_len": len(org.get("description") or ""),
                "description_preview": (org.get("description") or "")[:240],
                "employees": org.get("numberOfEmployees"),
            }
        )
    if "builtin" in url:
        entry["sample_job_paths"] = list(dict.fromkeys(re.findall(r'href="(/job/[^"]+)"', html)))[:6]
        entry["sample_company_paths"] = list(dict.fromkeys(re.findall(r'href="(/company/[^"]+)"', html)))[:6]
    if "startup.jobs" in url:
        entry["sample_job_urls"] = list(
            dict.fromkeys(re.findall(r'href="(https://startup\.jobs/[^"]+-\d{4,})"', html))
        )[:6]
        entry["sample_company_urls"] = list(
            dict.fromkeys(re.findall(r'href="(https://startup\.jobs/company/[^"]+)"', html))
        )[:6]
    results[label] = entry
    print(json.dumps({label: entry}, indent=2, ensure_ascii=False)[:2000])
    print()

out = ROOT / "data" / "linkedin_extract" / "platform_smoke.json"
out.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
print("Wrote", out)
