import type { OpCampaign, OpCampaignState } from "./types";

export function stateLabel(state: OpCampaignState) {
  if (state === "draft") return "Draft";
  if (state === "evaluate") return "Evaluate";
  if (state === "enrich") return "Enrich";
  if (state === "invited") return "Invited";
  if (state === "running") return "Running";
  if (state === "paused") return "Paused";
  return "Archived";
}

export function stateSortKey(state: OpCampaignState) {
  if (state === "running") return 0;
  if (state === "invited") return 1;
  if (state === "enrich") return 2;
  if (state === "evaluate") return 3;
  if (state === "draft") return 4;
  if (state === "paused") return 5;
  return 6;
}

export function sortCampaigns(campaigns: OpCampaign[]) {
  return [...campaigns].sort(
    (a, b) =>
      stateSortKey(a.state) - stateSortKey(b.state) ||
      a.name.localeCompare(b.name),
  );
}

export function nextActionPeek(c: OpCampaign) {
  if (c.state === "draft") return "Pick company → Evaluate";
  if (c.state === "evaluate") return "Open dossier → Enrich";
  if (c.state === "enrich") return "Deploy → Invite client";
  if (c.state === "invited") return "Waiting on accept + fund";
  if (c.state === "running") return c.nextMeetingPeek ?? "Monitor meetings";
  if (c.state === "paused") return "Resume when client ready";
  return undefined;
}

export function lastHistoryPeek(c: OpCampaign) {
  const last = c.history[c.history.length - 1];
  return last ? `${last.at} · ${last.label}` : undefined;
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

export function buildCampaignCsv(c: OpCampaign) {
  const rows = [
    ["Campaign", c.name],
    ["Stage", stateLabel(c.state)],
    ["Company", c.companyName ?? "—"],
    ["Firms", c.firmCount != null ? String(c.firmCount) : "—"],
    ["Target meetings", c.targetMeetings != null ? String(c.targetMeetings) : "—"],
    ["Price per meeting", c.pricePerMeeting != null ? String(c.pricePerMeeting) : "—"],
    ["Client", c.clientName ?? c.clientEmail ?? "—"],
    ["Last touched", c.lastTouched],
    ["Created", c.createdAt],
    [],
    ["History"],
    ...c.history.map((e) => [e.at, e.label]),
  ];
  return rows.map((r) => r.join(",")).join("\n");
}

export function buildFirmsCsv(
  firms: { name: string; website: string; hq: string; employeeCount: string; jobCount: number }[],
) {
  const rows = [
    ["Company", "Website", "HQ", "Employees", "Jobs"],
    ...firms.map((f) => [f.name, f.website, f.hq, f.employeeCount, String(f.jobCount)]),
  ];
  return rows.map((r) => r.join(",")).join("\n");
}

export function deriveActiveState(args: {
  hasCompany: boolean;
  companyLocked: boolean;
  firmCount: number;
  inviteSent: boolean;
  funded: boolean;
}): OpCampaignState {
  if (args.funded) return "running";
  if (args.inviteSent) return "invited";
  if (args.firmCount > 0) return "enrich";
  if (args.companyLocked) return "evaluate";
  if (args.hasCompany) return "evaluate";
  return "draft";
}
