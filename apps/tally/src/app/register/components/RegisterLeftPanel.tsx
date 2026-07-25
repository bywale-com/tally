import type { Tokens } from "../../components/tokens";
import { OutcomesPanel } from "./OutcomesPanel";

type RegisterLeftPanelProps = {
  width: number;
  t: Tokens;
};

function sectionLabelStyle(t: Tokens) {
  return {
    margin: 0,
    padding: "10px 12px 6px",
    fontSize: 11,
    fontWeight: 500 as const,
    lineHeight: 1.25,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    color: t.textDim,
  };
}

function quietStubStyle(t: Tokens) {
  return {
    margin: 0,
    padding: "2px 12px 10px",
    fontSize: 12,
    lineHeight: 1.4,
    color: t.textMuted,
  };
}

/** Register sidebar shell — one header, one scroll; Outcomes is the work. */
export function RegisterLeftPanel({ width, t }: RegisterLeftPanelProps) {
  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${t.border}`,
        background: t.bgSecondary,
        minHeight: 0,
      }}
    >
      <header
        style={{
          height: 35,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          Register
        </span>
      </header>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "4px 0 12px" }}>
        <p style={sectionLabelStyle(t)}>Outcomes</p>
        <OutcomesPanel t={t} />

        <p style={sectionLabelStyle(t)}>Flows</p>
        <p style={quietStubStyle(t)}>Crystallize at flow anchors when How children are all leaves.</p>

        <p style={sectionLabelStyle(t)}>Components</p>
        <p style={quietStubStyle(t)}>Holon catalog — live surfaces register via HolonBoundary.</p>
      </div>
    </aside>
  );
}
