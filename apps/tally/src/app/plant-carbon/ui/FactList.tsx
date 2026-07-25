import {
  StructuredListBody,
  StructuredListCell,
  StructuredListRow,
  StructuredListWrapper,
} from "@carbon/react";

export type Fact = { label: string; value: React.ReactNode };

/** Register fact grid — StructuredList, not cards. */
export function FactList({ facts }: { facts: Fact[] }) {
  return (
    <StructuredListWrapper>
      <StructuredListBody>
        {facts.map((f, i) => (
          <StructuredListRow key={`${f.label}-${i}`}>
            <StructuredListCell noWrap>{f.label}</StructuredListCell>
            <StructuredListCell>{f.value}</StructuredListCell>
          </StructuredListRow>
        ))}
      </StructuredListBody>
    </StructuredListWrapper>
  );
}
