#!/usr/bin/env python3
"""
Merge LinkedIn batch extract into washed inventory (no crawl).

- Dedupe similar_discovered cards by job_id (self)
- Drop cards already present as washed / primary scrapes
- Enrich existing washed jobs from primary jobs.jsonl
- Append net-new similar cards as WashedJob rows (card fidelity)
- Rebuild washed-companies.json from the merged job set

Usage:
  python scripts/merge_linkedin_extract.py --phase 1
  python scripts/merge_linkedin_extract.py --phase 1 --dry-run
"""

from __future__ import annotations

import argparse
import html
import json
import logging
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tally_scanner.linkedin_parse import job_id_from_url
from tally_scanner.wash import (
    WashedJob,
    classify_remote,
    classify_relevance,
    dedup_companies,
    finalize,
    normalize_url,
    parse_posted,
    parse_salary,
    slug_to_title,
)

WASHED_JOBS = ROOT.parent / "apps" / "tally" / "public" / "washed-jobs.json"
WASHED_COMPANIES = ROOT.parent / "apps" / "tally" / "public" / "washed-companies.json"
OUT_DIR = ROOT / "data" / "linkedin_extract"
JOBS_JSONL = OUT_DIR / "jobs.jsonl"
SIMILAR_JSONL = OUT_DIR / "similar_discovered.jsonl"
CHECKPOINT_PHASE1 = OUT_DIR / "checkpoint.json"
CHECKPOINT_SALES = OUT_DIR / "checkpoint_sales.json"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("merge_linkedin_extract")

JOB_ID_RE = re.compile(r"/jobs/view/[^/?#]*?(\d{6,})(?:[/?#]|$)", re.I)


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


def linkedin_job_id(url: str, explicit: str = "") -> str:
    if explicit:
        return str(explicit)
    m = JOB_ID_RE.search(url or "")
    return m.group(1) if m else (job_id_from_url(url or "") or "")


def title_from_linkedin_url(url: str) -> str:
    path = urlparse(url or "").path.rstrip("/")
    slug = path.split("/")[-1] if path else ""
    slug = re.sub(r"-\d{6,}$", "", slug)
    m = re.match(r"^(.+)-at-[a-z0-9-]+$", slug, re.I)
    if m:
        slug = m.group(1)
    return slug_to_title(slug) if slug else ""


def phase_parent_ids(phase: int) -> set[str]:
    if phase == 1:
        path = CHECKPOINT_PHASE1
    elif phase == 2:
        path = CHECKPOINT_SALES
    else:
        raise SystemExit(f"unsupported phase {phase}")
    if not path.exists():
        raise SystemExit(f"missing checkpoint {path}")
    cp = json.loads(path.read_text(encoding="utf-8"))
    return {str(x) for x in (cp.get("completed_job_ids") or [])}


def load_washed() -> tuple[dict, list[dict]]:
    payload = json.loads(WASHED_JOBS.read_text(encoding="utf-8"))
    jobs = list(payload.get("jobs") or [])
    return payload, jobs


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


def enrich_from_primary(job: WashedJob, primary: dict) -> list[str]:
    """Fill empties; also upgrade description when primary scrape is richer."""
    changed: list[str] = []
    pairs = [
        ("title", primary.get("title")),
        ("company", html.unescape(str(primary.get("company_name") or ""))),
        ("company_url", primary.get("company_linkedin_url")),
        ("location_raw", primary.get("location") or primary.get("seed_location_raw")),
        ("employment_type", primary.get("employment_type")),
        ("posted_raw", primary.get("date_posted")),
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

    if fill_if_empty(job, "posted_at", parse_posted(str(primary.get("date_posted") or ""), datetime.now(timezone.utc))):
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
        flags.add("linkedin_primary_enriched")
        if job.title:
            flags.discard("missing_title")
        if job.company:
            flags.discard("missing_company")
        if job.posted_at:
            flags.discard("no_posted")
        job.quality_flags = sorted(flags)
    return changed


def similar_to_washed(card: dict, *, discovered_at: str = "") -> WashedJob:
    url = str(card.get("url") or "").split("?")[0]
    title = title_from_linkedin_url(url)
    company = html.unescape(str(card.get("company_name") or ""))
    company_url = str(card.get("company_linkedin_url") or "")
    location = str(card.get("location") or "")
    salary_raw = str(card.get("salary_raw") or "")
    date_text = str(card.get("date_text") or "")
    posted_at = parse_posted(date_text, datetime.now(timezone.utc))
    j = WashedJob(
        source="linkedin",
        source_file="linkedin_extract/similar_discovered.jsonl",
        company=company,
        title=title,
        url=url,
        company_url=company_url,
        location_raw=location,
        salary_raw=salary_raw,
        posted_raw=date_text,
        posted_at=posted_at,
        scraped_at=(discovered_at or utc_now())[:10],
        quality_flags=["similar_card", "missing_description", "title_from_slug", "linkedin_extract_merge"],
    )
    if not title:
        j.quality_flags.append("missing_title")
        j.quality_flags = [f for f in j.quality_flags if f != "title_from_slug"]
    return finalize(j)


def primary_to_washed(primary: dict) -> WashedJob:
    url = str(primary.get("url") or primary.get("seed_url") or "").split("?")[0]
    j = WashedJob(
        source="linkedin",
        source_file="linkedin_extract/jobs.jsonl",
        company=html.unescape(str(primary.get("company_name") or "")),
        title=str(primary.get("title") or "") or title_from_linkedin_url(url),
        url=url,
        company_url=str(primary.get("company_linkedin_url") or ""),
        location_raw=str(primary.get("location") or primary.get("seed_location_raw") or ""),
        salary_raw=str(primary.get("salary_raw") or ""),
        posted_raw=str(primary.get("date_posted") or ""),
        posted_at=parse_posted(str(primary.get("date_posted") or ""), datetime.now(timezone.utc)),
        employment_type=str(primary.get("employment_type") or ""),
        description=(primary.get("description") or "")[:6000],
        scraped_at=str(primary.get("scraped_at") or "")[:10],
        quality_flags=["linkedin_primary_merge"],
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

    jobs_payload = {
        "washedAt": washed_at,
        "total": len(jobs),
        "relevance": relevance_hist,
        "jobs": [j.to_dict() for j in jobs],
    }
    companies_payload = {
        "washedAt": washed_at,
        "total": len(companies),
        "withUrl": with_link,
        "companies": [c.to_dict() for c in companies],
    }
    WASHED_JOBS.write_text(json.dumps(jobs_payload, ensure_ascii=False), encoding="utf-8")
    WASHED_COMPANIES.write_text(json.dumps(companies_payload, ensure_ascii=False), encoding="utf-8")
    return {
        "jobs": len(jobs),
        "companies": len(companies),
        "companies_with_url": with_link,
        "relevance": relevance_hist,
    }


def backup_publishes(tag: str) -> list[str]:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_dir = OUT_DIR / "merge_backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    saved: list[str] = []
    for src in (WASHED_JOBS, WASHED_COMPANIES):
        if not src.exists():
            continue
        dest = backup_dir / f"{src.stem}.{tag}.{stamp}{src.suffix}"
        shutil.copy2(src, dest)
        saved.append(str(dest))
    return saved


def run(*, phase: int, dry_run: bool) -> dict:
    parents = phase_parent_ids(phase)
    logger.info("phase %d parent seeds: %d", phase, len(parents))

    _, washed_raw = load_washed()
    jobs = [job_from_dict(d) for d in washed_raw]
    by_lid: dict[str, WashedJob] = {}
    for j in jobs:
        lid = linkedin_job_id(j.url)
        if lid:
            by_lid[lid] = j
    washed_lids = set(by_lid)
    logger.info("washed jobs=%d linkedin_ids=%d", len(jobs), len(washed_lids))

    # Primaries (prefer last write for a job_id)
    primaries: dict[str, dict] = {}
    for row in iter_jsonl(JOBS_JSONL):
        jid = linkedin_job_id(str(row.get("url") or ""), str(row.get("job_id") or ""))
        if not jid:
            continue
        # Phase scope: primary scraped from this phase's seeds, or relevance match for phase 1
        rel = str(row.get("relevance") or "")
        if jid in parents or (
            phase == 1 and rel in ("founding_sales", "founding")
        ) or (phase == 2 and rel == "sales"):
            primaries[jid] = row
    logger.info("phase primaries: %d", len(primaries))

    enriched = 0
    enrichment_fields = 0
    for jid, primary in primaries.items():
        if jid in by_lid:
            changed = enrich_from_primary(by_lid[jid], primary)
            if changed:
                enriched += 1
                enrichment_fields += len(changed)
        else:
            # Seed somehow missing from washed — add full primary row
            nj = primary_to_washed(primary)
            jobs.append(nj)
            by_lid[jid] = nj
            washed_lids.add(jid)
            enriched += 1

    # Similar cards from phase parents
    similar_raw = 0
    similar_by_id: dict[str, dict] = {}
    for row in iter_jsonl(SIMILAR_JSONL):
        parent = str(row.get("discovered_from_job_id") or "")
        if parent not in parents:
            continue
        similar_raw += 1
        jid = linkedin_job_id(str(row.get("url") or ""), str(row.get("job_id") or ""))
        if not jid:
            continue
        # keep first occurrence (stable); later dupes ignored
        if jid not in similar_by_id:
            similar_by_id[jid] = row

    self_dupes = similar_raw - len(similar_by_id)
    already_washed = 0
    already_primary = 0
    added = 0
    light_enriched = 0

    for jid, card in similar_by_id.items():
        if jid in primaries:
            already_primary += 1
            continue
        if jid in by_lid:
            already_washed += 1
            # Light enrich thin washed rows from card metadata
            j = by_lid[jid]
            changed = False
            if fill_if_empty(j, "company_url", card.get("company_linkedin_url")):
                changed = True
            if fill_if_empty(j, "location_raw", card.get("location")):
                changed = True
            if fill_if_empty(j, "salary_raw", card.get("salary_raw")):
                changed = True
            if changed:
                flags = set(j.quality_flags)
                flags.add("similar_card_touch")
                j.quality_flags = sorted(flags)
                light_enriched += 1
            continue

        nj = similar_to_washed(card, discovered_at=str(card.get("discovered_at") or ""))
        jobs.append(nj)
        by_lid[jid] = nj
        added += 1

    jobs.sort(key=lambda j: (j.posted_at or "0000"), reverse=True)
    washed_at = utc_now()

    report = {
        "phase": phase,
        "dry_run": dry_run,
        "merged_at": washed_at,
        "parents": len(parents),
        "similar_raw_from_parents": similar_raw,
        "similar_unique_job_ids": len(similar_by_id),
        "similar_self_dupes_dropped": self_dupes,
        "similar_already_in_washed": already_washed,
        "similar_already_primary": already_primary,
        "similar_added": added,
        "similar_light_enriched_existing": light_enriched,
        "primaries_seen": len(primaries),
        "jobs_enriched_from_primary": enriched,
        "primary_fields_filled": enrichment_fields,
        "jobs_before": len(washed_raw),
        "jobs_after": len(jobs),
        "net_job_delta": len(jobs) - len(washed_raw),
    }

    if dry_run:
        # Estimate company delta without writing
        companies = dedup_companies(jobs)
        report["companies_after"] = len(companies)
        report["companies_with_url"] = sum(1 for c in companies if c.url)
        report_path = OUT_DIR / f"merge_phase{phase}_dry_run.json"
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        logger.info("DRY RUN report → %s", report_path)
        logger.info("%s", json.dumps(report, indent=2))
        return report

    backups = backup_publishes(f"phase{phase}")
    report["backups"] = backups
    published = publish(jobs, washed_at)
    report.update({f"published_{k}": v for k, v in published.items()})

    report_path = OUT_DIR / f"merge_phase{phase}_report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    logger.info("published washed-jobs=%d companies=%d", published["jobs"], published["companies"])
    logger.info("report → %s", report_path)
    logger.info("%s", json.dumps({k: v for k, v in report.items() if k != "backups"}, indent=2))
    return report


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--phase", type=int, default=1, choices=[1, 2])
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    run(phase=args.phase, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
