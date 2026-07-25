import { Link } from "react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "@/app/components/docs/shellHolonOrder";
import { dark, light } from "@/app/components/tokens";
import { DocsHighlightProvider } from "@/app/context/DocsHighlightContext";
import { HolonDetailProvider } from "@/app/context/HolonDetailContext";
import { cn } from "@/lib/utils";
import {
  DeskPaletteProvider,
  PlantModeProvider,
} from "@/app/register/wireframes/loFi/DeskPaletteContext";
import { BusinessClientDesk } from "@/app/register/wireframes/loFi/BusinessClientDesk";
import { GuestVessel } from "@/app/register/wireframes/loFi/GuestVessel";
import { OperatorPrototypeApp } from "@/app/register/wireframes/loFi/OperatorPrototypeApp";
import { WorkerPrototypeApp } from "@/app/register/wireframes/loFi/WorkerPrototypeApp";
import { PlantShellProvider } from "./PlantShellContext";
import { tokensToDeskPalette } from "./tokensToDeskPalette";

const PLANT_THEME_KEY = "tally-prototype-theme";

function readPlantDark(): boolean {
  try {
    return localStorage.getItem(PLANT_THEME_KEY) === "dark";
  } catch {
    return false;
  }
}

function writePlantDark(isDark: boolean) {
  try {
    localStorage.setItem(PLANT_THEME_KEY, isDark ? "dark" : "light");
  } catch {
    /* ignore */
  }
}

function usePlantTheme() {
  const [isDark, setIsDarkState] = useState(readPlantDark);
  const setIsDark = (next: boolean | ((v: boolean) => boolean)) => {
    setIsDarkState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      writePlantDark(value);
      return value;
    });
  };
  return [isDark, setIsDark] as const;
}

function PlantProviders({ children }: { children: ReactNode }) {
  return (
    <DocsHighlightProvider>
      <HolonDetailProvider>{children}</HolonDetailProvider>
    </DocsHighlightProvider>
  );
}

const PERSONAS = [
  {
    id: "operator",
    label: "Operator",
    path: "/prototype/operator",
    blurb: "Create → Evaluate → Enrich → Deploy → Invite → Running",
  },
  {
    id: "guest",
    label: "Guest",
    path: "/prototype/guest",
    blurb: "Vessel invite → Fund → Business Client desk",
  },
  {
    id: "client",
    label: "Business Client",
    path: "/prototype/client",
    blurb: "Campaigns · Meetings · Escrow",
  },
  {
    id: "worker",
    label: "Worker",
    path: "/prototype/worker",
    blurb: "Available → Active → Pipeline",
  },
] as const;

/** Hub at `/prototype` — pick a planted persona. */
export function PlantHub() {
  const [isDark, setIsDark] = usePlantTheme();
  const t = isDark ? dark : light;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    return () => {
      root.classList.remove("dark");
    };
  }, [isDark]);

  return (
    <PlantProviders>
    <HolonBoundary
      id="prototype"
      label="Prototype"
      order={SHELL_HOLON_ORDER.prototype}
      t={t}
      style={{
        height: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        color: t.textPrimary,
      }}
    >
      <header
        className="flex h-11 shrink-0 items-center gap-2 border-b px-4"
        style={{ borderColor: t.border }}
      >
        <span className="text-sm font-semibold">Prototype</span>
        <span className="text-muted-foreground text-xs">
          Approved click-throughs · planted
        </span>
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon-sm"
            title={isDark ? "Light mode" : "Dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={() => setIsDark((v) => !v)}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Future home</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Human-approved Core walkthroughs. Tokens and dark mode from day one. Register
            click-through stays gray lo-fi.
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {PERSONAS.map((p) => (
            <li key={p.id}>
              <Link
                to={p.path}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-auto w-full justify-start px-4 py-3",
                )}
              >
                <span className="flex flex-col items-start gap-0.5 text-left">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-muted-foreground text-xs font-normal">{p.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </HolonBoundary>
    </PlantProviders>
  );
}

function PlantPersonaShell({
  personaId,
  personaLabel,
  children,
}: {
  personaId: string;
  personaLabel: string;
  children: ReactNode;
}) {
  const [isDark, setIsDark] = usePlantTheme();
  const t = isDark ? dark : light;
  const palette = useMemo(() => tokensToDeskPalette(t), [t]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    return () => {
      root.classList.remove("dark");
    };
  }, [isDark]);

  return (
    <PlantProviders>
      <PlantModeProvider value={true}>
        <DeskPaletteProvider value={palette}>
          <PlantShellProvider isDark={isDark} setIsDark={setIsDark}>
            <HolonBoundary
              id={`prototype-${personaId}`}
              label={`${personaLabel} plant`}
              order={
                SHELL_HOLON_ORDER[
                  `prototype-${personaId}` as keyof typeof SHELL_HOLON_ORDER
                ] ?? SHELL_HOLON_ORDER.prototype
              }
              t={t}
              style={{
                height: "100%",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                background: t.bgPrimary,
                color: t.textPrimary,
              }}
            >
              <div
                key={isDark ? "dark" : "light"}
                className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground"
              >
                {children}
              </div>
            </HolonBoundary>
          </PlantShellProvider>
        </DeskPaletteProvider>
      </PlantModeProvider>
    </PlantProviders>
  );
}

export function OperatorPlant() {
  return (
    <PlantPersonaShell personaId="operator" personaLabel="Operator">
      <OperatorPrototypeApp />
    </PlantPersonaShell>
  );
}

export function GuestPlant({ onOpenDesk }: { onOpenDesk?: () => void }) {
  return (
    <PlantPersonaShell personaId="guest" personaLabel="Guest">
      <GuestVessel
        onOpenDesk={
          onOpenDesk ??
          (() => {
            window.location.assign("/prototype/client");
          })
        }
      />
    </PlantPersonaShell>
  );
}

export function ClientPlant() {
  return (
    <PlantPersonaShell personaId="client" personaLabel="Business Client">
      <BusinessClientDesk />
    </PlantPersonaShell>
  );
}

export function WorkerPlant() {
  return (
    <PlantPersonaShell personaId="worker" personaLabel="Worker">
      <WorkerPrototypeApp />
    </PlantPersonaShell>
  );
}
