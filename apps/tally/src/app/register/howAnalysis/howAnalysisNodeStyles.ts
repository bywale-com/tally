import type { CSSProperties } from "react";
import { DOCS_TREE_LABEL_SIZE } from "../../components/docs/treeLayout";
import type { Tokens } from "../../components/tokens";
import type { HowNodeKind } from "./types";

export function howAnalysisNodeShell(
  t: Tokens,
  selected: boolean,
  kind: HowNodeKind,
  width = 280,
): CSSProperties {
  return {
    width,
    borderRadius: 0,
    border: `2px solid ${selected ? t.accent : kind === "outcome" ? t.accent : t.textPrimary}`,
    background: t.bgPrimary,
    boxShadow: selected ? `0 0 0 1px ${t.accent}` : undefined,
    overflow: "hidden",
    cursor: "pointer",
  };
}

export function howAnalysisKindPill(t: Tokens, kind: HowNodeKind): CSSProperties {
  const labels: Record<HowNodeKind, { bg: string; color: string }> = {
    outcome: { bg: t.accentBg, color: t.accent },
    answer: { bg: t.hoverBg, color: t.textPrimary },
    leaf: { bg: t.accentBg, color: t.success },
  };
  const tone = labels[kind];
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 6px",
    borderRadius: 0,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    background: tone.bg,
    color: tone.color,
  };
}

export const howAnalysisBodyText = (t: Tokens, kind: HowNodeKind): CSSProperties => ({
  fontSize: kind === "outcome" ? DOCS_TREE_LABEL_SIZE + 1 : DOCS_TREE_LABEL_SIZE,
  fontWeight: kind === "outcome" ? 600 : 500,
  lineHeight: 1.4,
  letterSpacing: "-0.01em",
  color: t.textPrimary,
});

export const howAnalysisHintText = (t: Tokens, color = t.textMuted): CSSProperties => ({
  fontSize: 10,
  fontWeight: 500,
  lineHeight: 1.35,
  color,
});

export const howAnalysisSectionLabel = (t: Tokens): CSSProperties => ({
  margin: "0 0 6px",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: t.textDim,
});

export const howAnalysisSectionBody = (t: Tokens): CSSProperties => ({
  margin: 0,
  fontSize: 13,
  fontWeight: 400,
  lineHeight: 1.55,
  color: t.textPrimary,
});
