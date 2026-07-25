"""LinkedIn guest HTML via Scrapling StealthyFetcher (Playwright stealth)."""

from __future__ import annotations

import logging
import threading
from typing import Any

logger = logging.getLogger(__name__)

# One Chromium session at a time — parallel Stealthy fetches thrash the machine.
_FETCH_LOCK = threading.Lock()


def fetch_stealthy(url: str, *, timeout_ms: int = 90_000) -> dict[str, Any]:
    """
    Fetch a page with StealthyFetcher.

    Returns { ok, status_code, html, error, transport }.
    """
    target = (url or "").strip()
    if not target.startswith("http"):
        return {
            "ok": False,
            "status_code": 0,
            "html": "",
            "error": "invalid_url",
            "transport": "stealthy",
        }

    try:
        from scrapling.fetchers import StealthyFetcher
    except ImportError as e:
        logger.exception("scrapling not installed")
        return {
            "ok": False,
            "status_code": 0,
            "html": "",
            "error": f"scrapling_missing: {e}",
            "transport": "stealthy",
        }

    with _FETCH_LOCK:
        try:
            page = StealthyFetcher.fetch(
                target,
                headless=True,
                network_idle=True,
                timeout=timeout_ms,
            )
        except Exception as e:
            logger.exception("StealthyFetcher failed for %s", target[:120])
            return {
                "ok": False,
                "status_code": 0,
                "html": "",
                "error": str(e)[:400],
                "transport": "stealthy",
            }

    status = int(getattr(page, "status", 0) or 0)
    html = getattr(page, "html_content", None) or ""
    if not html:
        raw = getattr(page, "body", b"") or b""
        html = (
            raw.decode("utf-8", errors="replace")
            if isinstance(raw, (bytes, bytearray))
            else str(raw)
        )

    return {
        "ok": status == 200 and len(html) >= 800,
        "status_code": status,
        "html": html,
        "error": "" if status == 200 else f"http_{status}",
        "transport": "stealthy",
        "final_url": str(getattr(page, "url", target) or target),
    }
