/** Choreography moments — matches strip `when` tags in wireframesRegistry. */

export type ChoreographyStage = "disco" | "off-call" | "demo";

export const CHOREOGRAPHY_STAGES: { id: ChoreographyStage; label: string; hint: string }[] = [
  { id: "disco", label: "Disco", hint: "Create · Evaluate" },
  { id: "off-call", label: "Off call", hint: "Enrich" },
  { id: "demo", label: "Demo", hint: "Deploy · Invite · Fund · Launch" },
];

export type PrototypeCampaign = {
  id: string;
  name: string;
};

export type PrototypeScreenId =
  | "campaigns"
  | "basics"
  | "creating"
  | "campaign"
  | "evaluating"
  | "dossier"
  | "enriching"
  | "firm-list"
  | "deploy-choice"
  | "invite-guest"
  | "invite-existing"
  | "client-fund"
  | "running";

export type InviteOrigin = "list" | "deploy";

export function stageForScreen(screen: PrototypeScreenId): ChoreographyStage {
  switch (screen) {
    case "campaigns":
    case "basics":
    case "creating":
    case "campaign":
    case "evaluating":
    case "dossier":
      return "disco";
    case "enriching":
    case "firm-list":
    case "deploy-choice":
      return "off-call";
    case "invite-guest":
    case "invite-existing":
    case "client-fund":
    case "running":
      return "demo";
  }
}
