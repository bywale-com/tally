import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  Button,
  InlineLoading,
  InlineNotification,
  Link,
  Stack,
  Tag,
  TextArea,
} from "@carbon/react";
import { Edit, Launch } from "@carbon/icons-react";

export type DossierSection = {
  id: string;
  label: string;
  fact: string;
  unknown?: boolean;
};

export const DOSSIER_SEED: DossierSection[] = [
  {
    id: "company",
    label: "Company name",
    fact: "Acme Robotics",
  },
  {
    id: "description",
    label: "Company description",
    fact: "Industrial robotics for multi-site ops teams evaluating plant ROI. Uses outbound and product-led motions to reach plant leaders.",
  },
  {
    id: "size",
    label: "Company size",
    fact: "120–180",
  },
  {
    id: "acv",
    label: "ACV",
    fact: "Can't be identified",
    unknown: true,
  },
  {
    id: "verify",
    label: "One fact to verify",
    fact: "Who owns plant ops budget on their side.",
  },
  {
    id: "scenario",
    label: "Scenario",
    fact: "Outbound to multi-site ops teams evaluating robotics ROI.",
  },
  {
    id: "verdict",
    label: "Verdict",
    fact: "Strong fit if economic buyer owns plant ops budget.",
  },
];

const REANALYZE_MS = 900;

type DossierCarbonProps = {
  companyName: string;
  /** Domain without protocol, e.g. acmerobotics.com */
  domain: string;
  onEnrich: () => void;
  onHistory?: (label: string) => void;
};

function websiteHref(domain: string) {
  if (!domain.trim()) return "";
  return domain.startsWith("http") ? domain : `https://${domain}`;
}

function downloadDossier(
  sections: DossierSection[],
  companyName: string,
) {
  const lines = [
    `Dossier · ${companyName}`,
    "",
    ...sections.map((s) => `${s.label}\n${s.fact}\n`),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${companyName.replace(/\s+/g, "-").toLowerCase()}-dossier.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Carbon port of loFi DossierView — accordion sections, company website link,
 * per-section sticky notes, Re-analyze scoped to noted sections only.
 */
export function DossierCarbon({
  companyName,
  domain,
  onEnrich,
  onHistory,
}: DossierCarbonProps) {
  const [sections, setSections] = useState<DossierSection[]>(() =>
    DOSSIER_SEED.map((s) =>
      s.id === "company" ? { ...s, fact: companyName } : { ...s },
    ),
  );
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteOpenId, setNoteOpenId] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  const noteCount = Object.values(notes).filter((n) => n.trim()).length;
  const unknownCount = sections.filter((s) => s.unknown).length;
  const notePreview = Object.values(notes).find((n) => n.trim())?.trim();
  const href = websiteHref(domain);

  const openIds = useMemo(() => ["company"], []);

  function reanalyze() {
    if (reanalyzing) return;
    setReanalyzing(true);
    window.setTimeout(() => {
      setSections((prev) =>
        prev.map((s) => {
          const note = (notes[s.id] ?? "").trim();
          if (note) return { ...s, fact: note, unknown: false };
          return s;
        }),
      );
      setReanalyzing(false);
      setNoteOpenId(null);
      onHistory?.("Re-analyzed dossier (noted sections only)");
    }, REANALYZE_MS);
  }

  return (
    <Stack gap={6}>
      <Stack orientation="horizontal" gap={3} style={{ flexWrap: "wrap" }}>
        <Tag type="gray" size="sm">
          {sections.length} sections
        </Tag>
        {unknownCount > 0 ? (
          <Tag type="warm-gray" size="sm">
            {unknownCount} unknown
          </Tag>
        ) : null}
        {noteCount > 0 ? (
          <Tag type="blue" size="sm">
            {noteCount} notes
          </Tag>
        ) : null}
        {domain ? (
          <Button
            kind="ghost"
            size="sm"
            onClick={() => {
              void navigator.clipboard?.writeText(domain);
            }}
          >
            Copy domain
          </Button>
        ) : null}
        <Button
          kind="ghost"
          size="sm"
          onClick={() => downloadDossier(sections, companyName)}
        >
          Export dossier
        </Button>
      </Stack>

      {noteCount > 0 && notePreview ? (
        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title={`What you heard · ${noteCount} note${noteCount === 1 ? "" : "s"}`}
          subtitle={notePreview}
        />
      ) : null}

      <Accordion align="start">
        {sections.map((section) => {
          const hasSticky = Boolean((notes[section.id] ?? "").trim());
          const isCompany = section.id === "company";
          return (
            <AccordionItem
              key={section.id}
              title={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    width: "100%",
                  }}
                >
                  <span className="cds--type-productive-heading-01">
                    {section.label}
                  </span>
                  {isCompany && href ? (
                    <Link
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      renderIcon={Launch}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {domain}
                    </Link>
                  ) : null}
                  {hasSticky ? (
                    <Tag type="blue" size="sm">
                      note
                    </Tag>
                  ) : null}
                </span>
              }
              open={openIds.includes(section.id) || undefined}
            >
              {reanalyzing ? (
                <InlineLoading description="Re-analyzing…" />
              ) : (
                <p
                  className="cds--type-body-01"
                  style={{
                    fontWeight: section.unknown ? 600 : 400,
                    opacity: section.unknown ? 0.85 : 1,
                  }}
                >
                  {section.fact}
                </p>
              )}
              {hasSticky && noteOpenId !== section.id ? (
                <p
                  className="cds--type-helper-text-01"
                  style={{ marginTop: "0.5rem" }}
                >
                  Note: {(notes[section.id] ?? "").slice(0, 80)}
                  {(notes[section.id] ?? "").length > 80 ? "…" : ""}
                </p>
              ) : null}
              <div style={{ marginTop: "0.75rem" }}>
                <Button
                  kind="ghost"
                  size="sm"
                  renderIcon={Edit}
                  onClick={() =>
                    setNoteOpenId(
                      noteOpenId === section.id ? null : section.id,
                    )
                  }
                >
                  {hasSticky ? "Edit note" : "Add note"}
                </Button>
              </div>
              {noteOpenId === section.id ? (
                <div style={{ marginTop: "0.75rem", maxWidth: 420 }}>
                  <TextArea
                    id={`note-${section.id}`}
                    labelText="What you heard"
                    placeholder="Sticky for this section — Re-analyze rewrites only noted sections"
                    value={notes[section.id] ?? ""}
                    onChange={(e) =>
                      setNotes((p) => ({
                        ...p,
                        [section.id]: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                  <Button
                    kind="tertiary"
                    size="sm"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() => setNoteOpenId(null)}
                  >
                    Done
                  </Button>
                </div>
              ) : null}
            </AccordionItem>
          );
        })}
      </Accordion>

      <Stack orientation="horizontal" gap={3}>
        <Button onClick={onEnrich}>Enrich firm list</Button>
        <Button
          kind="tertiary"
          disabled={reanalyzing || noteCount === 0}
          onClick={reanalyze}
        >
          {reanalyzing ? "Re-analyzing…" : "Re-analyze"}
        </Button>
      </Stack>
      {noteCount === 0 ? (
        <p className="cds--type-helper-text-01">
          Add a sticky note on a section to scope Re-analyze — only noted
          sections rewrite.
        </p>
      ) : null}
    </Stack>
  );
}
