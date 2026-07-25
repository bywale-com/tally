import { useEffect, useRef, useState } from "react";
import type { Tokens } from "./tokens";

type NameListDialogProps = {
  t: Tokens;
  title?: string;
  initialName: string;
  confirmLabel?: string;
  hint?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

/** Modal to name a list before creating it. */
export function NameListDialog({
  t,
  title = "Name this list",
  initialName,
  confirmLabel = "Create list",
  hint,
  onConfirm,
  onCancel,
}: NameListDialogProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  }

  return (
    <div
      role="presentation"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(400px, 92vw)",
          background: t.bgPrimary,
          border: `1px solid ${t.border}`,
          borderRadius: 10,
          padding: 18,
          boxShadow: "0 16px 48px rgba(0,0,0,0.28)",
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 14,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </p>
        {hint && (
          <p style={{ margin: "0 0 12px", fontSize: 12, color: t.textMuted, lineHeight: 1.4 }}>
            {hint}
          </p>
        )}
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") onCancel();
          }}
          placeholder="List name"
          style={{
            width: "100%",
            height: 32,
            fontSize: 13,
            color: t.textPrimary,
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            padding: "0 10px",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 14,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: 28,
              padding: "0 12px",
              fontSize: 12,
              borderRadius: 5,
              border: `1px solid ${t.border}`,
              background: "transparent",
              color: t.textMuted,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            style={{
              height: 28,
              padding: "0 12px",
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 5,
              border: "none",
              background: name.trim() ? t.accent : t.hoverBg,
              color: name.trim() ? "#fff" : t.textDim,
              cursor: name.trim() ? "pointer" : "not-allowed",
              fontFamily: "inherit",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
