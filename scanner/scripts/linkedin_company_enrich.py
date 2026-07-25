#!/usr/bin/env python3
"""
LinkedIn company profile enrich (offline batch).

Fetches guest /company/{slug} pages via Stealthy, parses with
parse_company_unescaped, appends to companies.jsonl.

Usage:
  python scripts/linkedin_company_enrich.py --smoke 3
  python scripts/linkedin_company_enrich.py --limit 20
  python scripts/linkedin_company_enrich.py --url https://www.linkedin.com/company/tracebit
  python scripts/linkedin_company_enrich.py --publish   # merge jsonl → washed-companies.json
"""

from __future__ import annotations

import argparse
import json
import logging
import random
import shutil
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tally_scanner.batch_notify import format_company_summary, notify_config, send_email
from tally_scanner.linkedin_parse import company_slug_from_url, parse_company_unescaped
from tally_scanner.stealthy_fetch import fetch_stealthy

WASHED_COMPANIES = ROOT.parent / "apps" / "tally" / "public" / "washed-companies.json"
OUT_DIR = ROOT / "data" / "linkedin_extract"
COMPANIES_OUT = OUT_DIR / "companies.jsonl"
FAILED_OUT = OUT_DIR / "companies_failed.jsonl"
CHECKPOINT = OUT_DIR / "checkpoint_companies.json"

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("linkedin_company_enrich")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def append_jsonl(path: Path, row: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row, ensure_ascii=False) + "\n")


def normalize_company_url(url: str) -> str:
    url = (url or "").strip().split("?")[0].rstrip("/")
    if not url:
        return ""
    # Force www guest host when possible
    try:
        p = urlparse(url)
        host = p.netloc.lower()
        if host.endswith("linkedin.com") and "/company/" in p.path:
            return f"https://www.linkedin.com{p.path.rstrip('/')}"
    except Exception:
        pass
    return url


def load_done_slugs() -> set[str]:
    done: set[str] = set()
    cp = load_json(CHECKPOINT)
    done.update(cp.get("completed_slugs") or [])
    if COMPANIES_OUT.exists():
        for line in COMPANIES_OUT.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
                if row.get("company_slug"):
                    done.add(str(row["company_slug"]).lower())
            except json.JSONDecodeError:
                continue
    return done


def load_seeds_from_washed(*, founding_only: bool = False) -> list[dict]:
    payload = json.loads(WASHED_COMPANIES.read_text(encoding="utf-8"))
    out: list[dict] = []
    seen: set[str] = set()
    for c in payload.get("companies") or []:
        url = normalize_company_url(str(c.get("url") or ""))
        if "linkedin.com/company/" not in url:
            continue
        slug = company_slug_from_url(url).lower()
        if not slug or slug in seen:
            continue
        tags = c.get("role_tags") or []
        if founding_only and not any(t in tags for t in ("founding_sales", "founding")):
            continue
        seen.add(slug)
        out.append(
            {
                "company_slug": slug,
                "url": url,
                "name": c.get("name") or "",
                "washed_id": c.get("id") or "",
                "job_count": c.get("job_count") or 0,
            }
        )
    out.sort(key=lambda x: (-int(x["job_count"]), x["company_slug"]))
    return out


def jitter(a: float, b: float) -> float:
    return random.uniform(a, b)


def enrich_one(seed: dict, *, timeout_ms: int = 90_000) -> dict:
    url = seed["url"]
    slug = seed["company_slug"]
    result = fetch_stealthy(url, timeout_ms=timeout_ms)
    html = result.get("html") or ""
    if not result.get("ok") or len(html) < 800:
        return {
            "ok": False,
            "company_slug": slug,
            "url": url,
            "error": result.get("error") or "fetch_failed",
            "status_code": result.get("status_code"),
            "failed_at": utc_now(),
            "name": seed.get("name") or "",
        }

    parsed = parse_company_unescaped(html, slug)
    return {
        "ok": True,
        **parsed,
        "url": url,
        "name": seed.get("name") or "",
        "washed_id": seed.get("washed_id") or "",
        "html_len": len(html),
        "scraped_at": utc_now(),
        "status_code": result.get("status_code"),
    }


def run_fetch(
    seeds: list[dict],
    *,
    delay_min: float,
    delay_max: float,
    label: str = "companies",
) -> dict:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    done = load_done_slugs()
    pending = [s for s in seeds if s["company_slug"] not in done]
    notify = notify_config()
    logger.info(
        "Company enrich start label=%s seeds=%d pending=%d done=%d notify=%s",
        label,
        len(seeds),
        len(pending),
        len(done),
        "on" if notify else "off",
    )

    cp = load_json(CHECKPOINT)
    cp.setdefault("started_at", utc_now())
    # Clear stale finished marker when resuming / starting a new pass
    cp.pop("finished_at", None)
    cp["label"] = label
    cp["updated_at"] = utc_now()
    scraped = failed = 0
    hits = 0

    if notify:
        send_email(
            subject=f"Tally company enrich started ({label})",
            body=format_company_summary(
                label="started",
                seeds_total=len(seeds),
                pending_start=len(pending),
                stats={"scraped": 0, "failed": 0, "parse_hits_sum": 0},
            ),
            cfg=notify,
        )

    for i, seed in enumerate(pending, 1):
        slug = seed["company_slug"]
        logger.info("[%d/%d] FETCH %s %s", i, len(pending), slug, seed["url"])
        row = enrich_one(seed)
        if not row.get("ok"):
            failed += 1
            append_jsonl(FAILED_OUT, row)
            logger.warning("FAIL %s: %s", slug, row.get("error"))
            if notify:
                send_email(
                    subject=f"Tally company enrich FAIL {slug}",
                    body=(
                        f"Slug: {slug}\nURL: {seed['url']}\n"
                        f"Error: {row.get('error')}\nStatus: {row.get('status_code')}"
                    ),
                    cfg=notify,
                )
        else:
            scraped += 1
            hits += int(row.get("parse_hit_count") or 0)
            append_jsonl(COMPANIES_OUT, row)
            done.add(slug)
            logger.info(
                "OK %s website=%r employees=%r followers=%r hq=%s/%s hits=%s",
                slug,
                row.get("website"),
                row.get("employee_count"),
                row.get("follower_count"),
                row.get("hq_locality"),
                row.get("hq_country"),
                row.get("parse_hit_count"),
            )
            if notify and notify.progress_every and scraped % notify.progress_every == 0:
                send_email(
                    subject=f"Tally company enrich progress ({scraped} this run)",
                    body=format_company_summary(
                        label="progress",
                        seeds_total=len(seeds),
                        pending_start=len(pending),
                        stats={
                            "scraped": scraped,
                            "failed": failed,
                            "parse_hits_sum": hits,
                        },
                        last_slug=slug,
                    ),
                    cfg=notify,
                )
        cp["completed_slugs"] = sorted(done)
        cp["last_slug"] = slug
        cp["updated_at"] = utc_now()
        cp["stats"] = {"scraped": scraped, "failed": failed, "parse_hits_sum": hits}
        CHECKPOINT.write_text(json.dumps(cp, indent=2), encoding="utf-8")
        if i < len(pending):
            time.sleep(jitter(delay_min, delay_max))

    cp["finished_at"] = utc_now()
    CHECKPOINT.write_text(json.dumps(cp, indent=2), encoding="utf-8")
    summary = {
        "scraped": scraped,
        "failed": failed,
        "pending_at_start": len(pending),
        "parse_hits_sum": hits,
        "avg_hits": (hits / scraped) if scraped else 0,
    }
    logger.info("Batch done %s", summary)
    if notify:
        send_email(
            subject=f"Tally company enrich done ({label})",
            body=format_company_summary(
                label="done",
                seeds_total=len(seeds),
                pending_start=len(pending),
                stats=summary,
                last_slug=str(cp.get("last_slug") or ""),
            ),
            cfg=notify,
        )
    return summary


def publish_to_washed() -> dict:
    """Merge companies.jsonl enrichments into washed-companies.json by LinkedIn slug."""
    if not COMPANIES_OUT.exists():
        raise SystemExit(f"missing {COMPANIES_OUT}")

    by_slug: dict[str, dict] = {}
    for line in COMPANIES_OUT.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError:
            continue
        slug = str(row.get("company_slug") or "").lower()
        if slug:
            by_slug[slug] = row

    payload = json.loads(WASHED_COMPANIES.read_text(encoding="utf-8"))
    companies = list(payload.get("companies") or [])
    enriched = 0
    for c in companies:
        url = str(c.get("url") or "")
        slug = company_slug_from_url(url).lower()
        row = by_slug.get(slug)
        if not row:
            continue
        c["website"] = row.get("website") or c.get("website") or ""
        c["employee_count"] = row.get("employee_count") if row.get("employee_count") != "" else c.get("employee_count")
        c["size_bucket"] = row.get("size_bucket") or c.get("size_bucket") or ""
        c["follower_count"] = row.get("follower_count") if row.get("follower_count") != "" else c.get("follower_count")
        c["hq_country"] = row.get("hq_country") or c.get("hq_country") or ""
        c["hq_locality"] = row.get("hq_locality") or c.get("hq_locality") or ""
        c["hq_region"] = row.get("hq_region") or c.get("hq_region") or ""
        c["founded"] = row.get("founded") or c.get("founded") or ""
        c["org_description"] = row.get("org_description") or c.get("org_description") or ""
        c["recent_post_themes"] = row.get("recent_post_themes") or c.get("recent_post_themes") or ""
        c["enrich_flag"] = row.get("enrich_flag") or ""
        c["enriched_at"] = row.get("resolved_at") or row.get("scraped_at") or ""
        c["linkedin_enrich_resolved"] = bool(row.get("resolved"))
        enriched += 1

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_dir = OUT_DIR / "merge_backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup = backup_dir / f"washed-companies.before_enrich.{stamp}.json"
    shutil.copy2(WASHED_COMPANIES, backup)

    payload["washedAt"] = utc_now()
    payload["companies"] = companies
    payload["enrichedLinkedIn"] = enriched
    WASHED_COMPANIES.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    report = {"enriched": enriched, "total": len(companies), "backup": str(backup)}
    logger.info("Published enrichments: %s", report)
    notify = notify_config()
    if notify:
        send_email(
            subject=f"Tally company enrich published ({enriched})",
            body=(
                f"Merged LinkedIn company enrichments into washed-companies.json\n\n"
                f"Enriched: {enriched}\nTotal companies: {len(companies)}\n"
                f"Backup: {backup}"
            ),
            cfg=notify,
        )
    return report


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--smoke", type=int, default=0, help="Fetch N founding-tagged companies then exit")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--url", action="append", default=[], help="Explicit company URL(s)")
    ap.add_argument("--founding-only", action="store_true", default=False)
    ap.add_argument("--delay-min", type=float, default=5.0)
    ap.add_argument("--delay-max", type=float, default=10.0)
    ap.add_argument("--publish", action="store_true", help="Merge companies.jsonl into washed-companies.json")
    args = ap.parse_args()

    if args.publish and not args.smoke and not args.url and not args.limit and not args.founding_only:
        # allow publish-only
        publish_to_washed()
        return

    seeds: list[dict] = []
    if args.url:
        for u in args.url:
            url = normalize_company_url(u)
            slug = company_slug_from_url(url).lower()
            if slug:
                seeds.append({"company_slug": slug, "url": url, "name": "", "washed_id": "", "job_count": 0})
    else:
        founding = bool(args.smoke) or args.founding_only
        seeds = load_seeds_from_washed(founding_only=founding)

    if args.smoke:
        seeds = seeds[: args.smoke]
    elif args.limit:
        seeds = seeds[: args.limit]

    if not seeds and not args.publish:
        raise SystemExit("no company seeds")

    if seeds:
        label = "smoke" if args.smoke else ("founding" if (args.founding_only or args.smoke) else "all")
        if args.url:
            label = "explicit"
        run_fetch(
            seeds,
            delay_min=args.delay_min,
            delay_max=args.delay_max,
            label=label,
        )

    if args.publish:
        publish_to_washed()


if __name__ == "__main__":
    main()
