/**
 * Worker depth doors — details, firms, talk, history, alerts.
 */
import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { WORKER_CT } from "../../../holons/registerCtHolons";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiFact } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { FurnishFocus } from "../FurnishFocus";
import {
  buildFirmsCsv,
  copyText,
  downloadText,
  firmStatusLabel,
  firmTagLabel,
} from "./helpers";
import type { FirmRow, TalkLine, WorkerMeeting, WorkerVessel } from "./types";

function focusFurnish(n: number) {
  return () => {
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-holon-id="${furnishFocusId("worker", n)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
}

export type DetailsDoorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vessel: WorkerVessel | null;
};

export function DetailsDoor({ open, onOpenChange, vessel }: DetailsDoorProps) {
  const loFi = useDeskPalette();
  if (!vessel) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <HolonBoundary id={WORKER_CT.details.id} label={WORKER_CT.details.label} t={light}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {vessel.rulesLocked ? <Lock className="size-4" /> : null}
            Locked rules
          </SheetTitle>
          <SheetDescription>{vessel.name}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 pt-4">
          <FurnishFocus
            persona="worker"
            n={18}
            label="Locked rules grid"
            onFocus={focusFurnish(18)}
            style={{ display: "block", width: "100%" }}
          >
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}
            >
              <LoFiFact label="Per meeting" value={`$${vessel.price}`} />
              <LoFiFact label="Target" value={`${vessel.target} meetings`} />
              <LoFiFact
                label="Who counts"
                value={`${vessel.seniority}, ${vessel.meetingLengthMin}+ min`}
              />
              <LoFiFact label="Custodian" value={vessel.custodian} />
            </div>
          </FurnishFocus>
          <FurnishFocus
            persona="worker"
            n={20}
            label="What counts checklist"
            onFocus={focusFurnish(20)}
            style={{ display: "block", width: "100%" }}
          >
            <div>
              <div className="mb-2 text-xs font-medium" style={{ color: loFi.label }}>
                What counts
              </div>
              <ul className="flex flex-col gap-1 text-sm">
                {vessel.whatCounts.map((r) => (
                  <li key={r.id} style={{ color: r.on ? loFi.ink : loFi.muted }}>
                    {r.on ? "✓" : "○"} {r.label}
                  </li>
                ))}
              </ul>
            </div>
          </FurnishFocus>
          <FurnishFocus
            persona="worker"
            n={19}
            label="Sample packet example"
            onFocus={focusFurnish(19)}
            style={{ display: "block", width: "100%" }}
          >
            <div>
              <div className="mb-1 text-xs font-medium" style={{ color: loFi.label }}>
                Sample packet
              </div>
              <p className="text-sm leading-relaxed" style={{ color: loFi.label }}>
                {vessel.samplePacketExample}
              </p>
            </div>
          </FurnishFocus>
        </div>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export type FirmsDoorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firms: FirmRow[];
  vesselName?: string;
};

export function FirmsDoor({ open, onOpenChange, firms, vesselName }: FirmsDoorProps) {
  const loFi = useDeskPalette();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return firms;
    return firms.filter((f) => f.name.toLowerCase().includes(q));
  }, [firms, query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <HolonBoundary id={WORKER_CT.firms.id} label={WORKER_CT.firms.label} t={light}>
        <SheetHeader>
          <SheetTitle>Target firms</SheetTitle>
          <SheetDescription>{vesselName ?? "Read-only from Operator + client blocks"}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 pt-4">
          <FurnishFocus
            persona="worker"
            n={21}
            label="Firms search/filter"
            onFocus={focusFurnish(21)}
            style={{ display: "block", width: "100%" }}
          >
            <Input
              placeholder="Search firms…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </FurnishFocus>
          <FurnishFocus
            persona="worker"
            n={24}
            label="Export CSV of firm list"
            onFocus={focusFurnish(24)}
          >
            <LoFiButton
              variant="quiet"
              onClick={() => downloadText("firms.csv", buildFirmsCsv(filtered))}
            >
              Export CSV
            </LoFiButton>
          </FurnishFocus>
          <div className="flex flex-col">
            {filtered.map((f) => {
              const tag = firmTagLabel(f.tag);
              return (
                <div
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b py-2.5 text-sm"
                  style={{ borderColor: loFi.stroke }}
                >
                  <div>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-xs" style={{ color: loFi.label }}>
                      {firmStatusLabel(f.status)}
                      {tag ? (
                        <FurnishFocus
                          persona="worker"
                          n={22}
                          label="Firm tag: competitor / customer / dream"
                          onFocus={focusFurnish(22)}
                        >
                          <span>{" · " + tag}</span>
                        </FurnishFocus>
                      ) : null}
                      {f.blockedBy ? (
                        <FurnishFocus
                          persona="worker"
                          n={23}
                          label="Blocked-by Operator vs Client"
                          onFocus={focusFurnish(23)}
                        >
                          <span>{` · blocked by ${f.blockedBy}`}</span>
                        </FurnishFocus>
                      ) : null}
                    </div>
                  </div>
                  {f.note ? (
                    <span className="text-xs" style={{ color: loFi.muted }}>
                      {f.note}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export type TalkDoorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: TalkLine[];
};

export function TalkDoor({ open, onOpenChange, lines }: TalkDoorProps) {
  const loFi = useDeskPalette();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Talk tracks</SheetTitle>
          <SheetDescription>Copy lines — no client chat</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 pt-4">
          {lines.map((line) => (
            <div
              key={line.id}
              className="flex flex-col gap-2 border-b pb-3"
              style={{ borderColor: loFi.stroke }}
            >
              <p className="text-sm leading-relaxed">{line.text}</p>
              <div className="flex items-center justify-between gap-2">
                {line.lastUsed ? (
                  <FurnishFocus
                    persona="worker"
                    n={26}
                    label='"last used" stamp'
                    onFocus={focusFurnish(26)}
                  >
                    <span className="text-xs" style={{ color: loFi.muted }}>
                      {line.lastUsed}
                    </span>
                  </FurnishFocus>
                ) : (
                  <span />
                )}
                <FurnishFocus
                  persona="worker"
                  n={25}
                  label="Copy talk track to clipboard"
                  onFocus={focusFurnish(25)}
                >
                  <LoFiButton variant="quiet" onClick={() => copyText(line.text)}>
                    Copy
                  </LoFiButton>
                </FurnishFocus>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export type HistoryDoorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vessel: WorkerVessel | null;
};

export function HistoryDoor({ open, onOpenChange, vessel }: HistoryDoorProps) {
  const loFi = useDeskPalette();
  if (!vessel) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Vessel history</SheetTitle>
          <SheetDescription>{vessel.name}</SheetDescription>
        </SheetHeader>
        <FurnishFocus
          persona="worker"
          n={27}
          label="Invite → fund → launch timeline"
          onFocus={focusFurnish(27)}
          style={{ display: "block", width: "100%" }}
        >
          <div className="flex flex-col pt-4">
            {vessel.history.map((e) => (
              <div
                key={e.id}
                className="flex justify-between gap-4 border-b py-2.5 text-sm"
                style={{ borderColor: loFi.stroke }}
              >
                <span>{e.label}</span>
                <span style={{ color: loFi.muted }}>{e.at}</span>
              </div>
            ))}
          </div>
        </FurnishFocus>
      </SheetContent>
    </Sheet>
  );
}

export type AlertsDoorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  digest: boolean;
  onDigest: (v: boolean) => void;
  quietHours: boolean;
  onQuietHours: (v: boolean) => void;
};

export function AlertsDoor({
  open,
  onOpenChange,
  digest,
  onDigest,
  quietHours,
  onQuietHours,
}: AlertsDoorProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Alert prefs</SheetTitle>
          <SheetDescription>Local CT — client stop and releases</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 pt-4 text-sm">
          <FurnishFocus
            persona="worker"
            n={28}
            label="Email digest vs instant"
            onFocus={focusFurnish(28)}
            style={{ display: "flex", width: "100%" }}
          >
            <label className="flex w-full items-center justify-between gap-3">
              <span>Email digest (not instant)</span>
              <input
                type="checkbox"
                checked={digest}
                onChange={(e) => onDigest(e.target.checked)}
              />
            </label>
          </FurnishFocus>
          <FurnishFocus
            persona="worker"
            n={29}
            label="Quiet hours toggle"
            onFocus={focusFurnish(29)}
            style={{ display: "flex", width: "100%" }}
          >
            <label className="flex w-full items-center justify-between gap-3">
              <span>Quiet hours 8pm–8am</span>
              <input
                type="checkbox"
                checked={quietHours}
                onChange={(e) => onQuietHours(e.target.checked)}
              />
            </label>
          </FurnishFocus>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export type PacketPeekDoorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: WorkerMeeting | null;
  workerName: string;
};

export function PacketPeekDoor({
  open,
  onOpenChange,
  meeting,
  workerName,
}: PacketPeekDoorProps) {
  const loFi = useDeskPalette();
  if (!meeting) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <HolonBoundary id={WORKER_CT.packet.id} label={WORKER_CT.packet.label} t={light}>
        <SheetHeader>
          <SheetTitle>
            Meeting #{meeting.number} · {meeting.who}
          </SheetTitle>
          <SheetDescription>Packet the client sees — read only</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 pt-4 text-sm">
          <LoFiFact label="Role" value={meeting.role} />
          <LoFiFact label="Company" value={`${meeting.company} · ${meeting.size}`} />
          <LoFiFact label="Pain" value={meeting.pain} />
          <LoFiFact label="When" value={meeting.whenAbsolute} />
          {meeting.lengthMin > 0 ? (
            <LoFiFact label="Length" value={`${meeting.lengthMin} min`} />
          ) : null}
          <LoFiFact label="Location" value={`${meeting.city} · ${meeting.timezone}`} />
          <p className="text-xs" style={{ color: loFi.muted }}>
            Logged by {workerName}
          </p>
          {meeting.receiptId ? (
            <p className="text-xs" style={{ color: loFi.muted }}>
              Receipt · {meeting.receiptId}
            </p>
          ) : null}
        </div>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}
