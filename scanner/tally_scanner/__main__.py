"""CLI: python -m tally_scanner run|filter-test|poll"""

from __future__ import annotations

import argparse
import json
import logging
import sys

from tally_scanner.filter import filter_posting
from tally_scanner.pipeline import run_daily

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="tally_scanner", description="Tally Scanner pipeline")
    sub = parser.add_subparsers(dest="cmd", required=True)

    run_p = sub.add_parser("run", help="Execute the daily pipeline")
    run_p.add_argument("--no-discover", action="store_true")
    run_p.add_argument("--no-score", action="store_true", help="Ingest only; skip LLM")
    run_p.add_argument("--no-notion", action="store_true")

    ft = sub.add_parser("filter-test", help="Test regex filter on stdin or --text")
    ft.add_argument("--title", default="")
    ft.add_argument("--text", default="")

    args = parser.parse_args(argv)

    if args.cmd == "run":
        result = run_daily(
            discover=not args.no_discover,
            score=not args.no_score,
            write_notion=not args.no_notion,
        )
        print(json.dumps(result, indent=2, default=str))
        return 0

    if args.cmd == "filter-test":
        text = args.text
        if not text and not sys.stdin.isatty():
            text = sys.stdin.read()
        result = filter_posting(args.title, text)
        print(json.dumps(result.__dict__, indent=2))
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
