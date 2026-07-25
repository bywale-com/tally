import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { light, type Tokens } from "../../components/tokens";
import { DocsHighlightProvider } from "../../context/DocsHighlightContext";
import { RegisterGate } from "../components/RegisterGate";
import { RegisterHowCanvas } from "../components/RegisterHowCanvas";
import { RegisterLeftPanel } from "../components/RegisterLeftPanel";
import {
  hasClickThroughForGraph,
  RegisterPrototypePanel,
} from "../components/RegisterPrototypePanel";
import { RegisterWireframesPanel } from "../components/RegisterWireframesPanel";
import {
  RegisterCanvasProvider,
  useRegisterCanvas,
} from "../context/RegisterCanvasContext";
import {
  RegisterSelectionProvider,
  useRegisterSelection,
} from "../context/RegisterSelectionContext";
import { getHowGraph } from "../howAnalysis";
import { getWireframesForGraph } from "../wireframes/wireframesRegistry";
import {
  isRegisterRouteEnabled,
  isRegisterUnlocked,
  lockRegister,
} from "../registerAuth";

const LEFT_PANEL_WIDTH = 280;

function modeTabStyle(active: boolean, t: Tokens) {
  return {
    padding: "4px 10px",
    border: `1px solid ${active ? t.accent : t.border}`,
    borderRadius: 4,
    background: active ? t.activeRowBg : t.bgSecondary,
    color: active ? t.accent : t.textMuted,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "inherit" as const,
    cursor: "pointer",
  };
}

function RegisterPageBody({ t, onLock }: { t: Tokens; onLock: () => void }) {
  const { selectedHowGraphId, selectHowGraph } = useRegisterSelection();
  const { canvasMode, setCanvasMode } = useRegisterCanvas();
  const graph = selectedHowGraphId ? getHowGraph(selectedHowGraphId) : undefined;
  const hasWireframes = selectedHowGraphId
    ? getWireframesForGraph(selectedHowGraphId).length > 0
    : false;
  const hasPrototype = hasClickThroughForGraph(selectedHowGraphId);

  const canvasTitle = !selectedHowGraphId
    ? "View canvas"
    : canvasMode === "wireframes"
      ? "Wireframes"
      : canvasMode === "prototype"
        ? "Click-through"
        : "Outcomes canvas";

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 13,
        color: t.textPrimary,
        background: t.bgPrimary,
      }}
    >
      <RegisterLeftPanel width={LEFT_PANEL_WIDTH} t={t} />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: t.hoverBg,
        }}
      >
        <header
          style={{
            height: 35,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bgSecondary,
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em" }}>
            {canvasTitle}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {selectedHowGraphId && hasWireframes ? (
              <>
                <button
                  type="button"
                  onClick={() => setCanvasMode("how")}
                  style={modeTabStyle(canvasMode === "how", t)}
                >
                  How
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasMode("wireframes")}
                  style={modeTabStyle(canvasMode === "wireframes", t)}
                >
                  Strips
                </button>
                {hasPrototype ? (
                  <button
                    type="button"
                    onClick={() => setCanvasMode("prototype")}
                    style={modeTabStyle(canvasMode === "prototype", t)}
                  >
                    Click-through
                  </button>
                ) : null}
              </>
            ) : null}
            {selectedHowGraphId ? (
              <button
                type="button"
                onClick={() => {
                  selectHowGraph(null);
                  setCanvasMode("how");
                }}
                style={{
                  padding: "4px 10px",
                  border: `1px solid ${t.border}`,
                  borderRadius: 4,
                  background: t.bgSecondary,
                  color: t.textMuted,
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                View canvas
              </button>
            ) : null}
            <button
              type="button"
              onClick={onLock}
              style={{
                padding: "4px 10px",
                border: `1px solid ${t.border}`,
                borderRadius: 4,
                background: t.bgSecondary,
                color: t.textMuted,
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              Lock
            </button>
          </div>
        </header>
        {selectedHowGraphId && graph ? (
          <>
            {hasPrototype ? (
              <div
                style={{
                  display: canvasMode === "prototype" ? "flex" : "none",
                  flex: 1,
                  minHeight: 0,
                  minWidth: 0,
                  flexDirection: "column",
                }}
              >
                <RegisterPrototypePanel
                  graphId={selectedHowGraphId}
                  graphLabel={graph.label}
                  t={t}
                />
              </div>
            ) : null}
            {canvasMode === "wireframes" && hasWireframes ? (
              <RegisterWireframesPanel
                graphId={selectedHowGraphId}
                graphLabel={graph.label}
                t={t}
              />
            ) : null}
            {canvasMode === "how" ||
            (canvasMode === "wireframes" && !hasWireframes) ||
            (canvasMode === "prototype" && !hasPrototype) ? (
              <RegisterHowCanvas graphId={selectedHowGraphId} t={t} isDark={false} />
            ) : null}
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: t.textDim,
              fontSize: 13,
            }}
          >
            Register view artboards — placeholder. Select an Outcome with a How graph to open it.
          </div>
        )}
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const t: Tokens = light;

  useEffect(() => {
    let cancelled = false;

    async function checkUnlock() {
      if (!isRegisterRouteEnabled()) {
        setIsChecking(false);
        return;
      }
      const open = await isRegisterUnlocked();
      if (!cancelled) {
        setUnlocked(open);
        setIsChecking(false);
      }
    }

    void checkUnlock();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isRegisterRouteEnabled()) {
    return <Navigate to="/" replace />;
  }

  if (isChecking) {
    return null;
  }

  if (!unlocked) {
    return <RegisterGate t={t} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <DocsHighlightProvider>
      <RegisterSelectionProvider>
        <RegisterCanvasProvider>
          <RegisterPageBody
            t={t}
            onLock={() => {
              void lockRegister().then(() => setUnlocked(false));
            }}
          />
        </RegisterCanvasProvider>
      </RegisterSelectionProvider>
    </DocsHighlightProvider>
  );
}
