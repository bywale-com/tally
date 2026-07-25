# Project brief — Tally

## Product

- **Name:** Tally
- **One-line what it is:** Pay-per-qualified-meeting fractional sales — operator finds eligible companies via market scans and outreaches.
- **Primary user (role):** **Tally Operator** (Wale / Omcoda) — one operator, no sales team. Language: market scans, companies, outreach, Lane A, call-ready.
- **Secondary user (later):** Not in scope this phase (buyer / company side).

## Molecular outcome (one paragraph)

> As the Tally Operator, I land in Tally, set criteria and parameters for a market scan, run it (and pause / restart / schedule / modulate as needed), then view, filter, sort, organize, and export the results — selecting the data I need — so I can find eligible companies for outreach. The scanner has a home in the app.

## Where we start

- **First UI surface to build / extend:** Operator shell — board-style left panel (scan inventory), tab workspace, Console side panel, HolonBoundary-ready regions, `/register` from day 1. Visual system ported from Tower (Inter, tokens, tab chrome) with **purple** accent instead of Tower blue.
- **In-scope for this session / next build tranche:**
  - ✅ Copy rudiments + Cursor rules
  - ✅ Scaffold `apps/tally` Vite+React shell from Tower chrome (not Tower domain)
  - ✅ Tokens + fonts (purple accent `#8B5CF6`)
  - ✅ HolonBoundary + Docs registry/highlight contexts
  - ✅ Console (`DocsPanel`) side panel
  - ✅ Board-style left panel (market scan list chrome)
  - ✅ Workspace tab bar
  - ✅ Minimal `/register` (route + gate + placeholder canvas)
- **Out of scope for this tranche:**
  - Full scan pipeline UI wired to live Postgres (beyond stubs)
  - Schedule / export / modulation UX polish end-to-end
  - Secondary user product
  - Tower domain: clients, hub, immigration, How/flows atlas content
  - Deep Register How Analysis + flow maps (shell route only)
## Constraints

- **Stack:** Mirror Tower operator app — Vite + React + TypeScript + React Router; Tailwind where needed; chrome via Tokens.
- **Repo:** `scanner/` stays the sourcing engine; product UI lives under `apps/` (reserved). Scanner gets a home in the UI — do not relocate engine logic into React.
- **Design references:** Tower tab workspace, board left panel, Console, HolonBoundary, Register gate. Same fonts/colors except brand → purple (`accent` / `accentBg` / `activeRowBg`).
- **Must stay on rudiments:** tokens · icons · surface boundaries · How/flows when relevant.

## Agent instruction

Follow `docs/build-foundation/00-rudiments.md`. Build only the in-scope starting surface (operator shell + scan board chrome). Register every new region. Do not invent process language before How leaves. Do not expand into out-of-scope modules or copy Tower client/hub domain.
