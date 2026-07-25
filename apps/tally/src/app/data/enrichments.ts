import type { NotionIconName } from "../icons/notion-icon-urls";
import type { Tokens } from "../components/tokens";

export type EnrichmentStatus = "idle" | "running" | "paused" | "done";

/** Two enrichment families: postings ("jobs") and derived companies. */
export type EnrichmentKind = "jobs" | "companies";

export type EnrichmentListItem = {
  id: string;
  label: string;
  status: EnrichmentStatus;
  /** Set once enrichment criteria kind is chosen on the trigger. */
  kind?: EnrichmentKind;
};

/** Icon carries status — same pattern as Tower audit / contact indicators. */
export type EnrichmentStatusIcon = {
  name: NotionIconName;
  color: string;
  spin?: boolean;
};

export function enrichmentStatusIcon(
  status: EnrichmentStatus,
  t: Tokens,
  isActive: boolean,
): EnrichmentStatusIcon {
  switch (status) {
    case "running":
      return { name: "circle-dashed", color: t.amber, spin: true };
    case "paused":
      return { name: "clock", color: t.amber };
    case "done":
      return { name: "checkmark-list", color: isActive ? t.accent : t.success };
    case "idle":
    default:
      return {
        name: "magnifying-glass",
        color: isActive ? t.accent : t.textMuted,
      };
  }
}

export function nextUntitledEnrichmentLabel(existing: EnrichmentListItem[]): string {
  const untitledCount = existing.filter((item) =>
    /^Untitled enrichment( \d+)?$/.test(item.label),
  ).length;
  return untitledCount === 0
    ? "Untitled enrichment"
    : `Untitled enrichment ${untitledCount + 1}`;
}

export function normalizeEnrichmentLabel(label: string): string {
  const trimmed = label.trim().replace(/\s+/g, " ");
  return trimmed.length > 0 ? trimmed : "Untitled enrichment";
}

export function createEnrichment(
  existing: EnrichmentListItem[],
  kind: EnrichmentKind = "jobs",
): EnrichmentListItem {
  return {
    id: `enrichment-${Date.now()}`,
    label: nextUntitledEnrichmentLabel(existing),
    status: "idle",
    kind,
  };
}
