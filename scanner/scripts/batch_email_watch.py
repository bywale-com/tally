#!/usr/bin/env python3
"""
Email watcher for LinkedIn batch extract + company enrich.

Usage:
  python scripts/batch_email_watch.py --once          # status now
  python scripts/batch_email_watch.py --watch 300     # every 5 min

Requires scanner/.env:
  BATCH_NOTIFY_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tally_scanner.batch_notify import notify_config, send_email

OUT_DIR = ROOT / "data" / "linkedin_extract"
STATE = OUT_DIR / "notify_state.json"


def load_state() -> dict:
    if STATE.exists():
        return json.loads(STATE.read_text(encoding="utf-8"))
    return {
        "failed_count": 0,
        "company_failed_count": 0,
        "jobs_total": 0,
        "companies_total": 0,
        "any_finished": False,
        "companies_finished": False,
    }


def save_state(state: dict) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(state, indent=2), encoding="utf-8")


def count_lines(path: Path) -> int:
    if not path.exists():
        return 0
    return sum(1 for line in path.read_text(encoding="utf-8").splitlines() if line.strip())


def snapshot() -> dict:
    checkpoints = sorted(OUT_DIR.glob("checkpoint*.json"))
    phases = []
    company_phase = None
    for cp in checkpoints:
        data = json.loads(cp.read_text(encoding="utf-8"))
        stats = data.get("stats") or {}
        entry = {
            "file": cp.name,
            "tiers": data.get("tiers") or [],
            "label": data.get("label") or "",
            "completed": len(data.get("completed_job_ids") or data.get("completed_slugs") or []),
            "last_job_id": data.get("last_job_id"),
            "last_slug": data.get("last_slug"),
            "updated_at": data.get("updated_at"),
            "finished_at": data.get("finished_at"),
            "stats": stats,
        }
        if cp.name == "checkpoint_companies.json":
            company_phase = entry
        else:
            phases.append(entry)
    return {
        "jobs_scraped_total": count_lines(OUT_DIR / "jobs.jsonl"),
        "similar_total": count_lines(OUT_DIR / "similar_discovered.jsonl"),
        "failed_total": count_lines(OUT_DIR / "failed.jsonl"),
        "skipped_total": count_lines(OUT_DIR / "skipped.jsonl"),
        "companies_total": count_lines(OUT_DIR / "companies.jsonl"),
        "companies_failed_total": count_lines(OUT_DIR / "companies_failed.jsonl"),
        "phases": phases,
        "company_phase": company_phase,
    }


def format_body(snap: dict, *, headline: str) -> str:
    lines = [headline, ""]
    lines.append("— Jobs batch")
    lines.append(f"Jobs scraped (total): {snap['jobs_scraped_total']}")
    lines.append(f"Similar discovered:   {snap['similar_total']}")
    lines.append(f"Failed (total):       {snap['failed_total']}")
    lines.append(f"Skipped (total):      {snap['skipped_total']}")
    lines.append("")
    for p in snap["phases"]:
        st = p.get("stats") or {}
        lines.append(f"  {p['file']} ({', '.join(p['tiers']) or '?'})")
        lines.append(f"    completed ids: {p['completed']}")
        if p.get("finished_at"):
            lines.append(f"    FINISHED at {p['finished_at']}")
        else:
            lines.append(f"    running… last={p.get('last_job_id')} @ {p.get('updated_at')}")
        lines.append(
            f"    run stats: scraped={st.get('scraped',0)} failed={st.get('failed',0)} skipped={st.get('skipped',0)}"
        )
        lines.append("")

    lines.append("— Company enrich")
    lines.append(f"Companies enriched (total): {snap['companies_total']}")
    lines.append(f"Companies failed (total):   {snap['companies_failed_total']}")
    cp = snap.get("company_phase")
    if cp:
        st = cp.get("stats") or {}
        lines.append(f"  {cp['file']} ({cp.get('label') or 'companies'})")
        lines.append(f"    completed slugs: {cp['completed']}")
        if cp.get("finished_at"):
            lines.append(f"    FINISHED at {cp['finished_at']}")
        else:
            lines.append(f"    running… last={cp.get('last_slug')} @ {cp.get('updated_at')}")
        lines.append(
            f"    run stats: scraped={st.get('scraped',0)} failed={st.get('failed',0)} hits={st.get('parse_hits_sum',0)}"
        )
    else:
        lines.append("  (no checkpoint_companies.json yet)")
    lines.append("")
    lines.append("Logs: data/linkedin_extract/*console*.log")
    return "\n".join(lines)


def poll_once(*, force: bool = False) -> bool:
    cfg = notify_config()
    if not cfg:
        print("Notify disabled — set BATCH_NOTIFY_EMAIL + SMTP_* in scanner/.env")
        return False

    snap = snapshot()
    state = load_state()
    prev_failed = int(state.get("failed_count") or 0)
    cur_failed = snap["failed_total"]
    prev_co_failed = int(state.get("company_failed_count") or 0)
    cur_co_failed = snap["companies_failed_total"]

    send = force
    subject = "Tally batch status"

    if cur_failed > prev_failed:
        send = True
        subject = f"Tally batch FAIL ({cur_failed - prev_failed} new jobs)"

    if cur_co_failed > prev_co_failed:
        send = True
        subject = f"Tally company enrich FAIL ({cur_co_failed - prev_co_failed} new)"

    prev_jobs = int(state.get("jobs_total") or 0)
    if snap["jobs_scraped_total"] - prev_jobs >= cfg.progress_every > 0:
        send = True
        subject = f"Tally batch progress ({snap['jobs_scraped_total']} jobs)"

    prev_cos = int(state.get("companies_total") or 0)
    if snap["companies_total"] - prev_cos >= cfg.progress_every > 0:
        send = True
        subject = f"Tally company enrich progress ({snap['companies_total']} companies)"

    any_finished = any(p.get("finished_at") for p in snap["phases"])
    prev_finished = state.get("any_finished", False)
    if any_finished and not prev_finished:
        send = True
        subject = "Tally batch phase complete"

    co = snap.get("company_phase") or {}
    co_finished = bool(co.get("finished_at"))
    prev_co_finished = state.get("companies_finished", False)
    if co_finished and not prev_co_finished:
        send = True
        subject = "Tally company enrich complete"

    if not send:
        return False

    body = format_body(snap, headline=subject)
    ok = send_email(subject=subject, body=body, cfg=cfg)
    if ok:
        state["failed_count"] = cur_failed
        state["company_failed_count"] = cur_co_failed
        state["jobs_total"] = snap["jobs_scraped_total"]
        state["companies_total"] = snap["companies_total"]
        state["any_finished"] = any_finished
        state["companies_finished"] = co_finished
        save_state(state)
    return ok


def main() -> None:
    parser = argparse.ArgumentParser(description="Email watcher for LinkedIn batch + company enrich")
    parser.add_argument("--once", action="store_true", help="Send one status email now")
    parser.add_argument("--watch", type=int, default=0, help="Poll every N seconds")
    args = parser.parse_args()

    if args.once:
        poll_once(force=True)
        return

    interval = args.watch or 300
    print(f"Watching every {interval}s (Ctrl+C to stop)…")
    while True:
        poll_once()
        time.sleep(interval)


if __name__ == "__main__":
    main()
