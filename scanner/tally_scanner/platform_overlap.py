"""
Overlap / skip helpers for Built In + startup.jobs batches vs LinkedIn inventory.

Join keys: normalize_company_name and/or external website host.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from tally_scanner.jsonld_util import website_host
from tally_scanner.wash import normalize_company_name

ROOT = Path(__file__).resolve().parents[1]
WASHED_JOBS = ROOT.parent / "apps" / "tally" / "public" / "washed-jobs.json"
WASHED_COMPANIES = ROOT.parent / "apps" / "tally" / "public" / "washed-companies.json"
LI_EXTRACT = ROOT / "data" / "linkedin_extract"
LI_JOBS_JSONL = LI_EXTRACT / "jobs.jsonl"
LI_COMPANIES_JSONL = LI_EXTRACT / "companies.jsonl"

LONG_DESC_MIN = 200
RICH_DESC_MIN = 120
TITLE_SIM_THRESHOLD = 0.55

STOPWORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "of",
    "to",
    "for",
    "in",
    "at",
    "on",
    "with",
    "us",
    "remote",
}


def _iter_jsonl(path: Path):
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            continue


def title_tokens(title: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", (title or "").lower())
    return {w for w in words if w not in STOPWORDS and len(w) > 1}


def titles_fuzzy_match(a: str, b: str, *, threshold: float = TITLE_SIM_THRESHOLD) -> bool:
    ta, tb = title_tokens(a), title_tokens(b)
    if not ta or not tb:
        return False
    inter = len(ta & tb)
    union = len(ta | tb)
    if union == 0:
        return False
    jaccard = inter / union
    # Also accept if smaller set is mostly contained
    containment = inter / min(len(ta), len(tb))
    return jaccard >= threshold or containment >= 0.75


@dataclass
class CompanyOverlap:
    name_key: str = ""
    website: str = ""
    website_host: str = ""
    employee_count: Any = ""
    size_bucket: str = ""
    org_description: str = ""
    has_useful_fields: bool = False
    rich_linkedin_jobs: list[dict[str, str]] = field(default_factory=list)


@dataclass
class OverlapIndex:
    by_name: dict[str, CompanyOverlap] = field(default_factory=dict)
    by_host: dict[str, CompanyOverlap] = field(default_factory=dict)
    seen_urls: set[str] = field(default_factory=set)

    def _merge_company(self, key_name: str, host: str, patch: dict[str, Any]) -> CompanyOverlap:
        co = None
        if key_name and key_name in self.by_name:
            co = self.by_name[key_name]
        elif host and host in self.by_host:
            co = self.by_host[host]
        if co is None:
            co = CompanyOverlap(name_key=key_name, website_host=host)
        if key_name:
            co.name_key = co.name_key or key_name
            self.by_name[key_name] = co
        if host:
            co.website_host = co.website_host or host
            self.by_host[host] = co
        if patch.get("website") and not co.website:
            co.website = str(patch["website"])
            co.website_host = website_host(co.website) or co.website_host
            if co.website_host:
                self.by_host[co.website_host] = co
        for fld in ("employee_count", "size_bucket", "org_description"):
            if patch.get(fld) not in (None, "") and getattr(co, fld) in (None, ""):
                setattr(co, fld, patch[fld])
        co.has_useful_fields = bool(
            co.website
            and (
                co.employee_count not in (None, "")
                or co.size_bucket
                or (co.org_description and len(co.org_description) > 40)
            )
        )
        return co

    def lookup(self, *, company: str = "", website: str = "") -> CompanyOverlap | None:
        name_key = normalize_company_name(company) if company else ""
        host = website_host(website) if website else ""
        if name_key and name_key in self.by_name:
            return self.by_name[name_key]
        if host and host in self.by_host:
            return self.by_host[host]
        return None


def build_overlap_index(
    *,
    washed_jobs_path: Path = WASHED_JOBS,
    washed_companies_path: Path = WASHED_COMPANIES,
    li_jobs_jsonl: Path = LI_JOBS_JSONL,
    li_companies_jsonl: Path = LI_COMPANIES_JSONL,
) -> OverlapIndex:
    idx = OverlapIndex()

    if washed_jobs_path.exists():
        payload = json.loads(washed_jobs_path.read_text(encoding="utf-8"))
        for j in payload.get("jobs") or []:
            url = (j.get("url") or "").split("?")[0]
            if url:
                idx.seen_urls.add(url.lower())
            if j.get("source") != "linkedin":
                continue
            name_key = normalize_company_name(str(j.get("company") or ""))
            desc = str(j.get("description") or "")
            if name_key and len(desc) >= RICH_DESC_MIN:
                co = idx._merge_company(name_key, "", {})
                co.rich_linkedin_jobs.append(
                    {
                        "title": str(j.get("title") or ""),
                        "url": url,
                        "description_len": str(len(desc)),
                    }
                )

    if washed_companies_path.exists():
        payload = json.loads(washed_companies_path.read_text(encoding="utf-8"))
        for c in payload.get("companies") or []:
            name_key = normalize_company_name(str(c.get("name") or ""))
            website = str(c.get("website") or "")
            host = website_host(website)
            if not name_key and not host:
                continue
            idx._merge_company(
                name_key,
                host,
                {
                    "website": website,
                    "employee_count": c.get("employee_count") or "",
                    "size_bucket": c.get("size_bucket") or "",
                    "org_description": c.get("org_description") or "",
                },
            )

    for row in _iter_jsonl(li_jobs_jsonl):
        url = (row.get("url") or row.get("seed_url") or "").split("?")[0]
        if url:
            idx.seen_urls.add(url.lower())
        name_key = normalize_company_name(str(row.get("company_name") or ""))
        desc = str(row.get("description") or "")
        if name_key and len(desc) >= RICH_DESC_MIN:
            co = idx._merge_company(name_key, "", {})
            co.rich_linkedin_jobs.append(
                {
                    "title": str(row.get("title") or ""),
                    "url": url,
                    "description_len": str(len(desc)),
                }
            )

    for row in _iter_jsonl(li_companies_jsonl):
        name_key = normalize_company_name(str(row.get("name") or ""))
        website = str(row.get("website") or "")
        host = website_host(website)
        if not name_key and not host:
            continue
        idx._merge_company(
            name_key,
            host,
            {
                "website": website,
                "employee_count": row.get("employee_count") or "",
                "size_bucket": row.get("size_bucket") or "",
                "org_description": row.get("org_description") or "",
            },
        )

    return idx


def should_skip_company_enrich(idx: OverlapIndex, *, company: str, website: str = "") -> tuple[bool, str]:
    """Skip company-page enrich when LinkedIn already has website + useful fields."""
    co = idx.lookup(company=company, website=website)
    if co and co.website and co.has_useful_fields:
        return True, "linkedin_already_has_website_and_fields"
    if co and co.website:
        return True, "linkedin_already_has_website"
    return False, ""


def should_skip_job_scrape(
    idx: OverlapIndex,
    seed: dict[str, Any],
) -> tuple[bool, str]:
    """
    Skip when LinkedIn already covers same company+role richly, or seed already
    has a long description — unless forced to scrape.

    ALWAYS scrape if: missing description, no website on company, or job URL
    not seen before as a distinct posting in inventory/extract.
    """
    url = (seed.get("url") or "").split("?")[0]
    desc = str(seed.get("description") or "")
    company = str(seed.get("company") or "")
    title = str(seed.get("title") or "")
    seed_website = str(seed.get("website") or "")

    co = idx.lookup(company=company, website=seed_website)
    company_has_website = bool(co and co.website) or bool(website_host(seed_website))

    # ALWAYS scrape overrides (missing desc / no website / unseen URL)
    if len(desc.strip()) < 40:
        return False, ""
    if not company_has_website:
        return False, ""
    if url and url.lower() not in idx.seen_urls:
        return False, ""

    # Skip: seed already long
    if len(desc) >= LONG_DESC_MIN:
        return True, "seed_already_has_long_description"

    # Skip: LinkedIn rich same-role
    if co:
        for lj in co.rich_linkedin_jobs:
            if titles_fuzzy_match(title, lj.get("title") or ""):
                return True, "linkedin_rich_same_role"

    return False, ""
