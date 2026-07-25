import { useEffect, useLayoutEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ExternalLink, Pencil, Sparkles } from "lucide-react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { HOLON_INSPECT_ID_ATTR } from "@/app/components/docs/docsHighlight";
import { light } from "@/app/components/tokens";
import { useDocsRegistry } from "@/app/context/DocsRegistryContext";
import { furnishFocusId } from "@/app/register/outcomes/personaFurnish";
import { OP_CT } from "../../holons/registerCtHolons";
import { FurnishFocus } from "./FurnishFocus";
import { PERSONA_SEED } from "./LoFiPersonaChrome";
import { NotionIcon } from "@/app/components/icons/NotionIcon";
import type { NotionIconName } from "@/app/icons/notion-icon-urls";
import { PlantInsetHeader } from "@/app/plant/PlantInsetHeader";
import {
  CHOREOGRAPHY_STAGES,
  stageForScreen,
  type ChoreographyStage,
  type InviteOrigin,
  type PrototypeCampaign,
  type PrototypeScreenId,
} from "./choreography";
import { LoFiBlock, LoFiButton, LoFiField } from "./LoFiPrimitives";
import { loFi } from "./loFiPalette";
import { usePlantMode, useDeskPalette } from "./DeskPaletteContext";
import {
  EnrichFirmographicsPanel,
  EMPTY_FIRM_FILTERS,
  FirmographicsTable,
} from "./FirmographicsTable";
import {
  BUSINESS_CLIENTS,
  SEED_FIRMS,
  type BusinessClient,
  type FirmRow,
} from "./prototypeFirms";
import {
  backTarget,
  DUMMY_GUEST_EMAIL,
  entryScreenForStage,
  isResumeScreen,
  seedForStage,
} from "./prototypeSeed";
import {
  filterCompanies,
  KNOWN_COMPANIES,
  type PrototypeCompany,
} from "./prototypeCompanies";
import { buildActiveCampaignRow, mergeCampaignRows } from "./opDesk/buildCampaignRows";
import {
  CampaignDoors,
  CreateHelpSheet,
  DossierMoreSheet,
  PauseStopDoors,
} from "./opDesk/CampaignDoors";
import { CampaignsListView } from "./opDesk/CampaignsListView";
import {
  ClientFundFacts,
  DeployChoiceHints,
  DeployRecap,
  ExistingAccountRowFacts,
  InvitePreview,
} from "./opDesk/DeployFurniture";
import {
  CommandPalette,
  NotificationsSheet,
  OpDeskHeaderTools,
  OpDeskSidebar,
  ShortcutsSheet,
} from "./opDesk/DeskShell";
import {
  CreatedPeek,
  CreateFurniture,
  CreatingSubtitle,
  CompanyPickFurniture,
  EvaluateSkeletonFurniture,
} from "./opDesk/CreateFurniture";
import {
  copyDomain,
  DossierHeaderFurniture,
  downloadDossier,
  NotesSummary,
} from "./opDesk/EvaluateFurniture";
import { EnrichHistoryTray, EnrichStatusBar, exportFirms } from "./opDesk/EnrichFurniture";
import { RunningView } from "./opDesk/RunningView";
import {
  EVALUATE_SOURCE_TAGS,
  SEED_ENRICH_RUN,
  SEED_NOTIFICATIONS,
  SEED_SENT_INVITES,
} from "./opDesk/seed";
import { StubNavView } from "./opDesk/StubNavView";
import type { Density, OpCampaignEvent, OpDeskSheet, SentInvite } from "./opDesk/types";

const CREATE_LOAD_MS = 900;
const EVALUATE_LOAD_MS = 1200;
const REANALYZE_MS = 1400;

type NavId = "campaigns" | "meetings" | "messages" | "operations";

function scrollHolonIntoView(id: string) {
  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      document
        .querySelector(`[${HOLON_INSPECT_ID_ATTR}="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 40);
  });
}

/** Screen/stage each planted Furnish item lives on — drives the focus-reveal stub below. */
type FurnishTarget =
  | { kind: "campaigns" }
  | { kind: "sheet"; sheet: Exclude<OpDeskSheet, null> }
  | { kind: "basics" }
  | { kind: "creating" }
  | { kind: "campaign" }
  | { kind: "evaluating" }
  | { kind: "dossier" }
  | { kind: "enriching" }
  | { kind: "firm-list" }
  | { kind: "deploy-choice" }
  | { kind: "invite-guest" }
  | { kind: "invite-existing" }
  | { kind: "client-fund" }
  | { kind: "running" }
  | { kind: "global" }
  | { kind: "command" }
  | { kind: "shortcuts" }
  | { kind: "notifications" };

const FURNISH_TARGETS: Partial<Record<number, FurnishTarget>> = {
  1: { kind: "campaigns" },
  2: { kind: "campaigns" },
  3: { kind: "campaigns" },
  4: { kind: "campaigns" },
  5: { kind: "campaigns" },
  6: { kind: "campaigns" },
  7: { kind: "campaigns" },
  8: { kind: "campaigns" },
  9: { kind: "campaigns" },
  11: { kind: "campaigns" },
  13: { kind: "campaigns" },
  14: { kind: "campaigns" },
  16: { kind: "campaigns" },
  17: { kind: "sheet", sheet: "details" },
  18: { kind: "sheet", sheet: "details" },
  20: { kind: "sheet", sheet: "history" },
  21: { kind: "campaigns" },
  22: { kind: "sheet", sheet: "details" },
  23: { kind: "campaigns" },
  24: { kind: "campaigns" },
  25: { kind: "campaigns" },
  29: { kind: "campaigns" },
  31: { kind: "basics" },
  32: { kind: "basics" },
  33: { kind: "basics" },
  34: { kind: "basics" },
  35: { kind: "creating" },
  36: { kind: "campaign" },
  37: { kind: "basics" },
  40: { kind: "campaign" },
  41: { kind: "campaign" },
  42: { kind: "campaign" },
  43: { kind: "campaign" },
  45: { kind: "evaluating" },
  46: { kind: "evaluating" },
  47: { kind: "dossier" },
  48: { kind: "dossier" },
  49: { kind: "dossier" },
  50: { kind: "dossier" },
  51: { kind: "dossier" },
  52: { kind: "dossier" },
  53: { kind: "dossier" },
  54: { kind: "dossier" },
  55: { kind: "dossier" },
  56: { kind: "enriching" },
  57: { kind: "enriching" },
  58: { kind: "firm-list" },
  59: { kind: "firm-list" },
  60: { kind: "firm-list" },
  64: { kind: "firm-list" },
  65: { kind: "firm-list" },
  66: { kind: "dossier" },
  71: { kind: "deploy-choice" },
  72: { kind: "deploy-choice" },
  74: { kind: "invite-guest" },
  75: { kind: "campaigns" },
  76: { kind: "invite-existing" },
  77: { kind: "invite-existing" },
  78: { kind: "campaigns" },
  80: { kind: "client-fund" },
  81: { kind: "client-fund" },
  82: { kind: "running" },
  83: { kind: "campaigns" },
  84: { kind: "sheet", sheet: "invite-history" },
  85: { kind: "running" },
  86: { kind: "running" },
  87: { kind: "running" },
  88: { kind: "running" },
  89: { kind: "running" },
  90: { kind: "running" },
  91: { kind: "running" },
  92: { kind: "running" },
  94: { kind: "running" },
  95: { kind: "global" },
  96: { kind: "global" },
  97: { kind: "command" },
  98: { kind: "shortcuts" },
  99: { kind: "global" },
  100: { kind: "notifications" },
};

type OperatorPrototypeAppProps = {
  initialScreen?: PrototypeScreenId;
};

function CompanyLogo({
  company,
  size = 28,
}: {
  company: Pick<PrototypeCompany, "initials" | "name"> | Pick<BusinessClient, "initials" | "name">;
  size?: number;
}) {
  return (
    <div
      title={company.name}
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: loFi.ink,
        color: loFi.white,
        fontSize: size < 24 ? 9 : 11,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {company.initials}
    </div>
  );
}

export type { PrototypeCampaign } from "./choreography";

export function OperatorPrototypeApp({ initialScreen = "campaigns" }: OperatorPrototypeAppProps) {
  const plant = usePlantMode();
  useDeskPalette(); // subscribe so plant theme toggles re-render module-loFi readers
  const { registerFocus, unregisterFocus } = useDocsRegistry();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [nav, setNav] = useState<NavId>("campaigns");
  const [screen, setScreen] = useState<PrototypeScreenId>(initialScreen);
  const [draftName, setDraftName] = useState("");
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<PrototypeCampaign | null>(null);
  const [companyQuery, setCompanyQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<PrototypeCompany | null>(null);
  const [companyLocked, setCompanyLocked] = useState(false);
  const [resumeScreen, setResumeScreen] = useState<PrototypeScreenId>("campaign");
  const [firms, setFirms] = useState<FirmRow[]>([]);
  const [inviteSent, setInviteSent] = useState(false);
  const [funded, setFunded] = useState(false);
  const [inviteOrigin, setInviteOrigin] = useState<InviteOrigin>("deploy");
  const [selectedBizClient, setSelectedBizClient] = useState<BusinessClient | null>(
    BUSINESS_CLIENTS[0] ?? null,
  );
  const [guestEmail, setGuestEmail] = useState(DUMMY_GUEST_EMAIL);

  const [pinnedCampaignId, setPinnedCampaignId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [listFilterQuery, setListFilterQuery] = useState("");
  const [sampleArchive, setSampleArchive] = useState<Record<string, boolean>>({});
  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [campaignHistory, setCampaignHistory] = useState<OpCampaignEvent[]>([]);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>(SEED_SENT_INVITES);
  const [deskSheet, setDeskSheet] = useState<OpDeskSheet>(null);
  const [doorCampaignId, setDoorCampaignId] = useState<string | null>(null);
  const [density, setDensity] = useState<Density>("comfortable");
  const [commandOpen, setCommandOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [createHelpOpen, setCreateHelpOpen] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  const activeStage = stageForScreen(screen);

  const campaignRows = useMemo(() => {
    const active = campaign
      ? buildActiveCampaignRow({
          campaign,
          companyName: selectedCompany?.name,
          companyInitials: selectedCompany?.initials,
          hasCompany: Boolean(selectedCompany),
          companyLocked,
          firmCount: firms.filter((f) => !f.removed).length,
          inviteSent,
          funded,
          clientName: selectedBizClient?.name,
          clientEmail: guestEmail,
          history: campaignHistory.length
            ? campaignHistory
            : [{ id: "h0", at: "Today", label: "Created" }],
        })
      : null;
    const overrides: Record<string, { archived?: boolean }> = {};
    for (const [id, archived] of Object.entries(sampleArchive)) {
      if (archived) overrides[id] = { archived: true };
    }
    return mergeCampaignRows(active, overrides);
  }, [
    campaign,
    selectedCompany,
    companyLocked,
    firms,
    inviteSent,
    funded,
    selectedBizClient,
    guestEmail,
    campaignHistory,
    sampleArchive,
  ]);

  const doorCampaign = useMemo(
    () => campaignRows.find((r) => r.id === doorCampaignId) ?? campaignRows[0] ?? null,
    [campaignRows, doorCampaignId],
  );

  function appendHistory(label: string) {
    setCampaignHistory((prev) => [
      ...prev,
      { id: `h-${Date.now()}`, at: "Now", label },
    ]);
  }

  function patchSampleArchive(id: string) {
    setSampleArchive((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  useEffect(() => {
    if (isResumeScreen(screen)) setResumeScreen(screen);
  }, [screen]);

  useEffect(() => {
    if (screen !== "creating" || pendingName == null) return;
    const id = window.setTimeout(() => {
      setCampaign({ id: `camp-${Date.now()}`, name: pendingName });
      setPendingName(null);
      setCompanyQuery("");
      setSelectedCompany(null);
      setCompanyLocked(false);
      setFirms([]);
      setInviteSent(false);
      setFunded(false);
      setSelectedBizClient(BUSINESS_CLIENTS[0] ?? null);
      setInviteOrigin("deploy");
      setResumeScreen("campaign");
      setCampaignHistory([{ id: "h-create", at: "Now", label: "Created" }]);
      setJustCreated(true);
      setScreen("campaign");
    }, CREATE_LOAD_MS);
    return () => window.clearTimeout(id);
  }, [screen, pendingName]);

  useEffect(() => {
    if (screen !== "evaluating") return;
    const id = window.setTimeout(() => {
      setScreen("dossier");
    }, EVALUATE_LOAD_MS);
    return () => window.clearTimeout(id);
  }, [screen]);

  function goCampaigns() {
    setNav("campaigns");
    if (screen === "creating" || screen === "evaluating" || screen === "enriching") return;
    setScreen("campaigns");
  }

  function openCampaign() {
    if (!campaign) return;
    setScreen(companyLocked ? resumeScreen : "campaign");
  }

  function jumpToStage(stage: ChoreographyStage) {
    const seed = seedForStage(stage);
    setCampaign(seed.campaign);
    setSelectedCompany(seed.company);
    setCompanyQuery(seed.companyQuery);
    setCompanyLocked(seed.companyLocked);
    setFirms(seed.firms);
    setFunded(seed.funded);
    setInviteSent(seed.inviteSent);
    setGuestEmail(DUMMY_GUEST_EMAIL);
    setSelectedBizClient(BUSINESS_CLIENTS[0] ?? null);
    setInviteOrigin("deploy");
    setScreen(entryScreenForStage(stage));
    setNav("campaigns");
  }

  function goBack() {
    const prev = backTarget(screen, inviteOrigin);
    if (prev) setScreen(prev);
  }

  function openInviteFromList(kind: "guest" | "existing") {
    setInviteOrigin("list");
    setScreen(kind === "guest" ? "invite-guest" : "invite-existing");
  }

  function openInviteFromDeploy(kind: "guest" | "existing") {
    setInviteOrigin("deploy");
    setScreen(kind === "guest" ? "invite-guest" : "invite-existing");
  }

  function openCreate() {
    setNav("campaigns");
    setDraftName("");
    setScreen("basics");
  }

  function resetPrototype() {
    setDraftName("");
    setPendingName(null);
    setCampaign(null);
    setCompanyQuery("");
    setSelectedCompany(null);
    setCompanyLocked(false);
    setResumeScreen("campaign");
    setFirms([]);
    setInviteSent(false);
    setFunded(false);
    setInviteOrigin("deploy");
    setSelectedBizClient(BUSINESS_CLIENTS[0] ?? null);
    setCampaignHistory([]);
    setJustCreated(false);
    setScreen("campaigns");
    setNav("campaigns");
  }

  function confirmCreate() {
    const name = draftName.trim() || "Untitled campaign";
    setRecentNames((prev) => [name, ...prev.filter((n) => n !== name)].slice(0, 6));
    setPendingName(name);
    setScreen("creating");
  }

  function startEvaluate() {
    if (!selectedCompany) return;
    setCompanyLocked(true);
    appendHistory("Evaluated");
    setScreen("evaluating");
  }

  function startEnrich() {
    setFirms([]);
    appendHistory("Enrich started");
    setScreen("enriching");
  }

  /**
   * Furnish focus stub — the live map / hover-highlight can ask to focus an
   * `op-ct-f-{n}` holon whose screen isn't currently mounted. Navigate to the
   * screen that plants it, then scroll it into view once it lands.
   */
  function revealFurnish(n: number) {
    const target = FURNISH_TARGETS[n];
    if (!target) return;
    switch (target.kind) {
      case "campaigns":
        setNav("campaigns");
        setScreen("campaigns");
        break;
      case "sheet":
        setNav("campaigns");
        setScreen("campaigns");
        setDeskSheet(target.sheet);
        break;
      case "basics":
        setNav("campaigns");
        setScreen("basics");
        break;
      case "creating":
        setNav("campaigns");
        setScreen("creating");
        break;
      case "campaign":
        jumpToStage("disco");
        setScreen("campaign");
        break;
      case "evaluating":
        jumpToStage("disco");
        setScreen("evaluating");
        break;
      case "dossier":
        jumpToStage("disco");
        setScreen("dossier");
        break;
      case "enriching":
        jumpToStage("off-call");
        setScreen("enriching");
        break;
      case "firm-list":
        jumpToStage("off-call");
        setScreen("firm-list");
        break;
      case "deploy-choice":
        jumpToStage("demo");
        setScreen("deploy-choice");
        break;
      case "invite-guest":
        jumpToStage("demo");
        setScreen("invite-guest");
        break;
      case "invite-existing":
        jumpToStage("demo");
        setScreen("invite-existing");
        break;
      case "client-fund":
        jumpToStage("demo");
        setScreen("client-fund");
        break;
      case "running":
        jumpToStage("demo");
        setScreen("running");
        break;
      case "command":
        setCommandOpen(true);
        break;
      case "shortcuts":
        setShortcutsOpen(true);
        break;
      case "notifications":
        setNotifOpen(true);
        break;
      case "global":
        break;
    }
    scrollHolonIntoView(furnishFocusId("op", n));
  }

  /** Every planted Furnish item gets a reveal stub, whether or not its screen is mounted right now. */
  useLayoutEffect(() => {
    const ns = Object.keys(FURNISH_TARGETS).map(Number);
    for (const n of ns) {
      registerFocus(furnishFocusId("op", n), () => revealFurnish(n));
    }
    return () => {
      for (const n of ns) unregisterFocus(furnishFocusId("op", n));
    };
  });

  /** Catalog strip holons in inhabit statements — stage/screen + scroll. */
  useLayoutEffect(() => {
    registerFocus(OP_CT.desk.id, () => scrollHolonIntoView(OP_CT.desk.id));
    registerFocus(OP_CT.campaigns.id, () => {
      setNav("campaigns");
      setScreen("campaigns");
      scrollHolonIntoView(OP_CT.campaigns.id);
    });
    registerFocus(OP_CT.campaignRow.id, () => {
      setNav("campaigns");
      setScreen("campaigns");
      scrollHolonIntoView(OP_CT.campaignRow.id);
    });
    registerFocus(OP_CT.create.id, () => {
      setNav("campaigns");
      setScreen("basics");
      scrollHolonIntoView(OP_CT.create.id);
    });
    registerFocus(OP_CT.evaluate.id, () => {
      jumpToStage("disco");
      setScreen("evaluating");
      scrollHolonIntoView(OP_CT.evaluate.id);
    });
    registerFocus(OP_CT.companySearch.id, () => {
      jumpToStage("disco");
      setSelectedCompany(null);
      setCompanyQuery("");
      setCompanyLocked(false);
      setScreen("campaign");
      scrollHolonIntoView(OP_CT.companySearch.id);
    });
    registerFocus(OP_CT.enrich.id, () => {
      jumpToStage("off-call");
      setScreen("enriching");
      scrollHolonIntoView(OP_CT.enrich.id);
    });
    registerFocus(OP_CT.deploy.id, () => {
      jumpToStage("demo");
      setScreen("deploy-choice");
      scrollHolonIntoView(OP_CT.deploy.id);
    });
    registerFocus(OP_CT.running.id, () => {
      jumpToStage("demo");
      setScreen("running");
      scrollHolonIntoView(OP_CT.running.id);
    });
    registerFocus(OP_CT.invite.id, () => {
      jumpToStage("demo");
      setScreen("invite-guest");
      scrollHolonIntoView(OP_CT.invite.id);
    });
    return () => {
      for (const id of [
        OP_CT.desk.id,
        OP_CT.campaigns.id,
        OP_CT.campaignRow.id,
        OP_CT.create.id,
        OP_CT.evaluate.id,
        OP_CT.companySearch.id,
        OP_CT.enrich.id,
        OP_CT.deploy.id,
        OP_CT.running.id,
        OP_CT.invite.id,
      ]) {
        unregisterFocus(id);
      }
    };
  }, [registerFocus, unregisterFocus]);

  const breadcrumb = breadcrumbFor(screen, campaign?.name);

  return (
    <HolonBoundary
      id={OP_CT.desk.id}
      label={OP_CT.desk.label}
      order={0}
      t={light}
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        background: loFi.canvas,
        borderTop: `1px solid ${loFi.stroke}`,
        overflow: "hidden",
      }}
    >
      <Sidebar
        sidebarOpen={sidebarOpen}
        nav={nav}
        onNav={(item) => {
          if (item === "campaigns") goCampaigns();
          else setNav(item);
        }}
      />

      <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "stretch", flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <PlantInsetHeader
              breadcrumb={breadcrumb}
              onToggleSidebar={() => setSidebarOpen((v) => !v)}
            />
          </div>
          {!plant ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                borderBottom: `1px solid ${loFi.stroke}`,
                background: loFi.frame,
              }}
            >
              <OpDeskHeaderTools
                density={density}
                onDensityChange={setDensity}
                onOpenCommand={() => setCommandOpen(true)}
                onOpenShortcuts={() => setShortcutsOpen(true)}
                onOpenNotifications={() => setNotifOpen(true)}
              />
            </div>
          ) : null}
        </div>

        {!plant ? (
          <ChoreographyStageBar active={activeStage} screen={screen} onJump={jumpToStage} />
        ) : null}

        <main
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: density === "compact" ? 12 : 16,
            background: loFi.canvas,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {nav !== "campaigns" ? (
            <StubNavView nav={nav} />
          ) : (
            <FlowBody
              screen={screen}
              campaign={campaign}
              draftName={draftName}
              setDraftName={setDraftName}
              pendingName={pendingName}
              companyQuery={companyQuery}
              setCompanyQuery={setCompanyQuery}
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
              firms={firms}
              setFirms={setFirms}
              funded={funded}
              inviteSent={inviteSent}
              selectedBizClient={selectedBizClient}
              setSelectedBizClient={setSelectedBizClient}
              inviteOrigin={inviteOrigin}
              companyLocked={companyLocked}
              guestEmail={guestEmail}
              setGuestEmail={setGuestEmail}
              density={density}
              recentNames={recentNames}
              justCreated={justCreated}
              onClearJustCreated={() => setJustCreated(false)}
              onOpenCreateHelp={() => setCreateHelpOpen(true)}
              onOpenDeskSheet={setDeskSheet}
              campaignRows={campaignRows}
              listFilterQuery={listFilterQuery}
              onListFilterQueryChange={setListFilterQuery}
              pinnedCampaignId={pinnedCampaignId}
              onPinCampaign={setPinnedCampaignId}
              showArchived={showArchived}
              onToggleShowArchived={setShowArchived}
              sentInvites={sentInvites}
              onOpenDetails={(id) => {
                setDoorCampaignId(id);
                setDeskSheet("details");
              }}
              onOpenHistory={(id) => {
                setDoorCampaignId(id);
                setDeskSheet("history");
              }}
              onOpenInviteHistory={() => setDeskSheet("invite-history")}
              onArchiveCampaign={(id) => {
                if (campaign && id === campaign.id) return;
                patchSampleArchive(id);
              }}
              onDuplicateCampaign={(name) => {
                setDraftName(`${name} (copy)`);
                openCreate();
              }}
              onOpenCreate={openCreate}
              onCancelBasics={() => {
                if (campaign) openCampaign();
                else setScreen("campaigns");
              }}
              onConfirm={confirmCreate}
              onOpenCampaign={openCampaign}
              onBackToList={goCampaigns}
              onGoBack={goBack}
              onStartEvaluate={startEvaluate}
              onStartEnrich={startEnrich}
              onEnrichComplete={() => {
                const count = firms.filter((f) => !f.removed).length;
                appendHistory(`Enriched · ${count} firms`);
                setScreen("firm-list");
              }}
              onDeploy={() => {
                setInviteOrigin("deploy");
                setScreen("deploy-choice");
              }}
              onInviteGuest={() => openInviteFromDeploy("guest")}
              onInviteExisting={() => openInviteFromDeploy("existing")}
              onListInviteGuest={() => openInviteFromList("guest")}
              onListInviteExisting={() => openInviteFromList("existing")}
              onSendInvite={() => {
                const kind = screen === "invite-guest" ? "guest" : "existing";
                const to =
                  kind === "guest"
                    ? guestEmail
                    : (selectedBizClient?.name ?? "Client");
                setSentInvites((prev) => [
                  {
                    id: `si-${Date.now()}`,
                    campaignName: campaign?.name ?? "Campaign",
                    kind,
                    to,
                    at: "Now",
                    status: "sent",
                  },
                  ...prev,
                ]);
                appendHistory(
                  kind === "guest" ? `Invite sent · ${guestEmail}` : `Invite sent · ${selectedBizClient?.name ?? "Client"}`,
                );
                setInviteSent(true);
                setResumeScreen("firm-list");
                setNav("campaigns");
                setScreen("campaigns");
              }}
              onShowClientFund={() => setScreen("client-fund")}
              onClientFunded={() => {
                setFunded(true);
                appendHistory("Funded + launched");
                setSentInvites((prev) =>
                  prev.map((inv, i) => (i === 0 ? { ...inv, status: "funded" as const } : inv)),
                );
                setScreen("running");
              }}
              onReset={resetPrototype}
            />
          )}
        </main>
      </div>

      <CampaignDoors
        sheet={deskSheet}
        onClose={() => setDeskSheet(null)}
        campaign={doorCampaign}
        sentInvites={sentInvites}
      />
      <PauseStopDoors sheet={deskSheet} onClose={() => setDeskSheet(null)} />
      <CreateHelpSheet open={createHelpOpen} onClose={() => setCreateHelpOpen(false)} />
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        campaigns={campaignRows}
        onJumpCreate={openCreate}
        onJumpCampaign={() => openCampaign()}
        onJumpStage={jumpToStage}
      />
      <ShortcutsSheet open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <NotificationsSheet
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={SEED_NOTIFICATIONS}
      />
    </HolonBoundary>
  );
}

function breadcrumbFor(screen: PrototypeScreenId, campaignName?: string): string {
  const camp = campaignName ?? "…";
  switch (screen) {
    case "basics":
    case "creating":
      return "Campaigns / New";
    case "evaluating":
    case "dossier":
      return `Campaigns / ${camp} / Evaluate`;
    case "enriching":
    case "firm-list":
    case "deploy-choice":
      return `Campaigns / ${camp} / Enrich`;
    case "invite-guest":
    case "invite-existing":
    case "client-fund":
      return `Campaigns / ${camp} / Deploy`;
    case "running":
      return `Campaigns / ${camp} / Running`;
    case "campaign":
      return `Campaigns / ${camp}`;
    default:
      return "Campaigns";
  }
}

function ChoreographyStageBar({
  active,
  screen,
  onJump,
}: {
  active: ChoreographyStage;
  screen: PrototypeScreenId;
  onJump: (stage: ChoreographyStage) => void;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        padding: "8px 12px",
        borderBottom: `1px solid ${loFi.stroke}`,
        background: loFi.chrome,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: loFi.muted,
          letterSpacing: "0.06em",
          marginRight: 4,
        }}
      >
        STAGE
      </span>
      {CHOREOGRAPHY_STAGES.map((s) => {
        const isActive = s.id === active;
        return (
          <button
            key={s.id}
            type="button"
            title={`Jump to ${s.label}: ${s.hint}`}
            onClick={() => onJump(s.id)}
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 4,
              border: `1px solid ${isActive ? loFi.ink : loFi.stroke}`,
              background: isActive ? loFi.ink : loFi.frame,
              color: isActive ? loFi.white : loFi.label,
              fontWeight: isActive ? 600 : 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        );
      })}
      <span style={{ marginLeft: "auto", fontSize: 10, color: loFi.muted }}>
        {stripLabelFor(screen)}
      </span>
    </div>
  );
}

function stripLabelFor(screen: PrototypeScreenId): string {
  const map: Partial<Record<PrototypeScreenId, string>> = {
    campaigns: "—",
    basics: "Create",
    creating: "Create",
    campaign: "Create → Evaluate",
    evaluating: "Evaluate",
    dossier: "Evaluate",
    enriching: "Enrich",
    "firm-list": "Enrich · firm list",
    "deploy-choice": "Deploy",
    "invite-guest": "Invite guest",
    "invite-existing": "Invite existing",
    "client-fund": "Client fund",
    running: "Running",
  };
  return map[screen] ?? "";
}

function Sidebar({
  sidebarOpen,
  nav,
  onNav,
}: {
  sidebarOpen: boolean;
  nav: NavId;
  onNav: (id: NavId) => void;
}) {
  void sidebarOpen;
  return (
    <OpDeskSidebar
      nav={nav}
      onNav={onNav}
      sidebarOpen={sidebarOpen}
      meetingsBadge={2}
      messagesDot
    />
  );
}

type FlowBodyProps = {
  screen: PrototypeScreenId;
  campaign: PrototypeCampaign | null;
  draftName: string;
  setDraftName: (v: string) => void;
  pendingName: string | null;
  companyQuery: string;
  setCompanyQuery: (v: string) => void;
  selectedCompany: PrototypeCompany | null;
  setSelectedCompany: (c: PrototypeCompany | null) => void;
  companyLocked: boolean;
  firms: FirmRow[];
  setFirms: React.Dispatch<React.SetStateAction<FirmRow[]>>;
  funded: boolean;
  inviteSent: boolean;
  selectedBizClient: BusinessClient | null;
  setSelectedBizClient: (c: BusinessClient | null) => void;
  inviteOrigin: InviteOrigin;
  guestEmail: string;
  setGuestEmail: (v: string) => void;
  density: Density;
  recentNames: string[];
  justCreated: boolean;
  onClearJustCreated: () => void;
  onOpenCreateHelp: () => void;
  onOpenDeskSheet: (sheet: OpDeskSheet) => void;
  campaignRows: ReturnType<typeof mergeCampaignRows>;
  listFilterQuery: string;
  onListFilterQueryChange: (q: string) => void;
  pinnedCampaignId: string | null;
  onPinCampaign: (id: string | null) => void;
  showArchived: boolean;
  onToggleShowArchived: (show: boolean) => void;
  sentInvites: SentInvite[];
  onOpenDetails: (id: string) => void;
  onOpenHistory: (id: string) => void;
  onOpenInviteHistory: () => void;
  onArchiveCampaign: (id: string) => void;
  onDuplicateCampaign: (name: string) => void;
  onOpenCreate: () => void;
  onCancelBasics: () => void;
  onConfirm: () => void;
  onOpenCampaign: () => void;
  onBackToList: () => void;
  onGoBack: () => void;
  onStartEvaluate: () => void;
  onStartEnrich: () => void;
  onEnrichComplete: () => void;
  onDeploy: () => void;
  onInviteGuest: () => void;
  onInviteExisting: () => void;
  onListInviteGuest: () => void;
  onListInviteExisting: () => void;
  onSendInvite: () => void;
  onShowClientFund: () => void;
  onClientFunded: () => void;
  onReset: () => void;
};

function FlowBody(props: FlowBodyProps) {
  const {
    screen,
    campaign,
    draftName,
    setDraftName,
    pendingName,
    companyQuery,
    setCompanyQuery,
    selectedCompany,
    setSelectedCompany,
    firms,
    setFirms,
    funded,
    inviteSent,
    selectedBizClient,
    setSelectedBizClient,
    inviteOrigin,
    companyLocked,
    guestEmail,
    setGuestEmail,
    recentNames,
    justCreated,
    onClearJustCreated,
    onOpenCreateHelp,
    onOpenDeskSheet,
    campaignRows,
    listFilterQuery,
    onListFilterQueryChange,
    pinnedCampaignId,
    onPinCampaign,
    showArchived,
    onToggleShowArchived,
    sentInvites,
    onOpenDetails,
    onOpenHistory,
    onOpenInviteHistory,
    onArchiveCampaign,
    onDuplicateCampaign,
    onOpenCreate,
    onCancelBasics,
    onConfirm,
    onOpenCampaign,
    onBackToList,
    onGoBack,
    onStartEvaluate,
    onStartEnrich,
    onEnrichComplete,
    onDeploy,
    onInviteGuest,
    onInviteExisting,
    onListInviteGuest,
    onListInviteExisting,
    onSendInvite,
    onShowClientFund,
    onClientFunded,
    onReset,
  } = props;

  const activeFirmCount = firms.filter((f) => !f.removed).length;
  const prunedCount = firms.filter((f) => f.removed).length;
  const showInviteMenu = Boolean(campaign && companyLocked);
  const showWaitStatus = Boolean(campaign && inviteSent && !funded);

  const listView = (dimmed?: boolean) => (
    <CampaignsListView
      rows={campaignRows}
      activeCampaignId={campaign?.id ?? null}
      pinnedId={pinnedCampaignId}
      showArchived={showArchived}
      filterQuery={listFilterQuery}
      sentInvites={sentInvites}
      onFilterQueryChange={onListFilterQueryChange}
      onToggleShowArchived={onToggleShowArchived}
      onPin={onPinCampaign}
      onOpenCreate={onOpenCreate}
      onOpenCampaign={() => onOpenCampaign()}
      onOpenDetails={onOpenDetails}
      onOpenHistory={onOpenHistory}
      onOpenInviteHistory={onOpenInviteHistory}
      onArchive={onArchiveCampaign}
      onDuplicate={onDuplicateCampaign}
      onListInviteGuest={showInviteMenu ? onListInviteGuest : undefined}
      onListInviteExisting={showInviteMenu ? onListInviteExisting : undefined}
      onShowClientFund={showWaitStatus ? onShowClientFund : undefined}
      showWaitStatus={showWaitStatus}
      showInviteMenu={showInviteMenu}
      dimmed={dimmed}
    />
  );

  const canGoBack = backTarget(screen, inviteOrigin) !== null;
  const frameBack = canGoBack ? onGoBack : onBackToList;

  useEffect(() => {
    if (screen === "campaign" && justCreated) {
      const t = window.setTimeout(onClearJustCreated, 5000);
      return () => window.clearTimeout(t);
    }
  }, [screen, justCreated, onClearJustCreated]);

  if (screen === "creating") {
    return (
      <>
        {listView(true)}
        <HolonBoundary
          id={OP_CT.create.id}
          label={OP_CT.create.label}
          parentId={OP_CT.desk.id}
          order={2}
          t={light}
          registerOnly
        >
          <SheetShell>
            <CenterLoad
              title={pendingName ?? "…"}
              subtitle={<CreatingSubtitle name={pendingName ?? "…"} />}
            />
          </SheetShell>
        </HolonBoundary>
      </>
    );
  }

  if (screen === "basics") {
    const canConfirm = draftName.trim().length > 0;
    return (
      <>
        {listView(true)}
        <HolonBoundary
          id={OP_CT.create.id}
          label={OP_CT.create.label}
          parentId={OP_CT.desk.id}
          order={2}
          t={light}
          registerOnly
        >
          <SheetShell>
            <SheetHeader title="New campaign" />
            <div style={{ flex: 1, padding: 16 }}>
              <FurnishFocus persona="op" n={31} label="Campaign name field" style={{ display: "block" }}>
                <LoFiField
                  value={draftName}
                  onChange={setDraftName}
                  placeholder="Campaign name"
                  autoFocus
                />
              </FurnishFocus>
              <CreateFurniture
                draftName={draftName}
                recentNames={recentNames}
                onPickTemplate={(t) => setDraftName(t.name)}
                onPickRecent={setDraftName}
                onOpenHelp={onOpenCreateHelp}
              />
            </div>
            <SheetFooter>
              <FurnishFocus persona="op" n={34} label="Cancel returns to list">
                <button type="button" onClick={onCancelBasics} style={{ ...resetLinkStyle(), marginTop: 0 }}>
                  Cancel
                </button>
              </FurnishFocus>
              <LoFiButton disabled={!canConfirm} onClick={onConfirm}>
                Create
              </LoFiButton>
            </SheetFooter>
          </SheetShell>
        </HolonBoundary>
      </>
    );
  }

  if (!campaign) {
    return listView();
  }

  if (screen === "evaluating" && selectedCompany) {
    return (
      <HolonBoundary
        id={OP_CT.evaluate.id}
        label={OP_CT.evaluate.label}
        parentId={OP_CT.desk.id}
        order={3}
        t={light}
        style={{ display: "contents" }}
      >
        <CampaignFrame campaign={campaign} onBack={onBackToList} company={selectedCompany}>
          <EvaluateSkeletonFurniture sourceTags={EVALUATE_SOURCE_TAGS} />
          <FurnishFocus persona="op" n={45} label="Evaluate skeleton" style={{ display: "block" }}>
            <EvaluateSkeleton company={selectedCompany} />
          </FurnishFocus>
        </CampaignFrame>
      </HolonBoundary>
    );
  }

  if (screen === "dossier" && selectedCompany) {
    return (
      <HolonBoundary
        id={OP_CT.evaluate.id}
        label={OP_CT.evaluate.label}
        parentId={OP_CT.desk.id}
        order={3}
        t={light}
        style={{ display: "contents" }}
      >
        <CampaignFrame
          campaign={campaign}
          onBack={onBackToList}
          company={selectedCompany}
          backLabel="← Campaigns"
        >
          <DossierView
            company={selectedCompany}
            onEnrich={onStartEnrich}
            onReset={onReset}
          />
        </CampaignFrame>
      </HolonBoundary>
    );
  }

  if (screen === "enriching" || screen === "firm-list") {
    return (
      <HolonBoundary
        id={OP_CT.enrich.id}
        label={OP_CT.enrich.label}
        parentId={OP_CT.desk.id}
        order={4}
        t={light}
        style={{ display: "contents" }}
      >
        <CampaignFrame campaign={campaign} onBack={frameBack} company={selectedCompany} backLabel="← Back">
          <EnrichStatusBar
            running={screen === "enriching"}
            firmCount={activeFirmCount}
            catalogTotal={SEED_FIRMS.length}
            prunedCount={prunedCount}
            enrichRun={screen === "firm-list" ? SEED_ENRICH_RUN : undefined}
            onExport={
              screen === "firm-list"
                ? () =>
                    exportFirms(
                      firms.filter((f) => !f.removed),
                      campaign.name,
                    )
                : undefined
            }
          />
          <EnrichFirmographicsPanel
            seed={SEED_FIRMS}
            running={screen === "enriching"}
            firms={firms}
            onFirmsChange={setFirms}
            onRunningComplete={onEnrichComplete}
            onDeploy={screen === "firm-list" ? onDeploy : undefined}
          />
          {screen === "firm-list" ? <EnrichHistoryTray run={SEED_ENRICH_RUN} /> : null}
        </CampaignFrame>
      </HolonBoundary>
    );
  }

  if (screen === "deploy-choice") {
    return (
      <>
        <HolonBoundary
          id={OP_CT.enrich.id}
          label={OP_CT.enrich.label}
          parentId={OP_CT.desk.id}
          order={4}
          t={light}
          style={{ display: "contents" }}
        >
          <CampaignFrame campaign={campaign} onBack={frameBack} company={selectedCompany} dimmed backLabel="← Back">
            <FirmographicsBackdrop firms={firms.filter((f) => !f.removed)} />
          </CampaignFrame>
        </HolonBoundary>
        <HolonBoundary
          id={OP_CT.deploy.id}
          label={OP_CT.deploy.label}
          parentId={OP_CT.desk.id}
          order={5}
          t={light}
          registerOnly
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: loFi.scrim,
            }}
          >
            <div
              style={{
                width: 340,
                background: loFi.frame,
                border: `1px solid ${loFi.stroke}`,
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: `1px solid ${loFi.stroke}`,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Who to invite?
              </div>
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <DeployRecap
                  campaignName={campaign.name}
                  companyName={selectedCompany?.name}
                  firmCount={activeFirmCount}
                  targetMeetings={PERSONA_SEED.meetingsTarget}
                  pricePerMeeting={PERSONA_SEED.pricePerMeeting}
                  holdDays={PERSONA_SEED.holdDays}
                />
                <LoFiButton onClick={onInviteExisting}>Invite existing user</LoFiButton>
                <LoFiButton variant="ghost" onClick={onInviteGuest}>
                  Invite guest / non-user
                </LoFiButton>
                <DeployChoiceHints variant="modal" />
                <LoFiButton variant="ghost" onClick={onGoBack}>
                  Cancel
                </LoFiButton>
              </div>
            </div>
          </div>
        </HolonBoundary>
      </>
    );
  }

  if (screen === "invite-guest") {
    return (
      <>
        <InviteBackdrop
          inviteOrigin={inviteOrigin}
          listView={listView(true)}
          campaign={campaign}
          selectedCompany={selectedCompany}
          firms={firms}
          onGoBack={onGoBack}
        />
        <HolonBoundary
          id={OP_CT.invite.id}
          label={OP_CT.invite.label}
          parentId={OP_CT.desk.id}
          order={6}
          t={light}
          registerOnly
        >
          <SheetShell>
            <SheetHeader title="Invite guest" />
            <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <LoFiField label="Email" value={guestEmail} onChange={setGuestEmail} placeholder="prospect@example.com" />
              <p style={{ margin: 0, fontSize: 11, color: loFi.muted }}>
                First sale. They accept and fund on their surface.
              </p>
              <InvitePreview
                campaignName={campaign.name}
                companyName={selectedCompany?.name}
                firmCount={activeFirmCount}
                email={guestEmail}
              />
            </div>
            <SheetFooter>
              <LoFiButton variant="ghost" onClick={onGoBack}>
                Cancel
              </LoFiButton>
              <LoFiButton onClick={onSendInvite}>Send invite</LoFiButton>
            </SheetFooter>
          </SheetShell>
        </HolonBoundary>
      </>
    );
  }

  if (screen === "invite-existing") {
    return (
      <>
        <InviteBackdrop
          inviteOrigin={inviteOrigin}
          listView={listView(true)}
          campaign={campaign}
          selectedCompany={selectedCompany}
          firms={firms}
          onGoBack={onGoBack}
        />
        <HolonBoundary
          id={OP_CT.invite.id}
          label={OP_CT.invite.label}
          parentId={OP_CT.desk.id}
          order={6}
          t={light}
          registerOnly
        >
          <SheetShell>
            <SheetHeader title="Invite existing user" />
            <div style={{ flex: 1, padding: 16 }}>
              <div style={{ fontSize: 11, color: loFi.label, marginBottom: 8 }}>Account</div>
              {BUSINESS_CLIENTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedBizClient(c)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                    marginBottom: 6,
                    borderRadius: 6,
                    border: `1px solid ${selectedBizClient?.id === c.id ? loFi.ink : loFi.stroke}`,
                    background: selectedBizClient?.id === c.id ? loFi.block : loFi.white,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                  }}
                >
                  <CompanyLogo company={c} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <ExistingAccountRowFacts lastActive="Jul 20" />
                  </div>
                </button>
              ))}
              {selectedBizClient ? (
                <InvitePreview
                  campaignName={campaign.name}
                  companyName={selectedCompany?.name}
                  firmCount={activeFirmCount}
                  accountName={selectedBizClient.name}
                />
              ) : null}
            </div>
            <SheetFooter>
              <LoFiButton variant="ghost" onClick={onGoBack}>
                Cancel
              </LoFiButton>
              <LoFiButton disabled={!selectedBizClient} onClick={onSendInvite}>
                Send invite
              </LoFiButton>
            </SheetFooter>
          </SheetShell>
        </HolonBoundary>
      </>
    );
  }

  if (screen === "client-fund") {
    return (
      <>
        <HolonBoundary
          id={OP_CT.deploy.id}
          label={OP_CT.deploy.label}
          parentId={OP_CT.desk.id}
          order={5}
          t={light}
          style={{ display: "contents" }}
        >
          <CampaignFrame campaign={campaign} onBack={frameBack} company={selectedCompany} dimmed backLabel="← Back">
            <p style={{ fontSize: 12, color: loFi.muted }}>Waiting on client…</p>
          </CampaignFrame>
        </HolonBoundary>
        <HolonBoundary
          id={OP_CT.deploy.id}
          label={OP_CT.deploy.label}
          parentId={OP_CT.desk.id}
          order={5}
          t={light}
          registerOnly
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: loFi.scrim,
            }}
          >
            <FurnishFocus persona="op" n={80} label="Client fund modal" style={{ display: "block" }}>
            <div
              style={{
                width: 320,
                background: loFi.frame,
                border: `1px solid ${loFi.stroke}`,
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: `1px solid ${loFi.stroke}`,
                  background: loFi.chrome,
                  fontSize: 11,
                  color: loFi.muted,
                }}
              >
                Their surface (non-business client)
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{campaign.name}</div>
                <ClientFundFacts
                  targetMeetings={PERSONA_SEED.meetingsTarget}
                  pricePerMeeting={PERSONA_SEED.pricePerMeeting}
                  holdDays={PERSONA_SEED.holdDays}
                />
                <LoFiBlock height={10} width="80%" style={{ marginBottom: 8 }} />
                <LoFiButton onClick={onClientFunded}>Accept + fund</LoFiButton>
              </div>
            </div>
            </FurnishFocus>
          </div>
        </HolonBoundary>
      </>
    );
  }

  if (screen === "running") {
    const held = PERSONA_SEED.meetingsTarget * PERSONA_SEED.pricePerMeeting;
    return (
      <CampaignFrame campaign={campaign} onBack={frameBack} company={selectedCompany} backLabel="← Back">
        <RunningView
          campaignName={campaign.name}
          clientName={selectedBizClient?.name}
          inviteAt="Today"
          booked={0}
          target={PERSONA_SEED.meetingsTarget}
          held={held}
          released={0}
          honesty="silent"
          receiptId="rcpt-op-live"
          firms={firms.filter((f) => !f.removed)}
          funded={funded}
          onOpenSheet={onOpenDeskSheet}
          onReset={onReset}
        />
      </CampaignFrame>
    );
  }

  if (screen === "campaign") {
    const results = filterCompanies(companyQuery);
    return (
      <HolonBoundary
        id={OP_CT.create.id}
        label={OP_CT.create.label}
        parentId={OP_CT.desk.id}
        order={2}
        t={light}
        style={{ display: "contents" }}
      >
        <CampaignFrame campaign={campaign} onBack={onBackToList} company={selectedCompany} backLabel="← Campaigns">
          <CreatedPeek show={justCreated} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: loFi.label, marginBottom: 6 }}>Company</div>
            {selectedCompany && companyLocked ? (
              <FurnishFocus persona="op" n={42} label="Locked company row" style={{ display: "block" }}>
                <SelectedCompanyRow company={selectedCompany} onClear={undefined} />
              </FurnishFocus>
            ) : selectedCompany ? (
              <FurnishFocus persona="op" n={40} label="Selected company row" style={{ display: "block" }}>
                <SelectedCompanyRow
                  company={selectedCompany}
                  onClear={() => {
                    setSelectedCompany(null);
                    setCompanyQuery("");
                  }}
                />
              </FurnishFocus>
            ) : (
              <>
                <CompanyPickFurniture
                  acvBand={PERSONA_SEED.acvBand}
                  recentNames={KNOWN_COMPANIES.map((c) => c.name)}
                  onPickRecent={(name) => {
                    const co = KNOWN_COMPANIES.find((c) => c.name === name);
                    if (co) {
                      setSelectedCompany(co);
                      setCompanyQuery(co.name);
                    }
                  }}
                />
                <HolonBoundary
                  id={OP_CT.companySearch.id}
                  label={OP_CT.companySearch.label}
                  parentId={OP_CT.create.id}
                  order={1}
                  t={light}
                >
                  <CompanySearch
                    query={companyQuery}
                    onQueryChange={setCompanyQuery}
                    results={results}
                    onSelect={(c) => {
                      setSelectedCompany(c);
                      setCompanyQuery(c.name);
                    }}
                  />
                </HolonBoundary>
              </>
            )}
          </div>
          <FurnishFocus persona="op" n={41} label='"Evaluate" loud; "Create another" quiet' style={{ gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <LoFiButton disabled={!selectedCompany} onClick={onStartEvaluate}>
                Evaluate
              </LoFiButton>
              <button type="button" onClick={onOpenCreate} style={{ ...resetLinkStyle(), marginTop: 0 }}>
                Create another
              </button>
            </div>
          </FurnishFocus>
          <button type="button" onClick={onReset} style={resetLinkStyle()}>
            Reset prototype
          </button>
        </CampaignFrame>
      </HolonBoundary>
    );
  }

  return listView();
}

function InviteBackdrop({
  inviteOrigin,
  listView,
  campaign,
  selectedCompany,
  firms,
  onGoBack,
}: {
  inviteOrigin: InviteOrigin;
  listView: ReactNode;
  campaign: PrototypeCampaign;
  selectedCompany: PrototypeCompany | null;
  firms: FirmRow[];
  onGoBack: () => void;
}) {
  if (inviteOrigin === "list") {
    return <>{listView}</>;
  }
  return (
    <CampaignFrame campaign={campaign} onBack={onGoBack} company={selectedCompany} dimmed backLabel="← Back">
      <FirmographicsBackdrop firms={firms.filter((f) => !f.removed)} />
    </CampaignFrame>
  );
}

function FirmographicsBackdrop({ firms }: { firms: FirmRow[] }) {
  return (
    <FirmographicsTable
      firms={firms}
      catalog={SEED_FIRMS}
      filters={EMPTY_FIRM_FILTERS}
      onFiltersChange={() => {}}
    />
  );
}

const resetLinkStyle = (): CSSProperties => ({
  marginTop: 12,
  border: "none",
  background: "none",
  padding: 0,
  fontSize: 11,
  color: loFi.label,
  cursor: "pointer",
  fontFamily: "inherit",
  textDecoration: "underline",
});

function SheetHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        borderBottom: `1px solid ${loFi.stroke}`,
        fontSize: 13,
        fontWeight: 600,
        color: loFi.ink,
      }}
    >
      {title}
    </div>
  );
}

function SheetFooter({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: 12,
        borderTop: `1px solid ${loFi.stroke}`,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

function SheetShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: loFi.scrim,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          width: 360,
          maxWidth: "100%",
          height: "100%",
          background: loFi.frame,
          borderLeft: `1px solid ${loFi.stroke}`,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-8px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CenterLoad({ title, subtitle }: { title: string; subtitle: ReactNode | null }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        minHeight: 160,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: `2px solid ${loFi.stroke}`,
          borderTopColor: loFi.ink,
          animation: "tallySpin 0.7s linear infinite",
        }}
      />
      <div style={{ fontSize: 13, fontWeight: 600, color: loFi.ink }}>{title}</div>
      {subtitle ? <div style={{ fontSize: 12, color: loFi.muted }}>{subtitle}</div> : null}
    </div>
  );
}

function CampaignFrame({
  campaign,
  onBack,
  company,
  children,
  dimmed,
  backLabel = "← Campaigns",
}: {
  campaign: PrototypeCampaign;
  onBack: () => void;
  company: PrototypeCompany | null;
  children: ReactNode;
  dimmed?: boolean;
  backLabel?: string;
}) {
  return (
    <div
      style={{
        background: loFi.frame,
        border: `1px solid ${loFi.stroke}`,
        borderRadius: 8,
        overflow: "hidden",
        width: "100%",
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        opacity: dimmed ? 0.55 : 1,
        pointerEvents: dimmed ? "none" : "auto",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${loFi.stroke}`,
          background: loFi.chrome,
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button type="button" onClick={onBack} style={{ ...resetLinkStyle(), marginTop: 0 }}>
          {backLabel}
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: loFi.ink, flex: 1, minWidth: 0 }}>
          {campaign.name}
        </span>
        {company ? <CompanyLogo company={company} size={24} /> : null}
      </div>
      <div style={{ padding: 16, flex: 1, minHeight: 0, overflow: "auto" }}>{children}</div>
    </div>
  );
}

function CompanySearch({
  query,
  onQueryChange,
  results,
  onSelect,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  results: PrototypeCompany[];
  onSelect: (c: PrototypeCompany) => void;
}) {
  const typed = query.trim().length > 0;
  return (
    <div>
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Type to search…"
        autoComplete="off"
        style={{
          width: "100%",
          height: 36,
          padding: "0 10px",
          borderRadius: 4,
          border: `1px solid ${loFi.stroke}`,
          background: loFi.white,
          color: loFi.ink,
          fontSize: 13,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
      {!typed ? null : (
        <div
          style={{
            marginTop: 6,
            border: `1px solid ${loFi.stroke}`,
            borderRadius: 6,
            background: loFi.white,
            overflow: "hidden",
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: 12, fontSize: 12, color: loFi.muted }}>No known companies</div>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  border: "none",
                  borderBottom: `1px solid ${loFi.stroke}`,
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <CompanyLogo company={c} size={28} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: loFi.ink }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: loFi.muted }}>{c.domain}</div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SelectedCompanyRow({
  company,
  onClear,
}: {
  company: PrototypeCompany;
  onClear?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
      }}
    >
      <CompanyLogo company={company} size={32} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: loFi.ink }}>{company.name}</div>
        <div style={{ fontSize: 11, color: loFi.muted }}>{company.domain}</div>
      </div>
      {onClear ? (
        <button type="button" onClick={onClear} style={{ ...resetLinkStyle(), marginTop: 0 }}>
          Change
        </button>
      ) : null}
    </div>
  );
}

function EvaluateSkeleton({ company }: { company: PrototypeCompany }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <CompanyLogo company={company} size={32} />
        <div style={{ fontSize: 13, fontWeight: 600, color: loFi.ink }}>{company.name}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[1, 0.75, 0.88, 0.62].map((w, i) => (
          <LoFiBlock key={i} height={14} width={`${w * 100}%`} style={{ opacity: 0.55 + (i % 2) * 0.2 }} />
        ))}
      </div>
    </div>
  );
}

type DossierSection = {
  id: string;
  label: string;
  fact: string;
  unknown?: boolean;
  /** Chrome icon — Notion registry (not ad-hoc SVG). */
  icon: NotionIconName;
  /** Show live-scan sparkles on the row (description). */
  sparkles?: boolean;
};

const DOSSIER_SEED: DossierSection[] = [
  {
    id: "company",
    label: "Company name",
    icon: "house",
    fact: "Acme Robotics",
  },
  {
    id: "description",
    label: "Company description",
    icon: "document",
    fact: "Industrial robotics for multi-site ops teams evaluating plant ROI. Uses outbound and product-led motions to reach plant leaders.",
    sparkles: true,
  },
  {
    id: "size",
    label: "Company size",
    icon: "people",
    fact: "120–180",
  },
  {
    id: "acv",
    label: "ACV",
    icon: "tag",
    fact: "Can't be identified",
    unknown: true,
  },
  {
    id: "verify",
    label: "One fact to verify",
    icon: "directional-sign",
    fact: "Who owns plant ops budget on their side.",
  },
  {
    id: "scenario",
    label: "Scenario",
    icon: "compass",
    fact: "Outbound to multi-site ops teams evaluating robotics ROI.",
  },
  {
    id: "verdict",
    label: "Verdict",
    icon: "checkmark-list",
    fact: "Strong fit if economic buyer owns plant ops budget.",
  },
];

function DossierView({
  company,
  onEnrich,
  onReset,
}: {
  company: PrototypeCompany;
  /** Disco → off-call gate — Enrich is the one loud action on the dossier. */
  onEnrich: () => void;
  onReset: () => void;
}) {
  /** Multi-open accordion — company name always starts open. */
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(["company"]));
  const [sections, setSections] = useState<DossierSection[]>(() =>
    DOSSIER_SEED.map((s) => (s.id === "company" ? { ...s, fact: company.name } : { ...s })),
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [stickyFor, setStickyFor] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rewritingAll, setRewritingAll] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const noteCount = Object.values(notes).filter((n) => n.trim()).length;
  const unknownCount = sections.filter((s) => s.unknown).length;
  const notePreview = Object.values(notes).find((n) => n.trim())?.trim();

  const websiteHref = company.domain.startsWith("http")
    ? company.domain
    : `https://${company.domain}`;

  function toggleOpen(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reanalyze() {
    if (rewritingAll) return;
    setRewritingAll(true);
    window.setTimeout(() => {
      setSections((prev) =>
        prev.map((s) => {
          const note = (notes[s.id] ?? "").trim();
          if (note) return { ...s, fact: note, unknown: false };
          return s;
        }),
      );
      setRewritingAll(false);
      setStickyFor(null);
    }, REANALYZE_MS);
  }

  return (
    <div style={{ position: "relative" }}>
      <DossierHeaderFurniture
        sectionCount={sections.length}
        unknownCount={unknownCount}
        noteCount={noteCount}
        onOpenMore={() => setMoreOpen(true)}
        onCopyDomain={() => copyDomain(company.domain)}
        domain={company.domain}
      />
      <NotesSummary noteCount={noteCount} preview={notePreview} />
      <DossierMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        sections={sections.map((s) => ({ label: s.label, fact: s.fact }))}
        onExport={() => downloadDossier(sections.map((s) => ({ label: s.label, fact: s.fact })), company.name)}
      />
      {/* Image-style accordion: icon + title + chevron; hairline rules only */}
      <div style={{ borderTop: `1px solid ${loFi.stroke}`, marginBottom: 16 }}>
        {sections.map((section) => {
          const open = openIds.has(section.id);
          const hasSticky = Boolean((notes[section.id] ?? "").trim());
          const showSticky =
            hoveredId === section.id || stickyFor === section.id || hasSticky;
          const isCompany = section.id === "company";

          return (
            <div
              key={section.id}
              style={{ borderBottom: `1px solid ${loFi.stroke}`, position: "relative" }}
              onMouseEnter={() => setHoveredId(section.id)}
              onMouseLeave={() => setHoveredId((h) => (h === section.id ? null : h))}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minHeight: 48,
                  padding: "12px 4px 12px 0",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleOpen(section.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    padding: 0,
                    minWidth: 0,
                  }}
                >
                  <NotionIcon name={section.icon} size={18} color={loFi.label} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: loFi.ink }}>
                    {section.label}
                  </span>
                  {section.sparkles ? (
                    <Sparkles size={14} color={loFi.label} strokeWidth={2} aria-hidden />
                  ) : null}
                </button>

                {isCompany ? (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noreferrer"
                    title={company.domain}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      color: loFi.label,
                      padding: 4,
                    }}
                  >
                    <ExternalLink size={14} strokeWidth={2} />
                  </a>
                ) : null}

                {showSticky ? (
                  <button
                    type="button"
                    title={hasSticky ? "Edit sticky note" : "Add sticky note"}
                    aria-label="Sticky note"
                    onClick={(e) => {
                      e.stopPropagation();
                      setStickyFor(stickyFor === section.id ? null : section.id);
                      if (!open) toggleOpen(section.id);
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      padding: 4,
                      color: hasSticky ? loFi.ink : loFi.label,
                      cursor: "pointer",
                      display: "inline-flex",
                    }}
                  >
                    <Pencil size={14} strokeWidth={2} />
                  </button>
                ) : (
                  <span style={{ width: 22, flexShrink: 0 }} aria-hidden />
                )}

                <button
                  type="button"
                  aria-label={open ? "Collapse" : "Expand"}
                  onClick={() => toggleOpen(section.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 4,
                    color: loFi.label,
                    cursor: "pointer",
                    display: "inline-flex",
                  }}
                >
                  {open ? (
                    <ChevronUp size={16} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={16} strokeWidth={2} />
                  )}
                </button>
              </div>

              {open ? (
                <div style={{ padding: "0 8px 16px 30px" }}>
                  {rewritingAll ? (
                    <div style={{ fontSize: 13, color: loFi.muted }}>* Re-analyzing…</div>
                  ) : (
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: section.unknown ? 600 : 400,
                        color: section.unknown ? loFi.label : loFi.ink,
                        lineHeight: 1.55,
                      }}
                    >
                      {section.fact}
                    </div>
                  )}
                  {hasSticky && stickyFor !== section.id ? (
                    <div
                      style={{
                        marginTop: 8,
                        display: "inline-block",
                        padding: "4px 8px",
                        fontSize: 10,
                        background: loFi.note,
                        border: `1px solid ${loFi.noteBorder}`,
                        borderRadius: 2,
                        color: loFi.ink,
                        maxWidth: "100%",
                      }}
                    >
                      {(notes[section.id] ?? "").slice(0, 48)}
                      {(notes[section.id] ?? "").length > 48 ? "…" : ""}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {stickyFor === section.id ? (
                <div
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 48,
                    zIndex: 5,
                    width: 200,
                    padding: 10,
                    background: loFi.note,
                    border: `1px solid ${loFi.noteBorder}`,
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.06)",
                    borderRadius: 2,
                  }}
                >
                  <textarea
                    value={notes[section.id] ?? ""}
                    onChange={(e) => setNotes((p) => ({ ...p, [section.id]: e.target.value }))}
                    placeholder="What you heard…"
                    rows={4}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      resize: "vertical",
                      fontSize: 12,
                      fontFamily: "inherit",
                      color: loFi.ink,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    autoFocus
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setStickyFor(null)}
                      style={{
                        border: "none",
                        background: "none",
                        fontSize: 11,
                        color: loFi.label,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 8,
        }}
      >
        <FurnishFocus persona="op" n={50} label="Re-analyze with sparkles">
          <button
            type="button"
            disabled={rewritingAll}
            onClick={reanalyze}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              fontSize: 12,
              fontWeight: 600,
              color: rewritingAll ? loFi.muted : loFi.label,
              cursor: rewritingAll ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Sparkles size={14} strokeWidth={2} aria-hidden />
            Re-analyze
          </button>
        </FurnishFocus>
        <FurnishFocus persona="op" n={53} label="Enrich — the one loud action">
          <LoFiButton disabled={rewritingAll} onClick={onEnrich}>
            Enrich
          </LoFiButton>
        </FurnishFocus>
      </div>
      <button type="button" onClick={onReset} style={resetLinkStyle()}>
        Reset prototype
      </button>
    </div>
  );
}
