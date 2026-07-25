/**
 * Guest depth doors — terms, details, inspect, share, history, faq, requests (items 21–35).
 */
import { useMemo, useState } from "react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { GUEST_CT } from "@/app/register/holons/registerCtHolons";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { PERSONA_SEED } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { FactCell } from "./AmbientBits";
import {
  buildFirmsCsv,
  firmTagLabel,
  quietLinkStyle,
  downloadText,
} from "./helpers";
import { FAQ_ITEMS, OPERATOR_NAME, TERMS_BODY, WHY_PRICE } from "./seed";
import type {
  GuestFirmRow,
  GuestInvite,
  InspectTab,
  OperatorRequest,
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

type DoorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function wirePanel(loFi: ReturnType<typeof useDeskPalette>) {
  return {
    background: loFi.white,
    border: `1px solid ${loFi.stroke}`,
    color: loFi.ink,
  } as const;
}

export type TermsDoorProps = DoorProps & {
  invite: GuestInvite;
  expiresAt: string;
};

export function TermsDoor({ open, onOpenChange, invite, expiresAt }: TermsDoorProps) {
  const loFi = useDeskPalette();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="overflow-y-auto border-l sm:max-w-md"
        style={{ ...wirePanel(loFi), borderColor: loFi.stroke }}
      >
        <HolonBoundary id={GUEST_CT.terms.id} label={GUEST_CT.terms.label} t={light}>
        <SheetHeader>
          <SheetTitle style={{ color: loFi.ink }}>Terms</SheetTitle>
          <SheetDescription style={{ color: loFi.label }}>
            Vessel contract · frozen until {expiresAt}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <FactCell label="Hold cap" value={`$${PERSONA_SEED.escrowTotal}`} />
          <FactCell label="Per meeting" value={`$${PERSONA_SEED.pricePerMeeting}`} />
          <FactCell label="Custodian" value={invite.custodian} />
          <FactCell label="Reclaim" value={`${PERSONA_SEED.holdDays} days`} />
        </div>
        <div
          className="mt-4"
          style={{
            fontSize: 13,
            color: loFi.ink,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
          }}
        >
          {TERMS_BODY}
        </div>
        <p className="mt-4 text-[11px]" style={{ color: loFi.muted }}>
          No Worker chat. Worker runs outreach after launch only.
        </p>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export type DetailsDoorProps = DoorProps & {
  invite: GuestInvite;
};

export function DetailsDoor({ open, onOpenChange, invite }: DetailsDoorProps) {
  const loFi = useDeskPalette();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="overflow-y-auto border-l sm:max-w-md"
        style={{ ...wirePanel(loFi), borderColor: loFi.stroke }}
      >
        <HolonBoundary id={GUEST_CT.details.id} label={GUEST_CT.details.label} t={light}>
        <SheetHeader>
          <SheetTitle style={{ color: loFi.ink }}>Why this price</SheetTitle>
          <SheetDescription style={{ color: loFi.label }}>
            {OPERATOR_NAME}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <FactCell label="ACV band" value={PERSONA_SEED.acvBand} />
          <FactCell
            label="Target"
            value={`${PERSONA_SEED.meetingsTarget} meetings`}
          />
          <FactCell label="Per meeting" value={`$${PERSONA_SEED.pricePerMeeting}`} />
          <FactCell label="Reclaim" value={`${PERSONA_SEED.holdDays} days`} />
        </div>
        <p className="mt-4 text-sm leading-relaxed">{WHY_PRICE}</p>
        <p className="mt-4 text-xs" style={{ color: loFi.label }}>
          Example: {invite.samplePacketExample}
        </p>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export type InspectDoorProps = DoorProps & {
  firms: GuestFirmRow[];
  inspectTab: InspectTab;
  onInspectTabChange: (tab: InspectTab) => void;
  addLogoName: string;
  onAddLogoNameChange: (v: string) => void;
  onBlockFirm: (id: string) => void;
  onRequestAdd: () => void;
};

export function InspectDoor({
  open,
  onOpenChange,
  firms,
  inspectTab,
  onInspectTabChange,
  addLogoName,
  onAddLogoNameChange,
  onBlockFirm,
  onRequestAdd,
}: InspectDoorProps) {
  const loFi = useDeskPalette();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return firms;
    return firms.filter((f) => f.name.toLowerCase().includes(q));
  }, [firms, search]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="overflow-y-auto border-l sm:max-w-md"
        style={{ ...wirePanel(loFi), borderColor: loFi.stroke }}
      >
        <HolonBoundary id={GUEST_CT.firms.id} label={GUEST_CT.firms.label} t={light}>
        <SheetHeader>
          <SheetTitle style={{ color: loFi.ink }}>Firms</SheetTitle>
          <SheetDescription style={{ color: loFi.label }}>
            {firms.length} companies on this list
          </SheetDescription>
        </SheetHeader>

        <FurnishFocus
          persona="guest"
          n={19}
          label="Firms search within list"
          onFocus={focusSelf(19)}
          style={{ display: "block" }}
        >
          <Input
            className="mt-4"
            placeholder="Search firms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </FurnishFocus>

        <div className="mt-4 mb-3 flex gap-4">
          {(
            [
              ["firms", "Firms"],
              ["samples", "Samples"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onInspectTabChange(id)}
              style={{
                ...quietLinkStyle(inspectTab === id ? loFi.ink : loFi.label),
                fontWeight: inspectTab === id ? 600 : 500,
                borderBottom:
                  inspectTab === id ? `1px solid ${loFi.ink}` : "1px solid transparent",
                borderRadius: 0,
                paddingBottom: 4,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {inspectTab === "firms" ? (
          <>
            <FurnishFocus
              persona="guest"
              n={17}
              label="Firm list with competitor / customer tags"
              onFocus={focusSelf(17)}
              style={{ display: "block" }}
            >
              <ul className="m-0 list-none p-0">
                {filtered.map((f) => {
                  const tag = firmTagLabel(f.tag);
                  return (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-2 border-b py-2.5 text-sm"
                      style={{ borderColor: loFi.stroke }}
                    >
                      <div>
                        <div
                          style={{
                            textDecoration: f.blocked ? "line-through" : "none",
                            color: f.blocked ? loFi.muted : loFi.ink,
                          }}
                        >
                          {f.name}
                          {tag ? (
                            <span className="ml-2 text-[10px]" style={{ color: loFi.muted }}>
                              {tag}
                            </span>
                          ) : null}
                        </div>
                        {f.note ? (
                          <div className="text-[11px]" style={{ color: loFi.muted }}>
                            {f.note}
                            {f.blockedBy === "operator" ? " · Operator" : f.blockedBy === "you" ? " · You" : ""}
                          </div>
                        ) : null}
                      </div>
                      {!f.blocked && !f.requested ? (
                        <button type="button" style={quietLinkStyle(loFi.label)} onClick={() => onBlockFirm(f.id)}>
                          Block
                        </button>
                      ) : (
                        <span className="text-[11px]" style={{ color: loFi.muted }}>
                          {f.blocked ? "Blocked" : "Requested"}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </FurnishFocus>
            <FurnishFocus
              persona="guest"
              n={18}
              label="Block firm + request must-have logo"
              onFocus={focusSelf(18)}
              style={{ display: "block" }}
            >
              <div className="mt-3.5 flex gap-2">
                <input
                  placeholder="Must-have logo"
                  value={addLogoName}
                  onChange={(e) => onAddLogoNameChange(e.target.value)}
                  style={{
                    flex: 1,
                    height: 32,
                    padding: "0 8px",
                    border: `1px solid ${loFi.stroke}`,
                    borderRadius: 4,
                    background: loFi.white,
                    fontSize: 12,
                    fontFamily: "inherit",
                  }}
                />
                <LoFiButton variant="ghost" onClick={onRequestAdd}>
                  Request
                </LoFiButton>
              </div>
            </FurnishFocus>
            <FurnishFocus
              persona="guest"
              n={20}
              label="Export firms CSV"
              onFocus={focusSelf(20)}
            >
              <LoFiButton
                variant="quiet"
                onClick={() => downloadText("firms.csv", buildFirmsCsv(firms))}
              >
                Export CSV
              </LoFiButton>
            </FurnishFocus>
          </>
        ) : (
          <div className="flex flex-col gap-5">
            <FurnishFocus
              persona="guest"
              n={16}
              label="Sample meeting packet in Inspect → Samples tab"
              onFocus={focusSelf(16)}
              style={{ display: "block" }}
            >
              <div>
                <div className="mb-1.5 text-xs font-semibold">Meeting packet</div>
                <p className="text-sm">Sam Ortiz, VP Engineering, Brightline Co</p>
                <p className="text-xs" style={{ color: loFi.label }}>
                  310 employees. Mon 10:00–10:30am.
                </p>
              </div>
            </FurnishFocus>
            <div>
              <div className="mb-1.5 text-xs font-semibold">Release receipt</div>
              <p className="text-2xl font-semibold">${PERSONA_SEED.pricePerMeeting} released</p>
              <p className="text-xs" style={{ color: loFi.label }}>
                Meeting #1 from hold · rcpt_sample_01
              </p>
            </div>
          </div>
        )}
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export type ShareDoorProps = DoorProps & {
  shareEmail: string;
  onShareEmailChange: (v: string) => void;
  shareFlash: boolean;
  onSend: () => void;
};

export function ShareDoor({
  open,
  onOpenChange,
  shareEmail,
  onShareEmailChange,
  shareFlash,
  onSend,
}: ShareDoorProps) {
  const loFi = useDeskPalette();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="border-l sm:max-w-md" style={{ ...wirePanel(loFi), borderColor: loFi.stroke }}>
        <SheetHeader>
          <SheetTitle style={{ color: loFi.ink }}>Share with cofounder</SheetTitle>
          <SheetDescription style={{ color: loFi.label }}>
            Viewer on terms only
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-3">
          <input
            placeholder="cofounder@company.com"
            value={shareEmail}
            onChange={(e) => onShareEmailChange(e.target.value)}
            style={{
              height: 34,
              padding: "0 10px",
              borderRadius: 4,
              border: `1px solid ${loFi.stroke}`,
              background: loFi.white,
              color: loFi.ink,
              fontSize: 13,
              fontFamily: "inherit",
            }}
          />
          <LoFiButton onClick={onSend}>{shareFlash ? "Sent" : "Send viewer link"}</LoFiButton>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export type HistoryDoorProps = DoorProps & {
  invite: GuestInvite;
};

export function HistoryDoor({ open, onOpenChange, invite }: HistoryDoorProps) {
  const loFi = useDeskPalette();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md" style={{ ...wirePanel(loFi), borderColor: loFi.stroke }}>
        <SheetHeader>
          <SheetTitle>History</SheetTitle>
          <SheetDescription>{invite.name} · pre-fund</SheetDescription>
        </SheetHeader>
        <ul className="mt-4 list-none p-0">
          {invite.history.map((ev) => (
            <li
              key={ev.id}
              className="flex justify-between gap-4 border-b py-2.5 text-sm"
              style={{ borderColor: loFi.stroke }}
            >
              <span>{ev.label}</span>
              <span className="text-xs" style={{ color: loFi.muted }}>
                {ev.at}
              </span>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

export function FaqDoor({ open, onOpenChange }: DoorProps) {
  const loFi = useDeskPalette();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md" style={{ ...wirePanel(loFi), borderColor: loFi.stroke }}>
        <SheetHeader>
          <SheetTitle>How money works</SheetTitle>
          <SheetDescription>Three questions</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-4">
          {FAQ_ITEMS.map((item) => (
            <div key={item.q}>
              <div className="text-sm font-medium">{item.q}</div>
              <p className="mt-1 text-sm" style={{ color: loFi.label }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export type RequestsDoorProps = DoorProps & {
  requests: OperatorRequest[];
};

export function RequestsDoor({ open, onOpenChange, requests }: RequestsDoorProps) {
  const loFi = useDeskPalette();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md" style={{ ...wirePanel(loFi), borderColor: loFi.stroke }}>
        <SheetHeader>
          <SheetTitle>Requests</SheetTitle>
          <SheetDescription>Operator adjustments</SheetDescription>
        </SheetHeader>
        {requests.length === 0 ? (
          <p className="mt-4 text-sm" style={{ color: loFi.label }}>
            No requests yet.
          </p>
        ) : (
          <ul className="mt-4 list-none p-0">
            {requests.map((r) => (
              <li
                key={r.id}
                className="flex justify-between gap-2 border-b py-2.5 text-sm"
                style={{ borderColor: loFi.stroke }}
              >
                <span>{r.label}</span>
                <span className="text-xs capitalize" style={{ color: loFi.muted }}>
                  {r.status} · {r.at}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}

export type DeclineDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecline: () => void;
};

export function DeclineDialog({ open, onOpenChange, onDecline }: DeclineDialogProps) {
  const loFi = useDeskPalette();
  const panel = wirePanel(loFi);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ ...panel, borderColor: loFi.stroke }}>
        <DialogHeader>
          <DialogTitle style={{ color: loFi.ink }}>Decline this invite?</DialogTitle>
          <DialogDescription style={{ color: loFi.label }}>
            Invite ends. Terms stay the same if re-invited.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <LoFiButton variant="quiet" onClick={() => onOpenChange(false)}>
            Keep invite
          </LoFiButton>
          <LoFiButton onClick={onDecline}>Decline</LoFiButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type AskOperatorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAsk: (kind: "price" | "icp" | "swap") => void;
};

export function AskOperatorDialog({ open, onOpenChange, onAsk }: AskOperatorDialogProps) {
  const loFi = useDeskPalette();
  const panel = wirePanel(loFi);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ ...panel, borderColor: loFi.stroke }}>
        <DialogHeader>
          <DialogTitle style={{ color: loFi.ink }}>Request Operator</DialogTitle>
          <DialogDescription style={{ color: loFi.label }}>
            Invite stays alive. They adjust the vessel.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1 pt-1">
          {(
            [
              ["price", "Challenge price"],
              ["icp", "Challenge ICP"],
              ["swap", "Swap target company"],
            ] as const
          ).map(([kind, label]) => (
            <button
              key={kind}
              type="button"
              style={{ ...quietLinkStyle(loFi.label), padding: "8px 0" }}
              onClick={() => onAsk(kind)}
            >
              {label}
            </button>
          ))}
        </div>
        <DialogFooter>
          <LoFiButton variant="quiet" onClick={() => onOpenChange(false)}>
            Cancel
          </LoFiButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type RequestsTrayProps = {
  requests: OperatorRequest[];
  onOpen: () => void;
};

export function RequestsTray({ requests, onOpen }: RequestsTrayProps) {
  const loFi = useDeskPalette();
  if (requests.length === 0) return null;
  return (
    <div
      className="mb-4 flex items-center justify-between gap-3 rounded-md px-3 py-2 text-xs"
      style={{ background: loFi.block, border: `1px solid ${loFi.stroke}`, color: loFi.label }}
    >
      <span>
        {requests.length} request{requests.length === 1 ? "" : "s"} · latest{" "}
        {requests[requests.length - 1]?.status}
      </span>
      <LoFiButton variant="quiet" onClick={onOpen}>
        View
      </LoFiButton>
    </div>
  );
}
