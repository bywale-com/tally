"""Parse LinkedIn guest job HTML — port of apps/tally/src/trigger/crawl/parse.ts."""

from __future__ import annotations

import json
import re
from typing import Any
from urllib.parse import urlparse

JOB_ID_RE = re.compile(r"/jobs/view/[^/?#]*?(\d{6,})(?:[/?#]|$)", re.I)
JSON_LD_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S,
)
CARD_RE = re.compile(
    r'<div[^>]*class="[^"]*base-card[^"]*"[^>]*>[\s\S]*?(?=<div[^>]*class="[^"]*base-card|<\/ul>|$)',
    re.I,
)


def job_id_from_url(url: str) -> str | None:
    m = JOB_ID_RE.search(url or "")
    return m.group(1) if m else None


def company_slug_from_url(url: str) -> str:
    m = re.search(r"linkedin\.com/company/([^/?#]+)", url or "", re.I)
    return m.group(1) if m else ""


def company_host_from_url(url: str) -> str:
    try:
        return urlparse(url).netloc.lower()
    except Exception:
        return ""


def _first_match(html: str, pattern: str, flags: int = re.I) -> str:
    m = re.search(pattern, html, flags)
    return (m.group(1) or "").strip() if m else ""


def _abs_url(href: str) -> str:
    if not href:
        return ""
    clean = href.replace("&amp;", "&")
    if re.match(r"^https?://", clean, re.I):
        return clean.split("?")[0]
    if clean.startswith("/"):
        return f"https://www.linkedin.com{clean.split('?')[0]}"
    return ""


def _founder_hint(desc: str) -> str:
    patterns = [
        r"report(?:ing)? to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})",
        r"founded by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})",
        r"CEO[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})",
    ]
    for pat in patterns:
        m = re.search(pat, desc or "", re.I if "founded" in pat else 0)
        if m:
            return m.group(1)
    return ""


def _extract_json_ld(html: str) -> list[Any]:
    blocks: list[Any] = []
    for m in JSON_LD_RE.finditer(html):
        raw = m.group(1).strip()
        try:
            blocks.append(json.loads(raw))
        except json.JSONDecodeError:
            continue
    return blocks


def parse_primary_job(
    *,
    html: str,
    url: str,
    seed_url: str,
    job_id: str | None = None,
) -> dict[str, Any]:
    posting: dict[str, Any] | None = None
    for block in _extract_json_ld(html):
        candidates = block if isinstance(block, list) else [block]
        if isinstance(block, dict) and isinstance(block.get("@graph"), list):
            candidates = block["@graph"]
        for c in candidates:
            if not isinstance(c, dict):
                continue
            t = c.get("@type", "")
            types = t if isinstance(t, list) else [t]
            if any(re.search(r"JobPosting", str(x), re.I) for x in types):
                posting = c
                break
        if posting:
            break

    org = (posting or {}).get("hiringOrganization") or {}
    if not isinstance(org, dict):
        org = {}
    loc = (posting or {}).get("jobLocation") or {}
    if not isinstance(loc, dict):
        loc = {}
    place = loc.get("address") or loc
    if not isinstance(place, dict):
        place = {}
    geo = loc.get("geo") or {}
    if not isinstance(geo, dict):
        geo = {}
    exp = (posting or {}).get("experienceRequirements") or {}
    if not isinstance(exp, dict):
        exp = {}
    months = exp.get("monthsOfExperience") or exp.get("months_of_experience") or ""
    company_url = str(org.get("sameAs") or org.get("url") or "")

    resolved_id = (
        job_id
        or job_id_from_url(url)
        or job_id_from_url(str((posting or {}).get("url") or ""))
        or ""
    )

    location = (
        str(place.get("addressLocality") or "")
        or str(place.get("addressRegion") or "")
        or ", ".join(
            str(x)
            for x in (
                place.get("addressLocality"),
                place.get("addressRegion"),
                place.get("addressCountry"),
            )
            if x
        )
        or (place if isinstance(place, str) else "")
    )

    desc = str((posting or {}).get("description") or "")
    gaps = [
        "no_external_website",
        "linkedin_internal_company_link_only",
        "company_slug_may_be_historical" if company_slug_from_url(company_url) else "",
        "industry_may_be_stale_or_missing",
    ]

    return {
        "job_id": resolved_id,
        "source": "linkedin",
        "fidelity": "primary",
        "url": url.split("?")[0],
        "title": str((posting or {}).get("title") or ""),
        "description": desc,
        "employment_type": str((posting or {}).get("employmentType") or ""),
        "date_posted": str((posting or {}).get("datePosted") or ""),
        "valid_through": str((posting or {}).get("validThrough") or ""),
        "location": location,
        "geo_lat": str(geo.get("latitude") or ""),
        "geo_lng": str(geo.get("longitude") or ""),
        "months_of_experience": months,
        "founder_or_report_line": _founder_hint(desc),
        "company_name": str(org.get("name") or ""),
        "company_linkedin_url": company_url,
        "company_slug": company_slug_from_url(company_url),
        "company_host": company_host_from_url(company_url),
        "salary_raw": "",
        "seed_url": seed_url.split("?")[0],
        "parse_ok": bool(posting),
        "gaps": "|".join(g for g in gaps if g),
    }


def harvest_similar_cards(html: str, parent_id: str) -> list[dict[str, Any]]:
    cards = CARD_RE.findall(html) or []
    if not cards:
        cards = [html]

    out: list[dict[str, Any]] = []
    seen: set[str] = set()

    for raw in cards:
        href = _first_match(raw, r'href="([^"]*/jobs/view/[^"]+)"') or _first_match(
            raw, r"href='([^']*/jobs/view/[^']+)'"
        )
        card_url = _abs_url(href)
        jid = job_id_from_url(card_url)
        if not card_url or not jid or jid == parent_id or jid in seen:
            continue
        seen.add(jid)

        company_href = _abs_url(
            _first_match(raw, r'href="([^"]*linkedin\.com/company/[^"]+)"')
            or _first_match(raw, r'href="(/company/[^"]+)"')
        )
        company_name = re.sub(
            r"<[^>]+>",
            "",
            _first_match(raw, r'base-search-card__subtitle[^>]*>([\s\S]*?)</')
            or _first_match(raw, r'hidden-nested-link[^>]*>([\s\S]*?)</'),
        ).strip()
        location = re.sub(
            r"<[^>]+>",
            "",
            _first_match(raw, r'job-search-card__location[^>]*>([\s\S]*?)</'),
        ).strip()
        date_text = _first_match(raw, r'datetime="([^"]+)"') or re.sub(
            r"<[^>]+>",
            "",
            _first_match(raw, r'job-search-card__listdate[^>]*>([\s\S]*?)</'),
        ).strip()
        salary_raw = re.sub(r"\s+", " ", re.sub(
            r"<[^>]+>",
            "",
            _first_match(raw, r'job-search-card__salary-info[^>]*>([\s\S]*?)</'),
        )).strip() or re.sub(
            r"\s+",
            " ",
            _first_match(raw, r"(\$[\d,]+\s*[-–]\s*\$[\d,]+[^<]*)"),
        ).strip()

        out.append(
            {
                "job_id": jid,
                "url": card_url,
                "discovered_from_job_id": parent_id,
                "company_name": company_name,
                "company_slug": company_slug_from_url(company_href),
                "company_linkedin_url": company_href,
                "location": location,
                "date_text": date_text,
                "salary_raw": salary_raw,
                "source": "linkedin",
                "fidelity": "similar_card",
            }
        )
    return out


def parse_company_unescaped(raw_html: str, company_slug: str) -> dict[str, Any]:
    """
    Port of apps/tally/src/trigger/crawl/parse.ts parseCompanyUnescaped.

    LinkedIn guest company pages bury Organization fields as escaped JSON
    inside the HTML body (not always clean ld+json).
    """
    from datetime import datetime, timezone

    unescaped = (
        (raw_html or "")
        .replace('\\"', '"')
        .replace("\\n", " ")
        .replace("\\u0026", "&")
    )

    def grab(pattern: str) -> str:
        m = re.search(pattern, unescaped, re.I)
        return (m.group(1) or "").strip() if m else ""

    website = grab(r'"sameAs":"((?:https?://)?[a-z0-9.\-]+\.[a-z]{2,}[^"]*)"')
    if re.search(r"linkedin\.com", website, re.I):
        website = ""
    if website and not re.match(r"^https?://", website, re.I):
        website = f"https://{website}"

    emp_str = grab(r'"numberOfEmployees":\{[^}]*?"value":\s*([0-9]+)') or grab(
        r'numberOfEmployees"[^0-9]{0,20}([0-9]+)'
    )
    employee_count: Any = int(emp_str) if emp_str.isdigit() else ""
    size_bucket = grab(r"([0-9,]+)\s+employees")
    followers_str = grab(r"([0-9,]+)\s+followers")
    follower_count: Any = (
        int(followers_str.replace(",", "")) if followers_str else ""
    )
    hq_country = grab(r'"addressCountry":"([^"]{1,60})"')
    hq_locality = grab(r'"addressLocality":"([^"]{1,80})"')
    hq_region = grab(r'"addressRegion":"([^"]{1,80})"')
    org_description = grab(r'"description":"([^"]{20,600})"')
    founded = grab(r'"foundingDate":"([^"]{1,20})"') or grab(
        r"Founded[^0-9]{0,6}([0-9]{4})"
    )
    canonical_host = grab(
        r'rel="canonical"\s+href="https?://([a-z.]*linkedin\.com)'
    )

    theme_set: list[str] = []
    seen_themes: set[str] = set()
    for m in re.finditer(
        r"posts/[a-z0-9-]+_([a-z0-9-]{8,80})-activity-", unescaped, re.I
    ):
        theme = m.group(1).replace("-", " ").strip()
        if theme and theme not in seen_themes:
            seen_themes.add(theme)
            theme_set.append(theme)
        if len(theme_set) >= 12:
            break

    enrich_flag = ""
    if employee_count != "" and size_bucket:
        try:
            bucket_n = int(re.sub(r"[^\d]", "", size_bucket) or "0")
            if bucket_n and bucket_n != int(employee_count):
                enrich_flag = "employee_count_split_signal"
        except (TypeError, ValueError):
            pass

    return {
        "company_slug": company_slug,
        "website": website,
        "employee_count": employee_count,
        "size_bucket": size_bucket,
        "follower_count": follower_count,
        "hq_country": hq_country,
        "hq_locality": hq_locality,
        "hq_region": hq_region,
        "company_host_canonical": canonical_host,
        "org_description": org_description,
        "founded": founded,
        "recent_post_themes": " | ".join(theme_set),
        "resolved": bool(website),
        "enrich_flag": enrich_flag,
        "resolved_at": datetime.now(timezone.utc).isoformat(),
        "parse_hit_count": sum(
            1
            for v in (
                website,
                employee_count,
                size_bucket,
                follower_count,
                hq_country,
                hq_locality,
                founded,
                org_description,
            )
            if v not in ("", None)
        ),
    }
