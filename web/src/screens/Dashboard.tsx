import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";

import { Sidebar } from "../components/Sidebar";
import { IconCheckCircle, IconClose, IconCoins, IconMembers, IconTabs } from "../components/icons";
import { AnimatedNumber, Avatar, Badge, Button, Eyebrow, ExplorerLink, Spinner } from "../components/ui";
import { MOCK, TOKEN } from "../lib/config";
import { clockTimeAmPm, codeLabel, countdown, duration, explorerFor, hasEscrow, itemCount, policyLine, seconds, secondsBetween, shortDate, shortHash, shortName, useNow } from "../lib/format";
import { toCents, tokens, usd } from "../lib/money";
import { useSettle, type TabMeta } from "../lib/store";
import { byOpenedDesc, canOrder, graceLeft, inGrace } from "../lib/tabs";
import { OPEN_STATUSES, type SettleState, type Tab } from "../lib/types";
import { useTxInfo } from "../lib/xrpl";

/** Staff dashboard. `embedded` drops the sidebar for the presenter view. */
export function Dashboard({ embedded = false }: { embedded?: boolean }) {
  return embedded ? (
    <DashboardMain embedded />
  ) : (
    <div className="flex h-full">
      <Sidebar active="tabs" />
      <DashboardMain />
    </div>
  );
}

function DashboardMain({ embedded = false }: { embedded?: boolean }) {
  const { state, meta, connected } = useSettle();
  const [params, setParams] = useSearchParams();
  const [localSelected, setLocalSelected] = useState<string | null>(null);
  // Standalone, the selection lives in ?tab= so the POS can link to a tab; embedded, it stays local.
  const selectedId = embedded ? localSelected : params.get("tab");
  const select = (id: string | null) => {
    if (embedded) setLocalSelected(id);
    else setParams(id ? { tab: id } : {}, { replace: true });
  };
  const now = useNow();

  if (!state) return <Loading connected={connected} />;
  const tabs = [...state.tabs].sort(byOpenedDesc);
  const selected = tabs.find((t) => t.id === selectedId);

  return (
    <main className={`flex min-w-0 flex-1 flex-col gap-6 overflow-hidden ${embedded ? "px-8 pt-6 pb-6" : "px-10 pt-8 pb-8"}`}>
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="font-serif text-[56px] leading-[1.05] text-midnight">Tonight</h1>
          <p className="mt-1 text-[22px] text-muted tabular">
            {shortDate(new Date(now))} · {clockTimeAmPm(now)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 pt-2">
          <RailBadges state={state} connected={connected} />
        </div>
      </header>

      <Tiles state={state} />

      <div className="flex min-h-0 flex-1 gap-5">
        <TabsTable tabs={tabs} meta={meta} now={now} selectedId={selected?.id ?? null} onSelect={(id) => select(id === selectedId ? null : id)} />
        {selected && <TabDrawer key={selected.id} tab={selected} meta={meta[selected.id]} now={now} onClose={() => select(null)} />}
      </div>
    </main>
  );
}

function Loading({ connected }: { connected: boolean }) {
  return (
    <main className="flex flex-1 items-center justify-center text-muted">
      <Spinner /> <span className="ml-3">{connected ? "Loading tonight's tabs…" : "Connecting to the Settle API…"}</span>
    </main>
  );
}

function RailBadges({ state, connected }: { state: SettleState; connected: boolean }) {
  const live = state.mode.ledger === "module";
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Badge>Funding rail · SIMULATED</Badge>
      <Badge>Payout rail · SIMULATED</Badge>
      <Badge tone={live ? "live" : "neutral"}>Settlement · {live ? "XRPL LIVE" : state.mode.ledger.toUpperCase()}</Badge>
      {MOCK ? <Badge tone="warn">Fixture data</Badge> : !connected && <Badge tone="warn">Reconnecting…</Badge>}
    </div>
  );
}

// Metric tiles ----------------------------------------------------------------

function Tiles({ state }: { state: SettleState }) {
  const { lastSettled } = useSettle();
  const { metrics, tabs } = state;
  const open = tabs.filter((t) => OPEN_STATUSES.includes(t.status));
  const escrowedOpen = open.filter(hasEscrow).length;
  const escrowed = tabs.filter(hasEscrow);
  const escrowedCents = escrowed.reduce((sum, t) => sum + toCents(t.allowance), 0);

  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-[1.25fr_0.9fr_1.1fr_1fr]">
      <Tile
        icon={<IconMembers size={26} />}
        label="Outstanding member balances"
        value={<AnimatedNumber value={metrics.outstandingCents} format={(n) => usd(n, { trim: true })} />}
        sub={lastSettled ? `↓ ${usd(lastSettled.toVenueCents, { trim: true })} · never became a receivable` : "never becomes a receivable"}
      />
      <Tile
        icon={<IconTabs size={26} />}
        label="Open tabs"
        value={metrics.openTabs}
        sub={escrowedOpen === open.length ? "all escrowed" : `${escrowedOpen} of ${open.length} escrowed`}
      />
      <Tile
        icon={<IconCoins size={26} />}
        label="Escrowed tonight"
        value={
          <>
            {tokens(escrowedCents, { label: false })}
            <span className="ml-2 text-[18px] font-medium text-muted">{TOKEN}</span>
          </>
        }
        sub={`${escrowed.length} escrows · ${escrowedOpen} still open`}
      />
      <Tile
        icon={<IconCheckCircle size={26} />}
        label="Settled tonight"
        value={metrics.settledCount}
        sub={metrics.settledCount ? `avg ${seconds(metrics.avgSettleMs)} · 1 ledger` : "none yet"}
      />
    </section>
  );
}

function Tile({ icon, label, value, sub }: { icon: ReactNode; label: string; value: ReactNode; sub: string }) {
  return (
    <div className="flex min-w-0 gap-4 rounded-2xl border border-stone/60 bg-paper px-5 py-5">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sage-soft text-midnight">{icon}</span>
      <div className="min-w-0">
        <Eyebrow className="text-graphite leading-5">{label}</Eyebrow>
        <div className="mt-2 font-display text-[34px] leading-tight font-semibold tracking-[-0.01em] whitespace-nowrap text-midnight tabular">{value}</div>
        <div className="mt-1 text-[13.5px] text-muted">{sub}</div>
      </div>
    </div>
  );
}

// Live tabs table ---------------------------------------------------------------

function TabsTable({ tabs, meta, now, selectedId, onSelect }: { tabs: Tab[]; meta: Record<string, TabMeta>; now: number; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone/60 bg-paper">
      <div className="min-h-0 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-linen">
            <tr>
              {["Member", "Seat", "Items", "Total", "Allowance", "Status"].map((h) => (
                <th key={h} className="px-5 py-4 text-[13px] font-medium tracking-[0.14em] text-graphite uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabs.map((tab) => (
              <TabRow key={tab.id} tab={tab} meta={meta[tab.id]} now={now} selected={tab.id === selectedId} onSelect={() => onSelect(tab.id)} />
            ))}
          </tbody>
        </table>
        {tabs.length === 0 && <p className="px-5 py-10 text-center text-muted">No tabs tonight yet. Open one from the POS.</p>}
      </div>
    </div>
  );
}

function TabRow({ tab, meta, now, selected, onSelect }: { tab: Tab; meta?: TabMeta; now: number; selected: boolean; onSelect: () => void }) {
  const done = tab.status === "settled" || tab.status === "closed_manually";
  const held = tab.status === "held";
  const bg = selected ? "bg-sage-soft/70" : held ? "bg-terracotta-soft" : "hover:bg-linen/60";
  const edge = selected ? "shadow-[inset_4px_0_0_var(--color-eucalyptus)]" : held ? "shadow-[inset_4px_0_0_var(--color-terracotta)]" : "";
  const text = done && !selected ? "text-muted" : "text-graphite";
  const total = tab.settlement ? toCents(tab.settlement.toVenue) : tab.totalCents;

  return (
    <tr
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
      tabIndex={0}
      aria-selected={selected}
      className={`cursor-pointer border-t border-stone/50 text-[16px] transition-colors outline-none focus-visible:bg-linen ${bg} ${text}`}
    >
      <td className={`px-5 py-5 font-medium ${edge} ${done && !selected ? "" : "text-midnight"}`}>{shortName(tab.memberName)}</td>
      <td className="px-5 py-5">{tab.seat}</td>
      <td className="px-5 py-5 tabular">{itemCount(tab)}</td>
      <td className="px-5 py-5 tabular">{usd(total)}</td>
      <td className="px-5 py-5 tabular">
        {tab.settlement ? (
          <span className="leading-snug">
            {tokens(tab.allowance, { label: false })} → {tokens(tab.settlement.toMember, { label: false })}
            <br />
            <span className="text-[14px] text-muted">returned</span>
          </span>
        ) : (
          <span className="leading-snug">
            {tokens(tab.allowance)}
            {!hasEscrow(tab) && (
              <>
                <br />
                <span className="text-[14px] text-muted">not escrowed</span>
              </>
            )}
          </span>
        )}
      </td>
      <td className="px-5 py-5">
        <StatusText tab={tab} meta={meta} now={now} />
      </td>
    </tr>
  );
}

function StatusText({ tab, meta, now }: { tab: Tab; meta?: TabMeta; now: number }) {
  if (inGrace(tab)) {
    return (
      <span className="inline-flex items-center gap-2 font-medium text-midnight tabular">
        <span className="size-2 animate-pulse rounded-full bg-eucalyptus" />
        Exit detected · {countdown(graceLeft(tab, meta, now))}
      </span>
    );
  }
  switch (tab.status) {
    case "reconciling":
      return (
        <span className="inline-flex items-center gap-2 font-medium text-midnight">
          <Spinner size={14} /> Agent reconciling
        </span>
      );
    case "settled": {
      const how = meta?.settleDecision?.reason === "Approved by manager" ? "approved" : "on exit";
      return (
        <span className="inline-flex items-center gap-2">
          <IconCheckCircle size={18} className="text-eucalyptus" />
          <span>
            <span className="font-semibold text-midnight">Settled</span> · {seconds(tab.settlement?.elapsedMs ?? 0)} · {how}
          </span>
        </span>
      );
    }
    case "held":
      return (
        <span className="leading-snug text-terracotta">
          <span className="font-semibold">Held</span> · {tab.hold ? codeLabel(tab.hold.code) : "manager review"}
          <br />
          <span className="text-[13px]">
            {tab.hold?.code} · {tab.hold?.source}
          </span>
        </span>
      );
    case "closed_manually":
      return <span>Closed · escrow returned</span>;
    default:
      return <span className="text-muted">Open · {duration(now - Date.parse(tab.openedAt))}</span>;
  }
}

// Drawer ----------------------------------------------------------------------

function TabDrawer({ tab, meta, now, onClose }: { tab: Tab; meta?: TabMeta; now: number; onClose: () => void }) {
  const { state, balances, actions } = useSettle();
  const [busy, setBusy] = useState<"exit" | "close" | null>(null);
  const member = state?.members.find((m) => m.id === tab.memberId);
  const policy = state!.policy;
  const live = state!.mode.ledger !== "stub";
  const [escrowTx] = useTxInfo([tab.escrow.txHash], live);
  const ledgerIndex = escrowTx?.ledgerIndex ?? meta?.ledgerIndex;
  const balance = balances?.members[tab.memberId];

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

  const validated = secondsBetween(tab.escrow.submittedAt, tab.escrow.validatedAt);
  const closable = OPEN_STATUSES.includes(tab.status) && tab.status !== "reconciling";

  return (
    <aside className="animate-settle-in flex w-[440px] shrink-0 flex-col overflow-hidden rounded-2xl border border-stone/60 bg-paper">
      <div className="flex items-center gap-4 border-b border-stone/50 px-6 py-5">
        <Avatar name={tab.memberName} size={56} />
        <Eyebrow className="min-w-0 flex-1 truncate">Tab · {shortName(tab.memberName)}</Eyebrow>
        <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-full border border-stone text-graphite hover:bg-linen" aria-label="Close drawer">
          <IconClose size={16} />
        </button>
      </div>

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

        <section className="rounded-xl bg-linen px-4 py-4 text-[15px]">
          <Eyebrow className="text-graphite">Escrow</Eyebrow>
          {hasEscrow(tab) ? (
            <dl className="mt-3 space-y-2">
              <Row label="Allowance" value={tokens(tab.allowance)} strong />
              <Row label="Transaction" value={`EscrowCreate${tab.escrow.seq !== null ? ` · seq ${tab.escrow.seq}` : ""}`} />
              <Row label="Ledger" value={ledgerIndex ? `#${ledgerIndex.toLocaleString("en-US")}` : live && tab.escrow.txHash ? "looking up…" : "—"} />
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
            <p className="mt-2 text-[14px] text-muted">
              No escrow on ledger: a display-only seeded tab. Exiting it holds with ESCROW_NOT_FOUND.
            </p>
          )}
        </section>

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

        <section>
          <Eyebrow className="text-graphite">Tab</Eyebrow>
          <ul className="mt-2 divide-y divide-stone/50 text-[15px]">
            {tab.items.map((item) => (
              <li key={item.name} className="flex justify-between py-2">
                <span>
                  {item.name}
                  {item.qty > 1 && <span className="text-muted"> × {item.qty}</span>}
                </span>
                <span className="tabular">{usd(item.priceCents * item.qty)}</span>
              </li>
            ))}
            {tab.items.length === 0 && <li className="py-2 text-muted">No items yet.</li>}
            <li className="flex justify-between py-2 font-medium text-midnight">
              <span>Subtotal</span>
              <span className="tabular">{usd(tab.totalCents)}</span>
            </li>
          </ul>
        </section>

        <p className="text-[14px] text-graphite">
          <span className="font-medium text-midnight">Agent policy</span> · {policyLine(policy)} · tip {policy.defaultTipPct}% by default · grace {policy.graceSeconds} s
        </p>
      </div>

      <div className="flex gap-3 border-t border-stone/50 px-6 py-4">
        <Button variant="outline" className="flex-1 px-3 text-[15px] whitespace-nowrap" onClick={() => act("close")} disabled={!closable} busy={busy === "close"}>
          {busy === "close" ? <Spinner /> : null} Close tab manually
        </Button>
        <Button className="flex-1 px-3 text-[15px] whitespace-nowrap" onClick={() => act("exit")} disabled={!canOrder(tab)} busy={busy === "exit"}>
          {busy === "exit" ? <Spinner /> : null} Simulate exit · DEMO
        </Button>
      </div>
    </aside>
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

