/** Company-level rollups and name-similarity helpers for Inventory Jobs filters. */

import type { WashedJob } from "../components/InventoryPanel";

const LEGAL_SUFFIX_RE =
  /\b(inc|llc|ltd|corp|corporation|co|company|limited)\b\.?/gi;

/** Aligns with `normalize_company_name` in scanner/tally_scanner/wash.py */
export function normalizeCompanyName(name: string): string {
  const s = (name || "").toLowerCase().replace(LEGAL_SUFFIX_RE, " ");
  return s.replace(/[^a-z0-9]/g, "");
}

export type CompanyRollup = {
  key: string;
  displayNames: string[];
  sources: string[];
  jobCount: number;
  linkedInPlusOther: boolean;
  multiSource: boolean;
  nameVariants: boolean;
  fuzzySimilar: boolean;
};

export type CompanyJobIndex = {
  byKey: Map<string, CompanyRollup>;
  /** Normalized company key → jobs belonging to that rollup */
  jobsByKey: Map<string, WashedJob[]>;
  linkedInPlusOtherCount: number;
  multiSourceCount: number;
  nameVariantCount: number;
  fuzzySimilarKeyCount: number;
  fuzzySimilarJobCount: number;
  similarNameCompanyCount: number;
};

function lcsLength(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

/** Matches Python `difflib.SequenceMatcher.ratio()` close enough for name clustering. */
function nameSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  return (2 * lcsLength(a, b)) / (a.length + b.length);
}

function findFuzzySimilarKeys(keys: string[]): Set<string> {
  const flagged = new Set<string>();
  const usable = keys.filter((k) => k.length >= 4);
  const buckets = new Map<string, string[]>();
  for (const k of usable) {
    const prefix = k.slice(0, 3);
    const list = buckets.get(prefix) ?? [];
    list.push(k);
    buckets.set(prefix, list);
  }
  for (const group of buckets.values()) {
    group.sort();
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length && j < i + 40; j++) {
        const a = group[i];
        const b = group[j];
        if (a === b) continue;
        const r = nameSimilarity(a, b);
        if (r >= 0.88 && r < 1) {
          flagged.add(a);
          flagged.add(b);
        }
      }
    }
  }
  return flagged;
}

export function buildCompanyJobIndex(jobs: WashedJob[]): CompanyJobIndex {
  const jobsByKey = new Map<string, WashedJob[]>();
  const rollups = new Map<
    string,
    { displayNames: Set<string>; sources: Set<string>; jobCount: number }
  >();

  for (const job of jobs) {
    const key = normalizeCompanyName(job.company);
    if (!key) continue;
    const bucket = rollups.get(key) ?? {
      displayNames: new Set<string>(),
      sources: new Set<string>(),
      jobCount: 0,
    };
    if (job.company) bucket.displayNames.add(job.company);
    if (job.source) bucket.sources.add(job.source);
    bucket.jobCount += 1;
    rollups.set(key, bucket);

    const list = jobsByKey.get(key) ?? [];
    list.push(job);
    jobsByKey.set(key, list);
  }

  const fuzzyKeys = findFuzzySimilarKeys([...rollups.keys()]);
  const byKey = new Map<string, CompanyRollup>();

  let linkedInPlusOtherCount = 0;
  let multiSourceCount = 0;
  let nameVariantCount = 0;

  for (const [key, bucket] of rollups) {
    const sources = [...bucket.sources].filter(Boolean).sort();
    const linkedInPlusOther =
      sources.includes("linkedin") && sources.some((s) => s !== "linkedin");
    const multiSource = sources.length > 1;
    const nameVariants = bucket.displayNames.size > 1;
    const fuzzySimilar = fuzzyKeys.has(key);

    if (linkedInPlusOther) linkedInPlusOtherCount += 1;
    if (multiSource) multiSourceCount += 1;
    if (nameVariants) nameVariantCount += 1;

    byKey.set(key, {
      key,
      displayNames: [...bucket.displayNames].sort(),
      sources,
      jobCount: bucket.jobCount,
      linkedInPlusOther,
      multiSource,
      nameVariants,
      fuzzySimilar,
    });
  }

  let fuzzySimilarJobCount = 0;
  let similarNameCompanyCount = 0;
  for (const [key, rollup] of byKey) {
    if (rollup.fuzzySimilar) fuzzySimilarJobCount += jobsByKey.get(key)?.length ?? 0;
    if (rollup.nameVariants || rollup.fuzzySimilar) similarNameCompanyCount += 1;
  }

  return {
    byKey,
    jobsByKey,
    linkedInPlusOtherCount,
    multiSourceCount,
    nameVariantCount,
    fuzzySimilarKeyCount: fuzzyKeys.size,
    fuzzySimilarJobCount,
    similarNameCompanyCount,
  };
}

export function companyKeyForJob(job: WashedJob): string {
  return normalizeCompanyName(job.company);
}

export function isSimilarNameFlagged(
  job: WashedJob,
  index: CompanyJobIndex,
): boolean {
  const key = companyKeyForJob(job);
  if (!key) return false;
  const rollup = index.byKey.get(key);
  return Boolean(rollup?.nameVariants || rollup?.fuzzySimilar);
}
