# Market: Commercial kitchen / restaurant equipment service (GTA)

- Slug: `commercial-kitchen-restaurant-equipment`
- Pond type: food-premise operators paying for repair of cooking, warewash, and refrigeration equipment, plus independent TSSA/313A service shops.
- Verdict: KILL
- Confidence in verdict: high
- $50k vs pool: <<1% vs Ontario NAICS 7225 27,703 employer restaurants/limited-service places (2025) plus Toronto ~20k inspected food premises. Size is not the failure.
- Primary buyer species: restaurant owner, chef-operator, or kitchen manager; hotel/catering facilities manager.
- January access: fail
- Seasonality: year-round; hospitality downtime is nights/mornings, not a closed winter.

## Gates

| Gate | Status | Evidence (with URL) | Note |
|------|--------|---------------------|------|
| G1 Size | pass | ISED CIS NAICS 7225 (2025): Ontario **27,703 employer** + **9,248 non-employer** full-service and limited-service eating places. https://ised-isde.canada.ca/app/ixb/cis/businesses-entreprises/7225 NAICS 7223 special food services Ontario 1,654 employers + 3,542 non-employers. https://ised-isde.canada.ca/app/ixb/cis/businesses-entreprises/7223 NAICS 7224 drinking places Ontario 528 + 292. Aggregators of Toronto DineSafe: ~20,140–20,471 food premises. https://verdine.app/restaurants/ https://localhealthinspections.com/regions/toronto | Thousands of independent buyers. $50k is not a noticeable share of kitchen-equipment service spend across that stock. Official open.toronto.ca DineSafe page returned “Retired” when fetched 2026-09-29; use ISED counts as primary. |
| G2 30h economics | pass | CanFix Technical Services (Pickering, commercial gas/electrical kitchen): **service call $220 first hour** (includes truck/travel), then **$105/h**; after-hours $330 / $157.50. https://www.canfixts.com/ Commercial refrigeration: Home Trade Standards service call $180+HST; Cold Fuel service call $169, compressor from $699. https://www.hometradestandards.com/services/commercial-refrigeration-repair-services-toronto/ https://coldfuel.ca/repair-services/commercial-refrigeration-repair/ | Shop-door rates, not wages. $220 first-hour clears the $60–$100 delivered band **if ticketed**. |
| G3 Reachable buyers | pass | Premises are named in DineSafe-style directories; owners/managers answer a published phone. Service shops publish dispatch numbers. | Not a tender-only or platform-only buyer set. |
| G4 Price/unit | pass | CanFix published rate card; refrigeration shops publish $169–$180 call-outs. | |
| G5 January technical access | fail | **Gas cooking / gas steamers / gas ovens:** G.2 (or G.1) + TSSA contractor registration. G.2 clock overruns January (see HVAC file: 33-week NATS diploma after G.3; Conestoga G.2 is five 7-week evening blocks). https://nats.ca/programs/gas-technician2/ https://www.ontario.ca/laws/regulation/r01215 **Walk-ins, reach-ins, ice machines:** 313A compulsory, 9,000h. Apex Electric and Mechanical (GTA) states Ontario requires 313A for refrigerant systems. https://www.skilledtradesontario.ca/trade-information/refrigeration-and-air-conditioning-systems-mechanic/ https://apexelectricmechanical.ca/services/commercial-refrigeration/ **Line-voltage hardwire:** ESA LEC / 309A. https://esasafe.com/contractors/licensed-electrical-contractor/get-your-licence/ Electric plug-in cooking and some warewash/espresso is closer to non-compulsory 445A, but that is a slice, not this pond. | Core paid work in this pond is gas + refrigeration. January independent access fails. |
| G6 Heterogeneity | pass | Ranges, ovens, pizza ovens, fryers, steamers, dishwashers, espresso, heat lamps, reach-ins, walk-ins, ice machines. CanFix lists gas/electrical, pizza ovens, coffee shops, dishwashers, heat lamps. https://www.canfixts.com/ | Many job classes. |
| G7 Fragmentation | pass | Multiple small GTA independents (CanFix, Cold Fuel, Certified Mechanical, Home Trade Standards) plus some OEM warranty dealers (CanFix: Amana warranty). | Not a single platform or one OEM monopoly on all kitchen service. Warranty work may be brand-locked; that is a subset. |
| G8 Concentration | pass | 20k+ Toronto food premises; Ontario tens of thousands of 722 establishments. Chains exist but independents dominate counts (ISED 7225 micro+small). | |
| G9 Seasonality | pass | Kitchens run through winter. | |
| G10 Regulatory | fail | Same G.2 / 313A / ESA clocks as G5. O. Reg. 212/01 s.21 contractor registration for gaseous-fuel appliance businesses. https://www.ontario.ca/laws/regulation/010212 Unlicensed gas or refrigerant work is illegal. | |

## What this pond is

A large, reachable hospitality-equipment repair market. Operators already pay $169–$220 to open a ticket. Supply includes TSSA-certified kitchen-equipment independents and 313A refrigeration shops. The legal core is gas appliances (G.2) and refrigerant systems (313A).

## What we are not claiming

No “restaurant PM round” proposition. No claim that electric-only espresso/dishwasher work is the whole pond. No claim that CanFix’s rate card is a business plan.

## Problem-class hypotheses (untested, not admission criteria)

- Same-day gas range / oven failure during service (untested).
- Walk-in product-loss emergencies (untested; 313A-gated).
- Electric-only warewash / espresso / heat-lamp slice that might have a different G5 picture (untested; would be a **different pond**, not an admission of this one).

## Cheapest next test if ADMIT or UNKNOWN

Not applicable — G5/G10 fail on the pond as specified. A cheap later count (if someone reopens the electric-only slice): sample 30 DineSafe restaurants for gas vs electric primary cooking and who they call for espresso vs range.
