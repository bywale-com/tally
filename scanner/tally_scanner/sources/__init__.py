"""Tier 1+ source fetchers. Tier 2: Indeed (search-first via Firecrawl)."""

from tally_scanner.sources.ats import FETCHERS, fetch_ashby, fetch_greenhouse, fetch_lever, poll_all_slugs
from tally_scanner.sources.discovery import discover_slugs
from tally_scanner.sources.html_utils import html_to_text
from tally_scanner.sources.indeed import (
    IndeedSearchCriteria,
    parse_indeed_url,
    search_from_url,
    search_indeed,
)

__all__ = [
    "FETCHERS",
    "fetch_ashby",
    "fetch_greenhouse",
    "fetch_lever",
    "poll_all_slugs",
    "discover_slugs",
    "html_to_text",
    "IndeedSearchCriteria",
    "parse_indeed_url",
    "search_from_url",
    "search_indeed",
]
