import { useEffect, useMemo, useState } from "react";
import {
  Button,
  DataTable,
  InlineLoading,
  InlineNotification,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  RadioButton,
  RadioButtonGroup,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  TextInput,
  Tile,
} from "@carbon/react";
import { CarbonDeskShell } from "../shell/CarbonDeskShell";
import { DoorModal } from "../ui/DoorModal";
import { DossierCarbon } from "../ui/DossierCarbon";
import { FactList } from "../ui/FactList";
import { FirmographicsCarbon } from "../ui/FirmographicsCarbon";
import { StatusTag } from "../ui/StatusTag";
import {
  BUSINESS_CLIENTS,
  CARBON_SEED,
  CREATE_TEMPLATES,
  DOSSIER_SECTIONS,
  EVALUATE_SOURCE_TAGS,
  KNOWN_COMPANIES,
  SEED_ENRICH_RUN,
  SEED_FIRMS,
  SEED_OP_CAMPAIGNS,
  SEED_SENT_INVITES,
  type FirmRow,
  type OpCampaign,
  type OpCampaignEvent,
  type OpCampaignState,
  type SentInvite,
} from "../data/seed";

type OpNav = "campaigns" | "meetings" | "messages" | "operations";

/** Absolute parity with loFi PrototypeScreenId choreography. */
type OpView =
  | "list"
  | "basics"
  | "creating"
  | "campaign"
  | "evaluating"
  | "dossier"
  | "enriching"
  | "firm-list"
  | "deploy-choice"
  | "invite-guest"
  | "invite-existing"
  | "client-fund"
  | "running";

type OpDoor =
  | null
  | "details"
  | "history"
  | "invite-history"
  | "dossier-more"
  | "pause"
  | "stop";

const NAV = [
  { id: "campaigns", label: "Campaigns" },
  { id: "meetings", label: "Meetings" },
  { id: "messages", label: "Messages" },
  { id: "operations", label: "Operations" },
] as const;

const HEADERS = [
  { key: "name", header: "Campaign" },
  { key: "company", header: "Company" },
  { key: "state", header: "State" },
  { key: "progress", header: "Booked / N" },
  { key: "touched", header: "Last touched" },
];

const CREATE_MS = 900;
const EVALUATE_MS = 1200;
const ENRICH_MS = 1000;

function decisionLabel(state: OpCampaignState): string {
  switch (state) {
    case "draft":
      return "Draft";
    case "evaluate":
      return "Evaluate";
    case "enrich":
      return "Enrich";
    case "ready":
      return "Ready";
    case "invited":
      return "Invited";
    case "funded":
      return "Funded";
    case "launched":
      return "Launched";
    case "running":
      return "Running";
    case "paused":
      return "Paused";
    case "stopped":
      return "Stopped";
  }
}

function pushHistory(
  c: OpCampaign,
  label: string,
): OpCampaignEvent[] {
  return [
    ...c.history,
    { id: `h-${Date.now()}`, at: "Just now", label },
  ];
}

/**
 * Operator Carbon desk — create → evaluate → enrich → deploy → invite → fund → running.
 * Doors: details, history, invite-history, dossier-more, pause, stop.
 */
export function OperatorCarbonApp() {
  const [nav, setNav] = useState<OpNav>("campaigns");
  const [campaigns, setCampaigns] = useState<OpCampaign[]>(() =>
    SEED_OP_CAMPAIGNS.map((c) => ({ ...c, history: [...c.history] })),
  );
  const [view, setView] = useState<OpView>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [door, setDoor] = useState<OpDoor>(null);
  const [basicsName, setBasicsName] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [companyQuery, setCompanyQuery] = useState("");
  const [firms, setFirms] = useState<FirmRow[]>(() =>
    SEED_FIRMS.map((f) => ({ ...f })),
  );
  const [inviteEmail, setInviteEmail] = useState<string>(CARBON_SEED.guestEmail);
  const [existingClientId, setExistingClientId] = useState(BUSINESS_CLIENTS[0].id);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>(() => [
    ...SEED_SENT_INVITES,
  ]);
  const [enrichHistoryOpen, setEnrichHistoryOpen] = useState(false);
  const [listFilter, setListFilter] = useState("");

  const active = campaigns.find((c) => c.id === activeId) ?? null;

  const companyMatches = useMemo(() => {
    const q = companyQuery.trim().toLowerCase();
    if (!q) return KNOWN_COMPANIES;
    return KNOWN_COMPANIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q),
    );
  }, [companyQuery]);

  const rows = useMemo(() => {
    const q = listFilter.trim().toLowerCase();
    return campaigns
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.companyName.toLowerCase().includes(q),
      )
      .map((c) => ({
        id: c.id,
        name: c.name,
        company: c.companyName,
        state: decisionLabel(c.state),
        progress:
          c.bookedMeetings != null
            ? `${c.bookedMeetings} / ${c.targetMeetings}`
            : `— / ${c.targetMeetings}`,
        touched: c.lastTouched,
        _state: c.state,
      }));
  }, [campaigns, listFilter]);

  function patchActive(
    patch: Partial<OpCampaign>,
    historyLabel?: string,
  ) {
    if (!activeId) return;
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        const next = { ...c, ...patch };
        if (historyLabel) next.history = pushHistory(c, historyLabel);
        return next;
      }),
    );
  }

  function openCampaign(id: string) {
    const c = campaigns.find((x) => x.id === id);
    if (!c) return;
    setActiveId(id);    if (c.state === "draft") setView("basics");
    else if (c.state === "evaluate") setView("campaign");
    else if (c.state === "enrich") setView("firm-list");
    else if (c.state === "ready") setView("deploy-choice");
    else if (c.state === "invited") setView("client-fund");
    else if (
      c.state === "funded" ||
      c.state === "launched" ||
      c.state === "running" ||
      c.state === "paused"
    )
      setView("running");
    else setView("dossier");
  }

  function startCreateFromBasics() {
    const name =
      basicsName.trim() ||
      CREATE_TEMPLATES.find((t) => t.id === templateId)?.name ||
      "Untitled campaign";
    const id = `op-${Date.now()}`;
    setCampaigns((prev) => [
      {
        id,
        name,
        companyName: "—",
        state: "draft",
        lastTouched: "Just now",
        createdAt: "Just now",
        targetMeetings: CARBON_SEED.meetingsTarget,
        pricePerMeeting: CARBON_SEED.pricePerMeeting,
        holdDays: CARBON_SEED.holdDays,
        history: [{ id: "h0", at: "Just now", label: "Created" }],
      },
      ...prev,
    ]);
    setActiveId(id);
    setView("creating");
  }

  useEffect(() => {
    if (view !== "creating" || !activeId) return;
    const t = window.setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                state: "evaluate",
                lastTouched: "Just now",
                history: pushHistory(c, "Skeleton ready"),
              }
            : c,
        ),
      );
      setView("campaign");
    }, CREATE_MS);
    return () => window.clearTimeout(t);
  }, [view, activeId]);

  useEffect(() => {
    if (view !== "evaluating" || !activeId) return;
    const t = window.setTimeout(() => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                state: "enrich",
                lastTouched: "Just now",
                history: pushHistory(c, "Evaluated"),
              }
            : c,
        ),
      );
      setView("dossier");
    }, EVALUATE_MS);
    return () => window.clearTimeout(t);
  }, [view, activeId]);

  useEffect(() => {
    if (view !== "enriching" || !activeId) return;
    const t = window.setTimeout(() => {
      setView("firm-list");
    }, ENRICH_MS);
    return () => window.clearTimeout(t);
  }, [view, activeId]);

  function pageTitle(): string {
    if (nav !== "campaigns") {
      return NAV.find((n) => n.id === nav)?.label ?? "Campaigns";
    }
    switch (view) {
      case "list":
        return "Campaigns";
      case "basics":
        return "Create";
      case "creating":
        return "Creating";
      case "campaign":
        return "Pick company";
      case "evaluating":
        return "Evaluate";
      case "dossier":
        return "Dossier";
      case "enriching":
        return "Enriching";
      case "firm-list":
        return "Firm list";
      case "deploy-choice":
        return "Deploy";
      case "invite-guest":
        return "Invite guest";
      case "invite-existing":
        return "Invite existing";
      case "client-fund":
        return "Awaiting fund";
      case "running":
        return active?.name ?? "Running";
    }
  }

  const doorCampaign =
    door === "invite-history"
      ? active
      : door && active
        ? active
        : null;

  return (
    <CarbonDeskShell
      personaId="operator"
      productLabel="Operator"
      navItems={NAV}
      activeNav={nav}
      onNavChange={(id) => {
        setNav(id as OpNav);
        if (id === "campaigns") setView("list");
      }}
      pageTitle={pageTitle()}
      pageActions={
        nav === "campaigns" && view === "list" ? (
          <Stack orientation="horizontal" gap={3}>
            <Button
              kind="ghost"
              size="sm"
              onClick={() => setDoor("invite-history")}
            >
              Invite history
            </Button>
            <Button
              onClick={() => {
                setBasicsName("");
                setTemplateId(null);
                setActiveId(null);
                setView("basics");
              }}
            >
              Create campaign
            </Button>
          </Stack>
        ) : nav === "campaigns" && view !== "list" ? (
          <Button kind="ghost" onClick={() => setView("list")}>
            Back to campaigns
          </Button>
        ) : null
      }
    >
      {nav !== "campaigns" ? (
        <Layer>
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title="Not in this desk yet"
            subtitle={`${NAV.find((n) => n.id === nav)?.label} stays expressible as a peer surface — no Operator prep work lives here.`}
          />
        </Layer>
      ) : null}

      {/* —— List —— */}
      {nav === "campaigns" && view === "list" ? (
        <DataTable rows={rows} headers={HEADERS} isSortable>
          {({
            rows: tableRows,
            headers,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getTableContainerProps,
          }) => (
            <TableContainer
              {...getTableContainerProps()}
              title="Prepared campaigns"
              description="Create, evaluate, enrich, deploy, invite, launch."
            >
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch
                    persistent
                    value={listFilter}
                    onChange={(e, value) => {
                      const next =
                        typeof value === "string"
                          ? value
                          : (e as { target?: { value?: string } })?.target
                              ?.value ?? "";
                      setListFilter(next);
                    }}
                    onClear={() => setListFilter("")}
                    placeholder="Filter campaigns"
                  />
                  <Button
                    onClick={() => {
                      setBasicsName("");
                      setTemplateId(null);
                      setView("basics");
                    }}
                  >
                    Create
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} size="md">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => {
                      const { key, ...rest } = getHeaderProps({ header });
                      return (
                        <TableHeader key={key} {...rest}>
                          {header.header}
                        </TableHeader>
                      );
                    })}
                    <TableHeader />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableRows.map((row) => {
                    const camp = campaigns.find((c) => c.id === row.id);
                    const { key, ...rowProps } = getRowProps({ row });
                    return (
                      <TableRow
                        key={key}
                        {...rowProps}
                        onClick={() => openCampaign(row.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === "state" && camp ? (
                              <StatusTag
                                label={String(cell.value)}
                                state={camp.state}
                              />
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                        <TableCell
                          onClick={(e) => e.stopPropagation()}
                        >
                          <OverflowMenu
                            flipped
                            size="sm"
                            ariaLabel="Campaign actions"
                          >
                            <OverflowMenuItem
                              itemText="Open"
                              onClick={() => openCampaign(row.id)}
                            />
                            <OverflowMenuItem
                              itemText="Details"
                              onClick={() => {
                                setActiveId(row.id);
                                setDoor("details");
                              }}
                            />
                            <OverflowMenuItem
                              itemText="History"
                              onClick={() => {
                                setActiveId(row.id);
                                setDoor("history");
                              }}
                            />
                            {camp?.state === "ready" ||
                            camp?.state === "enrich" ? (
                              <OverflowMenuItem
                                itemText="Deploy"
                                onClick={() => {
                                  setActiveId(row.id);
                                  setView("deploy-choice");
                                }}
                              />
                            ) : null}
                            {camp?.state === "funded" ? (
                              <OverflowMenuItem
                                itemText="Launch"
                                onClick={() => {
                                  setActiveId(row.id);
                                  setCampaigns((prev) =>
                                    prev.map((c) =>
                                      c.id === row.id
                                        ? {
                                            ...c,
                                            state: "running",
                                            bookedMeetings: 0,
                                            lastTouched: "Just now",
                                            history: pushHistory(
                                              c,
                                              "Launched",
                                            ),
                                          }
                                        : c,
                                    ),
                                  );
                                  setView("running");
                                }}
                              />
                            ) : null}
                          </OverflowMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      ) : null}

      {/* —— Basics / templates —— */}
      {nav === "campaigns" && view === "basics" ? (
        <Stack gap={6}>
          <p className="cds--type-body-01">
            Name the campaign, or start from a template. Company pick is next.
          </p>
          <TextInput
            id="basics-name"
            labelText="Campaign name"
            placeholder="Founding sales — Q3"
            value={basicsName}
            onChange={(e) => setBasicsName(e.target.value)}
          />
          <RadioButtonGroup
            legendText="Templates"
            name="create-template"
            valueSelected={templateId ?? undefined}
            onChange={(v) => {
              const id = String(v);
              setTemplateId(id);
              const t = CREATE_TEMPLATES.find((x) => x.id === id);
              if (t) setBasicsName(t.name);
            }}
          >
            {CREATE_TEMPLATES.map((t) => (
              <RadioButton
                key={t.id}
                id={`tpl-${t.id}`}
                value={t.id}
                labelText={t.label}
              />
            ))}
          </RadioButtonGroup>
          <Button onClick={startCreateFromBasics}>Continue</Button>
        </Stack>
      ) : null}

      {/* —— Creating skeleton —— */}
      {nav === "campaigns" && view === "creating" ? (
        <Stack gap={6}>
          <InlineLoading description="Building campaign skeleton…" />
          <Tile>
            <p className="cds--type-body-01">
              {active?.name ?? "Campaign"} · draft shell for company pick and
              evaluate.
            </p>
          </Tile>
        </Stack>
      ) : null}

      {/* —— Company pick —— */}
      {nav === "campaigns" && view === "campaign" && active ? (
        <Stack gap={6}>
          <p className="cds--type-body-01">
            Pick a pre-screened company. Evaluate runs on the next beat.
          </p>
          <TextInput
            id="company-query"
            labelText="Search companies"
            value={companyQuery}
            onChange={(e) => setCompanyQuery(e.target.value)}
            placeholder="Northwind, Brightline…"
          />
          <Stack gap={3}>
            {companyMatches.map((co) => (
              <Tile key={co.id}>
                <Stack orientation="horizontal" gap={4}>
                  <div style={{ flex: 1 }}>
                    <div className="cds--type-productive-heading-01">
                      {co.name}
                    </div>
                    <div className="cds--type-helper-text-01">
                      {co.domain} · {co.sector}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      patchActive(
                        {
                          companyName: co.name,
                          companyDomain: co.domain,
                          lastTouched: "Just now",
                        },
                        `Company · ${co.name}`,
                      );
                      setView("evaluating");
                    }}
                  >
                    Select
                  </Button>
                </Stack>
              </Tile>
            ))}
          </Stack>
          {active.companyName !== "—" ? (
            <Button
              kind="secondary"
              onClick={() => setView("evaluating")}
            >
              Evaluate {active.companyName}
            </Button>
          ) : null}
        </Stack>
      ) : null}

      {/* —— Evaluating skeleton —— */}
      {nav === "campaigns" && view === "evaluating" && active ? (
        <Stack gap={6}>
          <InlineLoading
            description={`Evaluating ${active.companyName}…`}
          />
          <Stack orientation="horizontal" gap={2} style={{ flexWrap: "wrap" }}>
            {EVALUATE_SOURCE_TAGS.map((tag) => (
              <Tag key={tag} type="gray" size="sm">
                {tag}
              </Tag>
            ))}
          </Stack>
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title="On-call evaluate"
            subtitle="Dossier fills from live sources. Enrich stays off this beat."
          />
        </Stack>
      ) : null}

      {/* —— Dossier —— */}
      {nav === "campaigns" && view === "dossier" && active ? (
        <DossierCarbon
          companyName={active.companyName}
          domain={
            active.companyDomain ??
            KNOWN_COMPANIES.find((c) => c.name === active.companyName)
              ?.domain ??
            ""
          }
          onEnrich={() => {
            patchActive(
              { state: "enrich", lastTouched: "Just now" },
              "Start enrich",
            );
            setView("enriching");
          }}
          onHistory={(label) => patchActive({ lastTouched: "Just now" }, label)}
        />
      ) : null}

      {/* —— Enriching —— */}
      {nav === "campaigns" && view === "enriching" && active ? (
        <Stack gap={6}>
          <InlineLoading description="Enriching firmographics…" />
          <p className="cds--type-helper-text-01">
            {SEED_ENRICH_RUN.sourceMix} · last run {SEED_ENRICH_RUN.at}
          </p>
          <FirmographicsCarbon firms={firms} onChange={setFirms} running />
        </Stack>
      ) : null}

      {/* —— Firm list —— */}
      {nav === "campaigns" && view === "firm-list" && active ? (
        <Stack gap={6}>
          <Stack orientation="horizontal" gap={3}>
            <Button
              kind="ghost"
              size="sm"
              onClick={() => setEnrichHistoryOpen(true)}
            >
              Enrich history
            </Button>
            <Button kind="ghost" size="sm" onClick={() => setDoor("details")}>
              Details
            </Button>
          </Stack>
          <p className="cds--type-body-01">
            Build and prune the firm list (full firmographics). Then deploy.
          </p>
          <FirmographicsCarbon
            firms={firms}
            onChange={setFirms}
            campaignName={active.name}
          />
          <Button
            onClick={() => {
              const kept = firms.filter((f) => f.keep).length;
              patchActive(
                {
                  state: "ready",
                  firmCount: kept,
                  lastTouched: "Just now",
                },
                `Firm list ready · ${kept} kept`,
              );
              setView("deploy-choice");
            }}
          >
            Firm list ready · Deploy
          </Button>
        </Stack>
      ) : null}

      {/* —— Deploy choice —— */}
      {nav === "campaigns" && view === "deploy-choice" && active ? (
        <Stack gap={6}>
          <FactList
            facts={[
              { label: "Campaign", value: active.name },
              { label: "Company", value: active.companyName },
              {
                label: "Firms",
                value: String(active.firmCount ?? firms.filter((f) => f.keep).length),
              },
              {
                label: "Price",
                value: `$${active.pricePerMeeting} / meeting`,
              },
              { label: "Target", value: String(active.targetMeetings) },
            ]}
          />
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title="Deploy choice"
            subtitle="Guest invite starts a new payer vessel. Existing client attaches to an account already on the desk."
          />
          <Stack orientation="horizontal" gap={4}>
            <Button onClick={() => setView("invite-guest")}>
              Invite guest
            </Button>
            <Button kind="secondary" onClick={() => setView("invite-existing")}>
              Invite existing client
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {/* —— Invite guest —— */}
      {nav === "campaigns" && view === "invite-guest" && active ? (
        <Stack gap={6}>
          <Button kind="ghost" size="sm" onClick={() => setView("deploy-choice")}>
            Back to deploy
          </Button>
          <TextInput
            id="invite-guest-email"
            labelText="Guest email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Tile>
            <p className="cds--type-body-01">
              Preview: {active.name} · ${active.pricePerMeeting} ·{" "}
              {active.targetMeetings} meetings · hold{" "}
              {active.holdDays ?? CARBON_SEED.holdDays}d
            </p>
          </Tile>
          <Button
            onClick={() => {
              patchActive(
                {
                  state: "invited",
                  clientEmail: inviteEmail,
                  clientName: "Guest",
                  lastTouched: "Just now",
                },
                `Invite guest · ${inviteEmail}`,
              );
              setSentInvites((prev) => [
                {
                  id: `si-${Date.now()}`,
                  campaignName: active.name,
                  kind: "guest",
                  to: inviteEmail,
                  at: "Just now",
                  status: "sent",
                },
                ...prev,
              ]);
              setView("client-fund");
            }}
          >
            Send guest invite
          </Button>
        </Stack>
      ) : null}

      {/* —— Invite existing —— */}
      {nav === "campaigns" && view === "invite-existing" && active ? (
        <Stack gap={6}>
          <Button kind="ghost" size="sm" onClick={() => setView("deploy-choice")}>
            Back to deploy
          </Button>
          <RadioButtonGroup
            legendText="Business client"
            name="existing-client"
            valueSelected={existingClientId}
            onChange={(v) => setExistingClientId(String(v))}
          >
            {BUSINESS_CLIENTS.map((bc) => (
              <RadioButton
                key={bc.id}
                id={bc.id}
                value={bc.id}
                labelText={`${bc.name} · ${bc.email}`}
              />
            ))}
          </RadioButtonGroup>
          <FactList
            facts={[
              {
                label: "Account",
                value:
                  BUSINESS_CLIENTS.find((b) => b.id === existingClientId)
                    ?.name ?? "—",
              },
              {
                label: "Email",
                value:
                  BUSINESS_CLIENTS.find((b) => b.id === existingClientId)
                    ?.email ?? "—",
              },
              { label: "Campaign", value: active.name },
            ]}
          />
          <Button
            onClick={() => {
              const bc =
                BUSINESS_CLIENTS.find((b) => b.id === existingClientId) ??
                BUSINESS_CLIENTS[0];
              patchActive(
                {
                  state: "invited",
                  clientEmail: bc.email,
                  clientName: bc.name,
                  lastTouched: "Just now",
                },
                `Invite existing · ${bc.name}`,
              );
              setSentInvites((prev) => [
                {
                  id: `si-${Date.now()}`,
                  campaignName: active.name,
                  kind: "existing",
                  to: bc.email,
                  at: "Just now",
                  status: "sent",
                },
                ...prev,
              ]);
              setView("client-fund");
            }}
          >
            Send to existing client
          </Button>
        </Stack>
      ) : null}

      {/* —— Client fund wait —— */}
      {nav === "campaigns" && view === "client-fund" && active ? (
        <Stack gap={6}>
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title="Waiting on client fund"
            subtitle={`${active.clientEmail ?? "Client"} holds the escrow door. Launch unlocks after fund.`}
          />
          <FactList
            facts={[
              { label: "Client", value: active.clientName ?? "—" },
              { label: "Email", value: active.clientEmail ?? "—" },
              {
                label: "Hold preview",
                value: `$${active.targetMeetings * active.pricePerMeeting}`,
              },
            ]}
          />
          <Stack orientation="horizontal" gap={3}>
            <Button
              kind="secondary"
              onClick={() => {
                patchActive(
                  { state: "funded", lastTouched: "Just now" },
                  "Client funded",
                );
                setSentInvites((prev) =>
                  prev.map((s) =>
                    s.campaignName === active.name && s.status === "sent"
                      ? { ...s, status: "funded" }
                      : s,
                  ),
                );
              }}
            >
              Simulate client fund
            </Button>
            <Button kind="ghost" onClick={() => setDoor("invite-history")}>
              Invite history
            </Button>
          </Stack>
          {(active.state === "funded" ||
            campaigns.find((c) => c.id === active.id)?.state === "funded") && (
            <Button
              onClick={() => {
                setCampaigns((prev) =>
                  prev.map((c) =>
                    c.id === active.id
                      ? {
                          ...c,
                          state: "running",
                          bookedMeetings: 0,
                          lastTouched: "Just now",
                          history: pushHistory(c, "Launched"),
                        }
                      : c,
                  ),
                );
                setView("running");
              }}
            >
              Launch
            </Button>
          )}
        </Stack>
      ) : null}

      {/* —— Running —— */}
      {nav === "campaigns" && view === "running" && active ? (
        <Stack gap={6}>
          <FactList
            facts={[
              {
                label: "State",
                value: (
                  <StatusTag
                    label={decisionLabel(active.state)}
                    state={active.state}
                  />
                ),
              },
              {
                label: "Booked / N",
                value: `${active.bookedMeetings ?? 0} / ${active.targetMeetings}`,
              },
              {
                label: "Client",
                value: `${active.clientName ?? "—"} · ${active.clientEmail ?? "—"}`,
              },
              {
                label: "Firms",
                value: String(active.firmCount ?? "—"),
              },
            ]}
          />
          <p className="cds--type-helper-text-01">
            Operator watches status. Worker runs outreach. Escrow is not Operator
            control.
          </p>
          <Stack orientation="horizontal" gap={3}>
            <Button kind="tertiary" onClick={() => setDoor("pause")}>
              Pause
            </Button>
            <Button kind="danger--tertiary" onClick={() => setDoor("stop")}>
              Stop
            </Button>
            <Button kind="ghost" onClick={() => setDoor("details")}>
              Details
            </Button>
            <Button kind="ghost" onClick={() => setDoor("history")}>
              History
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {/* —— Doors —— */}
      <DoorModal
        open={door === "details"}
        heading="Campaign details"
        label={doorCampaign?.name}
        onClose={() => setDoor(null)}
        size="md"
      >
        {active ? (
          <FactList
            facts={[
              { label: "Stage", value: decisionLabel(active.state) },
              { label: "Company", value: active.companyName },
              { label: "Created", value: active.createdAt },
              { label: "Last touched", value: active.lastTouched },
              {
                label: "Firms",
                value:
                  active.firmCount != null ? String(active.firmCount) : "—",
              },
              {
                label: "Target",
                value: `${active.targetMeetings} meetings`,
              },
              {
                label: "Price",
                value: `$${active.pricePerMeeting} / meeting`,
              },
              {
                label: "Hold",
                value: `${active.holdDays ?? CARBON_SEED.holdDays} days`,
              },
              {
                label: "Client",
                value: active.clientName ?? active.clientEmail ?? "—",
              },
            ]}
          />
        ) : (
          <p className="cds--type-body-01">Select a campaign.</p>
        )}
      </DoorModal>

      <DoorModal
        open={door === "history"}
        heading="Campaign history"
        label={active?.name}
        onClose={() => setDoor(null)}
      >
        {active ? (
          <Stack gap={3}>
            {active.history.map((e) => (
              <Tile key={e.id}>
                <span className="cds--type-helper-text-01">{e.at}</span>
                {" · "}
                <span className="cds--type-body-01">{e.label}</span>
              </Tile>
            ))}
          </Stack>
        ) : null}
      </DoorModal>

      <DoorModal
        open={door === "invite-history"}
        heading="Invite history"
        onClose={() => setDoor(null)}
        size="md"
      >
        {sentInvites.length === 0 ? (
          <p className="cds--type-body-01">No invites sent yet.</p>
        ) : (
          <Stack gap={3}>
            {sentInvites.map((inv) => (
              <Tile key={inv.id}>
                <div className="cds--type-productive-heading-01">
                  {inv.campaignName}
                </div>
                <div className="cds--type-body-01">
                  {inv.kind === "guest" ? "Guest" : "Existing"} → {inv.to}
                </div>
                <div className="cds--type-helper-text-01">
                  {inv.at} · {inv.status === "funded" ? "Funded" : "Sent"}
                </div>
              </Tile>
            ))}
          </Stack>
        )}
      </DoorModal>

      <DoorModal
        open={door === "dossier-more"}
        heading="Full dossier"
        label="All sections · read-only"
        onClose={() => setDoor(null)}
        size="lg"
      >
        <FactList
          facts={DOSSIER_SECTIONS.map((s) => ({
            label: s.label,
            value: s.fact,
          }))}
        />
      </DoorModal>

      <DoorModal
        open={door === "pause"}
        heading="Pause campaign"
        onClose={() => setDoor(null)}
        primaryButtonText="Pause"
        onRequestSubmit={() => {
          patchActive(
            { state: "paused", lastTouched: "Just now" },
            "Paused",
          );
          setDoor(null);
        }}
      >
        <Stack gap={3}>
          <p className="cds--type-body-01">Worker queue freezes.</p>
          <p className="cds--type-body-01">Held escrow stays.</p>
          <p className="cds--type-body-01">
            Client sees paused on their desk.
          </p>
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "stop"}
        heading="Stop campaign"
        danger
        onClose={() => setDoor(null)}
        primaryButtonText="Stop"
        onRequestSubmit={() => {
          patchActive(
            { state: "stopped", lastTouched: "Just now" },
            "Stopped",
          );
          setDoor(null);
        }}
      >
        <Stack gap={3}>
          <p className="cds--type-body-01">Worker queue clears.</p>
          <p className="cds--type-body-01">Held escrow freezes.</p>
          <p className="cds--type-body-01">No new meetings booked.</p>
        </Stack>
      </DoorModal>

      <DoorModal
        open={enrichHistoryOpen}
        heading="Enrich history"
        label={active?.name}
        onClose={() => setEnrichHistoryOpen(false)}
      >
        <FactList
          facts={[
            { label: "Last run", value: SEED_ENRICH_RUN.at },
            { label: "Duration", value: SEED_ENRICH_RUN.duration },
            { label: "Sources", value: SEED_ENRICH_RUN.sourceMix },
            {
              label: "Firms",
              value: String(SEED_ENRICH_RUN.firmTotal),
            },
          ]}
        />
      </DoorModal>
    </CarbonDeskShell>
  );
}
