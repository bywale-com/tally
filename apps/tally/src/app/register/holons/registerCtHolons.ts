/**
 * Stable HolonBoundary ids for Register click-through desks.
 * Can'ts / Furnish holonIds must reference these — not component filenames alone.
 */
export const BC_CT = {
  desk: { id: "bc-ct-desk", label: "Business Client desk" },
  sidebar: { id: "bc-ct-sidebar", label: "Client nav" },
  campaigns: { id: "bc-ct-campaigns", label: "Campaigns" },
  vesselRow: { id: "bc-ct-vessel-row", label: "Vessel row" },
  meetings: { id: "bc-ct-meetings", label: "Meetings" },
  meetingRow: { id: "bc-ct-meeting-row", label: "Meeting row" },
  meetingSheet: { id: "bc-ct-meeting-sheet", label: "Meeting sheet" },
  escrow: { id: "bc-ct-escrow", label: "Escrow" },
  reclaim: { id: "bc-ct-reclaim", label: "Reclaim unspent" },
  detailsDoor: { id: "bc-ct-details", label: "Details sheet" },
  firmsDoor: { id: "bc-ct-firms", label: "Firms sheet" },
  talkDoor: { id: "bc-ct-talk", label: "Talk tracks" },
  alertsDoor: { id: "bc-ct-alerts", label: "Alerts" },
  stopDoor: { id: "bc-ct-stop", label: "Stop campaign" },
  historyDoor: { id: "bc-ct-history", label: "Vessel history" },
  operatorRequest: { id: "bc-ct-operator-request", label: "Request Operator" },
  notif: { id: "bc-ct-notif", label: "Notification center" },
  command: { id: "bc-ct-command", label: "Command palette" },
} as const;

export const GUEST_CT = {
  desk: { id: "guest-ct-desk", label: "Guest vessel" },
  sidebar: { id: "guest-ct-sidebar", label: "Guest nav" },
  invite: { id: "guest-ct-invite", label: "Invite campaigns" },
  fund: { id: "guest-ct-fund", label: "Fund escrow" },
  converted: { id: "guest-ct-converted", label: "Converted receipt" },
  meetings: { id: "guest-ct-meetings", label: "Meetings (pre-fund)" },
  escrow: { id: "guest-ct-escrow", label: "Escrow (pre-fund)" },
  terms: { id: "guest-ct-terms", label: "Terms sheet" },
  details: { id: "guest-ct-details", label: "Details sheet" },
  firms: { id: "guest-ct-firms", label: "Firms sheet" },
} as const;

export const WORKER_CT = {
  desk: { id: "worker-ct-desk", label: "Worker desk" },
  available: { id: "worker-ct-available", label: "Available queue" },
  vesselCard: { id: "worker-ct-vessel-card", label: "Available vessel" },
  /** Quiet launched status on an Available vessel — never funded chrome */
  launchedDot: { id: "worker-ct-launched-dot", label: "Launched status" },
  claimed: { id: "worker-ct-claimed", label: "Begin vessel" },
  active: { id: "worker-ct-active", label: "Active manage" },
  log: { id: "worker-ct-log", label: "Log meeting" },
  companySearch: { id: "worker-ct-company-search", label: "Company search" },
  pipeline: { id: "worker-ct-pipeline", label: "Pipeline" },
  meetingRow: { id: "worker-ct-meeting-row", label: "Pipeline meeting" },
  details: { id: "worker-ct-details", label: "Details sheet" },
  firms: { id: "worker-ct-firms", label: "Firms sheet" },
  packet: { id: "worker-ct-packet", label: "Packet peek" },
} as const;

export const OP_CT = {
  desk: { id: "op-ct-desk", label: "Operator desk" },
  campaigns: { id: "op-ct-campaigns", label: "Campaigns list" },
  campaignRow: { id: "op-ct-campaign-row", label: "Campaign row" },
  create: { id: "op-ct-create", label: "Create campaign" },
  evaluate: { id: "op-ct-evaluate", label: "Evaluate dossier" },
  companySearch: { id: "op-ct-company-search", label: "Company search" },
  enrich: { id: "op-ct-enrich", label: "Enrich firm list" },
  deploy: { id: "op-ct-deploy", label: "Deploy / invite" },
  running: { id: "op-ct-running", label: "Running campaign" },
  invite: { id: "op-ct-invite", label: "Invite sheet" },
} as const;
