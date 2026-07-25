import type { NodeTypes } from "@xyflow/react";
import { HowAnalysisNode } from "./nodes/HowAnalysisNode";

export const HOW_ANALYSIS_NODE_TYPE = "howAnalysisNode";

export const howAnalysisNodeTypes: NodeTypes = {
  [HOW_ANALYSIS_NODE_TYPE]: HowAnalysisNode,
};
