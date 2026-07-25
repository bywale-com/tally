/**
 * Guest — Fund escrow view (checklist items 36–50).
 */
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { GUEST_CT } from "@/app/register/holons/registerCtHolons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel, PERSONA_SEED } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { Fact, FactCell } from "./AmbientBits";
import { quietLinkStyle } from "./helpers";
import type { GuestInvite } from "./types";

export type FundEscrowViewProps = {
  invite: GuestInvite;
  fundN: number;
  onFundNChange: (n: number) => void;
  payment: string;
  onCyclePayment: () => void;
  exportFlash: boolean;
  onFund: () => void;
  onBack: () => void;
  onOpenTerms: () => void;
  onExportLawyer: () => void;
};

export function FundEscrowView({
  invite,
  fundN,
  onFundNChange,
  payment,
  onCyclePayment,
  exportFlash,
  onFund,
  onBack,
  onOpenTerms,
  onExportLawyer,
}: FundEscrowViewProps) {
  const loFi = useDeskPalette();
  const holdTotal = fundN * PERSONA_SEED.pricePerMeeting;
  const remaining = fundN;

  const nextPayment =
    payment === "Business checking"
      ? "wire"
      : payment === "Wire"
        ? "card"
        : "checking";

  return (
    <HolonBoundary id={GUEST_CT.fund.id} label={GUEST_CT.fund.label} t={light}>
      <LoFiPanel title="Fund escrow" caption={invite.name}>
      <div className="flex flex-col gap-4">
        <div
          className="flex items-baseline justify-between gap-4"
          style={{ maxWidth: 280 }}
        >
          <span className="text-xs" style={{ color: loFi.label }}>
            Hold
          </span>
          <span className="text-3xl font-semibold tracking-tight">${holdTotal}</span>
        </div>

        <div>
          <div className="mb-1.5 text-[11px]" style={{ color: loFi.label }}>
            Meetings (up to {PERSONA_SEED.meetingsTarget})
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: PERSONA_SEED.meetingsTarget }, (_, i) => i + 1).map(
              (n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onFundNChange(n)}
                  style={{
                    width: 32,
                    height: 28,
                    borderRadius: 4,
                    border: `1px solid ${fundN === n ? loFi.ink : loFi.stroke}`,
                    background: fundN === n ? loFi.ink : loFi.white,
                    color: fundN === n ? loFi.white : loFi.label,
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {n}
                </button>
              ),
            )}
          </div>
          <p className="mt-1.5 text-[11px]" style={{ color: loFi.muted }}>
            {remaining} meeting{remaining === 1 ? "" : "s"} in this hold
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <FactCell label="Per meeting" value={`$${PERSONA_SEED.pricePerMeeting}`} />
          <FactCell label="Payment" value={payment} />
          <FactCell label="Custodian" value={invite.custodian} sub="Not ops spend" />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <FactCell label="After fund" value="Hold placed" sub="Escrow tab activates" />
          <FactCell label="Next" value="Launch" sub="Worker runs outreach" />
          <FactCell label="Reclaim" value={`${PERSONA_SEED.holdDays} days`} sub="Unspent returns" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Fact label="Per meeting" value={`$${PERSONA_SEED.pricePerMeeting}`} />
          <Fact label="Payment" value={payment} />
          <Fact label="Custodian" value="Escrow stand-in" />
        </div>

        <p className="text-[11px]" style={{ color: loFi.muted }}>
          Operator retainer $0 · Platform fee $0 · USD hold only
        </p>
        <p className="text-[11px]" style={{ color: loFi.muted }}>
          Amounts in USD. Tax treatment is your entity&apos;s responsibility.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <LoFiButton onClick={onFund}>Fund</LoFiButton>
          <LoFiButton variant="quiet" onClick={onBack}>
            Back
          </LoFiButton>
          <DropdownMenu>
            <DropdownMenuTrigger render={<button type="button" style={quietLinkStyle(loFi.label)} />}>
              More
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-44">
              <DropdownMenuItem onClick={onOpenTerms}>Full terms</DropdownMenuItem>
              <DropdownMenuItem onClick={onCyclePayment}>
                Pay with {nextPayment}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportLawyer}>
                {exportFlash ? "Exported" : "Export for lawyer"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </LoFiPanel>
    </HolonBoundary>
  );
}
