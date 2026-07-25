import { query } from "./db";
import type { CompanyEnrichment, DiscoveryCard, PrimaryJob } from "./parse";

export async function upsertCompany(company: CompanyEnrichment): Promise<void> {
  await query(
    `INSERT INTO crawl_companies (
      company_slug, website, employee_count, size_bucket, follower_count,
      hq_country, hq_locality, hq_region, company_host_canonical, founded,
      recent_post_themes, org_description, resolved, enrich_flag, resolved_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    ON CONFLICT (company_slug) DO UPDATE SET
      website = EXCLUDED.website,
      employee_count = EXCLUDED.employee_count,
      size_bucket = EXCLUDED.size_bucket,
      follower_count = EXCLUDED.follower_count,
      hq_country = EXCLUDED.hq_country,
      hq_locality = EXCLUDED.hq_locality,
      hq_region = EXCLUDED.hq_region,
      company_host_canonical = EXCLUDED.company_host_canonical,
      founded = EXCLUDED.founded,
      recent_post_themes = EXCLUDED.recent_post_themes,
      org_description = EXCLUDED.org_description,
      resolved = EXCLUDED.resolved,
      enrich_flag = EXCLUDED.enrich_flag,
      resolved_at = EXCLUDED.resolved_at`,
    [
      company.company_slug,
      company.website || null,
      company.employee_count === "" ? null : String(company.employee_count),
      company.size_bucket || null,
      company.follower_count === "" ? null : String(company.follower_count),
      company.hq_country || null,
      company.hq_locality || null,
      company.hq_region || null,
      company.company_host_canonical || null,
      company.founded || null,
      company.recent_post_themes || null,
      company.org_description || null,
      company.resolved,
      company.enrich_flag || null,
      company.resolved_at,
    ],
  );
}

export async function getCompany(slug: string): Promise<CompanyEnrichment | null> {
  if (!slug) return null;
  const res = await query<{
    company_slug: string;
    website: string | null;
    employee_count: string | null;
    size_bucket: string | null;
    follower_count: string | null;
    hq_country: string | null;
    hq_locality: string | null;
    hq_region: string | null;
    company_host_canonical: string | null;
    founded: string | null;
    recent_post_themes: string | null;
    org_description: string | null;
    resolved: boolean;
    enrich_flag: string | null;
    resolved_at: Date | null;
  }>(`SELECT * FROM crawl_companies WHERE company_slug = $1`, [slug]);
  const row = res.rows[0];
  if (!row) return null;
  return {
    company_slug: row.company_slug,
    website: row.website || "",
    employee_count: row.employee_count || "",
    size_bucket: row.size_bucket || "",
    follower_count: row.follower_count || "",
    hq_country: row.hq_country || "",
    hq_locality: row.hq_locality || "",
    hq_region: row.hq_region || "",
    company_host_canonical: row.company_host_canonical || "",
    founded: row.founded || "",
    recent_post_themes: row.recent_post_themes || "",
    org_description: row.org_description || "",
    resolved: row.resolved,
    enrich_flag: row.enrich_flag || "",
    resolved_at: row.resolved_at?.toISOString() || new Date().toISOString(),
  };
}

export async function insertJob(runId: string, row: PrimaryJob & Record<string, unknown>): Promise<void> {
  const similar =
    row.similar_pages != null ? JSON.stringify(row.similar_pages) : null;
  await query(
    `INSERT INTO crawl_jobs (
      run_id, job_id, source, fidelity, url, title, description, employment_type,
      date_posted, valid_through, location, geo_lat, geo_lng, months_of_experience,
      founder_or_report_line, company_name, company_linkedin_url, company_slug, company_host,
      salary_raw, gaps, hop, seed_url, website, company_employee_count, company_follower_count,
      company_hq_country, company_hq_locality, company_hq_region, company_founded,
      company_recent_post_themes, company_host_canonical, similar_pages, scraped_at, enriched_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
      $24,$25,$26,$27,$28,$29,$30,$31,$32,$33::jsonb,now(),$34
    )
    ON CONFLICT (run_id, job_id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      website = EXCLUDED.website,
      gaps = EXCLUDED.gaps,
      similar_pages = EXCLUDED.similar_pages,
      company_employee_count = EXCLUDED.company_employee_count,
      company_follower_count = EXCLUDED.company_follower_count,
      company_hq_country = EXCLUDED.company_hq_country,
      company_hq_locality = EXCLUDED.company_hq_locality,
      company_hq_region = EXCLUDED.company_hq_region,
      company_founded = EXCLUDED.company_founded,
      company_recent_post_themes = EXCLUDED.company_recent_post_themes,
      company_host_canonical = EXCLUDED.company_host_canonical,
      enriched_at = EXCLUDED.enriched_at`,
    [
      runId,
      row.job_id,
      row.source || "linkedin",
      row.fidelity || "primary",
      row.url,
      row.title || null,
      row.description || null,
      row.employment_type || null,
      row.date_posted || null,
      row.valid_through || null,
      row.location || null,
      row.geo_lat || null,
      row.geo_lng || null,
      row.months_of_experience === "" ? null : String(row.months_of_experience),
      row.founder_or_report_line || null,
      row.company_name || null,
      row.company_linkedin_url || null,
      row.company_slug || null,
      row.company_host || null,
      row.salary_raw || null,
      row.gaps || null,
      row.hop ?? 0,
      row.seed_url || null,
      row.website || null,
      row.company_employee_count != null ? String(row.company_employee_count) : null,
      row.company_follower_count != null ? String(row.company_follower_count) : null,
      row.company_hq_country || null,
      row.company_hq_locality || null,
      row.company_hq_region || null,
      row.company_founded || null,
      row.company_recent_post_themes || null,
      row.company_host_canonical || null,
      similar,
      row.enriched_at || null,
    ],
  );
}

export async function enqueueDiscoveries(
  runId: string,
  discoveries: DiscoveryCard[],
  maxHops: number,
): Promise<number> {
  let inserted = 0;
  for (const d of discoveries) {
    const status = d.hop <= maxHops ? "queued" : "skipped";
    const res = await query(
      `INSERT INTO crawl_frontier (
        run_id, job_id, url, hop, status, discovered_from_job_id,
        company_name, company_slug, location, date_text, salary_raw
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (run_id, job_id) DO NOTHING`,
      [
        runId,
        d.job_id,
        d.url,
        d.hop,
        status,
        d.discovered_from_job_id || null,
        d.company_name || null,
        d.company_slug || null,
        d.location || null,
        d.date_text || null,
        d.salary_raw || null,
      ],
    );
    inserted += res.rowCount ?? 0;
  }
  return inserted;
}

export async function markFrontier(runId: string, jobId: string, status: string): Promise<void> {
  await query(`UPDATE crawl_frontier SET status = $3 WHERE run_id = $1 AND job_id = $2`, [
    runId,
    jobId,
    status,
  ]);
}

export async function popFrontier(
  runId: string,
  maxHops: number,
): Promise<{ job_id: string; url: string; hop: number } | null> {
  const res = await query<{ job_id: string; url: string; hop: number }>(
    `WITH next AS (
       SELECT job_id FROM crawl_frontier
       WHERE run_id = $1 AND status = 'queued' AND hop <= $2
       ORDER BY hop ASC, enqueued_at ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     UPDATE crawl_frontier f
     SET status = 'in_progress'
     FROM next
     WHERE f.run_id = $1 AND f.job_id = next.job_id
     RETURNING f.job_id, f.url, f.hop`,
    [runId, maxHops],
  );
  return res.rows[0] ?? null;
}

export async function queueRemaining(runId: string): Promise<number> {
  const res = await query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM crawl_frontier WHERE run_id = $1 AND status = 'queued'`,
    [runId],
  );
  return Number(res.rows[0]?.n || 0);
}

export async function updateRun(
  runId: string,
  fields: {
    status?: string;
    pages_fetched?: number;
    trigger_run_id?: string;
    fail_reason?: string;
    metadata?: unknown;
    ended?: boolean;
  },
): Promise<void> {
  await query(
    `UPDATE crawl_runs SET
      status = COALESCE($2, status),
      pages_fetched = COALESCE($3, pages_fetched),
      trigger_run_id = COALESCE($4, trigger_run_id),
      fail_reason = COALESCE($5, fail_reason),
      metadata = COALESCE($6::jsonb, metadata),
      ended_at = CASE WHEN $7 THEN now() ELSE ended_at END
     WHERE id = $1`,
    [
      runId,
      fields.status ?? null,
      fields.pages_fetched ?? null,
      fields.trigger_run_id ?? null,
      fields.fail_reason ?? null,
      fields.metadata != null ? JSON.stringify(fields.metadata) : null,
      fields.ended ?? false,
    ],
  );
}

export async function getRun(runId: string) {
  const res = await query<{
    id: string;
    seed_url: string;
    seed_job_id: string | null;
    max_hops: number;
    max_pages: number;
    coffee_every: number;
    status: string;
    pages_fetched: number;
  }>(`SELECT * FROM crawl_runs WHERE id = $1`, [runId]);
  return res.rows[0] ?? null;
}

export async function seedFrontier(runId: string, seedUrl: string, seedJobId: string): Promise<void> {
  await query(
    `INSERT INTO crawl_frontier (run_id, job_id, url, hop, status, discovered_from_job_id)
     VALUES ($1, $2, $3, 0, 'queued', NULL)
     ON CONFLICT (run_id, job_id) DO NOTHING`,
    [runId, seedJobId, seedUrl.split("?")[0]],
  );
}
