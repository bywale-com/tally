"""CLI: python -m tally_scanner run|filter-test|deep-screen|indeed-search"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="tally_scanner", description="Tally Scanner pipeline")
    sub = parser.add_subparsers(dest="cmd", required=True)

    run_p = sub.add_parser(
        "run",
        help="Search job boards for founding/confession hits → AI triage → Postgres",
    )
    run_p.add_argument(
        "--no-discover",
        action="store_true",
        help="Skip SearXNG/HN search (only keyword-gate known slugs)",
    )
    run_p.add_argument("--no-score", action="store_true", help="Skip ACV/lane scorer")
    run_p.add_argument("--no-notion", action="store_true", default=True, help="Skip Notion (default)")
    run_p.add_argument("--notion", action="store_true", help="Also write Notion (legacy)")
    run_p.add_argument("--limit", type=int, default=None, help="Cap candidates before AI triage")
    run_p.add_argument("--fresh", action="store_true", help="TRUNCATE postings before run")
    run_p.add_argument(
        "--no-slug-boards",
        action="store_true",
        help="Do not keyword-gate company_slugs boards",
    )

    ft = sub.add_parser("filter-test", help="Test AI filter (default) or --regex")
    ft.add_argument("--title", default="")
    ft.add_argument("--text", default="")
    ft.add_argument("--regex", action="store_true")
    ft.add_argument("--company", default="testco")

    ds = sub.add_parser("deep-screen", help="Deep Screener v2 on filter-IN postings → CSV")
    ds.add_argument("--limit", type=int, default=20, help="How many INs to deep-screen")
    ds.add_argument(
        "--csv",
        type=str,
        default="data/deep_screen_a_list.csv",
        help="Output CSV path",
    )
    ds.add_argument(
        "--a-list-only",
        action="store_true",
        help="Keep going until --limit A-list survivors (needs enough DB INs)",
    )
    ds.add_argument("--filter-status", default="in", help="Which filter_status to screen")

    ind = sub.add_parser(
        "indeed-search",
        help="Search Indeed (Firecrawl live, or fixture offline) → JSON postings",
    )
    ind.add_argument(
        "--url",
        type=str,
        default=None,
        help="Indeed search URL (parses q, l, radius, country from host)",
    )
    ind.add_argument("--query", "-q", type=str, default=None, help="Search query")
    ind.add_argument("--location", "-l", type=str, default="Montréal, QC")
    ind.add_argument("--country", default="Canada")
    ind.add_argument("--radius", type=int, default=25)
    ind.add_argument("--limit", type=int, default=15)
    ind.add_argument(
        "--match-mode",
        choices=("broad", "phrase"),
        default="broad",
        help="broad strips decorative quotes; phrase wraps in double quotes",
    )
    ind.add_argument(
        "--no-fixture",
        action="store_true",
        help="Do not fall back to bundled fixture when live fetch fails",
    )

    wash_p = sub.add_parser(
        "wash",
        help="Clean manual scrape CSVs (IDS/Apify) → canonical jobs.jsonl + report",
    )
    wash_p.add_argument("--in", dest="in_dir", default="manual_scrapes_raw", help="Input CSV folder")
    wash_p.add_argument("--out", dest="out_dir", default="data/washed", help="Output folder")
    wash_p.add_argument(
        "--publish",
        default=None,
        help="Also write a single JSON payload here (e.g. the app's public/washed-jobs.json)",
    )

    args = parser.parse_args(argv)

    if args.cmd == "run":
        from tally_scanner.pipeline import run_daily

        result = run_daily(
            discover=not args.no_discover,
            score=not args.no_score,
            write_notion=bool(args.notion),
            limit=args.limit,
            fresh=args.fresh,
            include_slug_boards=not args.no_slug_boards,
        )
        print(json.dumps(result, indent=2, default=str))
        return 0

    if args.cmd == "filter-test":
        from tally_scanner.ai_filter import filter_batch
        from tally_scanner.filter import filter_posting
        from tally_scanner.models import RawPosting

        text = args.text
        if not text and not sys.stdin.isatty():
            text = sys.stdin.read()
        if args.regex:
            result = filter_posting(args.title, text)
            print(json.dumps(result.__dict__, indent=2))
            return 0
        posting = RawPosting(
            company=args.company,
            title=args.title or "Untitled",
            source="cli",
            url=None,
            raw_text=text,
        )
        decisions = filter_batch([posting])
        print(json.dumps(decisions[0].as_json(), indent=2))
        return 0

    if args.cmd == "deep-screen":
        from tally_scanner import db
        from tally_scanner.deep_screener import deep_screen_one, write_csv_from_results

        with db.connect() as conn:
            rows = conn.execute(
                """
                SELECT id, company, title, url, raw_text, confession_quote
                FROM postings
                WHERE filter_status = %s
                ORDER BY id
                """,
                (args.filter_status,),
            ).fetchall()

        results = []
        a_list_count = 0
        target = args.limit
        for row in rows:
            if not args.a_list_only and len(results) >= target:
                break
            if args.a_list_only and a_list_count >= target:
                break
            logging.info("Deep screening #%s %s — %s", row["id"], row["company"], row["title"])
            result = deep_screen_one(
                company=row["company"],
                title=row["title"],
                raw_text=row["raw_text"] or "",
                url=row.get("url"),
            )
            result["posting_id"] = row["id"]
            results.append(result)
            if result.get("a_list"):
                a_list_count += 1
            logging.info(
                "→ verdict=%s lane=%s a_list=%s killed_at=%s",
                result.get("verdict"),
                result.get("lane"),
                result.get("a_list"),
                result.get("killed_at"),
            )

        out = Path(args.csv)
        write_csv_from_results(results, out)
        summary = {
            "screened": len(results),
            "a_list": sum(1 for r in results if r.get("a_list")),
            "csv": str(out.resolve()),
            "verdicts": {r.get("company"): r.get("verdict") for r in results},
        }
        print(json.dumps(summary, indent=2, default=str))
        return 0

    if args.cmd == "indeed-search":
        from tally_scanner.sources.indeed import (
            IndeedSearchCriteria,
            search_from_url,
            search_indeed,
        )

        if args.url:
            result = search_from_url(
                args.url,
                results_wanted=args.limit,
                allow_fixture=not args.no_fixture,
            )
        else:
            if not args.query:
                parser.error("indeed-search requires --url or --query")
            criteria = IndeedSearchCriteria(
                query=args.query,
                location=args.location,
                country=args.country,
                radius=args.radius,
                results_wanted=args.limit,
                match_mode=args.match_mode,
            )
            result = search_indeed(criteria, allow_fixture=not args.no_fixture)
        print(json.dumps(result.to_dict(), indent=2, default=str))
        return 0 if not result.blocked else 2

    if args.cmd == "wash":
        from tally_scanner.wash import wash_directory

        report = wash_directory(
            Path(args.in_dir),
            Path(args.out_dir),
            Path(args.publish) if args.publish else None,
        )
        print(json.dumps(report, indent=2, ensure_ascii=False))
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
