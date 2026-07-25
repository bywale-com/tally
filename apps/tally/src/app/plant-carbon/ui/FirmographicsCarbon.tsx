import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  DataTable,
  Dropdown,
  Link,
  Modal,
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
  Tag,
  TextInput,
} from "@carbon/react";
import { Launch } from "@carbon/icons-react";
import {
  EMPTY_FIRM_FILTERS,
  ROLE_TAG_LABELS,
  SOURCE_LABELS,
  filterFirms,
  type FirmRow,
  type FirmographicsFilters,
} from "../data/seed";

function firmWebsiteHref(website: string) {
  if (!website || website === "—") return "";
  return website.startsWith("http") ? website : `https://${website}`;
}

function exportFirmsCsv(firms: FirmRow[], campaignName: string) {
  const kept = firms.filter((f) => f.keep);
  const header = ["name", "website", "hq", "employees", "jobs", "sources"];
  const lines = [
    header.join(","),
    ...kept.map((f) =>
      [
        f.name,
        f.website,
        f.hq,
        f.sizeBucket || f.employeeCount,
        String(f.jobCount),
        f.sources.join("|"),
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${campaignName.replace(/\s+/g, "-").toLowerCase()}-firms.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type FirmographicsCarbonProps = {
  firms: FirmRow[];
  onChange: (next: FirmRow[]) => void;
  /** While enrich is running — filters/add disabled */
  running?: boolean;
  /** Campaign name for CSV export */
  campaignName?: string;
};

/**
 * Carbon firmographics — parity with loFi FirmographicsTable:
 * columns (company, website, employees, HQ, founded, jobs, sources, role tags),
 * filter door, keep/prune, Add firm.
 */
export function FirmographicsCarbon({
  firms,
  onChange,
  running,
  campaignName = "campaign",
}: FirmographicsCarbonProps) {
  const [filters, setFilters] = useState<FirmographicsFilters>(EMPTY_FIRM_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    website: "",
    hq: "",
    employees: "",
    founded: "",
    jobs: "0",
    sector: "",
  });

  const visible = useMemo(() => filterFirms(firms, filters), [firms, filters]);
  const activeFilterCount = Object.values(filters).filter((v) => v.trim()).length;

  const sourceOptions = useMemo(() => {
    const s = new Set<string>();
    for (const f of firms) for (const x of f.sources) s.add(SOURCE_LABELS[x] ?? x);
    return Array.from(s).sort();
  }, [firms]);

  const roleOptions = useMemo(() => {
    const s = new Set<string>();
    for (const f of firms) for (const x of f.roleTags) s.add(ROLE_TAG_LABELS[x] ?? x);
    return Array.from(s).sort();
  }, [firms]);

  const rows = visible.map((f) => ({
    id: f.id,
    name: f.name,
    website: f.website,
    employees: f.sizeBucket || f.employeeCount || "—",
    hq: f.hq,
    founded: f.founded || "—",
    jobs: String(f.jobCount),
    sources: f.sources.map((s) => SOURCE_LABELS[s] ?? s).join(" · ") || "—",
    roleTags: f.roleTags.map((t) => ROLE_TAG_LABELS[t] ?? t).join(" · ") || "—",
    keep: f.keep ? "Keep" : "Prune",
  }));

  const headers = [
    { key: "name", header: "Company" },
    { key: "website", header: "Website" },
    { key: "employees", header: "Employees" },
    { key: "hq", header: "HQ" },
    { key: "founded", header: "Founded" },
    { key: "jobs", header: "Jobs" },
    { key: "sources", header: "Sources" },
    { key: "roleTags", header: "Role tags" },
    { key: "keep", header: "List" },
  ];

  function toggleKeep(id: string, checked: boolean) {
    onChange(firms.map((f) => (f.id === id ? { ...f, keep: checked } : f)));
  }

  function addFirm() {
    if (!draft.name.trim()) return;
    const id = `f-add-${Date.now()}`;
    const next: FirmRow = {
      id,
      name: draft.name.trim(),
      website: draft.website.trim() || "—",
      employeeCount: draft.employees.trim(),
      sizeBucket: draft.employees.trim() || "—",
      hq: draft.hq.trim() || "—",
      founded: draft.founded.trim() || "—",
      jobCount: Number(draft.jobs) || 0,
      sources: ["linkedin"],
      roleTags: ["sales"],
      sector: draft.sector.trim() || "Manual",
      keep: true,
      tag: "none",
    };
    onChange([...firms, next]);
    setDraft({
      name: "",
      website: "",
      hq: "",
      employees: "",
      founded: "",
      jobs: "0",
      sector: "",
    });
    setAddOpen(false);
  }

  return (
    <>
      <DataTable rows={rows} headers={headers}>
        {({
          rows: tableRows,
          headers: tableHeaders,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
        }) => (
          <TableContainer
            {...getTableContainerProps()}
            title="Firmographics"
            description={
              activeFilterCount
                ? `${visible.length} of ${firms.length} firms`
                : `${firms.filter((f) => f.keep).length} kept · ${firms.length} total`
            }
          >
            <TableToolbar>
              <TableToolbarContent>
                {running ? (
                  <Tag type="blue" size="sm">
                    Running
                  </Tag>
                ) : null}
                {activeFilterCount > 0 ? (
                  <Tag type="gray" size="sm">
                    {activeFilterCount} filters
                  </Tag>
                ) : null}
                <Button
                  kind="ghost"
                  size="sm"
                  disabled={running || firms.filter((f) => f.keep).length === 0}
                  onClick={() => exportFirmsCsv(firms, campaignName)}
                >
                  Export CSV
                </Button>
                <Button
                  kind="ghost"
                  size="sm"
                  disabled={running}
                  onClick={() => setFilterOpen(true)}
                >
                  Filter
                </Button>
                <Button
                  kind="ghost"
                  size="sm"
                  disabled={running}
                  onClick={() => setAddOpen(true)}
                >
                  Add firm
                </Button>
                {activeFilterCount > 0 ? (
                  <Button
                    kind="danger--ghost"
                    size="sm"
                    disabled={running}
                    onClick={() => setFilters(EMPTY_FIRM_FILTERS)}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()} size="sm">
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header) => {
                    const { key, ...rest } = getHeaderProps({ header });
                    return (
                      <TableHeader key={key} {...rest}>
                        {header.header}
                      </TableHeader>
                    );
                  })}
                  <TableHeader>Keep</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row) => {
                  const firm = firms.find((f) => f.id === row.id);
                  const { key, ...rowProps } = getRowProps({ row });
                  return (
                    <TableRow
                      key={key}
                      {...rowProps}
                      style={
                        firm && !firm.keep
                          ? { opacity: 0.55 }
                          : undefined
                      }
                    >
                      {row.cells.map((cell) => {
                        if (cell.info.header === "website" && firm) {
                          const href = firmWebsiteHref(firm.website);
                          return (
                            <TableCell key={cell.id}>
                              {href ? (
                                <Link
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  renderIcon={Launch}
                                >
                                  {firm.website}
                                </Link>
                              ) : (
                                firm.website
                              )}
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        );
                      })}
                      <TableCell>
                        <Checkbox
                          id={`keep-${row.id}`}
                          labelText=""
                          hideLabel
                          disabled={running}
                          checked={firm?.keep ?? false}
                          onChange={(_, { checked }) =>
                            toggleKeep(row.id, checked)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      <Modal
        open={filterOpen}
        modalHeading="Filter firms"
        primaryButtonText="Apply"
        secondaryButtonText="Cancel"
        onRequestClose={() => setFilterOpen(false)}
        onRequestSubmit={() => setFilterOpen(false)}
        size="md"
      >
        <Stack gap={5}>
          <TextInput
            id="ff-company"
            labelText="Company"
            value={filters.company}
            onChange={(e) =>
              setFilters((f) => ({ ...f, company: e.target.value }))
            }
          />
          <TextInput
            id="ff-website"
            labelText="Website"
            value={filters.website}
            onChange={(e) =>
              setFilters((f) => ({ ...f, website: e.target.value }))
            }
          />
          <TextInput
            id="ff-employees"
            labelText="Employees"
            placeholder="count or bucket"
            value={filters.employees}
            onChange={(e) =>
              setFilters((f) => ({ ...f, employees: e.target.value }))
            }
          />
          <TextInput
            id="ff-hq"
            labelText="HQ"
            value={filters.hq}
            onChange={(e) => setFilters((f) => ({ ...f, hq: e.target.value }))}
          />
          <TextInput
            id="ff-founded"
            labelText="Founded"
            value={filters.founded}
            onChange={(e) =>
              setFilters((f) => ({ ...f, founded: e.target.value }))
            }
          />
          <TextInput
            id="ff-jobs"
            labelText="Jobs"
            value={filters.jobs}
            onChange={(e) => setFilters((f) => ({ ...f, jobs: e.target.value }))}
          />
          <Dropdown
            id="ff-sources"
            titleText="Sources"
            label="All"
            items={["", ...sourceOptions]}
            itemToString={(item) => (item === "" ? "All" : String(item ?? ""))}
            selectedItem={filters.sources || ""}
            onChange={({ selectedItem }) =>
              setFilters((f) => ({
                ...f,
                sources: String(selectedItem ?? ""),
              }))
            }
          />
          <Dropdown
            id="ff-roles"
            titleText="Role tags"
            label="All"
            items={["", ...roleOptions]}
            itemToString={(item) => (item === "" ? "All" : String(item ?? ""))}
            selectedItem={filters.roleTags || ""}
            onChange={({ selectedItem }) =>
              setFilters((f) => ({
                ...f,
                roleTags: String(selectedItem ?? ""),
              }))
            }
          />
        </Stack>
      </Modal>

      <Modal
        open={addOpen}
        modalHeading="Add firm"
        primaryButtonText="Add to list"
        secondaryButtonText="Cancel"
        primaryButtonDisabled={!draft.name.trim()}
        onRequestClose={() => setAddOpen(false)}
        onRequestSubmit={addFirm}
        size="sm"
      >
        <Stack gap={5}>
          <TextInput
            id="add-name"
            labelText="Company"
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <TextInput
            id="add-website"
            labelText="Website"
            value={draft.website}
            onChange={(e) =>
              setDraft((d) => ({ ...d, website: e.target.value }))
            }
          />
          <TextInput
            id="add-hq"
            labelText="HQ"
            value={draft.hq}
            onChange={(e) => setDraft((d) => ({ ...d, hq: e.target.value }))}
          />
          <TextInput
            id="add-emp"
            labelText="Employees / size bucket"
            value={draft.employees}
            onChange={(e) =>
              setDraft((d) => ({ ...d, employees: e.target.value }))
            }
          />
          <TextInput
            id="add-founded"
            labelText="Founded"
            value={draft.founded}
            onChange={(e) =>
              setDraft((d) => ({ ...d, founded: e.target.value }))
            }
          />
          <TextInput
            id="add-jobs"
            labelText="Jobs"
            value={draft.jobs}
            onChange={(e) => setDraft((d) => ({ ...d, jobs: e.target.value }))}
          />
          <TextInput
            id="add-sector"
            labelText="Sector"
            value={draft.sector}
            onChange={(e) =>
              setDraft((d) => ({ ...d, sector: e.target.value }))
            }
          />
        </Stack>
      </Modal>
    </>
  );
}
