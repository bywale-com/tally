import { useCallback, useState } from "react";
import { useEnrichments } from "../../context/EnrichmentContext";
import { HolonBoundary } from "../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import type { Tokens } from "../tokens";
import { EnrichmentEditor } from "./EnrichmentEditor";
import { EnrichmentWorkflowHeader } from "./EnrichmentWorkflowHeader";

type EnrichmentDetailViewProps = {
  enrichmentId: string;
  t: Tokens;
  isDark: boolean;
};

export function EnrichmentDetailView({ enrichmentId, t, isDark }: EnrichmentDetailViewProps) {
  const { getWorkflow, renameWorkflow, startMockRun, stopMockRun } = useEnrichments();
  const workflow = getWorkflow(enrichmentId);
  const [savedFlash, setSavedFlash] = useState(false);

  const handleSave = useCallback(() => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  }, []);

  if (!workflow) {
    return (
      <div style={{ padding: 28, color: t.textDim, fontSize: 13 }}>
        Enrichment not found.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        background: t.bgPrimary,
      }}
    >
      <HolonBoundary
        id="enrichment-header"
        label="Enrichment Header"
        icon="magnifying-glass"
        order={SHELL_HOLON_ORDER["enrichment-header"]}
        t={t}
        style={{
          padding: "8px 16px",
          flexShrink: 0,
          background: t.bgPrimary,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <EnrichmentWorkflowHeader
          workflow={workflow}
          t={t}
          savedFlash={savedFlash}
          onRename={(name) => renameWorkflow(enrichmentId, name)}
          onSave={handleSave}
          onLaunch={() => startMockRun(enrichmentId)}
          onStop={() => stopMockRun(enrichmentId)}
        />
      </HolonBoundary>

      <HolonBoundary
        id="enrichment-body"
        label="Enrichment Body"
        icon="list-bullet"
        order={SHELL_HOLON_ORDER["enrichment-body"]}
        t={t}
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <EnrichmentEditor workflow={workflow} t={t} isDark={isDark} />
      </HolonBoundary>
    </div>
  );
}
