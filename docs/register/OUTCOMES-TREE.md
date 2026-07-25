# Tally Register — Outcomes tree

Snapshot of the current entity outcomes and first How cuts.  
Source of truth in app: `apps/tally/src/app/register/outcomes/` + `howAnalysis/`.

**Funnel order:** Operator prepares → Non-business converts → Business Client joins/funds → **Worker runs** → Agent (later).

**World model (admission):** [`WORLD.md`](./WORLD.md) — persona sits + Campaign matrix. Law: [`docs/build-foundation/09-world-model.md`](../build-foundation/09-world-model.md).

**Sales-led note:** Business Clients do **not** create campaigns. The Operator creates, evaluates, enriches, and invites. Customers join/fund invited campaigns. Neither the Operator nor the Business Client **runs** the campaign — the Tally Worker does.

**Operator note:** One entity spanning pre-sale and post-sale. V1 = human stand-in for later automation. Prepares and launches; does not run.

**Three-call context (not separate product outcomes):**
- Cold call — books the appointment only  
- Disco call — create + **evaluate emulation** (pre-screened company) + refine; **no enrich on call**  
- Off call — **enrich** firm/TAM list (CRM/Apollo lane)  
- Demo / sales — firm list remove/add → invite non-business → first fund → **launch**  

**Wireframes:** [`WIREFLOWS-operator-core.md`](./WIREFLOWS-operator-core.md) · [`WIREFLOWS-non-business-client-core.md`](./WIREFLOWS-non-business-client-core.md) · [`WIREFLOWS-business-client-core.md`](./WIREFLOWS-business-client-core.md) · [`WIREFLOWS-worker-core.md`](./WIREFLOWS-worker-core.md) · lo-fi SVGs in [`wireframes/`](./wireframes/)

---

## V1 so-that spine

Every Core outcome closes back into the lattice: the entity's capability lands a **so that** on the next entity in the funnel, until the loop closes on Business Client. See the law: [`docs/build-foundation/08-outcome-so-that.md`](../build-foundation/08-outcome-so-that.md).

| Entity | Core capability | So that |
|--------|------------------|---------|
| **Tally Operator** | create, evaluate, enrich, invite non-business, invite business, launch | a prepared campaign exists for a client to join/fund and a **Worker** to pick up |
| **Non-business Client** | accept invite, walk campaign, first fund → become Business Client | a **Worker** can begin and manage the campaign I funded |
| **Tally Business Client** | join/fund invited campaign; notified of progress; respond; stop/reclaim funds | a **Worker** can begin and manage the campaign (notify/control stay in the statement; the primary so-that is Worker pickup) |
| **Tally Worker** *(new)* | pick up launched campaign, begin, manage, track progress | **business clients are notified of progress** — closes the loop |

The Worker's so-that lands back on the Business Client, who is already in the lattice — that closure is what makes this a **spine**, not a dangling chain.

---

## 1. Tally Operator

> One Operator — pre-sale and post-sale. V1 = human stand-in for later automation. Prepares and launches — does not run the campaign; the Tally Worker does.

### Outcome 0 — Core Outcome *(How graph to leaves + wireframes)*

**Statement:**  
As a Tally Operator, I can create, evaluate, enrich, invite a non-business client, invite a business client, and launch a campaign — so that a client can join and fund it and a Tally Worker can pick it up.

**How tree (to leaves):**

```text
[Outcome]
As a Tally Operator, I can create, evaluate, enrich, invite a non-business client,
invite a business client, and launch a campaign — so that a client can join and
fund it and a Tally Worker can pick it up.
│
└─ How? (fat clarity — disco / off-call / demo choreography)
   │
   ├─ Create (disco) ── flow anchor
   │  ├─ leaf: Create campaign control
   │  ├─ leaf: Campaign basics (name / purpose)
   │  └─ leaf: Confirm create → campaign exists
   │
   ├─ Evaluate (disco, emulation) ── flow anchor
   │  ├─ leaf: Pick pre-screened company by name
   │  ├─ leaf: Run evaluate sequence (skeleton / known analysis)
   │  └─ leaf: Verdict summary → qualify & refine (no enrich)
   │
   ├─ Enrich (off call) ── flow anchor
   │  ├─ leaf: Enrich control
   │  ├─ leaf: Build firm/TAM list → list/CRM/Apollo lane
   │  └─ leaf: Firm list ready for demo remove/add
   │
   ├─ Invite non-business (demo / first sale) ── flow anchor
   │  ├─ leaf: Send invite
   │  └─ leaf: Accept + first fund unlock launch (client side)
   │
   ├─ Invite business (later, same mechanism) ── flow anchor
   │  └─ leaf: Same Invite control + business client picker
   │
   └─ Launch (after first fund) ── flow anchor
      └─ leaf: Move to running → handoff to Tally Worker (auto or one confirm)
```

### Outcome 1 — Market Scan *(stub — no How graph yet)*

**Statement:**  
As the Tally Operator, I land in Tally, set criteria and parameters for a market scan, run it (and pause / restart / schedule / modulate as needed), then view, filter, sort, organize, and export the results — selecting the data I need — so I can find eligible companies for outreach. The scanner has a home in the app.

*Note: Former Operator core. Pre-screens companies that feed evaluate's known-company picker.*

---

## 2. Non-business Client

> Prospect path — invited before first fund. Becomes Business Client on first escrow fund.

### Outcome 0 — Invitation *(stub — no How graph yet)*

**Statement:**  
As a non-business client, I can receive and accept an invitation into a campaign prepared for me.

### Outcome 1 — Core Outcome *(How graph authored)*

**Statement:**  
As a non-business client, I can accept an invitation into a campaign prepared for me, walk through that campaign, and complete the first fund to become a Tally business client — so that a Tally Worker can begin and manage the campaign I funded.

**How tree (first cut):**

```text
[Outcome]
As a non-business client, I can accept an invitation into a campaign prepared for me,
walk through that campaign, and complete the first fund to become a Tally business
client — so that a Tally Worker can begin and manage the campaign I funded.
│
└─ How? (mirrors outcome)
   Clarity: I accept the Operator's invitation into a campaign prepared for me,
   walk through that campaign, and complete the first fund — and that first fund
   makes me a Tally business client whose campaign a Worker can pick up.
   │
   ├─ How do I accept the Operator's invitation into a campaign prepared for me?
   │  → I receive the invitation, open it, and accept so I can enter the campaign
   │    prepared for me.
   │
   ├─ How do I walk through that campaign?
   │  → With the Operator, I walk through the prepared campaign — seeing how it's
   │    set up for me — before I fund. (Sales call)
   │
   └─ How do I complete the first fund and become a Tally business client?
      → I complete the first escrow fund on the prepared campaign, and that converts
        me from non-business client to Tally business client — so a Worker can begin
        and manage the campaign I funded.
```

*Wireframes: [`WIREFLOWS-non-business-client-core.md`](./WIREFLOWS-non-business-client-core.md) · lo-fi SVGs in [`wireframes/`](./wireframes/) (`nb-01-convert.svg`).*

---

## 3. Tally Business Client

> Does not create or run campaigns — joins and funds campaigns the Operator invited them into; a Tally Worker begins and manages the run.

### Outcome 0 — Access *(stub — no How graph yet)*

**Statement:**  
As a Tally customer, I can access the platform.

### Outcome 1 — Core Outcome *(How graph authored)*

**Statement:**  
As a Tally customer, I can join and fund an invited campaign, be notified of its progress, respond to the notification, and stop the campaign or recollect unused funds — so that a Tally Worker can begin and manage the campaign while I stay informed.

**How tree (first cut):**

```text
[Outcome]
As a Tally customer, I can join and fund an invited campaign, be notified of its progress,
respond to the notification, and stop the campaign or recollect unused funds — so that a
Tally Worker can begin and manage the campaign while I stay informed.
│
└─ How? (mirrors outcome)
   Clarity: In Tally I join and fund an invited campaign that was prepared for me,
   get notified of its progress as a Tally Worker runs it, respond to the notification,
   and stop the campaign or recollect unused funds when I choose.
   │
   ├─ How do I join and fund an invited campaign that was prepared for me?
   │  → I open the invitation to a campaign the Operator prepared, join it, and fund it
   │    so a Tally Worker can pick it up and run it for me. (I did not create it.)
   │
   ├─ How do I get notified of its progress?
   │  → While the Tally Worker runs the campaign, Tally notifies me about its progress
   │    so I can see how it's doing.
   │
   ├─ How do I respond to the notification?
   │  → When a progress notification arrives, I open it and respond — taking the action
   │    the notification asks for or that I choose.
   │
   └─ How do I stop the campaign or recollect unused funds when I choose?
      → When I want to end or reclaim, I stop the campaign and/or recollect any unused
        funds still on it.
```

*Wireframes: [`WIREFLOWS-business-client-core.md`](./WIREFLOWS-business-client-core.md) · lo-fi SVGs in [`wireframes/`](./wireframes/) (`02-campaigns.svg` · `03-meetings.svg` · `04-escrow.svg`; `01-join-run.svg` archived).*

### Outcome 2 — Dispute Eligibility *(stub — no How graph yet)*

**Statement:**  
As a Tally customer, I can respond to a held-meeting claim — approve or dispute its eligibility.

---

## 4. Tally Worker *(new)*

> Execution entity — picks up a launched campaign and runs it. V1 = human/ops stand-in; automates alongside the Agent in v2.

### Outcome 0 — Core Outcome *(How graph stubbed — owned separately)*

**Statement:**  
As a Tally Worker, I can pick up a launched campaign, begin it, manage it, and track its progress — so that business clients are notified of that progress.

*Note: How graph `worker-core-outcome` is authored in `apps/tally/src/app/register/howAnalysis/workerCoreOutcome.ts`. This so-that closes the loop — it lands back on the Business Client, who is already in the lattice. Strips: [`WIREFLOWS-worker-core.md`](./WIREFLOWS-worker-core.md).*

---

## 5. Tally Agent

> Agentic assistant — **v2**. Outcomes crystallize when Operator, Client, or Worker How trees bottom out at "the agent does X."

*(No outcomes authored yet.)*

---

## Cross-entity map (quick)

| Step | Who | What |
|------|-----|------|
| Market scan / list | Operator | Pre-screen companies (feeds evaluate picker) |
| Create | Operator (disco) | Thin campaign vessel |
| Evaluate | Operator (disco) | Emulation + verdict; refine with prospect |
| Enrich | Operator (off call) | Firm/TAM list → CRM/Apollo lane |
| Demo list walk | Operator + prospect | Remove/add firms |
| Invite + fund | Operator invite → Non-business accept/fund | First sale |
| Launch | Coupled to first fund | Campaign ready → handed to Worker |
| Pick up + run | Tally Worker | Begin, manage, track progress |
| Invite existing client | Operator → Business Client | Same invite mechanism later |
| Join/fund invited · notify · respond · stop | Business Client | Post-sale |
| Notify of progress | Worker → Business Client | Closes the loop |
| Dispute held-meeting | Business Client | Eligibility |
| "Agent does X" | Agent (v2) | Deferred |

---

## Open items

1. ~~Launch timing~~ — After first fund (coupled V1).  
2. ~~Status flip~~ — First escrow fund = Non-business → Business Client.  
3. Cold call — Outside product How trees for now.  
4. Post-sale Operator (notify, dispute) — Still deferred; may fold into Worker.  
5. Non-business Invitation vs Core overlap — optional fold later.  
6. **Wireframe review** — all four Core outcomes now have Register strips: `WIREFLOWS-operator-core.md`, `WIREFLOWS-non-business-client-core.md`, `WIREFLOWS-business-client-core.md`, `WIREFLOWS-worker-core.md`. Only Operator Core has a click-through plant so far.  
7. **Worker How graph** — Core outcome registered (`worker-core-outcome`); How tree to be authored.
