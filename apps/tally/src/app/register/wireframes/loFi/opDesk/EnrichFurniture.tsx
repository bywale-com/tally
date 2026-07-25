/**
 * Enrich furniture (items 56–70).
 */
import { Badge } from "@/components/ui/badge";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { useDeskPalette } from "../DeskPaletteContext";
import { buildFirmsCsv, downloadText } from "./helpers";
import type { EnrichRun } from "./types";

export type EnrichStatusBarProps = {
  running: boolean;
  firmCount: number;
  catalogTotal: number;
  prunedCount: number;
  enrichRun?: EnrichRun;
  onExport?: () => void;
};

export function EnrichStatusBar({
  running,
  firmCount,
  catalogTotal,
  prunedCount,
  enrichRun,
  onExport,
}: EnrichStatusBarProps) {
  const loFi = useDeskPalette();
  return (
    <div
      className="mb-3 flex flex-wrap items-center gap-2 border-b pb-2 text-[11px]"
      style={{ borderColor: loFi.stroke, color: loFi.label }}
    >
      {running ? (
        <>
          <span>* Running</span>
          <FurnishFocus persona="op" n={56} label="Running row count ticker">
            <Badge variant="secondary" className="text-[10px]">
              {firmCount} / {catalogTotal} firms
            </Badge>
          </FurnishFocus>
          {enrichRun ? (
            <FurnishFocus persona="op" n={57} label="Source mix chip">
              <Badge variant="outline" className="text-[10px]">
                {enrichRun.sourceMix}
              </Badge>
            </FurnishFocus>
          ) : null}
        </>
      ) : (
        <FurnishFocus persona="op" n={58} label="Firm count + pruned count" style={{ gap: "0.5rem" }}>
          <>
            <span>{firmCount} firms</span>
            {prunedCount > 0 ? <span>· {prunedCount} removed by you</span> : null}
            {enrichRun ? (
              <span style={{ color: loFi.muted }}>
                · Last run {enrichRun.at} ({enrichRun.duration})
              </span>
            ) : null}
          </>
        </FurnishFocus>
      )}
      {!running && onExport ? (
        <FurnishFocus persona="op" n={60} label="Export firms CSV">
          <LoFiButton variant="ghost" onClick={onExport}>
            Export CSV
          </LoFiButton>
        </FurnishFocus>
      ) : null}
    </div>
  );
}

export type EnrichHistoryTrayProps = {
  run: EnrichRun;
};

export function EnrichHistoryTray({ run }: EnrichHistoryTrayProps) {
  const loFi = useDeskPalette();
  return (
    <FurnishFocus persona="op" n={64} label="Enrich history tray" style={{ display: "block" }}>
      <div
        className="mt-3 rounded-md px-3 py-2 text-[11px]"
        style={{ background: loFi.block, color: loFi.label }}
      >
        Enrich history · {run.at} · {run.duration} · {run.firmTotal} firms · {run.sourceMix}
      </div>
    </FurnishFocus>
  );
}

export function exportFirms(
  firms: { name: string; website: string; hq: string; employeeCount: string; jobCount: number }[],
  campaignName: string,
) {
  downloadText(`${campaignName}-firms.csv`, buildFirmsCsv(firms));
}
