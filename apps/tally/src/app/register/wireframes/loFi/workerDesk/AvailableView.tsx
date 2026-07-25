/**
 * Available queue (furnishing items 1–17).
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { WORKER_CT } from "../../../holons/registerCtHolons";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { OperatorCredibilityStrip } from "./AmbientBits";
import {
  filterQueue,
  QUEUE_FILTER_LABELS,
  quietTriggerStyle,
} from "./helpers";
import type { QueueFilter, WorkerVessel } from "./types";

export type AvailableViewProps = {
  pool: WorkerVessel[];
  filter: QueueFilter;
  onFilter: (f: QueueFilter) => void;
  pinnedId: string | null;
  onPin: (id: string | null) => void;
  hasClaim: boolean;
  lastPickAt: string | null;
  onPickUp: (id: string) => void;
  onOpenDetails: (id: string) => void;
  onOpenFirms: (id: string) => void;
  onOpenTalk: () => void;
  onOpenHistory: (id: string) => void;
  /** Bring Available queue on screen (taxonomy focus / reveal). */
  onRevealQueue?: () => void;
};

export function AvailableView({
  pool,
  filter,
  onFilter,
  pinnedId,
  onPin,
  hasClaim,
  lastPickAt,
  onPickUp,
  onOpenDetails,
  onOpenFirms,
  onOpenTalk,
  onOpenHistory,
  onRevealQueue,
}: AvailableViewProps) {
  const loFi = useDeskPalette();
  const [highlightIndex, setHighlightIndex] = useState(0);

  const visible = useMemo(
    () => filterQueue(pool, filter, pinnedId),
    [pool, filter, pinnedId],
  );

  useEffect(() => {
    setHighlightIndex((i) => Math.min(i, Math.max(0, visible.length - 1)));
  }, [visible.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (visible.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "j") {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, visible.length - 1));
      } else if (e.key === "k") {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const v = visible[highlightIndex];
        if (v) onPickUp(v.id);
      }
    },
    [visible, highlightIndex, onPickUp],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const operatorName = visible[0]?.operatorName ?? "Operator";
  const priorCount = visible[0]?.priorVesselsWithOperator ?? 0;

  const reveal = () => {
    onRevealQueue?.();
  };

  /** Reveal + scroll — used when the taxonomy click lands on a row already on screen. */
  const revealAndScrollTo = (id: string) => () => {
    reveal();
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-holon-id="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const focusFurnish = (n: number) => () => {
    reveal();
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-holon-id="${furnishFocusId("worker", n)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const headerAction = (
    <FurnishFocus
      persona="worker"
      n={11}
      label="Queue filters"
      onFocus={focusFurnish(11)}
      style={{ flexWrap: "wrap", gap: 6 }}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {(Object.keys(QUEUE_FILTER_LABELS) as QueueFilter[]).map((id) => (
          <LoFiButton
            key={id}
            variant={filter === id ? "ghost" : "quiet"}
            onClick={() => onFilter(id)}
          >
            {QUEUE_FILTER_LABELS[id]}
          </LoFiButton>
        ))}
      </div>
    </FurnishFocus>
  );

  return (
    <HolonBoundary
      id={WORKER_CT.available.id}
      label={WORKER_CT.available.label}
      t={light}
      onFocus={revealAndScrollTo(WORKER_CT.available.id)}
    >
    <LoFiPanel title="Available" caption="Launched and unclaimed" headerAction={headerAction}>
      <OperatorCredibilityStrip priorCount={priorCount} operatorName={operatorName} />

      {visible.length > 0 ? (
        visible.map((v, idx) => {
          const highlighted = idx === highlightIndex;
          return (
            <HolonBoundary
              key={v.id}
              id={WORKER_CT.vesselCard.id}
              label={WORKER_CT.vesselCard.label}
              t={light}
              onFocus={revealAndScrollTo(WORKER_CT.vesselCard.id)}
            >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 0",
                borderBottom: `1px solid ${loFi.stroke}`,
                background: highlighted ? loFi.block : "transparent",
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="flex flex-wrap items-center gap-2">
                  <FurnishFocus
                    persona="worker"
                    n={4}
                    label="Company logo mark"
                    onFocus={focusFurnish(4)}
                  >
                    <span
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold"
                      style={{ background: loFi.block, color: loFi.ink }}
                    >
                      {v.logoMark}
                    </span>
                  </FurnishFocus>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{v.name}</div>
                  <HolonBoundary
                    id={WORKER_CT.launchedDot.id}
                    label={WORKER_CT.launchedDot.label}
                    t={light}
                    onFocus={() => {
                      reveal();
                      window.requestAnimationFrame(() => {
                        document
                          .querySelector(`[data-holon-id="${WORKER_CT.launchedDot.id}"]`)
                          ?.scrollIntoView({ behavior: "smooth", block: "center" });
                      });
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      padding: "3px 6px",
                      borderRadius: 6,
                      verticalAlign: "middle",
                    }}
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: loFi.ink }}
                      title="Launched"
                    />
                    <span className="text-[10px]" style={{ color: loFi.muted }}>
                      Launched
                    </span>
                  </HolonBoundary>
                  {pinnedId === v.id ? (
                    <FurnishFocus
                      persona="worker"
                      n={12}
                      label="Pinned preference"
                      onFocus={focusFurnish(12)}
                    >
                      <Badge variant="outline" className="text-[10px]">
                        Pinned
                      </Badge>
                    </FurnishFocus>
                  ) : null}
                </div>
                <FurnishFocus
                  persona="worker"
                  n={16}
                  label="Row subtitle: company · sector"
                  onFocus={focusFurnish(16)}
                >
                  <div style={{ fontSize: 12, color: loFi.label, marginTop: 2 }}>
                    {v.company} · {v.sector}
                  </div>
                </FurnishFocus>
                <div
                  className="mt-1 flex flex-wrap items-center gap-2 text-[11px]"
                  style={{ color: loFi.muted }}
                >
                  <FurnishFocus
                    persona="worker"
                    n={2}
                    label="Per meeting $ chip"
                    onFocus={focusFurnish(2)}
                  >
                    <span>${v.price}/mtg</span>
                  </FurnishFocus>
                  <FurnishFocus
                    persona="worker"
                    n={3}
                    label="Booked/N progress chip"
                    onFocus={focusFurnish(3)}
                  >
                    <span>
                      {v.bookedCount}/{v.target} booked
                    </span>
                  </FurnishFocus>
                  <FurnishFocus
                    persona="worker"
                    n={5}
                    label="Operator initials"
                    onFocus={focusFurnish(5)}
                  >
                    <span>{v.operatorInitials}</span>
                  </FurnishFocus>
                  <span>{v.lastTouched}</span>
                </div>
                <div
                  className="mt-1 flex flex-wrap gap-x-2 text-[11px]"
                  style={{ color: loFi.label }}
                >
                  <FurnishFocus
                    persona="worker"
                    n={7}
                    label="Seniority and length peek"
                    onFocus={focusFurnish(7)}
                  >
                    <span>
                      {v.seniority}, {v.meetingLengthMin}+ min
                    </span>
                  </FurnishFocus>
                  <FurnishFocus
                    persona="worker"
                    n={8}
                    label="Meetings remaining peek"
                    onFocus={focusFurnish(8)}
                  >
                    <span>{v.meetingsRemaining} left</span>
                  </FurnishFocus>
                  <FurnishFocus
                    persona="worker"
                    n={9}
                    label="Client entity peek"
                    onFocus={focusFurnish(9)}
                  >
                    <span>{v.company}</span>
                  </FurnishFocus>
                </div>
                <FurnishFocus
                  persona="worker"
                  n={6}
                  label="Prepared by"
                  onFocus={focusFurnish(6)}
                  style={{ marginTop: 2 }}
                >
                  <div className="text-[11px]" style={{ color: loFi.muted }}>
                    {v.preparedBy}
                  </div>
                </FurnishFocus>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <LoFiButton onClick={() => onPickUp(v.id)}>Pick up</LoFiButton>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<button type="button" style={quietTriggerStyle(loFi.label)} />}
                  >
                    More
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-40">
                    <DropdownMenuItem onClick={() => onOpenDetails(v.id)}>
                      Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenFirms(v.id)}>Firms</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenTalk}>Talk tracks</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenHistory(v.id)}>
                      History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onPin(pinnedId === v.id ? null : v.id)}
                    >
                      {pinnedId === v.id ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            </HolonBoundary>
          );
        })
      ) : (
        <FurnishFocus
          persona="worker"
          n={13}
          label="Empty queue copy"
          onFocus={focusFurnish(13)}
          style={{ display: "block", width: "100%" }}
        >
          <Empty className="border-0 py-6">
            <EmptyHeader>
              <EmptyTitle>
                {hasClaim ? "Pool is dry" : "Nothing available"}
              </EmptyTitle>
              <EmptyDescription>
                {hasClaim
                  ? "You hold a claim. Release to see the pool again."
                  : "Launched vessels appear here."}
                {lastPickAt ? ` Last pick · ${lastPickAt}.` : ""}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </FurnishFocus>
      )}
    </LoFiPanel>
    </HolonBoundary>
  );
}
