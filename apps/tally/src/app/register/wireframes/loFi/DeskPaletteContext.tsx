import {
  createContext,
  useContext,
  useLayoutEffect,
  type ReactNode,
} from "react";
import { loFi, type DeskPalette } from "./loFiPalette";

const LOFI_DEFAULTS: DeskPalette = { ...loFi };

const DeskPaletteContext = createContext<DeskPalette>(loFi);
const PlantModeContext = createContext(false);

export function DeskPaletteProvider({
  value,
  children,
}: {
  value: DeskPalette;
  children: ReactNode;
}) {
  // Sync during render so module `loFi` readers see plant tokens on first paint
  // (useLayoutEffect alone runs after children render — too late).
  Object.assign(loFi, value);

  useLayoutEffect(() => {
    Object.assign(loFi, value);
    return () => {
      Object.assign(loFi, LOFI_DEFAULTS);
    };
  }, [value]);

  return (
    <DeskPaletteContext.Provider value={value}>{children}</DeskPaletteContext.Provider>
  );
}

export function PlantModeProvider({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}) {
  return (
    <PlantModeContext.Provider value={value}>{children}</PlantModeContext.Provider>
  );
}

/** Desk colors — gray lo-fi in Register CT; product tokens when planted. */
export function useDeskPalette(): DeskPalette {
  return useContext(DeskPaletteContext);
}

/** True under `/prototype/*` desk plants — LoFiButton maps to shadcn. */
export function usePlantMode(): boolean {
  return useContext(PlantModeContext);
}
