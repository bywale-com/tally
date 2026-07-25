import { useMemo, useState } from "react";
import {
  Button,
  ComboBox,
  DataTable,
  InlineNotification,
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
  filterPipeline,
  filterWorkerQueue,
  PIPELINE_FILTER_LABELS,
  QUEUE_FILTER_LABELS,
  SEED_FIRMS,
  SEED_TALK,
  SEED_WORKER_PIPELINE,
  SEED_WORKER_POOL,
  type FirmRow,
  type PipelineFilter,
  type QueueFilter,
  type WorkerPipelineRow,
  type WorkerVessel,
} from "../data/seed";
import { workerAvailableAdmits } from "../world/admission";

type WorkerNav = "available" | "active" | "pipeline";
type WorkerView = "list" | "claimed" | "working" | "log";
type WorkerDoor =
  | null
  | "details"
  | "firms"
  | "talk"
  | "history"
  | "alerts"
  | "packet";

const PIPELINE_FILTERS: PipelineFilter[] = [
  "all",
  "pending",
  "upcoming",
  "released",
  "disputed",
];

const QUEUE_FILTERS: QueueFilter[] = ["all", "high-pay", "pinned"];

function pipelineLabel(status: WorkerPipelineRow["status"]): string {
  switch (status) {
    case "pending_release":
      return "Pending release";
    case "released":
      return "Released";
    case "disputed":
      return "Disputed";
    case "upcoming":
      return "Upcoming";
    case "logged":
      return "Logged";
    case "cancelled":
      return "Cancelled";
  }
}

/**
 * Worker Carbon desk — Available · Active · Pipeline.
 * Available filters; release claim; log firm pick / size / talk / duplicate.
 * Doors: details, firms, talk, history, alerts, packet.
 */
export function WorkerCarbonApp() {
  const [nav, setNav] = useState<WorkerNav>("available");
  const [pool, setPool] = useState<WorkerVessel[]>(() =>
    SEED_WORKER_POOL.map((v) => ({ ...v })),
  );
  const [firms, setFirms] = useState<FirmRow[]>(() =>
    SEED_FIRMS.map((f) => ({ ...f })),
  );
  const [view, setView] = useState<WorkerView>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [door, setDoor] = useState<WorkerDoor>(null);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [filterDoorOpen, setFilterDoorOpen] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>("all");
  const [pipelineFilterOpen, setPipelineFilterOpen] = useState(false);

  const [logWho, setLogWho] = useState("");
  const [logRole, setLogRole] = useState("");
  const [logPain, setLogPain] = useState("");
  const [logCompany, setLogCompany] = useState("");
  const [logSize, setLogSize] = useState("");
  const [logTalk, setLogTalk] = useState("");
  const [loggedCompanies, setLoggedCompanies] = useState<string[]>([
    "Rivera Corp",
  ]);

  const [pipeline, setPipeline] = useState<WorkerPipelineRow[]>(() => [
    ...SEED_WORKER_PIPELINE,
  ]);
  const [historyByVessel] = useState<Record<string, { at: string; label: string }[]>>({
    wv3: [
      { at: "Jul 20", label: "Claimed" },
      { at: "Jul 20", label: "Began" },
      { at: "Jul 21", label: "Logged · Riley Chen" },
    ],
  });

  const availablePool = pool.filter((v) =>
    workerAvailableAdmits(v.worldState, v.unclaimed),
  );
  const available = filterWorkerQueue(availablePool, queueFilter, pinnedId);
  const active = pool.filter(
    (v) =>
      !v.unclaimed &&
      (v.worldState === "launched" || v.worldState === "running"),
  );
  const selected = pool.find((v) => v.id === activeId) ?? null;
  const filteredPipeline = useMemo(
    () => filterPipeline(pipeline, pipelineFilter),
    [pipeline, pipelineFilter],
  );

  const duplicateCompany = useMemo(() => {
    const n = logCompany.trim().toLowerCase();
    if (!n) return false;
    return loggedCompanies.some((c) => c.toLowerCase() === n);
  }, [logCompany, loggedCompanies]);

  const navItems = useMemo(
    () => [
      {
        id: "available",
        label: "Available",
        badge: availablePool.length || undefined,
      },
      {
        id: "active",
        label: "Active",
        badge: active.length || undefined,
      },
      {
        id: "pipeline",
        label: "Pipeline",
        badge: pipeline.length || undefined,
      },
    ],
    [availablePool.length, active.length, pipeline.length],
  );

  function claim(id: string) {
    setPool((prev) =>
      prev.map((v) => (v.id === id ? { ...v, unclaimed: false } : v)),
    );
    setActiveId(id);
    setView("claimed");
    setNav("active");
  }

  function releaseClaim() {
    if (!activeId) return;
    setPool((prev) =>
      prev.map((v) =>
        v.id === activeId
          ? { ...v, unclaimed: true, worldState: "launched" }
          : v,
      ),
    );
    setActiveId(null);
    setView("list");
    setNav("available");
  }

  function begin() {
    if (!activeId) return;
    setPool((prev) =>
      prev.map((v) =>
        v.id === activeId ? { ...v, worldState: "running" } : v,
      ),
    );
    setView("working");
  }

  function pickFirm(name: string) {
    setLogCompany(name);
    const f = firms.find(
      (x) => x.name.toLowerCase() === name.trim().toLowerCase(),
    );
    if (f) setLogSize(f.sizeBucket || f.employeeCount);
  }

  function submitLog() {
    if (!selected || !logWho.trim() || !logCompany.trim()) return;
    if (duplicateCompany) return;
    setPipeline((prev) => [
      {
        id: `p-${Date.now()}`,
        who: logWho.trim(),
        role: logRole.trim() || "—",
        company: logCompany.trim(),
        vessel: selected.name,
        when: "Just now",
        status: "pending_release",
      },
      ...prev,
    ]);
    setLoggedCompanies((prev) => [...prev, logCompany.trim()]);
    setPool((prev) =>
      prev.map((v) =>
        v.id === selected.id
          ? { ...v, bookedCount: v.bookedCount + 1 }
          : v,
      ),
    );
    if (
      !firms.some(
        (f) =>
          f.name.toLowerCase() === logCompany.trim().toLowerCase(),
      )
    ) {
      setFirms((prev) => [
        ...prev,
        {
          id: `f-${Date.now()}`,
          name: logCompany.trim(),
          website: "—",
          employeeCount: logSize || "",
          sizeBucket: logSize || "—",
          hq: "—",
          founded: "—",
          jobCount: 0,
          sources: ["linkedin"],
          roleTags: ["sales"],
          sector: "—",
          keep: true,
          tag: "none",
        },
      ]);
    }
    setLogWho("");
    setLogRole("");
    setLogPain("");
    setLogCompany("");
    setLogSize("");
    setLogTalk("");
    setView("working");
    setNav("pipeline");
  }

  const listSource =
    nav === "available" ? available : nav === "active" ? active : [];

  return (
    <CarbonDeskShell
      personaId="worker"
      productLabel="Worker"
      navItems={navItems}
      activeNav={nav}
      onNavChange={(id) => {
        setNav(id as WorkerNav);
        setView("list");
        setActiveId(null);
      }}
      pageTitle={
        nav === "available"
          ? "Available"
          : nav === "active"
            ? view === "log"
              ? "Log meeting"
              : view === "claimed"
                ? "Claimed"
                : view === "working"
                  ? "Active"
                  : "Active"
            : "Pipeline"
      }
      pageActions={
        nav === "active" && view !== "list" ? (
          <Button
            kind="ghost"
            onClick={() => {
              setView("list");
              setActiveId(null);
            }}
          >
            Back to active
          </Button>
        ) : nav === "available" ? (
          <Button
            kind="ghost"
            size="sm"
            onClick={() => setFilterDoorOpen(true)}
          >
            Filter · {QUEUE_FILTER_LABELS[queueFilter]}
          </Button>
        ) : nav === "pipeline" ? (
          <Button
            kind="ghost"
            size="sm"
            onClick={() => setPipelineFilterOpen(true)}
          >
            Status · {PIPELINE_FILTER_LABELS[pipelineFilter]}
          </Button>
        ) : null
      }
    >
      {nav !== "pipeline" && view === "list" ? (
        listSource.length === 0 ? (
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title={
              nav === "available" ? "Nothing to pick up" : "No active vessels"
            }
            subtitle={
              nav === "available"
                ? availablePool.length === 0
                  ? "Only launched campaigns that are unclaimed appear here."
                  : "No vessels match this filter. Clear filter to see the pool."
                : "Claim a vessel from Available to begin."
            }
          />
        ) : (
          <DataTable
            rows={listSource.map((v) => ({
              id: v.id,
              name: v.name,
              company: v.company,
              decision: v.unclaimed ? "Unclaimed" : "Claimed",
              progress: `${v.bookedCount} / ${v.target}`,
              price: `$${v.price}`,
            }))}
            headers={[
              { key: "name", header: "Campaign" },
              { key: "company", header: "Company" },
              { key: "decision", header: "Status" },
              { key: "progress", header: "Booked / N" },
              { key: "price", header: "Pay / meeting" },
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
                title={nav === "available" ? "Pick up queue" : "Your vessels"}
                description={
                  nav === "available"
                    ? "Decision chrome: unclaimed. Admission gates are not listed."
                    : "Begin, manage, log packets. Client is notified of progress."
                }
              >
                <TableToolbar>
                  <TableToolbarContent>
                    {nav === "available" ? (
                      <Button
                        kind="ghost"
                        size="sm"
                        onClick={() => setFilterDoorOpen(true)}
                      >
                        Filter
                      </Button>
                    ) : null}
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
                    {rows.map((row) => {
                      const vessel = listSource.find((v) => v.id === row.id);
                      const { key, ...rowProps } = getRowProps({ row });
                      return (
                        <TableRow key={key} {...rowProps}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.info.header === "decision" ? (
                                <StatusTag
                                  label={String(cell.value)}
                                  state={
                                    String(cell.value).toLowerCase() ===
                                    "unclaimed"
                                      ? "unclaimed"
                                      : "claimed"
                                  }
                                />
                              ) : (
                                cell.value
                              )}
                            </TableCell>
                          ))}
                          <TableCell>
                            {nav === "available" ? (
                              <Stack orientation="horizontal" gap={2}>
                                <Button size="sm" onClick={() => claim(row.id)}>
                                  Pick up
                                </Button>
                                <Button
                                  size="sm"
                                  kind="ghost"
                                  onClick={() => {
                                    setActiveId(row.id);
                                    setDoor("details");
                                  }}
                                >
                                  Details
                                </Button>
                                <Button
                                  size="sm"
                                  kind="ghost"
                                  onClick={() =>
                                    setPinnedId((p) =>
                                      p === row.id ? null : row.id,
                                    )
                                  }
                                >
                                  {pinnedId === row.id ? "Unpin" : "Pin"}
                                </Button>
                              </Stack>
                            ) : (
                              <Button
                                size="sm"
                                kind="tertiary"
                                onClick={() => {
                                  setActiveId(row.id);
                                  setView(
                                    vessel?.worldState === "running"
                                      ? "working"
                                      : "claimed",
                                  );
                                }}
                              >
                                Open
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        )
      ) : null}

      {/* —— Claimed —— */}
      {nav === "active" && view === "claimed" && selected ? (
        <Stack gap={6}>
          <FactList
            facts={[
              { label: "Campaign", value: selected.name },
              { label: "Company", value: selected.company },
              { label: "Operator", value: selected.operatorName },
              {
                label: "Locked rules",
                value: selected.rules.join(" · "),
              },
              {
                label: "Target",
                value: `${selected.bookedCount} / ${selected.target} · $${selected.price} / meeting`,
              },
              {
                label: "Custodian",
                value: `${CARBON_SEED.custodian} · pay on client release`,
              },
            ]}
          />
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title="Claim held"
            subtitle="Release returns vessel unclaimed to Available."
          />
          <Stack orientation="horizontal" gap={4}>
            <Button onClick={begin}>Begin</Button>
            <Button kind="ghost" onClick={releaseClaim}>
              Release to pool
            </Button>
            <Button kind="ghost" onClick={() => setDoor("details")}>
              Details
            </Button>
            <Button kind="ghost" onClick={() => setDoor("firms")}>
              Firms
            </Button>
            <Button kind="ghost" onClick={() => setDoor("talk")}>
              Talk
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {/* —— Working —— */}
      {nav === "active" && view === "working" && selected ? (
        <Stack gap={6}>
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title="Working"
            subtitle={`${selected.bookedCount} / ${selected.target} booked. Rules stay locked.`}
          />
          <Stack gap={2}>
            {selected.rules.map((rule) => (
              <Tile key={rule}>
                <p className="cds--type-body-01">{rule}</p>
              </Tile>
            ))}
          </Stack>
          <Stack orientation="horizontal" gap={3}>
            <Button onClick={() => setView("log")}>Log meeting</Button>
            <Button kind="ghost" onClick={() => setDoor("details")}>
              Details
            </Button>
            <Button kind="ghost" onClick={() => setDoor("firms")}>
              Firms
            </Button>
            <Button kind="ghost" onClick={() => setDoor("talk")}>
              Talk
            </Button>
            <Button kind="ghost" onClick={() => setDoor("history")}>
              History
            </Button>
            <Button kind="ghost" onClick={() => setDoor("alerts")}>
              Alerts
            </Button>
            <Button kind="ghost" onClick={releaseClaim}>
              Release to pool
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {/* —— Log —— */}
      {nav === "active" && view === "log" && selected ? (
        <Stack gap={6}>
          <p className="cds--type-body-01">
            Packet for pay/proof — who, firm, role, pain. Not a chat relationship.
          </p>
          <TextInput
            id="log-who"
            labelText="Who"
            value={logWho}
            onChange={(e) => setLogWho(e.target.value)}
          />
          <ComboBox
            id="log-company"
            titleText="Firm"
            placeholder="Type to match vessel firms"
            items={firms.map((f) => f.name)}
            selectedItem={logCompany || null}
            onChange={({ selectedItem }) => {
              if (selectedItem) pickFirm(String(selectedItem));
            }}
            onInputChange={(v) => {
              setLogCompany(v);
              const f = firms.find(
                (x) => x.name.toLowerCase() === v.trim().toLowerCase(),
              );
              if (f) setLogSize(f.sizeBucket || f.employeeCount);
            }}
          />
          {duplicateCompany ? (
            <InlineNotification
              kind="error"
              lowContrast
              hideCloseButton
              title="Duplicate firm"
              subtitle="This company already has a logged packet on your desk."
            />
          ) : null}
          <TextInput
            id="log-size"
            labelText="Company size"
            value={logSize}
            onChange={(e) => setLogSize(e.target.value)}
            placeholder="Filled when you pick a firm"
          />
          <TextInput
            id="log-role"
            labelText="Role"
            value={logRole}
            onChange={(e) => setLogRole(e.target.value)}
            placeholder={CARBON_SEED.seniority}
          />
          <TextArea
            id="log-pain"
            labelText="Pain"
            value={logPain}
            onChange={(e) => setLogPain(e.target.value)}
          />
          <TextInput
            id="log-talk"
            labelText="Talk track used (optional)"
            value={logTalk}
            onChange={(e) => setLogTalk(e.target.value)}
          />
          <Stack orientation="horizontal" gap={3}>
            <Button
              disabled={
                !logWho.trim() || !logCompany.trim() || duplicateCompany
              }
              onClick={submitLog}
            >
              Submit packet
            </Button>
            <Button kind="ghost" onClick={() => setDoor("packet")}>
              Preview packet
            </Button>
            <Button kind="ghost" onClick={() => setView("working")}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {/* —— Pipeline —— */}
      {nav === "pipeline" ? (
        <DataTable
          rows={filteredPipeline.map((p) => ({
            id: p.id,
            who: p.who,
            role: p.role,
            company: p.company,
            vessel: p.vessel,
            when: p.when,
            status: pipelineLabel(p.status),
          }))}
          headers={[
            { key: "who", header: "Who" },
            { key: "role", header: "Role" },
            { key: "company", header: "Firm" },
            { key: "vessel", header: "Campaign" },
            { key: "when", header: "When" },
            { key: "status", header: "Status" },
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
              title="Booked / N"
              description={`Status filter: ${PIPELINE_FILTER_LABELS[pipelineFilter]}.`}
            >
              <TableToolbar>
                <TableToolbarContent>
                  <Button
                    kind="ghost"
                    size="sm"
                    onClick={() => setPipelineFilterOpen(true)}
                  >
                    Status filter
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
                      <TableCell colSpan={6}>
                        No{" "}
                        {PIPELINE_FILTER_LABELS[pipelineFilter].toLowerCase()}{" "}
                        packets.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => {
                      const { key, ...rowProps } = getRowProps({ row });
                      const raw = filteredPipeline.find((p) => p.id === row.id);
                      return (
                        <TableRow key={key} {...rowProps}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>
                              {cell.info.header === "status" && raw ? (
                                <StatusTag
                                  label={String(cell.value)}
                                  state={
                                    raw.status === "pending_release"
                                      ? "pending"
                                      : raw.status
                                  }
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
      ) : null}

      {/* —— Doors —— */}
      <DoorModal
        open={filterDoorOpen}
        heading="Available filters"
        onClose={() => setFilterDoorOpen(false)}
      >
        <Stack gap={2}>
          {QUEUE_FILTERS.map((id) => (
            <Button
              key={id}
              kind={queueFilter === id ? "primary" : "ghost"}
              onClick={() => {
                setQueueFilter(id);
                setFilterDoorOpen(false);
              }}
            >
              {QUEUE_FILTER_LABELS[id]}
            </Button>
          ))}
        </Stack>
      </DoorModal>

      <DoorModal
        open={pipelineFilterOpen}
        heading="Pipeline status"
        onClose={() => setPipelineFilterOpen(false)}
      >
        <Stack gap={2}>
          {PIPELINE_FILTERS.map((id) => (
            <Button
              key={id}
              kind={pipelineFilter === id ? "primary" : "ghost"}
              onClick={() => {
                setPipelineFilter(id);
                setPipelineFilterOpen(false);
              }}
            >
              {PIPELINE_FILTER_LABELS[id]}
            </Button>
          ))}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "details" && !!selected}
        heading="Locked rules"
        label={selected?.name}
        onClose={() => setDoor(null)}
      >
        {selected ? (
          <Stack gap={4}>
            <FactList
              facts={[
                { label: "Per meeting", value: `$${selected.price}` },
                {
                  label: "Target",
                  value: `${selected.target} meetings`,
                },
                {
                  label: "Who counts",
                  value: `${CARBON_SEED.seniority}, ${CARBON_SEED.meetingLengthMin}+ min`,
                },
                { label: "Custodian", value: CARBON_SEED.custodian },
              ]}
            />
            <ul className="cds--type-body-01">
              {selected.rules.map((r) => (
                <li key={r}>✓ {r}</li>
              ))}
            </ul>
          </Stack>
        ) : null}
      </DoorModal>

      <DoorModal
        open={door === "firms"}
        heading="Target firms"
        label={selected?.name ?? "Read-only list"}
        onClose={() => setDoor(null)}
        size="lg"
      >
        <Stack gap={3}>
          {firms.map((f) => (
            <Tile key={f.id}>
              <div className="cds--type-productive-heading-01">{f.name}</div>
              <div className="cds--type-helper-text-01">
                    {f.sector} · {f.sizeBucket || f.employeeCount}
                {f.tag && f.tag !== "none" ? ` · ${f.tag}` : ""}
                {f.blockedBy ? ` · blocked by ${f.blockedBy}` : ""}
              </div>
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
        open={door === "history"}
        heading="Vessel history"
        label={selected?.name}
        onClose={() => setDoor(null)}
      >
        <Stack gap={3}>
          {(selected && historyByVessel[selected.id]
            ? historyByVessel[selected.id]
            : [{ at: "—", label: "No local history yet" }]
          ).map((e, i) => (
            <Tile key={`${e.at}-${i}`}>
              <span className="cds--type-helper-text-01">{e.at}</span>
              {" · "}
              <span className="cds--type-body-01">{e.label}</span>
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
          {pipeline.some((p) => p.status === "pending_release") ? (
            <InlineNotification
              kind="info"
              lowContrast
              hideCloseButton
              title="Pending client release"
              subtitle="Pay holds until the client accepts."
            />
          ) : null}
          {pipeline.some((p) => p.status === "disputed") ? (
            <InlineNotification
              kind="warning"
              lowContrast
              hideCloseButton
              title="Dispute open"
              subtitle="Release held until resolved."
            />
          ) : null}
          {pool.some((v) => v.worldState === "stopped") ? (
            <InlineNotification
              kind="error"
              lowContrast
              hideCloseButton
              title="Client stop"
              subtitle="Stop working. Release to pool."
            />
          ) : null}
          {!pipeline.some(
            (p) =>
              p.status === "pending_release" || p.status === "disputed",
          ) && !pool.some((v) => v.worldState === "stopped") ? (
            <p className="cds--type-body-01">No alerts.</p>
          ) : null}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "packet"}
        heading="Packet preview"
        onClose={() => setDoor(null)}
      >
        <pre className="cds--type-body-01" style={{ whiteSpace: "pre-wrap" }}>
          {[
            `Who: ${logWho || "—"}`,
            `Firm: ${logCompany || "—"} (${logSize || "—"})`,
            `Role: ${logRole || "—"}`,
            `Pain: ${logPain || "—"}`,
            logTalk ? `Talk: ${logTalk}` : "",
            `Worker: ${CARBON_SEED.workerName}`,
          ]
            .filter(Boolean)
            .join("\n")}
        </pre>
      </DoorModal>
    </CarbonDeskShell>
  );
}
