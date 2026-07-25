# Design Craft — a synthesis for Omcoda

**Audience:** humans (you, future you, anyone carrying Omcoda’s build system).  
**Not:** an agent checklist. Those live in `00-rudiments.md` and the numbered laws.  
**Job:** one continuous reading of how we get from a rough idea to an **approved click-through** — the playable prototype that earns the right to be planted.

Length is intentional. Craft is not a slogan. It is a sequence of refusals that keep identity cheap and chrome honest until a human says the walkthrough is true enough to become product surface.

---

## I. What we mean by “design”

In Omcoda, design does not start at color, type, or a Figma frame. Design starts when **purpose has been forced into a lattice** and **the world has admitted who may see what** — and then, only then, when those truths must become a **core flow stack**: strips that name the beats, steps that revise presentation, click-through that you can actually walk.

Everything before that is identity work:

```text
Idea
  → World (who sits; what object; who admits)
  → Outcomes + so-that (capability that closes the lattice)
  → Obstacles / Can’ts (what the walkthrough must earn)
  → ★ Design ★  strips · steps · click-through
  → Human approve
  → Plant (tokens, dark mode, HolonBoundary, shadcn)
  → Flow when appearance is not enough
  → Ship
```

Confuse the layers and you get the failures this system was built to kill: painting a world gate as a badge, inventing a second persona because the registry has two Core rows, putting Enrich as the loud button on disco, writing “Same person” into the chrome because the methodology is proud of itself.

Design craft is the discipline of **translation** — not the invention of purpose, and not yet the production plant.

---

## II. Why a philosophical tone is earned

Most product systems optimize for velocity of pixels. Omcoda optimizes for **reversibility of identity**.

A gray lo-fi strip that is treated as final look burns a plant. A click-through that placates the registry shape (two stranger apps for Guest and Business Client) burns the sit. A Status essay on Escrow burns trust in the product’s mouth. Each of these is cheap to fix *before* approve and expensive after.

So the craft laws are not taste generators. They are **parametric elimination**: constraints that kill the 4 before anyone tries to polish an 8. Taste remains handmade for the last mile. The laws only promise that you will not spend that mile undoing begging chrome, narrator copy, and incongruent controls.

The Register design corpus exists because we lived those failures. Operator Enrich Filter+prune birthed border budget and quiet-until-invited. Guest narrator bans birthed facts-only copy. Business Client Request Operator (flash vs dialog) proved that congruence is not “similar vibe” — it is **same control, same behavior**. Worker Available saying “Claimed” proved that empty states must speak the module they inhabit. Evidence parents the rule. Rules without cards do not get promoted into law.

That is the ethic: **evidence → rule → law → always-on agent constraint**. Never the reverse.

---

## III. The pipeline in full glory

### 1. Idea

A sentence is enough to seed: who is hurt, what moves money or attention, what must become true. The brief (`PROJECT-BRIEF`) names product, role, one molecular outcome, starting surface. Without that stub, agents invent scope.

### 2. World model

Before outcomes expand personas, sit each living professional and write the **admission matrix** for the primary shared object (in Tally V1: Campaign). Who may see it in which state. What is never seen. World answers *what must be true for the next person to even see the object*. So-that answers *who benefits next*. Paint a gate the world already requires (`funded` on a Worker queue that only admits funded launches) and you have decorated a tautology. Law: `09-world-model.md`. Worked twin: `docs/register/WORLD.md` + `campaignWorld.ts`.

### 3. Outcomes and so-that

Every Core outcome is capability plus so-that to an entity already in the lattice. The chain must close — Worker’s so-that lands back on Business Client, not on “the system.” Law: `08-outcome-so-that.md`. Sits archive and outcomes tree hold the living statements. Obstacles (Can’ts) in code mark what the click-through must inhabit to count as earned.

### 4. How Analysis

Decomposition follows DNA and visibility: user language first, no process jargon before leaves. How trees are the testable spine of the molecular outcome. They are not wireframes. They are the question tree that strips and click-through must answer.

### 5. Blocks, strips, steps

Block-first. Strips are **positional prune tools** — choreography maps, versioned, with written *why*. Step versions revise presentation of the same beat; strip versions change identity. Living surface may be click-through before the SVG is redrawn; still log the step. Changelog is sacred because overwrite is amnesia. Law of progression: `05-register-augmented-build.md`. History: `CHANGELOG-wireframes.md` + registry WHY constants.

### 6. Click-through — the design desk

Here design craft is loudest. Gray lo-fi. One job per surface. Border budget. Secondary tools quiet until invited. Invite before form. Stack rhythm in sheets. Overlay inset once on the primitive. One loud action; no line-button peer row of filled and ghost. Empty honesty. Menus portal out of overflow clips. Copy speaks facts the persona must know to act — periods, not em-dash slogans; structure for money and rules; prose behind Terms. Module types rhyme across personas; jobs that differ (Operator enrich plant vs BC desk) stay different. Same named control behaves the same everywhere.

This is where the design corpus chronologies live: Operator → Guest → Business Client → Worker, card by card, from first playable walkthrough to the present ~8.9 pack. Grade means: playable, craft-law-aware, **not** plant-approved production UI.

### 7. Human approve

Serious identity changes are not prototype tweaks. A human walks the click-through against the sit and the Can’ts. Approve is the gate. Without it, plant is cosplay.

### 8. Plant

Future-home shell: tokens and dark mode from day one, HolonBoundary / live surface map, shadcn for interactive primitives, NotionIcon for chrome and lucide for controls. Parametric elimination still applies — plant is not permission to reintroduce placating chrome. Flow anchors and shipping (`04`) wait until appearance is not enough to prove the hop.

---

## IV. Two lenses that must never collapse

**Identity / purpose / world** — what must be true.  
**Chrome craft** — how the walkthrough looks and speaks once identity is set.

The design corpus documents only the second, and only the translation layer after Can’ts. When a CT change was *caused* by world correction (Worker funded badge), the corpus records the symptom and points at `09`. It does not rewrite world law as a caption guideline.

Likewise: Guest and Business Client may remain two Core outcomes in the registry (two so-that spines). Click-through must still play **one continuum** — same person after first fund. That intercept lives at interpretation → CT. Placating the registry with two stranger apps was a design failure, not an outcome failure. Living path: `GuestVessel` → `BusinessClientDesk`. Mid-generation `PayerContinuumPrototypeApp` is fossil evidence, not the living desk.

---

## V. The craft laws as one temperament

Read together, `06`, `07`, and `10` are one temperament with three mouths.

**Parametric elimination** says: stop begging. Every border, dashed CTA, always-on filter grid, and equal-weight button is asking for a favor. Prospect: only pitch what this beat needs. Everyone else waits behind a quiet door.

**Overlay escape** says: overflow is a containing block. Absolute menus inside rounded cards will clip. Portal and fix the anchor. Do not placate the clip by growing the card.

**UI copy** says: the product is not a narrator of its own methodology. Delete “Same person.” Delete workshop captions. Put hold, price, who counts, reclaim in fact cells. Merge Invite and Walk when they are one decision. Guest lands like the BC desk because congruence of **module type** is how a family of products feels intentional without cloning Operator’s plant into every persona.

Applied exemplars grade peer and agent work against these laws. The corpus chronologies prove where the laws were born. Gaps name what evidence already proved but law text has not yet absorbed — same-control behavior, timer beside a disabled reclaim, empty vocabulary that matches the module. Promote from gaps; do not invent law without cards.

---

## VI. What “approved click-through” is (and is not)

It **is**:

- A playable walk of Core beats for each persona shell that must exist  
- Congruent where module types match; divergent where jobs differ  
- Honest about empty, admission, and time gates  
- Versioned in Register when strip or step identity changed  
- Challenged against sits and Can’ts  
- Ready for a human to say: plant this identity on the future-home

It **is not**:

- Production visual language (tokens plant comes after)  
- A substitute for world or so-that  
- Permission to skip HolonBoundary, tokens, or shadcn on plant  
- An 10/10 handmade brand moment — 8.9 walkthrough means craft restraint is working; the last mile remains judgment

---

## VII. How an agent (or a human) should hold this

Start at rudiments. Obey sequence of truth. When inventing persona UI, touch world first. When writing Core outcomes, close so-that. When pruning large UI, block → strip → click-through → approve → plant. When shipping chrome, run parametric elimination and copy checklists. When a floating menu clips, portal. When the same control exists in two places, make behavior identical. When evidence of a new failure class accumulates, card it in the design corpus, update RULES, mark GAPS, then promote into law and always-on rules — evidence still parent.

Omcoda’s advantage is not that we move faster than a Figma-first team. It is that we refuse to forget *why* a surface changed, refuse to overwrite generations, and refuse to let chrome lie about the world.

---

## VIII. Components inventory — do we have it all?

| Layer | Portable law / pack | Product evidence (Tally) | Status |
|-------|---------------------|--------------------------|--------|
| Brief | `PROJECT-BRIEF` | filled per product | ready |
| Rudiments + sequence | `00` | — | ready |
| UI-first + How | `01` | `howAnalysis/` | ready |
| Surface registry | `02` | HolonBoundary / Console | ready |
| Visual system | `03` | tokens, icons | ready |
| Flows + ship | `04` | flow anchors when needed | ready |
| Register progression | `05` | strips, CT, approve, plant | ready |
| Parametric elimination | `06` + applied | Operator/Guest/BC/Worker CT | ready |
| Overlay escape | `07` | AnchoredPortal | ready |
| So-that lattice | `08` | OUTCOMES-TREE, registry | ready |
| World + admission | `09` | WORLD.md, campaignWorld | ready |
| UI copy + congruence | `10` | desk family CT | ready |
| Sits → interpretation | — | `persona-sits/` | ready |
| Design evidence → rules | — | `design-corpus/` | ready |
| Promote gaps (3) | — | GAPS.md | **open** — does not block this synthesis; blocks claiming law completeness |
| Human approve ritual | `05` | practice | ready as gate; ritual remains human |
| Plant + shadcn | `05` + shadcn skill | `/prototype` patterns | ready after approve |

**Verdict:** Yes. The components exist to describe — in full detail and precision — Omcoda’s path from rough idea to approved click-through. What remains open is promotion of three evidence-backed rules into `06`/`10`, and the eternal human act of walking the desk and saying approve. Neither gap prevents this tractus from being true as a system description.

---

## IX. Closing

Omcoda builds as if memory were a product feature. Strips remember. Changelogs remember. Sits remember who we claimed to serve. The design corpus remembers which chrome failed and which rule that failure earned. Craft laws remember how to refuse the 4.

From idea to approved click-through is not a waterfall of deliverables. It is a narrowing of lies: first the world stops lying about who sees what; then outcomes stop lying about who benefits; then the walkthrough stops lying with placating chrome and narrator copy; then a human stops the loop and allows the plant.

That is the design craft. Hold it as temperament, enforce it as sequence, extend it only with evidence.

---

## Related reading (law, not essay)

| Path | Role |
|------|------|
| [`00-rudiments.md`](./00-rudiments.md) | Checklist + sequence of truth |
| [`05-register-augmented-build.md`](./05-register-augmented-build.md) | Block → strip → CT → approve → plant |
| [`06-parametric-elimination.md`](./06-parametric-elimination.md) | Chrome elimination |
| [`07-overlay-escape.md`](./07-overlay-escape.md) | Portal menus |
| [`08-outcome-so-that.md`](./08-outcome-so-that.md) | Purpose lattice |
| [`09-world-model.md`](./09-world-model.md) | Admission before UI |
| [`10-ui-copy.md`](./10-ui-copy.md) | Facts, congruence |
| [`../register/design-corpus/`](../register/design-corpus/) | Evidence chronologies + RULES + GAPS |
| [`../register/persona-sits/`](../register/persona-sits/) | Sits + interpretation intercept |
