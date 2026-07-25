import { Play, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import { canRunEnrollment } from "../../data/enrichmentEnrollment";
import { listUpstreamDataSources } from "../../data/enrichmentGraph";
import {
  runEnrollmentTriggerPull,
  runFieldGateNode,
  runPassThroughNode,
  type EnrichmentNodePayload,
} from "../../data/enrichmentNodeRuntime";
import type { EnrichmentNodeData } from "../../data/enrichmentWorkflows";
import { HolonBoundary } from "../docs/HolonBoundary";
import type { Tokens } from "../tokens";
import { EnrichmentConfigPanelBody } from "./EnrichmentConfigPanel";
import { EnrichmentEnrollmentParams } from "./EnrichmentEnrollmentConfigPanel";
import { NodeDataPane } from "./NodeDataPane";

type EnrichmentNodeConfigModalProps = {
  node: Node<EnrichmentNodeData>;
  nodes: Node<EnrichmentNodeData>[];
  edges: Edge[];
  triggerData?: EnrichmentNodeData;
  t: Tokens;
  onClose: () => void;
  onUpdate: (patch: Partial<EnrichmentNodeData>) => void;
  onOutputProduced: (output: EnrichmentNodePayload | null) => void;
};

/**
 * Tower-style center modal: Input · Configuration/Parameters · Output.
 * Triggers have empty Input (nothing upstream).
 */
export function EnrichmentNodeConfigModal({
  node,
  nodes,
  edges,
  triggerData,
  t,
  onClose,
  onUpdate,
  onOutputProduced,
}: EnrichmentNodeConfigModalProps) {
  const data = node.data;
  const isTrigger = node.type === "trigger";
  const criteriaKind = data.enrollmentCriteria?.kind;
  const [forceKindPicker, setForceKindPicker] = useState(!criteriaKind);
  const pickingEnrichmentKind = isTrigger && (forceKindPicker || !criteriaKind);
  const [running, setRunning] = useState(false);

  const upstreamSources = useMemo(
    () => (isTrigger ? [] : listUpstreamDataSources(node.id, nodes, edges)),
    [isTrigger, node.id, nodes, edges],
  );
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const selectedUpstream =
    upstreamSources.find((s) => s.nodeId === selectedSourceId) ?? upstreamSources[0] ?? null;
  const inputPaneData = isTrigger
    ? null
    : selectedUpstream?.data ?? data.lastInput ?? null;

  const middleLabel = isTrigger ? "Configuration" : "Parameters";
  const subtitle = isTrigger
    ? data.triggerKind === "schedule"
      ? "Schedule trigger"
      : data.triggerKind === "source_update"
        ? "Source update trigger"
        : "Manual trigger"
    : node.type ?? "Node";

  const canRunTrigger =
    isTrigger &&
    data.triggerKind === "manual" &&
    canRunEnrollment(data.enrollmentCriteria) &&
    !running;

  const canRunDownstream = !isTrigger && !running;

  async function handleRun() {
    setRunning(true);
    onUpdate({ runStatus: "running", lastRunError: null });
    try {
      if (isTrigger) {
        if (!canRunEnrollment(data.enrollmentCriteria)) return;
        const output = await runEnrollmentTriggerPull(data.enrollmentCriteria);
        onUpdate({
          lastOutput: output,
          runStatus: "done",
          lastRunError: output.error ?? null,
          configured: true,
          enrollmentHint:
            output.itemCount > 0
              ? `Pulled ${output.itemCount} item${output.itemCount === 1 ? "" : "s"}${
                  output.transport ? ` · ${output.transport}` : ""
                }`
              : data.enrollmentHint,
        });
        onOutputProduced(output);
        return;
      }

      const input = inputPaneData;
      let output: EnrichmentNodePayload;
      if (node.type === "condition") {
        output = runFieldGateNode(data, input);
      } else {
        output = runPassThroughNode(input);
      }
      onUpdate({
        lastInput: input,
        lastOutput: output,
        runStatus: "done",
        lastRunError: null,
        configured: true,
      });
      onOutputProduced(output);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      onUpdate({
        runStatus: "error",
        lastRunError: message,
        lastOutput: null,
      });
      onOutputProduced(null);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div
      role="presentation"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <HolonBoundary
        id="enrichment-node-config"
        label="Node configuration"
        icon="gear"
        order={40}
        t={t}
        style={{ display: "contents" }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={data.label}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(1120px, 94vw)",
            height: "min(820px, 88vh)",
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            color: t.textPrimary,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "14px 16px",
              borderBottom: `1px solid ${t.border}`,
              flexShrink: 0,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: t.textPrimary,
                }}
              >
                {data.label}
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: t.textMuted }}>
                {isTrigger
                  ? `${subtitle} · ${middleLabel} · Output`
                  : `${subtitle} · Input · ${middleLabel} · Output`}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {(canRunTrigger || canRunDownstream) && (
                <button
                  type="button"
                  onClick={() => void handleRun()}
                  disabled={isTrigger ? !canRunTrigger : !canRunDownstream}
                  style={{
                    display: "inline-flex",
                    height: 32,
                    alignItems: "center",
                    gap: 8,
                    padding: "0 12px",
                    borderRadius: 6,
                    border: `1px solid ${t.border}`,
                    background: t.accentBg,
                    color: t.textPrimary,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: running ? "wait" : "pointer",
                  }}
                >
                  <Play size={13} strokeWidth={2} fill="currentColor" />
                  {running ? "Running…" : "Run"}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                style={{
                  display: "inline-flex",
                  width: 32,
                  height: 32,
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  borderRadius: 6,
                  background: "transparent",
                  color: t.textMuted,
                  cursor: "pointer",
                }}
                aria-label="Close"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          {data.lastRunError && (
            <div
              style={{
                padding: "8px 16px",
                fontSize: 11,
                color: t.red,
                borderBottom: `1px solid ${t.border}`,
                background: "rgba(239, 68, 68, 0.06)",
                flexShrink: 0,
              }}
            >
              {data.lastRunError}
            </div>
          )}

          {data.lastOutput?.searchUrl && (
            <div
              style={{
                padding: "6px 16px",
                fontSize: 10,
                color: t.textMuted,
                borderBottom: `1px solid ${t.border}`,
                wordBreak: "break-all",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                flexShrink: 0,
              }}
            >
              {data.lastOutput.searchUrl}
            </div>
          )}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: pickingEnrichmentKind
                ? "1fr"
                : isTrigger
                  ? "1.2fr 1fr"
                  : "1fr 1.15fr 1fr",
              gap: 12,
              padding: 12,
            }}
          >
            {!isTrigger && (
              <NodeDataPane
                title="Input"
                emptyHint={
                  upstreamSources.length === 0
                    ? "Connect an upstream node and run it to populate input."
                    : "Run the selected upstream node to populate input."
                }
                data={inputPaneData}
                t={t}
                enableFieldDrag={Boolean(inputPaneData)}
                sourceOptions={
                  upstreamSources.length > 0
                    ? upstreamSources.map((s) => ({
                        id: s.nodeId,
                        label: s.label,
                        role: s.role,
                      }))
                    : undefined
                }
                selectedSourceId={selectedUpstream?.nodeId ?? null}
                onSelectSource={setSelectedSourceId}
              />
            )}

            <div
              style={{
                minHeight: 0,
                overflow: "auto",
                border: `1px solid ${t.border}`,
                borderRadius: 10,
                background: t.boardPanel,
                padding: 14,
              }}
            >
              <div
                style={{
                  marginBottom: 10,
                  color: t.textMuted,
                  textTransform: "uppercase",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {pickingEnrichmentKind ? "Enrichment type" : middleLabel}
              </div>
              {isTrigger ? (
                <EnrichmentEnrollmentParams
                  data={data}
                  t={t}
                  forceKindPicker={forceKindPicker}
                  onForceKindPicker={setForceKindPicker}
                  onUpdate={(patch) => {
                    onUpdate(patch);
                    if (patch.lastOutput !== undefined) {
                      onOutputProduced(patch.lastOutput ?? null);
                    }
                  }}
                />
              ) : (
                <EnrichmentConfigPanelBody
                  node={node}
                  triggerData={triggerData}
                  t={t}
                  onChange={(next) => onUpdate(next)}
                />
              )}
            </div>

            {!pickingEnrichmentKind && (
              <NodeDataPane
                title="Output"
                emptyHint="Run this node (or Pull on Indeed) to see output (Schema · Table · JSON)."
                data={data.lastOutput}
                t={t}
                showRunChrome
              />
            )}
          </div>
        </div>
      </HolonBoundary>
    </div>
  );
}
