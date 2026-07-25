/**
 * How Analysis — user-visible decomposition of Outcomes.
 * Authoring guide: docs/build-foundation/01-ui-first-and-how.md
 *
 * Visibility rule (strict):
 * - Outcome and every node before a true leaf: question, clarity, and criteria stay
 *   user-visible. No process / invisible language (stores, APIs, auth services, etc.).
 * - True leaves only: may use process language in question, clarity, criteria, and
 *   components — the last Q/A pair in that chain.
 *
 * DNA: each child question must trace to a phrase in the parent answer.
 *
 * Flow anchors: Register flow is born at the parent when children are all leaves.
 * Sibling order: left-to-right = clause order in parent answer (position.x).
 *
 * Connections:
 * - flowId → Register Flows (when crystallized)
 * - components.ui → Register Components / holon surfaces
 */
export type HowNodeKind = "outcome" | "answer" | "leaf";

export type HowComponents = {
  ui?: string[];
  runtime?: string[];
  stores?: string[];
  external?: string[];
};

export type HowCriteria = {
  when?: string | null;
  conditions: string[];
};

export type HowNode = {
  id: string;
  parentId: string | null;
  kind: HowNodeKind;
  depth: number;
  question: string | null;
  clarity: string;
  criteria: HowCriteria;
  components: HowComponents;
  phraseKeys?: string[];
  mergeWithId?: string;
  isLeaf?: boolean;
  prototypeRef?: string[];
  /** Register flow born at this node when it is a flow anchor. */
  flowId?: string;
  position: { x: number; y: number };
};

export type HowGraph = {
  id: string;
  label: string;
  /** Entity that owns this outcome epic. */
  entityId: string;
  /** Universal order among epics — lower appears first. */
  epicOrder: number;
  outcomeId: string;
  nodes: HowNode[];
};

export const HOW_ANSWER_DISPLAY_MAX = 110;

export function truncateHowAnswer(text: string, max = HOW_ANSWER_DISPLAY_MAX): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${trimmed.trimEnd()}…`;
}
