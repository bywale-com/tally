import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  FolderPlusIcon,
  MoreHorizontalIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "@/app/components/docs/shellHolonOrder";
import { light, type Tokens } from "@/app/components/tokens";
import {
  filterCompanies,
  type PrototypeCompany,
} from "@/app/register/wireframes/loFi/prototypeCompanies";
import {
  BUSINESS_CLIENTS,
  SEED_FIRMS,
  type BusinessClient,
  type FirmRow,
} from "@/app/register/wireframes/loFi/prototypeFirms";
import { DUMMY_GUEST_EMAIL } from "@/app/register/wireframes/loFi/prototypeSeed";
import { CampaignFrame } from "./CampaignFrame";
import { CompanyMark } from "./CompanyMark";
import { FirmListPanel } from "./FirmListPanel";
import {
  backTarget,
  breadcrumbFor,
  isResumeScreen,
  type InviteOrigin,
  type OperatorCampaign,
  type OperatorScreenId,
} from "./flowTypes";

export type { OperatorCampaign } from "./flowTypes";

type CampaignsFlowViewProps = {
  onBreadcrumbChange?: (label: string) => void;
  t?: Tokens;
};

const CREATE_LOAD_MS = 900;
const EVALUATE_LOAD_MS = 1800;
const ENRICH_LOAD_MS = 2000;

/**
 * Full Operator Core click-through on the product shell:
 * Create → Evaluate → Enrich → Deploy → Invite → Fund → Running.
 */
export function CampaignsFlowView({ onBreadcrumbChange, t = light }: CampaignsFlowViewProps) {
  const [screen, setScreen] = useState<OperatorScreenId>("campaigns");
  const [campaign, setCampaign] = useState<OperatorCampaign | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);

  const [companyQuery, setCompanyQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<PrototypeCompany | null>(null);
  const [companyLocked, setCompanyLocked] = useState(false);
  const [resumeScreen, setResumeScreen] = useState<OperatorScreenId>("campaign");
  const [firms, setFirms] = useState<FirmRow[]>([]);
  const [funded, setFunded] = useState(false);
  const [inviteOrigin, setInviteOrigin] = useState<InviteOrigin>("deploy");
  const [selectedBizClient, setSelectedBizClient] = useState<BusinessClient | null>(
    BUSINESS_CLIENTS[0] ?? null,
  );
  const [guestEmail, setGuestEmail] = useState(DUMMY_GUEST_EMAIL);

  useEffect(() => {
    onBreadcrumbChange?.(breadcrumbFor(screen, campaign?.name));
  }, [screen, campaign?.name, onBreadcrumbChange]);

  useEffect(() => {
    if (isResumeScreen(screen)) setResumeScreen(screen);
  }, [screen]);

  useEffect(() => {
    if (!creating || pendingName == null) return;
    const id = window.setTimeout(() => {
      setCampaign({ id: `camp-${Date.now()}`, name: pendingName });
      setPendingName(null);
      setCreating(false);
      setCreateOpen(false);
      setDraftName("");
      setCompanyQuery("");
      setSelectedCompany(null);
      setCompanyLocked(false);
      setFirms([]);
      setFunded(false);
      setSelectedBizClient(BUSINESS_CLIENTS[0] ?? null);
      setInviteOrigin("deploy");
      setResumeScreen("campaign");
      setScreen("campaign");
    }, CREATE_LOAD_MS);
    return () => window.clearTimeout(id);
  }, [creating, pendingName]);

  useEffect(() => {
    if (screen !== "evaluating") return;
    const id = window.setTimeout(() => setScreen("verdict"), EVALUATE_LOAD_MS);
    return () => window.clearTimeout(id);
  }, [screen]);

  useEffect(() => {
    if (screen !== "enriching") return;
    const id = window.setTimeout(() => {
      setFirms(SEED_FIRMS.map((f) => ({ ...f })));
      setScreen("firm-list");
    }, ENRICH_LOAD_MS);
    return () => window.clearTimeout(id);
  }, [screen]);

  function openCreate() {
    setDraftName("");
    setCreateOpen(true);
  }

  function submitCreate() {
    const name = draftName.trim();
    if (!name || creating) return;
    setPendingName(name);
    setCreating(true);
  }

  function goCampaigns() {
    if (screen === "evaluating" || screen === "enriching") return;
    setScreen("campaigns");
  }

  function openCampaign() {
    if (!campaign) return;
    setScreen(companyLocked ? resumeScreen : "campaign");
  }

  function goBack() {
    const prev = backTarget(screen, inviteOrigin);
    if (prev) setScreen(prev);
  }

  function resetFlow() {
    setDraftName("");
    setPendingName(null);
    setCreating(false);
    setCreateOpen(false);
    setCampaign(null);
    setCompanyQuery("");
    setSelectedCompany(null);
    setCompanyLocked(false);
    setResumeScreen("campaign");
    setFirms([]);
    setFunded(false);
    setInviteOrigin("deploy");
    setSelectedBizClient(BUSINESS_CLIENTS[0] ?? null);
    setGuestEmail(DUMMY_GUEST_EMAIL);
    setScreen("campaigns");
  }

  function startEvaluate() {
    if (!selectedCompany) return;
    setCompanyLocked(true);
    setScreen("evaluating");
  }

  const canGoBack = backTarget(screen, inviteOrigin) !== null;
  const frameBack = canGoBack ? goBack : goCampaigns;

  const inviteSheetOpen = screen === "invite-guest" || screen === "invite-existing";
  const deployOpen = screen === "deploy-choice";
  const clientFundOpen = screen === "client-fund";
  const listInviteBackdrop =
    inviteOrigin === "list" && (screen === "invite-guest" || screen === "invite-existing");
  const showList = screen === "campaigns" || !campaign || listInviteBackdrop;

  return (
    <>
      {showList ? (
        <CampaignsList
          campaign={campaign}
          company={selectedCompany}
          companyLocked={companyLocked}
          dimmed={listInviteBackdrop}
          t={t}
          onOpenCreate={openCreate}
          onOpenCampaign={openCampaign}
          onInviteGuest={() => {
            setInviteOrigin("list");
            setScreen("invite-guest");
          }}
          onInviteExisting={() => {
            setInviteOrigin("list");
            setScreen("invite-existing");
          }}
        />
      ) : (
        <HolonBoundary
          id="prototype-campaign"
          label="Campaign"
          order={SHELL_HOLON_ORDER["prototype-campaign"]}
          t={t}
          style={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0, overflow: "auto" }}
        >
          <div className="relative flex flex-1 flex-col p-6">
            <CampaignBody
              screen={screen}
              campaign={campaign}
              companyQuery={companyQuery}
              setCompanyQuery={setCompanyQuery}
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
              companyLocked={companyLocked}
              firms={firms}
              setFirms={setFirms}
              funded={funded}
              frameBack={frameBack}
              onBackToList={goCampaigns}
              onOpenCreate={openCreate}
              onStartEvaluate={startEvaluate}
              onStartEnrich={() => setScreen("enriching")}
              onDeploy={() => {
                setInviteOrigin("deploy");
                setScreen("deploy-choice");
              }}
              onShowClientFund={() => setScreen("client-fund")}
              onReset={resetFlow}
              t={t}
            />
          </div>
        </HolonBoundary>
      )}

      <CreateSheet
        open={createOpen}
        onOpenChange={(open) => {
          if (creating) return;
          setCreateOpen(open);
        }}
        draftName={draftName}
        setDraftName={setDraftName}
        creating={creating}
        pendingName={pendingName}
        onSubmit={submitCreate}
        t={t}
      />

      <DeployDialog
        open={deployOpen}
        onOpenChange={(open) => {
          if (!open) setScreen("firm-list");
        }}
        onInviteExisting={() => {
          setInviteOrigin("deploy");
          setScreen("invite-existing");
        }}
        onInviteGuest={() => {
          setInviteOrigin("deploy");
          setScreen("invite-guest");
        }}
        t={t}
      />

      <InviteSheets
        open={inviteSheetOpen}
        mode={screen === "invite-existing" ? "existing" : "guest"}
        guestEmail={guestEmail}
        setGuestEmail={setGuestEmail}
        selectedBizClient={selectedBizClient}
        setSelectedBizClient={setSelectedBizClient}
        onClose={() => {
          setScreen(inviteOrigin === "list" ? "campaigns" : "deploy-choice");
        }}
        onSend={() => setScreen("invite-sent")}
        t={t}
      />

      <ClientFundDialog
        open={clientFundOpen}
        campaignName={campaign?.name ?? ""}
        onOpenChange={(open) => {
          if (!open) setScreen("invite-sent");
        }}
        onFunded={() => {
          setFunded(true);
          setScreen("running");
        }}
        t={t}
      />
    </>
  );
}

function CampaignBody({
  screen,
  campaign,
  companyQuery,
  setCompanyQuery,
  selectedCompany,
  setSelectedCompany,
  companyLocked,
  firms,
  setFirms,
  funded,
  frameBack,
  onBackToList,
  onOpenCreate,
  onStartEvaluate,
  onStartEnrich,
  onDeploy,
  onShowClientFund,
  onReset,
  t,
}: {
  screen: OperatorScreenId;
  campaign: OperatorCampaign;
  companyQuery: string;
  setCompanyQuery: (v: string) => void;
  selectedCompany: PrototypeCompany | null;
  setSelectedCompany: (c: PrototypeCompany | null) => void;
  companyLocked: boolean;
  firms: FirmRow[];
  setFirms: Dispatch<SetStateAction<FirmRow[]>>;
  funded: boolean;
  frameBack: () => void;
  onBackToList: () => void;
  onOpenCreate: () => void;
  onStartEvaluate: () => void;
  onStartEnrich: () => void;
  onDeploy: () => void;
  onShowClientFund: () => void;
  onReset: () => void;
  t: Tokens;
}) {
  if (screen === "evaluating" && selectedCompany) {
    return (
      <HolonBoundary
        id="prototype-evaluate"
        label="Evaluate"
        order={SHELL_HOLON_ORDER["prototype-evaluate"]}
        t={t}
        style={{ display: "contents" }}
      >
        <CampaignFrame campaign={campaign} company={selectedCompany} onBack={onBackToList}>
          <EvaluateSkeleton company={selectedCompany} />
        </CampaignFrame>
      </HolonBoundary>
    );
  }

  if (screen === "verdict" && selectedCompany) {
    return (
      <HolonBoundary
        id="prototype-evaluate"
        label="Evaluate"
        order={SHELL_HOLON_ORDER["prototype-evaluate"]}
        t={t}
        style={{ display: "contents" }}
      >
        <CampaignFrame
          campaign={campaign}
          company={selectedCompany}
          onBack={onBackToList}
          backLabel="← Campaigns"
        >
          <div className="flex flex-col gap-4">
            <Alert>
              <AlertTitle>Fit looks strong</AlertTitle>
              <AlertDescription>
                {selectedCompany.name} clears the disco bar — ICP match, hiring signal, and
                reachability. Enrich off-call when you leave the call.
              </AlertDescription>
            </Alert>
            <div className="flex flex-wrap gap-2">
              <Button onClick={onStartEnrich}>Enrich (off call)</Button>
              <Button variant="outline" onClick={onReset}>
                Reset
              </Button>
            </div>
          </div>
        </CampaignFrame>
      </HolonBoundary>
    );
  }

  if (screen === "enriching") {
    return (
      <HolonBoundary
        id="prototype-enrich"
        label="Enrich"
        order={SHELL_HOLON_ORDER["prototype-enrich"]}
        t={t}
        style={{ display: "contents" }}
      >
        <CampaignFrame
          campaign={campaign}
          company={selectedCompany}
          onBack={frameBack}
          backLabel="← Back"
        >
          <div className="flex min-h-40 flex-col items-center justify-center gap-3">
            <Spinner className="size-6" />
            <div className="text-sm font-medium">Building firm list…</div>
            <div className="text-muted-foreground text-xs">CRM / Apollo lane</div>
          </div>
        </CampaignFrame>
      </HolonBoundary>
    );
  }

  if (screen === "firm-list" || screen === "deploy-choice") {
    return (
      <HolonBoundary
        id="prototype-enrich"
        label="Enrich"
        order={SHELL_HOLON_ORDER["prototype-enrich"]}
        t={t}
        style={{ display: "contents" }}
      >
        <CampaignFrame
          campaign={campaign}
          company={selectedCompany}
          onBack={frameBack}
          backLabel="← Back"
          dimmed={screen === "deploy-choice"}
        >
          <p className="text-muted-foreground mb-3 text-xs">
            Firm list — remove/add on demo. Deploy when green.
          </p>
          <FirmListPanel
            firms={firms}
            showAdd
            onToggleRemove={(id) => {
              setFirms((prev) =>
                prev.map((f) => (f.id === id ? { ...f, removed: !f.removed } : f)),
              );
            }}
          />
          <div className="mt-4">
            <Button onClick={onDeploy}>Deploy</Button>
          </div>
        </CampaignFrame>
      </HolonBoundary>
    );
  }

  if (screen === "invite-guest" || screen === "invite-existing") {
    return (
      <CampaignFrame
        campaign={campaign}
        company={selectedCompany}
        onBack={frameBack}
        backLabel="← Back"
        dimmed
      >
        <FirmListPanel firms={firms.filter((f) => !f.removed)} onToggleRemove={() => {}} />
      </CampaignFrame>
    );
  }

  if (screen === "invite-sent") {
    return (
      <CampaignFrame
        campaign={campaign}
        company={selectedCompany}
        onBack={frameBack}
        backLabel="← Back"
      >
        <div className="flex flex-col gap-4">
          <Alert>
            <AlertTitle>Invite sent</AlertTitle>
            <AlertDescription>
              Waiting for accept + first escrow fund (their side).
            </AlertDescription>
          </Alert>
          <Button onClick={onShowClientFund}>Show client accept + fund</Button>
        </div>
      </CampaignFrame>
    );
  }

  if (screen === "client-fund") {
    return (
      <CampaignFrame
        campaign={campaign}
        company={selectedCompany}
        onBack={frameBack}
        backLabel="← Back"
        dimmed
      >
        <p className="text-muted-foreground text-sm">Operator view — waiting on client…</p>
      </CampaignFrame>
    );
  }

  if (screen === "running") {
    return (
      <CampaignFrame
        campaign={campaign}
        company={selectedCompany}
        onBack={frameBack}
        backLabel="← Back"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Running</Badge>
            {funded ? (
              <span className="text-muted-foreground text-xs">Fund received · launch coupled (V1)</span>
            ) : null}
          </div>
          <Skeleton className="h-16 w-full" />
          <p className="text-muted-foreground text-sm leading-relaxed">
            Campaign is running toward meetings. First-sale path complete.
          </p>
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
        </div>
      </CampaignFrame>
    );
  }

  // campaign (Create → Evaluate entry)
  const results = filterCompanies(companyQuery);
  return (
    <HolonBoundary
      id="prototype-evaluate"
      label="Evaluate"
      order={SHELL_HOLON_ORDER["prototype-evaluate"]}
      t={t}
      style={{ display: "contents" }}
    >
      <CampaignFrame
        campaign={campaign}
        company={selectedCompany}
        onBack={onBackToList}
        backLabel="← Campaigns"
      >
        <div className="mb-4 flex flex-col gap-2">
          <div className="text-muted-foreground text-xs">Company</div>
          {selectedCompany && companyLocked ? (
            <SelectedCompanyRow company={selectedCompany} />
          ) : selectedCompany ? (
            <SelectedCompanyRow
              company={selectedCompany}
              onClear={() => {
                setSelectedCompany(null);
                setCompanyQuery("");
              }}
            />
          ) : (
            <CompanySearch
              query={companyQuery}
              onQueryChange={setCompanyQuery}
              results={results}
              onSelect={(c) => {
                setSelectedCompany(c);
                setCompanyQuery(c.name);
              }}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!selectedCompany} onClick={onStartEvaluate}>
            Evaluate
          </Button>
          <Button variant="outline" onClick={onOpenCreate}>
            Create another
          </Button>
        </div>
        <Button variant="link" size="sm" className="text-muted-foreground mt-3 h-auto px-0" onClick={onReset}>
          Reset prototype
        </Button>
      </CampaignFrame>
    </HolonBoundary>
  );
}

function CampaignsList({
  campaign,
  company,
  companyLocked,
  dimmed,
  t,
  onOpenCreate,
  onOpenCampaign,
  onInviteGuest,
  onInviteExisting,
}: {
  campaign: OperatorCampaign | null;
  company: PrototypeCompany | null;
  companyLocked: boolean;
  dimmed?: boolean;
  t: Tokens;
  onOpenCreate: () => void;
  onOpenCampaign: () => void;
  onInviteGuest: () => void;
  onInviteExisting: () => void;
}) {
  const showInviteMenu = Boolean(campaign && companyLocked);

  return (
    <HolonBoundary
      id="prototype-campaigns"
      label="Campaigns"
      order={SHELL_HOLON_ORDER["prototype-campaigns"]}
      t={t}
      style={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}
    >
      <div
        className={
          dimmed
            ? "pointer-events-none flex flex-1 flex-col opacity-55"
            : "flex flex-1 flex-col"
        }
      >
      <div className="flex items-center justify-between border-b px-6 py-3">
        <h1 className="text-sm font-semibold">Campaigns</h1>
        <Button size="sm" onClick={onOpenCreate}>
          <PlusIcon data-icon="inline-start" />
          Create
        </Button>
      </div>
      {campaign ? (
        <div className="p-6">
          <div className="bg-card flex items-center gap-3 rounded-lg border p-3">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              onClick={onOpenCampaign}
            >
              {company ? <CompanyMark initials={company.initials} name={company.name} /> : (
                <div className="bg-muted size-7 shrink-0 rounded-md" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{campaign.name}</div>
                <div className="text-muted-foreground truncate text-xs">
                  {companyLocked && company ? company.name : "Open campaign"}
                </div>
              </div>
            </button>
            {showInviteMenu ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon-sm" aria-label="Campaign actions" />}
                >
                  <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={onInviteExisting}>Invite existing user</DropdownMenuItem>
                    <DropdownMenuItem onClick={onInviteGuest}>Invite guest / non-user</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderPlusIcon />
              </EmptyMedia>
              <EmptyTitle>No campaigns yet</EmptyTitle>
              <EmptyDescription>
                Create a campaign on disco — name only, then evaluate.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onOpenCreate}>
                <PlusIcon data-icon="inline-start" />
                Create
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      )}
      </div>
    </HolonBoundary>
  );
}

function CreateSheet({
  open,
  onOpenChange,
  draftName,
  setDraftName,
  creating,
  pendingName,
  onSubmit,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftName: string;
  setDraftName: (v: string) => void;
  creating: boolean;
  pendingName: string | null;
  onSubmit: () => void;
  t: Tokens;
}) {
  const canSubmit = draftName.trim().length > 0 && !creating;

  return (
    <HolonBoundary
      id="prototype-create"
      label="Create"
      order={SHELL_HOLON_ORDER["prototype-create"]}
      t={t}
      registerOnly
    >
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col sm:max-w-md">
          {creating ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <Spinner className="size-6" />
              <div className="text-sm font-medium">Creating…</div>
              {pendingName ? (
                <div className="text-muted-foreground text-xs">{pendingName}</div>
              ) : null}
            </div>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>New campaign</SheetTitle>
                <SheetDescription>Name only — enough to recognize later.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 px-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="campaign-name">Name</FieldLabel>
                    <Input
                      id="campaign-name"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="e.g. Acme founding sales"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onSubmit();
                      }}
                    />
                  </Field>
                </FieldGroup>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button disabled={!canSubmit} onClick={onSubmit}>
                  Create
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </HolonBoundary>
  );
}

function DeployDialog({
  open,
  onOpenChange,
  onInviteExisting,
  onInviteGuest,
  t,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteExisting: () => void;
  onInviteGuest: () => void;
  t: Tokens;
}) {
  return (
    <HolonBoundary
      id="prototype-deploy"
      label="Deploy"
      order={SHELL_HOLON_ORDER["prototype-deploy"]}
      t={t}
      registerOnly
    >
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deploy — who to invite?</DialogTitle>
            <DialogDescription>
              Invite an existing business client or a guest / non-user for first sale.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button onClick={onInviteExisting}>Invite existing user</Button>
            <Button variant="outline" onClick={onInviteGuest}>
              Invite guest / non-user
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HolonBoundary>
  );
}

function InviteSheets({
  open,
  mode,
  guestEmail,
  setGuestEmail,
  selectedBizClient,
  setSelectedBizClient,
  onClose,
  onSend,
  t,
}: {
  open: boolean;
  mode: "guest" | "existing";
  guestEmail: string;
  setGuestEmail: (v: string) => void;
  selectedBizClient: BusinessClient | null;
  setSelectedBizClient: (c: BusinessClient | null) => void;
  onClose: () => void;
  onSend: () => void;
  t: Tokens;
}) {
  return (
    <HolonBoundary
      id="prototype-invite"
      label="Invite"
      order={SHELL_HOLON_ORDER["prototype-invite"]}
      t={t}
      registerOnly
    >
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent side="right" className="flex flex-col sm:max-w-md">
          {mode === "guest" ? (
            <>
              <SheetHeader>
                <SheetTitle>Invite guest</SheetTitle>
                <SheetDescription>
                  Non-user / first sale — they accept and fund on their surface.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 px-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="guest-email">Email</FieldLabel>
                    <Input
                      id="guest-email"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="prospect@example.com"
                    />
                  </Field>
                </FieldGroup>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={onSend}>Send invite</Button>
              </SheetFooter>
            </>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Invite existing user</SheetTitle>
                <SheetDescription>Pick a business client account.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-2 overflow-auto px-4">
                <div className="text-muted-foreground text-xs">Account</div>
                {BUSINESS_CLIENTS.map((c) => {
                  const selected = selectedBizClient?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedBizClient(c)}
                      className={
                        selected
                          ? "bg-accent border-foreground flex w-full items-center gap-2.5 rounded-md border p-2.5 text-left"
                          : "hover:bg-muted/50 flex w-full items-center gap-2.5 rounded-md border p-2.5 text-left"
                      }
                    >
                      <CompanyMark initials={c.initials} name={c.name} />
                      <span className="text-sm font-semibold">{c.name}</span>
                    </button>
                  );
                })}
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button disabled={!selectedBizClient} onClick={onSend}>
                  Send invite
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </HolonBoundary>
  );
}

function ClientFundDialog({
  open,
  campaignName,
  onOpenChange,
  onFunded,
  t,
}: {
  open: boolean;
  campaignName: string;
  onOpenChange: (open: boolean) => void;
  onFunded: () => void;
  t: Tokens;
}) {
  return (
    <HolonBoundary
      id="prototype-client-fund"
      label="Client fund"
      order={SHELL_HOLON_ORDER["prototype-client-fund"]}
      t={t}
      registerOnly
    >
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogDescription className="text-xs">Their surface (non-business client)</DialogDescription>
            <DialogTitle>{campaignName}</DialogTitle>
          </DialogHeader>
          <Skeleton className="h-2.5 w-[80%]" />
          <Skeleton className="h-9 w-full" />
          <DialogFooter>
            <Button onClick={onFunded}>Accept + fund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HolonBoundary>
  );
}

function EvaluateSkeleton({ company }: { company: PrototypeCompany }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <CompanyMark initials={company.initials} name={company.name} />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Spinner className="size-5" />
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <div className="text-muted-foreground text-center text-xs">Evaluating {company.name}…</div>
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
    <div className="flex items-center gap-2.5 rounded-md border p-2.5">
      <CompanyMark initials={company.initials} name={company.name} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{company.name}</div>
        <div className="text-muted-foreground truncate text-xs">{company.domain}</div>
      </div>
      {onClear ? (
        <Button variant="ghost" size="icon-sm" onClick={onClear} aria-label="Clear company">
          <XIcon />
        </Button>
      ) : null}
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
  return (
    <div className="flex flex-col gap-1.5">
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search company…"
        autoComplete="off"
      />
      <div className="overflow-hidden rounded-md border">
        {results.length === 0 ? (
          <div className="text-muted-foreground p-3 text-xs">No known companies</div>
        ) : (
          results.map((c) => (
            <button
              key={c.id}
              type="button"
              className="hover:bg-muted/50 flex w-full items-center gap-2.5 border-b p-2.5 text-left last:border-b-0"
              onClick={() => onSelect(c)}
            >
              <CompanyMark initials={c.initials} name={c.name} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{c.name}</div>
                <div className="text-muted-foreground truncate text-xs">{c.domain}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
