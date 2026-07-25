import type { CSSProperties } from "react";
import type { Tokens } from "../tokens";

export function workflowNodeShell(
  t: Tokens,
  selected: boolean,
  width = 260,
  runStatus?: string,
): CSSProperties {
  return {
    width,
    background: t.cardBg,
    border: `1px solid ${selected ? t.accent : t.border}`,
    borderRadius: 8,
    boxShadow: selected
      ? `0 0 0 1px ${t.accent}`
      : runStatus === "running"
        ? `0 0 0 1px ${t.amber}`
        : "0 1px 2px rgba(0,0,0,0.04)",
    padding: 12,
    fontFamily: "inherit",
    position: "relative",
  };
}

export function workflowPill(t: Tokens): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: t.textMuted,
    marginBottom: 6,
  };
}

export function workflowBodyText(t: Tokens): CSSProperties {
  return {
    fontSize: 13,
    fontWeight: 500,
    color: t.textPrimary,
    letterSpacing: "-0.01em",
    margin: 0,
  };
}

export function workflowHintText(t: Tokens): CSSProperties {
  return {
    fontSize: 11,
    color: t.textMuted,
    margin: "4px 0 0",
    lineHeight: 1.35,
  };
}

export const handleStyle = (t: Tokens): CSSProperties => ({
  width: 8,
  height: 8,
  background: t.accent,
  border: `2px solid ${t.bgPrimary}`,
});
