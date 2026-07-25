import { useState } from "react";
import type { EnrichmentKind } from "../../data/enrichments";
import { HolonBoundary } from "../docs/HolonBoundary";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";

const OPTIONS: {
  kind: EnrichmentKind;
  icon: "checkmark-list" | "people";
  title: string;
  description: string;
}[] = [
  {
    kind: "jobs",
    icon: "checkmark-list",
    title: "Job enrichment",
    description: "Pull, wash, and map postings from job sources into a working list.",
  },
  {
    kind: "companies",
    icon: "people",
    title: "Company enrichment",
    description: "Enrich companies — resolve links and company fields from a list.",
  },
];

type EnrichmentKindPickerProps = {
  t: Tokens;
  onSelect: (kind: EnrichmentKind) => void;
};

/** First screen after “Add enrichment criteria” — pick jobs vs companies. */
export function EnrichmentKindPicker({ t, onSelect }: EnrichmentKindPickerProps) {
  const [hovered, setHovered] = useState<EnrichmentKind | null>(null);

  return (
    <HolonBoundary
      id="enrichment-kind-picker"
      label="Enrichment Type Picker"
      icon="grid-square-2x2"
      order={35}
      t={t}
      style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: t.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
          What kind of enrichment?
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: t.textMuted, lineHeight: 1.4 }}>
          You can change this later.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {OPTIONS.map((opt) => {
          const active = hovered === opt.kind;
          return (
            <button
              key={opt.kind}
              type="button"
              onClick={() => onSelect(opt.kind)}
              onMouseEnter={() => setHovered(opt.kind)}
              onMouseLeave={() => setHovered(null)}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${active ? t.accent : t.border}`,
                background: active ? t.accentBg : t.bgPrimary,
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                boxShadow: active ? `0 0 0 1px ${t.accent}` : "none",
                transition: "border-color 120ms ease, background 120ms ease",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? t.accentBg : t.hoverBg,
                  flexShrink: 0,
                }}
              >
                <NotionIcon name={opt.icon} size={18} color={active ? t.accent : t.textMuted} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: t.textPrimary,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {opt.title}
                </span>
                <span
                  style={{
                    display: "block",
                    marginTop: 6,
                    fontSize: 11.5,
                    color: t.textMuted,
                    lineHeight: 1.4,
                  }}
                >
                  {opt.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </HolonBoundary>
  );
}
