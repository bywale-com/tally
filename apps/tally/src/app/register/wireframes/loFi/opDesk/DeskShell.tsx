/**
 * Operator desk shell (items 95–100).
 */
import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PlantBrandMark } from "@/app/plant/PlantBrandMark";
import { NotionIcon } from "@/app/components/icons/NotionIcon";
import type { NotionIconName } from "@/app/icons/notion-icon-urls";
import { FurnishFocus } from "../FurnishFocus";
import { useDeskPalette, usePlantMode } from "../DeskPaletteContext";
import type { ChoreographyStage } from "../choreography";
import type { Density, OpCampaign, OpNav, OpNotification } from "./types";

const NAV_ITEMS: { id: OpNav; label: string; icon: NotionIconName }[] = [
  { id: "campaigns", label: "Campaigns", icon: "list" },
  { id: "meetings", label: "Meetings", icon: "calendar" },
  { id: "messages", label: "Messages", icon: "people" },
  { id: "operations", label: "Operations", icon: "gear" },
];

export type OpDeskSidebarProps = {
  nav: OpNav;
  onNav: (nav: OpNav) => void;
  sidebarOpen: boolean;
  meetingsBadge: number;
  messagesDot: boolean;
};

export function OpDeskSidebar({
  nav,
  onNav,
  sidebarOpen,
  meetingsBadge,
  messagesDot,
}: OpDeskSidebarProps) {
  const loFi = useDeskPalette();
  const plant = usePlantMode();

  return (
    <aside
      className="flex shrink-0 flex-col border-r"
      style={{
        width: sidebarOpen ? loFi.sidebarW : loFi.sidebarCollapsedW,
        background: loFi.sidebar,
        borderColor: loFi.stroke,
        overflow: "hidden",
        transition: "width 120ms ease",
      }}
    >
      {plant ? (
        <PlantBrandMark personaId="operator" />
      ) : (
        <div
          className="flex h-12 shrink-0 flex-col justify-center border-b px-3"
          style={{ borderColor: loFi.stroke }}
        >
          <div className="flex items-center gap-2">
            <div className="size-7 shrink-0 rounded-md" style={{ background: loFi.ink }} />
            {sidebarOpen ? (
              <div>
                <div className="text-xs font-semibold">Tally</div>
                <div className="text-[10px]" style={{ color: loFi.muted }}>
                  Operator
                </div>
              </div>
            ) : null}
          </div>
          {sidebarOpen ? (
            <FurnishFocus persona="op" n={95} label='"You run campaigns" role chip'>
              <div
                className="mt-1.5 inline-flex w-fit rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: loFi.block, color: loFi.label }}
              >
                You run campaigns
              </div>
            </FurnishFocus>
          ) : null}
        </div>
      )}
      {plant && sidebarOpen ? (
        <div className="px-3 py-2">
          <FurnishFocus persona="op" n={95} label='"You run campaigns" role chip'>
            <div
              className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: loFi.block, color: loFi.label }}
            >
              You run campaigns
            </div>
          </FurnishFocus>
        </div>
      ) : null}
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const active = nav === item.id;
          const badge =
            item.id === "meetings" && meetingsBadge > 0
              ? meetingsBadge
              : item.id === "messages" && messagesDot
                ? "·"
                : null;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => onNav(item.id)}
              className="rounded-md px-2.5 py-2 text-left text-[13px]"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                justifyContent: sidebarOpen ? "flex-start" : "center",
                background: active ? loFi.block : "transparent",
                color: active ? loFi.ink : loFi.label,
                fontWeight: active ? 600 : 500,
                fontFamily: "inherit",
                border: "none",
                cursor: "pointer",
              }}
            >
              <NotionIcon
                name={item.icon}
                size={16}
                color={active ? loFi.ink : loFi.label}
              />
              {sidebarOpen ? (
                <span className="flex flex-1 items-center justify-between gap-2">
                  {item.label}
                  {badge !== null ? (
                    <FurnishFocus persona="op" n={96} label="Nav badges">
                      <span
                        className="rounded-full px-1.5 text-[10px] font-semibold"
                        style={{
                          background: loFi.ink,
                          color: loFi.white,
                          minWidth: badge === "·" ? 6 : 18,
                          textAlign: "center",
                        }}
                      >
                        {badge}
                      </span>
                    </FurnishFocus>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
      <div
        className="flex shrink-0 items-center gap-2 border-t p-2"
        style={{ borderColor: loFi.stroke, justifyContent: sidebarOpen ? "flex-start" : "center" }}
      >
        <div className="size-7 shrink-0 rounded-full" style={{ background: loFi.block }} />
        {sidebarOpen ? (
          <div>
            <div className="text-[11px] font-semibold">You</div>
            <div className="text-[10px]" style={{ color: loFi.muted }}>
              Operator
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export type OpDeskHeaderToolsProps = {
  density: Density;
  onDensityChange: (d: Density) => void;
  onOpenCommand: () => void;
  onOpenShortcuts: () => void;
  onOpenNotifications: () => void;
};

export function OpDeskHeaderTools({
  density,
  onDensityChange,
  onOpenCommand,
  onOpenShortcuts,
  onOpenNotifications,
}: OpDeskHeaderToolsProps) {
  const loFi = useDeskPalette();
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        title="Command palette"
        onClick={onOpenCommand}
        className="rounded border px-2 py-0.5 text-[10px]"
        style={{ borderColor: loFi.stroke, background: loFi.chrome, color: loFi.label, fontFamily: "inherit", cursor: "pointer" }}
      >
        ⌘K
      </button>
      <button
        type="button"
        title="Notifications"
        onClick={onOpenNotifications}
        className="rounded border px-2 py-0.5 text-[10px]"
        style={{ borderColor: loFi.stroke, background: loFi.chrome, color: loFi.label, fontFamily: "inherit", cursor: "pointer" }}
      >
        Bell
      </button>
      <FurnishFocus persona="op" n={99} label="Density toggle">
        <select
          className="h-6 rounded border px-1 text-[10px]"
          style={{ borderColor: loFi.stroke, background: loFi.white, color: loFi.ink, fontFamily: "inherit" }}
          value={density}
          onChange={(e) => onDensityChange(e.target.value as Density)}
          title="Density"
        >
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </FurnishFocus>
      <button
        type="button"
        title="Shortcuts"
        onClick={onOpenShortcuts}
        className="rounded border px-2 py-0.5 text-[10px]"
        style={{ borderColor: loFi.stroke, background: loFi.chrome, color: loFi.label, fontFamily: "inherit", cursor: "pointer" }}
      >
        ?
      </button>
    </div>
  );
}

export type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  campaigns: OpCampaign[];
  onJumpCreate: () => void;
  onJumpCampaign: (id: string) => void;
  onJumpStage: (stage: ChoreographyStage) => void;
};

export function CommandPalette({
  open,
  onClose,
  campaigns,
  onJumpCreate,
  onJumpCampaign,
  onJumpStage,
}: CommandPaletteProps) {
  const loFi = useDeskPalette();
  const [q, setQ] = useState("");

  const items = [
    { label: "Create campaign", action: () => { onJumpCreate(); onClose(); } },
    { label: "Jump · Disco (Evaluate)", action: () => { onJumpStage("disco"); onClose(); } },
    { label: "Jump · Off call (Enrich)", action: () => { onJumpStage("off-call"); onClose(); } },
    { label: "Jump · Demo (Deploy)", action: () => { onJumpStage("demo"); onClose(); } },
    ...campaigns
      .filter((c) => !c.sample && c.name.toLowerCase().includes(q.trim().toLowerCase()))
      .map((c) => ({
        label: `Open · ${c.name}`,
        action: () => { onJumpCampaign(c.id); onClose(); },
      })),
  ].filter((i) => !q.trim() || i.label.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <FurnishFocus persona="op" n={97} label="Command palette" style={{ display: "block" }}>
          <>
            <DialogHeader>
              <DialogTitle>Command palette</DialogTitle>
              <DialogDescription>Jump campaign, stage, or create.</DialogDescription>
            </DialogHeader>
            <input
              className="mt-2 h-8 w-full rounded-md border px-2 text-sm"
              style={{ borderColor: loFi.stroke, fontFamily: "inherit" }}
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
            <div className="mt-2 max-h-60 overflow-auto">
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="block w-full rounded px-2 py-2 text-left text-xs hover:bg-muted"
                  style={{ fontFamily: "inherit", border: "none", background: "transparent", cursor: "pointer", color: loFi.ink }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        </FurnishFocus>
      </DialogContent>
    </Dialog>
  );
}

export type ShortcutsSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function ShortcutsSheet({ open, onClose }: ShortcutsSheetProps) {
  const rows = [
    ["j / k", "Move campaign row"],
    ["Enter", "Open highlighted campaign"],
    ["⌘K", "Command palette"],
  ];
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-sm">
        <FurnishFocus persona="op" n={98} label="Keyboard shortcuts sheet" style={{ display: "block" }}>
          <>
            <SheetHeader>
              <SheetTitle>Keyboard shortcuts</SheetTitle>
              <SheetDescription>Campaigns list only in click-through.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {rows.map(([key, desc]) => (
                <div key={key} className="flex justify-between text-xs">
                  <code>{key}</code>
                  <span>{desc}</span>
                </div>
              ))}
            </div>
          </>
        </FurnishFocus>
      </SheetContent>
    </Sheet>
  );
}

export type NotificationsSheetProps = {
  open: boolean;
  onClose: () => void;
  items: OpNotification[];
};

export function NotificationsSheet({ open, onClose, items }: NotificationsSheetProps) {
  const loFi = useDeskPalette();
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="sm:max-w-sm">
        <FurnishFocus persona="op" n={100} label="Notification drawer" style={{ display: "block" }}>
          <>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <SheetDescription>Seed events — no new flows.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {items.map((n) => (
                <div
                  key={n.id}
                  className="rounded-md border p-3 text-xs"
                  style={{ borderColor: loFi.stroke }}
                >
                  <div className="font-semibold">{n.label}</div>
                  {n.detail ? <div className="mt-1" style={{ color: loFi.label }}>{n.detail}</div> : null}
                  {n.at ? <div className="mt-1" style={{ color: loFi.muted }}>{n.at}</div> : null}
                </div>
              ))}
            </div>
          </>
        </FurnishFocus>
      </SheetContent>
    </Sheet>
  );
}

export type OpDeskChromeProps = {
  children: ReactNode;
  headerTools: ReactNode;
};

export function OpDeskChrome({ children, headerTools }: OpDeskChromeProps) {
  return (
    <>
      {headerTools}
      {children}
    </>
  );
}
