/**
 * Pipeline track (furnishing items 71–83).
 */
import { useMemo } from "react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { WORKER_CT } from "../../../holons/registerCtHolons";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { LastReceiptId } from "./AmbientBits";
import {
  companyInitial,
  filterPipeline,
  groupMeetings,
  lastReceiptId,
  PIPELINE_FILTER_LABELS,
  stakeAmount,
  statusChip,
} from "./helpers";
import type { PipelineFilter, TimeMode, WorkerMeeting, WorkerVessel } from "./types";

export type PipelineViewProps = {
  vessel: WorkerVessel;
  meetings: WorkerMeeting[];
  booked: number;
  filter: PipelineFilter;
  onFilter: (f: PipelineFilter) => void;
  timeMode: TimeMode;
  onTimeMode: (m: TimeMode) => void;
  stopped: boolean;
  onLog: () => void;
  onActive: () => void;
  onOpenPacket: (id: string) => void;
};

const FILTER_IDS: PipelineFilter[] = [
  "all",
  "pending",
  "upcoming",
  "released",
  "disputed",
];

export function PipelineView({
  vessel,
  meetings,
  booked,
  filter,
  onFilter,
  timeMode,
  onTimeMode,
  stopped,
  onLog,
  onActive,
  onOpenPacket,
}: PipelineViewProps) {
  const loFi = useDeskPalette();
  const filtered = useMemo(() => filterPipeline(meetings, filter), [meetings, filter]);
  const groups = useMemo(() => groupMeetings(filtered), [filtered]);
  const pendingCount = meetings.filter((m) => m.status === "pending_release").length;
  const upcomingCount = meetings.filter((m) => m.status === "upcoming").length;
  const receipt = lastReceiptId(meetings);

  const headerAction = (
    <div className="flex flex-wrap items-center gap-1.5">
      {FILTER_IDS.map((id) => (
        <LoFiButton
          key={id}
          variant={filter === id ? "ghost" : "quiet"}
          onClick={() => onFilter(id)}
        >
          {PIPELINE_FILTER_LABELS[id]}
        </LoFiButton>
      ))}
      <LoFiButton
        variant="quiet"
        onClick={() => onTimeMode(timeMode === "relative" ? "absolute" : "relative")}
      >
        {timeMode === "relative" ? "Relative" : "Absolute"}
      </LoFiButton>
    </div>
  );

  return (
    <HolonBoundary id={WORKER_CT.pipeline.id} label={WORKER_CT.pipeline.label} t={light}>
    <LoFiPanel title="Pipeline" caption="Booked meetings only" headerAction={headerAction}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "12px 0",
          borderBottom: `1px solid ${loFi.stroke}`,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600 }}>{vessel.name}</div>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: loFi.block,
            overflow: "hidden",
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
        <div style={{ fontSize: 12, color: loFi.label }}>
          {booked} of {vessel.target} qualified
        </div>
        <LastReceiptId receiptId={receipt} />
      </div>

      {(pendingCount > 0 || upcomingCount > 0) && (
        <div
          className="sticky top-0 z-10 -mx-4 mb-2 border-b px-4 py-2 text-xs font-medium"
          style={{
            background: loFi.chrome,
            borderColor: loFi.stroke,
            color: loFi.label,
          }}
        >
          Pending release {pendingCount} · Upcoming {upcomingCount}
        </div>
      )}

      {groups.length === 0 ? (
        <Empty className="border-0 py-6">
          <EmptyHeader>
            <EmptyTitle>
              No {filter === "all" ? "" : PIPELINE_FILTER_LABELS[filter].toLowerCase()}{" "}
              meetings
            </EmptyTitle>
            <EmptyDescription>
              {filter !== "all" ? (
                <LoFiButton variant="quiet" onClick={() => onFilter("all")}>
                  Clear filter
                </LoFiButton>
              ) : (
                "Log a meeting to start the pipeline."
              )}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        groups.map((g) => (
          <div key={g.key} className="mb-2">
            <div
              className="mb-1 text-xs font-semibold uppercase tracking-wide"
              style={{ color: loFi.muted }}
            >
              {g.label}
            </div>
            {g.items.map((m) => {
              const stake = stakeAmount(m.status, vessel.price);
              const whenLabel = timeMode === "relative" ? m.whenRelative : m.whenAbsolute;
              return (
                <HolonBoundary
                  key={m.id}
                  id={WORKER_CT.meetingRow.id}
                  label={WORKER_CT.meetingRow.label}
                  t={light}
                >
                <button
                  type="button"
                  onClick={() => onOpenPacket(m.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 py-2.5 text-left text-sm"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: `1px solid ${loFi.stroke}`,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    color: loFi.ink,
                    width: "100%",
                  }}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold"
                      style={{ background: loFi.block }}
                    >
                      {companyInitial(m.company)}
                    </span>
                    <div>
                      <div className="font-medium">
                        #{m.number} · {m.who}
                      </div>
                      <div className="text-xs" style={{ color: loFi.label }}>
                        {m.company} · {whenLabel}
                      </div>
                      {m.disputeReason ? (
                        <div className="text-xs" style={{ color: loFi.muted }}>
                          {m.evidence ?? m.disputeReason}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {statusChip(m.status)}
                    </Badge>
                    {stake !== null ? (
                      <span className="text-xs font-medium">${stake}</span>
                    ) : null}
                    {m.receiptId ? (
                      <span className="text-[10px]" style={{ color: loFi.muted }}>
                        {m.receiptId}
                      </span>
                    ) : null}
                  </div>
                </button>
                </HolonBoundary>
              );
            })}
          </div>
        ))
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <LoFiButton onClick={onLog} disabled={stopped}>
          Log another
        </LoFiButton>
        <LoFiButton variant="quiet" onClick={onActive}>
          Active
        </LoFiButton>
      </div>
    </LoFiPanel>
    </HolonBoundary>
  );
}
