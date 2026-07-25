import { useState } from "react";
import {
  Button,
  Checkbox,
  InlineNotification,
  Layer,
  NumberInput,
  OverflowMenu,
  OverflowMenuItem,
  RadioButton,
  RadioButtonGroup,
  Stack,
  TextArea,
  TextInput,
  Tile,
} from "@carbon/react";
import { CarbonDeskShell } from "../shell/CarbonDeskShell";
import { ClientCarbonApp } from "../client/ClientCarbonApp";
import { DoorModal } from "../ui/DoorModal";
import { FactList } from "../ui/FactList";
import {
  CARBON_SEED,
  GUEST_INVITE,
  SEED_FAQ,
  SEED_FIRMS,
  TERMS_BODY,
  type FirmRow,
  type OpCampaignEvent,
} from "../data/seed";

type GuestStage = "invite" | "fund" | "converted" | "lapsed" | "desk";
type GuestNav = "campaigns" | "meetings" | "escrow";
type GuestDoor =
  | null
  | "terms"
  | "details"
  | "inspect"
  | "share"
  | "history"
  | "faq"
  | "requests";
type GuestDialog = null | "decline" | "ask-operator";

const NAV = [
  { id: "campaigns", label: "Campaigns" },
  { id: "meetings", label: "Meetings" },
  { id: "escrow", label: "Escrow" },
] as const;

type OperatorRequest = {
  id: string;
  kind: "price" | "icp" | "swap";
  label: string;
  status: "noted" | "seen" | "closed";
  at: string;
};

/**
 * Guest Carbon vessel — Campaigns · Meetings · Escrow.
 * Stages: invite → fund → converted → BC continuum; true lapsed surface.
 * Doors: terms, details, inspect, share, history, faq, requests.
 * Dialogs: decline, ask-operator.
 */
export function GuestCarbonApp({ onOpenDesk }: { onOpenDesk?: () => void }) {
  const [stage, setStage] = useState<GuestStage>("invite");
  const [nav, setNav] = useState<GuestNav>("campaigns");
  const [n, setN] = useState<number>(GUEST_INVITE.target);
  const [terms, setTerms] = useState(false);
  const [reviewedTerms, setReviewedTerms] = useState(false);
  const [door, setDoor] = useState<GuestDoor>(null);
  const [dialog, setDialog] = useState<GuestDialog>(null);
  const [firms, setFirms] = useState<FirmRow[]>(() =>
    SEED_FIRMS.map((f) => ({ ...f })),
  );
  const [shareEmail, setShareEmail] = useState("");
  const [askKind, setAskKind] = useState<"price" | "icp" | "swap">("price");
  const [requests, setRequests] = useState<OperatorRequest[]>([
    {
      id: "r0",
      kind: "icp",
      label: "Confirm ICP seniority lock",
      status: "noted",
      at: "Jul 19",
    },
  ]);
  const [history] = useState<OpCampaignEvent[]>([...GUEST_INVITE.history]);

  if (stage === "desk") {
    return (
      <ClientCarbonApp
        personaId="guest"
        initialVessels={[
          {
            id: "v-guest",
            name: GUEST_INVITE.name,
            state: "funded",
            target: n,
            price: GUEST_INVITE.price,
            bookedCount: 0,
            held: n * GUEST_INVITE.price,
            released: 0,
            reclaimDaysLeft: CARBON_SEED.holdDays,
            holdDays: CARBON_SEED.holdDays,
            operatorName: GUEST_INVITE.operatorName,
            history: [
              ...history,
              { id: "hf", at: "Just now", label: "First fund · converted" },
            ],
          },
        ]}
        initialMeetings={[]}
      />
    );
  }

  const openDoor = (id: GuestDoor) => {
    setDoor(id);
    if (id === "terms") setReviewedTerms(true);
  };

  const pageTitle =
    nav === "meetings"
      ? "Meetings"
      : nav === "escrow"
        ? "Escrow"
        : stage === "fund"
          ? "Fund escrow"
          : stage === "converted"
            ? "Converted"
            : stage === "lapsed"
              ? "Invite lapsed"
              : "Campaigns";

  return (
    <CarbonDeskShell
      personaId="guest"
      productLabel="Client"
      navItems={NAV}
      activeNav={nav}
      onNavChange={(id) => setNav(id as GuestNav)}
      pageTitle={pageTitle}
      pageActions={
        nav === "campaigns" && stage === "invite" ? (
          <OverflowMenu flipped size="sm" ariaLabel="Invite doors">
            <OverflowMenuItem itemText="Terms" onClick={() => openDoor("terms")} />
            <OverflowMenuItem
              itemText="Why this price"
              onClick={() => openDoor("details")}
            />
            <OverflowMenuItem
              itemText="Firms"
              onClick={() => openDoor("inspect")}
            />
            <OverflowMenuItem itemText="Share" onClick={() => openDoor("share")} />
            <OverflowMenuItem
              itemText="History"
              onClick={() => openDoor("history")}
            />
            <OverflowMenuItem itemText="FAQ" onClick={() => openDoor("faq")} />
            <OverflowMenuItem
              itemText="Requests"
              onClick={() => openDoor("requests")}
            />
            <OverflowMenuItem
              itemText="Ask operator"
              onClick={() => setDialog("ask-operator")}
            />
          </OverflowMenu>
        ) : null
      }
    >
      {nav === "meetings" ? (
        <Layer>
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title="No meetings yet"
            subtitle="Meetings open after you fund and a Worker runs the campaign."
          />
        </Layer>
      ) : null}

      {nav === "escrow" ? (
        <Layer>
          <InlineNotification
            kind="info"
            lowContrast
            hideCloseButton
            title="No escrow yet"
            subtitle="Escrow opens when you complete the first fund."
          />
        </Layer>
      ) : null}

      {/* —— Invite land —— */}
      {nav === "campaigns" && stage === "invite" ? (
        <Stack gap={6}>
          <Tile>
            <Stack gap={4}>
              <h2 className="cds--type-productive-heading-03">
                {GUEST_INVITE.name}
              </h2>
              <p className="cds--type-body-01">
                Prepared by {GUEST_INVITE.operatorName} ·{" "}
                {GUEST_INVITE.companyName} · expires {GUEST_INVITE.expiresAt}
              </p>
              <FactList
                facts={[
                  {
                    label: "Price / meeting",
                    value: `$${GUEST_INVITE.price}`,
                  },
                  { label: "Target", value: String(GUEST_INVITE.target) },
                  {
                    label: "Hold",
                    value: `$${GUEST_INVITE.holdTotal}`,
                  },
                  {
                    label: "What counts",
                    value: GUEST_INVITE.rules.join(" · "),
                  },
                  { label: "Ref", value: GUEST_INVITE.inviteRef },
                ]}
              />
              <p className="cds--type-helper-text-01">
                {GUEST_INVITE.pricingWhy}
              </p>
              <Stack orientation="horizontal" gap={4}>
                <Button
                  onClick={() => {
                    if (!reviewedTerms) openDoor("terms");
                    setStage("fund");
                  }}
                >
                  Fund
                </Button>
                <Button
                  kind="secondary"
                  onClick={() => setDialog("ask-operator")}
                >
                  Ask operator
                </Button>
                <Button kind="ghost" onClick={() => setDialog("decline")}>
                  Decline
                </Button>
                <Button kind="danger--ghost" onClick={() => setStage("lapsed")}>
                  Walk away
                </Button>
              </Stack>
            </Stack>
          </Tile>
        </Stack>
      ) : null}

      {/* —— True lapsed surface —— */}
      {nav === "campaigns" && stage === "lapsed" ? (
        <Stack gap={6}>
          <InlineNotification
            kind="warning"
            lowContrast
            hideCloseButton
            title="Invite lapsed"
            subtitle="This vessel is no longer actionable. Ask the Operator to resend, or leave."
          />
          <FactList
            facts={[
              { label: "Campaign", value: GUEST_INVITE.name },
              { label: "Expired", value: GUEST_INVITE.expiresAt },
              { label: "Operator", value: GUEST_INVITE.operatorName },
              { label: "Ref", value: GUEST_INVITE.inviteRef },
            ]}
          />
          <Stack orientation="horizontal" gap={3}>
            <Button
              kind="secondary"
              onClick={() => setDialog("ask-operator")}
            >
              Ask operator to resend
            </Button>
            <Button kind="ghost" onClick={() => setStage("invite")}>
              Back to invite (demo)
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {/* —— Fund —— */}
      {nav === "campaigns" && stage === "fund" ? (
        <Stack gap={6}>
          <Button kind="ghost" size="sm" onClick={() => setStage("invite")}>
            Back to invite
          </Button>
          <NumberInput
            id="guest-n"
            label="Meetings to fund"
            min={1}
            max={GUEST_INVITE.target}
            value={n}
            onChange={(_, { value }) =>
              setN(typeof value === "number" ? value : n)
            }
          />
          <p className="cds--type-body-01">
            Hold ${n * GUEST_INVITE.price}. Release per qualified meeting. Rules
            stay locked.
          </p>
          <Stack orientation="horizontal" gap={3}>
            <Button kind="ghost" size="sm" onClick={() => openDoor("terms")}>
              Review terms
            </Button>
            <Button kind="ghost" size="sm" onClick={() => openDoor("details")}>
              Why this price
            </Button>
          </Stack>
          <Checkbox
            id="guest-terms"
            labelText="I accept the locked terms"
            checked={terms}
            onChange={(_, { checked }) => setTerms(checked)}
          />
          <Button disabled={!terms} onClick={() => setStage("converted")}>
            Complete first fund
          </Button>
        </Stack>
      ) : null}

      {/* —— Converted —— */}
      {nav === "campaigns" && stage === "converted" ? (
        <Stack gap={6}>
          <InlineNotification
            kind="success"
            lowContrast
            hideCloseButton
            title="You are a Business Client"
            subtitle="First fund converted the invite. A Worker can pick up after Operator launch."
          />
          <FactList
            facts={[
              { label: "Hold", value: `$${n * GUEST_INVITE.price}` },
              { label: "Meetings funded", value: String(n) },
              {
                label: "Reclaim window",
                value: `${CARBON_SEED.holdDays} days`,
              },
            ]}
          />
          <Button
            onClick={() => {
              if (onOpenDesk) onOpenDesk();
              else setStage("desk");
            }}
          >
            Open desk
          </Button>
        </Stack>
      ) : null}

      {/* —— Doors —— */}
      <DoorModal
        open={door === "terms"}
        heading="Terms"
        label={`Frozen until ${GUEST_INVITE.expiresAt}`}
        onClose={() => setDoor(null)}
        size="lg"
      >
        <FactList
          facts={[
            { label: "Hold cap", value: `$${CARBON_SEED.escrowTotal}` },
            {
              label: "Per meeting",
              value: `$${CARBON_SEED.pricePerMeeting}`,
            },
            { label: "Custodian", value: CARBON_SEED.custodian },
            {
              label: "Reclaim",
              value: `${CARBON_SEED.holdDays} days`,
            },
          ]}
        />
        <pre
          className="cds--type-body-01"
          style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}
        >
          {TERMS_BODY}
        </pre>
      </DoorModal>

      <DoorModal
        open={door === "details"}
        heading="Why this price"
        label={GUEST_INVITE.operatorName}
        onClose={() => setDoor(null)}
      >
        <FactList
          facts={[
            { label: "ACV band", value: CARBON_SEED.acvBand },
            {
              label: "Target",
              value: `${CARBON_SEED.meetingsTarget} meetings`,
            },
            {
              label: "Per meeting",
              value: `$${CARBON_SEED.pricePerMeeting}`,
            },
            {
              label: "Reclaim",
              value: `${CARBON_SEED.holdDays} days`,
            },
          ]}
        />
        <p className="cds--type-body-01" style={{ marginTop: "1rem" }}>
          {GUEST_INVITE.pricingWhy}
        </p>
        <p className="cds--type-helper-text-01" style={{ marginTop: "0.5rem" }}>
          {GUEST_INVITE.samplePacket}
        </p>
      </DoorModal>

      <DoorModal
        open={door === "inspect"}
        heading="Firms"
        label={`${firms.length} companies on this list`}
        onClose={() => setDoor(null)}
        size="lg"
      >
        <Stack gap={3}>
          {firms.map((f) => (
            <Tile key={f.id}>
              <Stack orientation="horizontal" gap={3}>
                <div style={{ flex: 1 }}>
                  <div className="cds--type-productive-heading-01">{f.name}</div>
                  <div className="cds--type-helper-text-01">
                    {f.sector} · {f.sizeBucket || f.employeeCount}
                    {f.tag && f.tag !== "none" ? ` · ${f.tag}` : ""}
                    {f.blockedBy ? ` · blocked by ${f.blockedBy}` : ""}
                  </div>
                </div>
                {!f.blockedBy ? (
                  <Button
                    size="sm"
                    kind="danger--ghost"
                    onClick={() =>
                      setFirms((prev) =>
                        prev.map((x) =>
                          x.id === f.id
                            ? { ...x, blockedBy: "you", keep: false }
                            : x,
                        ),
                      )
                    }
                  >
                    Block
                  </Button>
                ) : null}
              </Stack>
            </Tile>
          ))}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "share"}
        heading="Share invite"
        onClose={() => setDoor(null)}
        primaryButtonText="Send link"
        primaryButtonDisabled={!shareEmail.trim()}
        onRequestSubmit={() => {
          setShareEmail("");
          setDoor(null);
        }}
      >
        <TextInput
          id="share-email"
          labelText="Viewer email"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          placeholder="colleague@company.com"
        />
        <p className="cds--type-helper-text-01" style={{ marginTop: "0.75rem" }}>
          Viewers see the invite land. They cannot fund.
        </p>
      </DoorModal>

      <DoorModal
        open={door === "history"}
        heading="Invite history"
        onClose={() => setDoor(null)}
      >
        <Stack gap={3}>
          {history.map((e) => (
            <Tile key={e.id}>
              <span className="cds--type-helper-text-01">{e.at}</span>
              {" · "}
              <span className="cds--type-body-01">{e.label}</span>
            </Tile>
          ))}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "faq"}
        heading="FAQ"
        onClose={() => setDoor(null)}
        size="lg"
      >
        <Stack gap={4}>
          {SEED_FAQ.map((item) => (
            <Tile key={item.q}>
              <div className="cds--type-productive-heading-01">{item.q}</div>
              <p className="cds--type-body-01" style={{ marginTop: "0.5rem" }}>
                {item.a}
              </p>
            </Tile>
          ))}
        </Stack>
      </DoorModal>

      <DoorModal
        open={door === "requests"}
        heading="Operator requests"
        onClose={() => setDoor(null)}
      >
        {requests.length === 0 ? (
          <p className="cds--type-body-01">No requests yet.</p>
        ) : (
          <Stack gap={3}>
            {requests.map((r) => (
              <Tile key={r.id}>
                <div className="cds--type-productive-heading-01">{r.label}</div>
                <div className="cds--type-helper-text-01">
                  {r.kind} · {r.status} · {r.at}
                </div>
              </Tile>
            ))}
          </Stack>
        )}
      </DoorModal>

      <DoorModal
        open={dialog === "decline"}
        heading="Decline invite"
        danger
        onClose={() => setDialog(null)}
        primaryButtonText="Decline"
        onRequestSubmit={() => {
          setDialog(null);
          setStage("lapsed");
        }}
      >
        <p className="cds--type-body-01">
          Declining ends this invite. Operator can resend later. No escrow opens.
        </p>
      </DoorModal>

      <DoorModal
        open={dialog === "ask-operator"}
        heading="Ask operator"
        onClose={() => setDialog(null)}
        primaryButtonText="Send request"
        onRequestSubmit={() => {
          const labels = {
            price: "Ask about price",
            icp: "Ask about ICP",
            swap: "Request firm swap",
          } as const;
          setRequests((prev) => [
            {
              id: `r-${Date.now()}`,
              kind: askKind,
              label: labels[askKind],
              status: "noted",
              at: "Just now",
            },
            ...prev,
          ]);
          setDialog(null);
          setDoor("requests");
        }}
      >
        <RadioButtonGroup
          legendText="What do you need?"
          name="ask-kind"
          valueSelected={askKind}
          onChange={(v) => setAskKind(v as typeof askKind)}
        >
          <RadioButton id="ask-price" value="price" labelText="Price" />
          <RadioButton id="ask-icp" value="icp" labelText="ICP / seniority" />
          <RadioButton id="ask-swap" value="swap" labelText="Firm swap" />
        </RadioButtonGroup>
        <TextArea
          id="ask-note"
          labelText="Note (optional)"
          placeholder="One sentence for the Operator"
        />
      </DoorModal>
    </CarbonDeskShell>
  );
}
