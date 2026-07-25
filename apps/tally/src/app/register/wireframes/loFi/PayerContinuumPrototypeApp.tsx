import { useState } from "react";
import { LoFiButton } from "./LoFiPrimitives";
import {
  LoFiPanel,
  LoFiPersonaChrome,
  PERSONA_SEED,
  type LoFiStage,
} from "./LoFiPersonaChrome";
import { loFi } from "./loFiPalette";

/**
 * Guest → Business Client continuum (same person).
 * Sit truth: first escrow fund converts Guest into BC — not a second personality.
 * Interpretation: one click-through; both Register outcome graphs enter here.
 */

export type PayerEntry = "guest" | "business-client";

type Phase = "guest" | "client";

type Screen =
  | "invite"
  | "walk"
  | "fund"
  | "converted"
  | "campaigns"
  | "meetings"
  | "meeting"
  | "quality"
  | "low-motion"
  | "ledger";

type ClientNav = "campaigns" | "meetings" | "escrow";

type MeetingStatus = "released" | "pending" | "disputed";

type BookedMeeting = {
  id: string;
  number: number;
  who: string;
  role: string;
  company: string;
  size: string;
  pain: string;
  when: string;
  status: MeetingStatus;
};

const GUEST_STAGES: LoFiStage[] = [
  { id: "invite", label: "Invite", hint: "Vessel clarity" },
  { id: "walk", label: "Walk", hint: "Operator fluency on price" },
  { id: "fund", label: "Fund", hint: "Escrow hold" },
  { id: "converted", label: "Receipt", hint: "Now Business Client" },
];

const CLIENT_STAGES: LoFiStage[] = [
  { id: "campaigns", label: "My campaigns", hint: "Escrow relationships" },
  { id: "meetings", label: "Meeting history", hint: "Every booking against escrow" },
  { id: "quality", label: "Quality gate", hint: "Dispute what doesn't count" },
  { id: "low-motion", label: "Low motion", hint: "Honesty + reclaim" },
  { id: "ledger", label: "Ledger", hint: "Held vs released" },
];

/** Seed history — Meetings nav is this list; detail = packet + receipt. */
const SEED_MEETINGS: BookedMeeting[] = [
  {
    id: "m1",
    number: 1,
    who: "Sam Ortiz",
    role: "VP Engineering",
    company: "Brightline Co",
    size: "310 employees",
    pain: "Hiring freeze broke inbound; needs outbound meetings",
    when: "Mon 10:00–10:30am",
    status: "released",
  },
  {
    id: "m2",
    number: 2,
    who: "Jordan Blake",
    role: "Director of IT",
    company: "Rivera Corp",
    size: "520 employees",
    pain: "Evaluating outbound tools; budget owner for Q3 pipeline",
    when: "Thu 2:00–2:30pm",
    status: "pending",
  },
];

function statusLabel(s: MeetingStatus): string {
  if (s === "released") return "Released";
  if (s === "disputed") return "Disputed";
  return "Pending";
}

/** Sit §4 — dead-simple contract, not a “shared object” chrome box. */
function VesselContract({ density = "full" }: { density?: "full" | "line" }) {
  if (density === "line") {
    return (
      <div style={{ fontSize: 12, color: loFi.label, lineHeight: 1.45 }}>
        {PERSONA_SEED.meetingsTarget} meetings at ${PERSONA_SEED.pricePerMeeting}.{" "}
        {PERSONA_SEED.seniority}, {PERSONA_SEED.meetingLengthMin}+ min. Reclaim after{" "}
        {PERSONA_SEED.holdDays}d.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: loFi.ink, lineHeight: 1.4 }}>
        ${PERSONA_SEED.escrowTotal} held in escrow. Every qualified {PERSONA_SEED.seniority} meeting (
        {PERSONA_SEED.meetingLengthMin}+ min) releases ${PERSONA_SEED.pricePerMeeting}. Unspent
        returns after {PERSONA_SEED.holdDays} days.
      </div>
      <div style={{ fontSize: 12, color: loFi.label, lineHeight: 1.45 }}>
        Who counts: {PERSONA_SEED.seniority} at {PERSONA_SEED.companyName}.{" "}
        {PERSONA_SEED.meetingsTarget} meetings. Not ops spend.
      </div>
    </div>
  );
}

const OPERATOR_BLURB = `${PERSONA_SEED.companyName} fits ${PERSONA_SEED.acvBand} buyers who need pipeline without agency retainers. $${PERSONA_SEED.pricePerMeeting} per meeting for ${PERSONA_SEED.meetingsTarget} qualified ${PERSONA_SEED.seniority} conversations. Price stands behind that size, not a house rate.`;

function GuestActions({
  primary,
  onPrimary,
  quiet,
  onQuiet,
}: {
  primary: string;
  onPrimary: () => void;
  quiet?: string;
  onQuiet?: () => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
      <LoFiButton onClick={onPrimary}>{primary}</LoFiButton>
      {quiet && onQuiet ? (
        <LoFiButton variant="quiet" onClick={onQuiet}>
          {quiet}
        </LoFiButton>
      ) : null}
    </div>
  );
}

function entryScreen(entry: PayerEntry): Screen {
  return entry === "business-client" ? "campaigns" : "invite";
}

function entryPhase(entry: PayerEntry): Phase {
  return entry === "business-client" ? "client" : "guest";
}

type Props = {
  /** Which Register outcome graph opened this continuum. */
  entry?: PayerEntry;
};

/**
 * One playable payer journey. Guest fund → conversion receipt → BC shell
 * (meetings, quality, low-motion, ledger) without switching apps.
 */
export function PayerContinuumPrototypeApp({ entry = "guest" }: Props) {
  const [phase, setPhase] = useState<Phase>(() => entryPhase(entry));
  const [screen, setScreen] = useState<Screen>(() => entryScreen(entry));
  const [meetings, setMeetings] = useState<BookedMeeting[]>(() =>
    entry === "business-client" ? SEED_MEETINGS : [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    () => (entry === "business-client" ? SEED_MEETINGS[1]?.id ?? SEED_MEETINGS[0]?.id ?? null : null),
  );
  const [reclaimed, setReclaimed] = useState(false);

  const selected = meetings.find((m) => m.id === selectedId) ?? null;
  const releasedCount = meetings.filter((m) => m.status === "released").length;
  const disputedCount = meetings.filter((m) => m.status === "disputed").length;
  const held = reclaimed
    ? 0
    : PERSONA_SEED.escrowTotal - releasedCount * PERSONA_SEED.pricePerMeeting;
  const released = releasedCount * PERSONA_SEED.pricePerMeeting;

  const openMeeting = (id: string) => {
    setSelectedId(id);
    setScreen("meeting");
  };

  const becomeClient = (next: Screen = "converted") => {
    setPhase("client");
    if (meetings.length === 0) {
      setMeetings(SEED_MEETINGS);
      setSelectedId(SEED_MEETINGS[1]?.id ?? SEED_MEETINGS[0]?.id ?? null);
    }
    setScreen(next);
  };

  const jumpStage = (stageId: string) => {
    if (phase === "guest" || stageId === "invite" || stageId === "walk" || stageId === "fund") {
      if (stageId === "invite") {
        setPhase("guest");
        setScreen("invite");
      } else if (stageId === "walk") {
        setPhase("guest");
        setScreen("walk");
      } else if (stageId === "fund") {
        setPhase("guest");
        setScreen("fund");
      } else if (stageId === "converted") {
        becomeClient("converted");
      }
      return;
    }
    if (stageId === "campaigns") setScreen("campaigns");
    else if (stageId === "meetings") setScreen("meetings");
    else if (stageId === "quality") {
      if (!selectedId && meetings[0]) setSelectedId(meetings[0].id);
      setScreen("quality");
    } else if (stageId === "low-motion") setScreen("low-motion");
    else setScreen("ledger");
  };

  const stages = phase === "guest" ? GUEST_STAGES : CLIENT_STAGES;
  const activeStageId =
    phase === "guest"
      ? screen === "converted"
        ? "converted"
        : screen === "invite" || screen === "walk" || screen === "fund"
          ? screen
          : "fund"
      : screen === "meetings" || screen === "meeting" || screen === "quality"
        ? screen === "quality"
          ? "quality"
          : "meetings"
        : screen === "low-motion"
          ? "low-motion"
          : screen === "ledger"
            ? "ledger"
            : "campaigns";

  const showSidebar = phase === "client" && screen !== "converted";
  const nav: ClientNav =
    screen === "meetings" || screen === "meeting" || screen === "quality"
      ? "meetings"
      : screen === "ledger" || screen === "low-motion"
        ? "escrow"
        : "campaigns";

  const onNav = (id: string) => {
    if (id === "meetings") setScreen("meetings");
    else if (id === "escrow") setScreen("ledger");
    else setScreen("campaigns");
  };

  return (
    <LoFiPersonaChrome
      personaLabel={phase === "guest" ? "Guest" : "Business Client"}
      stages={stages}
      activeStageId={activeStageId}
      onJumpStage={jumpStage}
      navItems={
        showSidebar
          ? [
              { id: "campaigns", label: "Campaigns" },
              { id: "meetings", label: "Meetings" },
              { id: "escrow", label: "Escrow" },
            ]
          : []
      }
      nav={nav}
      onNav={onNav}
      showSidebar={showSidebar}
    >
      {screen === "invite" ? (
        <LoFiPanel title={PERSONA_SEED.campaignName} caption={`From Operator for ${PERSONA_SEED.clientName}`}>
          <VesselContract />
          <GuestActions primary="Walk this with Operator" onPrimary={() => setScreen("walk")} />
        </LoFiPanel>
      ) : null}

      {screen === "walk" ? (
        <LoFiPanel
          title="Why this price"
          caption={`${PERSONA_SEED.campaignName}. ${PERSONA_SEED.acvBand}.`}
        >
          <div style={{ fontSize: 14, color: loFi.ink, lineHeight: 1.5, maxWidth: 520 }}>
            {OPERATOR_BLURB}
          </div>
          <VesselContract density="line" />
          <GuestActions
            primary="Terms are clear"
            onPrimary={() => setScreen("fund")}
            quiet="Walk away"
            onQuiet={() => setScreen("invite")}
          />
        </LoFiPanel>
      ) : null}

      {screen === "fund" ? (
        <LoFiPanel title="Fund escrow" caption="Held until qualified meetings. Unspent can be reclaimed.">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              maxWidth: 420,
            }}
          >
            <span style={{ fontSize: 12, color: loFi.label }}>Hold</span>
            <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>
              ${PERSONA_SEED.escrowTotal}
            </span>
          </div>
          <div style={{ fontSize: 12, color: loFi.label, lineHeight: 1.45, maxWidth: 480 }}>
            Releases ${PERSONA_SEED.pricePerMeeting} per qualified meeting. Unspent reclaimable after{" "}
            {PERSONA_SEED.holdDays} days.
          </div>
          <GuestActions
            primary="Fund"
            onPrimary={() => becomeClient("converted")}
            quiet="Back"
            onQuiet={() => setScreen("walk")}
          />
        </LoFiPanel>
      ) : null}

      {screen === "converted" ? (
        <LoFiPanel
          title="Business Client"
          caption={`${PERSONA_SEED.clientName}. $${PERSONA_SEED.escrowTotal} in hold.`}
        >
          <div style={{ fontSize: 13, color: loFi.label, lineHeight: 1.5, maxWidth: 480 }}>
            Operator launches next. Meeting packets and release receipts appear on your calendar.
          </div>
          <GuestActions primary="My campaigns" onPrimary={() => setScreen("campaigns")} />
        </LoFiPanel>
      ) : null}

      {screen === "campaigns" ? (
        <LoFiPanel title="My campaigns" caption="Operator-created vessels">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              padding: "10px 0",
              borderBottom: `1px solid ${loFi.stroke}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{PERSONA_SEED.campaignName}</div>
              <div style={{ fontSize: 12, color: loFi.label }}>
                Booked {meetings.length}/{PERSONA_SEED.meetingsTarget}. $
                {PERSONA_SEED.pricePerMeeting} per meeting.
              </div>
            </div>
            <LoFiButton onClick={() => setScreen("meetings")}>Meetings</LoFiButton>
          </div>
        </LoFiPanel>
      ) : null}

      {screen === "meetings" ? (
        <LoFiPanel
          title="Meetings"
          caption={PERSONA_SEED.campaignName}
        >
          {meetings.length === 0 ? (
            <div style={{ fontSize: 13, color: loFi.label, padding: "12px 0" }}>
              No meetings booked yet.
            </div>
          ) : (
            meetings.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => openMeeting(m.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  width: "100%",
                  padding: "12px 0",
                  border: "none",
                  borderBottom: `1px solid ${loFi.stroke}`,
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  color: loFi.ink,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {m.who}
                  </div>
                  <div style={{ fontSize: 12, color: loFi.label }}>
                    {m.company}, {m.when}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: loFi.muted, flexShrink: 0 }}>
                  {statusLabel(m.status)}
                  {m.status === "released" ? ` $${PERSONA_SEED.pricePerMeeting}` : ""}
                </div>
              </button>
            ))
          )}
        </LoFiPanel>
      ) : null}

      {screen === "meeting" && selected ? (
        <LoFiPanel title={selected.who} caption={selected.when}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {selected.role}, {selected.company}
          </div>
          <div style={{ fontSize: 12, color: loFi.label }}>{selected.size}</div>
          <div style={{ fontSize: 13, lineHeight: 1.45, maxWidth: 480 }}>{selected.pain}</div>
          <div style={{ fontSize: 12, color: loFi.label }}>
            {selected.status === "released"
              ? `Released $${PERSONA_SEED.pricePerMeeting}`
              : selected.status === "disputed"
                ? "Dispute pending. Release held."
                : `Pending release. $${PERSONA_SEED.pricePerMeeting}.`}
            Meeting {selected.number} of {PERSONA_SEED.meetingsTarget}.
          </div>
          <GuestActions
            primary={selected.status === "pending" ? "Accept release" : "Back to history"}
            onPrimary={() => {
              if (selected.status === "pending") {
                setMeetings((prev) =>
                  prev.map((m) =>
                    m.id === selected.id ? { ...m, status: "released" as const } : m,
                  ),
                );
              }
              setScreen("meetings");
            }}
            quiet={selected.status === "pending" ? "This doesn't count" : "Escrow ledger"}
            onQuiet={() =>
              selected.status === "pending" ? setScreen("quality") : setScreen("ledger")
            }
          />
        </LoFiPanel>
      ) : null}

      {screen === "quality" && selected ? (
        <LoFiPanel title="Quality gate" caption="Dispute against locked criteria">
          <div style={{ fontSize: 13, lineHeight: 1.45, maxWidth: 480 }}>
            {selected.who}. Wrong seniority, no-show, or fake profile?
          </div>
          <VesselContract density="line" />
          <GuestActions
            primary="Dispute"
            onPrimary={() => {
              setMeetings((prev) =>
                prev.map((m) =>
                  m.id === selected.id ? { ...m, status: "disputed" as const } : m,
                ),
              );
              setScreen("meetings");
            }}
            quiet="Back"
            onQuiet={() => setScreen("meeting")}
          />
        </LoFiPanel>
      ) : null}

      {screen === "low-motion" ? (
        <LoFiPanel title="Low motion" caption="Honesty and decision rights">
          <div style={{ fontSize: 14, color: loFi.ink, lineHeight: 1.5, maxWidth: 520 }}>
            We’ve run this angle for two weeks with zero bookings. Message may be wrong, or ICP too
            narrow. Adjust with Operator, or reclaim unspent escrow.
          </div>
          <GuestActions
            primary="Reclaim unspent"
            onPrimary={() => {
              setReclaimed(true);
              setScreen("ledger");
            }}
            quiet="Keep running"
            onQuiet={() => setScreen("ledger")}
          />
        </LoFiPanel>
      ) : null}

      {screen === "ledger" ? (
        <LoFiPanel title="Escrow ledger" caption={PERSONA_SEED.campaignName}>
          <div style={{ fontSize: 12, color: loFi.label }}>
            Booked {meetings.length} of {PERSONA_SEED.meetingsTarget}. Released {releasedCount}
            {disputedCount ? `. ${disputedCount} dispute pending` : ""}
            {reclaimed ? ". Reclaimed" : ""}.
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 11, color: loFi.muted }}>Held</div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>${held}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: loFi.muted }}>Released</div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>${released}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 4 }}>
            {meetings.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => openMeeting(m.id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "8px 0",
                  border: "none",
                  borderBottom: `1px solid ${loFi.stroke}`,
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  color: loFi.label,
                  textAlign: "left",
                }}
              >
                <span>
                  Meeting #{m.number} {m.who}
                </span>
                <span>
                  {m.status === "released"
                    ? `$${PERSONA_SEED.pricePerMeeting}`
                    : statusLabel(m.status)}
                </span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <LoFiButton variant="quiet" onClick={() => setScreen("meetings")}>
              Full history
            </LoFiButton>
            <LoFiButton variant="quiet" onClick={() => setScreen("low-motion")}>
              Low motion
            </LoFiButton>
            <LoFiButton
              variant="quiet"
              disabled={reclaimed || held <= 0}
              onClick={() => setReclaimed(true)}
            >
              {reclaimed ? "Reclaimed" : "Reclaim unspent"}
            </LoFiButton>
          </div>
        </LoFiPanel>
      ) : null}
    </LoFiPersonaChrome>
  );
}
