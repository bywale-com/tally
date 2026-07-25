/**
 * Operator — Campaigns list (furnishing items 1–16, 25–30, 79, 83).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { OP_CT } from "../../../holons/registerCtHolons";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { useDeskPalette } from "../DeskPaletteContext";
import {
  lastHistoryPeek,
  nextActionPeek,
  quietTriggerStyle,
  sortCampaigns,
  stateLabel,
} from "./helpers";
import type { OpCampaign, OpCampaignState, SentInvite } from "./types";

function focusSelf(n: number) {
  return () => {
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-holon-id="${furnishFocusId("op", n)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
}

export type CampaignsListViewProps = {
  rows: OpCampaign[];
  activeCampaignId: string | null;
  pinnedId: string | null;
  showArchived: boolean;
  filterQuery: string;
  sentInvites: SentInvite[];
  onFilterQueryChange: (q: string) => void;
  onToggleShowArchived: (show: boolean) => void;
  onPin: (id: string | null) => void;
  onOpenCreate: () => void;
  onOpenCampaign: (id: string) => void;
  onOpenDetails: (id: string) => void;
  onOpenHistory: (id: string) => void;
  onOpenInviteHistory: () => void;
  onArchive: (id: string) => void;
  onDuplicate: (name: string) => void;
  onListInviteGuest?: () => void;
  onListInviteExisting?: () => void;
  onShowClientFund?: () => void;
  showWaitStatus?: boolean;
  showInviteMenu?: boolean;
  dimmed?: boolean;
};

function stateDot(state: OpCampaignState, loFi: ReturnType<typeof useDeskPalette>) {
  if (state === "running") return loFi.ink;
  if (state === "invited") return loFi.label;
  if (state === "enrich") return loFi.muted;
  if (state === "evaluate") return loFi.muted;
  if (state === "paused") return "#b45309";
  return loFi.muted;
}

function CompanyChip({ initials }: { initials: string }) {
  const loFi = useDeskPalette();
  return (
    <span
      className="inline-flex size-5 shrink-0 items-center justify-center rounded text-[9px] font-bold"
      style={{ background: loFi.ink, color: loFi.white }}
    >
      {initials}
    </span>
  );
}

export function CampaignsListView({
  rows,
  activeCampaignId,
  pinnedId,
  showArchived,
  filterQuery,
  sentInvites,
  onFilterQueryChange,
  onToggleShowArchived,
  onPin,
  onOpenCreate,
  onOpenCampaign,
  onOpenDetails,
  onOpenHistory,
  onOpenInviteHistory,
  onArchive,
  onDuplicate,
  onListInviteGuest,
  onListInviteExisting,
  onShowClientFund,
  showWaitStatus,
  showInviteMenu,
  dimmed,
}: CampaignsListViewProps) {
  const loFi = useDeskPalette();
  const [highlightIndex, setHighlightIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    let base = showArchived ? rows : rows.filter((r) => !r.archived);
    if (q) base = base.filter((r) => r.name.toLowerCase().includes(q));
    const sorted = sortCampaigns(base);
    if (!pinnedId) return sorted;
    const pinned = sorted.find((r) => r.id === pinnedId);
    if (!pinned) return sorted;
    return [pinned, ...sorted.filter((r) => r.id !== pinnedId)];
  }, [rows, showArchived, filterQuery, pinnedId]);

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
        const row = visible[highlightIndex];
        if (row && !row.sample) onOpenCampaign(row.id);
      }
    },
    [visible, highlightIndex, onOpenCampaign],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const empty = visible.length === 0;

  return (
    <HolonBoundary
      id={OP_CT.campaigns.id}
      label={OP_CT.campaigns.label}
      parentId={OP_CT.desk.id}
      order={1}
      t={light}
      style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column" }}
    >
    <div
      ref={listRef}
      className="flex min-h-0 flex-1 flex-col"
      style={{
        background: loFi.frame,
        border: `1px solid ${loFi.stroke}`,
        borderRadius: 8,
        overflow: "visible",
        opacity: dimmed ? 0.55 : 1,
        pointerEvents: dimmed ? "none" : "auto",
        position: "relative",
      }}
    >
      <div
        className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-3"
        style={{ background: loFi.chrome, borderColor: loFi.stroke }}
      >
        <span className="text-sm font-semibold">Campaigns</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <FurnishFocus persona="op" n={29} label="Search campaigns" onFocus={focusSelf(29)}>
            <Input
              className="h-7 w-32 text-xs"
              placeholder="Search…"
              value={filterQuery}
              onChange={(e) => onFilterQueryChange(e.target.value)}
            />
          </FurnishFocus>
          <FurnishFocus persona="op" n={9} label="Archive filter" onFocus={focusSelf(9)}>
            <button
              type="button"
              onClick={() => onToggleShowArchived(!showArchived)}
              style={quietTriggerStyle(loFi.label)}
            >
              {showArchived ? "Hide archived" : "Show archived"}
            </button>
          </FurnishFocus>
          <LoFiButton onClick={onOpenCreate}>Create</LoFiButton>
        </div>
      </div>

      {sentInvites.length > 0 ? (
        <FurnishFocus
          persona="op"
          n={83}
          label="Sent invites tray"
          onFocus={focusSelf(83)}
          style={{ display: "flex", flexWrap: "wrap" }}
        >
        <div
          className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2 text-xs"
          style={{ borderColor: loFi.stroke, color: loFi.label }}
        >
          <span className="font-medium">Sent invites</span>
          {sentInvites.slice(0, 3).map((inv) => (
            <FurnishFocus
              key={inv.id}
              persona="op"
              n={75}
              label="Sent log entry"
              onFocus={focusSelf(75)}
            >
              <Badge variant="secondary" className="text-[10px]">
                {inv.to} · {inv.status}
              </Badge>
            </FurnishFocus>
          ))}
          <button type="button" onClick={onOpenInviteHistory} style={quietTriggerStyle(loFi.label)}>
            All
          </button>
        </div>
        </FurnishFocus>
      ) : null}

      <div className="min-h-[120px] flex-1 overflow-auto px-4 py-2">
        {empty ? (
          <Empty className="border-0 py-8">
            <EmptyHeader>
              <EmptyTitle>No campaigns yet</EmptyTitle>
              <EmptyDescription>Create a campaign to start evaluate.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          visible.map((row, idx) => {
            const isActive = row.id === activeCampaignId;
            const isHighlight = idx === highlightIndex;
            const peek = nextActionPeek(row);
            const histPeek = lastHistoryPeek(row);
            const canOpen = !row.sample;

            return (
              <HolonBoundary
                key={row.id}
                id={OP_CT.campaignRow.id}
                label={OP_CT.campaignRow.label}
                parentId={OP_CT.campaigns.id}
                order={idx}
                t={light}
                style={{
                  borderBottom: `1px solid ${loFi.stroke}`,
                  background: isHighlight ? loFi.block : "transparent",
                }}
              >
              <div
                className="group relative py-2 last:border-b-0"
                title={[peek, histPeek].filter(Boolean).join("\n")}
              >
                <div className="flex items-start gap-2">
                  <FurnishFocus
                    persona="op"
                    n={2}
                    label="Stage chip"
                    onFocus={focusSelf(2)}
                    style={{ alignItems: "flex-start", gap: 8 }}
                  >
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{ background: stateDot(row.state, loFi) }}
                    />
                  </FurnishFocus>
                  <button
                    type="button"
                    disabled={!canOpen}
                    onClick={() => canOpen && onOpenCampaign(row.id)}
                    className="min-w-0 flex-1 text-left"
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: canOpen ? "pointer" : "default",
                      fontFamily: "inherit",
                      opacity: row.sample ? 0.72 : 1,
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: loFi.ink }}>
                        {row.name}
                      </span>
                      {isActive ? (
                        <Badge variant="outline" className="text-[10px]">
                          Active
                        </Badge>
                      ) : null}
                      <FurnishFocus
                        persona="op"
                        n={2}
                        label="Stage chip"
                        onFocus={focusSelf(2)}
                      >
                        <Badge variant="secondary" className="text-[10px]">
                          {stateLabel(row.state)}
                        </Badge>
                      </FurnishFocus>
                      {row.honesty === "silent" && row.state === "running" ? (
                        <Badge variant="outline" className="text-[10px]">
                          Silent
                        </Badge>
                      ) : null}
                    </div>
                    <div
                      className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px]"
                      style={{ color: loFi.muted }}
                    >
                      {row.companyName ? (
                        <>
                          {row.companyInitials ? (
                            <FurnishFocus
                              persona="op"
                              n={3}
                              label="Company logo chip"
                              onFocus={focusSelf(3)}
                            >
                              <CompanyChip initials={row.companyInitials} />
                            </FurnishFocus>
                          ) : null}
                          <span>{row.companyName}</span>
                        </>
                      ) : (
                        <span>No company yet</span>
                      )}
                      <span>·</span>
                      <FurnishFocus
                        persona="op"
                        n={1}
                        label="Last touched"
                        onFocus={focusSelf(1)}
                      >
                        <span>{row.lastTouched}</span>
                      </FurnishFocus>
                      {row.firmCount != null ? (
                        <>
                          <span>·</span>
                          <FurnishFocus
                            persona="op"
                            n={4}
                            label="Firm count peek"
                            onFocus={focusSelf(4)}
                          >
                            <span>{row.firmCount} firms</span>
                          </FurnishFocus>
                        </>
                      ) : null}
                      {row.clientName ? (
                        <>
                          <span>·</span>
                          <FurnishFocus
                            persona="op"
                            n={5}
                            label="Client name fact"
                            onFocus={focusSelf(5)}
                          >
                            <span>→ {row.clientName}</span>
                          </FurnishFocus>
                        </>
                      ) : null}
                      {row.bookedMeetings != null && row.targetMeetings != null ? (
                        <>
                          <span>·</span>
                          <FurnishFocus
                            persona="op"
                            n={6}
                            label="Booked/target chip"
                            onFocus={focusSelf(6)}
                          >
                            <span>
                              {row.bookedMeetings}/{row.targetMeetings} booked
                            </span>
                          </FurnishFocus>
                        </>
                      ) : null}
                    </div>
                    {peek ? (
                      <FurnishFocus
                        persona="op"
                        n={11}
                        label="Hover peek: next action"
                        onFocus={focusSelf(11)}
                        style={{ display: "block" }}
                      >
                        <div className="mt-1 text-[10px]" style={{ color: loFi.label }}>
                          {peek}
                        </div>
                      </FurnishFocus>
                    ) : null}
                  </button>

                  <FurnishFocus persona="op" n={16} label="Row More menu" onFocus={focusSelf(16)}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          aria-label="Campaign actions"
                          className="shrink-0 rounded px-1.5 py-1 text-lg leading-none"
                          style={{
                            border: "none",
                            background: "transparent",
                            color: loFi.label,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        />
                      }
                    >
                      ⋮
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => onOpenDetails(row.id)}>
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onOpenHistory(row.id)}>
                          History
                        </DropdownMenuItem>
                        <FurnishFocus
                          persona="op"
                          n={8}
                          label="Pin campaign"
                          onFocus={focusSelf(8)}
                          style={{ display: "block" }}
                        >
                          <DropdownMenuItem onClick={() => onPin(pinnedId === row.id ? null : row.id)}>
                            {pinnedId === row.id ? "Unpin" : "Pin"}
                          </DropdownMenuItem>
                        </FurnishFocus>
                        <FurnishFocus
                          persona="op"
                          n={23}
                          label="Duplicate → Create"
                          onFocus={focusSelf(23)}
                          style={{ display: "block" }}
                        >
                          <DropdownMenuItem onClick={() => onDuplicate(row.name)}>
                            Duplicate
                          </DropdownMenuItem>
                        </FurnishFocus>
                        <DropdownMenuSeparator />
                        <FurnishFocus
                          persona="op"
                          n={24}
                          label="Archive / unarchive row"
                          onFocus={focusSelf(24)}
                          style={{ display: "block" }}
                        >
                          <DropdownMenuItem onClick={() => onArchive(row.id)}>
                            {row.archived ? "Unarchive" : "Archive"}
                          </DropdownMenuItem>
                        </FurnishFocus>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </FurnishFocus>
                </div>

                {isActive && showWaitStatus && onShowClientFund ? (
                  <FurnishFocus
                    persona="op"
                    n={25}
                    label="Waiting on accept + fund"
                    onFocus={focusSelf(25)}
                    style={{ display: "block" }}
                  >
                    <div
                      className="ml-4 mt-1 flex flex-wrap items-baseline gap-2 text-[11px]"
                      style={{ color: loFi.muted }}
                    >
                      <span>Invite sent. Waiting on accept and fund.</span>
                      <button type="button" onClick={onShowClientFund} style={quietTriggerStyle(loFi.label)}>
                        Show client accept + fund
                      </button>
                    </div>
                  </FurnishFocus>
                ) : null}

                {isActive && showInviteMenu && onListInviteGuest && onListInviteExisting ? (
                  <div className="ml-4 mt-1 flex gap-2">
                    <LoFiButton variant="ghost" onClick={onListInviteExisting}>
                      Invite existing
                    </LoFiButton>
                    <LoFiButton variant="ghost" onClick={onListInviteGuest}>
                      Invite guest
                    </LoFiButton>
                  </div>
                ) : null}
              </div>
              </HolonBoundary>
            );
          })
        )}
      </div>
    </div>
    </HolonBoundary>
  );
}
