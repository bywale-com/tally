/** Lo-fi screen strips for Register — served from /wireframes/operator-core/*.svg
 *  (Not under /register/ — that path is the SPA route and breaks <img> loads.)
 *
 *  Versioning model (see docs/register/CHANGELOG-wireframes.md):
 *  - **Strip lineage** = one stage/role (Evaluate, Enrich, …) with SVG revisions v1…n
 *  - **Step lineage** = a beat inside a strip revision (e.g. Filter + prune under Enrich v2)
 *  - Bump **strip** when stage identity changes, a step is added/removed, or most steps move
 *  - Bump **step** when only that module’s presentation/behavior changes (lives on that strip version)
 *  - Step names honor strip panel labels; optional step `src` swaps panel preview on scrub
 *  Prefer registry fields over markdown-only changelogs for durable why/supersedes.
 */

export type WireframeRevisionStatus = "current" | "archived";

/** @deprecated Use WireframeRevisionStatus — kept for call sites during migration */
export type WireframeStripStatus = WireframeRevisionStatus;

export type WireframeStripRevision = {
  id: string;
  version: number;
  src: string;
  status: WireframeRevisionStatus;
  /** Why this strip revision was introduced */
  why?: string;
  changedAt?: string;
  supersedes?: string;
  /** Step/module versions that belong to THIS strip revision only */
  steps?: WireframeStepLineage[];
};

export type WireframeStepRevision = {
  id: string;
  version: number;
  status: WireframeRevisionStatus;
  why: string;
  changedAt: string;
  supersedes?: string;
  /**
   * Living surface until a strip SVG is redrawn.
   * `click-through` = craft landed in lo-fi app; strip asset may still show prior chrome.
   */
  surface: "click-through" | "strip";
  /** Optional panel preview overlaid on the step region when scrubbing versions */
  src?: string;
};

export type WireframeStepLineage = {
  stepId: string;
  label: string;
  howNodeIds?: string[];
  /** Hotspot on the strip SVG, percent of viewBox (0-100) */
  region?: { x: number; y: number; w: number; h: number };
  revisions: WireframeStepRevision[];
};

export type WireframeStripLineage = {
  roleId: string;
  label: string;
  when: string;
  howNodeIds: string[];
  /** Display order in Strips inventory */
  order: number;
  revisions: WireframeStripRevision[];
};

/** Flat revision view (legacy helpers + How highlight). */
export type WireframeStrip = {
  id: string;
  label: string;
  when: string;
  src: string;
  howNodeIds: string[];
  version: number;
  supersedes?: string;
  status: WireframeRevisionStatus;
  why?: string;
  changedAt?: string;
  roleId: string;
};

export type WireframeChangelogEntry = {
  id: string;
  kind: "strip" | "step";
  roleId: string;
  roleLabel: string;
  when: string;
  stepId?: string;
  stepLabel?: string;
  version: number;
  why: string;
  changedAt: string;
  status: WireframeRevisionStatus;
  surface?: "click-through" | "strip";
};

const BASE = "/wireframes/operator-core";
const WORKER_BASE = "/wireframes/worker-core";
const NON_BUSINESS_CLIENT_BASE = "/wireframes/non-business-client-core";
const BUSINESS_CLIENT_BASE = "/wireframes/business-client-core";

/** Non-business Client Core v1 — first strip authored for this outcome. */
export const NB_CONVERT_V1_WHY =
  "First strip for non-business client core: accept invite -> walk campaign -> first fund / become Business Client, so a Worker can begin and manage the campaign funded.";

/** Business Client Core v1 — first strip authored for this outcome. */
export const BC_JOIN_RUN_V1_WHY =
  "First strip for Tally business client core: join+fund -> progress notify -> respond -> stop/reclaim, so a Worker can begin and manage the campaign while the client stays informed.";

export const BC_CAMPAIGNS_V1_WHY =
  "Living desk module: Campaigns — vessel rows, Fund/Open, secondary behind More. Replaces abstract Join+fund panel from bc-join-run v1.";

export const BC_MEETINGS_V1_WHY =
  "Living desk module: Meetings — filters, history, meeting sheet with invite-before-dispute. Progress + respond live on the sheet, not a notify stub.";

export const BC_ESCROW_V1_WHY =
  "Living desk module: Escrow — Held/Released facts, ledger, Reclaim disabled with Available in Nd beside it, Request Operator quiet. No Status essay.";

/** Exact why for Evaluate v1 → v2. */
export const EVALUATE_V2_WHY =
  "Co-piloted dossier on disco: honest unknowns, call notes, explicit re-analyze, Operator clears. Replaces short verdict emulation.";

/** Exact why for Evaluate v2 → v3. */
export const EVALUATE_V3_WHY =
  "Minimalist dossier: accordion like reference (icon + title + chevron), clean field titles, sticky notes for call context (agent-readable), no form panels under every section.";

/** Create · Campaigns empty v1 — fake skeleton rows. */
export const CREATE_CAMPAIGNS_V1_WHY =
  "Empty list wore skeleton bars — placating chrome when there is nothing to show.";

/** Create · Campaigns empty v2 — honest empty; Create is the only pitch. */
export const CREATE_CAMPAIGNS_V2_WHY =
  "Honest empty body; Create stays the one loud action in the header. No fake rows.";

/** Create · Campaign basics v1 — Name label + bordered Cancel. */
export const CREATE_BASICS_V1_WHY =
  "Redundant Name label under New campaign; Cancel as bordered ghost beside Create.";

/** Create · Campaign basics v2 — field + quiet Cancel. */
export const CREATE_BASICS_V2_WHY =
  "Header is the job; single autofocus field (Campaign name); Cancel as quiet text; Create loud.";

/** Exact why for Enrich v1 → v2 (strip identity). */
export const ENRICH_V2_WHY =
  "Live firmographics table: all columns filterable, controls visible but locked while enriching, rows fill in place — not spinner then a thin firm list.";

/** Firm-list / filter+prune step v1 (as drawn on Enrich strip v2). */
export const FILTER_PRUNE_V1_WHY =
  "Always-on column filter grid above the table; dashed full-width Add firm strip.";

/** Filter + prune step v2 — craft pass; Enrich strip version unchanged. */
export const FILTER_PRUNE_V2_WHY =
  "Tower craft on click-through: quiet Filter control + anchored popover + dismissible chips; quiet Add firm in header — no dashed full-width strip. Enrich strip SVG stays at v2.";

/** Agency step v1 — Enrich CTA competing on disco dossier. */
export const AGENCY_V1_WHY =
  "Re-analyze as bordered ghost + Enrich as primary on the dossier — Enrich pitches on disco; two CTA shells.";

/** Agency step v2 — Clear gate; quiet Re-analyze. */
export const AGENCY_V2_WHY =
  "Parametric elimination on click-through: quiet text Re-analyze; one loud Clear (disco gate → off-call Enrich). Mute sparkles; lean company row; no dashed skeleton bars.";

/** @deprecated alias — prefer FILTER_PRUNE_* */
export const FIRM_LIST_V1_WHY = FILTER_PRUNE_V1_WHY;
/** @deprecated alias — prefer FILTER_PRUNE_* */
export const FIRM_LIST_V2_WHY = FILTER_PRUNE_V2_WHY;

export const OPERATOR_CORE_LINEAGES: WireframeStripLineage[] = [
  {
    roleId: "create",
    label: "Create",
    when: "Disco",
    order: 1,
    howNodeIds: ["n-create", "n-create-control", "n-create-basics", "n-create-confirm"],
    revisions: [
      {
        id: "create",
        version: 1,
        src: `${BASE}/01-create.svg`,
        status: "current",
        steps: [
          {
            stepId: "campaigns",
            label: "Campaigns",
            howNodeIds: ["n-create-control"],
            region: { x: (20 / 920) * 100, y: (36 / 280) * 100, w: (200 / 920) * 100, h: (200 / 280) * 100 },
            revisions: [
              {
                id: "create-campaigns-v1",
                version: 1,
                status: "archived",
                why: CREATE_CAMPAIGNS_V1_WHY,
                changedAt: "2026-07-23",
                surface: "click-through",
                src: `${BASE}/01-create-campaigns-v1.svg`,
              },
              {
                id: "create-campaigns-v2",
                version: 2,
                status: "current",
                supersedes: "create-campaigns-v1",
                why: CREATE_CAMPAIGNS_V2_WHY,
                changedAt: "2026-07-23",
                surface: "click-through",
                src: `${BASE}/01-create-campaigns-v2.svg`,
              },
            ],
          },
          {
            stepId: "campaign-basics",
            label: "Campaign basics",
            howNodeIds: ["n-create-basics", "n-create-confirm"],
            region: { x: (280 / 920) * 100, y: (36 / 280) * 100, w: (200 / 920) * 100, h: (200 / 280) * 100 },
            revisions: [
              {
                id: "create-basics-v1",
                version: 1,
                status: "archived",
                why: CREATE_BASICS_V1_WHY,
                changedAt: "2026-07-23",
                surface: "click-through",
                src: `${BASE}/01-create-basics-v1.svg`,
              },
              {
                id: "create-basics-v2",
                version: 2,
                status: "current",
                supersedes: "create-basics-v1",
                why: CREATE_BASICS_V2_WHY,
                changedAt: "2026-07-23",
                surface: "click-through",
                src: `${BASE}/01-create-basics-v2.svg`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    roleId: "evaluate",
    label: "Evaluate",
    when: "Disco",
    order: 2,
    howNodeIds: [
      "n-evaluate",
      "n-evaluate-pick",
      "n-evaluate-sequence",
      "n-evaluate-verdict",
    ],
    revisions: [
      {
        id: "evaluate",
        version: 1,
        src: `${BASE}/02-evaluate.svg`,
        status: "archived",
        why: "Short verdict emulation on disco.",
        changedAt: "2026-07-22",
      },
      {
        id: "evaluate-v2",
        version: 2,
        src: `${BASE}/02-evaluate-v2.svg`,
        status: "archived",
        supersedes: "evaluate",
        why: EVALUATE_V2_WHY,
        changedAt: "2026-07-22",
      },
      {
        id: "evaluate-v3",
        version: 3,
        src: `${BASE}/02-evaluate-v3.svg`,
        status: "current",
        supersedes: "evaluate-v2",
        why: EVALUATE_V3_WHY,
        changedAt: "2026-07-22",
        steps: [
          {
            stepId: "agency",
            label: "Agency",
            howNodeIds: ["n-evaluate-verdict"],
            // Panel 5 on Evaluate v3 SVG (viewBox 1280x300)
            region: { x: (1012 / 1280) * 100, y: (40 / 300) * 100, w: (120 / 1280) * 100, h: (220 / 300) * 100 },
            revisions: [
              {
                id: "evaluate-v3-agency-v1",
                version: 1,
                status: "archived",
                why: AGENCY_V1_WHY,
                changedAt: "2026-07-23",
                surface: "click-through",
                src: `${BASE}/02-evaluate-v3-agency-v1.svg`,
              },
              {
                id: "evaluate-v3-agency-v2",
                version: 2,
                status: "current",
                supersedes: "evaluate-v3-agency-v1",
                why: AGENCY_V2_WHY,
                changedAt: "2026-07-23",
                surface: "click-through",
                src: `${BASE}/02-evaluate-v3-agency-v2.svg`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    roleId: "enrich",
    label: "Enrich",
    when: "Off call",
    order: 3,
    howNodeIds: ["n-enrich", "n-enrich-control", "n-enrich-build-list", "n-enrich-ready-demo"],
    revisions: [
      {
        id: "enrich",
        version: 1,
        src: `${BASE}/03-enrich.svg`,
        status: "archived",
        why: "Spinner then a thin firm list.",
        changedAt: "2026-07-22",
      },
      {
        id: "enrich-v2",
        version: 2,
        src: `${BASE}/03-enrich-v2.svg?v=20260722g`,
        status: "current",
        supersedes: "enrich",
        why: ENRICH_V2_WHY,
        changedAt: "2026-07-22",
        steps: [
          {
            stepId: "filter-prune",
            label: "Filter + prune",
            howNodeIds: ["n-enrich-build-list"],
            // Panel 3 on Enrich v2 SVG (viewBox 1280x300)
            region: { x: (674 / 1280) * 100, y: (40 / 300) * 100, w: (280 / 1280) * 100, h: (220 / 300) * 100 },
            revisions: [
              {
                id: "enrich-v2-filter-prune-v1",
                version: 1,
                status: "archived",
                why: FILTER_PRUNE_V1_WHY,
                changedAt: "2026-07-22",
                surface: "strip",
                src: `${BASE}/03-enrich-v2-filter-prune-v1.svg`,
              },
              {
                id: "enrich-v2-filter-prune-v2",
                version: 2,
                status: "current",
                supersedes: "enrich-v2-filter-prune-v1",
                why: FILTER_PRUNE_V2_WHY,
                changedAt: "2026-07-22",
                surface: "click-through",
                src: `${BASE}/03-enrich-v2-filter-prune-v2.svg`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    roleId: "demo-invite-launch",
    label: "Demo · invite · fund · launch",
    when: "Demo",
    order: 4,
    howNodeIds: [
      "n-invite-non-business",
      "n-invite-nb-send",
      "n-invite-nb-await-fund",
      "n-launch",
      "n-launch-run",
    ],
    revisions: [
      {
        id: "demo-invite-launch",
        version: 1,
        src: `${BASE}/04-demo-invite-launch.svg`,
        status: "current",
      },
    ],
  },
  {
    roleId: "invite-business",
    label: "Invite business (later)",
    when: "Later",
    order: 5,
    howNodeIds: ["n-invite-business", "n-invite-biz-same"],
    revisions: [
      {
        id: "invite-business",
        version: 1,
        src: `${BASE}/05-invite-business.svg`,
        status: "current",
      },
    ],
  },
];

/**
 * Tally Worker — Core Outcome strip.
 * One strip (`worker-run`) covers the full Pick up → Begin → Manage → Track/notify path;
 * How source: apps/tally/src/app/register/howAnalysis/workerCoreOutcome.ts.
 */
export const WORKER_CORE_LINEAGES: WireframeStripLineage[] = [
  {
    roleId: "worker-run",
    label: "Pick up · Begin · Manage · Track",
    when: "Post-launch",
    order: 1,
    howNodeIds: [
      "n-worker-pickup",
      "n-worker-pickup-see",
      "n-worker-pickup-claim",
      "n-worker-begin",
      "n-worker-begin-start",
      "n-worker-manage",
      "n-worker-manage-work",
      "n-worker-track",
      "n-worker-track-see",
      "n-worker-track-notify",
    ],
    revisions: [
      {
        id: "worker-run",
        version: 1,
        src: `${WORKER_BASE}/01-run.svg`,
        status: "current",
      },
    ],
  },
];

/**
 * Non-business Client — Core Outcome strip.
 * One strip (`nb-convert`) covers Accept invite -> Walk campaign -> First fund / become
 * Business Client; How source: apps/tally/src/app/register/howAnalysis/nonBusinessClientCoreOutcome.ts.
 */
export const NON_BUSINESS_CLIENT_CORE_LINEAGES: WireframeStripLineage[] = [
  {
    roleId: "nb-convert",
    label: "Accept invite - Walk campaign - First fund",
    when: "Pre-customer",
    order: 1,
    howNodeIds: ["n-core", "n-accept-invite", "n-walkthrough", "n-first-fund"],
    revisions: [
      {
        id: "nb-convert",
        version: 1,
        src: `${NON_BUSINESS_CLIENT_BASE}/01-convert.svg`,
        status: "current",
        why: NB_CONVERT_V1_WHY,
        changedAt: "2026-07-23",
      },
    ],
  },
];

/**
 * Tally Business Client — Core Outcome strips.
 * Living desk modules (Campaigns / Meetings / Escrow) match BusinessClientDesk CT.
 * Legacy `bc-join-run` choreography strip is archived.
 * How source: apps/tally/src/app/register/howAnalysis/clientCoreOutcome.ts.
 */
export const BUSINESS_CLIENT_CORE_LINEAGES: WireframeStripLineage[] = [
  {
    roleId: "bc-join-run",
    label: "Join+fund - Progress notify - Respond - Stop/reclaim",
    when: "Post-sale",
    order: 0,
    howNodeIds: [
      "n-core",
      "n-join-fund-invited",
      "n-notified-progress",
      "n-respond-notification",
      "n-stop-or-recollect",
    ],
    revisions: [
      {
        id: "bc-join-run",
        version: 1,
        src: `${BUSINESS_CLIENT_BASE}/01-join-run.svg`,
        status: "archived",
        why: BC_JOIN_RUN_V1_WHY,
        changedAt: "2026-07-23",
      },
    ],
  },
  {
    roleId: "bc-campaigns",
    label: "Campaigns",
    when: "Post-sale",
    order: 1,
    howNodeIds: ["n-join-fund-invited", "n-notified-progress"],
    revisions: [
      {
        id: "bc-campaigns",
        version: 1,
        src: `${BUSINESS_CLIENT_BASE}/02-campaigns.svg`,
        status: "current",
        why: BC_CAMPAIGNS_V1_WHY,
        changedAt: "2026-07-25",
        steps: [
          {
            stepId: "vessels",
            label: "My campaigns",
            howNodeIds: ["n-join-fund-invited", "n-notified-progress"],
            region: {
              x: (220 / 1000) * 100,
              y: (88 / 300) * 100,
              w: (720 / 1000) * 100,
              h: (168 / 300) * 100,
            },
            revisions: [
              {
                id: "bc-campaigns-vessels-v1",
                version: 1,
                status: "current",
                why: BC_CAMPAIGNS_V1_WHY,
                changedAt: "2026-07-25",
                surface: "click-through",
                src: `${BUSINESS_CLIENT_BASE}/02-campaigns.svg`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    roleId: "bc-meetings",
    label: "Meetings",
    when: "Post-sale",
    order: 2,
    howNodeIds: ["n-notified-progress", "n-respond-notification"],
    revisions: [
      {
        id: "bc-meetings",
        version: 1,
        src: `${BUSINESS_CLIENT_BASE}/03-meetings.svg`,
        status: "current",
        why: BC_MEETINGS_V1_WHY,
        changedAt: "2026-07-25",
        steps: [
          {
            stepId: "history",
            label: "Meeting history",
            howNodeIds: ["n-notified-progress"],
            region: {
              x: (40 / 1000) * 100,
              y: (36 / 300) * 100,
              w: (560 / 1000) * 100,
              h: (240 / 300) * 100,
            },
            revisions: [
              {
                id: "bc-meetings-history-v1",
                version: 1,
                status: "current",
                why: "Filters + rows: pending / released / upcoming — progress as meeting facts.",
                changedAt: "2026-07-25",
                surface: "click-through",
                src: `${BUSINESS_CLIENT_BASE}/03-meetings.svg`,
              },
            ],
          },
          {
            stepId: "sheet",
            label: "Meeting sheet",
            howNodeIds: ["n-respond-notification"],
            region: {
              x: (620 / 1000) * 100,
              y: (36 / 300) * 100,
              w: (340 / 1000) * 100,
              h: (240 / 300) * 100,
            },
            revisions: [
              {
                id: "bc-meetings-sheet-v1",
                version: 1,
                status: "current",
                why: "Accept release / This doesn't count; dispute form stays closed until invite.",
                changedAt: "2026-07-25",
                surface: "click-through",
                src: `${BUSINESS_CLIENT_BASE}/03-meetings.svg`,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    roleId: "bc-escrow",
    label: "Escrow",
    when: "Post-sale",
    order: 3,
    howNodeIds: ["n-stop-or-recollect"],
    revisions: [
      {
        id: "bc-escrow",
        version: 1,
        src: `${BUSINESS_CLIENT_BASE}/04-escrow.svg`,
        status: "current",
        why: BC_ESCROW_V1_WHY,
        changedAt: "2026-07-25",
        steps: [
          {
            stepId: "facts-reclaim",
            label: "Held · Released · Reclaim",
            howNodeIds: ["n-stop-or-recollect"],
            region: {
              x: (220 / 1000) * 100,
              y: (88 / 300) * 100,
              w: (720 / 1000) * 100,
              h: (168 / 300) * 100,
            },
            revisions: [
              {
                id: "bc-escrow-facts-v1",
                version: 1,
                status: "current",
                why: BC_ESCROW_V1_WHY,
                changedAt: "2026-07-25",
                surface: "click-through",
                src: `${BUSINESS_CLIENT_BASE}/04-escrow.svg`,
              },
            ],
          },
        ],
      },
    ],
  },
];

/** @deprecated alias — prefer BUSINESS_CLIENT_CORE_LINEAGES */
export const CLIENT_CORE_LINEAGES = BUSINESS_CLIENT_CORE_LINEAGES;

/** Flat list of all strip revisions (compat). */
export const OPERATOR_CORE_WIREFRAMES: WireframeStrip[] = OPERATOR_CORE_LINEAGES.flatMap(
  flattenLineage,
);

/** Flat list of all Worker Core strip revisions (compat). */
export const WORKER_CORE_WIREFRAMES: WireframeStrip[] = WORKER_CORE_LINEAGES.flatMap(
  flattenLineage,
);

/** Flat list of all Non-business Client Core strip revisions (compat). */
export const NON_BUSINESS_CLIENT_CORE_WIREFRAMES: WireframeStrip[] =
  NON_BUSINESS_CLIENT_CORE_LINEAGES.flatMap(flattenLineage);

/** Flat list of all Business Client Core strip revisions (compat). */
export const BUSINESS_CLIENT_CORE_WIREFRAMES: WireframeStrip[] =
  BUSINESS_CLIENT_CORE_LINEAGES.flatMap(flattenLineage);

export function getLineagesForGraph(graphId: string): WireframeStripLineage[] {
  if (graphId === "operator-core-outcome") return OPERATOR_CORE_LINEAGES;
  if (graphId === "worker-core-outcome") return WORKER_CORE_LINEAGES;
  if (graphId === "non-business-client-core-outcome") return NON_BUSINESS_CLIENT_CORE_LINEAGES;
  if (graphId === "client-core-outcome") return BUSINESS_CLIENT_CORE_LINEAGES;
  return [];
}

export function getWireframesForGraph(graphId: string): WireframeStrip[] {
  return getLineagesForGraph(graphId).flatMap(flattenLineage);
}

/** Current strip revision per lineage (default inventory). */
export function currentWireframes(strips: WireframeStrip[]): WireframeStrip[] {
  return strips.filter((s) => s.status === "current");
}

/** Archived strip revisions. */
export function archivedWireframes(strips: WireframeStrip[]): WireframeStrip[] {
  return strips.filter((s) => s.status === "archived");
}

export function currentRevision(
  lineage: WireframeStripLineage,
): WireframeStripRevision {
  return (
    lineage.revisions.find((r) => r.status === "current") ??
    lineage.revisions[lineage.revisions.length - 1]
  );
}

export function currentStepRevision(
  step: WireframeStepLineage,
): WireframeStepRevision {
  return (
    step.revisions.find((r) => r.status === "current") ??
    step.revisions[step.revisions.length - 1]
  );
}

/**
 * Prefer current strip when a How node maps to both current + archived revisions.
 */
export function wireframeForHowNode(
  strips: WireframeStrip[],
  howNodeId: string | null,
): WireframeStrip | undefined {
  if (!howNodeId) return undefined;
  const matches = strips.filter((s) => s.howNodeIds.includes(howNodeId));
  if (matches.length === 0) return undefined;
  return matches.find((s) => s.status === "current") ?? matches[0];
}

export function lineageForHowNode(
  lineages: WireframeStripLineage[],
  howNodeId: string | null,
): WireframeStripLineage | undefined {
  if (!howNodeId) return undefined;
  const matches = lineages.filter(
    (l) =>
      l.howNodeIds.includes(howNodeId) ||
      l.revisions.some((r) =>
        r.steps?.some((s) => s.howNodeIds?.includes(howNodeId)),
      ),
  );
  if (matches.length === 0) return undefined;
  return (
    matches.find((l) => l.revisions.some((r) => r.status === "current")) ??
    matches[0]
  );
}

/** All strip + step revisions with a why, newest first. */
export function changelogEntries(
  lineages: WireframeStripLineage[],
): WireframeChangelogEntry[] {
  const entries: WireframeChangelogEntry[] = [];

  for (const lineage of lineages) {
    for (const rev of lineage.revisions) {
      if (!rev.why || !rev.changedAt) continue;
      entries.push({
        id: rev.id,
        kind: "strip",
        roleId: lineage.roleId,
        roleLabel: lineage.label,
        when: lineage.when,
        version: rev.version,
        why: rev.why,
        changedAt: rev.changedAt,
        status: rev.status,
      });
      for (const step of rev.steps ?? []) {
        for (const stepRev of step.revisions) {
          entries.push({
            id: stepRev.id,
            kind: "step",
            roleId: lineage.roleId,
            roleLabel: lineage.label,
            when: lineage.when,
            stepId: step.stepId,
            stepLabel: step.label,
            version: stepRev.version,
            why: stepRev.why,
            changedAt: stepRev.changedAt,
            status: stepRev.status,
            surface: stepRev.surface,
          });
        }
      }
    }
  }

  return entries.sort((a, b) => {
    const d = b.changedAt.localeCompare(a.changedAt);
    if (d !== 0) return d;
    if (a.roleId !== b.roleId) return a.roleId.localeCompare(b.roleId);
    if (a.kind !== b.kind) return a.kind === "step" ? -1 : 1;
    return b.version - a.version;
  });
}

function flattenLineage(lineage: WireframeStripLineage): WireframeStrip[] {
  return lineage.revisions.map((rev) => ({
    id: rev.id,
    label: lineage.label,
    when: lineage.when,
    src: rev.src,
    howNodeIds: lineage.howNodeIds,
    version: rev.version,
    supersedes: rev.supersedes,
    status: rev.status,
    why: rev.why,
    changedAt: rev.changedAt,
    roleId: lineage.roleId,
  }));
}
