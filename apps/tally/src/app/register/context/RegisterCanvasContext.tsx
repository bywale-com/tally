/**
 * Bridge: Outcomes sidebar → force Click-through visible when highlighting Can'ts/Furnish.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type RegisterCanvasMode = "how" | "wireframes" | "prototype";

type RegisterCanvasContextValue = {
  canvasMode: RegisterCanvasMode;
  setCanvasMode: (mode: RegisterCanvasMode) => void;
  /** Switch to Click-through so holon highlights are visible. */
  ensureClickThrough: () => void;
};

const RegisterCanvasContext = createContext<RegisterCanvasContextValue | null>(null);

export function RegisterCanvasProvider({ children }: { children: ReactNode }) {
  const [canvasMode, setCanvasMode] = useState<RegisterCanvasMode>("how");

  const value = useMemo(
    () => ({
      canvasMode,
      setCanvasMode,
      ensureClickThrough: () => setCanvasMode("prototype"),
    }),
    [canvasMode],
  );

  return (
    <RegisterCanvasContext.Provider value={value}>{children}</RegisterCanvasContext.Provider>
  );
}

export function useRegisterCanvas(): RegisterCanvasContextValue {
  const ctx = useContext(RegisterCanvasContext);
  if (!ctx) {
    throw new Error("useRegisterCanvas must be used within RegisterCanvasProvider");
  }
  return ctx;
}
