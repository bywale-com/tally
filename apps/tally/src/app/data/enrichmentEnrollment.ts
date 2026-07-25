import type { EnrichmentFieldShape, EnrichmentSourceDef } from "./enrichmentSources";
import { CATALOG_SOURCES, POSTING_SHAPE } from "./enrichmentSources";
import type { EnrichmentKind } from "./enrichments";

/** Table-stakes pull criteria — set on the trigger before any graph nodes run. */
export type EnrichmentGoUntil = {
  fieldPath: string;
  op: "gte" | "eq" | "lte";
  value: string;
};

/** Canonical end schema — every source maps into this. */
export type EnrichmentOutputField = EnrichmentFieldShape;

/**
 * One incoming source field → an output-schema path, or null to skip (don't pull).
 */
export type SourceFieldMapEntry = {
  sourcePath: string;
  outputPath: string | null;
};

/**
 * Attention after end-schema field is removed from Settings (not from trigger).
 * Blocks run until reviewed.
 */
export type SourceMappingAttention = {
  clearedIncomingPaths: string[];
  removedOutputLabels: string[];
};

export type EnrichmentEnrollmentCriteria = {
  /**
   * Jobs vs companies — chosen on the first enrichment-criteria screen.
   * Undefined until the user picks (picker is shown).
   */
  kind?: EnrichmentKind;
  sourceIds: string[];
  sources: EnrichmentSourceDef[];
  /** Shared end schema for this workflow (field catalog edits live in Settings later). */
  outputSchema: EnrichmentOutputField[];
  /** Per-source incoming → output maps. null output = don't pull that incoming. */
  sourceFieldMaps: Record<string, SourceFieldMapEntry[]>;
  /**
   * End-schema fields this source is not required to fill.
   * Does not delete the field from the workflow schema.
   */
  sourceDiscardedOutputs: Record<string, string[]>;
  /** Set when Settings removes an end-schema field that sources mapped to. */
  mappingAttention: Record<string, SourceMappingAttention>;
  freshnessDays: number;
  goUntil: EnrichmentGoUntil | null;
};

export function defaultOutputSchema(): EnrichmentOutputField[] {
  return structuredClone(POSTING_SHAPE);
}

export function emptyFieldMapsForSource(source: EnrichmentSourceDef): SourceFieldMapEntry[] {
  const shape = source.shape.length > 0 ? source.shape : [];
  return shape.map((f) => ({ sourcePath: f.path, outputPath: null }));
}

export function identityFieldMaps(source: EnrichmentSourceDef): SourceFieldMapEntry[] {
  return source.shape.map((f) => ({ sourcePath: f.path, outputPath: f.path }));
}

export function emptyEnrollmentCriteria(): EnrichmentEnrollmentCriteria {
  return {
    sourceIds: [],
    sources: structuredClone(CATALOG_SOURCES),
    outputSchema: defaultOutputSchema(),
    sourceFieldMaps: {},
    sourceDiscardedOutputs: {},
    mappingAttention: {},
    freshnessDays: 60,
    goUntil: null,
  };
}

/** Backfill fields added after older in-session / HMR state. */
export function normalizeEnrollmentCriteria(
  c: EnrichmentEnrollmentCriteria | undefined,
): EnrichmentEnrollmentCriteria {
  if (!c) return emptyEnrollmentCriteria();
  const sourcesById = new Map((c.sources ?? []).map((source) => [source.id, source]));
  const sources = [
    ...CATALOG_SOURCES.map((catalogSource) => sourcesById.get(catalogSource.id) ?? catalogSource),
    ...(c.sources ?? []).filter((source) => !CATALOG_SOURCES.some((c) => c.id === source.id)),
  ];
  return {
    ...c,
    kind: c.kind,
    sourceIds: c.sourceIds ?? [],
    sources: structuredClone(sources),
    outputSchema: c.outputSchema?.length ? c.outputSchema : defaultOutputSchema(),
    sourceFieldMaps: c.sourceFieldMaps ?? {},
    sourceDiscardedOutputs: c.sourceDiscardedOutputs ?? {},
    mappingAttention: c.mappingAttention ?? {},
    freshnessDays: c.freshnessDays ?? 60,
    goUntil: c.goUntil ?? null,
  };
}

export function discardedOutputsForSource(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
): string[] {
  return (c.sourceDiscardedOutputs ?? {})[sourceId] ?? [];
}

export function sourceNeedsMappingAttention(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
): boolean {
  const att = (c.mappingAttention ?? {})[sourceId];
  return Boolean(att && (att.clearedIncomingPaths.length > 0 || att.removedOutputLabels.length > 0));
}

export function enrollmentHasUnresolvedIssues(
  c: EnrichmentEnrollmentCriteria | undefined,
): boolean {
  if (!c) return true;
  const n = normalizeEnrollmentCriteria(c);
  const paths = new Set(n.outputSchema.map((f) => f.path));
  for (const id of n.sourceIds) {
    if (sourceNeedsMappingAttention(n, id)) return true;
    for (const m of n.sourceFieldMaps[id] ?? []) {
      if (m.outputPath && !paths.has(m.outputPath)) return true;
    }
  }
  if (
    n.goUntil &&
    !paths.has(n.goUntil.fieldPath) &&
    !["survivor_count", "a_list_count"].includes(n.goUntil.fieldPath)
  ) {
    return true;
  }
  return false;
}

export function isEnrollmentConfigured(c: EnrichmentEnrollmentCriteria | undefined): boolean {
  if (!c) return false;
  const n = normalizeEnrollmentCriteria(c);
  if (n.sourceIds.length === 0) return false;
  const selected = n.sources.filter((s) => n.sourceIds.includes(s.id));
  if (selected.length === 0) return false;
  if (!selected.every((s) => s.verified)) return false;
  if (!n.freshnessDays || n.freshnessDays < 1) return false;
  for (const s of selected) {
    const maps = n.sourceFieldMaps[s.id] ?? [];
    if (!maps.some((m) => m.outputPath != null)) return false;
  }
  return true;
}

export function canRunEnrollment(c: EnrichmentEnrollmentCriteria | undefined): boolean {
  return isEnrollmentConfigured(c) && !enrollmentHasUnresolvedIssues(c);
}

export function formatEnrollmentSummary(c: EnrichmentEnrollmentCriteria): string {
  if (!isEnrollmentConfigured(c)) return "Add enrichment criteria";
  if (enrollmentHasUnresolvedIssues(c)) return "Resolve mapping attention before run";
  const names = c.sources
    .filter((s) => c.sourceIds.includes(s.id))
    .map((s) => s.name);
  const src =
    names.length <= 2 ? names.join(" · ") : `${names.slice(0, 2).join(" · ")} +${names.length - 2}`;
  const until = c.goUntil
    ? ` · until ${c.goUntil.fieldPath} ${c.goUntil.op} ${c.goUntil.value}`
    : "";
  return `${src} · ≤${c.freshnessDays}d${until}`;
}

export function enrollmentFieldOptions(c: EnrichmentEnrollmentCriteria): {
  path: string;
  label: string;
}[] {
  const map = new Map<string, { path: string; label: string }>();
  for (const f of c.outputSchema) {
    map.set(f.path, { path: f.path, label: f.label });
  }
  map.set("survivor_count", { path: "survivor_count", label: "Survivor count" });
  map.set("a_list_count", { path: "a_list_count", label: "A-list count" });
  return [...map.values()];
}

export function mappedFieldsForNodes(c: EnrichmentEnrollmentCriteria): {
  path: string;
  label: string;
}[] {
  const used = new Set<string>();
  for (const sourceId of c.sourceIds) {
    for (const entry of c.sourceFieldMaps[sourceId] ?? []) {
      if (entry.outputPath) used.add(entry.outputPath);
    }
  }
  return c.outputSchema
    .filter((f) => used.has(f.path))
    .map((f) => ({ path: f.path, label: f.label }));
}

export function enrollmentPreQualifiedHint(c: EnrichmentEnrollmentCriteria): string {
  if (!isEnrollmentConfigured(c)) return "—";
  if (enrollmentHasUnresolvedIssues(c)) return "Unresolved mapping — review sources before run";
  const n = c.sourceIds.length;
  const until = c.goUntil
    ? `Stop when ${c.goUntil.fieldPath} ${c.goUntil.op} ${c.goUntil.value}`
    : "No go-until cap";
  return `${n} source${n === 1 ? "" : "s"} · freshness ≤${c.freshnessDays}d · ${until}`;
}

export function mappingSummaryForSource(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
): string {
  const n = normalizeEnrollmentCriteria(c);
  if (sourceNeedsMappingAttention(n, sourceId)) {
    const att = n.mappingAttention[sourceId];
    const labels = att?.removedOutputLabels ?? [];
    if (labels.length === 1) return `Needs review — “${labels[0]}” removed`;
    if (labels.length > 1) return `Needs review — ${labels.length} fields removed`;
    return "Needs review — end schema changed";
  }
  const maps = n.sourceFieldMaps[sourceId] ?? [];
  if (maps.length === 0) return "No fields pulled yet";
  const mapped = maps.filter((m) => m.outputPath != null).length;
  const skipped = maps.length - mapped;
  const discarded = discardedOutputsForSource(n, sourceId).length;
  const parts = [`${mapped} paired`];
  if (skipped > 0) parts.push(`${skipped} not pulled`);
  if (discarded > 0) parts.push(`${discarded} not required`);
  return parts.join(" · ");
}

export function syncFieldMapsAfterPull(
  existing: SourceFieldMapEntry[] | undefined,
  source: EnrichmentSourceDef,
): SourceFieldMapEntry[] {
  // Incoming = exactly what the pull returned; never fabricate a default shape.
  const shape = source.shape;
  const prev = new Map((existing ?? []).map((e) => [e.sourcePath, e.outputPath]));
  return shape.map((f) => ({
    sourcePath: f.path,
    outputPath: prev.has(f.path) ? (prev.get(f.path) ?? null) : null,
  }));
}

export function clearSourceMappingAttention(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
): EnrichmentEnrollmentCriteria {
  const n = normalizeEnrollmentCriteria(c);
  if (!n.mappingAttention[sourceId]) return n;
  const mappingAttention = { ...n.mappingAttention };
  delete mappingAttention[sourceId];
  return { ...n, mappingAttention };
}

/** Pair incoming ↔ end-schema field for a source (1:1). Restores field if it was discarded. */
export function pairSourceFields(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
  sourcePath: string,
  outputPath: string,
): EnrichmentEnrollmentCriteria {
  const n = normalizeEnrollmentCriteria(c);
  const discarded = (n.sourceDiscardedOutputs[sourceId] ?? []).filter((p) => p !== outputPath);
  const maps = [...(n.sourceFieldMaps[sourceId] ?? [])].map((m) => {
    if (m.sourcePath === sourcePath) return { sourcePath, outputPath };
    if (m.outputPath === outputPath) return { ...m, outputPath: null };
    return m;
  });
  if (!maps.some((m) => m.sourcePath === sourcePath)) {
    maps.push({ sourcePath, outputPath });
  }
  const next: EnrichmentEnrollmentCriteria = {
    ...n,
    sourceFieldMaps: { ...n.sourceFieldMaps, [sourceId]: maps },
    sourceDiscardedOutputs: { ...n.sourceDiscardedOutputs, [sourceId]: discarded },
  };
  return clearAttentionForIncoming(next, sourceId, sourcePath);
}

/** Unpair — incoming stays, not pulled. */
export function unpairIncomingField(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
  sourcePath: string,
): EnrichmentEnrollmentCriteria {
  return setSourceFieldMap(c, sourceId, sourcePath, null);
}

/**
 * This source is not required to fill this end-schema field.
 * Unmaps any incoming that pointed at it. Does not delete the field from the workflow schema.
 */
export function discardOutputForSource(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
  outputPath: string,
): EnrichmentEnrollmentCriteria {
  const n = normalizeEnrollmentCriteria(c);
  const discarded = new Set(n.sourceDiscardedOutputs[sourceId] ?? []);
  discarded.add(outputPath);
  const maps = (n.sourceFieldMaps[sourceId] ?? []).map((m) =>
    m.outputPath === outputPath ? { ...m, outputPath: null } : m,
  );
  return {
    ...n,
    sourceFieldMaps: { ...n.sourceFieldMaps, [sourceId]: maps },
    sourceDiscardedOutputs: {
      ...n.sourceDiscardedOutputs,
      [sourceId]: [...discarded],
    },
  };
}

/** Bring a discarded end-schema field back into this source's mapping surface. */
export function restoreOutputForSource(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
  outputPath: string,
): EnrichmentEnrollmentCriteria {
  const n = normalizeEnrollmentCriteria(c);
  const discarded = (n.sourceDiscardedOutputs[sourceId] ?? []).filter((p) => p !== outputPath);
  return {
    ...n,
    sourceDiscardedOutputs: { ...n.sourceDiscardedOutputs, [sourceId]: discarded },
  };
}

export function setSourceFieldMap(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
  sourcePath: string,
  outputPath: string | null,
): EnrichmentEnrollmentCriteria {
  const n = normalizeEnrollmentCriteria(c);
  const maps = [...(n.sourceFieldMaps[sourceId] ?? [])];
  const idx = maps.findIndex((m) => m.sourcePath === sourcePath);
  if (idx >= 0) maps[idx] = { sourcePath, outputPath };
  else maps.push({ sourcePath, outputPath });

  const next: EnrichmentEnrollmentCriteria = {
    ...n,
    sourceFieldMaps: { ...n.sourceFieldMaps, [sourceId]: maps },
  };
  return clearAttentionForIncoming(next, sourceId, sourcePath);
}

function clearAttentionForIncoming(
  c: EnrichmentEnrollmentCriteria,
  sourceId: string,
  sourcePath: string,
): EnrichmentEnrollmentCriteria {
  const att = (c.mappingAttention ?? {})[sourceId];
  if (!att) return c;
  const remaining = att.clearedIncomingPaths.filter((p) => p !== sourcePath);
  if (remaining.length === 0) return clearSourceMappingAttention(c, sourceId);
  return {
    ...c,
    mappingAttention: {
      ...(c.mappingAttention ?? {}),
      [sourceId]: { ...att, clearedIncomingPaths: remaining },
    },
  };
}

export function addOutputSchemaField(
  c: EnrichmentEnrollmentCriteria,
  field: EnrichmentOutputField,
): EnrichmentEnrollmentCriteria {
  const n = normalizeEnrollmentCriteria(c);
  if (n.outputSchema.some((f) => f.path === field.path)) return n;
  return { ...n, outputSchema: [...n.outputSchema, field] };
}

/** Resolve a path for a new end-schema field; reports collision with an existing field. */
export function resolveNewOutputFieldPath(
  c: EnrichmentEnrollmentCriteria,
  label: string,
  path?: string,
): { path: string; conflict: EnrichmentOutputField | null } {
  const n = normalizeEnrollmentCriteria(c);
  const fieldPath = (path?.trim() || slugifyFieldPath(label)).toLowerCase();
  const conflict = n.outputSchema.find((f) => f.path === fieldPath) ?? null;
  return { path: fieldPath, conflict };
}

function slugifyFieldPath(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}

/** Settings-only: remove a field from the workflow end schema (not used in trigger UI). */
export function removeOutputSchemaField(
  c: EnrichmentEnrollmentCriteria,
  path: string,
): EnrichmentEnrollmentCriteria {
  const n = normalizeEnrollmentCriteria(c);
  const removed = n.outputSchema.find((f) => f.path === path);
  const label = removed?.label ?? path;
  const outputSchema = n.outputSchema.filter((f) => f.path !== path);
  const sourceFieldMaps: Record<string, SourceFieldMapEntry[]> = {};
  const mappingAttention = { ...n.mappingAttention };
  const sourceDiscardedOutputs: Record<string, string[]> = {};

  for (const [sid, maps] of Object.entries(n.sourceFieldMaps)) {
    const clearedIncomingPaths: string[] = [];
    sourceFieldMaps[sid] = maps.map((m) => {
      if (m.outputPath === path) {
        clearedIncomingPaths.push(m.sourcePath);
        return { ...m, outputPath: null };
      }
      return m;
    });
    if (clearedIncomingPaths.length > 0) {
      const prev = mappingAttention[sid];
      mappingAttention[sid] = {
        clearedIncomingPaths: [
          ...new Set([...(prev?.clearedIncomingPaths ?? []), ...clearedIncomingPaths]),
        ],
        removedOutputLabels: [...new Set([...(prev?.removedOutputLabels ?? []), label])],
      };
    }
  }

  for (const [sid, paths] of Object.entries(n.sourceDiscardedOutputs)) {
    sourceDiscardedOutputs[sid] = paths.filter((p) => p !== path);
  }

  let goUntil = n.goUntil;
  if (goUntil?.fieldPath === path) goUntil = null;

  return {
    ...n,
    outputSchema,
    sourceFieldMaps,
    sourceDiscardedOutputs,
    mappingAttention,
    goUntil,
  };
}
