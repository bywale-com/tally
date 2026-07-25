import type { HowGraph } from "./types";
import { CLIENT_CORE_OUTCOME_GRAPH } from "./clientCoreOutcome";
import { NON_BUSINESS_CLIENT_CORE_OUTCOME_GRAPH } from "./nonBusinessClientCoreOutcome";
import { OPERATOR_CORE_OUTCOME_GRAPH } from "./operatorCoreOutcome";
import { WORKER_CORE_OUTCOME_GRAPH } from "./workerCoreOutcome";

/** Authored How graphs — sorted by epicOrder. */
export const HOW_GRAPHS: HowGraph[] = [
  OPERATOR_CORE_OUTCOME_GRAPH,
  WORKER_CORE_OUTCOME_GRAPH,
  NON_BUSINESS_CLIENT_CORE_OUTCOME_GRAPH,
  CLIENT_CORE_OUTCOME_GRAPH,
].sort((a, b) => a.epicOrder - b.epicOrder);

export function getHowGraph(id: string): HowGraph | undefined {
  return HOW_GRAPHS.find((graph) => graph.id === id);
}

export function getHowNode(graph: HowGraph, nodeId: string) {
  return graph.nodes.find((node) => node.id === nodeId);
}

export function getHowNodeChildren(graph: HowGraph, nodeId: string) {
  return graph.nodes
    .filter((node) => node.parentId === nodeId)
    .sort((a, b) => a.position.x - b.position.x);
}
