# Guest — design chronology

**Living:** `apps/tally/src/app/register/wireframes/loFi/GuestVessel.tsx` (fund → `BusinessClientDesk`)  
**Generation path:** Separate `NonBusinessClientPrototypeApp` → `PayerContinuumPrototypeApp` (guest branch) → `GuestVessel`  
**Fossil:** `PayerContinuumPrototypeApp.tsx` (orphaned; not wired by `RegisterPrototypePanel`)  
**Deprecated wrapper:** `NonBusinessClientPrototypeApp.tsx` → re-exports `GuestVessel`

Schema: [`../METHOD.md`](../METHOD.md). Continuum cards shared with BC — see pointers.

---

### guest-nb-convert-strip-v1

| Field | Value |
|-------|-------|
| when | 2026-07-23 · nb-convert strip v1 |
| persona | Guest |
| surface | strip |
| baseline | witnessed |
| before | (none — first strip) |
| after | Accept invite → Walk campaign → First fund (`01-convert.svg`) |
| failure | n/a (baseline choreography) |
| rule_candidates | Strip names beats; CT must inhabit them without inventing a second personality |
| sources | `NB_CONVERT_V1_WHY` · CHANGELOG · `WIREFLOWS-non-business-client-core.md` |
| status_in_laws | partial — strip law in `05`; sit/CT intercept later |

---

### guest-separate-prototype-app

| Field | Value |
|-------|-------|
| when | 2026-07-23 · Persona CT plant |
| persona | Guest |
| surface | click-through |
| baseline | witnessed |
| before | No Guest shell / risk of Operator-plant screens |
| after | `NonBusinessClientPrototypeApp` — Accept → Walk → First fund (own shell) |
| failure | Guest as Operator sub-view would be wrong job |
| rule_candidates | Separate persona shells |
| sources | CHANGELOG “Persona click-throughs planted” |
| status_in_laws | codified → `10` §7 (family not clones) |

---

### guest-bc-continuum-intercept

| Field | Value |
|-------|-------|
| when | 2026-07-23 · interpretation → CT intercept |
| persona | cross |
| surface | click-through |
| baseline | witnessed |
| before | Two apps; Guest dead-ended at restart; BC started as a stranger |
| after | One continuum CT — same person after first fund. Mid-gen: `PayerContinuumPrototypeApp`. Living: `GuestVessel` → `BusinessClientDesk` |
| failure | Placating registry shape (two Core outcomes) instead of prospecting the sit (same person) |
| rule_candidates | Intercept at interpretation→CT; continuum = one person; conversion receipt first-class |
| sources | `interpretation-to-clickthrough.md` · applied exemplar §5 · sits guest-business-client · transcript |
| status_in_laws | codified as interpretation law in sits docs; craft echo `10` §6–7 · see [`../RULES.md`](../RULES.md)#r-continuum-intercept |

→ BC chronology: same card id.

---

### guest-vessel-contract-craft

| Field | Value |
|-------|-------|
| when | 2026-07-23 · Guest CT craft pass |
| persona | Guest |
| surface | click-through |
| baseline | witnessed |
| before | Bordered cards; “Locked campaign rules (shared object)” gray box every screen; instructional captions; ghost bordered secondary CTAs |
| after | Contract-simple Invite; Walk = fluency; Fund = hold; quiet secondary; no card stack (then evolved further — next cards) |
| failure | Feature-checklist chrome; repeating rules pitch |
| rule_candidates | One job; Border budget; Quiet until invited; Action hierarchy |
| sources | applied exemplar §6 · `interpretation-to-clickthrough.md` grading log |
| status_in_laws | codified → `06` §1–4 · later superseded in part by landing = desk |

---

### guest-narrator-ban

| Field | Value |
|-------|-------|
| when | 2026-07-24 · UI copy pass |
| persona | Guest |
| surface | click-through |
| baseline | witnessed |
| before | “Same person.” / “You’re a Business Client” / em-dash slogan captions / methodology contrast clauses |
| after | Facts only; delete non-actionable meta; periods over em-dash slogans |
| failure | Narrator ad-lib — UI explaining the design or sit |
| rule_candidates | Facts not narrator; Punctuation budget; Persona ear |
| sources | transcript user: “STOP ADLIBING… Speak what is important… MAKE IT A RULE” · `10-ui-copy.md` birth |
| status_in_laws | codified → `10` §1–4 |

---

### guest-landing-equals-bc-desk

| Field | Value |
|-------|-------|
| when | 2026-07-24 |
| persona | cross |
| surface | click-through |
| baseline | witnessed |
| before | Guest landing as separate metaphor walk (“Walk this with Operator”); Invite + Walk as two pages of the same decision; shell not matching BC desk |
| after | Guest lands like BC desk (mark + text nav Campaigns/Meetings/Escrow; fact grid; Fund / Review terms / More); invite+walk merged |
| failure | Visual + stage ad-libbing; opaque CTA; duplicate stages |
| rule_candidates | UI presents / copy contracts; No visual ad-libbing (stage twin); Desk shell congruence |
| sources | transcript · `10` §5–7 · living `GuestVessel.tsx` |
| status_in_laws | codified → `10` §5–7 · see [`../RULES.md`](../RULES.md)#r-desk-shell-congruence |

---

### guest-request-operator-dialog

| Field | Value |
|-------|-------|
| when | 2026-07-24 |
| persona | Guest |
| surface | click-through |
| baseline | witnessed |
| before | (Guest path already opened Ask Operator as Dialog with options) |
| after | Labeled **Request Operator**; Dialog with Challenge price / ICP / Swap company |
| failure | n/a on Guest — this is the **working** exemplar for congruence |
| rule_candidates | Same control → same behavior (modal with options) |
| sources | `GuestVessel.tsx` Dialog `ask-operator` · later label align with BC |
| status_in_laws | partial → `10` §7 mentions depth = Sheet/dropdown; **same-control behavior** still thin — see GAPS |

→ Congruence failure proven on BC: `bc-request-operator-modal` / [`../RULES.md`](../RULES.md)#r-same-control-behavior

---

## Destination (8.9)

GuestVessel is desk-family, fact-grid landing, EVAL Invite → Fund → Receipt, Request Operator dialog, continuum into BusinessClientDesk. Mid-generation PayerContinuum remains fossil only.
