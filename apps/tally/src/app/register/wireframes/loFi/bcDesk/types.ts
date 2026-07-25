/**
 * Business Client desk — shared types for furnishing pass.
 * Function flows unchanged; these types densify Campaigns / Meetings / Escrow.
 */
export type Nav = "campaigns" | "meetings" | "escrow";
export type MeetingFilter =
  | "all"
  | "upcoming"
  | "pending"
  | "disputed"
  | "released"
  | "this-week"
  | "needs-you";
export type MeetingStatus =
  | "released"
  | "pending"
  | "disputed"
  | "upcoming"
  | "cancelled";
export type VesselState =
  | "invited"
  | "held"
  | "running"
  | "paused"
  | "stopped"
  | "reclaimed";
export type FirmStatus = "queued" | "touched" | "meeting" | "blocked";
export type FirmTag = "competitor" | "customer" | "dream" | "none";
export type FirmBlockedBy = "you" | "operator" | null;
export type DeskSheet =
  | null
  | "meeting"
  | "firms"
  | "details"
  | "talk"
  | "stop"
  | "alerts"
  | "history"
  | "faq"
  | "requests"
  | "notif"
  | "digest"
  | "shortcuts"
  | "onboarding";

export type BookedMeeting = {
  id: string;
  number: number;
  who: string;
  role: string;
  company: string;
  size: string;
  pain: string;
  when: string;
  /** Absolute label for toggle */
  whenAbsolute: string;
  /** Relative label e.g. "in 2h" */
  whenRelative: string;
  /** ISO-ish for week strip / groups: YYYY-MM-DD */
  dayKey: string;
  group: "today" | "tomorrow" | "earlier" | "later";
  status: MeetingStatus;
  fitSeniority: boolean;
  fitLength: boolean;
  attended: boolean;
  lengthMin: number;
  timezone: string;
  city: string;
  duplicateOf?: string;
  evidence?: string;
  disputeReason?: string;
  talkTrackUsed?: string;
  workerLogged: string;
  receiptId?: string;
  statusTimeline: { at: string; label: string }[];
};

export type FirmRow = {
  id: string;
  name: string;
  status: FirmStatus;
  tag: FirmTag;
  blockedBy: FirmBlockedBy;
  note?: string;
  highlight?: boolean;
};

export type VesselEvent = {
  id: string;
  at: string;
  label: string;
};

export type Vessel = {
  id: string;
  name: string;
  state: VesselState;
  target: number;
  price: number;
  holdDays: number;
  reclaimDaysLeft: number;
  pricingWhy: string;
  rulesLocked: boolean;
  custodian: string;
  honesty: "not-started" | "working" | "overload" | "ok" | "silent";
  lastTouched: string;
  operatorName: string;
  operatorInitials: string;
  preparedBy: string;
  logoMark: string;
  priorVesselsWithOperator: number;
  holdStartedAt: string;
  pauseWhy?: string;
  heldAtGlance: number;
  releasedAtGlance: number;
  bookedCount: number;
  nextMeetingPeek?: string;
  history: VesselEvent[];
  whatCounts: { id: string; label: string; on: boolean }[];
  samplePacketExample: string;
  accessViewers: string[];
  archived?: boolean;
};

export type TalkLine = {
  id: string;
  text: string;
  lastUsed?: string;
};

export type OperatorRequest = {
  id: string;
  kind: "worker" | "angle" | "price";
  label: string;
  status: "noted" | "seen" | "closed";
  at: string;
};

export type LedgerLine = {
  id: string;
  label: string;
  amount: number;
  meetingId?: string;
  kind: "hold" | "release" | "reclaim" | "zero";
};

export type Density = "comfortable" | "compact";
export type TimeMode = "relative" | "absolute";
