/**
 * Campaign depth doors (items 17–24, 54, 84).
 */
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { useDeskPalette } from "../DeskPaletteContext";
import { buildCampaignCsv, copyText, downloadText, stateLabel } from "./helpers";
import type { OpCampaign, OpDeskSheet, SentInvite } from "./types";

export type CampaignDoorsProps = {
  sheet: OpDeskSheet;
  onClose: () => void;
  campaign: OpCampaign | null;
  sentInvites: SentInvite[];
};

function FactCell({ label, value }: { label: string; value: string }) {
  const loFi = useDeskPalette();
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 py-1.5 text-xs">
      <span style={{ color: loFi.muted }}>{label}</span>
      <span style={{ color: loFi.ink }}>{value}</span>
    </div>
  );
}

export function CampaignDoors({ sheet, onClose, campaign, sentInvites }: CampaignDoorsProps) {
  const loFi = useDeskPalette();
  const open = sheet === "details" || sheet === "history" || sheet === "invite-history";

  if (!open) return null;

  const title =
    sheet === "details"
      ? "Campaign details"
      : sheet === "history"
        ? "Campaign history"
        : "Invite history";

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {campaign ? (
            <SheetDescription>{campaign.name}</SheetDescription>
          ) : (
            <SheetDescription>Sample campaigns</SheetDescription>
          )}
        </SheetHeader>

        {sheet === "details" && campaign ? (
          <div className="mt-4 space-y-4">
            <FurnishFocus persona="op" n={17} label="Details sheet facts grid" style={{ display: "block" }}>
              <div className="rounded-md border p-3" style={{ borderColor: loFi.stroke }}>
                <FactCell label="Stage" value={stateLabel(campaign.state)} />
                <FactCell label="Company" value={campaign.companyName ?? "—"} />
                <FactCell label="Created" value={campaign.createdAt} />
                <FactCell label="Last touched" value={campaign.lastTouched} />
                <FactCell
                  label="Firms"
                  value={campaign.firmCount != null ? String(campaign.firmCount) : "—"}
                />
                <FurnishFocus persona="op" n={18} label="Target + price facts" style={{ display: "block" }}>
                  <>
                    <FactCell
                      label="Target"
                      value={
                        campaign.targetMeetings != null
                          ? `${campaign.targetMeetings} meetings`
                          : "—"
                      }
                    />
                    <FactCell
                      label="Price"
                      value={
                        campaign.pricePerMeeting != null
                          ? `$${campaign.pricePerMeeting} / meeting`
                          : "—"
                      }
                    />
                  </>
                </FurnishFocus>
                <FactCell
                  label="Hold"
                  value={
                    campaign.holdDays != null ? `${campaign.holdDays} days` : "—"
                  }
                />
                <FactCell
                  label="Client"
                  value={campaign.clientName ?? campaign.clientEmail ?? "—"}
                />
              </div>
            </FurnishFocus>
            <div className="flex flex-wrap gap-2">
              <FurnishFocus persona="op" n={22} label="Export campaign summary CSV">
                <LoFiButton
                  variant="ghost"
                  onClick={() => downloadText(`${campaign.name}.csv`, buildCampaignCsv(campaign))}
                >
                  Export CSV
                </LoFiButton>
              </FurnishFocus>
              <LoFiButton
                variant="ghost"
                onClick={() =>
                  copyText(
                    [
                      campaign.name,
                      stateLabel(campaign.state),
                      campaign.companyName ?? "",
                    ].join(" · "),
                  )
                }
              >
                Copy summary
              </LoFiButton>
            </div>
          </div>
        ) : null}

        {sheet === "history" && campaign ? (
          <FurnishFocus persona="op" n={20} label="History drawer timeline" style={{ display: "block" }}>
            <div className="mt-4 space-y-2">
              {campaign.history.map((e) => (
                <div
                  key={e.id}
                  className="flex gap-3 rounded-md px-2 py-2 text-xs"
                  style={{ background: loFi.block }}
                >
                  <span className="shrink-0 font-medium" style={{ color: loFi.muted }}>
                    {e.at}
                  </span>
                  <span style={{ color: loFi.ink }}>{e.label}</span>
                </div>
              ))}
            </div>
          </FurnishFocus>
        ) : null}

        {sheet === "invite-history" ? (
          <FurnishFocus persona="op" n={84} label="Invite history door" style={{ display: "block" }}>
            <div className="mt-4 space-y-2">
              {sentInvites.length === 0 ? (
                <p className="text-xs" style={{ color: loFi.muted }}>
                  No invites sent yet.
                </p>
              ) : (
                sentInvites.map((inv) => (
                  <div
                    key={inv.id}
                    className="rounded-md border p-3 text-xs"
                    style={{ borderColor: loFi.stroke }}
                  >
                    <div className="font-semibold" style={{ color: loFi.ink }}>
                      {inv.campaignName}
                    </div>
                    <div className="mt-1" style={{ color: loFi.label }}>
                      {inv.kind === "guest" ? "Guest" : "Existing"} → {inv.to}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span style={{ color: loFi.muted }}>{inv.at}</span>
                      <Badge variant={inv.status === "funded" ? "default" : "secondary"}>
                        {inv.status === "funded" ? "Funded" : "Sent"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </FurnishFocus>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export type CreateHelpSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateHelpSheet({ open, onClose }: CreateHelpSheetProps) {
  const loFi = useDeskPalette();
  const steps = [
    "Name the campaign and pick the client company.",
    "Evaluate on the call — dossier fills from live sources.",
    "Enrich firm list off-call, then invite and launch.",
  ];
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>What happens next</SheetTitle>
          <SheetDescription>Three steps. Same path every time.</SheetDescription>
        </SheetHeader>
        <ol className="mt-4 list-decimal space-y-3 pl-4 text-xs" style={{ color: loFi.label }}>
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  );
}

export type DossierMoreSheetProps = {
  open: boolean;
  onClose: () => void;
  sections: { label: string; fact: string }[];
  onExport: () => void;
};

export function DossierMoreSheet({
  open,
  onClose,
  sections,
  onExport,
}: DossierMoreSheetProps) {
  const loFi = useDeskPalette();
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Full dossier</SheetTitle>
          <SheetDescription>All sections at once — read-only.</SheetDescription>
        </SheetHeader>
        <FurnishFocus persona="op" n={54} label="Dossier More door full facts grid" style={{ display: "block" }}>
          <div className="mt-4 space-y-3">
            {sections.map((s) => (
              <div key={s.label}>
                <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: loFi.muted }}>
                  {s.label}
                </div>
                <div className="mt-1 text-sm" style={{ color: loFi.ink }}>
                  {s.fact}
                </div>
              </div>
            ))}
          </div>
        </FurnishFocus>
        <div className="mt-4">
          <FurnishFocus persona="op" n={48} label="Export dossier text">
            <LoFiButton variant="ghost" onClick={onExport}>
              Export dossier
            </LoFiButton>
          </FurnishFocus>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export type PauseStopDoorsProps = {
  sheet: OpDeskSheet;
  onClose: () => void;
};

export function PauseStopDoors({ sheet, onClose }: PauseStopDoorsProps) {
  const loFi = useDeskPalette();
  const open = sheet === "pause" || sheet === "stop";
  if (!open) return null;

  const title = sheet === "pause" ? "Pause campaign" : "Stop campaign";
  const facts =
    sheet === "pause"
      ? ["Worker queue freezes.", "Held escrow stays.", "Client sees paused on their desk."]
      : ["Worker queue clears.", "Held escrow freezes.", "No new meetings booked."];

  return (
    <Sheet open onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Display-only in click-through.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {facts.map((f) => (
            <div
              key={f}
              className="rounded-md px-3 py-2 text-xs"
              style={{ background: loFi.block, color: loFi.label }}
            >
              {f}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs" style={{ color: loFi.muted }}>
          Function path unchanged — this door previews consequences only.
        </p>
      </SheetContent>
    </Sheet>
  );
}
