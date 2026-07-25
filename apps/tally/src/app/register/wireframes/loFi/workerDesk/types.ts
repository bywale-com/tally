/**
 * Worker desk — shared types for furnishing pass.
 * Function flows unchanged; these types densify Available → Pipeline.
 */
export type WorkerScreen = "queue" | "claimed" | "working" | "log" | "pipeline";
export type WorkerNav = "queue" | "active" | "pipeline";

export type QueueFilter = "all" | "fresh" | "almost-full";
export type PipelineFilter = "all" | "pending" | "upcoming" | "released" | "disputed";
export type TimeMode = "relative" | "absolute";
export type Density = "comfortable" | "compact";

export type WorkerSheet =
  | null
  | "details"
  | "firms"
  | "talk"
  | "history"
  | "alerts"
  | "packet"
  | "shortcuts"
  | "notif";

export type MeetingWorkerStatus =
  | "logged"
  | "pending_release"
  | "released"
  | "disputed"
  | "upcoming"
  | "cancelled";

export type FirmStatus = "queued" | "touched" | "meeting" | "blocked";
export type FirmTag = "competitor" | "customer" | "dream" | "none";
export type FirmBlockedBy = "client" | "operator" | null;

export type WorkerVessel = {
  id: string;
  name: string;
  company: string;
  sector: string;
  /** World: launched or running — Worker may see both in different contexts */
  worldState: "launched" | "running" | "stopped";
  /** Available queue admission */
  unclaimed: boolean;
  target: number;
  price: number;
  bookedCount: number;
  meetingsRemaining: number;
  operatorName: string;
  operatorInitials: string;
  preparedBy: string;
  logoMark: string;
  priorVesselsWithOperator: number;
  launchedAt: string;
  lastTouched: string;
  seniority: string;
  meetingLengthMin: number;
  custodian: string;
  clientHonesty: "silent" | "working" | "ok" | "not-started";
  operatorNote?: string;
  rulesLocked: boolean;
  whatCounts: { id: string; label: string; on: boolean }[];
  samplePacketExample: string;
  brandExclusionCount: number;
  history: { id: string; at: string; label: string }[];
};

export type WorkerMeeting = {
  id: string;
  number: number;
  who: string;
  role: string;
  company: string;
  size: string;
  pain: string;
  when: string;
  whenAbsolute: string;
  whenRelative: string;
  dayKey: string;
  group: "today" | "tomorrow" | "earlier" | "later" | "this-week";
  status: MeetingWorkerStatus;
  fitSeniority: boolean;
  fitLength: boolean;
  attended: boolean;
  lengthMin: number;
  timezone: string;
  city: string;
  talkTrackUsed?: string;
  receiptId?: string;
  disputeReason?: string;
  evidence?: string;
  loggedAt: string;
  statusTimeline: { at: string; label: string }[];
};

export type FirmRow = {
  id: string;
  name: string;
  status: FirmStatus;
  tag: FirmTag;
  blockedBy: FirmBlockedBy;
  /** Known firmographic — fills Log meeting size on pick */
  size?: string;
  note?: string;
};

export type TalkLine = {
  id: string;
  text: string;
  lastUsed?: string;
};

export type RecentSubmission = {
  id: string;
  who: string;
  company: string;
  at: string;
};

export type WorkerNotification = {
  id: string;
  label: string;
  detail?: string;
  at?: string;
  onClick?: () => void;
};
