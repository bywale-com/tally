/**
 * Guest — Campaigns invite view (checklist items 1–20).
 */
import { useState } from "react";
import { Lock } from "lucide-react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { GUEST_CT } from "@/app/register/holons/registerCtHolons";
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
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiPanel, PERSONA_SEED } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import {
  BrandExclusionsCount,
  Fact,
  InviteRefStrip,
  OperatorCredibilityStrip,
} from "./AmbientBits";
import { brandExclusionCount, daysUntilExpiry, quietLinkStyle } from "./helpers";
import type {
  Density,
  GuestFirmRow,
  GuestInvite,
  OperatorRequest,
  SavedInvite,
  ShareViewer,
} from "./types";

function focusSelf(n: number) {
  return () => {
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-holon-id="${furnishFocusId("guest", n)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
}

export type InviteCampaignsViewProps = {
  invite: GuestInvite;
  firms: GuestFirmRow[];
  density: Density;
  savedInvite: SavedInvite | null;
  viewers: ShareViewer[];
  requests: OperatorRequest[];
  savedFlash: boolean;
  onFund: () => void;
  onReviewTerms: () => void;
  onWhyPrice: () => void;
  onInspectFirms: () => void;
  onShare: () => void;
  onSaveForLater: () => void;
  onRequestOperator: () => void;
  onDecline: () => void;
  onOpenHistory: () => void;
  onOpenFaq: () => void;
  onOpenRequests: () => void;
};

export function InviteCampaignsView({
  invite,
  firms,
  density,
  savedInvite,
  viewers,
  requests,
  savedFlash,
  onFund,
  onReviewTerms,
  onWhyPrice,
  onInspectFirms,
  onShare,
  onSaveForLater,
  onRequestOperator,
  onDecline,
  onOpenHistory,
  onOpenFaq,
  onOpenRequests,
}: InviteCampaignsViewProps) {
  const loFi = useDeskPalette();
  const [viewersOpen, setViewersOpen] = useState(false);
  const exclusionCount = brandExclusionCount(firms);
  const defaultHold = PERSONA_SEED.escrowTotal;
  const compact = density === "compact";

  return (
    <HolonBoundary id={GUEST_CT.invite.id} label={GUEST_CT.invite.label} t={light}>
      <LoFiPanel title="My campaigns">
      <div className={`flex flex-col ${compact ? "gap-3" : "gap-4"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <FurnishFocus
                persona="guest"
                n={9}
                label="Company logo chip"
                onFocus={focusSelf(9)}
              >
                <span
                  className="inline-flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                  style={{ background: loFi.block, color: loFi.ink }}
                >
                  {invite.logoMark}
                </span>
              </FurnishFocus>
              <div className="text-sm font-semibold">{invite.name}</div>
              <FurnishFocus
                persona="guest"
                n={5}
                label="Invited state dot"
                onFocus={focusSelf(5)}
              >
                <Badge variant="outline" className="text-[10px] font-normal">
                  <span
                    className="mr-1.5 inline-block size-1.5 rounded-full"
                    style={{ background: loFi.muted }}
                  />
                  Invited
                </Badge>
              </FurnishFocus>
              {invite.rulesLocked ? (
                <FurnishFocus
                  persona="guest"
                  n={4}
                  label="Rules locked lock glyph"
                  onFocus={focusSelf(4)}
                >
                  <button
                    type="button"
                    title="Rules locked — opens terms"
                    onClick={onReviewTerms}
                    className="inline-flex items-center gap-0.5 text-[10px]"
                    style={{
                      border: "none",
                      background: "transparent",
                      color: loFi.muted,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <Lock size={11} />
                    Locked
                  </button>
                </FurnishFocus>
              ) : null}
            </div>
            <FurnishFocus
              persona="guest"
              n={2}
              label="Invite expiry date as a fact"
              onFocus={focusSelf(2)}
              style={{ display: "block" }}
            >
              <div className="mt-1 text-xs" style={{ color: loFi.label }}>
                {daysUntilExpiry(invite.expiresAt)}. Rules locked.
              </div>
            </FurnishFocus>
            <FurnishFocus
              persona="guest"
              n={3}
              label="Operator name + initials avatar chip"
              onFocus={focusSelf(3)}
              style={{ display: "block" }}
            >
              <div className="text-xs" style={{ color: loFi.label }}>
                From{" "}
                <span
                  className="inline-flex items-center gap-1 font-medium"
                  style={{ color: loFi.ink }}
                >
                  <span
                    className="inline-flex size-4 items-center justify-center rounded-full text-[9px] font-semibold"
                    style={{ background: loFi.block }}
                  >
                    {invite.operatorInitials}
                  </span>
                  {invite.operatorName}
                </span>{" "}
                for {invite.clientName}.
              </div>
            </FurnishFocus>
            <p className="mt-1 text-[11px]" style={{ color: loFi.muted }}>
              <FurnishFocus
                persona="guest"
                n={8}
                label="Prepared by Operator one-liner"
                onFocus={focusSelf(8)}
              >
                <span>{invite.preparedBy}</span>
              </FurnishFocus>{" "}
              ·{" "}
              <FurnishFocus
                persona="guest"
                n={10}
                label="Operator touched relative time"
                onFocus={focusSelf(10)}
              >
                <span>touched {invite.operatorTouched}</span>
              </FurnishFocus>
            </p>
            <FurnishFocus
              persona="guest"
              n={7}
              label="Hover peek: days until invite expires"
              onFocus={focusSelf(7)}
              style={{ display: "block" }}
            >
              <p
                className="mt-1 text-[11px] italic"
                style={{ color: loFi.muted }}
                title={`Next: expiry ${invite.expiresAt}`}
              >
                Peek · Reclaim window {PERSONA_SEED.holdDays}d after fund ·{" "}
                {invite.timezone}
              </p>
            </FurnishFocus>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <LoFiButton onClick={onFund}>Fund</LoFiButton>
            <LoFiButton variant="quiet" onClick={onReviewTerms}>
              Review terms
            </LoFiButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<button type="button" style={quietLinkStyle(loFi.label)} />}
              >
                More
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={onWhyPrice}>Why this price</DropdownMenuItem>
                  <DropdownMenuItem onClick={onInspectFirms}>Firms</DropdownMenuItem>
                  <DropdownMenuItem onClick={onShare}>Share with cofounder</DropdownMenuItem>
                  <DropdownMenuItem onClick={onSaveForLater}>
                    {savedFlash ? "Saved" : "Save for later"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRequestOperator}>
                    Request Operator
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenHistory}>History</DropdownMenuItem>
                  <DropdownMenuItem onClick={onOpenFaq}>How money works</DropdownMenuItem>
                  {requests.length > 0 ? (
                    <DropdownMenuItem onClick={onOpenRequests}>
                      Requests ({requests.length})
                    </DropdownMenuItem>
                  ) : null}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDecline}>Decline</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <FurnishFocus
          persona="guest"
          n={6}
          label="Money at a glance under name"
          onFocus={focusSelf(6)}
          style={{ display: "block" }}
        >
          <div className="text-xs" style={{ color: loFi.label }}>
            Hold ${defaultHold} · ${PERSONA_SEED.pricePerMeeting} per meeting ·{" "}
            {PERSONA_SEED.holdDays}-day reclaim
          </div>
        </FurnishFocus>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Fact label="Hold" value={`$${defaultHold}`} />
          <Fact label="Per meeting" value={`$${PERSONA_SEED.pricePerMeeting}`} />
          <Fact
            label="Who counts"
            value={`${PERSONA_SEED.seniority}, ${PERSONA_SEED.meetingLengthMin}+ min`}
          />
          <Fact label="Reclaim" value={`${PERSONA_SEED.holdDays} days`} />
        </div>

        <div className="flex flex-col gap-1">
          <FurnishFocus
            persona="guest"
            n={13}
            label="Operator credibility strip"
            onFocus={focusSelf(13)}
            style={{ display: "block" }}
          >
            <OperatorCredibilityStrip
              priorCount={invite.priorVesselsWithOperator}
              operatorName={invite.operatorName}
            />
          </FurnishFocus>
          <FurnishFocus
            persona="guest"
            n={14}
            label="Brand exclusions honored count"
            onFocus={focusSelf(14)}
            style={{ display: "block" }}
          >
            <BrandExclusionsCount count={exclusionCount} />
          </FurnishFocus>
          <InviteRefStrip inviteRef={invite.inviteRef} inviteSentAt={invite.inviteSentAt} />
        </div>

        {savedInvite ? (
          <FurnishFocus
            persona="guest"
            n={11}
            label="Save-for-later lands in a Saved tray"
            onFocus={focusSelf(11)}
            style={{ display: "block" }}
          >
            <div
              className="rounded-md px-3 py-2 text-xs"
              style={{ background: loFi.block, border: `1px solid ${loFi.stroke}` }}
            >
              Saved {savedInvite.savedAt}. Terms frozen until {invite.expiresAt}.
            </div>
          </FurnishFocus>
        ) : null}

        <FurnishFocus
          persona="guest"
          n={12}
          label="Share viewer list tray"
          onFocus={focusSelf(12)}
          style={{ display: "block" }}
        >
          <div>
            <button
              type="button"
              onClick={() => setViewersOpen((v) => !v)}
              style={quietLinkStyle(loFi.label)}
            >
              {viewersOpen ? "Hide" : "Show"} viewers ({viewers.length})
            </button>
            {viewersOpen ? (
              <ul className="mt-1 list-none p-0 text-xs" style={{ color: loFi.label }}>
                {viewers.map((v) => (
                  <li key={v.id} className="py-0.5">
                    {v.email}
                    {v.status === "pending" ? (
                      <span style={{ color: loFi.muted }}> · pending</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </FurnishFocus>

        <FurnishFocus
          persona="guest"
          n={15}
          label="What-counts checklist as display-only locked toggles"
          onFocus={focusSelf(15)}
          style={{ display: "block" }}
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {invite.whatCounts.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 text-xs"
                style={{ color: loFi.label, opacity: item.on ? 1 : 0.5 }}
              >
                <input type="checkbox" checked={item.on} readOnly disabled />
                {item.label}
              </label>
            ))}
          </div>
        </FurnishFocus>
      </div>
    </LoFiPanel>
    </HolonBoundary>
  );
}
