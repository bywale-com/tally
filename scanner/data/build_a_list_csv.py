"""Build cleaned 20-row A-list CSV for the operator."""

from __future__ import annotations

import csv
from collections import OrderedDict
from pathlib import Path

ROOT = Path(r"c:\Users\Admin\Documents\Wale Omotayo\Apps\tally")
SCANNER_DATA = ROOT / "scanner" / "data"

paths = [
    SCANNER_DATA / "deep_screen_full.csv",
    SCANNER_DATA / "deep_screen_a_list.csv",
]

rows: list[dict] = []
seen_files: set[Path] = set()
fields: list[str] | None = None
for p in paths:
    if not p.exists():
        continue
    resolved = p.resolve()
    if resolved in seen_files:
        continue
    seen_files.add(resolved)
    with p.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if fields is None:
            fields = list(reader.fieldnames or [])
        rows.extend(list(reader))

alist = [r for r in rows if str(r.get("a_list", "")).lower() in {"true", "1"}]


def is_noise(r: dict) -> bool:
    blob = " ".join(
        [r.get("company") or "", r.get("role_title") or "", r.get("posting_url") or ""]
    ).lower()
    return any(x in blob for x in ("toast", "toasttab", "figma", "doitintl", "nebius"))


def dedupe(seq: list[dict]) -> list[dict]:
    out: OrderedDict[str, dict] = OrderedDict()
    for r in seq:
        k = (r.get("role_title") or "").strip().lower()
        k2 = (r.get("company") or "")[:60].strip().lower()
        key = k or k2
        if key and key not in out:
            out[key] = r
    return list(out.values())


clean_u = dedupe([r for r in alist if not is_noise(r)])
noise_u = dedupe([r for r in alist if is_noise(r)])
combined = list(clean_u)
if len(combined) < 20:
    for r in noise_u:
        if len(combined) >= 20:
            break
        combined.append(r)
if len(combined) < 20:
    for r in dedupe(alist):
        key = (r.get("role_title") or "").strip().lower()
        if key in {(x.get("role_title") or "").strip().lower() for x in combined}:
            continue
        combined.append(r)
        if len(combined) >= 20:
            break

final = combined[:20]
assert fields

out_paths = [
    SCANNER_DATA / "tally_a_list_20.csv",
    ROOT / "tally_a_list_20.csv",
]
for out in out_paths:
    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(final)

print(f"wrote {len(final)} rows")
print(f"clean_unique={len(clean_u)} padded_with_noise={max(0, len(final) - len(clean_u))}")
for i, r in enumerate(final, 1):
    company = (r.get("company") or "")[:70]
    title = (r.get("role_title") or "")[:50]
    print(f"{i}. {company} | {title} | {r.get('verdict')}")
print("PATH:", out_paths[1])
