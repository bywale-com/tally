"""Top-up intake (no truncate) then continue calibration to 5 Lane A."""

from __future__ import annotations

import logging

from tally_scanner.pipeline import run_daily

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s: %(message)s")

if __name__ == "__main__":
    stats = run_daily(discover=True, score=False, write_notion=False, limit=250, fresh=False)
    print(stats.get("stats") if isinstance(stats, dict) else stats)
