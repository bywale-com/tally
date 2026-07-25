/** Register Outcomes — from conjure sits (docs/register/OUTCOMES-FROM-SITS.md).
 * Secondary outcomes folded into ranked Can'ts under each living persona Core.
 */

export type OutcomeEntityId =
  | "tally-operator"
  | "non-business-client"
  | "tally-business-client"
  | "tally-worker"
  | "tally-agent";

export type OutcomeStub = {
  id: string;
  index?: number;
  label: string;
  statement: string;
  howGraphId?: string;
};

export type OutcomeEntity = {
  id: OutcomeEntityId;
  label: string;
  note?: string;
  outcomes: OutcomeStub[];
  deferredNote?: string;
};

/**
 * Funnel: Operator prepares priced meeting-vessel → Guest converts / BC funds →
 * Worker books meetings → escrow releases. Clients never create campaigns.
 *
 * Under each living persona: Outcome → Can'ts → Furnish (canonical inventory).
 */
export const OUTCOME_ENTITIES: OutcomeEntity[] = [
  {
    id: "tally-operator",
    label: "Tally Operator",
    note: "Deal architect. Can'ts + Furnish hang under Outcome.",
    outcomes: [
      {
        id: "operator-core",
        label: "Outcome",
        statement:
          "As a Tally Operator, I can create, evaluate (dossier as pricing reason), enrich after verdict, invite, and launch only after fund — so that a client can join/fund a priced pay-per-booked-meeting vessel and a Worker can pick up only what is funded and launched.",
        howGraphId: "operator-core-outcome",
      },
    ],
  },
  {
    id: "non-business-client",
    label: "Non-business Client",
    note: "Guest pre-fund. Can'ts + Furnish hang under Outcome.",
    outcomes: [
      {
        id: "non-biz-core",
        label: "Outcome",
        statement:
          "As a non-business client, I can see a campaign with locked qualification rules, price-per-meeting, and escrow release/return rules, then fund or walk away — so that I only put capital into a risk-mitigated meeting vessel (and a Worker can later begin the campaign I funded).",
        howGraphId: "non-business-client-core-outcome",
      },
    ],
  },
  {
    id: "tally-business-client",
    label: "Tally Business Client",
    note: "Payer continuum after first fund. Can'ts + Furnish hang under Outcome.",
    outcomes: [
      {
        id: "client-core",
        label: "Outcome",
        statement:
          "As a Tally business client, I can fund an Operator-created campaign into escrow hold, receive qualified booked meetings against locked criteria, and keep control of unspent capital — so that a Worker is paid only for real meetings while my money and brand stay protected.",
        howGraphId: "client-core-outcome",
      },
    ],
  },
  {
    id: "tally-worker",
    label: "Tally Worker",
    note: "Meeting closer. Can'ts + Furnish hang under Outcome.",
    outcomes: [
      {
        id: "worker-core",
        label: "Outcome",
        statement:
          "As a Tally Worker, I can pick up a launched campaign, begin it, manage outreach against locked rules, and track booked meetings — so that business clients receive qualified meetings and escrow can release.",
        howGraphId: "worker-core-outcome",
      },
    ],
  },
  {
    id: "tally-agent",
    label: "Tally Agent",
    outcomes: [],
    deferredNote:
      "v2 — crystallizes when live re-analyze / dossier math bottoms out at “the agent does X.”",
  },
];
