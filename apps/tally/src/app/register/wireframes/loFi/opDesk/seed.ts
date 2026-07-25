import { PERSONA_SEED } from "../LoFiPersonaChrome";
import type {
  CreateTemplate,
  EnrichRun,
  OpCampaign,
  OpNotification,
  SentInvite,
} from "./types";

export const OPERATOR_NAME = "Maya Chen";
export const OPERATOR_INITIALS = "MC";

export const CREATE_TEMPLATES: CreateTemplate[] = [
  { id: "founding", label: "Founding sales", name: "Founding sales — Q3" },
  { id: "expansion", label: "Expansion", name: "Expansion — existing ICP" },
  { id: "winback", label: "Win-back", name: "Win-back — churned accounts" },
];

export const SEED_CAMPAIGNS: OpCampaign[] = [
  {
    id: "sample-running",
    name: "Northwind outbound",
    companyName: "Northwind Traders",
    companyInitials: "NW",
    state: "running",
    lastTouched: "1h ago",
    firmCount: 42,
    targetMeetings: 8,
    bookedMeetings: 2,
    pricePerMeeting: 500,
    holdDays: 14,
    clientName: "Acme Corp",
    clientEmail: "you@acme.com",
    inviteAt: "Jul 14",
    honesty: "silent",
    launchReceiptId: "rcpt-op-7f3a",
    nextMeetingPeek: "Thu 2:00pm · Jordan Blake",
    createdAt: "Jul 10",
    sample: true,
    history: [
      { id: "h1", at: "Jul 10", label: "Created" },
      { id: "h2", at: "Jul 11", label: "Evaluated" },
      { id: "h3", at: "Jul 12", label: "Enriched · 42 firms" },
      { id: "h4", at: "Jul 14", label: "Invited Acme Corp" },
      { id: "h5", at: "Jul 14", label: "Funded + launched" },
    ],
  },
  {
    id: "sample-invited",
    name: "Brightline pilot",
    companyName: "Brightline Co",
    companyInitials: "BC",
    state: "invited",
    lastTouched: "Yesterday",
    firmCount: 36,
    targetMeetings: 6,
    pricePerMeeting: 550,
    holdDays: 14,
    clientName: "Guest",
    clientEmail: "jordan@prospect.co",
    inviteAt: "Jul 22",
    createdAt: "Jul 18",
    sample: true,
    history: [
      { id: "h1", at: "Jul 18", label: "Created" },
      { id: "h2", at: "Jul 19", label: "Evaluated" },
      { id: "h3", at: "Jul 20", label: "Enriched · 36 firms" },
      { id: "h4", at: "Jul 22", label: "Invite sent" },
    ],
  },
  {
    id: "sample-enrich",
    name: "Cedar expansion",
    companyName: PERSONA_SEED.companyName,
    companyInitials: "AC",
    state: "enrich",
    lastTouched: "3d ago",
    firmCount: 48,
    targetMeetings: PERSONA_SEED.meetingsTarget,
    pricePerMeeting: PERSONA_SEED.pricePerMeeting,
    holdDays: PERSONA_SEED.holdDays,
    createdAt: "Jul 20",
    sample: true,
    history: [
      { id: "h1", at: "Jul 20", label: "Created" },
      { id: "h2", at: "Jul 21", label: "Evaluated" },
      { id: "h3", at: "Jul 23", label: "Enriched · 48 firms" },
    ],
  },
  {
    id: "sample-evaluate",
    name: "Delta field test",
    companyName: "Delta Field Services",
    companyInitials: "DF",
    state: "evaluate",
    lastTouched: "5d ago",
    targetMeetings: 5,
    pricePerMeeting: 450,
    createdAt: "Jul 15",
    sample: true,
    history: [
      { id: "h1", at: "Jul 15", label: "Created" },
      { id: "h2", at: "Jul 16", label: "Evaluated" },
    ],
  },
  {
    id: "sample-draft",
    name: "Untitled Q4 push",
    state: "draft",
    lastTouched: "1w ago",
    createdAt: "Jul 8",
    sample: true,
    archived: true,
    history: [{ id: "h1", at: "Jul 8", label: "Created" }],
  },
];

export const SEED_ENRICH_RUN: EnrichRun = {
  at: "Jul 23 · 2:14pm",
  duration: "4m 12s",
  sourceMix: "Wellfound · LinkedIn · BuiltIn",
  firmTotal: 48,
};

export const SEED_SENT_INVITES: SentInvite[] = [
  {
    id: "si1",
    campaignName: "Northwind outbound",
    kind: "existing",
    to: "you@acme.com",
    at: "Jul 14",
    status: "funded",
  },
  {
    id: "si2",
    campaignName: "Brightline pilot",
    kind: "guest",
    to: "jordan@prospect.co",
    at: "Jul 22",
    status: "sent",
  },
];

export const SEED_NOTIFICATIONS: OpNotification[] = [
  {
    id: "n1",
    label: "Northwind funded",
    detail: "Acme Corp accepted + funded. Launch coupled.",
    at: "Jul 14",
  },
  {
    id: "n2",
    label: "Enrich complete",
    detail: "Cedar expansion · 48 firms ready.",
    at: "Jul 23",
  },
  {
    id: "n3",
    label: "Meeting booked",
    detail: "Northwind · Jordan Blake · Thu 2:00pm",
    at: "Jul 24",
  },
];

export const RECENT_COMPANY_NAMES = [
  "Northwind Traders",
  "Brightline Co",
  "Delta Field Services",
];

export const DOSSIER_ANALYZED_AT = "Jul 21 · 3:42pm";

export const EVALUATE_SOURCE_TAGS = ["LinkedIn", "Company site", "Job posts", "Crunchbase"];
