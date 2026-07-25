"""Triage remaining companies without rich postings (composer heuristics)."""
from __future__ import annotations

import json
import re
from pathlib import Path

OUT = Path(__file__).resolve().parent
PACK = json.loads((OUT / "founding_sales_pack.json").read_text(encoding="utf-8"))
JSONL = OUT / "founding_sales_analyses.jsonl"

RECRUITER_NAME = re.compile(
    r"recruit|staffing|search|talent|hire\s|human capital|headhunt|personnel|"
    r"jobs?\s*in|careers?\s*agency|executive\s*search|dialedin|elsdon|mitchell\s*martin|"
    r"prestige|prevail|impax|hiredna|gold\s*&\s*aron|hartley|ladders|boost\s*talent|"
    r"expert\s*executive|usa\s*tech\s*recruit|waterstone|jack\s*&\s*jill|meet\s*life|"
    r"crossing\s*hurdles|roc\s*search|salesedge|stelvio|talently|talentpluto",
    re.I,
)
MEGA = re.compile(
    r"^(apollo\.io|deel|google|microsoft|amazon|salesforce|oracle|ibm|meta|stripe)$",
    re.I,
)

done = set()
for line in JSONL.read_text(encoding="utf-8").splitlines():
    if line.strip():
        done.add(json.loads(line)["company_id"])

added = 0
with JSONL.open("a", encoding="utf-8") as f:
    for p in PACK:
        if p["company_id"] in done:
            continue
        name = p["company_name"]
        title = (p.get("role_title") or "").lower()
        desc = (p.get("description") or "").lower()
        blob = f"{name} {title} {desc[:500]}"

        row = {
            "company_id": p["company_id"],
            "company_name": name,
            "founded_or_started": "UNKNOWN",
            "company_size": p.get("company_size") or "UNKNOWN",
            "company_stage": p.get("company_stage") or "",
            "layer_0": "",
            "layer_0_reason": "",
            "layer_1a": "",
            "layer_1a_reason": "",
            "layer_1b": "",
            "layer_1b_reason": "",
            "layer_2": "skipped",
            "scenario": "",
            "layer_3_acv": "skipped",
            "economic_risk": "",
            "layer_4": "skipped",
            "commoditization_risk": "none",
            "verdict": "",
            "lane": "",
            "kill_layer": "",
            "one_fact_to_verify": "",
            "opener": "",
            "verdict_notes": "",
            "dialability_rank_hint": "",
            "legibility_trap": "false",
            "analyzed_by": "composer",
            "analyzed_at": "2026-07-17",
        }

        if RECRUITER_NAME.search(name) or "our client" in desc or "we're partnering" in desc:
            row.update(
                layer_0="KILL",
                layer_0_reason="Likely recruiter/agency-intermediated or unnamed-client listing (thin source).",
                layer_1a="skipped",
                layer_1a_reason="",
                layer_1b="skipped",
                layer_1b_reason="",
                verdict="dead",
                kill_layer="0",
                verdict_notes="Thin posting; recruiter/opaque employer heuristic.",
            )
        elif MEGA.search(name.strip()):
            row.update(
                layer_0="pass",
                layer_0_reason="Known large platform.",
                layer_1a="pass",
                layer_1a_reason="Operational buyers possible.",
                layer_1b="KILL",
                layer_1b_reason="Mature sales machine at mega-scale.",
                verdict="dead",
                kill_layer="1b",
                verdict_notes="Thin posting; mega-corp motion kill.",
            )
        elif any(
            x in title
            for x in (
                "customer success",
                " account manager",
                "solutions architect",
                "marketing",
                "scientist",
                "engineer",
                "operations associate",
                "communications",
            )
        ) and "account executive" not in title and " founding ae" not in f" {title}":
            row.update(
                layer_0="pass",
                layer_0_reason="Insufficient product detail (thin posting).",
                layer_1a="skipped",
                layer_1a_reason="",
                layer_1b="KILL",
                layer_1b_reason=f"Role title suggests non-create seat: {p.get('role_title')}",
                verdict="dead",
                kill_layer="1b",
                verdict_notes="Thin posting; role-type kill from title.",
            )
        elif any(x in title for x in ("devops", "platform", "infrastructure", "security", "sre")):
            row.update(
                layer_0="KILL",
                layer_0_reason="Title/ICP signals technical infrastructure sale (thin posting).",
                layer_1a="KILL",
                layer_1a_reason="Technical buyer signal in title.",
                layer_1b="skipped",
                layer_1b_reason="",
                verdict="dead",
                kill_layer="0",
                verdict_notes="Thin posting; technical title heuristic.",
            )
        else:
            row.update(
                layer_0="skipped",
                layer_0_reason="Insufficient posting text to run layers safely.",
                layer_1a="skipped",
                layer_1a_reason="",
                layer_1b="skipped",
                layer_1b_reason="",
                verdict="insufficient_data",
                kill_layer="",
                verdict_notes=(
                    f"Thin/empty description ({p.get('description_len', 0)} chars). "
                    "Needs website + full posting scrape before rubric verdict. "
                    f"Website: {p.get('website') or 'UNKNOWN'}"
                ),
                one_fact_to_verify="Obtain full JD + homepage tagline/pricing.",
            )

        f.write(json.dumps(row, ensure_ascii=False) + "\n")
        added += 1

print(f"triaged {added} remaining companies")
