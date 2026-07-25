"""Shared JSON-LD helpers for platform job/company parsers."""

from __future__ import annotations

import html as html_lib
import json
import re
from typing import Any
from urllib.parse import urlparse

JSON_LD_RE = re.compile(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.I | re.S,
)
TAG_RE = re.compile(r"<[^>]+>")


def extract_json_ld(html: str) -> list[Any]:
    blocks: list[Any] = []
    for m in JSON_LD_RE.finditer(html or ""):
        raw = m.group(1).strip()
        try:
            blocks.append(json.loads(raw))
        except json.JSONDecodeError:
            continue
    return blocks


def iter_ld_objects(blocks: list[Any]):
    for block in blocks:
        if isinstance(block, list):
            items = block
        elif isinstance(block, dict) and isinstance(block.get("@graph"), list):
            items = block["@graph"]
        else:
            items = [block]
        for item in items:
            if isinstance(item, dict):
                yield item


def _types_of(obj: dict) -> list[str]:
    t = obj.get("@type", "")
    if isinstance(t, list):
        return [str(x) for x in t]
    return [str(t)] if t else []


def find_typed(blocks: list[Any], needle: str) -> dict[str, Any] | None:
    rx = re.compile(needle, re.I)
    for obj in iter_ld_objects(blocks):
        if any(rx.search(t) for t in _types_of(obj)):
            return obj
    return None


def find_job_posting(html: str) -> dict[str, Any] | None:
    return find_typed(extract_json_ld(html), r"JobPosting")


def find_organization(html: str) -> dict[str, Any] | None:
    return find_typed(extract_json_ld(html), r"Organization")


def strip_html(text: str) -> str:
    if not text:
        return ""
    unescaped = html_lib.unescape(text)
    return re.sub(r"\s+", " ", TAG_RE.sub(" ", unescaped)).strip()


def website_host(url: str) -> str:
    try:
        host = urlparse(url or "").netloc.lower()
    except Exception:
        return ""
    if host.startswith("www."):
        host = host[4:]
    # Drop platform hosts — not an external company website
    if host in (
        "linkedin.com",
        "www.linkedin.com",
        "builtin.com",
        "www.builtin.com",
        "startup.jobs",
        "www.startup.jobs",
        "wellfound.com",
        "www.wellfound.com",
    ):
        return ""
    return host


def is_external_website(url: str) -> bool:
    return bool(website_host(url))


def location_from_job_posting(posting: dict[str, Any]) -> str:
    loc = posting.get("jobLocation") or {}
    if isinstance(loc, list) and loc:
        loc = loc[0]
    if not isinstance(loc, dict):
        return str(loc) if loc else ""
    place = loc.get("address") or loc
    if isinstance(place, str):
        return place
    if not isinstance(place, dict):
        return ""
    parts = [
        place.get("addressLocality"),
        place.get("addressRegion"),
        place.get("addressCountry"),
    ]
    joined = ", ".join(str(x) for x in parts if x)
    return joined or str(place.get("addressLocality") or place.get("addressRegion") or "")


def salary_raw_from_posting(posting: dict[str, Any]) -> str:
    base = posting.get("baseSalary") or posting.get("estimatedSalary")
    if not base:
        return ""
    if isinstance(base, str):
        return base
    if not isinstance(base, dict):
        return ""
    value = base.get("value") or {}
    if isinstance(value, dict):
        lo = value.get("minValue") or value.get("value") or ""
        hi = value.get("maxValue") or ""
        cur = value.get("currency") or base.get("currency") or ""
        unit = value.get("unitText") or base.get("unitText") or ""
        if lo and hi:
            return f"{cur} {lo}-{hi} {unit}".strip()
        if lo:
            return f"{cur} {lo} {unit}".strip()
    cur = base.get("currency") or ""
    amount = base.get("value") or ""
    return f"{cur} {amount}".strip()


def hiring_org(posting: dict[str, Any]) -> dict[str, Any]:
    org = posting.get("hiringOrganization") or {}
    return org if isinstance(org, dict) else {}
