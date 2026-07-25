/**
 * Deploy / invite furniture (items 71–84).
 */
import { Badge } from "@/components/ui/badge";
import { FurnishFocus } from "../FurnishFocus";
import { useDeskPalette } from "../DeskPaletteContext";

export type DeployRecapProps = {
  campaignName: string;
  companyName?: string;
  firmCount: number;
  targetMeetings?: number;
  pricePerMeeting?: number;
  holdDays?: number;
};

export function DeployRecap({
  campaignName,
  companyName,
  firmCount,
  targetMeetings,
  pricePerMeeting,
  holdDays,
}: DeployRecapProps) {
  const loFi = useDeskPalette();
  return (
    <FurnishFocus persona="op" n={71} label="Deploy choice modal recap" style={{ display: "block" }}>
      <div
        className="mb-3 rounded-md border p-3 text-xs"
        style={{ borderColor: loFi.stroke, color: loFi.label }}
      >
        <div className="font-semibold" style={{ color: loFi.ink }}>
          {campaignName}
        </div>
        {companyName ? <div className="mt-1">{companyName}</div> : null}
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{firmCount} firms</Badge>
          {targetMeetings != null ? (
            <Badge variant="outline">{targetMeetings} meetings</Badge>
          ) : null}
          {pricePerMeeting != null ? (
            <Badge variant="outline">${pricePerMeeting} / meeting</Badge>
          ) : null}
          {holdDays != null ? <Badge variant="outline">{holdDays}d hold</Badge> : null}
          <Badge variant="outline">Rules locked</Badge>
        </div>
      </div>
    </FurnishFocus>
  );
}

export type InvitePreviewProps = {
  campaignName: string;
  companyName?: string;
  firmCount: number;
  email?: string;
  accountName?: string;
};

export function InvitePreview({
  campaignName,
  companyName,
  firmCount,
  email,
  accountName,
}: InvitePreviewProps) {
  const loFi = useDeskPalette();
  return (
    <FurnishFocus persona="op" n={74} label="Invite preview card" style={{ display: "block" }}>
    <div
      className="rounded-md border p-3 text-[11px]"
      style={{ borderColor: loFi.stroke, background: loFi.block }}
    >
      <div className="font-semibold" style={{ color: loFi.ink }}>
        Preview
      </div>
      <div className="mt-2 space-y-1" style={{ color: loFi.label }}>
        <div>Campaign · {campaignName}</div>
        {companyName ? <div>Company · {companyName}</div> : null}
        <div>Firms · {firmCount}</div>
        <div>Terms · locked at invite</div>
        {email ? <div>To · {email}</div> : null}
        {accountName ? (
          <FurnishFocus persona="op" n={77} label="Selected account recap" style={{ display: "block" }}>
            <div>Account · {accountName}</div>
          </FurnishFocus>
        ) : null}
      </div>
    </div>
    </FurnishFocus>
  );
}

export type DeployChoiceHintsProps = {
  variant: "modal";
};

export function DeployChoiceHints({ variant }: DeployChoiceHintsProps) {
  const loFi = useDeskPalette();
  void variant;
  return (
    <FurnishFocus persona="op" n={72} label="Guest vs existing hints" style={{ display: "block" }}>
      <div className="mt-2 space-y-1 text-[10px]" style={{ color: loFi.muted }}>
        <div>Existing user · lands on Business Client desk</div>
        <div>Guest · first sale on their surface</div>
      </div>
    </FurnishFocus>
  );
}

export type ClientFundFactsProps = {
  targetMeetings?: number;
  pricePerMeeting?: number;
  holdDays?: number;
};

export function ClientFundFacts({
  targetMeetings,
  pricePerMeeting,
  holdDays,
}: ClientFundFactsProps) {
  const loFi = useDeskPalette();
  const total =
    targetMeetings != null && pricePerMeeting != null
      ? targetMeetings * pricePerMeeting
      : null;
  return (
    <FurnishFocus persona="op" n={81} label="Hold days + meeting target facts" style={{ display: "block" }}>
      <div className="mb-3 space-y-1 text-[11px]" style={{ color: loFi.label }}>
        {targetMeetings != null ? <div>{targetMeetings} qualified meetings</div> : null}
        {pricePerMeeting != null ? <div>${pricePerMeeting} per meeting</div> : null}
        {total != null ? <div>Hold · ${total.toLocaleString()}</div> : null}
        {holdDays != null ? <div>{holdDays}-day hold window</div> : null}
      </div>
    </FurnishFocus>
  );
}

export type ExistingAccountRowFactsProps = {
  lastActive?: string;
};

export function ExistingAccountRowFacts({ lastActive }: ExistingAccountRowFactsProps) {
  const loFi = useDeskPalette();
  if (!lastActive) return null;
  return (
    <FurnishFocus persona="op" n={76} label="Account last-active fact">
      <span className="text-[10px]" style={{ color: loFi.muted }}>
        Last active · {lastActive}
      </span>
    </FurnishFocus>
  );
}
