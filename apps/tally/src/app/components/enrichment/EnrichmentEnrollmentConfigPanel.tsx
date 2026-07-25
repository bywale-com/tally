import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
  GripVertical,
  Info,
  Plus,
  Trash2,
} from "lucide-react";
import { useState, type CSSProperties, type DragEvent } from "react";
import {
  addOutputSchemaField,
  canRunEnrollment,
  discardOutputForSource,
  emptyEnrollmentCriteria,
  emptyFieldMapsForSource,
  enrollmentFieldOptions,
  enrollmentHasUnresolvedIssues,
  formatEnrollmentSummary,
  mappingSummaryForSource,
  normalizeEnrollmentCriteria,
  pairSourceFields,
  resolveNewOutputFieldPath,
  restoreOutputForSource,
  sourceNeedsMappingAttention,
  syncFieldMapsAfterPull,
  unpairIncomingField,
  type EnrichmentEnrollmentCriteria,
  type EnrichmentOutputField,
} from "../../data/enrichmentEnrollment";
import type { EnrichmentKind } from "../../data/enrichments";
import {
  createCustomSourceFromUrl,
  defaultIndeedCriteria,
  buildIndeedSearchUrl,
  compileIndeedQuery,
  emptyBooleanTerms,
  INDEED_BOOLEAN_TERM_MAX,
  parseBooleanQueryToTerms,
  pullSourceShape,
  type EnrichmentFieldShape,
  type EnrichmentFieldType,
  type EnrichmentSourceDef,
  type IndeedBooleanJoin,
  type IndeedBooleanTerm,
  type IndeedMatchMode,
} from "../../data/enrichmentSources";
import {
  formatIncomingFieldSnippet,
  pullIndeedSourceLive,
} from "../../data/enrichmentNodeRuntime";
import type { EnrichmentNodeData } from "../../data/enrichmentWorkflows";
import { DOCS_TREE_LABEL_SIZE } from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";
import { EnrichmentKindPicker } from "./EnrichmentKindPicker";

type EnrichmentEnrollmentConfigPanelProps = {
  data: EnrichmentNodeData;
  t: Tokens;
  onUpdate: (patch: Partial<EnrichmentNodeData>) => void;
  onClose?: () => void;
  /** Body-only for Tower Configuration column. */
  embedded?: boolean;
  /** Return to jobs/companies kind picker. */
  onChangeKind?: () => void;
};

function SectionLabel({ children, t }: { children: string; t: Tokens }) {
  return (
    <div
      style={{
        marginBottom: 8,
        color: t.textMuted,
        textTransform: "uppercase",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      {children}
    </div>
  );
}

/** Automations ManualTriggerConfigPanel — reskinned for enrichment criteria. */
export function EnrichmentEnrollmentParams({
  data,
  t,
  onUpdate,
  forceKindPicker = false,
  onForceKindPicker,
}: {
  data: EnrichmentNodeData;
  t: Tokens;
  onUpdate: (patch: Partial<EnrichmentNodeData>) => void;
  /** When true, show the jobs/companies squares even if a kind is already set. */
  forceKindPicker?: boolean;
  onForceKindPicker?: (force: boolean) => void;
}) {
  const criteria = normalizeEnrollmentCriteria(data.enrollmentCriteria);
  const showPicker = forceKindPicker || !criteria.kind;

  function selectKind(kind: EnrichmentKind) {
    const switching = Boolean(criteria.kind && criteria.kind !== kind);
    const next: EnrichmentEnrollmentCriteria = switching
      ? { ...emptyEnrollmentCriteria(), kind }
      : { ...criteria, kind };
    onUpdate({
      enrollmentCriteria: next,
      configured: canRunEnrollment(next),
      enrollmentHint:
        kind === "companies"
          ? "Company enrichment criteria"
          : "Records included when this enrichment is run.",
    });
    onForceKindPicker?.(false);
  }

  function goBackToKindPicker() {
    onForceKindPicker?.(true);
  }

  if (showPicker) {
    return <EnrichmentKindPicker t={t} onSelect={selectKind} />;
  }

  if (criteria.kind === "companies") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goBackToKindPicker();
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: 0,
            border: "none",
            background: "transparent",
            color: t.textMuted,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Change enrichment type
        </button>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
          Company enrichment
        </p>
        <p style={{ margin: 0, fontSize: 12, color: t.textMuted, lineHeight: 1.45 }}>
          Company criteria config comes next — for now this marks the enrichment as a company
          process. Go back to switch to job enrichment.
        </p>
      </div>
    );
  }

  return (
    <EnrichmentEnrollmentConfigPanel
      data={data}
      t={t}
      onUpdate={onUpdate}
      embedded
      onChangeKind={goBackToKindPicker}
    />
  );
}

/** Enrollment criteria UI — dock or embedded (Configuration column). */
export function EnrichmentEnrollmentConfigPanel({
  data,
  t,
  onUpdate,
  onClose,
  embedded = false,
  onChangeKind,
}: EnrichmentEnrollmentConfigPanelProps) {
  const criteria = normalizeEnrollmentCriteria(data.enrollmentCriteria);
  const [urlDraft, setUrlDraft] = useState("");
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [pullingId, setPullingId] = useState<string | null>(null);
  const fieldOpts = enrollmentFieldOptions(criteria);
  const unresolved = enrollmentHasUnresolvedIssues(criteria);

  function patchCriteria(next: EnrichmentEnrollmentCriteria) {
    onUpdate({
      enrollmentCriteria: next,
      configured: canRunEnrollment(next),
      enrollmentHint: canRunEnrollment(next)
        ? `Pull ${formatEnrollmentSummary(next)}`
        : enrollmentHasUnresolvedIssues(next)
          ? "Resolve mapping attention before run."
          : "Records included when this enrichment is run.",
    });
  }

  function patchPartial(patch: Partial<EnrichmentEnrollmentCriteria>) {
    patchCriteria({ ...criteria, ...patch });
  }

  function toggleSource(id: string, selected: boolean) {
    const set = new Set(criteria.sourceIds);
    let sourceFieldMaps = criteria.sourceFieldMaps;
    let sourceDiscardedOutputs = criteria.sourceDiscardedOutputs;
    if (selected) {
      set.add(id);
      setExpandedSourceId(id);
      const src = criteria.sources.find((s) => s.id === id);
      if (src && !(sourceFieldMaps[id]?.length) && src.shape.length > 0) {
        sourceFieldMaps = {
          ...sourceFieldMaps,
          [id]: emptyFieldMapsForSource(src),
        };
      }
      if (!sourceDiscardedOutputs[id]) {
        sourceDiscardedOutputs = { ...sourceDiscardedOutputs, [id]: [] };
      }
    } else {
      set.delete(id);
      if (expandedSourceId === id) setExpandedSourceId(null);
    }
    patchCriteria({
      ...criteria,
      sourceIds: [...set],
      sourceFieldMaps,
      sourceDiscardedOutputs,
    });
  }

  async function handlePull(id: string) {
    const source = criteria.sources.find((s) => s.id === id);
    if (!source) return;

    if (source.kind === "indeed") {
      setPullingId(id);
      try {
        // Pull = raw scrape → incoming shape for the mapper. Output stays for Run.
        const { source: pulled } = await pullIndeedSourceLive(source);
        const sources = criteria.sources.map((s) => (s.id === id ? pulled : s));
        const sourceFieldMaps = {
          ...criteria.sourceFieldMaps,
          [id]: syncFieldMapsAfterPull(criteria.sourceFieldMaps[id], pulled),
        };
        const next = { ...criteria, sources, sourceFieldMaps };
        onUpdate({
          enrollmentCriteria: next,
          configured: canRunEnrollment(next),
          enrollmentHint: canRunEnrollment(next)
            ? `Pull ${formatEnrollmentSummary(next)}`
            : data.enrollmentHint,
          lastRunError: null,
        });
        setExpandedSourceId(id);
      } catch (e) {
        onUpdate({
          lastRunError: e instanceof Error ? e.message : String(e),
        });
      } finally {
        setPullingId(null);
      }
      return;
    }

    const pulled = pullSourceShape(source);
    const sources = criteria.sources.map((s) => (s.id === id ? pulled : s));
    const sourceFieldMaps = {
      ...criteria.sourceFieldMaps,
      [id]: syncFieldMapsAfterPull(criteria.sourceFieldMaps[id], pulled),
    };
    patchCriteria({ ...criteria, sources, sourceFieldMaps });
    setExpandedSourceId(id);
  }

  function handleIndeedCriteria(
    sourceId: string,
    patch: Partial<NonNullable<EnrichmentSourceDef["indeed"]>>,
  ) {
    const sources = criteria.sources.map((s) => {
      if (s.id !== sourceId || s.kind !== "indeed") return s;
      const indeed = { ...defaultIndeedCriteria(), ...(s.indeed ?? {}), ...patch };
      return { ...s, indeed, verified: false };
    });
    patchCriteria({ ...criteria, sources });
  }

  function handleAddUrl() {
    if (!urlDraft.trim()) return;
    const created = createCustomSourceFromUrl(urlDraft);
    patchCriteria({
      ...criteria,
      sources: [...criteria.sources, created],
      sourceIds: [...criteria.sourceIds, created.id],
      sourceFieldMaps: { ...criteria.sourceFieldMaps, [created.id]: [] },
      sourceDiscardedOutputs: { ...criteria.sourceDiscardedOutputs, [created.id]: [] },
    });
    setUrlDraft("");
    setExpandedSourceId(created.id);
  }

  function handleAddEndSchemaField(
    label: string,
    opts?: { path?: string; type?: EnrichmentFieldType },
  ): "ok" | "duplicate" | "empty" {
    const trimmed = label.trim();
    if (!trimmed) return "empty";
    const { path: fieldPath, conflict } = resolveNewOutputFieldPath(
      criteria,
      trimmed,
      opts?.path,
    );
    if (!fieldPath) return "empty";
    if (conflict) return "duplicate";
    patchCriteria(
      addOutputSchemaField(criteria, {
        path: fieldPath,
        label: trimmed,
        type: opts?.type ?? "string",
      }),
    );
    return "ok";
  }

  const triggerTitle =
    data.triggerKind === "schedule"
      ? "Schedule trigger"
      : data.triggerKind === "source_update"
        ? "Source update trigger"
        : "Manual trigger";

  const body = (
    <>
        {onChangeKind && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangeKind();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 14,
              padding: 0,
              border: "none",
              background: "transparent",
              color: t.textMuted,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <ChevronLeft size={14} strokeWidth={2} />
            Change enrichment type
          </button>
        )}

        {unresolved && (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${t.red}`,
              background: "rgba(239, 68, 68, 0.08)",
              fontSize: 11,
              color: t.textPrimary,
              lineHeight: 1.45,
            }}
          >
            <Info size={14} strokeWidth={2} color={t.red} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Mapping attention unresolved. Remap affected sources before run.</span>
          </div>
        )}

        <SectionLabel t={t}>Sources</SectionLabel>
        <p style={{ margin: "0 0 10px", fontSize: 11, color: t.textMuted, lineHeight: 1.45 }}>
          Select adapters, Pull if needed, then pair incoming → end schema under each source.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 52px 48px",
            gap: 6,
            marginBottom: 6,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: t.textDim,
          }}
        >
          <span>Source</span>
          <span>OK</span>
          <span>Pull</span>
        </div>

        {criteria.sources.map((source) => {
          const selected = criteria.sourceIds.includes(source.id);
          const expanded = expandedSourceId === source.id;
          const needsAttention = sourceNeedsMappingAttention(criteria, source.id);
          return (
            <div
              key={source.id}
              style={{
                borderBottom: `1px solid ${t.borderLight}`,
                paddingBottom: expanded ? 10 : 0,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 52px 48px",
                  gap: 6,
                  alignItems: "center",
                  padding: "8px 0",
                }}
              >
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", minWidth: 0 }}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => toggleSource(source.id, e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <button
                    type="button"
                    onClick={() => setExpandedSourceId(expanded ? null : source.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      minWidth: 0,
                      flex: 1,
                      fontFamily: "inherit",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 500,
                        color: t.textPrimary,
                      }}
                    >
                      {expanded ? (
                        <ChevronDown size={12} color={t.textMuted} />
                      ) : (
                        <ChevronRight size={12} color={t.textMuted} />
                      )}
                      <NotionIcon name={source.icon} size={12} color={t.textMuted} />
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {source.name}
                      </span>
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          title={`Open ${source.name}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            color: t.textMuted,
                            flexShrink: 0,
                          }}
                        >
                          <ExternalLink size={12} strokeWidth={2} />
                        </a>
                      )}
                      {needsAttention && (
                        <span title="Schema attention — remapping required">
                          <Info size={13} strokeWidth={2.25} color={t.red} />
                        </span>
                      )}
                    </span>
                    {selected && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          color: needsAttention ? t.red : t.textDim,
                          marginTop: 2,
                          marginLeft: 16,
                        }}
                      >
                        {mappingSummaryForSource(criteria, source.id)}
                      </span>
                    )}
                  </button>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: source.verified ? t.success : t.textDim,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {source.verified ? <Check size={12} strokeWidth={2.5} color={t.success} /> : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => void handlePull(source.id)}
                  disabled={
                    source.verified &&
                    source.kind !== "custom_url" &&
                    source.kind !== "indeed"
                  }
                  style={{
                    padding: "3px 6px",
                    fontSize: 10,
                    fontWeight: 500,
                    border: `1px solid ${t.border}`,
                    borderRadius: 4,
                    background: t.bgPrimary,
                    cursor:
                      source.verified &&
                      source.kind !== "custom_url" &&
                      source.kind !== "indeed"
                        ? "default"
                        : "pointer",
                    opacity:
                      source.verified &&
                      source.kind !== "custom_url" &&
                      source.kind !== "indeed"
                        ? 0.4
                        : 1,
                    color: t.textPrimary,
                  }}
                >
                  Pull
                </button>
              </div>

              {expanded && source.kind === "indeed" && (
                <IndeedSearchFields
                  source={source}
                  t={t}
                  onChange={(patch) => handleIndeedCriteria(source.id, patch)}
                  onPull={() => void handlePull(source.id)}
                  pulling={pullingId === source.id}
                />
              )}

              {expanded && (
                <SourceSchemaMapper
                  source={source}
                  criteria={criteria}
                  t={t}
                  onPair={(sourcePath, outputPath) =>
                    patchCriteria(pairSourceFields(criteria, source.id, sourcePath, outputPath))
                  }
                  onUnpair={(sourcePath) =>
                    patchCriteria(unpairIncomingField(criteria, source.id, sourcePath))
                  }
                  onDiscardOutput={(outputPath) =>
                    patchCriteria(discardOutputForSource(criteria, source.id, outputPath))
                  }
                  onRestoreOutput={(outputPath) =>
                    patchCriteria(restoreOutputForSource(criteria, source.id, outputPath))
                  }
                  onAddEndField={handleAddEndSchemaField}
                />
              )}
            </div>
          );
        })}

        <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
          <input
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="Add source by URL (Indeed search URL works)…"
            style={inputStyle(t)}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            style={{
              padding: "0 10px",
              border: "none",
              borderRadius: 6,
              background: t.accent,
              color: "#fff",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel t={t}>End schema</SectionLabel>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: t.textMuted, lineHeight: 1.45 }}>
            Shared output shape for this workflow. Field deletes live in Settings later — here you
            only add. Per-source “not required” is the trash on the right of each map.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            {criteria.outputSchema.map((f) => (
              <span
                key={f.path}
                title={`${f.path} · ${f.type}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 8px",
                  borderRadius: 4,
                  border: `1px solid ${t.border}`,
                  background: t.bgPrimary,
                  fontSize: 11,
                  color: t.textPrimary,
                }}
              >
                {f.label}
                <span
                  style={{
                    fontSize: 10,
                    color: t.textDim,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  }}
                >
                  {f.type}
                </span>
              </span>
            ))}
            <AddEndSchemaFieldTag
              t={t}
              existing={criteria.outputSchema}
              onAdd={handleAddEndSchemaField}
            />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel t={t}>Freshness</SectionLabel>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: t.textMuted }}>
            Max posting age in days.
          </p>
          <input
            type="number"
            min={1}
            value={criteria.freshnessDays}
            onChange={(e) =>
              patchPartial({ freshnessDays: Math.max(1, Number(e.target.value) || 1) })
            }
            style={inputStyle(t)}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <SectionLabel t={t}>Go until (conditional limit)</SectionLabel>
          <p style={{ margin: "0 0 8px", fontSize: 11, color: t.textMuted, lineHeight: 1.45 }}>
            Stop pulling when a count or field hits the target.
          </p>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              fontSize: 12,
            }}
          >
            <input
              type="checkbox"
              checked={criteria.goUntil != null}
              onChange={(e) =>
                patchPartial({
                  goUntil: e.target.checked
                    ? { fieldPath: "a_list_count", op: "gte", value: "20" }
                    : null,
                })
              }
            />
            Enable go-until
          </label>
          {criteria.goUntil && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <select
                value={criteria.goUntil.fieldPath}
                onChange={(e) =>
                  patchPartial({
                    goUntil: { ...criteria.goUntil!, fieldPath: e.target.value },
                  })
                }
                style={inputStyle(t)}
              >
                {fieldOpts.map((f) => (
                  <option key={f.path} value={f.path}>
                    {f.label}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  value={criteria.goUntil.op}
                  onChange={(e) =>
                    patchPartial({
                      goUntil: {
                        ...criteria.goUntil!,
                        op: e.target.value as "gte" | "eq" | "lte",
                      },
                    })
                  }
                  style={{ ...inputStyle(t), width: 80 }}
                >
                  <option value="gte">≥</option>
                  <option value="eq">=</option>
                  <option value="lte">≤</option>
                </select>
                <input
                  value={criteria.goUntil.value}
                  onChange={(e) =>
                    patchPartial({
                      goUntil: { ...criteria.goUntil!, value: e.target.value },
                    })
                  }
                  style={inputStyle(t)}
                />
              </div>
            </div>
          )}
        </div>

        {data.triggerKind === "schedule" && (
          <div style={{ marginTop: 20 }}>
            <SectionLabel t={t}>Schedule</SectionLabel>
            <input
              value={data.scheduleSummary ?? ""}
              onChange={(e) => onUpdate({ scheduleSummary: e.target.value })}
              placeholder="Daily 09:00"
              style={inputStyle(t)}
            />
          </div>
        )}
    </>
  );

  if (embedded) {
    return <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>{body}</div>;
  }

  return (
    <aside
      style={{
        width: 400,
        flexShrink: 0,
        borderLeft: `1px solid ${t.border}`,
        background: t.boardPanel,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "14px 14px 10px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: DOCS_TREE_LABEL_SIZE,
              fontWeight: 600,
              color: t.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            {triggerTitle}
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: t.textMuted, lineHeight: 1.45 }}>
            Pair each source’s incoming fields to the end schema. Trash on the right = not required
            from that source. Use Run on the node modal for live Output.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: t.textMuted,
              fontSize: 11,
              fontWeight: 500,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 4,
            }}
          >
            Done
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 20px" }}>{body}</div>
    </aside>
  );
}

type DragPayload =
  | { kind: "incoming"; path: string }
  | { kind: "output"; path: string };

function IndeedSearchFields({
  source,
  t,
  onChange,
  onPull,
  pulling,
}: {
  source: EnrichmentSourceDef;
  t: Tokens;
  onChange: (patch: Partial<NonNullable<EnrichmentSourceDef["indeed"]>>) => void;
  onPull: () => void;
  pulling?: boolean;
}) {
  const indeed = { ...defaultIndeedCriteria(), ...(source.indeed ?? {}) };
  const booleanTerms: IndeedBooleanTerm[] =
    indeed.booleanTerms?.length ? indeed.booleanTerms : emptyBooleanTerms(indeed.query);
  const previewUrl = buildIndeedSearchUrl({
    ...indeed,
    booleanTerms,
    query: indeed.matchMode === "boolean" ? compileIndeedQuery({ ...indeed, booleanTerms }) : indeed.query,
  });

  function setMatchMode(matchMode: IndeedMatchMode) {
    if (matchMode === "boolean") {
      const seeded =
        indeed.booleanTerms?.some((row) => row.term.trim())
          ? indeed.booleanTerms
          : indeed.query.trim()
            ? parseBooleanQueryToTerms(indeed.query)
            : emptyBooleanTerms();
      const compiled = compileIndeedQuery({ ...indeed, matchMode, booleanTerms: seeded });
      onChange({ matchMode, booleanTerms: seeded, query: compiled });
      return;
    }
    onChange({ matchMode });
  }

  function patchBooleanTerms(next: IndeedBooleanTerm[]) {
    const trimmed = next.slice(0, INDEED_BOOLEAN_TERM_MAX).map((row, i) => ({
      ...row,
      join: i === 0 ? null : row.join ?? "AND",
    }));
    const compiled = compileIndeedQuery({ ...indeed, matchMode: "boolean", booleanTerms: trimmed });
    onChange({ booleanTerms: trimmed, query: compiled, matchMode: "boolean" });
  }

  function updateTerm(index: number, patch: Partial<IndeedBooleanTerm>) {
    patchBooleanTerms(booleanTerms.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addTerm() {
    if (booleanTerms.length >= INDEED_BOOLEAN_TERM_MAX) return;
    patchBooleanTerms([...booleanTerms, { join: "AND", term: "" }]);
  }

  function removeTerm(index: number) {
    if (booleanTerms.length <= 1) {
      patchBooleanTerms(emptyBooleanTerms());
      return;
    }
    patchBooleanTerms(booleanTerms.filter((_, i) => i !== index));
  }

  return (
    <div
      style={{
        marginLeft: 8,
        marginBottom: 8,
        padding: 10,
        borderRadius: 8,
        background: t.hoverBg,
        border: `1px solid ${t.borderLight}`,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: t.textDim,
          marginBottom: 8,
        }}
      >
        Indeed search
      </div>

      <label style={{ display: "block", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: t.textMuted }}>Match</span>
        <select
          value={indeed.matchMode}
          onChange={(e) => setMatchMode(e.target.value as IndeedMatchMode)}
          style={{ ...inputStyle(t), marginTop: 4 }}
        >
          <option value="broad">Broad</option>
          <option value="phrase">Exact phrase</option>
          <option value="boolean">Boolean / exact</option>
        </select>
      </label>

      {indeed.matchMode === "boolean" ? (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 6 }}>
            Exact terms (quoted for you · max {INDEED_BOOLEAN_TERM_MAX})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {booleanTerms.map((row, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: index === 0 ? "1fr 28px" : "72px 1fr 28px",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                {index > 0 && (
                  <select
                    value={row.join ?? "AND"}
                    onChange={(e) =>
                      updateTerm(index, { join: e.target.value as IndeedBooleanJoin })
                    }
                    style={inputStyle(t)}
                    aria-label={`Join before term ${index + 1}`}
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                )}
                <input
                  value={row.term}
                  onChange={(e) => updateTerm(index, { term: e.target.value })}
                  placeholder={index === 0 ? "estimator" : "Review project schedules"}
                  style={inputStyle(t)}
                  aria-label={`Exact term ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeTerm(index)}
                  style={iconBtn(t)}
                  title="Remove term"
                  aria-label="Remove term"
                >
                  <Trash2 size={13} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
          {booleanTerms.length < INDEED_BOOLEAN_TERM_MAX && (
            <button
              type="button"
              onClick={addTerm}
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 6,
                border: `1px solid ${t.border}`,
                background: t.bgPrimary,
                color: t.textPrimary,
                fontSize: 11,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <Plus size={12} strokeWidth={2} />
              Add boolean term
            </button>
          )}
          <p style={{ margin: "8px 0 0", fontSize: 10, color: t.textDim, lineHeight: 1.4 }}>
            Compiles to {compileIndeedQuery({ ...indeed, booleanTerms }) || "…"}
          </p>
        </div>
      ) : (
        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: t.textMuted }}>
            {indeed.matchMode === "phrase" ? "Phrase" : "Query"}
          </span>
          <input
            value={indeed.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder={
              indeed.matchMode === "phrase"
                ? "founding business development"
                : "founding business development"
            }
            style={{ ...inputStyle(t), marginTop: 4 }}
          />
          <p style={{ margin: "6px 0 0", fontSize: 10, color: t.textDim, lineHeight: 1.4 }}>
            {indeed.matchMode === "phrase"
              ? "Wrapped in quotes as one phrase."
              : "Broad strips decorative quotes."}
          </p>
        </label>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 88px", gap: 6, marginBottom: 8 }}>
        <label>
          <span style={{ fontSize: 11, color: t.textMuted }}>Location</span>
          <input
            value={indeed.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="Toronto, ON"
            style={{ ...inputStyle(t), marginTop: 4 }}
          />
        </label>
        <label>
          <span style={{ fontSize: 11, color: t.textMuted }}>Radius</span>
          <input
            type="number"
            min={0}
            value={indeed.radius ?? ""}
            onChange={(e) =>
              onChange({
                radius: e.target.value === "" ? null : Math.max(0, Number(e.target.value) || 0),
              })
            }
            style={{ ...inputStyle(t), marginTop: 4 }}
          />
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6, marginBottom: 8 }}>
        <label>
          <span style={{ fontSize: 11, color: t.textMuted }}>Country</span>
          <select
            value={indeed.country}
            onChange={(e) => onChange({ country: e.target.value })}
            style={{ ...inputStyle(t), marginTop: 4 }}
          >
            <option value="Canada">Canada</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Australia">Australia</option>
          </select>
        </label>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 72px", gap: 6, marginBottom: 8 }}>
        <label>
          <span style={{ fontSize: 11, color: t.textMuted }}>Date posted</span>
          <select
            value={indeed.fromageDays == null ? "all" : String(indeed.fromageDays)}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ fromageDays: v === "all" ? null : Number(v) });
            }}
            style={{ ...inputStyle(t), marginTop: 4 }}
          >
            <option value="all">All</option>
            <option value="1">Last 24 hours</option>
            <option value="3">Last 3 days</option>
            <option value="7">Last 7 days</option>
            <option value="14">Last 14 days</option>
          </select>
        </label>
        <label>
          <span style={{ fontSize: 11, color: t.textMuted }}>Pay (min)</span>
          <select
            value={indeed.salaryMin == null ? "all" : String(indeed.salaryMin)}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ salaryMin: v === "all" ? null : Number(v) });
            }}
            style={{ ...inputStyle(t), marginTop: 4 }}
          >
            <option value="all">All</option>
            <option value="40000">$40,000+</option>
            <option value="50000">$50,000+</option>
            <option value="60000">$60,000+</option>
            <option value="80000">$80,000+</option>
            <option value="100000">$100,000+</option>
            <option value="120000">$120,000+</option>
          </select>
        </label>
        <label>
          <span style={{ fontSize: 11, color: t.textMuted }}>Records</span>
          <input
            type="number"
            min={1}
            max={50}
            value={indeed.resultsWanted}
            onChange={(e) =>
              onChange({
                resultsWanted: Math.min(50, Math.max(1, Number(e.target.value) || 1)),
              })
            }
            style={{ ...inputStyle(t), marginTop: 4 }}
          />
        </label>
      </div>
      <div
        style={{
          marginBottom: 10,
          padding: "8px 10px",
          borderRadius: 6,
          border: `1px solid ${t.borderLight}`,
          background: t.bgPrimary,
          fontSize: 10,
          color: t.textMuted,
          wordBreak: "break-all",
          lineHeight: 1.4,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        }}
        title={previewUrl}
      >
        {previewUrl}
      </div>
      {source.lastPullCount != null && source.verified && (
        <p style={{ margin: "0 0 8px", fontSize: 11, color: t.success }}>
          Last Pull · {source.lastPullCount} raw row{source.lastPullCount === 1 ? "" : "s"} ·{" "}
          {source.shape.length} incoming field{source.shape.length === 1 ? "" : "s"}
        </p>
      )}
      <button
        type="button"
        onClick={onPull}
        disabled={pulling}
        style={{
          padding: "6px 12px",
          border: "none",
          borderRadius: 6,
          background: t.accent,
          color: "#fff",
          fontSize: 12,
          fontWeight: 500,
          cursor: pulling ? "wait" : "pointer",
          opacity: pulling ? 0.7 : 1,
        }}
      >
        {pulling ? "Pulling…" : "Pull now"}
      </button>
    </div>
  );
}

function SourceSchemaMapper({
  source,
  criteria,
  t,
  onPair,
  onUnpair,
  onDiscardOutput,
  onRestoreOutput,
  onAddEndField,
}: {
  source: EnrichmentSourceDef;
  criteria: EnrichmentEnrollmentCriteria;
  t: Tokens;
  onPair: (sourcePath: string, outputPath: string) => void;
  onUnpair: (sourcePath: string) => void;
  onDiscardOutput: (outputPath: string) => void;
  onRestoreOutput: (outputPath: string) => void;
  onAddEndField: (
    label: string,
    opts?: { path?: string; type?: EnrichmentFieldType },
  ) => "ok" | "duplicate" | "empty";
}) {
  const [selectedIncoming, setSelectedIncoming] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [previewPaths, setPreviewPaths] = useState<Set<string>>(() => new Set());

  const maps = criteria.sourceFieldMaps[source.id] ?? [];
  const discarded = new Set(criteria.sourceDiscardedOutputs[source.id] ?? []);
  const incoming: EnrichmentFieldShape[] =
    source.shape.length > 0
      ? source.shape
      : maps.map((m) => ({
          path: m.sourcePath,
          label: m.sourcePath,
          type: "string" as const,
        }));

  function togglePreview(path: string) {
    setPreviewPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  const mapByIncoming = new Map(maps.map((m) => [m.sourcePath, m.outputPath]));
  const paired = incoming
    .map((f) => {
      const outPath = mapByIncoming.get(f.path) ?? null;
      if (!outPath || discarded.has(outPath)) return null;
      const out = criteria.outputSchema.find((o) => o.path === outPath);
      if (!out) return null;
      return { incoming: f, output: out };
    })
    .filter(Boolean) as { incoming: EnrichmentFieldShape; output: EnrichmentOutputField }[];

  const unpairedIncoming = incoming.filter((f) => {
    const out = mapByIncoming.get(f.path);
    return out == null;
  });

  const unpairedOutputs = criteria.outputSchema.filter(
    (o) => !discarded.has(o.path) && !paired.some((p) => p.output.path === o.path),
  );

  const discardedFields = criteria.outputSchema.filter((o) => discarded.has(o.path));

  function tryPair(sourcePath: string, outputPath: string) {
    onPair(sourcePath, outputPath);
    setSelectedIncoming(null);
    setSelectedOutput(null);
  }

  function onSelectIncoming(path: string) {
    if (selectedOutput) {
      tryPair(path, selectedOutput);
      return;
    }
    setSelectedIncoming((v) => (v === path ? null : path));
  }

  function onSelectOutput(path: string) {
    if (selectedIncoming) {
      tryPair(selectedIncoming, path);
      return;
    }
    setSelectedOutput((v) => (v === path ? null : path));
  }

  function parseDrag(e: DragEvent): DragPayload | null {
    try {
      return JSON.parse(e.dataTransfer.getData("application/x-tally-map")) as DragPayload;
    } catch {
      return null;
    }
  }

  function startDrag(e: DragEvent, payload: DragPayload) {
    e.dataTransfer.setData("application/x-tally-map", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "link";
  }

  if (!source.verified && incoming.length === 0) {
    return (
      <div
        style={{
          marginLeft: 22,
          marginBottom: 8,
          padding: 10,
          borderRadius: 8,
          background: t.hoverBg,
          fontSize: 11,
          color: t.textMuted,
          lineHeight: 1.45,
        }}
      >
        Pull this source first to see incoming fields, then pair them to the end schema.
      </div>
    );
  }

  return (
    <div
      style={{
        marginLeft: 8,
        marginBottom: 4,
        padding: 10,
        borderRadius: 8,
        background: t.hoverBg,
        border: `1px solid ${t.borderLight}`,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 28px 1fr 28px",
          gap: 4,
          marginBottom: 8,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: t.textDim,
        }}
      >
        <span>Incoming</span>
        <span />
        <span>End schema</span>
        <span />
      </div>

      <p style={{ margin: "0 0 10px", fontSize: 11, color: t.textMuted, lineHeight: 1.4 }}>
        Drag or click left then right to pair on the same row. Unpaired left = don’t pull. Trash on
        the right = this source isn’t required to fill that field.
      </p>

      {paired.map(({ incoming: left, output: right }) => (
        <div
          key={`${left.path}-${right.path}`}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 28px 1fr 28px",
            gap: 4,
            alignItems: "start",
            marginBottom: 6,
          }}
        >
          <IncomingFieldWithPreview
            t={t}
            field={left}
            sample={source.lastPullSample}
            previewOpen={previewPaths.has(left.path)}
            onTogglePreview={() => togglePreview(left.path)}
            selected={false}
            highlight={dragOver === `in-${left.path}`}
            onDragStart={(e) => startDrag(e, { kind: "incoming", path: left.path })}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(`in-${left.path}`);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const payload = parseDrag(e);
              if (payload?.kind === "output") tryPair(left.path, payload.path);
            }}
            onClick={() => onUnpair(left.path)}
            title={`Click to unpair · ${left.path} · ${left.type}`}
          />
          <span
            style={{
              textAlign: "center",
              color: t.textDim,
              fontSize: 12,
              fontWeight: 600,
              paddingTop: 6,
            }}
          >
            =
          </span>
          <FieldChip
            t={t}
            label={right.label}
            path={right.path}
            fieldType={right.type}
            side="output"
            draggable
            onDragStart={(e) => startDrag(e, { kind: "output", path: right.path })}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(`out-${right.path}`);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const payload = parseDrag(e);
              if (payload?.kind === "incoming") tryPair(payload.path, right.path);
            }}
            highlight={dragOver === `out-${right.path}`}
            title={`${right.path} · ${right.type}`}
          />
          <button
            type="button"
            title="Not required from this source"
            onClick={() => onDiscardOutput(right.path)}
            style={{ ...iconBtn(t), marginTop: 2 }}
          >
            <Trash2 size={12} strokeWidth={2} />
          </button>
        </div>
      ))}

      {unpairedIncoming.map((left) => (
        <div
          key={`u-${left.path}`}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 28px 1fr 28px",
            gap: 4,
            alignItems: "start",
            marginBottom: 6,
          }}
        >
          <IncomingFieldWithPreview
            t={t}
            field={left}
            sample={source.lastPullSample}
            previewOpen={previewPaths.has(left.path)}
            onTogglePreview={() => togglePreview(left.path)}
            selected={selectedIncoming === left.path}
            highlight={dragOver === `in-${left.path}`}
            onDragStart={(e) => startDrag(e, { kind: "incoming", path: left.path })}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(`in-${left.path}`);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const payload = parseDrag(e);
              if (payload?.kind === "output") tryPair(left.path, payload.path);
            }}
            onClick={() => onSelectIncoming(left.path)}
            title={`Select, then click an end-schema field — or drag · ${left.path} · ${left.type}`}
          />
          <span style={{ textAlign: "center", color: t.textDim, fontSize: 12, paddingTop: 6 }}>
            —
          </span>
          <div
            style={{
              height: 28,
              borderRadius: 6,
              border: `1px dashed ${t.border}`,
              background: "transparent",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(`slot-${left.path}`);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const payload = parseDrag(e);
              if (payload?.kind === "output") tryPair(left.path, payload.path);
            }}
          />
          <span />
        </div>
      ))}

      {unpairedOutputs.map((right) => (
        <div
          key={`o-${right.path}`}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 28px 1fr 28px",
            gap: 4,
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              height: 28,
              borderRadius: 6,
              border: `1px dashed ${t.border}`,
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(`slot-out-${right.path}`);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const payload = parseDrag(e);
              if (payload?.kind === "incoming") tryPair(payload.path, right.path);
            }}
          />
          <span style={{ textAlign: "center", color: t.textDim, fontSize: 12 }}>—</span>
          <FieldChip
            t={t}
            label={right.label}
            path={right.path}
            fieldType={right.type}
            side="output"
            selected={selectedOutput === right.path}
            draggable
            onDragStart={(e) => startDrag(e, { kind: "output", path: right.path })}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(`out-${right.path}`);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const payload = parseDrag(e);
              if (payload?.kind === "incoming") tryPair(payload.path, right.path);
            }}
            highlight={dragOver === `out-${right.path}` || dragOver === `slot-out-${right.path}`}
            onClick={() => onSelectOutput(right.path)}
            title={`Select, then click an incoming field — or drag · ${right.path} · ${right.type}`}
          />
          <button
            type="button"
            title="Not required from this source"
            onClick={() => onDiscardOutput(right.path)}
            style={iconBtn(t)}
          >
            <Trash2 size={12} strokeWidth={2} />
          </button>
        </div>
      ))}

      {(selectedIncoming || selectedOutput) && (
        <p style={{ margin: "8px 0 0", fontSize: 11, color: t.accent }}>
          {selectedIncoming
            ? "Now click an end-schema field on the right to pair."
            : "Now click an incoming field on the left to pair."}
        </p>
      )}

      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <AddEndSchemaFieldTag
          t={t}
          existing={criteria.outputSchema}
          onAdd={onAddEndField}
        />
      </div>

      {discardedFields.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: t.textDim,
              marginBottom: 6,
            }}
          >
            Not required from this source
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {discardedFields.map((f) => (
              <button
                key={f.path}
                type="button"
                title={`Restore for this source · ${f.path} · ${f.type}`}
                onClick={() => onRestoreOutput(f.path)}
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 4,
                  border: `1px dashed ${t.border}`,
                  background: "transparent",
                  color: t.textDim,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {f.label} · restore
              </button>
            ))}
          </div>
        </div>
      )}

      {source.verified && paired.length === 0 && incoming.length > 0 && (
        <p style={{ margin: "10px 0 0", fontSize: 11, color: t.amber }}>
          Nothing paired yet — align incoming with end-schema fields above.
        </p>
      )}
    </div>
  );
}

function IncomingFieldWithPreview({
  t,
  field,
  sample,
  previewOpen,
  onTogglePreview,
  selected,
  highlight,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  title,
}: {
  t: Tokens;
  field: EnrichmentFieldShape;
  sample: Record<string, unknown>[] | undefined;
  previewOpen: boolean;
  onTogglePreview: () => void;
  selected?: boolean;
  highlight?: boolean;
  onDragStart?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: DragEvent) => void;
  onClick?: () => void;
  title?: string;
}) {
  const snippet = formatIncomingFieldSnippet(sample, field.path);
  const hasSample = Boolean(snippet);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <FieldChip
            t={t}
            label={field.label}
            path={field.path}
            fieldType={field.type}
            selected={selected}
            highlight={highlight}
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={onClick}
            title={title}
          />
        </div>
        <button
          type="button"
          title={
            previewOpen
              ? "Hide sample values"
              : hasSample
                ? "Show sample values from last Pull"
                : "Pull this source to preview values"
          }
          disabled={!hasSample && !previewOpen}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePreview();
          }}
          style={{
            ...iconBtn(t),
            flexShrink: 0,
            color: previewOpen ? t.success : hasSample ? t.textMuted : t.textDim,
            opacity: hasSample || previewOpen ? 1 : 0.45,
            cursor: hasSample || previewOpen ? "pointer" : "default",
          }}
        >
          {previewOpen ? (
            <EyeOff size={12} strokeWidth={2} />
          ) : (
            <Eye size={12} strokeWidth={2} />
          )}
        </button>
      </div>
      {previewOpen && (
        <div
          style={{
            padding: "5px 8px",
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            color: t.success,
            fontSize: 11,
            lineHeight: 1.4,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
          title={snippet ?? undefined}
        >
          {snippet ?? "No sample value for this field in the last Pull."}
        </div>
      )}
    </div>
  );
}

function FieldChip({
  t,
  label,
  path,
  fieldType,
  side = "incoming",
  selected,
  highlight,
  draggable,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  title,
}: {
  t: Tokens;
  label: string;
  path: string;
  fieldType?: EnrichmentFieldType;
  side?: "incoming" | "output";
  selected?: boolean;
  highlight?: boolean;
  draggable?: boolean;
  onDragStart?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: DragEvent) => void;
  onClick?: () => void;
  title?: string;
}) {
  const hoverTitle =
    title ?? (fieldType ? `${path} · ${fieldType}` : path);

  return (
    <button
      type="button"
      title={hoverTitle}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        width: "100%",
        minHeight: 28,
        padding: "4px 6px",
        borderRadius: 6,
        border: `1px solid ${
          selected || highlight ? t.accent : side === "output" ? t.border : t.border
        }`,
        background: selected || highlight ? t.accentBg : t.bgPrimary,
        color: t.textPrimary,
        fontSize: 11,
        fontWeight: 500,
        cursor: "grab",
        textAlign: "left",
        fontFamily: "inherit",
        overflow: "hidden",
      }}
    >
      <GripVertical size={11} color={t.textDim} style={{ flexShrink: 0 }} />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
          minWidth: 0,
        }}
      >
        {label}
      </span>
      {fieldType && (
        <span
          style={{
            flexShrink: 0,
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: "0.02em",
            color: t.textDim,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          {fieldType}
        </span>
      )}
    </button>
  );
}

const FIELD_TYPE_OPTIONS: EnrichmentFieldType[] = [
  "string",
  "number",
  "boolean",
  "url",
  "date",
  "json",
];

function AddEndSchemaFieldTag({
  t,
  existing,
  onAdd,
}: {
  t: Tokens;
  existing: EnrichmentOutputField[];
  onAdd: (
    label: string,
    opts?: { path?: string; type?: EnrichmentFieldType },
  ) => "ok" | "duplicate" | "empty";
}) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<EnrichmentFieldType>("string");
  const [error, setError] = useState<string | null>(null);

  const draftPath = label.trim()
    ? label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 48)
    : "";
  const conflict = draftPath
    ? existing.find((f) => f.path === draftPath) ?? null
    : null;

  function commit() {
    const result = onAdd(label, { type: fieldType });
    if (result === "ok") {
      setLabel("");
      setFieldType("string");
      setError(null);
      setOpen(false);
      return;
    }
    if (result === "duplicate") {
      const hit = existing.find((f) => f.path === draftPath);
      setError(
        hit
          ? `Already exists as “${hit.label}” (${hit.path} · ${hit.type})`
          : "A field with this path already exists",
      );
      return;
    }
    setError("Enter a field label");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "3px 8px",
          borderRadius: 4,
          border: `1px dashed ${t.border}`,
          background: "transparent",
          fontSize: 11,
          fontWeight: 500,
          color: t.accent,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <Plus size={11} strokeWidth={2.25} />
        Add field
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: "100%",
        padding: 8,
        borderRadius: 8,
        border: `1px solid ${t.border}`,
        background: t.hoverBg,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <input
          autoFocus
          value={label}
          onChange={(e) => {
            setLabel(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setOpen(false);
              setLabel("");
              setError(null);
            }
          }}
          placeholder="Field label…"
          style={{ ...inputStyle(t), flex: 1, minWidth: 120 }}
        />
        <select
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value as EnrichmentFieldType)}
          title="Data type"
          style={{
            ...inputStyle(t),
            width: "auto",
            minWidth: 96,
            paddingRight: 24,
          }}
        >
          {FIELD_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={commit}
          disabled={Boolean(conflict) || !label.trim()}
          style={{
            padding: "5px 10px",
            border: "none",
            borderRadius: 4,
            background: conflict || !label.trim() ? t.border : t.accent,
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            cursor: conflict || !label.trim() ? "not-allowed" : "pointer",
            opacity: conflict || !label.trim() ? 0.7 : 1,
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setLabel("");
            setError(null);
          }}
          style={{
            padding: "5px 8px",
            border: "none",
            borderRadius: 4,
            background: "transparent",
            color: t.textMuted,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
      {draftPath && (
        <p
          style={{
            margin: 0,
            fontSize: 10,
            color: conflict ? t.red : t.textMuted,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          {conflict
            ? `Already exists: ${conflict.label} · ${conflict.path} · ${conflict.type}`
            : `path: ${draftPath}`}
        </p>
      )}
      {error && !conflict && (
        <p style={{ margin: 0, fontSize: 11, color: t.red }}>{error}</p>
      )}
    </div>
  );
}

function iconBtn(t: Tokens): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    border: "none",
    borderRadius: 4,
    background: "transparent",
    color: t.textMuted,
    cursor: "pointer",
    padding: 0,
  };
}

function inputStyle(t: Tokens): CSSProperties {
  return {
    width: "100%",
    padding: "7px 9px",
    border: `1px solid ${t.border}`,
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "inherit",
    color: t.textPrimary,
    background: t.bgPrimary,
    outline: "none",
    boxSizing: "border-box",
  };
}
