/**
 * Ambient world furniture — facts, not new flows.
 */
import { useDeskPalette } from "../DeskPaletteContext";
import { LoFiButton } from "../LoFiPrimitives";
import { FurnishFocus } from "../FurnishFocus";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";

function focusFurnish(n: number) {
  return () => {
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-holon-id="${furnishFocusId("worker", n)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
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
    <FurnishFocus
      persona="worker"
      n={30}
      label="Operator credibility — prior vessels"
      onFocus={focusFurnish(30)}
    >
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
    <FurnishFocus
      persona="worker"
      n={39}
      label="Brand exclusions honored count"
      onFocus={focusFurnish(39)}
    >
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
    <p className="text-xs" style={{ color: loFi.muted }}>
      Last release receipt · {receiptId}
    </p>
  );
}

export type DeskDoneBannerProps = {
  onDismiss?: () => void;
};

export function DeskDoneBanner({ onDismiss }: DeskDoneBannerProps) {
  const loFi = useDeskPalette();
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-md px-3 py-2"
      style={{ background: loFi.block, border: `1px solid ${loFi.stroke}` }}
    >
      <p className="text-xs" style={{ color: loFi.label }}>
        Desk is done for today. Target met. Nothing pending to log.
      </p>
      {onDismiss ? (
        <LoFiButton variant="quiet" onClick={onDismiss}>
          Dismiss
        </LoFiButton>
      ) : null}
    </div>
  );
}

export type WorkerRoleChipProps = {
  label?: string;
};

export function WorkerRoleChip({ label = "You book meetings" }: WorkerRoleChipProps) {
  const loFi = useDeskPalette();
  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: loFi.block, color: loFi.label }}
    >
      {label}
    </span>
  );
}
