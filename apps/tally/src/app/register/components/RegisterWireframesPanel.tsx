import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";
import type { Tokens } from "../../components/tokens";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import {
  changelogEntries,
  currentRevision,
  currentStepRevision,
  getLineagesForGraph,
  lineageForHowNode,
  type WireframeChangelogEntry,
  type WireframeStepLineage,
  type WireframeStripLineage,
  type WireframeStripRevision,
} from "../wireframes/wireframesRegistry";

type RegisterWireframesPanelProps = {
  graphId: string;
  graphLabel: string;
  t: Tokens;
};

function VersionScrubber({
  versions,
  selected,
  onSelect,
  t,
}: {
  versions: number[];
  selected: number;
  onSelect: (v: number) => void;
  t: Tokens;
}) {
  if (versions.length <= 1) {
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.04em",
          padding: "2px 7px",
          borderRadius: 999,
          border: `1px solid ${t.accent}`,
          color: t.accent,
          background: t.hoverBg,
        }}
      >
        v{selected}
      </span>
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Version"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: 2,
        borderRadius: 8,
        border: `1px solid ${t.border}`,
        background: t.bgPrimary,
      }}
    >
      {versions.map((v) => {
        const on = v === selected;
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(v)}
            style={{
              minWidth: 28,
              height: 22,
              padding: "0 8px",
              borderRadius: 6,
              border: "none",
              background: on ? t.hoverBg : "transparent",
              color: on ? t.accent : t.textMuted,
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            v{v}
          </button>
        );
      })}
    </div>
  );
}

function WhyInfoButton({
  why,
  changedAt,
  title,
  meta,
  t,
  onOpenChange,
}: {
  why: string;
  changedAt?: string;
  title: string;
  meta?: string;
  t: Tokens;
  onOpenChange?: (open: boolean) => void;
}) {
  const POPOVER_W = 300;
  const POPOVER_MAX_H = 280;
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    placeAbove: false,
    anchorBottom: 0,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function setOpenAndNotify(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const placeAbove = spaceBelow < 160 && spaceAbove > spaceBelow;
      let left = rect.right - POPOVER_W;
      left = Math.min(Math.max(8, left), window.innerWidth - POPOVER_W - 8);
      setPos({
        top: placeAbove ? 0 : rect.bottom + 8,
        left,
        placeAbove,
        anchorBottom: placeAbove ? window.innerHeight - rect.top + 8 : 0,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpenAndNotify(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenAndNotify(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label={`Why ${title}`}
          style={{
            position: "fixed",
            top: pos.placeAbove ? undefined : pos.top,
            bottom: pos.placeAbove ? pos.anchorBottom : undefined,
            left: pos.left,
            zIndex: 1100,
            width: POPOVER_W,
            maxHeight: POPOVER_MAX_H,
            display: "flex",
            flexDirection: "column",
            borderRadius: 10,
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: t.textDim,
                }}
              >
                Why this version
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginTop: 2 }}>
                {title}
              </div>
              {meta ? (
                <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{meta}</div>
              ) : null}
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpenAndNotify(false)}
              style={{
                border: "none",
                background: "transparent",
                color: t.textMuted,
                cursor: "pointer",
                padding: 2,
                display: "inline-flex",
              }}
            >
              <X size={14} strokeWidth={1.75} />
            </button>
          </div>
          <div
            style={{
              padding: "10px 12px 12px",
              fontSize: 12,
              lineHeight: 1.45,
              color: t.textPrimary,
              overflowY: "auto",
            }}
          >
            {why}
            {changedAt ? (
              <div style={{ marginTop: 8, fontSize: 11, color: t.textDim }}>{changedAt}</div>
            ) : null}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label={`Why ${title}`}
        title="Why this version"
        onClick={() => setOpenAndNotify(!open)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: 6,
          border: "1px solid transparent",
          background: "transparent",
          color: t.textMuted,
          cursor: "pointer",
          padding: 0,
        }}
      >
        <Info size={14} strokeWidth={1.75} />
      </button>
      {panel}
    </>
  );
}

function StepHotspot({
  step,
  t,
}: {
  step: WireframeStepLineage;
  t: Tokens;
}) {
  const current = currentStepRevision(step);
  const [version, setVersion] = useState(current.version);
  const [hovered, setHovered] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const rev = step.revisions.find((r) => r.version === version) ?? current;
  const region = step.region;
  const hasVersions = step.revisions.length > 1;

  useEffect(() => {
    setVersion(current.version);
  }, [step.stepId, current.version]);

  // Only versioned steps get a hotspot marker
  if (!region || !hasVersions) return null;

  const expanded = hovered || whyOpen;
  const whyMeta =
    rev.status === "current"
      ? rev.surface === "click-through"
        ? "Current · living in click-through"
        : "Current"
      : "Archived";

  return (
    <div
      style={{
        position: "absolute",
        left: `${region.x}%`,
        top: `${region.y}%`,
        width: `${region.w}%`,
        height: `${region.h}%`,
        boxSizing: "border-box",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {rev.src ? (
        <img
          src={rev.src}
          alt={`${step.label} v${rev.version}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "fill",
            borderRadius: 8,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ) : null}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "absolute",
          top: 6,
          right: 6,
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          pointerEvents: "auto",
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: expanded ? "0 8px 8px 0" : 8,
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            flexShrink: 0,
          }}
          title="Versioned step — hover for history"
        >
          <WhyInfoButton
            why={rev.why}
            changedAt={rev.changedAt}
            title={`${step.label} v${rev.version}`}
            meta={whyMeta}
            t={t}
            onOpenChange={setWhyOpen}
          />
        </div>
        {expanded ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 28,
              boxSizing: "border-box",
              background: t.bgPrimary,
              borderRadius: "8px 0 0 8px",
              border: `1px solid ${t.border}`,
              borderRight: "none",
              padding: "0 6px 0 8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: t.textPrimary }}>
              {step.label}
            </span>
            <VersionScrubber
              versions={step.revisions.map((r) => r.version)}
              selected={rev.version}
              onSelect={setVersion}
              t={t}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StripLineageCard({
  lineage,
  active,
  t,
}: {
  lineage: WireframeStripLineage;
  active: boolean;
  t: Tokens;
}) {
  const ref = useRef<HTMLElement>(null);
  const current = currentRevision(lineage);
  const [version, setVersion] = useState(current.version);
  const rev: WireframeStripRevision =
    lineage.revisions.find((r) => r.version === version) ?? current;

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [active]);

  useEffect(() => {
    setVersion(current.version);
  }, [lineage.roleId, current.version]);

  const whyTitle = `${lineage.label} v${rev.version}`;
  const whyMeta = [
    rev.status === "current" ? "Current strip" : "Archived strip",
    rev.supersedes ? `supersedes ${rev.supersedes}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const stepsWithVersions = (rev.steps ?? []).filter((s) => s.revisions.length > 0);

  return (
    <section
      ref={ref}
      style={{
        marginBottom: 20,
        borderRadius: 8,
        border: `1px solid ${active ? t.accent : t.border}`,
        background: t.bgPrimary,
        boxShadow: active ? `0 0 0 1px ${t.accent}` : undefined,
      }}
    >
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
          borderRadius: "8px 8px 0 0",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>{lineage.label}</span>
        <span style={{ fontSize: 11, color: t.textDim, letterSpacing: "0.04em" }}>{lineage.when}</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <VersionScrubber
            versions={lineage.revisions.map((r) => r.version)}
            selected={rev.version}
            onSelect={setVersion}
            t={t}
          />
          {rev.why ? (
            <WhyInfoButton
              why={rev.why}
              changedAt={rev.changedAt}
              title={whyTitle}
              meta={whyMeta}
              t={t}
            />
          ) : null}
        </div>
      </header>

      <div style={{ padding: "12px 12px 12px", overflowX: "auto" }}>
        <div style={{ position: "relative", display: "inline-block", minWidth: 480, width: "100%" }}>
          <img
            src={rev.src}
            alt={`${lineage.label} v${rev.version} lo-fi wireframe`}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />
          {stepsWithVersions.map((step) => (
            <StepHotspot key={step.stepId} step={step} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HistoryModal({
  entries,
  onClose,
  t,
}: {
  entries: WireframeChangelogEntry[];
  onClose: () => void;
  t: Tokens;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Wireframe changelog"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.35)",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          maxHeight: "min(640px, 90%)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 12,
          border: `1px solid ${t.border}`,
          background: t.bgPrimary,
          boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "12px 16px",
            borderBottom: `1px solid ${t.border}`,
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>Changelog</div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>
              Strip + step revisions · newest first
            </div>
          </div>
          <button
            type="button"
            aria-label="Close changelog"
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid transparent",
              background: "transparent",
              color: t.textMuted,
              cursor: "pointer",
            }}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </header>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {entries.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: t.textDim }}>No logged revisions yet.</div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${t.border}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary }}>
                    {entry.kind === "step"
                      ? `${entry.roleLabel} · ${entry.stepLabel}`
                      : entry.roleLabel}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: entry.status === "current" ? t.accent : t.textDim,
                    }}
                  >
                    v{entry.version}
                    {entry.kind === "step" ? " · step" : " · strip"}
                    {entry.status === "current" ? " · current" : ""}
                  </span>
                  <span style={{ fontSize: 11, color: t.textDim, marginLeft: "auto" }}>
                    {entry.changedAt}
                  </span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: t.textMuted }}>{entry.why}</div>
                {entry.surface === "click-through" ? (
                  <div style={{ marginTop: 6, fontSize: 11, color: t.textDim }}>
                    Living in click-through (strip SVG not redrawn)
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** Lo-fi screen strips for a How graph — spatial component flow, not Mermaid. */
export function RegisterWireframesPanel({ graphId, graphLabel, t }: RegisterWireframesPanelProps) {
  const { selectedHowNodeId } = useRegisterSelection();
  const lineages = getLineagesForGraph(graphId);
  const active = lineageForHowNode(lineages, selectedHowNodeId);
  const [historyOpen, setHistoryOpen] = useState(false);
  const log = changelogEntries(lineages);

  if (lineages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: t.textDim,
          fontSize: 13,
          padding: 24,
          textAlign: "center",
        }}
      >
        No wireframe strips for this outcome yet. Operator Core has the first set.
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: t.hoverBg,
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
            Wireframes · {graphLabel}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: t.textMuted }}>
            Scrub versions on each strip · i for why · steps version inside the stage
          </div>
        </div>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          style={{
            height: 28,
            padding: "0 10px",
            borderRadius: 6,
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            color: t.textPrimary,
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "inherit",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Changelog
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 32px" }}>
        {[...lineages]
          .sort((a, b) => a.order - b.order)
          .map((lineage) => (
            <StripLineageCard
              key={lineage.roleId}
              lineage={lineage}
              active={active?.roleId === lineage.roleId}
              t={t}
            />
          ))}
      </div>
      {historyOpen ? (
        <HistoryModal entries={log} onClose={() => setHistoryOpen(false)} t={t} />
      ) : null}
    </div>
  );
}
