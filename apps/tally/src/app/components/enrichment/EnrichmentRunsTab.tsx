import type { EnrichmentRun } from "../../data/enrichmentWorkflows";
import type { Tokens } from "../tokens";

type EnrichmentRunsTabProps = {
  runs: EnrichmentRun[];
  t: Tokens;
};

export function EnrichmentRunsTab({ runs, t }: EnrichmentRunsTabProps) {
  if (runs.length === 0) {
    return (
      <div style={{ padding: 28, color: t.textDim, fontSize: 13 }}>
        No runs yet. Launch from the header or play on a manual trigger.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 100px",
          gap: 8,
          padding: "0 8px 8px",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: t.textDim,
          borderBottom: `1px solid ${t.borderLight}`,
        }}
      >
        <span>Status</span>
        <span>Summary</span>
        <span>Started</span>
      </div>
      {runs.map((run) => (
        <div
          key={run.id}
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr 100px",
            gap: 8,
            padding: "12px 8px",
            borderBottom: `1px solid ${t.borderLight}`,
            fontSize: 13,
            alignItems: "center",
          }}
        >
          <span
            style={{
              color:
                run.status === "running"
                  ? t.amber
                  : run.status === "done"
                    ? t.success
                    : run.status === "failed"
                      ? t.red
                      : t.textMuted,
              fontWeight: 500,
              textTransform: "capitalize",
            }}
          >
            {run.status}
          </span>
          <span style={{ color: t.textPrimary }}>
            {run.summary}
            {run.survivors != null ? ` · ${run.survivors} survivors` : ""}
          </span>
          <span style={{ color: t.textDim, fontSize: 12 }}>
            {new Date(run.startedAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
