/** Shared crawl types + metadata contract (UI polls Postgres metadata). */

export type CrawlPhase = "planning" | "enriching" | "waiting" | "done" | "failed";

export type EnrichmentRowStatus = "pending" | "running" | "done" | "failed";

/** One input URL → one scrape. Similar pages are harvested JSON, never followed. */
export type EnrichmentRow = {
  url: string;
  job_id: string;
  status: EnrichmentRowStatus;
  title?: string;
  company_name?: string;
  location?: string;
  salary_raw?: string;
  employment_type?: string;
  date_posted?: string;
  company_slug?: string;
  /** Similar job cards from the same HTML — not scraped further. */
  similar_pages?: SimilarPage[];
  error?: string;
};

export type SimilarPage = {
  job_id: string;
  url: string;
  company_name?: string;
  company_slug?: string;
  location?: string;
  date_text?: string;
  salary_raw?: string;
};

export type CrawlRunMetadata = {
  phase: CrawlPhase;
  crawlRunId: string;
  mode: "job_url_extract";
  rows: EnrichmentRow[];
  wait?: {
    kind: "baseline" | "backoff";
    seconds: number;
    until: string;
  };
};

export type CrawlPagePayload = {
  runId: string;
  url: string;
  hop: number;
  jobId: string;
  /** When false (default for job extract), do not enqueue/follow similar URLs or company pages. */
  followGraph?: boolean;
  enrichCompany?: boolean;
};

export type CrawlPageResult = {
  ok: boolean;
  job_id: string;
  discovered_count: number;
  cache_hit: boolean;
  resolved: boolean;
  abnormal_reason?: string;
  row?: EnrichmentRow;
};

export type OrchestratorPayload = {
  runId: string;
  seedUrl: string;
  /** @deprecated graph frontier — ignored; always one scrape per seed */
  maxHops?: number;
  /** @deprecated page budget — ignored; always one scrape per seed */
  maxPages?: number;
  coffeeEvery?: number;
};

export function jobIdFromUrl(url: string): string | null {
  const m = String(url).match(/\/jobs\/view\/[^/?#]*?(\d{6,})(?:[/?#]|$)/i);
  return m ? m[1] : null;
}

export function jitter(minSec: number, maxSec: number): number {
  return minSec + Math.random() * (maxSec - minSec);
}

export function companySlugFromUrl(url: string): string {
  const m = String(url || "").match(/linkedin\.com\/company\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : "";
}

export function companyHostFromUrl(url: string): string {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}
