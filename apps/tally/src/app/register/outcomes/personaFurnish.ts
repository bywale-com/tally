/**
 * Furnish — canonical inventory under each persona Outcome.
 * Each item is a checklist beat + surfaces + live holon highlight targets.
 *
 * List row keeps `label` + `section` unchanged.
 * Info panel shows `narrativeParts` (clickable context + focus) and Modules (`surfaces`).
 * Row hover highlights only `focusHolonId` — the furniture this entry planted, not pre-existing chrome.
 */

export type FurnishStatus = "planted" | "deferred";

/** One span of inhabit copy; optional holonId makes the span clickable in the info panel. */
export type FurnishNarrativePart = {
  text: string;
  holonId?: string;
};

export type PersonaFurnishItem = {
  id: string;
  n: number;
  /** Checklist section heading — do not rewrite for inhabit UX. */
  section: string;
  /** Checklist title shown on the row — do not replace with narrativeParts. */
  label: string;
  /**
   * Module / export names for taxonomy (filenames OK here).
   */
  surfaces: string[];
  /**
   * Legacy plain narrative — prefer narrativeParts when present.
   */
  narrative?: string;
  /**
   * Inhabit statement for the info panel only. Parts with holonId are clickable
   * and reveal that region on Click-through. Write without hyphens.
   * Context parts may link pre-existing surfaces; the focus part links focusHolonId.
   */
  narrativeParts?: FurnishNarrativePart[];
  /**
   * The one surface this entry planted to meet the beat. Row hover highlights only this.
   */
  focusHolonId?: string;
  /** Optional secondary refs (not used for row hover when focusHolonId is set). */
  holonIds?: string[];
  status: FurnishStatus;
};

export type FurnishPersonaPrefix = "worker" | "bc" | "guest" | "op";

/** Stable focus holon id for furnish checklist item n. */
export function furnishFocusId(persona: FurnishPersonaPrefix, n: number): string {
  return `${persona}-ct-f-${n}`;
}
