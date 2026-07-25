/**
 * Evaluate / dossier furniture (items 47–55).
 */
import { Badge } from "@/components/ui/badge";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { useDeskPalette } from "../DeskPaletteContext";
import { copyText, quietTriggerStyle } from "./helpers";
import { DOSSIER_ANALYZED_AT } from "./seed";

export type DossierHeaderFurnitureProps = {
  analyzedAt?: string;
  sectionCount: number;
  unknownCount: number;
  noteCount: number;
  onOpenMore: () => void;
  onCopyDomain: (domain: string) => void;
  domain: string;
};

export function DossierHeaderFurniture({
  analyzedAt = DOSSIER_ANALYZED_AT,
  sectionCount,
  unknownCount,
  noteCount,
  onOpenMore,
  onCopyDomain,
  domain,
}: DossierHeaderFurnitureProps) {
  const loFi = useDeskPalette();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 border-b pb-3" style={{ borderColor: loFi.stroke }}>
      <FurnishFocus persona="op" n={47} label="Last analyzed timestamp">
        <span className="text-[11px]" style={{ color: loFi.muted }}>
          Last analyzed · {analyzedAt}
        </span>
      </FurnishFocus>
      <FurnishFocus persona="op" n={49} label="Section/unknown count badges" style={{ gap: "0.5rem" }}>
        <>
          <Badge variant="secondary" className="text-[10px]">
            {sectionCount} sections
          </Badge>
          {unknownCount > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              {unknownCount} unknown
            </Badge>
          ) : null}
        </>
      </FurnishFocus>
      {noteCount > 0 ? (
        <FurnishFocus persona="op" n={51} label='"N notes" tray peek'>
          <Badge variant="outline" className="text-[10px]">
            {noteCount} notes
          </Badge>
        </FurnishFocus>
      ) : null}
      <div className="ml-auto flex gap-2">
        <FurnishFocus persona="op" n={55} label="Copy company domain">
          <button type="button" onClick={() => onCopyDomain(domain)} style={quietTriggerStyle(loFi.label)}>
            Copy domain
          </button>
        </FurnishFocus>
        <LoFiButton variant="ghost" onClick={onOpenMore}>
          More
        </LoFiButton>
      </div>
    </div>
  );
}

export type NotesSummaryProps = {
  noteCount: number;
  preview?: string;
};

export function NotesSummary({ noteCount, preview }: NotesSummaryProps) {
  const loFi = useDeskPalette();
  if (noteCount === 0) return null;
  return (
    <FurnishFocus persona="op" n={52} label='"What you heard" summary' style={{ display: "block" }}>
      <p className="mb-3 text-[11px]" style={{ color: loFi.label }}>
        What you heard · {noteCount} note{noteCount === 1 ? "" : "s"}
        {preview ? ` — ${preview.slice(0, 60)}${preview.length > 60 ? "…" : ""}` : ""}
      </p>
    </FurnishFocus>
  );
}

export function exportDossierText(sections: { label: string; fact: string }[], companyName: string) {
  const lines = [`Dossier · ${companyName}`, "", ...sections.map((s) => `${s.label}\n${s.fact}\n`)];
  return lines.join("\n");
}

export function downloadDossier(sections: { label: string; fact: string }[], companyName: string) {
  const blob = new Blob([exportDossierText(sections, companyName)], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${companyName}-dossier.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyDomain(domain: string) {
  copyText(domain.startsWith("http") ? domain : `https://${domain}`);
}
