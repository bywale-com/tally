import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type RegisterSelectionContextValue = {
  selectedHowGraphId: string | null;
  selectedHowNodeId: string | null;
  selectHowGraph: (graphId: string | null) => void;
  selectHowNode: (nodeId: string | null) => void;
};

const RegisterSelectionContext = createContext<RegisterSelectionContextValue | null>(null);

export function RegisterSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedHowGraphId, setSelectedHowGraphId] = useState<string | null>(null);
  const [selectedHowNodeId, setSelectedHowNodeId] = useState<string | null>(null);

  const selectHowGraph = useCallback((graphId: string | null) => {
    setSelectedHowGraphId(graphId);
    setSelectedHowNodeId(null);
  }, []);

  const selectHowNode = useCallback((nodeId: string | null) => {
    setSelectedHowNodeId(nodeId);
  }, []);

  const value = useMemo(
    () => ({
      selectedHowGraphId,
      selectedHowNodeId,
      selectHowGraph,
      selectHowNode,
    }),
    [selectedHowGraphId, selectedHowNodeId, selectHowGraph, selectHowNode],
  );

  return (
    <RegisterSelectionContext.Provider value={value}>{children}</RegisterSelectionContext.Provider>
  );
}

export function useRegisterSelection(): RegisterSelectionContextValue {
  const ctx = useContext(RegisterSelectionContext);
  if (!ctx) {
    throw new Error("useRegisterSelection must be used within RegisterSelectionProvider");
  }
  return ctx;
}
