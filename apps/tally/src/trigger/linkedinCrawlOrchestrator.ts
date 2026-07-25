import { logger, metadata, task, wait } from "@trigger.dev/sdk";
import { crawlPageTask } from "./crawlPage";
import { seedFrontier, updateRun } from "./crawl/store";
import type { CrawlRunMetadata, EnrichmentRow, OrchestratorPayload } from "./crawl/types";
import { jobIdFromUrl, jitter } from "./crawl/types";

async function publishMeta(meta: CrawlRunMetadata) {
  metadata.set("phase", meta.phase);
  metadata.set("crawlRunId", meta.crawlRunId);
  metadata.set("mode", meta.mode);
  metadata.set("rows", meta.rows);
  if (meta.wait) metadata.set("wait", meta.wait);
  else metadata.set("wait", null);
  await updateRun(meta.crawlRunId, { metadata: meta });
}

/**
 * LinkedIn job URL extract: one scrape per seed URL.
 * Similar job cards are stored as JSON on the row — never followed.
 */
export const linkedinCrawlOrchestrator = task({
  id: "linkedin-crawl-orchestrator",
  maxDuration: 3600,
  retry: { maxAttempts: 1 },
  run: async (payload: OrchestratorPayload) => {
    const { runId, seedUrl } = payload;
    const cleanUrl = seedUrl.split("?")[0];
    const seedJobId = jobIdFromUrl(cleanUrl) || `seed-${Date.now()}`;

    let rows: EnrichmentRow[] = [
      { url: cleanUrl, job_id: seedJobId, status: "pending" },
    ];

    await publishMeta({
      phase: "planning",
      crawlRunId: runId,
      mode: "job_url_extract",
      rows,
    });

    await seedFrontier(runId, cleanUrl, seedJobId);
    await updateRun(runId, { status: "running" });

    rows = rows.map((r) =>
      r.job_id === seedJobId ? { ...r, status: "running" } : r,
    );
    await publishMeta({
      phase: "enriching",
      crawlRunId: runId,
      mode: "job_url_extract",
      rows,
    });

    const pagePayload = {
      runId,
      url: cleanUrl,
      hop: 0,
      jobId: seedJobId,
      followGraph: false,
      enrichCompany: false,
    };

    let result = await crawlPageTask.triggerAndWait(pagePayload);
    let pageOut = result.ok ? result.output : null;

    if (!pageOut?.ok) {
      const backoffSec = 120;
      const until = new Date(Date.now() + backoffSec * 1000).toISOString();
      await publishMeta({
        phase: "waiting",
        crawlRunId: runId,
        mode: "job_url_extract",
        rows,
        wait: { kind: "backoff", seconds: backoffSec, until },
      });
      await updateRun(runId, { status: "waiting" });
      await wait.for({ seconds: backoffSec });

      result = await crawlPageTask.triggerAndWait(pagePayload, {
        idempotencyKey: `crawl-page:${runId}:${seedJobId}:retry`,
      });
      pageOut = result.ok ? result.output : null;
    }

    if (!pageOut?.ok) {
      const fail_reason = pageOut?.abnormal_reason || "page_failed_after_backoff";
      rows = rows.map((r) =>
        r.job_id === seedJobId
          ? { ...r, status: "failed", error: fail_reason }
          : r,
      );
      await publishMeta({
        phase: "failed",
        crawlRunId: runId,
        mode: "job_url_extract",
        rows,
      });
      await updateRun(runId, { status: "failed", fail_reason, pages_fetched: 0, ended: true });
      return { ok: false, reason: fail_reason };
    }

    const filled = pageOut.row;
    rows = rows.map((r) =>
      r.job_id === seedJobId
        ? {
            ...(filled || r),
            url: cleanUrl,
            job_id: pageOut.job_id || seedJobId,
            status: "done",
          }
        : r,
    );

    await updateRun(runId, { pages_fetched: 1, status: "running" });

    const baseline = Math.max(2, Math.round(jitter(2, 5)));
    const until = new Date(Date.now() + baseline * 1000).toISOString();
    await publishMeta({
      phase: "waiting",
      crawlRunId: runId,
      mode: "job_url_extract",
      rows,
      wait: { kind: "baseline", seconds: baseline, until },
    });
    await updateRun(runId, { status: "waiting" });
    await wait.for({ seconds: baseline });

    await publishMeta({
      phase: "done",
      crawlRunId: runId,
      mode: "job_url_extract",
      rows,
    });
    await updateRun(runId, { status: "done", pages_fetched: 1, ended: true });
    logger.info("Job URL extract done", { runId, jobId: seedJobId });
    return { ok: true, pages_fetched: 1 };
  },
});
