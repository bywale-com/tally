/**
 * Operator obstacles — ranked "Right now I can't…"
 * Deal-architect seat. Rank 1 = most critical.
 */
import type { PersonaObstacle } from "./personaObstacle";

export const OPERATOR_OBSTACLES: PersonaObstacle[] = [
  {
    id: "op-o-dossier-reason",
    rank: 1,
    cant: "Right now I can't open a dossier that is a pricing reason — not a résumé dump.",

    howParts: [
      { text: "Operator opens " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: " and finds " },
      { text: "Create campaign", holonId: "op-ct-create" },
      { text: "." },
    ],
    focusHolonId: "op-ct-create",
    holonIds: ["op-ct-create"],
    status: "done",
  },
  {
    id: "op-o-live-reanalyze",
    rank: 2,
    cant: "Right now I can't edit and re-run the dossier fast enough live on a call.",

    howParts: [
      { text: "Operator finds " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: "." },
    ],
    focusHolonId: "op-ct-evaluate",
    holonIds: ["op-ct-evaluate"],
    status: "done",
  },
  {
    id: "op-o-verdict-before-enrich",
    rank: 3,
    cant: "Right now I can't keep enrich locked until after a fund-likely verdict.",

    howParts: [
      { text: "Operator opens " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: " and finds " },
      { text: "Enrich firm list", holonId: "op-ct-enrich" },
      { text: "." },
    ],
    focusHolonId: "op-ct-enrich",
    holonIds: ["op-ct-enrich"],
    status: "done",
  },
  {
    id: "op-o-launch-only-funded",
    rank: 4,
    cant: "Right now I can't make launch physically impossible before fund.",

    howParts: [
      { text: "Operator looks at " },
      { text: "Deploy / invite", holonId: "op-ct-deploy" },
      { text: " on " },
      { text: "Invite sheet", holonId: "op-ct-invite" },
      { text: " and finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "done",
  },
  {
    id: "op-o-handoff-rules",
    rank: 5,
    cant: "Right now I can't pass locked meeting-qualification rules with the vessel to the Worker.",

    howParts: [
      { text: "Operator finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "open",
  },
  {
    id: "op-o-post-launch-booked-n",
    rank: 6,
    cant: "Right now I can't glance post-launch progress as booked / N — not activity.",

    howParts: [
      { text: "Operator finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "open",
  },
  {
    id: "op-o-prescreen-picker",
    rank: 7,
    cant: "Right now I can't pick evaluate companies only from a pre-screened set.",

    howParts: [
      { text: "Operator opens " },
      { text: "Company search", holonId: "op-ct-company-search" },
      { text: " and finds " },
      { text: "Create campaign", holonId: "op-ct-create" },
      { text: "." },
    ],
    focusHolonId: "op-ct-create",
    holonIds: ["op-ct-create"],
    status: "done",
  },
  {
    id: "op-o-create-vessel",
    rank: 8,
    cant: "Right now I can't create a thin campaign vessel before heavy prospect work.",

    howParts: [
      { text: "Operator opens " },
      { text: "Create campaign", holonId: "op-ct-create" },
      { text: " and finds " },
      { text: "Campaigns list", holonId: "op-ct-campaigns" },
      { text: "." },
    ],
    focusHolonId: "op-ct-campaigns",
    holonIds: ["op-ct-campaigns"],
    status: "done",
  },
  {
    id: "op-o-invite-nb",
    rank: 9,
    cant: "Right now I can't invite a non-business prospect into a vessel I created.",

    howParts: [
      { text: "Operator opens " },
      { text: "Deploy / invite", holonId: "op-ct-deploy" },
      { text: " and finds " },
      { text: "Invite sheet", holonId: "op-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "op-ct-invite",
    holonIds: ["op-ct-invite"],
    status: "done",
  },
  {
    id: "op-o-invite-bc",
    rank: 10,
    cant: "Right now I can't invite an existing business client with the same invite mechanism.",

    howParts: [
      { text: "Operator opens " },
      { text: "Deploy / invite", holonId: "op-ct-deploy" },
      { text: " and finds " },
      { text: "Invite sheet", holonId: "op-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "op-ct-invite",
    holonIds: ["op-ct-invite"],
    status: "done",
  },
  {
    id: "op-o-defend-price-live",
    rank: 11,
    cant: "Right now I can't defend $/meeting out loud from something real on the dossier.",

    howParts: [
      { text: "Operator finds " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: "." },
    ],
    focusHolonId: "op-ct-evaluate",
    holonIds: ["op-ct-evaluate"],
    status: "done",
  },
  {
    id: "op-o-no-touch-escrow",
    rank: 12,
    cant: "Right now I can't prove I can never touch or move a client's held funds.",

    howParts: [
      { text: "Operator finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "open",
  },
  {
    id: "op-o-fund-state",
    rank: 13,
    cant: "Right now I can't see funded vs waiting so I know launch is unlocked.",

    howParts: [
      { text: "Operator looks at " },
      { text: "Campaigns list", holonId: "op-ct-campaigns" },
      { text: " on " },
      { text: "Campaign row", holonId: "op-ct-campaign-row" },
      { text: " and finds " },
      { text: "Deploy / invite", holonId: "op-ct-deploy" },
      { text: "." },
    ],
    focusHolonId: "op-ct-deploy",
    holonIds: ["op-ct-deploy"],
    status: "done",
  },
  {
    id: "op-o-silence-started-vs-dead",
    rank: 14,
    cant: "Right now I can't tell post-launch silence means Worker hasn't started vs angle is dead.",

    howParts: [
      { text: "Operator finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "open",
  },
  {
    id: "op-o-no-activity-chrome",
    rank: 15,
    cant: "Right now I can't keep activity vanity out of my post-launch view.",

    howParts: [
      { text: "Operator finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "open",
  },
  {
    id: "op-o-enrich-cost-gate",
    rank: 16,
    cant: "Right now I can't refuse enrich spend on a company I haven't verdicted.",

    howParts: [
      { text: "Operator opens " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: " and finds " },
      { text: "Enrich firm list", holonId: "op-ct-enrich" },
      { text: "." },
    ],
    focusHolonId: "op-ct-enrich",
    holonIds: ["op-ct-enrich"],
    status: "done",
  },
  {
    id: "op-o-market-scan",
    rank: 17,
    cant: "Right now I can't run a market scan into the evaluate picker.",

    howParts: [
      { text: "Operator finds " },
      { text: "Company search", holonId: "op-ct-company-search" },
      { text: "." },
    ],
    focusHolonId: "op-ct-company-search",
    holonIds: ["op-ct-company-search"],
    status: "open",
  },
  {
    id: "op-o-firm-list-demo",
    rank: 18,
    cant: "Right now I can't walk firm/TAM list remove/add on demo before invite.",

    howParts: [
      { text: "Operator finds " },
      { text: "Enrich firm list", holonId: "op-ct-enrich" },
      { text: "." },
    ],
    focusHolonId: "op-ct-enrich",
    holonIds: ["op-ct-enrich"],
    status: "done",
  },
  {
    id: "op-o-stale-price-block",
    rank: 19,
    cant: "Right now I can't block fund on stale or auto pricing I didn't stand behind.",

    howParts: [
      { text: "Operator opens " },
      { text: "Invite sheet", holonId: "op-ct-invite" },
      { text: " and finds " },
      { text: "Deploy / invite", holonId: "op-ct-deploy" },
      { text: "." },
    ],
    focusHolonId: "op-ct-deploy",
    holonIds: ["op-ct-deploy"],
    status: "open",
  },
  {
    id: "op-o-next-campaign-timing",
    rank: 20,
    cant: "Right now I can't see when to bring a client back for their next campaign.",

    howParts: [
      { text: "Operator finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "open",
  },
  {
    id: "op-o-worker-queue-clean",
    rank: 21,
    cant: "Right now I can't verify unfunded vessels never reach the Worker queue.",

    howParts: [
      { text: "Operator finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "open",
  },
  {
    id: "op-o-one-sentence-why",
    rank: 22,
    cant: "Right now I can't reduce the dossier to one sentence why company + why price.",

    howParts: [
      { text: "Operator finds " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: "." },
    ],
    focusHolonId: "op-ct-evaluate",
    holonIds: ["op-ct-evaluate"],
    status: "open",
  },
  {
    id: "op-o-swap-on-call",
    rank: 23,
    cant: "Right now I can't swap company or re-price on the call without losing the thread.",

    howParts: [
      { text: "Operator finds " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: "." },
    ],
    focusHolonId: "op-ct-evaluate",
    holonIds: ["op-ct-evaluate"],
    status: "open",
  },
  {
    id: "op-o-invite-moment",
    rank: 24,
    cant: "Right now I can't fire invite as continuation of the live case — not a marketing drip.",

    howParts: [
      { text: "Operator opens " },
      { text: "Deploy / invite", holonId: "op-ct-deploy" },
      { text: " and finds " },
      { text: "Enrich firm list", holonId: "op-ct-enrich" },
      { text: "." },
    ],
    focusHolonId: "op-ct-enrich",
    holonIds: ["op-ct-enrich"],
    status: "done",
  },
  {
    id: "op-o-clients-never-create",
    rank: 25,
    cant: "Right now I can't keep clients from creating campaigns in my world.",

    howParts: [
      { text: "Operator opens " },
      { text: "Create campaign", holonId: "op-ct-create" },
      { text: " and finds " },
      { text: "Campaigns list", holonId: "op-ct-campaigns" },
      { text: "." },
    ],
    focusHolonId: "op-ct-campaigns",
    holonIds: ["op-ct-campaigns"],
    status: "done",
  },
  {
    id: "op-o-no-worker-chat-leak",
    rank: 26,
    cant: "Right now I can't keep Worker–Client free chat from becoming the dispute channel.",

    howParts: [
      { text: "Operator finds " },
      { text: "Operator desk", holonId: "op-ct-desk" },
      { text: "." },
    ],
    focusHolonId: "op-ct-desk",
    holonIds: ["op-ct-desk"],
    status: "done",
  },
  {
    id: "op-o-honest-empty-campaigns",
    rank: 27,
    cant: "Right now I can't land on honest empty campaigns — no fake skeletons.",

    howParts: [
      { text: "Operator finds " },
      { text: "Campaigns list", holonId: "op-ct-campaigns" },
      { text: "." },
    ],
    focusHolonId: "op-ct-campaigns",
    holonIds: ["op-ct-campaigns"],
    status: "done",
  },
  {
    id: "op-o-quiet-secondary",
    rank: 28,
    cant: "Right now I can't keep secondary actions quiet while one loud next step stays clear.",

    howParts: [
      { text: "Operator looks at " },
      { text: "Create campaign", holonId: "op-ct-create" },
      { text: " on " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: " and finds " },
      { text: "Invite sheet", holonId: "op-ct-invite" },
      { text: "." },
    ],
    focusHolonId: "op-ct-invite",
    holonIds: ["op-ct-invite"],
    status: "done",
  },
  {
    id: "op-o-repeat-client-proactive",
    rank: 29,
    cant: "Right now I can't proactively open a next vessel for a repeat client before they ask.",

    howParts: [
      { text: "Operator finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "open",
  },
  {
    id: "op-o-prep-feedback-from-worker",
    rank: 30,
    cant: "Right now I can't get Worker feedback that this list or rule was thin/unclear.",

    howParts: [
      { text: "Operator finds " },
      { text: "Running campaign", holonId: "op-ct-running" },
      { text: "." },
    ],
    focusHolonId: "op-ct-running",
    holonIds: ["op-ct-running"],
    status: "open",
  },
  {
    id: "op-o-no-marketplace-bid",
    rank: 31,
    cant: "Right now I can't stop clients picking Operators on price before a dossier exists.",

    howParts: [
      { text: "Operator finds " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: "." },
    ],
    focusHolonId: "op-ct-evaluate",
    holonIds: ["op-ct-evaluate"],
    status: "done",
  },
  {
    id: "op-o-agent-recalc",
    rank: 32,
    cant: "Right now I can't get agentic recalculation of dossier figures on-call.",

    howParts: [
      { text: "Operator finds " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: "." },
    ],
    focusHolonId: "op-ct-evaluate",
    holonIds: ["op-ct-evaluate"],
    status: "open",
  },
  {
    id: "op-o-campaigns-list",
    rank: 33,
    cant: "Right now I can't see all vessels I'm sizing across draft → launched.",

    howParts: [
      { text: "Operator opens " },
      { text: "Campaigns list", holonId: "op-ct-campaigns" },
      { text: " and finds " },
      { text: "Campaign row", holonId: "op-ct-campaign-row" },
      { text: "." },
    ],
    focusHolonId: "op-ct-campaign-row",
    holonIds: ["op-ct-campaign-row"],
    status: "done",
  },
  {
    id: "op-o-enrich-lane",
    rank: 34,
    cant: "Right now I can't build firm/TAM via list/CRM/Apollo-shaped enrich lane.",

    howParts: [
      { text: "Operator finds " },
      { text: "Enrich firm list", holonId: "op-ct-enrich" },
      { text: "." },
    ],
    focusHolonId: "op-ct-enrich",
    holonIds: ["op-ct-enrich"],
    status: "done",
  },
  {
    id: "op-o-clear-evaluate",
    rank: 35,
    cant: "Right now I can't clear / exit evaluate without placating dead-ends.",

    howParts: [
      { text: "Operator opens " },
      { text: "Evaluate dossier", holonId: "op-ct-evaluate" },
      { text: " and finds " },
      { text: "Enrich firm list", holonId: "op-ct-enrich" },
      { text: "." },
    ],
    focusHolonId: "op-ct-enrich",
    holonIds: ["op-ct-enrich"],
    status: "done",
  },
];
