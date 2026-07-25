/**
 * Single fetch seam for guest pages (LinkedIn jobs + companies, and others).
 *
 * Order for LinkedIn:
 *  1) Scanner StealthyFetcher (`SCANNER_URL` /crawl/fetch) — Scrapling Chromium
 *  2) Direct guest GET (+ optional HTTP(S)_PROXY / ALL_PROXY via undici)
 *
 * Non-LinkedIn: Firecrawl first, then direct.
 */

export type FetchGuestResult = {
  ok: boolean;
  statusCode: number;
  html: string;
  abnormal: boolean;
  abnormal_reason: string;
  transport: "stealthy" | "direct" | "proxy" | "firecrawl";
};

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function classifyHtml(
  statusCode: number,
  html: string,
): Omit<FetchGuestResult, "html" | "statusCode" | "transport"> {
  const body = html || "";
  const empty = body.length < 800;
  const hasMarkers =
    /application\/ld\+json|base-card|job-details|Organization|numberOfEmployees/i.test(body);
  // Guest chrome always has "Sign in" / "Join LinkedIn" — only treat as wall when
  // hard authwall markers appear, or soft chrome with no content markers.
  const hardAuthwall =
    /linkedin\.com\/authwall|\/authwall\?|session_redirect=.*authwall|checkpoint\/challenge/i.test(
      body,
    );
  const softAuthChrome = /join linkedin|sign in/i.test(body);
  const authwall = hardAuthwall || (softAuthChrome && !hasMarkers);
  const abnormal =
    statusCode === 0 || statusCode >= 400 || empty || authwall || !hasMarkers;

  let abnormal_reason = "";
  if (abnormal) {
    if (statusCode >= 400) abnormal_reason = `http_${statusCode}`;
    else if (empty) abnormal_reason = "empty_body";
    else if (authwall) abnormal_reason = "authwall";
    else abnormal_reason = "missing_markers";
  }

  return { ok: !abnormal, abnormal, abnormal_reason };
}

function isLinkedIn(url: string): boolean {
  try {
    return /(^|\.)linkedin\.com$/i.test(new URL(url).hostname);
  } catch {
    return /linkedin\.com/i.test(url);
  }
}

function scannerBaseUrl(): string {
  return (
    process.env.SCANNER_URL ||
    process.env.VITE_SCANNER_URL ||
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

async function stealthyFetch(url: string): Promise<FetchGuestResult> {
  const base = scannerBaseUrl();
  try {
    const res = await fetch(`${base}/crawl/fetch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, timeout_ms: 90_000 }),
      signal: AbortSignal.timeout(120_000),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const detail =
        typeof json.detail === "string"
          ? json.detail
          : `scanner_http_${res.status}`;
      return {
        ok: false,
        statusCode: res.status,
        html: "",
        abnormal: true,
        abnormal_reason: detail.slice(0, 200),
        transport: "stealthy",
      };
    }
    const html = typeof json.html === "string" ? json.html : "";
    const statusCode =
      typeof json.status_code === "number" ? json.status_code : res.status;
    const cls = classifyHtml(statusCode, html);
    const err = typeof json.error === "string" ? json.error : "";
    if (!cls.ok && err && !cls.abnormal_reason) {
      return {
        statusCode,
        html,
        transport: "stealthy",
        ok: false,
        abnormal: true,
        abnormal_reason: err.slice(0, 200),
      };
    }
    return { statusCode, html, transport: "stealthy", ...cls };
  } catch (e) {
    return {
      ok: false,
      statusCode: 0,
      html: "",
      abnormal: true,
      abnormal_reason: e instanceof Error ? e.message : "stealthy_fetch_error",
      transport: "stealthy",
    };
  }
}

async function directFetch(url: string): Promise<FetchGuestResult> {
  const proxyUrl = (
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.ALL_PROXY ||
    ""
  ).trim();

  let dispatcher: unknown;
  if (proxyUrl) {
    try {
      const { ProxyAgent } = await import("undici");
      dispatcher = new ProxyAgent(proxyUrl);
    } catch {
      /* undici optional — continue without proxy */
    }
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      // @ts-expect-error undici dispatcher when proxy set
      dispatcher,
    });
    const html = await res.text();
    const cls = classifyHtml(res.status, html);
    return {
      statusCode: res.status,
      html,
      transport: proxyUrl ? "proxy" : "direct",
      ...cls,
    };
  } catch (e) {
    return {
      ok: false,
      statusCode: 0,
      html: "",
      abnormal: true,
      abnormal_reason: e instanceof Error ? e.message : "fetch_error",
      transport: proxyUrl ? "proxy" : "direct",
    };
  }
}

function pickHtml(payload: Record<string, unknown>): string {
  if (typeof payload.html === "string" && payload.html.length > 0) return payload.html;
  const data = payload.data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.html === "string" && d.html.length > 0) return d.html;
    if (typeof d.rawHtml === "string" && d.rawHtml.length > 0) return d.rawHtml;
  }
  return "";
}

async function firecrawlFetch(url: string): Promise<FetchGuestResult> {
  const key = (process.env.FIRECRAWL_API_KEY || "").trim();
  if (!key) {
    return {
      ok: false,
      statusCode: 0,
      html: "",
      abnormal: true,
      abnormal_reason: "missing_firecrawl_key",
      transport: "firecrawl",
    };
  }

  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["rawHtml", "html"],
        onlyMainContent: false,
        timeout: 45000,
      }),
    });
    const statusCode = res.status;
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const err = typeof json.error === "string" ? json.error : `firecrawl_http_${statusCode}`;
      return {
        ok: false,
        statusCode,
        html: "",
        abnormal: true,
        abnormal_reason: err.slice(0, 200),
        transport: "firecrawl",
      };
    }
    const html = pickHtml(json);
    const cls = classifyHtml(200, html);
    return { statusCode: 200, html, transport: "firecrawl", ...cls };
  } catch (e) {
    return {
      ok: false,
      statusCode: 0,
      html: "",
      abnormal: true,
      abnormal_reason: e instanceof Error ? e.message : "fetch_error",
      transport: "firecrawl",
    };
  }
}

export async function fetchGuestPage(url: string): Promise<FetchGuestResult> {
  // LinkedIn is blocked by Firecrawl policy — StealthyFetcher via scanner, then direct.
  if (isLinkedIn(url)) {
    const viaStealth = await stealthyFetch(url);
    if (viaStealth.ok) return viaStealth;
    const viaDirect = await directFetch(url);
    if (viaDirect.ok) return viaDirect;
    // Prefer stealthy’s richer failure when direct also fails
    return viaStealth.html.length >= viaDirect.html.length ? viaStealth : viaDirect;
  }
  const viaFc = await firecrawlFetch(url);
  if (viaFc.ok) return viaFc;
  return directFetch(url);
}

export function classifyFixtureHtml(html: string): FetchGuestResult {
  const cls = classifyHtml(200, html);
  return { statusCode: 200, html, transport: "direct", ...cls };
}
