import { companyHostFromUrl, companySlugFromUrl, jobIdFromUrl } from "./types";

export type PrimaryJob = {
  job_id: string;
  source: string;
  fidelity: string;
  url: string;
  title: string;
  description: string;
  employment_type: string;
  date_posted: string;
  valid_through: string;
  location: string;
  geo_lat: string;
  geo_lng: string;
  months_of_experience: string | number;
  founder_or_report_line: string;
  company_name: string;
  company_linkedin_url: string;
  company_slug: string;
  company_host: string;
  salary_raw: string;
  hop: number;
  seed_url: string;
  discovered_from_job_id: string;
  parse_ok: boolean;
  website: string;
  gaps: string;
};

export type DiscoveryCard = {
  job_id: string;
  url: string;
  hop: number;
  discovered_from_job_id: string;
  company_name: string;
  company_slug: string;
  company_host: string;
  company_linkedin_url: string;
  location: string;
  date_text: string;
  salary_raw: string;
  fidelity: string;
  source: string;
};

export type CompanyEnrichment = {
  company_slug: string;
  website: string;
  employee_count: string | number;
  size_bucket: string;
  follower_count: string | number;
  hq_country: string;
  hq_locality: string;
  hq_region: string;
  company_host_canonical: string;
  org_description: string;
  founded: string;
  recent_post_themes: string;
  resolved: boolean;
  enrich_flag: string;
  resolved_at: string;
};

function parseMaybeJson(s: unknown): unknown {
  if (s == null) return null;
  if (typeof s === "object") return s;
  try {
    return JSON.parse(String(s));
  } catch {
    return null;
  }
}

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const parsed = parseMaybeJson(m[1].trim());
    if (parsed) blocks.push(parsed);
  }
  return blocks;
}

function founderHint(desc: string): string {
  const text = String(desc || "");
  const patterns = [
    /report(?:ing)? to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/,
    /founded by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /CEO[,\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1];
  }
  return "";
}

export function parsePrimaryJob(opts: {
  html: string;
  url: string;
  hop: number;
  seedUrl: string;
  jobId?: string;
  discoveredFromJobId?: string;
}): PrimaryJob {
  const { html, url, hop, seedUrl } = opts;
  const blocks = extractJsonLdBlocks(html);
  let posting: Record<string, unknown> | null = null;

  for (const b of blocks) {
    const candidates = Array.isArray(b)
      ? b
      : b && typeof b === "object" && Array.isArray((b as { "@graph"?: unknown[] })["@graph"])
        ? ((b as { "@graph": unknown[] })["@graph"] as unknown[])
        : [b];
    for (const c of candidates) {
      if (!c || typeof c !== "object") continue;
      const t = (c as { "@type"?: string | string[] })["@type"];
      const types = Array.isArray(t) ? t : [t];
      if (types.map(String).some((x) => /JobPosting/i.test(x))) {
        posting = c as Record<string, unknown>;
        break;
      }
    }
    if (posting) break;
  }

  const org = (posting?.hiringOrganization as Record<string, unknown>) || {};
  const loc = (posting?.jobLocation as Record<string, unknown>) || {};
  const place = (loc.address as Record<string, unknown>) || loc || {};
  const geo = (loc.geo as Record<string, unknown>) || {};
  const exp = (posting?.experienceRequirements as Record<string, unknown>) || {};
  const months = (exp.monthsOfExperience ?? exp.months_of_experience ?? "") as string | number;
  const companyUrl = String(org.sameAs || org.url || "");

  const job_id =
    opts.jobId || jobIdFromUrl(url) || jobIdFromUrl(String(posting?.url || "")) || "";

  const location =
    String(place.addressLocality || "") ||
    String(place.addressRegion || "") ||
    [place.addressLocality, place.addressRegion, place.addressCountry].filter(Boolean).join(", ") ||
    (typeof place === "string" ? place : "");

  return {
    job_id,
    source: "linkedin",
    fidelity: "primary",
    url,
    title: String(posting?.title || ""),
    description: String(posting?.description || ""),
    employment_type: String(posting?.employmentType || ""),
    date_posted: String(posting?.datePosted || ""),
    valid_through: String(posting?.validThrough || ""),
    location,
    geo_lat: String(geo.latitude || ""),
    geo_lng: String(geo.longitude || ""),
    months_of_experience: months,
    founder_or_report_line: founderHint(String(posting?.description || "")),
    company_name: String(org.name || ""),
    company_linkedin_url: companyUrl,
    company_slug: companySlugFromUrl(companyUrl),
    company_host: companyHostFromUrl(companyUrl),
    salary_raw: "",
    hop,
    seed_url: seedUrl,
    discovered_from_job_id: opts.discoveredFromJobId || "",
    parse_ok: Boolean(posting),
    website: "",
    gaps: "",
  };
}

function firstMatch(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? (m[1] || "").trim() : "";
}

function absUrl(href: string): string {
  if (!href) return "";
  const clean = href.replace(/&amp;/g, "&");
  if (/^https?:\/\//i.test(clean)) return clean.split("?")[0];
  if (clean.startsWith("/")) return `https://www.linkedin.com${clean.split("?")[0]}`;
  return "";
}

export function harvestGraphCards(html: string, parentId: string, parentHop: number): DiscoveryCard[] {
  const cardRe = /<div[^>]*class="[^"]*base-card[^"]*"[^>]*>[\s\S]*?(?=<div[^>]*class="[^"]*base-card|<\/ul>|$)/gi;
  let cards = html.match(cardRe) || [];
  if (cards.length === 0) {
    // broader fallback: any jobs/view anchors in similar sections
    cards = [html];
  }

  const discoveries: DiscoveryCard[] = [];
  const seen = new Set<string>();

  for (const raw of cards) {
    const href =
      firstMatch(raw, /href="([^"]*\/jobs\/view\/[^"]+)"/i) ||
      firstMatch(raw, /href='([^']*\/jobs\/view\/[^']+)'/i);
    const url = absUrl(href);
    const job_id = jobIdFromUrl(url);
    if (!url || !job_id || job_id === parentId || seen.has(job_id)) continue;
    seen.add(job_id);

    const companyHref = absUrl(
      firstMatch(raw, /href="([^"]*linkedin\.com\/company\/[^"]+)"/i) ||
        firstMatch(raw, /href="(\/company\/[^"]+)"/i),
    );
    const company_name =
      firstMatch(raw, /base-search-card__subtitle[^>]*>([\s\S]*?)<\//i).replace(/<[^>]+>/g, "").trim() ||
      firstMatch(raw, /hidden-nested-link[^>]*>([\s\S]*?)<\//i).replace(/<[^>]+>/g, "").trim();
    const location = firstMatch(raw, /job-search-card__location[^>]*>([\s\S]*?)<\//i)
      .replace(/<[^>]+>/g, "")
      .trim();
    const date_text =
      firstMatch(raw, /datetime="([^"]+)"/i) ||
      firstMatch(raw, /job-search-card__listdate[^>]*>([\s\S]*?)<\//i).replace(/<[^>]+>/g, "").trim();
    const salary_raw =
      firstMatch(raw, /job-search-card__salary-info[^>]*>([\s\S]*?)<\//i)
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim() ||
      firstMatch(raw, /(\$[\d,]+\s*[-–]\s*\$[\d,]+[^<]*)/i).replace(/\s+/g, " ").trim();

    discoveries.push({
      job_id,
      url,
      hop: parentHop + 1,
      discovered_from_job_id: parentId,
      company_name,
      company_slug: companySlugFromUrl(companyHref),
      company_host: companyHostFromUrl(companyHref) || (companyHref ? "www.linkedin.com" : ""),
      company_linkedin_url: companyHref,
      location,
      date_text,
      salary_raw,
      fidelity: "graph",
      source: "linkedin",
    });
  }

  return discoveries;
}

export function stampGaps(
  row: PrimaryJob,
  kind: "primary" | "graph",
): PrimaryJob {
  const gaps: string[] = [];
  const companyUrl = String(row.company_linkedin_url || "");
  if (!row.website) gaps.push("no_external_website");
  if (!companyUrl || /linkedin\.com\/company\//i.test(companyUrl)) {
    gaps.push("linkedin_internal_company_link_only");
  }
  if (row.company_slug) gaps.push("company_slug_may_be_historical");
  if (kind === "primary") gaps.push("industry_may_be_stale_or_missing");
  return { ...row, gaps: gaps.join("|") };
}

/** Port of n8n "Parse Company (unescape)" — Organization is escaped inside HTML body. */
export function parseCompanyUnescaped(rawHtml: string, company_slug: string): CompanyEnrichment {
  const unescaped = String(rawHtml || "")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, " ")
    .replace(/\\u0026/g, "&");

  function grab(re: RegExp): string {
    const m = unescaped.match(re);
    return m ? m[1].trim() : "";
  }

  let website = grab(/"sameAs":"((?:https?:\/\/)?[a-z0-9.\-]+\.[a-z]{2,}[^"]*)"/i);
  if (/linkedin\.com/i.test(website)) website = "";
  if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;

  const empStr =
    grab(/"numberOfEmployees":\{[^}]*?"value":\s*([0-9]+)/i) ||
    grab(/numberOfEmployees"[^0-9]{0,20}([0-9]+)/i);
  const employee_count = empStr ? Number(empStr) : "";
  const size_bucket = grab(/([0-9,]+)\s+employees/i);
  const followersStr = grab(/([0-9,]+)\s+followers/i);
  const follower_count = followersStr ? Number(followersStr.replace(/,/g, "")) : "";
  const hq_country = grab(/"addressCountry":"([^"]{1,60})"/i);
  const hq_locality = grab(/"addressLocality":"([^"]{1,80})"/i);
  const hq_region = grab(/"addressRegion":"([^"]{1,80})"/i);
  const org_description = grab(/"description":"([^"]{20,600})"/i);
  const founded = grab(/"foundingDate":"([^"]{1,20})"/i) || grab(/Founded[^0-9]{0,6}([0-9]{4})/i);
  const canonicalHost = grab(/rel="canonical"\s+href="https?:\/\/([a-z.]*linkedin\.com)/i);

  const themeSet = new Set<string>();
  const re = /posts\/[a-z0-9-]+_([a-z0-9-]{8,80})-activity-/gi;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(unescaped)) !== null) {
    const theme = mm[1].replace(/-/g, " ").trim();
    if (theme) themeSet.add(theme);
    if (themeSet.size >= 12) break;
  }
  const recent_post_themes = Array.from(themeSet).join(" | ");

  const enrich_flag =
    employee_count &&
    size_bucket &&
    Number(String(size_bucket).replace(/,/g, "")) !== Number(employee_count)
      ? "employee_count_split_signal"
      : "";

  return {
    company_slug,
    website,
    employee_count,
    size_bucket,
    follower_count,
    hq_country,
    hq_locality,
    hq_region,
    company_host_canonical: canonicalHost,
    org_description,
    founded,
    recent_post_themes,
    resolved: Boolean(website),
    enrich_flag,
    resolved_at: new Date().toISOString(),
  };
}

export function mergeCompanyIntoRow(
  row: PrimaryJob,
  company: CompanyEnrichment | null,
): PrimaryJob {
  let gaps = String(row.gaps || "")
    .split("|")
    .filter(Boolean)
    .filter((g) => g !== "no_external_website");

  const next: PrimaryJob & Record<string, unknown> = { ...row };

  if (company && company.website) {
    next.website = company.website;
    next.company_employee_count = company.employee_count;
    next.company_follower_count = company.follower_count;
    next.company_hq_country = company.hq_country;
    next.company_hq_locality = company.hq_locality;
    next.company_hq_region = company.hq_region;
    next.company_founded = company.founded;
    next.company_recent_post_themes = company.recent_post_themes;
    next.company_host_canonical = company.company_host_canonical;
    gaps.push("website_resolved");
    if (company.enrich_flag) gaps.push(company.enrich_flag);
  } else {
    next.website = "";
    gaps.push("website_absent");
  }

  next.gaps = gaps.join("|");
  next.enriched_at = new Date().toISOString();
  return next as PrimaryJob;
}
