import { PERSONA_SEED } from "../LoFiPersonaChrome";
import type { GuestFirmRow, GuestInvite, OperatorRequest, ShareViewer } from "./types";

export const OPERATOR_NAME = "Morgan Lee";

export const INVITE_EXPIRES = "Jul 31";

const WHAT_COUNTS = [
  { id: "sen", label: `${PERSONA_SEED.seniority} or above`, on: true },
  { id: "len", label: `At least ${PERSONA_SEED.meetingLengthMin} minutes`, on: true },
  { id: "pain", label: "Pain matches locked ICP", on: true },
  { id: "attend", label: "Prospect attended", on: true },
  { id: "gate", label: "No gatekeeper brush-offs", on: true },
];

export const TERMS_BODY = [
  `$${PERSONA_SEED.escrowTotal} sits with an escrow-style custodian. Every qualified ${PERSONA_SEED.seniority} meeting (${PERSONA_SEED.meetingLengthMin}+ min, attendance required) releases $${PERSONA_SEED.pricePerMeeting}. Unspent returns after ${PERSONA_SEED.holdDays} days. No-shows and gatekeeper brush-offs do not count.`,
  `Agreed on call: ${PERSONA_SEED.seniority} only, ${PERSONA_SEED.meetingLengthMin}+ min, no no-shows, no gatekeeper brush-offs.`,
  `We sell booked qualified meetings only. Not impressions, deliverability, brand awareness, or activity metrics.`,
  `Custodian: Escrow.com stand-in. Disputes go through escrow-shaped review. USD hold is not prepaid marketing.`,
  `Compared to an agency retainer: capital sits until meetings happen or you reclaim.`,
  `A Worker runs outreach after launch. You do not. There is no Worker chat.`,
].join("\n\n");

export const WHY_PRICE = `${PERSONA_SEED.companyName} fits ${PERSONA_SEED.acvBand} buyers who need pipeline without agency retainers. $${PERSONA_SEED.pricePerMeeting} per meeting for up to ${PERSONA_SEED.meetingsTarget} qualified ${PERSONA_SEED.seniority} conversations. Price stands behind that size, not a house rate.`;

export const SEED_INVITE: GuestInvite = {
  id: "inv1",
  name: PERSONA_SEED.campaignName,
  operatorName: OPERATOR_NAME,
  operatorInitials: "ML",
  clientName: PERSONA_SEED.clientName,
  expiresAt: INVITE_EXPIRES,
  inviteSentAt: "Jul 18",
  inviteRef: "inv_8k2m41",
  operatorTouched: "Yesterday",
  preparedBy: `Prepared by ${OPERATOR_NAME} · disco Jul 12`,
  logoMark: "NW",
  priorVesselsWithOperator: 2,
  pricingWhy: WHY_PRICE,
  rulesLocked: true,
  custodian: "Escrow stand-in",
  whatCounts: WHAT_COUNTS,
  samplePacketExample:
    "Example: Sam Ortiz, VP Eng, Brightline — 32 min attended, pain matched ICP.",
  sampleMeetingGhost: "Sam Ortiz, VP Engineering · Brightline Co · Mon 10:00am",
  timezone: "America/New_York",
  history: [
    { id: "h1", at: "Jul 12", label: "Operator prepared vessel" },
    { id: "h2", at: "Jul 18", label: "Invited" },
    { id: "h3", at: "Jul 20", label: "Terms frozen until expiry" },
  ],
};

export const SEED_FIRMS: GuestFirmRow[] = [
  { id: "f1", name: "Brightline Co", tag: "none", blockedBy: null },
  { id: "f2", name: "Rivera Corp", tag: "dream", blockedBy: null },
  { id: "f3", name: "Harbor Systems", tag: "none", blockedBy: null },
  {
    id: "f4",
    name: "Acme Rival Inc",
    tag: "competitor",
    blockedBy: "you",
    blocked: true,
    note: "Competitor",
  },
  {
    id: "f5",
    name: "Existing Customer LLC",
    tag: "customer",
    blockedBy: "you",
    blocked: true,
    note: "Your customer",
  },
  {
    id: "f6",
    name: "Operator Hold Co",
    tag: "none",
    blockedBy: "operator",
    blocked: true,
    note: "Operator exclusion",
  },
];

export const SEED_VIEWERS: ShareViewer[] = [
  { id: "v1", email: "you@northwind.labs", status: "active" },
  { id: "v2", email: "cofounder@northwind.labs", status: "pending" },
];

export const SEED_REQUESTS: OperatorRequest[] = [];

export const FAQ_ITEMS = [
  {
    q: "When does money leave my entity?",
    a: "Only when you fund. Hold sits with the custodian until meetings release or you reclaim.",
  },
  {
    q: "What counts as a qualified meeting?",
    a: `${PERSONA_SEED.seniority}, ${PERSONA_SEED.meetingLengthMin}+ minutes, attended, ICP match. Locked in terms.`,
  },
  {
    q: "Can I change the firm list after fund?",
    a: "Blocks and must-haves you set now carry forward. Operator exclusions are already applied.",
  },
];
