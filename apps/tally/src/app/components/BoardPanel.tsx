import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ActivityBarHeader } from "./ActivityBarHeader";
import { DirectorySectionHeader } from "./DirectorySectionHeader";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { docsBranchLabelStyle, docsChildLabelStyle } from "./docs/treeTypography";
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
  DOCS_TREE_UNDERLINE_OFFSET,
} from "./docs/treeLayout";
import { NotionIcon } from "./icons/NotionIcon";
import type { NotionIconName } from "../icons/notion-icon-urls";
import type { Tokens } from "./tokens";
import {
  enrichmentStatusIcon,
  type EnrichmentListItem,
} from "../data/enrichments";
import type { InventoryList } from "../data/inventoryLists";
import { listTabId } from "./InventoryListDetailPanel";

export type { EnrichmentListItem };

type BoardPanelProps = {
  width: number;
  t: Tokens;
  isDark: boolean;
  activeIcon: string;
  onIconClick: (id: string) => void;
  enrichments: EnrichmentListItem[];
  activeEnrichmentId: string | null;
  onEnrichmentClick: (id: string) => void;
  onCreateEnrichment: () => void;
  onSortEnrichments: () => void;
  inventoryActiveId: string | null;
  onOpenInventoryJobs: () => void;
  onOpenInventoryCompanies: () => void;
  onOpenLinkedInCrawl: () => void;
  lists: InventoryList[];
  onOpenList: (list: InventoryList) => void;
  onCreateList: () => void;
};

function BoardModuleRow({
  label,
  icon,
  open,
  onToggle,
  depth = 0,
  t,
}: {
  label: string;
  icon: NotionIconName;
  open?: boolean;
  onToggle?: () => void;
  depth?: number;
  t: Tokens;
}) {
  const [hovered, setHovered] = useState(false);
  const isBranch = onToggle != null;
  const tone = t.textPrimary;

  return (
    <div
      onClick={() => onToggle?.()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT + depth * DOCS_TREE_BRANCH_LEADING,
        cursor: isBranch ? "pointer" : "default",
        userSelect: "none",
        flexShrink: 0,
        boxSizing: "border-box",
        borderRadius: 4,
        background: hovered ? t.hoverBg : "transparent",
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
        <NotionIcon name={icon} size={DOCS_TREE_ICON_SIZE} color={tone} />
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
        <span style={docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, tone, hovered || Boolean(open))}>
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
    </div>
  );
}

function EnrichmentRow({
  enrichment,
  active,
  onClick,
  depth = 0,
  t,
}: {
  enrichment: EnrichmentListItem;
  active: boolean;
  onClick: () => void;
  depth?: number;
  t: Tokens;
}) {
  const icon = enrichmentStatusIcon(enrichment.status, t, active);

  return (
    <div
      onClick={onClick}
      style={{
        height: DOCS_TREE_ROW_H,
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT + depth * DOCS_TREE_BRANCH_LEADING,
        cursor: "pointer",
        userSelect: "none",
        background: active ? t.activeRowBg : "transparent",
        borderLeft: active ? `2px solid ${t.accent}` : "2px solid transparent",
        borderRadius: 4,
        margin: "0 4px",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = t.hoverBg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = active ? t.activeRowBg : "transparent";
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
        <NotionIcon
          name={icon.name}
          size={DOCS_TREE_ICON_SIZE}
          color={icon.color}
          spin={icon.spin}
        />
      </span>
      <span
        style={{
          ...docsChildLabelStyle(
            DOCS_TREE_LABEL_SIZE,
            active ? t.textPrimary : t.textSidebar,
            t,
            DOCS_TREE_UNDERLINE_OFFSET,
          ),
          flex: 1,
          minWidth: 0,
        }}
      >
        {enrichment.label}
      </span>
    </div>
  );
}

function InventoryRow({
  label,
  icon,
  active,
  onClick,
  depth = 0,
  t,
}: {
  label: string;
  icon: NotionIconName;
  active: boolean;
  onClick: () => void;
  depth?: number;
  t: Tokens;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        height: DOCS_TREE_ROW_H,
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT + depth * DOCS_TREE_BRANCH_LEADING,
        cursor: "pointer",
        userSelect: "none",
        background: active ? t.activeRowBg : "transparent",
        borderLeft: active ? `2px solid ${t.accent}` : "2px solid transparent",
        borderRadius: 4,
        margin: "0 4px",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = t.hoverBg;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = active ? t.activeRowBg : "transparent";
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
        <NotionIcon
          name={icon}
          size={DOCS_TREE_ICON_SIZE}
          color={active ? t.accent : t.textMuted}
        />
      </span>
      <span
        style={{
          ...docsChildLabelStyle(
            DOCS_TREE_LABEL_SIZE,
            active ? t.textPrimary : t.textSidebar,
            t,
            DOCS_TREE_UNDERLINE_OFFSET,
          ),
          flex: 1,
          minWidth: 0,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function BoardPanel({
  width,
  t,
  isDark,
  activeIcon,
  onIconClick,
  enrichments,
  activeEnrichmentId,
  onEnrichmentClick,
  onCreateEnrichment,
  onSortEnrichments,
  inventoryActiveId,
  onOpenInventoryJobs,
  onOpenInventoryCompanies,
  onOpenLinkedInCrawl,
  lists,
  onOpenList,
  onCreateList,
}: BoardPanelProps) {
  // All board dropdowns start retracted
  const [campaignsOpen, setCampaignsOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [enrichmentOpen, setEnrichmentOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [listsOpen, setListsOpen] = useState(false);

  const opsChildDepth = 1;
  const opsLeafDepth = 2;

  return (
    <div
      style={{
        width,
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: t.boardPanel,
        borderRight: `1px solid ${t.border}`,
        overflow: "hidden",
      }}
    >
      <ActivityBarHeader
        activeIcon={activeIcon}
        onIconClick={onIconClick}
        t={t}
        isDark={isDark}
      />

      <HolonBoundary
        id="board-body"
        label="Board Body"
        icon="list"
        order={SHELL_HOLON_ORDER["board-body"]}
        t={t}
        style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}
      >
        <HolonBoundary
          id="campaigns-section"
          label="Campaigns"
          icon="directional-sign"
          order={SHELL_HOLON_ORDER["campaigns-section"]}
          t={t}
        >
          <BoardModuleRow
            label="Campaigns"
            icon="directional-sign"
            open={campaignsOpen}
            onToggle={() => setCampaignsOpen((v) => !v)}
            t={t}
          />
        </HolonBoundary>

        <HolonBoundary
          id="meetings-module"
          label="Meetings"
          icon="calendar"
          order={SHELL_HOLON_ORDER["meetings-module"]}
          t={t}
        >
          <BoardModuleRow label="Meetings" icon="calendar" t={t} />
        </HolonBoundary>

        <HolonBoundary
          id="messages-module"
          label="Messages"
          icon="bell"
          order={SHELL_HOLON_ORDER["messages-module"]}
          t={t}
        >
          <BoardModuleRow label="Messages" icon="bell" t={t} />
        </HolonBoundary>

        <HolonBoundary
          id="operations-section"
          label="Operations"
          icon="wrench"
          order={SHELL_HOLON_ORDER["operations-section"]}
          t={t}
        >
          <BoardModuleRow
            label="Operations"
            icon="wrench"
            open={operationsOpen}
            onToggle={() => setOperationsOpen((v) => !v)}
            t={t}
          />

          {operationsOpen && (
            <>
              <DirectorySectionHeader
                holonId="enrichment-section"
                holonLabel="Enrichment Section"
                holonIcon="magnifying-glass"
                holonOrder={SHELL_HOLON_ORDER["enrichment-section"]}
                sectionIcon="magnifying-glass"
                label="Enrichment"
                count={enrichments.length}
                plusTitle="Add enrichment"
                sortTitle="Sort enrichments"
                open={enrichmentOpen}
                onToggle={() => setEnrichmentOpen((v) => !v)}
                onPlusClick={onCreateEnrichment}
                onSortClick={onSortEnrichments}
                depth={opsChildDepth}
                t={t}
              />
              {enrichmentOpen &&
                enrichments.map((item) => (
                  <EnrichmentRow
                    key={item.id}
                    enrichment={item}
                    active={item.id === activeEnrichmentId}
                    onClick={() => onEnrichmentClick(item.id)}
                    depth={opsLeafDepth}
                    t={t}
                  />
                ))}
              {enrichmentOpen && (
                <InventoryRow
                  label="Extract from Job URL"
                  icon="magnifying-glass"
                  active={activeEnrichmentId === "linkedin-crawl"}
                  onClick={onOpenLinkedInCrawl}
                  depth={opsLeafDepth}
                  t={t}
                />
              )}
              {enrichmentOpen && enrichments.length === 0 && (
                <p
                  style={{
                    margin: "8px 16px",
                    marginLeft: DOCS_TREE_ROW_PAD_LEFT + opsLeafDepth * DOCS_TREE_BRANCH_LEADING,
                    fontSize: 12,
                    color: t.textDim,
                    lineHeight: 1.4,
                  }}
                >
                  No enrichments yet. Use + to create one — or open Extract from Job URL.
                </p>
              )}

              <DirectorySectionHeader
                holonId="inventory-section"
                holonLabel="Inventory Section"
                holonIcon="checkmark-list"
                holonOrder={SHELL_HOLON_ORDER["inventory-section"]}
                sectionIcon="checkmark-list"
                label="Inventory"
                count={2}
                plusTitle="Add inventory"
                sortTitle="Sort inventory"
                open={inventoryOpen}
                onToggle={() => setInventoryOpen((v) => !v)}
                depth={opsChildDepth}
                t={t}
              />
              {inventoryOpen && (
                <>
                  <InventoryRow
                    label="Jobs"
                    icon="checkmark-list"
                    active={inventoryActiveId === "inventory-jobs"}
                    onClick={onOpenInventoryJobs}
                    depth={opsLeafDepth}
                    t={t}
                  />
                  <InventoryRow
                    label="Companies"
                    icon="people"
                    active={inventoryActiveId === "inventory-companies"}
                    onClick={onOpenInventoryCompanies}
                    depth={opsLeafDepth}
                    t={t}
                  />
                </>
              )}

              <DirectorySectionHeader
                holonId="lists-section"
                holonLabel="Lists Section"
                holonIcon="list-bullet"
                holonOrder={SHELL_HOLON_ORDER["lists-section"]}
                sectionIcon="list-bullet"
                label="Lists"
                count={lists.length}
                plusTitle="New list"
                sortTitle="Sort lists"
                open={listsOpen}
                onToggle={() => setListsOpen((v) => !v)}
                onPlusClick={onCreateList}
                depth={opsChildDepth}
                t={t}
              />
              {listsOpen &&
                (lists.length === 0 ? (
                  <div
                    style={{
                      padding: `4px ${DOCS_TREE_ROW_PAD_X}px 8px`,
                      paddingLeft:
                        DOCS_TREE_ROW_PAD_LEFT + opsLeafDepth * DOCS_TREE_BRANCH_LEADING,
                      fontSize: 11.5,
                      color: t.textDim,
                      lineHeight: 1.4,
                    }}
                  >
                    No lists yet. Save a filtered selection from Companies, or create one here.
                  </div>
                ) : (
                  lists.map((list) => (
                    <InventoryRow
                      key={list.id}
                      label={list.name}
                      icon="list-bullet"
                      active={inventoryActiveId === listTabId(list.id)}
                      onClick={() => onOpenList(list)}
                      depth={opsLeafDepth}
                      t={t}
                    />
                  ))
                ))}
            </>
          )}
        </HolonBoundary>
      </HolonBoundary>
    </div>
  );
}
