/**
 * Guest — Meetings empty pre-fund (checklist items 61–70).
 */
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { GUEST_CT } from "@/app/register/holons/registerCtHolons";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import type { GuestInvite, Stage } from "./types";

export type GuestMeetingsViewProps = {
  invite: GuestInvite;
  stage: Stage;
  onOpenFaq?: () => void;
};

export function GuestMeetingsView({ invite, stage, onOpenFaq }: GuestMeetingsViewProps) {
  const loFi = useDeskPalette();
  const funded = stage === "converted";

  if (funded) {
    return (
      <HolonBoundary id={GUEST_CT.meetings.id} label={GUEST_CT.meetings.label} t={light}>
        <LoFiPanel title="Meetings">
          <Empty className="border-0 py-6">
            <EmptyHeader>
              <EmptyTitle>No meetings yet</EmptyTitle>
              <EmptyDescription>
                Bookings appear after Operator launches the vessel.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          <p className="text-[11px]" style={{ color: loFi.muted }}>
            Sample after launch: {invite.sampleMeetingGhost}
          </p>
        </LoFiPanel>
      </HolonBoundary>
    );
  }

  return (
    <HolonBoundary id={GUEST_CT.meetings.id} label={GUEST_CT.meetings.label} t={light}>
      <LoFiPanel title="Meetings">
        <Empty className="border-0 py-6">
          <EmptyHeader>
            <EmptyTitle>No meetings yet</EmptyTitle>
            <EmptyDescription>
              Bookings appear here after the vessel is funded and launched.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
        <p
          className="text-[11px] italic"
          style={{ color: loFi.muted, opacity: 0.7 }}
        >
          Ghost · {invite.sampleMeetingGhost}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <LoFiButton variant="quiet" disabled>
            Needs you
          </LoFiButton>
          {onOpenFaq ? (
            <LoFiButton variant="quiet" onClick={onOpenFaq}>
              How money works
            </LoFiButton>
          ) : null}
        </div>
      </LoFiPanel>
    </HolonBoundary>
  );
}
