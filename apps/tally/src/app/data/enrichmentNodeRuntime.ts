import type { EnrichmentEnrollmentCriteria } from "./enrichmentEnrollment";
import { normalizeEnrollmentCriteria } from "./enrichmentEnrollment";
import {
  buildIndeedSearchUrl,
  compileIndeedQuery,
  defaultIndeedCriteria,
  type EnrichmentFieldShape,
  type EnrichmentSourceDef,
  type IndeedSearchCriteria,
} from "./enrichmentSources";
import type { EnrichmentNodeData } from "./enrichmentWorkflows";

/** Tower-style pull payload — one item per enrolled row. */
export type EnrichmentPullOutput = {
  items: Record<string, unknown>[];
  itemCount: number;
  pulledAt: string;
  transport?: string;
  error?: string | null;
  searchUrl?: string;
  rawMarkdown?: string | null;
};

export type EnrichmentNodePayload = EnrichmentPullOutput & Record<string, unknown>;

const SCANNER_BASE =
  (import.meta.env.VITE_SCANNER_URL as string | undefined)?.replace(/\/$/, "") ||
  "/api/scanner";

export function countPullItems(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "object" && value != null && "itemCount" in value) {
    return Number((value as { itemCount: number }).itemCount) || 0;
  }
  if (
    typeof value === "object" &&
    value != null &&
    Array.isArray((value as { items?: unknown[] }).items)
  ) {
    return (value as { items: unknown[] }).items.length;
  }
  return value ? 1 : 0;
}

export function readItemPath(item: unknown, path: string): unknown {
  let cur: unknown = item;
  for (const part of path.split(".").filter(Boolean)) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

export function clonePullWithItems(
  input: EnrichmentNodePayload | null | undefined,
  items: Record<string, unknown>[],
): EnrichmentNodePayload {
  const base = input && typeof input === "object" ? { ...input } : {};
  return {
    ...base,
    items,
    itemCount: items.length,
    pulledAt: new Date().toISOString(),
  };
}

export function passThroughItems(
  input: EnrichmentNodePayload | null | undefined,
): EnrichmentNodePayload {
  const items = input?.items ?? [];
  return clonePullWithItems(input, items);
}

function evalFieldGate(
  item: Record<string, unknown>,
  fieldPath: string,
  fieldOp: EnrichmentNodeData["fieldOp"],
  fieldValue: string | undefined,
): boolean {
  const left = readItemPath(item, fieldPath);
  const op = fieldOp ?? "exists";
  if (op === "exists") return left != null && left !== "";
  const right = fieldValue ?? "";
  const leftStr = left == null ? "" : String(left);
  if (op === "contains") return leftStr.toLowerCase().includes(right.toLowerCase());
  if (op === "eq") return leftStr === right;
  const leftNum = Number(left);
  const rightNum = Number(right);
  if (Number.isFinite(leftNum) && Number.isFinite(rightNum)) {
    if (op === "gte") return leftNum >= rightNum;
    if (op === "lte") return leftNum <= rightNum;
  }
  return false;
}

/** Run a condition / field-gate node against upstream items. */
export function runFieldGateNode(
  data: EnrichmentNodeData,
  input: EnrichmentNodePayload | null | undefined,
): EnrichmentNodePayload {
  const items = input?.items ?? [];
  const path = data.fieldPath?.trim();
  if (!path) {
    return clonePullWithItems(input, items);
  }
  const kept = items.filter((item) =>
    evalFieldGate(item, path, data.fieldOp, data.fieldValue),
  );
  return clonePullWithItems(input, kept);
}

/** Pass-through for operations / actions until specialized runners land. */
export function runPassThroughNode(
  input: EnrichmentNodePayload | null | undefined,
): EnrichmentNodePayload {
  return passThroughItems(input);
}

function applyFieldMap(
  raw: Record<string, unknown>,
  source: EnrichmentSourceDef,
  criteria: EnrichmentEnrollmentCriteria,
): Record<string, unknown> {
  const maps = criteria.sourceFieldMaps[source.id];
  const discarded = new Set(criteria.sourceDiscardedOutputs[source.id] ?? []);
  if (!maps?.length) {
    return { ...raw };
  }
  const out: Record<string, unknown> = {};
  for (const entry of maps) {
    if (!entry.outputPath || discarded.has(entry.outputPath)) continue;
    if (entry.sourcePath in raw) {
      out[entry.outputPath] = raw[entry.sourcePath];
    }
  }
  return Object.keys(out).length > 0 ? out : { ...raw };
}

export async function fetchIndeedSearch(
  indeed: IndeedSearchCriteria,
  options: { allowFixture?: boolean } = {},
): Promise<EnrichmentPullOutput> {
  const allowFixture = options.allowFixture ?? true;
  const normalized = {
    ...defaultIndeedCriteria(),
    ...indeed,
  };
  const query = compileIndeedQuery(normalized);
  const searchUrl = buildIndeedSearchUrl(normalized);
  const res = await fetch(`${SCANNER_BASE}/indeed/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      location: normalized.location,
      country: normalized.country,
      radius: normalized.radius,
      results_wanted: Math.min(Math.max(normalized.resultsWanted || 25, 1), 50),
      match_mode: normalized.matchMode === "boolean" ? "boolean" : normalized.matchMode,
      fromage_days: normalized.fromageDays,
      salary_min: normalized.salaryMin,
      allow_fixture: allowFixture,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Scanner HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }
  const data = (await res.json()) as {
    ok?: boolean;
    blocked?: boolean;
    transport?: string;
    error?: string | null;
    items?: Record<string, unknown>[];
    itemCount?: number;
    pulledAt?: string;
    search_url?: string;
    raw_markdown?: string | null;
  };
  if (data.blocked && !(data.items?.length)) {
    throw new Error(data.error || "Indeed search blocked");
  }
  return {
    items: data.items ?? [],
    itemCount: data.itemCount ?? data.items?.length ?? 0,
    pulledAt: data.pulledAt ?? new Date().toISOString(),
    transport: data.transport,
    error: data.error ?? null,
    searchUrl: data.search_url ?? searchUrl,
    rawMarkdown: data.raw_markdown ?? null,
  };
}

/**
 * Run enrichment trigger → live Indeed (and later other sources).
 * Merges selected source pulls into one Tower-style items payload.
 */
export async function runEnrollmentTriggerPull(
  enrollment: EnrichmentEnrollmentCriteria | undefined,
): Promise<EnrichmentPullOutput> {
  const criteria = normalizeEnrollmentCriteria(enrollment);
  const selected = criteria.sources.filter((s) => criteria.sourceIds.includes(s.id));
  if (selected.length === 0) {
    throw new Error("Select at least one source in Configuration");
  }

  const items: Record<string, unknown>[] = [];
  const errors: string[] = [];
  let transport: string | undefined;
  let searchUrl: string | undefined;
  let rawMarkdown: string | null | undefined;

  for (const source of selected) {
    if (source.kind === "indeed") {
      const indeed = { ...defaultIndeedCriteria(), ...(source.indeed ?? {}) };
      const query = compileIndeedQuery(indeed);
      if (!query) {
        errors.push(`${source.name}: set a search query`);
        continue;
      }
      try {
        const pull = await fetchIndeedSearch(indeed, { allowFixture: false });
        transport = pull.transport ?? transport;
        searchUrl = pull.searchUrl ?? searchUrl;
        rawMarkdown = pull.rawMarkdown ?? rawMarkdown;
        for (const raw of pull.items) {
          items.push(applyFieldMap(raw, source, criteria));
        }
        if (pull.error) {
          errors.push(`${source.name}: ${pull.error}`);
        }
      } catch (e) {
        errors.push(`${source.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
      continue;
    }
    errors.push(`${source.name}: live pull not wired yet (Indeed only)`);
  }

  if (items.length === 0) {
    throw new Error(errors[0] || "No items pulled");
  }

  return {
    items,
    itemCount: items.length,
    pulledAt: new Date().toISOString(),
    transport,
    error: errors.length ? errors.join(" · ") : null,
    searchUrl,
    rawMarkdown,
  };
}

function inferFieldType(path: string, value: unknown): EnrichmentFieldShape["type"] {
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (value != null && typeof value === "object") return "json";
  const p = path.toLowerCase();
  if (p === "url" || p.endsWith("_url") || (typeof value === "string" && /^https?:\/\//.test(value))) {
    return "url";
  }
  if (p.endsWith("_at") || p.includes("date") || p === "posted_at") return "date";
  return "string";
}

function labelFromPath(path: string): string {
  return path
    .split(/[._]/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Derive the incoming shape from raw pulled items — the union of keys the
 * scrape actually returned, no hardcoded schema.
 */
export function deriveShapeFromItems(
  items: Record<string, unknown>[],
): EnrichmentFieldShape[] {
  const seen = new Map<string, EnrichmentFieldShape>();
  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (seen.has(key)) continue;
      seen.set(key, {
        path: key,
        label: labelFromPath(key),
        type: inferFieldType(key, value),
      });
    }
  }
  return [...seen.values()];
}

/**
 * Pull — scrape the raw, unedited rows and derive the incoming shape from them.
 * Feeds the incoming → end-schema mapper. Does NOT write node Output (Run does).
 */
export async function pullIndeedSourceLive(
  source: EnrichmentSourceDef,
): Promise<{ source: EnrichmentSourceDef; output: EnrichmentPullOutput }> {
  const indeed = { ...defaultIndeedCriteria(), ...(source.indeed ?? {}) };
  const output = await fetchIndeedSearch(indeed, { allowFixture: false });
  const query = compileIndeedQuery(indeed);
  const shape = deriveShapeFromItems(output.items);
  return {
    source: {
      ...source,
      verified: output.itemCount > 0,
      shape,
      indeed,
      lastPulledAt: output.pulledAt,
      lastPullCount: output.itemCount,
      // Keep a small raw sample so the mapper can preview each incoming field.
      lastPullSample: output.items.slice(0, 5),
      description: query
        ? `Indeed · ${query}${indeed.location ? ` · ${indeed.location}` : ""}${
            indeed.fromageDays != null ? ` · ≤${indeed.fromageDays}d` : ""
          }`
        : source.description,
    },
    output,
  };
}

/** Format a field's sample values from the last Pull for the incoming preview. */
export function formatIncomingFieldSnippet(
  sample: Record<string, unknown>[] | undefined,
  path: string,
  maxValues = 3,
): string | null {
  if (!sample?.length) return null;
  const values: string[] = [];
  for (const row of sample) {
    if (!(path in row)) continue;
    const v = row[path];
    if (v == null) continue;
    let s: string;
    if (typeof v === "string") s = v;
    else if (typeof v === "number" || typeof v === "boolean") s = String(v);
    else {
      try {
        s = JSON.stringify(v);
      } catch {
        s = String(v);
      }
    }
    s = s.replace(/\s+/g, " ").trim();
    if (!s) continue;
    if (s.length > 72) s = `${s.slice(0, 72)}…`;
    if (!values.includes(s)) values.push(s);
    if (values.length >= maxValues) break;
  }
  return values.length > 0 ? values.join(" · ") : null;
}
