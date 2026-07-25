"""Write exactly up to 20 A-list CSV rows (dedupe exact role titles only)."""

from __future__ import annotations

import csv
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

rows: list[dict] = []
with (DATA / "deep_screen_full.csv").open(encoding="utf-8") as f:
    rows.extend(csv.DictReader(f))
with (DATA / "deep_screen_a_list.csv").open(encoding="utf-8") as f:
    rows.extend(csv.DictReader(f))

alist = [r for r in rows if str(r.get("a_list", "")).lower() in {"true", "1"}]


def rank(r: dict) -> tuple:
    blob = f"{r.get('company','')} {r.get('role_title','')}".lower()
    s = 0
    if "founding" in blob:
        s += 4
    if "toast" in blob or "toasttab" in blob or "restaurant" in blob and "pos" in blob:
        s -= 8
    if "territory account" in blob or "retail account" in blob or "district manager" in blob:
        s -= 6
    if "sdr" in blob or "development generalist" in blob or "development rep" in blob:
        s -= 1
    if r.get("verdict") == "call-ready":
        s += 3
    return (-s, r.get("company") or "", r.get("role_title") or "")


picked: OrderedDict[str, dict] = OrderedDict()
for r in sorted(alist, key=rank):
    title = (r.get("role_title") or "").strip().lower()
    url = (r.get("posting_url") or "").strip().lower()
    key = title + "|" + url
    if not title or key in picked:
        continue
    picked[key] = r
    if len(picked) >= 20:
        break

final = list(picked.values())
fields = [k for k in alist[0].keys()]

dests = [
    DATA / "tally_a_list_20.csv",
    ROOT.parent / "tally_a_list_20.csv",
    Path.home() / "Documents" / "tally_a_list_20.csv",
]
for dest in dests:
    try:
        dest.parent.mkdir(parents=True, exist_ok=True)
        with dest.open("w", newline="", encoding="utf-8-sig") as f:
            w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
            w.writeheader()
            w.writerows(final)
    except OSError as e:
        print("skip", dest, e)

summary = DATA / "tally_a_list_20_summary.txt"
with summary.open("w", encoding="utf-8") as f:
    f.write(f"rows={len(final)}\n\n")
    for i, r in enumerate(final, 1):
        f.write(
            f"{i}. {r.get('company','')} | {r.get('role_title','')} | "
            f"{r.get('verdict')} | lane={r.get('lane')} | acv={r.get('acv')}\n"
        )

print(summary.read_text(encoding="utf-8"))
print("CSV:", dests[1])
