import type { CSSProperties } from "react";
import type { HolonId } from "../../context/DocsHighlightContext";
import { useDocsHighlight } from "../../context/DocsHighlightContext";

export const HOLON_INSPECT_ID_ATTR = "data-holon-id";
export const HOLON_INSPECT_PICK_ATTR = "data-holon-inspect-pick";

export type HolonInspectTargetProps = {
  [HOLON_INSPECT_ID_ATTR]: HolonId;
  [HOLON_INSPECT_PICK_ATTR]: "";
};

export function holonInspectTargetProps(id: HolonId): HolonInspectTargetProps {
  return {
    [HOLON_INSPECT_ID_ATTR]: id,
    [HOLON_INSPECT_PICK_ATTR]: "",
  };
}

export function useIsDocsTarget(id: HolonId): boolean {
  const { hoveredComponentIds } = useDocsHighlight();
  return hoveredComponentIds.includes(id);
}

export function docsTargetHighlight(
  active: boolean,
  accent: string,
): Pick<CSSProperties, "boxShadow" | "transition"> {
  return {
    // Outer ring — readable on micro furniture (dots, locks), not only large panels.
    boxShadow: active ? `0 0 0 2px ${accent}` : "none",
    transition: "box-shadow 0.12s ease",
  };
}
