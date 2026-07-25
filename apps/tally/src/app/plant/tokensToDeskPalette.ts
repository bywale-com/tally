import type { Tokens } from "@/app/components/tokens";
import type { DeskPalette } from "@/app/register/wireframes/loFi/loFiPalette";

function isDarkTokens(t: Tokens): boolean {
  // Pure / near-black primary → dark ladder
  const c = t.bgPrimary.trim().toLowerCase();
  return c === "#000" || c === "#000000" || c === "#0a0a0a";
}

/** Map product tokens onto the desk palette shape used by approved CT structure. */
export function tokensToDeskPalette(t: Tokens): DeskPalette {
  const dark = isDarkTokens(t);
  return {
    canvas: t.bgSecondary,
    frame: t.bgPrimary,
    chrome: t.bgTertiary || t.bgSecondary,
    block: t.hoverBg,
    stroke: t.border,
    ink: t.textPrimary,
    label: t.textMuted,
    muted: t.textDim,
    white: t.cardBg || t.bgPrimary,
    sidebar: t.bgSecondary,
    scrim: dark ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.15)",
    note: t.amberBg,
    noteBorder: t.amber,
    sidebarW: 240,
    sidebarCollapsedW: 48,
  };
}
