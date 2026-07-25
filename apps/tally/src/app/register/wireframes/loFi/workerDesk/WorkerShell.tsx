/**
 * Worker shell furniture (items 84–93) — palettes, drawers, onboarding.
 */
import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LoFiButton } from "../LoFiPrimitives";
import { useDeskPalette } from "../DeskPaletteContext";
import type { Density, WorkerNotification, WorkerVessel } from "./types";

export type WorkerCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pool: WorkerVessel[];
  activeName: string | null;
  onJumpQueue: () => void;
  onJumpActive: () => void;
  onJumpLog: () => void;
  onJumpPipeline: () => void;
  onPickUp: (id: string) => void;
};

export function WorkerCommandPalette({
  open,
  onOpenChange,
  pool,
  activeName,
  onJumpQueue,
  onJumpActive,
  onJumpLog,
  onJumpPipeline,
  onPickUp,
}: WorkerCommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const q = query.trim().toLowerCase();
  const vesselHits = pool.filter((v) => !q || v.name.toLowerCase().includes(q));

  const jump = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Jump to</DialogTitle>
          <DialogDescription>
            {activeName ? `Active · ${activeName}` : "Available pool"}
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search vessels…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="flex max-h-64 flex-col gap-3 overflow-auto text-sm">
          <LoFiButton variant="quiet" onClick={() => jump(onJumpQueue)}>
            Available
          </LoFiButton>
          <LoFiButton variant="quiet" onClick={() => jump(onJumpActive)}>
            Active
          </LoFiButton>
          <LoFiButton variant="quiet" onClick={() => jump(onJumpLog)}>
            Log meeting
          </LoFiButton>
          <LoFiButton variant="ghost" onClick={() => jump(onJumpPipeline)}>
            Pipeline
          </LoFiButton>
          {vesselHits.length > 0 ? (
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">Pick up</div>
              {vesselHits.map((v) => (
                <LoFiButton
                  key={v.id}
                  variant="quiet"
                  onClick={() => jump(() => onPickUp(v.id))}
                >
                  {v.name}
                </LoFiButton>
              ))}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type WorkerShortcutsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WorkerShortcutsSheet({ open, onOpenChange }: WorkerShortcutsSheetProps) {
  const rows = [
    ["⌘K / Ctrl+K", "Command palette"],
    ["j / k", "Move Available rows"],
    ["Enter", "Pick up highlighted vessel"],
    ["L", "Log meeting (when active)"],
    ["P", "Pipeline (when active)"],
    ["?", "This sheet"],
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Keyboard shortcuts</SheetTitle>
          <SheetDescription>Worker desk only</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 pt-4 text-sm">
          {rows.map(([key, desc]) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="font-mono text-xs text-muted-foreground">{key}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export type WorkerNotificationDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: WorkerNotification[];
};

export function WorkerNotificationDrawer({
  open,
  onOpenChange,
  notifications,
}: WorkerNotificationDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Client stop, releases, disputes</SheetDescription>
        </SheetHeader>
        {notifications.length === 0 ? (
          <Empty className="border-0 py-8">
            <EmptyHeader>
              <EmptyTitle>Nothing pending</EmptyTitle>
              <EmptyDescription>Escrow and client events land here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col pt-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className="flex flex-col gap-0.5 border-b py-3 text-left text-sm"
                onClick={() => {
                  n.onClick?.();
                  onOpenChange(false);
                }}
              >
                <span className="font-medium">{n.label}</span>
                {n.detail ? (
                  <span className="text-xs text-muted-foreground">{n.detail}</span>
                ) : null}
                {n.at ? <span className="text-[11px] text-muted-foreground">{n.at}</span> : null}
              </button>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export type WorkerOnboardingChecklistProps = {
  dismissed: boolean;
  onDismiss: () => void;
  pickedUp: boolean;
  begun: boolean;
  logged: boolean;
};

export function WorkerOnboardingChecklist({
  dismissed,
  onDismiss,
  pickedUp,
  begun,
  logged,
}: WorkerOnboardingChecklistProps) {
  const loFi = useDeskPalette();
  if (dismissed) return null;
  const items = [
    { label: "Pick up", done: pickedUp },
    { label: "Begin", done: begun },
    { label: "Log awareness", done: logged },
  ];
  if (items.every((i) => i.done)) return null;

  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md px-3 py-2"
      style={{ background: loFi.block, border: `1px solid ${loFi.stroke}` }}
    >
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: loFi.label }}>
        {items.map((item) => (
          <span key={item.label} style={{ opacity: item.done ? 0.5 : 1 }}>
            {item.done ? "✓" : "○"} {item.label}
          </span>
        ))}
      </div>
      <LoFiButton variant="quiet" onClick={onDismiss}>
        Dismiss
      </LoFiButton>
    </div>
  );
}

export type WorkerHeaderToolsProps = {
  density: Density;
  onDensityChange: (d: Density) => void;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  onOpenNotifications: () => void;
  notifCount: number;
};

export function WorkerHeaderTools({
  density,
  onDensityChange,
  onOpenCommandPalette,
  onOpenShortcuts,
  onOpenNotifications,
  notifCount,
}: WorkerHeaderToolsProps) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-end gap-1">
      <LoFiButton variant="quiet" onClick={onOpenCommandPalette}>
        ⌘K
      </LoFiButton>
      <LoFiButton variant="quiet" onClick={onOpenShortcuts}>
        ?
      </LoFiButton>
      <LoFiButton
        variant="quiet"
        onClick={() =>
          onDensityChange(density === "comfortable" ? "compact" : "comfortable")
        }
      >
        {density === "comfortable" ? "Compact" : "Comfort"}
      </LoFiButton>
      <LoFiButton variant="quiet" onClick={onOpenNotifications}>
        Alerts{notifCount > 0 ? ` (${notifCount})` : ""}
      </LoFiButton>
    </div>
  );
}

export function buildWorkerNotifications(input: {
  stopped: boolean;
  pendingRelease: number;
  disputed: number;
  lastReleaseReceipt?: string;
  onPipeline?: () => void;
  onActive?: () => void;
}): WorkerNotification[] {
  const list: WorkerNotification[] = [];
  if (input.stopped) {
    list.push({
      id: "stop",
      label: "Client stopped campaign",
      detail: "Stop working. Release to pool.",
      onClick: input.onActive,
    });
  }
  if (input.pendingRelease > 0) {
    list.push({
      id: "pending",
      label: `${input.pendingRelease} pending client release`,
      detail: "Meetings logged — awaiting payer",
      onClick: input.onPipeline,
    });
  }
  if (input.disputed > 0) {
    list.push({
      id: "disputed",
      label: `${input.disputed} disputed`,
      detail: "Release held until resolved",
      onClick: input.onPipeline,
    });
  }
  if (input.lastReleaseReceipt) {
    list.push({
      id: "release",
      label: "Release received",
      detail: input.lastReleaseReceipt,
      at: "Recent",
    });
  }
  return list;
}

export type WorkerShellOverlaysProps = {
  cmdOpen: boolean;
  onCmdOpenChange: (open: boolean) => void;
  shortcutsOpen: boolean;
  onShortcutsOpenChange: (open: boolean) => void;
  notifOpen: boolean;
  onNotifOpenChange: (open: boolean) => void;
  notifications: WorkerNotification[];
  pool: WorkerVessel[];
  activeName: string | null;
  onJumpQueue: () => void;
  onJumpActive: () => void;
  onJumpLog: () => void;
  onJumpPipeline: () => void;
  onPickUp: (id: string) => void;
};

export function WorkerShellOverlays({
  cmdOpen,
  onCmdOpenChange,
  shortcutsOpen,
  onShortcutsOpenChange,
  notifOpen,
  onNotifOpenChange,
  notifications,
  pool,
  activeName,
  onJumpQueue,
  onJumpActive,
  onJumpLog,
  onJumpPipeline,
  onPickUp,
}: WorkerShellOverlaysProps) {
  return (
    <>
      <WorkerCommandPalette
        open={cmdOpen}
        onOpenChange={onCmdOpenChange}
        pool={pool}
        activeName={activeName}
        onJumpQueue={onJumpQueue}
        onJumpActive={onJumpActive}
        onJumpLog={onJumpLog}
        onJumpPipeline={onJumpPipeline}
        onPickUp={onPickUp}
      />
      <WorkerShortcutsSheet open={shortcutsOpen} onOpenChange={onShortcutsOpenChange} />
      <WorkerNotificationDrawer
        open={notifOpen}
        onOpenChange={onNotifOpenChange}
        notifications={notifications}
      />
    </>
  );
}

export type WorkerShellKeyboardProps = {
  begun: boolean;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  onLog: () => void;
  onPipeline: () => void;
  children: ReactNode;
};

export function WorkerShellKeyboard({
  begun,
  onOpenCommandPalette,
  onOpenShortcuts,
  onLog,
  onPipeline,
  children,
}: WorkerShellKeyboardProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenCommandPalette();
      }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        onOpenShortcuts();
      }
      if (begun && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === "l") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        onLog();
      }
      if (begun && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === "p") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        onPipeline();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [begun, onOpenCommandPalette, onOpenShortcuts, onLog, onPipeline]);

  return <>{children}</>;
}
