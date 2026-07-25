import { X } from "lucide-react";
import { SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import { useDocsRegistry } from "../context/DocsRegistryContext";
import { useHolonDetail } from "../context/HolonDetailContext";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import type { Tokens } from "./tokens";

type HolonDetailPanelProps = {
  width: number;
  t: Tokens;
};

export function HolonDetailPanel({ width, t }: HolonDetailPanelProps) {
  const { detailHolonId, closeHolonDetail } = useHolonDetail();
  const { holons } = useDocsRegistry();
  const holon = detailHolonId ? holons.get(detailHolonId) : null;

  if (!detailHolonId) return null;

  return (
    <div
      style={{
        width,
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        borderLeft: `1px solid ${t.border}`,
        overflow: "hidden",
      }}
    >
      <HolonBoundary
        id="holon-detail-header"
        label="Holon Detail Header"
        icon="information-circle"
        order={SHELL_HOLON_ORDER["holon-detail-header"]}
        t={t}
        style={{
          height: SIDEBAR_HEADER_HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: t.textPrimary }}>
          {holon?.label ?? detailHolonId}
        </span>
        <button
          type="button"
          title="Close"
          onClick={closeHolonDetail}
          style={{
            width: 24,
            height: 24,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: t.textMuted,
          }}
        >
          <X size={14} strokeWidth={2} />
        </button>
      </HolonBoundary>

      <HolonBoundary
        id="holon-detail-body"
        label="Holon Detail Body"
        icon="document"
        order={SHELL_HOLON_ORDER["holon-detail-body"]}
        t={t}
        style={{ flex: 1, overflowY: "auto", padding: 16 }}
      >
        <p style={{ margin: "0 0 8px", fontSize: 12, color: t.textMuted }}>Holon id</p>
        <code style={{ fontSize: 12, color: t.textPrimary }}>{detailHolonId}</code>
        <p style={{ margin: "16px 0 8px", fontSize: 12, color: t.textMuted }}>Functional label</p>
        <p style={{ margin: 0, fontSize: 13, color: t.textPrimary }}>{holon?.label ?? "—"}</p>
      </HolonBoundary>
    </div>
  );
}
