"""Tier 1+ source fetchers. Tier 2/3 land here later (JobSpy, HN, RemoteOK, …)."""

from tally_scanner.sources.ats import FETCHERS, fetch_ashby, fetch_greenhouse, fetch_lever, poll_all_slugs
from tally_scanner.sources.discovery import discover_slugs
from tally_scanner.sources.html_utils import html_to_text

__all__ = [
    "FETCHERS",
    "fetch_ashby",
    "fetch_greenhouse",
    "fetch_lever",
    "poll_all_slugs",
    "discover_slugs",
    "html_to_text",
]
