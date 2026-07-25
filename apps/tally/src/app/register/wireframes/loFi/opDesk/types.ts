/**
 * Operator desk — shared types for furnishing pass.
 * Function flows unchanged; these types densify Operator click-through stages.
 */
export type OpNav = "campaigns" | "meetings" | "messages" | "operations";

export type OpCampaignState =
  | "draft"
  | "evaluate"
  | "enrich"
  | "invited"
  | "running"
  | "paused"
  | "archived";

export type OpDeskSheet =
  | null
  | "details"
  | "history"
  | "dossier-more"
  | "invite-history"
  | "create-help"
  | "pause"
  | "stop"
  | "notif"
  | "shortcuts"
  | "command";

export type OpCampaignEvent = {
  id: string;
  at: string;
  label: string;
};

export type OpCampaign = {
  id: string;
  name: string;
  companyName?: string;
  companyInitials?: string;
  state: OpCampaignState;
  lastTouched: string;
  firmCount?: number;
  targetMeetings?: number;
  bookedMeetings?: number;
  pricePerMeeting?: number;
  holdDays?: number;
  clientName?: string;
  clientEmail?: string;
  inviteAt?: string;
  honesty?: "silent" | "working" | "ok";
  launchReceiptId?: string;
  nextMeetingPeek?: string;
  createdAt: string;
  history: OpCampaignEvent[];
  archived?: boolean;
  /** Sample-only rows — not openable in CT */
  sample?: boolean;
};

export type SentInvite = {
  id: string;
  campaignName: string;
  kind: "guest" | "existing";
  to: string;
  at: string;
  status: "sent" | "funded";
};

export type EnrichRun = {
  at: string;
  duration: string;
  sourceMix: string;
  firmTotal: number;
};

export type Density = "comfortable" | "compact";

export type CreateTemplate = {
  id: string;
  label: string;
  name: string;
};

export type OpNotification = {
  id: string;
  label: string;
  detail?: string;
  at?: string;
};
