import { useState, type ReactNode } from "react";
import {
  PlantBrandMark,
  type PlantPersonaId,
} from "@/app/plant/PlantBrandMark";
import { PlantInsetHeader } from "@/app/plant/PlantInsetHeader";
import { NotionIcon } from "@/app/components/icons/NotionIcon";
import type { NotionIconName } from "@/app/icons/notion-icon-urls";
import { useDeskPalette, usePlantMode } from "./DeskPaletteContext";

export type LoFiStage = {
  id: string;
  label: string;
  hint?: string;
};

export type LoFiNavItem = {
  id: string;
  label: string;
  icon?: NotionIconName;
  /** Optional nav badge — furnishing only */
  badge?: string | number;
};

type LoFiPersonaChromeProps = {
  /** Product role shown under the mark — not Operator. */
  personaLabel: string;
  /** When planted, sidebar mark cycles personas with ← →. */
  plantPersonaId?: PlantPersonaId;
  stages: LoFiStage[];
  activeStageId: string;
  onJumpStage: (stageId: string) => void;
  stripHint?: string;
  navItems: LoFiNavItem[];
  nav: string;
  onNav: (id: string) => void;
  children: ReactNode;
  /** Guest / invite flows can omit the app sidebar. */
  showSidebar?: boolean;
  /** Optional role chip under mark (furnishing) */
  roleChip?: ReactNode;
};

/**
 * Shared desk chrome for persona click-throughs (Worker / legacy payer).
 * Congruent with GuestVessel + BusinessClientDesk: EVAL strip (CT only), text nav.
 * Work panels fill the main pane (same block grammar as Operator ListChrome).
 * Operator plant keeps its own denser shell.
 */
export function LoFiPersonaChrome({
  personaLabel,
  plantPersonaId,
  stages,
  activeStageId,
  onJumpStage,
  stripHint,
  navItems,
  nav,
  onNav,
  children,
  showSidebar = true,
  roleChip,
}: LoFiPersonaChromeProps) {
  const loFi = useDeskPalette();
  const plant = usePlantMode();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const showEval = !plant;
  const breadcrumb =
    navItems.find((item) => item.id === nav)?.label ??
    (nav[0] ? nav[0].toUpperCase() + nav.slice(1) : "");

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: loFi.canvas,
        fontFamily: "inherit",
        color: loFi.ink,
      }}
    >
      {showEval ? (
      <div
        style={{
          flexShrink: 0,
          padding: "6px 12px",
          borderBottom: `1px solid ${loFi.stroke}`,
          background: loFi.chrome,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: loFi.muted,
            letterSpacing: "0.08em",
            marginRight: 4,
          }}
        >
          EVAL
        </span>
        {stages.map((s) => {
          const isActive = s.id === activeStageId;
          return (
            <button
              key={s.id}
              type="button"
              title={s.hint ? `Jump to ${s.label}: ${s.hint}` : `Jump to ${s.label}`}
              onClick={() => onJumpStage(s.id)}
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 3,
                border: `1px solid ${isActive ? loFi.ink : loFi.stroke}`,
                background: isActive ? loFi.block : "transparent",
                color: isActive ? loFi.ink : loFi.muted,
                fontWeight: isActive ? 600 : 500,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          );
        })}
        {stripHint ? (
          <span style={{ marginLeft: "auto", fontSize: 10, color: loFi.muted }}>{stripHint}</span>
        ) : null}
      </div>
      ) : null}

      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {showSidebar ? (
          <aside
            style={{
              width: sidebarOpen ? loFi.sidebarW : loFi.sidebarCollapsedW,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              background: loFi.sidebar,
              borderRight: `1px solid ${loFi.stroke}`,
              overflow: "hidden",
              transition: "width 120ms ease",
            }}
          >
            {plant && plantPersonaId ? (
              <PlantBrandMark personaId={plantPersonaId} />
            ) : (
            <div
              style={{
                height: 48,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 12px",
                borderBottom: `1px solid ${loFi.stroke}`,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: loFi.ink,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: loFi.ink }}>Tally</div>
                <div style={{ fontSize: 10, color: loFi.muted }}>{personaLabel}</div>
                {roleChip ? <div style={{ marginTop: 4 }}>{roleChip}</div> : null}
              </div>
            </div>
            )}
            <nav
              style={{
                flex: 1,
                padding: 8,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {navItems.map((item) => {
                const active = nav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNav(item.id)}
                    title={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: sidebarOpen ? "8px 10px" : "8px 0",
                      justifyContent: sidebarOpen ? "flex-start" : "center",
                      borderRadius: 6,
                      border: "none",
                      background: active ? loFi.block : "transparent",
                      color: active ? loFi.ink : loFi.label,
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {item.icon ? (
                      <NotionIcon
                        name={item.icon}
                        size={16}
                        color={active ? loFi.ink : loFi.label}
                      />
                    ) : null}
                    {sidebarOpen ? (
                      <span className="flex flex-1 items-center justify-between gap-2">
                        {item.label}
                        {item.badge !== undefined ? (
                          <span
                            className="rounded-full px-1.5 text-[10px] font-semibold"
                            style={{
                              background: loFi.ink,
                              color: loFi.white,
                              minWidth: 18,
                              textAlign: "center",
                            }}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </aside>
        ) : null}

        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <PlantInsetHeader
            breadcrumb={breadcrumb}
            onToggleSidebar={() => setSidebarOpen((v) => !v)}
          />
          <main
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              overflow: "auto",
              background: loFi.frame,
              padding: 16,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function LoFiPanel({
  title,
  caption,
  headerAction,
  children,
}: {
  title: string;
  caption?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  const loFi = useDeskPalette();
  return (
    <div
      style={{
        width: "100%",
        flex: 1,
        minHeight: 0,
        background: loFi.frame,
        border: `1px solid ${loFi.stroke}`,
        borderRadius: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${loFi.stroke}`,
          background: loFi.chrome,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: loFi.ink }}>{title}</div>
          {caption ? (
            <div style={{ marginTop: 2, fontSize: 11, color: loFi.label }}>{caption}</div>
          ) : null}
        </div>
        {headerAction ? <div style={{ flexShrink: 0 }}>{headerAction}</div> : null}
      </div>
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: 1,
          minHeight: 0,
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Stack without a card frame — prefer hairline rows for list beats. */
export function LoFiCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

/** Shared fact cell — Hold / Per meeting / Who counts. */
export function LoFiFact({ label, value }: { label: string; value: string }) {
  const loFi = useDeskPalette();
  return (
    <div>
      <div style={{ fontSize: 11, color: loFi.label }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: loFi.ink }}>{value}</div>
    </div>
  );
}

/** Seed pay-per-booked-meeting vessel shared across persona click-throughs. */
export const PERSONA_SEED = {
  campaignName: "Northwind outreach",
  companyName: "Northwind Labs",
  operatorName: "Operator",
  workerName: "Worker",
  clientName: "Alex Chen",
  meetingsTarget: 4,
  pricePerMeeting: 500,
  escrowTotal: 2000,
  seniority: "Director+",
  meetingLengthMin: 30,
  holdDays: 14,
  acvBand: "$40–80k ACV",
} as const;
