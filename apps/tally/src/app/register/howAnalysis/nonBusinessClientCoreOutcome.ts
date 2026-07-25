import type { HowGraph, HowNode } from "./types";

/**
 * Non-business Client (prospect) — Core Outcome.
 * Pre-customer path: accept invite → walkthrough of prepared campaign → first fund → become Business Client.
 */
const nodes: HowNode[] = [
  {
    id: "outcome",
    parentId: null,
    kind: "outcome",
    depth: 0,
    question: null,
    clarity:
      "As a non-business client, I can see a campaign with locked qualification rules, price-per-meeting, and escrow release/return rules, then fund or walk away — so that I only put capital into a risk-mitigated meeting vessel.",
    criteria: {
      when: "When I am a prospect invited by the Tally Operator",
      conditions: [
        "Locked rules = who counts, meeting length, seniority, N × $/meeting",
        "Escrow trust = hold not ops spend; release per qualified booking; unspent reclaimable",
        "Walk = Operator fluency on why company and why price (ACV/ICP)",
        "First fund converts me into a Tally business client",
      ],
    },
    components: {},
    position: { x: 420, y: 0 },
  },
  {
    id: "n-core",
    parentId: "outcome",
    kind: "answer",
    depth: 1,
    question:
      "How does a non-business client accept an invitation into a campaign prepared for them, walk through that campaign, and complete the first fund to become a Tally business client?",
    clarity:
      "I accept the Operator’s invitation into a campaign prepared for me, walk through that campaign, and complete the first fund — and that first fund makes me a Tally business client.",
    criteria: {
      when: "When the Operator has invited me into a prepared campaign",
      conditions: [
        "Invitation reaches me before I have a funded business-client account",
        "Walkthrough happens on the prepared campaign",
        "First fund completes the conversion to business client",
      ],
    },
    components: {
      ui: ["Campaign invitation", "Campaign walkthrough", "First fund"],
    },
    position: { x: 420, y: 140 },
  },
  {
    id: "n-accept-invite",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I accept the Operator’s invitation into a campaign prepared for me?",
    clarity:
      "I receive the invitation, open it, and accept so I can enter the campaign prepared for me.",
    criteria: {
      when: "When the Operator invites me as a non-business client",
      conditions: [
        "I can see who invited me and what campaign it is",
        "Accepting opens the path into that campaign",
      ],
    },
    components: {
      ui: ["Campaign invitation"],
    },
    phraseKeys: ["accept the Operator’s invitation"],
    position: { x: 40, y: 300 },
  },
  {
    id: "n-walkthrough",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I walk through that campaign?",
    clarity:
      "With the Operator, I walk through the prepared campaign — seeing how it’s set up for me — before I fund.",
    criteria: {
      when: "After I have accepted the invitation and before first fund",
      conditions: [
        "The campaign I see is the one prepared for me",
        "Walkthrough happens with the Operator (sales call)",
      ],
    },
    components: {
      ui: ["Campaign walkthrough"],
    },
    phraseKeys: ["walk through that campaign"],
    position: { x: 360, y: 300 },
  },
  {
    id: "n-first-fund",
    parentId: "n-core",
    kind: "answer",
    depth: 2,
    question: "How do I complete the first fund and become a Tally business client?",
    clarity:
      "I complete the first escrow fund on the prepared campaign, and that converts me from non-business client to Tally business client.",
    criteria: {
      when: "At the end of the walkthrough, when I’m ready to start",
      conditions: [
        "First fund is confirmed on the invited campaign",
        "After funding I am a Tally business client",
      ],
    },
    components: {
      ui: ["First fund", "Campaign"],
    },
    phraseKeys: ["complete the first fund"],
    position: { x: 680, y: 300 },
  },
];

export const NON_BUSINESS_CLIENT_CORE_OUTCOME_GRAPH: HowGraph = {
  id: "non-business-client-core-outcome",
  label: "Outcome",
  entityId: "non-business-client",
  epicOrder: 15,
  outcomeId: "outcome",
  nodes,
};
