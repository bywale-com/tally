import { Calendar, ChevronRight, GripVertical, Hand, Zap } from "lucide-react";
import { useState, type CSSProperties } from "react";
import {
  ENRICHMENT_BUILD_MODULES,
  ENRICHMENT_BUILD_MODULE_HINTS,
  ENRICHMENT_BUILD_MODULE_LABELS,
  paletteBlockIcon,
  paletteBlocksByModule,
} from "../../data/enrichmentBuildModules";
import {
  ENRICHMENT_PALETTE_BLOCKS,
  ENRICHMENT_TRIGGER_OPTIONS,
  type PaletteBlock,
  type EnrichmentTriggerKind,
} from "../../data/enrichmentWorkflows";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";

const blocksByModule = paletteBlocksByModule(ENRICHMENT_PALETTE_BLOCKS);

type EnrichmentBuildPaletteProps = {
  t: Tokens;
  hasTrigger: boolean;
  onAddBlock: (block: PaletteBlock) => void;
  onAddTrigger: (kind: EnrichmentTriggerKind) => void;
};

export function EnrichmentBuildPalette({
  t,
  hasTrigger,
  onAddBlock,
  onAddTrigger,
}: EnrichmentBuildPaletteProps) {
  const [openModule, setOpenModule] = useState<string | null>(hasTrigger ? "constants" : null);
  const [triggersOpen, setTriggersOpen] = useState(!hasTrigger);

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        height: "100%",
        borderRight: `1px solid ${t.border}`,
        background: t.bgPrimary,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: `1px solid ${t.border}`,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: t.textDim,
        }}
      >
        Build
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 6 }}>
        <SectionHeader
          label="Triggers"
          open={triggersOpen}
          onToggle={() => setTriggersOpen((v) => !v)}
          t={t}
          disabled={hasTrigger}
          hint={hasTrigger ? "One trigger per enrichment" : "Start here"}
        />
        {triggersOpen &&
          ENRICHMENT_TRIGGER_OPTIONS.map((opt) => {
            const Icon =
              opt.triggerKind === "schedule"
                ? Calendar
                : opt.triggerKind === "manual"
                  ? Hand
                  : Zap;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={hasTrigger}
                onClick={() => onAddTrigger(opt.triggerKind)}
                style={rowStyle(t, hasTrigger)}
              >
                <GripVertical size={12} color={t.textDim} />
                <Icon size={14} strokeWidth={2} color={t.textMuted} />
                <span style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                  <span style={labelStyle(t)}>{opt.label}</span>
                  <span style={hintStyle(t)}>{opt.description}</span>
                </span>
              </button>
            );
          })}

        {ENRICHMENT_BUILD_MODULES.map((mod) => {
          const open = openModule === mod;
          const blocks = blocksByModule[mod];
          return (
            <div key={mod}>
              <SectionHeader
                label={ENRICHMENT_BUILD_MODULE_LABELS[mod]}
                open={open}
                onToggle={() => setOpenModule(open ? null : mod)}
                t={t}
                hint={ENRICHMENT_BUILD_MODULE_HINTS[mod]}
              />
              {open &&
                blocks.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => onAddBlock(block)}
                    style={rowStyle(t, false)}
                  >
                    <GripVertical size={12} color={t.textDim} />
                    <NotionIcon
                      name={paletteBlockIcon(block)}
                      size={14}
                      color={t.textMuted}
                    />
                    <span style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                      <span style={labelStyle(t)}>{block.label}</span>
                      <span style={hintStyle(t)}>{block.description}</span>
                    </span>
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({
  label,
  open,
  onToggle,
  t,
  hint,
  disabled,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  t: Tokens;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={hint}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 8px 4px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: disabled ? t.textDim : t.textMuted,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      <ChevronRight
        size={12}
        style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.12s" }}
      />
      {label}
    </button>
  );
}

function rowStyle(_t: Tokens, disabled: boolean): CSSProperties {
  return {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px",
    border: "none",
    borderRadius: 4,
    background: "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    textAlign: "left",
  };
}

function labelStyle(t: Tokens): CSSProperties {
  return {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    color: t.textPrimary,
  };
}

function hintStyle(t: Tokens): CSSProperties {
  return {
    display: "block",
    fontSize: 11,
    color: t.textMuted,
    marginTop: 1,
    lineHeight: 1.3,
  };
}
