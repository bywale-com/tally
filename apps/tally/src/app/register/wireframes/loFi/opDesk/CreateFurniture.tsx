/**
 * Create flow furniture (items 31–38).
 */
import { Badge } from "@/components/ui/badge";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { useDeskPalette } from "../DeskPaletteContext";
import { quietTriggerStyle } from "./helpers";
import { CREATE_TEMPLATES } from "./seed";
import type { CreateTemplate } from "./types";

export type CreateFurnitureProps = {
  draftName: string;
  recentNames: string[];
  onPickTemplate: (t: CreateTemplate) => void;
  onPickRecent: (name: string) => void;
  onOpenHelp: () => void;
};

export function CreateFurniture({
  draftName,
  recentNames,
  onPickTemplate,
  onPickRecent,
  onOpenHelp,
}: CreateFurnitureProps) {
  const loFi = useDeskPalette();
  const len = draftName.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-[10px]" style={{ color: loFi.muted }}>
        <FurnishFocus persona="op" n={31} label="Character count">
          <span>{len} characters</span>
        </FurnishFocus>
        <FurnishFocus persona="op" n={37} label='"What happens next" link'>
          <button type="button" onClick={onOpenHelp} style={quietTriggerStyle(loFi.label)}>
            What happens next
          </button>
        </FurnishFocus>
      </div>

      <FurnishFocus persona="op" n={33} label="Template picker" style={{ display: "block" }}>
      <div>
        <div className="mb-2 text-[11px] font-medium" style={{ color: loFi.label }}>
          Templates
        </div>
        <div className="flex flex-wrap gap-2">
          {CREATE_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPickTemplate(t)}
              className="rounded-md border px-2 py-1 text-[11px]"
              style={{
                borderColor: loFi.stroke,
                background: loFi.white,
                color: loFi.ink,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      </FurnishFocus>

      {recentNames.length > 0 ? (
        <FurnishFocus persona="op" n={32} label="Recent names tray" style={{ display: "block" }}>
        <div>
          <div className="mb-2 text-[11px] font-medium" style={{ color: loFi.label }}>
            Recent names
          </div>
          <div className="flex flex-wrap gap-2">
            {recentNames.slice(0, 4).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onPickRecent(name)}
                className="cursor-pointer"
              >
                <Badge variant="secondary" className="text-[10px]">
                  {name}
                </Badge>
              </button>
            ))}
          </div>
        </div>
        </FurnishFocus>
      ) : null}
    </div>
  );
}

export type CreatingSubtitleProps = {
  name: string;
};

export function CreatingSubtitle({ name }: CreatingSubtitleProps) {
  const loFi = useDeskPalette();
  return (
    <FurnishFocus persona="op" n={35} label="Creating loader subtitle" style={{ display: "block" }}>
      <div className="text-center">
        <div className="text-sm font-semibold">{name}</div>
        <div className="mt-1 text-xs" style={{ color: loFi.muted }}>
          Setting up…
        </div>
      </div>
    </FurnishFocus>
  );
}

export type CreatedPeekProps = {
  show: boolean;
};

export function CreatedPeek({ show }: CreatedPeekProps) {
  const loFi = useDeskPalette();
  if (!show) return null;
  return (
    <FurnishFocus persona="op" n={36} label="Created just now peek" style={{ display: "block" }}>
      <p className="mb-3 text-[11px]" style={{ color: loFi.label }}>
        Created just now · pick the client company
      </p>
    </FurnishFocus>
  );
}

export type CompanyPickFurnitureProps = {
  acvBand?: string;
  recentNames: string[];
  onPickRecent: (name: string) => void;
};

export function CompanyPickFurniture({
  acvBand,
  recentNames,
  onPickRecent,
}: CompanyPickFurnitureProps) {
  const loFi = useDeskPalette();
  return (
    <div className="mb-3 space-y-2">
      {acvBand ? (
        <FurnishFocus persona="op" n={40} label="ACV band fact" style={{ display: "block" }}>
          <p className="text-[11px]" style={{ color: loFi.muted }}>
            ACV band · {acvBand}
          </p>
        </FurnishFocus>
      ) : null}
      {recentNames.length > 0 ? (
        <FurnishFocus persona="op" n={43} label="Recent companies tray" style={{ display: "block" }}>
          <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: loFi.label }}>
            <span>Recent:</span>
            {recentNames.map((n) => (
              <LoFiButton key={n} variant="ghost" onClick={() => onPickRecent(n)}>
                {n}
              </LoFiButton>
            ))}
          </div>
        </FurnishFocus>
      ) : null}
    </div>
  );
}

export type EvaluateSkeletonFurnitureProps = {
  sourceTags: string[];
};

export function EvaluateSkeletonFurniture({ sourceTags }: EvaluateSkeletonFurnitureProps) {
  const loFi = useDeskPalette();
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-[11px]" style={{ color: loFi.muted }}>
        Analyzing…
      </span>
      <FurnishFocus persona="op" n={46} label="Evaluate skeleton source tags" style={{ gap: "0.5rem" }}>
        <>
          {sourceTags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
        </>
      </FurnishFocus>
    </div>
  );
}
