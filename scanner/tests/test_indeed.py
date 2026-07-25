"""Unit tests for Indeed URL parse + query normalize + markdown parser (no network)."""

from __future__ import annotations

from tally_scanner.sources.indeed import (
    build_search_url,
    normalize_query,
    parse_indeed_url,
    parse_jobs_from_markdown,
    search_from_url,
)


def test_parse_montreal_search_url():
    url = (
        "https://ca.indeed.com/jobs?q=founding+business+development"
        "&l=Montr%C3%A9al%2C+QC&from=searchOnHP&vjk=44457718ca5eda85"
    )
    c = parse_indeed_url(url)
    assert c is not None
    assert c.query == "founding business development"
    assert "Montréal" in c.location or "Montr" in c.location
    assert c.country == "Canada"
    # noise dropped when rebuilding
    rebuilt = build_search_url(c)
    assert "vjk=" not in rebuilt
    assert "from=" not in rebuilt
    assert "q=founding" in rebuilt


def test_parse_radius_and_toronto():
    url = (
        "https://ca.indeed.com/jobs?q=founding+business+development"
        "&l=Toronto%2C+ON&radius=25&from=searchOnDesktopSerp&vjk=1ab7a8de34d4b8e6"
    )
    c = parse_indeed_url(url)
    assert c is not None
    assert c.location == "Toronto, ON"
    assert c.radius == 25


def test_normalize_query_quotes():
    assert normalize_query('"founding" business development', "broad") == "founding business development"
    assert normalize_query("'founding' business development", "broad") == "founding business development"
    assert normalize_query("founding business development", "phrase") == '"founding business development"'
    assert (
        normalize_query('"estimator" AND "Review project schedules"', "boolean")
        == '"estimator" AND "Review project schedules"'
    )


def test_build_url_fromage_salary():
    from tally_scanner.sources.indeed import IndeedSearchCriteria, build_search_url

    url = build_search_url(
        IndeedSearchCriteria(
            query="estimator",
            location="Toronto, ON",
            country="Canada",
            radius=25,
            fromage_days=1,
            salary_min=60000,
            match_mode="broad",
        )
    )
    assert "q=estimator" in url
    assert "fromage=1" in url
    assert "salaryType=" in url
    assert "60" in url


def test_parse_markdown_jobs():
    md = """
# founding business development jobs in Montréal, QC

### [Founding Sales Leader](https://ca.indeed.com/rc/clk?jk=9d9676272dc01698&bb=abc)
Easily apply
CGS Immersive
Montréal, QC
  - $85,000–$100,000 a year

  - Strong executive presence.

### [Account Executive](https://ca.indeed.com/rc/clk?jk=1a15a9b0c5006ca8&bb=xyz)
AppDirect
Montréal, QC
  - Close new business
"""
    jobs = parse_jobs_from_markdown(md)
    assert len(jobs) >= 2
    assert jobs[0]["title"] == "Founding Sales Leader"
    assert jobs[0]["company"] == "CGS Immersive"
    assert jobs[0]["jk"] == "9d9676272dc01698"
    assert "viewjob?jk=" in jobs[0]["url"]


def test_parse_markdown_jobs_br_table_cells():
    """Live Firecrawl often emits job cards as one table cell with <br> separators."""
    md = """
| ### [Manager, Business Development](https://ca.indeed.com/rc/clk?jk=41e89b24af223ad9&bb=abc)<br>Easily apply<br>MaintainX<br>Montréal, QC<br>  - Full-time |
  - Build individual development plans for each rep.
"""
    jobs = parse_jobs_from_markdown(md)
    assert len(jobs) == 1
    assert jobs[0]["title"] == "Manager, Business Development"
    assert jobs[0]["company"] == "MaintainX"
    assert jobs[0]["jk"] == "41e89b24af223ad9"


def test_fixture_search_offline():
    url = (
        "https://ca.indeed.com/jobs?q=founding+business+development"
        "&l=Montreal%2C+QC&radius=25"
    )
    result = search_from_url(url, results_wanted=5, allow_fixture=True)
    assert not result.blocked
    assert result.transport in ("fixture", "firecrawl")
    assert len(result.postings) >= 1
    assert result.postings[0].source == "indeed"
