import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import { useDocsHighlight } from "../context/DocsHighlightContext";
import { HolonBoundary } from "./docs/HolonBoundary";
import { ALL_NAV, MORE_NAV_ICON } from "./docs/primaryNavigationIcons";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { NotionIcon } from "./icons/NotionIcon";
import type { Tokens } from "./tokens";

const HEADER_LABEL_SIZE = 13;

type ActivityBarHeaderProps = {
  activeIcon: string;
  onIconClick: (id: string) => void;
  t: Tokens;
  isDark: boolean;
};

/** Board panel header — same chrome pattern as Console (icon + label). */
export function ActivityBarHeader({
  activeIcon,
  onIconClick,
  t,
  isDark,
}: ActivityBarHeaderProps) {
  const { isHolonInspectMode, toggleHolonInspectMode } = useDocsHighlight();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen || !triggerRef.current) return;
    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const menu = menuOpen
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            minWidth: 200,
            background: t.bgPrimary,
            border: `1px solid ${t.border}`,
            borderRadius: 6,
            boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.12)",
            zIndex: 1000,
            padding: 4,
          }}
        >
          {ALL_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onIconClick(item.id);
                setMenuOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                border: "none",
                borderRadius: 4,
                background: activeIcon === item.id ? t.activeRowBg : "transparent",
                color: t.textPrimary,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <NotionIcon name={item.icon} size={14} color={t.textMuted} />
              {item.label}
            </button>
          ))}
          <div style={{ height: 1, background: t.border, margin: "4px 0" }} />
          <button
            type="button"
            onClick={() => {
              toggleHolonInspectMode();
              setMenuOpen(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              border: "none",
              borderRadius: 4,
              background: isHolonInspectMode ? t.activeRowBg : "transparent",
              color: t.textPrimary,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            Inspect holons {isHolonInspectMode ? "· on" : ""}
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <HolonBoundary
      id="board-header"
      label="Board Header"
      icon="grid-square-2x2"
      order={SHELL_HOLON_ORDER["board-header"]}
      t={t}
      style={{
        height: SIDEBAR_HEADER_HEIGHT,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 12px",
        borderBottom: `1px solid ${t.border}`,
        flexShrink: 0,
        boxSizing: "border-box",
        background: t.boardPanel,
      }}
    >
      <NotionIcon name="grid-square-2x2" size={16} color={t.textPrimary} />
      <span
        style={{
          fontSize: HEADER_LABEL_SIZE,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: t.textPrimary,
        }}
      >
        Board
      </span>
      <span style={{ flex: 1 }} />
      <button
        ref={triggerRef}
        type="button"
        title="More"
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: menuOpen ? t.activeRowBg : "transparent",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <NotionIcon name={MORE_NAV_ICON} size={14} color={t.textMuted} />
      </button>
      {menu}
    </HolonBoundary>
  );
}
