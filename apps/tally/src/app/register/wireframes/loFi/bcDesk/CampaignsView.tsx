/**
 * Business Client — Campaigns strip (furnishing items 1–17).
 * Densifies vessel rows; parent owns state via callbacks.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { useDocsHighlight } from "@/app/context/DocsHighlightContext";
import { useDocsRegistry } from "@/app/context/DocsRegistryContext";
import { HOLON_INSPECT_ID_ATTR } from "@/app/components/docs/docsHighlight";
import { BC_CT } from "@/app/register/holons/registerCtHolons";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { Input } from "@/components/ui/input";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { quietTriggerStyle, sortVessels, stateLabel } from "./helpers";
import type { Vessel, VesselState } from "./types";

const EMPTY_FURNISH_N = 12;
const EMPTY_FURNISH_ID = furnishFocusId("bc", EMPTY_FURNISH_N);

function focusSelf(n: number) {
  return () => {
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[${HOLON_INSPECT_ID_ATTR}="${furnishFocusId("bc", n)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
}

export type RequestedVessel = {
  id: string;
  note: string;
  at: string;
};

export type CampaignsViewProps = {
  vessels: Vessel[];
  pinnedVesselId: string | null;
  showArchived: boolean;
  requestedVessels: RequestedVessel[];
  onFund: (vesselId: string) => void;
  onReviewTerms: (vesselId: string) => void;
  onDecline: (vesselId: string) => void;
  onOpenMeetings: (vesselId: string) => void;
  onOpenFirms: (vesselId: string) => void;
  onOpenDetails: (vesselId: string) => void;
  onOpenTalk: (vesselId: string) => void;
  onOpenAlerts: (vesselId: string) => void;
  onOpenHistory: (vesselId: string) => void;
  onPause: (vesselId: string) => void;
  onOpenStop: (vesselId: string) => void;
  onPinVessel: (vesselId: string | null) => void;
  onToggleShowArchived: (show: boolean) => void;
  onRequestVessel: (note: string) => void;
  onActivateVessel: (vesselId: string) => void;
};

function stateDotColor(state: VesselState, loFi: ReturnType<typeof useDeskPalette>) {
  if (state === "running") return loFi.ink;
  if (state === "held") return loFi.label;
  if (state === "invited") return loFi.muted;
  if (state === "paused") return "#b45309";
  if (state === "stopped") return "#991b1b";
  return loFi.muted;
}

function hoverPeek(v: Vessel) {
  const parts: string[] = [];
  if (v.nextMeetingPeek) parts.push(`Next: ${v.nextMeetingPeek}`);
  if (v.reclaimDaysLeft > 0 && v.state !== "reclaimed") {
    parts.push(`Reclaim in ${v.reclaimDaysLeft}d`);
  } else if (v.state !== "reclaimed" && v.reclaimDaysLeft <= 0) {
    parts.push("Reclaim available");
  }
  return parts.join(" · ") || undefined;
}

function activateThen(fn: (id: string) => void, onActivate: (id: string) => void) {
  return (id: string) => {
    onActivate(id);
    fn(id);
  };
}

export function CampaignsView({
  vessels,
  pinnedVesselId,
  showArchived,
  requestedVessels,
  onFund,
  onReviewTerms,
  onDecline,
  onOpenMeetings,
  onOpenFirms,
  onOpenDetails,
  onOpenTalk,
  onOpenAlerts,
  onOpenHistory,
  onPause,
  onOpenStop,
  onPinVessel,
  onToggleShowArchived,
  onRequestVessel,
  onActivateVessel,
}: CampaignsViewProps) {
  const loFi = useDeskPalette();
  const { hoveredComponentIds } = useDocsHighlight();
  const { registerFocus, unregisterFocus } = useDocsRegistry();
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [viewersOpenId, setViewersOpenId] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(0);
  /** Keep empty copy on screen after a taxonomy click until dismissed. */
  const [emptyPreviewSticky, setEmptyPreviewSticky] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const base = showArchived ? vessels : vessels.filter((v) => !v.archived);
    const sorted = sortVessels(base);
    if (!pinnedVesselId) return sorted;
    const pinned = sorted.find((v) => v.id === pinnedVesselId);
    if (!pinned) return sorted;
    return [pinned, ...sorted.filter((v) => v.id !== pinnedVesselId)];
  }, [vessels, showArchived, pinnedVesselId]);

  const onlyInvited =
    visible.length > 0 && visible.every((v) => v.state === "invited");
  const empty = visible.length === 0;
  /** Empty-state furniture (#12) is unmounted while the seeded list has vessels. */
  const showEmptyPreview =
    empty ||
    emptyPreviewSticky ||
    hoveredComponentIds.includes(EMPTY_FURNISH_ID);

  const revealEmptyCopy = useCallback(() => {
    setEmptyPreviewSticky(true);
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        document
          .querySelector(`[${HOLON_INSPECT_ID_ATTR}="${EMPTY_FURNISH_ID}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 40);
    });
  }, []);

  useLayoutEffect(() => {
    if (showEmptyPreview) return;
    registerFocus(EMPTY_FURNISH_ID, revealEmptyCopy);
    return () => unregisterFocus(EMPTY_FURNISH_ID);
  }, [showEmptyPreview, registerFocus, unregisterFocus, revealEmptyCopy]);

  useEffect(() => {
    setHighlightIndex((i) => Math.min(i, Math.max(0, visible.length - 1)));
  }, [visible.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (visible.length === 0) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "j") {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, visible.length - 1));
      } else if (e.key === "k") {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const v = visible[highlightIndex];
        if (v && v.state !== "invited") {
          activateThen(onOpenMeetings, onActivateVessel)(v.id);
        }
      }
    },
    [visible, highlightIndex, onOpenMeetings, onActivateVessel],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const submitRequest = () => {
    const note = requestNote.trim();
    if (!note) return;
    onRequestVessel(note);
    setRequestNote("");
    setRequestOpen(false);
  };

  return (
    <HolonBoundary id={BC_CT.campaigns.id} label={BC_CT.campaigns.label} t={light}>
    <LoFiPanel
      title="My campaigns"
      headerAction={
        <FurnishFocus
          persona="bc"
          n={11}
          label="Archive filter"
          onFocus={focusSelf(11)}
          style={{ flexWrap: "wrap", gap: 8 }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <LoFiButton variant="quiet" onClick={() => onToggleShowArchived(!showArchived)}>
              {showArchived ? "Hide archived" : "Show archived"}
            </LoFiButton>
            <FurnishFocus
              persona="bc"
              n={13}
              label="Request next vessel"
              onFocus={focusSelf(13)}
            >
              <LoFiButton variant="ghost" onClick={() => setRequestOpen((o) => !o)}>
                Request next vessel
              </LoFiButton>
            </FurnishFocus>
          </div>
        </FurnishFocus>
      }
    >
      {requestOpen ? (
        <FurnishFocus
          persona="bc"
          n={13}
          label="Request next vessel form"
          onFocus={focusSelf(13)}
          style={{ display: "block", width: "100%" }}
        >
          <div
            className="mb-3 flex flex-col gap-2 border-b pb-3"
            style={{ borderColor: loFi.stroke }}
          >
            <div className="text-xs font-medium" style={{ color: loFi.label }}>
              Request next vessel
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Company or angle (one line)"
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRequest();
                }}
              />
              <LoFiButton disabled={!requestNote.trim()} onClick={submitRequest}>
                Send
              </LoFiButton>
            </div>
          </div>
        </FurnishFocus>
      ) : null}

      {requestedVessels.length > 0 ? (
        <FurnishFocus
          persona="bc"
          n={13}
          label="Requested vessels tray"
          onFocus={focusSelf(13)}
          style={{ display: "block", width: "100%" }}
        >
          <div
            className="mb-3 border-b pb-3"
            style={{ borderColor: loFi.stroke }}
          >
            <div className="mb-1.5 text-[11px] font-medium" style={{ color: loFi.label }}>
              Requested
            </div>
            <ul className="flex flex-col gap-1">
              {requestedVessels.map((r) => (
                <li key={r.id} className="text-xs" style={{ color: loFi.ink }}>
                  <span className="font-medium">{r.note}</span>
                  <span style={{ color: loFi.muted }}> · {r.at}</span>
                </li>
              ))}
            </ul>
          </div>
        </FurnishFocus>
      ) : null}

      {showEmptyPreview ? (
        <FurnishFocus
          persona="bc"
          n={EMPTY_FURNISH_N}
          label="Empty campaigns copy"
          onFocus={revealEmptyCopy}
          style={{ display: "block", width: "100%" }}
        >
          <Empty className="border-0 py-6">
            <EmptyHeader>
              <EmptyTitle>
                {empty && showArchived && vessels.some((v) => v.archived)
                  ? "No active vessels"
                  : "No campaigns yet"}
              </EmptyTitle>
              <EmptyDescription>
                {onlyInvited || (!empty && emptyPreviewSticky)
                  ? "Invited vessels appear here after Operator sends terms."
                  : "Operator invites show up here. Fund to launch meetings."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
          {!empty ? (
            <div className="flex flex-col gap-2 pb-3">
              <div
                className="rounded-md px-3 py-2 text-[11px]"
                style={{ background: loFi.block, color: loFi.label }}
              >
                Empty copy variants (taxonomy preview). Never invited vs invited only
                use the same Empty module with different strings.
              </div>
              <LoFiButton variant="quiet" onClick={() => setEmptyPreviewSticky(false)}>
                Show vessels again
              </LoFiButton>
            </div>
          ) : null}
        </FurnishFocus>
      ) : onlyInvited ? (
        <p className="mb-2 text-xs" style={{ color: loFi.label }}>
          Invited only — fund one to start meetings.
        </p>
      ) : null}

      {!showEmptyPreview ? (
      <FurnishFocus
        persona="bc"
        n={9}
        label="Multi-vessel sort order"
        onFocus={focusSelf(9)}
        style={{ display: "block", width: "100%" }}
      >
      <FurnishFocus
        persona="bc"
        n={17}
        label="Keyboard: j/k move, Enter opens Meetings"
        onFocus={focusSelf(17)}
        style={{ display: "block", width: "100%" }}
      >
      <div ref={listRef} className="flex flex-col">
        {visible.map((v, index) => {
          const highlighted = index === highlightIndex;
          const peek = hoverPeek(v);
          const isPinned = pinnedVesselId === v.id;

          return (
            <HolonBoundary
              key={v.id}
              id={BC_CT.vesselRow.id}
              label={BC_CT.vesselRow.label}
              t={light}
              style={{
                borderBottom: `1px solid ${loFi.stroke}`,
              }}
            >
            <div
              title={peek}
              className="flex flex-wrap items-start justify-between gap-3 py-3 w-full"
              style={{
                background: highlighted ? loFi.block : "transparent",
                borderRadius: highlighted ? 4 : 0,
                paddingLeft: highlighted ? 6 : 0,
                paddingRight: highlighted ? 6 : 0,
              }}
            >
              <div className="flex min-w-0 flex-1 gap-2.5">
                <FurnishFocus
                  persona="bc"
                  n={14}
                  label="Company logo chip"
                  onFocus={focusSelf(14)}
                >
                  <div
                    className="flex size-8 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                    style={{
                      background: loFi.block,
                      color: loFi.ink,
                      border: `1px solid ${loFi.stroke}`,
                    }}
                    title="Operator enrich"
                  >
                    {v.logoMark}
                  </div>
                </FurnishFocus>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{v.name}</span>
                    {isPinned ? (
                      <FurnishFocus
                        persona="bc"
                        n={10}
                        label="Primary pin"
                        onFocus={focusSelf(10)}
                      >
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Primary
                        </Badge>
                      </FurnishFocus>
                    ) : null}
                    <FurnishFocus
                      persona="bc"
                      n={2}
                      label="Booked/N chip"
                      onFocus={focusSelf(2)}
                    >
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                        {v.bookedCount}/{v.target}
                      </Badge>
                    </FurnishFocus>
                    {v.rulesLocked ? (
                      <FurnishFocus
                        persona="bc"
                        n={4}
                        label="Rules locked lock"
                        onFocus={focusSelf(4)}
                      >
                        <button
                          type="button"
                          title="Rules locked — open details"
                          onClick={() =>
                            activateThen(onOpenDetails, onActivateVessel)(v.id)
                          }
                          className="inline-flex items-center gap-1 text-[10px]"
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            cursor: "pointer",
                            color: loFi.muted,
                            fontFamily: "inherit",
                          }}
                        >
                          <Lock size={12} strokeWidth={2.5} />
                          Locked
                        </button>
                      </FurnishFocus>
                    ) : null}
                  </div>

                  <div
                    className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs"
                    style={{ color: loFi.label }}
                  >
                    <FurnishFocus
                      persona="bc"
                      n={5}
                      label="State color language"
                      onFocus={focusSelf(5)}
                    >
                      <span
                        className="inline-block size-1.5 shrink-0 rounded-full"
                        style={{ background: stateDotColor(v.state, loFi) }}
                      />
                      <span>{stateLabel(v.state)}</span>
                    </FurnishFocus>
                    <FurnishFocus
                      persona="bc"
                      n={1}
                      label="Last touched time"
                      onFocus={focusSelf(1)}
                    >
                      <span style={{ color: loFi.muted }}>· {v.lastTouched}</span>
                    </FurnishFocus>
                  </div>

                  <FurnishFocus
                    persona="bc"
                    n={6}
                    label="Money at a glance"
                    onFocus={focusSelf(6)}
                    style={{ display: "block", marginTop: 4 }}
                  >
                    <div className="text-[11px]" style={{ color: loFi.label }}>
                      Held ${v.heldAtGlance.toLocaleString()} · Released $
                      {v.releasedAtGlance.toLocaleString()}
                    </div>
                  </FurnishFocus>

                  <FurnishFocus
                    persona="bc"
                    n={3}
                    label="Operator name and avatar"
                    onFocus={focusSelf(3)}
                    style={{ display: "block", marginTop: 4 }}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span
                        className="inline-flex size-5 items-center justify-center rounded-full text-[9px] font-semibold"
                        style={{
                          background: loFi.ink,
                          color: loFi.white,
                        }}
                      >
                        {v.operatorInitials}
                      </span>
                      <span style={{ color: loFi.label }}>{v.operatorName}</span>
                    </div>
                  </FurnishFocus>

                  <FurnishFocus
                    persona="bc"
                    n={15}
                    label="Prepared by"
                    onFocus={focusSelf(15)}
                    style={{ display: "block", marginTop: 4 }}
                  >
                    <div className="text-[11px]" style={{ color: loFi.muted }}>
                      {v.preparedBy}
                    </div>
                  </FurnishFocus>

                  <div
                    className="mt-1 flex flex-wrap gap-x-2 text-[11px]"
                    style={{ color: loFi.label }}
                  >
                    {v.nextMeetingPeek ? (
                      <FurnishFocus
                        persona="bc"
                        n={7}
                        label="Next meeting peek"
                        onFocus={focusSelf(7)}
                      >
                        <span>Next: {v.nextMeetingPeek}</span>
                      </FurnishFocus>
                    ) : null}
                    <FurnishFocus
                      persona="bc"
                      n={8}
                      label="Reclaim window peek"
                      onFocus={focusSelf(8)}
                    >
                      <span>
                        {v.reclaimDaysLeft > 0 && v.state !== "reclaimed"
                          ? `Reclaim in ${v.reclaimDaysLeft}d`
                          : v.state !== "reclaimed"
                            ? "Reclaim available"
                            : null}
                      </span>
                    </FurnishFocus>
                  </div>

                  {v.accessViewers.length > 0 ? (
                    <FurnishFocus
                      persona="bc"
                      n={16}
                      label="Share viewers tray"
                      onFocus={focusSelf(16)}
                      style={{ display: "block", marginTop: 4 }}
                    >
                      <div>
                        <button
                          type="button"
                          style={quietTriggerStyle(loFi.label)}
                          onClick={() =>
                            setViewersOpenId((id) => (id === v.id ? null : v.id))
                          }
                        >
                          {viewersOpenId === v.id
                            ? "Hide viewers"
                            : `${v.accessViewers.length} viewer${v.accessViewers.length === 1 ? "" : "s"}`}
                        </button>
                        {viewersOpenId === v.id ? (
                          <ul className="mt-1 text-[11px]" style={{ color: loFi.muted }}>
                            {v.accessViewers.map((viewer) => (
                              <li key={viewer}>{viewer}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </FurnishFocus>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <LoFiButton
                  variant="quiet"
                  onClick={() =>
                    onPinVessel(isPinned ? null : v.id)
                  }
                >
                  {isPinned ? "Unpin" : "Pin"}
                </LoFiButton>

                {v.state === "invited" ? (
                  <>
                    <LoFiButton
                      onClick={() => activateThen(onFund, onActivateVessel)(v.id)}
                    >
                      Fund
                    </LoFiButton>
                    <LoFiButton
                      variant="quiet"
                      onClick={() =>
                        activateThen(onReviewTerms, onActivateVessel)(v.id)
                      }
                    >
                      Review terms
                    </LoFiButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<button type="button" style={quietTriggerStyle(loFi.label)} />}
                      >
                        More
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuItem
                          onClick={() =>
                          activateThen(onOpenDetails, onActivateVessel)(v.id)
                        }
                        >
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDecline(v.id)}>
                          Decline
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <LoFiButton
                      variant="ghost"
                      onClick={() =>
                        activateThen(onOpenMeetings, onActivateVessel)(v.id)
                      }
                    >
                      Open
                    </LoFiButton>
                    <LoFiButton
                      variant="quiet"
                      onClick={() => activateThen(onOpenFirms, onActivateVessel)(v.id)}
                    >
                      Firms
                    </LoFiButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<button type="button" style={quietTriggerStyle(loFi.label)} />}
                      >
                        More
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-40">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() =>
                          activateThen(onOpenDetails, onActivateVessel)(v.id)
                        }
                          >
                            Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              activateThen(onOpenTalk, onActivateVessel)(v.id)
                            }
                          >
                            Talk tracks
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              activateThen(onOpenAlerts, onActivateVessel)(v.id)
                            }
                          >
                            Alerts
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              activateThen(onOpenHistory, onActivateVessel)(v.id)
                            }
                          >
                            History
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            disabled={v.state === "paused" || v.state === "reclaimed"}
                            onClick={() => activateThen(onPause, onActivateVessel)(v.id)}
                          >
                            Pause
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={v.state === "reclaimed"}
                            onClick={() =>
                              activateThen(onOpenStop, onActivateVessel)(v.id)
                            }
                          >
                            Stop
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
            </HolonBoundary>
          );
        })}
      </div>
      </FurnishFocus>
      </FurnishFocus>
      ) : null}
    </LoFiPanel>
    </HolonBoundary>
  );
}
