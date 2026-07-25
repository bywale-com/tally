import { useState } from "react";
import type { Tokens } from "../../components/tokens";
import { BusinessClientDesk } from "../wireframes/loFi/BusinessClientDesk";
import { GuestVessel } from "../wireframes/loFi/GuestVessel";
import { OperatorPrototypeApp } from "../wireframes/loFi/OperatorPrototypeApp";
import { WorkerPrototypeApp } from "../wireframes/loFi/WorkerPrototypeApp";

type RegisterPrototypePanelProps = {
  graphId: string;
  graphLabel: string;
  t: Tokens;
};

const CAPTION: Record<string, string> = {
  "operator-core-outcome": "Operator click-through",
  "worker-core-outcome": "Worker click-through",
  "non-business-client-core-outcome": "Guest vessel → Business Client desk",
  "client-core-outcome": "Business Client desk",
};

/** Guest fund → same-person BC desk. */
function GuestContinuumClickThrough() {
  const [mode, setMode] = useState<"guest" | "desk">("guest");
  if (mode === "desk") return <BusinessClientDesk />;
  return <GuestVessel onOpenDesk={() => setMode("desk")} />;
}

/** Click-through lo-fi — Guest vessel + BC desk; Operator/Worker stay separate. */
export function RegisterPrototypePanel({
  graphId,
  graphLabel,
  t,
}: RegisterPrototypePanelProps) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: t.hoverBg,
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
          Click-through · {graphLabel}
        </div>
        {CAPTION[graphId] ? (
          <div style={{ marginTop: 4, fontSize: 12, color: t.textMuted }}>
            {CAPTION[graphId]}
          </div>
        ) : null}
      </div>
      {graphId === "operator-core-outcome" ? <OperatorPrototypeApp /> : null}
      {graphId === "worker-core-outcome" ? <WorkerPrototypeApp /> : null}
      {graphId === "non-business-client-core-outcome" ? (
        <GuestContinuumClickThrough />
      ) : null}
      {graphId === "client-core-outcome" ? <BusinessClientDesk /> : null}
    </div>
  );
}

/** Graphs that have a dedicated persona click-through (not strips-only). */
export function hasClickThroughForGraph(graphId: string | null): boolean {
  return (
    graphId === "operator-core-outcome" ||
    graphId === "worker-core-outcome" ||
    graphId === "non-business-client-core-outcome" ||
    graphId === "client-core-outcome"
  );
}
