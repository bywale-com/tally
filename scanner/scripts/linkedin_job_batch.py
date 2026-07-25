#!/usr/bin/env python3
"""
LinkedIn job URL batch extract (offline).

Phase 1 default: founding_sales + founding seeds from washed-jobs.json.
One Stealthy scrape per seed; similar cards → separate side list (not scraped).

Usage:
  python scripts/linkedin_job_batch.py --tier founding_sales,founding
  python scripts/linkedin_job_batch.py --tier sales
  python scripts/linkedin_job_batch.py --limit 3   # smoke
"""

from __future__ import annotations

import argparse
import json
import logging
import random
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tally_scanner.linkedin_parse import harvest_similar_cards, job_id_from_url, parse_primary_job
from tally_scanner.location_filter import classify_location, should_skip_seed
from tally_scanner.batch_notify import format_run_summary, notify_config, send_email
from tally_scanner.stealthy_fetch import fetch_stealthy

WASHED = ROOT.parent / "apps" / "tally" / "public" / "washed-jobs.json"
OUT_DIR = ROOT / "data" / "linkedin_extract"
JOBS_OUT = OUT_DIR / "jobs.jsonl"
SIMILAR_OUT = OUT_DIR / "similar_discovered.jsonl"
SKIPPED_OUT = OUT_DIR / "skipped.jsonl"
FAILED_OUT = OUT_DIR / "failed.jsonl"
CHECKPOINT = OUT_DIR / "checkpoint.json"
LOG_FILE = OUT_DIR / "batch.log"


def checkpoint_path(tiers: list[str]) -> Path:
    slug = "_".join(t.replace(",", "") for t in tiers)
    return OUT_DIR / f"checkpoint_{slug}.json" if slug else CHECKPOINT

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("linkedin_job_batch")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}


def save_checkpoint(data: dict, path: Path = CHECKPOINT) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def append_jsonl(path: Path, row: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")


def load_done_ids(checkpoint: Path) -> set[str]:
    done: set[str] = set()
    cp = load_json(checkpoint)
    done.update(cp.get("completed_job_ids") or [])
    # Also honor legacy checkpoint.json
    if checkpoint.name != "checkpoint.json":
        done.update(load_json(CHECKPOINT).get("completed_job_ids") or [])
    if JOBS_OUT.exists():
        for line in JOBS_OUT.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
                if row.get("job_id"):
                    done.add(str(row["job_id"]))
            except json.JSONDecodeError:
                continue
    return done


def load_similar_ids() -> set[str]:
    ids: set[str] = set()
    if not SIMILAR_OUT.exists():
        return ids
    for line in SIMILAR_OUT.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            row = json.loads(line)
            if row.get("job_id"):
                ids.add(str(row["job_id"]))
        except json.JSONDecodeError:
            continue
    return ids


def load_seeds(tiers: list[str]) -> list[dict]:
    payload = json.loads(WASHED.read_text(encoding="utf-8"))
    jobs = payload.get("jobs") or []
    tier_set = set(tiers)
    by_id: dict[str, dict] = {}
    for j in jobs:
        if j.get("source") != "linkedin":
            continue
        if j.get("relevance") not in tier_set:
            continue
        url = (j.get("url") or "").split("?")[0]
        jid = job_id_from_url(url)
        if not url or not jid:
            continue
        by_id[jid] = {
            "job_id": jid,
            "url": url,
            "company": j.get("company") or "",
            "title": j.get("title") or "",
            "relevance": j.get("relevance") or "",
            "location_raw": j.get("location_raw") or "",
            "inventory_id": j.get("id") or "",
        }
    return list(by_id.values())


def jitter(min_sec: float, max_sec: float) -> float:
    return min_sec + random.random() * (max_sec - min_sec)


def run_batch(
    *,
    tiers: list[str],
    limit: int | None,
    delay_min: float,
    delay_max: float,
) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ckpt = checkpoint_path(tiers)
    file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    file_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    logger.addHandler(file_handler)

    seeds = load_seeds(tiers)
    seeds.sort(key=lambda s: s["job_id"])
    if limit:
        seeds = seeds[:limit]

    done = load_done_ids(ckpt)
    similar_seen = load_similar_ids()
    cp = load_json(ckpt)
    cp.setdefault("tiers", tiers)
    cp.setdefault("started_at", utc_now())
    cp["completed_job_ids"] = sorted(done)

    pending = [s for s in seeds if s["job_id"] not in done]
    notify = notify_config()
    logger.info(
        "Batch start tiers=%s checkpoint=%s seeds=%d pending=%d done=%d notify=%s",
        tiers,
        ckpt.name,
        len(seeds),
        len(pending),
        len(done),
        "on" if notify else "off",
    )
    if notify:
        send_email(
            subject=f"Tally batch started ({', '.join(tiers)})",
            body=format_run_summary(
                label="started",
                tiers=tiers,
                seeds_total=len(seeds),
                pending_start=len(pending),
                stats={"scraped": 0, "skipped": 0, "failed": 0, "similar_added": 0},
                checkpoint_name=ckpt.name,
            ),
            cfg=notify,
        )

    scraped = 0
    skipped = 0
    failed = 0
    similar_added = 0

    for i, seed in enumerate(pending, 1):
        jid = seed["job_id"]
        url = seed["url"]
        loc_raw = seed["location_raw"]

        if should_skip_seed(loc_raw):
            skipped += 1
            row = {
                "job_id": jid,
                "url": url,
                "reason": "non_na_location",
                "location_raw": loc_raw,
                "location_class": classify_location(loc_raw),
                "skipped_at": utc_now(),
            }
            append_jsonl(SKIPPED_OUT, row)
            done.add(jid)
            cp["completed_job_ids"] = sorted(done)
            save_checkpoint(cp, ckpt)
            logger.info("[%d/%d] SKIP non-NA %s (%s)", i, len(pending), jid, loc_raw)
            continue

        logger.info("[%d/%d] FETCH %s %s", i, len(pending), jid, url)
        result = fetch_stealthy(url, timeout_ms=90_000)
        html = result.get("html") or ""

        if not result.get("ok") or len(html) < 800:
            failed += 1
            append_jsonl(
                FAILED_OUT,
                {
                    "job_id": jid,
                    "url": url,
                    "error": result.get("error") or "fetch_failed",
                    "status_code": result.get("status_code"),
                    "failed_at": utc_now(),
                },
            )
            logger.warning("FAIL %s: %s", jid, result.get("error"))
            if notify:
                send_email(
                    subject=f"Tally batch FAIL {jid}",
                    body=f"Job: {jid}\nURL: {url}\nError: {result.get('error') or 'fetch_failed'}\nStatus: {result.get('status_code')}",
                    cfg=notify,
                )
            time.sleep(jitter(delay_min, delay_max))
            continue

        primary = parse_primary_job(html=html, url=url, seed_url=url, job_id=jid)
        similar = harvest_similar_cards(html, jid)

        record = {
            **primary,
            "relevance": seed["relevance"],
            "inventory_id": seed["inventory_id"],
            "seed_location_raw": loc_raw,
            "similar_pages": similar,
            "similar_count": len(similar),
            "scraped_at": utc_now(),
            "html_len": len(html),
        }
        append_jsonl(JOBS_OUT, record)
        scraped += 1
        done.add(jid)

        for card in similar:
            cid = str(card.get("job_id") or "")
            if not cid or cid in similar_seen:
                continue
            similar_seen.add(cid)
            append_jsonl(
                SIMILAR_OUT,
                {**card, "discovered_at": utc_now(), "discovered_from_url": url},
            )
            similar_added += 1

        cp["completed_job_ids"] = sorted(done)
        cp["last_job_id"] = jid
        cp["updated_at"] = utc_now()
        cp["stats"] = {
            "scraped": scraped,
            "skipped": skipped,
            "failed": failed,
            "similar_added": similar_added,
        }
        save_checkpoint(cp, ckpt)
        logger.info(
            "OK %s title=%r similar=%d",
            jid,
            primary.get("title"),
            len(similar),
        )
        if notify and notify.progress_every and scraped % notify.progress_every == 0:
            send_email(
                subject=f"Tally batch progress ({scraped} scraped this run)",
                body=format_run_summary(
                    label="progress",
                    tiers=tiers,
                    seeds_total=len(seeds),
                    pending_start=len(pending),
                    stats=cp["stats"],
                    checkpoint_name=ckpt.name,
                ),
                cfg=notify,
            )
        time.sleep(jitter(delay_min, delay_max))

    cp["finished_at"] = utc_now()
    cp["stats"] = {
        "scraped": scraped,
        "skipped": skipped,
        "failed": failed,
        "similar_added": similar_added,
        "pending_at_start": len(pending),
    }
    save_checkpoint(cp, ckpt)
    logger.info(
        "Batch done scraped=%d skipped=%d failed=%d similar_added=%d",
        scraped,
        skipped,
        failed,
        similar_added,
    )
    if notify:
        send_email(
            subject=f"Tally batch done ({', '.join(tiers)}) — failed={failed}",
            body=format_run_summary(
                label="done",
                tiers=tiers,
                seeds_total=len(seeds),
                pending_start=len(pending),
                stats=cp["stats"],
                checkpoint_name=ckpt.name,
            ),
            cfg=notify,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="LinkedIn job URL batch extract")
    parser.add_argument(
        "--tier",
        default="founding_sales,founding",
        help="Comma-separated relevance tiers (default: founding_sales,founding)",
    )
    parser.add_argument("--limit", type=int, default=None, help="Max seeds (smoke test)")
    parser.add_argument("--delay-min", type=float, default=3.0)
    parser.add_argument("--delay-max", type=float, default=7.0)
    args = parser.parse_args()
    tiers = [t.strip() for t in args.tier.split(",") if t.strip()]
    run_batch(
        tiers=tiers,
        limit=args.limit,
        delay_min=args.delay_min,
        delay_max=args.delay_max,
    )


if __name__ == "__main__":
    main()
