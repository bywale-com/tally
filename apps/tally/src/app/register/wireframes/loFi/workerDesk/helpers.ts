import type {
  FirmRow,
  MeetingWorkerStatus,
  PipelineFilter,
  QueueFilter,
  WorkerMeeting,
  WorkerVessel,
} from "./types";

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

export function copyText(text: string) {
  void navigator.clipboard?.writeText(text);
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

export function companyInitial(company: string) {
  const word = company.trim().split(/\s+/)[0] ?? company;
  return word.charAt(0).toUpperCase();
}

export function honestyLabel(h: WorkerVessel["clientHonesty"]) {
  if (h === "silent") return "Client silent";
  if (h === "working") return "Client active";
  if (h === "ok") return "Client ok";
  return "Not started";
}

export function statusChip(status: MeetingWorkerStatus) {
  if (status === "pending_release") return "Pending release";
  if (status === "released") return "Released";
  if (status === "disputed") return "Disputed";
  if (status === "upcoming") return "Upcoming";
  if (status === "logged") return "Logged";
  return "Cancelled";
}

export function stakeAmount(status: MeetingWorkerStatus, price: number) {
  if (status === "pending_release" || status === "disputed") return price;
  return null;
}

const STATUS_SORT: Record<MeetingWorkerStatus, number> = {
  pending_release: 0,
  disputed: 1,
  upcoming: 2,
  logged: 3,
  released: 4,
  cancelled: 5,
};

export function sortMeetings(meetings: WorkerMeeting[]) {
  return [...meetings].sort(
    (a, b) =>
      STATUS_SORT[a.status] - STATUS_SORT[b.status] ||
      a.dayKey.localeCompare(b.dayKey) ||
      a.number - b.number,
  );
}

export function deskTodayKey(meetings: WorkerMeeting[]) {
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

export function filterPipeline(
  meetings: WorkerMeeting[],
  filter: PipelineFilter,
) {
  if (filter === "all") return meetings;
  if (filter === "pending") return meetings.filter((m) => m.status === "pending_release");
  if (filter === "upcoming") return meetings.filter((m) => m.status === "upcoming");
  if (filter === "released") return meetings.filter((m) => m.status === "released");
  if (filter === "disputed") return meetings.filter((m) => m.status === "disputed");
  return meetings;
}

export function filterQueue(vessels: WorkerVessel[], filter: QueueFilter, pinnedId: string | null) {
  let list = vessels.filter((v) => v.unclaimed);
  if (filter === "fresh") list = list.filter((v) => v.bookedCount === 0);
  if (filter === "almost-full") list = list.filter((v) => v.meetingsRemaining <= 2);
  list = [...list].sort(
    (a, b) => b.meetingsRemaining - a.meetingsRemaining || b.launchedAt.localeCompare(a.launchedAt),
  );
  if (pinnedId) {
    const pinned = list.find((v) => v.id === pinnedId);
    if (pinned) return [pinned, ...list.filter((v) => v.id !== pinnedId)];
  }
  return list;
}

const GROUP_LABEL: Record<WorkerMeeting["group"], string> = {
  today: "Today",
  tomorrow: "Tomorrow",
  earlier: "Earlier",
  later: "Later",
  "this-week": "This week",
};

export function groupMeetings(meetings: WorkerMeeting[]) {
  const sorted = sortMeetings(meetings);
  const buckets = new Map<WorkerMeeting["group"], WorkerMeeting[]>();
  for (const m of sorted) {
    const list = buckets.get(m.group) ?? [];
    list.push(m);
    buckets.set(m.group, list);
  }
  return (["today", "this-week", "tomorrow", "later", "earlier"] as const)
    .filter((key) => buckets.has(key))
    .map((key) => ({
      key,
      label: GROUP_LABEL[key],
      items: buckets.get(key)!,
    }));
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

export function firmCounts(firms: FirmRow[]) {
  return {
    queued: firms.filter((f) => f.status === "queued").length,
    touched: firms.filter((f) => f.status === "touched").length,
    meeting: firms.filter((f) => f.status === "meeting").length,
    blocked: firms.filter((f) => f.status === "blocked").length,
  };
}

export function buildFirmsCsv(firms: FirmRow[]) {
  const rows = [["Firm", "Status", "Tag", "Blocked by", "Note"]];
  for (const f of firms) {
    rows.push([
      f.name,
      firmStatusLabel(f.status),
      firmTagLabel(f.tag) ?? "",
      f.blockedBy ?? "",
      f.note ?? "",
    ]);
  }
  return rows.map((r) => r.join(",")).join("\n");
}

export function buildOutreachCsv(meetings: WorkerMeeting[]) {
  const rows = [["#", "Who", "Company", "Status", "Logged"]];
  for (const m of meetings) {
    rows.push([String(m.number), m.who, m.company, statusChip(m.status), m.loggedAt]);
  }
  return rows.map((r) => r.join(",")).join("\n");
}

export function bookedQualifiedCount(meetings: WorkerMeeting[]) {
  return meetings.filter(
    (m) => m.status === "released" || m.status === "pending_release",
  ).length;
}

export function lastLoggedMeeting(meetings: WorkerMeeting[]) {
  const logged = meetings.filter((m) => m.status !== "cancelled");
  return logged[logged.length - 1] ?? null;
}

export function lastReceiptId(meetings: WorkerMeeting[]) {
  const withReceipt = meetings.filter((m) => m.receiptId);
  return withReceipt[withReceipt.length - 1]?.receiptId;
}

export function isDuplicateCompany(meetings: WorkerMeeting[], company: string) {
  const norm = company.trim().toLowerCase();
  return meetings.some((m) => m.company.trim().toLowerCase() === norm && m.status !== "cancelled");
}

export function buildPacketPreview(input: {
  who: string;
  role: string;
  pain: string;
  company?: string;
  size?: string;
  workerName: string;
}) {
  return [
    `Who: ${input.who}`,
    `Role: ${input.role}`,
    input.company ? `Company: ${input.company}` : "Company: (on submit)",
    input.size ? `Size: ${input.size}` : "Size: (on submit)",
    `Pain: ${input.pain}`,
    `Logged by ${input.workerName}`,
  ].join("\n");
}

export const PIPELINE_FILTER_LABELS: Record<PipelineFilter, string> = {
  all: "All",
  pending: "Pending",
  upcoming: "Upcoming",
  released: "Released",
  disputed: "Disputed",
};

export const QUEUE_FILTER_LABELS: Record<QueueFilter, string> = {
  all: "All",
  fresh: "Fresh",
  "almost-full": "Almost full",
};

export function queueHoverPeek(v: WorkerVessel) {
  return `${v.seniority}, ${v.meetingLengthMin}+ min · ${v.meetingsRemaining} left · ${v.company}`;
}
