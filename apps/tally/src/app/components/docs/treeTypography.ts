import type { Tokens } from "../tokens";

export const DOCS_FONT_PROFILE = {
  fontWeight: 500,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
} as const;

export function docsLabelStyle(
  fontSize: number,
  color: string,
  options?: {
    underline?: boolean;
    underlineColor?: string;
    underlineOffset?: number;
    ellipsis?: boolean;
  },
) {
  return {
    ...DOCS_FONT_PROFILE,
    fontSize,
    color,
    whiteSpace: "nowrap" as const,
    ...(options?.ellipsis
      ? { overflow: "hidden" as const, textOverflow: "ellipsis" as const, minWidth: 0 }
      : {}),
    ...(options?.underline
      ? {
          textDecoration: "underline",
          textDecorationColor: options.underlineColor ?? color,
          textDecorationThickness: 1,
          textUnderlineOffset: options.underlineOffset ?? 2,
        }
      : {}),
  };
}

export function docsBranchLabelStyle(fontSize: number, color: string, showUnderline: boolean) {
  return docsLabelStyle(fontSize, color, {
    underline: showUnderline,
    underlineColor: color,
  });
}

export function docsChildLabelStyle(
  fontSize: number,
  color: string,
  t: Tokens,
  underlineOffset?: number,
) {
  return docsLabelStyle(fontSize, color, {
    underline: true,
    underlineColor: t.borderLight,
    underlineOffset,
    ellipsis: true,
  });
}
