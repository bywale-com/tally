# Market: Appliance repair (residential, GTA)

- Slug: `appliance-repair`
- Pond type: households paying for in-home repair of washers, dryers, fridges, dishwashers, ovens, plus a crowded independent/tech supply competing on ~$80–$89 call-outs.
- Verdict: KILL
- Confidence in verdict: high
- $50k vs pool: small vs Ontario NAICS 8114 (1,180 employer + 3,987 non-employer personal/household goods repair establishments, 2025) and vs millions of dwellings. Size is not the kill; **unit economics** are.
- Primary buyer species: homeowner / tenant with landlord permission.
- January access: pass for electric non-sealed-system appliances; fail for gas appliances and sealed refrigeration.
- Seasonality: year-round; fridge/washer failures are not a closed winter.

## Gates

| Gate | Status | Evidence (with URL) | Note |
|------|--------|---------------------|------|
| G1 Size | pass | ISED CIS NAICS 8114 (2025): Ontario **1,180 employers** (883 micro) + **3,987 non-employers**. https://ised-isde.canada.ca/app/ixb/cis/businesses-entreprises/8114 (includes furniture/footwear/other personal repair — appliance is a subset). Toronto CMA 2.26M occupied dwellings. | Thousands of buyers. $50k would not be a noticeable share of household repair spend. |
| G2 30h economics | fail | Multiple GTA shops **compete at $80–$89 diagnostic, waived with repair**. Superior: diagnostic from **$80**, most repairs $150–$400. https://superiorapplianceservice.ca/toronto/ N Appliance Repair: **$80** diagnostic waived; standard repairs **$150–$280** incl. parts. https://nappliancerepair.com/ Nick’s: **$89** diagnostic; typical repairs $150–$350. https://nappliancerepair.ca/appliance-repair-toronto/ Fixlify: diagnostic from $89; dryer $100–$300 all-in. https://fixlifyservices.com/pricing SureFit: **$85+HST per appliance**, waived on repair. https://surefitapplianceservices.com/pricing/ A $180–$250 all-in ticket including parts, after 30–60 min GTA travel each way plus 1–2h on-site, is structurally **$25–$50 labour-equivalent**, not $60–$100 delivered. Conversion-or-lose-$80 is the advertised game. | This is the $80 call-out pond. Do not confuse with HVAC $150 diagnostics. Commoditized on the public rate. |
| G3 Reachable buyers | pass | Homeowners; phones on every shop page. | Also HomeStars/Google; that is noisy access, not the only access. |
| G4 Price/unit | pass | Public $80–$89 diagnostics and $100–$400 typical repairs (parts-in). | Evidence that customers **pay this band** — which is the wrong band for 30h. |
| G5 January technical access | pass (narrow) / fail (core fridge + gas) | **445A Appliance Service Technician is non-compulsory.** https://www.skilledtradesontario.ca/trade-information/appliance-service-technician/ https://www.skilledtradesontario.ca/about-trades/trades-information/ **Gas** dryers/ranges/unvented appliances: TSSA **DA** (G.3 + 240h DA modules, 420h cumulative) or G.2. DA scope: unvented residential gas appliances and vented refrigerators ≤100,000 Btuh — **not** furnaces. https://www.ontario.ca/laws/regulation/r01215 (s.31) https://www.tssa.org/sites/default/files/2025-09/FS-Gas%20Technician%20or%20Oil%20Burner%20Technician%20Policies%20and%20Procedures-2025.pdf **Sealed system / refrigerant:** 313A/313D compulsory; ODP card does not authorize repair. https://www.ontario.ca/page/certificate-handle-refrigerants 445A training standard even lists recovering refrigerant — that skill is still legally gated by the compulsory refrigeration trades + ODP. | Electric washer/dryer/dishwasher/oven component work can be January-legal. That slice still fails G2. |
| G6 Heterogeneity | pass | Washer, dryer, fridge, dishwasher, oven, microwave. | Exists; does not save G2. |
| G7 Fragmentation | pass | Many micro operators (8114 non-employers 3,987 Ontario). | Lead-gen platforms (HomeStars, etc.) tax acquisition; not a single owner of labour like Uber. Still a race to $80. |
| G8 Concentration | pass | Households. | |
| G9 Seasonality | pass | Year-round. | |
| G10 Regulatory | pass (electric non-sealed) / fail (gas + refrigerant) | Illegal plan would be gas without DA/G.2 or charging refrigerant without 313x+ODP. The advertised competitive work is mostly electric component swaps — legal but cheap. | G10 is not the primary kill; G2 is. |

## What this pond is

A large, easy-to-enter (for electric appliances), heavily advertised in-home repair market whose **public door is an $80–$89 diagnostic** and **$150–$350 parts-in typical repair**. 445A is voluntary. Gas and sealed-system fridge work re-impose TSSA/313A clocks. Incumbents already transact at economics that do not yield ~$3k net inside 30h after travel, parts, and unpaid quoting.

## What we are not claiming

No “Bosch/Sub-Zero premium only” proposition. No claim that commercial kitchen equipment (different pond, different rates) saves this one.

## Problem-class hypotheses (untested, not admission criteria)

- In-warranty vs out-of-warranty OEM board work (untested).
- Landlord-paid vs occupant-paid (untested).
- Fridge sealed-system (313A-gated) vs “it just needs a start relay” (untested).

## Cheapest next test if ADMIT or UNKNOWN

Not applicable — G2 fail. Do not spend on 445A or DA for this pond.
