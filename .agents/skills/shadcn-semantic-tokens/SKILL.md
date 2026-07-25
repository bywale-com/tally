---
name: shadcn-semantic-tokens
description: >-
  Evidence-based implicit semantic token philosophy extracted from shadcn/ui
  component source (base-nova). Use when generating net-new shadcn-style
  components, charts, or custom UI that must stay visually in-family; when
  comparing shadcn tokens to Carbon; or when deciding which CSS variable /
  Tailwind semantic utility to apply. Do not invent tokens that archaeology
  marked absent.
---

# shadcn semantic tokens (archaeology)

Full evidence log: [archaeology.md](archaeology.md)

This is **not** an invented design system. It is the philosophy **already implicit** in shadcn component source + CSS variables. Prefer evidence over Carbon-shaped completeness.

## When to apply

- Authoring a net-new component in the shadcn / Tailwind semantic style
- Extending charts, graphs, or custom chrome that must rhyme with existing `ui/`
- Choosing between `muted`, `accent`, `secondary`, `primary`, `destructive`
- Evaluating gaps vs Carbon-style token maturity

## Core philosophy (confirmed)

1. **Surface / foreground pairs.** Paint with `bg-{role}` and content with `text-{role}-foreground` (page: `background` / `foreground`). Never invent a one-sided surface color without a content pair.
2. **Roles are CSS variables**, not raw palette steps. Use `bg-primary`, `text-muted-foreground`, `border-input`, `ring-ring` — never `bg-zinc-500` / hardcoded hex in component chrome.
3. **States are mostly alpha, not new tokens.** Hover/active/emphasis: `/80`, `/50`, `/10` on an existing role, or a shared wash (`muted` / `accent`). Disabled: `opacity-50`, not a disabled color token.
4. **Focus is its own role:** `focus-visible:border-ring` + `focus-visible:ring-ring/50` + ring width `3` / `[3px]`.
5. **Floating chrome:** `bg-popover text-popover-foreground` + `ring-1 ring-foreground/10` (and often `shadow-md` / `shadow-lg`). Overlay scrim is hardcoded `bg-black/10` (not a token — keep consistent until a human adds one).
6. **De-emphasized content:** always `text-muted-foreground` (placeholders, descriptions, captions, shortcuts).
7. **Danger / invalid:** `text-destructive` + soft fill `bg-destructive/10` (dark `/20`); invalid controls also `border-destructive` + `ring-destructive/20`.
8. **Brand / high emphasis:** `bg-primary text-primary-foreground`; text links often `text-primary` + `underline-offset-4`.
9. **Sidebar is a parallel namespace** (`sidebar-*`) — do not use sidebar tokens outside sidebar chrome.

## Decision table (generation)

| Job | Use |
| --- | --- |
| Page / app shell | `bg-background text-foreground` |
| Floating panel (menu, dialog, select, popover) | `bg-popover text-popover-foreground` |
| Static elevated panel | `bg-card text-card-foreground` if Card-like; else background |
| Primary action / selected brand fill | `bg-primary text-primary-foreground` |
| Quiet filled control | `bg-secondary text-secondary-foreground` (sparse evidence — prefer muted wash if unsure) |
| Subtle surface / skeleton / inset footer | `bg-muted` or `bg-muted/50` |
| Menu item highlight (focus/open) | `bg-accent text-accent-foreground` |
| Ghost / row / toggle hover (base-nova) | `hover:bg-muted` (not accent — style fork) |
| Border default | `border-border` or hairline `bg-border` |
| Form control edge | `border-input` (+ dark `bg-input/30`) |
| Focus ring | `ring` token as above |
| Error | `destructive` family |
| Disabled | `disabled:opacity-50` + `pointer-events-none` |
| Meta type | `text-sm` default; `text-xs` meta; `font-medium` labels |
| Internal spacing | Tailwind 4px grid: `gap-1`/`1.5`/`2`, `p-1`/`2`/`4`, control `h-8` default |

## Do not fabricate

These Carbon-shaped roles have **no evidence** in the corpus — do not invent values to fill them:

- Layer stack (`layer-01`…`03`)
- Dedicated `*-hover` / `*-active` / `*-selected` / `*-disabled` **colors**
- Success / warning / info support tokens
- Icon-specific or link-specific token families
- Focus-inset
- Dual layout vs component spacing token scales
- Formulaic type-scale tokens

If a new chart needs series colors: use `chart-1`…`chart-5` **only if** those CSS variables exist in the project theme; this repo’s `index.css` currently omits them — add theme vars first, or ask.

## Ambiguities (ask or match nearest sibling)

- **`muted` vs `accent` hover** — menus → accent; base-nova ghost/rows → muted
- **`border` vs `input`** — forms → input; structural dividers → border
- **`secondary` vs `muted`** — secondary only for explicit secondary variants
- Soft vs solid destructive — prefer soft `/10` for base-nova

## Radius

Derive from `--radius` (`rounded-lg` default control; `rounded-md` menu items; `rounded-xl` dialogs/cards). Do not invent one-off radii unless matching a specific sibling (e.g. badge pill).

## Verification

Before shipping a net-new component:

1. Every color utility maps to a confirmed role above (or is flagged ungrounded).
2. No raw palette colors in chrome.
3. Hover/disabled/focus follow alpha / muted|accent / opacity / ring patterns.
4. Recheck [archaeology.md](archaeology.md) if proposing a new token name.
