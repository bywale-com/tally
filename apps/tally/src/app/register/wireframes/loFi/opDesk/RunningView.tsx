/**
 * Running glance (items 85–94).
 */
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { OP_CT } from "../../../holons/registerCtHolons";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { useDeskPalette } from "../DeskPaletteContext";
import {
  EscrowGlance,
  LaunchReceipt,
  MeetingsProgress,
  WorkerHonesty,
} from "./AmbientBits";
import { exportFirms } from "./EnrichFurniture";
import { quietTriggerStyle } from "./helpers";
import type { OpDeskSheet } from "./types";

export type RunningViewProps = {
  campaignName: string;
  clientName?: string;
  inviteAt?: string;
  booked: number;
  target: number;
  held: number;
  released: number;
  honesty: "silent" | "working" | "ok";
  receiptId?: string;
  nextMeeting?: string;
  firms: { name: string; website: string; hq: string; employeeCount: string; jobCount: number }[];
  funded: boolean;
  onOpenSheet: (sheet: OpDeskSheet) => void;
  onReset: () => void;
};

export function RunningView({
  campaignName,
  clientName,
  inviteAt,
  booked,
  target,
  held,
  released,
  honesty,
  receiptId,
  nextMeeting,
  firms,
  funded,
  onOpenSheet,
  onReset,
}: RunningViewProps) {
  const loFi = useDeskPalette();

  return (
    <HolonBoundary
      id={OP_CT.running.id}
      label={OP_CT.running.label}
      parentId={OP_CT.desk.id}
      order={8}
      t={light}
      style={{ display: "contents" }}
    >
    <div className="space-y-4">
      <FurnishFocus persona="op" n={85} label="Running badge + fund received fact" style={{ display: "block" }}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: loFi.ink, color: loFi.white }}
          >
            Running
          </span>
          {funded ? (
            <span className="text-[11px]" style={{ color: loFi.muted }}>
              Fund received. Launch coupled (V1).
            </span>
          ) : null}
        </div>
      </FurnishFocus>

      {clientName ? (
        <FurnishFocus persona="op" n={89} label="Client name + invite date facts" style={{ display: "block" }}>
          <p className="text-xs" style={{ color: loFi.label }}>
            Client · {clientName}
            {inviteAt ? ` · invited ${inviteAt}` : ""}
          </p>
        </FurnishFocus>
      ) : null}

      <MeetingsProgress booked={booked} target={target} />
      <WorkerHonesty honesty={honesty} />
      <EscrowGlance held={held} released={released} />
      <LaunchReceipt receiptId={receiptId} />

      {nextMeeting ? (
        <p className="text-xs" style={{ color: loFi.label }}>
          Next · {nextMeeting}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <FurnishFocus persona="op" n={90} label='"Pause"/"Stop" doors' style={{ gap: "0.5rem" }}>
          <>
            <button type="button" onClick={() => onOpenSheet("pause")} style={quietTriggerStyle(loFi.label)}>
              Pause
            </button>
            <button type="button" onClick={() => onOpenSheet("stop")} style={quietTriggerStyle(loFi.label)}>
              Stop
            </button>
          </>
        </FurnishFocus>
        <FurnishFocus persona="op" n={94} label="Firm list export link">
          <LoFiButton
            variant="ghost"
            onClick={() => exportFirms(firms, campaignName)}
          >
            Export firms
          </LoFiButton>
        </FurnishFocus>
        <FurnishFocus persona="op" n={91} label="Reset prototype stays quiet">
          <LoFiButton variant="ghost" onClick={onReset}>
            Reset
          </LoFiButton>
        </FurnishFocus>
      </div>
    </div>
    </HolonBoundary>
  );
}
