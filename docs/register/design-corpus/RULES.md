# Design corpus — rule ledger

Settled rules born from evidence cards. Each rule: one imperative statement, evidence ids, law citation or `MISSING`.

Card bodies: [`personas/`](./personas/). Method: [`METHOD.md`](./METHOD.md). Gaps / promote: [`GAPS.md`](./GAPS.md).

---

## A. Parametric elimination (chrome)

### r-one-job

**Rule:** One job per surface; second job goes behind a door.

| | |
|--|--|
| Evidence | `op-enrich-filter-prune-v2`, `op-evaluate-v2-to-v3`, `guest-vessel-contract-craft`, `bc-loud-campaigns-calm` |
| Law | `codified` → [`06`](../../build-foundation/06-parametric-elimination.md) §1 |

### r-border-budget

**Rule:** Borders are a spend. Remove boxes/dashes that do not serve the job. No dashed full-width beg strips.

| | |
|--|--|
| Evidence | `op-enrich-filter-prune-v2`, `guest-vessel-contract-craft`, `op-create-empty-and-basics-v2` |
| Law | `codified` → `06` §2 |

### r-quiet-until-invited

**Rule:** Secondary tools start as text/icon; shell only after intent.

| | |
|--|--|
| Evidence | `op-enrich-filter-prune-v2`, `op-agency-v2`, `bc-loud-campaigns-calm` (More menu) |
| Law | `codified` → `06` §3 |

### r-invite-before-form

**Rule:** Consequence UI (forms, reason pickers) stays hidden until the invite control is clicked; reset on close/switch object.

| | |
|--|--|
| Evidence | `bc-meeting-invite-before-form` |
| Law | `codified` → `06` §3a |

### r-stack-rhythm

**Rule:** In tall sheets, cluster actions; do not park mid-stack controls in an `mt-auto` void.

| | |
|--|--|
| Evidence | `bc-meeting-invite-before-form` |
| Law | `codified` → `06` §3b |

### r-overlay-inset

**Rule:** Drawer/sheet shell owns one pane inset; header/body share it.

| | |
|--|--|
| Evidence | `bc-meeting-invite-before-form` (SheetContent `p-6`) |
| Law | `codified` → `06` §3c |

### r-one-loud-action

**Rule:** At most one loud action per beat; Cancel / secondary stay quiet text.

| | |
|--|--|
| Evidence | `op-agency-v2`, `op-create-empty-and-basics-v2`, `guest-vessel-contract-craft` |
| Law | `codified` → `06` §4 |

### r-line-button

**Rule:** Do not put filled and quiet text controls on the same horizontal action row as peers.

| | |
|--|--|
| Evidence | `bc-escrow-status-and-reclaim` |
| Law | `codified` → `06` §4 Line-button problem |

### r-no-placate-empty

**Rule:** Empty and loading must not invent competing chrome (skeleton bars, fake rows, spinner theater).

| | |
|--|--|
| Evidence | `op-create-empty-and-basics-v2`, `op-enrich-v1-to-v2`, `op-agency-v2` |
| Law | `codified` → `06` §5 |

---

## B. Overlay escape

### r-overlay-escape

**Rule:** Menus/popovers that must leave a clipped pane render in a portal with fixed anchoring.

| | |
|--|--|
| Evidence | `op-overlay-escape` |
| Law | `codified` → [`07`](../../build-foundation/07-overlay-escape.md) |

---

## C. UI copy and congruence

### r-facts-not-narrator

**Rule:** Chrome states what the persona must know to act. Delete methodology, sit meta, and non-actionable slogans.

| | |
|--|--|
| Evidence | `guest-narrator-ban`, `op-copy-hyphen-seed`, `bc-escrow-status-and-reclaim` (Status essay) |
| Law | `codified` → [`10`](../../build-foundation/10-ui-copy.md) §1 |

### r-punctuation-budget

**Rule:** Captions prefer periods and commas; em dashes and middle dots are not default caption glue.

| | |
|--|--|
| Evidence | `guest-narrator-ban`, `op-copy-hyphen-seed`, `bc-loud-campaigns-calm` |
| Law | `codified` → `10` §2 |

### r-ui-presents-copy-contracts

**Rule:** Structured facts live in layout (labels + values). Long paragraphs leave the landing beat for Terms / doors.

| | |
|--|--|
| Evidence | `guest-landing-equals-bc-desk`, `guest-vessel-contract-craft` |
| Law | `codified` → `10` §5 |

### r-no-stage-twin

**Rule:** Do not invent a second stage that restates the same decision with different prose. Merge.

| | |
|--|--|
| Evidence | `guest-landing-equals-bc-desk` (invite+walk merge) |
| Law | `codified` → `10` §6 |

### r-desk-shell-congruence

**Rule:** Guest landing matches BC desk shell grammar (mark, text nav, max-w-2xl, fact cells, More). Worker rhymes on shared module types; does not inherit Escrow.

| | |
|--|--|
| Evidence | `guest-landing-equals-bc-desk`, `worker-chrome-desk-congruence` |
| Law | `codified` → `10` §7 |

### r-module-congruence

**Rule:** Same module types rhyme across personas (list row, Empty, Fact, More, eval strip). Different jobs (Operator enrich) stay different. Do not force alien modules.

| | |
|--|--|
| Evidence | `op-persona-shells-separate`, `worker-own-shell`, `worker-chrome-desk-congruence`, `guest-landing-equals-bc-desk` |
| Law | `codified` → `10` §7 |

### r-same-control-behavior

**Rule:** The same named control (e.g. Request Operator) must open the same interaction pattern everywhere it appears — Dialog with options, not flash on one surface and modal on another.

| | |
|--|--|
| Evidence | `guest-request-operator-dialog`, `bc-request-operator-modal` |
| Law | `MISSING` (partial echo in `10` §7 “Depth”) — **promote** → [`GAPS.md`](./GAPS.md) |

### r-timer-on-disabled

**Rule:** When an action is time-gated, disable the control and place the remaining time beside it. Do not put the timer only in a distant header caption.

| | |
|--|--|
| Evidence | `bc-escrow-status-and-reclaim` |
| Law | `MISSING` — **promote** → GAPS |

### r-empty-names-module

**Rule:** Empty states use the vocabulary of the module they sit in (Available empty ≠ “Claimed”). Multi-instance pools list instances; do not collapse to a wrong-status single frame.

| | |
|--|--|
| Evidence | `worker-available-empty-not-claimed` |
| Law | `MISSING` (related `06` §5 / `10` §3) — **promote** → GAPS |

---

## D. Interpretation / continuum (design translation, not world)

### r-continuum-intercept

**Rule:** Registry may keep two Core outcomes (Guest + BC); click-through must play one continuum (same person after first fund). Do not placate the registry split with two stranger apps.

| | |
|--|--|
| Evidence | `guest-bc-continuum-intercept`, `bc-separate-prototype-app`, `bc-payer-continuum-client` |
| Law | Documented in [`interpretation-to-clickthrough.md`](../persona-sits/interpretation-to-clickthrough.md); craft echo `10` §6–7. Living path: GuestVessel → BusinessClientDesk (not PayerContinuum). |

---

## E. World symptom recorded in CT (owned by 09)

### r-no-painted-gates

**Rule:** Do not paint admission gates as decision chrome (e.g. `funded` badge on a queue that only admits funded launches).

| | |
|--|--|
| Evidence | `worker-available-admission-funded` |
| Law | `codified` → [`09`](../../build-foundation/09-world-model.md) — not a `06`/`10` chrome law |

---

## Cross-persona evidence index

| Card id | Personas | Primary file |
|---------|----------|--------------|
| `guest-bc-continuum-intercept` | Guest, BC | [`personas/guest.md`](./personas/guest.md) |
| `guest-landing-equals-bc-desk` | Guest, BC | [`personas/guest.md`](./personas/guest.md) |
| `bc-request-operator-modal` | Guest, BC | [`personas/business-client.md`](./personas/business-client.md) |
| `op-persona-shells-separate` | all | [`personas/operator.md`](./personas/operator.md) |
