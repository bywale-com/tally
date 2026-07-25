import type { HowGraph, HowNode } from "./types";

/**
 * Tally Worker — Core Outcome.
 * Post-launch execution role: picks up a launched campaign, begins it, manages it,
 * and tracks its progress — the business client is notified of that progress in turn.
 * Worker does not create, evaluate, enrich, invite, or launch — those stay with the Operator
 * (see operatorCoreOutcome.ts). Worker starts once a campaign is already launched and waiting.
 */
const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity:
      "As a Tally Worker, I can pick up a launched campaign, begin it, manage outreach against locked rules, and log booked meetings with a client pre-call packet — so that business clients receive qualified meetings and escrow can release.",
    criteria: {
      when: "While I am a Tally Worker with access to launched campaigns",
      conditions: [
        "Available = launched and unclaimed only — fund+launch already true",
        "Locked rules travel with the vessel — what counts does not move after I book in good faith",
        "Log = who, role, company, pain — proof for pay and client packet (not a chat relationship)",
        "Progress = booked / N — not activity volume",
      ],
    },
    components: {},
    position: { x: 560, y: 0 },
  },
  {
    id: "n-worker-core",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question:
      "How does a Tally Worker pick up a launched campaign, begin it, manage it, and track its progress so that business clients are notified of that progress?",
    clarity:
      "I pick up a launched campaign that's waiting for a Worker, begin working it, manage it while it stays active, and track its progress — and that same progress reaches the business client as a notification.",
    criteria: {
      when: "While I am signed in as a Tally Worker",
      conditions: [
        "A launched campaign is available before I pick it up — I did not launch it myself",
        "Begin happens right after I pick up",
        "Manage happens continuously while the campaign stays active",
        "Tracking progress is ongoing, and the business client sees that same progress as a notification",
      ],
    },
    components: {
      ui: ["Available campaigns", "Begin control", "Campaign work", "Progress", "Client notification"],
    },
    position: { x: 560, y: 140 },
  },

  // ─── Pick up (flow anchor) ─────────────────────────────────────────────
  {
    id: "n-worker-pickup",
    parentId: "n-worker-core",
    kind: "answer",
    depth: 2,
    question: "How do I pick up a launched campaign?",
    clarity:
      "I see the launched campaigns available to me and pick up the one I'll run.",
    criteria: {
      when: "When a launched campaign is available and unclaimed",
      conditions: [
        "I can see which launched campaigns are available to pick up",
        "Picking up assigns that campaign to me as the Worker",
      ],
    },
    components: {
      ui: ["Available campaigns", "Pick up control"],
    },
    phraseKeys: ["pick up a launched campaign"],
    position: { x: 40, y: 300 },
  },
  {
    id: "n-worker-pickup-see",
    parentId: "n-worker-pickup",
    kind: "leaf",
    depth: 3,
    question: "How do I see available launched campaigns?",
    clarity:
      "I open my queue and see the launched campaigns waiting for a Worker.",
    criteria: {
      when: "When I check for work",
      conditions: [
        "Available campaigns list shows only unclaimed, launched campaigns",
        "I can tell them apart enough to choose one",
      ],
    },
    components: { ui: ["Available campaigns"] },
    isLeaf: true,
    phraseKeys: ["see available launched campaigns"],
    position: { x: -80, y: 480 },
  },
  {
    id: "n-worker-pickup-claim",
    parentId: "n-worker-pickup",
    kind: "leaf",
    depth: 3,
    question: "How do I claim / pick up a campaign from that list?",
    clarity:
      "I select a campaign from the available list and claim it, which assigns it to me.",
    criteria: {
      when: "When I've chosen a campaign from the available list",
      conditions: [
        "Claiming removes it from the shared available pool",
        "I am now the Worker of record on that campaign",
      ],
    },
    components: { ui: ["Pick up control", "Campaign"] },
    isLeaf: true,
    phraseKeys: ["claim", "pick up"],
    position: { x: 160, y: 480 },
  },

  // ─── Begin (flow anchor) ───────────────────────────────────────────────
  {
    id: "n-worker-begin",
    parentId: "n-worker-core",
    kind: "answer",
    depth: 2,
    question: "How do I begin the campaign I picked up?",
    clarity:
      "I start the campaign I picked up so it's live for me to run.",
    criteria: {
      when: "Right after I pick up a campaign",
      conditions: [
        "Begin is available once a campaign is mine",
        "After I begin, the campaign is active for me to manage",
      ],
    },
    components: { ui: ["Begin control", "Campaign"] },
    phraseKeys: ["begin it"],
    position: { x: 400, y: 300 },
  },
  {
    id: "n-worker-begin-start",
    parentId: "n-worker-begin",
    kind: "leaf",
    depth: 3,
    question: "How do I start / go live on the picked-up campaign?",
    clarity:
      "I activate Begin on my picked-up campaign; it goes live and is now mine to manage.",
    criteria: {
      when: "When I'm ready to start work on a campaign I picked up",
      conditions: [
        "Begin is actionable on a campaign I've claimed",
        "After Begin, the campaign shows as active and mine",
      ],
    },
    components: { ui: ["Begin control", "Campaign running state"] },
    isLeaf: true,
    phraseKeys: ["start", "go live"],
    position: { x: 400, y: 480 },
  },

  // ─── Manage (flow anchor) ──────────────────────────────────────────────
  {
    id: "n-worker-manage",
    parentId: "n-worker-core",
    kind: "answer",
    depth: 2,
    question: "How do I manage the campaign while it's active?",
    clarity:
      "While the campaign is active I work its list/outreach, keeping it moving.",
    criteria: {
      when: "While a campaign I began stays active",
      conditions: [
        "Managing is ongoing, not a one-time step",
        "Work happens at the list/outreach level — no CRM/API detail surfaces here",
      ],
    },
    components: { ui: ["Campaign work"] },
    phraseKeys: ["manage it"],
    position: { x: 680, y: 300 },
  },
  {
    id: "n-worker-manage-work",
    parentId: "n-worker-manage",
    kind: "leaf",
    depth: 3,
    question: "How do I work the list / outreach for the campaign?",
    clarity:
      "I work through the campaign's list — reaching out and moving it forward — for as long as it's active.",
    criteria: {
      when: "While the campaign is active and assigned to me",
      conditions: [
        "The list/outreach for this campaign is visible to me",
        "I can act on entries in that list",
      ],
    },
    components: { ui: ["Campaign work", "Outreach list"] },
    isLeaf: true,
    phraseKeys: ["work the list", "outreach"],
    position: { x: 680, y: 480 },
  },

  // ─── Track progress (flow anchor) — notify BC as leaf ─────────────────
  {
    id: "n-worker-track",
    parentId: "n-worker-core",
    kind: "answer",
    depth: 2,
    question: "How do I track its progress so business clients are notified of that progress?",
    clarity:
      "I see how the campaign is doing, and that same progress reaches the business client as a notification.",
    criteria: {
      when: "While I'm managing an active campaign",
      conditions: [
        "Progress is visible to me as I work",
        "The business client on that campaign gets notified from the same progress",
      ],
    },
    components: { ui: ["Progress", "Client notification"] },
    phraseKeys: ["track its progress", "notified of that progress"],
    position: { x: 960, y: 300 },
  },
  {
    id: "n-worker-track-see",
    parentId: "n-worker-track",
    kind: "leaf",
    depth: 3,
    question: "How do I see the campaign's progress?",
    clarity:
      "I check the campaign and see its progress — where it stands right now.",
    criteria: {
      when: "While the campaign is active",
      conditions: [
        "Progress is visible on the campaign I'm managing",
        "Progress reflects current state, not a stale snapshot",
      ],
    },
    components: { ui: ["Progress"] },
    isLeaf: true,
    phraseKeys: ["see progress"],
    position: { x: 880, y: 480 },
  },
  {
    id: "n-worker-track-notify",
    parentId: "n-worker-track",
    kind: "leaf",
    depth: 3,
    question: "How are business clients notified of that progress?",
    clarity:
      "The progress I see also goes out to the business client as a notification, so they stay informed without asking me.",
    criteria: {
      when: "When progress changes on a campaign with a business client attached",
      conditions: [
        "Notification reaches the business client",
        "Notification content matches the progress I'm tracking",
      ],
    },
    components: {
      ui: ["Client notification"],
      runtime: ["Notification dispatcher"],
    },
    isLeaf: true,
    phraseKeys: ["business clients are notified of that progress"],
    position: { x: 1040, y: 480 },
  },
];

export const WORKER_CORE_OUTCOME_GRAPH: HowGraph = {
  id: "worker-core-outcome",
  label: "Outcome",
  entityId: "tally-worker",
  epicOrder: 10,
  outcomeId: "outcome",
  nodes,
};
