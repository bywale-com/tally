/**
 * Business Client — Campaign depth doors (furnishing items 18–32).
 */
import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { BC_CT } from "@/app/register/holons/registerCtHolons";
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
import { LoFiButton } from "../LoFiPrimitives";
import { PERSONA_SEED } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { FurnishFocus } from "../FurnishFocus";
import { SEED_TALK } from "./seed";
import {
  copyText,
  downloadText,
  firmStatusLabel,
  firmTagLabel,
  stateLabel,
} from "./helpers";
import type { FirmRow, TalkLine, Vessel } from "./types";

type DoorOpenProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type DetailsDoorProps = DoorOpenProps & {
  vessel: Vessel;
  onRequestOperator?: () => void;
};

export type FirmsDoorProps = DoorOpenProps & {
  vesselName: string;
  firms: FirmRow[];
  highlightFirmId?: string | null;
  onBlock?: (firmId: string) => void;
  onRemove?: (firmId: string) => void;
};

export type TalkDoorProps = DoorOpenProps & {
  lines?: TalkLine[];
  onFlagBrand?: () => void;
};

export type StopDoorProps = DoorOpenProps & {
  vessel: Vessel;
  held: number;
  onStopAndReclaim: () => void;
  onKeepRunning: () => void;
};

export type HistoryDoorProps = DoorOpenProps & {
  vessel: Vessel;
};

export type PauseWhyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vesselId: string | null;
  vesselName?: string;
  onConfirm: (vesselId: string, why?: string) => void;
};

function FactCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  const loFi = useDeskPalette();
  return (
    <div
      className="rounded-md border p-3"
      style={{ borderColor: loFi.stroke, background: loFi.white }}
    >
      <div className="text-[11px] font-medium" style={{ color: loFi.label }}>
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
      {sub ? (
        <div className="mt-0.5 text-[11px]" style={{ color: loFi.muted }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

export function DetailsDoor({
  open,
  onOpenChange,
  vessel,
  onRequestOperator,
}: DetailsDoorProps) {
  const loFi = useDeskPalette();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-4 sm:max-w-md">
        <HolonBoundary id={BC_CT.detailsDoor.id} label={BC_CT.detailsDoor.label} t={light}>
        <SheetHeader className="gap-1">
          <SheetTitle>Details</SheetTitle>
          <SheetDescription>{vessel.name}</SheetDescription>
        </SheetHeader>

        <div
          className="flex flex-col gap-4 text-sm"
          style={{ fontFamily: "inherit" }}
        >
          <FurnishFocus
            persona="bc"
            n={18}
            label="Details sheet: printable one-pager fact grid"
            style={{ display: "block", width: "100%" }}
          >
          <div
            className="grid grid-cols-2 gap-2 border-b pb-4"
            style={{ borderColor: loFi.stroke }}
          >
            <FactCell label="State" value={stateLabel(vessel.state)} />
            <FactCell
              label="Price"
              value={`$${vessel.price} / meeting`}
              sub={`${vessel.target} meetings`}
            />
            <FactCell label="Hold days" value={`${vessel.holdDays}d`} />
            <FurnishFocus persona="bc" n={98} label="Clock furniture: hold clock started">
              <FactCell
                label="Hold started"
                value={vessel.holdStartedAt}
              />
            </FurnishFocus>
            <FactCell
              label="Custodian"
              value={vessel.custodian}
            />
            <FurnishFocus persona="bc" n={93} label="Operator credibility: prior vessels">
              <FactCell
                label="Operator"
                value={vessel.operatorName}
                sub={`${vessel.priorVesselsWithOperator} prior vessels`}
              />
            </FurnishFocus>
          </div>
          </FurnishFocus>

          <FurnishFocus
            persona="bc"
            n={19}
            label="What counts checklist as display-only locked toggles"
            style={{ display: "block", width: "100%" }}
          >
          <div>
            <div className="text-xs font-medium" style={{ color: loFi.label }}>
              What counts
            </div>
            <p className="mt-1 text-[11px]" style={{ color: loFi.muted }}>
              Locked at fund. Display only.
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {vessel.whatCounts.map((rule) => (
                <li key={rule.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={rule.on}
                    disabled
                    readOnly
                    className="size-3.5 shrink-0"
                  />
                  <span style={{ color: rule.on ? loFi.ink : loFi.muted }}>
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          </FurnishFocus>

          <FurnishFocus
            persona="bc"
            n={20}
            label="Sample packet definition example"
            style={{ display: "block", width: "100%" }}
          >
          <div>
            <div className="text-xs font-medium" style={{ color: loFi.label }}>
              Sample packet
            </div>
            <p
              className="mt-1 rounded-md border p-3 text-xs leading-relaxed"
              style={{ borderColor: loFi.stroke, color: loFi.label }}
            >
              {vessel.samplePacketExample}
            </p>
          </div>
          </FurnishFocus>

          <div>
            <div className="text-xs font-medium" style={{ color: loFi.label }}>
              Why this price
            </div>
            <p className="mt-1 text-xs leading-relaxed">{vessel.pricingWhy}</p>
          </div>

          {vessel.accessViewers.length > 0 ? (
            <FurnishFocus
              persona="bc"
              n={16}
              label="Share read-only link / access viewers"
              style={{ display: "block", width: "100%" }}
            >
            <div>
              <div className="text-xs font-medium" style={{ color: loFi.label }}>
                Access (read-only)
              </div>
              <ul className="mt-1 text-xs" style={{ color: loFi.label }}>
                {vessel.accessViewers.map((viewer) => (
                  <li key={viewer}>{viewer}</li>
                ))}
              </ul>
            </div>
            </FurnishFocus>
          ) : null}

          {onRequestOperator ? (
            <LoFiButton variant="ghost" onClick={onRequestOperator}>
              Request Operator
            </LoFiButton>
          ) : null}
        </div>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export function FirmsDoor({
  open,
  onOpenChange,
  vesselName,
  firms,
  highlightFirmId,
  onBlock,
  onRemove,
}: FirmsDoorProps) {
  const loFi = useDeskPalette();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FirmRow["status"] | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return firms.filter((f) => {
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        (f.note?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [firms, query, statusFilter]);

  const exportCsv = () => {
    const header = "name,status,tag,blocked_by,note";
    const rows = firms.map((f) =>
      [
        `"${f.name.replace(/"/g, '""')}"`,
        f.status,
        f.tag,
        f.blockedBy ?? "",
        `"${(f.note ?? "").replace(/"/g, '""')}"`,
      ].join(","),
    );
    downloadText(
      `${vesselName.replace(/\s+/g, "-").toLowerCase()}-firms.csv`,
      [header, ...rows].join("\n"),
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-4 sm:max-w-md">
        <HolonBoundary id={BC_CT.firmsDoor.id} label={BC_CT.firmsDoor.label} t={light}>
        <SheetHeader className="gap-1">
          <SheetTitle>Firms</SheetTitle>
          <SheetDescription>{vesselName}</SheetDescription>
        </SheetHeader>

        <FurnishFocus
          persona="bc"
          n={21}
          label="Firms sheet: search/filter within list"
          style={{ display: "block", width: "100%" }}
        >
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Search firms"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "All"],
                ["queued", "Queued"],
                ["touched", "Touched"],
                ["meeting", "Meeting"],
                ["blocked", "Blocked"],
              ] as const
            ).map(([id, label]) => (
              <LoFiButton
                key={id}
                variant={statusFilter === id ? "ghost" : "quiet"}
                onClick={() => setStatusFilter(id)}
              >
                {label}
              </LoFiButton>
            ))}
          </div>
          <FurnishFocus persona="bc" n={24} label="Firms: export CSV of current list">
            <LoFiButton variant="quiet" onClick={exportCsv}>
              Export CSV
            </LoFiButton>
          </FurnishFocus>
        </div>
        </FurnishFocus>

        <div className="flex flex-col overflow-auto">
          {filtered.map((f) => {
            const tag = firmTagLabel(f.tag);
            const highlighted = highlightFirmId === f.id || f.highlight;
            return (
              <div
                key={f.id}
                className="flex items-center justify-between gap-2 border-b py-2.5"
                style={{
                  borderColor: loFi.stroke,
                  background: highlighted ? loFi.block : "transparent",
                  paddingLeft: highlighted ? 6 : 0,
                  paddingRight: highlighted ? 6 : 0,
                }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-[11px]" style={{ color: loFi.label }}>
                    {firmStatusLabel(f.status)}
                    {tag ? (
                      <FurnishFocus persona="bc" n={22} label="Competitor/customer/dream-list tag">
                        <span>{` · ${tag}`}</span>
                      </FurnishFocus>
                    ) : (
                      ""
                    )}
                    {f.blockedBy ? (
                      <FurnishFocus persona="bc" n={23} label="Blocked-by-you vs blocked-by-Operator">
                        <span>
                          {f.blockedBy === "you" ? " · Blocked by you" : " · Blocked by Operator"}
                        </span>
                      </FurnishFocus>
                    ) : null}
                    {f.note && !f.blockedBy ? `. ${f.note}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {onBlock ? (
                    <LoFiButton
                      variant="quiet"
                      disabled={f.status === "blocked"}
                      onClick={() => onBlock(f.id)}
                    >
                      Block
                    </LoFiButton>
                  ) : null}
                  {onRemove ? (
                    <LoFiButton variant="quiet" onClick={() => onRemove(f.id)}>
                      Remove
                    </LoFiButton>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export function TalkDoor({
  open,
  onOpenChange,
  lines = SEED_TALK,
  onFlagBrand,
}: TalkDoorProps) {
  const loFi = useDeskPalette();
  const [lastUsed, setLastUsed] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const line of lines) {
      if (line.lastUsed) init[line.id] = line.lastUsed;
    }
    return init;
  });

  const stampCopy = (line: TalkLine) => {
    copyText(line.text);
    const stamp = `Used ${new Date().toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })}`;
    setLastUsed((prev) => ({ ...prev, [line.id]: stamp }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-4 sm:max-w-md">
        <HolonBoundary id={BC_CT.talkDoor.id} label={BC_CT.talkDoor.label} t={light}>
        <SheetHeader className="gap-1">
          <SheetTitle>Talk tracks</SheetTitle>
          <SheetDescription>
            Sample lines Worker may use for {PERSONA_SEED.companyName}
          </SheetDescription>
        </SheetHeader>

        <ul className="flex flex-col gap-3">
          {lines.map((line) => (
            <li
              key={line.id}
              className="rounded-md border p-3"
              style={{ borderColor: loFi.stroke }}
            >
              <p className="text-sm leading-relaxed" style={{ color: loFi.label }}>
                {line.text}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <FurnishFocus persona="bc" n={25} label="Talk tracks: copy-to-clipboard">
                  <LoFiButton variant="ghost" onClick={() => stampCopy(line)}>
                    <span className="inline-flex items-center gap-1">
                      <Copy size={12} />
                      Copy
                    </span>
                  </LoFiButton>
                </FurnishFocus>
                {lastUsed[line.id] ? (
                  <FurnishFocus persona="bc" n={26} label="Talk tracks: last used stamp">
                    <span className="text-[11px]" style={{ color: loFi.muted }}>
                      {lastUsed[line.id]}
                    </span>
                  </FurnishFocus>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {onFlagBrand ? (
          <LoFiButton variant="ghost" onClick={onFlagBrand}>
            Flag brand concern
          </LoFiButton>
        ) : null}
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export function AlertsDoor({ open, onOpenChange }: DoorOpenProps) {
  const loFi = useDeskPalette();
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [slack, setSlack] = useState(false);
  const [quietHours, setQuietHours] = useState(true);
  const [digest, setDigest] = useState(false);
  const [muteVanity, setMuteVanity] = useState(true);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-4 sm:max-w-md">
        <HolonBoundary id={BC_CT.alertsDoor.id} label={BC_CT.alertsDoor.label} t={light}>
        <SheetHeader className="gap-1">
          <SheetTitle>Alerts</SheetTitle>
          <SheetDescription>Meetings and money only</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 text-sm">
          <FurnishFocus
            persona="bc"
            n={27}
            label="Alerts: channels as prefs"
            style={{ display: "block", width: "100%" }}
          >
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-medium" style={{ color: loFi.label }}>
              Channels
            </legend>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
              Email
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} />
              SMS
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={slack} onChange={(e) => setSlack(e.target.checked)} />
              Slack webhook
            </label>
          </fieldset>
          </FurnishFocus>

          <FurnishFocus
            persona="bc"
            n={28}
            label="Alerts: quiet hours"
            style={{ display: "block", width: "100%" }}
          >
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={quietHours}
              onChange={(e) => setQuietHours(e.target.checked)}
            />
            Quiet hours (9pm–8am local)
          </label>
          </FurnishFocus>

          <FurnishFocus
            persona="bc"
            n={29}
            label="Alerts: digest vs instant for pending releases"
            style={{ display: "block", width: "100%" }}
          >
          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-medium" style={{ color: loFi.label }}>
              Pending releases
            </legend>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="release-mode"
                checked={!digest}
                onChange={() => setDigest(false)}
              />
              Instant
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="release-mode"
                checked={digest}
                onChange={() => setDigest(true)}
              />
              Daily digest
            </label>
          </fieldset>
          </FurnishFocus>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={muteVanity}
              onChange={(e) => setMuteVanity(e.target.checked)}
            />
            Mute vanity activity (opens, dials, email counts)
          </label>
        </div>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export function StopDoor({
  open,
  onOpenChange,
  vessel,
  held,
  onStopAndReclaim,
  onKeepRunning,
}: StopDoorProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-4 sm:max-w-md">
        <HolonBoundary id={BC_CT.stopDoor.id} label={BC_CT.stopDoor.label} t={light}>
        <SheetHeader className="gap-1">
          <SheetTitle>Stop campaign</SheetTitle>
          <SheetDescription>{vessel.name}</SheetDescription>
        </SheetHeader>

        <FurnishFocus
          persona="bc"
          n={30}
          label="Stop sheet: consequence preview as three fact cells"
          style={{ display: "block", width: "100%" }}
        >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <FactCell
            label="Held"
            value={`$${held.toLocaleString()} freezes`}
            sub="Pending meetings stay held until you accept, dispute, or cancel."
          />
          <FactCell
            label="Worker"
            value="Sees stop"
            sub="Outreach pauses on this vessel."
          />
          <FactCell
            label="Reclaim"
            value={
              vessel.reclaimDaysLeft <= 0
                ? "Available now"
                : `In ${vessel.reclaimDaysLeft}d`
            }
            sub="Unspent hold returns after stop."
          />
        </div>
        </FurnishFocus>

        <div className="flex gap-2 pt-2">
          <LoFiButton onClick={onStopAndReclaim}>Stop and reclaim</LoFiButton>
          <LoFiButton variant="quiet" onClick={onKeepRunning}>
            Keep running
          </LoFiButton>
        </div>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export function HistoryDoor({ open, onOpenChange, vessel }: HistoryDoorProps) {
  const loFi = useDeskPalette();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-4 sm:max-w-md">
        <HolonBoundary id={BC_CT.historyDoor.id} label={BC_CT.historyDoor.label} t={light}>
        <SheetHeader className="gap-1">
          <SheetTitle>History</SheetTitle>
          <SheetDescription>{vessel.name}</SheetDescription>
        </SheetHeader>

        <FurnishFocus
          persona="bc"
          n={32}
          label="History drawer: invite to reclaim timeline"
          style={{ display: "block", width: "100%" }}
        >
        <ol className="relative flex flex-col gap-0 border-l pl-4" style={{ borderColor: loFi.stroke }}>
          {vessel.history.map((event, index) => (
            <li key={event.id} className="relative pb-4 last:pb-0">
              <span
                className="absolute -left-[21px] top-1 size-2 rounded-full"
                style={{
                  background: index === vessel.history.length - 1 ? loFi.ink : loFi.muted,
                }}
              />
              <div className="text-xs font-medium">{event.label}</div>
              <div className="text-[11px]" style={{ color: loFi.muted }}>
                {event.at}
              </div>
            </li>
          ))}
        </ol>
        </FurnishFocus>

        {vessel.pauseWhy ? (
          <FurnishFocus
            persona="bc"
            n={31}
            label="Pause why note visible on History"
            style={{ display: "block", width: "100%" }}
          >
          <div
            className="rounded-md border p-3 text-xs"
            style={{ borderColor: loFi.stroke, color: loFi.label }}
          >
            Pause note: {vessel.pauseWhy}
          </div>
          </FurnishFocus>
        ) : null}
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export function PauseWhyDialog({
  open,
  onOpenChange,
  vesselId,
  vesselName,
  onConfirm,
}: PauseWhyDialogProps) {
  const [why, setWhy] = useState("");

  const confirm = () => {
    if (!vesselId) return;
    onConfirm(vesselId, why.trim() || undefined);
    setWhy("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setWhy("");
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pause campaign</DialogTitle>
          <DialogDescription>
            {vesselName ? `${vesselName}. ` : ""}
            Optional note for Operator glance.
          </DialogDescription>
        </DialogHeader>
        <FurnishFocus
          persona="bc"
          n={31}
          label="Pause: optional why note for Operator glance"
          style={{ display: "block", width: "100%" }}
        >
          <Input
            placeholder="Why pause? (optional)"
            value={why}
            onChange={(e) => setWhy(e.target.value)}
          />
        </FurnishFocus>
        <DialogFooter>
          <LoFiButton variant="quiet" onClick={() => onOpenChange(false)}>
            Cancel
          </LoFiButton>
          <LoFiButton onClick={confirm} disabled={!vesselId}>
            Pause
          </LoFiButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
