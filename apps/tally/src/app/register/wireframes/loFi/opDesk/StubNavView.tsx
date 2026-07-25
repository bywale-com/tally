/**
 * Stub nav modules (Meetings / Messages / Operations) — thin furniture only.
 */
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useDeskPalette } from "../DeskPaletteContext";
import type { OpNav } from "./types";

const COPY: Record<Exclude<OpNav, "campaigns">, { title: string; desc: string; facts: string[] }> = {
  meetings: {
    title: "Meetings",
    desc: "Booked conversations across running campaigns — read-only in click-through.",
    facts: ["2 upcoming", "1 pending release on Northwind", "Worker-attributed packets only"],
  },
  messages: {
    title: "Messages",
    desc: "No Operator chat in Core. Client requests land as facts on their desk.",
    facts: ["0 unread", "Last BC request · price review · Jul 20"],
  },
  operations: {
    title: "Operations",
    desc: "Escrow custodian and launch receipts — not ops spend.",
    facts: ["Escrow stand-in", "Zero retainer line-items", "3 launches this quarter"],
  },
};

export type StubNavViewProps = {
  nav: Exclude<OpNav, "campaigns">;
};

export function StubNavView({ nav }: StubNavViewProps) {
  const loFi = useDeskPalette();
  const c = COPY[nav];

  return (
    <div
      className="flex min-h-0 flex-1 flex-col rounded-lg border"
      style={{ background: loFi.frame, borderColor: loFi.stroke }}
    >
      <div
        className="border-b px-4 py-3 text-sm font-semibold"
        style={{ borderColor: loFi.stroke, background: loFi.chrome }}
      >
        {c.title}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Empty className="border-0 py-6">
          <EmptyHeader>
            <EmptyTitle>{c.title} — not in Core yet</EmptyTitle>
            <EmptyDescription>{c.desc}</EmptyDescription>
          </EmptyHeader>
        </Empty>
        <div className="mt-4 flex flex-wrap gap-2">
          {c.facts.map((f) => (
            <Badge key={f} variant="secondary" className="text-[10px]">
              {f}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
