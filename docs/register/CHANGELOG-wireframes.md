# Operator Core — wireframe changelog

Register strip + **step** revisions.  
**Source of truth:** `apps/tally/src/app/register/wireframes/wireframesRegistry.ts`  
**UI:** Register → Strips · scrub strip `vN` · boxed **i** on versioned steps (hover → label + step scrubber) · **Changelog** modal (newest first).

---

## Logging rules (settled)

| Bump | When |
|------|------|
| **Strip version** | Stage **identity** changes; a step is **added**; a step is **removed**; or most/all steps in the stage move |
| **Step version** | A step is only **modified** (same beat, different presentation). Lives **on that strip version** you are viewing — not as a global footer under the lineage |
| **Skip** | Typos, tiny positional nudges, no story change |

### Step vs strip (how to read the UI)

1. Open a **strip version** (e.g. Enrich **v2**).  
2. Versioned steps in **that** strip version show a boxed **i** on the step panel in the strip.  
3. Hover **i** → label + `v1` / `v2` / … scrubber slides in; selecting a version **swaps the panel preview** for that step.  
4. Step names **honor the strip panel labels** (e.g. **Filter + prune**), not invent parallel names.  
5. Living surface may be **click-through** before the strip SVG is redrawn — still log the step (`surface: "click-through"`) and give the step revision a panel `src` preview so scrubbing stays legible.

### Asset hygiene

Strip / step SVGs must be valid XML when loaded as `<img>`. Prefer ASCII punctuation in SVG text (avoid bare `&`, corrupted Unicode). Archive prior assets; never overwrite.

Serious strip identity changes: wireframe → click-through → human approve → then plant `/prototype`.

---

## Evaluate v1 → v2 (2026-07-22) · archived strip

**Why:** Co-piloted dossier on disco: honest unknowns, call notes, explicit re-analyze, Operator clears. Replaces short verdict emulation.

| | |
|--|--|
| Prior | `evaluate` · `02-evaluate.svg` · **archived** |
| Then | `evaluate-v2` · `02-evaluate-v2.svg` · **archived** |

## Evaluate v2 → v3 (2026-07-22) · current strip

**Why:** Minimalist dossier: accordion like reference (icon + title + chevron), clean field titles, sticky notes for call context (agent-readable), no form panels under every section.

| | |
|--|--|
| Prior | `evaluate-v2` · **archived** |
| Current | `evaluate-v3` · `02-evaluate-v3.svg` · **current** · supersedes `evaluate-v2` |

## Enrich v1 → v2 (2026-07-22) · current strip

**Why:** Live firmographics table: all columns filterable, controls visible but locked while enriching, rows fill in place — not spinner then a thin firm list.

Strip panels (v2): **1 Start** → **2 Live fill** → **3 Filter + prune** → **4 Beat**.

| | |
|--|--|
| Prior | `enrich` · `03-enrich.svg` · **archived** |
| Current | `enrich-v2` · `03-enrich-v2.svg` · **current** · supersedes `enrich` |

## Enrich v2 · Filter + prune v1 → v2 (2026-07-22) · current step

**Strip unchanged:** Enrich remains **v2** (step modified only).

**Why v2:** Tower craft on click-through: quiet Filter control + anchored popover + dismissible chips; quiet Add firm in header — no dashed full-width strip / always-on filter grid.

| | |
|--|--|
| Prior | `enrich-v2-filter-prune-v1` · `03-enrich-v2-filter-prune-v1.svg` · grid filters + dashed Add firm · **archived** |
| Current | `enrich-v2-filter-prune-v2` · `03-enrich-v2-filter-prune-v2.svg` · **click-through** · **current** |

Scrub on Enrich **v2** strip → panel **3 Filter + prune** → boxed **i** → hover → `v1` / `v2`.

## Evaluate v3 · Agency v1 → v2 (2026-07-23) · current step

**Strip unchanged:** Evaluate remains **v3** (step modified only).

**Why v2:** Parametric elimination on click-through: quiet text Re-analyze; one loud **Clear** (disco gate → off-call Enrich). Mute sparkles; lean company row; no dashed skeleton bars.

| | |
|--|--|
| Prior | `evaluate-v3-agency-v1` · `02-evaluate-v3-agency-v1.svg` · Enrich primary on dossier · **archived** |
| Current | `evaluate-v3-agency-v2` · `02-evaluate-v3-agency-v2.svg` · **click-through** · **current** |

Scrub on Evaluate **v3** strip → panel **5 Agency** → boxed **i** → hover → `v1` / `v2`.

## Create v1 · Campaigns + Campaign basics v1 → v2 (2026-07-23) · current steps

**Strip unchanged:** Create remains **v1** (steps modified only).

**Campaigns v2:** Honest empty body — no skeleton bars; Create is the only pitch.

**Campaign basics v2:** Autofocus field under New campaign (no redundant Name label); Cancel quiet text; Create loud.

| | |
|--|--|
| Prior | `create-campaigns-v1` · `create-basics-v1` · **archived** |
| Current | `create-campaigns-v2` · `create-basics-v2` · **click-through** · **current** |

Scrub on Create **v1** strip → panel **1 Campaigns** or **2 Campaign basics** → boxed **i**.

## Non-business Client Core · nb-convert v1 (2026-07-23) · current strip

**Why:** First strip for non-business client core: accept invite -> walk campaign -> first fund / become Business Client, so a Worker can begin and manage the campaign funded.

Strip panels (v1): **1 Accept invite** -> **2 Walk campaign** -> **3 First fund**.

| | |
|--|--|
| Current | `nb-convert` · `01-convert.svg` · **current** |

See [`WIREFLOWS-non-business-client-core.md`](./WIREFLOWS-non-business-client-core.md).

## Business Client Core · bc-join-run v1 (2026-07-23) · archived strip

**Why:** First strip for Tally business client core: join+fund -> progress notify -> respond -> stop/reclaim, so a Worker can begin and manage the campaign while the client stays informed.

Strip panels (v1): **1 Join + fund** -> **2 Progress notify** -> **3 Respond** -> **4 Stop / reclaim**.

| | |
|--|--|
| Prior | `bc-join-run` · `01-join-run.svg` · **archived** (2026-07-25) |

See [`WIREFLOWS-business-client-core.md`](./WIREFLOWS-business-client-core.md).

## Business Client Core · desk modules v1 (2026-07-25) · current strips

**Why:** Strip inventory lagged the living `BusinessClientDesk` CT (Campaigns / Meetings / Escrow). Redrew strips to match desk grammar; step surfaces point at click-through craft already planted.

| Strip | Asset | How beats |
|-------|-------|-----------|
| **Campaigns** `bc-campaigns` | `02-campaigns.svg` | Join+fund · progress on vessels |
| **Meetings** `bc-meetings` | `03-meetings.svg` | Progress notify · respond (sheet) |
| **Escrow** `bc-escrow` | `04-escrow.svg` | Stop / reclaim |

Steps (v1, `surface: "click-through"`): Campaigns → My campaigns · Meetings → Meeting history + Meeting sheet · Escrow → Held · Released · Reclaim.

See [`WIREFLOWS-business-client-core.md`](./WIREFLOWS-business-client-core.md).

## Persona click-throughs planted (2026-07-23) · surface: click-through

Each Core gets its **own** Register Click-through shell — not screens inside Operator.

| Graph | App | Path |
|-------|-----|------|
| Worker Core | `WorkerPrototypeApp` | Pick up → Begin → Manage → Track / notify |
| Non-business Client | `NonBusinessClientPrototypeApp` | Accept → Walk → First fund |
| Business Client | `BusinessClientPrototypeApp` | Join/fund → Notify → Respond → Stop/recollect |
| Operator Core | `OperatorPrototypeApp` | (unchanged) |

Strip SVGs unchanged (still v1). Living surface is click-through until a strip redraw + human approve for `/prototype` plant.

## World model · Worker Available admission (2026-07-23) · surface: click-through

**Why:** Align Worker click-through to V1 world admission — Available = `launched ∧ unclaimed` only. Dropped `funded` gate-as-badge on the queue row (funded is already true or the campaign would not appear).

| | |
|--|--|
| World | [`WORLD.md`](./WORLD.md) · `campaignWorld.ts` |
| App | `WorkerPrototypeApp` · subtitle `company · unclaimed` |

See law: [`docs/build-foundation/09-world-model.md`](../build-foundation/09-world-model.md).

## Conjure sits → inhabited click-throughs (2026-07-23) · surface: click-through

**Why:** Persona conjure method (not analyst+persona). Guest/BC sit validated externally; Operator/Worker conjured in parallel. Outcomes decomposed in [`OUTCOMES-FROM-SITS.md`](./OUTCOMES-FROM-SITS.md) + `outcomesRegistry.ts`. Click-throughs rebuilt to show forced objects: locked rules, escrow hold/release, meeting pre-call packet, booked/N, low-motion reclaim. Explicitly **no** Worker↔Client messaging.

| Persona | Click-through beats |
|---------|---------------------|
| Guest | Invite vessel → Walk/fluency → Escrow fund → Conversion receipt |
| BC | Campaigns → Fund → Meeting packet+receipt → Quality → Low-motion → Ledger |
| Worker | Available → Claim/Begin → Log meeting → Pipeline booked/N |
| Operator | Existing CT; captions/outcomes updated (dossier=pricing, fund→launch) |

Strip SVG assets unchanged (v1); living surface = click-through.

## Human approve → plant (2026-07-24) · surface: plant

**Approve:** All four Core click-throughs approved for plant (Operator, Guest→BC continuum, Worker).

**Plant home:** `/prototype` hub → `/prototype/operator` · `/prototype/guest` · `/prototype/client` · `/prototype/worker`

| Graph | Approved CT | Plant route |
|-------|-------------|-------------|
| Operator Core | `OperatorPrototypeApp` | `/prototype/operator` (`OperatorApp` — already denser plant; CT stays Register prune) |
| Guest Core | `GuestVessel` → desk | `/prototype/guest` (tokens + shadcn LoFiButton; fund → `/prototype/client`) |
| Business Client Core | `BusinessClientDesk` | `/prototype/client` |
| Worker Core | `WorkerPrototypeApp` | `/prototype/worker` |

Laws at plant: tokens + dark mode, HolonBoundary, shadcn controls, honor CT intent (`05` §11). Register click-through stays gray lo-fi. Evidence: [`design-corpus/`](./design-corpus/).
