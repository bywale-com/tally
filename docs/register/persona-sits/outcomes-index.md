# Outcomes index (from conjure sits)

Source of truth for statements: persona files in this folder + `apps/tally/src/app/register/outcomes/outcomesRegistry.ts`.

## Core outcomes (spine)

| Persona | Core id | Purpose (so-that) |
|---------|---------|-------------------|
| Operator | `operator-core` | Client funds priced vessel; Worker only sees funded+launched |
| Guest | `non-biz-core` | Capital only enters risk-mitigated meeting vessel |
| Business Client | `client-core` | Worker paid only for real meetings; capital + brand protected |
| Worker | `worker-core` | BC gets qualified meetings; escrow can release |

## Forced shared objects (must exist in product)

1. Locked campaign rules (who counts, length, seniority, N × $)  
2. Escrow terms (hold, per-meeting release, reclaim)  
3. Meeting log + **pre-call packet** (who, size, pain)  
4. Escrow release receipt / held vs released  
5. Launch-after-fund gate  
6. Conversion receipt (Guest → BC)  
7. Low-motion honesty + reclaim (not activity)  
8. Honest booked / N  

## Explicitly not building (from sits)

- Worker↔Client free messaging / internal messaging channels  
- CS cheerleaders, QBRs, peer client networks  
- Activity vanity (opens, dials, “450 emails”)  
- Client-created campaigns  
- Unfunded vessels in Worker queue  

## Note on “isn’t necessary”

Sits are stronger evidence for **what must exist** than for absolute bans. Messaging was evaluated separately against §9–10–14 of the guest/BC sit → nay as product, yay as meeting packet.
