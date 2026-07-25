import { Link } from "react-router";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDeskPalette, usePlantMode } from "@/app/register/wireframes/loFi/DeskPaletteContext";
import { cn } from "@/lib/utils";
import { usePlantShell } from "./PlantShellContext";

/**
 * Main-pane top strip shared across planted personas.
 * Retraction + breadcrumb on the left; Hub + theme on the right (plant only).
 */
export function PlantInsetHeader({
  breadcrumb,
  onToggleSidebar,
}: {
  breadcrumb: string;
  onToggleSidebar: () => void;
}) {
  const loFi = useDeskPalette();
  const plant = usePlantMode();
  const shell = usePlantShell();

  return (
    <header
      style={{
        height: 48,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 12px",
        background: loFi.frame,
        borderBottom: `1px solid ${loFi.stroke}`,
      }}
    >
      <button
        type="button"
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        style={{
          width: 28,
          height: 28,
          borderRadius: 4,
          border: `1px solid ${loFi.stroke}`,
          background: loFi.chrome,
          cursor: "pointer",
          fontFamily: "inherit",
          color: loFi.ink,
          fontSize: 12,
        }}
      >
        ☰
      </button>
      <span style={{ fontSize: 12, color: loFi.label, minWidth: 0, flex: 1 }}>
        {breadcrumb}
      </span>
      {plant && shell ? (
        <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
          <Link
            to="/prototype"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            title="Prototype hub"
          >
            Hub
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            title={shell.isDark ? "Light mode" : "Dark mode"}
            aria-label={shell.isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => shell.setIsDark((v) => !v)}
          >
            {shell.isDark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      ) : null}
    </header>
  );
}
