/**
 * Claimed / Begin (furnishing items 31–42).
 */
import { Lock } from "lucide-react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { WORKER_CT } from "../../../holons/registerCtHolons";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiFact, LoFiPanel } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { FurnishFocus } from "../FurnishFocus";
import { BrandExclusionsCount } from "./AmbientBits";
import { copyText, honestyLabel } from "./helpers";
import type { FirmRow, TalkLine, WorkerVessel } from "./types";

function focusFurnish(n: number) {
  return () => {
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-holon-id="${furnishFocusId("worker", n)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
}

export type ClaimedViewProps = {
  vessel: WorkerVessel;
  pickedUpAt: string;
  claimExpiryNote: boolean;
  onDismissExpiry: () => void;
  firms: FirmRow[];
  talkLines: TalkLine[];
  onBegin: () => void;
  onRelease: () => void;
  onOpenDetails: () => void;
};

export function ClaimedView({
  vessel,
  pickedUpAt,
  claimExpiryNote,
  onDismissExpiry,
  firms,
  talkLines,
  onBegin,
  onRelease,
  onOpenDetails,
}: ClaimedViewProps) {
  const loFi = useDeskPalette();
  const nextFirms = firms.filter((f) => f.status === "queued").slice(0, 3);
  const primaryTalk = talkLines[0];

  return (
    <HolonBoundary id={WORKER_CT.claimed.id} label={WORKER_CT.claimed.label} t={light}>
    <LoFiPanel title={vessel.name} caption="Begin when ready">
      {claimExpiryNote ? (
        <FurnishFocus
          persona="worker"
          n={40}
          label='"Your claim expires" timer stub'
          onFocus={focusFurnish(40)}
          style={{ display: "flex", width: "100%" }}
        >
          <div
            className="mb-2 flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-xs"
            style={{ background: loFi.block, border: `1px solid ${loFi.stroke}`, color: loFi.label }}
          >
            <span>Claim timer · release if you cannot begin within 24h (CT stub)</span>
            <LoFiButton variant="quiet" onClick={onDismissExpiry}>
              Dismiss
            </LoFiButton>
          </div>
        </FurnishFocus>
      ) : null}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: "12px 0",
          borderBottom: `1px solid ${loFi.stroke}`,
        }}
      >
        <FurnishFocus
          persona="worker"
          n={31}
          label="Three-cell facts: Per meeting · Who counts · Target"
          onFocus={focusFurnish(31)}
          style={{ display: "block", width: "100%" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 16,
            }}
          >
            <LoFiFact label="Per meeting" value={`$${vessel.price}`} />
            <LoFiFact
              label="Who counts"
              value={`${vessel.seniority}, ${vessel.meetingLengthMin}+ min`}
            />
            <LoFiFact label="Target" value={`${vessel.target} meetings`} />
          </div>
        </FurnishFocus>

        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: loFi.label }}>
          <FurnishFocus
            persona="worker"
            n={32}
            label='Hold context: custodian + "pay on release"'
            onFocus={focusFurnish(32)}
          >
            <span>{vessel.custodian} · pay on client release</span>
          </FurnishFocus>
          <FurnishFocus
            persona="worker"
            n={38}
            label="Client honesty chip"
            onFocus={focusFurnish(38)}
          >
            <span>{honestyLabel(vessel.clientHonesty)}</span>
          </FurnishFocus>
          <FurnishFocus
            persona="worker"
            n={36}
            label="Time-since-pickup stamp"
            onFocus={focusFurnish(36)}
          >
            <span>Picked up · {pickedUpAt}</span>
          </FurnishFocus>
          {vessel.operatorNote ? (
            <FurnishFocus
              persona="worker"
              n={37}
              label="Operator note one-liner"
              onFocus={focusFurnish(37)}
            >
              <span>Operator · {vessel.operatorNote}</span>
            </FurnishFocus>
          ) : null}
        </div>

        <BrandExclusionsCount count={vessel.brandExclusionCount} />

        <FurnishFocus
          persona="worker"
          n={33}
          label="Locked rules lock glyph opens Details"
          onFocus={focusFurnish(33)}
        >
          <button
            type="button"
            onClick={onOpenDetails}
            className="flex w-fit items-center gap-1.5 text-xs font-medium"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: loFi.ink,
              fontFamily: "inherit",
            }}
          >
            <Lock className="size-3.5" />
            Rules locked · open details
          </button>
        </FurnishFocus>

        {primaryTalk ? (
          <FurnishFocus
            persona="worker"
            n={42}
            label="Talk track quick-copy strip"
            onFocus={focusFurnish(42)}
            style={{ display: "block", width: "100%" }}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 text-xs"
              style={{ background: loFi.block, color: loFi.label }}
            >
              <span className="line-clamp-2">{primaryTalk.text}</span>
              <LoFiButton variant="quiet" onClick={() => copyText(primaryTalk.text)}>
                Copy
              </LoFiButton>
            </div>
          </FurnishFocus>
        ) : null}

        {nextFirms.length > 0 ? (
          <FurnishFocus
            persona="worker"
            n={41}
            label="Sample firm queue preview: next 3 firms"
            onFocus={focusFurnish(41)}
            style={{ display: "block", width: "100%" }}
          >
            <div>
              <div className="mb-1 text-xs font-medium" style={{ color: loFi.label }}>
                Next firms
              </div>
              <div className="flex flex-wrap gap-2 text-xs" style={{ color: loFi.muted }}>
                {nextFirms.map((f) => (
                  <span key={f.id}>{f.name}</span>
                ))}
              </div>
            </div>
          </FurnishFocus>
        ) : null}

        <FurnishFocus
          persona="worker"
          n={34}
          label="Begin is lone loud action; Release is quiet peer"
          onFocus={focusFurnish(34)}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <LoFiButton onClick={onBegin}>Begin</LoFiButton>
            <LoFiButton variant="quiet" onClick={onRelease}>
              Release to pool
            </LoFiButton>
          </div>
        </FurnishFocus>
        <FurnishFocus
          persona="worker"
          n={35}
          label='Release consequence preview: "Returns to pool unclaimed"'
          onFocus={focusFurnish(35)}
        >
          <p className="text-[11px]" style={{ color: loFi.muted }}>
            Release returns vessel unclaimed to Available.
          </p>
        </FurnishFocus>
      </div>
    </LoFiPanel>
    </HolonBoundary>
  );
}
