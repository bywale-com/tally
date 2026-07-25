# Prototype Carbon — match / synthesize / block report

**prototype_id:** tally-register-prototype-carbon  
**target_system:** carbon  
**skills:** carbon-composition-patterns, carbon-semantic-tokens  
**orchestrator:** omcoda-design-orchestrator  
**generated_at:** 2026-07-25  
**parity_pass:** 2026-07-25 (absolute Core+door vs loFi)

## Resolution log (summary)

| concept_id | concept | disposition | resolved_to | notes |
| --- | --- | --- | --- | --- |
| shell-frame | Whole-product chrome | matched | UIShell Header + SideNav + Content + Theme | All personas |
| theme-toggle | Light/dark | matched | Theme g10/g100 + HeaderGlobalAction | Separate LS key |
| persona-cycle | ← → + Switcher | matched | HeaderGlobalAction + HeaderPanel Switcher | Keep; arrow keys via personaCycle |
| entity-index | Campaign/vessel/meeting lists | matched | DataTable + TableToolbar | |
| status-chip | Decision state on row | matched | Tag | Worker excludes gate labels |
| row-overflow | Secondary row actions | matched | OverflowMenu | Operator + BC |
| short-create | Name-only create + templates | matched | TextInput + RadioButtonGroup templates | basics beat |
| fact-grid | Object glance facts | matched | StructuredList (FactList) | |
| primary-cta | Loud action | matched | Button (primary) | |
| quiet-cta | Secondary/ghost | matched | Button secondary/ghost/tertiary | |
| danger-confirm | Stop / dispute / decline | matched | Modal danger | Invite-before-form on dispute |
| form-fields | Fund N, terms, log packet | matched | NumberInput, Checkbox, TextInput, TextArea, ComboBox | |
| empty-honest | Pre-fund Meetings/Escrow | matched | InlineNotification + Layer | Guest honest empties |
| invite-land | Guest vessel presentation | matched | Tile + FactList | |
| guest-lapsed | True lapsed surface | matched | Dedicated stage (not toast-only) | Walk away / Decline |
| peer-stub-nav | Operator Meetings/Messages/Operations | matched | SideNav + info notification | Expressible, not Function |
| side-detail-panel | Heavy side sheet | synthesize | Carbon Modal (DoorModal) | ibm-products Tearsheet deferred |
| board-workbench | VS Code–like board density | blocked → resolved by choice | SideNav+DataTable consolidation | Documented in REARCHITECTURE |
| card-elevation | Soft shadow cards from plant | blocked (gap) | Layer / default surfaces | No elevation ladder — do not invent |
| radius-scale | Rounded card language | blocked (gap) | Component defaults | No core radius tokens |
| holon-boundary | Register inhabit map | synthesize (product-layer) | Not shipped this pass | Remap deferred; routes preserve leaf meaning |
| brand-purple | Tally plant purple accent | blocked | Carbon interactive blue | Brand override needs human decision |

## Parity closed this pass (vs loFi audit)

### Operator
- Screens: **basics** (templates) → **creating** skeleton → **campaign** company pick → **evaluating** → **dossier** (re-analyze / notes / More) → **enriching** + **firm-list** + enrich history → **deploy-choice** → **invite-guest** and **invite-existing** as distinct beats → **client-fund** → **running** with Pause/Stop doors
- Doors: details, history, invite-history, dossier-more, pause, stop (Carbon Modal)

### Guest
- Stages: invite land, fund, converted, **true lapsed**, meetings/escrow empty honest
- Doors: terms, details, inspect/firms, share, history, faq, requests
- Dialogs: decline, ask-operator
- Continuum into BC desk preserved (`personaId="guest"`)

### Business Client
- Campaigns / Meetings / Escrow with vessel detail
- Meeting **Filter** door; respond with accept + dispute **reason+evidence** (invite-before-form)
- Doors: firms, details, talk, alerts, history, stop, faq, requests, **pause** (optional why)
- Fund / stop / reclaim deepened to loFi fidelity (facts + history events)

### Worker
- Available (filters + pin), claimed, working, log (firm ComboBox / size / talk / duplicate check), pipeline (status filters)
- **Release claim** back to pool
- Doors: details, firms, talk, history, alerts, packet preview

## Ambiguity queue (human)

1. **Tearsheet / SidePanel package** — Add `@carbon/ibm-products`, or keep Modal + full-page composition?  
   Options: (a) add ibm-products (b) stay Modal/page (**current**) (c) synthesize Layer panel  
2. **Brand purple vs Carbon blue** — Keep Carbon `interactive` / button-primary blue, or theme-brand toward `#8B5CF6`?  
3. **White vs g10** — Current light = g10. Prefer White theme for marketing-adjacent Guest land?  
4. **HolonBoundary** — Wire Carbon regions into DocsRegistry, or keep prototype-carbon outside Console map?

## Deferred (non-blocker)

- HolonBoundary + Furnish focus ids for Console inhabit (explicit remaps).
- Optional `@carbon/ibm-products` Tearsheet once ambiguity #1 decided.
- Visual QA polish across g10/g100 (not Function gaps).
- Operator command palette / shortcuts / notifications sheets (ambient chrome, not Core path).

## `/prototype-carbon` isolation

- Tree: `apps/tally/src/app/plant-carbon/**` only
- Entry: `prototype-carbon.html` → `src/main-carbon.tsx` → `CarbonAppRouter`
- Main SPA `Router.tsx`: **must not** import plant-carbon (comment documents why)
- Cross-doc `/prototype` links: plain `<a href>` in Switcher
- BrowserRouter basename `/prototype-carbon` — navigate `/`, `/operator`, `/guest`, `/client`, `/worker`
- No `@carbon/styles` in main SPA `main.tsx`
