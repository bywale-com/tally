# Design corpus — method

Absolute precision. Evidence parents the rule. Rules that cannot point at cards do not enter [`RULES.md`](./RULES.md).

---

## 1. What counts as “first walkthrough”

**Definition:** First *playable* Register click-through for that persona, or the earliest recoverable fossil on disk when the first playable surface was not snapshotted.

| Baseline tag | Meaning |
|--------------|---------|
| `witnessed` | Dated changelog, registry WHY, or attributable user critique of that surface |
| `inferred-from-fossil` | Reconstructed from orphaned app / archived SVG / deprecated wrapper still on disk |

Strip SVG revisions are **parallel evidence** when they birthed a rule (Operator Enrich Filter+prune is the exemplar). They are not a substitute for click-through chronology unless the living surface was strip-only at that time.

**Git:** lo-fi sources were largely uncommitted during this corpus’s birth window. Do **not** invent chronology from `git blame`. Prefer CHANGELOG, registry WHY, fossils, transcript.

---

## 2. Evidence sources (layered)

1. **Fossils** — `PayerContinuumPrototypeApp.tsx`, deprecated `*PrototypeApp` re-exports, archived strip/step SVGs under `apps/tally/public/wireframes/*-core/`
2. **Changelog + registry** — [`../CHANGELOG-wireframes.md`](../CHANGELOG-wireframes.md), `*_WHY` in `wireframesRegistry.ts`
3. **Craft transcript** — Cursor agent transcript `01a6e082-7a2f-43a2-8ed2-92ca09872631` (primary Jul 20–24); foundation pre-context `b8c4c9e1-f045-47bc-83bf-3b00de75a854`
4. **Living destination** — current GuestVessel / BusinessClientDesk / WorkerPrototypeApp / OperatorPrototypeApp

Quotes from the user are **short and attributable**. Never invent a first screen when only a later critique exists — mark the baseline tag.

---

## 3. Evidence card schema

Every critical change is one card. No narrator essays in card bodies.

| Field | Content |
|-------|---------|
| `id` | Stable kebab id (`op-enrich-filter-prune-v2`, `bc-escrow-status-removed`) |
| `when` | Date and/or strip·step version |
| `persona` | `Operator` \| `Guest` \| `BC` \| `Worker` \| `cross` |
| `surface` | `strip` \| `step` \| `click-through` |
| `baseline` | `witnessed` \| `inferred-from-fossil` |
| `before` | Concrete prior (file / SVG / behavior) |
| `after` | Concrete successor (living path) |
| `failure` | What failed (placating, narrator, incongruence, painted gate, …) |
| `rule_candidates` | 1–N candidate law titles |
| `sources` | Changelog / WHY / transcript / fossil path |
| `status_in_laws` | `codified` (cite law§) \| `partial` \| `missing` \| `superseded` |

### Persona file format

Ordered list: first walkthrough → current 8.9. Each card is a subsection `### card-id` with the fields as a definition list or compact table.

Cross cards: full body once under [`RULES.md`](./RULES.md) § Cross-persona evidence **or** in the first persona that hit the failure; other personas get:

```text
→ see card `cross-request-operator-modal` (RULES / guest.md)
```

---

## 4. Rule birth

1. Harvest `rule_candidates` from cards.
2. Merge only when the **same failure class** is proven (same-control incongruence = Guest dialog + BC flash).
3. Settled rule: one imperative statement + evidence ids + law citation or `MISSING`.
4. World / admission failures cite [`09`](../../build-foundation/09-world-model.md) — corpus records the *CT symptom*; world owns the cure. Do not restate world law as chrome craft unless the failure was painting a gate.

---

## 5. Gap classes ([`GAPS.md`](./GAPS.md))

| Class | Meaning |
|-------|---------|
| **Missing law** | Evidence settled; no portable law text (or only buried in applied exemplar) |
| **Partial** | Law covers part of the failure class |
| **Under-evidenced** | Law text stronger than cards |
| **Stale exemplar** | Docs name orphaned living path |
| **Out of scope** | Belongs to 08/09 / sits — pointer only |

**Promotion rule:** First corpus pass does **not** silently edit `06` / `07` / `10`. Mark `promote` in GAPS; human/agent applies law patches in a follow-on with evidence ids intact.

---

## 6. What not to do

- Rewrite living CT while authoring corpus (docs-only).
- Conflate sit/outcome redesign with chrome craft in the same card without labeling both.
- Duplicate a cross-persona story three times with divergent “whys”.
- Use em-dash slogan captions inside corpus chrome tables (same punctuation budget as product — periods).
