import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { BC_CT } from "@/app/register/holons/registerCtHolons";
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
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { FurnishFocus } from "../FurnishFocus";
import {
  companyInitial,
  deskTodayKey,
  downloadText,
  filterMeetings,
  groupMeetings,
  MEETING_FILTER_LABELS,
  meetingIcs,
  quietTriggerStyle,
  SAVED_VIEWS_KEY,
  stakeAmount,
  statusChip,
  weekStripDays,
} from "./helpers";
import type { BookedMeeting, MeetingFilter, TimeMode } from "./types";

export type MeetingsViewProps = {
  meetings: BookedMeeting[];
  filter: MeetingFilter;
  onFilter: (filter: MeetingFilter) => void;
  vesselPrice: number;
  timeMode: TimeMode;
  onTimeMode: (mode: TimeMode) => void;
  onOpenMeeting: (id: string) => void;
  reviewedIds: Set<string>;
  onToggleReviewed: (id: string) => void;
  /** Optional vessel name shown under panel title */
  caption?: string;
};

type SavedView = { name: string; filter: MeetingFilter };

const FILTER_IDS: MeetingFilter[] = [
  "all",
  "upcoming",
  "pending",
  "disputed",
  "released",
  "this-week",
  "needs-you",
];

function loadSavedViews(): SavedView[] {
  try {
    const raw = localStorage.getItem(SAVED_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedView[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSavedViews(views: SavedView[]) {
  try {
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views));
  } catch {
    /* local only */
  }
}

function dayLabel(dayKey: string, anchorKey: string) {
  const d = new Date(dayKey.replace(/-/g, "/"));
  const short = d.toLocaleDateString(undefined, { weekday: "short" });
  const num = d.getDate();
  if (dayKey === anchorKey) return "Today";
  return `${short} ${num}`;
}

export function MeetingsView({
  meetings,
  filter,
  onFilter,
  vesselPrice,
  timeMode,
  onTimeMode,
  onOpenMeeting,
  reviewedIds,
  onToggleReviewed,
  caption,
}: MeetingsViewProps) {
  const loFi = useDeskPalette();
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => loadSavedViews());
  const [saveFlash, setSaveFlash] = useState(false);

  const anchorKey = useMemo(() => deskTodayKey(meetings), [meetings]);
  const weekDays = useMemo(() => weekStripDays(anchorKey), [anchorKey]);
  const meetingDays = useMemo(() => new Set(meetings.map((m) => m.dayKey)), [meetings]);

  const pendingCount = meetings.filter((m) => m.status === "pending").length;
  const disputedCount = meetings.filter((m) => m.status === "disputed").length;

  const filtered = useMemo(
    () => filterMeetings(meetings, filter, anchorKey),
    [meetings, filter, anchorKey],
  );
  const groups = useMemo(() => groupMeetings(filtered), [filtered]);

  const releasedFiltered = filtered.filter((m) => m.status === "released");
  const allReleasedReviewed =
    releasedFiltered.length > 0 &&
    releasedFiltered.every((m) => reviewedIds.has(m.id));

  const emptyTitle =
    filter === "needs-you"
      ? "Nothing needs you"
      : filter === "this-week"
        ? "No meetings this week"
        : filter === "all"
          ? "No meetings yet"
          : `No ${MEETING_FILTER_LABELS[filter].toLowerCase()} meetings`;

  const saveCurrentView = () => {
    const name = MEETING_FILTER_LABELS[filter];
    const next = savedViews.filter((v) => v.filter !== filter);
    next.unshift({ name, filter });
    setSavedViews(next.slice(0, 6));
    persistSavedViews(next.slice(0, 6));
    setSaveFlash(true);
    window.setTimeout(() => setSaveFlash(false), 1200);
  };

  const headerAction = (
    <div className="flex flex-wrap items-center gap-1.5">
      {FILTER_IDS.map((id) => {
        const btn = (
          <LoFiButton
            key={id}
            variant={filter === id ? "ghost" : "quiet"}
            onClick={() => onFilter(id)}
          >
            {MEETING_FILTER_LABELS[id]}
          </LoFiButton>
        );
        if (id === "this-week" || id === "needs-you") {
          return (
            <FurnishFocus key={id} persona="bc" n={38} label="Smart filters: This week / Needs you">
              {btn}
            </FurnishFocus>
          );
        }
        return btn;
      })}
      <FurnishFocus persona="bc" n={43} label="Relative vs absolute time toggle">
        <LoFiButton
          variant="quiet"
          onClick={() => onTimeMode(timeMode === "relative" ? "absolute" : "relative")}
        >
          {timeMode === "relative" ? "Relative" : "Absolute"}
        </LoFiButton>
      </FurnishFocus>
      <FurnishFocus persona="bc" n={83} label="Local saved views for Meetings filters">
        <DropdownMenu>
          <DropdownMenuTrigger render={<button type="button" style={quietTriggerStyle(loFi.label)} />}>
            Views
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem onClick={saveCurrentView}>
              {saveFlash ? "Saved" : "Save current filter"}
            </DropdownMenuItem>
            {savedViews.length > 0 ? <DropdownMenuSeparator /> : null}
            {savedViews.map((v) => (
              <DropdownMenuItem key={v.filter} onClick={() => onFilter(v.filter)}>
                {v.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </FurnishFocus>
    </div>
  );

  return (
    <HolonBoundary id={BC_CT.meetings.id} label={BC_CT.meetings.label} t={light}>
    <LoFiPanel title="Meetings" caption={caption} headerAction={headerAction}>
      {(pendingCount > 0 || disputedCount > 0) && (
        <FurnishFocus
          persona="bc"
          n={40}
          label="Sticky count header: Pending N · Disputed M"
          style={{ display: "block", width: "100%" }}
        >
        <div
          className="sticky top-0 z-10 -mx-4 -mt-4 mb-2 border-b px-4 py-2 text-xs font-medium"
          style={{
            background: loFi.chrome,
            borderColor: loFi.stroke,
            color: loFi.label,
          }}
        >
          Pending {pendingCount} · Disputed {disputedCount}
        </div>
        </FurnishFocus>
      )}

      <FurnishFocus
        persona="bc"
        n={37}
        label="Calendar week strip above the list"
        style={{ display: "block", width: "100%" }}
      >
      <div className="flex gap-1">
        {weekDays.map((dayKey) => {
          const hasDot = meetingDays.has(dayKey);
          const isToday = dayKey === anchorKey;
          return (
            <div
              key={dayKey}
              className="flex flex-1 flex-col items-center gap-1 rounded-md py-2 text-[10px]"
              style={{
                background: isToday ? loFi.block : "transparent",
                color: isToday ? loFi.ink : loFi.muted,
              }}
            >
              <span>{dayLabel(dayKey, anchorKey)}</span>
              <span
                className="size-1.5 rounded-full"
                style={{
                  background: hasDot ? loFi.ink : "transparent",
                  opacity: hasDot ? 1 : 0,
                }}
              />
            </div>
          );
        })}
      </div>
      </FurnishFocus>

      {filter === "released" && releasedFiltered.length > 0 ? (
        <FurnishFocus
          persona="bc"
          n={39}
          label="Bulk mark-reviewed for released"
          style={{ display: "block", width: "100%" }}
        >
        <label
          className="flex items-center gap-2 text-xs"
          style={{ color: loFi.label }}
        >
          <input
            type="checkbox"
            checked={allReleasedReviewed}
            onChange={() => {
              for (const m of releasedFiltered) {
                if (allReleasedReviewed) {
                  if (reviewedIds.has(m.id)) onToggleReviewed(m.id);
                } else if (!reviewedIds.has(m.id)) {
                  onToggleReviewed(m.id);
                }
              }
            }}
          />
          Mark all released as reviewed
        </label>
        </FurnishFocus>
      ) : null}

      {filtered.length === 0 ? (
        <FurnishFocus
          persona="bc"
          n={41}
          label="Empty state per filter with quiet Clear filter"
          style={{ display: "block", width: "100%" }}
        >
        <Empty className="border-0 py-6">
          <EmptyHeader>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>
              {filter === "all"
                ? "Booked meetings show up in this list."
                : "Try another filter or clear this one."}
            </EmptyDescription>
          </EmptyHeader>
          {filter !== "all" ? (
            <LoFiButton variant="quiet" onClick={() => onFilter("all")}>
              Clear filter
            </LoFiButton>
          ) : null}
        </Empty>
        </FurnishFocus>
      ) : (
        <FurnishFocus
          persona="bc"
          n={33}
          label="Default sort: pending release first"
          style={{ display: "block", width: "100%" }}
        >
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col">
            <FurnishFocus
              persona="bc"
              n={45}
              label="Soft group headers: Today / Tomorrow / Earlier"
              style={{ display: "block", width: "100%" }}
            >
            <div
              className="py-2 text-[11px] font-medium"
              style={{ color: loFi.muted }}
            >
              {group.label}
            </div>
            </FurnishFocus>
            {group.items.map((m) => {
              const stake = stakeAmount(m.status, vesselPrice);
              const whenLabel =
                timeMode === "relative" ? m.whenRelative : m.whenAbsolute;
              return (
                <HolonBoundary
                  key={m.id}
                  id={BC_CT.meetingRow.id}
                  label={BC_CT.meetingRow.label}
                  t={light}
                  style={{ borderBottom: `1px solid ${loFi.stroke}` }}
                >
                <div className="flex items-center gap-2 py-2.5">
                  {m.status === "released" ? (
                    <input
                      type="checkbox"
                      className="shrink-0"
                      checked={reviewedIds.has(m.id)}
                      onChange={() => onToggleReviewed(m.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Reviewed meeting ${m.number}`}
                    />
                  ) : (
                    <span className="w-3.5 shrink-0" />
                  )}
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: loFi.ink,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    onClick={() => onOpenMeeting(m.id)}
                  >
                    <FurnishFocus persona="bc" n={42} label="Meeting row favicon / company chip">
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-semibold"
                        style={{ background: loFi.block, color: loFi.ink }}
                      >
                        {companyInitial(m.company)}
                      </span>
                    </FurnishFocus>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium">{m.who}</span>
                        <FurnishFocus persona="bc" n={34} label="Escrow fate chip">
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal">
                            {statusChip(m.status)}
                          </Badge>
                        </FurnishFocus>
                        {stake != null ? (
                          <FurnishFocus persona="bc" n={35} label="$ at stake">
                            <span className="text-[10px]" style={{ color: loFi.label }}>
                              ${stake}
                            </span>
                          </FurnishFocus>
                        ) : null}
                        <FurnishFocus persona="bc" n={36} label="Seniority match vs miss">
                          <Badge
                            variant={m.fitSeniority ? "secondary" : "destructive"}
                            className="h-5 px-1.5 text-[10px] font-normal"
                          >
                            {m.fitSeniority ? "Seniority ok" : "Seniority miss"}
                          </Badge>
                        </FurnishFocus>
                      </div>
                      <div className="text-xs" style={{ color: loFi.label }}>
                        {m.company} · {whenLabel}
                      </div>
                    </div>
                  </button>
                  <FurnishFocus persona="bc" n={44} label="Drag to calendar .ics download per row">
                    <LoFiButton
                      variant="quiet"
                      onClick={() =>
                        downloadText(`meeting-${m.number}.ics`, meetingIcs(m))
                      }
                    >
                      .ics
                    </LoFiButton>
                  </FurnishFocus>
                </div>
                </HolonBoundary>
              );
            })}
          </div>
        ))}
        </FurnishFocus>
      )}
    </LoFiPanel>
    </HolonBoundary>
  );
}
