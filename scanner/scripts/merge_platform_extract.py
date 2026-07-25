#!/usr/bin/env python3
"""
Merge Built In / startup.jobs batch extract into washed inventory (no crawl).

- Enrich existing washed jobs from primary jobs.jsonl
- Append net-new related cards as card-fidelity rows (quality_flags like related_card)
- Rebuild washed-companies.json via wash.dedup_companies
- Does NOT trigger crawls on related links

Usage:
  python scripts/merge_platform_extract.py --platform builtin
  python scripts/merge_platform_extract.py --platform startup_jobs
  python scripts/merge_platform_extract.py --platform builtin --dry-run
"""

from __future__ import annotations

import argparse
import html
import json
import logging
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tally_scanner.builtin_parse import job_id_from_url as builtin_job_id
from tally_scanner.startup_jobs_parse import job_id_from_url as startup_job_id
from tally_scanner.wash import (
    WashedJob,
    classify_remote,
    classify_relevance,
    dedup_companies,
    finalize,
    parse_posted,
    parse_salary,
    slug_to_title,
)

WASHED_JOBS = ROOT.parent / "apps" / "tally" / "public" / "washed-jobs.json"
WASHED_COMPANIES = ROOT.parent / "apps" / "tally" / "public" / "washed-companies.json"

PLATFORMS = {
    "builtin": {
        "source": "builtin",
        "out_dir": ROOT / "data" / "builtin_extract",
        "job_id_fn": builtin_job_id,
        "flag_primary": "builtin_primary_enriched",
        "flag_merge": "builtin_primary_merge",
        "flag_related": "related_card",
    },
    "startup_jobs": {
        "source": "startup_jobs",
        "out_dir": ROOT / "data" / "startup_jobs_extract",
        "job_id_fn": startup_job_id,
        "flag_primary": "startup_jobs_primary_enriched",
        "flag_merge": "startup_jobs_primary_merge",
        "flag_related": "related_card",
    },
}

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("merge_platform_extract")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def iter_jsonl(path: Path):
    if not path.exists():
        return
    with path.open("r", encoding="utf-8") as fh:
        for i, line in enumerate(fh):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                logger.warning("skip corrupt jsonl line %s:%d", path.name, i + 1)


def title_from_url(url: str, source: str) -> str:
    path = urlparse(url or "").path.rstrip("/")
    slug = path.split("/")[-1] if path else ""
    if source == "builtin":
        # /job/founding-ae/123 → previous segment
        parts = [p for p in path.split("/") if p]
        if len(parts) >= 2 and parts[-1].isdigit():
            slug = parts[-2]
    else:
        slug = re_sub_id(slug)
    return slug_to_title(slug) if slug else ""


def re_sub_id(slug: str) -> str:
    import re

    return re.sub(r"-\d{4,}$", "", slug or "")


def job_from_dict(d: dict) -> WashedJob:
    return WashedJob(
        id=str(d.get("id") or ""),
        source=str(d.get("source") or ""),
        source_file=str(d.get("source_file") or ""),
        company=str(d.get("company") or ""),
        title=str(d.get("title") or ""),
        url=str(d.get("url") or ""),
        company_url=str(d.get("company_url") or ""),
        location_raw=str(d.get("location_raw") or ""),
        remote=str(d.get("remote") or "unknown"),
        salary_raw=str(d.get("salary_raw") or ""),
        salary_min=d.get("salary_min"),
        salary_max=d.get("salary_max"),
        salary_currency=str(d.get("salary_currency") or ""),
        salary_period=str(d.get("salary_period") or ""),
        equity_raw=str(d.get("equity_raw") or ""),
        posted_raw=str(d.get("posted_raw") or ""),
        posted_at=str(d.get("posted_at") or ""),
        employment_type=str(d.get("employment_type") or ""),
        seniority=str(d.get("seniority") or ""),
        description=str(d.get("description") or ""),
        skills=list(d.get("skills") or []),
        company_stage=str(d.get("company_stage") or ""),
        company_size=str(d.get("company_size") or ""),
        industries=str(d.get("industries") or ""),
        logo_url=str(d.get("logo_url") or ""),
        scraped_at=str(d.get("scraped_at") or ""),
        relevance=str(d.get("relevance") or "other"),
        quality_flags=list(d.get("quality_flags") or []),
    )


def fill_if_empty(job: WashedJob, field: str, value) -> bool:
    if value is None or value == "" or value == []:
        return False
    cur = getattr(job, field)
    if cur is None or cur == "" or cur == [] or cur == "unknown":
        setattr(job, field, value)
        return True
    return False


def enrich_from_primary(job: WashedJob, primary: dict, *, flag: str) -> list[str]:
    changed: list[str] = []
    pairs = [
        ("title", primary.get("title")),
        ("company", html.unescape(str(primary.get("company_name") or ""))),
        ("company_url", primary.get("company_url")),
        ("location_raw", primary.get("location") or primary.get("seed_location_raw")),
        ("employment_type", primary.get("employment_type")),
        ("posted_raw", primary.get("date_posted")),
        ("salary_raw", primary.get("salary_raw")),
    ]
    for field, val in pairs:
        if fill_if_empty(job, field, val):
            changed.append(field)

    desc = (primary.get("description") or "")[:6000]
    if desc:
        cur = job.description or ""
        if not cur or len(desc) > len(cur) + 80:
            job.description = desc
            changed.append("description")

    if fill_if_empty(
        job,
        "posted_at",
        parse_posted(str(primary.get("date_posted") or ""), datetime.now(timezone.utc)),
    ):
        changed.append("posted_at")

    scraped = str(primary.get("scraped_at") or "")[:10]
    if scraped and fill_if_empty(job, "scraped_at", scraped):
        changed.append("scraped_at")

    if changed:
        lo, hi, cur, period, equity = parse_salary(job.salary_raw)
        if job.salary_min is None and lo is not None:
            job.salary_min = lo
        if job.salary_max is None and hi is not None:
            job.salary_max = hi
        if not job.salary_currency:
            job.salary_currency = cur
        if not job.salary_period:
            job.salary_period = period
        if equity and not job.equity_raw:
            job.equity_raw = equity
        job.remote = classify_remote(job.location_raw, job.description[:300])
        job.relevance = classify_relevance(job.title, job.description)
        flags = set(job.quality_flags)
        flags.add(flag)
        if job.title:
            flags.discard("missing_title")
        if job.company:
            flags.discard("missing_company")
        if job.posted_at:
            flags.discard("no_posted")
        if job.description:
            flags.discard("missing_description")
        job.quality_flags = sorted(flags)
    return changed


def related_to_washed(card: dict, *, source: str, source_file: str, flag: str, discovered_at: str = "") -> WashedJob:
    url = str(card.get("url") or "").split("?")[0]
    title = title_from_url(url, source) or str(card.get("title") or "")
    company = html.unescape(str(card.get("company_name") or ""))
    j = WashedJob(
        source=source,
        source_file=source_file,
        company=company,
        title=title,
        url=url,
        company_url=str(card.get("company_url") or ""),
        location_raw=str(card.get("location") or ""),
        scraped_at=(discovered_at or utc_now())[:10],
        quality_flags=[flag, "missing_description", "title_from_slug", f"{source}_extract_merge"],
    )
    if not title:
        j.quality_flags.append("missing_title")
        j.quality_flags = [f for f in j.quality_flags if f != "title_from_slug"]
    return finalize(j)


def primary_to_washed(primary: dict, *, source: str, source_file: str, flag: str) -> WashedJob:
    url = str(primary.get("url") or primary.get("seed_url") or "").split("?")[0]
    j = WashedJob(
        source=source,
        source_file=source_file,
        company=html.unescape(str(primary.get("company_name") or "")),
        title=str(primary.get("title") or "") or title_from_url(url, source),
        url=url,
        company_url=str(primary.get("company_url") or ""),
        location_raw=str(primary.get("location") or primary.get("seed_location_raw") or ""),
        salary_raw=str(primary.get("salary_raw") or ""),
        posted_raw=str(primary.get("date_posted") or ""),
        posted_at=parse_posted(str(primary.get("date_posted") or ""), datetime.now(timezone.utc)),
        employment_type=str(primary.get("employment_type") or ""),
        description=(primary.get("description") or "")[:6000],
        scraped_at=str(primary.get("scraped_at") or "")[:10],
        quality_flags=[flag],
    )
    if not j.title:
        j.quality_flags.append("title_from_slug")
    return finalize(j)


def publish(jobs: list[WashedJob], washed_at: str) -> dict:
    relevance_hist: dict[str, int] = {}
    for j in jobs:
        relevance_hist[j.relevance] = relevance_hist.get(j.relevance, 0) + 1

    companies = dedup_companies(jobs)
    with_link = sum(1 for c in companies if c.url)

    # Preserve LinkedIn company enrich fields already on disk when ids match
    existing_enrich: dict[str, dict] = {}
    if WASHED_COMPANIES.exists():
        prev = json.loads(WASHED_COMPANIES.read_text(encoding="utf-8"))
        for c in prev.get("companies") or []:
            cid = str(c.get("id") or "")
            if cid and c.get("website"):
                existing_enrich[cid] = c

    company_dicts = []
    for c in companies:
        d = c.to_dict()
        prev = existing_enrich.get(c.id)
        if prev:
            for k in (
                "website",
                "employee_count",
                "size_bucket",
                "follower_count",
                "hq_country",
                "hq_locality",
                "hq_region",
                "founded",
                "org_description",
                "recent_post_themes",
                "enrich_flag",
                "enriched_at",
                "linkedin_enrich_resolved",
            ):
                if prev.get(k) not in (None, "", []) and d.get(k) in (None, "", [], False):
                    d[k] = prev[k]
        company_dicts.append(d)

    jobs_payload = {
        "washedAt": washed_at,
        "total": len(jobs),
        "relevance": relevance_hist,
        "jobs": [j.to_dict() for j in jobs],
    }
    companies_payload = {
        "washedAt": washed_at,
        "total": len(company_dicts),
        "withUrl": with_link,
        "companies": company_dicts,
    }
    WASHED_JOBS.write_text(json.dumps(jobs_payload, ensure_ascii=False), encoding="utf-8")
    WASHED_COMPANIES.write_text(json.dumps(companies_payload, ensure_ascii=False), encoding="utf-8")
    return {
        "jobs": len(jobs),
        "companies": len(company_dicts),
        "companies_with_url": with_link,
        "relevance": relevance_hist,
    }


def backup_publishes(out_dir: Path, tag: str) -> list[str]:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_dir = out_dir / "merge_backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    saved: list[str] = []
    for src in (WASHED_JOBS, WASHED_COMPANIES):
        if not src.exists():
            continue
        dest = backup_dir / f"{src.stem}.{tag}.{stamp}{src.suffix}"
        shutil.copy2(src, dest)
        saved.append(str(dest))
    return saved


def run(*, platform: str, dry_run: bool) -> dict:
    cfg = PLATFORMS[platform]
    out_dir: Path = cfg["out_dir"]
    source: str = cfg["source"]
    job_id_fn = cfg["job_id_fn"]
    jobs_jsonl = out_dir / "jobs.jsonl"
    related_jsonl = out_dir / "related_discovered.jsonl"

    payload = json.loads(WASHED_JOBS.read_text(encoding="utf-8"))
    washed_raw = list(payload.get("jobs") or [])
    jobs = [job_from_dict(d) for d in washed_raw]

    by_pid: dict[str, WashedJob] = {}
    by_url: dict[str, WashedJob] = {}
    for j in jobs:
        if j.source != source:
            continue
        pid = job_id_fn(j.url) or ""
        if pid:
            by_pid[pid] = j
        if j.url:
            by_url[j.url.split("?")[0].lower()] = j

    primaries: dict[str, dict] = {}
    for row in iter_jsonl(jobs_jsonl):
        jid = str(row.get("job_id") or "") or (job_id_fn(str(row.get("url") or "")) or "")
        if not jid:
            continue
        primaries[jid] = row
    logger.info("platform=%s washed=%d primaries=%d", platform, len(washed_raw), len(primaries))

    enriched = 0
    enrichment_fields = 0
    for jid, primary in primaries.items():
        target = by_pid.get(jid)
        if not target:
            url = str(primary.get("url") or "").split("?")[0].lower()
            target = by_url.get(url)
        if target:
            changed = enrich_from_primary(target, primary, flag=cfg["flag_primary"])
            if changed:
                enriched += 1
                enrichment_fields += len(changed)
        else:
            nj = primary_to_washed(
                primary,
                source=source,
                source_file=f"{out_dir.name}/jobs.jsonl",
                flag=cfg["flag_merge"],
            )
            jobs.append(nj)
            by_pid[jid] = nj
            enriched += 1

    related_raw = 0
    related_by_id: dict[str, dict] = {}
    for row in iter_jsonl(related_jsonl):
        related_raw += 1
        jid = str(row.get("job_id") or "") or (job_id_fn(str(row.get("url") or "")) or "")
        if not jid:
            continue
        if jid not in related_by_id:
            related_by_id[jid] = row

    already_primary = 0
    already_washed = 0
    added = 0
    for jid, card in related_by_id.items():
        if jid in primaries:
            already_primary += 1
            continue
        if jid in by_pid:
            already_washed += 1
            continue
        nj = related_to_washed(
            card,
            source=source,
            source_file=f"{out_dir.name}/related_discovered.jsonl",
            flag=cfg["flag_related"],
            discovered_at=str(card.get("discovered_at") or ""),
        )
        jobs.append(nj)
        by_pid[jid] = nj
        added += 1

    jobs.sort(key=lambda j: (j.posted_at or "0000"), reverse=True)
    washed_at = utc_now()

    report = {
        "platform": platform,
        "dry_run": dry_run,
        "merged_at": washed_at,
        "primaries_seen": len(primaries),
        "jobs_enriched_from_primary": enriched,
        "primary_fields_filled": enrichment_fields,
        "related_raw": related_raw,
        "related_unique": len(related_by_id),
        "related_already_primary": already_primary,
        "related_already_washed": already_washed,
        "related_added": added,
        "jobs_before": len(washed_raw),
        "jobs_after": len(jobs),
        "net_job_delta": len(jobs) - len(washed_raw),
    }

    if dry_run:
        companies = dedup_companies(jobs)
        report["companies_after"] = len(companies)
        report_path = out_dir / "merge_dry_run.json"
        out_dir.mkdir(parents=True, exist_ok=True)
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        logger.info("DRY RUN report → %s", report_path)
        logger.info("%s", json.dumps(report, indent=2))
        return report

    backups = backup_publishes(out_dir, platform)
    report["backups"] = backups
    published = publish(jobs, washed_at)
    report.update({f"published_{k}": v for k, v in published.items()})
    report_path = out_dir / "merge_report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    logger.info("published washed-jobs=%d companies=%d", published["jobs"], published["companies"])
    logger.info("report → %s", report_path)
    return report


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--platform", required=True, choices=sorted(PLATFORMS))
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    run(platform=args.platform, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
