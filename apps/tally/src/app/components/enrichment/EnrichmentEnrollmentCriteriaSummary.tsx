import { Info } from "lucide-react";
import {
  canRunEnrollment,
  enrollmentHasUnresolvedIssues,
  enrollmentPreQualifiedHint,
  isEnrollmentConfigured,
  type EnrichmentEnrollmentCriteria,
} from "../../data/enrichmentEnrollment";
import { DOCS_TREE_LABEL_SIZE } from "../docs/treeLayout";
import type { Tokens } from "../tokens";

type EnrichmentEnrollmentCriteriaSummaryProps = {
  criteria: EnrichmentEnrollmentCriteria | undefined;
  t: Tokens;
  compact?: boolean;
  onOpenConfig?: () => void;
};

/** Mirrors Tower ManualEnrollmentCriteriaSummary — enrichment criteria. */
export function EnrichmentEnrollmentCriteriaSummary({
  criteria,
  t,
  compact = false,
  onOpenConfig,
}: EnrichmentEnrollmentCriteriaSummaryProps) {
  const configured = isEnrollmentConfigured(criteria);
  const unresolved = enrollmentHasUnresolvedIssues(criteria);
  const canRun = canRunEnrollment(criteria);
  const hint = criteria ? enrollmentPreQualifiedHint(criteria) : "—";

  return (
    <div
      style={{
        borderRadius: 10,
        background: t.hoverBg,
        padding: compact ? 10 : 12,
        marginTop: compact ? 10 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: compact ? 8 : 10,
        }}
      >
        <span
          style={{
            fontSize: DOCS_TREE_LABEL_SIZE,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
          Enrichment criteria
        </span>
        {unresolved ? (
          <span title="Unresolved mapping — cannot run until remapped">
            <Info size={13} strokeWidth={2} color={t.red} />
          </span>
        ) : (
          <span title="Sources, schema, freshness, and go-until before any graph nodes run">
            <Info size={13} strokeWidth={2} color={t.textMuted} />
          </span>
        )}
      </div>

      <div
        style={{
          borderRadius: 8,
          border: `1px solid ${unresolved ? t.red : t.border}`,
          background: t.bgPrimary,
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={onOpenConfig}
          disabled={!onOpenConfig}
          className="nodrag nopan"
          style={{
            display: "block",
            width: "100%",
            border: "none",
            background: "transparent",
            padding: compact ? "10px 12px" : "12px 14px",
            textAlign: "left",
            cursor: onOpenConfig ? "pointer" : "default",
          }}
        >
          <div
            style={{
              fontSize: DOCS_TREE_LABEL_SIZE,
              fontWeight: 600,
              color: t.textPrimary,
              letterSpacing: "-0.01em",
              marginBottom: 6,
            }}
          >
            Pull matching these attributes…
          </div>
          <div
            style={{
              fontSize: DOCS_TREE_LABEL_SIZE,
              fontWeight: 500,
              color: unresolved ? t.red : configured ? t.textPrimary : t.textMuted,
              marginBottom: 4,
            }}
          >
            Pre-qualified: {configured || unresolved ? hint : "—"}
          </div>
          <p style={{ margin: 0, fontSize: 11, color: unresolved ? t.red : t.textMuted, lineHeight: 1.4 }}>
            {unresolved
              ? "Resolve mapping attention before run"
              : canRun
                ? "Actual yield depends on source availability at each run"
                : "Add sources, map schema, freshness, and optional go-until to enroll"}
          </p>
        </button>
      </div>
    </div>
  );
}
