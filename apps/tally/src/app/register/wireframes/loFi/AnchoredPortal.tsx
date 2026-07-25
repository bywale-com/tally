import {
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

/**
 * Escape hatch for menus / popovers that must not be clipped by
 * `overflow: hidden|auto` ancestors (cards, panes, rounded shells).
 *
 * Law: `docs/build-foundation/07-overlay-escape.md`
 */
export function AnchoredPortal({
  open,
  anchorRef,
  onClose,
  width,
  maxHeight = 320,
  zIndex = 1100,
  children,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  width: number;
  maxHeight?: number;
  zIndex?: number;
  children: ReactNode;
}) {
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    placeAbove: false,
    anchorBottom: 0,
  });
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const placeAbove = spaceBelow < Math.min(maxHeight, 160) && spaceAbove > spaceBelow;
      let left = rect.right - width;
      left = Math.min(Math.max(8, left), window.innerWidth - width - 8);
      setPos({
        top: placeAbove ? 0 : rect.bottom + 4,
        left,
        placeAbove,
        anchorBottom: placeAbove ? window.innerHeight - rect.top + 4 : 0,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef, width, maxHeight]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || panelEl?.contains(target)) return;
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef, panelEl]);

  if (!open) return null;

  return createPortal(
    <div
      ref={setPanelEl}
      style={{
        position: "fixed",
        top: pos.placeAbove ? undefined : pos.top,
        bottom: pos.placeAbove ? pos.anchorBottom : undefined,
        left: pos.left,
        zIndex,
        width,
        maxHeight,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
