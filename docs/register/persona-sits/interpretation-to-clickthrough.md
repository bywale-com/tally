# Interpretation layer: outcomes → leaves → click-through

**Important:** Everything below this line is **parent interpretation** of how the product serves each persona. It is not the sit. Redesigns should re-challenge this layer against the sits in this folder.

## Pipeline

```text
Conjure sit (persona voice)
  → Outcome decomposition (capability + purpose)     ← parent
    → How leaves (testable beats)                      ← interpretation
    → Strips (choreography map)                        ← interpretation
    → Click-through (playable beats)                   ← interpretation  ★ intercept
    → Prototype plant (after human approve)            ← later
```

**Intercept note (2026-07-23 redesign):** The highest-leverage correction against the Guest/BC sit was here — not in outcome statements. Registry kept two Core outcomes (Guest + BC); **click-through must play one continuum** (same person after first fund). Splitting into two apps was placating the registry shape, not prospecting the sit.

## What we built in Register click-through (interpretation)

| Persona | App | Beats we chose to inhabit |
|---------|-----|---------------------------|
| Guest **and** BC | `GuestVessel` → `BusinessClientDesk` | Guest landing = BC desk shell; EVAL Invite → Fund → Receipt. Convert → same-person BC Desk (Campaigns / Meetings / Escrow). |
| Worker | `WorkerPrototypeApp.tsx` | Available (launched∧unclaimed) → Claim/Begin → Log meeting → Pipeline booked/N |
| Operator | `OperatorPrototypeApp.tsx` | Existing plant; outcomes/How roots/captions aligned (dossier=pricing, fund→launch) |

Deprecated thin re-exports: `NonBusinessClientPrototypeApp.tsx`, `BusinessClientPrototypeApp.tsx` → GuestVessel / BusinessClientDesk.  
Fossil (orphaned continuum shell): `PayerContinuumPrototypeApp.tsx` — not wired by `RegisterPrototypePanel`.

**Design chronology (chrome/copy evidence → rules):** [`../design-corpus/`](../design-corpus/) — not the sit; not this interpretation table.

## Forced shared objects (must stay visible in CT)

From [`outcomes-index.md`](./outcomes-index.md) — continuum surfaces these as one vessel, not copy-paste per screen:

1. Locked campaign rules  
2. Escrow terms (hold, per-meeting release, reclaim)  
3. Meeting log + **pre-call packet**  
4. Escrow release receipt / held vs released · **booked / N**  
5. Launch-after-fund gate (Operator CT)  
6. **Conversion receipt** (Guest → BC) — first-class beat, not a dead end  
7. Low-motion honesty + reclaim  
8. Honest booked / N  

## Design craft used in interpretation

- One job per beat; escrow/meeting truth over chrome  
- Guest→BC = **one person** (continuum CT)  
- No Worker↔Client inbox (sit refuse + eval)  
- Meeting **context** as packet on the meeting (§9 guest/BC)  
- Parametric elimination / gray lo-fi until approve — see `docs/build-foundation/06-parametric-elimination.md`  
- Full evidence ledger: [`../design-corpus/RULES.md`](../design-corpus/RULES.md) · gaps vs laws: [`../design-corpus/GAPS.md`](../design-corpus/GAPS.md)

## Paths

- Sits: `docs/register/persona-sits/`  
- Living CT: `apps/tally/src/app/register/wireframes/loFi/` (`GuestVessel` → `BusinessClientDesk`)  
- Design corpus: `docs/register/design-corpus/`  
- Wireflows: `docs/register/WIREFLOWS-*-core.md`

## Append — grading log

| Date | Change | Sit challenge |
|------|--------|---------------|
| 2026-07-23 | Merged Guest+BC CT into one continuum | Sit § continuum: same person after fund; prior CT dead-ended Guest and restarted BC as a stranger |
| 2026-07-23 | Guest CT craft — contract not checklist | Sit §2–5: clarity = escrow-lawyer simplicity; dropped repeating rules cards; Walk = fluency owns the beat |
| 2026-07-24 | Design corpus opened (evidence → rules) | Chronologies + RULES/GAPS under `docs/register/design-corpus/`; living CT = GuestVessel → BusinessClientDesk (PayerContinuum fossil) |
| 2026-07-24 | **Human approve** all Core click-throughs → plant | Operator / Guest→BC / Worker approved. Plant routes under `/prototype/*`. CT remains Register lo-fi. |
