/**
 * Log meeting packet (furnishing items 59–70).
 * Company: typeahead against vessel firms — pick fills size; no match → create new.
 */
import { useMemo, useState } from "react";
import { HolonBoundary } from "@/app/components/docs/HolonBoundary";
import { light } from "@/app/components/tokens";
import { WORKER_CT } from "../../../holons/registerCtHolons";
import { LoFiButton, LoFiField } from "../LoFiPrimitives";
import { LoFiPanel } from "../LoFiPersonaChrome";
import { useDeskPalette } from "../DeskPaletteContext";
import {
  buildPacketPreview,
  copyText,
  firmStatusLabel,
  isDuplicateCompany,
} from "./helpers";
import type { FirmRow, RecentSubmission, WorkerMeeting, WorkerVessel } from "./types";

export type LogMeetingViewProps = {
  vessel: WorkerVessel;
  meetings: WorkerMeeting[];
  firms: FirmRow[];
  workerName: string;
  who: string;
  role: string;
  pain: string;
  company: string;
  size: string;
  talkTrackUsed: string;
  recentSubmissions: RecentSubmission[];
  onWho: (v: string) => void;
  onRole: (v: string) => void;
  onPain: (v: string) => void;
  onCompany: (v: string) => void;
  onSize: (v: string) => void;
  onTalkTrackUsed: (v: string) => void;
  /** Append a firm created from the typeahead when nothing matched. */
  onCreateFirm: (firm: { name: string; size?: string }) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

function filterFirms(firms: FirmRow[], query: string): FirmRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return firms.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      (f.note?.toLowerCase().includes(q) ?? false),
  );
}

function exactFirm(firms: FirmRow[], name: string): FirmRow | undefined {
  const n = name.trim().toLowerCase();
  if (!n) return undefined;
  return firms.find((f) => f.name.trim().toLowerCase() === n);
}

export function LogMeetingView({
  vessel,
  meetings,
  firms,
  workerName,
  who,
  role,
  pain,
  company,
  size,
  talkTrackUsed,
  recentSubmissions,
  onWho,
  onRole,
  onPain,
  onCompany,
  onSize,
  onTalkTrackUsed,
  onCreateFirm,
  onSubmit,
  onCancel,
}: LogMeetingViewProps) {
  const loFi = useDeskPalette();
  const [listOpen, setListOpen] = useState(false);
  const [extraOpen, setExtraOpen] = useState(Boolean(talkTrackUsed));

  const matches = useMemo(() => filterFirms(firms, company), [firms, company]);
  const known = useMemo(() => exactFirm(firms, company), [firms, company]);
  const typed = company.trim().length > 0;
  const canCreate =
    typed && !known && !matches.some((f) => f.name.trim().toLowerCase() === company.trim().toLowerCase());

  const duplicate = useMemo(
    () => (company.trim() ? isDuplicateCompany(meetings, company) : false),
    [meetings, company],
  );

  const preview = buildPacketPreview({
    who,
    role,
    pain,
    company: company || undefined,
    size: size || undefined,
    workerName,
  });

  const pickFirm = (f: FirmRow) => {
    onCompany(f.name);
    if (f.size) onSize(f.size);
    setListOpen(false);
  };

  const createFirm = () => {
    const name = company.trim();
    if (!name) return;
    onCreateFirm({ name, size: size.trim() || undefined });
    onCompany(name);
    setListOpen(false);
  };

  return (
    <HolonBoundary id={WORKER_CT.log.id} label={WORKER_CT.log.label} t={light}>
    <LoFiPanel title="Log meeting" caption="Client gets the packet. You get the case for pay.">
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
        <LoFiField label="Who" value={who} onChange={onWho} />
        <LoFiField label="Role" value={role} onChange={onRole} />
        <LoFiField label="Stated pain" value={pain} onChange={onPain} />

        <HolonBoundary
          id={WORKER_CT.companySearch.id}
          label={WORKER_CT.companySearch.label}
          t={light}
        >
        <div>
          <div className="mb-1.5 text-xs font-medium" style={{ color: loFi.label }}>
            Company
          </div>
          <input
            value={company}
            onChange={(e) => {
              onCompany(e.target.value);
              setListOpen(true);
              if (!e.target.value.trim()) onSize("");
            }}
            onFocus={() => setListOpen(true)}
            onBlur={() => {
              // Allow click on result/create before closing
              window.setTimeout(() => setListOpen(false), 120);
            }}
            placeholder="Type to search vessel firms…"
            autoComplete="off"
            style={{
              width: "100%",
              height: 36,
              padding: "0 10px",
              borderRadius: 4,
              border: `1px solid ${loFi.stroke}`,
              background: loFi.white,
              color: loFi.ink,
              fontSize: 13,
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          {listOpen && typed ? (
            <div
              style={{
                marginTop: 6,
                border: `1px solid ${loFi.stroke}`,
                borderRadius: 6,
                background: loFi.white,
                overflow: "hidden",
              }}
            >
              {matches.length === 0 ? (
                <div className="px-3 py-2 text-xs" style={{ color: loFi.muted }}>
                  No firm on this vessel matches.
                </div>
              ) : (
                matches.slice(0, 6).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickFirm(f)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm"
                    style={{
                      border: "none",
                      borderBottom: `1px solid ${loFi.stroke}`,
                      background: "transparent",
                      color: loFi.ink,
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <span>
                      <span className="font-medium">{f.name}</span>
                      {f.size ? (
                        <span className="text-xs" style={{ color: loFi.label }}>
                          {" "}
                          · {f.size}
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-[11px]" style={{ color: loFi.muted }}>
                      {firmStatusLabel(f.status)}
                    </span>
                  </button>
                ))
              )}
              {canCreate ? (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={createFirm}
                  className="flex w-full px-3 py-2.5 text-left text-sm font-medium"
                  style={{
                    border: "none",
                    background: loFi.block,
                    color: loFi.ink,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  Create “{company.trim()}”
                </button>
              ) : null}
            </div>
          ) : null}
          {known ? (
            <p className="mt-1.5 text-[11px]" style={{ color: loFi.label }}>
              On vessel list
              {known.size ? ` · ${known.size}` : ""}
              {known.blockedBy ? " · blocked (still loggable for dispute path)" : ""}
            </p>
          ) : typed && canCreate ? (
            <p className="mt-1.5 text-[11px]" style={{ color: loFi.muted }}>
              New firm — size stays yours to fill, or Create to add to the vessel list.
            </p>
          ) : null}
        </div>
        </HolonBoundary>

        <LoFiField
          label="Size"
          value={size}
          onChange={onSize}
          placeholder={known?.size ? undefined : "e.g. 180 employees"}
        />

        <LoFiButton variant="quiet" onClick={() => setExtraOpen((e) => !e)}>
          {extraOpen ? "Hide" : "Add"} talk track used
        </LoFiButton>

        {extraOpen ? (
          <LoFiField label="Talk track used (optional)" value={talkTrackUsed} onChange={onTalkTrackUsed} />
        ) : null}

        {duplicate ? (
          <p className="text-xs" style={{ color: "#991b1b" }}>
            Duplicate firm already logged on this vessel.
          </p>
        ) : null}

        <div
          className="rounded-md px-3 py-2 text-xs leading-relaxed"
          style={{ background: loFi.block, color: loFi.label, whiteSpace: "pre-wrap" }}
        >
          <div className="mb-1 font-medium" style={{ color: loFi.ink }}>
            Packet preview
          </div>
          {preview}
        </div>

        <div>
          <div className="mb-1 text-xs font-medium" style={{ color: loFi.label }}>
            Why this counts
          </div>
          <ul className="text-xs" style={{ color: loFi.muted }}>
            {vessel.whatCounts.map((r) => (
              <li key={r.id}>
                {r.on ? "✓" : "○"} {r.label}
              </li>
            ))}
          </ul>
        </div>

        {recentSubmissions.length > 0 ? (
          <div>
            <div className="mb-1 text-xs font-medium" style={{ color: loFi.label }}>
              Recent submissions
            </div>
            {recentSubmissions.slice(0, 3).map((s) => (
              <div key={s.id} className="text-xs" style={{ color: loFi.muted }}>
                {s.at} · {s.who} · {s.company}
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <LoFiButton onClick={onSubmit} disabled={!who.trim() || !role.trim() || !pain.trim()}>
            Submit meeting
          </LoFiButton>
          <LoFiButton variant="quiet" onClick={() => copyText(preview)}>
            Copy packet
          </LoFiButton>
          <LoFiButton variant="quiet" onClick={onCancel}>
            Cancel
          </LoFiButton>
        </div>
      </div>
    </LoFiPanel>
    </HolonBoundary>
  );
}
