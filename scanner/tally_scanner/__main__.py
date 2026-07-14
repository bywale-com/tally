"""CLI: python -m tally_scanner run|filter-test"""

from __future__ import annotations

import argparse
import json
import logging
import sys

from tally_scanner.ai_filter import filter_batch
from tally_scanner.filter import filter_posting
from tally_scanner.models import RawPosting
from tally_scanner.pipeline import run_daily

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

    args = parser.parse_args(argv)

    if args.cmd == "run":
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

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
