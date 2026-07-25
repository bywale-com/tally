import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { Tokens } from "../../../components/tokens";
import type { HowNodeKind } from "../types";
import {
  howAnalysisBodyText,
  howAnalysisHintText,
  howAnalysisKindPill,
  howAnalysisNodeShell,
} from "../howAnalysisNodeStyles";

export type HowAnalysisNodeData = {
  nodeId: string;
  answerDisplay: string;
  kind: HowNodeKind;
  hasMerge: boolean;
  t: Tokens;
};

export function HowAnalysisNode({ data, selected }: NodeProps<Node<HowAnalysisNodeData>>) {
  const { answerDisplay, kind, hasMerge, t } = data;

  return (
    <div style={howAnalysisNodeShell(t, selected ?? false, kind)}>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          borderRadius: 0,
          border: `2px solid ${kind === "outcome" ? t.accent : t.textPrimary}`,
          background: t.bgPrimary,
        }}
      />
      <div style={{ padding: "8px 10px 0", display: "flex", gap: 6, alignItems: "center" }}>
        <span style={howAnalysisKindPill(t, kind)}>{kind}</span>
        {hasMerge ? (
          <span style={howAnalysisHintText(t, t.accent)}>merge</span>
        ) : null}
      </div>
      <div style={{ padding: "8px 10px 12px" }}>
        <div style={howAnalysisBodyText(t, kind)}>{answerDisplay}</div>
        <div style={{ ...howAnalysisHintText(t), marginTop: 6 }}>Click for question · C3</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          borderRadius: 0,
          border: `2px solid ${t.textPrimary}`,
          background: t.bgPrimary,
        }}
      />
    </div>
  );
}
