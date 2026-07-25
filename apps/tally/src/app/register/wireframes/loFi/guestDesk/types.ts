/**
 * Guest vessel desk — shared types for furnishing pass.
 * Function flows unchanged; these types densify pre-fund invite experience.
 */
export type Nav = "campaigns" | "meetings" | "escrow";
export type Stage = "campaigns" | "fund" | "converted" | "lapsed";
export type GuestSheet =
  | null
  | "terms"
  | "details"
  | "inspect"
  | "share"
  | "history"
  | "faq"
  | "requests";
export type GuestDialog = null | "decline" | "ask-operator";
export type InspectTab = "firms" | "samples";
export type FirmTag = "competitor" | "customer" | "dream" | "none";
export type FirmBlockedBy = "you" | "operator" | null;
export type OperatorRequestKind = "price" | "icp" | "swap";
export type OperatorRequestStatus = "noted" | "seen" | "closed";
export type Density = "comfortable" | "compact";

export type GuestFirmRow = {
  id: string;
  name: string;
  tag: FirmTag;
  blockedBy: FirmBlockedBy;
  blocked?: boolean;
  requested?: boolean;
  note?: string;
};

export type InviteEvent = {
  id: string;
  at: string;
  label: string;
};

export type OperatorRequest = {
  id: string;
  kind: OperatorRequestKind;
  label: string;
  status: OperatorRequestStatus;
  at: string;
};

export type SavedInvite = {
  id: string;
  savedAt: string;
};

export type ShareViewer = {
  id: string;
  email: string;
  status: "active" | "pending";
};

export type GuestInvite = {
  id: string;
  name: string;
  operatorName: string;
  operatorInitials: string;
  clientName: string;
  expiresAt: string;
  inviteSentAt: string;
  inviteRef: string;
  operatorTouched: string;
  preparedBy: string;
  logoMark: string;
  priorVesselsWithOperator: number;
  pricingWhy: string;
  rulesLocked: boolean;
  custodian: string;
  whatCounts: { id: string; label: string; on: boolean }[];
  samplePacketExample: string;
  sampleMeetingGhost: string;
  history: InviteEvent[];
  timezone: string;
};
