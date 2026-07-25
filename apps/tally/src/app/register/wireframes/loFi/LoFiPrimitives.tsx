import type { CSSProperties, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeskPalette, usePlantMode } from "./DeskPaletteContext";

export function LoFiButton({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "quiet";
}) {
  const loFi = useDeskPalette();
  const plant = usePlantMode();

  if (plant) {
    const shadcnVariant =
      variant === "primary" ? "default" : variant === "ghost" ? "outline" : "ghost";
    return (
      <Button
        type="button"
        variant={shadcnVariant}
        size={variant === "quiet" ? "sm" : "default"}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </Button>
    );
  }

  const primary = variant === "primary";
  const quiet = variant === "quiet";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: quiet ? "6px 2px" : "8px 14px",
        borderRadius: 4,
        border: primary || quiet ? "none" : `1px solid ${loFi.stroke}`,
        background: primary ? loFi.ink : "transparent",
        color: primary ? loFi.white : loFi.label,
        fontSize: 12,
        fontWeight: quiet ? 500 : 600,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function LoFiField({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const loFi = useDeskPalette();
  const plant = usePlantMode();

  if (plant) {
    return (
      <label className="flex flex-col gap-1.5">
        {label ? (
          <span className="text-muted-foreground text-[11px]">{label}</span>
        ) : null}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      </label>
    );
  }

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: label ? 6 : 0 }}>
      {label ? <span style={{ fontSize: 11, color: loFi.label }}>{label}</span> : null}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          height: 36,
          padding: "0 10px",
          borderRadius: 4,
          border: `1px solid ${loFi.stroke}`,
          background: loFi.white,
          color: loFi.ink,
          fontSize: 13,
          fontFamily: "inherit",
        }}
      />
    </label>
  );
}

export function LoFiBlock({
  width = "100%",
  height = 12,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: CSSProperties;
}) {
  const loFi = useDeskPalette();
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 2,
        background: loFi.block,
        ...style,
      }}
    />
  );
}
