"""One-off spike: StealthyFetcher vs LinkedIn guest job page."""

from __future__ import annotations

import json
import re
from pathlib import Path

from scrapling.fetchers import StealthyFetcher

URL = (
    "https://www.linkedin.com/jobs/view/"
    "founding-account-executive-at-t-maxx-international-4435520202"
)
OUT = Path(__file__).resolve().parents[1] / "data" / "_spike_tmaxx_stealthy.html"


def main() -> None:
    print("Fetching via StealthyFetcher...")
    page = StealthyFetcher.fetch(
        URL,
        headless=True,
        network_idle=True,
        timeout=90_000,
    )
    status = getattr(page, "status", None) or getattr(page, "status_code", None)
    body = getattr(page, "html_content", None) or ""
    if not body and getattr(page, "body", None) is not None:
        raw = page.body
        body = raw.decode("utf-8", errors="replace") if isinstance(raw, bytes) else str(raw)
    print(f"status={status} html_len={len(body)} final_url={getattr(page, 'url', None)}")
    OUT.write_text(body, encoding="utf-8", errors="replace")
    print(f"wrote {OUT}")

    authwall = bool(
        re.search(r"join linkedin|sign in|authwall|challenge", body, re.I)
    )
    has_ld = "application/ld+json" in body
    has_base = "base-card" in body
    has_job_details = "job-details" in body
    has_org = "Organization" in body or "numberOfEmployees" in body
    markers = has_ld or has_base or has_job_details or has_org

    print("\n== classify (same heuristics as fetchGuestPage) ==")
    print(f"authwall_signal={authwall}")
    print(
        f"has_ld+json={has_ld} base-card={has_base} "
        f"job-details={has_job_details} org/employees={has_org}"
    )
    print(f"has_markers={markers}")

    job_postings: list[dict] = []
    for m in re.finditer(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        body,
        re.I | re.S,
    ):
        raw = m.group(1).strip()
        try:
            data = json.loads(raw)
        except Exception as exc:  # noqa: BLE001
            print(f"ld+json parse fail: {exc}; snippet={raw[:120]!r}")
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if not isinstance(item, dict):
                continue
            t = item.get("@type", "")
            types = t if isinstance(t, list) else [t]
            if any(re.search(r"JobPosting", str(x), re.I) for x in types):
                job_postings.append(item)

    print(f"\n== JSON-LD JobPosting count={len(job_postings)} ==")
    for jp in job_postings[:3]:
        org = jp.get("hiringOrganization") or {}
        company = org.get("name") if isinstance(org, dict) else org
        print(f"  title={jp.get('title')!r} company={company!r}")
        print(f"  keys={list(jp.keys())[:12]}")

    cards = re.findall(
        r'<div[^>]*class="[^"]*base-card[^"]*"[^>]*>',
        body,
        re.I,
    )
    ids: list[str] = []
    seen: set[str] = set()
    for u in re.findall(
        r'https?://(?:[\w.-]+\.)?linkedin\.com/jobs/view/[^"\'\s<>]+',
        body,
        re.I,
    ):
        mid = re.search(r"(\d{6,})", u)
        if mid and mid.group(1) not in seen:
            seen.add(mid.group(1))
            ids.append(mid.group(1))

    print("\n== similar cards ==")
    print(f"base-card open tags={len(cards)}")
    print(f"unique jobs/view ids in html={len(ids)} sample={ids[:8]}")

    title_m = re.search(r"<title[^>]*>(.*?)</title>", body, re.I | re.S)
    print(
        f"\n<title>="
        f"{title_m.group(1).strip()[:120] if title_m else None!r}"
    )
    print(
        "similar/people-also="
        f"{bool(re.search(r'Show more jobs|People also viewed|Similar jobs', body, re.I))}"
    )


if __name__ == "__main__":
    main()
