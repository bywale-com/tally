import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";

/** Paths relative to BrowserRouter basename `/prototype-carbon`. */
export const CARBON_PERSONAS = [
  { id: "operator", label: "Operator", path: "/operator" },
  { id: "guest", label: "Guest", path: "/guest" },
  { id: "client", label: "Business Client", path: "/client" },
  { id: "worker", label: "Worker", path: "/worker" },
] as const;

export type CarbonPersonaId = (typeof CARBON_PERSONAS)[number]["id"];

export function useCarbonPersonaCycle(personaId: CarbonPersonaId) {
  const navigate = useNavigate();
  const index = CARBON_PERSONAS.findIndex((p) => p.id === personaId);
  const safeIndex = index >= 0 ? index : 0;

  const go = useCallback(
    (dir: -1 | 1) => {
      const next =
        (safeIndex + dir + CARBON_PERSONAS.length) % CARBON_PERSONAS.length;
      navigate(CARBON_PERSONAS[next]!.path);
    },
    [navigate, safeIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return {
    goPrev: () => go(-1),
    goNext: () => go(1),
    label: CARBON_PERSONAS[safeIndex]!.label,
    personas: CARBON_PERSONAS,
    currentId: CARBON_PERSONAS[safeIndex]!.id,
  };
}
