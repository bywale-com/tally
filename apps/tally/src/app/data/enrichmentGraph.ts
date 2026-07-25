import type { Edge, Node } from "@xyflow/react";
import type { EnrichmentNodePayload } from "./enrichmentNodeRuntime";
import type { EnrichmentNodeData } from "./enrichmentWorkflows";

export type UpstreamDataSource = {
  nodeId: string;
  label: string;
  role: "direct" | "ancestor";
  data: EnrichmentNodePayload | null;
};

function asPayload(value: unknown): EnrichmentNodePayload | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.items)) return null;
  return value as EnrichmentNodePayload;
}

/** Payload leaving a source node (branch handles later). */
export function resolveOutputFromSourceNode(
  source: Node<EnrichmentNodeData>,
  _sourceHandle?: string | null,
): EnrichmentNodePayload | null {
  const output = source.data.lastOutput;
  if (output == null) {
    return asPayload(source.data.lastInput) ?? null;
  }
  return asPayload(output);
}

/** Resolve input for a node from its first upstream edge. */
export function resolveUpstreamInput(
  nodeId: string,
  nodes: Node<EnrichmentNodeData>[],
  edges: Edge[],
): EnrichmentNodePayload | null {
  const incoming = edges.filter((edge) => edge.target === nodeId);
  if (incoming.length === 0) return null;
  const edge = incoming[0];
  const source = nodes.find((node) => node.id === edge.source);
  if (!source) return null;
  return resolveOutputFromSourceNode(source, edge.sourceHandle);
}

/** Upstream nodes whose output can be inspected in the Input pane. */
export function listUpstreamDataSources(
  nodeId: string,
  nodes: Node<EnrichmentNodeData>[],
  edges: Edge[],
): UpstreamDataSource[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const sources: UpstreamDataSource[] = [];
  const visited = new Set<string>();

  function walk(targetId: string, depth: number) {
    const incoming = edges.filter((edge) => edge.target === targetId);
    for (const edge of incoming) {
      if (visited.has(edge.source)) continue;
      visited.add(edge.source);
      const source = byId.get(edge.source);
      if (!source) continue;
      sources.push({
        nodeId: source.id,
        label: source.data.label || source.id,
        role: depth === 0 ? "direct" : "ancestor",
        data: resolveOutputFromSourceNode(source, edge.sourceHandle),
      });
      walk(source.id, depth + 1);
    }
  }

  walk(nodeId, 0);
  return sources;
}

/** Seed lastInput on targets of a source node's outgoing edges. */
export function applyPropagateOutput(
  nodes: Node<EnrichmentNodeData>[],
  edges: Edge[],
  sourceNodeId: string,
  output: EnrichmentNodePayload | null,
): Node<EnrichmentNodeData>[] {
  const outgoing = edges.filter((edge) => edge.source === sourceNodeId);
  const downstream = new Map<string, EnrichmentNodePayload | null>();
  for (const edge of outgoing) {
    downstream.set(edge.target, output);
  }
  return nodes.map((node) => {
    if (!downstream.has(node.id)) return node;
    return {
      ...node,
      data: {
        ...node.data,
        lastInput: downstream.get(node.id) ?? null,
      },
    };
  });
}

/** When connecting A→B, seed B.lastInput from A's output (or A's input). */
export function seedTargetInputOnConnect(
  nodes: Node<EnrichmentNodeData>[],
  sourceId: string,
  targetId: string,
  sourceHandle?: string | null,
): Node<EnrichmentNodeData>[] {
  const source = nodes.find((n) => n.id === sourceId);
  if (!source) return nodes;
  const payload = resolveOutputFromSourceNode(source, sourceHandle);
  return nodes.map((node) =>
    node.id === targetId
      ? { ...node, data: { ...node.data, lastInput: payload } }
      : node,
  );
}
