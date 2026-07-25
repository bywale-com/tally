/**
 * Audit furnish holonIds against catalog + f-N convention.
 * Usage: node scripts/auditFurnishHolonIds.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const holons = fs.readFileSync(
  path.join(root, "src/app/register/holons/registerCtHolons.ts"),
  "utf8",
);
const catalog = new Set([...holons.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]));

function isValid(id) {
  if (catalog.has(id)) return true;
  if (/^(bc|worker|guest|op)-ct-f-\d+$/.test(id)) return true;
  if (id === "worker-ct-launched-dot") return true;
  return false;
}

const files = [
  "businessClientFurnish.ts",
  "workerFurnish.ts",
  "guestFurnish.ts",
  "operatorFurnish.ts",
];

for (const f of files) {
  const src = fs.readFileSync(path.join(root, "src/app/register/outcomes", f), "utf8");
  const fromParts = [...src.matchAll(/holonId:\s*"([^"]+)"/g)].map((m) => m[1]);
  const fromArr = [...src.matchAll(/holonIds:\s*\[([^\]]*)\]/g)].flatMap((m) =>
    [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]),
  );
  const all = [...new Set([...fromParts, ...fromArr])];
  const bad = all.filter((id) => !isValid(id));
  console.log(`\n${f}: unique=${all.length} bad=${bad.length}`);
  for (const b of bad) console.log("  BAD", b);
}
