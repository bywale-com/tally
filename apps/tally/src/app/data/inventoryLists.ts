/** Inventory lists — saved selections of jobs or companies. */

import seedInventoryLists from "./seedInventoryLists.json";

export type InventoryListKind = "companies" | "jobs";

export type InventoryList = {
  id: string;
  name: string;
  kind: InventoryListKind;
  createdAt: string;
  updatedAt: string;
  /** Record ids from washed inventory. */
  recordIds: string[];
  /** Optional human-readable filter summary when created from filters. */
  filterSummary?: string;
};

const LISTS_STORAGE_KEY = "tally.inventory.lists.v1";

const SEED_LISTS = seedInventoryLists as InventoryList[];

function mergeSeedLists(stored: InventoryList[]): InventoryList[] {
  const byId = new Map(stored.map((l) => [l.id, l]));
  let changed = false;
  for (const seed of SEED_LISTS) {
    const existing = byId.get(seed.id);
    if (
      !existing ||
      existing.name !== seed.name ||
      existing.filterSummary !== seed.filterSummary ||
      existing.recordIds.length !== seed.recordIds.length ||
      existing.recordIds.some((id, i) => id !== seed.recordIds[i])
    ) {
      byId.set(seed.id, seed);
      changed = true;
    }
  }
  if (!changed && stored.length === byId.size) return stored;
  const seedIds = new Set(SEED_LISTS.map((l) => l.id));
  const userRest = stored.filter((l) => !seedIds.has(l.id));
  return [...SEED_LISTS.map((s) => byId.get(s.id)!), ...userRest];
}

export function loadInventoryLists(): InventoryList[] {
  try {
    const raw = localStorage.getItem(LISTS_STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as unknown) : [];
    const lists = Array.isArray(stored) ? (stored as InventoryList[]) : [];
    const merged = mergeSeedLists(lists);
    if (merged !== lists) saveInventoryLists(merged);
    return merged;
  } catch {
    const seeded = mergeSeedLists([]);
    saveInventoryLists(seeded);
    return seeded;
  }
}

export function saveInventoryLists(lists: InventoryList[]): void {
  try {
    localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
  } catch {
    // Quota / private mode
  }
}

export function createInventoryList(input: {
  name: string;
  kind: InventoryListKind;
  recordIds: string[];
  filterSummary?: string;
}): InventoryList {
  const now = new Date().toISOString();
  return {
    id: `list-${Date.now()}`,
    name: input.name.trim() || "Untitled list",
    kind: input.kind,
    createdAt: now,
    updatedAt: now,
    recordIds: [...new Set(input.recordIds)],
    filterSummary: input.filterSummary,
  };
}

export function nextUntitledListName(existing: InventoryList[], kind: InventoryListKind): string {
  const base = kind === "companies" ? "Untitled company list" : "Untitled job list";
  const pattern =
    kind === "companies"
      ? /^Untitled company list( \d+)?$/
      : /^Untitled job list( \d+)?$/;
  const count = existing.filter((l) => l.kind === kind && pattern.test(l.name)).length;
  return count === 0 ? base : `${base} ${count + 1}`;
}

/** Append a list created elsewhere (e.g. Companies → Save as list). */
export function appendInventoryList(list: InventoryList): InventoryList[] {
  const next = [list, ...loadInventoryLists().filter((l) => l.id !== list.id)];
  saveInventoryLists(next);
  return next;
}
