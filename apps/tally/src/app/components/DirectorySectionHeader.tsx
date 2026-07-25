import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type { NotionIconName } from "../icons/notion-icon-urls";
import { HolonBoundary } from "./docs/HolonBoundary";
import { docsBranchLabelStyle } from "./docs/treeTypography";
import {
  DOCS_TREE_BRANCH_LEADING,
  DOCS_TREE_CHEVRON_SIZE,
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_LABEL_CHEVRON_GAP,
  DOCS_TREE_LABEL_SIZE,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_LEFT,
  DOCS_TREE_ROW_PAD_X,
  s,
} from "./docs/treeLayout";
import { NotionIcon } from "./icons/NotionIcon";
import type { Tokens } from "./tokens";

function SectionIconButton({
  icon,
  title,
  t,
  onClick,
}: {
  icon: NotionIconName;
  title: string;
  t: Tokens;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: DOCS_TREE_ICON_SLOT,
        height: DOCS_TREE_ICON_SLOT,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        border: "none",
        borderRadius: 4,
        background: hovered ? t.hoverBg : "transparent",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <NotionIcon name={icon} size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
    </button>
  );
}

function SectionCountBadge({ count, t }: { count: number; t: Tokens }) {
  return (
    <span
      style={{
        minWidth: DOCS_TREE_ICON_SLOT,
        height: DOCS_TREE_ICON_SLOT,
        padding: "0 5px",
        borderRadius: 999,
        background: t.sidebarBadgeBg,
        color: t.sidebarBadgeFg,
        fontSize: s(10),
        fontWeight: 500,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      {count}
    </span>
  );
}

type DirectorySectionHeaderProps = {
  holonId: string;
  holonLabel: string;
  holonIcon: NotionIconName;
  holonOrder: number;
  sectionIcon: NotionIconName;
  label: string;
  count?: number;
  plusTitle?: string;
  sortTitle?: string;
  open?: boolean;
  onToggle?: () => void;
  plusButton?: ReactNode;
  onPlusClick?: () => void;
  onSortClick?: () => void;
  /** Nesting depth under a parent branch (Operations → Enrichment, etc.). */
  depth?: number;
  showActions?: boolean;
  t: Tokens;
};

/** Module section header: icon · label · chevron (Console-style) · optional actions. */
export function DirectorySectionHeader({
  holonId,
  holonLabel,
  holonIcon,
  holonOrder,
  sectionIcon,
  label,
  count,
  plusTitle,
  sortTitle,
  open,
  onToggle,
  plusButton,
  onPlusClick,
  onSortClick,
  depth = 0,
  showActions = true,
  t,
}: DirectorySectionHeaderProps) {
  const [hovered, setHovered] = useState(false);
  const isBranch = onToggle != null;
  const labelColor = t.textDim;

  return (
    <HolonBoundary
      id={holonId}
      label={holonLabel}
      icon={holonIcon}
      order={holonOrder}
      t={t}
      onClick={onToggle}
      onMouseEnter={(e) => {
        setHovered(true);
        (e.currentTarget as HTMLElement).style.background = t.hoverBg;
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
      style={{
        height: DOCS_TREE_ROW_H,
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT + depth * DOCS_TREE_BRANCH_LEADING,
        cursor: onToggle ? "pointer" : "default",
        userSelect: "none",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          width: DOCS_TREE_ICON_SLOT,
          height: DOCS_TREE_ICON_SLOT,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <NotionIcon name={sectionIcon} size={DOCS_TREE_ICON_SIZE} color={labelColor} />
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: DOCS_TREE_LABEL_CHEVRON_GAP,
          minWidth: 0,
          flex: 1,
        }}
      >
        <span style={docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, labelColor, hovered || Boolean(open))}>
          {label}
        </span>
        {isBranch && (
          <ChevronDown
            size={DOCS_TREE_CHEVRON_SIZE}
            color={t.textMuted}
            strokeWidth={2}
            style={{
              flexShrink: 0,
              transform: open ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.12s ease",
            }}
          />
        )}
      </span>
      {showActions && (
        <>
          {plusButton ??
            (onPlusClick && plusTitle ? (
              <SectionIconButton icon="plus" title={plusTitle} t={t} onClick={onPlusClick} />
            ) : null)}
          {onSortClick && sortTitle ? (
            <SectionIconButton icon="arrows-up-down" title={sortTitle} t={t} onClick={onSortClick} />
          ) : null}
          {count != null ? <SectionCountBadge count={count} t={t} /> : null}
        </>
      )}
    </HolonBoundary>
  );
}
