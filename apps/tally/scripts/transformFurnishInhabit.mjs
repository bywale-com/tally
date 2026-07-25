/**
 * Codemod: PersonaFurnishItem → narrativeParts + focusHolonId (info-panel inhabit).
 * Preserves label + section. Idempotent for items that already have focusHolonId.
 *
 * Usage: node scripts/transformFurnishInhabit.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outcomesDir = path.join(__dirname, "../src/app/register/outcomes");

const HOLON_LABELS = {
  "bc-ct-desk": "Business Client desk",
  "bc-ct-sidebar": "Client nav",
  "bc-ct-campaigns": "Campaigns",
  "bc-ct-vessel-row": "Vessel row",
  "bc-ct-meetings": "Meetings",
  "bc-ct-meeting-row": "Meeting row",
  "bc-ct-meeting-sheet": "Meeting sheet",
  "bc-ct-escrow": "Escrow",
  "bc-ct-reclaim": "Reclaim unspent",
  "bc-ct-details": "Details sheet",
  "bc-ct-firms": "Firms sheet",
  "bc-ct-talk": "Talk tracks",
  "bc-ct-alerts": "Alerts",
  "bc-ct-stop": "Stop campaign",
  "bc-ct-history": "Vessel history",
  "bc-ct-operator-request": "Request Operator",
  "bc-ct-notif": "Notification center",
  "bc-ct-command": "Command palette",
  "guest-ct-desk": "Guest vessel",
  "guest-ct-sidebar": "Guest nav",
  "guest-ct-invite": "Invite campaigns",
  "guest-ct-fund": "Fund escrow",
  "guest-ct-converted": "Converted receipt",
  "guest-ct-meetings": "Meetings",
  "guest-ct-escrow": "Escrow",
  "guest-ct-terms": "Terms sheet",
  "guest-ct-details": "Details sheet",
  "guest-ct-firms": "Firms sheet",
  "worker-ct-desk": "Worker desk",
  "worker-ct-available": "Available queue",
  "worker-ct-vessel-card": "Available vessel",
  "worker-ct-launched-dot": "Launched status",
  "worker-ct-claimed": "Begin vessel",
  "worker-ct-active": "Active manage",
  "worker-ct-log": "Log meeting",
  "worker-ct-company-search": "Company search",
  "worker-ct-pipeline": "Pipeline",
  "worker-ct-meeting-row": "Pipeline meeting",
  "worker-ct-details": "Details sheet",
  "worker-ct-firms": "Firms sheet",
  "worker-ct-packet": "Packet peek",
  "op-ct-desk": "Operator desk",
  "op-ct-campaigns": "Campaigns list",
  "op-ct-campaign-row": "Campaign row",
  "op-ct-create": "Create campaign",
  "op-ct-evaluate": "Evaluate dossier",
  "op-ct-company-search": "Company search",
  "op-ct-enrich": "Enrich firm list",
  "op-ct-deploy": "Deploy / invite",
  "op-ct-running": "Running campaign",
  "op-ct-invite": "Invite sheet",
};

const FILES = [
  {
    file: "workerFurnish.ts",
    persona: "worker",
    actor: "Worker",
    importHint: 'import type { PersonaFurnishItem } from "./personaFurnish";',
    importReplace: `import {
  furnishFocusId,
  type PersonaFurnishItem,
} from "./personaFurnish";`,
  },
  {
    file: "businessClientFurnish.ts",
    persona: "bc",
    actor: "Client",
    importHint: 'import type { PersonaFurnishItem } from "./personaFurnish";',
    importReplace: `import {
  furnishFocusId,
  type PersonaFurnishItem,
} from "./personaFurnish";`,
  },
  {
    file: "guestFurnish.ts",
    persona: "guest",
    actor: "Guest",
    importHint: 'import type { PersonaFurnishItem } from "./personaFurnish";',
    importReplace: `import {
  furnishFocusId,
  type PersonaFurnishItem,
} from "./personaFurnish";`,
  },
  {
    file: "operatorFurnish.ts",
    persona: "op",
    actor: "Operator",
    importHint: 'import type { PersonaFurnishItem } from "./personaFurnish";',
    importReplace: `import {
  furnishFocusId,
  type PersonaFurnishItem,
} from "./personaFurnish";`,
  },
];

function stripHyphenNoise(s) {
  return s
    .replace(/\u2014/g, ". ")
    .replace(/\u2013/g, " ")
    .replace(/ -- /g, ". ")
    .replace(/ - /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMd(s) {
  return s.replace(/\*\*/g, "").replace(/`/g, "");
}

function focusPhrase(label) {
  let s = stripMd(label);
  s = s.replace(/^Quiet\s+/i, "");
  s = s.replace(/\s*\(.*\)\s*$/, "");
  s = s.replace(/\s*—.*$/, "");
  s = s.replace(/\s*–.*$/, "");
  if (s.length > 56) s = s.slice(0, 53).trim() + "…";
  return stripHyphenNoise(s);
}

function extractStringProp(block, key) {
  const re = new RegExp(`${key}:\\s*([\\\`'"])([\\s\\S]*?)\\1`, "m");
  const m = block.match(re);
  return m ? m[2] : null;
}

function extractN(block) {
  const m = block.match(/\bn:\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

function extractHolonIds(block) {
  const m = block.match(/holonIds:\s*\[([^\]]*)\]/);
  if (!m) return [];
  const ids = [];
  const re = /([A-Z_]+(?:\.[A-Za-z0-9_]+)*\.id)|"([^"]+)"|'([^']+)'/g;
  let x;
  while ((x = re.exec(m[1]))) {
    if (x[2] || x[3]) ids.push(x[2] || x[3]);
    else if (x[1]) {
      // BC_CT.campaigns.id → resolve via known map after eval-like replace
      const key = x[1]
        .replace(/^BC_CT\./, "bc-ct-")
        .replace(/^GUEST_CT\./, "guest-ct-")
        .replace(/^WORKER_CT\./, "worker-ct-")
        .replace(/^OP_CT\./, "op-ct-")
        .replace(/\.id$/, "")
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/_/g, "-");
      // Map camelCase property names to catalog ids
      const PROP_TO_ID = {
        "bc-ct-desk": "bc-ct-desk",
        "bc-ct-sidebar": "bc-ct-sidebar",
        "bc-ct-campaigns": "bc-ct-campaigns",
        "bc-ct-vessel-row": "bc-ct-vessel-row",
        "bc-ct-vesselrow": "bc-ct-vessel-row",
        "bc-ct-meetings": "bc-ct-meetings",
        "bc-ct-meeting-row": "bc-ct-meeting-row",
        "bc-ct-meetingrow": "bc-ct-meeting-row",
        "bc-ct-meeting-sheet": "bc-ct-meeting-sheet",
        "bc-ct-meetingsheet": "bc-ct-meeting-sheet",
        "bc-ct-escrow": "bc-ct-escrow",
        "bc-ct-reclaim": "bc-ct-reclaim",
        "bc-ct-details": "bc-ct-details",
        "bc-ct-detailsdoor": "bc-ct-details",
        "bc-ct-firms": "bc-ct-firms",
        "bc-ct-firmsdoor": "bc-ct-firms",
        "bc-ct-talk": "bc-ct-talk",
        "bc-ct-talkdoor": "bc-ct-talk",
        "bc-ct-alerts": "bc-ct-alerts",
        "bc-ct-alertsdoor": "bc-ct-alerts",
        "bc-ct-stop": "bc-ct-stop",
        "bc-ct-stopdoor": "bc-ct-stop",
        "bc-ct-history": "bc-ct-history",
        "bc-ct-historydoor": "bc-ct-history",
        "bc-ct-operator-request": "bc-ct-operator-request",
        "bc-ct-operatorrequest": "bc-ct-operator-request",
        "bc-ct-notif": "bc-ct-notif",
        "bc-ct-command": "bc-ct-command",
        "guest-ct-desk": "guest-ct-desk",
        "guest-ct-sidebar": "guest-ct-sidebar",
        "guest-ct-invite": "guest-ct-invite",
        "guest-ct-fund": "guest-ct-fund",
        "guest-ct-converted": "guest-ct-converted",
        "guest-ct-meetings": "guest-ct-meetings",
        "guest-ct-escrow": "guest-ct-escrow",
        "guest-ct-terms": "guest-ct-terms",
        "guest-ct-details": "guest-ct-details",
        "guest-ct-firms": "guest-ct-firms",
        "worker-ct-desk": "worker-ct-desk",
        "worker-ct-available": "worker-ct-available",
        "worker-ct-vessel-card": "worker-ct-vessel-card",
        "worker-ct-vesselcard": "worker-ct-vessel-card",
        "worker-ct-launched-dot": "worker-ct-launched-dot",
        "worker-ct-launcheddot": "worker-ct-launched-dot",
        "worker-ct-claimed": "worker-ct-claimed",
        "worker-ct-active": "worker-ct-active",
        "worker-ct-log": "worker-ct-log",
        "worker-ct-company-search": "worker-ct-company-search",
        "worker-ct-companysearch": "worker-ct-company-search",
        "worker-ct-pipeline": "worker-ct-pipeline",
        "worker-ct-meeting-row": "worker-ct-meeting-row",
        "worker-ct-meetingrow": "worker-ct-meeting-row",
        "worker-ct-details": "worker-ct-details",
        "worker-ct-firms": "worker-ct-firms",
        "worker-ct-packet": "worker-ct-packet",
        "op-ct-desk": "op-ct-desk",
        "op-ct-campaigns": "op-ct-campaigns",
        "op-ct-campaign-row": "op-ct-campaign-row",
        "op-ct-campaignrow": "op-ct-campaign-row",
        "op-ct-create": "op-ct-create",
        "op-ct-evaluate": "op-ct-evaluate",
        "op-ct-company-search": "op-ct-company-search",
        "op-ct-companysearch": "op-ct-company-search",
        "op-ct-enrich": "op-ct-enrich",
        "op-ct-deploy": "op-ct-deploy",
        "op-ct-running": "op-ct-running",
        "op-ct-invite": "op-ct-invite",
      };
      ids.push(PROP_TO_ID[key] || key);
    }
  }
  return [...new Set(ids)];
}

function buildParts(actor, contextIds, focusId, focusLabel, narrative) {
  const parts = [];
  const ctx = contextIds.filter((id) => id && id !== focusId);
  if (ctx.length === 0) {
    const body = stripHyphenNoise(stripMd(narrative || `sees ${focusLabel}`));
    parts.push({ text: `${actor} ` });
    // Keep body plain if it already mentions everything; still attach focus click
    parts.push({ text: "finds " });
    parts.push({ text: focusLabel, holonId: focusId });
    if (!body.toLowerCase().includes(focusLabel.toLowerCase().slice(0, 12))) {
      parts.push({ text: `. ${body}` });
    } else {
      parts.push({ text: "." });
    }
    return parts;
  }

  parts.push({ text: `${actor} is on ` });
  ctx.forEach((id, i) => {
    if (i > 0) parts.push({ text: i === ctx.length - 1 ? " and " : ", " });
    parts.push({ text: HOLON_LABELS[id] || id, holonId: id });
  });
  parts.push({ text: " and finds " });
  parts.push({ text: focusLabel, holonId: focusId });
  parts.push({ text: "." });
  return parts;
}

function partsToTs(parts, indent) {
  const lines = parts.map((p) => {
    if (p.holonId) {
      return `${indent}  { text: ${JSON.stringify(p.text)}, holonId: ${JSON.stringify(p.holonId)} },`;
    }
    return `${indent}  { text: ${JSON.stringify(p.text)} },`;
  });
  return `${indent}narrativeParts: [\n${lines.join("\n")}\n${indent}],`;
}

function transformItemBlock(block, persona) {
  if (/focusHolonId:/.test(block) && /narrativeParts:/.test(block)) {
    return block; // already done (e.g. worker-f-1)
  }

  const n = extractN(block);
  if (n == null) return block;

  const label = extractStringProp(block, "label");
  if (!label) return block;

  const narrative =
    extractStringProp(block, "narrative") ||
    extractStringProp(block, "label") ||
    "";
  const contextIds = extractHolonIds(block);
  const focusId =
    persona === "worker" && n === 1
      ? "worker-ct-launched-dot"
      : `${persona}-ct-f-${n}`;
  const focusLabel = persona === "worker" && n === 1 ? "launched status" : focusPhrase(label);
  const actor =
    persona === "worker"
      ? "Worker"
      : persona === "bc"
        ? "Client"
        : persona === "guest"
          ? "Guest"
          : "Operator";

  const parts = buildParts(actor, contextIds, focusId, focusLabel, narrative);
  const indentMatch = block.match(/\n(\s+)id:/);
  const indent = indentMatch ? indentMatch[1] : "    ";

  let next = block;

  // Remove legacy narrative field (single or multi-line)
  next = next.replace(/\n\s*narrative:\s*(?:`[\s\S]*?`|'(?:\\'|[^'])*'|"(?:\\"|[^"])*"),?/, "");

  // Replace or insert holonIds / focusHolonId / narrativeParts before status
  next = next.replace(/\n\s*holonIds:\s*\[[^\]]*\],?/, "");
  next = next.replace(/\n\s*focusHolonId:\s*[^,\n]+,?/, "");
  next = next.replace(/\n\s*narrativeParts:\s*\[[\s\S]*?\],/, "");

  const injection = `
${partsToTs(parts, indent)}
${indent}focusHolonId: ${persona === "worker" && n === 1 ? JSON.stringify(focusId) : `furnishFocusId("${persona}", ${n})`},
${indent}holonIds: [${JSON.stringify(focusId)}],`;

  if (/\n\s*status:/.test(next)) {
    next = next.replace(/\n(\s*)status:/, `${injection}\n$1status:`);
  } else {
    next = next.replace(/\n(\s*)\},?\s*$/, `${injection}\n$1}`);
  }

  return next;
}

function transformFile(cfg) {
  const fp = path.join(outcomesDir, cfg.file);
  let src = fs.readFileSync(fp, "utf8");

  if (!src.includes("furnishFocusId")) {
    if (src.includes(cfg.importHint)) {
      src = src.replace(cfg.importHint, cfg.importReplace);
    } else if (src.includes('from "./personaFurnish"')) {
      src = src.replace(
        /import type \{ PersonaFurnishItem \} from "\.\/personaFurnish";/,
        cfg.importReplace,
      );
      src = src.replace(
        /import \{ ([^}]+) \} from "\.\/personaFurnish";/,
        (m, inner) => {
          if (inner.includes("furnishFocusId")) return m;
          return `import {\n  furnishFocusId,\n  ${inner.trim()}\n} from "./personaFurnish";`;
        },
      );
    }
  }

  // Split on top-level object entries starting with id: "…-f-
  const chunks = [];
  const re = /(\{\s*\n\s*id:\s*"(?:worker|bc|guest|op)-f-\d+"[\s\S]*?\n\s*\},?)/g;
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    chunks.push(src.slice(last, m.index));
    chunks.push(transformItemBlock(m[1], cfg.persona));
    last = m.index + m[1].length;
  }
  chunks.push(src.slice(last));
  const out = chunks.join("");
  fs.writeFileSync(fp, out);
  console.log("updated", cfg.file);
}

for (const cfg of FILES) transformFile(cfg);
console.log("done");
