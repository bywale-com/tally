"""Optional SMTP email alerts for LinkedIn batch extract."""

from __future__ import annotations

import logging
import os
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage
from pathlib import Path

logger = logging.getLogger(__name__)

ROOT = Path(__file__).resolve().parents[1]


def _load_dotenv() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


@dataclass
class NotifyConfig:
    to_email: str
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_pass: str
    smtp_from: str
    progress_every: int


def notify_config() -> NotifyConfig | None:
    _load_dotenv()
    to_email = (os.environ.get("BATCH_NOTIFY_EMAIL") or "").strip()
    if not to_email:
        return None
    host = (os.environ.get("SMTP_HOST") or "").strip()
    user = (os.environ.get("SMTP_USER") or "").strip()
    password = (os.environ.get("SMTP_PASS") or os.environ.get("SMTP_PASSWORD") or "").strip()
    if not host or not user or not password:
        logger.warning("BATCH_NOTIFY_EMAIL set but SMTP_HOST/USER/PASS missing — alerts disabled")
        return None
    port = int(os.environ.get("SMTP_PORT") or "587")
    from_addr = (os.environ.get("SMTP_FROM") or user).strip()
    every = int(os.environ.get("BATCH_NOTIFY_EVERY") or "25")
    return NotifyConfig(
        to_email=to_email,
        smtp_host=host,
        smtp_port=port,
        smtp_user=user,
        smtp_pass=password,
        smtp_from=from_addr,
        progress_every=max(0, every),
    )


def send_email(*, subject: str, body: str, cfg: NotifyConfig | None = None) -> bool:
    cfg = cfg or notify_config()
    if not cfg:
        return False
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = cfg.smtp_from
    msg["To"] = cfg.to_email
    msg.set_content(body)
    try:
        with smtplib.SMTP(cfg.smtp_host, cfg.smtp_port, timeout=30) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(cfg.smtp_user, cfg.smtp_pass)
            smtp.send_message(msg)
        logger.info("Notify email sent: %s", subject)
        return True
    except Exception:
        logger.exception("Failed to send notify email: %s", subject)
        return False


def format_run_summary(
    *,
    label: str,
    tiers: list[str],
    seeds_total: int,
    pending_start: int,
    stats: dict,
    checkpoint_name: str,
) -> str:
    scraped = stats.get("scraped", 0)
    skipped = stats.get("skipped", 0)
    failed = stats.get("failed", 0)
    similar = stats.get("similar_added", 0)
    lines = [
        f"Tally LinkedIn batch — {label}",
        "",
        f"Tiers: {', '.join(tiers)}",
        f"Checkpoint: {checkpoint_name}",
        f"Seeds total: {seeds_total}",
        f"Pending at start: {pending_start}",
        "",
        f"Scraped this run: {scraped}",
        f"Skipped (non-NA): {skipped}",
        f"Failed this run: {failed}",
        f"Similar links added: {similar}",
        "",
        "Outputs: scanner/data/linkedin_extract/",
        "  jobs.jsonl, similar_discovered.jsonl, failed.jsonl",
    ]
    return "\n".join(lines)


def format_company_summary(
    *,
    label: str,
    seeds_total: int,
    pending_start: int,
    stats: dict,
    last_slug: str = "",
) -> str:
    scraped = stats.get("scraped", 0)
    failed = stats.get("failed", 0)
    hits = stats.get("parse_hits_sum", 0)
    avg = (hits / scraped) if scraped else 0
    lines = [
        f"Tally LinkedIn company enrich — {label}",
        "",
        "Checkpoint: checkpoint_companies.json",
        f"Seeds total: {seeds_total}",
        f"Pending at start: {pending_start}",
        "",
        f"Enriched this run: {scraped}",
        f"Failed this run: {failed}",
        f"Parse hits sum: {hits} (avg {avg:.1f}/company)",
    ]
    if last_slug:
        lines.append(f"Last slug: {last_slug}")
    lines.extend(
        [
            "",
            "Outputs: scanner/data/linkedin_extract/",
            "  companies.jsonl, companies_failed.jsonl",
            "Publish: python scripts/linkedin_company_enrich.py --publish",
        ]
    )
    return "\n".join(lines)
