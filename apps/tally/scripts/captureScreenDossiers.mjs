/**
 * Capture living CT screens → docs/register/screen-dossiers/{persona}/screenshots/
 * node scripts/captureScreenDossiers.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.resolve(ROOT, "../../docs/register/screen-dossiers");
const BASE = process.env.TALLY_URL ?? "http://localhost:5173";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

async function shot(page, persona, id) {
  const dir = path.join(OUT, persona, "screenshots");
  ensureDir(dir);
  const file = path.join(dir, `${id}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("✓", persona, id);
}

async function unlock(page) {
  await page.goto(`${BASE}/register`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(400);
  const pw = page.getByPlaceholder("Enter password");
  if (await pw.isVisible().catch(() => false)) {
    await pw.fill("register");
    await page.getByRole("button", { name: "Enter" }).click();
    await page.getByRole("button", { name: "Lock" }).waitFor({ timeout: 15000 });
  }
}

/** outcomeIndex: 0 Operator, 1 Guest, 2 BC, 3 Worker */
async function openCt(page, outcomeIndex) {
  const cores = page.getByRole("button", { name: "Outcome 0 — Core Outcome" });
  await cores.nth(outcomeIndex).click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "Click-through" }).click();
  await page.waitForTimeout(600);
}

async function clickText(page, name, opts = {}) {
  const loc = page.getByRole("button", { name, exact: opts.exact ?? false });
  await loc.first().click({ timeout: opts.timeout ?? 10000 });
  await page.waitForTimeout(opts.wait ?? 350);
}

async function captureOperator(page) {
  const p = "operator";
  await unlock(page);
  await openCt(page, 0);

  await shot(page, p, "01-campaigns-empty");

  // Create — LoFiButton
  await page.locator("button", { hasText: /^Create$/ }).first().click();
  await page.waitForTimeout(400);
  await shot(page, p, "02-basics-new-campaign");

  await page.locator("input").first().fill("Northwind outreach");
  await page.locator("button", { hasText: /^Create$/ }).last().click();
  await page.waitForTimeout(1200);
  await shot(page, p, "03-campaign-company-pick");

  await page.locator("input").first().fill("Acme");
  await page.waitForTimeout(400);
  await page.getByText("Acme Robotics").click();
  await page.waitForTimeout(300);
  await page.locator("button", { hasText: /^Evaluate$/ }).click();
  await page.waitForTimeout(500);
  await shot(page, p, "04-evaluating");
  await page.waitForTimeout(1500);
  await shot(page, p, "05-dossier");

  // Jump Off call — seeds enrich path
  await page.locator("button", { hasText: /^Off call$/ }).click();
  await page.waitForTimeout(800);
  await shot(page, p, "06-enriching-or-firm-list");
  // Wait for enriching to finish if running
  await page.waitForTimeout(2000);
  const firmReady = page.getByText("Firmographics");
  await firmReady.waitFor({ timeout: 15000 }).catch(() => {});
  await shot(page, p, "07-firm-list");

  await page.locator("button", { hasText: /^Demo$/ }).click();
  await page.waitForTimeout(800);
  await shot(page, p, "08-demo-seed");

  // Prefer Deploy from firm-list; Demo may land mid-flow
  let deploy = page.locator("button", { hasText: /^Deploy$/ });
  if (!(await deploy.isVisible().catch(() => false))) {
    // try opening campaign / firm list via STAGE again
    await page.locator("button", { hasText: /^Off call$/ }).click();
    await page.waitForTimeout(1500);
    deploy = page.locator("button", { hasText: /^Deploy$/ });
  }
  if (await deploy.isVisible().catch(() => false)) {
    await deploy.click();
    await page.waitForTimeout(400);
    await shot(page, p, "09-deploy-choice");

    await page.locator("button", { hasText: /Invite guest/i }).click();
    await page.waitForTimeout(400);
    await shot(page, p, "10-invite-guest");

    await page.locator("button", { hasText: /Send invite/i }).click();
    await page.waitForTimeout(500);
    await shot(page, p, "11-campaigns-waiting-fund");

    const show = page.getByText("Show client accept + fund");
    if (await show.isVisible().catch(() => false)) {
      await show.click();
      await page.waitForTimeout(400);
      await shot(page, p, "12-client-fund");
      await page.locator("button", { hasText: /Accept/ }).filter({ hasText: /fund/i }).click();
      await page.waitForTimeout(500);
      await shot(page, p, "13-running");
    }
  }

  // invite existing via Demo seed + Deploy
  await page.locator("button", { hasText: /^Demo$/ }).click();
  await page.waitForTimeout(600);
  if (await page.locator("button", { hasText: /^Deploy$/ }).isVisible().catch(() => false)) {
    await page.locator("button", { hasText: /^Deploy$/ }).click();
    await page.waitForTimeout(300);
    if (await page.locator("button", { hasText: /Invite existing/i }).isVisible().catch(() => false)) {
      await page.locator("button", { hasText: /Invite existing/i }).click();
      await page.waitForTimeout(400);
      await shot(page, p, "14-invite-existing");
    }
  }
}

async function captureGuest(page) {
  const p = "guest";
  await unlock(page);
  await openCt(page, 1);
  await shot(page, p, "01-invite-campaigns");

  await page.locator("button", { hasText: /^Fund$/ }).first().click();
  await page.waitForTimeout(500);
  await shot(page, p, "02-fund");

  await page.locator("button", { hasText: /^Fund$/ }).last().click();
  await page.waitForTimeout(600);
  await shot(page, p, "03-receipt");

  await page.locator("button", { hasText: /^Meetings$/ }).click();
  await page.waitForTimeout(350);
  await shot(page, p, "04-meetings-empty");

  await page.locator("button", { hasText: /^Escrow$/ }).click();
  await page.waitForTimeout(350);
  await shot(page, p, "05-escrow");

  // Lapsed: EVAL Invite → More → Decline
  await page.locator("button", { hasText: /^Invite$/ }).click().catch(() => {});
  await page.waitForTimeout(300);
  await page.locator("button", { hasText: /^Campaigns$/ }).click().catch(() => {});
  await page.waitForTimeout(200);
  await page.locator("button", { hasText: /^More$/ }).first().click().catch(() => {});
  await page.waitForTimeout(250);
  await page.getByText("Decline", { exact: true }).click().catch(() => {});
  await page.waitForTimeout(300);
  await page.locator("button", { hasText: /^Decline$/ }).last().click().catch(() => {});
  await page.waitForTimeout(500);
  await shot(page, p, "06-lapsed");
}

async function captureClient(page) {
  const p = "business-client";
  await unlock(page);
  await openCt(page, 2);
  await shot(page, p, "01-campaigns");

  await page.locator("button", { hasText: /^Meetings$/ }).click();
  await page.waitForTimeout(400);
  await shot(page, p, "02-meetings");

  // open first meeting-ish row
  const m = page.locator("button").filter({ hasText: /#|Released|Pending|Upcoming|Director|VP/i });
  if ((await m.count()) > 0) {
    await m.first().click();
    await page.waitForTimeout(500);
    await shot(page, p, "03-meeting-sheet");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
  }

  await page.locator("button", { hasText: /^Escrow$/ }).click();
  await page.waitForTimeout(400);
  await shot(page, p, "04-escrow");
}

async function captureWorker(page) {
  const p = "worker";
  await unlock(page);
  await openCt(page, 3);
  await shot(page, p, "01-available");

  await page.locator("button", { hasText: /Pick up/i }).first().click();
  await page.waitForTimeout(450);
  await shot(page, p, "02-claimed");

  await page.locator("button", { hasText: /^Begin$/ }).click();
  await page.waitForTimeout(450);
  await shot(page, p, "03-working");

  await page.locator("button", { hasText: /Log a meeting/i }).click();
  await page.waitForTimeout(450);
  await shot(page, p, "04-log-meeting");

  await page.locator("button", { hasText: /Submit meeting/i }).click();
  await page.waitForTimeout(500);
  await shot(page, p, "05-pipeline");
}

async function main() {
  ensureDir(OUT);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(20000);
  try {
    await captureOperator(page);
    await captureGuest(page);
    await captureClient(page);
    await captureWorker(page);
    console.log("done");
  } catch (e) {
    console.error(e);
    await shot(page, "_debug", "failure");
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
