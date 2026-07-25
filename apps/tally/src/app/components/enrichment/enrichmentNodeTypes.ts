import type { NodeTypes } from "@xyflow/react";
import {
  ActionNode,
  ConditionNode,
  ConstantNode,
  ExitNode,
  OperationNode,
  RuleNode,
  TriggerNode,
} from "./nodes";

export const enrichmentNodeTypes: NodeTypes = {
  trigger: TriggerNode,
  constant: ConstantNode,
  condition: ConditionNode,
  operation: OperationNode,
  rule: RuleNode,
  action: ActionNode,
  exit: ExitNode,
};
