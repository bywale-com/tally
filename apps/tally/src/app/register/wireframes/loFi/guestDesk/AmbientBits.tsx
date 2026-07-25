/**
 * Guest ambient trust furniture (checklist items 86–99).
 */
import { useDeskPalette } from "../DeskPaletteContext";
import { LoFiButton } from "../LoFiPrimitives";

export function Fact({ label, value }: { label: string; value: string }) {
  const loFi = useDeskPalette();
  return (
    <div>
      <div className="text-[11px]" style={{ color: loFi.label }}>
        {label}
      </div>
      <div className="text-sm font-medium" style={{ color: loFi.ink }}>
        {value}
      </div>
    </div>
  );
}

export function FactCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  const loFi = useDeskPalette();
  return (
    <div
      className="rounded-md border p-3"
      style={{ borderColor: loFi.stroke, background: loFi.white }}
    >
      <div className="text-[11px] font-medium" style={{ color: loFi.label }}>
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
      {sub ? (
        <div className="mt-0.5 text-[11px]" style={{ color: loFi.muted }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

export type OperatorCredibilityStripProps = {
  priorCount: number;
  operatorName: string;
};

export function OperatorCredibilityStrip({
  priorCount,
  operatorName,
}: OperatorCredibilityStripProps) {
  const loFi = useDeskPalette();
  if (priorCount <= 0) return null;
  return (
    <p className="text-xs" style={{ color: loFi.label }}>
      {priorCount} prior vessel{priorCount === 1 ? "" : "s"} with {operatorName}
    </p>
  );
}

export type BrandExclusionsCountProps = {
  count: number;
};

export function BrandExclusionsCount({ count }: BrandExclusionsCountProps) {
  const loFi = useDeskPalette();
  if (count <= 0) return null;
  return (
    <p className="text-xs" style={{ color: loFi.label }}>
      Brand exclusions honored · {count} firm{count === 1 ? "" : "s"} blocked
    </p>
  );
}

export type InviteRefStripProps = {
  inviteRef: string;
  inviteSentAt: string;
};

export function InviteRefStrip({ inviteRef, inviteSentAt }: InviteRefStripProps) {
  const loFi = useDeskPalette();
  return (
    <p className="text-[11px]" style={{ color: loFi.muted }}>
      Invite {inviteRef} · sent {inviteSentAt}
    </p>
  );
}

export type HoldClockStartedProps = {
  startedAt: string;
};

export function HoldClockStarted({ startedAt }: HoldClockStartedProps) {
  const loFi = useDeskPalette();
  if (!startedAt) return null;
  return (
    <p className="text-xs" style={{ color: loFi.muted }}>
      Hold clock started · {startedAt}
    </p>
  );
}

export type FundedAwaitingBannerProps = {
  onDismiss?: () => void;
};

export function FundedAwaitingBanner({ onDismiss }: FundedAwaitingBannerProps) {
  const loFi = useDeskPalette();
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-md px-3 py-2"
      style={{ background: loFi.block, border: `1px solid ${loFi.stroke}` }}
    >
      <p className="text-xs" style={{ color: loFi.label }}>
        Funded. Awaiting launch. Worker runs outreach after Operator launches.
      </p>
      {onDismiss ? (
        <LoFiButton variant="quiet" onClick={onDismiss}>
          Dismiss
        </LoFiButton>
      ) : null}
    </div>
  );
}

export type FlashNoteProps = {
  note: string | null;
};

export function FlashNote({ note }: FlashNoteProps) {
  const loFi = useDeskPalette();
  if (!note) return null;
  return (
    <p
      className="text-xs"
      style={{
        color: loFi.label,
        borderLeft: `2px solid ${loFi.stroke}`,
        paddingLeft: 10,
      }}
    >
      {note}
    </p>
  );
}
