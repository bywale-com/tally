# shadcn/ui — Implicit Semantic Token Philosophy (Archaeology)

**Corpus:** 49 components — 19 installed in `apps/tally/src/components/ui` plus 30 base-nova registry sources (`ui.shadcn.com/r/styles/base-nova/*.json`), style `base-nova`, CSS variables on.  
**Calibration model:** [Carbon Design System color / spacing / typography](https://carbondesignsystem.com/) — role-first naming, palette→semantic nesting, interaction-state tokens, formulaic type scale, dual spacing scales. Carbon values/names are **not** copied; only the structural completeness bar.  
**Method:** Pattern qualifies only if the same role/value recurs in **≥3 unrelated components**. Below threshold = ungrounded (not promoted). Confidence: **high** = 5+ components, **medium** = 3–4.  
**Values:** Role names are inferred from usage. “Current value” is the **CSS custom property / Tailwind utility** components actually reference. Resolved oklch figures below are from this project’s `apps/tally/src/styles/index.css` (brand-overridden `--primary`); default neutral scaffold differs for brand tokens only.

**Verdict in one line:** shadcn has a real, coherent **surface/foreground pair + emphasis ladder** philosophy — thinner than Carbon, with interaction and layering mostly expressed as **opacity modifiers and shared muted/accent washes**, not dedicated state tokens.

---

## Phase 1 — Carbon calibration (structural bar only)

Carbon’s published model ([color overview](https://carbondesignsystem.com/elements/color/overview/), [tokens](https://carbondesignsystem.com/elements/color/tokens/), [spacing](https://carbondesignsystem.com/elements/spacing/overview/), [typography](https://carbondesignsystem.com/elements/typography/overview/)) contains:

| Structural slot | Carbon pattern |
| --- | --- |
| Role-first names | `$text-secondary`, `$border-subtle`, `$layer-01`, `$interactive` |
| Nesting | IBM palette step → theme maps → semantic token → component |
| Layering | Explicit stacked surfaces (`layer-01`…`03`) with light/dark rules |
| Interaction states | Dedicated `*-hover`, `*-active`, `*-selected`, `*-disabled`, `$focus` |
| Type | Formulaic scale + productive type sets |
| Spacing | Named scale used inside components; layout/stack as separate concern |

This archaeology asks whether shadcn’s **component source** already encodes an equivalent (even if thinner) philosophy.

---

## Confirmed semantic tokens

### A. Surface / foreground pairs (core philosophy)

**Inferred rule:** Every painted surface has a paired content color. Utilities are `bg-{role}` + `text-{role}-foreground` (base page uses `background`/`foreground` without a `-background` suffix).

| Role name (inferred) | Current value (token / utility) | Evidence (components) | Confidence |
| --- | --- | --- | --- |
| `background` / `foreground` | `--background` / `--foreground` → `bg-background`, `text-foreground` | Page shell CSS; button outline, calendar, chart, field, sidebar inset, switch, tabs (+ many `text-foreground`) | high |
| `popover` / `popover-foreground` | `--popover` / `--popover-foreground` → `bg-popover`, `text-popover-foreground` | alert-dialog, calendar, combobox, command, context-menu, dialog, drawer, dropdown-menu, hover-card, menubar, navigation-menu, popover, select, sheet | high |
| `card` / `card-foreground` | `--card` / `--card-foreground` → `bg-card`, `text-card-foreground` | alert, card | medium (only 2 files — **borderline**; documented in theming + used as elevated panel, but fails strict 3+ if card+alert only. Flagged: treat as **documented scaffold token with weak component recurrence** in this corpus) |
| `primary` / `primary-foreground` | `--primary` / `--primary-foreground` → `bg-primary`, `text-primary-foreground` | avatar badge, badge, button, calendar day, checkbox, native-select, progress, radio-group, slider, switch | high |
| `secondary` / `secondary-foreground` | `--secondary` / `--secondary-foreground` | badge, button (secondary variants) | medium (2 components in corpus — **below strict threshold for promotion**; listed here because named in theme scaffold and paired consistently where used, but recurrence is weak) |
| `muted` / `muted-foreground` | `--muted` / `--muted-foreground` → `bg-muted`, `text-muted-foreground` | muted wash: 19 comps; muted text: 30 comps (descriptions, placeholders, captions, empty, helpers) | high |
| `accent` / `accent-foreground` | `--accent` / `--accent-foreground` → `bg-accent`, `focus:bg-accent`, `text-accent-foreground` | combobox, context-menu, dropdown-menu, menubar, select (menu highlight) | high |
| `sidebar` / `sidebar-foreground` (+ sidebar-primary, sidebar-accent, sidebar-border, sidebar-ring) | `--sidebar*` namespace | sidebar.tsx only as a **component-scoped token family** | high *within sidebar*; not a global surface ladder |

**Project light resolved examples (`index.css`):**  
`--background: oklch(1 0 0)`; `--foreground: oklch(0.145 0 0)`; `--muted: oklch(0.97 0 0)`; `--muted-foreground: oklch(0.556 0 0)`; `--primary: oklch(0.606 0.25 292.7)` (brand); `--destructive: oklch(0.577 0.245 27.325)`.

### B. Emphasis & status

| Role name | Current value | Evidence | Confidence |
| --- | --- | --- | --- |
| `destructive` (emphasis) | `--destructive` → `text-destructive`, tinted fills `bg-destructive/10`–`/20` | alert, badge, button, context-menu, dropdown-menu, field, menubar | high |
| `destructive` (invalid chrome) | `border-destructive`, `ring-destructive/20` (+ dark `/40`, `/50` border) | badge, button, checkbox, combobox, input, input-group, native-select, radio-group, select, switch, textarea, toggle | high |
| `primary` (link / brand text) | `text-primary`, `hover:underline`, `underline-offset-4` | badge link, button link, empty links, field links, item | high |
| `chart-1`…`chart-5` | Registry chart + default theming scaffold | chart registry component; **absent from this project’s `index.css`** | high in default scaffold / chart; **absent locally** |

### C. Structure chrome

| Role name | Current value | Evidence | Confidence |
| --- | --- | --- | --- |
| `border` | `--border` → `border-border`, `bg-border` (hairline separators) | avatar, badge, button, item; separators: combobox, command, context-menu, dropdown-menu, menubar, navigation-menu, scroll-area, select, separator | high |
| `input` | `--input` → `border-input`, dark fills `bg-input/30`–`/80` | button outline, checkbox, combobox, input, input-group, native-select, radio-group, select, tabs, textarea, toggle | high |
| `ring` (focus) | `--ring` → `border-ring`, `ring-ring/50`, `focus-visible:ring-3` / `ring-[3px]` | accordion, badge, button, calendar, checkbox, combobox, input, … (19 for ring/50; 17 for border-ring) | high |
| `overlay-scrim` | **hardcoded** `bg-black/10` (+ backdrop blur) | alert-dialog, dialog, drawer, sheet | medium–high (4 comps; not a CSS variable) |
| `inverse-surface` / `inverse-foreground` | `bg-foreground` + `text-background` (and tooltip arrow `fill-foreground`) | tooltip (also kbd inverse moments) | medium (2–3 comps; pattern exists, thin) |
| `elevated-edge` | `ring-1 ring-foreground/10` (not `border`) | alert-dialog, card, combobox, context-menu, dialog, dropdown-menu, hover-card, menubar, navigation-menu, popover, select | high |
| `disabled` | **not a color token** — `disabled:opacity-50` / `data-disabled:opacity-50` | 21+ components | high (as opacity rule, not palette role) |

### D. Interaction washes (recurring, but not dedicated tokens)

| Role name | Current value | Evidence | Confidence |
| --- | --- | --- | --- |
| `hover-wash` / `selected-wash` | `bg-muted`, `bg-muted/50`, `hover:bg-muted` | badge, button ghost/outline, table row, toggle, navigation-menu, item, … | high |
| `menu-highlight` | `bg-accent` + `text-accent-foreground` on focus/open | dropdown-menu, context-menu, menubar, select, combobox | high |
| `primary-hover` | opacity on same token: `hover:bg-primary/80` or `/90` (style-dependent) | badge, button | medium |
| `destructive-soft` | `bg-destructive/10` light, `/20` dark | badge, button, menus | high |

---

## Ambiguous / multi-role values

Flagged for human decision — do **not** silently pick one role when generating net-new components.

1. **`muted` vs `accent` as interactive hover**  
   - Menus/select/combobox: `accent`  
   - Ghost buttons, badges, table rows, toggles (base-nova): `muted`  
   Same light-theme oklch often identical (`0.97 0 0` for muted/accent/secondary in this project). **Role collision by value; role split by component family.**

2. **`secondary` vs `muted`**  
   Secondary is a named filled variant on button/badge only; surface value matches muted in light theme. Unclear whether secondary is a true semantic tier or a variant alias.

3. **`border` vs `input`**  
   Light theme: both `oklch(0.922 0 0)`. Dark theme: diverge (`border` 22% white vs `input` 15%). Role split is intentional in dark; collapsed in light.

4. **`card` vs `background` vs `popover`**  
   Light theme: often all white. Differentiation is **role intent** (page / elevated panel / floating), not always a visible step. No Carbon-like layering alternation.

5. **`destructive` fill strategy**  
   Soft tint (`/10`) on badge/button/menu vs solid `bg-destructive` in some registry styles (new-york). base-nova prefers soft. Ambiguous which is “canonical” across styles.

6. **`ring` vs brand `primary`**  
   This project sets `--ring` equal to brand primary. Default neutral scaffold uses a neutral ring. Focus-ring role exists; **value coupling to brand is project choice**, not universal registry law.

7. **Overlay scrim**  
   Always `bg-black/10`, never a token. Dual-role risk if dark mode needs a different scrim — currently ungrounded as a themeable role.

8. **`text-primary` vs `text-foreground` for links**  
   Inline links in empty/field/alert often `text-primary` or underline + hover to `foreground`. Two link treatments coexist.

---

## Structural gaps vs Carbon’s model

Named absences — **no invented fill**.

| Carbon-shaped slot | shadcn evidence |
| --- | --- |
| Layer stack `layer-01`…`03` with alternate/step rules | **Absent.** Only page / card / popover / sidebar — no stacking grammar. |
| Field layer tokens (input fill distinct from layer) | **Thin.** `input` is mostly border (+ dark translucent fill); no field-01/02. |
| Dedicated `*-hover` / `*-active` / `*-selected` color tokens | **Absent.** Opacity on base token or shared muted/accent wash. |
| Dedicated disabled **colors** (`text-disabled`, `layer-disabled`) | **Absent.** Opacity 50% only. |
| Focus inset / dual-focus tokens | **Absent.** Single `ring` + `border-ring`; no inset token. |
| Text hierarchy beyond one muted tier (`text-secondary`, helper, placeholder as distinct tokens) | **Absent.** One `muted-foreground` covers caption, placeholder, description, shortcut. |
| Icon-specific tokens | **Absent.** Icons inherit `currentColor` / foreground / muted. |
| Support / status set (success, warning, info) | **Absent from component corpus.** Docs show how to *add* custom tokens; not shipped as first-class roles. |
| Link token family | **Absent.** Links reuse `primary` or underline on muted/foreground. |
| Skeleton token | **Absent as color role.** Skeleton uses `bg-muted` + pulse. |
| Dual spacing scales (component-internal vs layout) | **Absent.** Single Tailwind spacing scale for both. |
| Formulaic type scale | **Absent.** See type section. |
| Palette → semantic nesting | **Shallow.** oklch literals assigned directly to semantic CSS vars; no intermediate ramp tokens in theme CSS. |
| Component tokens (button-specific palette) | **Mostly absent** except `sidebar-*` namespace. |

---

## Type scale

**Finding: no mathematical / formulaic type scale is inferable from component source.**

| Utility | Role in corpus | File count (approx.) |
| --- | --- | --- |
| `text-sm` | Default control / body chrome | 33 |
| `text-xs` | Meta, badges, shortcuts, tooltips | 15 |
| `text-base` | Titles (dialog/sheet), mobile input bump | 8 |
| `text-[0.8rem]` | Button `sm` / calendar / toggle density | 3 (ad hoc) |
| `font-medium` | Labels, titles, emphasis | 30 |

There is **no** Carbon-like `Xn = Xn-1 + …` progression, no named type sets (productive/expressive), and no type tokens in CSS variables. Components consume Tailwind’s fixed steps. Project `body` also hardcodes `font-size: 13px` outside the utility system — **ungrounded vs component `text-sm`**.

---

## Spacing scale

**Finding: a consistent 4px-grid usage pattern exists (via Tailwind), but not a dual-purpose named scale.**

Recurring steps (≥3 components): `gap-0.5` (2px), `gap-1` (4), `gap-1.5` (6), `gap-2` (8), `gap-4` (16); padding `p-1`, `p-2`, `p-4`; control heights `h-6`–`h-9` with `h-8` dominant for default controls.

| Carbon dual-scale idea | shadcn evidence |
| --- | --- |
| Named component spacing tokens | **Absent** — raw Tailwind utilities |
| Separate layout spacing tokens | **Absent** — same utilities used for layout gaps (`gap-4` in dialogs/sheets) and internal padding |
| Stack component with tokenized gap | **Absent** as design-system primitive (flex+gap composition instead) |

Radius **does** have a mini derived scale from `--radius` (`radius-sm/md/lg/xl` via calc) — the clearest formulaic nesting in the theme. Component radius usage: `rounded-lg` (24), `rounded-md` (11), `rounded-xl` (6) dominate; `rounded-4xl` on badge only (ungrounded as global rule).

---

## Nesting model (what exists)

```
oklch literals in :root / .dark
        ↓
CSS variables (--background, --primary, …)
        ↓
@theme inline → --color-* Tailwind theme keys
        ↓
Utilities (bg-primary, text-muted-foreground)
        ↓
Optional alpha: /50, /10, /80  (state & emphasis)
```

Compared to Carbon: **one hop from literal to role**, then alpha for states — not palette-step → semantic → state.

---

## Honest consistency notes

- **Strong:** surface/foreground pairing; muted for de-emphasized content; ring for focus; destructive for error/danger; popover for floating chrome; opacity-50 for disabled; hairline `ring-foreground/10` on overlays.  
- **Weak:** muted vs accent hover split; secondary underused; card under-recurring; no layering; no status beyond destructive; spacing/type are Tailwind conventions, not articulated token philosophies.  
- **Style fork risk:** base-nova (this project) vs new-york-v4 differ on ghost hover (`muted` vs `accent`) and destructive solidity — agents must follow the **installed style**, not a blended average.

---

## Sources

- Local: `apps/tally/src/components/ui/*.tsx`, `apps/tally/src/styles/index.css`, `apps/tally/components.json`  
- Registry: `https://ui.shadcn.com/r/styles/base-nova/{component}.json` (30 components)  
- Docs cross-check (not used as sole evidence): [shadcn theming](https://ui.shadcn.com/docs/theming)  
- Calibration: [carbondesignsystem.com](https://carbondesignsystem.com/)
