/**
 * Business Client obstacles — ranked "Right now I can't…" gaps.
 * Consolidated to earned/world-true can'ts only (splinters & meta audits removed).
 * Rank 1 = most critical. Status reflects Register click-through (Business Client desk).
 */
import type { PersonaObstacle } from "./personaObstacle";

export type { ObstacleStatus, PersonaObstacle } from "./personaObstacle";
/** @deprecated Prefer PersonaObstacle */
export type BusinessClientObstacle = PersonaObstacle;

/**
 * Earned can'ts only. Completing one = inhabit it on the BC desk click-through,
 * then write `how` as the path a human takes in the product.
 */
export const BUSINESS_CLIENT_OBSTACLES: PersonaObstacle[] = [
  {
    id: "bc-o-reclaim",
    rank: 1,
    cant: "Right now I can't reclaim unspent hold in one clear, effortless action.",




    howParts: [
      { text: "Client looks at " },
      { text: "Client nav", holonId: "bc-ct-sidebar" },
      { text: " on " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: " and finds " },
      { text: "Reclaim unspent", holonId: "bc-ct-reclaim" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-reclaim",
    holonIds: ["bc-ct-reclaim"],
    status: "done",
  },
  {
    id: "bc-o-held-released",
    rank: 2,
    cant: "Right now I can't compare held vs released escrow without digging.",




    howParts: [
      { text: "Client opens " },
      { text: "Client nav", holonId: "bc-ct-sidebar" },
      { text: " and finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-meeting-history",
    rank: 3,
    cant: "Right now I can't see a full history of every meeting that was booked against my escrow.",




    howParts: [
      { text: "Client opens " },
      { text: "Client nav", holonId: "bc-ct-sidebar" },
      { text: " and finds " },
      { text: "Meetings", holonId: "bc-ct-meetings" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meetings",
    holonIds: ["bc-ct-meetings"],
    status: "done",
  },
  {
    id: "bc-o-open-past-meeting",
    rank: 4,
    cant: "Right now I can't open a past meeting and see who showed, who no-showed, and whether money released.",




    howParts: [
      { text: "Client looks at " },
      { text: "Meetings", holonId: "bc-ct-meetings" },
      { text: " on " },
      { text: "Meeting row", holonId: "bc-ct-meeting-row" },
      { text: " and finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-dispute-easy",
    rank: 5,
    cant: "Right now I can't dispute a bad meeting without feeling like I'm fighting the platform.",




    howParts: [
      { text: "Client finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-low-motion",
    rank: 6,
    cant: "Right now I can't get an honest “zero bookings this week” signal instead of activity noise.",




    howParts: [
      { text: "Client finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-adjust-reclaim",
    rank: 7,
    cant: "Right now I can't choose adjust-or-reclaim when a campaign goes quiet.",




    howParts: [
      { text: "Client is in " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: ", " },
      { text: "Reclaim unspent", holonId: "bc-ct-reclaim" },
      { text: " and " },
      { text: "Stop campaign", holonId: "bc-ct-stop" },
      { text: " and finds " },
      { text: "Request Operator", holonId: "bc-ct-operator-request" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-operator-request",
    holonIds: ["bc-ct-operator-request"],
    status: "done",
  },
  {
    id: "bc-o-prove-ops",
    rank: 8,
    cant: "Right now I can't prove to myself that ops never spent my hold — and that releases go to Worker labor.",




    howParts: [
      { text: "Client finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-rules-locked",
    rank: 9,
    cant: "Right now I can't tell if Operator changed rules after I funded (and I shouldn't have to fear that).",




    howParts: [
      { text: "Client looks at " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " on " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "bc-ct-details" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-details",
    holonIds: ["bc-ct-details"],
    status: "done",
  },
  {
    id: "bc-o-release-receipts-ledger",
    rank: 10,
    cant: "Right now I can't see every release receipt in one ledger, meeting by meeting.",




    howParts: [
      { text: "Client opens " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: " and finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-quality-queue",
    rank: 11,
    cant: "Right now I can't review no-shows and disputed meetings as a dedicated quality set.",




    howParts: [
      { text: "Client finds " },
      { text: "Meetings", holonId: "bc-ct-meetings" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meetings",
    holonIds: ["bc-ct-meetings"],
    status: "done",
  },
  {
    id: "bc-o-attach-evidence",
    rank: 12,
    cant: "Right now I can't attach evidence when I say a meeting didn't count.",




    howParts: [
      { text: "Client finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-dispute-status",
    rank: 13,
    cant: "Right now I can't see dispute status without chasing someone.",




    howParts: [
      { text: "Client is in " },
      { text: "Meetings", holonId: "bc-ct-meetings" },
      { text: ", " },
      { text: "Meeting row", holonId: "bc-ct-meeting-row" },
      { text: " and " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: " and finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-silence-meaning",
    rank: 14,
    cant: "Right now I can't see whether silence means Worker hasn't started, overload, or the angle is dead.",




    howParts: [
      { text: "Client finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-hold-days",
    rank: 15,
    cant: "Right now I can't tell how many days remain before my hold can be reclaimed.",




    howParts: [
      { text: "Client opens " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: " and finds " },
      { text: "Reclaim unspent", holonId: "bc-ct-reclaim" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-reclaim",
    holonIds: ["bc-ct-reclaim"],
    status: "done",
  },
  {
    id: "bc-o-stop-clear",
    rank: 16,
    cant: "Right now I can't stop a campaign without wondering if money is still trapped — or what happens to in-flight meetings.",




    howParts: [
      { text: "Client is in " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: ", " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: " and " },
      { text: "Stop campaign", holonId: "bc-ct-stop" },
      { text: " and finds " },
      { text: "Reclaim unspent", holonId: "bc-ct-reclaim" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-reclaim",
    holonIds: ["bc-ct-reclaim"],
    status: "done",
  },
  {
    id: "bc-o-my-campaigns",
    rank: 17,
    cant: "Right now I can't land on a simple “my campaigns” home for invited, held, running, stopped, and reclaimed vessels.",




    howParts: [
      { text: "Client looks at " },
      { text: "Client nav", holonId: "bc-ct-sidebar" },
      { text: " on " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " and finds " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-vessel-row",
    holonIds: ["bc-ct-vessel-row"],
    status: "done",
  },
  {
    id: "bc-o-price-remaining",
    rank: 18,
    cant: "Right now I can't see price-per-meeting and remaining meetings × $ left on the vessel.",




    howParts: [
      { text: "Client looks at " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " on " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: " and finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-precall-upcoming",
    rank: 19,
    cant: "Right now I can't open upcoming pre-call packets in one list without living in the app.",




    howParts: [
      { text: "Client looks at " },
      { text: "Meetings", holonId: "bc-ct-meetings" },
      { text: " on " },
      { text: "Meeting row", holonId: "bc-ct-meeting-row" },
      { text: " and finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-brand-exclusions",
    rank: 20,
    cant: "Right now I can't protect my brand — block logos, keep Worker off existing customers, persist do-not-contact.",




    howParts: [
      { text: "Client looks at " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " on " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: " and finds " },
      { text: "Firms sheet", holonId: "bc-ct-firms" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-firms",
    holonIds: ["bc-ct-firms"],
    status: "done",
  },
  {
    id: "bc-o-firm-list",
    rank: 21,
    cant: "Right now I can't see firms being worked, touched vs queued, and remove one that would embarrass me.",




    howParts: [
      { text: "Client opens " },
      { text: "Firms sheet", holonId: "bc-ct-firms" },
      { text: " and finds " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-campaigns",
    holonIds: ["bc-ct-campaigns"],
    status: "done",
  },
  {
    id: "bc-o-icp-beside-firms",
    rank: 22,
    cant: "Right now I can't see locked ICP rules next to the live firm list.",




    howParts: [
      { text: "Client finds " },
      { text: "Firms sheet", holonId: "bc-ct-firms" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-firms",
    holonIds: ["bc-ct-firms"],
    status: "done",
  },
  {
    id: "bc-o-meeting-alerts-only",
    rank: 23,
    cant: "Right now I can't get notified only for meetings and money — never activity vanity.",




    howParts: [
      { text: "Client opens " },
      { text: "Alerts", holonId: "bc-ct-alerts" },
      { text: " and finds " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-campaigns",
    holonIds: ["bc-ct-campaigns"],
    status: "done",
  },
  {
    id: "bc-o-filter-export",
    rank: 24,
    cant: "Right now I can't filter meeting history or export a simple meetings + escrow statement for finance or board.",




    howParts: [
      { text: "Client opens " },
      { text: "Meetings", holonId: "bc-ct-meetings" },
      { text: " and finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-forward-packet",
    rank: 25,
    cant: "Right now I can't forward a meeting packet to my AE without chaos.",




    howParts: [
      { text: "Client finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-fit-and-approve",
    rank: 26,
    cant: "Right now I can't confirm fit vs locked rules at a glance — or one-tap accept a borderline meeting.",




    howParts: [
      { text: "Client finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-pause",
    rank: 27,
    cant: "Right now I can't pause outreach (budget freeze / holiday) without killing escrow or looking like I abandoned it.",




    howParts: [
      { text: "Client opens " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " and finds " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-vessel-row",
    holonIds: ["bc-ct-vessel-row"],
    status: "done",
  },
  {
    id: "bc-o-worker-quality",
    rank: 28,
    cant: "Right now I can't see Worker quality (clean vs disputed) or refuse a pattern that burns my TAM — including asking for a different Worker.",




    howParts: [
      { text: "Client looks at " },
      { text: "Details sheet", holonId: "bc-ct-details" },
      { text: " on " },
      { text: "Request Operator", holonId: "bc-ct-operator-request" },
      { text: " and finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-team-roles",
    rank: 29,
    cant: "Right now I can't invite a viewer or split who gets packets vs who controls money.",




    howParts: [
      { text: "Client finds " },
      { text: "Details sheet", holonId: "bc-ct-details" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-details",
    holonIds: ["bc-ct-details"],
    status: "done",
  },
  {
    id: "bc-o-escrow-custodian",
    rank: 30,
    cant: "Right now I can't tell that the escrow custodian (Escrow.com stand-in) still holds my capital safely.",




    howParts: [
      { text: "Client finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-review-terms-next",
    rank: 31,
    cant: "Right now I can't walk vessel terms again before a second fund — or see what changed vs last vessel.",




    howParts: [
      { text: "Client looks at " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " on " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "bc-ct-details" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-details",
    holonIds: ["bc-ct-details"],
    status: "done",
  },
  {
    id: "bc-o-next-campaign",
    rank: 32,
    cant: "Right now I can't request Operator to spin a next campaign without a sales-call maze.",




    howParts: [
      { text: "Client finds " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-campaigns",
    holonIds: ["bc-ct-campaigns"],
    status: "done",
  },
  {
    id: "bc-o-compare-time",
    rank: 33,
    cant: "Right now I can't compare campaigns on meetings per dollar or see time-to-first-meeting after launch.",




    howParts: [
      { text: "Client opens " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " and finds " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-vessel-row",
    holonIds: ["bc-ct-vessel-row"],
    status: "done",
  },
  {
    id: "bc-o-talk-tracks",
    rank: 34,
    cant: "Right now I can't see brand-risk copy / sample outreach before it hits my market — without a chat product.",




    howParts: [
      { text: "Client opens " },
      { text: "Talk tracks", holonId: "bc-ct-talk" },
      { text: " and finds " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-campaigns",
    holonIds: ["bc-ct-campaigns"],
    status: "done",
  },
  {
    id: "bc-o-funded-not-launched",
    rank: 35,
    cant: "Right now I can't tell if my hold is funded-but-not-launched vs in Worker hands.",




    howParts: [
      { text: "Client opens " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " and finds " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-vessel-row",
    holonIds: ["bc-ct-vessel-row"],
    status: "done",
  },
  {
    id: "bc-o-pricing-rationale",
    rank: 36,
    cant: "Right now I can't re-read why this $/meeting was sized after I've funded.",




    howParts: [
      { text: "Client finds " },
      { text: "Details sheet", holonId: "bc-ct-details" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-details",
    holonIds: ["bc-ct-details"],
    status: "done",
  },
  {
    id: "bc-o-dispute-integrity",
    rank: 37,
    cant: "Right now I can't tell who adjudicates disputes or escalate when Operator has a conflict — impartial escrow-shaped review.",




    howParts: [
      { text: "Client finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-brand-vs-escrow",
    rank: 38,
    cant: "Right now I can't separate a brand complaint (tacky outreach) from an escrow dispute (meeting didn't count).",




    howParts: [
      { text: "Client opens " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: " and finds " },
      { text: "Firms sheet", holonId: "bc-ct-firms" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-firms",
    holonIds: ["bc-ct-firms"],
    status: "done",
  },
  {
    id: "bc-o-cancel-before-release",
    rank: 39,
    cant: "Right now I can't cancel a booked meeting before money releases without a mess.",




    howParts: [
      { text: "Client finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-escalate-operator",
    rank: 40,
    cant: "Right now I can't reach the Operator for a human low-motion conversation without a CS ticket product.",




    howParts: [
      { text: "Client opens " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: " and finds " },
      { text: "Request Operator", holonId: "bc-ct-operator-request" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-operator-request",
    holonIds: ["bc-ct-operator-request"],
    status: "done",
  },
  {
    id: "bc-o-capital-across",
    rank: 41,
    cant: "Right now I can't see how much pipeline budget is tied across all holds at once.",




    howParts: [
      { text: "Client opens " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " and finds " },
      { text: "Escrow", holonId: "bc-ct-escrow" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-escrow",
    holonIds: ["bc-ct-escrow"],
    status: "done",
  },
  {
    id: "bc-o-overbook",
    rank: 42,
    cant: "Right now I can't hard-stop at N meetings — no silent overage releases.",




    howParts: [
      { text: "Client looks at " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " on " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: " and finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-duplicate-release",
    rank: 43,
    cant: "Right now I can't catch a duplicate booking of the same prospect releasing escrow twice.",




    howParts: [
      { text: "Client finds " },
      { text: "Meeting sheet", holonId: "bc-ct-meeting-sheet" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-meeting-sheet",
    holonIds: ["bc-ct-meeting-sheet"],
    status: "done",
  },
  {
    id: "bc-o-invite-lifecycle",
    rank: 44,
    cant: "Right now I can't find or cleanly decline an invite I didn't fund yet.",




    howParts: [
      { text: "Client opens " },
      { text: "Campaigns", holonId: "bc-ct-campaigns" },
      { text: " and finds " },
      { text: "Vessel row", holonId: "bc-ct-vessel-row" },
      { text: "." },
    ],
    focusHolonId: "bc-ct-vessel-row",
    holonIds: ["bc-ct-vessel-row"],
    status: "done",
  },
];

