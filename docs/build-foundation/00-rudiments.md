# Build rudiments — instruction manual

Read this first on every new product and whenever you add a surface.

These are the **baseline**. Without them, UI is disposable: hard to name, hard to theme, hard to map, hard to turn into How trees and flows later.

---

## Before writing product code

1. Confirm `PROJECT-BRIEF.md` has: product name, user role, **one molecular outcome**, starting surface.
2. Confirm visual law exists or is stubbed: tokens file (`light` / `dark`), icon approach, shared type/spacing helpers.
3. Confirm surface registry exists or is stubbed: one boundary component that registers `id` + `label` into a live tree.

If any of those are missing, create the stubs **before** the first feature UI.

---

## Every new UI surface

Do these in order:

| # | Rudiment | Done means |
|---|----------|------------|
| 1 | **Tokens** | Colors/surfaces use theme tokens, not hardcoded hex or `isDark ? …` for standard chrome |
| 2 | **Icons** | Chrome/tree icons use the product icon registry; interactive controls use the control icon set — don’t mix roles |
| 3 | **Type & spacing** | Sizes and row metrics come from shared helpers — no one-off list fonts |
| 4 | **Surface boundary** | Root of the region wrapped so it has a stable **id**, **functional label**, optional icon, order among siblings |
| 5 | **Live map** | Region appears in the live surface tree; hover/focus can highlight it |
| 6 | **shadcn primitives** | Interactive controls/forms/overlays come from shadcn/ui (skill + CLI) — not one-off styled chrome for Button/Dialog/Field |
| 7 | **Parametric elimination** | One job; border budget; quiet doors for secondary; one loud action — see [`06-parametric-elimination.md`](./06-parametric-elimination.md) |
| 8 | **Overlay escape** | Floating menus/popovers portal out of overflow clips — see [`07-overlay-escape.md`](./07-overlay-escape.md) |
| 9 | **Systems map** (when the product has Register) | Same id/label inventoriable on view artboards without hand-drawing layout |
| 10 | **How** (when touching an epic outcome) | Decomposition follows DNA + visibility; no process language before leaves |
| 11 | **Flow** (when appearance isn’t enough) | Flow lives at the **flow anchor**; leaves are test cases + process assumptions |
| 12 | **Outcome so-that** (when authoring/editing a Core outcome) | Capability clause + `so that <next entity>` clause; chain closes back into the lattice — see [`08-outcome-so-that.md`](./08-outcome-so-that.md) |
| 13 | **World model** (when inventing/expanding personas or persona UI) | Persona sits + primary-object admission matrix before outcomes expand or click-through paints views — see [`09-world-model.md`](./09-world-model.md) |
| 14 | **UI copy** (when writing labels, captions, status, empty states) | Facts only; no narrator ad-lib; periods over em-dash slogans in chrome — see [`10-ui-copy.md`](./10-ui-copy.md) |

Skip 9–12 only when the work is pure cosmetic polish on an existing registered surface. Do **not** skip 1–8 for new interactive regions (shell chrome may stay token-only until a control is needed). Do **not** skip 13 when adding a persona view or changing who sees a shared object. Do **not** skip 14 when shipping user-visible strings.

---

## Functional labels

Name regions by **role**, not filenames.

- ✅ Board body, Sign-in form, Client brief  
- ❌ `BoardPanel`, `LoginForm.tsx`, `HeaderThing`

---

## Sequence of truth

```text
Idea → World model (sits + admission)
  → Molecular outcome + so-that + How Analysis (DNA + visibility)
  → Block + lo-fi strips + click-through (Register prune)
  → Human approve (serious identity changes)
  → Plant on future-home (tokens, dark mode, HolonBoundary, shadcn)
  → Flow at flow anchor when appearance isn’t enough
  → Implement + ship that flow
```

Strips/versioning/approve gate: [`05-register-augmented-build.md`](./05-register-augmented-build.md).  
Chrome craft (parametric elimination): [`06-parametric-elimination.md`](./06-parametric-elimination.md).  
Overlay escape (menus/popovers): [`07-overlay-escape.md`](./07-overlay-escape.md).  
Outcome so-that (purpose lattice closure): [`08-outcome-so-that.md`](./08-outcome-so-that.md).  
World model (ecosystem admission): [`09-world-model.md`](./09-world-model.md).

The prototype plant is cosmetic until a flow ships. Surfaces stay registered so Console/Register can keep pointing at them.

---

## Anti-patterns

- Building a panel with no surface id (can’t highlight, can’t list, can’t How-component to it)
- New hex colors scattered in JSX
- Inventing icon imports outside the registry
- Naming How children with terms that never appeared in the parent answer
- Putting Auth/API/store language on non-leaf How nodes
- Starting a “full product” instead of one starting surface + one clear outcome
- Placating chrome: always-on secondary stacks, dashed beg CTAs, equal section bars, card-per-row lists (see parametric elimination)
- Absolute menus clipped by `overflow: hidden` cards — portal them (see overlay escape)
- A Core outcome statement with a capability list and no `so that` clause, or a so-that that dangles into process/infra language instead of the next entity in the lattice (see outcome so-that)
- Persona UI that paints an admission gate as decision chrome (e.g. Worker queue advertising `funded`) — see world model

---

## Agent handoff line (pasteable)

> Follow `docs/build-foundation/00-rudiments.md`, `05-register-augmented-build.md`, `06-parametric-elimination.md`, `07-overlay-escape.md`, `08-outcome-so-that.md`, and `09-world-model.md`. Use tokens, dark mode from day one, icon registry, surface boundaries, and shadcn primitives on every new interactive plant. For serious UI identity changes: strip → click-through → wait for human approve → then plant. Version strips (and steps on a strip version); keep Changelog. One job per surface; border budget; quiet until invited; one loud action. Floating menus portal out of overflow clips. Decompose with How Analysis only with DNA + visibility. Crystallize a Register-style flow only at a flow anchor. Core outcome statements carry a capability clause and a `so that <next entity>` clause that closes back into the lattice. Before persona UI, check world sits + admission matrix (`docs/register/WORLD.md`). Build only what `PROJECT-BRIEF.md` asks for next.
