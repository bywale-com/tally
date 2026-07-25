# Outcomes discovery — congruence merge (2026-07-23)

**Method:** Four parallel persona sits (Operator · NB Guest · BC · Worker) against [`PERSONA-DISCOVERY-SEED.md`](./PERSONA-DISCOVERY-SEED.md). Parent merge below.  
**Lighthouse:** pay-per-booked-meeting + escrow hold; Operator-priced campaigns; clients never create campaigns.  
**Status:** Proposal for human approve — not yet written into `outcomesRegistry.ts`.

---

## Congruence verdict

| Check | Result |
|-------|--------|
| Shared object | **Priced meeting-campaign** + **escrow hold/release-per-meeting** + **meeting claim/log** — all four sits agree |
| Job theft | None — Operator prepares/launches; Guest converts; BC funds/controls money; Worker runs/logs meetings |
| So-that spine | Still closes: Op → client fund + Worker pickup → Worker notify/meeting → BC |
| Hollow kills | NB Invitation folded into Core; BC Access → **My Campaigns**; Dispute refined to **Meeting-Claim Response** with Worker as producer |
| Dual fund paths | NB first fund = conversion; BC join/fund = same escrow vessel (repeat invites allowed). Guest shell ends at conversion receipt |
| V1 cut | Clear enough to author next; Escrow.com API + multi-worker + deep dispute = later |

**One tension resolved in merge:** BC “Meeting-Claim Response” (approve/dispute before release) and Worker “Log a booked meeting” (so-that escrow releases) must be sequenced as: Worker logs → BC notified → approve (or auto-approve V1 stub) → release. V1 may **auto-approve** with dispute later, but the **objects** (meeting log + claim + ledger) must exist or click-throughs stay empty.

---

## Unified outcomes stack (proposed)

### Tally Operator

| Id (proposed) | Label | V1 | So-that / local |
|---------------|-------|----|-----------------|
| `operator-core` | Core Outcome | V1 | so that client join/fund + Worker pick up *(keep; value = pay-per-booked-meeting campaign)* |
| `operator-market-scan` | Market Scan | V1 | so that pre-screened company opens in Evaluate |
| `operator-evaluate-dossier` | Evaluate Dossier (pricing) | V1 | so that per-meeting price is defensible to fund |
| `operator-reanalyze` | Fast re-analyze / edit | V1 | LOCAL — on-call credibility |
| `operator-enrich-after-verdict` | Enrich after verdict | V1 | LOCAL — resource discipline |
| `operator-invite` | Invite NB / BC | V1 | so that they fund without creating the campaign |
| `operator-launch-after-fund` | Launch after fund | V1 | so that Worker only sees funded+launched |
| `operator-post-launch-glance` | Post-launch status glance | V1 | LOCAL — time next campaign |
| — | Post-sale Operator touch | later | deferred |

### Non-business Client (Guest)

| Id (proposed) | Label | V1 | So-that / local |
|---------------|-------|----|-----------------|
| `non-biz-core` | Core Outcome | V1 | so that Worker can begin/manage *(absorbs Invitation)* |
| `non-biz-escrow-trust` | Escrow trust (terms before fund) | V1 | LOCAL |
| `non-biz-decline` | Decline / lapse | later | LOCAL |
| ~~`non-biz-invitation`~~ | *(fold into Core)* | — | killed as hollow peer |

### Tally Business Client

| Id (proposed) | Label | V1 | So-that / local |
|---------------|-------|----|-----------------|
| `client-campaigns` | My Campaigns | V1 | LOCAL — replaces Access |
| `client-core` | Core Outcome *(refined)* | V1 | so that Worker begin/manage; progress = **meetings booked / N**; recollect = **held only** |
| `client-escrow-ledger` | Escrow Hold & Release Ledger | V1 | LOCAL — held vs released per meeting |
| `client-meeting-claim` | Meeting-Claim Response | V1* | so that release only after verify (*V1 may stub auto-approve*) |
| ~~`client-access`~~ | *(killed)* | — | hollow |
| ~~`client-dispute-eligibility`~~ | *(replaced by meeting-claim)* | — | producer = Worker |

### Tally Worker

| Id (proposed) | Label | V1 | So-that / local |
|---------------|-------|----|-----------------|
| `worker-core` | Core Outcome | V1 | so that BC notified of progress |
| `worker-log-meeting` | Log a booked meeting | V1 | so that escrow can release one meeting + BC notified |
| `worker-pipeline` | Claimed pipeline glance | V1 | LOCAL |
| `worker-react-stop` | React to BC stop/reclaim | V1 | LOCAL |
| `worker-dispute-visibility` | Held-meeting dispute visibility | later | LOCAL |
| — | Multi-worker onboarding | later | not Worker’s outcome |

### Tally Agent

Deferred — crystallizes when re-analyze / dossier math bottoms out at “agent does X.”

---

## Forced shared objects (why click-throughs felt empty)

Without these, persona UIs stay slogan-shaped:

1. **Meeting record** (Worker logs; BC sees/claims)  
2. **Escrow ledger** (held vs released; per meeting)  
3. **Progress as booked / N** (not generic %)  
4. **Dossier as pricing basis** (Operator)  
5. **Launch-after-fund gate** (Worker never sees funded-only)  
6. **Conversion receipt** (Guest → BC)  
7. **Escrow terms** visible before first fund  

---

## V1 product cut (from this discovery)

**In:** Operator spine through launch · Guest convert with escrow terms · BC fund + meeting progress + held/recollect · seeded Worker pickup + log meeting + notify · post-launch Operator glance  

**Stub OK:** auto-approve meeting claims; Escrow.com as labeled stand-in; single Worker  

**Out:** Worker marketplace · full Escrow dispute UI · client-created campaigns · deep pricing math · Agent plant  

---

## Next (after you approve)

1. Light `WORLD.md` refresh (value unit + escrow + meeting object)  
2. Write proposed ids into `outcomesRegistry.ts` + `OUTCOMES-TREE.md`  
3. Only then deepen click-throughs against this stack (meeting log / ledger / booked-N)  

Raw sits archived conceptually in agent transcripts; seed: [`PERSONA-DISCOVERY-SEED.md`](./PERSONA-DISCOVERY-SEED.md).
