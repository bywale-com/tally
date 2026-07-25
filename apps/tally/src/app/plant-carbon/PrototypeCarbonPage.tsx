import "@carbon/styles/css/styles.css";
import "./plant-carbon.css";

import { useNavigate } from "react-router";
import type { ReactNode } from "react";
import {
  Button,
  ClickableTile,
  Grid,
  Column,
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  Stack,
} from "@carbon/react";
import { Asleep, Light } from "@carbon/icons-react";
import { CarbonThemeProvider, useCarbonTheme } from "./CarbonThemeContext";
import { OperatorCarbonApp } from "./operator/OperatorCarbonApp";
import { GuestCarbonApp } from "./guest/GuestCarbonApp";
import { ClientCarbonApp } from "./client/ClientCarbonApp";
import { WorkerCarbonApp } from "./worker/WorkerCarbonApp";
import type { CarbonPersonaId } from "./shell/personaCycle";

/**
 * Paths are relative to BrowserRouter basename `/prototype-carbon`.
 * Never import this module from the main SPA Router — Carbon CSS is global.
 */
const PERSONAS = [
  {
    id: "operator" as const,
    label: "Operator",
    path: "/operator",
    blurb: "Create → Evaluate → Enrich → Invite → Launch",
  },
  {
    id: "guest" as const,
    label: "Guest",
    path: "/guest",
    blurb: "Invite → Fund → Business Client desk",
  },
  {
    id: "client" as const,
    label: "Business Client",
    path: "/client",
    blurb: "Campaigns · Meetings · Escrow",
  },
  {
    id: "worker" as const,
    label: "Worker",
    path: "/worker",
    blurb: "Available → Active → Pipeline",
  },
] as const;

function CarbonProviders({ children }: { children: ReactNode }) {
  return <CarbonThemeProvider>{children}</CarbonThemeProvider>;
}

/** Hub at `/prototype-carbon` — pick a Carbon persona desk. */
export function CarbonPlantHub() {
  return (
    <CarbonProviders>
      <CarbonPlantHubInner />
    </CarbonProviders>
  );
}

function CarbonPlantHubInner() {
  const { isDark, setIsDark } = useCarbonTheme();
  const navigate = useNavigate();

  return (
    <div className="plant-carbon-root" style={{ minHeight: "100vh" }}>
      <Header aria-label="Tally prototype Carbon">
        <HeaderName prefix="Tally" href="/prototype-carbon">
          Prototype Carbon
        </HeaderName>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label={isDark ? "Light theme" : "Dark theme"}
            onClick={() => setIsDark((v) => !v)}
          >
            {isDark ? <Light size={20} /> : <Asleep size={20} />}
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>
      <main style={{ padding: "3rem 2rem", maxWidth: 960, margin: "0 auto" }}>
        <Stack gap={7}>
          <div>
            <h1 className="cds--type-productive-heading-05">
              Carbon reimagining
            </h1>
            <p className="cds--type-body-01" style={{ marginTop: "0.75rem" }}>
              Fully isolated document from /prototype (separate HTML entry —
              Carbon CSS cannot touch Plant). Same Register substance under
              one Carbon UI Shell.
            </p>
          </div>
          <Grid narrow>
            {PERSONAS.map((p) => (
              <Column key={p.id} sm={4} md={4} lg={4}>
                <ClickableTile
                  href={`/prototype-carbon${p.path}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(p.path);
                  }}
                  style={{ marginBottom: "1rem", minHeight: 120 }}
                >
                  <Stack gap={2}>
                    <span className="cds--type-productive-heading-02">
                      {p.label}
                    </span>
                    <span className="cds--type-body-01">{p.blurb}</span>
                  </Stack>
                </ClickableTile>
              </Column>
            ))}
          </Grid>
          {/* Cross-document link — must not use React Router to main SPA */}
          <Button kind="ghost" href="/prototype">
            Open original /prototype (separate document)
          </Button>
        </Stack>
      </main>
    </div>
  );
}

function CarbonPersonaShell({
  children,
}: {
  personaId?: CarbonPersonaId;
  children: ReactNode;
}) {
  return (
    <CarbonProviders>
      <div className="plant-carbon-root" style={{ minHeight: "100vh" }}>
        {children}
      </div>
    </CarbonProviders>
  );
}

export function OperatorCarbonPlant() {
  return (
    <CarbonPersonaShell personaId="operator">
      <OperatorCarbonApp />
    </CarbonPersonaShell>
  );
}

export function GuestCarbonPlant({
  onOpenDesk,
}: {
  onOpenDesk?: () => void;
}) {
  return (
    <CarbonPersonaShell personaId="guest">
      <GuestCarbonApp onOpenDesk={onOpenDesk} />
    </CarbonPersonaShell>
  );
}

export function ClientCarbonPlant() {
  return (
    <CarbonPersonaShell personaId="client">
      <ClientCarbonApp />
    </CarbonPersonaShell>
  );
}

export function WorkerCarbonPlant() {
  return (
    <CarbonPersonaShell personaId="worker">
      <WorkerCarbonApp />
    </CarbonPersonaShell>
  );
}

/** Routed guest that continues into Carbon BC desk. */
export function GuestCarbonPlantRouted() {
  const navigate = useNavigate();
  return (
    <GuestCarbonPlant onOpenDesk={() => navigate("/client")} />
  );
}
