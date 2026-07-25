# Tally V1 — World model

**Law:** [`docs/build-foundation/09-world-model.md`](../build-foundation/09-world-model.md)  
**Machine twin:** `apps/tally/src/app/register/world/campaignWorld.ts`  
**Outcomes spine:** [`OUTCOMES-TREE.md`](./OUTCOMES-TREE.md)

**World sentence:** Tally is a **pay-per-booked-meeting** sales arbitrage loop: an Operator prepares and prices a campaign vessel, a prospect/client funds it into **escrow hold** (release per booked meeting), a Worker runs it and logs meetings, and the client stays informed/in control of held money — preparation, capital, labor, and accountability in one closed ecosystem (Agent deferred; Escrow.com for disputes later).

If this file grows past ~two pages, we overbuilt.

**Discovery:** Conjure sits + outcomes → [`OUTCOMES-FROM-SITS.md`](./OUTCOMES-FROM-SITS.md).

---

## Persona sits

### Tally Operator

| | |
|--|--|
| **Why exist** | Without them, no prepared campaign enters the world — nothing to fund or run. |
| **Served how** | Tools to create, evaluate, enrich, invite, launch. |
| **Purpose they serve** | Client can join/fund; Worker can pick up (so-that). |
| **Primary object** | Campaign (and firm list while enriching). |
| **Admit iff** | They create it — all pre-launch states; post-launch they still see status. |
| **Never see** | Worker outreach grind as *their* job; client fund wallet as *their* control. |
| **Natural needs (V1)** | Campaigns list, create/evaluate/enrich, invite, launch after fund. |

### Non-business Client (Guest)

| | |
|--|--|
| **Why exist** | First-sale path — invited before trust/fund; conversion into Business Client. |
| **Served how** | Operator-prepared invite + walkthrough + first-fund door. |
| **Purpose they serve** | Worker can begin on the campaign they funded (so-that). |
| **Primary object** | Invited Campaign (guest shell — not Operator chrome). |
| **Admit iff** | `invited` (to them); first fund moves them to Business Client. |
| **Never see** | Create / evaluate / enrich / Worker queue / other clients' campaigns. |
| **Natural needs (V1)** | Accept invite, walk campaign, first fund. |

### Tally Business Client

| | |
|--|--|
| **Why exist** | Capital + ongoing control — fund, stay informed, stop/reclaim. |
| **Served how** | Join/fund invited campaigns; progress from Worker; stop/recollect. |
| **Purpose they serve** | Worker can begin/manage while client stays informed (so-that). |
| **Primary object** | Funded / active Campaign + progress notifications. |
| **Admit iff** | Invited to them; after fund: active + notify/respond/stop. |
| **Never see** | Operator prep tools; Worker's available queue; uninvited campaigns. |
| **Natural needs (V1)** | Join/fund, notifications, respond, stop/recollect. |

### Tally Worker

| | |
|--|--|
| **Why exist** | Execution — Operator must not run the campaign; labor closes the loop. |
| **Served how** | Queue of launched campaigns to pick up, begin, manage, track. |
| **Purpose they serve** | Business clients are notified of progress (so-that — closes spine). |
| **Primary object** | Launched Campaign (Available / Active / Progress). |
| **Admit iff** | `launched` ∧ unclaimed (Available); claimed/running (Active). |
| **Never see** | Unfunded or unlaunched campaigns; create/evaluate/enrich/invite. |
| **Natural needs (V1)** | Available queue, pick up, begin, manage, track/notify. |

**Callout:** Worker Available = `launched ∧ unclaimed` only. **Funded is not Worker chrome** — it is already true or the row would not exist.

### Tally Agent *(deferred)*

v2 stand-in where Operator/Client How bottoms out at “the agent does X.” Not in the living admission matrix yet.

---

## Campaign admission matrix

Cells: **V** = in view · **—** = not in view · **T** = owns this transition (into this state or the named action).

| State | Meaning | Operator | NB Guest | BC | Worker |
|-------|---------|----------|---------|----|--------|
| `draft` | Created, not ready to invite | V · T create | — | — | — |
| `ready` | Enriched / inviteable | V · T invite | — | — | — |
| `invited` | Invite sent to prospect or BC | V | V · T accept | V · T join | — |
| `funded` | Escrow funded; not yet launched | V · T launch | — (became BC) | V | — |
| `launched` | Funded + Operator launch; waiting Worker | V | — | V | V · T pick up (if unclaimed) |
| `running` | Worker begun / managing | V | — | V · notify | V · T begin/manage/track |
| `stopped` | BC stopped the run | V | — | V · T stop | V |
| `reclaimed` | BC recollected unused funds | V | — | V · T reclaim | V |

**Handoff spine (transitions that must stay ordered):**  
`draft` → `ready` → `invited` → `funded` → `launched` → `running` (BC may `stopped` / `reclaimed` from running).

**Ritual question:** Would Worker see an invited-but-unfunded campaign? → matrix cell **—**.  
**Gate vs decision:** `unclaimed` is Worker decision chrome; `funded` is not.
