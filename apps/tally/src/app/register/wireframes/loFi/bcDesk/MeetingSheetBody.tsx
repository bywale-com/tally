import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoFiButton } from "../LoFiPrimitives";
import { LoFiFact } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import { FurnishFocus } from "../FurnishFocus";
import { copyText, downloadText, escrowLine } from "./helpers";
import type { BookedMeeting } from "./types";

export type MeetingSheetBodyProps = {
  meeting: BookedMeeting;
  vesselPrice: number;
  vesselTarget: number;
  releasedCount: number;
  seniorityRule: string;
  meetingLengthMin: number;
  whatCounts: { id: string; label: string; on: boolean }[];
  onAccept: () => void;
  onDispute: (reason: string, evidence: string) => void;
  onCancel: () => void;
  onBrandFlag: (company: string) => void;
};

type SentEntry = { at: string; to: string };

const RECENT_KEY = "tally-bc-forward-recipients";
const DISPUTE_REASONS = [
  ["wrong-seniority", "Wrong seniority"],
  ["no-show", "No-show"],
  ["fake-profile", "Fake profile"],
  ["short", "Under locked length"],
  ["wrong-pain", "Wrong problem"],
  ["brand", "Brand only (no money hold)"],
] as const;

function loadRecentRecipients(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function pushRecentRecipient(email: string) {
  const trimmed = email.trim();
  if (!trimmed) return;
  const prev = loadRecentRecipients().filter((e) => e !== trimmed);
  prev.unshift(trimmed);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(prev.slice(0, 5)));
  } catch {
    /* local only */
  }
}

function packetText(
  m: BookedMeeting,
  seniorityRule: string,
  meetingLengthMin: number,
  price: number,
) {
  return [
    `Meeting #${m.number}`,
    `Who: ${m.who}`,
    `Company: ${m.company} (${m.size})`,
    `Role: ${m.role}`,
    `Pain: ${m.pain}`,
    `When: ${m.whenAbsolute}`,
    `Length: ${m.lengthMin > 0 ? `${m.lengthMin} min` : "—"}`,
    `Attendance: ${m.attended ? "Attended" : "Not yet"}`,
    `City: ${m.city}`,
    `Timezone: ${m.timezone}`,
    `Rules: ${seniorityRule}, ${meetingLengthMin}+ min`,
    `Escrow: ${escrowLine(m, price)}`,
    m.talkTrackUsed ? `Talk track: ${m.talkTrackUsed}` : "",
    m.workerLogged,
  ]
    .filter(Boolean)
    .join("\n");
}

export function MeetingSheetBody({
  meeting: m,
  vesselPrice,
  vesselTarget,
  releasedCount,
  seniorityRule,
  meetingLengthMin,
  whatCounts,
  onAccept,
  onDispute,
  onCancel,
  onBrandFlag,
}: MeetingSheetBodyProps) {
  const loFi = useDeskPalette();
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState<string>("wrong-seniority");
  const [evidence, setEvidence] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<string | null>(null);
  const [acceptConfirm, setAcceptConfirm] = useState(false);
  const [forwardTo, setForwardTo] = useState("");
  const [recentRecipients, setRecentRecipients] = useState<string[]>(() =>
    loadRecentRecipients(),
  );
  const [sentLog, setSentLog] = useState<SentEntry[]>([]);
  const [sentToast, setSentToast] = useState(false);
  const [copyFlash, setCopyFlash] = useState(false);

  useEffect(() => {
    setDisputeOpen(false);
    setEvidence("");
    setEvidenceFile(null);
    setAcceptConfirm(false);
    setForwardTo("");
    setSentLog([]);
  }, [m.id]);

  const canAccept = releasedCount < vesselTarget;
  const deepLink = `${window.location.origin}${window.location.pathname}?meeting=${m.id}`;

  const whyCounted = [
    {
      label: `${seniorityRule} or above`,
      met: m.fitSeniority,
    },
    {
      label: `At least ${meetingLengthMin} minutes`,
      met: m.fitLength,
    },
    {
      label: "Prospect attended",
      met: m.attended,
    },
  ];

  const sendForward = () => {
    const to = forwardTo.trim();
    if (!to) return;
    pushRecentRecipient(to);
    setRecentRecipients(loadRecentRecipients());
    setSentLog((prev) => [
      { at: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }), to },
      ...prev,
    ]);
    setForwardTo("");
    setSentToast(true);
    window.setTimeout(() => setSentToast(false), 2000);
  };

  const attachEvidence = () => {
    setEvidenceFile(`evidence-${m.number}-screenshot.png`);
  };

  const submitDispute = () => {
    if (disputeReason === "brand") {
      onBrandFlag(m.company);
      return;
    }
    const note = [evidence.trim(), evidenceFile ? `Attached: ${evidenceFile}` : ""]
      .filter(Boolean)
      .join(" · ");
    onDispute(disputeReason, note);
  };

  const printPacket = () => {
    const body = packetText(m, seniorityRule, meetingLengthMin, vesselPrice);
    downloadText(`meeting-${m.number}-packet.txt`, body);
  };

  return (
    <div className="flex flex-col gap-4 pb-6 text-sm">
      <div className="flex flex-wrap gap-2">
        <FurnishFocus persona="bc" n={58} label="Print / PDF packet">
          <LoFiButton variant="quiet" onClick={printPacket}>
            Print packet
          </LoFiButton>
        </FurnishFocus>
        <FurnishFocus persona="bc" n={59} label="Deep link copy">
          <LoFiButton
            variant="quiet"
            onClick={() => {
              copyText(deepLink);
              setCopyFlash(true);
              window.setTimeout(() => setCopyFlash(false), 1600);
            }}
          >
            {copyFlash ? "Copied" : "Copy link"}
          </LoFiButton>
        </FurnishFocus>
      </div>

      <FurnishFocus
        persona="bc"
        n={46}
        label="Packet sections: Who · Company · Role · Pain · Length · Attendance"
        style={{ display: "block", width: "100%" }}
      >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <LoFiFact label="Who" value={m.who} />
          <LoFiFact label="Company" value={`${m.company} · ${m.size}`} />
          <LoFiFact label="Role" value={m.role} />
          <LoFiFact
            label="Length"
            value={m.lengthMin > 0 ? `${m.lengthMin} min` : "—"}
          />
        </div>

        <div>
          <div className="text-[11px]" style={{ color: loFi.label }}>
            Pain
          </div>
          <p className="mt-1 leading-relaxed" style={{ color: loFi.ink }}>
            {m.pain}
          </p>
        </div>

        <LoFiFact
          label="Attendance"
          value={m.attended ? "Attended" : m.status === "upcoming" ? "Scheduled" : "Did not attend"}
        />
      </div>
      </FurnishFocus>

      <FurnishFocus
        persona="bc"
        n={47}
        label="Why this counted locked-rules checklist"
        style={{ display: "block", width: "100%" }}
      >
      <div>
        <div className="mb-2 text-[11px] font-medium" style={{ color: loFi.label }}>
          Why this counted
        </div>
        <ul className="flex flex-col gap-1.5">
          {whyCounted.map((row) => (
            <li
              key={row.label}
              className="flex items-center gap-2 text-xs"
              style={{ color: row.met ? loFi.ink : loFi.muted }}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: row.met ? "#22c55e" : loFi.stroke }}
              />
              {row.label}
            </li>
          ))}
        </ul>
      </div>
      </FurnishFocus>

      <FurnishFocus
        persona="bc"
        n={48}
        label="Map pin / timezone for the meeting"
        style={{ display: "block", width: "100%" }}
      >
      <div className="grid grid-cols-2 gap-3">
        <LoFiFact label="City" value={m.city} />
        <LoFiFact label="Timezone" value={m.timezone} />
      </div>
      </FurnishFocus>

      <FurnishFocus persona="bc" n={49} label="Recording stub: no recording by design">
        <LoFiFact label="Recording" value="No recording (by design)" />
      </FurnishFocus>

      <FurnishFocus
        persona="bc"
        n={60}
        label="Side-by-side: locked rule vs Worker logged"
        style={{ display: "block", width: "100%" }}
      >
      <div>
        <div className="mb-2 text-[11px] font-medium" style={{ color: loFi.label }}>
          Locked rule vs Worker logged
        </div>
        <div
          className="grid grid-cols-2 gap-3 rounded-md border p-3 text-xs"
          style={{ borderColor: loFi.stroke }}
        >
          <div>
            <div className="mb-1 font-medium" style={{ color: loFi.label }}>
              Locked
            </div>
            <ul className="flex flex-col gap-1" style={{ color: loFi.ink }}>
              {whatCounts.filter((w) => w.on).map((w) => (
                <li key={w.id}>{w.label}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1 font-medium" style={{ color: loFi.label }}>
              Worker logged
            </div>
            <p style={{ color: loFi.ink }}>{m.workerLogged}</p>
          </div>
        </div>
      </div>
      </FurnishFocus>

      {m.talkTrackUsed ? (
        <FurnishFocus
          persona="bc"
          n={57}
          label="Talk track used one-liner (Worker-attributed)"
          style={{ display: "block", width: "100%" }}
        >
        <div>
          <div className="text-[11px]" style={{ color: loFi.label }}>
            Talk track used
          </div>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: loFi.ink }}>
            {m.talkTrackUsed}
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: loFi.muted }}>
            {m.workerLogged}
          </p>
        </div>
        </FurnishFocus>
      ) : null}

      {m.statusTimeline.length > 0 ? (
        <FurnishFocus
          persona="bc"
          n={53}
          label="Dispute: timeline of status changes"
          style={{ display: "block", width: "100%" }}
        >
        <div>
          <div className="mb-2 text-[11px] font-medium" style={{ color: loFi.label }}>
            Status
          </div>
          <ol className="flex flex-col gap-1.5">
            {m.statusTimeline.map((step, i) => (
              <li
                key={`${step.at}-${step.label}`}
                className="flex gap-2 text-xs"
                style={{ color: i === m.statusTimeline.length - 1 ? loFi.ink : loFi.muted }}
              >
                <span className="shrink-0 tabular-nums">{step.at}</span>
                <span>{step.label}</span>
              </li>
            ))}
          </ol>
        </div>
        </FurnishFocus>
      ) : null}

      <p className="text-xs" style={{ color: loFi.label }}>
        {escrowLine(m, vesselPrice)}
      </p>

      {m.status === "pending" ? (
        <div className="flex flex-col gap-2">
          {!acceptConfirm ? (
            <LoFiButton
              onClick={() => setAcceptConfirm(true)}
              disabled={!canAccept}
            >
              Accept release
            </LoFiButton>
          ) : (
            <FurnishFocus
              persona="bc"
              n={54}
              label="Accept release: confirmation with $ and meeting #"
              style={{ display: "block", width: "100%" }}
            >
            <div
              className="flex flex-col gap-2 rounded-md border p-3"
              style={{ borderColor: loFi.stroke }}
            >
              <p className="text-xs leading-relaxed">
                Release ${vesselPrice} for meeting #{m.number}?
              </p>
              <div className="flex gap-2">
                <LoFiButton
                  onClick={() => {
                    setAcceptConfirm(false);
                    onAccept();
                  }}
                >
                  Confirm release
                </LoFiButton>
                <LoFiButton variant="quiet" onClick={() => setAcceptConfirm(false)}>
                  Back
                </LoFiButton>
              </div>
            </div>
            </FurnishFocus>
          )}

          <LoFiButton variant="ghost" onClick={() => setDisputeOpen((o) => !o)}>
            This doesn&apos;t count
          </LoFiButton>

          {disputeOpen ? (
            <FurnishFocus
              persona="bc"
              n={52}
              label="Dispute: invite-before-form + evidence chip"
              style={{ display: "block", width: "100%" }}
            >
            <div
              className="flex flex-col gap-3 rounded-md border p-3"
              style={{ borderColor: loFi.stroke }}
            >
              <div className="text-xs font-medium">Why it doesn&apos;t count</div>
              <select
                className="h-8 w-full rounded-md border px-2 text-xs"
                style={{
                  borderColor: loFi.stroke,
                  background: loFi.white,
                  color: loFi.ink,
                }}
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              >
                {DISPUTE_REASONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Evidence note (optional)"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <LoFiButton variant="quiet" onClick={attachEvidence}>
                  Attach evidence
                </LoFiButton>
                {evidenceFile ? (
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    {evidenceFile}
                  </Badge>
                ) : null}
              </div>
              {disputeReason === "brand" ? (
                <FurnishFocus persona="bc" n={56} label="Brand-flag path lands on Firms pre-highlighted">
                  <LoFiButton variant="ghost" onClick={() => onBrandFlag(m.company)}>
                    Flag brand
                  </LoFiButton>
                </FurnishFocus>
              ) : (
                <LoFiButton onClick={submitDispute}>Dispute</LoFiButton>
              )}
            </div>
            </FurnishFocus>
          ) : null}

          <FurnishFocus
            persona="bc"
            n={55}
            label="Cancel booking: consequence line"
            style={{ display: "block", width: "100%" }}
          >
          <div className="pt-1">
            <LoFiButton variant="quiet" onClick={onCancel}>
              Cancel booking
            </LoFiButton>
            <p className="mt-1 text-[11px]" style={{ color: loFi.muted }}>
              No release. Slot freed.
            </p>
          </div>
          </FurnishFocus>
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-2 border-t pt-4" style={{ borderColor: loFi.stroke }}>
        <div className="text-xs font-medium" style={{ color: loFi.label }}>
          Forward packet
        </div>
        {recentRecipients.length > 0 ? (
          <FurnishFocus
            persona="bc"
            n={50}
            label="Forward packet: recent recipients chips"
            style={{ display: "block", width: "100%" }}
          >
          <div className="flex flex-wrap gap-1.5">
            {recentRecipients.map((email) => (
              <button
                key={email}
                type="button"
                className="rounded-full border px-2 py-0.5 text-[10px]"
                style={{
                  borderColor: loFi.stroke,
                  background: loFi.block,
                  color: loFi.ink,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
                onClick={() => setForwardTo(email)}
              >
                {email}
              </button>
            ))}
          </div>
          </FurnishFocus>
        ) : null}
        <div className="flex gap-2">
          <Input
            placeholder="ae@yourco.com"
            value={forwardTo}
            onChange={(e) => setForwardTo(e.target.value)}
          />
          <LoFiButton variant="ghost" disabled={!forwardTo.trim()} onClick={sendForward}>
            Send
          </LoFiButton>
        </div>
        <FurnishFocus
          persona="bc"
          n={51}
          label="Forward: sent toast + Sent log"
          style={{ display: "block", width: "100%" }}
        >
        <>
          {sentToast ? (
            <p className="text-[11px]" style={{ color: loFi.label }}>
              Sent
            </p>
          ) : null}
          {sentLog.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {sentLog.map((entry, i) => (
                <li key={`${entry.at}-${entry.to}-${i}`} className="text-[10px]" style={{ color: loFi.muted }}>
                  Sent · {entry.at} · {entry.to}
                </li>
              ))}
            </ul>
          ) : null}
        </>
        </FurnishFocus>
      </div>
    </div>
  );
}
