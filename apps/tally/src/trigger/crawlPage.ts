import { logger, task } from "@trigger.dev/sdk";
import { fetchGuestPage } from "./crawl/fetchGuestPage";
import {
  harvestGraphCards,
  mergeCompanyIntoRow,
  parseCompanyUnescaped,
  parsePrimaryJob,
  stampGaps,
  type CompanyEnrichment,
} from "./crawl/parse";
import { getCompany, getRun, insertJob, markFrontier, upsertCompany } from "./crawl/store";
import type { CrawlPagePayload, CrawlPageResult, EnrichmentRow, SimilarPage } from "./crawl/types";

export const crawlPageTask = task({
  id: "crawl-page",
  retry: { maxAttempts: 1 },
  run: async (payload: CrawlPagePayload): Promise<CrawlPageResult> => {
    const {
      runId,
      url,
      hop,
      jobId,
      followGraph = false,
      enrichCompany = false,
    } = payload;
    const run = await getRun(runId);
    if (!run) {
      return {
        ok: false,
        job_id: jobId,
        discovered_count: 0,
        cache_hit: false,
        resolved: false,
        abnormal_reason: "run_not_found",
      };
    }

    logger.info("Fetching guest job page", { url, jobId, hop, followGraph, enrichCompany });
    const fetched = await fetchGuestPage(url);
    if (!fetched.ok) {
      await markFrontier(runId, jobId, "queued");
      return {
        ok: false,
        job_id: jobId,
        discovered_count: 0,
        cache_hit: false,
        resolved: false,
        abnormal_reason: fetched.abnormal_reason,
      };
    }

    let primary = parsePrimaryJob({
      html: fetched.html,
      url,
      hop,
      seedUrl: run.seed_url,
      jobId,
    });
    primary = stampGaps(primary, "primary");
    const discoveries = harvestGraphCards(fetched.html, primary.job_id || jobId, hop);

    const similar_pages: SimilarPage[] = discoveries.map((d) => ({
      job_id: d.job_id,
      url: d.url,
      company_name: d.company_name || undefined,
      company_slug: d.company_slug || undefined,
      location: d.location || undefined,
      date_text: d.date_text || undefined,
      salary_raw: d.salary_raw || undefined,
    }));

    if (followGraph) {
      logger.warn("followGraph requested but deferred in job_url_extract path");
    }

    let company: CompanyEnrichment | null = null;
    let cacheHit = false;
    if (enrichCompany && primary.company_slug) {
      const cached = await getCompany(primary.company_slug);
      if (cached?.resolved || (cached && (cached.website || cached.employee_count))) {
        company = cached;
        cacheHit = true;
        logger.info("Company cache hit", { slug: primary.company_slug });
      } else {
        const companyUrl =
          primary.company_linkedin_url ||
          `https://www.linkedin.com/company/${primary.company_slug}`;
        logger.info("Fetching company profile", { companyUrl, slug: primary.company_slug });
        const companyFetch = await fetchGuestPage(companyUrl);
        if (companyFetch.ok) {
          company = parseCompanyUnescaped(companyFetch.html, primary.company_slug);
          await upsertCompany(company);
          logger.info("Company parsed", {
            slug: primary.company_slug,
            website: company.website,
            employee_count: company.employee_count,
            resolved: company.resolved,
          });
        } else {
          logger.warn("Company fetch failed", {
            slug: primary.company_slug,
            reason: companyFetch.abnormal_reason,
          });
        }
      }
      primary = mergeCompanyIntoRow(primary, company);
    }

    await insertJob(runId, {
      ...(primary as typeof primary & Record<string, unknown>),
      similar_pages,
    });
    await markFrontier(runId, jobId, "done");

    const row: EnrichmentRow = {
      url: primary.url || url,
      job_id: primary.job_id || jobId,
      status: "done",
      title: primary.title || undefined,
      company_name: primary.company_name || undefined,
      location: primary.location || undefined,
      salary_raw: primary.salary_raw || undefined,
      employment_type: primary.employment_type || undefined,
      date_posted: primary.date_posted || undefined,
      company_slug: primary.company_slug || undefined,
      similar_pages,
    };

    return {
      ok: true,
      job_id: row.job_id,
      discovered_count: similar_pages.length,
      cache_hit: cacheHit,
      resolved: Boolean(company?.resolved),
      row,
    };
  },
});
