/**
 * Non-business Client (Guest) obstacles — ranked "Right now I can't…"
 * Pre-fund seat only. Rank 1 = most critical.
 * Status reflects GuestVessel click-through (Invite → Walk → Fund → Receipt).
 */
import type { PersonaObstacle } from "./personaObstacle";

export const NON_BUSINESS_CLIENT_OBSTACLES: PersonaObstacle[] = [
  {
    id: "nb-o-qualified-definition",
    rank: 1,
    cant: "Right now I can't see exactly what counts as a qualified meeting before I fund.",

    howParts: [
      { text: "Guest opens " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Terms sheet", holonId: "guest-ct-terms" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-terms",
    holonIds: ["guest-ct-terms"],
    status: "done",
  },
  {
    id: "nb-o-price-locked",
    rank: 2,
    cant: "Right now I can't see price-per-meeting locked next to who must show up.",

    howParts: [
      { text: "Guest opens " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-escrow-not-ops",
    rank: 3,
    cant: "Right now I can't see where my money will sit (true escrow hold, not ops).",

    howParts: [
      { text: "Guest opens " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " and finds " },
      { text: "Escrow", holonId: "guest-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-escrow",
    holonIds: ["guest-ct-escrow"],
    status: "done",
  },
  {
    id: "nb-o-release-per-meeting",
    rank: 4,
    cant: "Right now I can't see that release is per booked qualified meeting only.",

    howParts: [
      { text: "Guest opens " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-fund",
    holonIds: ["guest-ct-fund"],
    status: "done",
  },
  {
    id: "nb-o-unspent-returns",
    rank: 5,
    cant: "Right now I can't see how unspent capital comes back if nothing books.",

    howParts: [
      { text: "Guest looks at " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " on " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " and finds " },
      { text: "Escrow", holonId: "guest-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-escrow",
    holonIds: ["guest-ct-escrow"],
    status: "done",
  },
  {
    id: "nb-o-hold-window",
    rank: 6,
    cant: "Right now I can't see the hold / vesting window before reclaim is allowed.",

    howParts: [
      { text: "Guest opens " },
      { text: "Guest vessel", holonId: "guest-ct-desk" },
      { text: " and finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-not-onboarding-fee",
    rank: 7,
    cant: "Right now I can't tell this isn't a non-refundable onboarding fee.",

    howParts: [
      { text: "Guest finds " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-fund",
    holonIds: ["guest-ct-fund"],
    status: "done",
  },
  {
    id: "nb-o-operator-acv",
    rank: 8,
    cant: "Right now I can't judge whether the Operator understands my ACV.",

    howParts: [
      { text: "Guest finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-honest-price",
    rank: 9,
    cant: "Right now I can't judge whether $/meeting is honest for my ICP.",

    howParts: [
      { text: "Guest finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-why-company",
    rank: 10,
    cant: "Right now I can't hear why this company was selected — not a house rate.",

    howParts: [
      { text: "Guest finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-walk-not-forms",
    rank: 11,
    cant: "Right now I can't walk the vessel with the Operator without drowning in forms.",

    howParts: [
      { text: "Guest opens " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-walk-away",
    rank: 12,
    cant: "Right now I can't walk away cleanly without feeling trapped in a funnel.",

    howParts: [
      { text: "Guest opens " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: " and finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-n-times-price",
    rank: 13,
    cant: "Right now I can't see how many meetings this vessel is for (N × $).",

    howParts: [
      { text: "Guest opens " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-fund",
    holonIds: ["guest-ct-fund"],
    status: "done",
  },
  {
    id: "nb-o-seniority-length",
    rank: 14,
    cant: "Right now I can't see seniority and meeting length locked before money moves.",

    howParts: [
      { text: "Guest opens " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-conversion-receipt",
    rank: 15,
    cant: "Right now I can't get a conversion receipt that I'm now a Business Client.",

    howParts: [
      { text: "Guest opens " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " and finds " },
      { text: "Converted receipt", holonId: "guest-ct-converted" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-converted",
    holonIds: ["guest-ct-converted"],
    status: "done",
  },
  {
    id: "nb-o-guest-ends",
    rank: 16,
    cant: "Right now I can't tell Guest chrome ends the moment I fund.",

    howParts: [
      { text: "Guest finds " },
      { text: "Converted receipt", holonId: "guest-ct-converted" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-converted",
    holonIds: ["guest-ct-converted"],
    status: "done",
  },
  {
    id: "nb-o-no-create",
    rank: 17,
    cant: "Right now I can't fund without creating a campaign myself (and I refuse to).",

    howParts: [
      { text: "Guest finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-operator-prepared",
    rank: 18,
    cant: "Right now I can't tell Operator prepared this — I didn't invent it.",

    howParts: [
      { text: "Guest finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-hold-one-number",
    rank: 19,
    cant: "Right now I can't see total escrow hold as one number before I commit.",

    howParts: [
      { text: "Guest finds " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-fund",
    holonIds: ["guest-ct-fund"],
    status: "done",
  },
  {
    id: "nb-o-after-fund-path",
    rank: 20,
    cant: "Right now I can't see what happens immediately after fund (launch → Worker).",

    howParts: [
      { text: "Guest finds " },
      { text: "Converted receipt", holonId: "guest-ct-converted" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-converted",
    holonIds: ["guest-ct-converted"],
    status: "done",
  },
  {
    id: "nb-o-noshow-dont-count",
    rank: 21,
    cant: "Right now I can't see that no-shows and gatekeeper brush-offs don't count.",

    howParts: [
      { text: "Guest opens " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Terms sheet", holonId: "guest-ct-terms" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-terms",
    holonIds: ["guest-ct-terms"],
    status: "done",
  },
  {
    id: "nb-o-decline-lapse",
    rank: 22,
    cant: "Right now I can't decline / let the invite lapse without a broken state.",

    howParts: [
      { text: "Guest finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-vague-nudge",
    rank: 23,
    cant: "Right now I can't fund without feeling nudged into a vague vessel.",

    howParts: [
      { text: "Guest looks at " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " on " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: " and finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-custodian-label",
    rank: 24,
    cant: "Right now I can't see Escrow.com-shaped (or stand-in) custodianship labeled.",

    howParts: [
      { text: "Guest opens " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " and finds " },
      { text: "Escrow", holonId: "guest-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-escrow",
    holonIds: ["guest-ct-escrow"],
    status: "done",
  },
  {
    id: "nb-o-dispute-owner",
    rank: 25,
    cant: "Right now I can't see who owns disputes if a later meeting is contested.",

    howParts: [
      { text: "Guest opens " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " and finds " },
      { text: "Escrow", holonId: "guest-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-escrow",
    holonIds: ["guest-ct-escrow"],
    status: "done",
  },
  {
    id: "nb-o-contract-one-screen",
    rank: 26,
    cant: "Right now I can't re-read the full contract terms on one screen before Fund.",

    howParts: [
      { text: "Guest is in " },
      { text: "Terms sheet", holonId: "guest-ct-terms" },
      { text: ", " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: " and finds " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-fund",
    holonIds: ["guest-ct-fund"],
    status: "done",
  },
  {
    id: "nb-o-dead-simple-sentence",
    rank: 27,
    cant: "Right now I can't get a dead-simple lawyer-style sentence for the deal.",

    howParts: [
      { text: "Guest finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-no-fluff-sell",
    rank: 28,
    cant: "Right now I can't tell if impressions / deliverability / brand fluff is being sold.",

    howParts: [
      { text: "Guest finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-no-cs-cheer",
    rank: 29,
    cant: "Right now I can't silence CS cheerleader energy before I even fund.",

    howParts: [
      { text: "Guest finds " },
      { text: "Guest vessel", holonId: "guest-ct-desk" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-desk",
    holonIds: ["guest-ct-desk"],
    status: "done",
  },
  {
    id: "nb-o-live-reprice",
    rank: 30,
    cant: "Right now I can't ask for a price change live when the dossier feels wrong.",

    howParts: [
      { text: "Guest finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-swap-company",
    rank: 31,
    cant: "Right now I can't swap the target company on the call when fit is off.",

    howParts: [
      { text: "Guest finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-firm-list-readonly",
    rank: 32,
    cant: "Right now I can't see the firm/TAM list I'll be buying meetings from (read-only).",

    howParts: [
      { text: "Guest opens " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: " and finds " },
      { text: "Firms sheet", holonId: "guest-ct-firms" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-firms",
    holonIds: ["guest-ct-firms"],
    status: "done",
  },
  {
    id: "nb-o-remove-logo",
    rank: 33,
    cant: "Right now I can't remove a logo that would embarrass me before I fund.",

    howParts: [
      { text: "Guest opens " },
      { text: "Firms sheet", holonId: "guest-ct-firms" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-add-logo",
    rank: 34,
    cant: "Right now I can't add a must-have logo before I fund (or request it).",

    howParts: [
      { text: "Guest opens " },
      { text: "Firms sheet", holonId: "guest-ct-firms" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-partial-n",
    rank: 35,
    cant: "Right now I can't fund partial N (e.g. 2 of 4) if I want a smaller bet.",

    howParts: [
      { text: "Guest finds " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-fund",
    holonIds: ["guest-ct-fund"],
    status: "done",
  },
  {
    id: "nb-o-payment-instrument",
    rank: 36,
    cant: "Right now I can't pay with my preferred instrument into that hold.",

    howParts: [
      { text: "Guest finds " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-fund",
    holonIds: ["guest-ct-fund"],
    status: "done",
  },
  {
    id: "nb-o-cofounder-review",
    rank: 37,
    cant: "Right now I can't invite a cofounder to review terms before I fund.",

    howParts: [
      { text: "Guest finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-save-return",
    rank: 38,
    cant: "Right now I can't save the invite and return later with terms unchanged.",

    howParts: [
      { text: "Guest finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-invite-expiry",
    rank: 39,
    cant: "Right now I can't tell the invite expired or still stands.",

    howParts: [
      { text: "Guest finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-operator-credibility",
    rank: 40,
    cant: "Right now I can't see Operator name/credibility tied to this vessel.",

    howParts: [
      { text: "Guest opens " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-worker-runs",
    rank: 41,
    cant: "Right now I can't see that a Worker — not me — will run outreach.",

    howParts: [
      { text: "Guest opens " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: " and finds " },
      { text: "Converted receipt", holonId: "guest-ct-converted" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-converted",
    holonIds: ["guest-ct-converted"],
    status: "done",
  },
  {
    id: "nb-o-no-chat-tax",
    rank: 42,
    cant: "Right now I can't confirm there is no Worker chat tax after I convert.",

    howParts: [
      { text: "Guest finds " },
      { text: "Converted receipt", holonId: "guest-ct-converted" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-converted",
    holonIds: ["guest-ct-converted"],
    status: "done",
  },
  {
    id: "nb-o-sample-packet",
    rank: 43,
    cant: "Right now I can't see a sample meeting packet / calendar shape before I fund.",

    howParts: [
      { text: "Guest finds " },
      { text: "Firms sheet", holonId: "guest-ct-firms" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-firms",
    holonIds: ["guest-ct-firms"],
    status: "done",
  },
  {
    id: "nb-o-sample-receipt",
    rank: 44,
    cant: "Right now I can't see a sample release receipt before I fund.",

    howParts: [
      { text: "Guest finds " },
      { text: "Firms sheet", holonId: "guest-ct-firms" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-firms",
    holonIds: ["guest-ct-firms"],
    status: "done",
  },
  {
    id: "nb-o-no-marketing-signup",
    rank: 45,
    cant: "Right now I can't fund without marketing email / QBR signup.",

    howParts: [
      { text: "Guest opens " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " and finds " },
      { text: "Guest vessel", holonId: "guest-ct-desk" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-desk",
    holonIds: ["guest-ct-desk"],
    status: "done",
  },
  {
    id: "nb-o-no-peer-network",
    rank: 46,
    cant: "Right now I can't keep this off peer networks / community surfaces.",

    howParts: [
      { text: "Guest opens " },
      { text: "Guest vessel", holonId: "guest-ct-desk" },
      { text: " and finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-export-terms",
    rank: 47,
    cant: "Right now I can't export the vessel terms for my lawyer before funding.",

    howParts: [
      { text: "Guest opens " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " and finds " },
      { text: "Terms sheet", holonId: "guest-ct-terms" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-terms",
    holonIds: ["guest-ct-terms"],
    status: "done",
  },
  {
    id: "nb-o-currency-tax",
    rank: 48,
    cant: "Right now I can't see currency and tax treatment of the hold.",

    howParts: [
      { text: "Guest opens " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " and finds " },
      { text: "Escrow", holonId: "guest-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-escrow",
    holonIds: ["guest-ct-escrow"],
    status: "done",
  },
  {
    id: "nb-o-calendar-bind",
    rank: 49,
    cant: "Right now I can't set which calendar gets future meetings after convert.",

    howParts: [
      { text: "Guest finds " },
      { text: "Converted receipt", holonId: "guest-ct-converted" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-converted",
    holonIds: ["guest-ct-converted"],
    status: "done",
  },
  {
    id: "nb-o-pdf-who-counts",
    rank: 50,
    cant: "Right now I can't bind funding to a written “who counts” PDF I keep.",

    howParts: [
      { text: "Guest opens " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " and finds " },
      { text: "Terms sheet", holonId: "guest-ct-terms" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-terms",
    holonIds: ["guest-ct-terms"],
    status: "done",
  },
  {
    id: "nb-o-challenge-icp",
    rank: 51,
    cant: "Right now I can't challenge ICP realism without killing the whole invite.",

    howParts: [
      { text: "Guest opens " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: " and finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-offer-window",
    rank: 52,
    cant: "Right now I can't see time pressure (offer window) without fake urgency theater.",

    howParts: [
      { text: "Guest finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
  {
    id: "nb-o-demo-notes",
    rank: 53,
    cant: "Right now I can't tell demo-call notes are reflected in the locked vessel.",

    howParts: [
      { text: "Guest finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-redo-walk",
    rank: 54,
    cant: "Right now I can't redo Walk if Fund still feels ambiguous.",

    howParts: [
      { text: "Guest looks at " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " on " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-no-activity-later",
    rank: 55,
    cant: "Right now I can't see that activity metrics will never be sold to me later.",

    howParts: [
      { text: "Guest opens " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: " and finds " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-fund",
    holonIds: ["guest-ct-fund"],
    status: "done",
  },
  {
    id: "nb-o-risk-mitigated-feel",
    rank: 56,
    cant: "Right now I can't feel this is a risk-mitigated asset — not marketing spend.",

    howParts: [
      { text: "Guest looks at " },
      { text: "Fund escrow", holonId: "guest-ct-fund" },
      { text: " on " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Escrow", holonId: "guest-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-escrow",
    holonIds: ["guest-ct-escrow"],
    status: "done",
  },
  {
    id: "nb-o-enrich-past-verdict",
    rank: 57,
    cant: "Right now I can't see that enrich already happened (or why I'm past verdict).",

    howParts: [
      { text: "Guest opens " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: " and finds " },
      { text: "Firms sheet", holonId: "guest-ct-firms" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-firms",
    holonIds: ["guest-ct-firms"],
    status: "done",
  },
  {
    id: "nb-o-compare-agency-risk",
    rank: 58,
    cant: "Right now I can't compare this offer to agency retainer + strategy-deck risk.",

    howParts: [
      { text: "Guest finds " },
      { text: "Details sheet", holonId: "guest-ct-details" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-details",
    holonIds: ["guest-ct-details"],
    status: "done",
  },
  {
    id: "nb-o-target-without-theater",
    rank: 59,
    cant: "Right now I can't see target company/profile without Operator theater.",

    howParts: [
      { text: "Guest finds " },
      { text: "Invite campaigns", holonId: "guest-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "guest-ct-invite",
    holonIds: ["guest-ct-invite"],
    status: "done",
  },
];
