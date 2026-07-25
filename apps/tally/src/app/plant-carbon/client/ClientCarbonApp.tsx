import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  DataTable,
  Dropdown,
  InlineNotification,
  Layer,
  NumberInput,
  OverflowMenu,
  OverflowMenuItem,
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
  TextArea,
  TextInput,
  Tile,
} from "@carbon/react";
import { CarbonDeskShell } from "../shell/CarbonDeskShell";
import { DoorModal } from "../ui/DoorModal";
import { FactList } from "../ui/FactList";
import { StatusTag } from "../ui/StatusTag";
import {
  CARBON_SEED,
  DISPUTE_REASONS,
  filterMeetings,
  GUEST_INVITE,
  MEETING_FILTER_LABELS,
  SEED_CLIENT_VESSELS,
  SEED_FAQ,
  SEED_FIRMS,
  SEED_MEETINGS,
  SEED_TALK,
  WHAT_COUNTS,
  type ClientVessel,
  type FirmRow,
  type MeetingFilter,
  type MeetingRow,
} from "../data/seed";

type ClientNav = "campaigns" | "meetings" | "escrow";
type ClientDoor =
  | null
  | "firms"
  | "details"
  | "talk"
  | "alerts"
  | "history"
  | "stop"
  | "faq"
  | "requests"
  | "pause";

const NAV_BASE = [
  { id: "campaigns", label: "Campaigns" },
  { id: "meetings", label: "Meetings" },
  { id: "escrow", label: "Escrow" },
] as const;

const FILTER_IDS: MeetingFilter[] = [
  "all",
  "upcoming",
  "pending",
  "disputed",
  "released",
  "needs-you",
];

/**
 * Business Client Carbon desk — Campaigns · Meetings · Escrow.
 * Meeting filters; respond with accept + dispute reason+evidence (invite-before-form).
 * Doors: firms, details, talk, alerts, history, stop, faq, requests, pause.
 */
export function ClientCarbonApp({
  initialVessels,
  initialMeetings,
  personaId = "client",
}: {
  initialVessels?: ClientVessel[];
  initialMeetings?: MeetingRow[];
  personaId?: "client" | "guest";
} = {}) {
  const [nav, setNav] = useState<ClientNav>("campaigns");
  const [vessels, setVessels] = useState<ClientVessel[]>(() =>
    (initialVessels ?? SEED_CLIENT_VESSELS).map((v) => ({
      ...v,
      history: [...(v.history ?? [])],
    })),
  );
  const [meetings, setMeetings] = useState<MeetingRow[]>(() =>
    (initialMeetings ?? SEED_MEETINGS).map((m) => ({ ...m })),
  );
  const [firms, setFirms] = useState<FirmRow[]>(() =>
    SEED_FIRMS.map((f) => ({ ...f })),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [door, setDoor] = useState<ClientDoor>(null);
  const [meetingFilter, setMeetingFilter] = useState<MeetingFilter>("all");
  const [filterDoorOpen, setFilterDoorOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [fundN, setFundN] = useState<number>(CARBON_SEED.meetingsTarget);
  const [disputeInvited, setDisputeInvited] = useState(false);
  const [disputeReason, setDisputeReason] = useState<string>(
    DISPUTE_REASONS[0].id,
  );
  const [disputeEvidence, setDisputeEvidence] = useState("");
  const [pauseWhy, setPauseWhy] = useState("");
  const [reclaimOpen, setReclaimOpen] = useState(false);
  const [requestNote, setRequestNote] = useState("");

  const selected = vessels.find((v) => v.id === selectedId) ?? null;
  const meeting = meetings.find((m) => m.id === meetingId) ?? null;
  const pendingCount = meetings.filter((m) => m.status === "pending").length;
  const escrowAlert = vessels.some(
    (v) => v.state === "stopped" || v.reclaimDaysLeft <= 3,
  );
  const filteredMeetings = useMemo(
    () => filterMeetings(meetings, meetingFilter),
    [meetings, meetingFilter],
  );

  useEffect(() => {
    setDisputeInvited(false);
    setDisputeEvidence("");
    setDisputeReason(DISPUTE_REASONS[0].id);
  }, [meetingId]);

  const navItems = useMemo(
    () =>
      NAV_BASE.map((n) => ({
        ...n,
        badge:
          n.id === "meetings"
            ? pendingCount || undefined
            : n.id === "escrow" && escrowAlert
              ? "!"
              : undefined,
      })),
    [pendingCount, escrowAlert],
  );

  const vesselRows = vessels.map((v) => ({
    id: v.id,
    name: v.name,
    state: v.state,
    progress: `${v.bookedCount} / ${v.target}`,
    money: v.held > 0 ? `$${v.held} held` : "—",
    peek: v.nextMeetingPeek ?? "—",
  }));

  function fundVessel(id: string) {
    if (!termsAccepted) return;
    setVessels((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              state: "funded",
              held: fundN * v.price,
              target: fundN,
              reclaimDaysLeft: v.reclaimDaysLeft || CARBON_SEED.holdDays,
              history: [
                ...v.history,
                { id: `h-${Date.now()}`, at: "Just now", label: "Funded" },
              ],
            }
          : v,
      ),
    );
    setSelectedId(null);
    setTermsAccepted(false);
  }

  function submitDispute() {
    if (!meeting || !disputeEvidence.trim()) return;
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meeting.id ? { ...m, status: "disputed" } : m,
      ),
    );
    setMeetingId(null);
    setDisputeInvited(false);
  }

  return (
    <CarbonDeskShell
      personaId={personaId}
      productLabel="Client"
      navItems={navItems}
      activeNav={nav}
      onNavChange={(id) => {
        setNav(id as ClientNav);
        setSelectedId(null);
        setMeetingId(null);
      }}
      pageTitle={
        nav === "campaigns"
          ? "Campaigns"
          : nav === "meetings"
            ? "Meetings"
            : "Escrow"
      }
    >
      {/* —— Campaigns list —— */}
      {nav === "campaigns" && !selectedId ? (
        <DataTable
          rows={vesselRows}
          headers={[
            { key: "name", header: "Campaign" },
            { key: "state", header: "State" },
            { key: "progress", header: "Booked / N" },
            { key: "money", header: "Hold" },
            { key: "peek", header: "Next" },
          ]}
        >
          {({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            getTableProps,
            getTableContainerProps,
          }) => (
            <TableContainer
              {...getTableContainerProps()}
              title="Your vessels"
              description="Join and fund Operator-prepared campaigns."
            >
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
                  {rows.map((row) => {
                    const { key, ...rowProps } = getRowProps({ row });
                    return (
                      <TableRow
                        key={key}
                        {...rowProps}
                        onClick={() => setSelectedId(row.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>
                            {cell.info.header === "state" ? (
                              <StatusTag
                                label={String(cell.value)}
                                state={String(cell.value)}
                              />
                            ) : (
                              cell.value
                            )}
                          </TableCell>
                        ))}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <OverflowMenu
                            flipped
                            size="sm"
                            ariaLabel="Vessel doors"
                          >
                            <OverflowMenuItem
                              itemText="Open"
                              onClick={() => setSelectedId(row.id)}
                            />
                            <OverflowMenuItem
                              itemText="Details"
                              onClick={() => {
                                setSelectedId(row.id);
                                setDoor("details");
                              }}
                            />
                            <OverflowMenuItem
                              itemText="Firms"
                              onClick={() => {
                                setSelectedId(row.id);
                                setDoor("firms");
                              }}
                            />
                            <OverflowMenuItem
                              itemText="History"
                              onClick={() => {
                                setSelectedId(row.id);
                                setDoor("history");
                              }}
                            />
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

      {/* —— Vessel detail —— */}
      {nav === "campaigns" && selected ? (
        <Stack gap={6}>
          <Stack orientation="horizontal" gap={3}>
            <Button kind="ghost" size="sm" onClick={() => setSelectedId(null)}>
              Back to campaigns
            </Button>
            <Button kind="ghost" size="sm" onClick={() => setDoor("details")}>
              Details
            </Button>
            <Button kind="ghost" size="sm" onClick={() => setDoor("firms")}>
              Firms
            </Button>
            <Button kind="ghost" size="sm" onClick={() => setDoor("talk")}>
              Talk
            </Button>
            <Button kind="ghost" size="sm" onClick={() => setDoor("history")}>
              History
            </Button>
            <Button kind="ghost" size="sm" onClick={() => setDoor("faq")}>
              FAQ
            </Button>
            <Button kind="ghost" size="sm" onClick={() => setDoor("requests")}>
              Requests
            </Button>
            <Button kind="ghost" size="sm" onClick={() => setDoor("alerts")}>
              Alerts
            </Button>
          </Stack>
          <FactList
            facts={[
              { label: "Campaign", value: selected.name },
              {
                label: "State",
                value: (
                  <StatusTag label={selected.state} state={selected.state} />
                ),
              },
              { label: "Operator", value: selected.operatorName },
              {
                label: "Price / meeting",
                value: `$${selected.price}`,
              },
              {
                label: "Booked / N",
                value: `${selected.bookedCount} / ${selected.target}`,
              },
              {
                label: "Held / Released",
                value: `$${selected.held} / $${selected.released}`,
              },
              {
                label: "What counts",
                value: GUEST_INVITE.rules.join(" · "),
              },
              ...(selected.pauseWhy
                ? [{ label: "Pause note", value: selected.pauseWhy }]
                : []),
            ]}
          />

          {selected.state === "invited" ? (
            <Stack gap={5}>
              <NumberInput
                id="fund-n"
                label="Meetings to fund"
                min={1}
                max={12}
                value={fundN}
                onChange={(_, { value }) =>
                  setFundN(typeof value === "number" ? value : fundN)
                }
              />
              <p className="cds--type-body-01">
                Hold ${fundN * selected.price}. Custodian: {CARBON_SEED.custodian}.
                Reclaim after {selected.holdDays} days.
              </p>
              <Checkbox
                id="terms"
                labelText="I accept the locked terms for this vessel"
                checked={termsAccepted}
                onChange={(_, { checked }) => setTermsAccepted(checked)}
              />
              <Button
                disabled={!termsAccepted}
                onClick={() => fundVessel(selected.id)}
              >
                Fund ${fundN * selected.price}
              </Button>
            </Stack>
          ) : null}

          {selected.state === "running" ||
          selected.state === "funded" ||
          selected.state === "paused" ? (
            <Stack orientation="horizontal" gap={4}>
              {selected.state !== "paused" ? (
                <Button kind="tertiary" onClick={() => setDoor("pause")}>
                  Pause
                </Button>
              ) : (
                <Button
                  kind="tertiary"
                  onClick={() =>
                    setVessels((prev) =>
                      prev.map((v) =>
                        v.id === selected.id
                          ? {
                              ...v,
                              state: "running",
                              pauseWhy: undefined,
                              history: [
                                ...v.history,
                                {
                                  id: `h-${Date.now()}`,
                                  at: "Just now",
                                  label: "Resumed",
                                },
                              ],
                            }
                          : v,
                      ),
                    )
                  }
                >
                  Resume
                </Button>
              )}
              <Button kind="danger--tertiary" onClick={() => setDoor("stop")}>
                Stop
              </Button>
              <Button kind="ghost" onClick={() => setReclaimOpen(true)}>
                Reclaim unspent
              </Button>
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      {/* —— Meetings —— */}
      {nav === "meetings" && !meetingId ? (
        meetings.length === 0 ? (
          <Layer>
            <InlineNotification
              kind="info"
              lowContrast
              hideCloseButton
              title="No meetings yet"
              subtitle="Meetings appear after a Worker logs qualified conversations."
            />
          </Layer>
        ) : (
          <DataTable
            rows={filteredMeetings.map((m) => ({
              id: m.id,
              who: m.who,
              role: m.role,
              when: m.when,
              status: m.status,
              vessel: m.vesselName,
            }))}
            headers={[
              { key: "who", header: "Who" },
              { key: "role", header: "Role" },
              { key: "when", header: "When" },
              { key: "status", header: "Status" },
              { key: "vessel", header: "Campaign" },
            ]}
          >
            {({
              rows,
              headers,
              getHeaderProps,
              getRowProps,
              getTableProps,
              getTableContainerProps,
            }) => (
              <TableContainer
                {...getTableContainerProps()}
                title="Meeting packets"
                description={`Filter: ${MEETING_FILTER_LABELS[meetingFilter]}. Accept or dispute behind invite.`}
              >
                <TableToolbar>
                  <TableToolbarContent>
                    <Button
                      kind="ghost"
                      size="sm"
                      onClick={() => setFilterDoorOpen(true)}
                    >
                      Filter
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          No {MEETING_FILTER_LABELS[meetingFilter].toLowerCase()}{" "}
                          meetings.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => {
                        const { key, ...rowProps } = getRowProps({ row });
                        return (
                          <TableRow
                            key={key}
                            {...rowProps}
                            onClick={() => setMeetingId(row.id)}
                            style={{ cursor: "pointer" }}
                          >
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>
                                {cell.info.header === "status" ? (
                                  <StatusTag
                                    label={String(cell.value)}
                                    state={String(cell.value)}
                                  />
                                ) : (
                                  cell.value
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        )
      ) : null}

      {/* —— Meeting respond —— */}
      {nav === "meetings" && meeting ? (
        <Stack gap={6}>
          <Button kind="ghost" size="sm" onClick={() => setMeetingId(null)}>
            Back to meetings
          </Button>
          <FactList
            facts={[
              {
                label: "Who",
                value: `${meeting.who} · ${meeting.role}`,
              },
              {
                label: "Company",
                value: `${meeting.company} (${meeting.size})`,
              },
              { label: "When", value: meeting.when },
              { label: "Pain", value: meeting.pain },
              {
                label: "Length",
                value:
                  meeting.lengthMin != null
                    ? `${meeting.lengthMin} min`
                    : "—",
              },
              {
                label: "Attended",
                value: meeting.attended ? "Yes" : "Not yet",
              },
              {
                label: "Status",
                value: (
                  <StatusTag label={meeting.status} state={meeting.status} />
                ),
              },
              {
                label: "What counts",
                value: WHAT_COUNTS.join(" · "),
              },
            ]}
          />
          {meeting.status === "pending" ? (
            <Stack gap={4}>
              <Stack orientation="horizontal" gap={4}>
                <Button
                  onClick={() => {
                    setMeetings((prev) =>
                      prev.map((m) =>
                        m.id === meeting.id
                          ? { ...m, status: "accepted" }
                          : m,
                      ),
                    );
                    setMeetingId(null);
                  }}
                >
                  Accept
                </Button>
                {!disputeInvited ? (
                  <Button
                    kind="danger--tertiary"
                    onClick={() => setDisputeInvited(true)}
                  >
                    Dispute
                  </Button>
                ) : null}
              </Stack>
              {disputeInvited ? (
                <Tile>
                  <Stack gap={4}>
                    <Dropdown
                      id="dispute-reason"
                      titleText="Reason"
                      label="Select reason"
                      items={[...DISPUTE_REASONS]}
                      itemToString={(item) => (item ? item.label : "")}
                      selectedItem={
                        DISPUTE_REASONS.find((r) => r.id === disputeReason) ??
                        DISPUTE_REASONS[0]
                      }
                      onChange={({ selectedItem }) => {
                        if (selectedItem) setDisputeReason(selectedItem.id);
                      }}
                    />
                    <TextArea
                      id="dispute-evidence"
                      labelText="Evidence"
                      placeholder="What proves the packet fails locked rules?"
                      value={disputeEvidence}
                      onChange={(e) => setDisputeEvidence(e.target.value)}
                    />
                    <Stack orientation="horizontal" gap={3}>
                      <Button
                        kind="danger"
                        disabled={!disputeEvidence.trim()}
                        onClick={submitDispute}
                      >
                        Submit dispute
                      </Button>
                      <Button
                        kind="ghost"
                        onClick={() => {
                          setDisputeInvited(false);
                          setDisputeEvidence("");
                        }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                </Tile>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      {/* —— Escrow —— */}
      {nav === "escrow" ? (
        <Stack gap={6}>
          <DataTable
            rows={vessels
              .filter(
                (v) =>
                  v.held > 0 || v.released > 0 || v.state === "reclaimed",
              )
              .map((v) => ({
                id: v.id,
                name: v.name,
                held: `$${v.held}`,
                released: `$${v.released}`,
                reclaim: `${v.reclaimDaysLeft}d`,
                state: v.state,
              }))}
            headers={[
              { key: "name", header: "Campaign" },
              { key: "held", header: "Held" },
              { key: "released", header: "Released" },
              { key: "reclaim", header: "Reclaim window" },
              { key: "state", header: "State" },
            ]}
          >
            {({
              rows,
              headers,
              getHeaderProps,
              getRowProps,
              getTableProps,
              getTableContainerProps,
            }) => (
              <TableContainer
                {...getTableContainerProps()}
                title="Escrow hold"
                description="Held vs released. Release per qualified meeting. Reclaim unspent."
              >
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          No hold yet. Fund a campaign to open escrow.
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => {
                        const { key, ...rowProps } = getRowProps({ row });
                        return (
                          <TableRow
                            key={key}
                            {...rowProps}
                            onClick={() => {
                              setNav("campaigns");
                              setSelectedId(row.id);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {row.cells.map((cell) => (
                              <TableCell key={cell.id}>
                                {cell.info.header === "state" ? (
                                  <StatusTag
                                    label={String(cell.value)}
                                    state={String(cell.value)}
                                  />
                                ) : (
                                  cell.value
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </Stack>
      ) : null}

      {/* —— Doors —— */}
      <DoorModal
        open={filterDoorOpen}
        heading="Meeting filters"
        onClose={() => setFilterDoorOpen(false)}
      >
        <Stack gap={2}>
          {FILTER_IDS.map((id) => (
            <Button
              key={id}
              kind={meetingFilter === id ? "primary" : "ghost"}
              onClick={() => {
                setMeetingFilter(id);
                setFilterDoorOpen(false);
              }}
            >
              {MEETING_FILTER_LABELS[id]}
            </Button>
          ))}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "details" && !!selected}
        heading="Details"
        label={selected?.name}
        onClose={() => setDoor(null)}
        size="md"
      >
        {selected ? (
          <Stack gap={4}>
            <FactList
              facts={[
                { label: "State", value: selected.state },
                {
                  label: "Price",
                  value: `$${selected.price} / meeting`,
                },
                {
                  label: "Hold days",
                  value: `${selected.holdDays}d`,
                },
                {
                  label: "Custodian",
                  value: CARBON_SEED.custodian,
                },
                { label: "Operator", value: selected.operatorName },
              ]}
            />
            <div>
              <div className="cds--type-label-01">What counts (locked)</div>
              <ul className="cds--type-body-01">
                {WHAT_COUNTS.map((r) => (
                  <li key={r}>✓ {r}</li>
                ))}
              </ul>
            </div>
          </Stack>
        ) : null}
      </DoorModal>

      <DoorModal
        open={door === "firms"}
        heading="Firms"
        label={selected?.name}
        onClose={() => setDoor(null)}
        size="lg"
      >
        <Stack gap={3}>
          {firms.map((f) => (
            <Tile key={f.id}>
              <Stack orientation="horizontal" gap={3}>
                <div style={{ flex: 1 }}>
                  <div className="cds--type-productive-heading-01">{f.name}</div>
                  <div className="cds--type-helper-text-01">
                    {f.sector} · {f.employees}
                    {f.tag && f.tag !== "none" ? ` · ${f.tag}` : ""}
                  </div>
                </div>
                <Button
                  size="sm"
                  kind="danger--ghost"
                  onClick={() =>
                    setFirms((prev) =>
                      prev.map((x) =>
                        x.id === f.id
                          ? { ...x, blockedBy: "you", keep: false }
                          : x,
                      ),
                    )
                  }
                >
                  Block
                </Button>
              </Stack>
            </Tile>
          ))}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "talk"}
        heading="Talk track"
        onClose={() => setDoor(null)}
      >
        <Stack gap={3}>
          {SEED_TALK.map((t) => (
            <Tile key={t.id}>
              <p className="cds--type-body-01">{t.line}</p>
            </Tile>
          ))}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "alerts"}
        heading="Alerts"
        onClose={() => setDoor(null)}
      >
        <Stack gap={3}>
          {pendingCount > 0 ? (
            <InlineNotification
              kind="warning"
              lowContrast
              hideCloseButton
              title={`${pendingCount} meeting(s) need a response`}
              subtitle="Accept or dispute from Meetings."
            />
          ) : null}
          {escrowAlert ? (
            <InlineNotification
              kind="error"
              lowContrast
              hideCloseButton
              title="Escrow attention"
              subtitle="A vessel is stopped or reclaim window is short."
            />
          ) : null}
          {pendingCount === 0 && !escrowAlert ? (
            <p className="cds--type-body-01">No alerts.</p>
          ) : null}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "history" && !!selected}
        heading="Vessel history"
        label={selected?.name}
        onClose={() => setDoor(null)}
      >
        {selected ? (
          <Stack gap={3}>
            {selected.history.map((e) => (
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
        open={door === "faq"}
        heading="FAQ"
        onClose={() => setDoor(null)}
        size="lg"
      >
        <Stack gap={4}>
          {SEED_FAQ.map((item) => (
            <Tile key={item.q}>
              <div className="cds--type-productive-heading-01">{item.q}</div>
              <p className="cds--type-body-01" style={{ marginTop: "0.5rem" }}>
                {item.a}
              </p>
            </Tile>
          ))}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "requests"}
        heading="Request operator"
        onClose={() => setDoor(null)}
        primaryButtonText="Send"
        primaryButtonDisabled={!requestNote.trim()}
        onRequestSubmit={() => {
          setRequestNote("");
          setDoor(null);
        }}
      >
        <TextInput
          id="bc-request"
          labelText="Note for Operator"
          value={requestNote}
          onChange={(e) => setRequestNote(e.target.value)}
          placeholder="ICP swap, price question…"
        />
      </DoorModal>

      <DoorModal
        open={door === "pause" && !!selected}
        heading="Pause campaign"
        onClose={() => {
          setDoor(null);
          setPauseWhy("");
        }}
        primaryButtonText="Pause"
        onRequestSubmit={() => {
          if (!selected) return;
          setVessels((prev) =>
            prev.map((v) =>
              v.id === selected.id
                ? {
                    ...v,
                    state: "paused",
                    pauseWhy: pauseWhy.trim() || undefined,
                    history: [
                      ...v.history,
                      {
                        id: `h-${Date.now()}`,
                        at: "Just now",
                        label: pauseWhy.trim()
                          ? `Paused · ${pauseWhy.trim()}`
                          : "Paused",
                      },
                    ],
                  }
                : v,
            ),
          );
          setDoor(null);
          setPauseWhy("");
        }}
      >
        <p className="cds--type-body-01">
          Outreach pauses on this vessel. Held escrow stays.
        </p>
        <TextInput
          id="pause-why"
          labelText="Why pause? (optional)"
          value={pauseWhy}
          onChange={(e) => setPauseWhy(e.target.value)}
        />
      </DoorModal>

      <DoorModal
        open={door === "stop" && !!selected}
        heading="Stop campaign"
        danger
        onClose={() => setDoor(null)}
        primaryButtonText="Stop"
        onRequestSubmit={() => {
          if (!selected) return;
          setVessels((prev) =>
            prev.map((v) =>
              v.id === selected.id
                ? {
                    ...v,
                    state: "stopped",
                    history: [
                      ...v.history,
                      {
                        id: `h-${Date.now()}`,
                        at: "Just now",
                        label: "Stopped",
                      },
                    ],
                  }
                : v,
            ),
          );
          setDoor(null);
        }}
      >
        <p className="cds--type-body-01">
          Worker sees the stop signal. Unspent hold remains reclaimable.
        </p>
        <FactList
          facts={[
            {
              label: "Held now",
              value: selected ? `$${selected.held}` : "—",
            },
            {
              label: "Released",
              value: selected ? `$${selected.released}` : "—",
            },
          ]}
        />
      </DoorModal>

      <DoorModal
        open={reclaimOpen && !!selected}
        heading="Reclaim unspent"
        onClose={() => setReclaimOpen(false)}
        primaryButtonText="Reclaim"
        onRequestSubmit={() => {
          if (!selected) return;
          setVessels((prev) =>
            prev.map((v) =>
              v.id === selected.id
                ? {
                    ...v,
                    state: "reclaimed",
                    held: 0,
                    reclaimDaysLeft: 0,
                    history: [
                      ...v.history,
                      {
                        id: `h-${Date.now()}`,
                        at: "Just now",
                        label: "Reclaimed unspent",
                      },
                    ],
                  }
                : v,
            ),
          );
          setReclaimOpen(false);
          setSelectedId(null);
        }}
      >
        <p className="cds--type-body-01">
          One-shot reclaim of unspent hold. Released meetings stay released.
        </p>
        <FactList
          facts={[
            {
              label: "Unspent",
              value: selected ? `$${selected.held}` : "—",
            },
            {
              label: "Window left",
              value: selected ? `${selected.reclaimDaysLeft}d` : "—",
            },
          ]}
        />
      </DoorModal>
    </CarbonDeskShell>
  );
}
