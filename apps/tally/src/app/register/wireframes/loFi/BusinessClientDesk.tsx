/**
 * Business Client desk — click-through inhabiting earned Can'ts.
 * Function path unchanged. Furnishing densifies Campaigns / Meetings / Escrow.
 */
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { HOLON_INSPECT_ID_ATTR } from "@/app/components/docs/docsHighlight";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { useDocsHighlight } from "@/app/context/DocsHighlightContext";
import { useDocsRegistry } from "@/app/context/DocsRegistryContext";
import { BC_CT } from "@/app/register/holons/registerCtHolons";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { PERSONA_SEED } from "./LoFiPersonaChrome";
import { LoFiButton } from "./LoFiPrimitives";
import {
  BrandExclusionsCount,
  DeskDoneBanner,
  HoldClockStarted,
  LastReceiptId,
  OperatorCredibilityStrip,
} from "./bcDesk/AmbientBits";
import {
  AlertsDoor,
  DetailsDoor,
  FirmsDoor,
  HistoryDoor,
  PauseWhyDialog,
  StopDoor,
  TalkDoor,
} from "./bcDesk/CampaignDoors";
import {
  CampaignsView,
  type RequestedVessel,
} from "./bcDesk/CampaignsView";
import {
  BcDeskChrome,
  BcDeskReclaimedMemorial,
  buildBcNotifications,
} from "./bcDesk/DeskShell";
import { EscrowView } from "./bcDesk/EscrowView";
import { brandExclusionCount, lastReceiptId } from "./bcDesk/helpers";
import { MeetingSheetBody } from "./bcDesk/MeetingSheetBody";
import { MeetingsView } from "./bcDesk/MeetingsView";
import {
  SEED_FIRMS,
  SEED_MEETINGS,
  SEED_REQUESTS,
  SEED_VESSELS,
} from "./bcDesk/seed";
import type {
  Density,
  DeskSheet,
  MeetingFilter,
  Nav,
  OperatorRequest,
  TimeMode,
} from "./bcDesk/types";

function scrollHolonIntoView(id: string) {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      document
        .querySelector(`[${HOLON_INSPECT_ID_ATTR}="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  });
}

export function BusinessClientDesk() {
  const { registerFocus, unregisterFocus } = useDocsRegistry();
  const { hoveredComponentIds } = useDocsHighlight();
  const [nav, setNav] = useState<Nav>("campaigns");
  const [vessels, setVessels] = useState(SEED_VESSELS);
  const [activeVesselId, setActiveVesselId] = useState("v1");
  const [meetings, setMeetings] = useState(SEED_MEETINGS);
  const [firms, setFirms] = useState(SEED_FIRMS);
  const [filter, setFilter] = useState<MeetingFilter>("all");
  const [sheet, setSheet] = useState<DeskSheet>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>("m2");
  const [reclaimOpen, setReclaimOpen] = useState(false);
  const [operatorDialog, setOperatorDialog] = useState(false);
  const [operatorNote, setOperatorNote] = useState<string | null>(null);
  const [requests, setRequests] = useState<OperatorRequest[]>(SEED_REQUESTS);
  const [pinnedVesselId, setPinnedVesselId] = useState<string | null>("v1");
  const [showArchived, setShowArchived] = useState(false);
  const [requestedVessels, setRequestedVessels] = useState<RequestedVessel[]>([]);
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [pauseTargetId, setPauseTargetId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(() => new Set());
  const [timeMode, setTimeMode] = useState<TimeMode>("relative");
  const [density, setDensity] = useState<Density>("comfortable");
  const [lowMotionDismissed, setLowMotionDismissed] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [reclaimAware, setReclaimAware] = useState(false);
  const [doneBannerDismissed, setDoneBannerDismissed] = useState(false);
  /** Taxonomy preview for furnish #100 when seed still has pending work. */
  const [doneBannerPreviewSticky, setDoneBannerPreviewSticky] = useState(false);
  const [highlightFirmId, setHighlightFirmId] = useState<string | null>(null);

  const vessel = vessels.find((v) => v.id === activeVesselId) ?? vessels[0];
  const selected = meetings.find((m) => m.id === selectedMeetingId) ?? null;

  const releasedCount = meetings.filter((m) => m.status === "released").length;
  const remainingMeetings = Math.max(0, vessel.target - releasedCount);
  const held =
    vessel.state === "reclaimed" ? 0 : remainingMeetings * vessel.price;
  const released = releasedCount * vessel.price;
  const pendingCount = meetings.filter((m) => m.status === "pending").length;
  const canReclaim =
    held > 0 && vessel.state !== "reclaimed" && vessel.reclaimDaysLeft <= 0;
  const escrowAlert = canReclaim || Boolean(operatorNote);

  const doneFurnishId = furnishFocusId("bc", 100);
  const doneNaturally =
    !doneBannerDismissed &&
    pendingCount === 0 &&
    !canReclaim &&
    vessel.state === "running";
  const showDoneBanner =
    doneNaturally ||
    doneBannerPreviewSticky ||
    hoveredComponentIds.includes(doneFurnishId);

  const revealDoneBanner = useCallback(() => {
    setDoneBannerDismissed(false);
    setDoneBannerPreviewSticky(true);
    scrollHolonIntoView(doneFurnishId);
  }, [doneFurnishId]);

  const notifications = useMemo(
    () =>
      buildBcNotifications({
        pendingCount,
        canReclaim,
        operatorNote,
        onPending: () => {
          setNav("meetings");
          setFilter("pending");
        },
        onReclaim: () => {
          setNav("escrow");
          setReclaimOpen(true);
        },
      }),
    [pendingCount, canReclaim, operatorNote],
  );

  const patchVessel = (id: string, patch: Partial<(typeof vessels)[0]>) => {
    setVessels((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const openMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setSheet("meeting");
  };

  const activate = (id: string) => setActiveVesselId(id);

  const acceptRelease = (id: string) => {
    if (releasedCount >= vessel.target) return;
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "released" as const } : m)),
    );
    setSheet(null);
  };

  const dispute = (reason: string, evidence: string) => {
    if (!selected) return;
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === selected.id
          ? {
              ...m,
              status: "disputed" as const,
              evidence: evidence.trim() || undefined,
              disputeReason: reason,
              statusTimeline: [
                ...m.statusTimeline,
                { at: "Now", label: `Disputed · ${reason}` },
              ],
            }
          : m,
      ),
    );
    setSheet(null);
    setNav("meetings");
    setFilter("disputed");
  };

  const cancelPending = (id: string) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: "cancelled" as const,
              statusTimeline: [
                ...m.statusTimeline,
                { at: "Now", label: "Cancelled · no release" },
              ],
            }
          : m,
      ),
    );
    setSheet(null);
  };

  const reclaim = () => {
    patchVessel(vessel.id, { state: "reclaimed", archived: true });
    setReclaimOpen(false);
    setReclaimAware(true);
    setNav("escrow");
  };

  const declineInvite = (id: string) => {
    setVessels((prev) => prev.filter((v) => v.id !== id));
    if (activeVesselId === id) {
      const next = vessels.find((v) => v.id !== id);
      if (next) setActiveVesselId(next.id);
    }
  };

  const openOperatorRequest = () => {
    setSheet(null);
    setOperatorDialog(true);
  };

  const submitOperatorRequest = (kind: "worker" | "angle" | "price") => {
    const label =
      kind === "worker"
        ? "Different Worker"
        : kind === "angle"
          ? "Review angle"
          : "Review price";
    setOperatorDialog(false);
    setRequests((prev) => [
      {
        id: `req-${Date.now()}`,
        kind,
        label,
        status: "noted",
        at: "Just now",
      },
      ...prev,
    ]);
    setOperatorNote(`Noted. Operator will review ${kind === "worker" ? "Worker" : kind}.`);
    window.setTimeout(() => setOperatorNote(null), 2200);
  };

  const pauseTarget = vessels.find((v) => v.id === pauseTargetId) ?? null;

  /** Strip holons in inhabit statements — switch nav then scroll. */
  useLayoutEffect(() => {
    const go = (next: Nav, id: string) => () => {
      setNav(next);
      scrollHolonIntoView(id);
    };
    registerFocus(BC_CT.campaigns.id, go("campaigns", BC_CT.campaigns.id));
    registerFocus(BC_CT.meetings.id, go("meetings", BC_CT.meetings.id));
    registerFocus(BC_CT.escrow.id, go("escrow", BC_CT.escrow.id));
    registerFocus(BC_CT.desk.id, () => scrollHolonIntoView(BC_CT.desk.id));
    registerFocus(BC_CT.sidebar.id, () => scrollHolonIntoView(BC_CT.sidebar.id));
    registerFocus(BC_CT.vesselRow.id, go("campaigns", BC_CT.vesselRow.id));
    registerFocus(BC_CT.meetingRow.id, go("meetings", BC_CT.meetingRow.id));
    registerFocus(BC_CT.meetingSheet.id, () => {
      const mid = selectedMeetingId ?? meetings[0]?.id ?? null;
      if (mid) setSelectedMeetingId(mid);
      setSheet("meeting");
      scrollHolonIntoView(BC_CT.meetingSheet.id);
    });
    registerFocus(BC_CT.reclaim.id, () => {
      setNav("escrow");
      scrollHolonIntoView(BC_CT.reclaim.id);
    });
    const door = (sheetKind: Exclude<DeskSheet, null>, id: string) => () => {
      setSheet(sheetKind);
      scrollHolonIntoView(id);
    };
    registerFocus(BC_CT.detailsDoor.id, door("details", BC_CT.detailsDoor.id));
    registerFocus(BC_CT.firmsDoor.id, door("firms", BC_CT.firmsDoor.id));
    registerFocus(BC_CT.talkDoor.id, door("talk", BC_CT.talkDoor.id));
    registerFocus(BC_CT.alertsDoor.id, door("alerts", BC_CT.alertsDoor.id));
    registerFocus(BC_CT.stopDoor.id, door("stop", BC_CT.stopDoor.id));
    registerFocus(BC_CT.historyDoor.id, door("history", BC_CT.historyDoor.id));
    registerFocus(BC_CT.operatorRequest.id, () => {
      setNav("escrow");
      setOperatorDialog(true);
      scrollHolonIntoView(BC_CT.operatorRequest.id);
    });
    registerFocus(BC_CT.notif.id, () => scrollHolonIntoView(BC_CT.notif.id));
    registerFocus(BC_CT.command.id, () => scrollHolonIntoView(BC_CT.command.id));
    return () => {
      for (const id of [
        BC_CT.campaigns.id,
        BC_CT.meetings.id,
        BC_CT.escrow.id,
        BC_CT.desk.id,
        BC_CT.sidebar.id,
        BC_CT.vesselRow.id,
        BC_CT.meetingRow.id,
        BC_CT.meetingSheet.id,
        BC_CT.reclaim.id,
        BC_CT.detailsDoor.id,
        BC_CT.firmsDoor.id,
        BC_CT.talkDoor.id,
        BC_CT.alertsDoor.id,
        BC_CT.stopDoor.id,
        BC_CT.historyDoor.id,
        BC_CT.operatorRequest.id,
        BC_CT.notif.id,
        BC_CT.command.id,
      ]) {
        unregisterFocus(id);
      }
    };
  }, [registerFocus, unregisterFocus, selectedMeetingId, meetings]);

  /** Furnish #100 end-state only mounts when the desk is actually clear — preview when taxonomy asks. */
  useLayoutEffect(() => {
    if (showDoneBanner) return;
    registerFocus(doneFurnishId, revealDoneBanner);
    return () => unregisterFocus(doneFurnishId);
  }, [showDoneBanner, doneFurnishId, revealDoneBanner, registerFocus, unregisterFocus]);

  /** Campaigns-strip furniture only exists while that nav is active. */
  useLayoutEffect(() => {
    if (nav === "campaigns") return;
    const campaignsFurnishNs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 93, 96];
    const registeredIds: string[] = [];
    for (const n of campaignsFurnishNs) {
      const id = furnishFocusId("bc", n);
      registerFocus(id, () => {
        setNav("campaigns");
        scrollHolonIntoView(id);
      });
      registeredIds.push(id);
    }
    return () => {
      for (const id of registeredIds) unregisterFocus(id);
    };
  }, [nav, registerFocus, unregisterFocus]);

  /** Meetings-strip furniture only exists while that nav is active. */
  useLayoutEffect(() => {
    if (nav === "meetings") return;
    const meetingsFurnishNs = [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 83];
    const registeredIds: string[] = [];
    for (const n of meetingsFurnishNs) {
      const id = furnishFocusId("bc", n);
      registerFocus(id, () => {
        setNav("meetings");
        scrollHolonIntoView(id);
      });
      registeredIds.push(id);
    }
    return () => {
      for (const id of registeredIds) unregisterFocus(id);
    };
  }, [nav, registerFocus, unregisterFocus]);

  /** Escrow-strip furniture only exists while that nav is active. */
  useLayoutEffect(() => {
    if (nav === "escrow") return;
    const escrowFurnishNs = [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 90, 97, 98];
    const registeredIds: string[] = [];
    for (const n of escrowFurnishNs) {
      const id = furnishFocusId("bc", n);
      registerFocus(id, () => {
        setNav("escrow");
        scrollHolonIntoView(id);
      });
      registeredIds.push(id);
    }
    return () => {
      for (const id of registeredIds) unregisterFocus(id);
    };
  }, [nav, registerFocus, unregisterFocus]);

  /** Meeting-sheet furniture only exists in the DOM while that sheet is open. */
  useLayoutEffect(() => {
    if (sheet === "meeting") return;
    const meetingSheetFurnishNs = [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];
    const registeredIds: string[] = [];
    const targetMeetingId = selectedMeetingId ?? meetings[0]?.id ?? null;
    for (const n of meetingSheetFurnishNs) {
      const id = furnishFocusId("bc", n);
      registerFocus(id, () => {
        if (targetMeetingId) setSelectedMeetingId(targetMeetingId);
        setSheet("meeting");
        scrollHolonIntoView(id);
      });
      registeredIds.push(id);
    }
    return () => {
      for (const id of registeredIds) unregisterFocus(id);
    };
  }, [sheet, selectedMeetingId, meetings, registerFocus, unregisterFocus]);

  /** Depth-door furniture only exists in the DOM while its Sheet is open. */
  useLayoutEffect(() => {
    const doorFurnish: { sheetKind: Exclude<DeskSheet, null>; ns: number[] }[] = [
      { sheetKind: "details", ns: [16, 18, 19, 20] },
      { sheetKind: "firms", ns: [21, 22, 23, 24] },
      { sheetKind: "talk", ns: [25, 26] },
      { sheetKind: "alerts", ns: [27, 28, 29] },
      { sheetKind: "stop", ns: [30] },
      { sheetKind: "history", ns: [32] },
    ];
    const registeredIds: string[] = [];
    for (const { sheetKind, ns } of doorFurnish) {
      if (sheet === sheetKind) continue;
      for (const n of ns) {
        const id = furnishFocusId("bc", n);
        registerFocus(id, () => {
          setSheet(sheetKind);
          scrollHolonIntoView(id);
        });
        registeredIds.push(id);
      }
    }
    return () => {
      for (const id of registeredIds) unregisterFocus(id);
    };
  }, [sheet, registerFocus, unregisterFocus]);

  /** Pause dialog furniture (why-paused note) only exists while that dialog is open. */
  useLayoutEffect(() => {
    if (pauseDialogOpen) return;
    const id = furnishFocusId("bc", 31);
    registerFocus(id, () => {
      setPauseTargetId((prev) => prev ?? vessel.id);
      setPauseDialogOpen(true);
      scrollHolonIntoView(id);
    });
    return () => unregisterFocus(id);
  }, [pauseDialogOpen, vessel.id, registerFocus, unregisterFocus]);

  return (
    <BcDeskChrome
      nav={nav}
      onNav={setNav}
      vessel={vessel}
      vessels={vessels}
      meetings={meetings}
      onVesselChange={setActiveVesselId}
      pendingCount={pendingCount}
      canReclaim={canReclaim}
      escrowAlert={escrowAlert}
      density={density}
      onDensityChange={setDensity}
      notifications={notifications}
      onboardingDismissed={onboardingDismissed}
      onDismissOnboarding={() => {
        setOnboardingDismissed(true);
        setReclaimAware(true);
      }}
      funded={vessel.state !== "invited"}
      hasMeeting={meetings.length > 0}
      reclaimAware={reclaimAware}
      onJumpMeeting={openMeeting}
    >
      <div
        className="flex min-h-0 w-full flex-1 flex-col gap-4"
        style={{
          gap: density === "compact" ? 8 : 16,
        }}
      >
        {showDoneBanner ? (
          <div className="flex flex-col gap-2">
            <DeskDoneBanner
              onFocus={revealDoneBanner}
              onDismiss={() => {
                setDoneBannerDismissed(true);
                setDoneBannerPreviewSticky(false);
              }}
            />
            {!doneNaturally ? (
              <p className="text-[11px]" style={{ color: light.textMuted }}>
                Taxonomy preview — seed still has pending releases; this end-state normally
                appears when Pending is 0 and nothing is reclaimable.
              </p>
            ) : null}
          </div>
        ) : null}

        {nav === "campaigns" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <OperatorCredibilityStrip
                priorCount={vessel.priorVesselsWithOperator}
                operatorName={vessel.operatorName}
              />
              <BrandExclusionsCount count={brandExclusionCount(firms)} />
            </div>
            <CampaignsView
              vessels={vessels}
              pinnedVesselId={pinnedVesselId}
              showArchived={showArchived}
              requestedVessels={requestedVessels}
              onActivateVessel={activate}
              onFund={(id) => {
                activate(id);
                patchVessel(id, {
                  state: "held",
                  history: [
                    ...(vessels.find((v) => v.id === id)?.history ?? []),
                    { id: `h-${Date.now()}`, at: "Now", label: "Funded" },
                  ],
                });
              }}
              onReviewTerms={(id) => {
                activate(id);
                setSheet("details");
              }}
              onDecline={declineInvite}
              onOpenMeetings={(id) => {
                activate(id);
                setNav("meetings");
              }}
              onOpenFirms={(id) => {
                activate(id);
                setHighlightFirmId(null);
                setSheet("firms");
              }}
              onOpenDetails={(id) => {
                activate(id);
                setSheet("details");
              }}
              onOpenTalk={(id) => {
                activate(id);
                setSheet("talk");
              }}
              onOpenAlerts={(id) => {
                activate(id);
                setSheet("alerts");
              }}
              onOpenHistory={(id) => {
                activate(id);
                setSheet("history");
              }}
              onPause={(id) => {
                setPauseTargetId(id);
                setPauseDialogOpen(true);
              }}
              onOpenStop={(id) => {
                activate(id);
                setSheet("stop");
              }}
              onPinVessel={setPinnedVesselId}
              onToggleShowArchived={setShowArchived}
              onRequestVessel={(note) => {
                setRequestedVessels((prev) => [
                  {
                    id: `rv-${Date.now()}`,
                    note: note || "Next vessel",
                    at: "Just now",
                  },
                  ...prev,
                ]);
              }}
            />
          </>
        ) : null}

        {nav === "meetings" ? (
          <MeetingsView
            meetings={meetings}
            filter={filter}
            onFilter={setFilter}
            vesselPrice={vessel.price}
            timeMode={timeMode}
            onTimeMode={setTimeMode}
            onOpenMeeting={openMeeting}
            reviewedIds={reviewedIds}
            onToggleReviewed={(id) => {
              setReviewedIds((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              });
            }}
            caption={vessel.name}
          />
        ) : null}

        {nav === "escrow" ? (
          <>
            {vessel.state === "reclaimed" ? (
              <BcDeskReclaimedMemorial
                vessel={vessel}
                onArchive={() => {
                  patchVessel(vessel.id, { archived: true });
                  setNav("campaigns");
                }}
              />
            ) : (
              <EscrowView
                vessel={vessel}
                vessels={vessels}
                meetings={meetings}
                held={held}
                released={released}
                remainingMeetings={remainingMeetings}
                canReclaim={canReclaim}
                onReclaimOpen={() => setReclaimOpen(true)}
                onOperatorRequest={openOperatorRequest}
                requests={requests}
                operatorNote={operatorNote}
                onOpenMeeting={openMeeting}
                onOpenFaq={() => setSheet("faq")}
                onOpenRequests={() => setSheet("requests")}
                onDismissLowMotion={() => setLowMotionDismissed(true)}
                lowMotionDismissed={lowMotionDismissed}
                density={density}
              />
            )}
            <div className="flex flex-wrap gap-4">
              <HoldClockStarted startedAt={vessel.holdStartedAt} />
              <LastReceiptId receiptId={lastReceiptId(meetings)} />
            </div>
          </>
        ) : null}
      </div>

      <Sheet open={sheet === "meeting"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-md">
          {selected ? (
            <HolonBoundary id={BC_CT.meetingSheet.id} label={BC_CT.meetingSheet.label} t={light}>
            <MeetingSheetBody
              meeting={selected}
              vesselPrice={vessel.price}
              vesselTarget={vessel.target}
              releasedCount={releasedCount}
              seniorityRule={PERSONA_SEED.seniority}
              meetingLengthMin={PERSONA_SEED.meetingLengthMin}
              whatCounts={vessel.whatCounts}
              onAccept={() => acceptRelease(selected.id)}
              onDispute={dispute}
              onCancel={() => cancelPending(selected.id)}
              onBrandFlag={(company) => {
                const firm = firms.find((f) => f.name === company);
                setHighlightFirmId(firm?.id ?? null);
                setSheet("firms");
              }}
            />
            </HolonBoundary>
          ) : null}
        </SheetContent>
      </Sheet>

      <DetailsDoor
        open={sheet === "details"}
        onOpenChange={(o) => !o && setSheet(null)}
        vessel={vessel}
        onRequestOperator={openOperatorRequest}
      />
      <FirmsDoor
        open={sheet === "firms"}
        onOpenChange={(o) => !o && setSheet(null)}
        vesselName={vessel.name}
        firms={firms}
        highlightFirmId={highlightFirmId}
        onBlock={(id) =>
          setFirms((prev) =>
            prev.map((x) =>
              x.id === id
                ? { ...x, status: "blocked", blockedBy: "you", note: "Do not contact" }
                : x,
            ),
          )
        }
        onRemove={(id) => setFirms((prev) => prev.filter((x) => x.id !== id))}
      />
      <TalkDoor
        open={sheet === "talk"}
        onOpenChange={(o) => !o && setSheet(null)}
        onFlagBrand={() => {
          setHighlightFirmId(null);
          setSheet("firms");
        }}
      />
      <AlertsDoor
        open={sheet === "alerts"}
        onOpenChange={(o) => !o && setSheet(null)}
      />
      <StopDoor
        open={sheet === "stop"}
        onOpenChange={(o) => !o && setSheet(null)}
        vessel={vessel}
        held={held}
        onStopAndReclaim={() => {
          patchVessel(vessel.id, {
            state: "stopped",
            history: [
              ...vessel.history,
              { id: `h-${Date.now()}`, at: "Now", label: "Stopped" },
            ],
          });
          setSheet(null);
          setReclaimOpen(true);
        }}
        onKeepRunning={() => setSheet(null)}
      />
      <HistoryDoor
        open={sheet === "history"}
        onOpenChange={(o) => !o && setSheet(null)}
        vessel={vessel}
      />

      <Sheet open={sheet === "faq"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent className="flex flex-col gap-4 sm:max-w-md">
          <SheetHeader className="gap-1">
            <SheetTitle>How money works</SheetTitle>
            <SheetDescription>Three facts. No essay.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 text-sm">
            <p>
              <span className="font-medium">Hold.</span> You fund meetings into escrow. Money
              stays until a meeting qualifies.
            </p>
            <p>
              <span className="font-medium">Release.</span> You accept a packet → Worker is paid
              that meeting&apos;s price.
            </p>
            <p>
              <span className="font-medium">Reclaim.</span> Unspent hold returns after the timer.
              No retainers. No ops fees.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "requests"} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent className="flex flex-col gap-4 sm:max-w-md">
          <SheetHeader className="gap-1">
            <SheetTitle>Operator requests</SheetTitle>
            <SheetDescription>Noted · Seen · Closed</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col">
            {requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              requests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between border-b py-2.5 text-sm"
                >
                  <div>
                    <div className="font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground">{r.at}</div>
                  </div>
                  <span className="text-xs capitalize text-muted-foreground">{r.status}</span>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      <PauseWhyDialog
        open={pauseDialogOpen}
        onOpenChange={setPauseDialogOpen}
        vesselId={pauseTargetId}
        vesselName={pauseTarget?.name}
        onConfirm={(id, why) => {
          patchVessel(id, {
            state: "paused",
            pauseWhy: why,
            history: [
              ...(vessels.find((v) => v.id === id)?.history ?? []),
              { id: `h-${Date.now()}`, at: "Now", label: why ? `Paused · ${why}` : "Paused" },
            ],
          });
        }}
      />

      <Dialog open={operatorDialog} onOpenChange={setOperatorDialog}>
        <DialogContent>
          <HolonBoundary id={BC_CT.operatorRequest.id} label={BC_CT.operatorRequest.label} t={light}>
          <DialogHeader>
            <DialogTitle>Request Operator</DialogTitle>
            <DialogDescription>
              Choose what you need. They adjust the vessel.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1 pt-1">
            <LoFiButton variant="quiet" onClick={() => submitOperatorRequest("worker")}>
              Different Worker
            </LoFiButton>
            <LoFiButton variant="quiet" onClick={() => submitOperatorRequest("angle")}>
              Review angle
            </LoFiButton>
            <LoFiButton variant="quiet" onClick={() => submitOperatorRequest("price")}>
              Review price
            </LoFiButton>
          </div>
          <DialogFooter>
            <LoFiButton variant="quiet" onClick={() => setOperatorDialog(false)}>
              Cancel
            </LoFiButton>
          </DialogFooter>
          </HolonBoundary>
        </DialogContent>
      </Dialog>

      <Dialog open={reclaimOpen} onOpenChange={setReclaimOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reclaim unspent hold</DialogTitle>
            <DialogDescription>
              ${held} returns to your entity. Vessel stops. Settlement usually 1–3 business days.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <LoFiButton variant="quiet" onClick={() => setReclaimOpen(false)}>
              Cancel
            </LoFiButton>
            <LoFiButton onClick={reclaim} disabled={held <= 0}>
              Confirm reclaim
            </LoFiButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BcDeskChrome>
  );
}
