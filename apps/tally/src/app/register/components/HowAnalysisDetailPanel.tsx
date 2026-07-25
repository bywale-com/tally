import type { Tokens } from "../../components/tokens";
import type { HowNode } from "../howAnalysis/types";
import {
  howAnalysisSectionBody,
  howAnalysisSectionLabel,
} from "../howAnalysis/howAnalysisNodeStyles";

type HowAnalysisDetailPanelProps = {
  node: HowNode;
  t: Tokens;
  onJumpToMerge?: (nodeId: string) => void;
};

function ComponentGroup({
  label,
  items,
  t,
}: {
  label: string;
  items: string[] | undefined;
  t: Tokens;
}) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={howAnalysisSectionLabel(t)}>{label}</p>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((item) => (
          <li key={item} style={{ ...howAnalysisSectionBody(t), marginBottom: 4 }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HowAnalysisDetailPanel({ node, t, onJumpToMerge }: HowAnalysisDetailPanelProps) {
  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        borderLeft: `1px solid ${t.border}`,
        background: t.boardPanel,
        overflowY: "auto",
        minHeight: 0,
      }}
    >
      <div style={{ padding: "14px 14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: node.kind === "leaf" ? t.success : t.accent,
            }}
          >
            {node.kind}
          </span>
          {node.isLeaf ? (
            <span style={{ fontSize: 11, color: t.textMuted }}>· true leaf</span>
          ) : null}
        </div>

        {node.isLeaf ? (
          <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.45, color: t.textMuted }}>
            True leaf — process and system language is allowed in this Q/A. Map stores and wires
            from Register flows here.
          </p>
        ) : (
          <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.45, color: t.textMuted }}>
            Before a leaf — question, clarity, and criteria stay user-visible only. Child questions
            must trace to a phrase in the parent answer (DNA).
          </p>
        )}

        {node.question ? (
          <div style={{ marginBottom: 16 }}>
            <p style={howAnalysisSectionLabel(t)}>Question</p>
            <p style={howAnalysisSectionBody(t)}>{node.question}</p>
          </div>
        ) : null}

        <div style={{ marginBottom: 16 }}>
          <p style={howAnalysisSectionLabel(t)}>Clarity</p>
          <p style={howAnalysisSectionBody(t)}>{node.clarity}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={howAnalysisSectionLabel(t)}>When</p>
          <p style={howAnalysisSectionBody(t)}>{node.criteria.when ?? "—"}</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={howAnalysisSectionLabel(t)}>Conditions</p>
          {node.criteria.conditions.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {node.criteria.conditions.map((c) => (
                <li key={c} style={{ ...howAnalysisSectionBody(t), marginBottom: 4 }}>
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p style={howAnalysisSectionBody(t)}>—</p>
          )}
        </div>

        <div style={{ marginBottom: 8 }}>
          <p style={howAnalysisSectionLabel(t)}>Components</p>
        </div>
        <ComponentGroup label="UI" items={node.components.ui} t={t} />
        <ComponentGroup label="Runtime" items={node.components.runtime} t={t} />
        <ComponentGroup label="Stores" items={node.components.stores} t={t} />
        <ComponentGroup label="External" items={node.components.external} t={t} />
        {!node.components.ui?.length &&
        !node.components.runtime?.length &&
        !node.components.stores?.length &&
        !node.components.external?.length ? (
          <p style={{ ...howAnalysisSectionBody(t), color: t.textDim }}>None yet</p>
        ) : null}

        {node.flowId ? (
          <div style={{ marginTop: 16 }}>
            <p style={howAnalysisSectionLabel(t)}>Flow</p>
            <p style={howAnalysisSectionBody(t)}>{node.flowId}</p>
          </div>
        ) : null}

        {node.mergeWithId && onJumpToMerge ? (
          <button
            type="button"
            onClick={() => onJumpToMerge(node.mergeWithId!)}
            style={{
              marginTop: 16,
              padding: "6px 10px",
              border: `1px solid ${t.border}`,
              borderRadius: 4,
              background: t.bgPrimary,
              color: t.accent,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Jump to merge
          </button>
        ) : null}
      </div>
    </aside>
  );
}
