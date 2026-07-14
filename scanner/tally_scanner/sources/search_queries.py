"""
Search catalog for Tally Scanner — the real intake.

These strings are what we *search job boards with*, not a dump-all-jobs whitelist.
Role + confession phrases from the original Tally sourcing brief.
"""

from __future__ import annotations

# Exact / near-exact role phrases (each run as its own board/search query)
ROLE_QUERIES: list[str] = [
    "founding account executive",
    "founding AE",
    "first sales hire",
    "founding sales",
    "first account executive",
    "founding GTM",
    "go-to-market lead",
    "first BDR",
    "sales lead Series A",
    "head of sales early stage",
    "player-coach sales",
]

# High-signal confession phrases — strongest qualify signal on the scan
CONFESSION_QUERIES: list[str] = [
    "self-sourced",
    "no inbound",
    "no SDR",
    "build your own pipeline",
    "no leads provided",
    "from scratch",
    "100% new business",
    "greenfield",
    "first sales hire reporting to the CEO",
]

# Google/SearXNG dorks against structured ATS hosts
ATS_SITE_DORKS: list[str] = [
    'site:boards.greenhouse.io "founding account executive"',
    'site:boards.greenhouse.io "founding AE"',
    'site:boards.greenhouse.io "first sales hire"',
    'site:boards.greenhouse.io "founding sales"',
    'site:boards.greenhouse.io "self-sourced"',
    'site:boards.greenhouse.io "no SDR"',
    'site:job-boards.greenhouse.io "founding account executive"',
    'site:jobs.lever.co "founding account executive"',
    'site:jobs.lever.co "first sales hire"',
    'site:jobs.lever.co "founding AE"',
    'site:jobs.lever.co "self-sourced"',
    'site:jobs.ashbyhq.com "founding account executive"',
    'site:jobs.ashbyhq.com "first sales hire"',
    'site:jobs.ashbyhq.com "founding sales"',
    'site:jobs.ashbyhq.com "founding AE"',
    'site:jobs.ashbyhq.com "self-sourced"',
    'site:jobs.ashbyhq.com "no SDR"',
]


def all_search_phrases() -> list[str]:
    """Flat list for keyword gates / title matching (normalized later)."""
    return list(dict.fromkeys([*ROLE_QUERIES, *CONFESSION_QUERIES]))
