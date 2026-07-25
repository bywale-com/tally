import type { NotionIconName } from "../icons/notion-icon-urls";

/** A job/board source adapter — shape must be verified before field ops. */
export type EnrichmentSourceKind =
  | "greenhouse"
  | "lever"
  | "ashby"
  | "hn"
  | "indeed"
  | "stub"
  | "custom_url";

export type EnrichmentFieldType = "string" | "number" | "boolean" | "url" | "date" | "json";

export type EnrichmentFieldShape = {
  path: string;
  label: string;
  type: EnrichmentFieldType;
};

export type IndeedMatchMode = "broad" | "phrase" | "boolean";

export type IndeedBooleanJoin = "AND" | "OR";

/** One exact phrase in boolean mode — quotes are applied when compiling. */
export type IndeedBooleanTerm = {
  /** Join before this term. Ignored / null for the first term. */
  join: IndeedBooleanJoin | null;
  term: string;
};

export const INDEED_BOOLEAN_TERM_MAX = 3;

/** Indeed search-first criteria (mirrors scanner IndeedSearchCriteria). */
export type IndeedSearchCriteria = {
  /**
   * Freeform query for broad / phrase.
   * In boolean mode this is kept as a compiled mirror of booleanTerms.
   */
  query: string;
  location: string;
  country: string;
  radius: number | null;
  /**
   * broad — strip decorative quotes
   * phrase — wrap whole query in "…"
   * boolean — structured terms (quoted + AND/OR), max 3
   */
  matchMode: IndeedMatchMode;
  /** Structured boolean terms when matchMode === "boolean". */
  booleanTerms?: IndeedBooleanTerm[];
  /** Max posting age in days. null = All (omit fromage). */
  fromageDays: number | null;
  /** Minimum salary floor in dollars. null = All (omit salaryType). */
  salaryMin: number | null;
  /** Max results to pull (1–50). */
  resultsWanted: number;
  /** Original pasted search URL if any */
  searchUrl?: string;
};

export type EnrichmentSourceDef = {
  id: string;
  kind: EnrichmentSourceKind;
  name: string;
  description: string;
  icon: NotionIconName;
  /** Pre-seeded adapters ship verified; custom URLs start unverified until Pull. */
  verified: boolean;
  shape: EnrichmentFieldShape[];
  /** Optional board/job/search URL */
  url?: string;
  lastPulledAt?: string;
  /** Indeed-only search knobs */
  indeed?: IndeedSearchCriteria;
  /** Last Pull sample count */
  lastPullCount?: number;
  /**
   * Raw rows from the last Pull — used only to preview incoming field values
   * in the mapper. Not node Output (Run owns that).
   */
  lastPullSample?: Record<string, unknown>[];
};

export const POSTING_SHAPE: EnrichmentFieldShape[] = [
  { path: "company", label: "Company", type: "string" },
  { path: "title", label: "Role title", type: "string" },
  { path: "url", label: "Posting URL", type: "url" },
  { path: "raw_text", label: "Body", type: "string" },
  { path: "posted_at", label: "Posted at", type: "date" },
  { path: "source", label: "Source id", type: "string" },
];

const COUNTRY_HOST: Record<string, string> = {
  canada: "ca.indeed.com",
  usa: "www.indeed.com",
  uk: "uk.indeed.com",
  australia: "au.indeed.com",
};

export function defaultIndeedCriteria(): IndeedSearchCriteria {
  return {
    query: "founding business development",
    location: "Montréal, QC",
    country: "Canada",
    radius: 25,
    matchMode: "broad",
    booleanTerms: [{ join: null, term: "" }],
    fromageDays: null,
    salaryMin: null,
    resultsWanted: 25,
  };
}

export function emptyBooleanTerms(seed = ""): IndeedBooleanTerm[] {
  return [{ join: null, term: seed }];
}

function quoteExactTerm(term: string): string {
  const inner = term.trim().replace(/^["']+|["']+$/g, "").replace(/"/g, "");
  return inner ? `"${inner}"` : "";
}

/** Compile UI criteria → Indeed `q=` string (quotes + AND/OR are implicit for boolean). */
export function compileIndeedQuery(indeed: IndeedSearchCriteria): string {
  if (indeed.matchMode === "boolean") {
    const terms = (indeed.booleanTerms?.length
      ? indeed.booleanTerms
      : emptyBooleanTerms(indeed.query)
    ).slice(0, INDEED_BOOLEAN_TERM_MAX);
    const parts: string[] = [];
    for (let i = 0; i < terms.length; i++) {
      const quoted = quoteExactTerm(terms[i].term);
      if (!quoted) continue;
      if (parts.length === 0) {
        parts.push(quoted);
      } else {
        const join = terms[i].join === "OR" ? "OR" : "AND";
        parts.push(join, quoted);
      }
    }
    return parts.join(" ");
  }
  return normalizeIndeedQuery(indeed.query, indeed.matchMode);
}

/** Normalize query — boolean preserves AND/OR quoted phrases. */
export function normalizeIndeedQuery(query: string, matchMode: IndeedMatchMode): string {
  let q = query.trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  if (!q) return "";
  if (matchMode === "boolean") {
    return q.replace(/\s+/g, " ").trim();
  }
  if (matchMode === "phrase") {
    const inner = q.replace(/^["']+|["']+$/g, "").trim();
    return `"${inner}"`;
  }
  q = q.replace(/["']/g, " ");
  return q.replace(/\s+/g, " ").trim();
}

/** Best-effort parse of `"a" AND "b" OR "c"` into structured terms. */
export function parseBooleanQueryToTerms(query: string): IndeedBooleanTerm[] {
  const q = query.trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  if (!q) return emptyBooleanTerms();

  const chunks: { join: IndeedBooleanJoin | null; raw: string }[] = [];
  let buf = "";
  let pendingJoin: IndeedBooleanJoin | null = null;
  const flush = () => {
    const raw = buf.trim();
    if (raw) chunks.push({ join: pendingJoin, raw });
    buf = "";
  };
  const tokens = q.split(/(\s+AND\s+|\s+OR\s+)/i);
  for (const tok of tokens) {
    if (/^\s+AND\s+$/i.test(tok)) {
      flush();
      pendingJoin = "AND";
      continue;
    }
    if (/^\s+OR\s+$/i.test(tok)) {
      flush();
      pendingJoin = "OR";
      continue;
    }
    buf += tok;
  }
  flush();

  const terms: IndeedBooleanTerm[] = [];
  for (let i = 0; i < chunks.length && terms.length < INDEED_BOOLEAN_TERM_MAX; i++) {
    const term = chunks[i].raw.replace(/^["']+|["']+$/g, "").trim();
    if (!term) continue;
    terms.push({
      join: terms.length === 0 ? null : chunks[i].join ?? "AND",
      term,
    });
  }
  return terms.length > 0 ? terms : emptyBooleanTerms();
}

function formatSalaryType(salaryMin: number): string {
  return `$${salaryMin.toLocaleString("en-US")}`;
}

/** Build the Indeed SERP URL that will be scraped (preview + scanner). */
export function buildIndeedSearchUrl(indeed: IndeedSearchCriteria): string {
  const host = COUNTRY_HOST[(indeed.country || "Canada").toLowerCase()] ?? "ca.indeed.com";
  const q = compileIndeedQuery(indeed);
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (indeed.location) params.set("l", indeed.location);
  if (indeed.radius != null) params.set("radius", String(indeed.radius));
  if (indeed.fromageDays != null && indeed.fromageDays > 0) {
    params.set("fromage", String(indeed.fromageDays));
  }
  if (indeed.salaryMin != null && indeed.salaryMin > 0) {
    params.set("salaryType", formatSalaryType(indeed.salaryMin));
  }
  return `https://${host}/jobs?${params.toString()}`;
}

export function parseIndeedSearchUrl(url: string): IndeedSearchCriteria | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  if (!host.includes("indeed.")) return null;

  const q = parsed.searchParams.get("q") ?? "";
  const l = parsed.searchParams.get("l") ?? "";
  const radiusRaw = parsed.searchParams.get("radius");
  const radius = radiusRaw && /^\d+$/.test(radiusRaw) ? Number(radiusRaw) : 25;
  const fromageRaw = parsed.searchParams.get("fromage");
  const fromageDays =
    fromageRaw && /^\d+$/.test(fromageRaw) ? Number(fromageRaw) : null;
  const salaryRaw = parsed.searchParams.get("salaryType") ?? "";
  const salaryMatch = salaryRaw.replace(/[$,]/g, "").match(/(\d+)/);
  const salaryMin = salaryMatch ? Number(salaryMatch[1]) : null;

  let country = "USA";
  if (host.startsWith("ca.")) country = "Canada";
  else if (host.startsWith("uk.")) country = "UK";
  else if (host.startsWith("au.")) country = "Australia";
  else if (host === "www.indeed.com" || host === "indeed.com") country = "USA";

  const path = parsed.pathname;
  const decodedQ = decodeURIComponent(q.replace(/\+/g, " "));
  const looksBoolean = /"[^"]+"\s+(AND|OR)\s+"/i.test(decodedQ) || /\b(AND|OR)\b/.test(decodedQ);

  if (path.includes("/viewjob") || path.includes("/rc/clk")) {
    return {
      ...defaultIndeedCriteria(),
      query: "",
      location: l,
      country,
      radius: null,
      searchUrl: url,
    };
  }

  return {
    query: decodedQ,
    location: decodeURIComponent(l.replace(/\+/g, " ")),
    country,
    radius,
    matchMode: looksBoolean ? "boolean" : "broad",
    booleanTerms: looksBoolean ? parseBooleanQueryToTerms(decodedQ) : emptyBooleanTerms(decodedQ),
    fromageDays,
    salaryMin,
    resultsWanted: 25,
    searchUrl: url,
  };
}

function sourceStub(
  id: string,
  name: string,
  url: string,
  description = "Source stub — live pull not configured yet",
  icon: NotionIconName = "compass",
): EnrichmentSourceDef {
  return {
    id,
    kind: "stub",
    name,
    description,
    icon,
    verified: true,
    shape: POSTING_SHAPE,
    url,
  };
}

const SOURCE_STUBS: EnrichmentSourceDef[] = [
  sourceStub("src-wellfound", "Wellfound", "https://wellfound.com/jobs", "Startup / VC-backed roles"),
  sourceStub("src-yc-work-at-startup", "Y Combinator — Work at a Startup", "https://www.ycombinator.com/jobs", "YC company jobs"),
  sourceStub("src-built-in", "Built In", "https://builtin.com/jobs", "Startup and tech jobs"),
  sourceStub("src-built-in-nyc", "Built In NYC", "https://www.builtinnyc.com/jobs", "Built In local board"),
  sourceStub("src-built-in-sf", "Built In SF", "https://www.builtinsf.com/jobs", "Built In local board"),
  sourceStub("src-built-in-boston", "Built In Boston", "https://www.builtinboston.com/jobs", "Built In local board"),
  sourceStub("src-built-in-chicago", "Built In Chicago", "https://www.builtinchicago.org/jobs", "Built In local board"),
  sourceStub("src-built-in-austin", "Built In Austin", "https://www.builtinaustin.com/jobs", "Built In local board"),
  sourceStub("src-built-in-seattle", "Built In Seattle", "https://www.builtinseattle.com/jobs", "Built In local board"),
  sourceStub("src-built-in-colorado", "Built In Colorado", "https://www.builtincolorado.com/jobs", "Built In local board"),
  sourceStub("src-built-in-la", "Built In LA", "https://www.builtinla.com/jobs", "Built In local board"),
  sourceStub("src-startup-jobs", "Startup Jobs", "https://startup.jobs", "Startup-focused board"),
  sourceStub("src-otta", "Otta / Welcome to the Jungle", "https://app.welcometothejungle.com/jobs", "Curated startup and tech jobs"),
  sourceStub("src-techstars-talent", "Techstars Talent", "https://jobs.techstars.com", "Techstars portfolio jobs"),
  sourceStub("src-sequoia-jobs", "Sequoia Jobs", "https://www.sequoiacap.com/jobs", "VC portfolio jobs"),
  sourceStub("src-a16z-jobs", "a16z Jobs", "https://portfoliojobs.a16z.com", "VC portfolio jobs"),
  sourceStub("src-bessemer-jobs", "Bessemer Jobs", "https://jobs.bvp.com", "VC portfolio jobs"),
  sourceStub("src-accel-jobs", "Accel Jobs", "https://jobs.accel.com", "VC portfolio jobs"),
  sourceStub("src-index-jobs", "Index Ventures Jobs", "https://www.indexventures.com/startup-jobs", "VC portfolio jobs"),
  sourceStub("src-first-round-jobs", "First Round Jobs", "https://jobs.firstround.com", "VC portfolio jobs"),
  sourceStub("src-craft-jobs", "Craft Ventures Jobs", "https://jobs.craftventures.com", "VC portfolio jobs"),
  sourceStub("src-insight-jobs", "Insight Partners Jobs", "https://jobs.insightpartners.com", "VC portfolio jobs"),
  sourceStub("src-getro-networks", "Getro-powered VC Talent Networks", "https://getro.com", "Portfolio job-board network"),
  sourceStub("src-consider", "Consider.co", "https://www.consider.co", "Startup opportunity discovery"),
  sourceStub("src-underdog", "Underdog.io", "https://underdog.io", "Startup talent marketplace"),
  sourceStub("src-rippling-jobs", "Rippling Jobs", "https://www.rippling.com/careers", "ATS / company-board source"),
  sourceStub("src-ats-board-search", "ATS Board Search", "https://www.google.com/search?q=site%3Aboards.greenhouse.io+%22founding+account+executive%22", "Google search across Greenhouse / Lever / Ashby boards"),
  sourceStub("src-repvue", "RepVue", "https://www.repvue.com", "Sales-specific jobs and company data"),
  sourceStub("src-rainmakers", "Rainmakers", "https://www.rainmakers.co", "Sales talent marketplace"),
  sourceStub("src-just-sales-jobs", "Just Sales Jobs", "https://www.justsalesjobs.ca", "Canada sales roles"),
  sourceStub("src-salesjobs", "SalesJobs.com", "https://www.salesjobs.com", "Sales-specific board"),
  sourceStub("src-bravado", "Bravado", "https://bravado.co/jobs", "Sales community job board"),
  sourceStub("src-pavilion", "Pavilion Job Board", "https://www.joinpavilion.com/jobs", "Revenue community jobs"),
  sourceStub("src-sales-rebellion", "The Sales Rebellion", "https://salesrebellion.com", "Sales community source"),
  sourceStub("src-sales-hacker", "Sales Hacker", "https://www.saleshacker.com", "Sales community source"),
  sourceStub("src-peak-sales-recruiting", "Peak Sales Recruiting", "https://www.peaksalesrecruiting.com", "Sales recruiting postings"),
  sourceStub("src-betts-recruiting", "Betts Recruiting", "https://bettsrecruiting.com/jobs", "Sales recruiting postings"),
  sourceStub("src-sales-talent-agency", "Sales Talent Agency", "https://www.salestalentagency.com/jobs", "Canada sales recruiting postings"),
  sourceStub("src-closeriq", "CloserIQ", "https://www.closeriq.com", "Sales recruiting marketplace"),
  sourceStub("src-uncapped", "Uncapped", "https://uncapped.io", "Sales source stub"),
  sourceStub("src-linkedin-jobs", "LinkedIn Jobs", "https://www.linkedin.com/jobs", "General high-volume board"),
  sourceStub("src-glassdoor", "Glassdoor", "https://www.glassdoor.com/Job/index.htm", "General high-volume board"),
  sourceStub("src-ziprecruiter", "ZipRecruiter", "https://www.ziprecruiter.com", "General high-volume board"),
  sourceStub("src-monster", "Monster", "https://www.monster.com/jobs", "General high-volume board"),
  sourceStub("src-dice", "Dice", "https://www.dice.com/jobs", "Tech-heavy board"),
  sourceStub("src-simplyhired", "SimplyHired", "https://www.simplyhired.com", "General high-volume board"),
  sourceStub("src-we-work-remotely", "We Work Remotely", "https://weworkremotely.com", "Remote-focused board"),
  sourceStub("src-remote-ok", "Remote OK", "https://remoteok.com", "Remote-focused board"),
  sourceStub("src-flexjobs", "FlexJobs", "https://www.flexjobs.com", "Remote-focused board"),
  sourceStub("src-remotive", "Remotive", "https://remotive.com/remote-jobs", "Remote-focused board"),
  sourceStub("src-justremote", "JustRemote", "https://justremote.co", "Remote-focused board"),
  sourceStub("src-working-nomads", "Working Nomads", "https://www.workingnomads.com/jobs", "Remote-focused board"),
  sourceStub("src-remote-co", "Remote.co", "https://remote.co/remote-jobs", "Remote-focused board"),
  sourceStub("src-dynamite-jobs", "Dynamite Jobs", "https://dynamitejobs.com", "Remote-focused board"),
  sourceStub("src-himalayas", "Himalayas", "https://himalayas.app/jobs", "Remote-focused board"),
  sourceStub("src-job-bank-canada", "Job Bank", "https://www.jobbank.gc.ca/jobsearch", "Government of Canada board"),
  sourceStub("src-workopolis", "Workopolis", "https://www.workopolis.com/jobsearch", "Canada-specific board"),
  sourceStub("src-eluta", "Eluta", "https://www.eluta.ca", "Canada-specific board"),
  sourceStub("src-jobboom", "Jobboom", "https://www.jobboom.com", "Quebec-specific board"),
  sourceStub("src-betakit-jobs", "BetaKit Job Board", "https://betakit.com/jobs", "Canada startup / tech board"),
  sourceStub("src-communitech-jobs", "Communitech Jobs", "https://www1.communitech.ca/jobs", "Canada tech talent board"),
  sourceStub("src-mars-jobs", "MaRS Talent", "https://www.marsdd.com/talent", "Canada tech talent board"),
  sourceStub("src-invest-ottawa-jobs", "Invest Ottawa Talent", "https://www.investottawa.ca/careers", "Ottawa talent board"),
  sourceStub("src-toronto-tech-jobs", "Toronto Tech Jobs", "https://www.google.com/search?q=Toronto+Tech+Jobs", "Canada local tech-board source"),
  sourceStub("src-vancouver-tech-jobs", "Vancouver Tech Jobs", "https://www.google.com/search?q=Vancouver+Tech+Jobs", "Canada local tech-board source"),
  sourceStub("src-elevate-jobs", "Elevate", "https://elevate.ca", "Canada startup / tech source"),
  sourceStub("src-startup-canada-jobs", "Startup Canada", "https://www.startupcan.ca", "Canada startup source"),
  sourceStub("src-google-jobs", "Google Jobs", "https://www.google.com/search?q=%22founding+account+executive%22+jobs", "Meta-search source"),
  sourceStub("src-jobspikr", "JobsPikr", "https://www.jobspikr.com", "Job data aggregator"),
  sourceStub("src-adzuna", "Adzuna", "https://www.adzuna.com", "Job meta-search"),
  sourceStub("src-jooble", "Jooble", "https://jooble.org", "Job meta-search"),
  sourceStub("src-careerjet", "Careerjet", "https://www.careerjet.com", "Job meta-search"),
  sourceStub("src-talent-com", "Talent.com", "https://www.talent.com", "Job meta-search"),
  sourceStub("src-twitter-x", "Twitter/X Hiring Posts", "https://x.com/search?q=%22hiring%20our%20first%20AE%22", "Founder-posted hiring signals"),
  sourceStub("src-linkedin-posts", "LinkedIn Posts", "https://www.linkedin.com/search/results/content/?keywords=%22hiring%20our%20first%20AE%22", "Founder-posted hiring signals"),
  sourceStub("src-crunchbase", "Crunchbase", "https://www.crunchbase.com", "Funding announcement signal"),
  sourceStub("src-tracxn", "Tracxn", "https://tracxn.com", "Funding announcement signal"),
  sourceStub("src-recruiting-agency-sites", "Recruiting Agency Sites", "https://www.google.com/search?q=%22founding+account+executive%22+%22sales+cycle%22+%22OTE%22", "High-detail agency postings"),
];

export const CATALOG_SOURCES: EnrichmentSourceDef[] = [
  {
    id: "src-indeed",
    kind: "indeed",
    name: "Indeed",
    description: "Search-first job SERP. Pull scrapes the raw shape into incoming; Run fills Output.",
    icon: "magnifying-glass",
    verified: false,
    shape: [],
    url: "https://www.indeed.com",
    indeed: defaultIndeedCriteria(),
  },
  {
    id: "src-greenhouse",
    kind: "greenhouse",
    name: "Greenhouse",
    description: "ATS boards via Greenhouse JSON API",
    icon: "grid-square-2x2",
    verified: true,
    shape: POSTING_SHAPE,
    url: "https://www.greenhouse.com",
  },
  {
    id: "src-lever",
    kind: "lever",
    name: "Lever",
    description: "ATS postings via Lever JSON API",
    icon: "list",
    verified: true,
    shape: POSTING_SHAPE,
    url: "https://www.lever.co",
  },
  {
    id: "src-ashby",
    kind: "ashby",
    name: "Ashby",
    description: "ATS postings via Ashby posting API",
    icon: "documents",
    verified: true,
    shape: POSTING_SHAPE,
    url: "https://www.ashbyhq.com",
  },
  {
    id: "src-hn",
    kind: "hn",
    name: "Hacker News · Who is Hiring",
    description: "Algolia comments matching founding/sales phrases",
    icon: "lightning-bolt",
    verified: true,
    url: "https://news.ycombinator.com/submitted?id=whoishiring",
    shape: [
      { path: "company", label: "Company (parsed)", type: "string" },
      { path: "title", label: "Comment headline", type: "string" },
      { path: "url", label: "HN thread URL", type: "url" },
      { path: "raw_text", label: "Comment body", type: "string" },
      { path: "posted_at", label: "Comment date", type: "date" },
      { path: "source", label: "Source id", type: "string" },
    ],
  },
  ...SOURCE_STUBS,
];

/**
 * Shape-only fallback for non-Indeed adapters (dev-determined shapes).
 * Indeed goes through pullIndeedSourceLive — shape derives from the live scrape.
 */
export function pullSourceShape(source: EnrichmentSourceDef): EnrichmentSourceDef {
  return {
    ...source,
    verified: true,
    shape: source.shape.length > 0 ? source.shape : POSTING_SHAPE,
    lastPulledAt: new Date().toISOString(),
  };
}

export function createCustomSourceFromUrl(url: string): EnrichmentSourceDef {
  const indeed = parseIndeedSearchUrl(url);
  if (indeed) {
    const hasQuery = Boolean(indeed.query.trim());
    return {
      id: `src-indeed-${Date.now()}`,
      kind: "indeed",
      name: `Indeed · ${indeed.country}`,
      description: hasQuery
        ? `${indeed.query} · ${indeed.location || "any location"}`
        : url,
      icon: "magnifying-glass",
      verified: false,
      shape: [],
      url,
      indeed: {
        ...defaultIndeedCriteria(),
        ...indeed,
        query: indeed.query || defaultIndeedCriteria().query,
        location: indeed.location || defaultIndeedCriteria().location,
      },
    };
  }

  let host = "custom";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    /* keep custom */
  }
  return {
    id: `src-custom-${Date.now()}`,
    kind: "custom_url",
    name: host,
    description: url,
    icon: "compass",
    verified: false,
    shape: [],
    url,
  };
}
