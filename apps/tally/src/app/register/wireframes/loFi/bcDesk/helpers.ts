import type {
  BookedMeeting,
  FirmRow,
  LedgerLine,
  MeetingFilter,
  MeetingStatus,
  Vessel,
  VesselState,
} from "./types";

export function stateLabel(state: VesselState) {
  if (state === "held") return "Held";
  if (state === "invited") return "Invited";
  if (state === "running") return "Running";
  if (state === "paused") return "Paused";
  if (state === "stopped") return "Stopped";
  return "Reclaimed";
}

export function firmStatusLabel(status: FirmRow["status"]) {
  if (status === "queued") return "Queued";
  if (status === "touched") return "Touched";
  if (status === "meeting") return "Meeting booked";
  return "Blocked";
}

export function firmTagLabel(tag: FirmRow["tag"]) {
  if (tag === "competitor") return "Competitor";
  if (tag === "customer") return "Customer";
  if (tag === "dream") return "Dream list";
  return null;
}

export function escrowLine(m: BookedMeeting, price: number) {
  if (m.status === "released") return `Released $${price}`;
  if (m.status === "disputed") return "Disputed. Release held.";
  if (m.status === "cancelled") return "Cancelled. No release.";
  if (m.status === "upcoming") return "Upcoming";
  return `Pending release. $${price}`;
}

export function statusChip(status: MeetingStatus) {
  if (status === "pending") return "Pending";
  if (status === "released") return "Released";
  if (status === "disputed") return "Disputed";
  if (status === "upcoming") return "Upcoming";
  return "Cancelled";
}

export function vesselSortKey(state: VesselState) {
  if (state === "running") return 0;
  if (state === "held") return 1;
  if (state === "invited") return 2;
  if (state === "paused") return 3;
  if (state === "stopped") return 4;
  return 5;
}

export function sortVessels(vessels: Vessel[]) {
  return [...vessels].sort(
    (a, b) => vesselSortKey(a.state) - vesselSortKey(b.state) || a.name.localeCompare(b.name),
  );
}

export function quietTriggerStyle(color: string) {
  return {
    padding: "6px 2px",
    border: "none",
    background: "transparent",
    color,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
  } as const;
}

export function downloadText(filename: string, body: string) {
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function copyText(text: string) {
  void navigator.clipboard?.writeText(text);
}

const STATUS_SORT: Record<MeetingStatus, number> = {
  pending: 0,
  disputed: 1,
  upcoming: 2,
  released: 3,
  cancelled: 4,
};

export function meetingSortKey(status: MeetingStatus) {
  return STATUS_SORT[status];
}

export function sortMeetings(meetings: BookedMeeting[]) {
  return [...meetings].sort(
    (a, b) =>
      meetingSortKey(a.status) - meetingSortKey(b.status) ||
      a.dayKey.localeCompare(b.dayKey) ||
      a.number - b.number,
  );
}

/** Prototype anchor: dayKey of a "today" row, else runtime today. */
export function deskTodayKey(meetings: BookedMeeting[]) {
  const todayRow = meetings.find((m) => m.group === "today");
  if (todayRow) return todayRow.dayKey;
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function parseDayKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDayKey(d: Date) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

export function weekStripDays(anchorKey: string) {
  const anchor = parseDayKey(anchorKey);
  const day = anchor.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return formatDayKey(d);
  });
}

function isInWeek(dayKey: string, anchorKey: string) {
  return weekStripDays(anchorKey).includes(dayKey);
}

export function filterMeetings(
  meetings: BookedMeeting[],
  filter: MeetingFilter,
  anchorKey: string,
) {
  if (filter === "all") return meetings;
  if (filter === "upcoming") return meetings.filter((m) => m.status === "upcoming");
  if (filter === "pending") return meetings.filter((m) => m.status === "pending");
  if (filter === "disputed") return meetings.filter((m) => m.status === "disputed");
  if (filter === "released") return meetings.filter((m) => m.status === "released");
  if (filter === "needs-you") {
    return meetings.filter((m) => m.status === "pending" || m.status === "disputed");
  }
  if (filter === "this-week") {
    return meetings.filter((m) => isInWeek(m.dayKey, anchorKey));
  }
  return meetings;
}

export function companyInitial(company: string) {
  const word = company.trim().split(/\s+/)[0] ?? company;
  return word.charAt(0).toUpperCase();
}

export function stakeAmount(status: MeetingStatus, price: number) {
  if (status === "released" || status === "cancelled") return null;
  if (status === "upcoming") return null;
  return price;
}

const GROUP_LABEL: Record<BookedMeeting["group"], string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  earlier: "Earlier",
  later: "Later",
};

export function groupMeetings(meetings: BookedMeeting[]) {
  const sorted = sortMeetings(meetings);
  const buckets = new Map<BookedMeeting["group"], BookedMeeting[]>();
  for (const m of sorted) {
    const list = buckets.get(m.group) ?? [];
    list.push(m);
    buckets.set(m.group, list);
  }
  return (["today", "tomorrow", "earlier", "later"] as const)
    .filter((key) => buckets.has(key))
    .map((key) => ({
      key,
      label: GROUP_LABEL[key],
      items: buckets.get(key)!,
    }));
}

export function meetingIcs(m: BookedMeeting) {
  const uid = `${m.id}@tally.local`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tally//BC Desk//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SUMMARY:${m.who} · ${m.company}`,
    `DESCRIPTION:${m.role}. ${m.pain}`,
    `LOCATION:${m.city}`,
    `DTSTART;VALUE=DATE:${m.dayKey.replace(/-/g, "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export const MEETING_FILTER_LABELS: Record<MeetingFilter, string> = {
  all: "All",
  upcoming: "Upcoming",
  pending: "Pending",
  disputed: "Disputed",
  released: "Released",
  "this-week": "This week",
  "needs-you": "Needs you",
};

export const SAVED_VIEWS_KEY = "tally-bc-meeting-views";

export function buildLedger(vessel: Vessel, meetings: BookedMeeting[]): LedgerLine[] {
  const lines: LedgerLine[] = [
    {
      id: "hold",
      label: "Hold",
      amount: vessel.target * vessel.price,
      kind: "hold",
    },
  ];

  for (const m of meetings.filter((x) => x.status === "released")) {
    lines.push({
      id: `release-${m.id}`,
      label: `Meeting #${m.number} · ${m.who}`,
      amount: -vessel.price,
      meetingId: m.id,
      kind: "release",
    });
  }

  if (vessel.state === "reclaimed") {
    const releasedTotal =
      meetings.filter((x) => x.status === "released").length * vessel.price;
    const reclaimAmount = vessel.target * vessel.price - releasedTotal;
    if (reclaimAmount > 0) {
      lines.push({
        id: "reclaim",
        label: "Reclaim",
        amount: -reclaimAmount,
        kind: "reclaim",
      });
    }
  }

  lines.push(
    { id: "zero-retainer", label: "Operator retainer", amount: 0, kind: "zero" },
    { id: "zero-fee", label: "Platform fee", amount: 0, kind: "zero" },
  );

  return lines;
}

export function buildStatementCsv(
  vessel: Vessel,
  ledger: LedgerLine[],
  held: number,
  released: number,
) {
  const rows = [
    ["Vessel", vessel.name],
    ["Held", String(held)],
    ["Released", String(released)],
    ["Custodian", vessel.custodian],
    [],
    ["Line", "Amount"],
    ...ledger.map((l) => [l.label, String(l.amount)]),
  ];
  return rows.map((r) => r.join(",")).join("\n");
}

export function rollupHeld(vessels: Vessel[]) {
  return vessels.reduce((sum, v) => sum + v.heldAtGlance, 0);
}

export function rollupReleased(vessels: Vessel[]) {
  return vessels.reduce((sum, v) => sum + v.releasedAtGlance, 0);
}

export function lastReceiptId(meetings: BookedMeeting[]) {
  const withReceipt = meetings.filter((m) => m.receiptId);
  return withReceipt[withReceipt.length - 1]?.receiptId;
}

export function brandExclusionCount(firms: FirmRow[]) {
  return firms.filter((f) => f.status === "blocked").length;
}
