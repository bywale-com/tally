import { X, Sun, Moon, ChevronRight } from "lucide-react";
import { EnrichmentDetailView } from "./enrichment/EnrichmentDetailView";
import { InventoryPanel } from "./InventoryPanel";
import { InventoryCompaniesPanel } from "./InventoryCompaniesPanel";
import {
  InventoryListDetailPanel,
  parseListTabId,
} from "./InventoryListDetailPanel";
import { CrawlRunPanel } from "./crawl/CrawlRunPanel";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { SIDEBAR_HEADER_HEIGHT } from "../constants/layout";
import { NotionIcon } from "./icons/NotionIcon";
import type { Tokens } from "./tokens";
import {
  enrichmentStatusIcon,
  type EnrichmentListItem,
} from "../data/enrichments";
import type { InventoryList } from "../data/inventoryLists";

export type Tab = {
  id: string;
  label: string;
};

const INVENTORY_TABS: Record<
  string,
  { crumb: string[]; icon: "checkmark-list" | "people" | "list-bullet" }
> = {
  "inventory-jobs": { crumb: ["Board", "Inventory", "Jobs"], icon: "checkmark-list" },
  "inventory-companies": { crumb: ["Board", "Inventory", "Companies"], icon: "people" },
  // legacy tab id from earlier wash UI
  inventory: { crumb: ["Board", "Inventory", "Jobs"], icon: "checkmark-list" },
};

type WorkspaceProps = {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  t: Tokens;
  isDark: boolean;
  onToggleTheme: () => void;
  enrichments: EnrichmentListItem[];
  lists: InventoryList[];
  onListCreated: (list: InventoryList) => void;
};

export function Workspace({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  t,
  isDark,
  onToggleTheme,
  enrichments,
  lists,
  onListCreated,
}: WorkspaceProps) {
  const activeEnrichment = enrichments.find((item) => item.id === activeTabId) ?? null;
  const inventoryMeta = activeTabId ? INVENTORY_TABS[activeTabId] : undefined;
  const activeListId = activeTabId ? parseListTabId(activeTabId) : null;
  const activeList = activeListId ? lists.find((l) => l.id === activeListId) ?? null : null;
  const isInventoryJobs = activeTabId === "inventory-jobs" || activeTabId === "inventory";
  const isInventoryCompanies = activeTabId === "inventory-companies";
  const isLinkedInCrawl = activeTabId === "linkedin-crawl";
  const breadcrumb = activeList
    ? ["Board", "Lists", activeList.name]
    : isLinkedInCrawl
      ? ["Board", "Enrichment", "Extract from Job URL"]
    : inventoryMeta
      ? inventoryMeta.crumb
      : activeEnrichment
        ? ["Board", "Enrichment", activeEnrichment.label]
        : ["Board"];

  return (
    <div
      style={{
        flex: 1,
        background: t.bgPrimary,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100%",
        fontFamily: "inherit",
      }}
    >
      <HolonBoundary
        id="tab-bar"
        label="Tab Bar"
        icon="computer-window"
        order={SHELL_HOLON_ORDER["tab-bar"]}
        t={t}
        style={{
          display: "flex",
          alignItems: "stretch",
          background: t.tabInactiveBg,
          borderBottom: `1px solid ${t.border}`,
          flexShrink: 0,
          height: SIDEBAR_HEADER_HEIGHT,
          boxSizing: "border-box",
        }}
      >
        <HolonBoundary
          id="workspace-tab"
          label="Workspace Tab"
          icon="document"
          order={SHELL_HOLON_ORDER["workspace-tab"]}
          registerOnly
          t={t}
        >
          {null}
        </HolonBoundary>
        <div style={{ display: "flex", alignItems: "stretch", flex: 1, overflowX: "auto" }}>
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const enrichment = enrichments.find((item) => item.id === tab.id);
            const inventory = INVENTORY_TABS[tab.id];
            const listId = parseListTabId(tab.id);
            const icon = enrichment
              ? enrichmentStatusIcon(enrichment.status, t, isActive)
              : inventory
                ? { name: inventory.icon, color: isActive ? t.accent : t.textMuted, spin: false }
                : listId
                  ? {
                      name: "list-bullet" as const,
                      color: isActive ? t.accent : t.textMuted,
                      spin: false,
                    }
                  : enrichmentStatusIcon("idle", t, isActive);
            return (
              <div
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 10px",
                  height: "100%",
                  background: isActive ? t.tabActiveBg : "transparent",
                  borderRight: `1px solid ${t.border}`,
                  cursor: "pointer",
                  color: isActive ? t.textPrimary : t.textMuted,
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                <NotionIcon
                  name={icon.name}
                  size={13}
                  color={icon.color}
                  spin={icon.spin}
                />
                <span>{tab.label}</span>
                <button
                  type="button"
                  title="Close tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab.id);
                  }}
                  style={{
                    width: 18,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: t.textMuted,
                    padding: 0,
                  }}
                >
                  <X size={12} strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          title={isDark ? "Light mode" : "Dark mode"}
          onClick={onToggleTheme}
          style={{
            width: SIDEBAR_HEADER_HEIGHT,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            borderLeft: `1px solid ${t.border}`,
            background: "transparent",
            cursor: "pointer",
            color: t.textMuted,
            flexShrink: 0,
          }}
        >
          {isDark ? <Sun size={14} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
        </button>
      </HolonBoundary>

      <HolonBoundary
        id="breadcrumb"
        label="Breadcrumb"
        icon="directional-sign"
        order={SHELL_HOLON_ORDER["breadcrumb"]}
        t={t}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "6px 12px",
          borderBottom: `1px solid ${t.borderLight}`,
          flexShrink: 0,
          fontSize: 12,
          color: t.textMuted,
        }}
      >
        {breadcrumb.map((crumb, i) => (
          <span key={`${crumb}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <ChevronRight size={12} color={t.textDim} />}
            <span style={{ color: i === breadcrumb.length - 1 ? t.textPrimary : t.textMuted }}>
              {crumb}
            </span>
          </span>
        ))}
      </HolonBoundary>

      {activeListId ? (
        <InventoryListDetailPanel listId={activeListId} t={t} />
      ) : isLinkedInCrawl ? (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <CrawlRunPanel t={t} />
        </div>
      ) : isInventoryCompanies ? (
        <InventoryCompaniesPanel t={t} onListCreated={onListCreated} />
      ) : isInventoryJobs ? (
        <InventoryPanel t={t} />
      ) : activeTabId && activeEnrichment ? (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <EnrichmentDetailView enrichmentId={activeTabId} t={t} isDark={isDark} />
        </div>
      ) : (
        <HolonBoundary
          id="workspace-empty"
          label="Workspace Empty"
          icon="square-dashed"
          order={SHELL_HOLON_ORDER["workspace-empty"]}
          t={t}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: t.textDim,
            fontSize: 13,
          }}
        >
          Select or create an enrichment from the board.
        </HolonBoundary>
      )}
    </div>
  );
}
