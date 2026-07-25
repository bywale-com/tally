/**
 * Polish mechanical "is on A and B and finds X" inhabit lines into clearer copy.
 * Preserves holonIds on parts. No hyphens/em dashes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../src/app/register/outcomes");

const FILES = [
  "workerFurnish.ts",
  "businessClientFurnish.ts",
  "guestFurnish.ts",
  "operatorFurnish.ts",
];

function polishBlock(block) {
  // Only touch the generic generated pattern
  if (!/text: "[^"]* is on "/.test(block)) return block;
  if (/Worker looks at an/.test(block)) return block; // hand-written exemplar

  return block.replace(
    /narrativeParts:\s*\[([\s\S]*?)\],\s*\n(\s*)focusHolonId:/,
    (full, body, indent) => {
      const texts = [];
      const re = /\{\s*text:\s*("(?:\\.|[^"])*")(?:,\s*holonId:\s*("(?:\\.|[^"])*"))?\s*\}/g;
      let m;
      const parts = [];
      while ((m = re.exec(body))) {
        parts.push({ text: JSON.parse(m[1]), holonId: m[2] ? JSON.parse(m[2]) : undefined });
      }
      if (parts.length < 3) return full;

      // Expected: Actor is on | Ctx* | and finds | Focus | .
      const actorPart = parts[0];
      const actor = (actorPart.text.match(/^(\w+)/) || [, "Someone"])[1];
      const mid = parts.slice(1);
      const findsIdx = mid.findIndex((p) => /and finds\s*$/.test(p.text) || p.text === " and finds ");
      if (findsIdx < 0) return full;
      const ctx = mid.slice(0, findsIdx).filter((p) => p.holonId);
      const focus = mid[findsIdx + 1];
      if (!focus?.holonId) return full;

      const out = [];
      if (ctx.length === 0) {
        out.push({ text: `${actor} finds ` });
        out.push(focus);
        out.push({ text: "." });
      } else if (ctx.length === 1) {
        out.push({ text: `${actor} opens ` });
        out.push(ctx[0]);
        out.push({ text: " and finds " });
        out.push(focus);
        out.push({ text: "." });
      } else if (ctx.length === 2) {
        out.push({ text: `${actor} looks at ` });
        out.push(ctx[0]);
        out.push({ text: " on " });
        out.push(ctx[1]);
        out.push({ text: " and finds " });
        out.push(focus);
        out.push({ text: "." });
      } else {
        out.push({ text: `${actor} is in ` });
        ctx.forEach((c, i) => {
          if (i > 0) out.push({ text: i === ctx.length - 1 ? " and " : ", " });
          out.push(c);
        });
        out.push({ text: " and finds " });
        out.push(focus);
        out.push({ text: "." });
      }

      const lines = out
        .map((p) =>
          p.holonId
            ? `${indent}  { text: ${JSON.stringify(p.text)}, holonId: ${JSON.stringify(p.holonId)} },`
            : `${indent}  { text: ${JSON.stringify(p.text)} },`,
        )
        .join("\n");
      return `narrativeParts: [\n${lines}\n${indent}],\n${indent}focusHolonId:`;
    },
  );
}

for (const file of FILES) {
  const fp = path.join(dir, file);
  let src = fs.readFileSync(fp, "utf8");
  const re = /(\{\s*\n\s*id:\s*"(?:worker|bc|guest|op)-f-\d+"[\s\S]*?\n\s*\},?)/g;
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    out += src.slice(last, m.index);
    out += polishBlock(m[1]);
    last = m.index + m[1].length;
  }
  out += src.slice(last);
  fs.writeFileSync(fp, out);
  console.log("polished", file);
}
