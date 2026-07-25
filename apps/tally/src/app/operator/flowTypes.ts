/** Screen ids — mirrors Register lo-fi click-through (positional prune → product plant). */

export type OperatorCampaign = {
  id: string;
  name: string;
};

export type OperatorScreenId =
  | "campaigns"
  | "campaign"
  | "evaluating"
  | "verdict"
  | "enriching"
  | "firm-list"
  | "deploy-choice"
  | "invite-guest"
  | "invite-existing"
  | "invite-sent"
  | "client-fund"
  | "running";

export type InviteOrigin = "list" | "deploy";

export function breadcrumbFor(screen: OperatorScreenId, campaignName?: string): string {
  const camp = campaignName ?? "…";
  switch (screen) {
    case "evaluating":
    case "verdict":
      return `Campaigns / ${camp} / Evaluate`;
    case "enriching":
    case "firm-list":
    case "deploy-choice":
      return `Campaigns / ${camp} / Enrich`;
    case "invite-guest":
    case "invite-existing":
    case "invite-sent":
    case "client-fund":
      return `Campaigns / ${camp} / Deploy`;
    case "running":
      return `Campaigns / ${camp} / Running`;
    case "campaign":
      return `Campaigns / ${camp}`;
    default:
      return "Campaigns";
  }
}

export function backTarget(
  screen: OperatorScreenId,
  inviteOrigin: InviteOrigin,
): OperatorScreenId | null {
  switch (screen) {
    case "verdict":
      return null;
    case "enriching":
    case "firm-list":
      return "verdict";
    case "deploy-choice":
      return "firm-list";
    case "invite-guest":
    case "invite-existing":
      return inviteOrigin === "list" ? "campaigns" : "deploy-choice";
    case "invite-sent":
      return "firm-list";
    case "client-fund":
      return "invite-sent";
    case "running":
      return "invite-sent";
    default:
      return null;
  }
}

export function isResumeScreen(screen: OperatorScreenId): boolean {
  return !["campaigns", "evaluating", "enriching"].includes(screen);
}
