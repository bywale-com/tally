"""Parse startup.jobs job HTML (JSON-LD primary). Company pages often 403 — avoid."""

from __future__ import annotations

import re
from typing import Any

from tally_scanner.jsonld_util import (
    find_job_posting,
    hiring_org,
    is_external_website,
    location_from_job_posting,
    salary_raw_from_posting,
    strip_html,
    website_host,
)

JOB_ID_RE = re.compile(r"-(\d{4,})/?$", re.I)
JOB_URL_RE = re.compile(
    r'href="(https://(?:www\.)?startup\.jobs/[^"?#]+-\d{4,}[^"]*)"',
    re.I,
)
REL_JOB_RE = re.compile(r'href="(/[^"?#]+-\d{4,}[^"]*)"', re.I)


def job_id_from_url(url: str) -> str | None:
    path = (url or "").split("?")[0].rstrip("/")
    m = JOB_ID_RE.search(path)
    return m.group(1) if m else None


def company_slug_from_url(url: str) -> str:
    m = re.search(r"startup\.jobs/company/([^/?#]+)", url or "", re.I)
    return m.group(1).lower() if m else ""


def _abs_startup(href: str) -> str:
    if not href:
        return ""
    clean = href.replace("&amp;", "&").split("?")[0].rstrip("/")
    if re.match(r"^https?://", clean, re.I):
        return clean
    if clean.startswith("/"):
        return f"https://startup.jobs{clean}"
    return ""


def parse_primary_job(
    *,
    html: str,
    url: str,
    seed_url: str = "",
    job_id: str | None = None,
) -> dict[str, Any]:
    posting = find_job_posting(html) or {}
    org = hiring_org(posting)
    company_name = str(org.get("name") or "")
    same_as = str(org.get("sameAs") or "")
    org_url = str(org.get("url") or "")

    platform_company = ""
    external_website = ""
    for candidate in (org_url, same_as):
        if not candidate:
            continue
        if "startup.jobs/company/" in candidate:
            platform_company = candidate.split("?")[0].rstrip("/")
        elif is_external_website(candidate):
            # hiringOrganization.url is the external company website when present
            external_website = candidate.split("?")[0]

    if not platform_company:
        m = re.search(r'href="(https://(?:www\.)?startup\.jobs/company/[^"]+)"', html or "", re.I)
        if m:
            platform_company = m.group(1).split("?")[0].rstrip("/")
        else:
            m2 = re.search(r'href="(/company/[^"?#]+)"', html or "", re.I)
            if m2:
                platform_company = _abs_startup(m2.group(1))

    desc = strip_html(str(posting.get("description") or ""))
    resolved_id = (
        job_id
        or job_id_from_url(url)
        or job_id_from_url(str(posting.get("url") or ""))
        or ""
    )
    clean_url = (url or seed_url or "").split("?")[0]

    return {
        "job_id": resolved_id,
        "source": "startup_jobs",
        "fidelity": "primary",
        "url": clean_url,
        "title": str(posting.get("title") or ""),
        "description": desc,
        "employment_type": str(posting.get("employmentType") or ""),
        "date_posted": str(posting.get("datePosted") or ""),
        "valid_through": str(posting.get("validThrough") or ""),
        "location": location_from_job_posting(posting),
        "salary_raw": salary_raw_from_posting(posting),
        "company_name": company_name,
        "company_url": platform_company,
        "company_slug": company_slug_from_url(platform_company),
        "website": external_website,
        "website_host": website_host(external_website),
        "seed_url": (seed_url or url or "").split("?")[0],
        "parse_ok": bool(posting),
    }


def harvest_related_jobs(html: str, parent_id: str) -> list[dict[str, Any]]:
    """Related job links on the page — side list only; do not scrape in batch."""
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    candidates: list[str] = []
    for m in JOB_URL_RE.finditer(html or ""):
        candidates.append(m.group(1))
    for m in REL_JOB_RE.finditer(html or ""):
        href = m.group(1)
        if "/company/" in href:
            continue
        candidates.append(_abs_startup(href))

    for raw in candidates:
        card_url = _abs_startup(raw) if raw.startswith("/") else raw.split("?")[0].rstrip("/")
        jid = job_id_from_url(card_url)
        if not card_url or not jid or jid == parent_id or jid in seen:
            continue
        if "startup.jobs" not in card_url:
            continue
        if "/company/" in card_url:
            continue
        seen.add(jid)
        out.append(
            {
                "job_id": jid,
                "url": card_url,
                "discovered_from_job_id": parent_id,
                "company_name": "",
                "company_url": "",
                "location": "",
                "source": "startup_jobs",
                "fidelity": "related_card",
            }
        )
    return out
