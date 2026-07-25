# Design corpus — evidence → rules

**Grade (2026-07-24):** Register click-through pack ≈ **8.9 walkthrough** — playable, craft-law-aware.  
**Approve (2026-07-24):** All four Core CTs **human-approved** for plant. Durable UI: `/prototype` hub (Operator · Guest · Client · Worker). Register click-through stays gray lo-fi.

**Job:** Reconstruct each persona’s core flow stack (strips · steps · click-through) from first recoverable walkthrough to the living desk, treat every critical change as **evidence**, birth craft **rules** from that evidence, and compare the ledger to today’s craft laws.

**Not this folder:** World sits, outcomes, so-that, or purpose lattice. Those live under [`../persona-sits/`](../persona-sits/), [`../WORLD.md`](../WORLD.md), and build-foundation [`08`](../../build-foundation/08-outcome-so-that.md) / [`09`](../../build-foundation/09-world-model.md).

---

## Pipeline position

```text
Sits → outcomes + so-that → obstacles (Can'ts)
  → ★ DESIGN CORPUS ★
       core flow stack: strips · steps · click-through chrome / copy / congruence
  → approve → plant
```

Craft *laws* (portable constraints): [`06`](../../build-foundation/06-parametric-elimination.md), [`07`](../../build-foundation/07-overlay-escape.md), [`10`](../../build-foundation/10-ui-copy.md).  
This corpus is the **evidence ledger** those laws should cite — and the place to find rules evidence already proved that laws have not absorbed.

---

## How to read

| File | Use |
|------|-----|
| [`METHOD.md`](./METHOD.md) | Sources, card schema, rule-birth, gap classes |
| [`personas/operator.md`](./personas/operator.md) | Operator chronology (cards ordered first → now) |
| [`personas/guest.md`](./personas/guest.md) | Guest chronology |
| [`personas/business-client.md`](./personas/business-client.md) | Business Client chronology |
| [`personas/worker.md`](./personas/worker.md) | Worker chronology |
| [`RULES.md`](./RULES.md) | Settled rules ← evidence ids |
| [`GAPS.md`](./GAPS.md) | Missing / partial / stale vs 06·07·10 |

Cross-persona cards use `persona: cross` once in [`RULES.md`](./RULES.md); persona files point at the card id — do not fork three stories.

---

| Living destinations (2026-07-24)

| Persona | Living click-through (Register) | Plant (approved) |
|---------|--------------------------------|------------------|
| Operator | `OperatorPrototypeApp.tsx` | `/prototype/operator` |
| Guest | `GuestVessel.tsx` | `/prototype/guest` → client |
| Business Client | `BusinessClientDesk.tsx` | `/prototype/client` |
| Worker | `WorkerPrototypeApp.tsx` | `/prototype/worker` |

Hub: `/prototype`. Wiring CT: `RegisterPrototypePanel.tsx` by How `graphId`.  
**Fossil (orphaned):** `PayerContinuumPrototypeApp.tsx` — mid-generation continuum; not imported by the panel.

---

## Related

- Strip/step history: [`../CHANGELOG-wireframes.md`](../CHANGELOG-wireframes.md) · `wireframesRegistry.ts`
- Interpretation intercept: [`../persona-sits/interpretation-to-clickthrough.md`](../persona-sits/interpretation-to-clickthrough.md)
- Applied exemplars (grading, not chronology): [`../../build-foundation/06-parametric-elimination-applied.md`](../../build-foundation/06-parametric-elimination-applied.md)
