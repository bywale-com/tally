/** Pre-screened companies — disco emulation seed (known analysis). */
export type PrototypeCompany = {
  id: string;
  name: string;
  /** Cheap logo stand-in: initials + gray/ink chip */
  initials: string;
  domain: string;
};

export const KNOWN_COMPANIES: PrototypeCompany[] = [
  { id: "c1", name: "Acme Robotics", initials: "AR", domain: "acmerobotics.com" },
  { id: "c2", name: "Northwind Health", initials: "NH", domain: "northwind.health" },
  { id: "c3", name: "Brightline Freight", initials: "BF", domain: "brightlinefreight.com" },
  { id: "c4", name: "Cascade Analytics", initials: "CA", domain: "cascadeanalytics.io" },
  { id: "c5", name: "Helix Biotech", initials: "HB", domain: "helixbio.com" },
];

/** Empty until the operator types — no pre-filled survivor list. */
export function filterCompanies(query: string): PrototypeCompany[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return KNOWN_COMPANIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q),
  );
}
