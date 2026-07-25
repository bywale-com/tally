import type { HowGraph, HowNode } from "./types";

/**
 * Tally Business Client — Outcome 1 (Core Outcome).
 * Sales-led: Operator prepares & invites; customer joins/funds — does not create.
 */
const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity:
      "As a Tally business client, I can fund an Operator-created campaign into escrow hold, receive qualified booked meetings with a pre-call packet and release receipt, gate quality, and reclaim unspent hold — so that a Worker is paid only for real meetings while my capital and brand stay protected.",
    criteria: {
      when: "While I am a Tally business client",
      conditions: [
        "I never create campaigns — Operator does",
        "Progress = booked meetings / N with pre-call notes — not activity vanity or free Worker chat",
        "Quality gate = dispute meetings that fail locked criteria",
        "Low motion = honest account + adjust or reclaim unspent escrow",
      ],
    },
    components: {},
    position: { x: 480, y: 0 },
  },
  {
    id: "n-core",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question:
      "How does a Tally customer join and fund an invited campaign, get notified of its progress, respond to the notification, and stop the campaign or recollect unused funds?",
    clarity:
      "In Tally I join and fund an invited campaign that was prepared for me, get notified of its progress, respond to the notification, and stop the campaign or recollect unused funds when I choose.",
    criteria: {
      when: "While I am signed in as a Tally business client",
      conditions: [
        "An invited campaign is waiting for me — I did not create it",
        "Join and fund happen before or as the campaign runs for me",
        "Notifications arrive while the campaign is active",
        "I can respond when a notification arrives",
        "I can stop or recollect when I want to end or reclaim",
      ],
    },
    components: {
      ui: ["Invited campaign", "Funding", "Progress notification", "Notification response"],
    },
    position: { x: 480, y: 140 },
  },
  {
    id: "n-join-fund-invited",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I join and fund an invited campaign that was prepared for me?",
    clarity:
      "I open the invitation to a campaign the Operator prepared, join it, and fund it so it can run for me.",
    criteria: {
      when: "When I have an invitation to a prepared campaign",
      conditions: [
        "I can see the invited campaign and what it’s for",
        "I join it and complete funding",
        "I did not create the campaign myself",
      ],
    },
    components: {
      ui: ["Invited campaign", "Funding"],
    },
    phraseKeys: ["join and fund an invited campaign"],
    position: { x: 40, y: 300 },
  },
  {
    id: "n-notified-progress",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I get notified of its progress?",
    clarity:
      "While the campaign is running, Tally notifies me about its progress so I can see how it’s doing.",
    criteria: {
      when: "While my joined campaign is active",
      conditions: [
        "Progress updates reach me as notifications",
        "I can tell which campaign the progress is about",
      ],
    },
    components: {
      ui: ["Progress notification"],
    },
    phraseKeys: ["get notified of its progress"],
    position: { x: 320, y: 300 },
  },
  {
    id: "n-respond-notification",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I respond to the notification?",
    clarity:
      "When a progress notification arrives, I open it and respond — taking the action the notification asks for or that I choose.",
    criteria: {
      when: "When I receive a campaign progress notification",
      conditions: [
        "I can open the notification",
        "I can submit a response from it",
      ],
    },
    components: {
      ui: ["Progress notification", "Notification response"],
    },
    phraseKeys: ["respond to the notification"],
    position: { x: 600, y: 300 },
  },
  {
    id: "n-stop-or-recollect",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I stop the campaign or recollect unused funds when I choose?",
    clarity:
      "When I want to end or reclaim, I stop the campaign and/or recollect any unused funds still on it.",
    criteria: {
      when: "When I decide to end the campaign or reclaim unused money",
      conditions: [
        "I can stop an active campaign",
        "I can recollect unused funds still available on it",
      ],
    },
    components: {
      ui: ["Campaign", "Funding"],
    },
    phraseKeys: ["stop the campaign or recollect unused funds"],
    position: { x: 880, y: 300 },
  },
];

export const CLIENT_CORE_OUTCOME_GRAPH: HowGraph = {
  id: "client-core-outcome",
  label: "Outcome",
  entityId: "tally-business-client",
  epicOrder: 20,
  outcomeId: "outcome",
  nodes,
};

