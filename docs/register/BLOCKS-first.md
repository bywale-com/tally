# Block-first wireframes

**Decision (locked):** A flow always starts from a **block**, or from **inside a strip/module that already lives on a block**.

## What is a block?

Chrome you arrive into when you open the product — sidebar, top bar, activity rail, etc.  
Reference for Operator click-through: **shadcn `sidebar-07`** (collapsible sidebar + inset + header).

```bash
# Real install later (after lo-fi path survives prune) — not yet; app has no Tailwind/shadcn.
npx shadcn@latest add sidebar-07
```

## Why this matters

| Layer | Job |
|-------|-----|
| **Block** | Where the user *is* — forces nav ownership and consolidation |
| **Strip** | Screens *inside* that block for one choreography beat |
| **Click-through** | Same block shell; plant a flag; grow strips onto it |

Starting a naked “Campaigns panel” without a block hides the hard question: *how did they get here?*  
Starting from `sidebar-07` forces you to put **Campaigns** on the sidebar, put **Create** on that strip, and put **basics** as a sheet *on* the block — not a floating orphan.

## Flag rule

1. Name the **starting block** (or “starts inside strip X on block Y”).
2. Plant the click-through flag there.
3. Draw / inventory strips as screens that live on that shell.
4. Next outcome maps onto the **same block** when possible; only introduce a new block when the product truly needs one.

## Operator Core today

- **Click-through (Register):** lo-fi positional map — Create → Evaluate → Enrich → Deploy → Invite
- **Product shell (`/prototype`):** future home — shadcn `sidebar-07` + Create planted
  - Holons nest under **Prototype** (`prototype` → sidebar / workspace / campaigns / create / campaign)
  - Path: Campaigns → Create → Name → load → campaign exists
  - Console panel on the right shows the live Prototype holon tree

**Click-through heuristic:** keep it simple and cheap; when a downstream requirement is cheap to show in gray, show it.
