import { useState, type ReactNode } from "react";

import { IconAlertCircle, IconArrowRight, IconCheck, IconCheckCircle, IconClose } from "./icons";
import { Avatar, Button, Eyebrow, ExplorerLink, Spinner } from "./ui";
import {
  clockTime,
  clockTimeAmPm,
  codeLabel,
  countdown,
  duration,
  explorerFor,
  hasEscrow,
  itemCount,
  policyLine,
  secondsBetween,
  settlementHashes,
  shortHash,
  shortName,
} from "../lib/format";
import { tokens, usd, xrp } from "../lib/money";
import { useSettle, type TabMeta } from "../lib/store";
import { anomalyLine, canOrder, graceLeft, inGrace } from "../lib/tabs";
import { OPEN_STATUSES, type Tab } from "../lib/types";
import { useTxInfo } from "../lib/xrpl";

/** The dashboard drawer for one tab: open (escrow + demo actions), settled (timeline + settlement), held, closed. */
export function TabDrawer({ tab, meta, now, onClose, onOpenHold }: { tab: Tab; meta?: TabMeta; now: number; onClose: () => void; onOpenHold: (tabId: string) => void }) {
  const { state } = useSettle();
  const heldOther = state?.tabs.find((t) => t.status === "held" && t.id !== tab.id);
  const label = tab.status === "settled" ? "Settlement" : tab.status === "held" ? "Held" : "Tab";

  return (
    <aside className="animate-settle-in flex w-[440px] shrink-0 flex-col overflow-hidden rounded-2xl border border-stone/60 bg-paper">
      <div className="flex items-center gap-4 border-b border-stone/50 px-6 py-5">
        <Avatar name={tab.memberName} size={56} tone={tab.status === "held" ? "terracotta" : "sage"} />
        <Eyebrow className="min-w-0 flex-1 truncate">
          {label} · {shortName(tab.memberName)}
        </Eyebrow>
        <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-full border border-stone text-graphite hover:bg-linen" aria-label="Close drawer">
          <IconClose size={16} />
        </button>
      </div>

      {tab.status === "settled" ? (
        <SettledBody tab={tab} meta={meta} heldOther={heldOther} onOpenHold={onOpenHold} />
      ) : tab.status === "held" ? (
        <HeldBody tab={tab} now={now} onOpenHold={onOpenHold} />
      ) : (
        <OpenBody tab={tab} meta={meta} now={now} />
      )}
    </aside>
  );
}

// Open, in grace, reconciling, closed -------------------------------------------

function OpenBody({ tab, meta, now }: { tab: Tab; meta?: TabMeta; now: number }) {
  const { state, balances, actions } = useSettle();
  const [busy, setBusy] = useState<"exit" | "close" | null>(null);
  const member = state?.members.find((m) => m.id === tab.memberId);
  const policy = state!.policy;
  const balance = balances?.members[tab.memberId];
  const closable = OPEN_STATUSES.includes(tab.status) && tab.status !== "reconciling";

  const act = async (kind: "exit" | "close") => {
    setBusy(kind);
    try {
      await (kind === "exit" ? actions.exit(tab.id) : actions.close(tab.id));
    } catch {
      // the store shows the error
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-6 py-5">
        <div>
          <div className="font-display text-[22px] font-medium text-midnight">{tab.memberName}</div>
          <div className="mt-0.5 text-[14px] text-muted">
            {member ? `${member.tier[0].toUpperCase()}${member.tier.slice(1)}` : "Member"} · {tab.seat} · opened {clockTimeAmPm(tab.openedAt)}
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-[14px]">
            <div className="rounded-xl border border-stone/60 px-3 py-2">
              <dt className="text-muted">House balance</dt>
              <dd className="mt-0.5 font-medium text-midnight tabular">{balance ? tokens(balance) : "—"}</dd>
            </div>
            <div className="rounded-xl border border-stone/60 px-3 py-2">
              <dt className="text-muted">Typical spend</dt>
              <dd className="mt-0.5 font-medium text-midnight tabular">{member ? usd(member.typicalSpendCents, { trim: true }) : "—"}</dd>
            </div>
          </dl>
        </div>

        {tab.status === "closed_manually" && (
          <section className="rounded-xl border border-stone px-4 py-3 text-[15px]">
            <div className="font-medium text-midnight">Closed manually · escrow returned</div>
            <div className="mt-0.5 text-[14px] text-graphite">{meta?.closedReason ?? "Closed by staff"}. Nothing was charged on-ledger.</div>
          </section>
        )}

        <EscrowCard tab={tab} meta={meta} />

        {inGrace(tab) && (
          <section className="rounded-xl border border-eucalyptus/60 bg-sage-soft/50 px-4 py-3 text-[15px] text-midnight">
            <div className="font-medium tabular">Exit detected · settling in {countdown(graceLeft(tab, meta, now))}</div>
            <div className="mt-0.5 text-[14px] text-graphite">Member was pushed the tab and can add a tip or dispute.</div>
          </section>
        )}
        {tab.status === "reconciling" && (
          <section className="rounded-xl border border-eucalyptus/60 bg-sage-soft/50 px-4 py-3 text-[15px] text-midnight">
            <div className="flex items-center gap-2 font-medium">
              <Spinner size={14} /> Agent reconciling against the POS
            </div>
            {meta?.decision && <div className="mt-1 text-[14px] text-graphite">{meta.decision.reason}</div>}
          </section>
        )}

        <ItemList tab={tab} />

        <p className="text-[14px] text-graphite">
          <span className="font-medium text-midnight">Agent policy</span> · {policyLine(policy)} · tip {policy.defaultTipPct}% by default · grace {policy.graceSeconds} s
        </p>
      </div>

      {tab.status !== "closed_manually" && (
        <div className="flex gap-3 border-t border-stone/50 px-6 py-4">
          <Button variant="outline" className="flex-1 px-3 text-[15px] whitespace-nowrap" onClick={() => act("close")} disabled={!closable} busy={busy === "close"}>
            {busy === "close" ? <Spinner /> : null} Close tab manually
          </Button>
          <Button className="flex-1 px-3 text-[15px] whitespace-nowrap" onClick={() => act("exit")} disabled={!canOrder(tab)} busy={busy === "exit"}>
            {busy === "exit" ? <Spinner /> : null} Simulate exit · DEMO
          </Button>
        </div>
      )}
    </>
  );
}

function EscrowCard({ tab, meta }: { tab: Tab; meta?: TabMeta }) {
  const { state } = useSettle();
  const live = state!.mode.ledger !== "stub";
  const [escrowTx] = useTxInfo([tab.escrow.txHash], live);
  const ledgerIndex = escrowTx?.ledgerIndex ?? meta?.ledgerIndex;
  const validated = secondsBetween(tab.escrow.submittedAt, tab.escrow.validatedAt);

  return (
    <section className="rounded-xl bg-linen px-4 py-4 text-[15px]">
      <Eyebrow className="text-graphite">Escrow</Eyebrow>
      {hasEscrow(tab) ? (
        <dl className="mt-3 space-y-2">
          <Row label="Allowance" value={tokens(tab.allowance)} strong />
          <Row label="Transaction" value={`EscrowCreate${tab.escrow.seq !== null ? ` · seq ${tab.escrow.seq}` : ""}`} />
          <Row label="Ledger" value={ledgerIndex ? `#${ledgerIndex.toLocaleString("en-US")}` : live && tab.escrow.txHash && escrowTx === undefined ? "looking up…" : "—"} />
          {tab.escrow.txHash ? (
            <>
              <Row label="tx" value={<span className="font-mono text-[13px]">{shortHash(tab.escrow.txHash)}</span>} />
              <div className="flex items-center justify-between pt-1">
                <ExplorerLink href={tab.escrow.explorerUrl ?? explorerFor(tab.escrow.txHash)} className="text-[14px]">
                  View on testnet explorer
                </ExplorerLink>
                <span className="inline-flex items-center gap-1.5 text-[14px] text-graphite">
                  <IconCheckCircle size={16} className="text-eucalyptus" />
                  {validated ? `validated · ${validated}` : live ? "validated" : "stub ledger"}
                </span>
              </div>
            </>
          ) : (
            <p className="pt-1 text-[13px] text-muted">Seeded tab: placeholder escrow (stub ledger), no transaction.</p>
          )}
        </dl>
      ) : (
        <p className="mt-2 text-[14px] text-muted">No escrow on ledger: a display-only seeded tab. Exiting it holds with ESCROW_NOT_FOUND.</p>
      )}
    </section>
  );
}

function ItemList({ tab, highlight = -1, total }: { tab: Tab; highlight?: number; total?: ReactNode }) {
  return (
    <section>
      <Eyebrow className="text-graphite">Tab</Eyebrow>
      <ul className="mt-2 divide-y divide-stone/50 text-[15px]">
        {tab.items.map((item, i) => (
          <li key={item.name} className={`flex justify-between py-2 ${i === highlight ? "-mx-2 rounded-lg border-0 bg-terracotta-soft px-2 text-terracotta" : ""}`}>
            <span>
              {item.name}
              {item.qty > 1 && <span className={i === highlight ? "" : "text-muted"}> × {item.qty}</span>}
            </span>
            <span className="tabular">{usd(item.priceCents * item.qty)}</span>
          </li>
        ))}
        {tab.items.length === 0 && <li className="py-2 text-muted">No items yet.</li>}
        <li className="flex justify-between py-2 font-medium text-midnight">
          <span>Subtotal</span>
          <span className="tabular">{total ?? usd(tab.totalCents)}</span>
        </li>
      </ul>
    </section>
  );
}

// Settled -----------------------------------------------------------------------

function SettledBody({ tab, meta, heldOther, onOpenHold }: { tab: Tab; meta?: TabMeta; heldOther?: Tab; onOpenHold: (tabId: string) => void }) {
  const { state } = useSettle();
  const s = tab.settlement!;
  const live = state!.mode.ledger !== "stub";
  const hashes = settlementHashes(s);
  const infos = useTxInfo(
    hashes.map((h) => h.hash),
    live,
  );
  const known = infos.filter((i): i is NonNullable<typeof i> => Boolean(i));
  const feeDrops = known.reduce((sum, i) => sum + i.feeDrops, 0);
  const lookingUp = live && infos.some((i) => i === undefined);
  // The ledger the settlement landed in: the Batch's if batched, else the finish's.
  const anchor = infos[s.batchTxHash ? hashes.length - 1 : 0];
  const validated = secondsBetween(s.submittedAt, s.validatedAt);
  const policy = state!.policy;

  const approved = meta?.settleDecision?.reason === "Approved by manager";
  const agent = meta?.decision;
  const tipPct = tab.totalCents ? Math.round((tab.tipCents / tab.totalCents) * 100) : 0;
  const settledAt = s.validatedAt ?? meta?.settledAt;
  const finishName = s.mode === "batch" ? "Batch" : "EscrowFinish";

  return (
    <>
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-6 py-5">
      <ol className="relative ml-1.5 space-y-6 border-l border-stone pl-7">
        <Step title={`Exit detected${meta?.exitAt ? ` · ${clockTime(meta.exitAt)}` : ""}`} sub={`geofence · grace ${countdown(policy.graceSeconds)}`} />
        {approved ? (
          <>
            <Step
              tone="terracotta"
              title={`Agent held${agent ? ` · ${clockTime(agent.at)}` : ""}`}
              sub={agent ? `${agent.code ? `${agent.code} · ` : ""}${agent.reason}` : "Held for manager review"}
            />
            <Step title={`Manager approved${s.submittedAt ? ` · ${clockTime(s.submittedAt)}` : ""}`} sub={`tip ${tipPct}%${tab.tipCents ? ` · ${usd(tab.tipCents)}` : ""}, trimmed to what the escrow holds`} />
          </>
        ) : (
          <Step
            title={`Agent reconciled${agent ? ` · ${clockTime(agent.at)}` : ""}`}
            sub={`${itemCount(tab)} items vs POS ✓ · tip rule ${tipPct}% applied · no anomaly`}
          />
        )}
        <Step
          tone="settled"
          title={`Settled on XRPL${settledAt ? ` · ${clockTime(settledAt)}` : ""}`}
          sub={`${finishName} · ${anchor ? `ledger ${anchor.ledgerIndex.toLocaleString("en-US")}` : live ? (lookingUp ? "ledger …" : "ledger —") : "stub ledger"}`}
        />
      </ol>

      <section className="rounded-xl bg-linen px-4 py-4 text-[16px]">
        <dl className="space-y-2">
          <Row label="To venue" value={tokens(s.toVenue)} strong />
          <Row label="Back to member" value={tokens(s.toMember)} strong />
          <Row label="Ledger fee" value={known.length ? xrp(feeDrops) : lookingUp ? "…" : live ? "—" : "— (stub)"} />
        </dl>
        <div className="mt-3 space-y-1 border-t border-stone/60 pt-3 text-[14px] text-graphite">
          {hashes.map((h) => (
            <div key={h.hash} className="flex items-center justify-between">
              <span>
                {h.label} <span className="font-mono text-[13px]">{shortHash(h.hash)}</span>
              </span>
              <ExplorerLink href={explorerFor(h.hash, s.explorerUrls)} className="text-[13px]">
                explorer
              </ExplorerLink>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <ExplorerLink href={explorerFor(s.batchTxHash ?? s.finishTxHash, s.explorerUrls)} className="text-[15px]">
            View on testnet explorer
          </ExplorerLink>
          {validated && (
            <span className="inline-flex items-center gap-1.5 text-[14px] text-graphite">
              <IconCheckCircle size={16} className="text-eucalyptus" />
              validated · {validated}
            </span>
          )}
        </div>
      </section>
    </div>
    <div className="space-y-4 border-t border-stone/50 px-6 py-4">
      <p className="text-[15px] text-graphite">Receipt emailed to member. No card auth, no capture window, no chargeback exposure.</p>
      {heldOther && (
        <Button className="w-full py-4 text-[18px]" onClick={() => onOpenHold(heldOther.id)}>
          Open {shortName(heldOther.memberName)} hold <IconArrowRight size={18} />
        </Button>
      )}
    </div>
    </>
  );
}

function Step({ title, sub, tone = "default" }: { title: string; sub: string; tone?: "default" | "settled" | "terracotta" }) {
  const dot =
    tone === "settled" ? (
      <span className="absolute top-0.5 -left-[39px] flex size-6 items-center justify-center rounded-full bg-eucalyptus text-ivory">
        <IconCheck size={15} strokeWidth={2.4} />
      </span>
    ) : (
      <span className={`absolute top-1.5 -left-[34px] size-3.5 rounded-full ${tone === "terracotta" ? "bg-terracotta" : "bg-midnight"}`} />
    );
  return (
    <li className="relative">
      {dot}
      <div className={`font-display text-[19px] font-semibold tabular ${tone === "settled" ? "text-eucalyptus" : tone === "terracotta" ? "text-terracotta" : "text-midnight"}`}>{title}</div>
      <div className="mt-0.5 text-[14px] text-graphite">{sub}</div>
    </li>
  );
}

// Held --------------------------------------------------------------------------

function HeldBody({ tab, now, onOpenHold }: { tab: Tab; now: number; onOpenHold: (tabId: string) => void }) {
  const { state, actions } = useSettle();
  const [busy, setBusy] = useState(false);
  const hold = tab.hold;
  const policy = state!.policy;

  const close = async () => {
    setBusy(true);
    try {
      await actions.close(tab.id);
    } catch {
      // the store shows the error
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-auto px-6 py-5">
        <section className="rounded-xl border border-terracotta-line bg-terracotta-soft px-4 py-4">
          <div className="flex items-start gap-3">
            <IconAlertCircle size={26} className="mt-0.5 shrink-0 text-terracotta" />
            <div className="min-w-0">
              <Eyebrow className="text-terracotta">Held for review</Eyebrow>
              <div className="mt-1 font-serif text-[24px] leading-tight text-midnight">
                {shortName(tab.memberName)} · {tab.seat}
              </div>
              {hold && (
                <div className="mt-1 text-[14px] text-graphite">
                  {hold.source === "member" ? "Member disputed" : "Agent paused settlement"} {duration(now - Date.parse(hold.triggeredAt))} ago
                </div>
              )}
            </div>
          </div>
          {hold && (
            <>
              <p className="mt-3 text-[15px] text-midnight">{hold.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-medium tracking-[0.04em]">
                <span className="rounded-full border border-terracotta-line bg-paper px-2.5 py-1 text-terracotta">{hold.code}</span>
                <span className="rounded-full border border-terracotta-line bg-paper px-2.5 py-1 text-terracotta">source · {hold.source}</span>
              </div>
            </>
          )}
        </section>

        <ItemList tab={tab} highlight={anomalyLine(tab)} />
        <EscrowCard tab={tab} />

        <p className="text-[14px] text-graphite">
          <span className="font-medium text-midnight">Policy</span> · {policyLine(policy)}
          {hold && <> · {codeLabel(hold.code).toLowerCase()} fired</>}
        </p>
      </div>
      <div className="flex gap-3 border-t border-stone/50 px-6 py-4">
        <Button variant="outline" className="flex-1 px-3 text-[15px] whitespace-nowrap" onClick={close} busy={busy}>
          {busy ? <Spinner /> : null} Close tab manually
        </Button>
        <Button className="flex-1 px-3 text-[15px] whitespace-nowrap" onClick={() => onOpenHold(tab.id)}>
          Review in manager <IconArrowRight size={16} />
        </Button>
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-graphite">{label}</dt>
      <dd className={`text-right tabular ${strong ? "font-semibold text-midnight" : "text-midnight"}`}>{value}</dd>
    </div>
  );
}
