/** Firmographics for Enrich — mirrors washed inventory + LinkedIn company enrich. */

export type FirmRow = {
  id: string;
  name: string;
  website: string;
  /** LinkedIn company URL when known */
  linkedinUrl?: string;
  employeeCount: string;
  sizeBucket: string;
  hq: string;
  founded: string;
  jobCount: number;
  sources: string[];
  roleTags: string[];
  followerCount?: string;
  description?: string;
  /** Empty / loading cell honesty while enrich runs */
  enrichPending?: boolean;
  removed?: boolean;
};

export const SEED_FIRMS: FirmRow[] = [
  {
    id: "f1",
    name: "Apex Industrial Supply",
    website: "apexindustrial.com",
    linkedinUrl: "https://www.linkedin.com/company/apex-industrial",
    employeeCount: "120",
    sizeBucket: "51–200",
    hq: "Chicago, IL · US",
    founded: "2014",
    jobCount: 3,
    sources: ["wellfound", "linkedin"],
    roleTags: ["founding_sales"],
    followerCount: "4,200",
    description: "MRO supply for mid-market plants.",
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
    followerCount: "12,100",
    description: "Regional freight orchestration for 3PLs.",
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
    followerCount: "890",
    description: "Precision fasteners for robotics OEMs.",
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
    followerCount: "3,050",
    description: "Field service ops software for HVAC fleets.",
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
    followerCount: "28,400",
    description: "Contract manufacturing for industrial IoT.",
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
    followerCount: "",
    description: "Plant telemetry for mid-market manufacturers.",
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
    followerCount: "6,700",
    description: "Warehouse AMRs for regional DCs.",
  },
];

export type BusinessClient = {
  id: string;
  name: string;
  initials: string;
};

export const BUSINESS_CLIENTS: BusinessClient[] = [
  { id: "b1", name: "Meridian Holdings", initials: "MH" },
  { id: "b2", name: "Summit Partners", initials: "SP" },
];

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
