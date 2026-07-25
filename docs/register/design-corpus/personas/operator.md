# Operator — design chronology

**Living:** `apps/tally/src/app/register/wireframes/loFi/OperatorPrototypeApp.tsx`  
**First recoverable:** Operator plant + Evaluate/Enrich strip v1 (2026-07-22 changelog). Baseline for early plant chrome: mix of `witnessed` (changelog) and `inferred-from-fossil` (archived SVGs).  
**Job density note:** Operator plant stays denser than Guest/BC desk — different module types (disco, enrich table). Congruence applies to shared module types (empty honesty, quiet secondary, one loud action), not desk cloning.

Schema: [`../METHOD.md`](../METHOD.md).

---

### op-evaluate-v1-to-v2

| Field | Value |
|-------|-------|
| when | 2026-07-22 · Evaluate strip v1 → v2 |
| persona | Operator |
| surface | strip |
| baseline | witnessed |
| before | Short verdict emulation on disco (`02-evaluate.svg`) |
| after | Co-piloted dossier: honest unknowns, call notes, explicit re-analyze, Operator clears (`evaluate-v2`) |
| failure | Verdict theater instead of Operator work on disco |
| rule_candidates | One job per surface; honesty over emulation |
| sources | `CHANGELOG-wireframes.md` · `EVALUATE_V2_WHY` |
| status_in_laws | partial → `06` §1 One job (dossier job named; not yet elimination checklist) |

---

### op-evaluate-v2-to-v3

| Field | Value |
|-------|-------|
| when | 2026-07-22 · Evaluate strip v2 → v3 |
| persona | Operator |
| surface | strip |
| baseline | witnessed |
| before | Heavier dossier with form panels under sections |
| after | Minimalist accordion (icon + title + chevron); sticky notes for call context; clean field titles (`evaluate-v3`) |
| failure | Form panels competing with read/decide job |
| rule_candidates | Quiet until invited; border budget |
| sources | `CHANGELOG-wireframes.md` · `EVALUATE_V3_WHY` |
| status_in_laws | partial → `06` §2–3 |

---

### op-enrich-v1-to-v2

| Field | Value |
|-------|-------|
| when | 2026-07-22 · Enrich strip v1 → v2 |
| persona | Operator |
| surface | strip |
| baseline | witnessed |
| before | Spinner then a thin firm list |
| after | Live firmographics table; columns filterable; controls visible but locked while enriching; rows fill in place (`enrich-v2`) |
| failure | Fake second surface (spinner theater) instead of the table owning the beat |
| rule_candidates | Don’t placate empty / fake loading chrome; one job (table) |
| sources | `CHANGELOG-wireframes.md` · `ENRICH_V2_WHY` · registry prior why “Spinner then a thin firm list.” |
| status_in_laws | codified → `06` §5 Don’t placate empty chrome |

---

### op-enrich-filter-prune-v2

| Field | Value |
|-------|-------|
| when | 2026-07-22 · Enrich v2 · Filter + prune step v1 → v2 |
| persona | Operator |
| surface | step + click-through |
| baseline | witnessed |
| before | Always-on column filter grid above table; dashed full-width Add firm strip (`enrich-v2-filter-prune-v1.svg`) |
| after | Quiet Filter + anchored popover + dismissible chips; quiet Add firm in header (`filter-prune-v2`, surface click-through) |
| failure | Filters + table + dashed Add all pitching — placating chrome; border democracy |
| rule_candidates | Border budget; Quiet until invited; One loud / no dashed beg strips; Prospecting not placating |
| sources | `FILTER_PRUNE_V1_WHY` / `V2_WHY` · CHANGELOG · transcript `01a6e082` (user maps Enrich to parametric elimination) · applied exemplar §1 |
| status_in_laws | codified → `06` §1–4 (birth card for parametric elimination) |

---

### op-agency-v2

| Field | Value |
|-------|-------|
| when | 2026-07-23 · Evaluate v3 · Agency step v1 → v2 |
| persona | Operator |
| surface | step + click-through |
| baseline | witnessed |
| before | Re-analyze as bordered ghost + Enrich as primary on dossier — Enrich pitches on disco; two CTA shells |
| after | Quiet text Re-analyze; one loud **Clear** (disco gate → off-call Enrich); mute sparkles; lean company row; no dashed skeleton bars |
| failure | Wrong loud action on the beat; Enrich competing on disco |
| rule_candidates | Action hierarchy — one loud action; Quiet until invited |
| sources | `AGENCY_V1_WHY` / `V2_WHY` · CHANGELOG · applied exemplar §2 |
| status_in_laws | codified → `06` §4 Action hierarchy |

---

### op-create-empty-and-basics-v2

| Field | Value |
|-------|-------|
| when | 2026-07-23 · Create v1 · Campaigns + Campaign basics steps v1 → v2 |
| persona | Operator |
| surface | step + click-through |
| baseline | witnessed |
| before | Empty list wore skeleton bars; Name label under New campaign; Cancel bordered ghost beside Create |
| after | Honest empty body; Create only loud pitch; autofocus Campaign name; Cancel quiet text |
| failure | Placating empty chrome; equal-weight Cancel; redundant label |
| rule_candidates | Don’t placate empty; Action hierarchy; Quiet until invited |
| sources | `CREATE_CAMPAIGNS_*` / `CREATE_BASICS_*` WHY · CHANGELOG · applied exemplar §4 |
| status_in_laws | codified → `06` §4–5 |

---

### op-overlay-escape

| Field | Value |
|-------|-------|
| when | 2026-07-23 · click-through menus (Filter / ⋮) |
| persona | Operator |
| surface | click-through |
| baseline | witnessed |
| before | Absolute menus inside overflow-clipped cards/panes — truncated at edge |
| after | `AnchoredPortal` / portal + fixed anchor (`AnchoredPortal.tsx`); shadcn portals where used |
| failure | Overlay clipped; z-index “fix” does not escape overflow |
| rule_candidates | Overlay escape — portal floating chrome |
| sources | `07-overlay-escape.md` · transcript (clip bugs) · prior art Strips Why popover |
| status_in_laws | codified → `07` entire |

---

### op-copy-hyphen-seed

| Field | Value |
|-------|-------|
| when | 2026-07-23 · Operator chrome copy |
| persona | Operator |
| surface | click-through |
| baseline | witnessed |
| before | Extra descriptive text; hyphen / middle-dot caption glue |
| after | Lean captions; seed of punctuation budget (later formalized in `10`) |
| failure | Decorative punctuation and narrator-ish chrome where a fact would do |
| rule_candidates | Punctuation budget; Facts not narrator |
| sources | transcript `01a6e082` (user: extra descriptive text / hyphen) |
| status_in_laws | codified → `10` §1–2 (seed; full law after Guest/BC) |

---

### op-persona-shells-separate

| Field | Value |
|-------|-------|
| when | 2026-07-23 · Persona CT plant |
| persona | cross |
| surface | click-through |
| baseline | witnessed |
| before | Risk of stuffing Worker/Guest/BC screens inside Operator plant |
| after | Each Core gets its own Register Click-through shell (`CHANGELOG` · Persona click-throughs planted) |
| failure | Wrong job density / wrong persona chrome if cloned into Operator |
| rule_candidates | Design congruence — family not clones; different jobs stay different |
| sources | CHANGELOG “Persona click-throughs planted” · transcript (personas are separate views) |
| status_in_laws | codified → `10` §7 · see also card pointers in guest/worker |

→ Full cross statement: [`../RULES.md`](../RULES.md)#r-module-congruence

---

## Destination (8.9)

Operator plant remains denser by job (disco, enrich, dossier, invite choreography). Craft wins on this chronology: Filter+prune, Agency, Create empty/basics, overlay escape. Grade is walkthrough-strong on elimination; plant approve for `/prototype` is still a later gate.
