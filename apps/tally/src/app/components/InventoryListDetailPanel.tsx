import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Info } from "lucide-react";
import {
  loadInventoryLists,
  type InventoryList,
} from "../data/inventoryLists";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import type { Tokens } from "./tokens";

type WashedCompany = {
  id: string;
  name: string;
  url: string;
  job_count: number;
  sources: string[];
  role_tags?: string[];
};

type WashedJob = {
  id: string;
  company: string;
  title: string;
  url: string;
  source: string;
  location_raw: string;
  remote: string;
  relevance: string;
  salary_raw: string;
  posted_at: string;
};

const SOURCE_LABELS: Record<string, string> = {
  wellfound: "Wellfound",
  builtin: "Built In",
  startup_jobs: "startup.jobs",
  a16z: "a16z Portfolio",
  sequoia: "Sequoia",
  linkedin: "LinkedIn",
};

const ROLE_TAG_LABELS: Record<string, string> = {
  founding_sales: "Founding sales",
  founding: "Founding",
  sales: "Sales",
  other: "Other",
};

const KIND_LABELS: Record<string, string> = {
  companies: "Companies",
  jobs: "Jobs",
};

type InventoryListDetailPanelProps = {
  listId: string;
  t: Tokens;
};

/**
 * A list is a snapshot of a data-class table (companies / jobs / …).
 * Main surface = that table. Details = parameters (source class, filters, counts).
 */
export function InventoryListDetailPanel({ listId, t }: InventoryListDetailPanelProps) {
  const [list, setList] = useState<InventoryList | null>(null);
  const [companies, setCompanies] = useState<WashedCompany[]>([]);
  const [jobs, setJobs] = useState<WashedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const found = loadInventoryLists().find((l) => l.id === listId) ?? null;
    setList(found);
  }, [listId]);

  useEffect(() => {
    if (!list) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const url =
      list.kind === "jobs" ? "/washed-jobs.json" : "/washed-companies.json";
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload: { companies?: WashedCompany[]; jobs?: WashedJob[] }) => {
        if (list.kind === "jobs") setJobs(payload.jobs ?? []);
        else setCompanies(payload.companies ?? []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [list]);

  const idSet = useMemo(() => new Set(list?.recordIds ?? []), [list]);

  const companyRows = useMemo(
    () => companies.filter((c) => idSet.has(c.id)),
    [companies, idSet],
  );
  const jobRows = useMemo(
    () => jobs.filter((j) => idSet.has(j.id)),
    [jobs, idSet],
  );

  const thStyle: CSSProperties = {
    position: "sticky",
    top: 0,
    textAlign: "left",
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: t.textMuted,
    background: t.bgPrimary,
    borderBottom: `1px solid ${t.border}`,
    whiteSpace: "nowrap",
    zIndex: 1,
  };
  const tdStyle: CSSProperties = {
    padding: "5px 10px",
    fontSize: 12,
    color: t.textPrimary,
    borderBottom: `1px solid ${t.borderLight}`,
    verticalAlign: "middle",
  };

  if (!list) {
    return (
      <HolonBoundary
        id="list-detail"
        label="List Detail"
        icon="list-bullet"
        order={SHELL_HOLON_ORDER["list-detail"]}
        t={t}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.textDim,
          fontSize: 13,
        }}
      >
        List not found.
      </HolonBoundary>
    );
  }

  const rowCount = list.kind === "jobs" ? jobRows.length : companyRows.length;
  const missing = Math.max(0, list.recordIds.length - rowCount);

  return (
    <HolonBoundary
      id="list-detail"
      label="List Detail"
      icon="list-bullet"
      order={SHELL_HOLON_ORDER["list-detail"]}
      t={t}
      style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      <HolonBoundary
        id="list-detail-toolbar"
        label="List Toolbar"
        icon="list"
        order={10}
        t={t}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: `1px solid ${t.borderLight}`,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          style={{
            height: 26,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0 10px",
            fontSize: 12,
            color: detailsOpen ? t.accent : t.textPrimary,
            background: detailsOpen ? t.accentBg : t.bgPrimary,
            border: `1px solid ${detailsOpen ? t.accent : t.border}`,
            borderRadius: 5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <Info size={13} strokeWidth={2} />
          Details
          {detailsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: t.textDim }}>
          {rowCount.toLocaleString()} {KIND_LABELS[list.kind]?.toLowerCase() ?? list.kind}
          {missing > 0 ? ` · ${missing} missing from inventory` : ""}
        </span>
      </HolonBoundary>

      {detailsOpen && (
        <HolonBoundary
          id="list-detail-params"
          label="List Parameters"
          icon="information-circle"
          order={15}
          t={t}
          style={{
            padding: "12px 14px",
            borderBottom: `1px solid ${t.borderLight}`,
            flexShrink: 0,
            background: t.boardPanel,
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: "8px 16px",
            fontSize: 12,
          }}
        >
          <span style={{ color: t.textMuted }}>Data class</span>
          <span style={{ color: t.textPrimary, fontWeight: 500 }}>
            {KIND_LABELS[list.kind] ?? list.kind}
          </span>
          <span style={{ color: t.textMuted }}>Records</span>
          <span style={{ color: t.textPrimary }}>
            {list.recordIds.length.toLocaleString()} snapshotted
            {rowCount !== list.recordIds.length
              ? ` · ${rowCount.toLocaleString()} still in inventory`
              : ""}
          </span>
          <span style={{ color: t.textMuted }}>Filters</span>
          <span style={{ color: t.textPrimary }}>
            {list.filterSummary || "None (full / empty selection)"}
          </span>
          <span style={{ color: t.textMuted }}>Created</span>
          <span style={{ color: t.textPrimary }}>
            {new Date(list.createdAt).toLocaleString()}
          </span>
          <span style={{ color: t.textMuted }}>Updated</span>
          <span style={{ color: t.textPrimary }}>
            {new Date(list.updatedAt).toLocaleString()}
          </span>
        </HolonBoundary>
      )}

      <HolonBoundary
        id="list-detail-table"
        label="List Table"
        icon="checkmark-list"
        order={20}
        t={t}
        style={{ flex: 1, minHeight: 0, overflow: "auto" }}
      >
        {loading ? (
          <div style={{ padding: 24, color: t.textDim, fontSize: 13 }}>Loading…</div>
        ) : error ? (
          <div style={{ padding: 24, color: t.textMuted, fontSize: 13 }}>{error}</div>
        ) : list.kind === "companies" ? (
          <CompaniesSnapshotTable rows={companyRows} t={t} thStyle={thStyle} tdStyle={tdStyle} />
        ) : (
          <JobsSnapshotTable rows={jobRows} t={t} thStyle={thStyle} tdStyle={tdStyle} />
        )}
      </HolonBoundary>
    </HolonBoundary>
  );
}

function CompaniesSnapshotTable({
  rows,
  t,
  thStyle,
  tdStyle,
}: {
  rows: WashedCompany[];
  t: Tokens;
  thStyle: CSSProperties;
  tdStyle: CSSProperties;
}) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: "28px 16px", textAlign: "center", color: t.textDim, fontSize: 13 }}>
        This list has no company rows. Save from Companies with filters (or none) to populate it.
      </div>
    );
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>Company</th>
          <th style={thStyle}>Link</th>
          <th style={{ ...thStyle, textAlign: "right" }}>Jobs</th>
          <th style={thStyle}>Role tags</th>
          <th style={thStyle}>Sources</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <tr key={c.id}>
            <td style={{ ...tdStyle, fontWeight: 500 }}>{c.name || "—"}</td>
            <td style={{ ...tdStyle, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: t.textPrimary,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {c.url.replace(/^https?:\/\/(www\.)?/, "")}
                  <ExternalLink size={11} style={{ opacity: 0.6 }} />
                </a>
              ) : (
                <span style={{ color: t.textDim }}>—</span>
              )}
            </td>
            <td style={{ ...tdStyle, textAlign: "right", color: t.textMuted }}>{c.job_count}</td>
            <td style={{ ...tdStyle, color: t.textMuted }}>
              {(c.role_tags ?? []).map((tag) => ROLE_TAG_LABELS[tag] ?? tag).join(", ") || "—"}
            </td>
            <td style={{ ...tdStyle, color: t.textMuted }}>
              {c.sources.map((s) => SOURCE_LABELS[s] ?? s).join(", ") || "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function JobsSnapshotTable({
  rows,
  t,
  thStyle,
  tdStyle,
}: {
  rows: WashedJob[];
  t: Tokens;
  thStyle: CSSProperties;
  tdStyle: CSSProperties;
}) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: "28px 16px", textAlign: "center", color: t.textDim, fontSize: 13 }}>
        This list has no job rows yet.
      </div>
    );
  }
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={thStyle}>Company</th>
          <th style={thStyle}>Title</th>
          <th style={thStyle}>Source</th>
          <th style={thStyle}>Location</th>
          <th style={thStyle}>Posted</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((j) => (
          <tr key={j.id}>
            <td style={{ ...tdStyle, fontWeight: 500 }}>{j.company || "—"}</td>
            <td style={tdStyle}>
              <a
                href={j.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: t.textPrimary, textDecoration: "none" }}
              >
                {j.title || "—"}
              </a>
            </td>
            <td style={{ ...tdStyle, color: t.textMuted }}>{SOURCE_LABELS[j.source] ?? j.source}</td>
            <td style={{ ...tdStyle, color: t.textMuted }}>{j.location_raw || "—"}</td>
            <td style={{ ...tdStyle, color: t.textMuted }}>{j.posted_at || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function listTabId(listId: string): string {
  return `list:${listId}`;
}

export function parseListTabId(tabId: string): string | null {
  return tabId.startsWith("list:") ? tabId.slice(5) : null;
}
