import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { HolonId } from "./DocsHighlightContext";

type HolonDetailContextValue = {
  detailHolonId: HolonId | null;
  openHolonDetail: (id: HolonId) => void;
  closeHolonDetail: () => void;
};

const HolonDetailContext = createContext<HolonDetailContextValue | null>(null);

export function HolonDetailProvider({ children }: { children: ReactNode }) {
  const [detailHolonId, setDetailHolonId] = useState<HolonId | null>(null);

  const openHolonDetail = useCallback((id: HolonId) => {
    setDetailHolonId(id);
  }, []);

  const closeHolonDetail = useCallback(() => {
    setDetailHolonId(null);
  }, []);

  const value = useMemo(
    () => ({ detailHolonId, openHolonDetail, closeHolonDetail }),
    [detailHolonId, openHolonDetail, closeHolonDetail],
  );

  return (
    <HolonDetailContext.Provider value={value}>{children}</HolonDetailContext.Provider>
  );
}

export function useHolonDetail(): HolonDetailContextValue {
  const ctx = useContext(HolonDetailContext);
  if (!ctx) {
    throw new Error("useHolonDetail must be used within HolonDetailProvider");
  }
  return ctx;
}
