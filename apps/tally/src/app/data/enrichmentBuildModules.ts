import type { NotionIconName } from "../icons/notion-icon-urls";
import type { PaletteBlock } from "./enrichmentWorkflows";

/** Peer build modules after trigger enrollment — mirrors Tower Automations peers. */
export const ENRICHMENT_BUILD_MODULES = [
  "constants",
  "conditions",
  "operations",
  "rules",
  "actions",
] as const;

export type EnrichmentBuildModule = (typeof ENRICHMENT_BUILD_MODULES)[number];

export const ENRICHMENT_BUILD_MODULE_LABELS: Record<EnrichmentBuildModule, string> = {
  constants: "Constants",
  conditions: "Conditions",
  operations: "Operations",
  rules: "Rules",
  actions: "Actions",
};

export const ENRICHMENT_BUILD_MODULE_HINTS: Record<EnrichmentBuildModule, string> = {
  constants: "Values referenced by later nodes",
  conditions: "Extra gates after enrollment",
  operations: "Transforms, dedupe, flow control",
  rules: "Deep-screen / lane / dialability packages",
  actions: "Export, write results, open dial list",
};

export function paletteBlocksByModule(
  blocks: PaletteBlock[],
): Record<EnrichmentBuildModule, PaletteBlock[]> {
  const grouped: Record<EnrichmentBuildModule, PaletteBlock[]> = {
    constants: [],
    conditions: [],
    operations: [],
    rules: [],
    actions: [],
  };
  for (const block of blocks) {
    if (block.module in grouped) {
      grouped[block.module as EnrichmentBuildModule].push(block);
    }
  }
  return grouped;
}

export function paletteBlockIcon(block: PaletteBlock): NotionIconName {
  switch (block.module) {
    case "constants":
      return "gear";
    case "conditions":
      return "filter";
    case "operations":
      return block.nodeType === "exit" ? "dot-circle" : "arrows-up-down";
    case "rules":
      return "lightning-bolt";
    case "actions":
      return "directional-sign";
    default:
      return "gear";
  }
}
