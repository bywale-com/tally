import type { GuestFirmRow, OperatorRequestKind } from "./types";

export function quietLinkStyle(color: string) {
  return {
    border: "none",
    background: "transparent",
    padding: "6px 2px",
    fontSize: 12,
    fontWeight: 500,
    color,
    fontFamily: "inherit",
    cursor: "pointer",
    textAlign: "left" as const,
  };
}

export function firmTagLabel(tag: GuestFirmRow["tag"]) {
  if (tag === "competitor") return "Competitor";
  if (tag === "customer") return "Customer";
  if (tag === "dream") return "Dream list";
  return null;
}

export function brandExclusionCount(firms: GuestFirmRow[]) {
  return firms.filter((f) => f.blocked || f.blockedBy).length;
}

export function requestKindLabel(kind: OperatorRequestKind) {
  if (kind === "price") return "Challenge price";
  if (kind === "icp") return "Challenge ICP";
  return "Swap target company";
}

export function flashMessage(kind: OperatorRequestKind) {
  if (kind === "price") return "Noted. Operator will re-analyze price.";
  if (kind === "icp") return "Noted. Operator will revisit ICP.";
  return "Noted. Operator will swap company.";
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

export function buildFirmsCsv(firms: GuestFirmRow[]) {
  const rows = [
    ["Name", "Tag", "Status"],
    ...firms.map((f) => [
      f.name,
      firmTagLabel(f.tag) ?? "",
      f.blocked ? "Blocked" : f.requested ? "Requested" : "Active",
    ]),
  ];
  return rows.map((r) => r.join(",")).join("\n");
}

export function buildTermsExport(inviteName: string, termsBody: string) {
  return [`Vessel: ${inviteName}`, "", termsBody].join("\n");
}

export function daysUntilExpiry(expiresAt: string) {
  return `Expires ${expiresAt}`;
}
