"""Parse Built In job + company HTML (JSON-LD primary)."""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from tally_scanner.jsonld_util import (
    find_job_posting,
    find_organization,
    hiring_org,
    is_external_website,
    location_from_job_posting,
    salary_raw_from_posting,
    strip_html,
    website_host,
)

JOB_ID_RE = re.compile(r"/job/[^/?#]+/(\d{4,})(?:[/?#]|$)", re.I)
JOB_PATH_RE = re.compile(r'href="(/job/[^"?#]+/\d{4,}[^"]*)"', re.I)
COMPANY_PATH_RE = re.compile(r'href="(/company/[^"?#]+)"', re.I)


def job_id_from_url(url: str) -> str | None:
    m = JOB_ID_RE.search(url or "")
    return m.group(1) if m else None


def company_slug_from_url(url: str) -> str:
    m = re.search(r"builtin\.com/company/([^/?#]+)", url or "", re.I)
    if m:
        return m.group(1).lower()
    m = re.search(r"^/company/([^/?#]+)", url or "", re.I)
    return m.group(1).lower() if m else ""


def _abs_builtin(href: str) -> str:
    if not href:
        return ""
    clean = href.replace("&amp;", "&").split("?")[0].rstrip("/")
    if re.match(r"^https?://", clean, re.I):
        return clean
    if clean.startswith("/"):
        return f"https://builtin.com{clean}"
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
    for candidate in (same_as, org_url):
        if not candidate:
            continue
        if "builtin.com/company/" in candidate:
            platform_company = candidate.split("?")[0].rstrip("/")
        elif is_external_website(candidate):
            external_website = candidate.split("?")[0]

    # Fallback: first /company/ path in page
    if not platform_company:
        m = COMPANY_PATH_RE.search(html or "")
        if m:
            platform_company = _abs_builtin(m.group(1))

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
        "source": "builtin",
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
    """Collect related /job/... paths — side list only; do not scrape in batch."""
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for m in JOB_PATH_RE.finditer(html or ""):
        card_url = _abs_builtin(m.group(1))
        jid = job_id_from_url(card_url)
        if not card_url or not jid or jid == parent_id or jid in seen:
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
                "source": "builtin",
                "fidelity": "related_card",
            }
        )
    return out


def parse_company_page(html: str, *, company_slug: str = "", url: str = "") -> dict[str, Any]:
    """Optional helper: Organization JSON-LD → website + employee count."""
    org = find_organization(html) or {}
    slug = company_slug or company_slug_from_url(url)
    website = ""
    for candidate in (str(org.get("url") or ""), str(org.get("sameAs") or "")):
        if is_external_website(candidate):
            website = candidate.split("?")[0]
            break

    employees = org.get("numberOfEmployees")
    employee_count: Any = ""
    size_bucket = ""
    if isinstance(employees, dict):
        employee_count = employees.get("value") or ""
        size_bucket = str(employees.get("name") or employees.get("value") or "")
    elif employees not in (None, ""):
        employee_count = employees
        size_bucket = str(employees)

    desc = strip_html(str(org.get("description") or ""))
    return {
        "company_slug": slug,
        "name": str(org.get("name") or ""),
        "website": website,
        "website_host": website_host(website),
        "employee_count": employee_count,
        "size_bucket": size_bucket,
        "org_description": desc[:2000],
        "company_url": (url or f"https://builtin.com/company/{slug}").split("?")[0],
        "source": "builtin",
        "resolved": bool(website),
        "resolved_at": datetime.now(timezone.utc).isoformat(),
        "parse_ok": bool(org),
    }


def company_host_from_url(url: str) -> str:
    try:
        return urlparse(url).netloc.lower()
    except Exception:
        return ""
