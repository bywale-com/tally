/**
 * Transform Can'ts: how → howParts + focusHolonId (Furnish-style inhabit).
 * Preserves cant titles. Usage: node scripts/transformCantHowParts.mjs
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

const PROP_TO_ID = {
  "BC_CT.desk.id": "bc-ct-desk",
  "BC_CT.sidebar.id": "bc-ct-sidebar",
  "BC_CT.campaigns.id": "bc-ct-campaigns",
  "BC_CT.vesselRow.id": "bc-ct-vessel-row",
  "BC_CT.meetings.id": "bc-ct-meetings",
  "BC_CT.meetingRow.id": "bc-ct-meeting-row",
  "BC_CT.meetingSheet.id": "bc-ct-meeting-sheet",
  "BC_CT.escrow.id": "bc-ct-escrow",
  "BC_CT.reclaim.id": "bc-ct-reclaim",
  "BC_CT.detailsDoor.id": "bc-ct-details",
  "BC_CT.firmsDoor.id": "bc-ct-firms",
  "BC_CT.talkDoor.id": "bc-ct-talk",
  "BC_CT.alertsDoor.id": "bc-ct-alerts",
  "BC_CT.stopDoor.id": "bc-ct-stop",
  "BC_CT.historyDoor.id": "bc-ct-history",
  "BC_CT.operatorRequest.id": "bc-ct-operator-request",
  "BC_CT.notif.id": "bc-ct-notif",
  "BC_CT.command.id": "bc-ct-command",
  "GUEST_CT.desk.id": "guest-ct-desk",
  "GUEST_CT.sidebar.id": "guest-ct-sidebar",
  "GUEST_CT.invite.id": "guest-ct-invite",
  "GUEST_CT.fund.id": "guest-ct-fund",
  "GUEST_CT.converted.id": "guest-ct-converted",
  "GUEST_CT.meetings.id": "guest-ct-meetings",
  "GUEST_CT.escrow.id": "guest-ct-escrow",
  "GUEST_CT.terms.id": "guest-ct-terms",
  "GUEST_CT.details.id": "guest-ct-details",
  "GUEST_CT.firms.id": "guest-ct-firms",
  "WORKER_CT.desk.id": "worker-ct-desk",
  "WORKER_CT.available.id": "worker-ct-available",
  "WORKER_CT.vesselCard.id": "worker-ct-vessel-card",
  "WORKER_CT.launchedDot.id": "worker-ct-launched-dot",
  "WORKER_CT.claimed.id": "worker-ct-claimed",
  "WORKER_CT.active.id": "worker-ct-active",
  "WORKER_CT.log.id": "worker-ct-log",
  "WORKER_CT.companySearch.id": "worker-ct-company-search",
  "WORKER_CT.pipeline.id": "worker-ct-pipeline",
  "WORKER_CT.meetingRow.id": "worker-ct-meeting-row",
  "WORKER_CT.details.id": "worker-ct-details",
  "WORKER_CT.firms.id": "worker-ct-firms",
  "WORKER_CT.packet.id": "worker-ct-packet",
  "OP_CT.desk.id": "op-ct-desk",
  "OP_CT.campaigns.id": "op-ct-campaigns",
  "OP_CT.campaignRow.id": "op-ct-campaign-row",
  "OP_CT.create.id": "op-ct-create",
  "OP_CT.evaluate.id": "op-ct-evaluate",
  "OP_CT.companySearch.id": "op-ct-company-search",
  "OP_CT.enrich.id": "op-ct-enrich",
  "OP_CT.deploy.id": "op-ct-deploy",
  "OP_CT.running.id": "op-ct-running",
  "OP_CT.invite.id": "op-ct-invite",
};

const FILES = [
  { file: "workerObstacles.ts", actor: "Worker" },
  { file: "businessClientObstacles.ts", actor: "Client" },
  { file: "nonBusinessClientObstacles.ts", actor: "Guest" },
  { file: "operatorObstacles.ts", actor: "Operator" },
];

function stripNoise(s) {
  return s
    .replace(/\u2014/g, ". ")
    .replace(/\u2013/g, " ")
    .replace(/ -- /g, ". ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractHow(block) {
  const m = block.match(/how:\s*(`[\s\S]*?`|'(?:\\'|[^'])*'|"(?:\\"|[^"])*")/);
  if (!m) return "";
  return m[1].slice(1, -1);
}

function extractHolonIds(block) {
  const m = block.match(/holonIds:\s*\[([^\]]*)\]/);
  if (!m) return [];
  const ids = [];
  const re = /([A-Z_]+(?:\.[A-Za-z0-9_]+)+\.id)|"([^"]+)"/g;
  let x;
  while ((x = re.exec(m[1]))) {
    if (x[2]) ids.push(x[2]);
    else if (x[1] && PROP_TO_ID[x[1]]) ids.push(PROP_TO_ID[x[1]]);
  }
  return [...new Set(ids)];
}

function buildParts(actor, ids, how) {
  const focusId = ids[ids.length - 1] || ids[0];
  const ctx = ids.filter((id) => id !== focusId);
  const focusLabel = HOLON_LABELS[focusId] || focusId || "the path";
  const parts = [];
  if (ctx.length === 0) {
    parts.push({ text: `${actor} finds ` });
    parts.push({ text: focusLabel, holonId: focusId });
    parts.push({ text: "." });
    return { parts, focusId };
  }
  if (ctx.length === 1) {
    parts.push({ text: `${actor} opens ` });
    parts.push({ text: HOLON_LABELS[ctx[0]] || ctx[0], holonId: ctx[0] });
    parts.push({ text: " and finds " });
    parts.push({ text: focusLabel, holonId: focusId });
    parts.push({ text: "." });
  } else if (ctx.length === 2) {
    parts.push({ text: `${actor} looks at ` });
    parts.push({ text: HOLON_LABELS[ctx[0]] || ctx[0], holonId: ctx[0] });
    parts.push({ text: " on " });
    parts.push({ text: HOLON_LABELS[ctx[1]] || ctx[1], holonId: ctx[1] });
    parts.push({ text: " and finds " });
    parts.push({ text: focusLabel, holonId: focusId });
    parts.push({ text: "." });
  } else {
    parts.push({ text: `${actor} is in ` });
    ctx.forEach((id, i) => {
      if (i > 0) parts.push({ text: i === ctx.length - 1 ? " and " : ", " });
      parts.push({ text: HOLON_LABELS[id] || id, holonId: id });
    });
    parts.push({ text: " and finds " });
    parts.push({ text: focusLabel, holonId: focusId });
    parts.push({ text: "." });
  }
  // Prefer last holon as proof surface
  return { parts, focusId };
}

function partsToTs(parts, indent) {
  const lines = parts.map((p) =>
    p.holonId
      ? `${indent}  { text: ${JSON.stringify(p.text)}, holonId: ${JSON.stringify(p.holonId)} },`
      : `${indent}  { text: ${JSON.stringify(p.text)} },`,
  );
  return `${indent}howParts: [\n${lines.join("\n")}\n${indent}],`;
}

function transformBlock(block, actor) {
  if (/howParts:/.test(block) && /focusHolonId:/.test(block)) return block;
  const how = stripNoise(extractHow(block));
  const ids = extractHolonIds(block);
  if (ids.length === 0 && !how) return block;
  const { parts, focusId } = buildParts(actor, ids, how);
  if (!focusId) return block;
  const indentMatch = block.match(/\n(\s+)id:/);
  const indent = indentMatch ? indentMatch[1] : "    ";

  let next = block;
  next = next.replace(/\n\s*how:\s*(?:`[\s\S]*?`|'(?:\\'|[^'])*'|"(?:\\"|[^"])*"),?/, "");
  next = next.replace(/\n\s*holonIds:\s*\[[^\]]*\],?/, "");
  next = next.replace(/\n\s*focusHolonId:\s*[^,\n]+,?/, "");
  next = next.replace(/\n\s*howParts:\s*\[[\s\S]*?\],/, "");

  const injection = `
${partsToTs(parts, indent)}
${indent}focusHolonId: ${JSON.stringify(focusId)},
${indent}holonIds: [${JSON.stringify(focusId)}],`;

  if (/\n\s*status:/.test(next)) {
    next = next.replace(/\n(\s*)status:/, `${injection}\n$1status:`);
  }
  return next;
}

for (const cfg of FILES) {
  const fp = path.join(outcomesDir, cfg.file);
  let src = fs.readFileSync(fp, "utf8");
  const re = /(\{\s*\n\s*id:\s*"[^"]+"[\s\S]*?\n\s*\},?)/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    out += src.slice(last, m.index);
    out += transformBlock(m[1], cfg.actor);
    last = m.index + m[1].length;
  }
  out += src.slice(last);
  fs.writeFileSync(fp, out);
  console.log("updated", cfg.file);
}
console.log("done");
