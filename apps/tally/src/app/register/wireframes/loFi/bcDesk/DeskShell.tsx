/**
 * BC desk shell furniture (items 77–90). Sidebar, header, palettes, drawers.
 */
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { HOLON_INSPECT_ID_ATTR } from "@/app/components/docs/docsHighlight";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { NotionIcon } from "@/app/components/icons/NotionIcon";
import { light } from "@/app/components/tokens";
import { useDocsRegistry } from "@/app/context/DocsRegistryContext";
import { BC_CT } from "@/app/register/holons/registerCtHolons";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { PlantBrandMark } from "@/app/plant/PlantBrandMark";
import { PlantInsetHeader } from "@/app/plant/PlantInsetHeader";
import type { NotionIconName } from "@/app/icons/notion-icon-urls";
import { LoFiButton } from "../LoFiPrimitives";
import { useDeskPalette, usePlantMode } from "../DeskPaletteContext";
import { FurnishFocus } from "../FurnishFocus";
import type { BookedMeeting, Density, Nav, Vessel } from "./types";

function scrollHolonIntoView(id: string) {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      document
        .querySelector(`[${HOLON_INSPECT_ID_ATTR}="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  });
}

const NAV_ITEMS: { id: Nav; label: string; icon: NotionIconName }[] = [
  { id: "campaigns", label: "Campaigns", icon: "list" },
  { id: "meetings", label: "Meetings", icon: "calendar" },
  { id: "escrow", label: "Escrow", icon: "checkmark-list" },
];

export type BcDeskNotification = {
  id: string;
  label: string;
  detail?: string;
  at?: string;
  onClick?: () => void;
};

export type BcDeskSidebarProps = {
  nav: Nav;
  onNav: (nav: Nav) => void;
  sidebarOpen: boolean;
  pendingCount: number;
  /** Reclaim unlocked or Operator replied */
  escrowAlert: boolean;
};

export function BcDeskSidebar({
  nav,
  onNav,
  sidebarOpen,
  pendingCount,
  escrowAlert,
}: BcDeskSidebarProps) {
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
        <PlantBrandMark personaId="client" />
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
                  Business Client
                </div>
              </div>
            ) : null}
          </div>
          {sidebarOpen ? (
            <FurnishFocus persona="bc" n={85} label="You're the payer role chip">
              <div
                className="mt-1.5 inline-flex w-fit rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: loFi.block, color: loFi.label }}
              >
                You&apos;re the payer
              </div>
            </FurnishFocus>
          ) : null}
        </div>
      )}
      {plant && sidebarOpen ? (
        <FurnishFocus persona="bc" n={85} label="You're the payer role chip">
          <div className="px-3 py-2">
            <div
              className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: loFi.block, color: loFi.label }}
            >
              You&apos;re the payer
            </div>
          </div>
        </FurnishFocus>
      ) : null}
      <HolonBoundary
        id={BC_CT.sidebar.id}
        label={BC_CT.sidebar.label}
        t={light}
        style={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}
      >
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const active = nav === item.id;
          const badge =
            item.id === "meetings" && pendingCount > 0
              ? pendingCount
              : item.id === "escrow" && escrowAlert
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
                    <FurnishFocus
                      persona="bc"
                      n={item.id === "meetings" ? 79 : 80}
                      label={
                        item.id === "meetings"
                          ? "Unread needs-you badge on Meetings nav"
                          : "Unread on Escrow: reclaim unlocked or Operator replied"
                      }
                    >
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
      </HolonBoundary>
    </aside>
  );
}

export type BcDeskHeaderProps = {
  nav: Nav;
  vessel: Vessel;
  vessels: Vessel[];
  onVesselChange: (vesselId: string) => void;
  onToggleSidebar: () => void;
  onNavCampaigns: () => void;
  density: Density;
  onDensityChange: (density: Density) => void;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  onOpenNotifications: () => void;
  onOpenDigest: () => void;
};

export function BcDeskHeader({
  nav,
  vessel,
  vessels,
  onVesselChange,
  onToggleSidebar,
  onNavCampaigns,
  density,
  onDensityChange,
  onOpenCommandPalette,
  onOpenShortcuts,
  onOpenNotifications,
  onOpenDigest,
}: BcDeskHeaderProps) {
  const loFi = useDeskPalette();
  const showVesselContext = nav === "meetings" || nav === "escrow";
  const navLabel = NAV_ITEMS.find((i) => i.id === nav)?.label ?? "Campaigns";

  const breadcrumb = showVesselContext ? (
    <FurnishFocus persona="bc" n={78} label="Breadcrumb: Campaigns / vessel / screen">
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <button
                  type="button"
                  onClick={onNavCampaigns}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: loFi.label,
                    fontFamily: "inherit",
                    fontSize: 12,
                  }}
                />
              }
            >
              Campaigns
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span style={{ color: loFi.label, fontSize: 12 }}>{vessel.name}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ fontSize: 12 }}>{navLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </FurnishFocus>
  ) : (
    navLabel
  );

  return (
    <header
      style={{
        height: 48,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 12px",
        background: loFi.frame,
        borderBottom: `1px solid ${loFi.stroke}`,
      }}
    >
      <button
        type="button"
        onClick={onToggleSidebar}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
        style={{
          width: 28,
          height: 28,
          borderRadius: 4,
          border: `1px solid ${loFi.stroke}`,
          background: loFi.chrome,
          cursor: "pointer",
          fontFamily: "inherit",
          color: loFi.ink,
          fontSize: 12,
          flexShrink: 0,
        }}
      >
        ☰
      </button>
      <div className="min-w-0 flex-1">{breadcrumb}</div>
      {showVesselContext && vessels.length > 1 ? (
        <FurnishFocus persona="bc" n={77} label="Vessel context switcher in header">
          <select
            className="h-7 max-w-[140px] truncate rounded-md border px-2 text-[11px]"
            style={{
              borderColor: loFi.stroke,
              background: loFi.white,
              color: loFi.ink,
              fontFamily: "inherit",
            }}
            value={vessel.id}
            onChange={(e) => onVesselChange(e.target.value)}
            aria-label="Switch vessel"
          >
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </FurnishFocus>
      ) : null}
      <div className="flex shrink-0 items-center gap-1">
        <LoFiButton variant="quiet" onClick={onOpenCommandPalette}>
          ⌘K
        </LoFiButton>
        <FurnishFocus persona="bc" n={82} label="Keyboard shortcuts cheat sheet trigger">
          <LoFiButton variant="quiet" onClick={onOpenShortcuts}>
            ?
          </LoFiButton>
        </FurnishFocus>
        <FurnishFocus persona="bc" n={86} label="Density toggle: comfortable / compact">
          <LoFiButton
            variant="quiet"
            onClick={() =>
              onDensityChange(density === "comfortable" ? "compact" : "comfortable")
            }
          >
            {density === "comfortable" ? "Compact" : "Comfort"}
          </LoFiButton>
        </FurnishFocus>
        <LoFiButton variant="quiet" onClick={onOpenNotifications}>
          Alerts
        </LoFiButton>
        <FurnishFocus persona="bc" n={88} label="Email digest preview trigger">
          <LoFiButton variant="quiet" onClick={onOpenDigest}>
            Digest
          </LoFiButton>
        </FurnishFocus>
      </div>
    </header>
  );
}

export type BcDeskCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vessels: Vessel[];
  meetings: BookedMeeting[];
  onJumpVessel: (id: string) => void;
  onJumpMeeting: (id: string) => void;
  onJumpEscrow: () => void;
};

export function BcDeskCommandPalette({
  open,
  onOpenChange,
  vessels,
  meetings,
  onJumpVessel,
  onJumpMeeting,
  onJumpEscrow,
}: BcDeskCommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const q = query.trim().toLowerCase();
  const vesselHits = vessels.filter((v) => !q || v.name.toLowerCase().includes(q));
  const meetingHits = meetings.filter(
    (m) =>
      !q ||
      m.who.toLowerCase().includes(q) ||
      m.company.toLowerCase().includes(q) ||
      `#${m.number}`.includes(q),
  );

  const jump = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 sm:max-w-md">
        <HolonBoundary id={BC_CT.command.id} label={BC_CT.command.label} t={light}>
        <FurnishFocus
          persona="bc"
          n={81}
          label="Command palette: jump vessel / meeting / escrow"
          style={{ display: "block", width: "100%" }}
        >
        <DialogHeader>
          <DialogTitle>Jump to</DialogTitle>
          <DialogDescription>Vessel, meeting, or Escrow</DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="flex max-h-64 flex-col gap-3 overflow-auto text-sm">
          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">Vessels</div>
            {vesselHits.map((v) => (
              <LoFiButton key={v.id} variant="quiet" onClick={() => jump(() => onJumpVessel(v.id))}>
                {v.name}
              </LoFiButton>
            ))}
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">Meetings</div>
            {meetingHits.slice(0, 6).map((m) => (
              <LoFiButton
                key={m.id}
                variant="quiet"
                onClick={() => jump(() => onJumpMeeting(m.id))}
              >
                #{m.number} · {m.who}
              </LoFiButton>
            ))}
          </div>
          <LoFiButton variant="ghost" onClick={() => jump(onJumpEscrow)}>
            Open Escrow
          </LoFiButton>
        </div>
        </FurnishFocus>
        </HolonBoundary>
      </DialogContent>
    </Dialog>
  );
}

export type BcDeskShortcutsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BcDeskShortcutsSheet({ open, onOpenChange }: BcDeskShortcutsSheetProps) {
  const rows = [
    ["⌘K / Ctrl+K", "Command palette"],
    ["j / k", "Move vessels (Campaigns)"],
    ["Enter", "Open Meetings for vessel"],
    ["?", "This sheet"],
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Keyboard shortcuts</SheetTitle>
          <SheetDescription>BC desk only</SheetDescription>
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

export type BcDeskNotificationDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: BcDeskNotification[];
};

export function BcDeskNotificationDrawer({
  open,
  onOpenChange,
  notifications,
}: BcDeskNotificationDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <HolonBoundary id={BC_CT.notif.id} label={BC_CT.notif.label} t={light}>
        <FurnishFocus
          persona="bc"
          n={87}
          label="Notification center drawer"
          style={{ display: "block", width: "100%" }}
        >
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Meetings, reclaim, Operator notes</SheetDescription>
        </SheetHeader>
        {notifications.length === 0 ? (
          <Empty className="border-0 py-8">
            <EmptyHeader>
              <EmptyTitle>Nothing pending</EmptyTitle>
              <EmptyDescription>Alerts for money and meetings land here.</EmptyDescription>
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
        </FurnishFocus>
        </HolonBoundary>
      </SheetContent>
    </Sheet>
  );
}

export type BcDeskDigestPreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vesselName: string;
  pendingCount: number;
  canReclaim: boolean;
};

export function BcDeskDigestPreview({
  open,
  onOpenChange,
  vesselName,
  pendingCount,
  canReclaim,
}: BcDeskDigestPreviewProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <FurnishFocus
          persona="bc"
          n={88}
          label="Email digest preview (what Monday morning looks like)"
          style={{ display: "block", width: "100%" }}
        >
        <SheetHeader>
          <SheetTitle>Monday digest preview</SheetTitle>
          <SheetDescription>What lands in your inbox</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 pt-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">{vesselName}</strong>
          </p>
          {pendingCount > 0 ? (
            <p>
              {pendingCount} meeting{pendingCount === 1 ? "" : "s"} pending your release
              decision.
            </p>
          ) : (
            <p>No pending releases.</p>
          )}
          {canReclaim ? (
            <p>Reclaim is unlocked for unspent hold.</p>
          ) : (
            <p>Hold unchanged. Reclaim window not open yet.</p>
          )}
          <p className="text-xs">Vanity activity omitted.</p>
        </div>
        </FurnishFocus>
      </SheetContent>
    </Sheet>
  );
}

export type BcDeskOnboardingChecklistProps = {
  dismissed: boolean;
  onDismiss: () => void;
  funded: boolean;
  hasMeeting: boolean;
  reclaimAware: boolean;
};

export function BcDeskOnboardingChecklist({
  dismissed,
  onDismiss,
  funded,
  hasMeeting,
  reclaimAware,
}: BcDeskOnboardingChecklistProps) {
  const loFi = useDeskPalette();
  if (dismissed) return null;
  const items = [
    { label: "Fund", done: funded },
    { label: "Meet", done: hasMeeting },
    { label: "Reclaim awareness", done: reclaimAware },
  ];
  if (items.every((i) => i.done)) return null;

  return (
    <FurnishFocus
      persona="bc"
      n={84}
      label="Soft onboarding checklist: Fund · Meet · Reclaim awareness"
      style={{ display: "block", width: "100%" }}
    >
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
    </FurnishFocus>
  );
}

export type BcDeskReclaimedMemorialProps = {
  vessel: Vessel;
  onArchive?: () => void;
};

export function BcDeskReclaimedMemorial({ vessel, onArchive }: BcDeskReclaimedMemorialProps) {
  const loFi = useDeskPalette();
  if (vessel.state !== "reclaimed") return null;
  return (
    <FurnishFocus
      persona="bc"
      n={90}
      label="Empty desk after reclaim: “Vessel closed” memorial card"
      style={{ display: "block", width: "100%" }}
    >
      <Empty className="border py-8" style={{ borderColor: loFi.stroke }}>
        <EmptyHeader>
          <EmptyTitle>Vessel closed</EmptyTitle>
          <EmptyDescription>
            {vessel.name} · reclaimed. Unspent hold returned. Meetings stay in history.
          </EmptyDescription>
        </EmptyHeader>
        {onArchive ? (
          <LoFiButton variant="quiet" onClick={onArchive}>
            Archive
          </LoFiButton>
        ) : null}
      </Empty>
    </FurnishFocus>
  );
}

export type BcDeskDoneForTodayProps = {
  pendingCount: number;
  canReclaim: boolean;
};

export function BcDeskDoneForToday({ pendingCount, canReclaim }: BcDeskDoneForTodayProps) {
  if (pendingCount > 0 || canReclaim) return null;
  return (
    <p className="text-center text-xs text-muted-foreground py-4">
      Desk is done for today. No pending releases. Nothing to reclaim right now.
    </p>
  );
}

export type BcDeskMobileNavProps = {
  nav: Nav;
  onNav: (nav: Nav) => void;
  pendingCount: number;
  escrowAlert: boolean;
};

/** Item 89 — bottom strip for narrow widths. */
export function BcDeskMobileNav({
  nav,
  onNav,
  pendingCount,
  escrowAlert,
}: BcDeskMobileNavProps) {
  const loFi = useDeskPalette();
  return (
    <FurnishFocus
      persona="bc"
      n={89}
      label="Mobile-width strip: bottom nav Campaigns / Meetings / Escrow"
      style={{ display: "block", width: "100%" }}
    >
      <nav
        className="flex shrink-0 border-t md:hidden"
        style={{ borderColor: loFi.stroke, background: loFi.sidebar }}
      >
        {NAV_ITEMS.map((item) => {
          const active = nav === item.id;
          const dot =
            (item.id === "meetings" && pendingCount > 0) ||
            (item.id === "escrow" && escrowAlert);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNav(item.id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]"
              style={{
                background: "transparent",
                border: "none",
                color: active ? loFi.ink : loFi.label,
                fontWeight: active ? 600 : 500,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <NotionIcon name={item.icon} size={18} color={active ? loFi.ink : loFi.label} />
              {item.label}
              {dot ? (
                <span
                  className="absolute right-[calc(50%-18px)] top-1.5 size-1.5 rounded-full"
                  style={{ background: loFi.ink }}
                />
              ) : null}
            </button>
          );
        })}
      </nav>
    </FurnishFocus>
  );
}

export type BcDeskChromeProps = {
  nav: Nav;
  onNav: (nav: Nav) => void;
  vessel: Vessel;
  vessels: Vessel[];
  meetings: BookedMeeting[];
  onVesselChange: (vesselId: string) => void;
  pendingCount: number;
  canReclaim: boolean;
  escrowAlert: boolean;
  density: Density;
  onDensityChange: (density: Density) => void;
  notifications: BcDeskNotification[];
  onboardingDismissed: boolean;
  onDismissOnboarding: () => void;
  funded: boolean;
  hasMeeting: boolean;
  reclaimAware: boolean;
  onJumpMeeting: (id: string) => void;
  children: ReactNode;
  /** Legacy inset header when not using BcDeskHeader chrome */
  useLegacyHeader?: boolean;
};

export function BcDeskChrome({
  nav,
  onNav,
  vessel,
  vessels,
  meetings,
  onVesselChange,
  pendingCount,
  canReclaim,
  escrowAlert,
  density,
  onDensityChange,
  notifications,
  onboardingDismissed,
  onDismissOnboarding,
  funded,
  hasMeeting,
  reclaimAware,
  onJumpMeeting,
  children,
  useLegacyHeader = false,
}: BcDeskChromeProps) {
  const loFi = useDeskPalette();
  const { registerFocus, unregisterFocus } = useDocsRegistry();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [digestOpen, setDigestOpen] = useState(false);

  /** Shell overlays only exist in the DOM while open — furnish clicks must open them first. */
  useLayoutEffect(() => {
    const overlays: { open: boolean; setOpen: (v: boolean) => void; n: number }[] = [
      { open: cmdOpen, setOpen: setCmdOpen, n: 81 },
      { open: shortcutsOpen, setOpen: setShortcutsOpen, n: 82 },
      { open: notifOpen, setOpen: setNotifOpen, n: 87 },
      { open: digestOpen, setOpen: setDigestOpen, n: 88 },
    ];
    const registeredIds: string[] = [];
    for (const { open, setOpen, n } of overlays) {
      if (open) continue;
      const id = furnishFocusId("bc", n);
      registerFocus(id, () => {
        setOpen(true);
        scrollHolonIntoView(id);
      });
      registeredIds.push(id);
    }
    return () => {
      for (const id of registeredIds) unregisterFocus(id);
    };
  }, [cmdOpen, shortcutsOpen, notifOpen, digestOpen, registerFocus, unregisterFocus]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        setShortcutsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const jumpVessel = (id: string) => {
    onVesselChange(id);
    onNav("meetings");
  };

  return (
    <HolonBoundary
      id={BC_CT.desk.id}
      label={BC_CT.desk.label}
      t={light}
      style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: "column" }}
    >
    <div
      className="flex h-full min-h-0 flex-col md:flex-row"
      style={{ background: loFi.frame, color: loFi.ink }}
    >
      <div className="hidden md:flex md:min-h-0 md:flex-1">
        <BcDeskSidebar
          nav={nav}
          onNav={onNav}
          sidebarOpen={sidebarOpen}
          pendingCount={pendingCount}
          escrowAlert={escrowAlert}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {useLegacyHeader ? (
            <PlantInsetHeader
              breadcrumb={NAV_ITEMS.find((i) => i.id === nav)?.label ?? "Campaigns"}
              onToggleSidebar={() => setSidebarOpen((v) => !v)}
            />
          ) : (
            <BcDeskHeader
              nav={nav}
              vessel={vessel}
              vessels={vessels}
              onVesselChange={onVesselChange}
              onToggleSidebar={() => setSidebarOpen((v) => !v)}
              onNavCampaigns={() => onNav("campaigns")}
              density={density}
              onDensityChange={onDensityChange}
              onOpenCommandPalette={() => setCmdOpen(true)}
              onOpenShortcuts={() => setShortcutsOpen(true)}
              onOpenNotifications={() => setNotifOpen(true)}
              onOpenDigest={() => setDigestOpen(true)}
            />
          )}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-4">
            <BcDeskOnboardingChecklist
              dismissed={onboardingDismissed}
              onDismiss={onDismissOnboarding}
              funded={funded}
              hasMeeting={hasMeeting}
              reclaimAware={reclaimAware}
            />
            {children}
            <BcDeskDoneForToday pendingCount={pendingCount} canReclaim={canReclaim} />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <BcDeskHeader
          nav={nav}
          vessel={vessel}
          vessels={vessels}
          onVesselChange={onVesselChange}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onNavCampaigns={() => onNav("campaigns")}
          density={density}
          onDensityChange={onDensityChange}
          onOpenCommandPalette={() => setCmdOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenNotifications={() => setNotifOpen(true)}
          onOpenDigest={() => setDigestOpen(true)}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4">{children}</div>
        <BcDeskMobileNav
          nav={nav}
          onNav={onNav}
          pendingCount={pendingCount}
          escrowAlert={escrowAlert}
        />
      </div>

      <BcDeskCommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        vessels={vessels}
        meetings={meetings}
        onJumpVessel={jumpVessel}
        onJumpMeeting={onJumpMeeting}
        onJumpEscrow={() => {
          onNav("escrow");
          setCmdOpen(false);
        }}
      />
      <BcDeskShortcutsSheet open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <BcDeskNotificationDrawer
        open={notifOpen}
        onOpenChange={setNotifOpen}
        notifications={notifications}
      />
      <BcDeskDigestPreview
        open={digestOpen}
        onOpenChange={setDigestOpen}
        vesselName={vessel.name}
        pendingCount={pendingCount}
        canReclaim={canReclaim}
      />
    </div>
    </HolonBoundary>
  );
}

/** Build default notification list from desk state. */
export function buildBcNotifications(input: {
  pendingCount: number;
  canReclaim: boolean;
  operatorNote: string | null;
  onPending?: () => void;
  onReclaim?: () => void;
}): BcDeskNotification[] {
  const list: BcDeskNotification[] = [];
  if (input.pendingCount > 0) {
    list.push({
      id: "pending",
      label: `${input.pendingCount} pending release${input.pendingCount === 1 ? "" : "s"}`,
      detail: "Meetings waiting on your decision",
      onClick: input.onPending,
    });
  }
  if (input.canReclaim) {
    list.push({
      id: "reclaim",
      label: "Reclaim available",
      detail: "Unspent hold can return to your entity",
      onClick: input.onReclaim,
    });
  }
  if (input.operatorNote) {
    list.push({
      id: "operator",
      label: "Operator replied",
      detail: input.operatorNote,
    });
  }
  return list;
}

export { NAV_ITEMS as BC_DESK_NAV_ITEMS };
