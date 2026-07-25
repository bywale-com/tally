import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps, type EdgeTypes } from "@xyflow/react";
import type { Tokens } from "../../components/tokens";

export const HOW_ANALYSIS_EDGE_TYPE = "howAnalysisEdge";

export type HowAnalysisEdgeData = {
  variant: "how" | "merge";
  t: Tokens;
};

export function HowAnalysisEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
  style,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const t = (data as HowAnalysisEdgeData | undefined)?.t;
  const variant = (data as HowAnalysisEdgeData | undefined)?.variant ?? "how";

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {label && t ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "none",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: variant === "merge" ? t.accent : t.textMuted,
              background: t.bgPrimary,
              border: `1px solid ${variant === "merge" ? t.accent : t.border}`,
              padding: "2px 6px",
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const howAnalysisEdgeTypes: EdgeTypes = {
  [HOW_ANALYSIS_EDGE_TYPE]: HowAnalysisEdge,
};
