/**
 * Worker click-through — book qualified meetings; no client chat.
 * Function: Pick up → Begin → Manage → Log → Pipeline.
 * Furnishing: workerDesk/ modules densify facts, trays, peeks.
 */
import { useLayoutEffect, useMemo, useState } from "react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { useDocsRegistry } from "@/app/context/DocsRegistryContext";
import { HOLON_INSPECT_ID_ATTR } from "@/app/components/docs/docsHighlight";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { WORKER_CT } from "../../holons/registerCtHolons";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { LoFiPanel, LoFiPersonaChrome, type LoFiStage } from "./LoFiPersonaChrome";
import { workerAvailableAdmits } from "../../world/campaignWorld";
import { DeskDoneBanner, WorkerRoleChip } from "./workerDesk/AmbientBits";
import { ActiveView } from "./workerDesk/ActiveView";
import { AvailableView } from "./workerDesk/AvailableView";
import { ClaimedView } from "./workerDesk/ClaimedView";
import { bookedQualifiedCount, lastReceiptId } from "./workerDesk/helpers";
import { LogMeetingView } from "./workerDesk/LogMeetingView";
import { PipelineView } from "./workerDesk/PipelineView";
import {
  SEED_FIRMS,
  SEED_MEETINGS,
  SEED_POOL,
  SEED_TALK,
  WORKER_NAME,
} from "./workerDesk/seed";
import type {
  Density,
  PipelineFilter,
  QueueFilter,
  RecentSubmission,
  TimeMode,
  WorkerMeeting,
  WorkerScreen,
  WorkerSheet,
  WorkerVessel,
} from "./workerDesk/types";
import {
  AlertsDoor,
  DetailsDoor,
  FirmsDoor,
  HistoryDoor,
  PacketPeekDoor,
  TalkDoor,
} from "./workerDesk/WorkerDoors";
import {
  buildWorkerNotifications,
  WorkerHeaderTools,
  WorkerOnboardingChecklist,
  WorkerShellKeyboard,
  WorkerShellOverlays,
} from "./workerDesk/WorkerShell";

type WorkerNav = "queue" | "active" | "pipeline";

const STAGES: LoFiStage[] = [
  { id: "queue", label: "Available", hint: "Launched and unclaimed only" },
  { id: "working", label: "Active", hint: "Locked rules" },
  { id: "log", label: "Log meeting", hint: "Packet + escrow proof" },
  { id: "pipeline", label: "Booked / N", hint: "Honest progress" },
];

function stageFor(screen: WorkerScreen): string {
  if (screen === "queue" || screen === "claimed") return "queue";
  if (screen === "working") return "working";
  if (screen === "log") return "log";
  return "pipeline";
}

function navFor(screen: WorkerScreen): WorkerNav {
  if (screen === "queue" || screen === "claimed") return "queue";
  if (screen === "pipeline") return "pipeline";
  return "active";
}

function scrollHolonIntoView(id: string) {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      document
        .querySelector(`[${HOLON_INSPECT_ID_ATTR}="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  });
}

export function WorkerPrototypeApp() {
  const { registerFocus, unregisterFocus } = useDocsRegistry();
  const [screen, setScreen] = useState<WorkerScreen>("queue");
  const [pool, setPool] = useState<WorkerVessel[]>(SEED_POOL);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [begun, setBegun] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [meetings, setMeetings] = useState<WorkerMeeting[]>([]);
  const [firms, setFirms] = useState(SEED_FIRMS);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>("all");
  const [pinnedId, setPinnedId] = useState<string | null>("v1");
  const [pickedUpAt, setPickedUpAt] = useState<string | null>(null);
  const [lastPickAt, setLastPickAt] = useState<string | null>(null);
  const [claimExpiryNote, setClaimExpiryNote] = useState(true);
  const [who, setWho] = useState("Jordan Blake");
  const [role, setRole] = useState("Director of IT");
  const [pain, setPain] = useState("Q3 pipeline budget owner");
  const [company, setCompany] = useState("Rivera Corp");
  const [size, setSize] = useState("520 employees");
  const [talkTrackUsed, setTalkTrackUsed] = useState("");
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [sheet, setSheet] = useState<WorkerSheet>(null);
  const [sheetVesselId, setSheetVesselId] = useState<string | null>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [timeMode, setTimeMode] = useState<TimeMode>("relative");
  const [density, setDensity] = useState<Density>("comfortable");
  const [digestPref, setDigestPref] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [doneBannerDismissed, setDoneBannerDismissed] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasLoggedOnce, setHasLoggedOnce] = useState(false);

  const active = pool.find((v) => v.id === activeId) ?? null;
  const sheetVessel = pool.find((v) => v.id === sheetVesselId) ?? active;

  const availablePool = useMemo(
    () =>
      workerAvailableAdmits("launched", true)
        ? pool.filter((v) => v.unclaimed && v.id !== activeId)
        : [],
    [pool, activeId],
  );

  const displayMeetings = begun && meetings.length === 0 ? SEED_MEETINGS : meetings;
  /** Packet peek reads from the same synthetic-until-logged list Pipeline renders. */
  const selectedMeeting = displayMeetings.find((m) => m.id === selectedMeetingId) ?? null;
  const booked = bookedQualifiedCount(displayMeetings);
  const target = active?.target ?? SEED_POOL[0].target;

  const pendingRelease = displayMeetings.filter((m) => m.status === "pending_release").length;
  const disputedCount = displayMeetings.filter((m) => m.status === "disputed").length;

  const notifications = useMemo(
    () =>
      buildWorkerNotifications({
        stopped,
        pendingRelease,
        disputed: disputedCount,
        lastReleaseReceipt: lastReceiptId(displayMeetings),
        onPipeline: () => {
          setScreen("pipeline");
          setPipelineFilter("pending");
        },
        onActive: () => setScreen("working"),
      }),
    [stopped, pendingRelease, disputedCount, displayMeetings],
  );

  const showDoneBanner =
    begun &&
    !doneBannerDismissed &&
    booked >= target &&
    pendingRelease === 0 &&
    !stopped;

  const jumpStage = (stageId: string) => {
    if (stageId === "queue") setScreen("queue");
    else if (stageId === "working") {
      if (!activeId && availablePool[0]) pickUp(availablePool[0].id);
      setScreen(begun ? "working" : "claimed");
    } else if (stageId === "log") {
      if (!activeId && availablePool[0]) pickUp(availablePool[0].id);
      if (!begun && activeId) setBegun(true);
      setScreen("log");
    } else {
      if (!activeId && availablePool[0]) pickUp(availablePool[0].id);
      if (!begun && activeId) setBegun(true);
      setScreen("pipeline");
    }
  };

  const onNav = (id: string) => {
    if (id === "queue") setScreen("queue");
    else if (id === "pipeline") {
      if (!begun) setScreen(activeId ? "claimed" : "queue");
      else setScreen("pipeline");
    } else {
      if (!activeId) setScreen("queue");
      else setScreen(begun ? "working" : "claimed");
    }
  };

  const pickUp = (id: string) => {
    setActiveId(id);
    setBegun(false);
    setStopped(false);
    setMeetings([]);
    setPickedUpAt("Just now");
    setLastPickAt("Just now");
    setClaimExpiryNote(true);
    setPool((prev) =>
      prev.map((v) => (v.id === id ? { ...v, unclaimed: false } : v)),
    );
    setScreen("claimed");
  };

  const releaseToPool = () => {
    if (activeId) {
      setPool((prev) =>
        prev.map((v) => (v.id === activeId ? { ...v, unclaimed: true } : v)),
      );
    }
    setActiveId(null);
    setBegun(false);
    setStopped(false);
    setMeetings([]);
    setPickedUpAt(null);
    setScreen("queue");
  };

  const begin = () => {
    setBegun(true);
    setSessionsToday((n) => n + 1);
    setScreen("working");
  };

  const submitMeeting = () => {
    const companyName = company.trim() || "TBD Co";
    const firmSize = size.trim() || undefined;
    setFirms((prev) => {
      const idx = prev.findIndex(
        (f) => f.name.trim().toLowerCase() === companyName.toLowerCase(),
      );
      if (idx === -1) {
        return [
          {
            id: `f-${Date.now()}`,
            name: companyName,
            status: "meeting" as const,
            tag: "none" as const,
            blockedBy: null,
            size: firmSize,
            note: "Added while logging",
          },
          ...prev,
        ];
      }
      return prev.map((f, i) =>
        i === idx
          ? {
              ...f,
              status: "meeting" as const,
              size: firmSize || f.size,
            }
          : f,
      );
    });
    const nextNum = displayMeetings.length + 1;
    const newMeeting: WorkerMeeting = {
      id: `m-new-${Date.now()}`,
      number: nextNum,
      who,
      role,
      company: companyName,
      size: size || "—",
      pain,
      when: "Pending schedule",
      whenAbsolute: "Pending",
      whenRelative: "just logged",
      dayKey: "2026-07-25",
      group: "today",
      status: "pending_release",
      fitSeniority: true,
      fitLength: true,
      attended: true,
      lengthMin: 30,
      timezone: "America/New_York",
      city: "—",
      talkTrackUsed: talkTrackUsed || undefined,
      loggedAt: "Just now",
      statusTimeline: [{ at: "Now", label: "Logged · pending client release" }],
    };
    setMeetings((prev) => [...(prev.length ? prev : SEED_MEETINGS), newMeeting]);
    setRecentSubmissions((prev) => [
      { id: newMeeting.id, who, company: newMeeting.company, at: "Just now" },
      ...prev,
    ].slice(0, 5));
    setHasLoggedOnce(true);
    setScreen("pipeline");
  };

  const openSheet = (kind: WorkerSheet, vesselId?: string) => {
    setSheet(kind);
    setSheetVesselId(vesselId ?? activeId);
  };

  const stripHint = active ? `${active.name} · ${active.company}` : undefined;

  const revealAvailableQueue = () => {
    setScreen("queue");
  };

  /**
   * Every WORKER_CT catalog id — the taxonomy this desk furnishes — always resolves
   * to its screen (picking up a vessel / opening a sheet where needed) and scrolls
   * into view, regardless of what the Worker currently has on screen.
   */
  useLayoutEffect(() => {
    const ensureActiveId = (): string | null => {
      if (activeId) return activeId;
      const candidate = pool.find((v) => v.unclaimed);
      if (candidate) {
        pickUp(candidate.id);
        return candidate.id;
      }
      return null;
    };

    const go = (id: string, action: () => void) => {
      registerFocus(id, () => {
        action();
        scrollHolonIntoView(id);
      });
    };

    go(WORKER_CT.desk.id, () => {});
    go(WORKER_CT.available.id, () => setScreen("queue"));
    go(WORKER_CT.vesselCard.id, () => setScreen("queue"));
    go(WORKER_CT.launchedDot.id, () => setScreen("queue"));
    go(WORKER_CT.claimed.id, () => {
      ensureActiveId();
      setScreen("claimed");
    });
    go(WORKER_CT.active.id, () => {
      if (ensureActiveId() && !begun) setBegun(true);
      setScreen("working");
    });
    go(WORKER_CT.log.id, () => {
      ensureActiveId();
      setScreen("log");
    });
    go(WORKER_CT.companySearch.id, () => {
      ensureActiveId();
      setScreen("log");
    });
    go(WORKER_CT.pipeline.id, () => {
      ensureActiveId();
      setScreen("pipeline");
    });
    go(WORKER_CT.meetingRow.id, () => {
      if (ensureActiveId() && !begun) setBegun(true);
      setScreen("pipeline");
    });
    go(WORKER_CT.details.id, () => openSheet("details", ensureActiveId() ?? pool[0]?.id));
    go(WORKER_CT.firms.id, () => openSheet("firms", ensureActiveId() ?? pool[0]?.id));
    go(WORKER_CT.packet.id, () => {
      ensureActiveId();
      const source = meetings.length ? meetings : SEED_MEETINGS;
      const meetingId = source[0]?.id;
      if (meetingId) setSelectedMeetingId(meetingId);
      setSheet("packet");
    });

    return () => {
      for (const ct of Object.values(WORKER_CT)) unregisterFocus(ct.id);
    };
  }, [activeId, pool, begun, meetings, registerFocus, unregisterFocus]);

  /** Available-queue f-N furniture only exists while that screen is mounted. */
  useLayoutEffect(() => {
    if (screen === "queue") return;
    const availableFurnishNs = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 16];
    for (const n of availableFurnishNs) {
      const id = furnishFocusId("worker", n);
      registerFocus(id, () => {
        setScreen("queue");
        scrollHolonIntoView(id);
      });
    }
    return () => {
      for (const n of availableFurnishNs) {
        unregisterFocus(furnishFocusId("worker", n));
      }
    };
  }, [screen, registerFocus, unregisterFocus]);

  /** Depth-door furniture only exists in the DOM while its Sheet is open. */
  useLayoutEffect(() => {
    const anyVesselId = pool[0]?.id;
    const doorFurnish: { sheetKind: Exclude<WorkerSheet, null>; ns: number[] }[] = [
      { sheetKind: "details", ns: [18, 19, 20] },
      { sheetKind: "firms", ns: [21, 22, 23, 24] },
      { sheetKind: "talk", ns: [25, 26] },
      { sheetKind: "history", ns: [27] },
      { sheetKind: "alerts", ns: [28, 29] },
    ];
    const registeredIds: string[] = [];
    for (const { sheetKind, ns } of doorFurnish) {
      if (sheet === sheetKind) continue;
      for (const n of ns) {
        const id = furnishFocusId("worker", n);
        registerFocus(id, () => {
          openSheet(sheetKind, anyVesselId);
          scrollHolonIntoView(id);
        });
        registeredIds.push(id);
      }
    }
    return () => {
      for (const id of registeredIds) unregisterFocus(id);
    };
  }, [sheet, pool, registerFocus, unregisterFocus]);

  /** Claimed/Begin furniture only exists while a vessel is claimed and on-screen. */
  useLayoutEffect(() => {
    if (screen === "claimed" && active) return;
    const claimedFurnishNs = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42];
    const goClaimed = (n: number) => () => {
      const id = furnishFocusId("worker", n);
      if (!activeId) {
        const candidate = pool.find((v) => v.unclaimed);
        if (candidate) pickUp(candidate.id);
      } else {
        setScreen("claimed");
      }
      scrollHolonIntoView(id);
    };
    for (const n of claimedFurnishNs) {
      registerFocus(furnishFocusId("worker", n), goClaimed(n));
    }
    return () => {
      for (const n of claimedFurnishNs) unregisterFocus(furnishFocusId("worker", n));
    };
  }, [screen, active, activeId, pool, registerFocus, unregisterFocus]);

  const navItems = [
    { id: "queue", label: "Available", icon: "list-bullet" as const },
    {
      id: "active",
      label: "Active",
      icon: "cursor-click" as const,
      badge: activeId ? "·" : undefined,
    },
    {
      id: "pipeline",
      label: "Pipeline",
      icon: "chart-bar-line" as const,
      badge: begun && booked > 0 ? booked : undefined,
    },
  ];

  return (
    <HolonBoundary
      id={WORKER_CT.desk.id}
      label={WORKER_CT.desk.label}
      t={light}
      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
    <WorkerShellKeyboard
      begun={begun}
      onOpenCommandPalette={() => setCmdOpen(true)}
      onOpenShortcuts={() => setShortcutsOpen(true)}
      onLog={() => setScreen("log")}
      onPipeline={() => setScreen("pipeline")}
    >
      <LoFiPersonaChrome
        personaLabel="Worker"
        plantPersonaId="worker"
        stages={STAGES}
        activeStageId={stageFor(screen)}
        onJumpStage={jumpStage}
        stripHint={stripHint}
        navItems={navItems}
        nav={navFor(screen)}
        onNav={onNav}
        roleChip={<WorkerRoleChip />}
      >
        <WorkerHeaderTools
          density={density}
          onDensityChange={setDensity}
          onOpenCommandPalette={() => setCmdOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenNotifications={() => setNotifOpen(true)}
          notifCount={notifications.length}
        />

        <WorkerOnboardingChecklist
          dismissed={onboardingDismissed}
          onDismiss={() => setOnboardingDismissed(true)}
          pickedUp={Boolean(activeId)}
          begun={begun}
          logged={hasLoggedOnce || displayMeetings.some((m) => m.status === "pending_release")}
        />

        {showDoneBanner ? (
          <div className="mb-4">
            <DeskDoneBanner onDismiss={() => setDoneBannerDismissed(true)} />
          </div>
        ) : null}

        {screen === "queue" ? (
          <AvailableView
            pool={availablePool}
            filter={queueFilter}
            onFilter={setQueueFilter}
            pinnedId={pinnedId}
            onPin={setPinnedId}
            hasClaim={Boolean(activeId)}
            lastPickAt={lastPickAt}
            onPickUp={pickUp}
            onOpenDetails={(id) => openSheet("details", id)}
            onOpenFirms={(id) => openSheet("firms", id)}
            onOpenTalk={() => openSheet("talk")}
            onOpenHistory={(id) => openSheet("history", id)}
            onRevealQueue={revealAvailableQueue}
          />
        ) : null}

        {screen === "claimed" && active ? (
          <ClaimedView
            vessel={active}
            pickedUpAt={pickedUpAt ?? "Earlier"}
            claimExpiryNote={claimExpiryNote}
            onDismissExpiry={() => setClaimExpiryNote(false)}
            firms={firms}
            talkLines={SEED_TALK}
            onBegin={begin}
            onRelease={releaseToPool}
            onOpenDetails={() => openSheet("details")}
          />
        ) : null}

        {screen === "claimed" && !active ? (
          <LoFiPanel title="Active" caption="No vessel claimed">
            <Empty className="border-0 py-6">
              <EmptyHeader>
                <EmptyTitle>No active vessel</EmptyTitle>
                <EmptyDescription>Pick up a vessel from Available.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </LoFiPanel>
        ) : null}

        {screen === "working" && active ? (
          <ActiveView
            vessel={active}
            meetings={displayMeetings}
            firms={firms}
            booked={booked}
            stopped={stopped}
            sessionsToday={sessionsToday}
            density={density}
            onLog={() => setScreen("log")}
            onPipeline={() => setScreen("pipeline")}
            onSimulateStop={() => setStopped(true)}
            onRelease={releaseToPool}
            onOpenFirms={() => openSheet("firms")}
            onOpenTalk={() => openSheet("talk")}
            onOpenDetails={() => openSheet("details")}
            onOpenAlerts={() => openSheet("alerts")}
          />
        ) : null}

        {screen === "log" && active ? (
          <LogMeetingView
            vessel={active}
            meetings={displayMeetings}
            firms={firms}
            workerName={WORKER_NAME}
            who={who}
            role={role}
            pain={pain}
            company={company}
            size={size}
            talkTrackUsed={talkTrackUsed}
            recentSubmissions={recentSubmissions}
            onWho={setWho}
            onRole={setRole}
            onPain={setPain}
            onCompany={setCompany}
            onSize={setSize}
            onTalkTrackUsed={setTalkTrackUsed}
            onCreateFirm={({ name, size: firmSize }) => {
              setFirms((prev) => {
                if (prev.some((f) => f.name.trim().toLowerCase() === name.trim().toLowerCase())) {
                  return prev;
                }
                return [
                  {
                    id: `f-${Date.now()}`,
                    name,
                    status: "touched" as const,
                    tag: "none" as const,
                    blockedBy: null,
                    size: firmSize,
                    note: "Added while logging",
                  },
                  ...prev,
                ];
              });
            }}
            onSubmit={submitMeeting}
            onCancel={() => setScreen(begun ? "working" : "claimed")}
          />
        ) : null}

        {screen === "pipeline" && active ? (
          <PipelineView
            vessel={active}
            meetings={displayMeetings}
            booked={booked}
            filter={pipelineFilter}
            onFilter={setPipelineFilter}
            timeMode={timeMode}
            onTimeMode={setTimeMode}
            stopped={stopped}
            onLog={() => setScreen("log")}
            onActive={() => setScreen("working")}
            onOpenPacket={(id) => {
              setSelectedMeetingId(id);
              setSheet("packet");
            }}
          />
        ) : null}
      </LoFiPersonaChrome>

      <DetailsDoor
        open={sheet === "details"}
        onOpenChange={(o) => !o && setSheet(null)}
        vessel={sheetVessel}
      />
      <FirmsDoor
        open={sheet === "firms"}
        onOpenChange={(o) => !o && setSheet(null)}
        firms={firms}
        vesselName={sheetVessel?.name}
      />
      <TalkDoor
        open={sheet === "talk"}
        onOpenChange={(o) => !o && setSheet(null)}
        lines={SEED_TALK}
      />
      <HistoryDoor
        open={sheet === "history"}
        onOpenChange={(o) => !o && setSheet(null)}
        vessel={sheetVessel}
      />
      <AlertsDoor
        open={sheet === "alerts"}
        onOpenChange={(o) => !o && setSheet(null)}
        digest={digestPref}
        onDigest={setDigestPref}
        quietHours={quietHours}
        onQuietHours={setQuietHours}
      />
      <PacketPeekDoor
        open={sheet === "packet"}
        onOpenChange={(o) => !o && setSheet(null)}
        meeting={selectedMeeting}
        workerName={WORKER_NAME}
      />

      <WorkerShellOverlays
        cmdOpen={cmdOpen}
        onCmdOpenChange={setCmdOpen}
        shortcutsOpen={shortcutsOpen}
        onShortcutsOpenChange={setShortcutsOpen}
        notifOpen={notifOpen}
        onNotifOpenChange={setNotifOpen}
        notifications={notifications}
        pool={availablePool}
        activeName={active?.name ?? null}
        onJumpQueue={() => setScreen("queue")}
        onJumpActive={() => onNav("active")}
        onJumpLog={() => jumpStage("log")}
        onJumpPipeline={() => jumpStage("pipeline")}
        onPickUp={pickUp}
      />
    </WorkerShellKeyboard>
    </HolonBoundary>
  );
}
