# Screen dossiers

Living Register click-through screens, one pack per persona. Each screen records **Birth How**, **Birth Can't** (exact obstacle quotes), **Applied rules** (from the design corpus), purpose, and congruence.

Screenshots are captured with EVAL / choreography strip **visible** (Register CT), not plant-hidden chrome.

## Capture

```bash
# from apps/tally — Register unlocked, `npm run dev` on :5173
node scripts/captureScreenDossiers.mjs
```

Script: [`apps/tally/scripts/captureScreenDossiers.mjs`](../../../apps/tally/scripts/captureScreenDossiers.mjs)  
Output: `docs/register/screen-dossiers/{persona}/screenshots/*.png`

## Method

1. Walk the living CT for that persona Core outcome.
2. For each screen: bind a How node (or mark `UNKNOWN`), bind ranked Can't quotes from `*Obstacles.ts`, cite corpus rules from [`../design-corpus/RULES.md`](../design-corpus/RULES.md).
3. Embed the screenshot as `![title](./screenshots/NAME.png)`.
4. State purpose (one job) and congruence (desk / module family). Stay honest when How leaves or Can'ts are missing.

Sources:

| Layer | Path |
|-------|------|
| Can'ts | `apps/tally/src/app/register/outcomes/{operator,nonBusinessClient,businessClient,worker}Obstacles.ts` |
| How | `apps/tally/src/app/register/howAnalysis/*CoreOutcome.ts` |
| Rules | [`../design-corpus/RULES.md`](../design-corpus/RULES.md) |
| Craft temperament | [`../../build-foundation/11-design-craft-synthesis.md`](../../build-foundation/11-design-craft-synthesis.md) |
| World / admission | [`../WORLD.md`](../WORLD.md), `campaignWorld.ts` |

## Persona packs

| Persona | Dossier | Screenshots (expected) |
|---------|---------|------------------------|
| Operator | [`operator/dossier.md`](./operator/dossier.md) | `01-campaigns-empty` … `14-invite-existing` |
| Guest (non-business) | [`guest/dossier.md`](./guest/dossier.md) | `01-invite-campaigns` … `06-lapsed` |
| Business Client | [`business-client/dossier.md`](./business-client/dossier.md) | `01-campaigns` … `04-escrow` |
| Worker | [`worker/dossier.md`](./worker/dossier.md) | `01-available` … `05-pipeline` |

### Operator screens

1. `01-campaigns-empty` — honest empty / vessel index  
2. `02-basics-new-campaign` — thin create  
3. `03-campaign-company-pick` — pre-screened evaluate seed  
4. `04-evaluating` — analysis emulation  
5. `05-dossier` — pricing-reason verdict  
6. `06-enriching-or-firm-list` — off-call enrich start  
7. `07-firm-list` — filter / prune  
8. `08-demo-seed` — demo walk ready  
9. `09-deploy-choice` — Who to invite? (**How UNKNOWN**)  
10. `10-invite-guest` — first-sale invite  
11. `11-campaigns-waiting-fund` — wait vs fund  
12. `12-client-fund` — demo fund stand-in  
13. `13-running` — launch after fund  
14. `14-invite-existing` — same invite mechanism for BC  

### Guest screens

1. `01-invite-campaigns` — vessel landing (Invite+Walk merged)  
2. `02-fund` — escrow hold commit  
3. `03-receipt` — Guest ends → BC  
4. `04-meetings-empty` — desk IA empty (**How UNKNOWN**)  
5. `05-escrow` — hold absence / continuum preview  
6. `06-lapsed` — clean decline / lapse  

### Business Client screens

1. `01-campaigns` — my vessels home  
2. `02-meetings` — booking history  
3. `03-meeting-sheet` — packet / dispute (invite-before-form)  
4. `04-escrow` — held / released / reclaim  

### Worker screens

1. `01-available` — launched ∧ unclaimed only (no funded badge)  
2. `02-claimed` — exclusive claim + Begin  
3. `03-working` — outreach against locked rules  
4. `04-log-meeting` — packet fields (**How leaf UNKNOWN**)  
5. `05-pipeline` — booked / N  

## Honesty markers

Mark **UNKNOWN** when the living CT has a screen the How graph does not yet name as a leaf (or the Can't list has no dedicated row):

- Operator `09-deploy-choice` — no How leaf for the invitee-class fork  
- Guest `04-meetings-empty` — Meetings nav is desk congruence; Guest How stops at fund  
- Worker `04-log-meeting` — Obstacle how names the path; Worker How has no `n-worker-log` leaf yet  

## Related

- Design corpus method: [`../design-corpus/METHOD.md`](../design-corpus/METHOD.md)  
- Persona chronologies: [`../design-corpus/personas/`](../design-corpus/personas/)  
- Gaps / promote: [`../design-corpus/GAPS.md`](../design-corpus/GAPS.md)  
