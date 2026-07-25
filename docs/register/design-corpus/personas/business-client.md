# Business Client — design chronology

**Living:** `apps/tally/src/app/register/wireframes/loFi/BusinessClientDesk.tsx`  
**Generation path:** Separate `BusinessClientPrototypeApp` → `PayerContinuumPrototypeApp` (client branch) → `BusinessClientDesk`  
**Fossil:** `PayerContinuumPrototypeApp.tsx` client screens (`campaigns | meetings | meeting | quality | low-motion | ledger`)  
**Deprecated wrapper:** `BusinessClientPrototypeApp.tsx` → re-exports `BusinessClientDesk`

Schema: [`../METHOD.md`](../METHOD.md).

---

### bc-join-run-strip-v1

| Field | Value |
|-------|-------|
| when | 2026-07-23 · bc-join-run strip v1 |
| persona | BC |
| surface | strip |
| baseline | witnessed |
| before | (none — first strip) |
| after | Join + fund → Progress notify → Respond → Stop / reclaim |
| failure | n/a (baseline choreography) |
| rule_candidates | Forced objects (escrow, meetings, reclaim) must appear in CT |
| sources | `BC_JOIN_RUN_V1_WHY` · CHANGELOG |
| status_in_laws | archived — superseded by desk-module strips 2026-07-25 |

---

### bc-desk-strips-v1

| Field | Value |
|-------|-------|
| when | 2026-07-25 · bc-campaigns / bc-meetings / bc-escrow strip v1 |
| persona | BC |
| surface | strip |
| baseline | witnessed |
| before | Single `bc-join-run` abstract panels lagged living desk |
| after | Three strips matching Campaigns / Meetings / Escrow; steps `surface: click-through` → `BusinessClientDesk` |
| failure | Register Strips inventing a parallel product while CT already had the desk |
| rule_candidates | Strip inventory tracks living CT modules; don’t leave choreography fossils as current |
| sources | `BC_CAMPAIGNS_V1_WHY` · `BC_MEETINGS_V1_WHY` · `BC_ESCROW_V1_WHY` · CHANGELOG · living desk |
| status_in_laws | current strip inventory |

---

### bc-separate-prototype-app

| Field | Value |
|-------|-------|
| when | 2026-07-23 · Persona CT plant |
| persona | BC |
| surface | click-through |
| baseline | witnessed |
| before | No BC shell / stranger restart after Guest |
| after | `BusinessClientPrototypeApp` — Join/fund → Notify → Respond → Stop/recollect |
| failure | Guest dead-end + BC stranger (see continuum) |
| rule_candidates | Separate shell; then continuum merge |
| sources | CHANGELOG Persona CT plant |
| status_in_laws | superseded by continuum intercept |

→ `guest-bc-continuum-intercept` ([`guest.md`](./guest.md) · [`../RULES.md`](../RULES.md)#r-continuum-intercept)

---

### bc-payer-continuum-client

| Field | Value |
|-------|-------|
| when | 2026-07-23 · mid-generation |
| persona | BC |
| surface | click-through |
| baseline | inferred-from-fossil |
| before | Separate BC PrototypeApp |
| after | Payer continuum client nav Campaigns / Meetings / Escrow; screens include quality, low-motion, ledger |
| failure | Still LoFiPersonaChrome-era; later desk split for congruence with GuestVessel |
| rule_candidates | Continuum object sharing; desk family evolution |
| sources | fossil `PayerContinuumPrototypeApp.tsx` · applied exemplar §5 (stale “living” claim — see GAPS) |
| status_in_laws | superseded — living path is BusinessClientDesk |

---

### bc-loud-campaigns-calm

| Field | Value |
|-------|-------|
| when | 2026-07-24 |
| persona | BC |
| surface | click-through |
| baseline | witnessed |
| before | Loud purple / metric essays / link farm on My campaigns; Manage as text line or fake modal |
| after | Calm desk; ink/ghost LoFiButtons; vessel rows fact-light; secondary behind **More** dropdown |
| failure | Color and word density pitching; line-farm of actions |
| rule_candidates | Border/color budget; Quiet until invited; secondary behind More; Facts in structure |
| sources | transcript (loud color / less words) · living `BusinessClientDesk.tsx` |
| status_in_laws | partial → `06` + `10` §3 · More-menu grammar in `10` §7 |

---

### bc-meeting-invite-before-form

| Field | Value |
|-------|-------|
| when | 2026-07-24 |
| persona | BC |
| surface | click-through |
| baseline | witnessed |
| before | “This doesn’t count” + dispute form always open; Accept + Dispute both loud; Cancel stranded in `mt-auto` void |
| after | `disputeOpen` gates form; reset on close/switch; action cluster then spacer then footer; SheetContent `p-6` inset |
| failure | Consequence painted before invite; stack rhythm broken; overlay inset inconsistent |
| rule_candidates | Invite before form (3a); Stack rhythm (3b); Overlay inset (3c) |
| sources | applied exemplar §7 · living meeting sheet · `components/ui/sheet.tsx` |
| status_in_laws | codified → `06` §3a–3c |

---

### bc-escrow-status-and-reclaim

| Field | Value |
|-------|-------|
| when | 2026-07-24 |
| persona | BC |
| surface | click-through |
| baseline | witnessed |
| before | Escrow Status verbal essay (“No bookings in 14 days”); “Reclaim in Nd” in header; Reclaim enabled while timer not done; Request Operator on same loud row / flash-only |
| after | No Status block; vessel name only in caption; Reclaim disabled until reclaimable with **Available in Nd** beside button; Request Operator quiet below (opens dialog — next card) |
| failure | Narrator Status; timer far from control; line-button problem; useless chrome |
| rule_candidates | Facts not narrator; Timer on disabled control; Line-button problem; Don’t placate with Status |
| sources | transcript (claimed?/status/reclaim) · living Escrow in `BusinessClientDesk.tsx` |
| status_in_laws | partial — line-button in `06` §4; Status essay in `10`; **timer-on-disabled** missing as named law → GAPS |

---

### bc-request-operator-modal

| Field | Value |
|-------|-------|
| when | 2026-07-24 |
| persona | cross |
| surface | click-through |
| baseline | witnessed |
| before | BC Escrow / Details: Request Operator → flash or navigate; Guest: same label family → Dialog with options |
| after | Both entry points call `openOperatorRequest()` → shared Dialog (Different Worker / Review angle / Review price) |
| failure | Literally the same control, incongruent behavior |
| rule_candidates | Same control → same behavior; Module-type congruence |
| sources | transcript (“congruence… literally the same component”) · Guest Dialog · BC `operatorDialog` |
| status_in_laws | partial → `10` §7 · **same-control behavior** promote → GAPS · [`../RULES.md`](../RULES.md)#r-same-control-behavior |

---

### guest-landing-equals-bc-desk

→ see [`guest.md`](./guest.md)#guest-landing-equals-bc-desk · [`../RULES.md`](../RULES.md)#r-desk-shell-congruence

---

## Destination (8.9)

BusinessClientDesk: Campaigns / Meetings / Escrow; sheets; More menu; meeting invite-before-form; escrow without Status; reclaim timer on button; Request Operator dialog congruent with Guest.
