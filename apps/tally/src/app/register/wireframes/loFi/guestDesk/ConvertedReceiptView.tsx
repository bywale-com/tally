/**
 * Guest — Converted / receipt view (checklist items 51–60).
 */
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { GUEST_CT } from "@/app/register/holons/registerCtHolons";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel, PERSONA_SEED } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { Fact, HoldClockStarted } from "./AmbientBits";
import type { GuestInvite } from "./types";

export type ConvertedReceiptViewProps = {
  invite: GuestInvite;
  holdTotal: number;
  calendar: string;
  onCalendarChange: (value: string) => void;
  holdStartedAt: string;
  onOpenDesk?: () => void;
  onReplayInvite: () => void;
};

export function ConvertedReceiptView({
  invite,
  holdTotal,
  calendar,
  onCalendarChange,
  holdStartedAt,
  onOpenDesk,
  onReplayInvite,
}: ConvertedReceiptViewProps) {
  const loFi = useDeskPalette();

  return (
    <HolonBoundary id={GUEST_CT.converted.id} label={GUEST_CT.converted.label} t={light}>
      <LoFiPanel
      title="Business Client"
      caption={`${invite.clientName}. $${holdTotal} in hold.`}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact label="Hold" value={`$${holdTotal}`} />
          <Fact label="Operator" value={invite.operatorName} />
          <Fact label="Next" value="Launch" />
        </div>

        <p className="text-xs" style={{ color: loFi.label }}>
          Worker runs outreach after launch. You do not. No Worker chat.
        </p>

        <HoldClockStarted startedAt={holdStartedAt} />

        <label className="flex max-w-xs flex-col gap-1.5">
          <span className="text-[11px]" style={{ color: loFi.label }}>
            Calendar
          </span>
          <input
            value={calendar}
            onChange={(e) => onCalendarChange(e.target.value)}
            style={{
              height: 34,
              padding: "0 10px",
              borderRadius: 4,
              border: `1px solid ${loFi.stroke}`,
              background: loFi.white,
              color: loFi.ink,
              fontSize: 13,
              fontFamily: "inherit",
            }}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <LoFiButton onClick={() => onOpenDesk?.()}>My campaigns</LoFiButton>
          <LoFiButton variant="quiet" onClick={onReplayInvite}>
            Replay invite
          </LoFiButton>
        </div>

        <p className="text-[11px]" style={{ color: loFi.muted }}>
          {PERSONA_SEED.meetingsTarget} meetings max · ${PERSONA_SEED.pricePerMeeting} each ·{" "}
          {PERSONA_SEED.holdDays}-day reclaim
        </p>
      </div>
    </LoFiPanel>
    </HolonBoundary>
  );
}
