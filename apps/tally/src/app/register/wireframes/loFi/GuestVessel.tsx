/**
 * Guest vessel — same desk shell as Business Client.
 * Landing = Campaigns (invited vessel). Invite+walk are one beat.
 * Facts in UI structure; contractual prose only in Terms.
 * Furnishing: guestDesk/ modules · checklist FURNISHING-guest-checklist.md
 */
import { useLayoutEffect, useMemo, useState } from "react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { GUEST_CT } from "@/app/register/holons/registerCtHolons";
import { HOLON_INSPECT_ID_ATTR } from "@/app/components/docs/docsHighlight";
import { useDocsRegistry } from "@/app/context/DocsRegistryContext";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { LoFiButton } from "./LoFiPrimitives";
import { PERSONA_SEED } from "./LoFiPersonaChrome";
import { useDeskPalette } from "./DeskPaletteContext";
import { FlashNote, FundedAwaitingBanner } from "./guestDesk/AmbientBits";
import { ConvertedReceiptView } from "./guestDesk/ConvertedReceiptView";
import {
  buildGuestNotifications,
  GuestDeskChrome,
  GuestEvaluatorStrip,
} from "./guestDesk/DeskShell";
import {
  AskOperatorDialog,
  DeclineDialog,
  DetailsDoor,
  FaqDoor,
  HistoryDoor,
  InspectDoor,
  RequestsDoor,
  RequestsTray,
  ShareDoor,
  TermsDoor,
} from "./guestDesk/GuestDoors";
import { GuestEscrowView } from "./guestDesk/GuestEscrowView";
import { GuestMeetingsView } from "./guestDesk/GuestMeetingsView";
import { FundEscrowView } from "./guestDesk/FundEscrowView";
import { InviteCampaignsView } from "./guestDesk/InviteCampaignsView";
import { flashMessage, requestKindLabel } from "./guestDesk/helpers";
import {
  SEED_FIRMS,
  SEED_INVITE,
  SEED_REQUESTS,
  SEED_VIEWERS,
} from "./guestDesk/seed";
import type {
  Density,
  GuestDialog,
  GuestFirmRow,
  GuestSheet,
  InspectTab,
  Nav,
  OperatorRequest,
  SavedInvite,
  Stage,
} from "./guestDesk/types";

type Props = {
  onOpenDesk?: () => void;
};

function scrollHolonIntoView(id: string) {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      document
        .querySelector(`[${HOLON_INSPECT_ID_ATTR}="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  });
}

export function GuestVessel({ onOpenDesk }: Props) {
  const loFi = useDeskPalette();
  const { registerFocus, unregisterFocus } = useDocsRegistry();
  const [stage, setStage] = useState<Stage>("campaigns");
  const [nav, setNav] = useState<Nav>("campaigns");
  const [sheet, setSheet] = useState<GuestSheet>(null);
  const [dialog, setDialog] = useState<GuestDialog>(null);
  const [fundN, setFundN] = useState<number>(PERSONA_SEED.meetingsTarget);
  const [firms, setFirms] = useState<GuestFirmRow[]>(SEED_FIRMS);
  const [payment, setPayment] = useState("Business checking");
  const [calendar, setCalendar] = useState("team@northwind.labs");
  const [shareEmail, setShareEmail] = useState("");
  const [shareFlash, setShareFlash] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [exportFlash, setExportFlash] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [addLogoName, setAddLogoName] = useState("");
  const [inspectTab, setInspectTab] = useState<InspectTab>("firms");
  const [requests, setRequests] = useState<OperatorRequest[]>(SEED_REQUESTS);
  const [savedInvite, setSavedInvite] = useState<SavedInvite | null>(null);
  const [reviewedTerms, setReviewedTerms] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [fundedBannerDismissed, setFundedBannerDismissed] = useState(false);
  const [density, setDensity] = useState<Density>("comfortable");
  const [holdStartedAt, setHoldStartedAt] = useState("");

  const invite = SEED_INVITE;
  const holdTotal = fundN * PERSONA_SEED.pricePerMeeting;
  const defaultHold = PERSONA_SEED.escrowTotal;
  const funded = stage === "converted";

  const flash = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(null), 2000);
  };

  const openSheet = (id: GuestSheet) => {
    setSheet(id);
    if (id === "terms") setReviewedTerms(true);
  };

  const askOperator = (kind: "price" | "icp" | "swap") => {
    setDialog(null);
    const at = "Just now";
    setRequests((prev) => [
      ...prev,
      {
        id: `req-${prev.length + 1}`,
        kind,
        label: requestKindLabel(kind),
        status: "noted",
        at,
      },
    ]);
    flash(flashMessage(kind));
  };

  const blockFirm = (id: string) => {
    setFirms((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, blocked: true, blockedBy: "you" as const, note: "Blocked" }
          : f,
      ),
    );
  };

  const requestAdd = () => {
    const name = addLogoName.trim();
    if (!name) return;
    setFirms((prev) => [
      ...prev,
      {
        id: `req-${prev.length}`,
        name,
        requested: true,
        tag: "none" as const,
        blockedBy: null,
        note: "Requested",
      },
    ]);
    setAddLogoName("");
  };

  const cyclePayment = () => {
    setPayment(
      payment === "Business checking"
        ? "Wire"
        : payment === "Wire"
          ? "Card"
          : "Business checking",
    );
  };

  const jumpInvite = () => {
    setStage("campaigns");
    setNav("campaigns");
  };

  const jumpFund = () => {
    setStage("fund");
    setNav("campaigns");
  };

  const jumpConverted = () => {
    setStage("converted");
    setNav("campaigns");
  };

  const handleFund = () => {
    setHoldStartedAt("Jul 25");
    setStage("converted");
    setNav("campaigns");
    flash("Hold placed.");
  };

  const openInspect = (tab: InspectTab) => {
    setInspectTab(tab);
    openSheet("inspect");
  };

  /**
   * Every GUEST_CT catalog id — the taxonomy this desk furnishes — always resolves
   * to its stage/nav (and sheet, where relevant) and scrolls into view, regardless
   * of what the Guest currently has on screen (including a lapsed invite).
   */
  useLayoutEffect(() => {
    const ensureLive = () => {
      if (stage === "lapsed") setStage("campaigns");
    };

    const go = (id: string, action: () => void) => {
      registerFocus(id, () => {
        action();
        scrollHolonIntoView(id);
      });
    };

    go(GUEST_CT.desk.id, () => {});
    go(GUEST_CT.sidebar.id, ensureLive);
    go(GUEST_CT.invite.id, jumpInvite);
    go(GUEST_CT.fund.id, () => {
      ensureLive();
      jumpFund();
    });
    go(GUEST_CT.converted.id, () => {
      ensureLive();
      jumpConverted();
    });
    go(GUEST_CT.meetings.id, () => {
      ensureLive();
      setNav("meetings");
    });
    go(GUEST_CT.escrow.id, () => {
      ensureLive();
      setNav("escrow");
    });
    go(GUEST_CT.terms.id, () => {
      ensureLive();
      setNav("campaigns");
      openSheet("terms");
    });
    go(GUEST_CT.details.id, () => {
      ensureLive();
      setNav("campaigns");
      openSheet("details");
    });
    go(GUEST_CT.firms.id, () => {
      ensureLive();
      setNav("campaigns");
      openInspect("firms");
    });

    return () => {
      for (const ct of Object.values(GUEST_CT)) unregisterFocus(ct.id);
    };
  }, [stage, registerFocus, unregisterFocus]);

  /** Invite / Campaigns vessel-row furniture (items 2–15): revealed by jumping to the invite screen. */
  useLayoutEffect(() => {
    if (nav === "campaigns" && stage === "campaigns") return;
    const ids = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((n) =>
      furnishFocusId("guest", n),
    );
    for (const id of ids) {
      registerFocus(id, () => {
        jumpInvite();
        scrollHolonIntoView(id);
      });
    }
    return () => {
      for (const id of ids) unregisterFocus(id);
    };
  }, [nav, stage, registerFocus, unregisterFocus]);

  /** Firms sheet furniture (items 16–20): revealed by opening Inspect on the right tab. */
  useLayoutEffect(() => {
    if (sheet === "inspect") return;
    const rowIds = [17, 18, 19, 20].map((n) => furnishFocusId("guest", n));
    for (const id of rowIds) {
      registerFocus(id, () => {
        openInspect("firms");
        scrollHolonIntoView(id);
      });
    }
    const sampleId = furnishFocusId("guest", 16);
    registerFocus(sampleId, () => {
      openInspect("samples");
      scrollHolonIntoView(sampleId);
    });
    return () => {
      for (const id of rowIds) unregisterFocus(id);
      unregisterFocus(sampleId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet, registerFocus, unregisterFocus]);

  const notifications = useMemo(
    () =>
      buildGuestNotifications({
        expiresAt: invite.expiresAt,
        note,
        saved: savedInvite !== null,
        onInvite: jumpInvite,
      }),
    [invite.expiresAt, note, savedInvite],
  );

  if (stage === "lapsed") {
    return (
      <HolonBoundary
        id={GUEST_CT.desk.id}
        label={GUEST_CT.desk.label}
        t={light}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          background: loFi.frame,
          color: loFi.ink,
        }}
      >
        <GuestEvaluatorStrip stage="campaigns" onJump={jumpInvite} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 p-4">
          <h1 className="text-base font-semibold">Invite ended</h1>
          <p className="text-xs" style={{ color: loFi.label }}>
            Terms unchanged if Operator re-invites.
          </p>
          <LoFiButton variant="quiet" onClick={jumpInvite}>
            Reset invite
          </LoFiButton>
        </div>
      </HolonBoundary>
    );
  }

  return (
    <HolonBoundary
      id={GUEST_CT.desk.id}
      label={GUEST_CT.desk.label}
      t={light}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: loFi.canvas,
        color: loFi.ink,
      }}
    >
      <GuestDeskChrome
        nav={nav}
        onNav={setNav}
        stage={stage}
        invite={invite}
        density={density}
        onDensityChange={setDensity}
        notifications={notifications}
        onboardingDismissed={onboardingDismissed}
        onDismissOnboarding={() => setOnboardingDismissed(true)}
        reviewedTerms={reviewedTerms}
        funded={funded}
        calendarSet={calendar.trim().length > 0}
        onJumpInvite={jumpInvite}
        onJumpFund={jumpFund}
        onJumpConverted={jumpConverted}
      >
        <FlashNote note={note} />
        <RequestsTray requests={requests} onOpen={() => setSheet("requests")} />

        {funded && !fundedBannerDismissed ? (
          <div className="mb-4">
            <FundedAwaitingBanner onDismiss={() => setFundedBannerDismissed(true)} />
          </div>
        ) : null}

        {nav === "campaigns" && stage === "campaigns" ? (
          <InviteCampaignsView
            invite={invite}
            firms={firms}
            density={density}
            savedInvite={savedInvite}
            viewers={SEED_VIEWERS}
            requests={requests}
            savedFlash={savedFlash}
            onFund={jumpFund}
            onReviewTerms={() => openSheet("terms")}
            onWhyPrice={() => openSheet("details")}
            onInspectFirms={() => openInspect("firms")}
            onShare={() => openSheet("share")}
            onSaveForLater={() => {
              flash("Saved. Terms frozen until expiry.");
              setSavedInvite({ id: "saved1", savedAt: "Just now" });
              setSavedFlash(true);
              window.setTimeout(() => setSavedFlash(false), 1600);
            }}
            onRequestOperator={() => setDialog("ask-operator")}
            onDecline={() => setDialog("decline")}
            onOpenHistory={() => openSheet("history")}
            onOpenFaq={() => openSheet("faq")}
            onOpenRequests={() => setSheet("requests")}
          />
        ) : null}

        {nav === "campaigns" && stage === "fund" ? (
          <FundEscrowView
            invite={invite}
            fundN={fundN}
            onFundNChange={setFundN}
            payment={payment}
            onCyclePayment={cyclePayment}
            exportFlash={exportFlash}
            onFund={handleFund}
            onBack={jumpInvite}
            onOpenTerms={() => openSheet("terms")}
            onExportLawyer={() => {
              flash("Terms exported.");
              setExportFlash(true);
              window.setTimeout(() => setExportFlash(false), 1600);
            }}
          />
        ) : null}

        {nav === "campaigns" && stage === "converted" ? (
          <ConvertedReceiptView
            invite={invite}
            holdTotal={holdTotal}
            calendar={calendar}
            onCalendarChange={setCalendar}
            holdStartedAt={holdStartedAt}
            onOpenDesk={onOpenDesk}
            onReplayInvite={jumpInvite}
          />
        ) : null}

        {nav === "meetings" ? (
          <GuestMeetingsView
            invite={invite}
            stage={stage}
            onOpenFaq={() => openSheet("faq")}
          />
        ) : null}

        {nav === "escrow" ? (
          <GuestEscrowView
            invite={invite}
            stage={stage}
            holdTotal={holdTotal}
            proposedHold={defaultHold}
            onOpenFaq={() => openSheet("faq")}
          />
        ) : null}
      </GuestDeskChrome>

      <TermsDoor
        open={sheet === "terms"}
        onOpenChange={(o) => !o && setSheet(null)}
        invite={invite}
        expiresAt={invite.expiresAt}
      />
      <DetailsDoor
        open={sheet === "details"}
        onOpenChange={(o) => !o && setSheet(null)}
        invite={invite}
      />
      <InspectDoor
        open={sheet === "inspect"}
        onOpenChange={(o) => !o && setSheet(null)}
        firms={firms}
        inspectTab={inspectTab}
        onInspectTabChange={setInspectTab}
        addLogoName={addLogoName}
        onAddLogoNameChange={setAddLogoName}
        onBlockFirm={blockFirm}
        onRequestAdd={requestAdd}
      />
      <ShareDoor
        open={sheet === "share"}
        onOpenChange={(o) => !o && setSheet(null)}
        shareEmail={shareEmail}
        onShareEmailChange={setShareEmail}
        shareFlash={shareFlash}
        onSend={() => {
          setShareFlash(true);
          window.setTimeout(() => {
            setShareFlash(false);
            setSheet(null);
          }, 1000);
        }}
      />
      <HistoryDoor
        open={sheet === "history"}
        onOpenChange={(o) => !o && setSheet(null)}
        invite={invite}
      />
      <FaqDoor open={sheet === "faq"} onOpenChange={(o) => !o && setSheet(null)} />
      <RequestsDoor
        open={sheet === "requests"}
        onOpenChange={(o) => !o && setSheet(null)}
        requests={requests}
      />

      <DeclineDialog
        open={dialog === "decline"}
        onOpenChange={(o) => !o && setDialog(null)}
        onDecline={() => {
          setDialog(null);
          setStage("lapsed");
        }}
      />
      <AskOperatorDialog
        open={dialog === "ask-operator"}
        onOpenChange={(o) => !o && setDialog(null)}
        onAsk={askOperator}
      />
    </HolonBoundary>
  );
}
