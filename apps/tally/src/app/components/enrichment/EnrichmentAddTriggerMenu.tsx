import { Calendar, Hand, Plus, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ENRICHMENT_TRIGGER_OPTIONS,
  type EnrichmentTriggerKind,
} from "../../data/enrichmentWorkflows";
import { DOCS_TREE_LABEL_SIZE } from "../docs/treeLayout";
import type { Tokens } from "../tokens";

const TRIGGER_ICONS: Record<EnrichmentTriggerKind, typeof Zap> = {
  manual: Hand,
  schedule: Calendar,
  source_update: Zap,
};

type EnrichmentAddTriggerMenuProps = {
  t: Tokens;
  onAddTrigger: (triggerKind: EnrichmentTriggerKind) => void;
  label?: string;
  align?: "start" | "center" | "end";
};

/** Tower Automations–style Add trigger popover. */
export function EnrichmentAddTriggerMenu({
  t,
  onAddTrigger,
  label = "Add trigger",
  align = "center",
}: EnrichmentAddTriggerMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      let left = rect.left;
      if (align === "center") left = rect.left + rect.width / 2 - 112;
      if (align === "end") left = rect.right - 224;
      setPos({ top: rect.bottom + 8, left: Math.max(8, left) });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 224,
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 1000,
            padding: 4,
          }}
        >
          {ENRICHMENT_TRIGGER_OPTIONS.map((option) => {
            const Icon = TRIGGER_ICONS[option.triggerKind];
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onAddTrigger(option.triggerKind);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: 6,
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = t.hoverBg;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon size={14} strokeWidth={2} color={t.textMuted} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: DOCS_TREE_LABEL_SIZE,
                      fontWeight: 500,
                      letterSpacing: "-0.01em",
                      color: t.textPrimary,
                    }}
                  >
                    {option.label}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: t.textMuted, marginTop: 1 }}>
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 36,
          padding: "0 16px",
          borderRadius: 6,
          border: `1px solid ${t.border}`,
          background: t.bgPrimary,
          color: t.textPrimary,
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <Plus size={14} strokeWidth={2} />
        {label}
      </button>
      {menu}
    </>
  );
}
