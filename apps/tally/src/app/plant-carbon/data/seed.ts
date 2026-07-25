/** Shared economics + copy facts for all Carbon persona desks (Register congruent). */
export const CARBON_SEED = {
  campaignName: "Northwind outreach",
  companyName: "Northwind Labs",
  operatorName: "Maya Chen",
  operatorInitials: "MC",
  workerName: "Sam Ortiz",
  clientName: "Alex Chen",
  guestEmail: "jordan@prospect.co",
  meetingsTarget: 4,
  pricePerMeeting: 500,
  escrowTotal: 2000,
  seniority: "Director+",
  meetingLengthMin: 30,
  holdDays: 14,
  acvBand: "$40–80k ACV",
  custodian: "Escrow stand-in",
} as const;

export type OpCampaignState =
  | "draft"
  | "evaluate"
  | "enrich"
  | "ready"
  | "invited"
  | "funded"
  | "launched"
  | "running"
  | "paused"
  | "stopped";

export type OpCampaignEvent = { id: string; at: string; label: string };

export type OpCampaign = {
  id: string;
  name: string;
  companyName: string;
  /** Domain for dossier website link */
  companyDomain?: string;
  state: OpCampaignState;
  lastTouched: string;
  createdAt: string;
  firmCount?: number;
  targetMeetings: number;
  bookedMeetings?: number;
  pricePerMeeting: number;
  holdDays?: number;
  clientName?: string;
  clientEmail?: string;
  history: OpCampaignEvent[];
  notes?: string;
};

/** Operator enrich firmographics — parity with loFi `prototypeFirms` + keep/prune. */
export type FirmRow = {
  id: string;
  name: string;
  website: string;
  employeeCount: string;
  sizeBucket: string;
  hq: string;
  founded: string;
  jobCount: number;
  sources: string[];
  roleTags: string[];
  /** Short label for Guest/BC/Worker doors */
  sector: string;
  /** Keep on TAM list (Operator prune). Inverse of loFi `removed`. */
  keep: boolean;
  tag?: "competitor" | "customer" | "dream" | "none";
  blockedBy?: "you" | "operator" | null;
};

/** @deprecated use sizeBucket — kept as display helper for doors */
export function firmEmployees(f: FirmRow): string {
  return f.sizeBucket || f.employeeCount || "—";
}

export type FirmographicsFilters = {
  company: string;
  website: string;
  employees: string;
  hq: string;
  founded: string;
  jobs: string;
  sources: string;
  roleTags: string;
};

export const EMPTY_FIRM_FILTERS: FirmographicsFilters = {
  company: "",
  website: "",
  employees: "",
  hq: "",
  founded: "",
  jobs: "",
  sources: "",
  roleTags: "",
};

export const SOURCE_LABELS: Record<string, string> = {
  wellfound: "Wellfound",
  builtin: "Built In",
  startup_jobs: "startup.jobs",
  a16z: "a16z",
  sequoia: "Sequoia",
  linkedin: "LinkedIn",
};

export const ROLE_TAG_LABELS: Record<string, string> = {
  founding_sales: "Founding sales",
  founding: "Founding",
  sales: "Sales",
};

export function filterFirms(
  firms: FirmRow[],
  filters: FirmographicsFilters,
): FirmRow[] {
  const q = (s: string) => s.trim().toLowerCase();
  return firms.filter((f) => {
    if (q(filters.company) && !f.name.toLowerCase().includes(q(filters.company)))
      return false;
    if (
      q(filters.website) &&
      !f.website.toLowerCase().includes(q(filters.website))
    )
      return false;
    const emp = `${f.employeeCount} ${f.sizeBucket}`.toLowerCase();
    if (q(filters.employees) && !emp.includes(q(filters.employees))) return false;
    if (q(filters.hq) && !f.hq.toLowerCase().includes(q(filters.hq))) return false;
    if (q(filters.founded) && !f.founded.toLowerCase().includes(q(filters.founded)))
      return false;
    if (q(filters.jobs) && !String(f.jobCount).includes(q(filters.jobs)))
      return false;
    const src = f.sources
      .map((s) => SOURCE_LABELS[s] ?? s)
      .join(" ")
      .toLowerCase();
    if (q(filters.sources) && !src.includes(q(filters.sources))) return false;
    const tags = f.roleTags
      .map((t) => ROLE_TAG_LABELS[t] ?? t)
      .join(" ")
      .toLowerCase();
    if (q(filters.roleTags) && !tags.includes(q(filters.roleTags))) return false;
    return true;
  });
}

export type CreateTemplate = { id: string; label: string; name: string };

export type KnownCompany = {
  id: string;
  name: string;
  sector: string;
  /** Domain without protocol — dossier website link */
  domain: string;
};

export type SentInvite = {
  id: string;
  campaignName: string;
  kind: "guest" | "existing";
  to: string;
  at: string;
  status: "sent" | "funded";
};

export type EnrichRun = {
  at: string;
  duration: string;
  sourceMix: string;
  firmTotal: number;
};

export type VesselState =
  | "invited"
  | "funded"
  | "launched"
  | "running"
  | "paused"
  | "stopped"
  | "reclaimed";

export type ClientVessel = {
  id: string;
  name: string;
  state: VesselState;
  target: number;
  price: number;
  bookedCount: number;
  held: number;
  released: number;
  reclaimDaysLeft: number;
  holdDays: number;
  nextMeetingPeek?: string;
  operatorName: string;
  pauseWhy?: string;
  history: OpCampaignEvent[];
};

export type MeetingRow = {
  id: string;
  vesselId: string;
  vesselName: string;
  who: string;
  role: string;
  company: string;
  size: string;
  when: string;
  status: "upcoming" | "pending" | "accepted" | "disputed" | "released";
  pain: string;
  lengthMin?: number;
  attended?: boolean;
};

export type MeetingFilter =
  | "all"
  | "upcoming"
  | "pending"
  | "disputed"
  | "released"
  | "needs-you";

export type WorkerVessel = {
  id: string;
  name: string;
  company: string;
  worldState: "launched" | "running" | "stopped";
  unclaimed: boolean;
  target: number;
  price: number;
  bookedCount: number;
  operatorName: string;
  rules: string[];
  sector?: string;
  pinned?: boolean;
};

export type WorkerPipelineStatus =
  | "pending_release"
  | "released"
  | "disputed"
  | "upcoming"
  | "logged"
  | "cancelled";

export type WorkerPipelineRow = {
  id: string;
  who: string;
  role: string;
  company: string;
  vessel: string;
  when: string;
  status: WorkerPipelineStatus;
};

export type PipelineFilter = "all" | "pending" | "upcoming" | "released" | "disputed";

export type QueueFilter = "all" | "high-pay" | "pinned";

export const WHAT_COUNTS = [
  `${CARBON_SEED.seniority} or above`,
  `At least ${CARBON_SEED.meetingLengthMin} minutes`,
  "Pain matches locked ICP",
  "Prospect attended",
  "Not a duplicate contact",
] as const;

export const CREATE_TEMPLATES: CreateTemplate[] = [
  { id: "founding", label: "Founding sales", name: "Founding sales — Q3" },
  { id: "expansion", label: "Expansion", name: "Expansion — existing ICP" },
  { id: "winback", label: "Win-back", name: "Win-back — churned accounts" },
];

export const KNOWN_COMPANIES: KnownCompany[] = [
  { id: "c1", name: "Acme Robotics", sector: "SaaS", domain: "acmerobotics.com" },
  { id: "c2", name: "Northwind Health", sector: "Health", domain: "northwind.health" },
  { id: "c3", name: "Brightline Freight", sector: "Logistics", domain: "brightlinefreight.com" },
  { id: "c4", name: "Cascade Analytics", sector: "Analytics", domain: "cascadeanalytics.io" },
  { id: "c5", name: "Helix Biotech", sector: "Bio", domain: "helixbio.com" },
  { id: "c6", name: "Cedar Systems", sector: "Infra", domain: "cedarsystems.io" },
];

export const EVALUATE_SOURCE_TAGS = [
  "LinkedIn",
  "Company site",
  "Job posts",
  "Crunchbase",
] as const;

export const BUSINESS_CLIENTS = [
  { id: "bc1", name: "Acme Corp", email: "you@acme.com" },
  { id: "bc2", name: "Northwind Buyer", email: "buyer@northwind.labs" },
  { id: "bc3", name: "Cedar Holdings", email: "ops@cedar.sys" },
];

export const SEED_OP_CAMPAIGNS: OpCampaign[] = [
  {
    id: "op-running",
    name: "Northwind outbound",
    companyName: "Northwind Traders",
    state: "running",
    lastTouched: "1h ago",
    createdAt: "Jul 10",
    firmCount: 42,
    targetMeetings: 8,
    bookedMeetings: 2,
    pricePerMeeting: 500,
    holdDays: 14,
    clientName: "Acme Corp",
    clientEmail: "you@acme.com",
    history: [
      { id: "h1", at: "Jul 10", label: "Created" },
      { id: "h2", at: "Jul 11", label: "Evaluated" },
      { id: "h3", at: "Jul 12", label: "Enriched · 42 firms" },
      { id: "h4", at: "Jul 14", label: "Invited Acme Corp" },
      { id: "h5", at: "Jul 14", label: "Funded + launched" },
    ],
  },
  {
    id: "op-invited",
    name: "Brightline pilot",
    companyName: "Brightline Co",
    state: "invited",
    lastTouched: "Yesterday",
    createdAt: "Jul 18",
    firmCount: 36,
    targetMeetings: 6,
    pricePerMeeting: 550,
    holdDays: 14,
    clientName: "Guest",
    clientEmail: CARBON_SEED.guestEmail,
    history: [
      { id: "h1", at: "Jul 18", label: "Created" },
      { id: "h2", at: "Jul 19", label: "Evaluated" },
      { id: "h3", at: "Jul 20", label: "Enriched · 36 firms" },
      { id: "h4", at: "Jul 22", label: "Invite sent" },
    ],
  },
  {
    id: "op-enrich",
    name: "Cedar expansion",
    companyName: CARBON_SEED.companyName,
    state: "enrich",
    lastTouched: "3d ago",
    createdAt: "Jul 20",
    firmCount: 48,
    targetMeetings: CARBON_SEED.meetingsTarget,
    pricePerMeeting: CARBON_SEED.pricePerMeeting,
    holdDays: CARBON_SEED.holdDays,
    history: [
      { id: "h1", at: "Jul 20", label: "Created" },
      { id: "h2", at: "Jul 21", label: "Evaluated" },
      { id: "h3", at: "Jul 23", label: "Enriched · 48 firms" },
    ],
  },
  {
    id: "op-evaluate",
    name: "Delta field test",
    companyName: "Delta Field Services",
    state: "evaluate",
    lastTouched: "5d ago",
    createdAt: "Jul 15",
    targetMeetings: 5,
    pricePerMeeting: 450,
    history: [
      { id: "h1", at: "Jul 15", label: "Created" },
      { id: "h2", at: "Jul 16", label: "Company picked" },
    ],
  },
  {
    id: "op-draft",
    name: "Harbor sketch",
    companyName: "—",
    state: "draft",
    lastTouched: "1w ago",
    createdAt: "Jul 8",
    targetMeetings: CARBON_SEED.meetingsTarget,
    pricePerMeeting: CARBON_SEED.pricePerMeeting,
    history: [{ id: "h1", at: "Jul 8", label: "Created" }],
  },
];

export const SEED_SENT_INVITES: SentInvite[] = [
  {
    id: "si1",
    campaignName: "Brightline pilot",
    kind: "guest",
    to: CARBON_SEED.guestEmail,
    at: "Jul 22",
    status: "sent",
  },
  {
    id: "si2",
    campaignName: "Northwind outbound",
    kind: "existing",
    to: "you@acme.com",
    at: "Jul 14",
    status: "funded",
  },
];

export const SEED_ENRICH_RUN: EnrichRun = {
  at: "Jul 23 · 14:02",
  duration: "48s",
  sourceMix: "Firmographics · Intent · Clearbit stand-in",
  firmTotal: 48,
};

export const SEED_FIRMS: FirmRow[] = [
  {
    id: "f1",
    name: "Apex Industrial Supply",
    website: "apexindustrial.com",
    employeeCount: "120",
    sizeBucket: "51–200",
    hq: "Chicago, IL · US",
    founded: "2014",
    jobCount: 3,
    sources: ["wellfound", "linkedin"],
    roleTags: ["founding_sales"],
    sector: "MRO / Industrial",
    keep: true,
    tag: "dream",
  },
  {
    id: "f2",
    name: "Beacon Logistics",
    website: "beaconlogistics.io",
    employeeCount: "340",
    sizeBucket: "201–500",
    hq: "Dallas, TX · US",
    founded: "2018",
    jobCount: 5,
    sources: ["builtin", "linkedin"],
    roleTags: ["sales", "founding"],
    sector: "Logistics",
    keep: true,
    tag: "none",
  },
  {
    id: "f3",
    name: "Cedar Components",
    website: "cedarcomponents.com",
    employeeCount: "48",
    sizeBucket: "11–50",
    hq: "Portland, OR · US",
    founded: "2021",
    jobCount: 2,
    sources: ["wellfound"],
    roleTags: ["founding_sales"],
    sector: "Components",
    keep: true,
    tag: "none",
  },
  {
    id: "f4",
    name: "Delta Field Services",
    website: "deltafield.co",
    employeeCount: "95",
    sizeBucket: "51–200",
    hq: "Atlanta, GA · US",
    founded: "2016",
    jobCount: 4,
    sources: ["linkedin", "startup_jobs"],
    roleTags: ["founding_sales", "sales"],
    sector: "Field service",
    keep: false,
    tag: "none",
  },
  {
    id: "f5",
    name: "Echo Manufacturing",
    website: "echomfg.com",
    employeeCount: "620",
    sizeBucket: "501–1,000",
    hq: "Detroit, MI · US",
    founded: "2009",
    jobCount: 7,
    sources: ["a16z", "linkedin"],
    roleTags: ["sales"],
    sector: "Manufacturing",
    keep: true,
    tag: "none",
  },
  {
    id: "f6",
    name: "Forge Analytics",
    website: "forgeanalytics.ai",
    employeeCount: "",
    sizeBucket: "Can't be identified",
    hq: "Austin, TX · US",
    founded: "2023",
    jobCount: 1,
    sources: ["wellfound"],
    roleTags: ["founding_sales"],
    sector: "Analytics",
    keep: true,
    tag: "customer",
  },
  {
    id: "f7",
    name: "Harbor Robotics",
    website: "harborrobotics.com",
    employeeCount: "75",
    sizeBucket: "51–200",
    hq: "Boston, MA · US",
    founded: "2020",
    jobCount: 2,
    sources: ["sequoia", "linkedin"],
    roleTags: ["founding"],
    sector: "Robotics",
    keep: true,
    tag: "none",
  },
  {
    id: "f8",
    name: "Acme Rival Inc",
    website: "acmerival.example",
    employeeCount: "210",
    sizeBucket: "201–500",
    hq: "San Jose, CA · US",
    founded: "2012",
    jobCount: 4,
    sources: ["linkedin"],
    roleTags: ["sales"],
    sector: "SaaS",
    keep: false,
    tag: "competitor",
    blockedBy: "you",
  },
];

export const DOSSIER_SECTIONS = [
  { label: "Company", fact: CARBON_SEED.companyName },
  { label: "ACV band", fact: CARBON_SEED.acvBand },
  { label: "ICP", fact: `${CARBON_SEED.seniority} · ops / eng buyers` },
  { label: "Price / meeting", fact: `$${CARBON_SEED.pricePerMeeting}` },
  { label: "Target", fact: `${CARBON_SEED.meetingsTarget} meetings` },
  { label: "Hold", fact: `${CARBON_SEED.holdDays} days` },
  { label: "Verdict", fact: "Qualified for enrich. Price stands behind size." },
  { label: "Sources", fact: "Live call notes · firmographics · prior vessels" },
];

export const SEED_CLIENT_VESSELS: ClientVessel[] = [
  {
    id: "v1",
    name: CARBON_SEED.campaignName,
    state: "running",
    target: CARBON_SEED.meetingsTarget,
    price: CARBON_SEED.pricePerMeeting,
    bookedCount: 2,
    held: 1500,
    released: 500,
    reclaimDaysLeft: 9,
    holdDays: CARBON_SEED.holdDays,
    nextMeetingPeek: "Thu 2:00pm · Jordan Blake",
    operatorName: CARBON_SEED.operatorName,
    history: [
      { id: "h1", at: "Jul 14", label: "Funded" },
      { id: "h2", at: "Jul 14", label: "Launched" },
      { id: "h3", at: "Jul 20", label: "Meeting released · $500" },
    ],
  },
  {
    id: "v2",
    name: "Northwind expansion",
    state: "invited",
    target: 6,
    price: 550,
    bookedCount: 0,
    held: 0,
    released: 0,
    reclaimDaysLeft: 14,
    holdDays: 14,
    operatorName: CARBON_SEED.operatorName,
    history: [{ id: "h1", at: "Jul 22", label: "Invite received" }],
  },
  {
    id: "v3",
    name: "Cedar pilot",
    state: "funded",
    target: 4,
    price: 500,
    bookedCount: 0,
    held: 2000,
    released: 0,
    reclaimDaysLeft: 14,
    holdDays: 14,
    operatorName: CARBON_SEED.operatorName,
    history: [
      { id: "h1", at: "Jul 21", label: "Funded" },
      { id: "h2", at: "Jul 21", label: "Awaiting Operator launch" },
    ],
  },
];

export const SEED_MEETINGS: MeetingRow[] = [
  {
    id: "m1",
    vesselId: "v1",
    vesselName: CARBON_SEED.campaignName,
    who: "Jordan Blake",
    role: "Director of IT",
    company: "Brightline Co",
    size: "50–200",
    when: "Thu 2:00pm",
    status: "upcoming",
    pain: "Q3 pipeline budget owner",
    lengthMin: 30,
    attended: false,
  },
  {
    id: "m2",
    vesselId: "v1",
    vesselName: CARBON_SEED.campaignName,
    who: "Sam Ortiz",
    role: "VP Eng",
    company: "Harbor Labs",
    size: "20–50",
    when: "Mon 11:00am",
    status: "pending",
    pain: "Hiring freeze broke inbound",
    lengthMin: 32,
    attended: true,
  },
  {
    id: "m3",
    vesselId: "v1",
    vesselName: CARBON_SEED.campaignName,
    who: "Riley Chen",
    role: "Director Ops",
    company: "Rivera Corp",
    size: "200–500",
    when: "Last Tue",
    status: "released",
    pain: "Vendor consolidation",
    lengthMin: 35,
    attended: true,
  },
  {
    id: "m4",
    vesselId: "v1",
    vesselName: CARBON_SEED.campaignName,
    who: "Casey Wu",
    role: "Manager",
    company: "Delta Field",
    size: "100–200",
    when: "Last Mon",
    status: "disputed",
    pain: "Wrong seniority packet",
    lengthMin: 18,
    attended: true,
  },
];

export const MEETING_FILTER_LABELS: Record<MeetingFilter, string> = {
  all: "All",
  upcoming: "Upcoming",
  pending: "Pending",
  disputed: "Disputed",
  released: "Released",
  "needs-you": "Needs you",
};

export const DISPUTE_REASONS = [
  { id: "wrong-seniority", label: "Wrong seniority" },
  { id: "no-show", label: "No-show" },
  { id: "fake-profile", label: "Fake profile" },
  { id: "short", label: "Under locked length" },
  { id: "wrong-pain", label: "Wrong problem" },
  { id: "brand", label: "Brand only (no money hold)" },
] as const;

export const SEED_TALK = [
  { id: "t1", line: "Open with the locked ICP pain, not a product pitch." },
  { id: "t2", line: "Confirm seniority and calendar length before deep dive." },
  { id: "t3", line: "If competitor appears, note brand flag — do not argue." },
];

export const SEED_FAQ = [
  {
    q: "Who holds the money?",
    a: `${CARBON_SEED.custodian}. Release per qualified meeting. Unspent reclaimable after ${CARBON_SEED.holdDays} days.`,
  },
  {
    q: "What counts as a meeting?",
    a: WHAT_COUNTS.join(" · "),
  },
  {
    q: "Can I talk to the Worker?",
    a: "No Worker chat. Operator owns prep; Worker runs outreach after launch.",
  },
];

export const TERMS_BODY = [
  `$${CARBON_SEED.escrowTotal} sits with an escrow-style custodian. Every qualified ${CARBON_SEED.seniority} meeting (${CARBON_SEED.meetingLengthMin}+ min, attendance required) releases $${CARBON_SEED.pricePerMeeting}. Unspent returns after ${CARBON_SEED.holdDays} days.`,
  `Agreed on call: ${CARBON_SEED.seniority} only, ${CARBON_SEED.meetingLengthMin}+ min, no no-shows.`,
  `We sell booked qualified meetings only. Not impressions or activity metrics.`,
  `A Worker runs outreach after launch. You do not. There is no Worker chat.`,
].join("\n\n");

export const SEED_WORKER_POOL: WorkerVessel[] = [
  {
    id: "wv1",
    name: CARBON_SEED.campaignName,
    company: CARBON_SEED.companyName,
    worldState: "launched",
    unclaimed: true,
    target: CARBON_SEED.meetingsTarget,
    price: CARBON_SEED.pricePerMeeting,
    bookedCount: 0,
    operatorName: CARBON_SEED.operatorName,
    rules: [...WHAT_COUNTS],
    sector: "SaaS",
  },
  {
    id: "wv2",
    name: "Northwind expansion",
    company: CARBON_SEED.companyName,
    worldState: "launched",
    unclaimed: true,
    target: 6,
    price: 550,
    bookedCount: 0,
    operatorName: CARBON_SEED.operatorName,
    rules: [...WHAT_COUNTS],
    sector: "SaaS",
  },
  {
    id: "wv3",
    name: "Harbor pipeline sprint",
    company: "Harbor Labs",
    worldState: "running",
    unclaimed: false,
    target: 5,
    price: 475,
    bookedCount: 1,
    operatorName: CARBON_SEED.operatorName,
    rules: [...WHAT_COUNTS],
    sector: "SaaS",
  },
];

export const SEED_WORKER_PIPELINE: WorkerPipelineRow[] = [
  {
    id: "p1",
    who: "Riley Chen",
    role: "Director Ops",
    company: "Rivera Corp",
    vessel: "Harbor pipeline sprint",
    when: "Last Tue",
    status: "released",
  },
  {
    id: "p2",
    who: "Jordan Blake",
    role: "Director of IT",
    company: "Brightline Co",
    vessel: "Harbor pipeline sprint",
    when: "Thu 2:00pm",
    status: "upcoming",
  },
  {
    id: "p3",
    who: "Sam Ortiz",
    role: "VP Eng",
    company: "Harbor Labs",
    vessel: "Harbor pipeline sprint",
    when: "Mon 11:00am",
    status: "pending_release",
  },
];

export const GUEST_INVITE = {
  id: "g-invite",
  name: CARBON_SEED.campaignName,
  companyName: CARBON_SEED.companyName,
  price: CARBON_SEED.pricePerMeeting,
  target: CARBON_SEED.meetingsTarget,
  holdTotal: CARBON_SEED.escrowTotal,
  operatorName: CARBON_SEED.operatorName,
  rules: [...WHAT_COUNTS],
  pricingWhy: `${CARBON_SEED.companyName} fits ${CARBON_SEED.acvBand}. $${CARBON_SEED.pricePerMeeting} per meeting for ${CARBON_SEED.meetingsTarget} qualified ${CARBON_SEED.seniority} conversations.`,
  expiresAt: "Jul 31",
  inviteRef: "inv_8k2m41",
  samplePacket:
    "Example: Sam Ortiz, VP Eng, Brightline — 32 min attended, pain matched ICP.",
  history: [
    { id: "h1", at: "Jul 12", label: "Operator prepared vessel" },
    { id: "h2", at: "Jul 18", label: "Invited" },
    { id: "h3", at: "Jul 20", label: "Terms frozen until expiry" },
  ] as OpCampaignEvent[],
};

export const QUEUE_FILTER_LABELS: Record<QueueFilter, string> = {
  all: "All",
  "high-pay": "High pay",
  pinned: "Pinned",
};

export const PIPELINE_FILTER_LABELS: Record<PipelineFilter, string> = {
  all: "All",
  pending: "Pending release",
  upcoming: "Upcoming",
  released: "Released",
  disputed: "Disputed",
};

export function filterMeetings(
  meetings: MeetingRow[],
  filter: MeetingFilter,
): MeetingRow[] {
  if (filter === "all") return meetings;
  if (filter === "upcoming") return meetings.filter((m) => m.status === "upcoming");
  if (filter === "pending") return meetings.filter((m) => m.status === "pending");
  if (filter === "disputed") return meetings.filter((m) => m.status === "disputed");
  if (filter === "released") return meetings.filter((m) => m.status === "released");
  if (filter === "needs-you")
    return meetings.filter((m) => m.status === "pending" || m.status === "disputed");
  return meetings;
}

export function filterWorkerQueue(
  pool: WorkerVessel[],
  filter: QueueFilter,
  pinnedId: string | null,
): WorkerVessel[] {
  let rows = pool;
  if (filter === "high-pay") rows = rows.filter((v) => v.price >= 500);
  if (filter === "pinned") rows = rows.filter((v) => v.id === pinnedId || v.pinned);
  return rows;
}

export function filterPipeline(
  rows: WorkerPipelineRow[],
  filter: PipelineFilter,
): WorkerPipelineRow[] {
  if (filter === "all") return rows;
  if (filter === "pending")
    return rows.filter((r) => r.status === "pending_release");
  if (filter === "upcoming") return rows.filter((r) => r.status === "upcoming");
  if (filter === "released") return rows.filter((r) => r.status === "released");
  if (filter === "disputed") return rows.filter((r) => r.status === "disputed");
  return rows;
}
