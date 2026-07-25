import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Tokens } from "../../components/tokens";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { buildHowGraph } from "../howAnalysis/buildHowGraph";
import { getHowGraph, getHowNode } from "../howAnalysis";
import { howAnalysisEdgeTypes } from "../howAnalysis/howAnalysisEdgeTypes";
import { howAnalysisNodeTypes } from "../howAnalysis/howAnalysisNodeTypes";
import { loadHowNodePositions, saveHowNodePosition } from "../howAnalysis/howAnalysisLayout";
import type { HowAnalysisNodeData } from "../howAnalysis/nodes/HowAnalysisNode";
import { HowAnalysisDetailPanel } from "./HowAnalysisDetailPanel";

type RegisterHowCanvasProps = {
  graphId: string;
  t: Tokens;
  isDark: boolean;
};

function HowCanvasFitViewOnce() {
  const { fitView } = useReactFlow();
  const didFit = useRef(false);

  useEffect(() => {
    if (didFit.current) return;
    didFit.current = true;
    requestAnimationFrame(() => {
      void fitView({ padding: 0.25, maxZoom: 1 });
    });
  }, [fitView]);

  return null;
}

function RegisterHowCanvasInner({ graphId, t, isDark }: RegisterHowCanvasProps) {
  const { selectedHowNodeId, selectHowNode } = useRegisterSelection();
  const graph = getHowGraph(graphId);
  const selectedNode = graph && selectedHowNodeId ? getHowNode(graph, selectedHowNodeId) : undefined;
  const savedPositions = useMemo(() => loadHowNodePositions(graphId), [graphId]);

  const built = useMemo(
    () => (graph ? buildHowGraph(graph, t, savedPositions) : null),
    [graph, t, savedPositions],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(built?.nodes ?? []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(built?.edges ?? []);

  useEffect(() => {
    if (!built) return;
    setNodes((current) => {
      const byId = new Map(current.map((node) => [node.id, node]));
      return built.nodes.map((node) => {
        const existing = byId.get(node.id);
        return {
          ...node,
          position: existing?.position ?? node.position,
          selected: existing?.selected ?? false,
        };
      });
    });
    setEdges(built.edges);
  }, [graphId, built, setNodes, setEdges]);

  useEffect(() => {
    setNodes((current) =>
      current.map((node) => ({
        ...node,
        selected: node.id === selectedHowNodeId,
        data: { ...(node.data as HowAnalysisNodeData), t },
      })),
    );
    setEdges((current) =>
      current.map((edge) => ({
        ...edge,
        markerEnd:
          typeof edge.markerEnd === "object" && edge.markerEnd
            ? {
                ...edge.markerEnd,
                color: edge.id.startsWith("how-merge-") ? t.accent : t.textPrimary,
              }
            : edge.markerEnd,
        style: {
          ...edge.style,
          stroke: edge.id.startsWith("how-merge-") ? t.accent : t.textPrimary,
        },
        data: edge.data ? { ...edge.data, t } : edge.data,
      })),
    );
  }, [t, selectedHowNodeId, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<HowAnalysisNodeData>) => {
      selectHowNode(node.id);
    },
    [selectHowNode],
  );

  const onPaneClick = useCallback(() => {
    selectHowNode(null);
  }, [selectHowNode]);

  const onNodeDragStop = useCallback(
    (_event: MouseEvent | TouchEvent, node: Node<HowAnalysisNodeData>) => {
      saveHowNodePosition(graphId, node.id, node.position);
    },
    [graphId],
  );

  const jumpToMerge = useCallback(
    (nodeId: string) => {
      selectHowNode(nodeId);
    },
    [selectHowNode],
  );

  if (!graph) {
    return null;
  }

  return (
    <div style={{ flex: 1, minHeight: 0, minWidth: 0, display: "flex" }}>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: isDark ? t.bgSecondary : t.hoverBg,
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
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: t.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            Outcomes · {graph.label}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: t.textMuted }}>
            Card shows answer · click for question, clarity, when · conditions, components
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={howAnalysisNodeTypes}
            edgeTypes={howAnalysisEdgeTypes}
            nodesDraggable
            nodesConnectable={false}
            elementsSelectable
            panOnScroll
            zoomOnScroll
            proOptions={{ hideAttribution: true }}
            style={{ width: "100%", height: "100%", background: "transparent" }}
          >
            <HowCanvasFitViewOnce />
            <Background
              variant={BackgroundVariant.Dots}
              gap={18}
              size={1}
              color={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
            />
            <Controls
              showInteractive={false}
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 6,
                overflow: "hidden",
                boxShadow: "none",
              }}
            />
          </ReactFlow>
        </div>
      </div>
      {selectedNode ? (
        <HowAnalysisDetailPanel node={selectedNode} t={t} onJumpToMerge={jumpToMerge} />
      ) : null}
    </div>
  );
}

export function RegisterHowCanvas(props: RegisterHowCanvasProps) {
  return (
    <ReactFlowProvider>
      <RegisterHowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
