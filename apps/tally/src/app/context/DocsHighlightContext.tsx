/**
 * Multi-target docs highlight — Console + Register Can'ts/Furnish hover.
 * Single-id API kept for DocsPanel; multi-id for taxonomy → CT surfaces.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type HolonId = string;

type DocsHighlightContextValue = {
  hoveredComponentId: HolonId | null;
  /** All ids currently highlighted (hover may light several CT surfaces). */
  hoveredComponentIds: HolonId[];
  setHoveredComponentId: (id: HolonId | null) => void;
  setHoveredComponentIds: (ids: HolonId[]) => void;
  isHolonInspectMode: boolean;
  toggleHolonInspectMode: () => void;
  setHolonInspectMode: (active: boolean) => void;
};

const DocsHighlightContext = createContext<DocsHighlightContextValue | null>(null);

export function DocsHighlightProvider({ children }: { children: ReactNode }) {
  const [hoveredComponentIds, setHoveredComponentIdsState] = useState<HolonId[]>([]);
  const [isHolonInspectMode, setHolonInspectMode] = useState(false);

  const setHoveredComponentIds = useCallback((ids: HolonId[]) => {
    setHoveredComponentIdsState(ids);
  }, []);

  const setHoveredComponentId = useCallback((id: HolonId | null) => {
    setHoveredComponentIdsState(id ? [id] : []);
  }, []);

  const toggleHolonInspectMode = useCallback(() => {
    setHolonInspectMode((active) => !active);
  }, []);

  const hoveredComponentId = hoveredComponentIds[0] ?? null;

  const value = useMemo(
    () => ({
      hoveredComponentId,
      hoveredComponentIds,
      setHoveredComponentId,
      setHoveredComponentIds,
      isHolonInspectMode,
      toggleHolonInspectMode,
      setHolonInspectMode,
    }),
    [
      hoveredComponentId,
      hoveredComponentIds,
      setHoveredComponentId,
      setHoveredComponentIds,
      isHolonInspectMode,
      toggleHolonInspectMode,
    ],
  );

  return (
    <DocsHighlightContext.Provider value={value}>{children}</DocsHighlightContext.Provider>
  );
}

export function useDocsHighlight(): DocsHighlightContextValue {
  const ctx = useContext(DocsHighlightContext);
  if (!ctx) {
    throw new Error("useDocsHighlight must be used within DocsHighlightProvider");
  }
  return ctx;
}
