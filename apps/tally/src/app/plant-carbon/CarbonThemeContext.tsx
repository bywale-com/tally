import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Theme } from "@carbon/react";

const THEME_KEY = "tally-prototype-carbon-theme";

export type CarbonThemeId = "g10" | "g100";

type CarbonThemeContextValue = {
  theme: CarbonThemeId;
  isDark: boolean;
  setIsDark: (next: boolean | ((v: boolean) => boolean)) => void;
};

const CarbonThemeContext = createContext<CarbonThemeContextValue | null>(null);

function readDark(): boolean {
  try {
    return localStorage.getItem(THEME_KEY) === "dark";
  } catch {
    return false;
  }
}

function writeDark(isDark: boolean) {
  try {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  } catch {
    /* ignore */
  }
}

export function CarbonThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDarkState] = useState(readDark);
  const setIsDark = (next: boolean | ((v: boolean) => boolean)) => {
    setIsDarkState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      writeDark(value);
      return value;
    });
  };
  const theme: CarbonThemeId = isDark ? "g100" : "g10";

  useEffect(() => {
    document.documentElement.dataset.carbonTheme = theme;
  }, [theme]);

  return (
    <CarbonThemeContext.Provider value={{ theme, isDark, setIsDark }}>
      <Theme theme={theme}>{children}</Theme>
    </CarbonThemeContext.Provider>
  );
}

export function useCarbonTheme() {
  const ctx = useContext(CarbonThemeContext);
  if (!ctx) {
    throw new Error("useCarbonTheme must be used within CarbonThemeProvider");
  }
  return ctx;
}
