import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ExternalLink, Filter, Plus, X } from "lucide-react";
import { AnchoredPortal } from "./AnchoredPortal";
import { LoFiButton } from "./LoFiPrimitives";
import { loFi } from "./loFiPalette";
import { useDeskPalette } from "./DeskPaletteContext";
import {
  ROLE_TAG_LABELS,
  SOURCE_LABELS,
  type FirmRow,
} from "./prototypeFirms";

export type FirmographicsFilters = {
  company: string;
  website: string;
  employees: string;
  hq: string;
  founded: string;
  jobs: string;
  sources: string;
  roleTags: string;
};

export const EMPTY_FIRM_FILTERS: FirmographicsFilters = {
  company: "",
  website: "",
  employees: "",
  hq: "",
  founded: "",
  jobs: "",
  sources: "",
  roleTags: "",
};

const FILTER_FIELDS: {
  key: keyof FirmographicsFilters;
  label: string;
  kind: "text" | "select";
  placeholder?: string;
}[] = [
  { key: "company", label: "Company", kind: "text" },
  { key: "website", label: "Website", kind: "text" },
  { key: "employees", label: "Employees", kind: "text", placeholder: "count or bucket" },
  { key: "hq", label: "HQ", kind: "text" },
  { key: "founded", label: "Founded", kind: "text" },
  { key: "jobs", label: "Jobs", kind: "text", placeholder: "n" },
  { key: "sources", label: "Sources", kind: "select" },
  { key: "roleTags", label: "Role tags", kind: "select" },
];

type FirmographicsTableProps = {
  firms: FirmRow[];
  /** Live enrich — filters/actions visible but disabled; rows still appear */
  running?: boolean;
  /** Seed / full catalog so filter dropdowns work before rows arrive */
  catalog?: FirmRow[];
  filters: FirmographicsFilters;
  onFiltersChange: (next: FirmographicsFilters) => void;
  onToggleRemove?: (id: string) => void;
  showAdd?: boolean;
  footer?: ReactNode;
};

const COLS: { key: keyof FirmographicsFilters | "actions"; label: string; width?: string }[] = [
  { key: "company", label: "Company", width: "16%" },
  { key: "website", label: "Website", width: "14%" },
  { key: "employees", label: "Employees", width: "10%" },
  { key: "hq", label: "HQ", width: "14%" },
  { key: "founded", label: "Founded", width: "8%" },
  { key: "jobs", label: "Jobs", width: "6%" },
  { key: "sources", label: "Sources", width: "14%" },
  { key: "roleTags", label: "Role tags", width: "12%" },
  { key: "actions", label: "", width: "6%" },
];

export function filterFirms(firms: FirmRow[], filters: FirmographicsFilters): FirmRow[] {
  const q = (s: string) => s.trim().toLowerCase();
  return firms.filter((f) => {
    if (q(filters.company) && !f.name.toLowerCase().includes(q(filters.company))) return false;
    if (q(filters.website) && !f.website.toLowerCase().includes(q(filters.website))) return false;
    const emp = `${f.employeeCount} ${f.sizeBucket}`.toLowerCase();
    if (q(filters.employees) && !emp.includes(q(filters.employees))) return false;
    if (q(filters.hq) && !f.hq.toLowerCase().includes(q(filters.hq))) return false;
    if (q(filters.founded) && !f.founded.toLowerCase().includes(q(filters.founded))) return false;
    if (q(filters.jobs) && !String(f.jobCount).includes(q(filters.jobs))) return false;
    const src = f.sources.map((s) => SOURCE_LABELS[s] ?? s).join(" ").toLowerCase();
    if (q(filters.sources) && !src.includes(q(filters.sources))) return false;
    const tags = f.roleTags.map((t) => ROLE_TAG_LABELS[t] ?? t).join(" ").toLowerCase();
    if (q(filters.roleTags) && !tags.includes(q(filters.roleTags))) return false;
    return true;
  });
}

type FirmographicsFilterBarProps = {
  filters: FirmographicsFilters;
  onChange: (next: FirmographicsFilters) => void;
  disabled?: boolean;
  sources: string[];
  roleTags: string[];
  /** Title / meta on the left of the chrome row */
  leading?: ReactNode;
  /** Status beside Filter (e.g. * Running) */
  trailing?: ReactNode;
};

/**
 * Tower-style filters: quiet header control + anchored popover (not an always-on field grid).
 * Active filters surface as dismissible chips — one border budget on the open menu only.
 */
export function FirmographicsFilterBar({
  filters,
  onChange,
  disabled,
  sources,
  roleTags,
  leading,
  trailing,
}: FirmographicsFilterBarProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const active = FILTER_FIELDS.filter((f) => filters[f.key].trim());
  const activeCount = active.length;

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  function set<K extends keyof FirmographicsFilters>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  function clearKey(key: keyof FirmographicsFilters) {
    onChange({ ...filters, [key]: "" });
  }

  const selectOptions: Partial<Record<keyof FirmographicsFilters, string[]>> = {
    sources: sources.map((s) => SOURCE_LABELS[s] ?? s),
    roleTags: roleTags.map((t) => ROLE_TAG_LABELS[t] ?? t),
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: activeCount > 0 ? 8 : 0,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>{leading}</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          {trailing}
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen((v) => !v)}
            title={disabled ? "Filters locked while enriching" : "Filter firms"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 28,
              padding: "0 8px",
              borderRadius: 6,
              border: open ? `1px solid ${loFi.stroke}` : "1px solid transparent",
              background: open || activeCount > 0 ? loFi.chrome : "transparent",
              color: loFi.ink,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.55 : 1,
            }}
          >
            <Filter size={14} strokeWidth={1.75} color={loFi.label} />
            Filter
            {activeCount > 0 ? (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  padding: "0 5px",
                  borderRadius: 9,
                  background: loFi.ink,
                  color: loFi.white,
                  fontSize: 10,
                  fontWeight: 600,
                  lineHeight: "18px",
                  textAlign: "center",
                }}
              >
                {activeCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {activeCount > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 6,
            opacity: disabled ? 0.55 : 1,
          }}
        >
          {active.map((field) => (
            <span
              key={field.key}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                maxWidth: 220,
                height: 24,
                padding: "0 4px 0 8px",
                borderRadius: 6,
                background: loFi.chrome,
                fontSize: 11,
                color: loFi.ink,
                fontFamily: "inherit",
              }}
            >
              <span style={{ color: loFi.muted, flexShrink: 0 }}>{field.label}</span>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                }}
              >
                {filters[field.key]}
              </span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Clear ${field.label} filter`}
                onClick={() => clearKey(field.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18,
                  height: 18,
                  border: "none",
                  borderRadius: 4,
                  background: "transparent",
                  color: loFi.label,
                  cursor: disabled ? "not-allowed" : "pointer",
                  padding: 0,
                }}
              >
                <X size={12} strokeWidth={1.75} />
              </button>
            </span>
          ))}
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...EMPTY_FIRM_FILTERS })}
            style={{
              border: "none",
              background: "none",
              fontSize: 11,
              color: loFi.label,
              cursor: disabled ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              padding: "0 4px",
            }}
          >
            Clear
          </button>
        </div>
      ) : null}

      <AnchoredPortal
        open={open && !disabled}
        anchorRef={triggerRef}
        onClose={() => setOpen(false)}
        width={288}
        maxHeight={420}
      >
        <div
          role="dialog"
          aria-label="Firm filters"
          style={{
            width: 288,
            borderRadius: 10,
            border: `1px solid ${loFi.stroke}`,
            background: loFi.white,
            boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: 420,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: `1px solid ${loFi.stroke}`,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: loFi.label,
            }}
          >
            Filter firms
          </div>
          <div
            style={{
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              maxHeight: 360,
              overflow: "auto",
            }}
          >
            {FILTER_FIELDS.map((field) =>
              field.kind === "select" ? (
                <FilterSelect
                  key={field.key}
                  label={field.label}
                  value={filters[field.key]}
                  onChange={(v) => set(field.key, v)}
                  options={selectOptions[field.key] ?? []}
                />
              ) : (
                <FilterField
                  key={field.key}
                  label={field.label}
                  value={filters[field.key]}
                  onChange={(v) => set(field.key, v)}
                  placeholder={field.placeholder}
                />
              ),
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "8px 10px",
              borderTop: `1px solid ${loFi.stroke}`,
            }}
          >
            <button
              type="button"
              onClick={() => onChange({ ...EMPTY_FIRM_FILTERS })}
              disabled={activeCount === 0}
              style={{
                border: "none",
                background: "none",
                fontSize: 12,
                fontWeight: 500,
                color: activeCount === 0 ? loFi.muted : loFi.label,
                cursor: activeCount === 0 ? "default" : "pointer",
                fontFamily: "inherit",
                padding: "4px 6px",
              }}
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                height: 28,
                padding: "0 10px",
                borderRadius: 6,
                border: "1px solid transparent",
                background: loFi.chrome,
                color: loFi.ink,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              Done
            </button>
          </div>
        </div>
      </AnchoredPortal>
    </div>
  );
}

function FilterField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: loFi.muted, letterSpacing: "0.02em" }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? `Filter ${label.toLowerCase()}…`}
        style={inputStyle()}
      />
    </label>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: loFi.muted, letterSpacing: "0.02em" }}>
        {label}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle()}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

const inputStyle = (): CSSProperties => ({
  height: 28,
  padding: "0 8px",
  borderRadius: 6,
  border: `1px solid ${loFi.stroke}`,
  background: loFi.white,
  color: loFi.ink,
  fontSize: 12,
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
});

export function FirmographicsTable({
  firms,
  running,
  catalog,
  filters,
  onFiltersChange,
  onToggleRemove,
  showAdd,
  footer,
}: FirmographicsTableProps) {
  useDeskPalette();
  const optionPool = catalog && catalog.length > 0 ? catalog : firms;

  const sources = useMemo(() => {
    const s = new Set<string>();
    for (const f of optionPool) for (const x of f.sources) s.add(x);
    return Array.from(s).sort();
  }, [optionPool]);

  const roleTags = useMemo(() => {
    const s = new Set<string>();
    for (const f of optionPool) for (const x of f.roleTags) s.add(x);
    return Array.from(s).sort();
  }, [optionPool]);

  const visible = useMemo(() => filterFirms(firms, filters), [firms, filters]);
  const active = visible.filter((f) => !f.removed).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, width: "100%" }}>
      <FirmographicsFilterBar
        filters={filters}
        onChange={onFiltersChange}
        disabled={running}
        sources={sources}
        roleTags={roleTags}
        leading={
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: loFi.ink }}>Firmographics</div>
            {!running && Object.values(filters).some((v) => v.trim()) ? (
              <div style={{ fontSize: 10, color: loFi.muted, marginTop: 2 }}>
                {visible.length} of {active}
              </div>
            ) : null}
          </div>
        }
        trailing={
          <>
            {running ? (
              <span style={{ fontSize: 11, color: loFi.label, fontWeight: 600 }}>* Running</span>
            ) : null}
            {showAdd ? (
              <button
                type="button"
                disabled
                title="Add firm (coming soon)"
                aria-label="Add firm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  height: 28,
                  padding: "0 6px",
                  border: "1px solid transparent",
                  borderRadius: 6,
                  background: "transparent",
                  color: loFi.label,
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: "not-allowed",
                  opacity: running ? 0.45 : 0.7,
                }}
              >
                <Plus size={14} strokeWidth={1.75} />
                Add firm
              </button>
            ) : null}
          </>
        }
      />

      <div
        style={{
          border: `1px solid ${loFi.stroke}`,
          borderRadius: 6,
          overflow: "auto",
          background: loFi.white,
          width: "100%",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 900 }}>
          <thead>
            <tr style={{ background: loFi.chrome, textAlign: "left" }}>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  style={{
                    padding: "10px 10px",
                    fontWeight: 600,
                    color: loFi.label,
                    fontSize: 10,
                    letterSpacing: "0.04em",
                    borderBottom: `1px solid ${loFi.stroke}`,
                    width: c.width,
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.label.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={COLS.length}
                  style={{ padding: 24, textAlign: "center", color: loFi.muted }}
                >
                  {running ? null : "No firms match filters"}
                </td>
              </tr>
            ) : (
              visible.map((f) => (
                <FirmRowView
                  key={f.id}
                  firm={f}
                  running={running}
                  onToggleRemove={onToggleRemove}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer ? <div style={{ marginTop: 14 }}>{footer}</div> : null}
    </div>
  );
}

function FirmRowView({
  firm: f,
  running,
  onToggleRemove,
}: {
  firm: FirmRow;
  running?: boolean;
  onToggleRemove?: (id: string) => void;
}) {
  const pending = f.enrichPending;
  const href = f.website
    ? f.website.startsWith("http")
      ? f.website
      : `https://${f.website}`
    : undefined;

  const cell = (content: ReactNode, muted?: boolean) => (
    <td
      style={{
        padding: "10px 10px",
        borderBottom: `1px solid ${loFi.stroke}`,
        color: muted ? loFi.muted : loFi.ink,
        verticalAlign: "top",
        opacity: f.removed ? 0.45 : 1,
        textDecoration: f.removed ? "line-through" : undefined,
      }}
    >
      {pending ? <Pulse /> : content}
    </td>
  );

  return (
    <tr style={{ background: f.removed ? loFi.chrome : loFi.white }}>
      {cell(<span style={{ fontWeight: 600 }}>{f.name}</span>)}
      {cell(
        href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              color: loFi.ink,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {f.website.replace(/^https?:\/\//, "")}
            <ExternalLink size={12} strokeWidth={2} color={loFi.label} />
          </a>
        ) : (
          <span style={{ color: loFi.muted }}>Can't be identified</span>
        ),
      )}
      {cell(
        f.employeeCount || f.sizeBucket ? (
          <span>
            {f.employeeCount || "—"}
            {f.sizeBucket ? (
              <span style={{ color: loFi.muted, marginLeft: 4 }}>({f.sizeBucket})</span>
            ) : null}
          </span>
        ) : (
          <span style={{ color: loFi.label, fontWeight: 600 }}>Can't be identified</span>
        ),
      )}
      {cell(f.hq || "—", !f.hq)}
      {cell(f.founded || "—", !f.founded)}
      {cell(String(f.jobCount))}
      {cell(
        f.sources.map((s) => SOURCE_LABELS[s] ?? s).join(", ") || "—",
        f.sources.length === 0,
      )}
      {cell(
        f.roleTags.map((t) => ROLE_TAG_LABELS[t] ?? t).join(", ") || "—",
        f.roleTags.length === 0,
      )}
      <td
        style={{
          padding: "10px 10px",
          borderBottom: `1px solid ${loFi.stroke}`,
          textAlign: "right",
          opacity: running ? 0.4 : 1,
        }}
      >
        {onToggleRemove ? (
          <button
            type="button"
            disabled={running}
            onClick={() => onToggleRemove(f.id)}
            style={{
              border: "none",
              background: "none",
              fontSize: 11,
              color: loFi.label,
              cursor: running ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              textDecoration: "underline",
            }}
          >
            {f.removed ? "Restore" : "Remove"}
          </button>
        ) : null}
      </td>
    </tr>
  );
}

function Pulse() {
  return (
    <div
      style={{
        height: 10,
        width: "70%",
        borderRadius: 3,
        background: loFi.block,
        border: `1px dashed ${loFi.stroke}`,
      }}
    />
  );
}

/** Progressive fill while enrich runs — parent owns completion. */
export function useLiveEnrichFill(
  seed: FirmRow[],
  running: boolean,
  onTick: (partial: FirmRow[]) => void,
  onDone: () => void,
  intervalMs = 420,
) {
  useEffect(() => {
    if (!running) return;
    onTick([]);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      if (i > seed.length) {
        window.clearInterval(id);
        onDone();
        return;
      }
      onTick(seed.slice(0, i).map((f) => ({ ...f, enrichPending: false })));
    }, intervalMs);
    return () => window.clearInterval(id);
    // Intentionally only re-run when `running` flips on — seed is stable SEED_FIRMS.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
}

/** Convenience shell used by click-through enriching + firm-list. */
export function EnrichFirmographicsPanel({
  seed,
  running,
  firms,
  onFirmsChange,
  onRunningComplete,
  onDeploy,
}: {
  seed: FirmRow[];
  running: boolean;
  firms: FirmRow[];
  onFirmsChange: (firms: FirmRow[]) => void;
  onRunningComplete: () => void;
  onDeploy?: () => void;
}) {
  const [filters, setFilters] = useState<FirmographicsFilters>({ ...EMPTY_FIRM_FILTERS });

  useLiveEnrichFill(seed, running, onFirmsChange, onRunningComplete);

  return (
    <FirmographicsTable
      firms={firms}
      catalog={seed}
      running={running}
      filters={filters}
      onFiltersChange={setFilters}
      showAdd
      onToggleRemove={(id) => {
        if (running) return;
        onFirmsChange(firms.map((f) => (f.id === id ? { ...f, removed: !f.removed } : f)));
      }}
      footer={
        !running && onDeploy ? (
          <LoFiButton onClick={onDeploy} disabled={firms.filter((f) => !f.removed).length === 0}>
            Deploy
          </LoFiButton>
        ) : null
      }
    />
  );
}
