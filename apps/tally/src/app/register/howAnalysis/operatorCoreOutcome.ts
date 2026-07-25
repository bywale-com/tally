import type { HowGraph, HowNode } from "./types";

/**
 * Tally Operator — Core Outcome (pre-sale → first launch).
 *
 * Sales-led context (locked):
 * - Disco: create → evaluate (emulation of known analysis) → refine with prospect.
 *   Do NOT enrich / invite / fund on disco.
 * - Off call: enrich (firm/TAM list → CRM/Apollo lane).
 * - Demo: walk firm list → invite non-business → accept+first fund → launch.
 * - First sale invite = non-business only; business-client invite = same mechanism later.
 * - Evaluate companies are pre-screened; UI emulates analysis, doesn’t cold-discover.
 *
 * Components on nodes = product roles (not shell placement). Wireframes annotate shadcn later.
 */
const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity:
      "As a Tally Operator, I can create, evaluate (dossier as pricing reason), enrich after verdict, invite, and launch only after fund — so that a client can join/fund a priced pay-per-booked-meeting vessel and a Worker can pick up only what is funded and launched.",
    criteria: {
      when: "While I am operating a Tally sales motion (disco / off-call / demo)",
      conditions: [
        "Dossier = why this company and why $/meeting — not a bare score",
        "Verdict before enrich — never ops spend on a no",
        "Launch only after fund — Workers never see unfunded vessels",
        "Handoff carries locked meeting-qualification rules",
        "Post-launch glance = booked / N — not activity vanity",
        "Create = open a campaign vessel before heavy prospect work",
        "Invite non-business = first sale; invite business = later same mechanism",
      ],
    },
    components: {},
    position: { x: 700, y: 0 },
  },
  {
    id: "n-core",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question:
      "How does a Tally Operator create, evaluate, enrich, invite a non-business client, invite a business client, and launch a campaign?",
    clarity:
      "On a disco call I create a campaign and evaluate it live as an emulation of analysis we already have on a pre-screened company, showing a verdict summary so we can qualify and refine; off the call I enrich it into a firm list for demo; on the demo I invite a non-business client who funds to start, the campaign launches, and later I can invite a business client into another campaign with the same invite mechanism.",
    criteria: {
      when: "Across disco → off-call enrich → demo for a prospect, or later for an existing client",
      conditions: [
        "Disco stops at evaluate + refine — enrich is not run live on disco",
        "Enrich runs when I choose off call; demo shows the firm list",
        "First-sale invite targets a non-business client; accept+fund is their side",
        "Launch follows first fund for V1",
      ],
    },
    components: {
      ui: [
        "Create campaign control",
        "Company picker",
        "Evaluate sequence",
        "Verdict summary",
        "Enrich control",
        "Firm list",
        "Invite control",
        "Launch",
      ],
    },
    position: { x: 700, y: 140 },
  },

  // ─── Create (flow anchor) ─────────────────────────────────────────────
  {
    id: "n-create",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I create a campaign on a disco call?",
    clarity:
      "I use the Create campaign control, enter a name, and create so the campaign exists and is ready to evaluate.",
    criteria: {
      when: "At the start of disco when I open a campaign vessel for this prospect",
      conditions: [
        "Create is thin — name only",
        "After create (with a short load), the campaign exists and is ready to evaluate",
      ],
    },
    components: {
      ui: ["Create campaign control", "Campaign name", "Create"],
    },
    phraseKeys: ["create a campaign"],
    position: { x: 0, y: 300 },
  },
  {
    id: "n-create-control",
    parentId: "n-create",
    kind: "leaf",
    depth: 3,
    question: "How do I use the Create campaign control?",
    clarity:
      "I activate the Create campaign control; that opens a name field so I can start a new campaign.",
    criteria: {
      when: "When I decide to create a new campaign",
      conditions: [
        "Create campaign control is visible and actionable",
        "Activating it opens campaign name",
      ],
    },
    components: { ui: ["Create campaign control"] },
    isLeaf: true,
    phraseKeys: ["Create campaign control"],
    position: { x: -100, y: 480 },
  },
  {
    id: "n-create-basics",
    parentId: "n-create",
    kind: "leaf",
    depth: 3,
    question: "How do I name the campaign?",
    clarity:
      "I enter a name for the campaign — enough to recognize it in the list when I evaluate and enrich.",
    criteria: {
      when: "After I have activated Create campaign control",
      conditions: [
        "Name field accepts a campaign name",
        "Nothing else is required before Create",
      ],
    },
    components: {
      ui: ["Campaign name"],
    },
    isLeaf: true,
    phraseKeys: ["name"],
    position: { x: 140, y: 480 },
  },
  {
    id: "n-create-confirm",
    parentId: "n-create",
    kind: "leaf",
    depth: 3,
    question: "How do I create so the campaign exists and is ready to evaluate?",
    clarity:
      "I create; a short load runs; the new campaign exists in Tally and is ready for me to evaluate on the call.",
    criteria: {
      when: "When the campaign has a name",
      conditions: [
        "Create succeeds after a short load",
        "Campaign is visible afterward as something I can evaluate",
      ],
    },
    components: { ui: ["Create", "Creating load", "Campaign"] },
    isLeaf: true,
    phraseKeys: ["create"],
    position: { x: 380, y: 480 },
  },

  // ─── Evaluate (flow anchor) — disco emulation ─────────────────────────
  {
    id: "n-evaluate",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I evaluate the campaign live on a disco call?",
    clarity:
      "I pick a pre-screened company by name, run the evaluate sequence as an emulation of analysis we already have, show a compact verdict summary, and use that with the prospect to qualify and refine — without enriching on the call.",
    criteria: {
      when: "On disco, after the campaign exists, screen-shared with the prospect",
      conditions: [
        "Company was already selected because we have data/analysis — not a random cold company",
        "Evaluate is an emulation (loading/skeleton → verdict), not cold discovery",
        "Enrich is not started on disco",
      ],
    },
    components: {
      ui: ["Company picker", "Evaluate sequence", "Verdict summary"],
    },
    phraseKeys: ["evaluate it"],
    position: { x: 560, y: 300 },
  },
  {
    id: "n-evaluate-pick",
    parentId: "n-evaluate",
    kind: "leaf",
    depth: 3,
    question: "How do I pick a pre-screened company by name?",
    clarity:
      "I search or type the company name and select it from companies we already know — the natural next thing after naming the campaign.",
    criteria: {
      when: "When I am ready to evaluate on disco",
      conditions: [
        "Picker shows known/pre-screened companies",
        "Selecting a company is enough seed — link paste is optional, not required",
      ],
    },
    components: { ui: ["Company picker", "Company search field"] },
    isLeaf: true,
    phraseKeys: ["pick a pre-screened company"],
    position: { x: 400, y: 480 },
  },
  {
    id: "n-evaluate-sequence",
    parentId: "n-evaluate",
    kind: "leaf",
    depth: 3,
    question: "How do I run the evaluate sequence as an emulation of analysis we already have?",
    clarity:
      "I start evaluate; the sequence plays (loading / skeleton / progressive reveal) as an emulation of the analysis pipeline on data we already own for that company.",
    criteria: {
      when: "After a company is selected",
      conditions: [
        "Sequence is visibly running for the prospect",
        "Underlying analysis is pre-known / precomputed — UI emulates the run",
      ],
    },
    components: {
      ui: ["Evaluate control", "Evaluate sequence", "Loading / skeleton"],
      runtime: ["Analysis emulation runner"],
    },
    isLeaf: true,
    phraseKeys: ["run the evaluate sequence"],
    position: { x: 640, y: 480 },
  },
  {
    id: "n-evaluate-verdict",
    parentId: "n-evaluate",
    kind: "leaf",
    depth: 3,
    question:
      "How do I show a compact verdict summary and use it with the prospect to qualify and refine?",
    clarity:
      "When the sequence finishes, a compact verdict summary appears; on disco I walk it with the prospect to qualify and refine what we know about their market — still without enriching.",
    criteria: {
      when: "When the evaluate sequence completes on disco",
      conditions: [
        "Verdict summary is presentation-sized, not a raw dump",
        "Prospect and I can refine understanding from it",
        "Enrich control is not required to finish disco",
      ],
    },
    components: { ui: ["Verdict summary"] },
    isLeaf: true,
    phraseKeys: ["verdict summary", "qualify and refine"],
    position: { x: 880, y: 480 },
  },

  // ─── Enrich (flow anchor) — off call ──────────────────────────────────
  {
    id: "n-enrich",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I enrich the campaign off the call?",
    clarity:
      "Off the call I use the Enrich control to build the firm/TAM list with firmographics (via our list/CRM/Apollo lane), so the demo can show who we’ll go after for remove/add — without holding full firm dumps for every prospect ahead of time.",
    criteria: {
      when: "After disco, when I choose to materialize the list (not live on disco)",
      conditions: [
        "Enrich control works as a deliberate off-call action",
        "List is created when enriched — not pre-stored for every possible prospect",
        "Demo later shows this firm list",
      ],
    },
    components: {
      ui: ["Enrich control", "Firm list", "Firmographic row"],
    },
    phraseKeys: ["enrich it"],
    position: { x: 1100, y: 300 },
  },
  {
    id: "n-enrich-control",
    parentId: "n-enrich",
    kind: "leaf",
    depth: 3,
    question: "How do I use the Enrich control off the call?",
    clarity:
      "When I’m off the call I activate Enrich; that starts building the firm list for this campaign.",
    criteria: {
      when: "After disco, when I’m ready to materialize TAM/firms",
      conditions: [
        "Enrich is actionable off call",
        "I do not need the prospect on the screen to enrich",
      ],
    },
    components: { ui: ["Enrich control"] },
    isLeaf: true,
    phraseKeys: ["Enrich control"],
    position: { x: 980, y: 480 },
  },
  {
    id: "n-enrich-build-list",
    parentId: "n-enrich",
    kind: "leaf",
    depth: 3,
    question: "How does enriching build the firm/TAM list into our list/CRM lane?",
    clarity:
      "Enrich builds a firm list with firmographics for this campaign and pushes that list into our backend list/CRM lane (e.g. Apollo-shaped automation) using what we already know is enough to build the list.",
    criteria: {
      when: "When Enrich runs for a campaign",
      conditions: [
        "A list scoped to this campaign/prospect is created or updated",
        "Credits/automation constraints may gate the lane — product still exposes Enrich as the Operator action",
      ],
    },
    components: {
      ui: ["Firm list"],
      runtime: ["List / CRM / Apollo lane"],
      stores: ["campaign firm list"],
    },
    isLeaf: true,
    phraseKeys: ["firm/TAM list", "list/CRM/Apollo"],
    position: { x: 1220, y: 480 },
  },
  {
    id: "n-enrich-ready-demo",
    parentId: "n-enrich",
    kind: "leaf",
    depth: 3,
    question: "How is the firm list ready to show on the demo for remove/add?",
    clarity:
      "When enrich finishes, the firm list with firmographics is ready so on the demo I can walk “who we’ll go after” and the prospect can remove or add firms against their database / dream list.",
    criteria: {
      when: "Before or at the start of the demo call",
      conditions: [
        "Firm list is visible in the prepared campaign view",
        "Remove/add is possible in that walkthrough (prospect-facing on demo)",
      ],
    },
    components: {
      ui: ["Firm list", "Firmographic row", "Remove firm control", "Add firm control"],
    },
    isLeaf: true,
    phraseKeys: ["demo", "remove/add"],
    position: { x: 1460, y: 480 },
  },

  // ─── Invite non-business (flow anchor) — demo / first sale ────────────
  {
    id: "n-invite-non-business",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I invite a non-business client on the demo after we’re green?",
    clarity:
      "On the demo, after walking the firm list and getting green, I use Invite to send the non-business client into the prepared campaign so they can accept and complete first fund — first sale uses this path only.",
    criteria: {
      when: "On the demo/sales walkthrough, when the prospect is green",
      conditions: [
        "Firm list walkthrough already happened or is in progress as agreed",
        "Invitee is still a non-business client",
        "Accept + first escrow fund are on their side of the outcome",
      ],
    },
    components: { ui: ["Invite control", "Campaign"] },
    phraseKeys: ["invite a non-business client"],
    position: { x: 1680, y: 300 },
  },
  {
    id: "n-invite-nb-send",
    parentId: "n-invite-non-business",
    kind: "leaf",
    depth: 3,
    question: "How do I send the invite to the non-business client?",
    clarity:
      "I activate Invite for this campaign and send it to the prospect as a non-business client.",
    criteria: {
      when: "When demo is green and I’m ready to convert",
      conditions: [
        "Invite is tied to this prepared campaign",
        "Recipient is treated as non-business until first fund",
      ],
    },
    components: { ui: ["Invite control"] },
    isLeaf: true,
    phraseKeys: ["Invite"],
    position: { x: 1580, y: 480 },
  },
  {
    id: "n-invite-nb-await-fund",
    parentId: "n-invite-non-business",
    kind: "leaf",
    depth: 3,
    question: "How does their accept and first fund unlock launch from my side?",
    clarity:
      "When they accept and complete first escrow fund on the invited campaign, the campaign is ready to launch (V1: fund and launch are coupled).",
    criteria: {
      when: "After invite is sent and they complete accept + first fund",
      conditions: [
        "Accept + fund are non-business client outcomes",
        "Operator sees campaign ready to launch / auto-launch",
      ],
    },
    components: {
      ui: ["Campaign", "Launch readiness"],
    },
    isLeaf: true,
    phraseKeys: ["accept", "first fund"],
    position: { x: 1820, y: 480 },
  },

  // ─── Invite business (flow anchor) — later, same mechanism ────────────
  {
    id: "n-invite-business",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I invite a business client into another campaign later?",
    clarity:
      "For an existing Tally business client I use the same Invite control into a new prepared campaign — same mechanism as non-business; they join/fund and do not create the campaign.",
    criteria: {
      when: "When an existing business client should enter a new campaign",
      conditions: [
        "Not the first-sale path",
        "Same invite mechanism as non-business",
        "They do not create the campaign",
      ],
    },
    components: { ui: ["Invite control", "Campaign"] },
    phraseKeys: ["invite a business client"],
    position: { x: 2040, y: 300 },
  },
  {
    id: "n-invite-biz-same",
    parentId: "n-invite-business",
    kind: "leaf",
    depth: 3,
    question: "How do I use the same Invite control for an existing business client?",
    clarity:
      "I select the prepared campaign and the existing business client, then send Invite — same control and mechanism as the prospect invite.",
    criteria: {
      when: "When launching another campaign for a current client",
      conditions: [
        "Invitee is already a business client",
        "No separate create-on-customer flow",
      ],
    },
    components: { ui: ["Invite control", "Business client picker"] },
    isLeaf: true,
    phraseKeys: ["same Invite control"],
    position: { x: 2040, y: 480 },
  },

  // ─── Launch (flow anchor) ─────────────────────────────────────────────
  {
    id: "n-launch",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I launch the campaign after first fund?",
    clarity:
      "Once first escrow fund is in, the campaign launches so it can run toward meetings — for V1 fund and launch are coupled (auto or one confirm).",
    criteria: {
      when: "When first fund has completed on the invited campaign",
      conditions: [
        "Campaign moves to running",
        "V1 does not require a long separate launch ritual after fund",
      ],
    },
    components: { ui: ["Launch", "Campaign"] },
    phraseKeys: ["launch the campaign"],
    position: { x: 2320, y: 300 },
  },
  {
    id: "n-launch-run",
    parentId: "n-launch",
    kind: "leaf",
    depth: 3,
    question: "How does the campaign move to running after fund?",
    clarity:
      "After first fund, launch runs (automatically or via a single Launch confirm) and the campaign is running toward meetings.",
    criteria: {
      when: "Immediately after first fund succeeds",
      conditions: ["Running state is visible to Operator (and then to the client as appropriate)"],
    },
    components: {
      ui: ["Launch", "Campaign running state"],
      runtime: ["Campaign launcher"],
    },
    isLeaf: true,
    phraseKeys: ["launches", "running"],
    position: { x: 2320, y: 480 },
  },
];

export const OPERATOR_CORE_OUTCOME_GRAPH: HowGraph = {
  id: "operator-core-outcome",
  label: "Outcome",
  entityId: "tally-operator",
  epicOrder: 5,
  outcomeId: "outcome",
  nodes,
};
