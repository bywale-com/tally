import { createContext, useContext, type ReactNode } from "react";
import type { Tokens } from "../tokens";
import type { PaletteBlock } from "../../data/enrichmentWorkflows";

type EnrichmentEditorContextValue = {
  t: Tokens;
  manualRunActive: boolean;
  onOpenNodeConfig: (nodeId: string) => void;
  onToggleManualRun: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onAttachBlock: (nodeId: string, block: PaletteBlock, sourceHandle?: string) => void;
};

const EnrichmentEditorContext = createContext<EnrichmentEditorContextValue | null>(null);

export function EnrichmentEditorProvider({
  value,
  children,
}: {
  value: EnrichmentEditorContextValue;
  children: ReactNode;
}) {
  return (
    <EnrichmentEditorContext.Provider value={value}>{children}</EnrichmentEditorContext.Provider>
  );
}

export function useEnrichmentEditor(): EnrichmentEditorContextValue {
  const ctx = useContext(EnrichmentEditorContext);
  if (!ctx) throw new Error("useEnrichmentEditor must be used within EnrichmentEditorProvider");
  return ctx;
}
