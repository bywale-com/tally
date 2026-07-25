import type { Edge, Node } from "@xyflow/react";
import type { EnrichmentBuildModule } from "./enrichmentBuildModules";
import {
  defaultOutputSchema,
  emptyEnrollmentCriteria,
  formatEnrollmentSummary,
  identityFieldMaps,
  canRunEnrollment,
  type EnrichmentEnrollmentCriteria,
} from "./enrichmentEnrollment";
import type { EnrichmentNodePayload } from "./enrichmentNodeRuntime";
import { CATALOG_SOURCES } from "./enrichmentSources";
import type { EnrichmentKind, EnrichmentStatus } from "./enrichments";
import { normalizeEnrichmentLabel } from "./enrichments";

export type EnrichmentEditorTab = "workflow" | "runs" | "settings";

export type EnrichmentNodeType =
  | "trigger"
  | "constant"
  | "condition"
  | "operation"
  | "rule"
  | "action"
  | "exit";

export type EnrichmentTriggerKind = "manual" | "schedule" | "source_update";

export type EnrichmentNodeData = {
  label: string;
  configured: boolean;
  buildModule?: EnrichmentBuildModule;
  triggerKind?: EnrichmentTriggerKind;
  scheduleSummary?: string;
  /** Enrichment criteria — required on every trigger (like Automations enrollment). */
  enrollmentCriteria?: EnrichmentEnrollmentCriteria;
  enrollmentHint?: string;
  /** Tower-style last pull output ({ items, itemCount, pulledAt }). */
  lastOutput?: EnrichmentNodePayload | null;
  lastInput?: EnrichmentNodePayload | null;
  lastRunError?: string | null;
  constantKind?: "search_phrases" | "acv_floor";
  constantSummary?: string;
  constantValue?: string;
  conditionKind?: "field_gate" | "if";
  conditionSummary?: string;
  fieldPath?: string;
  fieldOp?: "exists" | "contains" | "gte" | "lte" | "eq";
  fieldValue?: string;
  operationKind?: "dedupe" | "map" | "normalize";
  operationSummary?: string;
  ruleKind?: "deep_screen" | "lane_route" | "dialability";
  ruleSummary?: string;
  actionKind?: "export_csv" | "write_results" | "open_dial_list";
  actionSummary?: string;
  runStatus?: "idle" | "running" | "done" | "error";
};

export type EnrichmentWorkflow = {
  id: string;
  name: string;
  /** Set when enrichment criteria kind is chosen on the trigger. */
  kind?: EnrichmentKind;
  status: EnrichmentStatus;
  updatedAt: string;
  nodes: Node<EnrichmentNodeData>[];
  edges: Edge[];
  runs: EnrichmentRun[];
};

export type EnrichmentRun = {
  id: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "done" | "failed" | "cancelled";
  summary: string;
  survivors?: number;
};

export type PaletteBlock = {
  id: string;
  label: string;
  description: string;
  module: EnrichmentBuildModule;
  nodeType: EnrichmentNodeType;
  defaultData: Partial<EnrichmentNodeData>;
};

export type TriggerOption = {
  id: string;
  label: string;
  description: string;
  triggerKind: EnrichmentTriggerKind;
};

export const ENRICHMENT_TRIGGER_OPTIONS: TriggerOption[] = [
  {
    id: "trigger-manual",
    label: "Manual run",
    description: "Run on demand from Tally",
    triggerKind: "manual",
  },
  {
    id: "trigger-schedule",
    label: "Schedule-based trigger",
    description: "Run on a recurring cadence",
    triggerKind: "schedule",
  },
  {
    id: "trigger-source",
    label: "Source update",
    description: "Run when enrolled sources have new rows",
    triggerKind: "source_update",
  },
];

export const ENRICHMENT_PALETTE_BLOCKS: PaletteBlock[] = [
  {
    id: "const-search",
    label: "Search phrases",
    description: "Role + confession query set",
    module: "constants",
    nodeType: "constant",
    defaultData: {
      label: "Search phrases",
      constantKind: "search_phrases",
      constantSummary: "Founding AE + confession defaults",
      constantValue: "founding AE, self-sourced, no SDR",
      configured: true,
    },
  },
  {
    id: "const-acv",
    label: "ACV floor",
    description: "Minimum annual contract value",
    module: "constants",
    nodeType: "constant",
    defaultData: {
      label: "ACV floor",
      constantKind: "acv_floor",
      constantSummary: "$10,000 / year",
      constantValue: "10000",
      configured: true,
    },
  },
  {
    id: "cond-field",
    label: "Field gate",
    description: "Keep rows matching a field rule",
    module: "conditions",
    nodeType: "condition",
    defaultData: {
      label: "Field gate",
      conditionKind: "field_gate",
      conditionSummary: "Configure field…",
      configured: false,
    },
  },
  {
    id: "cond-if",
    label: "If",
    description: "True / false branch on a condition",
    module: "conditions",
    nodeType: "condition",
    defaultData: {
      label: "If",
      conditionKind: "if",
      conditionSummary: "Configure…",
      configured: false,
    },
  },
  {
    id: "op-dedupe",
    label: "Dedupe",
    description: "Collapse company + title hashes",
    module: "operations",
    nodeType: "operation",
    defaultData: {
      label: "Dedupe",
      operationKind: "dedupe",
      operationSummary: "hash(company|title)",
      configured: true,
    },
  },
  {
    id: "op-normalize",
    label: "Normalize",
    description: "Normalize whitespace / hyphens",
    module: "operations",
    nodeType: "operation",
    defaultData: {
      label: "Normalize",
      operationKind: "normalize",
      operationSummary: "title + body",
      configured: true,
    },
  },
  {
    id: "op-exit",
    label: "Exit",
    description: "End this branch",
    module: "operations",
    nodeType: "exit",
    defaultData: {
      label: "Exit",
      configured: true,
    },
  },
  {
    id: "rule-deep",
    label: "Deep screen",
    description: "Layered kill-fast rubric",
    module: "rules",
    nodeType: "rule",
    defaultData: {
      label: "Deep screen",
      ruleKind: "deep_screen",
      ruleSummary: "Layers 0–4 · dialability ranking",
      configured: true,
    },
  },
  {
    id: "rule-lane",
    label: "Lane route",
    description: "Assign Lane A / B / DQ",
    module: "rules",
    nodeType: "rule",
    defaultData: {
      label: "Lane route",
      ruleKind: "lane_route",
      ruleSummary: "A default · ACV decide",
      configured: true,
    },
  },
  {
    id: "rule-dial",
    label: "Dialability rank",
    description: "Prefer short-cycle congruent dials",
    module: "rules",
    nodeType: "rule",
    defaultData: {
      label: "Dialability rank",
      ruleKind: "dialability",
      ruleSummary: "dialability > legibility",
      configured: true,
    },
  },
  {
    id: "act-export",
    label: "Export CSV",
    description: "Write selected result columns",
    module: "actions",
    nodeType: "action",
    defaultData: {
      label: "Export CSV",
      actionKind: "export_csv",
      actionSummary: "A-list columns",
      configured: true,
    },
  },
  {
    id: "act-write",
    label: "Write results",
    description: "Persist survivors to results store",
    module: "actions",
    nodeType: "action",
    defaultData: {
      label: "Write results",
      actionKind: "write_results",
      actionSummary: "Postgres results table",
      configured: true,
    },
  },
  {
    id: "act-dial",
    label: "Open dial list",
    description: "Surface call-ready companies",
    module: "actions",
    nodeType: "action",
    defaultData: {
      label: "Open dial list",
      actionKind: "open_dial_list",
      actionSummary: "Call-ready + conditional",
      configured: true,
    },
  },
];

export function workflowHasTrigger(nodes: Node<EnrichmentNodeData>[]): boolean {
  return nodes.some((n) => n.type === "trigger");
}

export function isTriggerNodeConfigured(data: EnrichmentNodeData): boolean {
  return canRunEnrollment(data.enrollmentCriteria);
}

export function createTriggerNode(
  triggerKind: EnrichmentTriggerKind,
  existingIds: string[],
): Node<EnrichmentNodeData> {
  const labels: Record<EnrichmentTriggerKind, string> = {
    manual: "Manual run",
    schedule: "Schedule",
    source_update: "Source update",
  };
  const enrollmentCriteria = emptyEnrollmentCriteria();
  const id = uniqueId("trigger", existingIds);
  return {
    id,
    type: "trigger",
    position: { x: 80, y: 120 },
    data: {
      label: labels[triggerKind],
      triggerKind,
      configured: false,
      enrollmentCriteria,
      enrollmentHint: "Records included when this enrichment is run.",
      scheduleSummary: triggerKind === "schedule" ? "Daily 09:00" : undefined,
    },
  };
}

export function createNodeFromBlock(
  block: PaletteBlock,
  existingIds: string[],
  position: { x: number; y: number },
): Node<EnrichmentNodeData> {
  const id = uniqueId(block.nodeType, existingIds);
  return {
    id,
    type: block.nodeType,
    position,
    data: {
      label: block.label,
      configured: block.defaultData.configured ?? false,
      buildModule: block.module,
      ...block.defaultData,
    },
  };
}

function uniqueId(prefix: string, existing: string[]): string {
  let n = 1;
  let id = `${prefix}-${n}`;
  while (existing.includes(id)) {
    n += 1;
    id = `${prefix}-${n}`;
  }
  return id;
}

export function appendNodeAfter(
  nodes: Node<EnrichmentNodeData>[],
  edges: Edge[],
  afterId: string,
  block: PaletteBlock,
  sourceHandle?: string,
): { nodes: Node<EnrichmentNodeData>[]; edges: Edge[] } {
  const after = nodes.find((n) => n.id === afterId);
  if (!after) return { nodes, edges };
  const ids = nodes.map((n) => n.id);
  const created = createNodeFromBlock(block, ids, {
    x: after.position.x + 280,
    y: after.position.y + (sourceHandle === "false" ? 100 : 0),
  });
  const edge: Edge = {
    id: `e-${afterId}-${created.id}-${sourceHandle ?? "out"}`,
    source: afterId,
    target: created.id,
    sourceHandle: sourceHandle,
  };
  return { nodes: [...nodes, created], edges: [...edges, edge] };
}

export function deleteWorkflowNode(
  nodes: Node<EnrichmentNodeData>[],
  edges: Edge[],
  nodeId: string,
): { nodes: Node<EnrichmentNodeData>[]; edges: Edge[] } {
  return {
    nodes: nodes.filter((n) => n.id !== nodeId),
    edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
  };
}

/** New enrichment — empty canvas until Add trigger (Automations pattern). */
export function createEmptyWorkflow(id: string, name: string): EnrichmentWorkflow {
  return {
    id,
    name,
    status: "idle",
    updatedAt: new Date().toISOString(),
    nodes: [],
    edges: [],
    runs: [],
  };
}

export function createEnrichmentWorkflow(existing: EnrichmentWorkflow[]): EnrichmentWorkflow {
  const untitledCount = existing.filter((w) =>
    /^Untitled enrichment( \d+)?$/.test(w.name),
  ).length;
  const name =
    untitledCount === 0
      ? "Untitled enrichment"
      : `Untitled enrichment ${untitledCount + 1}`;
  return createEmptyWorkflow(`enrichment-${Date.now()}`, name);
}

export { normalizeEnrichmentLabel };

function seedEnrollment(): EnrichmentEnrollmentCriteria {
  const sources = structuredClone(CATALOG_SOURCES);
  const sourceIds = ["src-greenhouse", "src-ashby", "src-hn"];
  const sourceFieldMaps: EnrichmentEnrollmentCriteria["sourceFieldMaps"] = {};
  for (const id of sourceIds) {
    const src = sources.find((s) => s.id === id);
    if (src) sourceFieldMaps[id] = identityFieldMaps(src);
  }
  return {
    sourceIds,
    sources,
    outputSchema: defaultOutputSchema(),
    sourceFieldMaps,
    sourceDiscardedOutputs: {},
    mappingAttention: {},
    freshnessDays: 60,
    goUntil: { fieldPath: "a_list_count", op: "gte", value: "20" },
    kind: "jobs",
  };
}

/** Seed: configured trigger enrollment → dedupe → deep screen → export */
export function createSeedLaneAWorkflow(): EnrichmentWorkflow {
  const enrollment = seedEnrollment();
  const trigger: Node<EnrichmentNodeData> = {
    id: "trigger-1",
    type: "trigger",
    position: { x: 80, y: 120 },
    data: {
      label: "Manual run",
      triggerKind: "manual",
      configured: true,
      enrollmentCriteria: enrollment,
      enrollmentHint: `Pull ${formatEnrollmentSummary(enrollment)}`,
    },
  };
  const dedupe: Node<EnrichmentNodeData> = {
    id: "op-1",
    type: "operation",
    position: { x: 420, y: 120 },
    data: {
      label: "Dedupe",
      configured: true,
      buildModule: "operations",
      operationKind: "dedupe",
      operationSummary: "hash(company|title)",
    },
  };
  const deep: Node<EnrichmentNodeData> = {
    id: "rule-1",
    type: "rule",
    position: { x: 700, y: 120 },
    data: {
      label: "Deep screen",
      configured: true,
      buildModule: "rules",
      ruleKind: "deep_screen",
      ruleSummary: "Layers 0–4",
    },
  };
  const exportAct: Node<EnrichmentNodeData> = {
    id: "act-1",
    type: "action",
    position: { x: 980, y: 120 },
    data: {
      label: "Export CSV",
      configured: true,
      buildModule: "actions",
      actionKind: "export_csv",
      actionSummary: "A-list columns",
    },
  };
  return {
    id: "enrichment-lane-a",
    name: "Lane A — founding AE",
    kind: "jobs" as const,
    status: "done",
    updatedAt: new Date().toISOString(),
    nodes: [trigger, dedupe, deep, exportAct],
    edges: [
      { id: "e1", source: trigger.id, target: dedupe.id },
      { id: "e2", source: dedupe.id, target: deep.id },
      { id: "e3", source: deep.id, target: exportAct.id },
    ],
    runs: [
      {
        id: "run-seed-1",
        startedAt: new Date(Date.now() - 86400000).toISOString(),
        finishedAt: new Date(Date.now() - 86000000).toISOString(),
        status: "done",
        summary: "23 triage INs · 8 A-list survivors",
        survivors: 8,
      },
    ],
  };
}

/** Empty canvas — Add trigger to start */
export function createSeedFreshWorkflow(): EnrichmentWorkflow {
  return {
    id: "enrichment-fresh",
    name: "Fresh search · limit 30",
    status: "idle",
    updatedAt: new Date().toISOString(),
    nodes: [],
    edges: [],
    runs: [],
  };
}

export function createSeedRunningWorkflow(): EnrichmentWorkflow {
  const enrollment = seedEnrollment();
  const trigger: Node<EnrichmentNodeData> = {
    id: "trigger-1",
    type: "trigger",
    position: { x: 80, y: 120 },
    data: {
      label: "Manual run",
      triggerKind: "manual",
      configured: true,
      enrollmentCriteria: enrollment,
      enrollmentHint: `Pull ${formatEnrollmentSummary(enrollment)}`,
      runStatus: "running",
    },
  };
  return {
    id: "enrichment-running",
    name: "Deep screen batch",
    kind: "jobs",
    status: "running",
    updatedAt: new Date().toISOString(),
    nodes: [trigger],
    edges: [],
    runs: [
      {
        id: "run-live-1",
        startedAt: new Date().toISOString(),
        status: "running",
        summary: "Pulling enrolled sources…",
      },
    ],
  };
}
