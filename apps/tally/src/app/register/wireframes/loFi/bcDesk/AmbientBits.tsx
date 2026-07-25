/**
 * Ambient world furniture (Furnishing items 91–100) — facts, not new flows.
 */
import { useDeskPalette } from "../DeskPaletteContext";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";

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
    <FurnishFocus persona="bc" n={93} label="Operator credibility strip: prior vessels with Operator">
      <p className="text-xs" style={{ color: loFi.label }}>
        {priorCount} prior vessel{priorCount === 1 ? "" : "s"} with {operatorName}
      </p>
    </FurnishFocus>
  );
}

export type BrandExclusionsCountProps = {
  count: number;
};

export function BrandExclusionsCount({ count }: BrandExclusionsCountProps) {
  const loFi = useDeskPalette();
  if (count <= 0) return null;
  return (
    <FurnishFocus persona="bc" n={96} label="Brand exclusions honored count">
      <p className="text-xs" style={{ color: loFi.label }}>
        Brand exclusions honored · {count} firm{count === 1 ? "" : "s"} blocked
      </p>
    </FurnishFocus>
  );
}

export type LastReceiptIdProps = {
  receiptId?: string;
};

export function LastReceiptId({ receiptId }: LastReceiptIdProps) {
  const loFi = useDeskPalette();
  if (!receiptId) return null;
  return (
    <FurnishFocus persona="bc" n={97} label="Trust furniture: last escrow release receipt ID">
      <p className="text-xs" style={{ color: loFi.muted }}>
        Last release receipt · {receiptId}
      </p>
    </FurnishFocus>
  );
}

export type HoldClockStartedProps = {
  startedAt: string;
};

export function HoldClockStarted({ startedAt }: HoldClockStartedProps) {
  const loFi = useDeskPalette();
  if (!startedAt || startedAt === "—") return null;
  return (
    <FurnishFocus persona="bc" n={98} label="Clock furniture: hold clock started date">
      <p className="text-xs" style={{ color: loFi.muted }}>
        Hold clock started · {startedAt}
      </p>
    </FurnishFocus>
  );
}

export type DeskDoneBannerProps = {
  onDismiss?: () => void;
  onFocus?: () => void;
};

/** Quiet end-state when pending=0 and no reclaim (item 100). */
export function DeskDoneBanner({ onDismiss, onFocus }: DeskDoneBannerProps) {
  const loFi = useDeskPalette();
  return (
    <FurnishFocus
      persona="bc"
      n={100}
      label="Desk is done for today quiet end-state"
      onFocus={onFocus}
      style={{ display: "block", width: "100%" }}
    >
      <div
        className="flex items-center justify-between gap-3 rounded-md px-3 py-2"
        style={{ background: loFi.block, border: `1px solid ${loFi.stroke}` }}
      >
        <p className="text-xs" style={{ color: loFi.label }}>
          Desk is done for today. No pending releases. Nothing to reclaim right now.
        </p>
        {onDismiss ? (
          <LoFiButton variant="quiet" onClick={onDismiss}>
            Dismiss
          </LoFiButton>
        ) : null}
      </div>
    </FurnishFocus>
  );
}
