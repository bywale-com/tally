import { useState } from "react";
import { ChevronDown, Eye, EyeOff, MoreHorizontal } from "lucide-react";
import { SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import { docsBranchLabelStyle, docsChildLabelStyle } from "./docs/treeTypography";
import {
  DOCS_TREE_BRANCH_LEADING,
  DOCS_TREE_CHEVRON_SIZE,
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_LABEL_CHEVRON_GAP,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_LEFT,
  DOCS_TREE_ROW_PAD_X,
  DOCS_REGISTRY_ROW_PAD_RIGHT,
  DOCS_TREE_LABEL_SIZE,
  DOCS_TREE_UNDERLINE_OFFSET,
} from "./docs/treeLayout";
import type { HolonId } from "../context/DocsHighlightContext";
import { useDocsHighlight } from "../context/DocsHighlightContext";
import { useHolonDetail } from "../context/HolonDetailContext";
import type { HolonTreeNode } from "../context/DocsRegistryContext";
import { useDocsRegistry } from "../context/DocsRegistryContext";
import { HolonBoundary } from "./docs/HolonBoundary";
import { docsTargetHighlight, holonInspectTargetProps, useIsDocsTarget } from "./docs/docsHighlight";
import {
  DOCS_HOME_BRANCH_HOLON,
  DOCS_HOME_PLACEHOLDER_ENTRIES,
  DOCS_OUTLINE_ROW_HOLON,
  DOCS_PANELS_BRANCH_HOLON,
  DOCS_REGISTRY_HOLON,
} from "./docs/docsRegistryHolons";
import { HolonTreeIcon } from "./docs/HolonTreeIcon";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import type { NotionIconName } from "../icons/notion-icon-urls";
import type { HolonLucideIconName } from "./docs/holonIcons";
import { NotionIcon } from "./icons/NotionIcon";
import type { Tokens } from "./tokens";

const HEADER_LABEL_SIZE = 13;

type DocsPanelProps = {
  width: number;
  t: Tokens;
};

function DocsOutlineRow({
  label,
  icon,
  lucideIcon,
  depth = 0,
  isSelected = false,
  open,
  onToggle,
  docsTargetId,
  inView,
  onReveal,
  onViewDetails,
  t,
}: {
  label: string;
  icon?: NotionIconName;
  lucideIcon?: HolonLucideIconName;
  depth?: number;
  isSelected?: boolean;
  open?: boolean;
  onToggle?: () => void;
  docsTargetId?: HolonId;
  inView?: boolean;
  onReveal?: (id: HolonId) => void;
  onViewDetails?: (id: HolonId) => void;
  t: Tokens;
}) {
  const isBranch = onToggle != null;
  const [hovered, setHovered] = useState(false);
  const { setHoveredComponentId } = useDocsHighlight();
  const isHolonHighlighted = useIsDocsTarget(docsTargetId ?? "");
  const isOutlineRowHighlighted = useIsDocsTarget(DOCS_OUTLINE_ROW_HOLON.id);
  const showHolonControls = docsTargetId != null && inView != null;
  const tone = t.textPrimary;
  const isChild = depth > 0;

  const labelStyle = isChild
    ? docsChildLabelStyle(DOCS_TREE_LABEL_SIZE, tone, t, DOCS_TREE_UNDERLINE_OFFSET)
    : docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, tone, isBranch && (hovered || isSelected));

  return (
    <div
      {...(docsTargetId ? holonInspectTargetProps(docsTargetId) : {})}
      onClick={() => onToggle?.()}
      onMouseEnter={() => {
        setHovered(true);
        if (docsTargetId) setHoveredComponentId(docsTargetId);
      }}
      onMouseLeave={() => {
        setHovered(false);
        if (docsTargetId) setHoveredComponentId(null);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_REGISTRY_ROW_PAD_RIGHT}px 0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT + depth * DOCS_TREE_BRANCH_LEADING,
        cursor: "pointer",
        userSelect: "none",
        flexShrink: 0,
        boxSizing: "border-box",
        borderRadius: 4,
        ...docsTargetHighlight(
          isOutlineRowHighlighted || Boolean(docsTargetId && isHolonHighlighted),
          t.accent,
        ),
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
        <HolonTreeIcon
          notionIcon={icon}
          lucideIcon={lucideIcon}
          size={DOCS_TREE_ICON_SIZE}
          color={tone}
          accentColor={t.accent}
        />
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
        <span style={labelStyle}>{label}</span>
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
      {showHolonControls && hovered && (
        <>
          <button
            type="button"
            title={inView ? "In view" : "Reveal in workspace"}
            disabled={inView}
            onClick={(e) => {
              e.stopPropagation();
              if (!inView) onReveal?.(docsTargetId);
            }}
            style={{
              width: DOCS_TREE_ICON_SLOT,
              height: DOCS_TREE_ICON_SLOT,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: inView ? "default" : "pointer",
              color: inView ? t.accent : t.textMuted,
            }}
          >
            {inView ? <Eye size={14} strokeWidth={2} /> : <EyeOff size={14} strokeWidth={2} />}
          </button>
          <button
            type="button"
            title="View details"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(docsTargetId);
            }}
            style={{
              width: DOCS_TREE_ICON_SLOT,
              height: DOCS_TREE_ICON_SLOT,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: t.textMuted,
            }}
          >
            <MoreHorizontal size={14} strokeWidth={2} />
          </button>
        </>
      )}
    </div>
  );
}

function HolonTreeRows({
  nodes,
  depth,
  collapsed,
  onToggle,
  onReveal,
  onViewDetails,
  t,
}: {
  nodes: HolonTreeNode[];
  depth: number;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onReveal: (id: HolonId) => void;
  onViewDetails: (id: HolonId) => void;
  t: Tokens;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const open = !collapsed.has(node.id);
        return (
          <div key={node.id}>
            <DocsOutlineRow
              label={node.label}
              icon={node.icon}
              lucideIcon={node.lucideIcon}
              depth={depth}
              open={hasChildren ? open : undefined}
              onToggle={hasChildren ? () => onToggle(node.id) : undefined}
              docsTargetId={node.id}
              inView={node.inView}
              onReveal={onReveal}
              onViewDetails={onViewDetails}
              t={t}
            />
            {hasChildren && open && (
              <HolonTreeRows
                nodes={node.children}
                depth={depth + 1}
                collapsed={collapsed}
                onToggle={onToggle}
                onReveal={onReveal}
                onViewDetails={onViewDetails}
                t={t}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function DocsPanel({ width, t }: DocsPanelProps) {
  const { tree, focusHolon } = useDocsRegistry();
  const { openHolonDetail } = useHolonDetail();
  const [homeOpen, setHomeOpen] = useState(true);
  const [panelsOpen, setPanelsOpen] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  function toggleCollapsed(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <HolonBoundary
      id={DOCS_REGISTRY_HOLON.id}
      label={DOCS_REGISTRY_HOLON.label}
      icon={DOCS_REGISTRY_HOLON.icon}
      order={SHELL_HOLON_ORDER["docs-registry"]}
      t={t}
      style={{
        width,
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        borderRight: `1px solid ${t.border}`,
        overflow: "hidden",
      }}
    >
      <HolonBoundary
        id="docs-header"
        label="Console Header"
        icon="document"
        order={SHELL_HOLON_ORDER["docs-header"]}
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
        }}
      >
        <NotionIcon name="document" size={16} color={t.textPrimary} />
        <span
          style={{
            fontSize: HEADER_LABEL_SIZE,
            fontWeight: 500,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          Console
        </span>
      </HolonBoundary>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
        <DocsOutlineRow
          label={DOCS_HOME_BRANCH_HOLON.label}
          icon={DOCS_HOME_BRANCH_HOLON.icon}
          open={homeOpen}
          onToggle={() => setHomeOpen((v) => !v)}
          t={t}
        />
        {homeOpen &&
          DOCS_HOME_PLACEHOLDER_ENTRIES.map((entry) => (
            <DocsOutlineRow
              key={entry.id}
              label={entry.label}
              icon={entry.icon}
              depth={1}
              t={t}
            />
          ))}

        <DocsOutlineRow
          label={DOCS_PANELS_BRANCH_HOLON.label}
          icon={DOCS_PANELS_BRANCH_HOLON.icon}
          open={panelsOpen}
          onToggle={() => setPanelsOpen((v) => !v)}
          t={t}
        />
        {panelsOpen && (
          <HolonTreeRows
            nodes={tree}
            depth={1}
            collapsed={collapsed}
            onToggle={toggleCollapsed}
            onReveal={focusHolon}
            onViewDetails={openHolonDetail}
            t={t}
          />
        )}
      </div>

      <HolonBoundary
        id={DOCS_OUTLINE_ROW_HOLON.id}
        label={DOCS_OUTLINE_ROW_HOLON.label}
        icon={DOCS_OUTLINE_ROW_HOLON.icon}
        order={DOCS_OUTLINE_ROW_HOLON.order}
        registerOnly
        t={t}
      >
        {null}
      </HolonBoundary>
    </HolonBoundary>
  );
}
