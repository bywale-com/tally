import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, GripVertical, Search } from "lucide-react";
import type { EnrichmentNodePayload } from "../../data/enrichmentNodeRuntime";
import { DOCS_TREE_LABEL_SIZE } from "../docs/treeLayout";
import type { Tokens } from "../tokens";
import { setFieldPathDragData } from "./FieldPathDropInput";

type DataViewMode = "schema" | "table" | "json";

type NodeDataPaneProps = {
  title: string;
  emptyHint: string;
  data: EnrichmentNodePayload | null | undefined;
  t: Tokens;
  showRunChrome?: boolean;
  enableFieldDrag?: boolean;
  sourceOptions?: { id: string; label: string; role?: "direct" | "ancestor" }[];
  selectedSourceId?: string | null;
  onSelectSource?: (id: string) => void;
};

type SchemaTypeKind = "string" | "number" | "boolean" | "object" | "array" | "null" | "unknown";

function typeKind(value: unknown): SchemaTypeKind {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  switch (typeof value) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "object":
      return "object";
    default:
      return "unknown";
  }
}

function typeIcon(kind: SchemaTypeKind): string {
  switch (kind) {
    case "string":
      return "T";
    case "number":
      return "#";
    case "boolean":
      return "✓";
    case "object":
      return "{}";
    case "array":
      return "[]";
    case "null":
      return "∅";
    default:
      return "?";
  }
}

function formatLeafValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function countItems(value: unknown): number {
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
  return 1;
}

function resolveViewRoot(data: EnrichmentNodePayload | null | undefined, itemIndex: number): unknown {
  if (!data) return null;
  if (Array.isArray(data.items) && data.items.length > 0) {
    return data.items[Math.min(itemIndex, data.items.length - 1)] ?? null;
  }
  return data;
}

function flattenForTable(value: unknown, prefix = ""): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (value == null || typeof value !== "object") {
    if (prefix) row[prefix] = value;
    return row;
  }
  if (Array.isArray(value)) {
    row[prefix || "value"] = JSON.stringify(value);
    return row;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child != null && typeof child === "object" && !Array.isArray(child)) {
      Object.assign(row, flattenForTable(child, path));
    } else {
      row[path] = child;
    }
  }
  return row;
}

function pullTableRows(data: EnrichmentNodePayload | null | undefined): Record<string, unknown>[] {
  if (!data) return [];
  if (Array.isArray(data.items)) {
    return data.items.map((item, index) => ({
      item: index + 1,
      ...flattenForTable(item),
    }));
  }
  return [flattenForTable(data)];
}

function SchemaTreeNode({
  name,
  path,
  value,
  depth,
  t,
  defaultExpanded,
  enableFieldDrag,
}: {
  name: string;
  path: string;
  value: unknown;
  depth: number;
  t: Tokens;
  defaultExpanded?: boolean;
  enableFieldDrag?: boolean;
}) {
  const kind = typeKind(value);
  const expandable = kind === "object" || kind === "array";
  const [expanded, setExpanded] = useState(defaultExpanded ?? depth < 2);
  const canDrag = Boolean(enableFieldDrag && path && !expandable);

  const entries: { key: string; child: unknown }[] = useMemo(() => {
    if (kind === "object" && value && typeof value === "object") {
      return Object.entries(value as Record<string, unknown>).map(([key, child]) => ({
        key,
        child,
      }));
    }
    if (kind === "array" && Array.isArray(value)) {
      return value.map((child, index) => ({ key: String(index), child }));
    }
    return [];
  }, [kind, value]);

  return (
    <div>
      <button
        type="button"
        draggable={canDrag}
        onDragStart={(event) => {
          if (!canDrag) return;
          setFieldPathDragData(event, path);
        }}
        onClick={() => expandable && setExpanded((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          padding: "3px 0",
          paddingLeft: depth * 14,
          border: "none",
          background: "transparent",
          cursor: canDrag ? "grab" : expandable ? "pointer" : "default",
          textAlign: "left",
        }}
        title={canDrag ? `Drag ${path} into Parameters` : path || name}
      >
        <span style={{ width: 12, flexShrink: 0, color: t.textMuted }}>
          {expandable ? (
            expanded ? (
              <ChevronDown size={12} strokeWidth={2} />
            ) : (
              <ChevronRight size={12} strokeWidth={2} />
            )
          ) : canDrag ? (
            <GripVertical size={11} strokeWidth={2} />
          ) : null}
        </span>
        <span
          style={{
            width: 16,
            height: 16,
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 3,
            fontSize: 9,
            fontWeight: 600,
            color: t.textMuted,
            background: t.hoverBg,
          }}
        >
          {typeIcon(kind)}
        </span>
        <span style={{ fontSize: 12, color: t.textPrimary, fontWeight: 500 }}>{name}</span>
        {!expandable && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: t.textMuted,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {formatLeafValue(value)}
          </span>
        )}
        {expandable && (
          <span style={{ marginLeft: 6, fontSize: 10, color: t.textDim }}>
            {Array.isArray(value) ? `${value.length} items` : ""}
          </span>
        )}
      </button>
      {expandable &&
        expanded &&
        entries.map(({ key, child }) => (
          <SchemaTreeNode
            key={`${path}.${key}`}
            name={key}
            path={path ? `${path}.${key}` : key}
            value={child}
            depth={depth + 1}
            t={t}
            enableFieldDrag={enableFieldDrag}
          />
        ))}
    </div>
  );
}

function SchemaTreeView({
  value,
  t,
  enableFieldDrag,
}: {
  value: unknown;
  t: Tokens;
  enableFieldDrag?: boolean;
}) {
  if (value == null) {
    return <p style={{ margin: 0, fontSize: 11, color: t.textMuted }}>No schema fields</p>;
  }
  if (typeof value !== "object") {
    return (
      <SchemaTreeNode
        name="value"
        path="value"
        value={value}
        depth={0}
        t={t}
        defaultExpanded
        enableFieldDrag={enableFieldDrag}
      />
    );
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) {
    return <p style={{ margin: 0, fontSize: 11, color: t.textMuted }}>Empty object</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {enableFieldDrag && (
        <p style={{ margin: "0 0 8px", fontSize: 10, color: t.textMuted, lineHeight: 1.4 }}>
          Drag a field into Parameters to bind its path.
        </p>
      )}
      {entries.map(([key, child]) => (
        <SchemaTreeNode
          key={key}
          name={key}
          path={key}
          value={child}
          depth={0}
          t={t}
          defaultExpanded
          enableFieldDrag={enableFieldDrag}
        />
      ))}
    </div>
  );
}

/** Tower DNA: Schema · Table · JSON over { items, itemCount, pulledAt }. */
export function NodeDataPane({
  title,
  emptyHint,
  data,
  t,
  showRunChrome = false,
  enableFieldDrag = false,
  sourceOptions,
  selectedSourceId,
  onSelectSource,
}: NodeDataPaneProps) {
  const [mode, setMode] = useState<DataViewMode>("schema");
  const [itemIndex, setItemIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const itemCount = useMemo(() => countItems(data), [data]);
  const viewRoot = useMemo(() => resolveViewRoot(data ?? null, itemIndex), [data, itemIndex]);
  const rows = useMemo(() => pullTableRows(data ?? null), [data]);
  const columns = useMemo(() => {
    const keys = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) keys.add(key);
    }
    return [...keys];
  }, [rows]);

  const filteredJson = useMemo(() => {
    if (!search.trim()) return viewRoot;
    const q = search.trim().toLowerCase();
    const text = JSON.stringify(viewRoot, null, 2).toLowerCase();
    return text.includes(q) ? viewRoot : null;
  }, [viewRoot, search]);

  const modes: { id: DataViewMode; label: string }[] = [
    { id: "schema", label: "Schema" },
    { id: "table", label: "Table" },
    { id: "json", label: "JSON" },
  ];

  const runLabel =
    itemCount > 0
      ? `Run 1 of 1 (${itemCount} item${itemCount === 1 ? "" : "s"})`
      : "Run";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        height: "100%",
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        background: t.bgPrimary,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "10px 12px",
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span
              style={{
                fontSize: DOCS_TREE_LABEL_SIZE,
                fontWeight: 600,
                color: t.textPrimary,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {title}
            </span>
            {showRunChrome && data && (
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: t.textMuted,
                  display: "inline-flex",
                  padding: 4,
                  borderRadius: 4,
                }}
                aria-label="Search output"
              >
                <Search size={13} strokeWidth={2} />
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 2 }}>
            {modes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                style={{
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: mode === item.id ? 600 : 500,
                  cursor: "pointer",
                  background: mode === item.id ? t.hoverBg : "transparent",
                  color: mode === item.id ? t.textPrimary : t.textMuted,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {showRunChrome && data && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <CheckCircle2 size={14} strokeWidth={2} color={t.success} />
            <span style={{ fontSize: 11, color: t.textPrimary, fontWeight: 500 }}>{runLabel}</span>
            {itemCount > 1 && (
              <select
                value={itemIndex}
                onChange={(e) => setItemIndex(Number(e.target.value))}
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  border: `1px solid ${t.border}`,
                  borderRadius: 4,
                  background: t.bgPrimary,
                  color: t.textPrimary,
                  padding: "2px 6px",
                }}
              >
                {Array.from({ length: itemCount }, (_, i) => (
                  <option key={i} value={i}>
                    Item {i + 1}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {sourceOptions && sourceOptions.length > 0 && onSelectSource && (
          <select
            value={selectedSourceId ?? sourceOptions[0]?.id ?? ""}
            onChange={(e) => onSelectSource(e.target.value)}
            style={{
              fontSize: 11,
              border: `1px solid ${t.border}`,
              borderRadius: 4,
              background: t.bgPrimary,
              color: t.textPrimary,
              padding: "4px 6px",
            }}
          >
            {sourceOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
                {opt.role === "ancestor" ? " (ancestor)" : ""}
              </option>
            ))}
          </select>
        )}

        {searchOpen && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter JSON…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              fontSize: 12,
              padding: "6px 8px",
              borderRadius: 6,
              border: `1px solid ${t.border}`,
              background: t.bgPrimary,
              color: t.textPrimary,
            }}
          />
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 12 }}>
        {!data ? (
          <p style={{ margin: 0, fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>{emptyHint}</p>
        ) : mode === "schema" ? (
          <SchemaTreeView value={viewRoot} t={t} enableFieldDrag={enableFieldDrag} />
        ) : mode === "table" ? (
          rows.length === 0 ? (
            <p style={{ margin: 0, fontSize: 11, color: t.textMuted }}>No rows</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  fontSize: 11,
                  width: "100%",
                  color: t.textPrimary,
                }}
              >
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        style={{
                          textAlign: "left",
                          padding: "6px 8px",
                          borderBottom: `1px solid ${t.border}`,
                          color: t.textMuted,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {columns.map((col) => (
                        <td
                          key={col}
                          style={{
                            padding: "6px 8px",
                            borderBottom: `1px solid ${t.borderLight}`,
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={formatLeafValue(row[col])}
                        >
                          {formatLeafValue(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <pre
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: 1.45,
              color: t.textPrimary,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {filteredJson == null
              ? "No match"
              : JSON.stringify(mode === "json" && search.trim() ? filteredJson : data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
