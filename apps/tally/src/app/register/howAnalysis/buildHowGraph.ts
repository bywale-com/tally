import { MarkerType, type Edge, type Node } from "@xyflow/react";
import type { Tokens } from "../../components/tokens";
import type { HowGraph } from "./types";
import type { HowAnalysisNodeData } from "./nodes/HowAnalysisNode";
import { HOW_ANALYSIS_NODE_TYPE } from "./howAnalysisNodeTypes";
import { HOW_ANALYSIS_EDGE_TYPE } from "./howAnalysisEdgeTypes";
import { truncateHowAnswer } from "./types";

export function buildHowGraph(
  graph: HowGraph,
  t: Tokens,
  savedPositions: Record<string, { x: number; y: number }> = {},
): {
  nodes: Node<HowAnalysisNodeData>[];
  edges: Edge[];
} {
  const nodes: Node<HowAnalysisNodeData>[] = graph.nodes.map((node) => ({
    id: node.id,
    type: HOW_ANALYSIS_NODE_TYPE,
    position: savedPositions[node.id] ?? node.position,
    draggable: true,
    selectable: true,
    data: {
      nodeId: node.id,
      answerDisplay: truncateHowAnswer(node.clarity),
      kind: node.kind,
      hasMerge: Boolean(node.mergeWithId),
      t,
    },
  }));

  const treeEdges: Edge[] = graph.nodes
    .filter((node) => node.parentId != null)
    .map((node) => ({
      id: `how-parent-${node.parentId}-${node.id}`,
      source: node.parentId!,
      target: node.id,
      type: HOW_ANALYSIS_EDGE_TYPE,
      label: "How?",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
        color: t.textPrimary,
      },
      style: {
        stroke: t.textPrimary,
        strokeWidth: 1.5,
      },
      data: { variant: "how", t },
    }));

  const mergeEdges: Edge[] = graph.nodes
    .filter((node) => node.mergeWithId)
    .map((node) => ({
      id: `how-merge-${node.id}-${node.mergeWithId}`,
      source: node.id,
      target: node.mergeWithId!,
      type: HOW_ANALYSIS_EDGE_TYPE,
      label: "merge",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 12,
        height: 12,
        color: t.accent,
      },
      style: {
        stroke: t.accent,
        strokeWidth: 1.5,
        strokeDasharray: "6 4",
      },
      data: { variant: "merge", t },
    }));

  return { nodes, edges: [...treeEdges, ...mergeEdges] };
}
