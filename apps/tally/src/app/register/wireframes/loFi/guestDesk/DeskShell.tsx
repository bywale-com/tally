/**
 * Guest desk shell furniture (checklist items 71–85).
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { GUEST_CT } from "@/app/register/holons/registerCtHolons";
import { PlantBrandMark } from "@/app/plant/PlantBrandMark";
import { NotionIcon } from "@/app/components/icons/NotionIcon";
import type { NotionIconName } from "@/app/icons/notion-icon-urls";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { FurnishFocus } from "../FurnishFocus";
import { LoFiButton } from "../LoFiPrimitives";
import { useDeskPalette, usePlantMode } from "../DeskPaletteContext";
import type { Density, GuestInvite, Nav, Stage } from "./types";

function focusSelf(n: number) {
  return () => {
    window.requestAnimationFrame(() => {
      document
        .querySelector(`[data-holon-id="${furnishFocusId("guest", n)}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };
}

const NAV_ITEMS: { id: Nav; label: string; icon: NotionIconName }[] = [
  { id: "campaigns", label: "Campaigns", icon: "list" },
  { id: "meetings", label: "Meetings", icon: "calendar" },
  { id: "escrow", label: "Escrow", icon: "checkmark-list" },
];

export type GuestDeskNotification = {
  id: string;
  label: string;
  detail?: string;
  onClick?: () => void;
};

export type GuestDeskSidebarProps = {
  nav: Nav;
  onNav: (nav: Nav) => void;
  sidebarOpen: boolean;
  stage: Stage;
  escrowHint: boolean;
};

export function GuestDeskSidebar({
  nav,
  onNav,
  sidebarOpen,
  stage,
  escrowHint,
}: GuestDeskSidebarProps) {
  const loFi = useDeskPalette();
  const plant = usePlantMode();
  const roleChip =
    stage === "converted"
      ? "Funded · not launched"
      : stage === "fund"
        ? "Reviewing fund"
        : "You're invited";

  return (
    <HolonBoundary
      id={GUEST_CT.sidebar.id}
      label={GUEST_CT.sidebar.label}
      t={light}
      style={{
        display: "flex",
        flexShrink: 0,
        flexDirection: "column",
        width: sidebarOpen ? loFi.sidebarW : loFi.sidebarCollapsedW,
        background: loFi.sidebar,
        borderRight: `1px solid ${loFi.stroke}`,
        overflow: "hidden",
        transition: "width 120ms ease",
      }}
    >
      {plant ? (
        <PlantBrandMark personaId="guest" />
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
                  Guest
                </div>
              </div>
            ) : null}
          </div>
          {sidebarOpen ? (
            <FurnishFocus
              persona="guest"
              n={1}
              label="Guest role chip"
              onFocus={focusSelf(1)}
              style={{ marginTop: 6 }}
            >
              <div
                className="w-fit rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: loFi.block, color: loFi.label }}
              >
                {roleChip}
              </div>
            </FurnishFocus>
          ) : null}
        </div>
      )}
      {plant && sidebarOpen ? (
        <div className="px-3 py-2">
          <FurnishFocus
            persona="guest"
            n={1}
            label="Guest role chip"
            onFocus={focusSelf(1)}
          >
            <div
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: loFi.block, color: loFi.label }}
            >
              {roleChip}
            </div>
          </FurnishFocus>
        </div>
      ) : null}
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => {
          const active = nav === item.id;
          const hint = item.id === "escrow" && escrowHint && stage !== "converted";
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
                  {hint ? (
                    <span className="text-[10px]" style={{ color: loFi.muted }}>
                      No hold
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </HolonBoundary>
  );
}

export type GuestEvaluatorStripProps = {
  stage: Stage;
  onJump: (id: "campaigns" | "fund" | "converted") => void;
};

export function GuestEvaluatorStrip({ stage, onJump }: GuestEvaluatorStripProps) {
  const loFi = useDeskPalette();
  const plant = usePlantMode();
  if (plant) return null;

  const evalStage =
    stage === "lapsed" ? "campaigns" : stage === "converted" ? "converted" : stage;

  const stages = [
    { id: "campaigns" as const, label: "Invite" },
    { id: "fund" as const, label: "Fund" },
    { id: "converted" as const, label: "Receipt" },
  ];

  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-1.5 border-b px-3 py-1.5"
      style={{ background: loFi.chrome, borderColor: loFi.stroke }}
    >
      <span
        className="mr-1 text-[9px] font-semibold tracking-wider"
        style={{ color: loFi.muted }}
      >
        EVAL
      </span>
      {stages.map((s) => {
        const active = evalStage === s.id;
        return (
          <button
            key={s.id}
            type="button"
            title={`Jump to ${s.label}`}
            onClick={() => onJump(s.id)}
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 3,
              border: `1px solid ${active ? loFi.ink : loFi.stroke}`,
              background: active ? loFi.block : "transparent",
              color: active ? loFi.ink : loFi.muted,
              fontWeight: active ? 600 : 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

export type GuestDeskOnboardingProps = {
  dismissed: boolean;
  onDismiss: () => void;
  reviewedTerms: boolean;
  funded: boolean;
  calendarSet: boolean;
};

export function GuestDeskOnboarding({
  dismissed,
  onDismiss,
  reviewedTerms,
  funded,
  calendarSet,
}: GuestDeskOnboardingProps) {
  const loFi = useDeskPalette();
  if (dismissed) return null;
  const items = [
    { label: "Review terms", done: reviewedTerms },
    { label: "Fund", done: funded },
    { label: "Calendar", done: calendarSet },
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

export type GuestDeskCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invite: GuestInvite;
  onJumpInvite: () => void;
  onJumpFund: () => void;
  onJumpMeetings: () => void;
  onJumpEscrow: () => void;
};

export function GuestDeskCommandPalette({
  open,
  onOpenChange,
  invite,
  onJumpInvite,
  onJumpFund,
  onJumpMeetings,
  onJumpEscrow,
}: GuestDeskCommandPaletteProps) {
  const jump = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-3 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Jump to</DialogTitle>
          <DialogDescription>{invite.name}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1 text-sm">
          <LoFiButton variant="quiet" onClick={() => jump(onJumpInvite)}>
            Invite · {invite.name}
          </LoFiButton>
          <LoFiButton variant="quiet" onClick={() => jump(onJumpFund)}>
            Fund escrow
          </LoFiButton>
          <LoFiButton variant="quiet" onClick={() => jump(onJumpMeetings)}>
            Meetings
          </LoFiButton>
          <LoFiButton variant="quiet" onClick={() => jump(onJumpEscrow)}>
            Escrow
          </LoFiButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GuestDeskShortcutsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const rows = [
    ["⌘K / Ctrl+K", "Command palette"],
    ["?", "This sheet"],
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Keyboard shortcuts</SheetTitle>
          <SheetDescription>Guest desk only</SheetDescription>
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

export function GuestDeskDigestPreview({
  open,
  onOpenChange,
  inviteName,
  expiresAt,
  funded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteName: string;
  expiresAt: string;
  funded: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Monday digest preview</SheetTitle>
          <SheetDescription>What lands before you fund</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 pt-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">{inviteName}</strong>
          </p>
          {funded ? (
            <p>Hold placed. Launch pending from Operator.</p>
          ) : (
            <p>Invite open until {expiresAt}. Fund to place escrow.</p>
          )}
          <p className="text-xs">No meetings until funded and launched.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function GuestDeskNotificationDrawer({
  open,
  onOpenChange,
  notifications,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: GuestDeskNotification[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Invite, Operator notes</SheetDescription>
        </SheetHeader>
        {notifications.length === 0 ? (
          <Empty className="border-0 py-8">
            <EmptyHeader>
              <EmptyTitle>Nothing pending</EmptyTitle>
              <EmptyDescription>Expiry and Operator notes land here.</EmptyDescription>
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
              </button>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export type GuestDeskChromeProps = {
  nav: Nav;
  onNav: (nav: Nav) => void;
  stage: Stage;
  invite: GuestInvite;
  density: Density;
  onDensityChange: (d: Density) => void;
  notifications: GuestDeskNotification[];
  onboardingDismissed: boolean;
  onDismissOnboarding: () => void;
  reviewedTerms: boolean;
  funded: boolean;
  calendarSet: boolean;
  onJumpInvite: () => void;
  onJumpFund: () => void;
  onJumpConverted: () => void;
  children: ReactNode;
};

export function GuestDeskChrome({
  nav,
  onNav,
  stage,
  invite,
  density,
  onDensityChange,
  notifications,
  onboardingDismissed,
  onDismissOnboarding,
  reviewedTerms,
  funded,
  calendarSet,
  onJumpInvite,
  onJumpFund,
  onJumpConverted,
  children,
}: GuestDeskChromeProps) {
  const loFi = useDeskPalette();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [digestOpen, setDigestOpen] = useState(false);

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

  const navLabel = NAV_ITEMS.find((i) => i.id === nav)?.label ?? "Campaigns";
  const breadcrumb =
    nav === "campaigns" && stage !== "campaigns"
      ? `${navLabel} · ${stage === "fund" ? "Fund" : "Receipt"}`
      : `${navLabel} · ${invite.name}`;

  return (
    <>
      <GuestEvaluatorStrip
        stage={stage}
        onJump={(id) => {
          if (id === "campaigns") onJumpInvite();
          else if (id === "fund") onJumpFund();
          else onJumpConverted();
        }}
      />
      <div className="flex min-h-0 flex-1">
        <GuestDeskSidebar
          nav={nav}
          onNav={onNav}
          sidebarOpen={sidebarOpen}
          stage={stage}
          escrowHint={stage !== "converted"}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
              onClick={() => setSidebarOpen((v) => !v)}
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
            <div className="min-w-0 flex-1 truncate text-xs" style={{ color: loFi.label }}>
              {breadcrumb}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <LoFiButton variant="quiet" onClick={() => setCmdOpen(true)}>
                ⌘K
              </LoFiButton>
              <LoFiButton variant="quiet" onClick={() => setShortcutsOpen(true)}>
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
              <LoFiButton variant="quiet" onClick={() => setNotifOpen(true)}>
                Alerts
              </LoFiButton>
              <LoFiButton variant="quiet" onClick={() => setDigestOpen(true)}>
                Digest
              </LoFiButton>
            </div>
          </header>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-4">
            <GuestDeskOnboarding
              dismissed={onboardingDismissed}
              onDismiss={onDismissOnboarding}
              reviewedTerms={reviewedTerms}
              funded={funded}
              calendarSet={calendarSet}
            />
            {children}
          </div>
        </div>
      </div>

      <GuestDeskCommandPalette
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        invite={invite}
        onJumpInvite={onJumpInvite}
        onJumpFund={onJumpFund}
        onJumpMeetings={() => onNav("meetings")}
        onJumpEscrow={() => onNav("escrow")}
      />
      <GuestDeskShortcutsSheet open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      <GuestDeskNotificationDrawer
        open={notifOpen}
        onOpenChange={setNotifOpen}
        notifications={notifications}
      />
      <GuestDeskDigestPreview
        open={digestOpen}
        onOpenChange={setDigestOpen}
        inviteName={invite.name}
        expiresAt={invite.expiresAt}
        funded={funded}
      />
    </>
  );
}

export function buildGuestNotifications(input: {
  expiresAt: string;
  note: string | null;
  saved: boolean;
  onInvite?: () => void;
}): GuestDeskNotification[] {
  const list: GuestDeskNotification[] = [];
  list.push({
    id: "expiry",
    label: `Invite open until ${input.expiresAt}`,
    detail: "Terms frozen until expiry",
    onClick: input.onInvite,
  });
  if (input.saved) {
    list.push({
      id: "saved",
      label: "Invite saved for later",
      detail: "Terms unchanged until expiry",
    });
  }
  if (input.note) {
    list.push({ id: "flash", label: input.note });
  }
  return list;
}

export { NAV_ITEMS as GUEST_DESK_NAV_ITEMS };
