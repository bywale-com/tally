import { createContext, useContext, type ReactNode } from "react";

type PlantShellValue = {
  isDark: boolean;
  setIsDark: (next: boolean | ((v: boolean) => boolean)) => void;
};

const PlantShellContext = createContext<PlantShellValue | null>(null);

export function PlantShellProvider({
  isDark,
  setIsDark,
  children,
}: PlantShellValue & { children: ReactNode }) {
  return (
    <PlantShellContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </PlantShellContext.Provider>
  );
}

/** Plant persona shell chrome (Hub + theme). Null outside `/prototype/*`. */
export function usePlantShell(): PlantShellValue | null {
  return useContext(PlantShellContext);
}
