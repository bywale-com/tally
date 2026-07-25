/**
 * Active manage (furnishing items 43–58).
 */
import { useMemo } from "react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { WORKER_CT } from "../../../holons/registerCtHolons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import {
  buildOutreachCsv,
  deskTodayKey,
  downloadText,
  firmCounts,
  lastLoggedMeeting,
  quietTriggerStyle,
  weekStripDays,
} from "./helpers";
import type { Density, FirmRow, WorkerMeeting, WorkerVessel } from "./types";

export type ActiveViewProps = {
  vessel: WorkerVessel;
  meetings: WorkerMeeting[];
  firms: FirmRow[];
  booked: number;
  stopped: boolean;
  sessionsToday: number;
  density: Density;
  onLog: () => void;
  onPipeline: () => void;
  onSimulateStop: () => void;
  onRelease: () => void;
  onOpenFirms: () => void;
  onOpenTalk: () => void;
  onOpenDetails: () => void;
  onOpenAlerts: () => void;
};

export function ActiveView({
  vessel,
  meetings,
  firms,
  booked,
  stopped,
  sessionsToday,
  density,
  onLog,
  onPipeline,
  onSimulateStop,
  onRelease,
  onOpenFirms,
  onOpenTalk,
  onOpenDetails,
  onOpenAlerts,
}: ActiveViewProps) {
  const loFi = useDeskPalette();
  const anchorKey = useMemo(() => deskTodayKey(meetings), [meetings]);
  const weekDays = useMemo(() => weekStripDays(anchorKey), [anchorKey]);
  const loggedDays = useMemo(
    () => new Set(meetings.filter((m) => m.status !== "cancelled").map((m) => m.dayKey)),
    [meetings],
  );
  const counts = firmCounts(firms);
  const last = lastLoggedMeeting(meetings);
  const upcoming = meetings.filter((m) => m.status === "upcoming").slice(0, 3);
  const rowPad = density === "compact" ? "8px 0" : "12px 0";

  return (
    <HolonBoundary id={WORKER_CT.active.id} label={WORKER_CT.active.label} t={light}>
    <LoFiPanel
      title={vessel.name}
      caption={stopped ? "Client stopped. Stop working." : "Outreach against locked rules"}
    >
      {stopped ? (
        <div style={{ fontSize: 12, color: loFi.label, padding: rowPad }}>
          Campaign stopped. Do not grind dead inventory.
          <div className="mt-3">
            <LoFiButton variant="quiet" onClick={onRelease}>
              Release to pool
            </LoFiButton>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              padding: rowPad,
              borderBottom: `1px solid ${loFi.stroke}`,
            }}
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div style={{ fontSize: 12, color: loFi.label }}>
                Booked {booked} of {vessel.target}
                {sessionsToday > 0 ? ` · ${sessionsToday} session${sessionsToday === 1 ? "" : "s"} today` : ""}
              </div>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: loFi.block,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, (booked / vessel.target) * 100)}%`,
                  height: "100%",
                  background: loFi.ink,
                }}
              />
            </div>

            <div
              className="mb-3 flex gap-1"
              style={{ fontSize: 10, color: loFi.muted }}
            >
              {weekDays.map((dayKey) => {
                const hasDot = loggedDays.has(dayKey);
                const isToday = dayKey === anchorKey;
                return (
                  <div
                    key={dayKey}
                    className="flex flex-1 flex-col items-center gap-1 rounded py-1"
                    style={{
                      background: isToday ? loFi.block : "transparent",
                    }}
                  >
                    <span>{dayKey.slice(-2)}</span>
                    {hasDot ? (
                      <span
                        className="size-1 rounded-full"
                        style={{ background: loFi.ink }}
                      />
                    ) : (
                      <span className="size-1" />
                    )}
                  </div>
                );
              })}
            </div>

            <div
              className="mb-3 flex flex-wrap gap-3 text-[11px]"
              style={{ color: loFi.label }}
            >
              <span>Queued {counts.queued}</span>
              <span>Touched {counts.touched}</span>
              <span>Meeting {counts.meeting}</span>
              <span>Blocked {counts.blocked}</span>
            </div>

            {last ? (
              <p className="mb-3 text-xs" style={{ color: loFi.muted }}>
                Last logged · {last.who} · {last.company} · {last.loggedAt}
              </p>
            ) : null}

            {upcoming.length > 0 ? (
              <div className="mb-3">
                <div className="mb-1 text-xs font-medium" style={{ color: loFi.label }}>
                  Upcoming
                </div>
                {upcoming.map((m) => (
                  <div key={m.id} className="text-xs" style={{ color: loFi.muted }}>
                    {m.whenRelative} · {m.who} · {m.company}
                  </div>
                ))}
              </div>
            ) : null}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <LoFiButton onClick={onLog}>Log a meeting</LoFiButton>
              <LoFiButton variant="quiet" onClick={onPipeline}>
                Pipeline
              </LoFiButton>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<button type="button" style={quietTriggerStyle(loFi.label)} />}
                >
                  More
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                  <DropdownMenuItem onClick={onOpenFirms}>Firms</DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenTalk}>Talk tracks</DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenDetails}>Details</DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenAlerts}>Alert prefs</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() =>
                      downloadText("outreach.csv", buildOutreachCsv(meetings))
                    }
                  >
                    Export outreach CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSimulateStop}>
                    Simulate client stop
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </>
      )}
    </LoFiPanel>
    </HolonBoundary>
  );
}
