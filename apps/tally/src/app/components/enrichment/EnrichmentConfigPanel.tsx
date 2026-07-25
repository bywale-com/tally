import type { Node } from "@xyflow/react";
import type { CSSProperties, ReactNode } from "react";
import {
  emptyEnrollmentCriteria,
  mappedFieldsForNodes,
} from "../../data/enrichmentEnrollment";
import type { EnrichmentNodeData } from "../../data/enrichmentWorkflows";
import type { Tokens } from "../tokens";
import { FieldPathDropInput } from "./FieldPathDropInput";

type BodyProps = {
  node: Node<EnrichmentNodeData>;
  triggerData?: EnrichmentNodeData;
  t: Tokens;
  onChange: (data: EnrichmentNodeData) => void;
};

/** Parameters column body (Tower middle pane) for non-trigger nodes. */
export function EnrichmentConfigPanelBody({ node, triggerData, t, onChange }: BodyProps) {
  const data = node.data;
  const enrollment = triggerData?.enrollmentCriteria ?? emptyEnrollmentCriteria();
  const fields = mappedFieldsForNodes(enrollment);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Label" t={t}>
        <input
          value={data.label}
          onChange={(e) => onChange({ ...data, label: e.target.value, configured: true })}
          style={inputStyle(t)}
        />
      </Field>

      {node.type === "constant" && (
        <Field label="Value" t={t}>
          <input
            value={data.constantValue ?? ""}
            onChange={(e) =>
              onChange({
                ...data,
                constantValue: e.target.value,
                constantSummary: e.target.value,
                configured: true,
              })
            }
            style={inputStyle(t)}
          />
        </Field>
      )}

        {node.type === "condition" && (
          <>
            <Field label="Field path" t={t}>
              <FieldPathDropInput
                value={data.fieldPath ?? ""}
                onChange={(path) =>
                  onChange({
                    ...data,
                    fieldPath: path,
                    conditionSummary: `${path} ${data.fieldOp ?? "exists"}`,
                    configured: true,
                  })
                }
                t={t}
                placeholder="Drop from Input or type path…"
              />
              {fields.length === 0 && (
                <p style={{ margin: "6px 0 0", fontSize: 11, color: t.textDim }}>
                  Run the upstream node first, then drag a field from Input.
                </p>
              )}
            </Field>
          <Field label="Operator" t={t}>
            <select
              value={data.fieldOp ?? "exists"}
              onChange={(e) =>
                onChange({
                  ...data,
                  fieldOp: e.target.value as EnrichmentNodeData["fieldOp"],
                  conditionSummary: `${data.fieldPath ?? "field"} ${e.target.value}`,
                  configured: true,
                })
              }
              style={inputStyle(t)}
            >
              <option value="exists">exists</option>
              <option value="contains">contains</option>
              <option value="eq">equals</option>
              <option value="gte">≥</option>
              <option value="lte">≤</option>
            </select>
          </Field>
          <Field label="Value" t={t}>
            <input
              value={data.fieldValue ?? ""}
              onChange={(e) =>
                onChange({ ...data, fieldValue: e.target.value, configured: true })
              }
              style={inputStyle(t)}
            />
          </Field>
        </>
      )}

      {node.type !== "constant" && node.type !== "condition" && (
        <p style={{ margin: 0, fontSize: 12, color: t.textMuted, lineHeight: 1.45 }}>
          Parameters for this node type land next. Upstream Input fields will bind here.
        </p>
      )}
    </div>
  );
}

/** @deprecated Prefer EnrichmentNodeConfigModal — kept for reference. */
export function EnrichmentConfigPanel({
  node,
  triggerData,
  t,
  onClose,
  onChange,
}: BodyProps & { onClose: () => void }) {
  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        height: "100%",
        borderLeft: `1px solid ${t.border}`,
        background: t.bgPrimary,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: t.textPrimary }}>Configure</span>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: t.textMuted,
            fontSize: 12,
          }}
        >
          Done
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        <EnrichmentConfigPanelBody
          node={node}
          triggerData={triggerData}
          t={t}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function Field({
  label,
  t,
  children,
}: {
  label: string;
  t: Tokens;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: t.textMuted }}>{label}</span>
      {children}
    </label>
  );
}

function inputStyle(t: Tokens): CSSProperties {
  return {
    width: "100%",
    padding: "7px 9px",
    border: `1px solid ${t.border}`,
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "inherit",
    color: t.textPrimary,
    background: t.bgPrimary,
    outline: "none",
  };
}
