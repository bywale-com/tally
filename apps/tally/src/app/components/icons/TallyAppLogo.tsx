import type { Tokens } from "../tokens";

/** Minimal wordmark mark for the activity strip. */
export function TallyAppLogo({ size = 16, t }: { size?: number; t: Tokens }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        background: t.accent,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: Math.max(8, size * 0.55),
        fontWeight: 600,
        letterSpacing: "-0.04em",
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      T
    </span>
  );
}
