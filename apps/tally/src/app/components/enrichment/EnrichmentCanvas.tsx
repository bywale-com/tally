import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { EnrichmentNodeData, EnrichmentTriggerKind, PaletteBlock } from "../../data/enrichmentWorkflows";
import type { Tokens } from "../tokens";
import { EnrichmentEditorProvider } from "./EnrichmentEditorContext";
import { EnrichmentEmptyCanvas } from "./EnrichmentEmptyCanvas";
import { enrichmentNodeTypes } from "./enrichmentNodeTypes";

type EnrichmentCanvasProps = {
  t: Tokens;
  isDark: boolean;
  nodes: Node<EnrichmentNodeData>[];
  edges: Edge[];
  manualRunActive: boolean;
  onNodesChange: OnNodesChange<Node<EnrichmentNodeData>>;
  onEdgesChange: OnEdgesChange;
  onConnect: (c: Connection) => void;
  onSelectNode: (id: string | null) => void;
  onOpenNodeConfig: (id: string) => void;
  onToggleManualRun: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onAttachBlock: (nodeId: string, block: PaletteBlock, sourceHandle?: string) => void;
  onAddTrigger: (kind: EnrichmentTriggerKind) => void;
  hasTrigger: boolean;
};

export function EnrichmentCanvas({
  t,
  isDark,
  nodes,
  edges,
  manualRunActive,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
  onOpenNodeConfig,
  onToggleManualRun,
  onDeleteNode,
  onAttachBlock,
  onAddTrigger,
  hasTrigger,
}: EnrichmentCanvasProps) {
  return (
    <EnrichmentEditorProvider
      value={{
        t,
        manualRunActive,
        onOpenNodeConfig,
        onToggleManualRun,
        onDeleteNode,
        onAttachBlock,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={enrichmentNodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={({ nodes: selected }) => onSelectNode(selected[0]?.id ?? null)}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: isDark ? "#0a0a0a" : t.hoverBg }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1}
            color={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
          />
          <Controls showInteractive={false} />
        </ReactFlow>
        {!hasTrigger && <EnrichmentEmptyCanvas t={t} onAddTrigger={onAddTrigger} />}
      </div>
    </EnrichmentEditorProvider>
  );
}
