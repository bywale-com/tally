# UI copy — facts only

**Thesis:** Product chrome speaks **what the persona must know to act**. Nothing else.

Companion: [`06-parametric-elimination.md`](./06-parametric-elimination.md) (quiet until invited).  
This law is about **words**, not layout.  
Evidence chronologies: [`docs/register/design-corpus/`](../register/design-corpus/) (esp. Guest/BC cards → `RULES.md`).

---

## 1. Facts, not narrator

Write as the product stating status and consequence. Do **not** narrate the design, the sit, or the methodology.

| Fail (ad-lib / narrator) | Pass (fact) |
|--------------------------|-------------|
| “Same person.” | (delete — not actionable) |
| “You’re a Business Client” | “Business Client” |
| “Clean lapse. Not a mid-walk walk-away.” | “Invite ends. Terms stay the same if re-invited.” |
| “No Worker chat.” as a slogan on receipt | Omit, or state once where the constraint matters (e.g. terms) |
| “I’m standing behind that size — not a house rate on every logo.” | “Price stands behind that size, not a house rate.” |

**Test:** If removing the sentence does not change what the user can do or decide, delete it.

---

## 2. Punctuation budget

UI captions and status lines prefer **periods** and **commas**.

| Avoid in chrome | Prefer |
|-----------------|--------|
| Em dashes (`—`) stitching slogans | Period. Second sentence. |
| Middle dots (`·`) as default separators | Comma, period, or a new line |
| Hyphen piles (`Accept · release`) | Plain words (`Accept release`) |

Em dash / en dash are fine inside **long body prose** (contracts, Operator blurb) when a clause needs them. They are **not** default caption glue.

Empty / missing values may still use `—` as a placeholder glyph (tables). That is not caption style.

---

## 3. Caption = one job

Title names the surface. Caption is **one short fact** (who, money, state). Not a tagline, not a workshop note, not “so that” prose.

| Fail | Pass |
|------|------|
| “Held until qualified meetings — or reclaim unspent” | “Held until qualified meetings. Unspent can be reclaimed.” |
| “Honesty + decision rights — not activity counts” | “Honesty and decision rights” |
| “packet + escrow fate” | time only, or omit |

---

## 4. Persona ear

Copy is for the **living persona** on that screen (Guest, BC, Worker, Operator). Internal Register jargon (sit, continuum, strip, Can’t, lo-fi) never appears in product chrome.

---

## 5. UI presents; copy contracts

Structured facts (hold, $/meeting, who counts, reclaim) belong in **layout** (labels + values, rows, grids). Long paragraphs on the landing beat are visual ad-libbing.

| Fail | Pass |
|------|------|
| Essay on invite: “$2000 sits with an escrow-style…” | Fact grid: Hold / Per meeting / Who counts / Reclaim |
| “Walk this with Operator” (opaque metaphor) | Clear act: **Fund**, **Review terms** |
| Invite stage + Walk stage as two pages of the same decision | One landing beat; price prose behind **Why this price** / **Terms** |

**Copy stays** for: contractual terms sheets, optional Operator rationale behind a door, short status captions.

---

## 6. No visual ad-libbing (stage twin)

Do not invent a second stage that restates the first with different prose. If Invite and Walk show the same vessel decision, **merge**. Guest landing matches the BC desk shell (same nav, same campaign row grammar).

---

## 7. Design congruence (family, not clones)

Assume each click-through can be strong alone. Congruence means **same module types rhyme** across personas — not that every persona has Campaigns/Meetings/Escrow.

| Module type | Shared grammar |
|-------------|----------------|
| Desk shell | Mark + persona label + **text** nav (no icon squares); main ~`max-w-2xl` |
| Register eval strip | `EVAL` + quiet pills (block fill). Product desks (BC) omit it |
| List / vessel row | Hairline `border-b`; name + quiet status; ink primary / quiet secondary / **More** menu |
| Money / rules | Fact cells (11px label + medium value), not essay paragraphs |
| Empty | `Empty` component |
| Depth | Sheet / dropdown — not a second full page for the same decision |

**Balance:** Operator plant (disco, enrich, dossier) stays denser — different job density. Worker stays fewer nav items. Do **not** force Escrow onto Worker. Do **not** force Operator list chrome into the BC cardless panel.

**When something looks “too different”:** ask if it is the *same module type* (list row, empty, fact, secondary menu). If yes → rhyme. If it is a different job (enrich table) → leave.

---

## Agent checklist

1. Can I delete this sentence without changing the decision? → delete  
2. Is this a caption using `—` or `·` as decoration? → rewrite with period/comma  
3. Am I explaining the product like a pitch deck? → cut; put facts in UI structure  
4. Would the persona say this out loud at their desk? → if no, rewrite  
5. Is long prose doing the job of labels + values? → structure it; leave prose for Terms  
6. Are two stages the same decision with different words? → merge  
7. Same module type as Guest/BC desk but totally different chrome? → rhyme — don’t force alien modules  

---

## Anti-patterns

- “Same person / same continuum / still you” meta  
- Clever contrast clauses that teach methodology (“not X, not Y”) in every caption  
- Em-dash slogan captions  
- Middle-dot metric essays in list rows (put detail behind a door)  
- Opaque CTAs (“Walk this with…”) when Fund / Review terms is the act  
- Essay landings; duplicate Invite/Walk stages  
- Guest landing that doesn’t share the BC desk shell  
- Persona desks with icon-square nav + You footer when Guest/BC use text nav  
- Bordered cards on every list beat when the family uses hairline rows  

---

## Agent handoff line

> Follow `docs/build-foundation/10-ui-copy.md`. Facts only. UI presents structure; copy for terms. Congruence = same module types rhyme across personas — don’t force alien modules. Guest/BC desk is the family reference.
