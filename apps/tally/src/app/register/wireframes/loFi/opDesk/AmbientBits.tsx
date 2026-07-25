/**
 * Ambient world furniture (items 85–94, 26) — facts, not new flows.
 */
import { FurnishFocus } from "../FurnishFocus";
import { useDeskPalette } from "../DeskPaletteContext";

export type LaunchReceiptProps = { receiptId?: string };

export function LaunchReceipt({ receiptId }: LaunchReceiptProps) {
  const loFi = useDeskPalette();
  if (!receiptId) return null;
  return (
    <FurnishFocus persona="op" n={92} label="Launch receipt ID fact">
      <p className="text-xs" style={{ color: loFi.muted }}>
        Launch receipt · {receiptId}
      </p>
    </FurnishFocus>
  );
}

export type MeetingsProgressProps = {
  booked: number;
  target: number;
};

export function MeetingsProgress({ booked, target }: MeetingsProgressProps) {
  const loFi = useDeskPalette();
  const pct = target > 0 ? Math.min(100, (booked / target) * 100) : 0;
  return (
    <FurnishFocus persona="op" n={86} label="Meetings booked/target progress bar" style={{ display: "block" }}>
      <div className="space-y-1">
        <div className="flex justify-between text-xs" style={{ color: loFi.label }}>
          <span>
            Meetings · {booked}/{target}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: loFi.block }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: loFi.ink }}
          />
        </div>
      </div>
    </FurnishFocus>
  );
}

export type WorkerHonestyProps = {
  honesty: "silent" | "working" | "ok";
  touchedCount?: number;
};

export function WorkerHonesty({ honesty, touchedCount }: WorkerHonestyProps) {
  const loFi = useDeskPalette();
  let label = "Silent since launch";
  if (honesty === "working") label = `${touchedCount ?? 2} firms touched`;
  if (honesty === "ok") label = "Queue healthy";
  return (
    <FurnishFocus persona="op" n={87} label="Worker queue honesty">
      <p className="text-xs" style={{ color: loFi.label }}>
        Worker queue · {label}
      </p>
    </FurnishFocus>
  );
}

export type EscrowGlanceProps = {
  held: number;
  released: number;
};

export function EscrowGlance({ held, released }: EscrowGlanceProps) {
  const loFi = useDeskPalette();
  return (
    <FurnishFocus persona="op" n={88} label="Escrow held/released glance">
      <p className="text-xs" style={{ color: loFi.muted }}>
        Escrow · Held ${held.toLocaleString()} · Released ${released.toLocaleString()}
      </p>
    </FurnishFocus>
  );
}
