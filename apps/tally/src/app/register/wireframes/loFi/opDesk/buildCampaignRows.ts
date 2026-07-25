import { PERSONA_SEED } from "../LoFiPersonaChrome";
import { deriveActiveState } from "./helpers";
import { SEED_CAMPAIGNS } from "./seed";
import type { OpCampaign, OpCampaignEvent } from "./types";

export type ActiveCampaignMeta = {
  campaign: { id: string; name: string };
  companyName?: string;
  companyInitials?: string;
  hasCompany: boolean;
  companyLocked: boolean;
  firmCount: number;
  inviteSent: boolean;
  funded: boolean;
  clientName?: string;
  clientEmail?: string;
  history: OpCampaignEvent[];
  archived?: boolean;
};

export function buildActiveCampaignRow(meta: ActiveCampaignMeta): OpCampaign {
  const state = deriveActiveState({
    hasCompany: meta.hasCompany,
    companyLocked: meta.companyLocked,
    firmCount: meta.firmCount,
    inviteSent: meta.inviteSent,
    funded: meta.funded,
  });

  return {
    id: meta.campaign.id,
    name: meta.campaign.name,
    companyName: meta.companyName,
    companyInitials: meta.companyInitials,
    state,
    lastTouched: "Just now",
    firmCount: meta.firmCount > 0 ? meta.firmCount : undefined,
    targetMeetings: PERSONA_SEED.meetingsTarget,
    bookedMeetings: meta.funded ? 0 : undefined,
    pricePerMeeting: PERSONA_SEED.pricePerMeeting,
    holdDays: PERSONA_SEED.holdDays,
    clientName: meta.clientName,
    clientEmail: meta.clientEmail,
    inviteAt: meta.inviteSent ? "Today" : undefined,
    honesty: meta.funded ? "silent" : undefined,
    launchReceiptId: meta.funded ? "rcpt-op-live" : undefined,
    nextMeetingPeek: meta.funded ? undefined : undefined,
    createdAt: "Today",
    history: meta.history,
    archived: meta.archived,
    sample: false,
  };
}

export function mergeCampaignRows(
  active: OpCampaign | null,
  sampleOverrides: Record<string, Partial<OpCampaign>>,
): OpCampaign[] {
  const samples = SEED_CAMPAIGNS.map((s) => ({
    ...s,
    ...sampleOverrides[s.id],
  }));
  if (!active) return samples;
  const withoutDupe = samples.filter((s) => s.id !== active.id);
  return [active, ...withoutDupe];
}
