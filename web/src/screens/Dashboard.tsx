import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Sidebar } from "../components/Sidebar";
import { TabDrawer } from "../components/TabDrawer";
import { IconCheckCircle, IconCoins, IconMembers, IconTabs } from "../components/icons";
import { AnimatedNumber, Badge, Eyebrow, Spinner } from "../components/ui";
import { MOCK, TOKEN } from "../lib/config";
import { clockTimeAmPm, codeLabel, countdown, duration, hasEscrow, itemCount, seconds, shortDate, shortName, useNow } from "../lib/format";
import { toCents, tokens, usd } from "../lib/money";
import { useSettle, type TabMeta } from "../lib/store";
import { byOpenedDesc, graceLeft, inGrace } from "../lib/tabs";
import { OPEN_STATUSES, type SettleState, type Tab } from "../lib/types";

/**
 * Staff dashboard. `embedded` drops the sidebar for the presenter view, which also passes
 * `onOpenHold` to show a hold on its manager phone instead of navigating.
 */
export function Dashboard({ embedded = false, onOpenHold }: { embedded?: boolean; onOpenHold?: (tabId: string) => void }) {
  return embedded ? (
    <DashboardMain embedded onOpenHold={onOpenHold} />
  ) : (
    <div className="flex h-full">
      <Sidebar active="tabs" />
      <DashboardMain />
    </div>
  );
}

function DashboardMain({ embedded = false, onOpenHold }: { embedded?: boolean; onOpenHold?: (tabId: string) => void }) {
  const { state, meta, connected } = useSettle();
  const navigate = useNavigate();
  const openHold = onOpenHold ?? ((tabId: string) => navigate(`/manager?tab=${tabId}`));
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
          <SettledToast state={state} />
          <RailBadges state={state} connected={connected} />
        </div>
      </header>

      <Tiles state={state} />

      <div className="flex min-h-0 flex-1 gap-5">
        <TabsTable tabs={tabs} meta={meta} now={now} selectedId={selected?.id ?? null} onSelect={(id) => select(id === selectedId ? null : id)} />
        {selected && <TabDrawer key={selected.id} tab={selected} meta={meta[selected.id]} now={now} onClose={() => select(null)} onOpenHold={openHold} />}
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

/** "✓ E. Vance settled  $170.40 → 170.40 TUSD  3.0 s" for a few seconds after each live settle. */
function SettledToast({ state }: { state: SettleState }) {
  const { lastSettled } = useSettle();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!lastSettled || Date.now() - Date.parse(lastSettled.at) > 15_000) return;
    setVisible(true);
    const id = setTimeout(() => setVisible(false), 12_000);
    return () => clearTimeout(id);
  }, [lastSettled]);
  const tab = state.tabs.find((t) => t.id === lastSettled?.tabId);
  if (!visible || !tab?.settlement) return null;
  return (
    <div className="animate-settle-in flex items-center gap-3 rounded-2xl border border-stone/70 bg-paper px-5 py-3 text-[16px] shadow-sm">
      <span className="flex size-7 items-center justify-center rounded-full bg-eucalyptus text-ivory">
        <IconCheckCircle size={18} />
      </span>
      <span className="font-medium text-midnight">{shortName(tab.memberName)} settled</span>
      <span className="text-graphite tabular">
        {usd(lastSettled!.toVenueCents)} → {tokens(tab.settlement.toVenue)}
      </span>
      <span className="font-medium text-midnight tabular">{seconds(tab.settlement.elapsedMs)}</span>
    </div>
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
                <th key={h} className="px-4 py-4 text-[13px] font-medium tracking-[0.14em] text-graphite uppercase">
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
  const bg = held ? "bg-terracotta-soft" : selected ? "bg-sage-soft/70" : "hover:bg-linen/60";
  const edge = held ? "shadow-[inset_4px_0_0_var(--color-terracotta)]" : selected ? "shadow-[inset_4px_0_0_var(--color-eucalyptus)]" : "";
  const text = done && !selected ? "text-muted" : "text-graphite";
  const total = tab.settlement ? toCents(tab.settlement.toVenue) : tab.totalCents;

  return (
    <tr
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelect())}
      tabIndex={0}
      aria-selected={selected}
      className={`cursor-pointer border-t border-stone/50 text-[16px] transition-colors outline-none focus-visible:bg-linen [&>td]:px-4 [&>td]:py-5 ${bg} ${text} ${selected && held ? "ring-2 ring-terracotta-line ring-inset" : ""}`}
    >
      <td className={`font-medium whitespace-nowrap ${edge} ${done && !selected ? "" : "text-midnight"}`}>{shortName(tab.memberName)}</td>
      <td className="whitespace-nowrap">{tab.seat}</td>
      <td className="tabular">{itemCount(tab)}</td>
      <td className="tabular">{usd(total)}</td>
      <td className="tabular">
        {tab.settlement ? (
          <span className="leading-snug whitespace-nowrap">
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
      <td className="whitespace-nowrap">
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
        <span className="inline-flex items-start gap-2 leading-snug">
          <IconCheckCircle size={18} className="mt-0.5 text-eucalyptus" />
          <span>
            <span className="font-semibold text-midnight">Settled</span> · {seconds(tab.settlement?.elapsedMs ?? 0)}
            <br />
            <span className="text-[13px] text-muted">{how}</span>
          </span>
        </span>
      );
    }
    case "held":
      return (
        <span className="leading-snug text-terracotta">
          <span className="font-semibold">Held</span> · manager review
          <br />
          <span className="text-[13px]" title={tab.hold ? codeLabel(tab.hold.code) : undefined}>
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
