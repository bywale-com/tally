import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Download, Loader2, Play } from "lucide-react";
import { HolonBoundary } from "../docs/HolonBoundary";
import type { Tokens } from "../tokens";
import {
  appendInventoryList,
  createInventoryList,
  loadInventoryLists,
  nextUntitledListName,
} from "../../data/inventoryLists";

type SimilarPage = {
  job_id: string;
  url: string;
  company_name?: string;
  location?: string;
};

type EnrichmentRow = {
  url: string;
  job_id: string;
  status: "pending" | "running" | "done" | "failed";
  title?: string;
  company_name?: string;
  location?: string;
  salary_raw?: string;
  employment_type?: string;
  date_posted?: string;
  company_slug?: string;
  similar_pages?: SimilarPage[];
  error?: string;
};

type CrawlMetadata = {
  phase?: string;
  mode?: string;
  rows?: EnrichmentRow[];
  wait?: { kind: string; seconds: number; until: string };
};

type CrawlRun = {
  id: string;
  seed_url: string;
  status: string;
  metadata?: CrawlMetadata | null;
  fail_reason?: string | null;
};

type CrawlRunPanelProps = {
  t: Tokens;
  runId?: string | null;
  onListCreated?: (listId: string) => void;
};

const FIELD_COLS: { key: keyof EnrichmentRow; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "company_name", label: "Company" },
  { key: "location", label: "Location" },
  { key: "salary_raw", label: "Salary" },
  { key: "employment_type", label: "Type" },
  { key: "date_posted", label: "Posted" },
];

function scannerBase(): string {
  return (import.meta.env.VITE_SCANNER_URL as string | undefined)?.replace(/\/$/, "") || "";
}

function Cell({
  t,
  status,
  value,
}: {
  t: Tokens;
  status: EnrichmentRow["status"];
  value?: string;
}) {
  if (status === "pending") {
    return <span style={{ color: t.textDim }}>—</span>;
  }
  if (status === "running" && !value) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: t.accent }}>
        <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
      </span>
    );
  }
  if (status === "failed" && !value) {
    return <span style={{ color: "#c44" }}>—</span>;
  }
  return (
    <span style={{ color: t.textPrimary }} title={value || undefined}>
      {value || "—"}
    </span>
  );
}

export function CrawlRunPanel({ t, runId: initialRunId, onListCreated }: CrawlRunPanelProps) {
  const [seedUrl, setSeedUrl] = useState("");
  const [runId, setRunId] = useState<string | null>(initialRunId ?? null);
  const [run, setRun] = useState<CrawlRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const meta = (run?.metadata || {}) as CrawlMetadata;
  const rows = meta.rows || [];
  const phase = meta.phase || run?.status || "idle";
  const runDone = phase === "done" || run?.status === "done";
  const runFailed = phase === "failed" || run?.status === "failed";
  const canExport = runDone && rows.some((r) => r.status === "done");

  const previewRows = useMemo(() => {
    if (rows.length > 0) return rows;
    if (seedUrl.trim()) {
      return [
        {
          url: seedUrl.trim(),
          job_id: "—",
          status: "pending" as const,
        },
      ];
    }
    return [];
  }, [rows, seedUrl]);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const base = scannerBase();
        const url = base
          ? `${base}/crawl/linkedin/runs/${runId}`
          : `/api/scanner/crawl/linkedin/runs/${runId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setRun(data.run);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    };
    tick();
    const id = window.setInterval(tick, 1500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [runId]);

  async function startCrawl() {
    setError(null);
    setExportMsg(null);
    setStarting(true);
    try {
      const base = scannerBase();
      const url = base ? `${base}/crawl/linkedin/start` : "/api/scanner/crawl/linkedin/start";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed_url: seedUrl.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setRunId(data.run.id);
      setRun(data.run);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStarting(false);
    }
  }

  function exportToList() {
    const done = rows.filter((r) => r.status === "done");
    if (done.length === 0) return;
    const lists = loadInventoryLists();
    const list = createInventoryList({
      name: nextUntitledListName(lists, "jobs"),
      kind: "jobs",
      recordIds: done.map((r) => r.job_id),
      filterSummary: `LinkedIn job URL extract · ${done.length} job(s) · run ${runId ?? ""}`,
    });
    appendInventoryList(list);
    try {
      localStorage.setItem(`tally.crawl.export.${list.id}`, JSON.stringify(done));
    } catch {
      /* ignore */
    }
    setExportMsg(`Exported ${done.length} job(s) to “${list.name}”.`);
    onListCreated?.(list.id);
  }

  const th: CSSProperties = {
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: t.textMuted,
    borderBottom: `1px solid ${t.border}`,
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    background: t.bgPrimary,
    zIndex: 1,
  };
  const td: CSSProperties = {
    padding: "8px 10px",
    fontSize: 12,
    borderBottom: `1px solid ${t.border}`,
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  };

  return (
    <HolonBoundary
      id="crawl-run-panel"
      label="LinkedIn Job URL Extract"
      icon="magnifying-glass"
      order={40}
      t={t}
      style={{ display: "flex", flexDirection: "column", height: "100%", background: t.bgPrimary }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
          Extract from Job URL
        </div>
        <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 8 }}>
          One scrape per URL. Similar jobs are captured as a field — not followed.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={seedUrl}
            onChange={(e) => setSeedUrl(e.target.value)}
            placeholder="https://www.linkedin.com/jobs/view/..."
            style={{
              flex: 1,
              minWidth: 260,
              padding: "6px 10px",
              borderRadius: 6,
              border: `1px solid ${t.border}`,
              background: t.bgSecondary,
              color: t.textPrimary,
              fontSize: 12,
            }}
          />
          <button
            type="button"
            onClick={startCrawl}
            disabled={starting || !seedUrl.trim()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: t.accent,
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              cursor: starting ? "wait" : "pointer",
              opacity: starting || !seedUrl.trim() ? 0.6 : 1,
            }}
          >
            {starting ? (
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Play size={14} />
            )}
            Run
          </button>
        </div>
        {error && <div style={{ marginTop: 8, fontSize: 12, color: "#c44" }}>{error}</div>}
        {run?.fail_reason && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#c44" }}>Failed: {run.fail_reason}</div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "8px 16px",
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div style={{ fontSize: 12, color: t.textMuted }}>
          {runId ? (
            <>
              Status:{" "}
              <strong style={{ color: runFailed ? "#c44" : t.textPrimary }}>{phase}</strong>
              {rows.length > 0 && (
                <span style={{ marginLeft: 12 }}>
                  {rows.filter((r) => r.status === "done").length}/{rows.length} enriched
                </span>
              )}
            </>
          ) : (
            <span>Paste a guest job URL and run.</span>
          )}
        </div>
        <button
          type="button"
          onClick={exportToList}
          disabled={!canExport}
          title={canExport ? "Create a list from enriched rows" : "Available when the run finishes"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: canExport ? t.bgSecondary : "transparent",
            color: canExport ? t.textPrimary : t.textDim,
            fontSize: 12,
            fontWeight: 600,
            cursor: canExport ? "pointer" : "not-allowed",
            opacity: canExport ? 1 : 0.55,
          }}
        >
          <Download size={13} />
          Export to List
        </button>
      </div>
      {exportMsg && (
        <div style={{ padding: "6px 16px", fontSize: 11, color: t.accent }}>{exportMsg}</div>
      )}

      <div style={{ flex: 1, overflow: "auto", padding: "0 0 12px" }}>
        {previewRows.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: t.textDim, fontSize: 13 }}>
            Results appear here as each field fills in.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ ...th, minWidth: 200 }}>Record</th>
                {FIELD_COLS.map((c) => (
                  <th key={c.key} style={th}>
                    {c.label}
                  </th>
                ))}
                <th style={th}>Similar pages</th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row) => (
                <tr
                  key={row.job_id + row.url}
                  style={{
                    background:
                      row.status === "running"
                        ? t.hoverBg
                        : row.status === "failed"
                          ? "rgba(204,68,68,0.06)"
                          : "transparent",
                  }}
                >
                  <td style={{ ...td, maxWidth: 260 }}>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: t.accent, textDecoration: "none" }}
                      title={row.url}
                    >
                      {row.url.replace(/^https?:\/\/(www\.)?linkedin\.com\/jobs\/view\//i, "…/")}
                    </a>
                    {row.error && (
                      <div style={{ fontSize: 10, color: "#c44", marginTop: 2 }}>{row.error}</div>
                    )}
                  </td>
                  {FIELD_COLS.map((c) => (
                    <td key={c.key} style={td}>
                      <Cell
                        t={t}
                        status={row.status}
                        value={typeof row[c.key] === "string" ? (row[c.key] as string) : undefined}
                      />
                    </td>
                  ))}
                  <td style={td}>
                    {row.status === "running" && !row.similar_pages ? (
                      <Cell t={t} status="running" />
                    ) : row.similar_pages ? (
                      <span style={{ color: t.textPrimary }} title={JSON.stringify(row.similar_pages)}>
                        {row.similar_pages.length} similar
                      </span>
                    ) : (
                      <span style={{ color: t.textDim }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </HolonBoundary>
  );
}
