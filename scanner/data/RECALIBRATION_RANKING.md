# Calibration session — 2026-07-15

## Seed check (original flawed 5)

All five prior “Lane A” posts correctly **recency-killed** before LLM:

| Prior company | HN id | Age | Result |
|---|---|---|---|
| Niceboard | 42025388 | ~620d | dead / recency |
| Spiich | 46857490 | ~163d | dead / recency |
| Puntt | 44758710 | ~348d | dead / recency |
| NextPunch | 4054942 | ~5157d | dead / recency |
| Cogram | 38106758 | ~987d | dead / recency |

This is the intended fix for Gap 1 (posting recency).

## Fresh ranked Lane A (top 5)

Exported: `scanner/data/lane_a_five.csv` (+ host copies `lane_a_five.csv`, `lane_a_five_calibrated.csv`).

| Rank | Company (plain) | Verdict | Dial hint | Legibility trap | Notes |
|---|---|---|---|---|---|
| 1 | Aktos — debt collection ops software | call-ready | 1 | false | Clean dial; first-person scenario; question opener |
| 2 | CueBox — arts ticketing/fundraising CRM | call-ready | 1 | false | Short-cycle vertical; verify ACV (may still be low) |
| 3 | BigBlue — e-com logistics platform | call-ready | 1 | false | Founding sales motion; verify buyer dialability |
| 4 | Corepilot — aviation supply-chain ERP | call-ready | 1 | false | Operational buyer; longer cycle than Aktos/CueBox |
| 5 | Kana/Superset — agentic marketing AI | conditional | 2 | false | Outcome fuzzier; validate-and-reconcile |

**CGS correctly demoted** below these (conditional, dial=3, `legibility_trap=true`) — survivor outside the five. That is the dialability-vs-legibility calibration working.

## Code fixes landed this session

1. `posting_age_days` — Algolia `created_at` + mid-2026 anchors; no negative ages
2. Auto-kill `STALE_DAYS=60` before LLM
3. HN ingest → `search_by_date` + `created_at_i` window (60d)
4. Homepage resolve + `commoditization_risk` field already in deep screener
5. Openers as standing-openness questions; scenarios first-person (mechanical checks pass)

## Still watch

- CueBox may belong as **conditional** if ACV is truly SMB/<\$10k — confirm pricing
- BigBlue row screened via founding **SDR** posting; AE twin was Layer-killed — confirm offering
- One HN Matcha parse returned empty lane/verdict (safe reject); harden JSON parse later
