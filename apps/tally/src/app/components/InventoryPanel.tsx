import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import type { Tokens } from "./tokens";
import {
  buildCompanyJobIndex,
  companyKeyForJob,
  isSimilarNameFlagged,
} from "../data/inventoryJobFilters";

/** One washed job record, as emitted by `python -m tally_scanner wash`. */
export type WashedJob = {
  id: string;
  source: string;
  source_file: string;
  company: string;
  title: string;
  url: string;
  company_url: string;
  location_raw: string;
  remote: "remote" | "hybrid" | "onsite" | "unknown";
  salary_raw: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_period: string;
  equity_raw: string;
  posted_raw: string;
  posted_at: string;
  employment_type: string;
  seniority: string;
  description: string;
  skills: string[];
  company_stage: string;
  company_size: string;
  industries: string;
  logo_url: string;
  scraped_at: string;
  relevance: "founding_sales" | "founding" | "sales" | "other";
  quality_flags: string[];
};

type WashedPayload = {
  washedAt: string;
  total: number;
  relevance: Record<string, number>;
  jobs: WashedJob[];
};

const SOURCE_LABELS: Record<string, string> = {
  wellfound: "Wellfound",
  builtin: "Built In",
  startup_jobs: "startup.jobs",
  a16z: "a16z Portfolio",
  sequoia: "Sequoia",
  linkedin: "LinkedIn",
};

const RELEVANCE_LABELS: Record<string, string> = {
  founding_sales: "Founding sales",
  founding: "Founding",
  sales: "Sales",
  other: "Other",
};

const MAX_VISIBLE_ROWS = 300;

function formatSalary(job: WashedJob): string {
  if (job.salary_min == null) return job.salary_raw ? job.salary_raw.slice(0, 28) : "—";
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}K` : String(n));
  const cur = job.salary_currency === "USD" ? "$" : `${job.salary_currency} `;
  if (job.salary_max != null && job.salary_max !== job.salary_min) {
    return `${cur}${fmt(job.salary_min)}–${fmt(job.salary_max)}`;
  }
  return `${cur}${fmt(job.salary_min)}`;
}

function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 7px",
        borderRadius: 999,
        fontSize: 10.5,
        fontWeight: 500,
        color,
        background: bg,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  t: Tokens;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        height: 26,
        fontSize: 12,
        color: t.textPrimary,
        background: t.bgPrimary,
        border: `1px solid ${t.border}`,
        borderRadius: 5,
        padding: "0 6px",
        outline: "none",
        cursor: "pointer",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function InventoryPanel({ t }: { t: Tokens }) {
  const [payload, setPayload] = useState<WashedPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [companySourceFilter, setCompanySourceFilter] = useState("all");
  const [similarNamesOnly, setSimilarNamesOnly] = useState(false);
  const [relevanceFilter, setRelevanceFilter] = useState("all");
  const [remoteFilter, setRemoteFilter] = useState("all");
  const [salaryOnly, setSalaryOnly] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/washed-jobs.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<WashedPayload>;
      })
      .then(setPayload)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const jobs = payload?.jobs ?? [];

  const companyIndex = useMemo(() => buildCompanyJobIndex(jobs), [jobs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (sourceFilter !== "all" && j.source !== sourceFilter) return false;
      if (relevanceFilter !== "all" && j.relevance !== relevanceFilter) return false;
      if (remoteFilter !== "all" && j.remote !== remoteFilter) return false;
      if (salaryOnly && j.salary_min == null) return false;

      const key = companyKeyForJob(j);
      const rollup = key ? companyIndex.byKey.get(key) : undefined;
      if (companySourceFilter === "linkedin_plus_other") {
        if (!rollup?.linkedInPlusOther) return false;
      } else if (companySourceFilter === "multi_source") {
        if (!rollup?.multiSource) return false;
      }

      if (similarNamesOnly && !isSimilarNameFlagged(j, companyIndex)) return false;

      if (q) {
        const hay = `${j.company} ${j.title} ${j.location_raw} ${j.industries}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    jobs,
    search,
    sourceFilter,
    companySourceFilter,
    similarNamesOnly,
    relevanceFilter,
    remoteFilter,
    salaryOnly,
    companyIndex,
  ]);

  const visible = filtered.slice(0, MAX_VISIBLE_ROWS);

  const relevanceBadge = (rel: WashedJob["relevance"]) => {
    if (rel === "founding_sales") return <Badge text="Founding sales" color={t.accent} bg={t.accentBg} />;
    if (rel === "founding") return <Badge text="Founding" color={t.amber} bg={t.amberBg} />;
    if (rel === "sales") return <Badge text="Sales" color={t.success} bg={`${t.success}22`} />;
    return <Badge text="Other" color={t.textDim} bg={t.hoverBg} />;
  };

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
    verticalAlign: "top",
    maxWidth: 280,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  if (loading) {
    return (
      <HolonBoundary
        id="inventory-jobs"
        label="Inventory Jobs"
        icon="checkmark-list"
        order={SHELL_HOLON_ORDER["inventory-jobs"]}
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
        Loading washed jobs…
      </HolonBoundary>
    );
  }

  if (error || !payload) {
    return (
      <HolonBoundary
        id="inventory-jobs"
        label="Inventory Jobs"
        icon="checkmark-list"
        order={SHELL_HOLON_ORDER["inventory-jobs"]}
        t={t}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          color: t.textMuted,
          fontSize: 13,
        }}
      >
        <span>Could not load washed-jobs.json{error ? ` (${error})` : ""}.</span>
        <span style={{ color: t.textDim, fontSize: 12 }}>
          Run: <code>python -m tally_scanner wash --publish apps/tally/public/washed-jobs.json</code>
        </span>
        <button
          type="button"
          onClick={load}
          style={{
            marginTop: 4,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 12px",
            fontSize: 12,
            color: t.textPrimary,
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={12} /> Retry
        </button>
      </HolonBoundary>
    );
  }

  const sources = Object.keys(SOURCE_LABELS).filter((s) => jobs.some((j) => j.source === s));

  return (
    <HolonBoundary
      id="inventory-jobs"
      label="Inventory Jobs"
      icon="checkmark-list"
      order={SHELL_HOLON_ORDER["inventory-jobs"]}
      t={t}
      style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      <HolonBoundary
        id="inventory-jobs-toolbar"
        label="Jobs Toolbar"
        icon="filter"
        order={10}
        t={t}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderBottom: `1px solid ${t.borderLight}`,
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, title, location…"
          style={{
            height: 26,
            width: 240,
            fontSize: 12,
            color: t.textPrimary,
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 5,
            padding: "0 8px",
            outline: "none",
          }}
        />
        <FilterSelect
          value={sourceFilter}
          onChange={setSourceFilter}
          t={t}
          options={[
            { value: "all", label: "All sources" },
            ...sources.map((s) => ({ value: s, label: SOURCE_LABELS[s] ?? s })),
          ]}
        />
        <FilterSelect
          value={companySourceFilter}
          onChange={setCompanySourceFilter}
          t={t}
          options={[
            { value: "all", label: "Any company sources" },
            {
              value: "linkedin_plus_other",
              label: `LinkedIn + other (${companyIndex.linkedInPlusOtherCount})`,
            },
            {
              value: "multi_source",
              label: `Multi-source company (${companyIndex.multiSourceCount})`,
            },
          ]}
        />
        <FilterSelect
          value={relevanceFilter}
          onChange={setRelevanceFilter}
          t={t}
          options={[
            { value: "all", label: "All relevance" },
            ...Object.entries(RELEVANCE_LABELS).map(([value, label]) => ({ value, label })),
          ]}
        />
        <FilterSelect
          value={remoteFilter}
          onChange={setRemoteFilter}
          t={t}
          options={[
            { value: "all", label: "Any workplace" },
            { value: "remote", label: "Remote" },
            { value: "hybrid", label: "Hybrid" },
            { value: "onsite", label: "On-site" },
            { value: "unknown", label: "Unknown" },
          ]}
        />
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: t.textMuted,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={salaryOnly}
            onChange={(e) => setSalaryOnly(e.target.checked)}
            style={{ accentColor: t.accent }}
          />
          Has salary
        </label>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: t.textMuted,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={similarNamesOnly}
            onChange={(e) => setSimilarNamesOnly(e.target.checked)}
            style={{ accentColor: t.accent }}
          />
          Similar names ({companyIndex.similarNameCompanyCount})
        </label>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: t.textDim }}>
          {filtered.length.toLocaleString()} of {jobs.length.toLocaleString()} jobs ·{" "}
          {companyIndex.linkedInPlusOtherCount} co. LinkedIn+other · washed{" "}
          {payload.washedAt.slice(0, 10)}
        </span>
      </HolonBoundary>

      <HolonBoundary
        id="inventory-jobs-table"
        label="Jobs Table"
        icon="checkmark-list"
        order={20}
        t={t}
        style={{ flex: 1, minHeight: 0, overflow: "auto" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Company</th>
              <th style={thStyle}>Title</th>
              <th style={thStyle}>Relevance</th>
              <th style={thStyle}>Source</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Workplace</th>
              <th style={thStyle}>Salary</th>
              <th style={thStyle}>Posted</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((j) => {
              const key = companyKeyForJob(j);
              const rollup = key ? companyIndex.byKey.get(key) : undefined;
              const similarFlag = isSimilarNameFlagged(j, companyIndex);
              const companyTitle = [
                j.company,
                rollup && rollup.sources.length > 1
                  ? `Sources: ${rollup.sources.map((s) => SOURCE_LABELS[s] ?? s).join(", ")}`
                  : "",
                rollup && rollup.nameVariants
                  ? `Name variants: ${rollup.displayNames.join(" · ")}`
                  : "",
                similarFlag && rollup?.fuzzySimilar ? "Similar normalized name cluster" : "",
              ]
                .filter(Boolean)
                .join("\n");

              return (
              <tr
                key={j.id}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = t.hoverBg;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <td style={{ ...tdStyle, fontWeight: 500 }} title={companyTitle}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {j.company || "—"}
                    {similarFlag && (
                      <Badge text="≈ name" color={t.amber} bg={t.amberBg} />
                    )}
                    {rollup?.linkedInPlusOther && (
                      <Badge text="LI+" color={t.accent} bg={t.accentBg} />
                    )}
                  </span>
                </td>
                <td style={{ ...tdStyle, maxWidth: 340 }} title={j.title}>
                  <a
                    href={j.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: t.textPrimary,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = t.accent;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = t.textPrimary;
                    }}
                  >
                    {j.title || "—"}
                    <ExternalLink size={11} style={{ flexShrink: 0, opacity: 0.6 }} />
                  </a>
                </td>
                <td style={tdStyle}>{relevanceBadge(j.relevance)}</td>
                <td style={{ ...tdStyle, color: t.textMuted }} title={companyTitle}>
                  {SOURCE_LABELS[j.source] ?? j.source}
                  {rollup && rollup.sources.length > 1 ? (
                    <span style={{ color: t.textDim }}>
                      {" "}
                      · co. {rollup.sources.length} src
                    </span>
                  ) : null}
                </td>
                <td style={{ ...tdStyle, color: t.textMuted, maxWidth: 200 }} title={j.location_raw}>
                  {j.location_raw || "—"}
                </td>
                <td style={{ ...tdStyle, color: t.textMuted }}>
                  {j.remote === "unknown" ? "—" : j.remote}
                </td>
                <td style={{ ...tdStyle, color: t.textMuted }} title={j.salary_raw}>
                  {formatSalary(j)}
                </td>
                <td style={{ ...tdStyle, color: t.textMuted }} title={j.posted_raw}>
                  {j.posted_at || "—"}
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
        {filtered.length > MAX_VISIBLE_ROWS && (
          <div style={{ padding: "10px 12px", fontSize: 12, color: t.textDim }}>
            Showing first {MAX_VISIBLE_ROWS} of {filtered.length.toLocaleString()} matches — refine the
            filters to narrow down.
          </div>
        )}
        {filtered.length === 0 && (
          <div style={{ padding: "24px 12px", fontSize: 13, color: t.textDim, textAlign: "center" }}>
            No jobs match the current filters.
          </div>
        )}
      </HolonBoundary>
    </HolonBoundary>
  );
}
