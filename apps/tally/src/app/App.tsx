import { useCallback, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { ActivityBar } from "./components/ActivityBar";
import { BoardPanel } from "./components/BoardPanel";
import { DocsPanel } from "./components/DocsPanel";
import { HolonDetailPanel } from "./components/HolonDetailPanel";
import { listTabId, parseListTabId } from "./components/InventoryListDetailPanel";
import { NameListDialog } from "./components/NameListDialog";
import { Workspace, type Tab } from "./components/Workspace";
import { StatusBar } from "./components/StatusBar";
import { DocsHighlightProvider, useDocsHighlight } from "./context/DocsHighlightContext";
import { HolonDetailProvider, useHolonDetail } from "./context/HolonDetailContext";
import {
  EnrichmentProvider,
  useEnrichments,
  workflowsAsListItems,
} from "./context/EnrichmentContext";
import { dark, light } from "./components/tokens";
import {
  appendInventoryList,
  createInventoryList,
  loadInventoryLists,
  nextUntitledListName,
  type InventoryList,
} from "./data/inventoryLists";
import {
  ACTIVITY_BAR_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_CONSOLE_PANEL_WIDTH,
  DEFAULT_HOLON_DETAIL_PANEL_WIDTH,
  MIN_CONSOLE_PANEL_WIDTH,
  MAX_CONSOLE_PANEL_WIDTH,
  MIN_HOLON_DETAIL_PANEL_WIDTH,
  MAX_HOLON_DETAIL_PANEL_WIDTH,
  MIN_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
} from "./constants/layout";

export default function App() {
  return (
    <DocsHighlightProvider>
      <HolonDetailProvider>
        <EnrichmentProvider>
          <AppShell />
        </EnrichmentProvider>
      </HolonDetailProvider>
    </DocsHighlightProvider>
  );
}

function AppShell() {
  const { setHoveredComponentId } = useDocsHighlight();
  const { detailHolonId, closeHolonDetail } = useHolonDetail();
  const { workflows, createWorkflow } = useEnrichments();
  const enrichments = useMemo(() => workflowsAsListItems(workflows), [workflows]);

  const [isDark, setIsDark] = useState(false);
  const t = isDark ? dark : light;

  const [activeIcon, setActiveIcon] = useState("board");
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [sortedIds, setSortedIds] = useState<string[] | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "enrichment-lane-a", label: "Lane A — founding AE" },
  ]);
  const [activeTabId, setActiveTabId] = useState<string | null>("enrichment-lane-a");
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consolePanelWidth, setConsolePanelWidth] = useState(DEFAULT_CONSOLE_PANEL_WIDTH);
  const [isResizingConsolePanel, setIsResizingConsolePanel] = useState(false);
  const [detailPanelWidth, setDetailPanelWidth] = useState(DEFAULT_HOLON_DETAIL_PANEL_WIDTH);
  const [isResizingDetailPanel, setIsResizingDetailPanel] = useState(false);
  const [lists, setLists] = useState<InventoryList[]>(() => loadInventoryLists());
  const [namingList, setNamingList] = useState(false);

  const displayEnrichments = useMemo(() => {
    if (!sortedIds) return enrichments;
    const map = new Map(enrichments.map((e) => [e.id, e]));
    return sortedIds.map((id) => map.get(id)).filter(Boolean) as typeof enrichments;
  }, [enrichments, sortedIds]);

  useEffect(() => {
    setTabs((prev) =>
      prev.map((tab) => {
        const match = enrichments.find((e) => e.id === tab.id);
        return match && match.label !== tab.label ? { ...tab, label: match.label } : tab;
      }),
    );
  }, [enrichments]);

  useEffect(() => {
    setTabs((prev) =>
      prev.map((tab) => {
        const listId = parseListTabId(tab.id);
        if (!listId) return tab;
        const match = lists.find((l) => l.id === listId);
        return match && match.name !== tab.label ? { ...tab, label: match.name } : tab;
      }),
    );
  }, [lists]);

  useEffect(() => {
    if (!isConsoleOpen) {
      setHoveredComponentId(null);
      closeHolonDetail();
    }
  }, [isConsoleOpen, setHoveredComponentId, closeHolonDetail]);

  const startSidebarResize = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  }, []);

  const startConsoleResize = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    setIsResizingConsolePanel(true);
  }, []);

  const startDetailResize = useCallback((e: ReactMouseEvent) => {
    e.preventDefault();
    setIsResizingDetailPanel(true);
  }, []);

  useEffect(() => {
    if (!isResizingSidebar && !isResizingConsolePanel && !isResizingDetailPanel) return;

    const onMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        const leftOffset =
          ACTIVITY_BAR_WIDTH + (isConsoleOpen ? consolePanelWidth : 0);
        setSidebarWidth(
          Math.min(
            MAX_SIDEBAR_WIDTH,
            Math.max(MIN_SIDEBAR_WIDTH, e.clientX - leftOffset),
          ),
        );
      }
      if (isResizingConsolePanel) {
        setConsolePanelWidth(
          Math.min(
            MAX_CONSOLE_PANEL_WIDTH,
            Math.max(MIN_CONSOLE_PANEL_WIDTH, e.clientX - ACTIVITY_BAR_WIDTH),
          ),
        );
      }
      if (isResizingDetailPanel) {
        const fromRight = window.innerWidth - e.clientX;
        setDetailPanelWidth(
          Math.min(
            MAX_HOLON_DETAIL_PANEL_WIDTH,
            Math.max(MIN_HOLON_DETAIL_PANEL_WIDTH, fromRight),
          ),
        );
      }
    };
    const onUp = () => {
      setIsResizingSidebar(false);
      setIsResizingConsolePanel(false);
      setIsResizingDetailPanel(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [
    isResizingSidebar,
    isResizingConsolePanel,
    isResizingDetailPanel,
    isConsoleOpen,
    consolePanelWidth,
  ]);

  function openEnrichmentTab(id: string, label: string) {
    if (!tabs.find((tab) => tab.id === id)) {
      setTabs((prev) => [...prev, { id, label }]);
    }
    setActiveTabId(id);
  }

  function openListTab(list: InventoryList) {
    const id = listTabId(list.id);
    setTabs((prev) => (prev.find((tab) => tab.id === id) ? prev : [...prev, { id, label: list.name }]));
    setActiveTabId(id);
  }

  function handleEnrichmentClick(id: string) {
    const item = enrichments.find((e) => e.id === id);
    if (!item) return;
    openEnrichmentTab(item.id, item.label);
  }

  function handleCreateEnrichment() {
    const created = createWorkflow();
    setSortedIds(null);
    openEnrichmentTab(created.id, created.name);
  }

  function handleOpenInventoryJobs() {
    if (!tabs.find((tab) => tab.id === "inventory-jobs")) {
      setTabs((prev) => [...prev, { id: "inventory-jobs", label: "Jobs" }]);
    }
    setActiveTabId("inventory-jobs");
  }

  function handleOpenInventoryCompanies() {
    if (!tabs.find((tab) => tab.id === "inventory-companies")) {
      setTabs((prev) => [...prev, { id: "inventory-companies", label: "Companies" }]);
    }
    setActiveTabId("inventory-companies");
  }

  function handleOpenLinkedInCrawl() {
    if (!tabs.find((tab) => tab.id === "linkedin-crawl")) {
      setTabs((prev) => [...prev, { id: "linkedin-crawl", label: "Extract from Job URL" }]);
    }
    setActiveTabId("linkedin-crawl");
  }

  function handleOpenList(list: InventoryList) {
    openListTab(list);
  }

  function handleListCreated(list: InventoryList) {
    setLists(appendInventoryList(list));
    openListTab(list);
  }

  function confirmCreateList(name: string) {
    const list = createInventoryList({
      name,
      kind: "companies",
      recordIds: [],
      filterSummary: "Empty — add from Companies filters",
    });
    setNamingList(false);
    handleListCreated(list);
  }

  function handleSortEnrichments() {
    const nextAsc = !sortAsc;
    setSortAsc(nextAsc);
    const sorted = [...enrichments].sort((a, b) =>
      nextAsc ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label),
    );
    setSortedIds(sorted.map((e) => e.id));
  }

  function handleTabClose(id: string) {
    setTabs((prev) => {
      const next = prev.filter((tab) => tab.id !== id);
      if (activeTabId === id) {
        setActiveTabId(next[next.length - 1]?.id ?? null);
      }
      return next;
    });
  }

  const activeListTabId = activeTabId ? parseListTabId(activeTabId) : null;
  const inventoryActiveId =
    activeTabId === "inventory-jobs" ||
    activeTabId === "inventory-companies" ||
    activeTabId === "inventory"
      ? activeTabId === "inventory"
        ? "inventory-jobs"
        : activeTabId
      : activeListTabId
        ? listTabId(activeListTabId)
        : null;

  const resizeHandle = (onMouseDown: (e: ReactMouseEvent) => void) => (
    <div
      onMouseDown={onMouseDown}
      style={{
        width: 4,
        cursor: "col-resize",
        flexShrink: 0,
        background: "transparent",
        position: "relative",
        zIndex: 2,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = t.accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    />
  );

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
        fontSize: 13,
        color: t.textPrimary,
        background: t.bgPrimary,
      }}
    >
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        <ActivityBar
          t={t}
          activeIcon={activeIcon}
          onIconClick={setActiveIcon}
          isConsoleOpen={isConsoleOpen}
          onToggleConsole={() => setIsConsoleOpen((v) => !v)}
        />

        {isConsoleOpen && (
          <>
            <DocsPanel width={consolePanelWidth} t={t} />
            {resizeHandle(startConsoleResize)}
          </>
        )}

        <BoardPanel
          width={sidebarWidth}
          t={t}
          isDark={isDark}
          activeIcon={activeIcon}
          onIconClick={setActiveIcon}
          enrichments={displayEnrichments}
          activeEnrichmentId={activeTabId}
          onEnrichmentClick={handleEnrichmentClick}
          onCreateEnrichment={handleCreateEnrichment}
          onSortEnrichments={handleSortEnrichments}
          inventoryActiveId={inventoryActiveId}
          onOpenInventoryJobs={handleOpenInventoryJobs}
          onOpenInventoryCompanies={handleOpenInventoryCompanies}
          onOpenLinkedInCrawl={handleOpenLinkedInCrawl}
          lists={lists}
          onOpenList={handleOpenList}
          onCreateList={() => setNamingList(true)}
        />
        {resizeHandle(startSidebarResize)}

        <Workspace
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={setActiveTabId}
          onTabClose={handleTabClose}
          t={t}
          isDark={isDark}
          onToggleTheme={() => setIsDark((v) => !v)}
          enrichments={enrichments}
          lists={lists}
          onListCreated={handleListCreated}
        />

        {isConsoleOpen && detailHolonId && (
          <>
            {resizeHandle(startDetailResize)}
            <HolonDetailPanel width={detailPanelWidth} t={t} />
          </>
        )}
      </div>
      <StatusBar t={t} />

      {namingList && (
        <NameListDialog
          t={t}
          title="New list"
          initialName={nextUntitledListName(lists, "companies")}
          hint="Starts empty. Save a filtered Companies view into it, or paste records later."
          onConfirm={confirmCreateList}
          onCancel={() => setNamingList(false)}
        />
      )}
    </div>
  );
}
