import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Calendar, Hand, Play, Square, Zap } from "lucide-react";
import {
  canRunEnrollment,
  enrollmentHasUnresolvedIssues,
  isEnrollmentConfigured,
} from "../../data/enrichmentEnrollment";
import type { EnrichmentNodeData } from "../../data/enrichmentWorkflows";
import { useEnrichmentEditor } from "./EnrichmentEditorContext";
import { EnrichmentEnrollmentCriteriaSummary } from "./EnrichmentEnrollmentCriteriaSummary";
import {
  handleStyle,
  workflowBodyText,
  workflowHintText,
  workflowNodeShell,
  workflowPill,
} from "./nodeStyles";

export function TriggerNode({ id, data, selected }: NodeProps<Node<EnrichmentNodeData>>) {
  const { t, onOpenNodeConfig, onToggleManualRun, manualRunActive } = useEnrichmentEditor();
  const kind = data.triggerKind ?? "manual";
  const Icon = kind === "schedule" ? Calendar : kind === "manual" ? Hand : Zap;
  const running = data.runStatus === "running" || manualRunActive;
  const hasCriteria = isEnrollmentConfigured(data.enrollmentCriteria);
  const unresolved = enrollmentHasUnresolvedIssues(data.enrollmentCriteria);
  const canRun = canRunEnrollment(data.enrollmentCriteria);
  const showSummary = hasCriteria || unresolved;

  return (
    <div style={workflowNodeShell(t, !!selected, 300, data.runStatus)}>
      <Handle type="source" position={Position.Right} style={handleStyle(t)} />
      <div style={workflowPill(t)}>
        <Icon size={11} strokeWidth={2} />
        Trigger
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <p style={workflowBodyText(t)}>{data.label}</p>
          <p style={workflowHintText(t)}>
            {kind === "schedule"
              ? data.scheduleSummary ?? "Add schedule"
              : kind === "source_update"
                ? "When enrolled sources update"
                : "Run on demand"}
          </p>
        </div>
        {kind === "manual" && (
          <button
            type="button"
            title={
              running
                ? "Stop"
                : canRun
                  ? "Run"
                  : unresolved
                    ? "Resolve mapping attention before run"
                    : "Set enrichment criteria before run"
            }
            disabled={!running && !canRun}
            className="nodrag nopan"
            onClick={(e) => {
              e.stopPropagation();
              if (!running && !canRun) return;
              onToggleManualRun(id);
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "none",
              background: running ? t.amberBg : canRun ? t.accentBg : t.hoverBg,
              color: running ? t.amber : canRun ? t.accent : t.textDim,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: running || canRun ? "pointer" : "not-allowed",
              flexShrink: 0,
              opacity: running || canRun ? 1 : 0.55,
            }}
          >
            {running ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
          </button>
        )}
      </div>

      {showSummary ? (
        <EnrichmentEnrollmentCriteriaSummary
          criteria={data.enrollmentCriteria}
          t={t}
          compact
          onOpenConfig={() => onOpenNodeConfig(id)}
        />
      ) : (
        <button
          type="button"
          className="nodrag nopan"
          onClick={(e) => {
            e.stopPropagation();
            onOpenNodeConfig(id);
          }}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px dashed ${t.border}`,
            background: t.hoverBg,
            color: t.accent,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "inherit",
          }}
        >
          Add enrichment criteria
        </button>
      )}
    </div>
  );
}

function GenericNode({
  id,
  data,
  selected,
  moduleLabel,
  summary,
}: NodeProps<Node<EnrichmentNodeData>> & { moduleLabel: string; summary?: string }) {
  const { t, onOpenNodeConfig } = useEnrichmentEditor();
  return (
    <div style={workflowNodeShell(t, !!selected, 260, data.runStatus)}>
      <Handle type="target" position={Position.Left} style={handleStyle(t)} />
      <Handle type="source" position={Position.Right} style={handleStyle(t)} />
      <div style={workflowPill(t)}>{moduleLabel}</div>
      <p style={workflowBodyText(t)}>{data.label}</p>
      <p style={workflowHintText(t)}>{summary ?? (data.configured ? "Ready" : "Configure…")}</p>
      <button
        type="button"
        className="nodrag nopan"
        onClick={(e) => {
          e.stopPropagation();
          onOpenNodeConfig(id);
        }}
        style={{
          marginTop: 8,
          border: "none",
          background: "transparent",
          color: t.accent,
          fontSize: 11,
          fontWeight: 500,
          cursor: "pointer",
          padding: 0,
        }}
      >
        Configure
      </button>
    </div>
  );
}

export function ConstantNode(props: NodeProps<Node<EnrichmentNodeData>>) {
  return (
    <GenericNode
      {...props}
      moduleLabel="Constant"
      summary={props.data.constantSummary}
    />
  );
}

export function ConditionNode(props: NodeProps<Node<EnrichmentNodeData>>) {
  const { t, onOpenNodeConfig } = useEnrichmentEditor();
  const { id, data, selected } = props;
  const isIf = data.conditionKind === "if";
  return (
    <div style={workflowNodeShell(t, !!selected, 260, data.runStatus)}>
      <Handle type="target" position={Position.Left} style={handleStyle(t)} />
      <Handle
        type="source"
        id="true"
        position={Position.Right}
        style={{ ...handleStyle(t), top: isIf ? "35%" : "50%" }}
      />
      {isIf && (
        <Handle
          type="source"
          id="false"
          position={Position.Right}
          style={{ ...handleStyle(t), top: "70%" }}
        />
      )}
      <div style={workflowPill(t)}>Condition</div>
      <p style={workflowBodyText(t)}>{data.label}</p>
      <p style={workflowHintText(t)}>{data.conditionSummary ?? "Configure…"}</p>
      {isIf && (
        <p style={{ ...workflowHintText(t), marginTop: 6 }}>
          true → top · false → bottom
        </p>
      )}
      <button
        type="button"
        className="nodrag nopan"
        onClick={(e) => {
          e.stopPropagation();
          onOpenNodeConfig(id);
        }}
        style={{
          marginTop: 8,
          border: "none",
          background: "transparent",
          color: t.accent,
          fontSize: 11,
          fontWeight: 500,
          cursor: "pointer",
          padding: 0,
        }}
      >
        Configure
      </button>
    </div>
  );
}

export function OperationNode(props: NodeProps<Node<EnrichmentNodeData>>) {
  return (
    <GenericNode
      {...props}
      moduleLabel="Operation"
      summary={props.data.operationSummary}
    />
  );
}

export function RuleNode(props: NodeProps<Node<EnrichmentNodeData>>) {
  return <GenericNode {...props} moduleLabel="Rule" summary={props.data.ruleSummary} />;
}

export function ActionNode(props: NodeProps<Node<EnrichmentNodeData>>) {
  return <GenericNode {...props} moduleLabel="Action" summary={props.data.actionSummary} />;
}

export function ExitNode({ data, selected }: NodeProps<Node<EnrichmentNodeData>>) {
  const { t } = useEnrichmentEditor();
  return (
    <div style={workflowNodeShell(t, !!selected, 160, data.runStatus)}>
      <Handle type="target" position={Position.Left} style={handleStyle(t)} />
      <div style={workflowPill(t)}>Exit</div>
      <p style={workflowBodyText(t)}>{data.label}</p>
    </div>
  );
}
