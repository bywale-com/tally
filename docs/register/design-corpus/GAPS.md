# Design corpus — gaps vs craft laws

Comparison of evidence ledger ([`RULES.md`](./RULES.md)) to portable laws `06` / `07` / `10` (+ world `09` where CT showed a painted gate).  
**First corpus pass:** document only. Do not silently patch law files until a promote pass cites these ids.

---

## 1. Missing laws (promote)

| Rule id | Failure class | Evidence | Suggested home |
|---------|---------------|----------|----------------|
| `r-same-control-behavior` | Same named control, incongruent interaction (flash vs Dialog) | `guest-request-operator-dialog`, `bc-request-operator-modal` | New `10` §7a or subsection under Design congruence |
| `r-timer-on-disabled` | Time gate shown far from disabled CTA | `bc-escrow-status-and-reclaim` | New `06` §4 companion or §3 quiet-until (state on control) |
| `r-empty-names-module` | Empty uses another module’s status vocabulary; single wrong frame for multi-pool | `worker-available-empty-not-claimed` | New `06` §5 bullet + `10` §3 caption/empty |

**Promote status:** ready — evidence witnessed; living CT already implements the pass.

---

## 2. Partial coverage (law exists, incomplete)

| Topic | What law says | What evidence adds | Cards |
|-------|---------------|--------------------|-------|
| Congruence | `10` §7 module-type rhyme | Explicit **same-control same-behavior** not stated | `bc-request-operator-modal` |
| Don’t placate empty | `06` §5 fake loading / stubs | Empty **wrong label** for admission module | `worker-available-empty-not-claimed` |
| Facts / Status | `10` §1 narrator ban | Escrow “Status” honesty essay specifically useless | `bc-escrow-status-and-reclaim` |
| Line-button | `06` §4 | Proven on escrow Reclaim + Request Operator row | `bc-escrow-status-and-reclaim` |
| Continuum | sits interpretation doc | Applied exemplar still names PayerContinuum as living | `guest-bc-continuum-intercept` |

---

## 3. Under-evidenced laws

| Law | Concern | Note |
|-----|---------|------|
| `06` §3c Overlay inset | Single BC sheet primitive fix | Enough for law; few cards — acceptable |
| `07` Overlay escape | One Operator birth arc | Enough; keep citing AnchoredPortal |
| `10` §4 Persona ear | Implicit across copy pass | Thin dedicated card — covered under narrator ban |

No law should be deleted for thin evidence; thicken cards when next failure hits.

---

## 4. Stale exemplars / docs (fix living paths)

| Location | Stale claim | Truth |
|----------|-------------|-------|
| [`06-parametric-elimination-applied.md`](../../build-foundation/06-parametric-elimination-applied.md) §5 | Living code = `PayerContinuumPrototypeApp.tsx` | Living = `GuestVessel` → `BusinessClientDesk`; PayerContinuum is fossil |
| Same file §7 UI copy pass | “Payer continuum” as living copy target | GuestVessel / BusinessClientDesk / Worker |
| [`persona-sits/README.md`](../persona-sits/README.md) | Guest+BC share `PayerContinuumPrototypeApp` | GuestVessel → BusinessClientDesk via RegisterPrototypePanel |
| [`interpretation-to-clickthrough.md`](../persona-sits/interpretation-to-clickthrough.md) table | Beats still say Invite → Walk as separate (partially updated) | Living Guest: merged landing; EVAL Invite → Fund → Receipt |
| Wireflow docs naming `*PrototypeApp` | Deprecated wrappers | Prefer GuestVessel / BusinessClientDesk names in new prose |

Corpus wire-in pass retargets the first three. Wireflow filename churn is optional follow-on.

---

## 5. Out of scope (pointer only)

| Topic | Owner | CT card if any |
|-------|-------|----------------|
| World admission / never-see | `09` + `WORLD.md` | `worker-available-admission-funded` |
| Outcome so-that / purpose lattice | `08` + outcomes registry | — |
| Sit voice / conjure | `persona-sits/` | `worker-sits-forced-objects` |
| Strip vs step versioning mechanics | `05` + CHANGELOG | Operator strip cards as examples |

---

## 6. Evidence without chronology baseline

| Gap | Mitigation |
|-----|------------|
| No git history for lo-fi | Fossils + CHANGELOG + transcript only ([`METHOD.md`](./METHOD.md)) |
| First Guest/BC pixel screens not snapshotted | Marked `inferred-from-fossil` where needed |
| Subagent-introduced loud purple/copy | Blamed via user critique date, not file author |

---

## 7. Codified and healthy (no action)

| Rule ids | Law |
|----------|-----|
| `r-one-job` … `r-no-placate-empty` (except empty-names promote) | `06` |
| `r-overlay-escape` | `07` |
| `r-facts-not-narrator` … `r-module-congruence` | `10` |
| `r-no-painted-gates` | `09` |
| `r-continuum-intercept` | interpretation doc + living CT |

---

## 8. Promote checklist (follow-on, not this pass)

1. Add `10` §7a Same-control behavior — cite `r-same-control-behavior`.
2. Add `06` timer-on-disabled bullet — cite `r-timer-on-disabled`.
3. Extend `06` §5 / `10` empty vocabulary — cite `r-empty-names-module`.
4. Retarget applied exemplar §5 living path (wire-in).
5. Mirror promote text into `.cursor/rules/ui-copy.mdc` / `parametric-elimination.mdc` only after law files land.
