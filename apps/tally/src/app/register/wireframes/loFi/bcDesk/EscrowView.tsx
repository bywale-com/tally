/**
 * Escrow furnishing (items 61–76). Function unchanged — densify money room.
 */
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { BC_CT } from "@/app/register/holons/registerCtHolons";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { FurnishFocus } from "../FurnishFocus";
import {
  buildLedger,
  buildStatementCsv,
  downloadText,
  rollupHeld,
  rollupReleased,
} from "./helpers";
import { HELD_SPARK } from "./seed";
import type { BookedMeeting, Density, OperatorRequest, Vessel } from "./types";

export type EscrowViewProps = {
  vessel: Vessel;
  vessels: Vessel[];
  meetings: BookedMeeting[];
  held: number;
  released: number;
  remainingMeetings: number;
  canReclaim: boolean;
  onReclaimOpen: () => void;
  onOperatorRequest: () => void;
  requests: OperatorRequest[];
  operatorNote: string | null;
  onOpenMeeting: (meetingId: string) => void;
  onOpenFaq: () => void;
  onOpenRequests: () => void;
  onDismissLowMotion: () => void;
  lowMotionDismissed: boolean;
  density?: Density;
};

function HeldSparkline({ values, color }: { values: number[]; color: string }) {
  const w = 120;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} aria-hidden className="shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
    </svg>
  );
}

function requestStatusLabel(status: OperatorRequest["status"]) {
  if (status === "noted") return "Noted";
  if (status === "seen") return "Seen";
  return "Closed";
}

export function EscrowView({
  vessel,
  vessels,
  meetings,
  held,
  released,
  remainingMeetings,
  canReclaim,
  onReclaimOpen,
  onOperatorRequest,
  requests,
  operatorNote,
  onOpenMeeting,
  onOpenFaq,
  onOpenRequests,
  onDismissLowMotion,
  lowMotionDismissed,
  density = "comfortable",
}: EscrowViewProps) {
  const loFi = useDeskPalette();
  const compact = density === "compact";
  const ledger = useMemo(() => buildLedger(vessel, meetings), [vessel, meetings]);
  const showLowMotion =
    vessel.honesty === "silent" && vessel.state === "running" && !lowMotionDismissed;
  const multiVessel = vessels.length > 1;

  const exportCsv = () => {
    const body = buildStatementCsv(vessel, ledger, held, released);
    downloadText(`${vessel.id}-statement.csv`, body);
  };

  const cellPad = compact ? "py-2" : "py-3";
  const gap = compact ? 12 : 16;

  return (
    <HolonBoundary id={BC_CT.escrow.id} label={BC_CT.escrow.label} t={light}>
    <LoFiPanel
      title="Escrow"
      caption={vessel.name}
      headerAction={
        <FurnishFocus persona="bc" n={74} label="Export statement CSV">
          <LoFiButton variant="ghost" onClick={exportCsv}>
            Export statement
          </LoFiButton>
        </FurnishFocus>
      }
    >
      {operatorNote ? (
        <p
          className="text-xs"
          style={{
            color: loFi.label,
            borderLeft: `2px solid ${loFi.stroke}`,
            paddingLeft: 10,
          }}
        >
          {operatorNote}
        </p>
      ) : null}

      {showLowMotion ? (
        <FurnishFocus
          persona="bc"
          n={70}
          label="Low-motion banner: dismissible when silent and running"
          style={{ display: "block", width: "100%" }}
        >
        <div
          className="flex items-start justify-between gap-3 rounded-md px-3 py-2"
          style={{ background: loFi.block, border: `1px solid ${loFi.stroke}` }}
        >
          <p className="text-xs leading-relaxed" style={{ color: loFi.label }}>
            Low motion. {vessel.operatorName} last touched {vessel.lastTouched}. Hold stays
            put until meetings release or you reclaim.
          </p>
          <LoFiButton variant="quiet" onClick={onDismissLowMotion}>
            Dismiss
          </LoFiButton>
        </div>
        </FurnishFocus>
      ) : null}

      <FurnishFocus
        persona="bc"
        n={61}
        label="Held / Released / Remaining three-cell dashboard"
        style={{ display: "block", width: "100%" }}
      >
      <div
        className="grid grid-cols-3 gap-4"
        style={{ gap }}
      >
        <div className={cellPad}>
          <div className="text-[11px]" style={{ color: loFi.label }}>
            Held
          </div>
          <div className="text-2xl font-semibold tracking-tight">${held}</div>
          <FurnishFocus persona="bc" n={64} label="Sparkline of Held over time">
            <div className="mt-1 flex items-center gap-2">
              <HeldSparkline values={HELD_SPARK} color={loFi.muted} />
            </div>
          </FurnishFocus>
          <div className="text-[11px]" style={{ color: loFi.muted }}>
            {remainingMeetings} × ${vessel.price}
          </div>
        </div>
        <div className={cellPad}>
          <div className="text-[11px]" style={{ color: loFi.label }}>
            Released
          </div>
          <div className="text-2xl font-semibold tracking-tight">${released}</div>
        </div>
        <div className={cellPad}>
          <div className="text-[11px]" style={{ color: loFi.label }}>
            Remaining meetings
          </div>
          <div className="text-2xl font-semibold tracking-tight">{remainingMeetings}</div>
          <div className="text-[11px]" style={{ color: loFi.muted }}>
            of {vessel.target}
          </div>
        </div>
      </div>
      </FurnishFocus>

      {multiVessel ? (
        <FurnishFocus
          persona="bc"
          n={76}
          label="Multi-vessel escrow rollup"
          style={{ display: "block", width: "100%" }}
        >
        <p className="text-xs" style={{ color: loFi.label }}>
          Across {vessels.length} vessels · ${rollupHeld(vessels)} held · $
          {rollupReleased(vessels)} released
        </p>
        </FurnishFocus>
      ) : null}

      <FurnishFocus
        persona="bc"
        n={65}
        label="Custodian badge: not ops spend"
        style={{ display: "block", width: "100%" }}
      >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{vessel.custodian}</Badge>
        <span className="text-xs" style={{ color: loFi.muted }}>
          Meeting releases only. Not ops spend.
        </span>
      </div>
      </FurnishFocus>

      <FurnishFocus
        persona="bc"
        n={62}
        label="Statement as a real scrollable ledger"
        style={{ display: "block", width: "100%" }}
      >
      <div className="flex min-h-0 flex-col">
        <div className="py-2 text-xs font-medium" style={{ color: loFi.label }}>
          Statement
        </div>
        <FurnishFocus persona="bc" n={63} label="Ledger row click opens Meeting sheet">
          <div
            className="flex max-h-48 flex-col overflow-auto"
            style={{ borderTop: `1px solid ${loFi.stroke}` }}
          >
            {ledger.map((line) => {
              const clickable = Boolean(line.meetingId);
              const isZero = line.kind === "zero";
              const amountLabel =
                line.kind === "hold"
                  ? `+$${line.amount}`
                  : line.kind === "zero"
                    ? "$0"
                    : `−$${Math.abs(line.amount)}`;

              const inner = (
                <>
                  <span style={{ color: isZero ? loFi.muted : loFi.ink }}>{line.label}</span>
                  <span style={{ color: isZero ? loFi.muted : loFi.ink }}>{amountLabel}</span>
                </>
              );

              if (clickable && line.meetingId) {
                return (
                  <button
                    key={line.id}
                    type="button"
                    className="flex justify-between border-b py-2 text-left text-xs"
                    style={{
                      borderColor: loFi.stroke,
                      background: "transparent",
                      color: loFi.ink,
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                    onClick={() => onOpenMeeting(line.meetingId!)}
                  >
                    {inner}
                  </button>
                );
              }

              return (
                <div
                  key={line.id}
                  className="flex justify-between border-b py-2 text-xs"
                  style={{ borderColor: loFi.stroke, color: loFi.ink }}
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </FurnishFocus>
        {ledger.some((l) => l.kind === "zero") ? (
          <FurnishFocus persona="bc" n={69} label="Prove it's not ops: zero line-items">
            <p className="pt-2 text-[11px]" style={{ color: loFi.muted }}>
              Prove it&apos;s not ops · retainers and platform fees show $0
            </p>
          </FurnishFocus>
        ) : null}
      </div>
      </FurnishFocus>

      <HolonBoundary id={BC_CT.reclaim.id} label={BC_CT.reclaim.label} t={light}>
      <FurnishFocus
        persona="bc"
        n={73}
        label="Split: money actions vs Operator actions"
        style={{ display: "block", width: "100%" }}
      >
      <div
        className="flex flex-col gap-4 border-t pt-4"
        style={{ borderColor: loFi.stroke, gap }}
      >
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-medium" style={{ color: loFi.label }}>
            Money
          </div>
          <FurnishFocus persona="bc" n={66} label="Reclaim: timer beside disabled button">
            <div className="flex flex-wrap items-center gap-3">
              <LoFiButton onClick={onReclaimOpen} disabled={!canReclaim}>
                Reclaim unspent
              </LoFiButton>
              {!canReclaim && held > 0 && vessel.state !== "reclaimed" ? (
                <span className="text-xs" style={{ color: loFi.label }}>
                  Available in {vessel.reclaimDaysLeft}d
                </span>
              ) : null}
            </div>
          </FurnishFocus>
          <FurnishFocus persona="bc" n={67} label="Reclaim: preview settlement window">
            <p className="text-xs" style={{ color: loFi.muted }}>
              Settlement usually 1–3 business days after reclaim.
            </p>
          </FurnishFocus>
        </div>

        <FurnishFocus
          persona="bc"
          n={71}
          label="Request Operator: Requests tray"
          style={{ display: "block", width: "100%" }}
        >
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-medium" style={{ color: loFi.label }}>
            Operator
          </div>
          <LoFiButton variant="quiet" onClick={onOperatorRequest}>
            Request Operator
          </LoFiButton>
          {requests.length > 0 ? (
            <FurnishFocus persona="bc" n={72} label="Requests tray: Noted / Seen / Closed">
              <div className="flex flex-col" style={{ borderTop: `1px solid ${loFi.stroke}` }}>
                <button
                  type="button"
                  className="flex items-center justify-between py-2 text-left text-xs"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: loFi.label,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                  onClick={onOpenRequests}
                >
                  <span>Requests ({requests.length})</span>
                  <span style={{ color: loFi.muted }}>View tray</span>
                </button>
                {requests.slice(0, 2).map((req) => (
                  <div
                    key={req.id}
                    className="flex justify-between border-t py-1.5 text-[11px]"
                    style={{ borderColor: loFi.stroke, color: loFi.muted }}
                  >
                    <span>{req.label}</span>
                    <span>
                      {requestStatusLabel(req.status)} · {req.at}
                    </span>
                  </div>
                ))}
              </div>
            </FurnishFocus>
          ) : null}
        </div>
        </FurnishFocus>
      </div>
      </FurnishFocus>
      </HolonBoundary>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <FurnishFocus persona="bc" n={75} label="Escrow FAQ sheet: How money works">
          <LoFiButton variant="quiet" onClick={onOpenFaq}>
            How money works
          </LoFiButton>
        </FurnishFocus>
        <FurnishFocus persona="bc" n={68} label="Currency + tax disclaimer footer">
          <p className="text-[10px]" style={{ color: loFi.muted }}>
            USD. Tax treatment depends on your entity. Not investment advice.
          </p>
        </FurnishFocus>
      </div>
    </LoFiPanel>
    </HolonBoundary>
  );
}
