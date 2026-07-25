import { Tag } from "@carbon/react";

const OP_STATE_KIND: Record<
  string,
  "blue" | "cyan" | "teal" | "green" | "purple" | "magenta" | "red" | "gray" | "cool-gray"
> = {
  draft: "gray",
  evaluate: "blue",
  enrich: "cyan",
  ready: "teal",
  invited: "purple",
  funded: "magenta",
  launched: "teal",
  running: "green",
  stopped: "red",
  paused: "cool-gray",
  reclaimed: "gray",
  upcoming: "blue",
  pending: "magenta",
  accepted: "green",
  disputed: "red",
  released: "teal",
  unclaimed: "teal",
  claimed: "blue",
  active: "green",
};

/** Decision-facing status only — never use for Worker gate labels like funded/launched. */
export function StatusTag({
  label,
  state,
}: {
  label: string;
  state?: string;
}) {
  const kind = OP_STATE_KIND[state ?? label.toLowerCase()] ?? "cool-gray";
  return (
    <Tag size="sm" type={kind}>
      {label}
    </Tag>
  );
}
