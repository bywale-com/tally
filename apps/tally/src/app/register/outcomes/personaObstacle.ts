/**
 * Shared obstacle shape for persona Can'ts under Outcome.
 *
 * List row keeps `cant` unchanged.
 * Info panel shows `howParts` (clickable context + focus). Write without hyphens.
 * Row hover highlights only `focusHolonId` — the surface that proves the Can't is met.
 */

export type ObstacleStatus = "done" | "open";

/** One span of how-path copy; optional holonId makes the span clickable. */
export type ObstacleHowPart = {
  text: string;
  holonId?: string;
};

export type PersonaObstacle = {
  id: string;
  /** Rank 1 = most critical */
  rank: number;
  /** Checklist Can't title on the row — do not replace with howParts. */
  cant: string;
  /**
   * Legacy plain how path — prefer howParts when present.
   */
  how?: string;
  /**
   * Inhabit how-path for the info panel only. Parts with holonId are clickable.
   * Context may link pre-existing surfaces; focus part links focusHolonId.
   */
  howParts?: ObstacleHowPart[];
  /**
   * The one surface that proves this Can't is met. Row hover highlights only this.
   */
  focusHolonId?: string;
  /** Optional secondary refs (not used for row hover when focusHolonId is set). */
  holonIds?: string[];
  status: ObstacleStatus;
};
