import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDeskPalette,
  usePlantMode,
} from "@/app/register/wireframes/loFi/DeskPaletteContext";

export const PLANT_PERSONAS = [
  { id: "operator", label: "Operator", path: "/prototype/operator" },
  { id: "guest", label: "Guest", path: "/prototype/guest" },
  { id: "client", label: "Business Client", path: "/prototype/client" },
  { id: "worker", label: "Worker", path: "/prototype/worker" },
] as const;

export type PlantPersonaId = (typeof PLANT_PERSONAS)[number]["id"];

export function usePlantPersonaCycle(personaId: PlantPersonaId) {
  const navigate = useNavigate();
  const index = PLANT_PERSONAS.findIndex((p) => p.id === personaId);
  const safeIndex = index >= 0 ? index : 0;

  const go = useCallback(
    (dir: -1 | 1) => {
      const next =
        (safeIndex + dir + PLANT_PERSONAS.length) % PLANT_PERSONAS.length;
      navigate(PLANT_PERSONAS[next]!.path);
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
    label: PLANT_PERSONAS[safeIndex]!.label,
  };
}

/**
 * Sidebar brand mark with persona arrows (plant only).
 * Lives where “Tally / Worker” sits — ← → or arrow keys cycle personas.
 */
export function PlantBrandMark({ personaId }: { personaId: PlantPersonaId }) {
  const loFi = useDeskPalette();
  const plant = usePlantMode();
  const { goPrev, goNext, label } = usePlantPersonaCycle(personaId);

  if (!plant) return null;

  return (
    <div
      style={{
        height: 48,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "0 8px",
        borderBottom: `1px solid ${loFi.stroke}`,
        background: loFi.sidebar,
      }}
    >
      <div
        className="size-7 shrink-0 rounded-md"
        style={{ background: loFi.ink }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold" style={{ color: loFi.ink }}>
          Tally
        </div>
        <div className="truncate text-[10px]" style={{ color: loFi.muted }}>
          {label}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Previous persona"
        aria-label="Previous persona"
        onClick={goPrev}
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Next persona"
        aria-label="Next persona"
        onClick={goNext}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
