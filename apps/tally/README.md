# Tally Operator App

Day-1 shell for the Tally Operator: market-scan board, tab workspace, Console, HolonBoundary, `/register`.

## Run

```bash
cd apps/tally
cp .env.example .env   # optional
npm install
npm run dev
```

- App: http://localhost:5173/
- Register: http://localhost:5173/register (password from `VITE_REGISTER_PASSWORD`, default `register`)

## Layout

```
src/app/
  App.tsx                 # Shell: Console | Board | Workspace | Status
  components/
    tokens.ts             # Light/dark — purple accent
    BoardPanel.tsx        # Left board (market scans)
    Workspace.tsx         # Tab chrome + scan stub
    DocsPanel.tsx         # Console live surface map
    docs/HolonBoundary.tsx
  register/               # Gated systems register (stub canvas)
```

Rudiments: `docs/build-foundation/` at repo root. Scanner engine remains in `scanner/`.
