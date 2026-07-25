# World model — cohesive ecosystem before outcomes expand

**Thesis:** An idea with a person + purpose is enough to seed a world — but **so-that alone does not force admission**. Without a compact world model (who exists, what shared objects move through which states, who may see them), persona UIs invent gates as badges and leak other people's jobs.

**Name:** World model — the self-sustaining ecosystem layer.  
**Symptom:** A persona screen shows a label that is already required for the object to be in that view (e.g. Worker queue row advertising `funded`). Or a click-through invents a view that the admission matrix would mark empty.  
**Cure:** Sit each persona; write the primary object's admission matrix; walk the matrix before any persona UI. Gate ≠ decision chrome.

Companion (worked V1): [`docs/register/WORLD.md`](../register/WORLD.md)  
Machine twin: `apps/tally/src/app/register/world/campaignWorld.ts`  
Upstream purpose law: [`08-outcome-so-that.md`](./08-outcome-so-that.md)

---

## Pipeline

```text
Idea (rough outcome + person + purpose)
  → World model (personas · objects · states · admission · never-see)
  → Persona outcome + so-that
  → How leaves
  → Flows (strips · steps · click-through)
  → Prototype (after approve)
```

So-that answers *who benefits next*. World answers *what must be true for that next person to even see the object*.

---

## 1. Size rule — cohesive, not encyclopedic

World is **not** everything that can ever exist. It is the smallest ecosystem that can sustain itself given the seed.

For a sales-led product like Tally V1 that usually means:

- Living personas already implied by the seed (plus any persona so-that forced into existence)
- One primary shared object (here: **Campaign**)
- A handful of states and who **admits** / **owns transition**
- Secondary objects (Firm list, Invite) only when a Core capability already names them

If the artifact does not fit ~two pages, you overbuilt.

---

## 2. Seed is enough

A strong rough outcome usually reveals the second persona (or the same person served differently). Expand world from that seed — do **not** mint personas for sport. Add a persona only when so-that / closure or an admission hole demands it (Worker was that kind of add).

---

## 3. Required artifacts (validation format)

### A. Persona sit (one card each)

| Field | Question |
|-------|----------|
| **Why exist** | What breaks if this persona is removed? |
| **Served how** | What do they receive from the world? |
| **Purpose they serve** | Whose so-that do they fulfill? |
| **Primary object in view** | What do they mostly see? |
| **Admit iff** | When does that object enter their world? |
| **Never see** | Explicit negative space |
| **Natural needs (V1)** | Only what must exist for them to exist and be served |

No feature lists. No UI chrome. No invented dashboards.

### B. Admission matrix (one table per primary object)

Rows = minimal states. Columns = personas. Cells = **in view** / **not in view** / **owns transition**.

**Ritual:** Before any persona click-through or plant, walk the matrix. Anything shown that the matrix marks *not in view* is a world bug.

**Gate vs decision (30s test):** If a label is already required for admission, do not show it as that persona's work.

---

## 4. Agent checklist

1. Is there a worked world doc (sits + matrix) for this product version?
2. Does every persona UI only show objects the matrix admits for that persona + state?
3. Are gate conditions (already true or the row would not exist) kept off decision chrome?
4. Did you update the thin machine twin (`admits`) when states or admission changed?
5. Did you invent a secondary object that no Core capability names? Cut it.

---

## Agent handoff line (pasteable)

> Follow `docs/build-foundation/09-world-model.md`. Before persona UI or click-through, check `docs/register/WORLD.md` (persona sits + Campaign admission matrix) and `campaignWorld.ts` `admits`. Do not paint admission gates as that persona's badges. Pipeline: idea → world → outcome/so-that → leaves → flows → prototype.
