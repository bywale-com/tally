/**
 * Independent Campaign admission twin for prototype-carbon.
 * Substance mirrors docs/register/WORLD.md — no shared runtime with /prototype.
 */

export type CarbonPersona =
  | "tally-operator"
  | "non-business-client"
  | "tally-business-client"
  | "tally-worker";

export type CampaignWorldState =
  | "draft"
  | "ready"
  | "invited"
  | "funded"
  | "launched"
  | "running"
  | "stopped"
  | "reclaimed";

const ADMISSION: Record<CampaignWorldState, ReadonlySet<CarbonPersona>> = {
  draft: new Set(["tally-operator"]),
  ready: new Set(["tally-operator"]),
  invited: new Set([
    "tally-operator",
    "non-business-client",
    "tally-business-client",
  ]),
  funded: new Set(["tally-operator", "tally-business-client"]),
  launched: new Set([
    "tally-operator",
    "tally-business-client",
    "tally-worker",
  ]),
  running: new Set([
    "tally-operator",
    "tally-business-client",
    "tally-worker",
  ]),
  stopped: new Set([
    "tally-operator",
    "tally-business-client",
    "tally-worker",
  ]),
  reclaimed: new Set([
    "tally-operator",
    "tally-business-client",
    "tally-worker",
  ]),
};

export function admits(
  persona: CarbonPersona,
  state: CampaignWorldState,
): boolean {
  return ADMISSION[state].has(persona);
}

/** Worker Available = launched ∧ unclaimed. Funded is not Worker chrome. */
export function workerAvailableAdmits(
  state: CampaignWorldState,
  unclaimed: boolean,
): boolean {
  return admits("tally-worker", state) && state === "launched" && unclaimed;
}

export const WORKER_GATE_LABELS_NOT_CHROME = ["funded", "launched"] as const;
