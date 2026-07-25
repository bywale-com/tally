import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, ChevronRight, ExternalLink, PanelLeftClose, PanelLeft, Plus, RefreshCw } from "lucide-react";
import {
  createInventoryList,
  loadInventoryLists,
  nextUntitledListName,
  type InventoryList,
} from "../data/inventoryLists";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { NameListDialog } from "./NameListDialog";
import type { Tokens } from "./tokens";

export type WashedCompany = {
  id: string;
  name: string;
  url: string;
  job_count: number;
  sources: string[];
  role_tags?: string[];
};

type CompaniesPayload = {
  washedAt: string;
  total: number;
  withUrl: number;
  companies: WashedCompany[];
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

const MAX_VISIBLE_ROWS = 500;
const FILTER_PANEL_WIDTH = 260;

type InventoryCompaniesPanelProps = {
  t: Tokens;
  onListCreated?: (list: InventoryList) => void;
};

function FilterSection({
  title,
  open,
  onToggle,
  t,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  t: Tokens;
  children: ReactNode;
}) {
  return (
    <div style={{ borderBottom: `1px solid ${t.borderLight}` }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 12px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        {open ? (
          <ChevronDown size={13} color={t.textMuted} />
        ) : (
          <ChevronRight size={13} color={t.textMuted} />
        )}
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: t.textPrimary }}>{title}</span>
      </button>
      {open && <div style={{ padding: "0 12px 12px" }}>{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
  t,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  t: Tokens;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "3px 0",
        fontSize: 12,
        color: t.textPrimary,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: t.accent }}
      />
      {label}
    </label>
  );
}

export function InventoryCompaniesPanel({ t, onListCreated }: InventoryCompaniesPanelProps) {
  const [payload, setPayload] = useState<CompaniesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [linkFilter, setLinkFilter] = useState<"all" | "with" | "without">("all");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedRoleTags, setSelectedRoleTags] = useState<string[]>([]);
  const [minJobs, setMinJobs] = useState(0);
  const [namingList, setNamingList] = useState(false);
  const [sectionOpen, setSectionOpen] = useState({
    lists: true,
    link: true,
    sources: true,
    roles: true,
    jobs: true,
  });

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/washed-companies.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<CompaniesPayload>;
      })
      .then(setPayload)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const companies = payload?.companies ?? [];

  const allSources = useMemo(() => {
    const set = new Set<string>();
    for (const c of companies) for (const s of c.sources) set.add(s);
    return [...set].sort();
  }, [companies]);

  const allRoleTags = useMemo(() => {
    const set = new Set<string>();
    for (const c of companies) for (const tag of c.role_tags ?? []) set.add(tag);
    return [...set].sort();
  }, [companies]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return companies.filter((c) => {
      if (linkFilter === "with" && !c.url) return false;
      if (linkFilter === "without" && c.url) return false;
      if (selectedSources.length > 0 && !selectedSources.some((s) => c.sources.includes(s))) {
        return false;
      }
      if (
        selectedRoleTags.length > 0 &&
        !selectedRoleTags.some((tag) => (c.role_tags ?? []).includes(tag))
      ) {
        return false;
      }
      if (c.job_count < minJobs) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.url.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [companies, search, linkFilter, selectedSources, selectedRoleTags, minJobs]);

  const visible = filtered.slice(0, MAX_VISIBLE_ROWS);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (linkFilter === "with") parts.push("has link");
    if (linkFilter === "without") parts.push("missing link");
    if (selectedSources.length) {
      parts.push(`sources: ${selectedSources.map((s) => SOURCE_LABELS[s] ?? s).join(", ")}`);
    }
    if (selectedRoleTags.length) {
      parts.push(`roles: ${selectedRoleTags.map((r) => ROLE_TAG_LABELS[r] ?? r).join(", ")}`);
    }
    if (minJobs > 0) parts.push(`≥${minJobs} jobs`);
    if (search.trim()) parts.push(`search “${search.trim()}”`);
    return parts.length ? parts.join(" · ") : "All companies";
  }, [linkFilter, selectedSources, selectedRoleTags, minJobs, search]);

  function clearFilters() {
    setLinkFilter("all");
    setSelectedSources([]);
    setSelectedRoleTags([]);
    setMinJobs(0);
    setSearch("");
  }

  function toggleSource(id: string, on: boolean) {
    setSelectedSources((prev) => (on ? [...prev, id] : prev.filter((s) => s !== id)));
  }

  function toggleRole(tag: string, on: boolean) {
    setSelectedRoleTags((prev) => (on ? [...prev, tag] : prev.filter((s) => s !== tag)));
  }

  function handleSaveAsList() {
    if (filtered.length === 0) return;
    setNamingList(true);
  }

  function confirmSaveAsList(name: string) {
    const list = createInventoryList({
      name,
      kind: "companies",
      recordIds: filtered.map((c) => c.id),
      filterSummary,
    });
    setNamingList(false);
    onListCreated?.(list);
  }

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

  if (loading) {
    return (
      <HolonBoundary
        id="inventory-companies"
        label="Inventory Companies"
        icon="people"
        order={SHELL_HOLON_ORDER["inventory-companies"]}
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
        Loading companies…
      </HolonBoundary>
    );
  }

  if (error || !payload) {
    return (
      <HolonBoundary
        id="inventory-companies"
        label="Inventory Companies"
        icon="people"
        order={SHELL_HOLON_ORDER["inventory-companies"]}
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
        <span>Could not load washed-companies.json{error ? ` (${error})` : ""}.</span>
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

  return (
    <HolonBoundary
      id="inventory-companies"
      label="Inventory Companies"
      icon="people"
      order={SHELL_HOLON_ORDER["inventory-companies"]}
      t={t}
      style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      <HolonBoundary
        id="inventory-companies-toolbar"
        label="Companies Toolbar"
        icon="magnifying-glass"
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
          placeholder="Search company…"
          style={{
            height: 26,
            width: 220,
            fontSize: 12,
            color: t.textPrimary,
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 5,
            padding: "0 8px",
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          style={{
            height: 26,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0 10px",
            fontSize: 12,
            color: t.textPrimary,
            background: filtersOpen ? t.accentBg : t.bgPrimary,
            border: `1px solid ${filtersOpen ? t.accent : t.border}`,
            borderRadius: 5,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {filtersOpen ? <PanelLeftClose size={13} /> : <PanelLeft size={13} />}
          {filtersOpen ? "Hide filters" : "Show filters"}
        </button>
        <button
          type="button"
          title="Save current filtered companies as a list"
          onClick={handleSaveAsList}
          disabled={filtered.length === 0}
          style={{
            height: 26,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "0 10px",
            fontSize: 12,
            fontWeight: 500,
            color: filtered.length === 0 ? t.textDim : t.textPrimary,
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 5,
            cursor: filtered.length === 0 ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          <Plus size={12} strokeWidth={2} />
          Save as list
        </button>
      </HolonBoundary>

      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {filtersOpen && (
          <HolonBoundary
            id="inventory-companies-filters"
            label="Companies Filters"
            icon="filter"
            order={20}
            t={t}
            style={{
              width: FILTER_PANEL_WIDTH,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              display: "flex",
              flexDirection: "column",
              background: t.boardPanel,
              minHeight: 0,
            }}
          >
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              <FilterSection
                title="Lists"
                open={sectionOpen.lists}
                onToggle={() => setSectionOpen((s) => ({ ...s, lists: !s.lists }))}
                t={t}
              >
                <p style={{ margin: "0 0 8px", fontSize: 11.5, color: t.textMuted, lineHeight: 1.4 }}>
                  Save the current filter result as a list snapshot. Open it anytime from Lists in the sidebar.
                </p>
                <button
                  type="button"
                  onClick={handleSaveAsList}
                  disabled={filtered.length === 0}
                  style={{
                    width: "100%",
                    height: 28,
                    marginBottom: 6,
                    fontSize: 12,
                    borderRadius: 5,
                    border: `1px solid ${t.border}`,
                    background: t.bgPrimary,
                    color: t.textPrimary,
                    cursor: filtered.length === 0 ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Save {filtered.length.toLocaleString()} as list
                </button>
              </FilterSection>

              <FilterSection
                title="Link"
                open={sectionOpen.link}
                onToggle={() => setSectionOpen((s) => ({ ...s, link: !s.link }))}
                t={t}
              >
                <select
                  value={linkFilter}
                  onChange={(e) => setLinkFilter(e.target.value as typeof linkFilter)}
                  style={{
                    width: "100%",
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
                  <option value="all">Any link</option>
                  <option value="with">Has link</option>
                  <option value="without">Missing link</option>
                </select>
              </FilterSection>

              <FilterSection
                title="Sources"
                open={sectionOpen.sources}
                onToggle={() => setSectionOpen((s) => ({ ...s, sources: !s.sources }))}
                t={t}
              >
                {allSources.length === 0 ? (
                  <span style={{ fontSize: 11.5, color: t.textDim }}>No sources</span>
                ) : (
                  allSources.map((s) => (
                    <CheckRow
                      key={s}
                      label={SOURCE_LABELS[s] ?? s}
                      checked={selectedSources.includes(s)}
                      onChange={(on) => toggleSource(s, on)}
                      t={t}
                    />
                  ))
                )}
              </FilterSection>

              <FilterSection
                title="Role tags"
                open={sectionOpen.roles}
                onToggle={() => setSectionOpen((s) => ({ ...s, roles: !s.roles }))}
                t={t}
              >
                <p style={{ margin: "0 0 6px", fontSize: 11, color: t.textDim, lineHeight: 1.35 }}>
                  From roles on this company’s washed jobs.
                </p>
                {allRoleTags.length === 0 ? (
                  <span style={{ fontSize: 11.5, color: t.textDim }}>No role tags</span>
                ) : (
                  allRoleTags.map((tag) => (
                    <CheckRow
                      key={tag}
                      label={ROLE_TAG_LABELS[tag] ?? tag}
                      checked={selectedRoleTags.includes(tag)}
                      onChange={(on) => toggleRole(tag, on)}
                      t={t}
                    />
                  ))
                )}
              </FilterSection>

              <FilterSection
                title="Job count"
                open={sectionOpen.jobs}
                onToggle={() => setSectionOpen((s) => ({ ...s, jobs: !s.jobs }))}
                t={t}
              >
                <label style={{ display: "block", fontSize: 11.5, color: t.textMuted, marginBottom: 4 }}>
                  Minimum jobs
                </label>
                <input
                  type="number"
                  min={0}
                  value={minJobs}
                  onChange={(e) => setMinJobs(Math.max(0, Number(e.target.value) || 0))}
                  style={{
                    width: "100%",
                    height: 26,
                    fontSize: 12,
                    color: t.textPrimary,
                    background: t.bgPrimary,
                    border: `1px solid ${t.border}`,
                    borderRadius: 5,
                    padding: "0 8px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </FilterSection>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderTop: `1px solid ${t.border}`,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11.5, color: t.textDim, lineHeight: 1.4 }}>
                {filtered.length.toLocaleString()} of {companies.length.toLocaleString()} companies
                · {payload.withUrl.toLocaleString()} with link · washed {payload.washedAt.slice(0, 10)}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  height: 26,
                  fontSize: 12,
                  borderRadius: 5,
                  border: `1px solid ${t.border}`,
                  background: t.bgPrimary,
                  color: t.textMuted,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Clear filters
              </button>
            </div>
          </HolonBoundary>
        )}

        <HolonBoundary
          id="inventory-companies-table"
          label="Companies Table"
          icon="checkmark-list"
          order={30}
          t={t}
          style={{ flex: 1, minHeight: 0, overflow: "auto" }}
        >
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
              {visible.map((c) => (
                <tr
                  key={c.id}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = t.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <td style={{ ...tdStyle, fontWeight: 500 }} title={c.name}>
                    {c.name || "—"}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      maxWidth: 320,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        title={c.url}
                        style={{
                          color: t.textPrimary,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          maxWidth: "100%",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = t.accent;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = t.textPrimary;
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.url.replace(/^https?:\/\/(www\.)?/, "")}
                        </span>
                        <ExternalLink size={11} style={{ flexShrink: 0, opacity: 0.6 }} />
                      </a>
                    ) : (
                      <span style={{ color: t.textDim }}>—</span>
                    )}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      color: t.textMuted,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {c.job_count}
                  </td>
                  <td style={{ ...tdStyle, color: t.textMuted }}>
                    {(c.role_tags ?? []).map((tag) => ROLE_TAG_LABELS[tag] ?? tag).join(", ") ||
                      "—"}
                  </td>
                  <td style={{ ...tdStyle, color: t.textMuted }}>
                    {c.sources.map((s) => SOURCE_LABELS[s] ?? s).join(", ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > MAX_VISIBLE_ROWS && (
            <div style={{ padding: "10px 12px", fontSize: 12, color: t.textDim }}>
              Showing first {MAX_VISIBLE_ROWS} of {filtered.length.toLocaleString()} matches — refine
              the filters to narrow down.
            </div>
          )}
          {filtered.length === 0 && (
            <div
              style={{
                padding: "24px 12px",
                fontSize: 13,
                color: t.textDim,
                textAlign: "center",
              }}
            >
              No companies match the current filters.
            </div>
          )}
        </HolonBoundary>
      </div>

      {namingList && (
        <NameListDialog
          t={t}
          title="Save as list"
          initialName={nextUntitledListName(loadInventoryLists(), "companies")}
          confirmLabel="Save list"
          hint={`${filtered.length.toLocaleString()} companies · ${filterSummary}`}
          onConfirm={confirmSaveAsList}
          onCancel={() => setNamingList(false)}
        />
      )}
    </HolonBoundary>
  );
}
