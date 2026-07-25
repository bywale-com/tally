import { KNOWN_COMPANIES, type PrototypeCompany } from "./prototypeCompanies";
import { SEED_FIRMS, type FirmRow } from "./prototypeFirms";
import type { ChoreographyStage, PrototypeCampaign, PrototypeScreenId } from "./choreography";

export const DUMMY_CAMPAIGN: PrototypeCampaign = {
  id: "camp-demo",
  name: "Acme founding sales",
};

export const DUMMY_COMPANY: PrototypeCompany = KNOWN_COMPANIES[0];

export const DUMMY_GUEST_EMAIL = "jordan@prospect.co";

export function cloneFirms(): FirmRow[] {
  return SEED_FIRMS.map((f) => ({ ...f }));
}

/** Entry screen when jumping to a choreography stage (dummy state applied). */
export function entryScreenForStage(stage: ChoreographyStage): PrototypeScreenId {
  switch (stage) {
    case "disco":
      return "dossier";
    case "off-call":
      return "firm-list";
    case "demo":
      return "firm-list";
  }
}

export type StageSeed = {
  campaign: PrototypeCampaign;
  company: PrototypeCompany;
  companyQuery: string;
  companyLocked: boolean;
  firms: FirmRow[];
  funded: boolean;
  inviteSent: boolean;
};

export function seedForStage(stage: ChoreographyStage): StageSeed {
  const base: StageSeed = {
    campaign: DUMMY_CAMPAIGN,
    company: DUMMY_COMPANY,
    companyQuery: DUMMY_COMPANY.name,
    companyLocked: true,
    firms: cloneFirms(),
    funded: false,
    inviteSent: false,
  };

  if (stage === "disco") {
    return { ...base, firms: [] };
  }
  if (stage === "demo") {
    return { ...base, funded: true, inviteSent: true };
  }
  return base;
}

/** Screens that persist when leaving to Campaigns list. */
export function isResumeScreen(screen: PrototypeScreenId): boolean {
  return ![
    "campaigns",
    "basics",
    "creating",
    "evaluating",
    "enriching",
  ].includes(screen);
}

export function backTarget(
  screen: PrototypeScreenId,
  inviteOrigin: "list" | "deploy",
): PrototypeScreenId | null {
  switch (screen) {
    case "dossier":
      return null;
    case "enriching":
    case "firm-list":
      return "dossier";
    case "deploy-choice":
      return "firm-list";
    case "invite-guest":
    case "invite-existing":
      return inviteOrigin === "list" ? "campaigns" : "deploy-choice";
    case "client-fund":
    case "running":
      return null;
    default:
      return null;
  }
}
