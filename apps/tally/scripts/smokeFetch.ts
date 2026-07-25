/**
 * Quick LinkedIn guest scrape smoke test (no Trigger / DB required).
 * Usage: npx tsx scripts/smokeFetch.ts "https://www.linkedin.com/jobs/view/..."
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fetchGuestPage } from "../src/trigger/crawl/fetchGuestPage";
import { harvestGraphCards, parsePrimaryJob } from "../src/trigger/crawl/parse";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    /* ignore */
  }
}

loadEnv();
const url = process.argv[2];
if (!url) {
  console.error("Pass a LinkedIn jobs/view URL");
  process.exit(1);
}

const result = await fetchGuestPage(url);
console.log({
  ok: result.ok,
  transport: result.transport,
  abnormal: result.abnormal,
  reason: result.abnormal_reason,
  html_len: result.html.length,
});
if (result.ok) {
  const primary = parsePrimaryJob({ html: result.html, url, hop: 0, seedUrl: url });
  const cards = harvestGraphCards(result.html, primary.job_id, 0);
  console.log({
    title: primary.title,
    company: primary.company_name,
    slug: primary.company_slug,
    discoveries: cards.length,
  });
}
