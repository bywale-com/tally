import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Play, Save, Square } from "lucide-react";
import { enrichmentStatusIcon } from "../../data/enrichments";
import type { EnrichmentWorkflow } from "../../data/enrichmentWorkflows";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";

type EnrichmentWorkflowHeaderProps = {
  workflow: EnrichmentWorkflow;
  t: Tokens;
  savedFlash: boolean;
  onRename: (name: string) => void;
  onSave: () => void;
  onLaunch: () => void;
  onStop: () => void;
};

export function EnrichmentWorkflowHeader({
  workflow,
  t,
  savedFlash,
  onRename,
  onSave,
  onLaunch,
  onStop,
}: EnrichmentWorkflowHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(workflow.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const icon = enrichmentStatusIcon(workflow.status, t, true);
  const running = workflow.status === "running";

  useEffect(() => {
    if (!editing) setDraftName(workflow.name);
  }, [workflow.name, editing]);

  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  function commit() {
    setEditing(false);
    onRename(draftName);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDraftName(workflow.name);
      setEditing(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
        <NotionIcon name={icon.name} size={16} color={icon.color} spin={icon.spin} />
        {editing ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            aria-label="Enrichment name"
            style={{
              flex: 1,
              minWidth: 0,
              maxWidth: 420,
              fontSize: 16,
              fontWeight: 600,
              color: t.textPrimary,
              letterSpacing: "-0.02em",
              background: t.bgSecondary,
              border: `1px solid ${t.accent}`,
              borderRadius: 4,
              outline: "none",
              padding: "2px 8px",
              fontFamily: "inherit",
            }}
          />
        ) : (
          <h1
            onClick={() => setEditing(true)}
            title="Click to rename"
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: t.textPrimary,
              cursor: "text",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {workflow.name}
          </h1>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {savedFlash && (
          <span style={{ fontSize: 11, color: t.success, fontWeight: 500 }}>Saved</span>
        )}
        <button type="button" title="Save" onClick={onSave} style={btn(t)}>
          <Save size={14} strokeWidth={2} />
          Save
        </button>
        {running ? (
          <button type="button" title="Stop" onClick={onStop} style={btn(t, true)}>
            <Square size={12} fill="currentColor" />
            Stop
          </button>
        ) : (
          <button type="button" title="Launch" onClick={onLaunch} style={btn(t, true)}>
            <Play size={12} fill="currentColor" />
            Launch
          </button>
        )}
      </div>
    </div>
  );
}

function btn(t: Tokens, primary = false): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 28,
    padding: "0 10px",
    borderRadius: 6,
    border: primary ? "none" : `1px solid ${t.border}`,
    background: primary ? t.accent : t.bgPrimary,
    color: primary ? "#fff" : t.textPrimary,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}
