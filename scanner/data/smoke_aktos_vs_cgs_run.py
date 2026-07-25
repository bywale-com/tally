"""Smoke-check calibrated deep screener: Aktos vs CGS ranking."""

from __future__ import annotations

import json
import sys

from tally_scanner import db
from tally_scanner.deep_screener import deep_screen_one, flat_row

TARGETS = [
    ("%aktos%", "Aktos"),
    ("%computergenerated%", "CGS"),
]


def main() -> int:
    results = []
    with db.connect() as conn:
        for like, label in TARGETS:
            row = conn.execute(
                """
                SELECT company, title, url, raw_text
                FROM postings
                WHERE url ILIKE %s OR company ILIKE %s
                ORDER BY id
                LIMIT 1
                """,
                (like, like),
            ).fetchone()
            if not row:
                print(f"MISSING {label}", file=sys.stderr)
                continue
            print(f"Screening {label}: {row['title'][:60]}…")
            r = deep_screen_one(
                company=row["company"],
                title=row["title"],
                raw_text=row["raw_text"] or "",
                url=row.get("url"),
            )
            r["_label"] = label
            results.append(r)

    summary = []
    for r in results:
        summary.append(
            {
                "label": r.get("_label"),
                "verdict": r.get("verdict"),
                "dialability_rank_hint": r.get("dialability_rank_hint"),
                "legibility_trap": r.get("legibility_trap"),
                "layer_4": (r.get("layer_4") or {}).get("status") if isinstance(r.get("layer_4"), dict) else r.get("layer_4"),
                "acv": (r.get("layer_3_acv") or {}).get("acv") if isinstance(r.get("layer_3_acv"), dict) else None,
                "economic_risk": (r.get("layer_3_acv") or {}).get("economic_risk") if isinstance(r.get("layer_3_acv"), dict) else None,
                "scenario": (r.get("layer_2") or {}).get("scenario") if isinstance(r.get("layer_2"), dict) else None,
                "opener": r.get("draft_opener") or "",
            "verdict_notes": r.get("verdict_notes"),
            }
        )

    print(json.dumps(summary, indent=2, ensure_ascii=False))

    by_label = {s["label"]: s for s in summary}
    aktos, cgs = by_label.get("Aktos"), by_label.get("CGS")
    if aktos and cgs:
        ok = True
        notes = []
        if (cgs.get("verdict") or "").lower() == "call-ready" and not cgs.get("legibility_trap"):
            ok = False
            notes.append("FAIL: CGS call-ready without legibility_trap — still over-trusting stated ACV")
        if (cgs.get("verdict") or "").lower() not in {"conditional", "fixable"}:
            if (cgs.get("verdict") or "").lower() == "call-ready":
                pass  # already handled above
            elif (cgs.get("verdict") or "").lower() == "dead":
                ok = False
                notes.append("FAIL: CGS dead — should survive as conditional")
        if (aktos.get("verdict") or "").lower() == "dead":
            ok = False
            notes.append("FAIL: Aktos dead — should survive")
        try:
            a_h = int(aktos.get("dialability_rank_hint") or 99)
            c_h = int(cgs.get("dialability_rank_hint") or 99)
            if a_h > c_h:
                notes.append(f"WARN: Aktos hint {a_h} worse than CGS {c_h}")
                if (cgs.get("verdict") or "").lower() == "call-ready":
                    ok = False
            if a_h == 0 or c_h == 0 or a_h > 5 or c_h > 5:
                ok = False
                notes.append("FAIL: dialability_rank_hint must be 1–5")
        except (TypeError, ValueError):
            ok = False
            notes.append("FAIL: dialability_rank_hint not int")
        opener = aktos.get("opener") or ""
        if "Aktos" in opener or "at aktos" in opener.lower():
            ok = False
            notes.append("FAIL: Aktos opener names product")
        if "?" not in opener:
            ok = False
            notes.append("FAIL: Aktos opener not a question")
        if not opener.lower().strip().startswith("do you"):
            notes.append("WARN: Aktos opener should start with standing-openness 'Do you…'")
        # Prefer Aktos as cleaner dial
        if a_h <= c_h and (aktos.get("verdict") or "").lower() in {"call-ready", "conditional"}:
            notes.append("OK: Aktos ranked dialable ≥ CGS")
        if cgs.get("legibility_trap") and (cgs.get("verdict") or "").lower() == "conditional":
            notes.append("OK: CGS conditional + legibility_trap")
        print("CALIBRATION_CHECK:", "PASS" if ok else "FAIL")
        for n in notes:
            print(n)
        return 0 if ok else 1
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
