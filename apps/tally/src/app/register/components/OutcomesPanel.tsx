import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Info, X } from "lucide-react";
import type { Tokens } from "../../components/tokens";
import { useDocsHighlight } from "../../context/DocsHighlightContext";
import { useDocsRegistry } from "../../context/DocsRegistryContext";
import { useRegisterCanvas } from "../context/RegisterCanvasContext";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { BUSINESS_CLIENT_FURNISH } from "../outcomes/businessClientFurnish";
import { BUSINESS_CLIENT_OBSTACLES } from "../outcomes/businessClientObstacles";
import { GUEST_FURNISH } from "../outcomes/guestFurnish";
import { NON_BUSINESS_CLIENT_OBSTACLES } from "../outcomes/nonBusinessClientObstacles";
import { OPERATOR_FURNISH } from "../outcomes/operatorFurnish";
import { OPERATOR_OBSTACLES } from "../outcomes/operatorObstacles";
import type { OutcomeEntityId } from "../outcomes/outcomesRegistry";
import {
  OUTCOME_ENTITIES,
  type OutcomeEntity,
  type OutcomeStub,
} from "../outcomes/outcomesRegistry";
import type { FurnishNarrativePart, PersonaFurnishItem } from "../outcomes/personaFurnish";
import type { ObstacleHowPart, PersonaObstacle } from "../outcomes/personaObstacle";
import { WORKER_FURNISH } from "../outcomes/workerFurnish";
import { WORKER_OBSTACLES } from "../outcomes/workerObstacles";

type OutcomesPanelProps = {
  t: Tokens;
};

const OBSTACLES_BY_ENTITY: Partial<Record<OutcomeEntityId, PersonaObstacle[]>> = {
  "tally-operator": OPERATOR_OBSTACLES,
  "non-business-client": NON_BUSINESS_CLIENT_OBSTACLES,
  "tally-business-client": BUSINESS_CLIENT_OBSTACLES,
  "tally-worker": WORKER_OBSTACLES,
};

const FURNISH_BY_ENTITY: Partial<Record<OutcomeEntityId, PersonaFurnishItem[]>> = {
  "tally-operator": OPERATOR_FURNISH,
  "non-business-client": GUEST_FURNISH,
  "tally-business-client": BUSINESS_CLIENT_FURNISH,
  "tally-worker": WORKER_FURNISH,
};

function outcomeTitle(outcome: OutcomeStub): string {
  return outcome.label;
}

function useTaxonomyHover(holonIds: string[] | undefined) {
  const { setHoveredComponentIds } = useDocsHighlight();
  const { ensureClickThrough } = useRegisterCanvas();
  return {
    onEnter: () => {
      const ids = holonIds?.filter(Boolean) ?? [];
      if (ids.length === 0) return;
      ensureClickThrough();
      setHoveredComponentIds(ids);
    },
    onLeave: () => setHoveredComponentIds([]),
  };
}

function useRevealHolon(howGraphId?: string) {
  const { ensureClickThrough } = useRegisterCanvas();
  const { selectHowGraph } = useRegisterSelection();
  const { focusHolon } = useDocsRegistry();
  const { setHoveredComponentIds } = useDocsHighlight();
  return (holonId: string) => {
    ensureClickThrough();
    if (howGraphId) selectHowGraph(howGraphId);
    focusHolon(holonId);
    setHoveredComponentIds([holonId]);
  };
}

function TaxonomyStatement({
  parts,
  t,
  howGraphId,
  compact,
}: {
  parts: Array<FurnishNarrativePart | ObstacleHowPart>;
  t: Tokens;
  howGraphId?: string;
  compact?: boolean;
}) {
  const reveal = useRevealHolon(howGraphId);
  return (
    <p
      style={{
        margin: 0,
        fontSize: compact ? 11 : 12,
        lineHeight: 1.45,
        color: t.textPrimary,
      }}
    >
      {parts.map((part, i) =>
        part.holonId ? (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reveal(part.holonId!);
            }}
            style={{
              display: "inline",
              margin: 0,
              padding: 0,
              border: "none",
              background: "transparent",
              color: t.accent,
              font: "inherit",
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: 2,
              cursor: "pointer",
            }}
          >
            {part.text}
          </button>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </p>
  );
}

function FurnishStatement({
  parts,
  t,
  howGraphId,
  compact,
}: {
  parts: FurnishNarrativePart[];
  t: Tokens;
  howGraphId?: string;
  compact?: boolean;
}) {
  return (
    <TaxonomyStatement parts={parts} t={t} howGraphId={howGraphId} compact={compact} />
  );
}

/** Strip-shaped (i) — how they can do this now (or intended path if open). */
function ObstacleHowInfo({
  obstacle,
  t,
  howGraphId,
}: {
  obstacle: PersonaObstacle;
  t: Tokens;
  howGraphId?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const width = 280;
    let left = r.right - width;
    if (left < 8) left = 8;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    setPos({ top: r.bottom + 6, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const meta =
    obstacle.status === "done" ? "Done · click-through" : "Open · obstacle";
  const parts = obstacle.howParts;

  const panel = open
    ? createPortal(
        <div
          role="dialog"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 280,
            maxHeight: 320,
            zIndex: 10050,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
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
                How
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginTop: 2 }}>
                #{obstacle.rank}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{meta}</div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
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
            {parts && parts.length > 0 ? (
              <TaxonomyStatement parts={parts} t={t} howGraphId={howGraphId} />
            ) : obstacle.how ? (
              <p style={{ margin: 0 }}>{obstacle.how}</p>
            ) : (
              <p style={{ margin: 0, color: t.textDim }}>No how path yet.</p>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `1px solid ${t.border}`,
          background: t.bgPrimary,
          flexShrink: 0,
        }}
        title="How"
      >
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-label={`How for obstacle ${obstacle.rank}`}
          title="How"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 6,
            border: "none",
            background: "transparent",
            color: t.textMuted,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Info size={12} strokeWidth={1.75} />
        </button>
      </div>
      {panel}
    </>
  );
}

function FurnishSurfacesInfo({
  item,
  t,
  howGraphId,
}: {
  item: PersonaFurnishItem;
  t: Tokens;
  howGraphId?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const width = 300;
    let left = r.right - width;
    if (left < 8) left = 8;
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
    setPos({ top: r.bottom + 6, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const meta = item.status === "planted" ? "Planted · click-through" : "Deferred";
  const parts = item.narrativeParts;

  const panel = open
    ? createPortal(
        <div
          role="dialog"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 300,
            maxHeight: 360,
            zIndex: 10050,
            borderRadius: 8,
            border: `1px solid ${t.border}`,
            background: t.bgPrimary,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            display: "flex",
            flexDirection: "column",
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
                Surfaces
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginTop: 2 }}>
                #{item.n}
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{meta}</div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
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
            <div style={{ marginBottom: 8, color: t.textMuted }}>{item.section}</div>
            {parts && parts.length > 0 ? (
              <div style={{ marginBottom: 10 }}>
                <FurnishStatement parts={parts} t={t} howGraphId={howGraphId} />
              </div>
            ) : item.narrative ? (
              <p style={{ margin: "0 0 10px", color: t.textPrimary }}>{item.narrative}</p>
            ) : null}
            {item.surfaces.length === 0 ? (
              <div style={{ color: t.textDim }}>No surfaces mapped yet.</div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: t.textDim,
                    marginBottom: 6,
                  }}
                >
                  Modules
                </div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {item.surfaces.map((s) => (
                    <li key={s} style={{ marginBottom: 4 }}>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `1px solid ${t.border}`,
          background: t.bgPrimary,
          flexShrink: 0,
        }}
        title="Surfaces"
      >
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-label={`Surfaces for furnish ${item.n}`}
          title="Surfaces"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 6,
            border: "none",
            background: "transparent",
            color: t.textMuted,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Info size={12} strokeWidth={1.75} />
        </button>
      </div>
      {panel}
    </>
  );
}

function PersonaFurnish({
  items,
  t,
  howGraphId,
}: {
  items: PersonaFurnishItem[];
  t: Tokens;
  howGraphId?: string;
}) {
  const [open, setOpen] = useState(false);
  const planted = items.filter((i) => i.status === "planted").length;

  if (items.length === 0) return null;

  return (
    <div style={{ marginTop: 2 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px 5px 18px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: t.textMuted,
          fontSize: 12,
          fontWeight: 500,
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <ChevronDown
          size={12}
          color={t.textDim}
          strokeWidth={1.75}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.12s ease",
          }}
        />
        <span style={{ flex: 1 }}>Furnish</span>
        <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>
          {planted}/{items.length}
        </span>
      </button>

      {open ? (
        <div style={{ display: "flex", flexDirection: "column", paddingBottom: 6 }}>
          {items.map((item, i) => {
            const showSection = i === 0 || items[i - 1]?.section !== item.section;
            return (
              <div key={item.id}>
                {showSection ? (
                  <div
                    style={{
                      padding: "8px 10px 2px 28px",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                      color: t.textDim,
                    }}
                  >
                    {item.section}
                  </div>
                ) : null}
                <FurnishRow item={item} t={t} howGraphId={howGraphId} />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function FurnishRow({
  item,
  t,
  howGraphId,
}: {
  item: PersonaFurnishItem;
  t: Tokens;
  howGraphId?: string;
}) {
  const hoverIds = item.focusHolonId ? [item.focusHolonId] : undefined;
  const hover = useTaxonomyHover(hoverIds);
  const hasFocus = Boolean(item.focusHolonId);

  return (
    <div
      onMouseEnter={hover.onEnter}
      onMouseLeave={hover.onLeave}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        padding: "6px 10px 6px 28px",
        borderLeft: `2px solid ${item.status === "planted" ? t.accent : "transparent"}`,
        cursor: hasFocus ? "crosshair" : "default",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 600,
          color: t.textDim,
          width: 22,
          paddingTop: 2,
        }}
      >
        {item.n}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            lineHeight: 1.4,
            color: item.status === "planted" ? t.textPrimary : t.textMuted,
            fontWeight: item.status === "planted" ? 500 : 400,
          }}
        >
          {item.label}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 10,
            fontWeight: 500,
            color: item.status === "planted" ? t.accent : t.textDim,
          }}
        >
          {item.status === "planted" ? "Planted" : "Deferred"}
          {item.surfaces.length > 0
            ? ` · ${item.surfaces.length} surface${item.surfaces.length === 1 ? "" : "s"}`
            : ""}
        </div>
      </div>
      <FurnishSurfacesInfo item={item} t={t} howGraphId={howGraphId} />
    </div>
  );
}

function PersonaCants({
  obstacles,
  t,
  howGraphId,
}: {
  obstacles: PersonaObstacle[];
  t: Tokens;
  howGraphId?: string;
}) {
  const [open, setOpen] = useState(false);
  const doneCount = obstacles.filter((o) => o.status === "done").length;

  return (
    <div style={{ marginTop: 2 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px 5px 18px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: t.textMuted,
          fontSize: 12,
          fontWeight: 500,
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <ChevronDown
          size={12}
          color={t.textDim}
          strokeWidth={1.75}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.12s ease",
          }}
        />
        <span style={{ flex: 1 }}>Can&apos;ts</span>
        <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>
          {doneCount}/{obstacles.length}
        </span>
      </button>

      {open ? (
        <div style={{ display: "flex", flexDirection: "column", paddingBottom: 6 }}>
          {obstacles.map((o) => (
            <CantRow key={o.id} obstacle={o} t={t} howGraphId={howGraphId} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CantRow({
  obstacle: o,
  t,
  howGraphId,
}: {
  obstacle: PersonaObstacle;
  t: Tokens;
  howGraphId?: string;
}) {
  const hoverIds = o.focusHolonId ? [o.focusHolonId] : undefined;
  const hover = useTaxonomyHover(hoverIds);
  const hasFocus = Boolean(o.focusHolonId);
  return (
    <div
      onMouseEnter={hover.onEnter}
      onMouseLeave={hover.onLeave}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 6,
        padding: "6px 10px 6px 28px",
        borderLeft: `2px solid ${o.status === "done" ? t.accent : "transparent"}`,
        cursor: hasFocus ? "crosshair" : "default",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 600,
          color: t.textDim,
          width: 18,
          paddingTop: 2,
        }}
      >
        {o.rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            lineHeight: 1.4,
            color: o.status === "done" ? t.textPrimary : t.textMuted,
            fontWeight: o.status === "done" ? 500 : 400,
          }}
        >
          {o.cant}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 10,
            fontWeight: 500,
            color: o.status === "done" ? t.accent : t.textDim,
          }}
        >
          {o.status === "done" ? "Done" : "Open"}
        </div>
      </div>
      <ObstacleHowInfo obstacle={o} t={t} howGraphId={howGraphId} />
    </div>
  );
}

function EntityGroup({ entity, t }: { entity: OutcomeEntity; t: Tokens }) {
  const [open, setOpen] = useState(true);
  const { selectedHowGraphId, selectHowGraph } = useRegisterSelection();
  const obstacles = OBSTACLES_BY_ENTITY[entity.id];
  const furnish = FURNISH_BY_ENTITY[entity.id];
  const howGraphId = entity.outcomes.find((o) => o.howGraphId)?.howGraphId;
  return (
    <div style={{ marginBottom: 4 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: t.textPrimary,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <ChevronDown
          size={12}
          color={t.textMuted}
          strokeWidth={1.75}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
            transition: "transform 0.12s ease",
          }}
        />
        {entity.label}
      </button>

      {open ? (
        <div style={{ display: "flex", flexDirection: "column", paddingLeft: 6 }}>
          {entity.outcomes.map((outcome) => {
            const selected = Boolean(
              outcome.howGraphId && outcome.howGraphId === selectedHowGraphId,
            );
            const hasGraph = Boolean(outcome.howGraphId);

            return (
              <div key={outcome.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (outcome.howGraphId) selectHowGraph(outcome.howGraphId);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    width: "100%",
                    textAlign: "left",
                    padding: "5px 12px 5px 18px",
                    border: "none",
                    borderLeft: `2px solid ${selected ? t.accent : "transparent"}`,
                    borderRadius: 0,
                    background: selected ? t.activeRowBg : "transparent",
                    cursor: hasGraph ? "pointer" : "default",
                    fontFamily: "inherit",
                    color: t.textPrimary,
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 12,
                      fontWeight: selected ? 600 : 500,
                      lineHeight: 1.35,
                      color: selected ? t.textPrimary : t.textMuted,
                    }}
                  >
                    {outcomeTitle(outcome)}
                  </span>
                  {!hasGraph ? (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 10,
                        fontWeight: 500,
                        color: t.textDim,
                      }}
                    >
                      stub
                    </span>
                  ) : null}
                </button>
                {selected ? (
                  <div
                    style={{
                      padding: "0 12px 8px 20px",
                      fontSize: 11,
                      lineHeight: 1.45,
                      color: t.textDim,
                    }}
                  >
                    {outcome.statement}
                  </div>
                ) : null}
              </div>
            );
          })}

          {obstacles && obstacles.length > 0 ? (
            <PersonaCants obstacles={obstacles} howGraphId={howGraphId} t={t} />
          ) : null}

          {furnish && furnish.length > 0 ? (
            <PersonaFurnish items={furnish} howGraphId={howGraphId} t={t} />
          ) : null}

          {entity.outcomes.length === 0 && entity.deferredNote ? (
            <div
              style={{
                padding: "4px 12px 8px 20px",
                fontSize: 11,
                color: t.textDim,
                lineHeight: 1.45,
                fontStyle: "italic",
              }}
            >
              {entity.deferredNote}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Register Outcomes — Outcome → Can'ts → Furnish per living persona. */
export function OutcomesPanel({ t }: OutcomesPanelProps) {
  return (
    <div>
      {OUTCOME_ENTITIES.map((entity) => (
        <EntityGroup key={entity.id} entity={entity} t={t} />
      ))}
    </div>
  );
}
