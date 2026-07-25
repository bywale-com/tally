/**
 * Worker obstacles — ranked "Right now I can't…"
 * Meeting-closer seat. Rank 1 = most critical.
 */
import type { PersonaObstacle } from "./personaObstacle";

export const WORKER_OBSTACLES: PersonaObstacle[] = [
  {
    id: "wk-o-ready-queue",
    rank: 1,
    cant: "Right now I can't see only launched ∧ unclaimed campaigns — ready to run.",

    howParts: [
      { text: "Worker opens " },
      { text: "Worker desk", holonId: "worker-ct-desk" },
      { text: " and finds " },
      { text: "Available queue", holonId: "worker-ct-available" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-available",
    holonIds: ["worker-ct-available"],
    status: "done",
  },
  {
    id: "wk-o-locked-rules",
    rank: 2,
    cant: "Right now I can't read locked meeting rules once and trust they won't move after I book.",

    howParts: [
      { text: "Worker looks at " },
      { text: "Begin vessel", holonId: "worker-ct-claimed" },
      { text: " on " },
      { text: "Active manage", holonId: "worker-ct-active" },
      { text: " and finds " },
      { text: "Details sheet", holonId: "worker-ct-details" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-details",
    holonIds: ["worker-ct-details"],
    status: "done",
  },
  {
    id: "wk-o-claim-exclusive",
    rank: 3,
    cant: "Right now I can't claim a campaign so it's exclusively mine instantly.",

    howParts: [
      { text: "Worker looks at " },
      { text: "Available queue", holonId: "worker-ct-available" },
      { text: " on " },
      { text: "Available vessel", holonId: "worker-ct-vessel-card" },
      { text: " and finds " },
      { text: "Begin vessel", holonId: "worker-ct-claimed" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-claimed",
    holonIds: ["worker-ct-claimed"],
    status: "done",
  },
  {
    id: "wk-o-begin-cheap",
    rank: 4,
    cant: "Right now I can't begin work without a checklist tax.",

    howParts: [
      { text: "Worker opens " },
      { text: "Begin vessel", holonId: "worker-ct-claimed" },
      { text: " and finds " },
      { text: "Active manage", holonId: "worker-ct-active" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-active",
    holonIds: ["worker-ct-active"],
    status: "done",
  },
  {
    id: "wk-o-log-meeting",
    rank: 5,
    cant: "Right now I can't log a booked meeting with who, role, company, time, pain.",

    howParts: [
      { text: "Worker opens " },
      { text: "Active manage", holonId: "worker-ct-active" },
      { text: " and finds " },
      { text: "Log meeting", holonId: "worker-ct-log" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-log",
    holonIds: ["worker-ct-log"],
    status: "done",
  },
  {
    id: "wk-o-packet-not-chat",
    rank: 6,
    cant: "Right now I can't send the client a meeting packet without becoming their chat partner.",

    howParts: [
      { text: "Worker opens " },
      { text: "Log meeting", holonId: "worker-ct-log" },
      { text: " and finds " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-pipeline",
    holonIds: ["worker-ct-pipeline"],
    status: "done",
  },
  {
    id: "wk-o-booked-n",
    rank: 7,
    cant: "Right now I can't see progress as booked / N — not dial counts.",

    howParts: [
      { text: "Worker finds " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-pipeline",
    holonIds: ["worker-ct-pipeline"],
    status: "done",
  },
  {
    id: "wk-o-release-dead",
    rank: 8,
    cant: "Right now I can't return a dead claim to the available pool.",

    howParts: [
      { text: "Worker opens " },
      { text: "Begin vessel", holonId: "worker-ct-claimed" },
      { text: " and finds " },
      { text: "Available queue", holonId: "worker-ct-available" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-available",
    holonIds: ["worker-ct-available"],
    status: "done",
  },
  {
    id: "wk-o-stop-signal",
    rank: 9,
    cant: "Right now I can't see when the client stops or reclaims so I stop grinding.",

    howParts: [
      { text: "Worker finds " },
      { text: "Active manage", holonId: "worker-ct-active" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-active",
    holonIds: ["worker-ct-active"],
    status: "done",
  },
  {
    id: "wk-o-no-funded-chrome",
    rank: 10,
    cant: "Right now I can't avoid auditing whether the client funded — if it's here, it's ready.",

    howParts: [
      { text: "Worker opens " },
      { text: "Available queue", holonId: "worker-ct-available" },
      { text: " and finds " },
      { text: "Available vessel", holonId: "worker-ct-vessel-card" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-vessel-card",
    holonIds: ["worker-ct-vessel-card"],
    status: "done",
  },
  {
    id: "wk-o-pay-case",
    rank: 11,
    cant: "Right now I can't treat the meeting log as my case for getting paid.",

    howParts: [
      { text: "Worker opens " },
      { text: "Log meeting", holonId: "worker-ct-log" },
      { text: " and finds " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-pipeline",
    holonIds: ["worker-ct-pipeline"],
    status: "open",
  },
  {
    id: "wk-o-dispute-visibility",
    rank: 12,
    cant: "Right now I can't see if a meeting I logged was approved or disputed.",

    howParts: [
      { text: "Worker opens " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: " and finds " },
      { text: "Pipeline meeting", holonId: "worker-ct-meeting-row" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-meeting-row",
    holonIds: ["worker-ct-meeting-row"],
    status: "open",
  },
  {
    id: "wk-o-fast-payout",
    rank: 13,
    cant: "Right now I can't see payout status when escrow releases on my proof.",

    howParts: [
      { text: "Worker looks at " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: " on " },
      { text: "Pipeline meeting", holonId: "worker-ct-meeting-row" },
      { text: " and finds " },
      { text: "Packet peek", holonId: "worker-ct-packet" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-packet",
    holonIds: ["worker-ct-packet"],
    status: "open",
  },
  {
    id: "wk-o-rules-frozen",
    rank: 14,
    cant: "Right now I can't get a hard freeze that criteria can't narrow after I booked in good faith.",

    howParts: [
      { text: "Worker opens " },
      { text: "Details sheet", holonId: "worker-ct-details" },
      { text: " and finds " },
      { text: "Begin vessel", holonId: "worker-ct-claimed" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-claimed",
    holonIds: ["worker-ct-claimed"],
    status: "open",
  },
  {
    id: "wk-o-fair-dispute",
    rank: 15,
    cant: "Right now I can't trust disputes aren't automatically client-favored every time.",

    howParts: [
      { text: "Worker opens " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: " and finds " },
      { text: "Pipeline meeting", holonId: "worker-ct-meeting-row" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-meeting-row",
    holonIds: ["worker-ct-meeting-row"],
    status: "open",
  },
  {
    id: "wk-o-list-quality",
    rank: 16,
    cant: "Right now I can't signal back that the Operator prep/list was thin or unclear.",

    howParts: [
      { text: "Worker opens " },
      { text: "Firms sheet", holonId: "worker-ct-firms" },
      { text: " and finds " },
      { text: "Active manage", holonId: "worker-ct-active" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-active",
    holonIds: ["worker-ct-active"],
    status: "open",
  },
  {
    id: "wk-o-outreach-list",
    rank: 17,
    cant: "Right now I can't work an outreach list of firms against locked rules.",

    howParts: [
      { text: "Worker opens " },
      { text: "Active manage", holonId: "worker-ct-active" },
      { text: " and finds " },
      { text: "Firms sheet", holonId: "worker-ct-firms" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-firms",
    holonIds: ["worker-ct-firms"],
    status: "done",
  },
  {
    id: "wk-o-no-activity-fake",
    rank: 18,
    cant: "Right now I can't refuse to fake activity or pad unqualified meetings.",

    howParts: [
      { text: "Worker opens " },
      { text: "Log meeting", holonId: "worker-ct-log" },
      { text: " and finds " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-pipeline",
    holonIds: ["worker-ct-pipeline"],
    status: "done",
  },
  {
    id: "wk-o-no-client-relationship",
    rank: 19,
    cant: "Right now I can't stay a closer instead of an accidental account manager.",

    howParts: [
      { text: "Worker opens " },
      { text: "Log meeting", holonId: "worker-ct-log" },
      { text: " and finds " },
      { text: "Worker desk", holonId: "worker-ct-desk" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-desk",
    holonIds: ["worker-ct-desk"],
    status: "done",
  },
  {
    id: "wk-o-pipeline-multi",
    rank: 20,
    cant: "Right now I can't see every campaign I've claimed and where each stands.",

    howParts: [
      { text: "Worker opens " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: " and finds " },
      { text: "Worker desk", holonId: "worker-ct-desk" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-desk",
    holonIds: ["worker-ct-desk"],
    status: "open",
  },
  {
    id: "wk-o-calendar-proof",
    rank: 21,
    cant: "Right now I can't attach shared-calendar proof that the meeting is real.",

    howParts: [
      { text: "Worker finds " },
      { text: "Log meeting", holonId: "worker-ct-log" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-log",
    holonIds: ["worker-ct-log"],
    status: "open",
  },
  {
    id: "wk-o-no-guest-relation",
    rank: 22,
    cant: "Right now I can't avoid any relationship with Guests who haven't funded.",

    howParts: [
      { text: "Worker opens " },
      { text: "Available queue", holonId: "worker-ct-available" },
      { text: " and finds " },
      { text: "Worker desk", holonId: "worker-ct-desk" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-desk",
    holonIds: ["worker-ct-desk"],
    status: "done",
  },
  {
    id: "wk-o-ignore-pricing-math",
    rank: 23,
    cant: "Right now I can't ignore Operator pricing math that isn't my job.",

    howParts: [
      { text: "Worker opens " },
      { text: "Available vessel", holonId: "worker-ct-vessel-card" },
      { text: " and finds " },
      { text: "Available queue", holonId: "worker-ct-available" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-available",
    holonIds: ["worker-ct-available"],
    status: "done",
  },
  {
    id: "wk-o-clean-vs-disputed-rate",
    rank: 24,
    cant: "Right now I can't see my clean vs disputed rate so I protect reputation.",

    howParts: [
      { text: "Worker finds " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-pipeline",
    holonIds: ["worker-ct-pipeline"],
    status: "open",
  },
  {
    id: "wk-o-begin-after-pickup",
    rank: 25,
    cant: "Right now I can't begin immediately after pick up without a dead click.",

    howParts: [
      { text: "Worker opens " },
      { text: "Available vessel", holonId: "worker-ct-vessel-card" },
      { text: " and finds " },
      { text: "Begin vessel", holonId: "worker-ct-claimed" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-claimed",
    holonIds: ["worker-ct-claimed"],
    status: "done",
  },
  {
    id: "wk-o-available-seeded",
    rank: 26,
    cant: "Right now I can't have something to pick up when the queue should be seeded.",

    howParts: [
      { text: "Worker opens " },
      { text: "Available queue", holonId: "worker-ct-available" },
      { text: " and finds " },
      { text: "Available vessel", holonId: "worker-ct-vessel-card" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-vessel-card",
    holonIds: ["worker-ct-vessel-card"],
    status: "done",
  },
  {
    id: "wk-o-no-create-tools",
    rank: 27,
    cant: "Right now I can't be kept away from create/evaluate/enrich/invite tools.",

    howParts: [
      { text: "Worker finds " },
      { text: "Worker desk", holonId: "worker-ct-desk" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-desk",
    holonIds: ["worker-ct-desk"],
    status: "done",
  },
  {
    id: "wk-o-release-payout-speed",
    rank: 28,
    cant: "Right now I can't see how long release takes after a clean log.",

    howParts: [
      { text: "Worker opens " },
      { text: "Pipeline", holonId: "worker-ct-pipeline" },
      { text: " and finds " },
      { text: "Pipeline meeting", holonId: "worker-ct-meeting-row" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-meeting-row",
    holonIds: ["worker-ct-meeting-row"],
    status: "open",
  },
  {
    id: "wk-o-second-worker",
    rank: 29,
    cant: "Right now I can't operate without competing for half-baked campaigns in a messy pool.",

    howParts: [
      { text: "Worker finds " },
      { text: "Available queue", holonId: "worker-ct-available" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-available",
    holonIds: ["worker-ct-available"],
    status: "open",
  },
  {
    id: "wk-o-stop-grinding-dead",
    rank: 30,
    cant: "Right now I can't get a hard stop UI when the campaign is reclaimed mid-run.",

    howParts: [
      { text: "Worker opens " },
      { text: "Active manage", holonId: "worker-ct-active" },
      { text: " and finds " },
      { text: "Log meeting", holonId: "worker-ct-log" },
      { text: "." },
    ],
    focusHolonId: "worker-ct-log",
    holonIds: ["worker-ct-log"],
    status: "done",
  },
];
