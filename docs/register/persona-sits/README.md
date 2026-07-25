# Persona sits archive — redesign pack

**Purpose:** Full trail from conjure prompt → sit response → outcome decomposition → (interpretation) leaves/click-through.  
**Use:** Redesign elsewhere without losing why anything exists.

## Method (locked)

1. **Conjure only** — agent *is* the professional persona. No outcome lists, no screen design.
2. **Parent decomposes** — outcomes + purpose mined from the sit.
3. **Interpretation layer** — How leaves → strips → click-through are *our* reading of how the product serves that persona. They are not the sit itself. Challenge them against the sit if redesigning.
4. **Design corpus** — critical CT chrome/copy changes (evidence → rules) live in [`../design-corpus/`](../design-corpus/), after outcomes/Can'ts. Not the sit.

## Files

| File | Contents |
|------|----------|
| [`guest-business-client.md`](./guest-business-client.md) | Prompt + external sit (Guest → same person as BC) + outcomes + why |
| [`operator.md`](./operator.md) | Prompt + conjure agent sit + outcomes + why |
| [`worker.md`](./worker.md) | Prompt + conjure agent sit + outcomes + why |
| [`outcomes-index.md`](./outcomes-index.md) | All Core + secondary outcomes, cross-persona, forced objects |
| [`interpretation-to-clickthrough.md`](./interpretation-to-clickthrough.md) | How we mapped sits → CT (explicitly interpretation) |

**Related (living product):**

- [`../OUTCOMES-FROM-SITS.md`](../OUTCOMES-FROM-SITS.md)
- [`../WORLD.md`](../WORLD.md)
- Registry: `apps/tally/src/app/register/outcomes/outcomesRegistry.ts`
- Click-throughs: `apps/tally/src/app/register/wireframes/loFi/`
  - **Guest + BC continuum:** `GuestVessel.tsx` → `BusinessClientDesk.tsx` (same person after fund)
  - **Worker / Operator:** `WorkerPrototypeApp.tsx` · `OperatorPrototypeApp.tsx`
  - **Fossil (orphaned):** `PayerContinuumPrototypeApp.tsx` — mid-generation continuum; not wired
- Design chronology + rule ledger: [`../design-corpus/`](../design-corpus/)

## World lighthouse (all prompts share)

Pay-per-booked-meeting arbitrage · escrow hold · release per qualified meeting · Operator prices vessels · clients never create campaigns · no Worker↔Client free messaging · meeting context = pre-call packet on the meeting.
