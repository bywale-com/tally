# Prototype Carbon — re-architecture note

**Surface:** `/prototype-carbon` (+ `/operator`, `/guest`, `/client`, `/worker`)  
**Isolation:** Separate HTML document (`prototype-carbon.html` → `main-carbon.tsx`). Main SPA must **never** import `plant-carbon` — Carbon global CSS poisons Plant/Register.  
**Independent of:** `/prototype` (separate document; no shared CSS bundle)  
**Register anchors:** [`docs/register/WORLD.md`](../../../docs/register/WORLD.md), [`docs/register/OUTCOMES-TREE.md`](../../../docs/register/OUTCOMES-TREE.md)  
**Composition skill:** `omcoda-hq` → `carbon-composition-patterns`  
**Tokens skill:** `carbon-semantic-tokens`  
**Orchestrator:** `omcoda-design-orchestrator`

## Whole-product frame

Carbon UI Shell (Header + SideNav + Content) is shared across all four personas with one theme pair (**g10** ↔ **g100**). Persona identity is a header chip + SideNav item set — not four different chrome languages.

| Persona | SideNav (peer workspaces) | Primary object | Critical path (Register) |
| --- | --- | --- | --- |
| Operator | Campaigns · Meetings · Messages · Operations | Campaign (+ firm list) | Create → Evaluate → Enrich → Invite → Launch |
| Guest | Campaigns · Meetings · Escrow | Invited vessel | Accept → Walk → First fund → BC |
| Business Client | Campaigns · Meetings · Escrow | Funded/active vessel | Join/fund · notify · respond · stop/reclaim |
| Worker | Available · Active · Pipeline | Launched vessel | Pick up · begin · manage · track |

Guest and BC **rhyme** on the same three nav labels (WORLD + UI copy congruence). Meetings/Escrow stay honest empties pre-fund.

## Consolidation / splits (composition-driven)

| Change | Why (Carbon) | Register link |
| --- | --- | --- |
| Living indexes → **DataTable** | Table-first density for multi-entity desks | Campaign / vessel / meeting / firm lists (Furnish indexes) |
| Create → **Modal** | Short mutation; not a full page | Operator create-basics leaf |
| Evaluate / dossier / enrich → **in-Content page flows** | Heavy work stays under shell; enrich = second DataTable | Evaluate + Enrich How anchors |
| Invite / fund / stop / dispute / reclaim → **Modal** (danger where destructive) | Invite-before-form; one loud action | Guest fund; BC respond/stop/reclaim Can'ts |
| Detail facts → **StructuredList** | Layered facts without card elevation | Pricing / rules / booked-N glance |
| Stub peer nav (Operator Meetings/Messages/Operations) | SideNav expresses Can't/Furnish shell peers without inventing Function | Operator shell Furnish |
| Worker status column = **Unclaimed / Claimed** only | Admission gates (`funded`, `launched`) never painted as decision chrome | WORLD Worker callout |
| Independent `plant-carbon/world/admission.ts` + `data/seed.ts` | Zero shared runtime with `/prototype` | Same WORLD matrix substance |

## Explicit remaps (inhabit / holon)

| Former lo-fi / plant region | Carbon region | Reason |
| --- | --- | --- |
| `opDesk/DeskShell` sidebar | UI Shell SideNav | Carbon composition default |
| Board/Activity-bar density | Consolidated into SideNav + Content (no VS Code board synthesize) | Composition ambiguity → chose matched shell |
| Guest vessel card land | `Tile` + StructuredList on Campaigns | Same IA as BC; denser Carbon tile |
| Sheet doors (details/firms/…) | Row open → StructuredList detail; OverflowMenu reserved for Operator | Tearsheet/SidePanel package boundary — deferred to Modal/page |
| Plant theme (`tally-prototype-theme`) | `tally-prototype-carbon-theme` + Carbon `Theme` | Separate storage; no shared state |

HolonBoundary / Console map is **not** wired in this pass (gap — see MATCH-REPORT). Meaning of CT surfaces is preserved via route + view ids aligned to Register leaves.

## What was not invented

No new Function: Market Scan remains stub; Agent deferred; no Worker↔Client chat; no Operator escrow control; no Guest create/evaluate/enrich.
