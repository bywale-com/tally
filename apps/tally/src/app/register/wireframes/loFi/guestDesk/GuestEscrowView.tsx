/**
 * Guest — Escrow pre-fund / post-convert (checklist items 63–70).
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
import { LoFiPanel, PERSONA_SEED } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import type { GuestInvite, Stage } from "./types";

export type GuestEscrowViewProps = {
  invite: GuestInvite;
  stage: Stage;
  holdTotal: number;
  proposedHold: number;
  onOpenFaq?: () => void;
};

export function GuestEscrowView({
  invite,
  stage,
  holdTotal,
  proposedHold,
  onOpenFaq,
}: GuestEscrowViewProps) {
  const loFi = useDeskPalette();

  if (stage === "converted") {
    return (
      <HolonBoundary id={GUEST_CT.escrow.id} label={GUEST_CT.escrow.label} t={light}>
        <LoFiPanel title="Escrow">
          <div className="flex flex-col gap-4">
            <div className="flex gap-8">
              <div>
                <div className="text-[11px]" style={{ color: loFi.label }}>
                  Held
                </div>
                <div className="text-2xl font-semibold tracking-tight">${holdTotal}</div>
              </div>
              <div>
                <div className="text-[11px]" style={{ color: loFi.label }}>
                  Released
                </div>
                <div className="text-2xl font-semibold tracking-tight">$0</div>
              </div>
            </div>
            <p className="text-xs" style={{ color: loFi.label }}>
              Custodian: {invite.custodian}. Not prepaid marketing.
            </p>
            <p className="text-[11px]" style={{ color: loFi.muted }}>
              Reclaim opens {PERSONA_SEED.holdDays} days after launch if meetings remain.
            </p>
          </div>
        </LoFiPanel>
      </HolonBoundary>
    );
  }

  return (
    <HolonBoundary id={GUEST_CT.escrow.id} label={GUEST_CT.escrow.label} t={light}>
      <LoFiPanel title="Escrow" caption={`Proposed hold $${proposedHold}`}>
        <Empty className="border-0 py-6">
          <EmptyHeader>
            <EmptyTitle>No hold yet</EmptyTitle>
            <EmptyDescription>Fund the invite to place escrow.</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <p className="text-xs" style={{ color: loFi.label }}>
          Custodian: {invite.custodian}. USD sits until meetings release or you reclaim.
        </p>
        {onOpenFaq ? (
          <div className="mt-3">
            <LoFiButton variant="quiet" onClick={onOpenFaq}>
              How money works
            </LoFiButton>
          </div>
        ) : null}
      </LoFiPanel>
    </HolonBoundary>
  );
}
