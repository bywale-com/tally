/**
 * Thin Campaign world twin — admission truth for persona UI / click-through.
 * Full sits + matrix: docs/register/WORLD.md
 * Law: docs/build-foundation/09-world-model.md
 *
 * Not a simulator. Gates what a persona may see for a Campaign state.
 */

export type WorldPersona =
  | "tally-operator"
  | "non-business-client"
  | "tally-business-client"
  | "tally-worker";

/** Minimal V1 Campaign lifecycle (ordered). */
export type CampaignWorldState =
  | "draft"
  | "ready"
  | "invited"
  | "funded"
  | "launched"
  | "running"
  | "stopped"
  | "reclaimed";

const ADMISSION: Record<CampaignWorldState, ReadonlySet<WorldPersona>> = {
  draft: new Set(["tally-operator"]),
  ready: new Set(["tally-operator"]),
  invited: new Set(["tally-operator", "non-business-client", "tally-business-client"]),
  /** Funded but not launched — Worker must not see yet. */
  funded: new Set(["tally-operator", "tally-business-client"]),
  launched: new Set(["tally-operator", "tally-business-client", "tally-worker"]),
  running: new Set(["tally-operator", "tally-business-client", "tally-worker"]),
  stopped: new Set(["tally-operator", "tally-business-client", "tally-worker"]),
  reclaimed: new Set(["tally-operator", "tally-business-client", "tally-worker"]),
};

/** True when this persona may have the Campaign in view at this state. */
export function admits(persona: WorldPersona, state: CampaignWorldState): boolean {
  return ADMISSION[state].has(persona);
}

/**
 * Worker Available queue: launched and not yet claimed.
 * Claim is a Worker-local flag — not a CampaignWorldState.
 */
export function workerAvailableAdmits(state: CampaignWorldState, unclaimed: boolean): boolean {
  return admits("tally-worker", state) && state === "launched" && unclaimed;
}

/**
 * Labels that are admission gates for Worker — never paint as Worker decision chrome.
 * (Already true or the row would not be in Available.)
 */
export const WORKER_GATE_LABELS_NOT_CHROME = ["funded", "launched"] as const;
