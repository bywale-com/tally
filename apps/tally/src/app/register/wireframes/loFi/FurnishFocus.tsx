/**
 * HolonBoundary wrapper for furniture a Furnish checklist entry planted.
 * Id convention: `${persona}-ct-f-${n}` via furnishFocusId.
 *
 * Always ships a small hit pad so micro targets (dots, locks, chips) stay
 * visible under the docs highlight ring.
 */
import type { CSSProperties, ReactNode } from "react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import {
  furnishFocusId,
  type FurnishPersonaPrefix,
} from "@/app/register/outcomes/personaFurnish";

export type FurnishFocusProps = {
  persona: FurnishPersonaPrefix;
  n: number;
  /** Short label for the live map / hover target. */
  label: string;
  onFocus?: () => void;
  style?: CSSProperties;
  children: ReactNode;
};

const HIT_PAD: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "3px 5px",
  borderRadius: 6,
  verticalAlign: "middle",
  boxSizing: "border-box",
};

export function FurnishFocus({
  persona,
  n,
  label,
  onFocus,
  style,
  children,
}: FurnishFocusProps) {
  return (
    <HolonBoundary
      id={furnishFocusId(persona, n)}
      label={label}
      t={light}
      onFocus={onFocus}
      style={{ ...HIT_PAD, ...style }}
    >
      {children}
    </HolonBoundary>
  );
}
