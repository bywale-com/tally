"""
Wash pipeline: manual scrape CSVs (Instant Data Scraper + Apify exports) → canonical jobs.

Source families detected by content, not filename:
  - linkedin      (named headers from Apify LinkedIn scraper)
  - a16z          (portfoliojobs.a16z.com IDS export)
  - sequoia       (jobs.sequoiacap.com IDS export — grouped company/job rows)
  - wellfound     (wellfound.com IDS export — one company card packs 1..3 jobs)
  - builtin       (builtin.com IDS export)
  - startup_jobs  (startup.jobs IDS export — shredded titles rebuilt from URL slug)

Output: jobs.jsonl + report.json, optionally published as a single JSON array
for the Tally app Inventory module.

Usage:
  python -m tally_scanner wash --in manual_scrapes_raw --out data/washed \
      --publish ../apps/tally/public/washed-jobs.json
"""

from __future__ import annotations

import csv
import hashlib
import json
import logging
import re
import sys
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

log = logging.getLogger(__name__)

csv.field_size_limit(min(sys.maxsize, 10_000_000))

# ---------------------------------------------------------------- regexes

POSTED_RE = re.compile(
    r"^(?:reposted\s+|posted\s+)?"
    r"(today|yesterday|just now|"
    r"an?\s+(?:day|week|month|hour|minute)s?\s+ago|"
    r"\d+\+?\s+(?:day|week|month|hour|minute)s?\s+ago)$",
    re.I,
)
EMPLOYMENT_RE = re.compile(
    r"^(full[- ]time|part[- ]time|contract|contractor|internship|intern|cofounder|temporary|freelance)$",
    re.I,
)
SALARY_HINT_RE = re.compile(
    r"(\$|€|£|₹|\bUSD\b|\bCAD\b|\bEUR\b|\bGBP\b|\d+\s*[kK]\s*[-–—]|\d+[kK]-\d+[kK]|salary range|similar jobs pay|annually)",
    re.I,
)
EXP_RE = re.compile(r"^\d+\+?\s+years?\s+of\s+exp", re.I)
EMPLOYEES_RE = re.compile(r"(\d[\d,]*)\s*[-–]\s*(\d[\d,]*)\s+employees|(\d[\d,]*)\+?\s+employees", re.I)
STAGE_RE = re.compile(r"\b(early stage|growth stage|late stage|seed|series [a-f]|growth|public)\b", re.I)
MONEY_TOKEN_RE = re.compile(r"(\d[\d,]*(?:\.\d+)?)\s*([kK])?")
ALL_JOBS_AT_RE = re.compile(r"^All jobs at (.+)$", re.I)

WORKPLACE_VALUES = {
    "remote": "remote",
    "remote only": "remote",
    "in-office": "onsite",
    "in office": "onsite",
    "on-site": "onsite",
    "onsite": "onsite",
    "hybrid": "hybrid",
    "in-office or remote": "hybrid",
    "remote or hybrid": "hybrid",
}

FOUNDING_RE = re.compile(r"\bfounding\b|\bfounder\b", re.I)
SALES_RE = re.compile(
    r"account\s+executive|\bae\b|\bsdr\b|\bbdr\b|sales|business\s+development|"
    r"go[- ]to[- ]market|\bgtm\b|revenue|partnerships|account\s+manager|closer",
    re.I,
)

TRACKING_PARAMS_RE = re.compile(r"^(utm_|lever-source|gh_src|ashby_|ref$|source$)", re.I)
LEGAL_SUFFIX_RE = re.compile(
    r"\b(incorporated|inc|llc|ltd|corp|corporation|co|company|limited|plc|gmbh|ag|sa|bv)\b\.?",
    re.I,
)
# Company profile / ATS board hosts → extract stable slug
COMPANY_URL_SLUG_RE = re.compile(
    r"(?:wellfound\.com/company|builtin\.com/company|linkedin\.com/company|"
    r"jobs\.ashbyhq\.com|boards\.greenhouse\.io|job-boards\.greenhouse\.io|"
    r"jobs\.lever\.co|startup\.jobs/company)/([^/?#]+)",
    re.I,
)

# ---------------------------------------------------------------- model


@dataclass
class WashedCompany:
    id: str = ""
    name: str = ""
    url: str = ""  # company link; empty if unknown — never invent
    job_count: int = 0
    sources: list[str] = field(default_factory=list)
    # Role tags rolled up from washed jobs' relevance labels.
    role_tags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "url": self.url,
            "job_count": self.job_count,
            "sources": sorted(self.sources),
            "role_tags": sorted(self.role_tags),
        }


@dataclass
class WashedJob:
    id: str = ""
    source: str = ""
    source_file: str = ""
    company: str = ""
    title: str = ""
    url: str = ""
    company_url: str = ""
    location_raw: str = ""
    remote: str = "unknown"  # remote | hybrid | onsite | unknown
    salary_raw: str = ""
    salary_min: float | None = None
    salary_max: float | None = None
    salary_currency: str = ""
    salary_period: str = ""
    equity_raw: str = ""
    posted_raw: str = ""
    posted_at: str = ""  # ISO date, best effort
    employment_type: str = ""
    seniority: str = ""
    description: str = ""
    skills: list[str] = field(default_factory=list)
    company_stage: str = ""
    company_size: str = ""
    industries: str = ""
    logo_url: str = ""
    scraped_at: str = ""
    relevance: str = "other"  # founding_sales | founding | sales | other
    quality_flags: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {k: v for k, v in self.__dict__.items()}


# ---------------------------------------------------------------- helpers


def _clean(s: str | None) -> str:
    if not s:
        return ""
    return re.sub(r"\s+", " ", str(s)).strip()


def _is_url(s: str) -> bool:
    return s.startswith("http://") or s.startswith("https://")


def normalize_url(url: str) -> str:
    """Strip tracking params/fragments so dedup keys are stable."""
    url = _clean(url)
    if not _is_url(url):
        return url
    try:
        p = urlparse(url)
    except ValueError:
        return url
    params = [(k, v) for k, v in parse_qsl(p.query, keep_blank_values=True) if not TRACKING_PARAMS_RE.match(k)]
    return urlunparse((p.scheme.lower(), p.netloc.lower(), p.path.rstrip("/"), "", urlencode(params), ""))


def parse_posted(raw: str, anchor: datetime) -> str:
    """'3 days ago' / 'Reposted 10 Days Ago' / 'Posted 30+ days ago' → ISO date."""
    raw = _clean(raw).lower()
    if not raw:
        return ""
    # ISO date passthrough
    m = re.match(r"^(\d{4}-\d{2}-\d{2})", raw)
    if m:
        return m.group(1)
    raw = re.sub(r"^(reposted|posted)\s+", "", raw)
    if raw in ("today", "just now"):
        days = 0.0
    elif raw == "yesterday":
        days = 1.0
    else:
        m = re.match(r"^(an?|\d+\+?)\s+(day|week|month|hour|minute)s?\s+ago$", raw)
        if not m:
            return ""
        n_raw = m.group(1)
        n = 1.0 if n_raw in ("a", "an") else float(n_raw.rstrip("+"))
        unit = m.group(2)
        days = {"minute": n / 1440, "hour": n / 24, "day": n, "week": n * 7, "month": n * 30}[unit]
    return (anchor - timedelta(days=days)).date().isoformat()


def parse_salary(raw: str) -> tuple[float | None, float | None, str, str, str]:
    """Return (min, max, currency, period, equity_raw)."""
    raw = _clean(raw)
    if not raw:
        return None, None, "", "", ""
    equity = ""
    text = raw
    if "•" in text:
        parts = [p.strip() for p in text.split("•")]
        money_parts = [p for p in parts if SALARY_HINT_RE.search(p) and "%" not in p]
        equity_parts = [p for p in parts if "%" in p]
        equity = " • ".join(equity_parts)
        text = money_parts[0] if money_parts else parts[0]
    currency = ""
    if "₹" in text:
        currency = "INR"
    elif "€" in text or re.search(r"\bEUR\b", text):
        currency = "EUR"
    elif "£" in text or re.search(r"\bGBP\b", text):
        currency = "GBP"
    elif re.search(r"\bCAD\b", text):
        currency = "CAD"
    elif "$" in text or re.search(r"\bUSD\b", text):
        currency = "USD"
    period = ""
    if re.search(r"year|annual|/ ?yr", text, re.I):
        period = "year"
    elif re.search(r"month", text, re.I):
        period = "month"
    elif re.search(r"hour|/ ?hr", text, re.I):
        period = "hour"
    values: list[float] = []
    for m in MONEY_TOKEN_RE.finditer(text):
        num = float(m.group(1).replace(",", ""))
        if m.group(2):
            num *= 1000
        values.append(num)
    values = [v for v in values if v >= 1000]  # ignore "0.5", "401(k)"-style noise
    if not values:
        return None, None, currency, period, equity
    if not period and max(values) >= 10_000:
        period = "year"
    lo, hi = min(values), max(values)
    return lo, hi, currency or "USD", period, equity


def classify_remote(*hints: str) -> str:
    joined = " ".join(h.lower() for h in hints if h)
    for key, val in WORKPLACE_VALUES.items():
        if key in joined:
            return val
    if "remote" in joined:
        return "remote"
    return "unknown"


def classify_relevance(title: str, description: str = "") -> str:
    t = title or ""
    founding = bool(FOUNDING_RE.search(t))
    sales = bool(SALES_RE.search(t))
    if founding and sales:
        return "founding_sales"
    if founding:
        # founding-anything is interesting; check description for sales signal
        if description and SALES_RE.search(description[:500]):
            return "founding_sales"
        return "founding"
    if sales:
        return "sales"
    return "other"


def make_id(job: WashedJob) -> str:
    key = normalize_url(job.url) or f"{job.source}|{job.company.lower()}|{job.title.lower()}"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]


def normalize_company_name(name: str) -> str:
    """Alphanumeric key for company name fallback dedupe."""
    s = LEGAL_SUFFIX_RE.sub(" ", name.lower())
    return re.sub(r"[^a-z0-9]", "", s)


def company_url_key(url: str) -> str:
    """
    Strong identity from a company profile / ATS board URL.
    Prefer host+slug (e.g. wellfound.com/company/acme → wellfound|acme)
    so the same slug on different boards stays distinct until AI merge.
    """
    url = normalize_url(url)
    if not url:
        return ""
    m = COMPANY_URL_SLUG_RE.search(url)
    if m:
        host = urlparse(url).netloc.lower().removeprefix("www.")
        slug = m.group(1).lower().rstrip("/")
        return f"{host}|{slug}"
    # Generic company-ish URL: use normalized URL as key
    return url


def company_identity(job: WashedJob) -> tuple[str, str]:
    """Return (strong_key, name_key). strong_key may be empty."""
    strong = company_url_key(job.company_url)
    if not strong and job.url:
        # Job ATS URL sometimes embeds the company board slug
        strong = company_url_key(job.url)
    name_key = normalize_company_name(job.company) if job.company else ""
    return strong, name_key


def make_company_id(strong_key: str, name_key: str) -> str:
    key = strong_key or name_key or "unknown"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]


def slug_to_title(slug: str) -> str:
    words = [w for w in slug.split("-") if w]
    keep_upper = {"ae", "sdr", "bdr", "gtm", "us", "ca", "uk", "ai", "b2b", "saas", "dach", "emea", "apac"}
    out = []
    for w in words:
        out.append(w.upper() if w.lower() in keep_upper else w.capitalize())
    return " ".join(out)


# ---------------------------------------------------------------- csv IO


def read_csv_rows(path: Path) -> tuple[list[str], list[list[str]]]:
    with path.open("r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.reader(fh)
        rows = [row for row in reader]
    if not rows:
        return [], []
    return rows[0], rows[1:]


def detect_source(header: list[str], rows: list[list[str]]) -> str:
    header_set = {h.strip() for h in header}
    if "companyName" in header_set and "title" in header_set:
        return "linkedin"
    blob = "\n".join(",".join(r) for r in rows[:8])
    if "portfoliojobs.a16z.com" in blob:
        return "a16z"
    if "sequoiacap.com" in blob:
        return "sequoia"
    if "wellfound.com" in blob:
        return "wellfound"
    if "builtin.com" in blob:
        return "builtin"
    if "startup.jobs" in blob:
        return "startup_jobs"
    return "unknown"


# ---------------------------------------------------------------- adapters


def adapt_linkedin(header: list[str], rows: list[list[str]], anchor: datetime, fname: str) -> list[WashedJob]:
    idx = {h: i for i, h in enumerate(header)}

    def get(row: list[str], col: str) -> str:
        i = idx.get(col)
        return _clean(row[i]) if i is not None and i < len(row) else ""

    jobs: list[WashedJob] = []
    for row in rows:
        title = get(row, "title")
        company = get(row, "companyName")
        if not title and not company:
            continue
        j = WashedJob(
            source="linkedin",
            source_file=fname,
            company=company,
            title=title,
            url=get(row, "url") or get(row, "applyUrl"),
            company_url=get(row, "companyUrl"),
            location_raw=get(row, "location"),
            salary_raw=get(row, "salary"),
            posted_raw=get(row, "postedTimeAgo"),
            employment_type=get(row, "contractType"),
            seniority=get(row, "experienceLevel"),
            description=get(row, "description")[:6000],
            industries=get(row, "sector"),
        )
        j.posted_at = parse_posted(get(row, "postedDate") or j.posted_raw, anchor)
        j.remote = classify_remote(j.location_raw, j.description[:300])
        jobs.append(j)
    return jobs


def adapt_builtin(header: list[str], rows: list[list[str]], anchor: datetime, fname: str) -> list[WashedJob]:
    jobs: list[WashedJob] = []
    seniority_values = re.compile(
        r"^(junior|mid level|senior level|entry level|senior|expert/leader|internship)$", re.I
    )
    for row in rows:
        cells = [_clean(c) for c in row]
        job_url = next((c for c in cells if _is_url(c) and "builtin.com/job/" in c), "")
        if not job_url:
            continue
        url_i = cells.index(job_url)
        title = cells[url_i - 1] if url_i >= 1 else ""
        company_url = next((c for c in cells if _is_url(c) and "builtin.com/company/" in c), "")
        logo = next((c for c in cells if _is_url(c) and ("cdn.builtin" in c or "static.builtin" in c)), "")
        company = cells[2] if len(cells) > 2 and not _is_url(cells[2]) else ""

        j = WashedJob(
            source="builtin",
            source_file=fname,
            company=company,
            title=title,
            url=job_url,
            company_url=company_url,
            logo_url=logo,
        )
        skills_mode = False
        for i, c in enumerate(cells):
            if not c or _is_url(c) or i <= 2 or c == title:
                continue
            if c == "Top Skills:":
                skills_mode = True
                continue
            if skills_mode:
                if len(c) < 48:
                    j.skills.append(c)
                continue
            low = c.lower()
            if POSTED_RE.match(c):
                j.posted_raw = c
            elif low in WORKPLACE_VALUES:
                j.remote = WORKPLACE_VALUES[low]
            elif SALARY_HINT_RE.search(c) and len(c) < 40 and "•" not in c:
                j.salary_raw = c
            elif seniority_values.match(c):
                j.seniority = c
            elif "•" in c:
                j.industries = c
            elif len(c) > 90:
                j.description = c[:2000]
            elif not j.location_raw and len(c) < 60:
                j.location_raw = c
        j.posted_at = parse_posted(j.posted_raw, anchor)
        jobs.append(j)
    return jobs


def adapt_wellfound(header: list[str], rows: list[list[str]], anchor: datetime, fname: str) -> list[WashedJob]:
    jobs: list[WashedJob] = []
    for row in rows:
        cells = [_clean(c) for c in row]
        if not cells or not any(cells):
            continue
        company_url = cells[0] if cells and "wellfound.com/company/" in cells[0] else ""
        logo = cells[1] if len(cells) > 1 and _is_url(cells[1]) else ""
        company = cells[2] if len(cells) > 2 else ""
        pitch = ""
        if len(cells) > 4:
            pitch = cells[4] if cells[3].lower() == "actively hiring" else cells[3]
        size = next((c for c in cells if EMPLOYEES_RE.search(c) and len(c) < 40), "")
        stage_cell = next(
            (c for c in cells if STAGE_RE.search(c) and len(c) < 30 and "usually responds" not in c.lower()),
            "",
        )

        # find job slots: any wellfound.com/jobs/ URL; title is the cell just before
        job_indexes = [i for i, c in enumerate(cells) if "wellfound.com/jobs/" in c]
        for slot, ji in enumerate(job_indexes):
            title = cells[ji - 1] if ji >= 1 else ""
            if not title or _is_url(title):
                continue
            end = job_indexes[slot + 1] - 1 if slot + 1 < len(job_indexes) else len(cells)
            j = WashedJob(
                source="wellfound",
                source_file=fname,
                company=company,
                title=title,
                url=cells[ji],
                company_url=company_url,
                logo_url=logo,
                description=pitch[:500],
                company_size=size,
                company_stage=stage_cell,
            )
            for c in cells[ji + 1 : end]:
                if not c or c in ("Save", "Apply") or _is_url(c):
                    continue
                if EMPLOYMENT_RE.match(c):
                    j.employment_type = c
                elif POSTED_RE.match(c):
                    j.posted_raw = c
                elif EXP_RE.match(c):
                    j.seniority = c
                elif SALARY_HINT_RE.search(c) and len(c) < 60:
                    if not j.salary_raw:
                        j.salary_raw = c
                elif len(c) < 80 and not j.location_raw:
                    j.location_raw = c
            j.remote = classify_remote(j.location_raw)
            j.posted_at = parse_posted(j.posted_raw, anchor)
            jobs.append(j)
    return jobs


def adapt_startup_jobs(header: list[str], rows: list[list[str]], anchor: datetime, fname: str) -> list[WashedJob]:
    jobs: list[WashedJob] = []
    for row in rows:
        cells = [_clean(c) for c in row]
        # real job URLs end with a numeric posting id: .../founding-sales-leader-acme-8752827
        job_url = next(
            (
                c
                for c in cells
                if _is_url(c)
                and "startup.jobs/" in c
                and "/company/" not in c
                and re.search(r"-\d{4,}/?$", urlparse(c).path)
            ),
            "",
        )
        if not job_url:
            continue
        company_url = next((c for c in cells if "startup.jobs/company/" in c), "")
        logo = next((c for c in cells if "startup.jobs/logos/" in c), "")

        company_slug = ""
        if company_url:
            company_slug = urlparse(company_url).path.rsplit("/", 1)[-1]
        base_slug = re.sub(r"-\d+$", "", company_slug)

        # rebuild title from job slug: founding-sales-leader-cgs-immersive-8752827
        job_slug = urlparse(job_url).path.strip("/").rsplit("/", 1)[-1]
        job_slug = re.sub(r"-\d+$", "", job_slug)
        title_slug = job_slug
        if base_slug and job_slug.endswith(base_slug):
            title_slug = job_slug[: -len(base_slug)].rstrip("-")
        title = slug_to_title(title_slug)

        # company display name: non-url cell matching slug letters, else title-cased slug
        company = ""
        base_letters = re.sub(r"[^a-z0-9]", "", base_slug.lower())
        for c in cells:
            if not c or _is_url(c) or POSTED_RE.match(c):
                continue
            if re.sub(r"[^a-z0-9]", "", c.lower()) == base_letters:
                company = c
                break
        if not company and base_slug:
            company = slug_to_title(base_slug)

        posted = next((c for c in cells if POSTED_RE.match(c)), "")
        location = ""
        loc_href_i = next((i for i, c in enumerate(cells) if "startup.jobs/locations/" in c), None)
        if loc_href_i is not None and loc_href_i >= 1 and not _is_url(cells[loc_href_i - 1]):
            location = cells[loc_href_i - 1]

        j = WashedJob(
            source="startup_jobs",
            source_file=fname,
            company=company,
            title=title,
            url=job_url,
            company_url=company_url,
            logo_url=logo,
            location_raw=location,
            posted_raw=posted,
        )
        j.quality_flags.append("title_from_slug")
        j.posted_at = parse_posted(posted, anchor)
        j.remote = classify_remote(location)
        jobs.append(j)
    return jobs


def _classify_badges(j: WashedJob, badges: list[str]) -> None:
    extra: list[str] = []
    for c in badges:
        if not c:
            continue
        if re.match(r"^posted\b", c, re.I) or POSTED_RE.match(c):
            j.posted_raw = j.posted_raw or c
        elif re.search(r"salary range|similar jobs pay", c, re.I) or (
            SALARY_HINT_RE.search(c) and re.search(r"\d", c) and len(c) < 70
        ):
            if not j.salary_raw:
                j.salary_raw = c
        elif re.search(r"employees", c, re.I):
            j.company_stage = j.company_stage or c
        elif re.search(r"always confirm|based on jobs posted|actual compensation", c, re.I):
            continue
        elif re.search(r"remote|hybrid|on-?site|,|\b(usa|united states|canada|uk)\b", c, re.I) and len(c) < 120:
            if not j.location_raw:
                j.location_raw = c
            else:
                extra.append(c)
        else:
            extra.append(c)
    if extra and not j.industries:
        j.industries = " • ".join(x for x in extra if len(x) < 40)[:200]


def adapt_a16z(header: list[str], rows: list[list[str]], anchor: datetime, fname: str) -> list[WashedJob]:
    idx = {h: i for i, h in enumerate(header)}
    skill_cols = [i for h, i in idx.items() if h.startswith("job-list-job-skill")]
    badge_cols = [i for h, i in idx.items() if h.startswith("job-list-badge") or h.startswith("job-salary-tooltip")]

    def get(row: list[str], col: str) -> str:
        i = idx.get(col)
        return _clean(row[i]) if i is not None and i < len(row) else ""

    jobs: list[WashedJob] = []
    for row in rows:
        title = get(row, "job-list-job-title")
        url = get(row, "job-list-job-title href")
        if not title or not url:
            continue
        j = WashedJob(
            source="a16z",
            source_file=fname,
            company=get(row, "job-list-job-company-link"),
            title=title,
            url=url,
            company_url=get(row, "job-list-job-company-link href"),
        )
        badges = [_clean(row[i]) for i in badge_cols if i < len(row)]
        _classify_badges(j, badges)
        j.skills = [_clean(row[i]) for i in skill_cols if i < len(row) and _clean(row[i])]
        j.posted_at = parse_posted(j.posted_raw, anchor)
        j.remote = classify_remote(j.location_raw)
        jobs.append(j)
    return jobs


def adapt_sequoia(header: list[str], rows: list[list[str]], anchor: datetime, fname: str) -> list[WashedJob]:
    idx = {h: i for i, h in enumerate(header)}
    skill_cols = [i for h, i in idx.items() if h.startswith("job-list-job-skill")]
    badge_cols = [i for h, i in idx.items() if h.startswith("job-list-badge")]
    tag_cols = [i for h, i in idx.items() if h.startswith("job-boards-company-tag")]

    def get(row: list[str], col: str) -> str:
        i = idx.get(col)
        return _clean(row[i]) if i is not None and i < len(row) else ""

    jobs: list[WashedJob] = []
    pending: list[WashedJob] = []
    context_tags: list[str] = []
    context_desc = ""

    def flush_company(name: str) -> None:
        nonlocal pending
        for j in pending:
            if name and not j.company:
                j.company = name
        jobs.extend(pending)
        pending = []

    for row in rows:
        cells = [_clean(c) for c in row]
        tags = [cells[i] for i in tag_cols if i < len(cells) and cells[i]]
        desc = get(row, "grouped-job-company-description")
        title = get(row, "job-list-job-title")
        url = get(row, "job-list-job-title href")
        all_jobs_cell = next((c for c in cells if ALL_JOBS_AT_RE.match(c)), "")

        if tags:
            # new company block begins
            context_tags = tags
            context_desc = ""
        if desc:
            context_desc = desc
        if title and url:
            j = WashedJob(
                source="sequoia",
                source_file=fname,
                title=title,
                url=url,
                description=context_desc[:500],
            )
            stage = next((t for t in context_tags if re.search(r"employees|seed|series|growth", t, re.I)), "")
            j.company_stage = stage
            inds = [t for t in context_tags if t != stage]
            j.industries = " • ".join(inds)[:200]
            _classify_badges(j, [cells[i] for i in badge_cols if i < len(cells)])
            j.skills = [cells[i] for i in skill_cols if i < len(cells) and cells[i]]
            # company fallback from ATS URL slug (ashby/greenhouse/lever)
            m = re.search(r"(?:jobs\.ashbyhq\.com|boards\.greenhouse\.io|job-boards\.greenhouse\.io|jobs\.lever\.co)/([^/?#]+)", url)
            if m:
                j.company = slug_to_title(m.group(1))
            j.posted_at = parse_posted(j.posted_raw, anchor)
            j.remote = classify_remote(j.location_raw)
            pending.append(j)
        if all_jobs_cell:
            m = ALL_JOBS_AT_RE.match(all_jobs_cell)
            flush_company(m.group(1) if m else "")
            context_tags = []
            context_desc = ""

    flush_company("")
    return jobs


ADAPTERS = {
    "linkedin": adapt_linkedin,
    "builtin": adapt_builtin,
    "wellfound": adapt_wellfound,
    "startup_jobs": adapt_startup_jobs,
    "a16z": adapt_a16z,
    "sequoia": adapt_sequoia,
}

# ---------------------------------------------------------------- pipeline


def finalize(job: WashedJob) -> WashedJob:
    job.company = _clean(job.company)
    job.title = _clean(job.title)
    job.url = _clean(job.url)
    lo, hi, cur, period, equity = parse_salary(job.salary_raw)
    job.salary_min, job.salary_max = lo, hi
    job.salary_currency = cur
    job.salary_period = period
    job.equity_raw = job.equity_raw or equity
    job.relevance = classify_relevance(job.title, job.description)
    if not job.url:
        job.quality_flags.append("missing_url")
    if not job.company:
        job.quality_flags.append("missing_company")
    if not job.title:
        job.quality_flags.append("missing_title")
    if not job.posted_at:
        job.quality_flags.append("no_posted")
    job.id = make_id(job)
    return job


def dedup(jobs: list[WashedJob]) -> tuple[list[WashedJob], int]:
    def richness(j: WashedJob) -> int:
        return sum(1 for v in j.to_dict().values() if v)

    by_key: dict[str, WashedJob] = {}
    dupes = 0
    for j in jobs:
        url_key = normalize_url(j.url)
        fuzzy_key = f"{re.sub(r'[^a-z0-9]', '', j.company.lower())}|{re.sub(r'[^a-z0-9]', '', j.title.lower())}"
        key = url_key or fuzzy_key
        existing = by_key.get(key) or (by_key.get(fuzzy_key) if j.company and j.title else None)
        if existing:
            dupes += 1
            if richness(j) > richness(existing):
                j.quality_flags = sorted(set(j.quality_flags + ["superseded_duplicate"]))
                by_key[key] = j
                if j.company and j.title:
                    by_key[fuzzy_key] = j
            continue
        by_key[key] = j
        if j.company and j.title:
            by_key.setdefault(fuzzy_key, j)
    seen_ids: set[str] = set()
    out: list[WashedJob] = []
    for j in by_key.values():
        if j.id in seen_ids:
            continue
        seen_ids.add(j.id)
        out.append(j)
    return out, dupes


def dedup_companies(jobs: list[WashedJob]) -> list[WashedCompany]:
    """
    Collapse washed jobs into unique companies.
    Primary key: company profile / ATS board URL slug.
    Fallback: normalized company name (legal suffixes stripped).
    Prefer the record that already has a link; never invent URLs.
    Name-only clusters merge into a URL cluster when the same name later
    appears with a company_url.
    """
    by_key: dict[str, WashedCompany] = {}
    name_owner: dict[str, str] = {}  # name_key → canonical key in by_key

    def bump(c: WashedCompany, j: WashedJob) -> None:
        c.job_count += 1
        if j.source and j.source not in c.sources:
            c.sources.append(j.source)
        if j.relevance and j.relevance not in c.role_tags:
            c.role_tags.append(j.relevance)
        if j.company_url and not c.url:
            c.url = _clean(j.company_url)
        if j.company and len(j.company) > len(c.name):
            c.name = j.company

    for j in jobs:
        if not j.company:
            continue
        strong, name_key = company_identity(j)
        if not strong and not name_key:
            continue

        if strong:
            key = strong
            # Absorb a prior name-only cluster with the same name
            if name_key and name_key in name_owner:
                prior = name_owner[name_key]
                if prior != key and prior in by_key and prior == name_key:
                    prior_c = by_key.pop(prior)
                    if key not in by_key:
                        prior_c.id = make_company_id(strong, name_key)
                        by_key[key] = prior_c
                    else:
                        by_key[key].job_count += prior_c.job_count
                        for s in prior_c.sources:
                            if s not in by_key[key].sources:
                                by_key[key].sources.append(s)
                        for tag in prior_c.role_tags:
                            if tag not in by_key[key].role_tags:
                                by_key[key].role_tags.append(tag)
                        if prior_c.url and not by_key[key].url:
                            by_key[key].url = prior_c.url
                        if len(prior_c.name) > len(by_key[key].name):
                            by_key[key].name = prior_c.name
            if key not in by_key:
                by_key[key] = WashedCompany(
                    id=make_company_id(strong, name_key),
                    name=j.company,
                    url=_clean(j.company_url),
                )
            bump(by_key[key], j)
            if name_key:
                name_owner[name_key] = key
            continue

        # Name-only
        key = name_owner.get(name_key, name_key)
        if key not in by_key:
            by_key[key] = WashedCompany(
                id=make_company_id("", name_key),
                name=j.company,
                url="",
            )
            name_owner[name_key] = key
        bump(by_key[key], j)

    companies = list(by_key.values())
    companies.sort(key=lambda c: (-c.job_count, c.name.lower()))
    return companies


def wash_directory(in_dir: Path, out_dir: Path, publish: Path | None = None) -> dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)
    all_jobs: list[WashedJob] = []
    report_sources: dict[str, dict[str, Any]] = {}
    skipped_files: list[str] = []

    for path in sorted(in_dir.glob("*.csv")):
        header, rows = read_csv_rows(path)
        source = detect_source(header, rows)
        if source == "unknown":
            skipped_files.append(path.name)
            log.warning("skip %s — unknown source", path.name)
            continue
        anchor = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
        adapter = ADAPTERS[source]
        jobs = [finalize(j) for j in adapter(header, rows, anchor, path.name)]
        for j in jobs:
            j.scraped_at = anchor.date().isoformat()
        all_jobs.extend(jobs)
        bucket = report_sources.setdefault(
            source, {"files": 0, "raw_rows": 0, "jobs": 0}
        )
        bucket["files"] += 1
        bucket["raw_rows"] += len(rows)
        bucket["jobs"] += len(jobs)
        log.info("%s → %s: %d rows → %d jobs", path.name, source, len(rows), len(jobs))

    washed, dupes = dedup(all_jobs)
    washed.sort(key=lambda j: (j.posted_at or "0000"), reverse=True)
    companies = dedup_companies(washed)

    relevance_hist: dict[str, int] = {}
    missing = {"url": 0, "company": 0, "title": 0, "posted": 0}
    for j in washed:
        relevance_hist[j.relevance] = relevance_hist.get(j.relevance, 0) + 1
        if "missing_url" in j.quality_flags:
            missing["url"] += 1
        if "missing_company" in j.quality_flags:
            missing["company"] += 1
        if "missing_title" in j.quality_flags:
            missing["title"] += 1
        if "no_posted" in j.quality_flags:
            missing["posted"] += 1

    jobs_path = out_dir / "jobs.jsonl"
    with jobs_path.open("w", encoding="utf-8") as fh:
        for j in washed:
            fh.write(json.dumps(j.to_dict(), ensure_ascii=False) + "\n")

    companies_path = out_dir / "companies.jsonl"
    with companies_path.open("w", encoding="utf-8") as fh:
        for c in companies:
            fh.write(json.dumps(c.to_dict(), ensure_ascii=False) + "\n")

    with_link = sum(1 for c in companies if c.url)
    report = {
        "washed_at": datetime.now(tz=timezone.utc).isoformat(),
        "input_dir": str(in_dir),
        "sources": report_sources,
        "skipped_files": skipped_files,
        "total_raw_jobs": len(all_jobs),
        "duplicates_removed": dupes,
        "total_washed": len(washed),
        "total_companies": len(companies),
        "companies_with_url": with_link,
        "relevance": relevance_hist,
        "missing": missing,
        "output": str(jobs_path.resolve()),
        "companies_output": str(companies_path.resolve()),
    }
    report_path = out_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

    if publish:
        publish.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "washedAt": report["washed_at"],
            "total": len(washed),
            "relevance": relevance_hist,
            "jobs": [j.to_dict() for j in washed],
        }
        publish.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        report["published"] = str(publish.resolve())

        companies_publish = publish.parent / "washed-companies.json"
        companies_payload = {
            "washedAt": report["washed_at"],
            "total": len(companies),
            "withUrl": with_link,
            "companies": [c.to_dict() for c in companies],
        }
        companies_publish.write_text(
            json.dumps(companies_payload, ensure_ascii=False), encoding="utf-8"
        )
        report["companies_published"] = str(companies_publish.resolve())

    return report
