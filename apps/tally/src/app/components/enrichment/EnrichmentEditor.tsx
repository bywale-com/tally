import {
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { PanelLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useEnrichments } from "../../context/EnrichmentContext";
import { formatEnrollmentSummary, canRunEnrollment, isEnrollmentConfigured } from "../../data/enrichmentEnrollment";
import {
  appendNodeAfter,
  createNodeFromBlock,
  createTriggerNode,
  deleteWorkflowNode,
  workflowHasTrigger,
  type EnrichmentEditorTab,
  type EnrichmentNodeData,
  type EnrichmentTriggerKind,
  type EnrichmentWorkflow,
  type PaletteBlock,
} from "../../data/enrichmentWorkflows";
import {
  applyPropagateOutput,
  resolveOutputFromSourceNode,
  seedTargetInputOnConnect,
} from "../../data/enrichmentGraph";
import type { EnrichmentNodePayload } from "../../data/enrichmentNodeRuntime";
import type { Tokens } from "../tokens";
import { EnrichmentBuildPalette } from "./EnrichmentBuildPalette";
import { EnrichmentCanvas } from "./EnrichmentCanvas";
import { EnrichmentNodeConfigModal } from "./EnrichmentNodeConfigModal";
import { EnrichmentRunsTab } from "./EnrichmentRunsTab";

const TABS: { id: EnrichmentEditorTab; label: string }[] = [
  { id: "workflow", label: "Workflow" },
  { id: "runs", label: "Runs" },
  { id: "settings", label: "Settings" },
];

type EnrichmentEditorProps = {
  workflow: EnrichmentWorkflow;
  t: Tokens;
  isDark: boolean;
};

export function EnrichmentEditor({ workflow, t, isDark }: EnrichmentEditorProps) {
  const { updateWorkflow, startMockRun, stopMockRun } = useEnrichments();
  const [tab, setTab] = useState<EnrichmentEditorTab>("workflow");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<EnrichmentNodeData>>(
    structuredClone(workflow.nodes),
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(structuredClone(workflow.edges));
  const [buildOpen, setBuildOpen] = useState(true);
  const [configNodeId, setConfigNodeId] = useState<string | null>(null);
  const [, setSelectedNodeId] = useState<string | null>(null);

  const hasTrigger = useMemo(() => workflowHasTrigger(nodes), [nodes]);
  const manualRunActive = workflow.status === "running";
  const configNode = nodes.find((n) => n.id === configNodeId);
  const triggerNode = nodes.find((n) => n.type === "trigger");
  const enrollment = triggerNode?.data.enrollmentCriteria;

  useEffect(() => {
    setNodes(structuredClone(workflow.nodes));
    setEdges(structuredClone(workflow.edges));
    setConfigNodeId(null);
  }, [workflow.id, setNodes, setEdges]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      updateWorkflow(workflow.id, {
        nodes: structuredClone(nodes),
        edges: structuredClone(edges),
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [nodes, edges, workflow.id, updateWorkflow]);

  const persistGraph = useCallback(
    (nextNodes: Node<EnrichmentNodeData>[], nextEdges: Edge[]) => {
      setNodes(nextNodes);
      setEdges(nextEdges);
    },
    [setNodes, setEdges],
  );

  const handleAddTrigger = useCallback(
    (kind: EnrichmentTriggerKind) => {
      if (hasTrigger) return;
      const created = createTriggerNode(
        kind,
        nodes.map((n) => n.id),
      );
      persistGraph([...nodes, created], edges);
      setConfigNodeId(created.id);
    },
    [hasTrigger, nodes, edges, persistGraph],
  );

  const handleAddBlock = useCallback(
    (block: PaletteBlock) => {
      const ids = nodes.map((n) => n.id);
      const last = nodes[nodes.length - 1];
      const created = createNodeFromBlock(block, ids, {
        x: (last?.position.x ?? 80) + 280,
        y: last?.position.y ?? 120,
      });
      if (last) {
        created.data = {
          ...created.data,
          lastInput: resolveOutputFromSourceNode(last),
        };
      }
      const nextEdges = last
        ? [
            ...edges,
            {
              id: `e-${last.id}-${created.id}`,
              source: last.id,
              target: created.id,
            },
          ]
        : edges;
      persistGraph([...nodes, created], nextEdges);
    },
    [nodes, edges, persistGraph],
  );

  const handleConnect = useCallback(
    (c: Connection) => {
      if (!c.source || !c.target) return;
      const edge: Edge = {
        id: `e-${c.source}-${c.target}-${c.sourceHandle ?? "out"}`,
        source: c.source,
        target: c.target,
        sourceHandle: c.sourceHandle,
        targetHandle: c.targetHandle,
      };
      setEdges((prev) => [...prev, edge]);
      setNodes((prev) => seedTargetInputOnConnect(prev, c.source!, c.target!, c.sourceHandle));
    },
    [setEdges, setNodes],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      const next = deleteWorkflowNode(nodes, edges, nodeId);
      persistGraph(next.nodes, next.edges);
      if (configNodeId === nodeId) setConfigNodeId(null);
    },
    [nodes, edges, persistGraph, configNodeId],
  );

  const handleAttachBlock = useCallback(
    (nodeId: string, block: PaletteBlock, sourceHandle?: string) => {
      const next = appendNodeAfter(nodes, edges, nodeId, block, sourceHandle);
      const source = next.nodes.find((n) => n.id === nodeId);
      const created = next.nodes[next.nodes.length - 1];
      if (source && created && created.id !== nodeId) {
        const seeded = resolveOutputFromSourceNode(source, sourceHandle);
        next.nodes = next.nodes.map((n) =>
          n.id === created.id ? { ...n, data: { ...n.data, lastInput: seeded } } : n,
        );
      }
      persistGraph(next.nodes, next.edges);
    },
    [nodes, edges, persistGraph],
  );

  const handleToggleManualRun = useCallback(() => {
    if (manualRunActive) {
      stopMockRun(workflow.id);
      return;
    }
    const trigger = nodes.find((n) => n.type === "trigger");
    if (!canRunEnrollment(trigger?.data.enrollmentCriteria)) return;
    startMockRun(workflow.id);
  }, [manualRunActive, startMockRun, stopMockRun, workflow.id, nodes]);

  const handleConfigPatch = useCallback(
    (patch: Partial<EnrichmentNodeData>) => {
      if (!configNodeId) return;
      setNodes((prev) =>
        prev.map((n) =>
          n.id === configNodeId ? { ...n, data: { ...n.data, ...patch } } : n,
        ),
      );
    },
    [configNodeId, setNodes],
  );

  const handleOutputProduced = useCallback(
    (output: EnrichmentNodePayload | null) => {
      if (!configNodeId) return;
      setNodes((prev) => applyPropagateOutput(prev, edges, configNodeId, output));
    },
    [configNodeId, edges, setNodes],
  );

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "0 8px",
          height: 36,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        {tab === "workflow" && (
          <button
            type="button"
            title={buildOpen ? "Hide build panel" : "Show build panel"}
            onClick={() => setBuildOpen((v) => !v)}
            style={{
              width: 28,
              height: 28,
              border: "none",
              borderRadius: 4,
              background: buildOpen ? t.activeRowBg : "transparent",
              color: t.textMuted,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PanelLeft size={14} />
          </button>
        )}
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              style={{
                padding: "6px 10px",
                border: "none",
                borderBottom: active ? `2px solid ${t.accent}` : "2px solid transparent",
                background: "transparent",
                color: active ? t.textPrimary : t.textMuted,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "workflow" && (
        <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
          {buildOpen && (
            <EnrichmentBuildPalette
              t={t}
              hasTrigger={hasTrigger}
              onAddBlock={handleAddBlock}
              onAddTrigger={handleAddTrigger}
            />
          )}
          <EnrichmentCanvas
            t={t}
            isDark={isDark}
            nodes={nodes}
            edges={edges}
            manualRunActive={manualRunActive}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onSelectNode={setSelectedNodeId}
            onOpenNodeConfig={setConfigNodeId}
            onToggleManualRun={handleToggleManualRun}
            onDeleteNode={handleDeleteNode}
            onAttachBlock={handleAttachBlock}
            onAddTrigger={handleAddTrigger}
            hasTrigger={hasTrigger}
          />
          {configNode && (
            <EnrichmentNodeConfigModal
              node={configNode}
              nodes={nodes}
              edges={edges}
              triggerData={triggerNode?.data}
              t={t}
              onClose={() => setConfigNodeId(null)}
              onUpdate={handleConfigPatch}
              onOutputProduced={handleOutputProduced}
            />
          )}
        </div>
      )}

      {tab === "runs" && <EnrichmentRunsTab runs={workflow.runs} t={t} />}
      {tab === "settings" && (
        <div style={{ padding: 24, color: t.textMuted, fontSize: 13, lineHeight: 1.5 }}>
          <p style={{ margin: "0 0 8px", color: t.textPrimary, fontWeight: 500 }}>
            Enrichment settings
          </p>
          Enrollment criteria live on the trigger. Schedule defaults and cosmetic settings land
          here next.
          <ul style={{ margin: "12px 0 0", paddingLeft: 18 }}>
            <li>Name: {workflow.name}</li>
            <li>
              Enrollment:{" "}
              {isEnrollmentConfigured(enrollment)
                ? formatEnrollmentSummary(enrollment!)
                : "Not set"}
            </li>
            <li>Updated: {new Date(workflow.updatedAt).toLocaleString()}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
